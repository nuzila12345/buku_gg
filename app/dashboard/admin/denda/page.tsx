'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react'
import { formatRupiah, formatTanggal } from '@/lib/denda'

interface Denda {
  id: string
  transactionId: string
  userId?: string
  bookId?: string
  namaSiswa: string
  judulBuku: string
  penulisBuku: string
  tanggalPinjam: string | Date
  tanggalJatuhTempo: string | Date
  tanggalKembali: string | Date | null
  jumlahHariTelat: number
  dendaPerHari: number
  totalDenda: number
  status: string
  tanggalDibayar: string | Date | null
  createdAt?: string | Date
}

export default function DendaPage() {
  const [dendaList, setDendaList] = useState<Denda[]>([])
  const [filteredDenda, setFilteredDenda] = useState<Denda[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'BELUM_DIBAYAR' | 'SUDAH_DIBAYAR'>('ALL')

  useEffect(() => {
    fetchDenda()
  }, [])

  useEffect(() => {
    filterDenda()
  }, [search, filterStatus, dendaList])

  const fetchDenda = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/denda')
      const data = await res.json()

      if (data.success) {
        setDendaList(data.data)
      }
    } catch (error) {
      console.error('Error fetching denda:', error)
      alert('Gagal mengambil data denda')
    } finally {
      setLoading(false)
    }
  }

  const filterDenda = () => {
    let filtered = dendaList

    // Filter berdasarkan search
    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
          d.judulBuku.toLowerCase().includes(search.toLowerCase()) ||
          d.penulisBuku.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filter berdasarkan status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((d) => d.status === filterStatus)
    }

    setFilteredDenda(filtered)
  }

  const handleBayarDenda = async (dendaId: string) => {
    try {
      setUpdating(dendaId)

      const res = await fetch(`/api/denda/${dendaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SUDAH_DIBAYAR',
          tanggalDibayar: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }

      // Update local state
      const updatedDenda = dendaList.map((d) =>
        d.id === dendaId
          ? {
              ...d,
              status: 'SUDAH_DIBAYAR',
              tanggalDibayar: new Date(),
            }
          : d
      )
      setDendaList(updatedDenda)
      alert('Denda berhasil ditandai sebagai sudah dibayar')
    } catch (error) {
      console.error('Error updating denda:', error)
      alert('Gagal memperbarui denda')
    } finally {
      setUpdating(null)
    }
  }

  const totalDendaBelumDibayar = dendaList
    .filter((d) => d.status === 'BELUM_DIBAYAR')
    .reduce((sum, d) => sum + d.totalDenda, 0)

  const totalDendaSudahDibayar = dendaList
    .filter((d) => d.status === 'SUDAH_DIBAYAR')
    .reduce((sum, d) => sum + d.totalDenda, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
            Kelola Denda Keterlambatan
          </h1>
          <p className="text-muted-foreground mt-2">
            Manajemen denda akibat keterlambatan pengembalian buku
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Denda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatRupiah(totalDendaBelumDibayar + totalDendaSudahDibayar)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dari {dendaList.length} transaksi terlambat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">
                Belum Dibayar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatRupiah(totalDendaBelumDibayar)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dendaList.filter((d) => d.status === 'BELUM_DIBAYAR').length} denda menunggu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">
                Sudah Dibayar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatRupiah(totalDendaSudahDibayar)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dendaList.filter((d) => d.status === 'SUDAH_DIBAYAR').length} denda terselesaikan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter dan Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Denda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari nama siswa, judul buku..."
                    className="flex-1 ml-2 outline-none text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('ALL')}
                >
                  Semua
                </Button>
                <Button
                  variant={filterStatus === 'BELUM_DIBAYAR' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('BELUM_DIBAYAR')}
                  className={filterStatus === 'BELUM_DIBAYAR' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Belum Dibayar
                </Button>
                <Button
                  variant={filterStatus === 'SUDAH_DIBAYAR' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('SUDAH_DIBAYAR')}
                  className={filterStatus === 'SUDAH_DIBAYAR' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Sudah Dibayar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Denda */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Denda Keterlambatan</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredDenda.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Tidak ada data denda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">No</th>
                      <th className="px-4 py-3 text-left font-semibold">Nama Siswa</th>
                      <th className="px-4 py-3 text-left font-semibold">Judul Buku</th>
                      <th className="px-4 py-3 text-left font-semibold">Tgl Pinjam</th>
                      <th className="px-4 py-3 text-left font-semibold">Tgl Jatuh Tempo</th>
                      <th className="px-4 py-3 text-left font-semibold">Tgl Kembali</th>
                      <th className="px-4 py-3 text-center font-semibold">Hari Telat</th>
                      <th className="px-4 py-3 text-right font-semibold">Denda</th>
                      <th className="px-4 py-3 text-center font-semibold">Status</th>
                      <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDenda.map((denda, index) => (
                      <tr key={denda.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{denda.namaSiswa}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-medium">{denda.judulBuku}</div>
                            <div className="text-muted-foreground">{denda.penulisBuku}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatTanggal(denda.tanggalPinjam)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatTanggal(denda.tanggalJatuhTempo)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {denda.tanggalKembali
                            ? formatTanggal(denda.tanggalKembali)
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                            {denda.jumlahHariTelat} hari
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatRupiah(denda.totalDenda)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {denda.status === 'BELUM_DIBAYAR' ? (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                              <XCircle className="w-3 h-3" />
                              Belum Dibayar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                              <CheckCircle className="w-3 h-3" />
                              Sudah Dibayar
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {denda.status === 'BELUM_DIBAYAR' ? (
                            <Button
                              size="sm"
                              onClick={() => handleBayarDenda(denda.id)}
                              disabled={updating === denda.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {updating === denda.id ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                'Bayar'
                              )}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {denda.tanggalDibayar
                                ? formatTanggal(denda.tanggalDibayar)
                                : '-'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
