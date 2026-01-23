'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle, Clock, DollarSign, X } from 'lucide-react'

interface Denda {
  id: string
  transactionId: string
  userId: string
  bookId: string
  namaSiswa: string
  judulBuku: string
  penulisBuku: string
  tanggalPinjam: string
  tanggalJatuhTempo: string
  tanggalKembali: string | null
  jumlahHariTelat: number
  dendaPerHari: number
  totalDenda: number
  status: 'BELUM_DIBAYAR' | 'SUDAH_DIBAYAR'
  tanggalDibayar: string | null
}

export default function DendaPage() {
  const [dendaList, setDendaList] = useState<Denda[]>([])
  const [filteredDenda, setFilteredDenda] = useState<Denda[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'SEMUA' | 'BELUM_DIBAYAR' | 'SUDAH_DIBAYAR'>('SEMUA')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedDenda, setSelectedDenda] = useState<Denda | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash' | 'card'>('transfer')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (currentUserId) {
      fetchDenda()
    }
  }, [currentUserId])

  useEffect(() => {
    filterDenda()
  }, [filterStatus, dendaList])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.user) {
        setCurrentUserId(data.user.id)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchDenda = async () => {
    try {
      const res = await fetch('/api/denda')
      const data = await res.json()
      
      // Filter hanya denda milik user yang sedang login
      const userDenda = data.data.filter((d: Denda) => d.userId === currentUserId)
      setDendaList(userDenda)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching denda:', error)
      setLoading(false)
    }
  }

  const filterDenda = () => {
    let filtered = dendaList

    if (filterStatus !== 'SEMUA') {
      filtered = filtered.filter((d) => d.status === filterStatus)
    }

    setFilteredDenda(filtered)
  }

  const calculateDaysUntilDue = (tanggalJatuhTempo: string) => {
    const today = new Date()
    const dueDate = new Date(tanggalJatuhTempo)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  const handlePaymentClick = (denda: Denda) => {
    setSelectedDenda(denda)
    setShowPaymentModal(true)
    setPaymentSuccess(false)
  }

  const handlePayment = async () => {
    if (!selectedDenda) return

    setIsProcessing(true)
    try {
      // Update denda status to SUDAH_DIBAYAR
      const res = await fetch(`/api/denda/${selectedDenda.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SUDAH_DIBAYAR',
          tanggalDibayar: new Date().toISOString(),
          paymentMethod: paymentMethod,
        }),
      })

      if (res.ok) {
        setPaymentSuccess(true)
        // Refresh denda list setelah 2 detik
        setTimeout(() => {
          fetchDenda()
          setShowPaymentModal(false)
          setSelectedDenda(null)
          setPaymentSuccess(false)
        }, 2000)
      } else {
        alert('Gagal memproses pembayaran. Coba lagi.')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Terjadi kesalahan. Coba lagi nanti.')
    } finally {
      setIsProcessing(false)
    }
  }

  const closePaymentModal = () => {
    if (!isProcessing) {
      setShowPaymentModal(false)
      setSelectedDenda(null)
      setPaymentSuccess(false)
    }
  }

  // Hitung ringkasan
  const totalDenda = dendaList.reduce((sum, d) => sum + d.totalDenda, 0)
  const belumDibayar = dendaList.filter((d) => d.status === 'BELUM_DIBAYAR')
  const sudahDibayar = dendaList.filter((d) => d.status === 'SUDAH_DIBAYAR')
  const totalBelumDibayar = belumDibayar.reduce((sum, d) => sum + d.totalDenda, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
            Tracker Denda
          </h1>
          <p className="text-muted-foreground mt-2">
            Lihat riwayat denda peminjaman buku Anda
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Denda */}
          <Card className="border-2" style={{ borderColor: '#EF4444' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Denda</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {formatCurrency(totalDenda)}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Denda Belum Dibayar */}
          <Card className="border-2" style={{ borderColor: '#F59E0B' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Belum Dibayar</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">
                    {formatCurrency(totalBelumDibayar)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{belumDibayar.length} denda</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Denda Sudah Dibayar */}
          <Card className="border-2" style={{ borderColor: '#10B981' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Sudah Dibayar</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {sudahDibayar.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Tercatat</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5' }}>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Denda</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <Button
                variant={filterStatus === 'SEMUA' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('SEMUA')}
                style={filterStatus === 'SEMUA' ? { backgroundColor: '#1A3D64' } : {}}
              >
                Semua
              </Button>
              <Button
                variant={filterStatus === 'BELUM_DIBAYAR' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('BELUM_DIBAYAR')}
                style={filterStatus === 'BELUM_DIBAYAR' ? { backgroundColor: '#1A3D64' } : {}}
              >
                Belum Dibayar
              </Button>
              <Button
                variant={filterStatus === 'SUDAH_DIBAYAR' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('SUDAH_DIBAYAR')}
                style={filterStatus === 'SUDAH_DIBAYAR' ? { backgroundColor: '#1A3D64' } : {}}
              >
                Sudah Dibayar
              </Button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-8">Memuat data denda...</div>
            ) : filteredDenda.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {filterStatus === 'SEMUA'
                    ? 'Tidak ada denda'
                    : filterStatus === 'BELUM_DIBAYAR'
                    ? 'Tidak ada denda yang belum dibayar'
                    : 'Tidak ada denda yang sudah dibayar'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDenda.map((denda) => {
                  const daysUntilDue = calculateDaysUntilDue(denda.tanggalJatuhTempo)
                  const isOverdue = daysUntilDue < 0
                  const isSudahDibayar = denda.status === 'SUDAH_DIBAYAR'

                  return (
                    <div
                      key={denda.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      style={{
                        borderColor: isSudahDibayar ? '#D1FAE5' : '#FEE2E2',
                        backgroundColor: isSudahDibayar ? '#F0FDF4' : '#FFFBFB',
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Informasi Buku */}
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            {denda.judulBuku}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Penulis:</span> {denda.penulisBuku}
                            </p>
                            <p>
                              <span className="font-medium">Tanggal Pinjam:</span>{' '}
                              {formatDate(denda.tanggalPinjam)}
                            </p>
                            <p>
                              <span className="font-medium">Jatuh Tempo:</span>{' '}
                              {formatDate(denda.tanggalJatuhTempo)}
                            </p>
                            {denda.tanggalKembali && (
                              <p>
                                <span className="font-medium">Tanggal Kembali:</span>{' '}
                                {formatDate(denda.tanggalKembali)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Informasi Denda */}
                        <div>
                          <div className="space-y-3">
                            {/* Status */}
                            <div className="flex items-center gap-2">
                              {isSudahDibayar ? (
                                <>
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium text-green-600">Sudah Dibayar</p>
                                    <p className="text-xs text-gray-600">
                                      {denda.tanggalDibayar && formatDate(denda.tanggalDibayar)}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                  <div>
                                    <p className="text-sm font-medium text-red-600">Belum Dibayar</p>
                                    {isOverdue && (
                                      <p className="text-xs text-red-500">
                                        Telat {Math.abs(daysUntilDue)} hari
                                      </p>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Detail Denda */}
                            <div className="bg-white p-3 rounded border">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Hari Telat:</span>
                                  <span className="font-semibold">
                                    {denda.jumlahHariTelat} hari
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Denda/Hari:</span>
                                  <span className="font-semibold">
                                    {formatCurrency(denda.dendaPerHari)}
                                  </span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold">
                                  <span>Total Denda:</span>
                                  <span style={{ color: isSudahDibayar ? '#10B981' : '#EF4444' }}>
                                    {formatCurrency(denda.totalDenda)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            {!isSudahDibayar && (
                              <Button
                                className="w-full"
                                style={{ backgroundColor: '#1A3D64' }}
                                onClick={() => handlePaymentClick(denda)}
                              >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Bayar Sekarang
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {showPaymentModal && selectedDenda && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pembayaran Denda</CardTitle>
                <button
                  onClick={closePaymentModal}
                  disabled={isProcessing}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-6">
                {paymentSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-green-600">Pembayaran Berhasil!</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Denda Anda telah dicatat sebagai terbayar.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Informasi Denda */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 border">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Buku:</span>
                        <span className="font-semibold">{selectedDenda.judulBuku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hari Telat:</span>
                        <span className="font-semibold">{selectedDenda.jumlahHariTelat} hari</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Denda/Hari:</span>
                        <span className="font-semibold">{formatCurrency(selectedDenda.dendaPerHari)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-red-600">
                        <span>Total Bayar:</span>
                        <span>{formatCurrency(selectedDenda.totalDenda)}</span>
                      </div>
                    </div>

                    {/* Metode Pembayaran */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold">Metode Pembayaran:</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50" style={{ borderColor: paymentMethod === 'transfer' ? '#1A3D64' : '#e5e7eb', backgroundColor: paymentMethod === 'transfer' ? '#F0F9FF' : 'white' }}>
                          <input
                            type="radio"
                            name="payment"
                            value="transfer"
                            checked={paymentMethod === 'transfer'}
                            onChange={(e) => setPaymentMethod(e.target.value as 'transfer')}
                            disabled={isProcessing}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-medium">Transfer Bank</p>
                            <p className="text-xs text-gray-600">BRI/BCA/Mandiri</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50" style={{ borderColor: paymentMethod === 'cash' ? '#1A3D64' : '#e5e7eb', backgroundColor: paymentMethod === 'cash' ? '#F0F9FF' : 'white' }}>
                          <input
                            type="radio"
                            name="payment"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                            disabled={isProcessing}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-medium">Tunai ke Perpustakaan</p>
                            <p className="text-xs text-gray-600">Bayar langsung ke kantor</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50" style={{ borderColor: paymentMethod === 'card' ? '#1A3D64' : '#e5e7eb', backgroundColor: paymentMethod === 'card' ? '#F0F9FF' : 'white' }}>
                          <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                            disabled={isProcessing}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-medium">Kartu Kredit/Debit</p>
                            <p className="text-xs text-gray-600">Online payment</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 flex gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">
                          {paymentMethod === 'transfer'
                            ? 'Transfer ke rekening yang tertera di kantor perpustakaan'
                            : paymentMethod === 'cash'
                            ? 'Datang ke kantor perpustakaan untuk membayar'
                            : 'Gunakan metode pembayaran online'}
                        </p>
                        <p className="text-xs mt-1">
                          Pastikan menyertakan nomor referensi denda saat membayar
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={closePaymentModal}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        style={{ backgroundColor: '#1A3D64' }}
                        className="flex-1"
                      >
                        {isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
