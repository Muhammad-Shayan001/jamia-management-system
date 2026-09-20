'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getAccountantDashboardStats() {
  const supabase = await createClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const startOfMonthStr = startOfMonth.toISOString()

  const { data: collectedVouchers } = await (supabase
    .from('fee_vouchers')
    .select('amount')
    .eq('status', 'paid')
    .gte('paid_at', startOfMonthStr) as any)

  const totalCollectedThisMonth = (collectedVouchers || []).reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0)

  const { data: outstandingVouchers } = await (supabase
    .from('fee_vouchers')
    .select('amount, status')
    .in('status', ['unpaid', 'overdue']) as any)

  const totalOutstanding = (outstandingVouchers || []).reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0)
  const overdueCount = (outstandingVouchers || []).filter((v: any) => v.status === 'overdue').length

  const today = new Date().toISOString().split('T')[0]
  const { data: todaysDonations } = await (supabase
    .from('donations')
    .select('amount')
    .eq('date', today) as any)

  const totalDonationsToday = (todaysDonations || []).reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0)

  return { totalCollectedThisMonth, totalOutstanding, overdueCount, totalDonationsToday }
}

export async function getFeeVouchers() {
  const supabase = await createClient()
  const { data: vouchers, error } = await (supabase
    .from('fee_vouchers')
    .select(`
      *,
      student:students(name_en, name_ur, admission_number, class:classes(name_en, name_ur)),
      fee_structure:fee_structures(fee_head)
    `)
    .order('created_at', { ascending: false }) as any)

  if (error) {
    console.error('Error fetching vouchers:', error)
    return []
  }
  return vouchers || []
}

export async function markVoucherPaid(voucherId: string, paymentMethod: string, receiptUrl?: string) {
  const supabase = await createClient()

  const { error } = await (supabase.from('fee_vouchers') as any)
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

  const { error } = await (supabase.from('fee_vouchers') as any)
    .update({ status: 'waived', payment_ref: reason })
    .eq('id', voucherId)

  if (error) return { error: error.message }

  try {
    const adminClient = createAdminClient()
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
