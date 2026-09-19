'use server'

import { createAdminClient } from '../supabase/admin'
import { validatePassword } from '../validation/password'

export interface BulkStudentRow {
  fullNameEn: string
  fullNameUr?: string
  fatherNameEn: string
  email: string
  phone?: string
  password?: string // If provided, use it, else generate one
  classId?: string
}

export interface BulkImportResult {
  success: number
  failed: number
  errors: { row: number, email: string, error: string }[]
}

function generateRandomPassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$"
  let pass = ""
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass
}

export async function bulkImportStudents(rows: BulkStudentRow[]): Promise<BulkImportResult> {
  const adminClient = createAdminClient()
  const result: BulkImportResult = { success: 0, failed: 0, errors: [] }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      if (!row.email || !row.fullNameEn || !row.fatherNameEn) {
        throw new Error("Missing required fields (email, fullNameEn, fatherNameEn)")
      }

      const email = row.email.toLowerCase().trim()
      const password = row.password || generateRandomPassword()
      
      const passCheck = validatePassword(password, 'student')
      if (!passCheck.valid) {
        throw new Error(`Password validation failed: ${passCheck.error}`)
      }

      // 1. Create Auth User
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'student', full_name_en: row.fullNameEn },
      })

      if (authError) throw new Error(`Auth Error: ${authError.message}`)
      if (!authData.user) throw new Error("Failed to create auth user")

      const userId = authData.user.id
      const timestamp = Date.now()

      // 2. Create Profile
      const { error: profileError } = await (adminClient.from('profiles') as any).insert({
        id: userId,
        role: 'student',
        full_name_en: row.fullNameEn,
        full_name_ur: row.fullNameUr || null,
        phone: row.phone || null,
        is_active: true, // Bulk imported by admin, assume active
        totp_enabled: false,
      })

      if (profileError) {
        await adminClient.auth.admin.deleteUser(userId)
        throw new Error(`Profile Error: ${profileError.message}`)
      }

      // 3. Create Student extension
      const admissionNumber = `STU-${timestamp}-${i}`
      const { error: studentError } = await (adminClient.from('students') as any).insert({
        profile_id: userId,
        admission_number: admissionNumber,
        name_en: row.fullNameEn,
        name_ur: row.fullNameUr || row.fullNameEn,
        father_name_en: row.fatherNameEn,
        guardian_phone: row.phone || null,
        guardian_email: email,
        class_id: row.classId || null,
        is_active: true,
      })

      if (studentError) {
        await adminClient.auth.admin.deleteUser(userId)
        throw new Error(`Student Error: ${studentError.message}`)
      }

      result.success++
    } catch (err: any) {
      result.failed++
      result.errors.push({ row: i + 1, email: row.email || 'unknown', error: err.message })
    }
  }

  // Log audit
  if (result.success > 0) {
    try {
      await (adminClient.from('audit_logs') as any).insert({
        actor_role: 'admin',
        action: 'BULK_IMPORT_STUDENTS',
        details: { imported: result.success, failed: result.failed }
      })
    } catch (_) {}
  }

  return result
}

export interface BulkTeacherRow {
  fullNameEn: string
  fullNameUr?: string
  email: string
  phone?: string
  password?: string
}

export async function bulkImportTeachers(rows: BulkTeacherRow[]): Promise<BulkImportResult> {
  const adminClient = createAdminClient()
  const result: BulkImportResult = { success: 0, failed: 0, errors: [] }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      if (!row.email || !row.fullNameEn) {
        throw new Error("Missing required fields (email, fullNameEn)")
      }

      const email = row.email.toLowerCase().trim()
      const password = row.password || generateRandomPassword()
      
      const passCheck = validatePassword(password, 'teacher')
      if (!passCheck.valid) {
        throw new Error(`Password validation failed: ${passCheck.error}`)
      }

      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'teacher', full_name_en: row.fullNameEn },
      })

      if (authError) throw new Error(`Auth Error: ${authError.message}`)
      if (!authData.user) throw new Error("Failed to create auth user")

      const userId = authData.user.id
      const timestamp = Date.now()

      const { error: profileError } = await (adminClient.from('profiles') as any).insert({
        id: userId,
        role: 'teacher',
        full_name_en: row.fullNameEn,
        full_name_ur: row.fullNameUr || null,
        phone: row.phone || null,
        is_active: true,
        totp_enabled: false,
      })

      if (profileError) {
        await adminClient.auth.admin.deleteUser(userId)
        throw new Error(`Profile Error: ${profileError.message}`)
      }

      const employeeNumber = `TCH-${timestamp}-${i}`
      const { error: teacherError } = await (adminClient.from('teachers') as any).insert({
        profile_id: userId,
        employee_number: employeeNumber,
        name_en: row.fullNameEn,
        name_ur: row.fullNameUr || null,
        is_active: true,
      })

      if (teacherError) {
        await adminClient.auth.admin.deleteUser(userId)
        throw new Error(`Teacher Error: ${teacherError.message}`)
      }

      result.success++
    } catch (err: any) {
      result.failed++
      result.errors.push({ row: i + 1, email: row.email || 'unknown', error: err.message })
    }
  }

  if (result.success > 0) {
    try {
      await (adminClient.from('audit_logs') as any).insert({
        actor_role: 'admin',
        action: 'BULK_IMPORT_TEACHERS',
        details: { imported: result.success, failed: result.failed }
      })
    } catch (_) {}
  }

  return result
}
