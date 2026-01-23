'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">📚 Sistem Peminjaman Buku</h1>
            </div>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Masuk
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Selamat Datang
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Sistem Peminjaman dan Pengembalian Buku Digital
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg">
                Masuk Sekarang
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Daftar
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">📖</div>
              <CardTitle>Peminjaman Buku</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Pinjam buku favorit Anda dengan mudah melalui sistem digital kami yang cepat dan efisien.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">↩️</div>
              <CardTitle>Pengembalian Buku</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Kembalikan buku dengan mudah dan pantau status pengembalian Anda secara real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">⭐</div>
              <CardTitle>Review & Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Bagikan pendapat Anda tentang buku-buku yang telah Anda baca dengan rating dan review.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">🏷️</div>
              <CardTitle>QR Code Scanning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Scan QR code untuk peminjaman dan pengembalian buku yang lebih cepat dan akurat.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">📊</div>
              <CardTitle>Statistik Peminjaman</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Lihat statistik peminjaman Anda dan analisis kebiasaan membaca Anda.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">⚠️</div>
              <CardTitle>Tracker Denda</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Pantau denda keterlambatan Anda dan kelola pembayaran dengan mudah.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <div className="mt-20 bg-white rounded-lg shadow-lg p-12 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Siap untuk memulai?
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Bergabunglah dengan sistem peminjaman buku digital kami dan nikmati kemudahan akses ke berbagai koleksi buku.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-10 py-6 text-lg">
                Masuk ke Akun Anda
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="px-10 py-6 text-lg">
                Buat Akun Baru
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Tentang Kami</h4>
              <p className="text-gray-400">
                Sistem peminjaman buku digital untuk sekolah dan perpustakaan modern.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Fitur</h4>
              <ul className="text-gray-400 space-y-2">
                <li><a href="#" className="hover:text-white">Peminjaman Buku</a></li>
                <li><a href="#" className="hover:text-white">QR Code</a></li>
                <li><a href="#" className="hover:text-white">Statistik</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Hubungi Kami</h4>
              <p className="text-gray-400">
                Email: info@bukugg.com<br/>
                Phone: +62-xxx-xxx-xxx
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Sistem Peminjaman Buku. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
