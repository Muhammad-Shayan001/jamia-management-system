import { z } from 'zod'

export const studentTeacherPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')

export const adminPasswordSchema = z
  .string()
  .min(12, 'Admin password must be at least 12 characters.')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
  .regex(/[0-9]/, 'Must contain at least one number.')
  .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character.')

export function validatePassword(password: string, role: string) {
  const isAdminRole = ['super_admin', 'admin', 'nazim'].includes(role)
  const schema = isAdminRole ? adminPasswordSchema : studentTeacherPasswordSchema
  
  const result = schema.safeParse(password)
  if (!result.success) {
    return { valid: false, error: result.error.issues[0].message }
  }
  return { valid: true }
}
