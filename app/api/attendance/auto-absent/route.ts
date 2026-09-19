import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const CRON_SECRET = process.env.CRON_SECRET

// Function to check if today is a seminary holiday or Friday
async function checkOffDay(supabase: any, dateStr: string): Promise<{ isOff: boolean; reason?: string }> {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay() // 0 = Sunday, 5 = Friday

  // Traditional Islamic Seminary: Friday (Jumu'ah) is off
  if (dayOfWeek === 5) {
    return { isOff: true, reason: "Friday (Jumu'ah Off)" }
  }

  // Check institution_holidays table
  const { data: holidays } = await supabase
    .from('institution_holidays')
    .select('*')
    .lte('start_date', dateStr)
    .gte('end_date', dateStr)

  if (holidays && holidays.length > 0) {
    return { isOff: true, reason: holidays[0].title }
  }

  return { isOff: false }
}

export async function POST(request: Request) {
  // ─── AUTH CHECK (must happen BEFORE any DB access) ───────────────────
  // This endpoint is called by a cron job. It must supply:
  //   Authorization: Bearer <CRON_SECRET>
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: 'CRON_SECRET environment variable is not configured on this server.' },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token || token !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized. Valid Authorization: Bearer <CRON_SECRET> header required.' },
      { status: 401 }
    )
  }
  // ─────────────────────────────────────────────────────────────────────

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const todayStr = new Date().toISOString().split('T')[0]

    // 1. Holiday Check
    const offCheck = await checkOffDay(supabase, todayStr)
    if (offCheck.isOff) {
      return NextResponse.json({
        skipped: true,
        reason: offCheck.reason,
        date: todayStr,
      })
    }

    // 2. Fetch all active students
    const { data: students } = await supabase
      .from('students')
      .select('id, profile_id, name_en')
      .eq('is_active', true)

    // 3. Fetch all active teachers
    const { data: teachers } = await supabase
      .from('teachers')
      .select('id, profile_id, name_en')
      .eq('is_active', true)

    // 4. Fetch today's existing attendance
    const { data: existingRecords } = await supabase
      .from('attendance')
      .select('user_id, student_id')
      .eq('date', todayStr)

    const markedSet = new Set(
      (existingRecords || []).map((r) => r.user_id || r.student_id).filter(Boolean)
    )

    let autoMarkedCount = 0

    // Mark absent students
    if (students) {
      for (const s of students) {
        const idToCheck = s.profile_id || s.id
        if (!markedSet.has(idToCheck)) {
          await supabase.from('attendance').insert({
            user_id: idToCheck,
            student_id: s.id,
            role: 'student',
            date: todayStr,
            status: 'absent',
            scan_method: 'auto_absent',
            gate: 'System Auto-Absent',
          })
          autoMarkedCount++
        }
      }
    }

    // Mark absent teachers
    if (teachers) {
      for (const t of teachers) {
        const idToCheck = t.profile_id || t.id
        if (!markedSet.has(idToCheck)) {
          await supabase.from('attendance').insert({
            user_id: idToCheck,
            role: 'teacher',
            date: todayStr,
            status: 'absent',
            scan_method: 'auto_absent',
            gate: 'System Auto-Absent',
          })
          autoMarkedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      date: todayStr,
      autoMarkedAbsent: autoMarkedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
