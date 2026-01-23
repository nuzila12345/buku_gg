'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, BookOpen, Search } from 'lucide-react';

interface Book {
  id: string;
  judul: string;
  penulis: string;
  kategori: string;
  jumlah: number;
  gambar?: string;
}

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/books');
        if (!res.ok) throw new Error('Gagal memuat data buku');
        const data = await res.json();
        setBooks(data);

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((book: Book) => book.kategori))) as string[];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.penulis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || book.kategori === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat daftar buku...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Daftar Buku</h1>
          <p className="text-gray-600">Cari dan pinjam buku yang Anda inginkan</p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari judul atau penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Kategori</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setCategoryFilter('')}
                  variant={categoryFilter === '' ? 'default' : 'outline'}
                  className="text-sm"
                >
                  Semua
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    variant={categoryFilter === category ? 'default' : 'outline'}
                    className="text-sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Cover */}
                <div className="relative bg-gray-200 aspect-square flex items-center justify-center overflow-hidden">
                  {book.gambar ? (
                    <img
                      src={book.gambar}
                      alt={book.judul}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-gray-400" />
                  )}
                  {book.jumlah === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <p className="text-white font-semibold">Stok Habis</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {book.judul}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{book.penulis}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {book.kategori}
                    </span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {book.jumlah} tersedia
                    </span>
                  </div>

                  {/* View Button */}
                  <Button
                    onClick={() => router.push(`/dashboard/siswa/books/${book.id}`)}
                    className="w-full"
                    style={{ backgroundColor: '#1A3D64' }}
                  >
                    Lihat Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada buku yang cocok dengan pencarian Anda</p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            Menampilkan <span className="font-semibold">{filteredBooks.length}</span> dari{' '}
            <span className="font-semibold">{books.length}</span> buku
          </p>
        </div>
      </div>
    </div>
  );
}
