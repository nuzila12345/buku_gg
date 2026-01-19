import { PrismaClient, UserRole, TransactionStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: UserRole.ADMIN,
      nama: 'Administrator',
      email: 'admin@buku-gg.com',
      alamat: 'Jl. Admin No. 1',
      telepon: '081234567890',
    },
  })

  console.log('✅ Created admin user:', admin.username)

  // Create Student Users
  const siswa1 = await prisma.user.upsert({
    where: { username: 'siswa1' },
    update: {},
    create: {
      username: 'siswa1',
      password: hashedPassword,
      role: UserRole.SISWA,
      nama: 'Ahmad Fauzi',
      email: 'ahmad@example.com',
      alamat: 'Jl. Siswa No. 1',
      telepon: '081234567891',
    },
  })

  const siswa2 = await prisma.user.upsert({
    where: { username: 'siswa2' },
    update: {},
    create: {
      username: 'siswa2',
      password: hashedPassword,
      role: UserRole.SISWA,
      nama: 'Siti Nurhaliza',
      email: 'siti@example.com',
      alamat: 'Jl. Siswa No. 2',
      telepon: '081234567892',
    },
  })

  const siswa3 = await prisma.user.upsert({
    where: { username: 'siswa3' },
    update: {},
    create: {
      username: 'siswa3',
      password: hashedPassword,
      role: UserRole.SISWA,
      nama: 'Budi Santoso',
      email: 'budi@example.com',
      alamat: 'Jl. Siswa No. 3',
      telepon: '081234567893',
    },
  })

  console.log('✅ Created student users')

  // Create Books
  const books = [
    {
      judul: 'Pemrograman Web Modern dengan Next.js',
      penulis: 'John Doe',
      penerbit: 'Tech Publisher',
      tahunTerbit: 2023,
      isbn: '978-1234567890',
      kategori: 'Teknologi',
      jumlah: 10,
      deskripsi: 'Buku lengkap tentang pengembangan web modern menggunakan Next.js',
    },
    {
      judul: 'Database Design & Implementation',
      penulis: 'Jane Smith',
      penerbit: 'Data Books',
      tahunTerbit: 2022,
      isbn: '978-1234567891',
      kategori: 'Teknologi',
      jumlah: 8,
      deskripsi: 'Panduan lengkap desain dan implementasi database',
    },
    {
      judul: 'Algoritma dan Struktur Data',
      penulis: 'Ahmad Rahman',
      penerbit: 'Edu Publisher',
      tahunTerbit: 2023,
      isbn: '978-1234567892',
      kategori: 'Pendidikan',
      jumlah: 15,
      deskripsi: 'Buku referensi untuk memahami algoritma dan struktur data',
    },
    {
      judul: 'Sejarah Indonesia Modern',
      penulis: 'Prof. Soekarno',
      penerbit: 'History Press',
      tahunTerbit: 2021,
      isbn: '978-1234567893',
      kategori: 'Sejarah',
      jumlah: 12,
      deskripsi: 'Sejarah lengkap Indonesia dari masa kemerdekaan hingga sekarang',
    },
    {
      judul: 'Kalkulus Dasar',
      penulis: 'Dr. Matematika',
      penerbit: 'Math Books',
      tahunTerbit: 2022,
      isbn: '978-1234567894',
      kategori: 'Pendidikan',
      jumlah: 20,
      deskripsi: 'Buku teks kalkulus untuk mahasiswa tingkat awal',
    },
    {
      judul: 'Fisika Modern',
      penulis: 'Einstein Jr',
      penerbit: 'Science Publisher',
      tahunTerbit: 2023,
      isbn: '978-1234567895',
      kategori: 'Sains',
      jumlah: 9,
      deskripsi: 'Pengantar fisika modern untuk pemula',
    },
    {
      judul: 'Kewirausahaan Digital',
      penulis: 'Startup Master',
      penerbit: 'Business Books',
      tahunTerbit: 2023,
      isbn: '978-1234567896',
      kategori: 'Bisnis',
      jumlah: 7,
      deskripsi: 'Panduan memulai bisnis digital di era modern',
    },
    {
      judul: 'Bahasa Indonesia untuk Akademik',
      penulis: 'Linguistik Pro',
      penerbit: 'Language Press',
      tahunTerbit: 2022,
      isbn: '978-1234567897',
      kategori: 'Bahasa',
      jumlah: 11,
      deskripsi: 'Buku referensi bahasa Indonesia untuk keperluan akademik',
    },
  ]

  for (const bookData of books) {
    await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: {},
      create: bookData,
    })
  }

  console.log('✅ Created books')

  // Create some transactions
  const book1 = await prisma.book.findFirst({ where: { isbn: '978-1234567890' } })
  const book2 = await prisma.book.findFirst({ where: { isbn: '978-1234567891' } })

  if (book1 && book2) {
    // Create past transaction (returned)
    const batasKembali1 = new Date()
    batasKembali1.setDate(batasKembali1.getDate() - 5)
    const tanggalKembali1 = new Date()
    tanggalKembali1.setDate(tanggalKembali1.getDate() - 2)

    await prisma.transaction.create({
      data: {
        userId: siswa1.id,
        bookId: book1.id,
        tanggalPinjam: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        tanggalKembali: tanggalKembali1,
        batasKembali: batasKembali1,
        status: TransactionStatus.DIKEMBALIKAN,
        denda: 0,
      },
    })

    // Create current transaction (borrowed)
    const batasKembali2 = new Date()
    batasKembali2.setDate(batasKembali2.getDate() + 7)

    await prisma.transaction.create({
      data: {
        userId: siswa2.id,
        bookId: book2.id,
        tanggalPinjam: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        batasKembali: batasKembali2,
        status: TransactionStatus.DIPINJAM,
        denda: 0,
      },
    })

    console.log('✅ Created transactions')
  }

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

