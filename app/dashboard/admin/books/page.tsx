'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, BookOpen, X } from 'lucide-react'

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
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState({
    judul: '',
    penulis: '',
    penerbit: '',
    tahunTerbit: '',
    isbn: '',
    kategori: '',
    jumlah: '',
    deskripsi: '',
  })

  useEffect(() => {
    fetchBooks()
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
    })
    setShowForm(true)
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
    })
    setEditingBook(null)
    setShowForm(false)
  }

  const categories = Array.from(new Set(books.map((b) => b.kategori)))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
              Kelola Data Buku
            </h1>
            <p className="text-muted-foreground mt-2">
              Kelola data buku perpustakaan
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: '#1A3D64' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Buku
          </Button>
        </div>

        {showForm && (
          <Card className="border-2" style={{ borderColor: '#38BDF8' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Judul *</label>
                    <Input
                      value={formData.judul}
                      onChange={(e) =>
                        setFormData({ ...formData, judul: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Penulis *</label>
                    <Input
                      value={formData.penulis}
                      onChange={(e) =>
                        setFormData({ ...formData, penulis: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Penerbit *</label>
                    <Input
                      value={formData.penerbit}
                      onChange={(e) =>
                        setFormData({ ...formData, penerbit: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tahun Terbit *</label>
                    <Input
                      type="number"
                      value={formData.tahunTerbit}
                      onChange={(e) =>
                        setFormData({ ...formData, tahunTerbit: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">ISBN</label>
                    <Input
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData({ ...formData, isbn: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Kategori *</label>
                    <Input
                      value={formData.kategori}
                      onChange={(e) =>
                        setFormData({ ...formData, kategori: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Jumlah *</label>
                    <Input
                      type="number"
                      value={formData.jumlah}
                      onChange={(e) =>
                        setFormData({ ...formData, jumlah: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deskripsi</label>
                    <Input
                      value={formData.deskripsi}
                      onChange={(e) =>
                        setFormData({ ...formData, deskripsi: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="submit"
                    style={{ backgroundColor: '#1A3D64' }}
                  >
                    {editingBook ? 'Update' : 'Tambah'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Daftar Buku</CardTitle>
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
                          <span className="font-medium">Jumlah:</span> {book.jumlah}
                        </p>
                        {book.isbn && (
                          <p>
                            <span className="font-medium">ISBN:</span> {book.isbn}
                          </p>
                        )}
                        {book.deskripsi && (
                          <p className="text-muted-foreground line-clamp-2">
                            {book.deskripsi}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEdit(book)}
                          style={{ borderColor: '#38BDF8', color: '#38BDF8' }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDelete(book.id)}
                          style={{ borderColor: '#EF4444', color: '#EF4444' }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
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
