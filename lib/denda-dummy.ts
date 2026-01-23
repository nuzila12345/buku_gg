/**
 * Contoh Data Dummy untuk Testing Fitur Denda
 * File ini berisi contoh data yang dapat digunakan untuk testing
 */

// Contoh 1: Denda Belum Dibayar
export const contohDendaBelumDibayar = {
  id: 'denda-001',
  transactionId: 'trans-001',
  namaSiswa: 'Budi Santoso',
  judulBuku: 'Clean Code',
  penulisBuku: 'Robert C. Martin',
  tanggalPinjam: new Date('2026-01-10'),
  tanggalJatuhTempo: new Date('2026-01-15'),
  tanggalKembali: new Date('2026-01-20'),
  jumlahHariTelat: 5,
  dendaPerHari: 1000,
  totalDenda: 5000,
  status: 'BELUM_DIBAYAR',
  tanggalDibayar: null,
}

// Contoh 2: Denda Sudah Dibayar
export const contohDendaSudahDibayar = {
  id: 'denda-002',
  transactionId: 'trans-002',
  namaSiswa: 'Ani Wijaya',
  judulBuku: 'Design Patterns',
  penulisBuku: 'Gang of Four',
  tanggalPinjam: new Date('2026-01-05'),
  tanggalJatuhTempo: new Date('2026-01-12'),
  tanggalKembali: new Date('2026-01-18'),
  jumlahHariTelat: 6,
  dendaPerHari: 1000,
  totalDenda: 6000,
  status: 'SUDAH_DIBAYAR',
  tanggalDibayar: new Date('2026-01-19'),
}

// Contoh 3: Denda dengan Keterlambatan Besar
export const contohDendaTerlambatBesar = {
  id: 'denda-003',
  transactionId: 'trans-003',
  namaSiswa: 'Citra Dewi',
  judulBuku: 'Refactoring',
  penulisBuku: 'Martin Fowler',
  tanggalPinjam: new Date('2025-12-20'),
  tanggalJatuhTempo: new Date('2025-12-30'),
  tanggalKembali: new Date('2026-01-15'),
  jumlahHariTelat: 16,
  dendaPerHari: 1000,
  totalDenda: 16000,
  status: 'BELUM_DIBAYAR',
  tanggalDibayar: null,
}

/**
 * Query contoh untuk seeding database
 * Jalankan dengan: npx prisma db seed
 */

export const seedDendaQuery = `
-- Insert sample transactions dengan keterlambatan
INSERT INTO transactions (
  id,
  "userId",
  "bookId",
  "tanggalPinjam",
  "tanggalKembali",
  "batasKembali",
  status,
  denda,
  "createdAt",
  "updatedAt"
) VALUES
  ('trans-001', 'user-001', 'book-001', '2026-01-10', '2026-01-20', '2026-01-15', 'TERLAMBAT', 5000, NOW(), NOW()),
  ('trans-002', 'user-002', 'book-002', '2026-01-05', '2026-01-18', '2026-01-12', 'DIKEMBALIKAN', 6000, NOW(), NOW()),
  ('trans-003', 'user-003', 'book-003', '2025-12-20', '2026-01-15', '2025-12-30', 'TERLAMBAT', 16000, NOW(), NOW());

-- Insert sample denda
INSERT INTO denda (
  id,
  "transactionId",
  "userId",
  "bookId",
  "tanggalPinjam",
  "tanggalJatuhTempo",
  "tanggalKembali",
  "jumlahHariTelat",
  "dendaPerHari",
  "totalDenda",
  status,
  "tanggalDibayar",
  "createdAt",
  "updatedAt"
) VALUES
  ('denda-001', 'trans-001', 'user-001', 'book-001', '2026-01-10', '2026-01-15', '2026-01-20', 5, 1000, 5000, 'BELUM_DIBAYAR', NULL, NOW(), NOW()),
  ('denda-002', 'trans-002', 'user-002', 'book-002', '2026-01-05', '2026-01-12', '2026-01-18', 6, 1000, 6000, 'SUDAH_DIBAYAR', '2026-01-19', NOW(), NOW()),
  ('denda-003', 'trans-003', 'user-003', 'book-003', '2025-12-20', '2025-12-30', '2026-01-15', 16, 1000, 16000, 'BELUM_DIBAYAR', NULL, NOW(), NOW());
`

/**
 * Contoh Response API GET /api/denda
 */
export const contohResponseDendaAPI = {
  success: true,
  data: [
    {
      id: 'denda-001',
      transactionId: 'trans-001',
      userId: 'user-001',
      bookId: 'book-001',
      namaSiswa: 'Budi Santoso',
      judulBuku: 'Clean Code',
      penulisBuku: 'Robert C. Martin',
      tanggalPinjam: '2026-01-10T00:00:00Z',
      tanggalJatuhTempo: '2026-01-15T00:00:00Z',
      tanggalKembali: '2026-01-20T00:00:00Z',
      jumlahHariTelat: 5,
      dendaPerHari: 1000,
      totalDenda: 5000,
      status: 'BELUM_DIBAYAR',
      tanggalDibayar: null,
      createdAt: '2026-01-20T10:30:00Z',
    },
    {
      id: 'denda-002',
      transactionId: 'trans-002',
      userId: 'user-002',
      bookId: 'book-002',
      namaSiswa: 'Ani Wijaya',
      judulBuku: 'Design Patterns',
      penulisBuku: 'Gang of Four',
      tanggalPinjam: '2026-01-05T00:00:00Z',
      tanggalJatuhTempo: '2026-01-12T00:00:00Z',
      tanggalKembali: '2026-01-18T00:00:00Z',
      jumlahHariTelat: 6,
      dendaPerHari: 1000,
      totalDenda: 6000,
      status: 'SUDAH_DIBAYAR',
      tanggalDibayar: '2026-01-19T00:00:00Z',
      createdAt: '2026-01-20T11:00:00Z',
    },
  ],
  total: 2,
}

/**
 * Contoh Request/Response PUT /api/denda/[id]
 */
export const contohRequestBayarDenda = {
  status: 'SUDAH_DIBAYAR',
  tanggalDibayar: '2026-01-20T14:30:00Z',
}

export const contohResponseBayarDenda = {
  success: true,
  message: 'Denda berhasil diperbarui',
  data: {
    id: 'denda-001',
    transactionId: 'trans-001',
    userId: 'user-001',
    bookId: 'book-001',
    tanggalPinjam: '2026-01-10T00:00:00Z',
    tanggalJatuhTempo: '2026-01-15T00:00:00Z',
    tanggalKembali: '2026-01-20T00:00:00Z',
    jumlahHariTelat: 5,
    dendaPerHari: 1000,
    totalDenda: 5000,
    status: 'SUDAH_DIBAYAR',
    tanggalDibayar: '2026-01-20T14:30:00Z',
    createdAt: '2026-01-20T10:30:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    user: {
      nama: 'Budi Santoso',
    },
    book: {
      judul: 'Clean Code',
    },
  },
}
