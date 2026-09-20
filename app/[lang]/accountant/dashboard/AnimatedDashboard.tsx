'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, AlertTriangle, Clock, Heart } from 'lucide-react'

export function AnimatedDashboard({ stats, isUr }: { stats: any, isUr: boolean }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isUr ? 'ڈیش بورڈ' : 'Finance Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isUr ? 'مالیاتی امور کا عمومی جائزہ' : 'Overview of financial activities'}
          </p>
        </div>
      </div>

      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {isUr ? 'اس مہینے وصول شدہ' : 'Collected This Month'}
              </CardTitle>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs {stats.totalCollectedThisMonth.toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {isUr ? 'بقایاجات' : 'Outstanding Amount'}
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">Rs {stats.totalOutstanding.toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {isUr ? 'اوور ڈیو واؤچرز' : 'Overdue Vouchers'}
              </CardTitle>
              <Clock className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overdueCount}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {isUr ? 'آج کے عطیات' : "Today's Donations"}
              </CardTitle>
              <Heart className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Rs {stats.totalDonationsToday.toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
