'use server'

import { createClient } from '@/lib/supabase/server'
import { UserRole } from './auth'

export async function getAccountantDashboardStats() {
  const supabase = await createClient()

  // Verify access (handled by RLS implicitly, but we can just fetch)
  // 1. Total collected this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const startOfMonthStr = startOfMonth.toISOString()

  const { data: collectedVouchers } = await supabase
    .from('fee_vouchers')
    .select('amount')
    .eq('status', 'paid')
    .gte('paid_at', startOfMonthStr)
  
  const totalCollectedThisMonth = collectedVouchers?.reduce((acc, curr) => acc + curr.amount, 0) || 0

  // 2. Outstanding/overdue amount
  const { data: outstandingVouchers } = await supabase
    .from('fee_vouchers')
    .select('amount, status')
    .in('status', ['unpaid', 'overdue'])
  
  const totalOutstanding = outstandingVouchers?.reduce((acc, curr) => acc + curr.amount, 0) || 0

  // 3. Number of overdue vouchers
  const overdueCount = outstandingVouchers?.filter(v => v.status === 'overdue').length || 0

  // 4. Today's donations
  const today = new Date().toISOString().split('T')[0]
  const { data: todaysDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('date', today)
  
  const totalDonationsToday = todaysDonations?.reduce((acc, curr) => acc + curr.amount, 0) || 0

  return {
    totalCollectedThisMonth,
    totalOutstanding,
    overdueCount,
    totalDonationsToday
  }
}

export async function getFeeVouchers() {
  const supabase = await createClient()
  const { data: vouchers, error } = await supabase
    .from('fee_vouchers')
    .select(`
      *,
      student:students(name_en, name_ur, admission_number, class:classes(name_en, name_ur)),
      fee_structure:fee_structures(fee_head)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching vouchers:', error)
    return []
  }
  return vouchers || []
}

export async function markVoucherPaid(voucherId: string, paymentMethod: string, receiptUrl?: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('fee_vouchers')
    .update({ 
      status: 'paid',
      payment_method: paymentMethod,
      receipt_url: receiptUrl,
      paid_at: new Date().toISOString()
    })
    .eq('id', voucherId)
    
  if (error) return { error: error.message }
  return { success: true }
}

export async function voidVoucher(voucherId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('fee_vouchers')
    .update({ status: 'waived', payment_ref: reason }) // waived used as void
    .eq('id', voucherId)
    
  if (error) return { error: error.message }
  
  // Log to audit
  try {
    const adminClient = await import('@/lib/supabase/admin').then(m => m.createAdminClient())
    await (adminClient.from('audit_logs') as any).insert({
      actor_id: user?.id,
      action: 'VOID_VOUCHER',
      entity_type: 'fee_vouchers',
      entity_id: voucherId,
      details: { reason }
    })
  } catch (e) {}
  
  return { success: true }
}
