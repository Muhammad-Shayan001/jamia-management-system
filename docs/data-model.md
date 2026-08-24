# Jamia LMS Data Model

## Core Philosophy
We use a **Single Auth Link + Role Extensions** pattern.
1. `auth.users` holds the raw identity (email/password).
2. `profiles` holds the shared user data (name, role, active status) and has a 1-to-1 link via `id REFERENCES auth.users(id)`.
3. `students` and `teachers` are role-specific extension tables that map to `profiles.id` via `profile_id`.

## Schema Overview

- **`profiles`**: `id`, `role` (super_admin, admin, nazim, teacher, student), `is_active`, `full_name_en`, `full_name_ur`.
- **`students`**: `id`, `profile_id`, `admission_number`, `class_id`. (Contains academic-specific fields).
- **`teachers`**: `id`, `profile_id`, `employee_id`. (Contains employment-specific fields).
- **`classes` / `subjects`**: Core structural data of the institution.
- **`attendance`**: References `student_id` (from `students` table) and `user_id` (from `profiles` for teachers). Supports both manual and QR scan methods.
- **`results` / `exams`**: References `student_id` for academics.

## Auth Enforcement
Authentication is strictly validated server-side.
- The **Super Admin** role is locked to `nizamiq001@gmail.com` via environment variable check.
- `proxy.ts` strictly routes users based on their resolved role.
- RLS Policies enforce isolation, utilizing helpers like `is_admin()`, `auth_role()`, `my_student_id()`, and `my_teacher_id()`.
- Pending users (`is_active = false`) are rejected at the login/middleware layer and through RLS constraints.
