'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, BookCheck, AlertCircle } from 'lucide-react'

interface Transaction {
  id: string
  book: { id: string; judul: string; penulis: string }
  tanggalPinjam: string
  batasKembali: string
  status: string
  denda: number
}

export default function ReturnPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [search, transactions])

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      const activeBorrows = (data.transactions || []).filter(
        (t: Transaction) => t.status === 'DIPINJAM'
      )
      setTransactions(activeBorrows)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (search) {
      filtered = filtered.filter((t) =>
        t.book.judul.toLowerCase().includes(search.toLowerCase()) ||
        t.book.penulis.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
  }

  const handleReturn = async (transactionId: string) => {
    if (!confirm('Apakah Anda yakin ingin mengembalikan buku ini?')) return

    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DIKEMBALIKAN' }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }

      alert('Buku berhasil dikembalikan')
      fetchTransactions()
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const isOverdue = (batasKembali: string) => {
    return new Date(batasKembali) < new Date()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
            Pengembalian Buku
          </h1>
          <p className="text-muted-foreground mt-2">
            Kembalikan buku yang sedang Anda pinjam
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buku yang Sedang Dipinjam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cari buku..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul Buku</TableHead>
                    <TableHead>Penulis</TableHead>
                    <TableHead>Tanggal Pinjam</TableHead>
                    <TableHead>Batas Kembali</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Tidak ada buku yang sedang dipinjam
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => {
                      const overdue = isOverdue(transaction.batasKembali)
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.book.judul}
                          </TableCell>
                          <TableCell>{transaction.book.penulis}</TableCell>
                          <TableCell>
                            {new Date(transaction.tanggalPinjam).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>
                                {new Date(transaction.batasKembali).toLocaleDateString('id-ID')}
                              </span>
                              {overdue && (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {overdue ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
                                Terlambat
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#38BDF820', color: '#1A3D64' }}>
                                Aktif
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReturn(transaction.id)}
                              style={{ borderColor: '#22C55E', color: '#22C55E' }}
                            >
                              <BookCheck className="w-4 h-4 mr-2" />
                              Kembalikan
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

