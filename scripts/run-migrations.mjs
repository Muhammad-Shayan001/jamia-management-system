// scripts/run-migrations.mjs
// Run this ONCE to push the schema to your Supabase project.
// Usage: node scripts/run-migrations.mjs

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Read migrations in order
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

console.log(`\n🚀 Running ${files.length} migration(s) against ${SUPABASE_URL}\n`)

for (const file of files) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
  console.log(`📄 Running: ${file} ...`)
  
  // Execute via Supabase's REST API using rpc
  const { error } = await supabase.rpc('exec_sql', { sql_text: sql }).catch(() => ({ error: 'rpc not available' }))
  
  if (error) {
    // Fallback: use the pg endpoint directly
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ sql_text: sql }),
    })
    
    if (!response.ok) {
      console.warn(`  ⚠️  Could not auto-run via RPC. Please run ${file} manually in Supabase SQL Editor.`)
      continue
    }
  }
  
  console.log(`  ✅ Done`)
}

// Seed admin user
console.log('\n👤 Creating admin auth user...')
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: 'admin@jamia.edu',
  password: 'Admin1234!',
  email_confirm: true,
  user_metadata: { role: 'admin', full_name_en: 'System Admin' }
})

if (authError) {
  if (authError.message?.includes('already registered')) {
    console.log('  ℹ️  Admin user already exists.')
  } else {
    console.warn('  ⚠️  Auth user error:', authError.message)
  }
} else {
  const userId = authData.user.id
  console.log(`  ✅ Auth user created: ${userId}`)

  // Insert profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    role: 'admin',
    full_name_en: 'System Admin',
    full_name_ur: 'سسٹم ایڈمن',
    is_active: true,
    totp_enabled: false,
  })
  
  if (profileError) {
    console.warn('  ⚠️  Profile insert error:', profileError.message)
    console.log('  ℹ️  Run 001_initial_schema.sql in Supabase SQL Editor first, then re-run this script.')
  } else {
    console.log('  ✅ Profile row created.')
  }
}

console.log('\n✅ Migration runner complete.')
console.log('\n📋 Credentials:')
console.log('   Email:    admin@jamia.edu')
console.log('   Password: Admin1234!')
console.log('\n🌐 Open http://localhost:3000/en/login to log in.\n')
