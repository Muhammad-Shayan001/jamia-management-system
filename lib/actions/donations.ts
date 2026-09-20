'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDonations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching donations:', error)
    return []
  }
  return data || []
}

export async function addDonation(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const donor_name = formData.get('donor_name') as string || null
  const amountStr = formData.get('amount') as string
  const purpose = formData.get('purpose') as string
  const date = formData.get('date') as string
  const notes = formData.get('notes') as string || null
  
  if (!amountStr || isNaN(Number(amountStr)) || !purpose || !date) {
    return { error: 'Invalid input. Please fill required fields.' }
  }
  
  // Generate random receipt num
  const receipt_num = `DON-${Date.now()}`
  
  const { data, error } = await supabase
    .from('donations')
    .insert({
      donor_name,
      amount: Number(amountStr),
      purpose,
      date,
      notes,
      receipt_num,
      created_by: user?.id
    })
    .select()
    .single()
    
  if (error) return { error: error.message }
  return { success: true, donation: data }
}

export async function getExpenses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
  return data || []
}

export async function addExpense(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const amountStr = formData.get('amount') as string
  const date = formData.get('date') as string
  
  if (!amountStr || isNaN(Number(amountStr)) || !category || !date || !description) {
    return { error: 'Invalid input. Please fill required fields.' }
  }
  
  const { error } = await supabase
    .from('expenses')
    .insert({
      category,
      description,
      amount: Number(amountStr),
      date,
      created_by: user?.id
    })
    
  if (error) return { error: error.message }
  return { success: true }
}
