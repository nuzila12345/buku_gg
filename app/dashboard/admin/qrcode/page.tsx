'use client'

import { useEffect, useRef, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import QRCodeStyling from 'qr-code-styling'
import { Download, Printer, Camera, X, Search } from 'lucide-react'
import jsQR from 'jsqr'

interface Book {
  id: string
  judul: string
  penulis: string
  isbn?: string
  gambar?: string
}

export default function QRCodeManagementPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanResult, setScanResult] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3)

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [search, books])

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
          book.isbn?.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredBooks(filtered)
    setCurrentPage(1)
  }

  const handleDownloadQR = (book: Book) => {
    const qrData = JSON.stringify({
      id: book.id,
      judul: book.judul,
      isbn: book.isbn,
      timestamp: new Date().getTime(),
    })

    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      data: qrData,
      image: '',
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H',
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 0,
      },
      dotsOptions: {
        color: '#1A3D64',
        type: 'rounded',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      cornersSquareOptions: {
        color: '#1A3D64',
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: '#1A3D64',
        type: 'dot',
      },
    })

    qrCode.download({
      name: `QR-${book.judul.replace(/\s+/g, '-')}`,
      extension: 'png',
    })
  }

  const handlePrintQR = (book: Book) => {
    const qrData = JSON.stringify({
      id: book.id,
      judul: book.judul,
      isbn: book.isbn,
      timestamp: new Date().getTime(),
    })

    const qrCode = new QRCodeStyling({
      width: 200,
      height: 200,
      data: qrData,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H',
      },
      dotsOptions: {
        color: '#1A3D64',
        type: 'rounded',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      cornersSquareOptions: {
        color: '#1A3D64',
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: '#1A3D64',
        type: 'dot',
      },
    })

    const printWindow = window.open('', '', 'height=600,width=800')
    if (printWindow) {
      qrCode.getRawData('png').then((blob: any) => {
        const url = URL.createObjectURL(blob)
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print QR Code</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background: white;
                }
                .qr-container {
                  text-align: center;
                  padding: 30px;
                  border: 2px solid #1A3D64;
                  border-radius: 10px;
                  max-width: 400px;
                }
                .qr-container h2 {
                  color: #1A3D64;
                  margin: 0 0 10px 0;
                  font-size: 18px;
                }
                .qr-container p {
                  color: #666;
                  margin: 5px 0;
                  font-size: 12px;
                }
                .qr-image {
                  margin: 20px 0;
                }
                .qr-image img {
                  max-width: 250px;
                  border: 1px solid #ddd;
                  padding: 10px;
                  background: white;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                  .qr-container { page-break-after: auto; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h2>${book.judul}</h2>
                <p>${book.penulis}</p>
                ${book.isbn ? `<p>ISBN: ${book.isbn}</p>` : ''}
                <div class="qr-image">
                  <img src="${url}" alt="QR Code">
                </div>
                <p>Scan untuk peminjaman/pengembalian</p>
              </div>
            </body>
          </html>
        `
        printWindow.document.write(html)
        printWindow.document.close()
        setTimeout(() => {
          printWindow.print()
        }, 100)
      })
    }
  }

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        scanQRCode()
      }
    } catch (error) {
      alert('Tidak bisa mengakses kamera. Pastikan izin camera sudah diberikan.')
    }
  }

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setShowScanner(false)
    setScanResult(null)
  }

  const scanQRCode = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight
        canvas.width = video.videoWidth
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)

          if (code) {
            try {
              const data = JSON.parse(code.data)
              setScanResult(data)
              stopScanner()
              return
            } catch (e) {
              // Not a JSON QR code, continue scanning
            }
          }
        } catch (error) {
          // Continue scanning
        }
      }

      requestAnimationFrame(scan)
    }

    scan()
  }

  // Pagination calculation
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex)

  const QRCodeDisplay = ({ book }: { book: Book }) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (containerRef.current) {
        const qrData = JSON.stringify({
          id: book.id,
          judul: book.judul,
          isbn: book.isbn,
          timestamp: new Date().getTime(),
        })

        const qrCode = new QRCodeStyling({
          width: 200,
          height: 200,
          data: qrData,
          margin: 10,
          qrOptions: {
            typeNumber: 0,
            mode: 'Byte',
            errorCorrectionLevel: 'H',
          },
          dotsOptions: {
            color: '#1A3D64',
            type: 'rounded',
          },
          backgroundOptions: {
            color: '#ffffff',
          },
          cornersSquareOptions: {
            color: '#1A3D64',
            type: 'extra-rounded',
          },
          cornersDotOptions: {
            color: '#1A3D64',
            type: 'dot',
          },
        })

        // Clear container
        containerRef.current.innerHTML = ''
        qrCode.append(containerRef.current)
      }
    }, [book.id])

    return <div ref={containerRef} className="flex justify-center" />
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
              QR Code Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate, scan, dan print QR code untuk peminjaman/pengembalian buku
            </p>
          </div>
          <Button
            onClick={() => setShowScanner(true)}
            style={{ backgroundColor: '#1A3D64' }}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Scan QR Code
          </Button>
        </div>

        {/* Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Scan QR Code</CardTitle>
                <button
                  onClick={stopScanner}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                {!scanResult ? (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <canvas
                        ref={canvasRef}
                        style={{ display: 'none' }}
                      />
                      <div className="absolute inset-0 border-4 border-green-500 rounded-lg opacity-50"></div>
                    </div>
                    <p className="text-center text-sm text-gray-600">
                      Arahkan kamera ke QR code
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2">
                        QR Code Terdeteksi! ✓
                      </h3>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p><span className="font-medium">ID Buku:</span> {scanResult.id}</p>
                        <p><span className="font-medium">Judul:</span> {scanResult.judul}</p>
                        {scanResult.isbn && (
                          <p><span className="font-medium">ISBN:</span> {scanResult.isbn}</p>
                        )}
                        <p><span className="font-medium">Waktu Scan:</span> {new Date(scanResult.timestamp).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        style={{ backgroundColor: '#1A3D64' }}
                      >
                        Pinjam Buku
                      </Button>
                      <Button
                        className="flex-1"
                        style={{ backgroundColor: '#10B981' }}
                      >
                        Kembalikan Buku
                      </Button>
                    </div>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={stopScanner}
                >
                  Tutup
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Cari Buku</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari berdasarkan judul, penulis, atau ISBN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Books Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Buku - QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Memuat data buku...</div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada buku ditemukan
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      {/* Gambar Buku */}
                      {book.gambar && (
                        <div className="mb-4 flex justify-center">
                          <img
                            src={book.gambar}
                            alt={book.judul}
                            className="h-32 object-cover rounded"
                          />
                        </div>
                      )}

                      {/* Info Buku */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {book.judul}
                        </h3>
                        <p className="text-sm text-gray-600">{book.penulis}</p>
                        {book.isbn && (
                          <p className="text-xs text-gray-500 mt-1">
                            ISBN: {book.isbn}
                          </p>
                        )}
                      </div>

                      {/* QR Code Display */}
                      <div className="mb-4 flex justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <QRCodeDisplay book={book} />
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => handleDownloadQR(book)}
                          style={{ borderColor: '#38BDF8', color: '#38BDF8' }}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => handlePrintQR(book)}
                          style={{ backgroundColor: '#1A3D64' }}
                        >
                          <Printer className="w-4 h-4" />
                          Print Label
                        </Button>
                      </div>
                    </div>
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

        {/* Instructions */}
        <Card style={{ borderColor: '#F59E0B' }} className="border-2">
          <CardHeader>
            <CardTitle className="text-amber-700">Panduan Penggunaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold mb-1">📱 Scan QR Code:</p>
              <p>Klik tombol "Scan QR Code" di atas dan arahkan kamera ke QR code buku. Sistem akan otomatis mendeteksi dan menampilkan opsi peminjaman/pengembalian.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">⬇️ Download:</p>
              <p>Download QR code untuk setiap buku dalam format PNG. Cocok untuk disimpan atau diedit lebih lanjut.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">🖨️ Print Label:</p>
              <p>Print QR code label langsung dari aplikasi. Label sudah berisi informasi buku (judul, penulis, ISBN) untuk ditempel di buku fisik.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">💡 Tips:</p>
              <p>Untuk hasil terbaik, cetak QR code pada stiker/label berukuran A4 atau lebih kecil. Pastikan kualitas pencetakan baik agar mudah di-scan.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
