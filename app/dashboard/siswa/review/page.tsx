'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
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
          <h1 className="text-3xl font-bold" style={{ color: '#0F766E' }}>
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
                          <Image
                            src={review.book.gambar}
                            alt={review.book.judul}
                            width={64}
                            height={96}
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
