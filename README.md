# Sistem Peminjaman Buku

Aplikasi web modern untuk pengelolaan sistem peminjaman buku dengan Next.js, Prisma, dan PostgreSQL.

## Fitur

### Admin
- ✅ Login sebagai admin
- ✅ Dashboard dengan statistik
- ✅ CRUD Data Buku
- ✅ CRUD Transaksi
- ✅ CRUD Kelola Anggota
- ✅ Pencarian untuk kondisi tertentu

### Siswa
- ✅ Daftar anggota baru
- ✅ Login sebagai siswa
- ✅ Dashboard dengan statistik peminjaman
- ✅ Peminjaman buku
- ✅ Pengembalian buku
- ✅ Pencarian buku

## Teknologi

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Cookie-based session

## Instalasi

1. Clone repository ini
2. Install dependencies:
```bash
npm install
```

3. Setup database:
   - Buat file `.env` di root project
   - Tambahkan `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/buku_gg?schema=public"
   ```

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Jalankan migration:
```bash
npm run prisma:migrate
```

6. Seed database dengan data awal:
```bash
npm run prisma:seed
```

7. Jalankan development server:
```bash
npm run dev
```

8. Buka browser di `http://localhost:3000`

## Data Awal

Setelah menjalankan seeder, Anda dapat login dengan:

**Admin:**
- Username: `admin`
- Password: `password123`

**Siswa:**
- Username: `siswa1`, `siswa2`, atau `siswa3`
- Password: `password123`

## Struktur Project

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── register/          # Register page
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Utility functions
├── prisma/                # Prisma schema & migrations
│   └── seed.ts           # Database seeder
└── public/                # Static files
```

## Scripts

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm run start` - Jalankan production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Jalankan database migration
- `npm run prisma:seed` - Seed database dengan data awal
- `npm run prisma:studio` - Buka Prisma Studio

## License

MIT

