'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Camera, X } from 'lucide-react';
import jsQR from 'jsqr';

interface BorrowResult {
  success: boolean;
  message: string;
  bookId?: string;
  bookTitle?: string;
}

export default function ScanQRPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [borrowResult, setBorrowResult] = useState<BorrowResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scanningRef = useRef(false);

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
        scanQRCode();
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

  // Borrow book via scanned QR code
  const borrowBookFromQR = async () => {
    if (!scannedData) return;

    setIsLoading(true);
    setBorrowResult(null);

    try {
      let bookId = scannedData;
      
      // Try to parse if it's JSON (from QR code endpoint)
      try {
        const parsed = JSON.parse(scannedData);
        bookId = parsed.id || scannedData;
      } catch {
        // If not JSON, use as-is (assuming it's just the book ID)
      }

      // Get book details first
      const bookRes = await fetch(`/api/books/${bookId}`);
      if (!bookRes.ok) {
        setBorrowResult({
          success: false,
          message: 'Buku tidak ditemukan. Pastikan QR code valid.',
        });
        setIsLoading(false);
        return;
      }

      const book = await bookRes.json();

      // Create transaction (borrow)
      const borrowRes = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: bookId }),
      });

      if (borrowRes.ok) {
        const transaction = await borrowRes.json();
        setBorrowResult({
          success: true,
          message: `Berhasil meminjam "${book.judul}"!`,
          bookTitle: book.judul,
          bookId: bookId,
        });
        setScannedData(null);
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

  // Reset state
  const resetScan = () => {
    setScannedData(null);
    setBorrowResult(null);
    scanningRef.current = false;
    startCamera();
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Camera className="w-8 h-8" style={{ color: '#1A3D64' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
              Scan QR Code
            </h1>
          </div>
          <p className="text-gray-600">
            Pindai QR code pada buku untuk meminjamnya dengan cepat
          </p>
        </div>

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

            {/* Instructions */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-center text-gray-700">
                {isCameraActive
                  ? 'Arahkan kamera ke QR code buku...'
                  : 'Kamera belum aktif. Tekan tombol di bawah untuk memulai.'}
              </p>
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
            <p className="text-sm text-amber-700 mb-4">
              Tekan tombol di bawah untuk meminjam buku ini.
            </p>

            {/* Borrow Action */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={borrowBookFromQR}
                disabled={isLoading}
                className="w-full py-3 font-semibold"
                style={{ backgroundColor: '#10B981' }}
              >
                {isLoading ? 'Sedang memproses...' : '✓ Pinjam Buku Ini'}
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
                onClick={resetScan}
                className="w-full py-3 font-semibold"
                style={{ backgroundColor: '#1A3D64' }}
              >
                ← Scan Buku Lain
              </Button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pastikan pencahayaan cukup</li>
            <li>Arahkan kamera tegak lurus ke QR code</li>
            <li>Jarak ideal 10-20 cm dari QR code</li>
            <li>Gunakan fitur ini untuk peminjaman yang cepat</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
