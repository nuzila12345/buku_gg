'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, BookOpen, X, Eye } from 'lucide-react'

interface Book {
  id: string
  judul: string
  penulis: string
  penerbit: string
  tahunTerbit: number
  isbn?: string
  kategori: string
  jumlah: number
  deskripsi?: string
  gambar?: string
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6) // Increased from 3 for smaller cards
  
  // Color palette - Teal
  const colorPalette = {
    primary: '#4FD3C4',      // Teal bright
    dark: '#0F766E',         // Teal dark
    light: '#F0FDFB',        // Mint very light
    accent: '#2DD4BF',       // Teal medium
    lightAccent: '#CCFBF1',  // Teal very light
  }

  const [formData, setFormData] = useState({
    judul: '',
    penulis: '',
    penerbit: '',
    tahunTerbit: '',
    isbn: '',
    kategori: '',
    jumlah: '',
    deskripsi: '',
    gambar: '',
  })

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    filterBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const filterBooks = () => {
    let filtered = books

    if (search) {
      filtered = filtered.filter(
        (book) =>
          book.judul.toLowerCase().includes(search.toLowerCase()) ||
          book.penulis.toLowerCase().includes(search.toLowerCase()) ||
          book.penerbit.toLowerCase().includes(search.toLowerCase()) ||
          book.isbn?.toLowerCase().includes(search.toLowerCase())
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingBook
        ? `/api/books/${editingBook.id}`
        : '/api/books'
      const method = editingBook ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }

      await fetchBooks()
      resetForm()
      alert(editingBook ? 'Buku berhasil diupdate' : 'Buku berhasil ditambahkan')
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData({
      judul: book.judul,
      penulis: book.penulis,
      penerbit: book.penerbit,
      tahunTerbit: book.tahunTerbit.toString(),
      isbn: book.isbn || '',
      kategori: book.kategori,
      jumlah: book.jumlah.toString(),
      deskripsi: book.deskripsi || '',
      gambar: book.gambar || '',
    })
    setShowForm(true)
  }

  const handleViewDetail = (book: Book) => {
    setSelectedBook(book)
    setShowDetail(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus buku ini?')) return

    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }
      await fetchBooks()
      alert('Buku berhasil dihapus')
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const resetForm = () => {
    setFormData({
      judul: '',
      penulis: '',
      penerbit: '',
      tahunTerbit: '',
      isbn: '',
      kategori: '',
      jumlah: '',
      deskripsi: '',
      gambar: '',
    })
    setEditingBook(null)
    setShowForm(false)
    setShowDetail(false)
    setSelectedBook(null)
  }

  const categories = Array.from(new Set(books.map((b) => b.kategori)))

  // Pagination calculation
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex)

  // Modal Detail Buku
  const DetailBookModal = ({ book, isOpen, onClose }: { book: Book | null; isOpen: boolean; onClose: () => void }) => {
    if (!isOpen || !book) return null

    const isAvailable = book.jumlah > 0
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
                  <Image
                    src={coverImage}
                    alt={book.judul}
                    width={300}
                    height={400}
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
                  {book.jumlah}
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
                style={{ backgroundColor: '#1A3D64' }}
              >
                Pinjam Buku
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colorPalette.dark }}>
              📚 Kelola Data Buku
            </h1>
            <p className="text-gray-600">
              Kelola data buku perpustakaan dengan mudah
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="text-white font-semibold transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: colorPalette.primary }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Buku
          </Button>
        </div>

        {showForm && (
          <Card className="border-glow card-3d hover-lift" style={{ borderColor: colorPalette.accent, backgroundColor: colorPalette.lightAccent }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle style={{ color: colorPalette.dark }}>
                {editingBook ? '✏️ Edit Buku' : '➕ Tambah Buku Baru'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="hover:bg-red-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Judul *</label>
                    <Input
                      value={formData.judul}
                      onChange={(e) =>
                        setFormData({ ...formData, judul: e.target.value })
                      }
                      required
                      className="mt-1"
                      style={{ borderColor: colorPalette.accent }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Penulis *</label>
                    <Input
                      value={formData.penulis}
                      onChange={(e) =>
                        setFormData({ ...formData, penulis: e.target.value })
                      }
                      required
                      className="mt-1"
                      style={{ borderColor: colorPalette.accent }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Penerbit *</label>
                    <Input
                      value={formData.penerbit}
                      onChange={(e) =>
                        setFormData({ ...formData, penerbit: e.target.value })
                      }
                      required
                      className="mt-1"
                      style={{ borderColor: colorPalette.accent }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Tahun Terbit *</label>
                    <Input
                      type="number"
                      value={formData.tahunTerbit}
                      onChange={(e) =>
                        setFormData({ ...formData, tahunTerbit: e.target.value })
                      }
                      required
                      className="mt-1"
                      style={{ borderColor: colorPalette.accent }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>ISBN</label>
                    <Input
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData({ ...formData, isbn: e.target.value })
                      }
                      className="mt-1"
                      style={{ borderColor: colorPalette.accent }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Gambar Buku</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              setFormData({
                                ...formData,
                                gambar: event.target?.result as string,
                              })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      {formData.gambar && (
                        <Image
                          src={formData.gambar}
                          alt="Preview"
                          width={48}
                          height={64}
                          className="w-12 h-16 object-cover rounded border"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Kategori *</label>
                    <Input
                      value={formData.kategori}
                      onChange={(e) =>
                        setFormData({ ...formData, kategori: e.target.value })
                      }
                      required
                      className="mt-1"
                      style={{ borderColor: colorPalette.accent }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Jumlah *</label>
                    <Input
                      type="number"
                      value={formData.jumlah}
                      onChange={(e) =>
                        setFormData({ ...formData, jumlah: e.target.value })
                      }
                      required
                      className="mt-1"
                      style={{ borderColor: colorPalette.accent }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: colorPalette.dark }}>Deskripsi</label>
                    <Input
                      value={formData.deskripsi}
                      onChange={(e) =>
                        setFormData({ ...formData, deskripsi: e.target.value })
                      }
                      className="mt-1"
                      style={{ borderColor: colorPalette.accent }}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="submit"
                    className="text-white font-semibold"
                    style={{ backgroundColor: colorPalette.primary }}
                  >
                    {editingBook ? 'Update' : 'Tambah'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} style={{ borderColor: colorPalette.accent }}>
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-glow card-3d hover-lift" style={{ backgroundColor: colorPalette.lightAccent }}>
          <CardHeader>
            <CardTitle style={{ color: colorPalette.dark }}>📖 Daftar Buku</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari buku..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 focus:ring-2 focus:ring-opacity-50"
                  style={{ borderColor: colorPalette.accent, '--tw-ring-color': colorPalette.accent } as any}
                />
              </div>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="px-4 py-2 border rounded-md transition-colors"
                style={{ borderColor: colorPalette.accent, color: colorPalette.dark }}
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
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: colorPalette.primary }}></div>
                <p className="mt-4 text-gray-600">Memuat data buku...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-muted-foreground text-lg">Tidak ada buku yang tersedia</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {paginatedBooks.map((book) => (
                    <Card key={book.id} className="border-glow card-3d hover-lift h-full overflow-hidden flex flex-col" style={{ backgroundColor: colorPalette.lightAccent }}>
                      {/* Gambar Cover Buku */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <Image
                          src={book.gambar || 'https://images.unsplash.com/photo-150784272343-583f20270319?w=300&h=400&fit=crop'}
                          alt={book.judul}
                          width={300}
                          height={400}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        {/* Badge Stok */}
                        <div className="absolute top-2 right-2">
                          {book.jumlah > 0 ? (
                            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
                              ✓ Tersedia ({book.jumlah})
                            </div>
                          ) : (
                            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
                              ✗ Habis
                            </div>
                          )}
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm line-clamp-2" style={{ color: colorPalette.dark }}>
                              {book.judul}
                            </CardTitle>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {book.penulis}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: colorPalette.accent }}>
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3 text-xs">
                        <div className="space-y-1">
                          <p className="text-gray-700">
                            <span className="font-semibold" style={{ color: colorPalette.dark }}>Penerbit:</span> {book.penerbit}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold" style={{ color: colorPalette.dark }}>Tahun:</span> {book.tahunTerbit}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold" style={{ color: colorPalette.dark }}>Kategori:</span> {book.kategori}
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-8"
                            onClick={() => handleViewDetail(book)}
                            style={{ borderColor: colorPalette.accent, color: colorPalette.dark }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Lihat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-8"
                            onClick={() => handleEdit(book)}
                            style={{ borderColor: colorPalette.primary, color: colorPalette.primary }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs h-8"
                          onClick={() => handleDelete(book.id)}
                          style={{ borderColor: '#EF4444', color: '#EF4444' }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Hapus
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls - Centered */}
                <div className="mt-10 pt-6 border-t" style={{ borderColor: colorPalette.accent }}>
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-sm text-gray-600 font-medium">
                      Menampilkan <span style={{ color: colorPalette.primary, fontWeight: 'bold' }}>{startIndex + 1}</span> - <span style={{ color: colorPalette.primary, fontWeight: 'bold' }}>{Math.min(endIndex, filteredBooks.length)}</span> dari <span style={{ color: colorPalette.primary, fontWeight: 'bold' }}>{filteredBooks.length}</span> buku
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        style={{ 
                          borderColor: currentPage === 1 ? '#d1d5db' : colorPalette.accent,
                          color: currentPage === 1 ? '#9ca3af' : colorPalette.primary
                        }}
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
                            className={currentPage === page ? 'text-white font-semibold' : ''}
                            style={{
                              backgroundColor: currentPage === page ? colorPalette.primary : 'transparent',
                              borderColor: colorPalette.accent,
                              color: currentPage === page ? 'white' : colorPalette.dark
                            }}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        style={{ 
                          borderColor: currentPage === totalPages ? '#d1d5db' : colorPalette.accent,
                          color: currentPage === totalPages ? '#9ca3af' : colorPalette.primary
                        }}
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
