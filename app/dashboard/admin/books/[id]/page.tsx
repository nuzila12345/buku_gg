'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, BookOpen, Download, QrCode } from 'lucide-react';
import QRCodeDisplay from '@/components/QRCodeDisplay';

interface Book {
  id: string;
  judul: string;
  penulis: string;
  penerbit: string;
  tahunTerbit: number;
  isbn: string;
  kategori: string;
  jumlah: number;
  deskripsi?: string;
  gambar?: string;
}

export default function BookDetailAdminPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/books/${bookId}`);
        if (!res.ok) throw new Error('Buku tidak ditemukan');
        const data = await res.json();
        setBook(data.book);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat buku');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const downloadQRCode = async () => {
    if (!book) return;

    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        alert('QR Code belum ter-render. Silakan coba lagi.');
        return;
      }

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `QR-${book.judul.replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Gagal mengunduh QR code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail buku...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">{error || 'Buku tidak ditemukan'}</p>
          <Button onClick={() => router.back()}>← Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => router.back()} variant="outline">
            ← Kembali
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Detail Buku</h1>
          <div></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Cover & QR */}
            <div className="md:col-span-1">
              {/* Cover */}
              {book.gambar ? (
                <Image
                  src={book.gambar}
                  alt={book.judul}
                  width={300}
                  height={400}
                  className="w-full rounded-lg shadow-md mb-6"
                />
              ) : (
                <div className="w-full bg-gray-200 rounded-lg shadow-md mb-6 aspect-square flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* QR Code Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <QrCode className="w-5 h-5 text-gray-700" />
                    <p className="font-semibold text-gray-700">QR Code</p>
                  </div>
                  <QRCodeDisplay data={book.id} size={250} />
                  <p className="text-xs text-gray-500 break-all mb-4">
                    {book.id}
                  </p>
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="md:col-span-2">
              {/* Title & Author */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.judul}
                </h2>
                <p className="text-xl text-gray-600">
                  oleh <span className="font-semibold">{book.penulis}</span>
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                    Penerbit
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {book.penerbit}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                    Tahun Terbit
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {book.tahunTerbit}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                    ISBN
                  </p>
                  <p className="text-lg font-semibold text-gray-900 break-all">
                    {book.isbn}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                    Kategori
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {book.kategori}
                  </p>
                </div>
              </div>

              {/* Stock Info */}
              <div className="mb-6 p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                <p className="text-sm text-gray-600 mb-1">Stok Tersedia</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-indigo-600">
                    {book.jumlah}
                  </p>
                  <p className="text-sm text-gray-600">exemplar</p>
                </div>
              </div>

              {/* Description */}
              {book.deskripsi && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Deskripsi
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {book.deskripsi}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                <Button
                  onClick={() => router.push(`/dashboard/admin/books`)}
                  variant="outline"
                >
                  ← Kembali ke Daftar
                </Button>
                <Button
                  onClick={() => router.push(`/dashboard/admin/books/${book.id}/edit`)}
                  style={{ backgroundColor: '#1A3D64' }}
                >
                  ✏️ Edit Buku
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
