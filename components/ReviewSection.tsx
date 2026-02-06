'use client'

import { useEffect, useState } from 'react'
import { Star, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Review {
  id: string
  bookId: string
  rating: number
  ulasan: string
  createdAt: string
  user: {
    id: string
    nama: string
    username: string
  }
}

interface ReviewSectionProps {
  bookId: string
  onReviewAdded?: () => void
}

export default function ReviewSection({ bookId, onReviewAdded }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [ulasan, setUlasan] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?bookId=${bookId}`)
      if (res.ok) {
        const data = await res.json()
        const allReviews = data.reviews || []
        
        // Filter hanya review untuk buku ini
        const bookReviews = allReviews.filter((r: Review) => r.bookId === bookId)
        setReviews(bookReviews)

        // Hitung rating rata-rata
        if (bookReviews.length > 0) {
          const avg =
            bookReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) /
            bookReviews.length
          setAverageRating(Math.round(avg * 10) / 10)
        } else {
          setAverageRating(0)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ulasan.trim()) {
      alert('Ulasan tidak boleh kosong')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          rating,
          ulasan,
        }),
      })

      if (res.ok) {
        setUlasan('')
        setRating(5)
        await fetchReviews()
        onReviewAdded?.()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menambahkan review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4"
                  fill={i < Math.round(averageRating) ? '#FFA500' : '#E5E7EB'}
                  color={i < Math.round(averageRating) ? '#FFA500' : '#E5E7EB'}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-gray-700 font-semibold mb-3">Distribusi Rating</p>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              return (
                <div key={stars} className="flex items-center gap-2 text-sm mb-1">
                  <span className="w-12">{stars} ⭐</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-600">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add Review Form */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Tulis Review
        </h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Rating Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className="w-8 h-8"
                    fill={star <= rating ? '#FFA500' : '#E5E7EB'}
                    color={star <= rating ? '#FFA500' : '#E5E7EB'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ulasan
            </label>
            <textarea
              value={ulasan}
              onChange={(e) => setUlasan(e.target.value)}
              placeholder="Bagikan pengalaman Anda membaca buku ini..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={submitting}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
            style={{ backgroundColor: '#1A3D64' }}
          >
            {submitting ? 'Mengirim...' : 'Kirim Review'}
          </Button>
        </form>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Review Pembaca ({reviews.length})
        </h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat review...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            Belum ada review untuk buku ini
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{review.user.nama}</p>
                    <p className="text-xs text-gray-500">@{review.user.username}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        fill={i < review.rating ? '#FFA500' : '#E5E7EB'}
                        color={i < review.rating ? '#FFA500' : '#E5E7EB'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-2">{review.ulasan}</p>
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
