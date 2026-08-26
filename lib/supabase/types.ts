export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'teacher' | 'student' | 'parent'
          full_name_en: string
          full_name_ur: string | null
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          totp_secret: string | null
          totp_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          is_current: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      classes: {
        Row: {
          id: string
          name_en: string
          name_ur: string | null
          level: number
          session_id: string
          capacity: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['classes']['Insert']>
      }
      subjects: {
        Row: {
          id: string
          name_en: string
          name_ur: string | null
          class_id: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>
      }
      students: {
        Row: {
          id: string
          profile_id: string | null
          admission_number: string
          name_en: string
          name_ur: string
          father_name_en: string
          father_name_ur: string | null
          cnic_or_bform: string | null
          class_id: string | null
          session_id: string | null
          photo_url: string | null
          guardian_phone: string | null
          guardian_email: string | null
          address: string | null
          enrolled_at: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      teachers: {
        Row: {
          id: string
          profile_id: string | null
          employee_number: string
          name_en: string
          name_ur: string | null
          specialization: string | null
          photo_url: string | null
          hire_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['teachers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['teachers']['Insert']>
      }
      class_teacher_assignments: {
        Row: {
          id: string
          class_id: string
          teacher_id: string
          subject_id: string
          is_primary: boolean
          session_id: string
        }
        Insert: Omit<Database['public']['Tables']['class_teacher_assignments']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['class_teacher_assignments']['Insert']>
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          class_id: string
          subject_id: string
          date: string
          period: number
          status: 'present' | 'absent' | 'late' | 'excused'
          marked_by: string | null
          scan_method: 'qr' | 'manual' | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>
      }
      leave_requests: {
        Row: {
          id: string
          student_id: string
          requested_by: string | null
          from_date: string
          to_date: string
          reason: string
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leave_requests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leave_requests']['Insert']>
      }
      exams: {
        Row: {
          id: string
          name_en: string
          name_ur: string | null
          type: 'maahana' | 'nisf_saal' | 'sanawi' | 'dawra' | 'quiz'
          class_id: string
          session_id: string
          exam_date: string | null
          total_marks: number
          passing_marks: number
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['exams']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['exams']['Insert']>
      }
      grade_boundaries: {
        Row: {
          id: string
          grade: string
          min_percent: number
          max_percent: number
          label_en: string | null
          label_ur: string | null
        }
        Insert: Omit<Database['public']['Tables']['grade_boundaries']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['grade_boundaries']['Insert']>
      }
      results: {
        Row: {
          id: string
          student_id: string
          exam_id: string
          subject_id: string
          marks_obtained: number | null
          is_absent: boolean
          grade: string | null
          remarks: string | null
          entered_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['results']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['results']['Insert']>
      }
      syllabus: {
        Row: {
          id: string
          subject_id: string
          class_id: string
          session_id: string
          title_en: string
          title_ur: string | null
          file_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['syllabus']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['syllabus']['Insert']>
      }
      syllabus_topics: {
        Row: {
          id: string
          syllabus_id: string
          topic_en: string
          topic_ur: string | null
          order_index: number
          is_covered: boolean
          covered_at: string | null
          covered_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['syllabus_topics']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['syllabus_topics']['Insert']>
      }
      quizzes: {
        Row: {
          id: string
          exam_id: string
          title: string
          time_limit: number | null
          is_published: boolean
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quizzes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quizzes']['Insert']>
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question_text: string
          options: Json
          marks: number
          order_index: number
        }
        Insert: Omit<Database['public']['Tables']['quiz_questions']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['quiz_questions']['Insert']>
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          student_id: string
          answers: Json | null
          score: number | null
          started_at: string | null
          submitted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['quiz_attempts']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['quiz_attempts']['Insert']>
      }
      hifz_progress: {
        Row: {
          id: string
          student_id: string
          juz_number: number
          surah_from: string | null
          surah_to: string | null
          status: 'not_started' | 'in_progress' | 'completed' | 'revised'
          completed_at: string | null
          teacher_id: string | null
          notes: string | null
          session_id: string
        }
        Insert: Omit<Database['public']['Tables']['hifz_progress']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['hifz_progress']['Insert']>
      }
      fee_structures: {
        Row: {
          id: string
          class_id: string
          session_id: string
          fee_head: 'tuition' | 'admission' | 'exam' | 'hostel' | 'library' | 'other'
          amount: number
          frequency: 'monthly' | 'term' | 'annual' | 'one_time'
          due_day: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fee_structures']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fee_structures']['Insert']>
      }
      fee_vouchers: {
        Row: {
          id: string
          voucher_number: string
          student_id: string
          fee_structure_id: string | null
          month_year: string | null
          amount: number
          due_date: string
          paid_at: string | null
          payment_method: 'online' | 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | null
          payment_ref: string | null
          receipt_url: string | null
          status: 'unpaid' | 'paid' | 'overdue' | 'waived'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fee_vouchers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fee_vouchers']['Insert']>
      }
      announcements: {
        Row: {
          id: string
          title_en: string
          title_ur: string | null
          body_en: string | null
          body_ur: string | null
          target_roles: string[] | null
          target_classes: string[] | null
          send_whatsapp: boolean
          send_email: boolean
          published_at: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
      timetable: {
        Row: {
          id: string
          class_id: string
          subject_id: string
          teacher_id: string
          day_of_week: number
          period: number
          start_time: string
          end_time: string
          session_id: string
        }
        Insert: Omit<Database['public']['Tables']['timetable']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['timetable']['Insert']>
      }
      documents: {
        Row: {
          id: string
          student_id: string
          doc_type: 'admission_form' | 'certificate' | 'id_card' | 'other' | null
          name: string
          file_url: string
          uploaded_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      donations: {
        Row: {
          id: string
          donor_name: string | null
          amount: number
          purpose: 'zakat' | 'sadqa' | 'general' | null
          date: string
          receipt_num: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['donations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['donations']['Insert']>
      }
      expenses: {
        Row: {
          id: string
          category: 'salary' | 'utilities' | 'maintenance' | 'stationery' | 'other' | null
          description: string
          amount: number
          date: string
          receipt_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
    }
    Views: {}
    Functions: {
      auth_role: { Args: {}; Returns: string }
      is_admin: { Args: {}; Returns: boolean }
      my_teacher_id: { Args: {}; Returns: string }
      my_student_id: { Args: {}; Returns: string }
    }
    Enums: {}
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type Class = Database['public']['Tables']['classes']['Row']
export type Subject = Database['public']['Tables']['subjects']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Teacher = Database['public']['Tables']['teachers']['Row']
export type Attendance = Database['public']['Tables']['attendance']['Row']
export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']
export type Exam = Database['public']['Tables']['exams']['Row']
export type Result = Database['public']['Tables']['results']['Row']
export type FeeVoucher = Database['public']['Tables']['fee_vouchers']['Row']
export type FeeStructure = Database['public']['Tables']['fee_structures']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']

export type UserRole = Profile['role']
export type AttendanceStatus = Attendance['status']
export type VoucherStatus = FeeVoucher['status']
export type ExamType = Exam['type']
