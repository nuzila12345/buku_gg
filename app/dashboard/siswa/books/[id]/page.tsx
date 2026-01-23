'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Camera, X, QrCode, BookOpen } from 'lucide-react';
import jsQR from 'jsqr';
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

interface BorrowResult {
  success: boolean;
  message: string;
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [borrowResult, setBorrowResult] = useState<BorrowResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scanningRef = useRef(false);

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

  // Effect to start scanning when camera becomes active
  useEffect(() => {
    if (isCameraActive && !scanningRef.current) {
      scanningRef.current = true;
      scanQRCode();
    }
  }, [isCameraActive]);

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      setCameraError(
        'Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin akses kamera.'
      );
      console.error('Camera error:', error);
    }
  };

  // Stop camera
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
    scanningRef.current = false;
    setScannedData(null);
  };

  // Scan QR code
  const scanQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scanLoop = () => {
      if (!isCameraActive || !videoRef.current) return;

      const video = videoRef.current;

      // Wait for video to be ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanLoop);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setScannedData(code.data);
        setIsCameraActive(false);
        // Stop video stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        return;
      }

      requestAnimationFrame(scanLoop);
    };

    requestAnimationFrame(scanLoop);
  };

  // Borrow book
  const borrowBook = async () => {
    if (!book) return;

    setIsLoading(true);
    setBorrowResult(null);

    try {
      const borrowRes = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
      });

      if (borrowRes.ok) {
        setBorrowResult({
          success: true,
          message: `Berhasil meminjam "${book.judul}"!`,
        });
        setShowScanner(false);
      } else {
        const error = await borrowRes.json();
        setBorrowResult({
          success: false,
          message:
            error.message ||
            'Gagal meminjam buku. Pastikan stok tersedia dan Anda belum mencapai batas peminjaman.',
        });
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      setBorrowResult({
        success: false,
        message: 'Terjadi kesalahan. Coba lagi nanti.',
      });
    }

    setIsLoading(false);
  };

  // Reset scan
  const resetScan = () => {
    setScannedData(null);
    setBorrowResult(null);
    scanningRef.current = false;
    startCamera();
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
    <div className="min-h-screen p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-6"
        >
          ← Kembali
        </Button>

        {/* Book Details */}
        {!showScanner ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Cover */}
              <div className="md:col-span-1">
                {book.gambar ? (
                  <img
                    src={book.gambar}
                    alt={book.judul}
                    className="w-full rounded-lg shadow-md mb-6"
                  />
                ) : (
                  <div className="w-full bg-gray-200 rounded-lg shadow-md mb-6 aspect-square flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                {/* QR Code */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-center text-sm font-semibold text-gray-700 mb-4">
                    <QrCode className="w-4 h-4 inline mr-2" />
                    QR Code Buku
                  </p>
                  <QRCodeDisplay data={book.id} size={200} />
                  <p className="text-xs text-gray-500 text-center mt-4 break-all">
                    ID: {book.id}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="md:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.judul}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  oleh <span className="font-semibold">{book.penulis}</span>
                </p>

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

                {/* Stock */}
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
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      Deskripsi
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {book.deskripsi}
                    </p>
                  </div>
                )}

                {/* Borrow Button */}
                {book.jumlah > 0 && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowScanner(true)}
                      className="flex-1 py-6 text-lg font-semibold"
                      style={{ backgroundColor: '#1A3D64' }}
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Pinjam Buku
                    </Button>
                  </div>
                )}

                {book.jumlah === 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-semibold">
                      ⚠️ Stok habis
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Scanner View */
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-center mb-2">Konfirmasi Peminjaman</h2>
              <p className="text-center text-gray-600 mb-6">
                Scan QR code untuk meminjam "{book.judul}"
              </p>

              {/* Camera Error */}
              {cameraError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Kesalahan Kamera</p>
                    <p className="text-sm text-red-700">{cameraError}</p>
                  </div>
                </div>
              )}

              {/* Camera Feed */}
              {!scannedData && !borrowResult && (
                <div className="mb-6">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-square border-4 border-gray-300">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {isCameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-cyan-400 rounded-lg animate-pulse" />
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {/* Camera Controls */}
                  <div className="mt-6 flex flex-col gap-3">
                    {!isCameraActive ? (
                      <Button
                        onClick={startCamera}
                        className="w-full py-6 text-lg font-semibold"
                        style={{ backgroundColor: '#1A3D64' }}
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Buka Kamera
                      </Button>
                    ) : (
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="w-full py-6 text-lg font-semibold border-red-300 text-red-600"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Tutup Kamera
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Scanned Result */}
              {scannedData && !borrowResult && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-semibold mb-2">
                    ✓ QR Code Terdeteksi
                  </p>
                  <div className="bg-white p-3 rounded border border-amber-300 mb-4 break-all">
                    <p className="text-xs text-gray-600 font-mono">{scannedData}</p>
                  </div>

                  {/* Borrow Action */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={borrowBook}
                      disabled={isLoading}
                      className="w-full py-3 font-semibold"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      {isLoading ? 'Sedang memproses...' : '✓ Pinjam Buku'}
                    </Button>
                    <Button
                      onClick={resetScan}
                      variant="outline"
                      className="w-full py-3 font-semibold border-gray-300"
                    >
                      ← Scan Ulang
                    </Button>
                  </div>
                </div>
              )}

              {/* Borrow Result */}
              {borrowResult && (
                <div
                  className={`mb-6 p-4 rounded-lg border ${
                    borrowResult.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex gap-3">
                    {borrowResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={`font-semibold ${
                          borrowResult.success
                            ? 'text-green-800'
                            : 'text-red-800'
                        }`}
                      >
                        {borrowResult.success ? 'Berhasil' : 'Gagal'}
                      </p>
                      <p
                        className={`text-sm ${
                          borrowResult.success
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}
                      >
                        {borrowResult.message}
                      </p>
                    </div>
                  </div>

                  {/* Result Actions */}
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setShowScanner(false);
                        setScannedData(null);
                        setBorrowResult(null);
                      }}
                      className="w-full py-3 font-semibold"
                      style={{ backgroundColor: '#1A3D64' }}
                    >
                      ✓ Selesai
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
