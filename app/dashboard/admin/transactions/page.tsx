'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, BookCheck, Trash2, User, Calendar, AlertCircle } from 'lucide-react'

interface Transaction {
  id: string
  user: { id: string; username: string; nama: string }
  book: { id: string; judul: string }
  tanggalPinjam: string
  tanggalKembali?: string
  batasKembali: string
  status: string
  denda: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, transactions])

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

    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.user.nama.toLowerCase().includes(search.toLowerCase()) ||
          t.user.username.toLowerCase().includes(search.toLowerCase()) ||
          t.book.judul.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    setFilteredTransactions(filtered)
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }

      await fetchTransactions()
      alert('Status transaksi berhasil diupdate')
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }
      await fetchTransactions()
      alert('Transaksi berhasil dihapus')
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  // Color palette - Teal
  const colorPalette = {
    primary: '#4FD3C4',      // Teal bright
    dark: '#0F766E',         // Teal dark
    light: '#F0FDFB',        // Mint very light
    accent: '#2DD4BF',       // Teal medium
    lightAccent: '#CCFBF1',  // Teal very light
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DIPINJAM':
        return { bg: '#4FD3C4', text: '#FFFFFF' }
      case 'DIKEMBALIKAN':
        return { bg: '#22C55E', text: '#FFFFFF' }
      case 'TERLAMBAT':
        return { bg: '#EF4444', text: '#FFFFFF' }
      default:
        return { bg: colorPalette.lightAccent, text: colorPalette.dark }
    }
  }

  const isOverdue = (batasKembali: string, status: string) => {
    return status === 'DIPINJAM' && new Date(batasKembali) < new Date()
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colorPalette.dark }}>
            📋 Kelola Transaksi
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola semua transaksi peminjaman dan pengembalian buku
          </p>
        </div>

        <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
          <CardHeader>
            <CardTitle style={{ color: colorPalette.dark }}>📝 Daftar Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari transaksi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  style={{ borderColor: colorPalette.accent }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-md"
                style={{ borderColor: colorPalette.accent, color: colorPalette.dark }}
              >
                <option value="">Semua Status</option>
                <option value="DIPINJAM">Dipinjam</option>
                <option value="DIKEMBALIKAN">Dikembalikan</option>
                <option value="TERLAMBAT">Terlambat</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada transaksi
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {paginatedTransactions.map((transaction) => {
                    const statusColor = getStatusColor(transaction.status)
                    const overdue = isOverdue(transaction.batasKembali, transaction.status)
                    
                    return (
                      <Card key={transaction.id} className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg" style={{ color: colorPalette.dark }}>
                                {transaction.book.judul}
                              </CardTitle>
                              <div className="flex items-center mt-2 space-x-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <p className="text-sm text-gray-600">
                                  {transaction.user.nama}
                                </p>
                              </div>
                            </div>
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: statusColor.bg }}
                            >
                              <BookCheck 
                                className="w-5 h-5" 
                                style={{ color: statusColor.text }}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="font-medium" style={{ color: colorPalette.dark }}>Tanggal Pinjam:</p>
                                <p className="text-gray-600">
                                  {new Date(transaction.tanggalPinjam).toLocaleDateString('id-ID')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="font-medium" style={{ color: colorPalette.dark }}>Batas Kembali:</p>
                                <div className="flex items-center space-x-2">
                                  <p className="text-gray-600">
                                    {new Date(transaction.batasKembali).toLocaleDateString('id-ID')}
                                  </p>
                                  {overdue && (
                                    <AlertCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                                  )}
                                </div>
                              </div>
                            </div>
                            {transaction.tanggalKembali && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="font-medium" style={{ color: colorPalette.dark }}>Tanggal Kembali:</p>
                                  <p className="text-gray-600">
                                    {new Date(transaction.tanggalKembali).toLocaleDateString('id-ID')}
                                  </p>
                                </div>
                              </div>
                            )}
                            {transaction.denda > 0 && (
                              <div>
                                <p className="font-medium" style={{ color: colorPalette.dark }}>Denda:</p>
                                <p className="text-sm" style={{ color: '#EF4444' }}>
                                  Rp {transaction.denda.toLocaleString('id-ID')}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium text-white"
                              style={{ 
                                backgroundColor: statusColor.bg
                              }}
                            >
                              {transaction.status}
                            </span>
                          </div>
                          <div className="flex space-x-2 pt-2 border-t">
                            {transaction.status === 'DIPINJAM' && (
                              <Button
                                variant="outline"
                                className="flex-1 text-xs"
                                onClick={() =>
                                  handleUpdateStatus(transaction.id, 'DIKEMBALIKAN')
                                }
                                style={{ borderColor: '#22C55E', color: '#22C55E' }}
                              >
                                <BookCheck className="w-4 h-4 mr-1" />
                                Kembalikan
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(transaction.id)}
                              style={{ borderColor: '#EF4444', color: '#EF4444' }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col items-center justify-center space-y-4 mt-8 pt-6 border-t">
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={{ borderColor: colorPalette.primary, color: colorPalette.dark }}
                      className="text-sm"
                    >
                      ← Sebelumnya
                    </Button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10"
                          style={currentPage === page ? { backgroundColor: colorPalette.primary, color: 'white' } : { borderColor: colorPalette.accent, color: colorPalette.dark }}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      style={{ borderColor: colorPalette.primary, color: colorPalette.dark }}
                      className="text-sm"
                    >
                      Selanjutnya →
                    </Button>
                  </div>

                  <div className="text-sm font-medium" style={{ color: colorPalette.dark }}>
                    Halaman {currentPage} dari {totalPages} (Total: {filteredTransactions.length})
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
