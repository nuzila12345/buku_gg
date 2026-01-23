'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Star, Trash2, Edit, X } from 'lucide-react'

interface Review {
  id: string
  userId: string
  bookId: string
  rating: number
  ulasan: string
  createdAt: string
  updatedAt: string
  book: {
    id: string
    judul: string
    penulis: string
    gambar?: string
  }
  user: {
    id: string
    nama: string
    username: string
  }
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    bookId: '',
    rating: 5,
    ulasan: '',
  })
  const [bookSearch, setBookSearch] = useState('')
  const [bookSuggestions, setBookSuggestions] = useState<any[]>([])
  const [showBookSuggestions, setShowBookSuggestions] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      setReviews(data.reviews || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setLoading(false)
    }
  }

  const searchBooks = async (query: string) => {
    if (query.length < 2) {
      setBookSuggestions([])
      return
    }

    try {
      const res = await fetch('/api/books')
      const data = await res.json()
      const filtered = data.books.filter(
        (book: any) =>
          book.judul.toLowerCase().includes(query.toLowerCase()) ||
          book.penulis.toLowerCase().includes(query.toLowerCase())
      )
      setBookSuggestions(filtered)
    } catch (error) {
      console.error('Error searching books:', error)
    }
  }

  const handleBookSelect = (book: any) => {
    setSelectedBook(book)
    setFormData({ ...formData, bookId: book.id })
    setBookSuggestions([])
    setShowBookSuggestions(false)
    setBookSearch(`${book.judul} - ${book.penulis}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.bookId || !formData.rating || !formData.ulasan.trim()) {
      alert('Semua field harus diisi')
      return
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gagal menyimpan review')
        return
      }

      alert(editingReviewId ? 'Review berhasil diperbarui' : 'Review berhasil ditambahkan')
      resetForm()
      fetchReviews()
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus review ini?')) return

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus review')
        return
      }

      alert('Review berhasil dihapus')
      fetchReviews()
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const resetForm = () => {
    setFormData({
      bookId: '',
      rating: 5,
      ulasan: '',
    })
    setSelectedBook(null)
    setBookSearch('')
    setEditingReviewId(null)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange?.(star)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer' : ''}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } ${interactive ? 'hover:text-yellow-400 hover:fill-yellow-400 transition' : ''}`}
            />
          </button>
        ))}
      </div>
    )
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
            Review & Rating Buku
          </h1>
          <p className="text-muted-foreground mt-2">
            Bagikan ulasan dan rating untuk buku yang sudah Anda baca
          </p>
        </div>

        {/* Stats Card */}
        <Card className="border-2" style={{ borderColor: '#38BDF8' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Review</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{reviews.length}</p>
                <p className="text-xs text-gray-500 mt-1">review yang dibuat</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Rating Rata-rata</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-2xl font-bold text-yellow-500">{avgRating}</p>
                  <div>{renderStars(Math.round(parseFloat(avgRating)))}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Tambah Review */}
        <Card className="border-2" style={{ borderColor: '#38BDF8' }}>
          <CardHeader>
            <CardTitle>Tulis Review Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Search Buku */}
              <div>
                <label className="text-sm font-medium">Pilih Buku *</label>
                <div className="relative mt-2">
                  <Input
                    placeholder="Cari buku..."
                    value={bookSearch}
                    onChange={(e) => {
                      setBookSearch(e.target.value)
                      searchBooks(e.target.value)
                      setShowBookSuggestions(true)
                    }}
                    onFocus={() => setShowBookSuggestions(true)}
                  />

                  {showBookSuggestions && bookSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-lg mt-1 shadow-lg max-h-64 overflow-y-auto">
                      {bookSuggestions.map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => handleBookSelect(book)}
                          className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-b-0 flex gap-3"
                        >
                          {book.gambar && (
                            <img
                              src={book.gambar}
                              alt={book.judul}
                              className="w-10 h-14 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{book.judul}</p>
                            <p className="text-xs text-gray-600">{book.penulis}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedBook && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedBook.gambar && (
                        <img
                          src={selectedBook.gambar}
                          alt={selectedBook.judul}
                          className="w-10 h-14 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-sm">{selectedBook.judul}</p>
                        <p className="text-xs text-gray-600">{selectedBook.penulis}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBook(null)
                        setBookSearch('')
                        setFormData({ ...formData, bookId: '' })
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium">Rating *</label>
                <div className="mt-3">
                  {renderStars(formData.rating, true, (rating) =>
                    setFormData({ ...formData, rating })
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    {formData.rating}/5 Bintang
                  </p>
                </div>
              </div>

              {/* Ulasan */}
              <div>
                <label className="text-sm font-medium">Ulasan *</label>
                <textarea
                  value={formData.ulasan}
                  onChange={(e) =>
                    setFormData({ ...formData, ulasan: e.target.value })
                  }
                  placeholder="Bagikan pengalaman Anda membaca buku ini..."
                  className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={4}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  style={{ backgroundColor: '#1A3D64' }}
                >
                  {editingReviewId ? 'Perbarui Review' : 'Kirim Review'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Daftar Review */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Review Saya</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Memuat review...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Belum ada review</p>
                <p className="text-sm text-gray-500 mt-1">Mulai buat review untuk buku yang Anda baca</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      {/* Buku Info */}
                      <div className="flex gap-4 flex-1">
                        {review.book.gambar && (
                          <img
                            src={review.book.gambar}
                            alt={review.book.judul}
                            className="w-16 h-24 object-cover rounded border"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {review.book.judul}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {review.book.penulis}
                          </p>
                          <div className="mt-2">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Ulasan */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-gray-700">{review.ulasan}</p>
                    </div>

                    {/* Tanggal */}
                    <p className="text-xs text-gray-500">
                      Diposting pada {formatDate(review.createdAt)}
                      {review.updatedAt !== review.createdAt && (
                        <span> • Diperbarui pada {formatDate(review.updatedAt)}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
