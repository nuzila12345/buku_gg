'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, BookCheck, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeBorrows: 0,
    totalTransactions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [booksRes, membersRes, transactionsRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/members'),
        fetch('/api/transactions'),
      ])

      const [booksData, membersData, transactionsData] = await Promise.all([
        booksRes.json(),
        membersRes.json(),
        transactionsRes.json(),
      ])

      const activeBorrows = transactionsData.transactions?.filter(
        (t: any) => t.status === 'DIPINJAM'
      ).length || 0

      setStats({
        totalBooks: booksData.books?.length || 0,
        totalMembers: membersData.members?.length || 0,
        activeBorrows,
        totalTransactions: transactionsData.transactions?.length || 0,
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const statCards = [
    {
      title: 'Total Buku',
      value: stats.totalBooks,
      icon: BookOpen,
      color: '#1A3D64',
      bgColor: '#38BDF8',
    },
    {
      title: 'Total Anggota',
      value: stats.totalMembers,
      icon: Users,
      color: '#1A3D64',
      bgColor: '#22C55E',
    },
    {
      title: 'Peminjaman Aktif',
      value: stats.activeBorrows,
      icon: BookCheck,
      color: '#1A3D64',
      bgColor: '#F5C16C',
    },
    {
      title: 'Total Transaksi',
      value: stats.totalTransactions,
      icon: TrendingUp,
      color: '#1A3D64',
      bgColor: '#38BDF8',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
            Dashboard Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            Selamat datang di panel administrasi sistem peminjaman buku
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: stat.bgColor + '20' }}>
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

