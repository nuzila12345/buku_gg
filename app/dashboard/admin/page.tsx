'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { BookOpen, Users, TrendingUp, DollarSign, Calendar } from 'lucide-react'

interface AnalyticsData {
  stats: {
    totalBooks: number
    borrowedBooks: number
    totalMembers: number
    unpaidFines: number
    todayTransactions: number
  }
  charts: {
    monthlyBorrowingData: Array<{ month: string; count: number }>
    categoryBorrowingData: Array<{ name: string; count: number }>
    statusBreakdown: Array<{ name: string; value: number }>
    topBooks: Array<{ id: string; judul: string; penulis: string; peminjaman: number }>
  }
}

const COLORS = ['#4FD3C4', '#2DD4BF', '#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A', '#06B6D4', '#0891B2', '#0E7490']

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  // Color palette - Teal
  const colorPalette = {
    primary: '#4FD3C4',      // Teal bright
    dark: '#0F766E',         // Teal dark
    light: '#F0FDFB',        // Mint very light
    accent: '#2DD4BF',       // Teal medium
    lightAccent: '#CCFBF1',  // Teal very light
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      const data = await res.json()
      setAnalytics(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-gray-600">Memuat dashboard...</p>
        </div>
      </DashboardLayout>
    )
  }

  const stats = analytics?.stats
  const charts = analytics?.charts

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: colorPalette.dark }}>
            🎯 Dashboard Perpustakaan
          </h1>
          <p className="text-gray-600">
            Ringkasan dan analitik sistem pengembalian buku
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Buku */}
          <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colorPalette.dark }}>
                    Total Buku
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: colorPalette.primary }}>
                    {stats?.totalBooks}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: colorPalette.accent }}>
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buku Dipinjam */}
          <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colorPalette.dark }}>
                    Buku Dipinjam
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: colorPalette.primary }}>
                    {stats?.borrowedBooks}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((stats?.borrowedBooks ?? 0) / (stats?.totalBooks ?? 1) * 100).toFixed(1)}% dari total
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: colorPalette.accent }}>
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Siswa */}
          <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colorPalette.dark }}>
                    Total Siswa
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: colorPalette.primary }}>
                    {stats?.totalMembers}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: colorPalette.accent }}>
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Denda Belum Dibayar */}
          <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: '#FEF2F2' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Denda Pending
                  </p>
                  <p className="text-2xl font-bold mt-2 text-red-600">
                    {`Rp ${(stats?.unpaidFines ?? 0).toLocaleString('id-ID')}`}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-200">
                  <DollarSign className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaksi Hari Ini */}
          <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colorPalette.dark }}>
                    Transaksi Hari Ini
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: colorPalette.primary }}>
                    {stats?.todayTransactions}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: colorPalette.accent }}>
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peminjaman per Bulan */}
          <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
            <CardHeader>
              <CardTitle style={{ color: colorPalette.dark }}>
                📈 Peminjaman per Bulan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts?.monthlyBorrowingData || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colorPalette.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={colorPalette.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={colorPalette.primary}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Transaksi Breakdown */}
          <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
            <CardHeader>
              <CardTitle style={{ color: colorPalette.dark }}>
                📊 Distribusi Status Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts?.statusBreakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {charts?.statusBreakdown?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Kategori Buku Paling Dipinjam */}
          <Card className="lg:col-span-2 border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
            <CardHeader>
              <CardTitle style={{ color: colorPalette.dark }}>
                🏆 10 Buku Paling Dipinjam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={charts?.categoryBorrowingData || []}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 300, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={290} />
                  <Tooltip />
                  <Bar dataKey="count" fill={colorPalette.primary} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 10 Buku Terpopuler Table */}
          <Card className="lg:col-span-2 border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
            <CardHeader>
              <CardTitle style={{ color: colorPalette.dark }}>
                ⭐ Top 10 Buku Terpopuler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: colorPalette.accent, backgroundColor: colorPalette.light }}>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: colorPalette.dark }}>
                        Judul Buku
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: colorPalette.dark }}>
                        Penulis
                      </th>
                      <th className="text-center py-3 px-4 font-semibold" style={{ color: colorPalette.dark }}>
                        Peminjaman
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {charts?.topBooks?.map((book, index) => (
                      <tr
                        key={book.id}
                        className="border-b hover:bg-opacity-50 transition-colors"
                        style={{ borderColor: colorPalette.accent }}
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium" style={{ color: colorPalette.dark }}>
                              {book.judul}
                            </p>
                            <p className="text-xs text-gray-500">Rank #{index + 1}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{book.penulis}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white"
                            style={{ backgroundColor: colorPalette.primary }}
                          >
                            {book.peminjaman}x
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

