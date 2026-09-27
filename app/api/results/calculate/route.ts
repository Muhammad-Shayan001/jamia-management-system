import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateResultsForExam } from '@/lib/services/results'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = (await supabase.from('profiles').select('role').eq('id', user.id).single()) as any

    if (!profile || !['super_admin', 'admin', 'nazim'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { examId } = await request.json()

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 })
    }

    // Calculate results
    const results = await calculateResultsForExam(examId)

    return NextResponse.json({ success: true, results, count: results.length })
  } catch (error: any) {
    console.error('Result calculation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to calculate results' }, { status: 500 })
  }
}
