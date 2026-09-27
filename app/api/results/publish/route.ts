import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { publishResults } from '@/lib/services/results'

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

    // Publish results
    await publishResults(examId, user.id)

    // TODO: Send notifications to all students about published results

    return NextResponse.json({ success: true, message: 'Results published successfully' })
  } catch (error: any) {
    console.error('Result publication error:', error)
    return NextResponse.json({ error: error.message || 'Failed to publish results' }, { status: 500 })
  }
}
