/**
 * Results Calculation Service
 * Automatically calculates student results from exam marks
 */

import { createClient } from '@/lib/supabase/server'

type ExamResult = {
  student_id: string
  exam_id: string
  class_id: string
  total_marks_obtained: number
  total_marks_max: number
  grade: string
  is_pass: boolean
}

export async function calculateResultsForExam(examId: string) {
  const supabase = await createClient()

  // Get all exam subjects for this exam
  const { data: examSubjects, error: examSubjectsError } = await supabase
    .from('exam_subjects')
    .select(`
      id,
      total_marks,
      passing_marks,
      class_id,
      exam_id
    `)
    .eq('exam_id', examId)

  if (examSubjectsError || !examSubjects) {
    throw new Error('Failed to fetch exam subjects')
  }

  // Get all marks for these exam subjects
  const examSubjectIds = examSubjects.map((es: any) => es.id)
  const { data: marks, error: marksError } = await supabase
    .from('marks')
    .select('*')
    .in('exam_subject_id', examSubjectIds)

  if (marksError) {
    throw new Error('Failed to fetch marks')
  }

  // Group marks by student
  const studentMarks = new Map<string, any[]>()
  marks?.forEach((mark: any) => {
    if (!studentMarks.has(mark.student_id)) {
      studentMarks.set(mark.student_id, [])
    }
    studentMarks.get(mark.student_id)?.push(mark)
  })

  // Calculate results for each student
  const results: ExamResult[] = []

  for (const [studentId, studentMarksList] of studentMarks.entries()) {
    let totalObtained = 0
    let totalMax = 0
    let allPass = true

    for (const mark of studentMarksList) {
      const examSubject = examSubjects.find((es: any) => es.id === mark.exam_subject_id)
      if (!examSubject) continue

      const obtained = mark.total_obtained || 0
      totalObtained += obtained
      totalMax += examSubject.total_marks

      // Check if student passed this subject
      if (obtained < examSubject.passing_marks) {
        allPass = false
      }
    }

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
    const grade = calculateGrade(percentage)

    // Get class_id from first exam subject
    const classId = examSubjects[0]?.class_id

    results.push({
      student_id: studentId,
      exam_id: examId,
      class_id: classId,
      total_marks_obtained: totalObtained,
      total_marks_max: totalMax,
      grade,
      is_pass: allPass && percentage >= 40, // Overall passing is 40%
    })
  }

  // Upsert results
  const { error: resultsError } = await supabase.from('results').upsert(
    results.map((r) => ({
      ...r,
      institution_id: null, // Will be set by trigger or we can get from exam
    })),
    { onConflict: 'student_id,exam_id' }
  )

  if (resultsError) {
    throw new Error('Failed to save results: ' + resultsError.message)
  }

  // Calculate positions
  await calculatePositions(examId, results)

  return results
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C'
  if (percentage >= 40) return 'D'
  return 'F'
}

async function calculatePositions(examId: string, results: ExamResult[]) {
  const supabase = await createClient()

  // Sort by total marks obtained (descending)
  const sortedResults = [...results].sort((a, b) => b.total_marks_obtained - a.total_marks_obtained)

  // Assign positions
  const updates = sortedResults.map((result, index) => ({
    student_id: result.student_id,
    exam_id: result.exam_id,
    position: index + 1,
  }))

  // Update positions in database
  for (const update of updates) {
    await supabase
      .from('results')
      .update({ position: update.position })
      .eq('student_id', update.student_id)
      .eq('exam_id', update.exam_id)
  }
}

export async function publishResults(examId: string, publishedBy: string) {
  const supabase = await createClient()

  // Update exam as published
  const { error: examError } = await supabase
    .from('exams')
    .update({ is_published: true })
    .eq('id', examId)

  if (examError) {
    throw new Error('Failed to publish exam: ' + examError.message)
  }

  // Update all results for this exam
  const { error: resultsError } = await supabase
    .from('results')
    .update({
      published_at: new Date().toISOString(),
      published_by: publishedBy,
    })
    .eq('exam_id', examId)

  if (resultsError) {
    throw new Error('Failed to publish results: ' + resultsError.message)
  }

  // TODO: Send notifications to students about published results
}

export async function getStudentResults(studentId: string, examId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('results')
    .select(`
      *,
      exam:exams(name_en, exam_type),
      class:classes(name_en)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (examId) {
    query = query.eq('exam_id', examId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error('Failed to fetch results: ' + error.message)
  }

  return data
}

export async function getClassResults(examId: string, classId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('results')
    .select(`
      *,
      student:students(name_en, name_ur, admission_number)
    `)
    .eq('exam_id', examId)
    .eq('class_id', classId)
    .order('position', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch class results: ' + error.message)
  }

  return data
}
