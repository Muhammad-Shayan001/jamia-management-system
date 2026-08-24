const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oddtpnfzysruomqhhpmu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZHRwbmZ6eXNydW9tcWhocG11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODYxMDcxNSwiZXhwIjoyMTA0MTg2NzE1fQ.Xt4X9RJrFwufNVbCAcn9opHiutEP9f9HPGgPCuLS0ng'
)

async function checkTables() {
  const tables = [
    'profiles', 'students', 'teachers', 'classes', 'subjects',
    'attendance', 'exams', 'exam_results', 'fees', 'announcements',
    'audit_logs', 'institution_settings', 'institution_holidays'
  ]

  console.log('--- SCHEMA AUDIT ---')
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`[X] Table ${table} ERROR: ${error.message}`)
    } else {
      console.log(`[V] Table ${table} OK (Found ${data.length} rows)`)
    }
  }
}

checkTables()
