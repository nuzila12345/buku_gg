'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, BookOpen, Eye, X } from 'lucide-react'

interface Book {
  id: string
  judul: string
  penulis: string
  penerbit: string
  tahunTerbit: number
  kategori: string
  jumlah: number
  deskripsi?: string
  gambar?: string
  isbn?: string
}

export default function BorrowPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3)

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
    setCurrentPage(1) // Reset to first page when filtering
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

  // Pagination calculation
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex)

  const handleViewDetail = (book: Book) => {
    setSelectedBook(book)
    setShowDetail(true)
  }

  // Modal Detail Buku
  const DetailBookModal = ({ book, isOpen, onClose }: { book: Book | null; isOpen: boolean; onClose: () => void }) => {
    if (!isOpen || !book) return null

    const isAvailable = getAvailableCount(book.id, book.jumlah) > 0
    const coverImage = book.gambar || 'https://images.unsplash.com/photo-150784272343-583f20270319?w=400&h=500&fit=crop'

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
          <div className="sticky top-0 bg-white border-b flex items-center justify-between p-6">
            <h2 className="text-2xl font-bold" style={{ color: '#1A3D64' }}>
              Detail Buku
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Gambar dan Info Dasar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cover Buku */}
              <div className="col-span-1">
                <div className="rounded-lg overflow-hidden shadow-md mb-4">
                  <img
                    src={coverImage}
                    alt={book.judul}
                    className="w-full h-64 object-cover"
                  />
                </div>
                {/* Badge Status */}
                <div className="flex gap-2">
                  {isAvailable ? (
                    <div className="flex-1 bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium text-center text-sm">
                      ✓ Tersedia
                    </div>
                  ) : (
                    <div className="flex-1 bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium text-center text-sm">
                      ✗ Habis
                    </div>
                  )}
                </div>
              </div>

              {/* Informasi Detail */}
              <div className="col-span-1 md:col-span-2 space-y-4">
                {/* Judul */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Judul Buku
                  </h3>
                  <p className="text-xl font-bold mt-1">{book.judul}</p>
                </div>

                {/* Penulis */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Penulis
                  </h3>
                  <p className="text-lg mt-1">{book.penulis}</p>
                </div>

                {/* Penerbit */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Penerbit
                  </h3>
                  <p className="text-lg mt-1">{book.penerbit}</p>
                </div>

                {/* Tahun Terbit */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Tahun Terbit
                  </h3>
                  <p className="text-lg mt-1">{book.tahunTerbit}</p>
                </div>

                {/* Kategori */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Kategori
                  </h3>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mt-1">
                    {book.kategori}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-6" />

            {/* Info Tambahan */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* ISBN */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase">ISBN</p>
                <p className="font-semibold mt-1 text-sm">{book.isbn || 'N/A'}</p>
              </div>

              {/* Stok */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase">Stok</p>
                <p className="font-semibold mt-1 text-lg" style={{ color: isAvailable ? '#10B981' : '#EF4444' }}>
                  {getAvailableCount(book.id, book.jumlah)}
                </p>
              </div>

              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <p className={`font-semibold mt-1 text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {isAvailable ? 'Tersedia' : 'Habis'}
                </p>
              </div>

              {/* Kategori Badge */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase">Tipe</p>
                <p className="font-semibold mt-1 text-sm text-blue-600">Buku</p>
              </div>
            </div>

            {/* Deskripsi */}
            {book.deskripsi && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Deskripsi / Sinopsis
                </h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {book.deskripsi}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                style={{ borderColor: '#9CA3AF', color: '#4B5563' }}
              >
                Tutup
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  handleBorrow(book.id)
                  onClose()
                }}
                disabled={!isAvailable}
                style={{ backgroundColor: isAvailable ? '#1A3D64' : '#9CA3AF' }}
              >
                {isAvailable ? 'Pinjam Buku' : 'Tidak Tersedia'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedBooks.map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Gambar Cover Buku */}
                    <div className="relative h-40 bg-gray-200 overflow-hidden">
                      <img
                        src={book.gambar || 'https://images.unsplash.com/photo-150784272343-583f20270319?w=300&h=300&fit=crop'}
                        alt={book.judul}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge Stok */}
                      <div className="absolute top-2 right-2">
                        {getAvailableCount(book.id, book.jumlah) > 0 ? (
                          <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Tersedia ({getAvailableCount(book.id, book.jumlah)})
                          </div>
                        ) : (
                          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Habis
                          </div>
                        )}
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{book.judul}</CardTitle>
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
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleViewDetail(book)}
                            style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => handleBorrow(book.id)}
                            disabled={getAvailableCount(book.id, book.jumlah) === 0}
                            style={{ backgroundColor: '#1A3D64' }}
                          >
                            {getAvailableCount(book.id, book.jumlah) === 0
                              ? 'Tidak Tersedia'
                              : 'Pinjam Buku'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 font-medium">
                      Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredBooks.length)} dari {filteredBooks.length} buku
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      >
                        ← Sebelumnya
                      </Button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            size="sm"
                            variant={currentPage === page ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(page)}
                            style={currentPage === page ? { backgroundColor: '#1A3D64' } : {}}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      >
                        Selanjutnya →
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Detail Buku */}
      <DetailBookModal
        book={selectedBook}
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false)
          setSelectedBook(null)
        }}
      />
    </DashboardLayout>
  )
}

