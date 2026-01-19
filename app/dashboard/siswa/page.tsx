'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, BookCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SiswaDashboard() {
  const [stats, setStats] = useState({
    activeBorrows: 0,
    totalBorrows: 0,
    overdueBooks: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()

      const transactions = data.transactions || []
      const active = transactions.filter((t: any) => t.status === 'DIPINJAM')
      const overdue = active.filter((t: any) => {
        const batasKembali = new Date(t.batasKembali)
        return batasKembali < new Date()
      })

      setStats({
        activeBorrows: active.length,
        totalBorrows: transactions.length,
        overdueBooks: overdue.length,
      })

      setRecentTransactions(transactions.slice(0, 5))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
            Dashboard Siswa
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola peminjaman dan pengembalian buku Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Peminjaman Aktif
              </CardTitle>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#38BDF820' }}>
                <BookOpen className="w-5 h-5" style={{ color: '#1A3D64' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBorrows}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Peminjaman
              </CardTitle>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#22C55E20' }}>
                <BookCheck className="w-5 h-5" style={{ color: '#1A3D64' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBorrows}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Terlambat
              </CardTitle>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#EF444420' }}>
                <AlertCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdueBooks}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Peminjaman Buku</CardTitle>
              <CardDescription>
                Pinjam buku yang tersedia di perpustakaan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/siswa/borrow">
                <Button className="w-full" style={{ backgroundColor: '#1A3D64' }}>Pinjam Buku</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengembalian Buku</CardTitle>
              <CardDescription>
                Kembalikan buku yang sedang Anda pinjam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/siswa/return">
                <Button className="w-full" style={{ backgroundColor: '#1A3D64' }}>Kembalikan Buku</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {recentTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{transaction.book.judul}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.tanggalPinjam).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={
                        transaction.status === 'DIPINJAM'
                          ? { backgroundColor: '#38BDF820', color: '#1A3D64' }
                          : transaction.status === 'DIKEMBALIKAN'
                          ? { backgroundColor: '#22C55E20', color: '#22C55E' }
                          : { backgroundColor: '#EF444420', color: '#EF4444' }
                      }
                    >
                      {transaction.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

