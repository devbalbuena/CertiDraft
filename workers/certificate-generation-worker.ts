/**
 * CertiDraft — Certificate Generation Worker
 *
 * Standalone Node.js script. Run with:
 *   npm run worker:certificates
 *
 * IMPORTANT: No Next.js or React imports allowed here.
 * Uses ioredis + BullMQ directly, supabase-js with the service role key,
 * and Puppeteer for headless PDF rendering.
 */

import { Worker, type Job } from 'bullmq'
// BullMQ ships its own ioredis — import from it to avoid the type mismatch
import IORedis from 'bullmq/node_modules/ioredis'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'
import crypto from 'crypto'
import ws from 'ws'
import { sendCertificateEmail } from '../src/lib/email/sendgrid'
import { PLAN_LIMITS, type PlanType } from '../src/lib/subscriptions'

// ── Environment ───────────────────────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const QUEUE_NAME = 'certificate-generation'
const STORAGE_BUCKET = 'certificates'

if (!REDIS_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables: REDIS_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// ── Supabase Admin Client ─────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as any },
})

// ── Redis Connection ──────────────────────────────────────────────────────────
const connection = new IORedis(REDIS_URL, {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

// ── Helper: Substitute template variables in a JSON string ───────────────────
function applyVariables(
  jsonStr: string,
  vars: Record<string, string>
): string {
  let result = jsonStr
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value)
  }
  return result
}

// ── Helper: Generate PDF with Puppeteer + Fabric.js ──────────────────────────
async function generateCertificatePDF(designJson: string): Promise<Buffer> {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 842px; height: 595px; overflow: hidden; background: white; }
    canvas { display: block; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
</head>
<body>
  <canvas id="c" width="842" height="595"></canvas>
  <script>
    const canvas = new fabric.Canvas('c', { width: 842, height: 595, backgroundColor: '#ffffff' });
    canvas.loadFromJSON(${designJson}, function() {
      canvas.renderAll();
      document.title = 'READY';
    });
  </script>
</body>
</html>`

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 842, height: 595 })
    // 'networkidle0' was removed in Puppeteer v24 — use 'load' instead
    await page.setContent(html, { waitUntil: 'load' })

    // Wait until Fabric finishes rendering
    await page.waitForFunction(() => document.title === 'READY', { timeout: 15000 })

    const pdfBuffer = await page.pdf({
      width: '842px',
      height: '595px',
      printBackground: true,
      pageRanges: '1',
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

// ── Worker Job Handler ────────────────────────────────────────────────────────
async function processJob(job: Job): Promise<void> {
  const { batchJobId, defaultCitationText = '' } = job.data as { batchJobId: string; defaultCitationText?: string }
  console.log(`\n📋 Processing batch job: ${batchJobId}`)

  // ── Fetch batch job details ──────────────────────────────────────────────
  const { data: batchJob, error: fetchError } = await supabase
    .from('batch_jobs')
    .select('id, csv_data, column_mapping, design_snapshot, user_id, project_id')
    .eq('id', batchJobId)
    .single()

  if (fetchError || !batchJob) {
    throw new Error(`Batch job not found: ${batchJobId}`)
  }

  // ── Mark as processing ───────────────────────────────────────────────────
  await supabase
    .from('batch_jobs')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', batchJobId)

  const csvRows: any[] = batchJob.csv_data || []
  const mapping: Record<string, string> = batchJob.column_mapping || {}
  const designSnapshot = batchJob.design_snapshot
  const designJsonBase = JSON.stringify(designSnapshot)

  const errors: string[] = []
  let processedCount = 0

  // ── Fetch project for template_id ────────────────────────────────────────
  const { data: project } = await supabase
    .from('projects')
    .select('template_id')
    .eq('id', batchJob.project_id)
    .single()

  // ── Fetch user's plan ────────────────────────────────────────────────────
  const { data: userProfile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', batchJob.user_id)
    .single()
  
  const plan = (userProfile?.plan as PlanType) || 'free'
  const canSendEmail = PLAN_LIMITS[plan]?.features.email_delivery || false

  // ── Process each recipient ───────────────────────────────────────────────
  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i]
    const recipientName = (row[mapping['recipient_name']] || '').trim()

    console.log(`  [${i + 1}/${csvRows.length}] Processing: ${recipientName || 'Unknown'}`)

    try {
      const recipientEmail = row[mapping['recipient_email']] || ''
      const achievement = (row[mapping['achievement']] || '').trim()
      const grade = row[mapping['grade']] || ''
      const issuedDate = row[mapping['issued_date']] || new Date().toISOString().split('T')[0]

      const verificationToken = crypto.randomUUID()
      const verificationUrl = `${SITE_URL}/verify/${verificationToken}`

      // Substitute template variables into the design
      const vars: Record<string, string> = {
        recipient_name: recipientName,
        achievement: achievement,
        citation_text: row[mapping['citation_text']] || defaultCitationText || '',
        issued_date: issuedDate,
        grade: grade,
        issuer_name: 'CertiDraft',
      }
      const personalizedDesignJson = applyVariables(designJsonBase, vars)

      // Generate PDF
      const pdfBuffer = await generateCertificatePDF(personalizedDesignJson)

      // Upload to Supabase Storage
      const storagePath = `${batchJob.user_id}/${batchJob.project_id}/${verificationToken}.pdf`
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      // Insert certificate record
      const { error: certError } = await supabase.from('certificates').insert({
        batch_job_id: batchJobId,
        user_id: batchJob.user_id,
        recipient_name: recipientName,
        recipient_email: recipientEmail || null,
        achievement,
        grade: grade || null,
        template_id: project?.template_id ?? null,
        verification_token: verificationToken,
        verification_url: verificationUrl,
        storage_bucket: STORAGE_BUCKET,
        storage_path: storagePath,
        issued_at: new Date().toISOString(),
        status: 'completed',
      })

      if (certError) {
        throw new Error(`Certificate insert failed: ${certError.message}`)
      }

      // ── Email Delivery ──────────────────────────────────────────────────────
      if (canSendEmail && recipientEmail) {
        const { data: projectData } = await supabase
          .from('projects')
          .select('name')
          .eq('id', batchJob.project_id)
          .single()
          
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath)

        await sendCertificateEmail(
          recipientEmail,
          recipientName,
          achievement,
          verificationUrl,
          urlData?.publicUrl || '',
          projectData?.name || 'CertiDraft'
        )
      }

      processedCount++

      // Update progress in DB
      await supabase
        .from('batch_jobs')
        .update({ processed_count: processedCount })
        .eq('id', batchJobId)

      console.log(`  ✅ Done: ${recipientName}`)
    } catch (err: any) {
      const errMsg = `Row ${i + 1} (${row[mapping['recipient_name']] || 'unknown'}): ${err.message}`
      console.error(`  ❌ ${errMsg}`)
      errors.push(errMsg)

      await supabase
        .from('batch_jobs')
        .update({ errors })
        .eq('id', batchJobId)
    }
  }

  // ── Finalise batch job ────────────────────────────────────────────────────
  const finalStatus = errors.length === 0 ? 'completed' : 'completed_with_errors'
  await supabase
    .from('batch_jobs')
    .update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      processed_count: processedCount,
      errors: errors.length > 0 ? errors : null,
    })
    .eq('id', batchJobId)

  // Update project certificate_count
  await supabase.rpc('increment_certificate_count', {
    p_project_id: batchJob.project_id,
    p_amount: processedCount,
  })

  console.log(`\n🎉 Batch job ${batchJobId} finished — ${finalStatus}`)
  console.log(`   Processed: ${processedCount} | Errors: ${errors.length}`)
}

// ── Start Worker ──────────────────────────────────────────────────────────────
const worker = new Worker(QUEUE_NAME, processJob, {
  connection,
  concurrency: 1, // One job at a time to avoid memory pressure from Puppeteer
})

worker.on('completed', (job) => {
  console.log(`\n✅ Job completed: ${job.id}`)
})

worker.on('failed', async (job, err) => {
  console.error(`\n❌ Job failed: ${job?.id}`, err.message)
  if (job?.data?.batchJobId) {
    await supabase
      .from('batch_jobs')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', job.data.batchJobId)
  }
})

worker.on('ready', () => {
  console.log(`\n🚀 Certificate generation worker is ready`)
  console.log(`   Queue: ${QUEUE_NAME}`)
  console.log(`   Redis: ${REDIS_URL.substring(0, 20)}...`)
  console.log('\nWaiting for jobs...\n')
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down worker...')
  await worker.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\nShutting down worker...')
  await worker.close()
  process.exit(0)
})
