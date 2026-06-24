import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateProject } from '@/lib/gemini'

const GenerateProjectSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  baseTemplateId: z.string().optional(), // For when called from template page
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Basic generation is available to all plans. No check needed.

    const body = await req.json()
    const result = GenerateProjectSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data', details: result.error.issues }, { status: 400 })
    }

    const { description, baseTemplateId } = result.data

    // 1. Generate project details with AI
    const aiData = await generateProject(description)

    // 2. Find matching template if no base template was provided
    let templateId = baseTemplateId || null

    if (!templateId) {
      const { data: templateMatch } = await supabase
        .from('templates')
        .select('id')
        .is('creator_id', null) // System template
        .eq('is_featured', true)
        .eq('category', aiData.templateCategory)
        .limit(1)
        .single()

      if (templateMatch) {
        templateId = templateMatch.id
      } else {
        // Fallback: try finding any system template if category match fails
        const { data: fallbackTemplate } = await supabase
          .from('templates')
          .select('id')
          .is('creator_id', null)
          .limit(1)
          .single()
        
        if (fallbackTemplate) templateId = fallbackTemplate.id
      }
    }

    // 3. Create the project
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: aiData.projectName,
        template_id: templateId,
        elements: {
          // Pre-seed some default elements using the AI data if possible.
          // The builder will load these.
          aiContext: {
            achievement: aiData.achievement,
            eventType: aiData.eventType,
            citationText: aiData.citationText,
            tone: aiData.tone
          }
        }
      })
      .select('id')
      .single()

    if (insertError || !project) {
      console.error('Project insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json({ 
      projectId: project.id,
      generatedData: aiData 
    })
  } catch (error: any) {
    console.error('Generate Project API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
