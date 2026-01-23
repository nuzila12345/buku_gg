'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Clock, BookOpen } from 'lucide-react'

interface Transaction {
  id: string
  userId: string
  bookId: string
  tanggalPinjam: string
  tanggalKembali: string | null
  batasKembali: string
  status: 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT'
  denda: number
  book: {
    id: string
    judul: string
    penulis: string
    penerbit: string
    isbn?: string
    gambar?: string
  }
  user: {
    id: string
    nama: string
    username: string
  }
}

export default function AdminHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'SEMUA' | 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT'>('SEMUA')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
    setCurrentPage(1)
  }, [filterStatus, transactions])

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      setTransactions(data.transactions || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (filterStatus !== 'SEMUA') {
      filtered = filtered.filter((t) => t.status === filterStatus)
    }

    // Urutkan: DIPINJAM di atas, kemudian berdasarkan tanggal
    filtered.sort((a, b) => {
      if (a.status === 'DIPINJAM' && b.status !== 'DIPINJAM') return -1
      if (a.status !== 'DIPINJAM' && b.status === 'DIPINJAM') return 1
      return new Date(b.tanggalPinjam).getTime() - new Date(a.tanggalPinjam).getTime()
    })

    setFilteredTransactions(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DIPINJAM':
        return { bg: '#FEF3C7', text: '#D97706', border: '#F59E0B', icon: Clock }
      case 'DIKEMBALIKAN':
        return { bg: '#D1FAE5', text: '#059669', border: '#10B981', icon: CheckCircle }
      case 'TERLAMBAT':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#EF4444', icon: AlertCircle }
      default:
        return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB', icon: Clock }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DIPINJAM':
        return 'Sedang Dipinjam'
      case 'DIKEMBALIKAN':
        return 'Sudah Dikembalikan'
      case 'TERLAMBAT':
        return 'Terlambat'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const stats = {
    total: transactions.length,
    sedangDipinjam: transactions.filter((t) => t.status === 'DIPINJAM').length,
    sudahDikembalikan: transactions.filter((t) => t.status === 'DIKEMBALIKAN').length,
    terlambat: transactions.filter((t) => t.status === 'TERLAMBAT').length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Peminjaman</h1>
          <p className="text-gray-600 mt-1">Lihat semua riwayat peminjaman dan pengembalian buku</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Total Peminjaman</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Sedang Dipinjam</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.sedangDipinjam}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Sudah Dikembalikan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.sudahDikembalikan}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Terlambat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.terlambat}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Filter Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {['SEMUA', 'DIPINJAM', 'DIKEMBALIKAN', 'TERLAMBAT'].map((status) => (
                <Button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status === 'SEMUA' ? 'Semua (' + transactions.length + ')' : status === 'DIPINJAM' ? 'Sedang Dipinjam (' + stats.sedangDipinjam + ')' : status === 'DIKEMBALIKAN' ? 'Sudah Dikembalikan (' + stats.sudahDikembalikan + ')' : 'Terlambat (' + stats.terlambat + ')'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Daftar Peminjaman</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Tidak ada data peminjaman</p>
              </div>
            ) : (
              <div>
                {/* Transactions Items */}
                <div className="space-y-4 mb-6">
                  {paginatedTransactions.map((transaction) => {
                    const statusColor = getStatusColor(transaction.status)
                    const StatusIcon = statusColor.icon

                    return (
                      <div
                        key={transaction.id}
                        className="border rounded-lg p-4"
                        style={{ borderColor: statusColor.border }}
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          {/* Left Section - Book Info */}
                          <div className="flex gap-4 flex-1">
                            {transaction.book.gambar && (
                              <img
                                src={transaction.book.gambar}
                                alt={transaction.book.judul}
                                className="w-20 h-28 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900">{transaction.book.judul}</h3>
                              <p className="text-sm text-gray-600 mt-1">Penulis: {transaction.book.penulis}</p>
                              <p className="text-sm text-gray-600">Penerbit: {transaction.book.penerbit}</p>

                              {/* User Info */}
                              <div className="mt-3 p-3 bg-blue-50 rounded">
                                <p className="text-sm font-semibold text-blue-900">Peminjam: {transaction.user.nama}</p>
                                <p className="text-xs text-blue-700">Username: {transaction.user.username}</p>
                              </div>
                            </div>
                          </div>

                          {/* Right Section - Status & Dates */}
                          <div className="md:text-right space-y-3">
                            {/* Status Badge */}
                            <div
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                              style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                            >
                              <StatusIcon className="w-4 h-4" />
                              <span className="font-semibold text-sm">{getStatusLabel(transaction.status)}</span>
                            </div>

                            {/* Dates */}
                            <div className="text-sm text-gray-600">
                              <p>Tanggal Pinjam: <span className="font-semibold text-gray-900">{formatDate(transaction.tanggalPinjam)}</span></p>
                              <p>Batas Kembali: <span className="font-semibold text-gray-900">{formatDate(transaction.batasKembali)}</span></p>
                              {transaction.tanggalKembali && (
                                <p>Tanggal Kembali: <span className="font-semibold text-gray-900">{formatDate(transaction.tanggalKembali)}</span></p>
                              )}
                            </div>

                            {/* Denda */}
                            {transaction.denda > 0 && (
                              <div className="text-sm">
                                <p>Denda: <span className="font-bold text-red-600">{formatCurrency(transaction.denda)}</span></p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    >
                      Sebelumnya
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    >
                      Selanjutnya
                    </Button>
                  </div>
                )}

                {/* Page Info */}
                {totalPages > 1 && (
                  <div className="text-center text-sm text-gray-600 mt-4">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
