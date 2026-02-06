'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BookOpen, TrendingUp, Users, Award } from 'lucide-react'

interface Transaction {
  id: string
  userId: string
  bookId: string
  tanggalPinjam: string
  tanggalKembali: string | null
  batasKembali: string
  status: 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT'
  denda: number
  book: {
    id: string
    judul: string
    penulis: string
    penerbit: string
    kategori: string
    isbn?: string
    gambar?: string
  }
  user: {
    id: string
    nama: string
    username: string
  }
}

interface GenreStats {
  kategori: string
  jumlah: number
}

interface PenulisStats {
  penulis: string
  jumlah: number
}

interface BukuStats {
  judul: string
  penulis: string
  jumlah: number
  gambar?: string
}

const COLORS = ['#1A3D64', '#38BDF8', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

export default function StatisticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [genreStats, setGenreStats] = useState<GenreStats[]>([])
  const [penulisStats, setPenulisStats] = useState<PenulisStats[]>([])
  const [bukuStats, setBukuStats] = useState<BukuStats[]>([])
  const [totalBuku, setTotalBuku] = useState(0)
  const [totalKali, setTotalKali] = useState(0)

  useEffect(() => {
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      const txs = data.transactions || []
      setTransactions(txs)
      setLoading(false)
      
      // Process statistics
      processStatistics(txs)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setLoading(false)
    }
  }

  const processStatistics = (txs: Transaction[]) => {
    // Total buku unik yang pernah dipinjam
    const bukuSet = new Set(txs.map(t => t.bookId))
    setTotalBuku(bukuSet.size)
    setTotalKali(txs.length)

    // Genre Favorit
    const genreMap = new Map<string, number>()
    txs.forEach(tx => {
      const count = genreMap.get(tx.book.kategori) || 0
      genreMap.set(tx.book.kategori, count + 1)
    })
    
    const genreArray = Array.from(genreMap.entries())
      .map(([kategori, jumlah]) => ({ kategori, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 8)
    setGenreStats(genreArray)

    // Penulis Favorit
    const penulisMap = new Map<string, number>()
    txs.forEach(tx => {
      const count = penulisMap.get(tx.book.penulis) || 0
      penulisMap.set(tx.book.penulis, count + 1)
    })
    
    const penulisArray = Array.from(penulisMap.entries())
      .map(([penulis, jumlah]) => ({ penulis, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 8)
    setPenulisStats(penulisArray)

    // Buku Paling Sering Dipinjam
    const bukuMap = new Map<string, { judul: string; penulis: string; jumlah: number; gambar?: string }>()
    txs.forEach(tx => {
      const key = tx.bookId
      if (bukuMap.has(key)) {
        const existing = bukuMap.get(key)!
        bukuMap.set(key, { ...existing, jumlah: existing.jumlah + 1 })
      } else {
        bukuMap.set(key, {
          judul: tx.book.judul,
          penulis: tx.book.penulis,
          jumlah: 1,
          gambar: tx.book.gambar,
        })
      }
    })
    
    const bukuArray = Array.from(bukuMap.values())
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 8)
    setBukuStats(bukuArray)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
            Statistik Peminjaman
          </h1>
          <p className="text-muted-foreground mt-2">
            Analisis peminjaman buku Anda
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Memuat data statistik...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Buku Unik */}
              <Card className="border-2" style={{ borderColor: '#38BDF8' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Buku Unik Dipinjam</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{totalBuku}</p>
                      <p className="text-xs text-gray-500 mt-1">buku berbeda</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#CFFAFE' }}>
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Kali Meminjam */}
              <Card className="border-2" style={{ borderColor: '#F59E0B' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Kali Meminjam</p>
                      <p className="text-3xl font-bold text-amber-600 mt-2">{totalKali}</p>
                      <p className="text-xs text-gray-500 mt-1">transaksi peminjaman</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                      <TrendingUp className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Genre Favorit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" style={{ color: '#1A3D64' }} />
                  Genre Favorit
                </CardTitle>
              </CardHeader>
              <CardContent>
                {genreStats.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={genreStats}
                          dataKey="jumlah"
                          nameKey="kategori"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ kategori, jumlah }) => `${kategori} (${jumlah})`}
                        >
                          {genreStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* List Genre */}
                    <div className="mt-6 space-y-2">
                      {genreStats.map((item, index) => (
                        <div key={item.kategori} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="font-medium">{item.kategori}</span>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {item.jumlah} buku
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-8">Belum ada data genre</p>
                )}
              </CardContent>
            </Card>

            {/* Penulis Favorit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: '#1A3D64' }} />
                  Penulis Favorit
                </CardTitle>
              </CardHeader>
              <CardContent>
                {penulisStats.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={penulisStats}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="penulis"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="jumlah" fill="#1A3D64" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* List Penulis */}
                    <div className="mt-6 space-y-2">
                      {penulisStats.map((item, index) => (
                        <div key={item.penulis} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-800 w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm">
                              {index + 1}
                            </span>
                            <span className="font-medium">{item.penulis}</span>
                          </div>
                          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {item.jumlah} buku
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-8">Belum ada data penulis</p>
                )}
              </CardContent>
            </Card>

            {/* Buku Paling Sering Dipinjam */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: '#1A3D64' }} />
                  Buku Paling Sering Dipinjam
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bukuStats.length > 0 ? (
                  <div className="space-y-4">
                    {bukuStats.map((item, index) => (
                      <div key={`${item.judul}-${index}`} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                        {/* Ranking */}
                        <div className="flex-shrink-0 flex items-center justify-center">
                          {index === 0 && (
                            <div className="w-10 h-10 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold text-lg">
                              🥇
                            </div>
                          )}
                          {index === 1 && (
                            <div className="w-10 h-10 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold text-lg">
                              🥈
                            </div>
                          )}
                          {index === 2 && (
                            <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-lg">
                              🥉
                            </div>
                          )}
                          {index > 2 && (
                            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        {/* Gambar */}
                        {item.gambar && (
                          <div className="flex-shrink-0 hidden sm:block">
                            <Image
                              src={item.gambar}
                              alt={item.judul}
                              width={48}
                              height={64}
                              className="w-12 h-16 object-cover rounded border"
                            />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.judul}</h3>
                          <p className="text-sm text-gray-600">{item.penulis}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {item.jumlah} kali dipinjam
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Belum ada data peminjaman buku</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
