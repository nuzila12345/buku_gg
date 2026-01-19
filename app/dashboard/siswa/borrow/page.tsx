'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, BookOpen } from 'lucide-react'

interface Book {
  id: string
  judul: string
  penulis: string
  penerbit: string
  tahunTerbit: number
  kategori: string
  jumlah: number
  deskripsi?: string
}

export default function BorrowPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [search, kategori, books])

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books')
      const data = await res.json()
      setBooks(data.books || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching books:', error)
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const getAvailableCount = (bookId: string, totalJumlah: number) => {
    const activeBorrows = transactions.filter(
      (t) => t.bookId === bookId && t.status === 'DIPINJAM'
    ).length
    return totalJumlah - activeBorrows
  }

  const filterBooks = () => {
    let filtered = books

    if (search) {
      filtered = filtered.filter(
        (book) =>
          book.judul.toLowerCase().includes(search.toLowerCase()) ||
          book.penulis.toLowerCase().includes(search.toLowerCase()) ||
          book.penerbit.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (kategori) {
      filtered = filtered.filter((book) =>
        book.kategori.toLowerCase().includes(kategori.toLowerCase())
      )
    }

    setFilteredBooks(filtered)
  }

  const handleBorrow = async (bookId: string) => {
    if (!confirm('Apakah Anda yakin ingin meminjam buku ini?')) return

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }

      alert('Buku berhasil dipinjam')
      fetchBooks()
      fetchTransactions()
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const categories = Array.from(new Set(books.map((b) => b.kategori)))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
            Peminjaman Buku
          </h1>
          <p className="text-muted-foreground mt-2">
            Pilih buku yang ingin Anda pinjam
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Buku Tersedia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cari buku..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada buku yang tersedia
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{book.judul}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {book.penulis}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#F5C16C' }}>
                          <BookOpen className="w-5 h-5" style={{ color: '#1A3D64' }} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Penerbit:</span> {book.penerbit}
                        </p>
                        <p>
                          <span className="font-medium">Tahun:</span> {book.tahunTerbit}
                        </p>
                        <p>
                          <span className="font-medium">Kategori:</span> {book.kategori}
                        </p>
                        <p>
                          <span className="font-medium">Tersedia:</span>{' '}
                          {getAvailableCount(book.id, book.jumlah)}
                        </p>
                        {book.deskripsi && (
                          <p className="text-muted-foreground line-clamp-2">
                            {book.deskripsi}
                          </p>
                        )}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleBorrow(book.id)}
                        disabled={getAvailableCount(book.id, book.jumlah) === 0}
                        style={{ backgroundColor: '#1A3D64' }}
                      >
                        {getAvailableCount(book.id, book.jumlah) === 0
                          ? 'Tidak Tersedia'
                          : 'Pinjam Buku'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

