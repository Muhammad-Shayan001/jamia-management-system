'use server'

import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const BookSchema = z.object({
  title_en: z.string().min(2, 'Title required'),
  title_ur: z.string().optional(),
  author: z.string().optional(),
  category: z.enum(['Fiqh', 'Hadith', 'Tafsir', 'Arabic', 'General', 'Sirah', 'Tajweed']),
  class_id: z.string().uuid().optional().or(z.literal('')),
  file_url: z.string().url('Invalid file URL'),
  cover_url: z.string().url().optional().or(z.literal('')),
})

export async function addBook(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (!['admin', 'nazim', 'super_admin'].includes(profile?.role)) {
    return { error: 'Only admins can upload books' }
  }

  const parsed = BookSchema.safeParse({
    title_en: formData.get('title_en'),
    title_ur: formData.get('title_ur'),
    author: formData.get('author'),
    category: formData.get('category'),
    class_id: formData.get('class_id'),
    file_url: formData.get('file_url'),
    cover_url: formData.get('cover_url'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('library_books') as any).insert({
    ...parsed.data,
    class_id: parsed.data.class_id || null,
    cover_url: parsed.data.cover_url || null,
    uploaded_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/library')
  revalidatePath('/student/library')
  revalidatePath('/teacher/library')
  return { success: true }
}

export async function deactivateBook(bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('library_books') as any)
    .update({ is_active: false })
    .eq('id', bookId)

  if (error) return { error: error.message }
  revalidatePath('/admin/library')
  return { success: true }
}

export async function incrementDownload(bookId: string) {
  const supabase = await createClient()
  // RPC to safely increment without RLS issues
  await (supabase as any).rpc('increment_book_downloads', { book_id: bookId })
  return { success: true }
}

export async function getLibraryBooks(categoryFilter?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('library_books')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (categoryFilter && categoryFilter !== 'All') {
    query = (query as any).eq('category', categoryFilter)
  }

  const { data } = await (query as any)
  return data || []
}

export async function getAllBooksAdmin() {
  const supabase = await createClient()
  const { data } = await (supabase
    .from('library_books')
    .select('*')
    .order('created_at', { ascending: false }) as any)
  return data || []
}
