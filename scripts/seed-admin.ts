import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

// This script runs on the server side and requires the Service Role Key
// It completely bypasses Row Level Security (RLS).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables.")
  console.error("Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    transport: ws as any
  }
})

const ADMIN_EMAIL = 'admin@certidraft.com'
const ADMIN_PASSWORD = 'securepassword123'
const ADMIN_NAME = 'Admin User'

async function seedAdmin() {
  console.log(`⏳ Seeding admin account: ${ADMIN_EMAIL}...`)

  // 1. Create the user in auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // Automatically confirm the email
    user_metadata: {
      full_name: ADMIN_NAME
    }
  })

  if (authError) {
    if (authError.message.includes("already registered")) {
      console.log(`⚠️ User ${ADMIN_EMAIL} already exists in auth.users. Proceeding to update role...`)
    } else {
      console.error("❌ Failed to create user in auth.users:", authError.message)
      process.exit(1)
    }
  } else {
    console.log(`✅ User created in auth.users with ID: ${authData.user.id}`)

    // Wait briefly for the database trigger (handle_new_user) to run and insert the row into public.users
    console.log("⏳ Waiting for database trigger to sync public.users...")
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  // 2. Elevate the user's role to 'admin' in public.users
  const { data: updateData, error: updateError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('email', ADMIN_EMAIL)
    .select()

  if (updateError) {
    console.error("❌ Failed to update role in public.users:", updateError.message)
    process.exit(1)
  }

  if (updateData && updateData.length > 0) {
    console.log(`✅ Successfully elevated ${ADMIN_EMAIL} to 'admin' role!`)
    console.log(`\nYou can now log in at /auth/login with:`)
    console.log(`Email:    ${ADMIN_EMAIL}`)
    console.log(`Password: ${ADMIN_PASSWORD}`)
  } else {
    console.error(`❌ Could not find ${ADMIN_EMAIL} in public.users table. Did the trigger fail to run?`)
  }
}

seedAdmin()
