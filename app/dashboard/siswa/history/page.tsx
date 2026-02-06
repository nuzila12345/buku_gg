'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
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

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'SEMUA' | 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT'>('SEMUA')
  const [returningBookId, setReturningBookId] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleReturnBook = async (transactionId: string) => {
    if (!confirm('Apakah Anda yakin ingin mengembalikan buku ini?')) return

    setReturningBookId(transactionId)

    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DIKEMBALIKAN' }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gagal mengembalikan buku')
        return
      }

      alert('Buku berhasil dikembalikan')
      fetchTransactions()
    } catch (error) {
      alert('Terjadi kesalahan')
    } finally {
      setReturningBookId(null)
    }
  }

  const calculateDaysUntilDue = (batasKembali: string) => {
    const today = new Date()
    const dueDate = new Date(batasKembali)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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

  // Hitung statistik
  const statusDipinjam = transactions.filter((t) => t.status === 'DIPINJAM').length
  const statusDikembalikan = transactions.filter((t) => t.status === 'DIKEMBALIKAN').length
  const statusTerlambat = transactions.filter((t) => t.status === 'TERLAMBAT').length
  const totalDenda = transactions.reduce((sum, t) => sum + (t.denda || 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#0F766E' }}>
            Riwayat Peminjaman
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola dan lihat riwayat peminjaman buku Anda
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Peminjaman */}
          <Card className="border-2" style={{ borderColor: '#38BDF8' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Peminjaman</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {transactions.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#CFFAFE' }}>
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sedang Dipinjam */}
          <Card className="border-2" style={{ borderColor: '#F59E0B' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Sedang Dipinjam</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">
                    {statusDipinjam}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sudah Dikembalikan */}
          <Card className="border-2" style={{ borderColor: '#10B981' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Sudah Dikembalikan</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {statusDikembalikan}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terlambat */}
          <Card className="border-2" style={{ borderColor: '#EF4444' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Terlambat</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {statusTerlambat}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Peminjaman</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <Button
                variant={filterStatus === 'SEMUA' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('SEMUA')}
                style={filterStatus === 'SEMUA' ? { backgroundColor: '#0F766E' } : {}}
              >
                Semua ({transactions.length})
              </Button>
              <Button
                variant={filterStatus === 'DIPINJAM' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('DIPINJAM')}
                style={filterStatus === 'DIPINJAM' ? { backgroundColor: '#0F766E' } : {}}
              >
                Sedang Dipinjam ({statusDipinjam})
              </Button>
              <Button
                variant={filterStatus === 'DIKEMBALIKAN' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('DIKEMBALIKAN')}
                style={filterStatus === 'DIKEMBALIKAN' ? { backgroundColor: '#0F766E' } : {}}
              >
                Sudah Dikembalikan ({statusDikembalikan})
              </Button>
              <Button
                variant={filterStatus === 'TERLAMBAT' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('TERLAMBAT')}
                style={filterStatus === 'TERLAMBAT' ? { backgroundColor: '#0F766E' } : {}}
              >
                Terlambat ({statusTerlambat})
              </Button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-8">Memuat data peminjaman...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {filterStatus === 'SEMUA'
                    ? 'Tidak ada riwayat peminjaman'
                    : `Tidak ada peminjaman dengan status "${getStatusLabel(filterStatus)}"`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => {
                  const statusInfo = getStatusColor(transaction.status)
                  const StatusIcon = statusInfo.icon
                  const daysUntilDue = calculateDaysUntilDue(transaction.batasKembali)
                  const isOverdue = daysUntilDue < 0

                  return (
                    <div
                      key={transaction.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      style={{ borderColor: statusInfo.border }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Informasi Buku */}
                        <div className="md:col-span-2">
                          <div className="flex gap-4">
                            {/* Gambar */}
                            {transaction.book.gambar && (
                              <div className="hidden sm:block">
                                <Image
                                  src={transaction.book.gambar}
                                  alt={transaction.book.judul}
                                  width={64}
                                  height={96}
                                  className="w-16 h-24 object-cover rounded border"
                                />
                              </div>
                            )}

                            {/* Detail Buku */}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">
                                {transaction.book.judul}
                              </h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">Penulis:</span> {transaction.book.penulis}
                                </p>
                                <p>
                                  <span className="font-medium">Penerbit:</span> {transaction.book.penerbit}
                                </p>
                                {transaction.book.isbn && (
                                  <p>
                                    <span className="font-medium">ISBN:</span> {transaction.book.isbn}
                                  </p>
                                )}
                              </div>

                              {/* Status Badge */}
                              <div className="mt-3 flex items-center gap-2">
                                <StatusIcon className="w-4 h-4" style={{ color: statusInfo.text }} />
                                <span
                                  className="text-xs font-semibold px-3 py-1 rounded-full"
                                  style={{
                                    backgroundColor: statusInfo.bg,
                                    color: statusInfo.text,
                                  }}
                                >
                                  {getStatusLabel(transaction.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Informasi Tanggal & Tombol */}
                        <div>
                          <div className="space-y-3 h-full flex flex-col justify-between">
                            {/* Timeline Info */}
                            <div className="bg-gray-50 p-3 rounded border space-y-2 text-sm">
                              <div>
                                <p className="text-gray-600 font-medium">Tanggal Pinjam</p>
                                <p className="font-semibold">{formatDate(transaction.tanggalPinjam)}</p>
                              </div>
                              <div className="border-t pt-2">
                                <p className="text-gray-600 font-medium">Jatuh Tempo</p>
                                <p className="font-semibold">{formatDate(transaction.batasKembali)}</p>
                                {transaction.status === 'DIPINJAM' && (
                                  <p className={`text-xs mt-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                                    {isOverdue
                                      ? `Telat ${Math.abs(daysUntilDue)} hari`
                                      : `${daysUntilDue} hari tersisa`}
                                  </p>
                                )}
                              </div>

                              {transaction.tanggalKembali && (
                                <div className="border-t pt-2">
                                  <p className="text-gray-600 font-medium">Tanggal Kembali</p>
                                  <p className="font-semibold">{formatDate(transaction.tanggalKembali)}</p>
                                </div>
                              )}

                              {transaction.denda > 0 && (
                                <div className="border-t pt-2 bg-red-50 -mx-3 -my-3 px-3 py-2 rounded">
                                  <p className="text-red-600 font-medium text-xs">DENDA</p>
                                  <p className="font-bold text-red-600">{formatCurrency(transaction.denda)}</p>
                                </div>
                              )}
                            </div>

                            {/* Return Button */}
                            {transaction.status === 'DIPINJAM' && (
                              <Button
                                className="w-full"
                                onClick={() => handleReturnBook(transaction.id)}
                                disabled={returningBookId === transaction.id}
                                style={{ backgroundColor: '#1A3D64' }}
                              >
                                {returningBookId === transaction.id ? 'Mengembalikan...' : 'Kembalikan Buku'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
