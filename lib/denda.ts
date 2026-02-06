/**
 * Utility functions untuk perhitungan denda
 */

export interface DendaCalculation {
  jumlahHariTelat: number
  totalDenda: number
}

const DENDA_PER_HARI = 1000 // Rp 1.000 per hari

/**
 * Menghitung jumlah hari keterlambatan dan total denda
 * @param tanggalJatuhTempo - Tanggal jatuh tempo pengembalian
 * @param tanggalKembali - Tanggal pengembalian aktual (null jika belum dikembalikan)
 * @param dendaPerHari - Denda per hari (default: Rp 1.000)
 * @returns Object berisi jumlah hari telat dan total denda
 */
export function hitungDenda(
  tanggalJatuhTempo: Date,
  tanggalKembali: Date | null,
  dendaPerHari: number = DENDA_PER_HARI
): DendaCalculation {
  // Jika belum dikembalikan, gunakan tanggal hari ini
  const kembaliDate = tanggalKembali || new Date()

  // Reset waktu untuk perhitungan hari yang akurat
  const jatuhTempo = new Date(tanggalJatuhTempo)
  jatuhTempo.setHours(0, 0, 0, 0)

  const kembali = new Date(kembaliDate)
  kembali.setHours(0, 0, 0, 0)

  // Hitung selisih hari dengan floor (bukan ceil) untuk akurasi
  const diffTime = kembali.getTime() - jatuhTempo.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  const jumlahHariTelat = Math.max(0, Math.floor(diffDays + 1)) // +1 untuk menghitung hari pertama

  // Hitung total denda
  const totalDenda = jumlahHariTelat * dendaPerHari

  return {
    jumlahHariTelat,
    totalDenda,
  }
}

/**
 * Mengecek apakah transaksi terlambat
 */
export function isTerlambat(tanggalJatuhTempo: Date): boolean {
  const jatuhTempo = new Date(tanggalJatuhTempo)
  jatuhTempo.setHours(0, 0, 0, 0)

  const hari = new Date()
  hari.setHours(0, 0, 0, 0)

  return hari > jatuhTempo
}

/**
 * Format rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format tanggal ke format lokal Indonesia
 */
export function formatTanggal(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
