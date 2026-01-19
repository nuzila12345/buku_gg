'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Member {
  id: string
  username: string
  nama: string
  email?: string
  alamat?: string
  telepon?: string
  createdAt: string
  _count: { transactions: number }
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    email: '',
    alamat: '',
    telepon: '',
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [search, members])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      const data = await res.json()
      setMembers(data.members || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching members:', error)
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    if (search) {
      filtered = filtered.filter(
        (member) =>
          member.nama.toLowerCase().includes(search.toLowerCase()) ||
          member.username.toLowerCase().includes(search.toLowerCase()) ||
          member.email?.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredMembers(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingMember
        ? `/api/members/${editingMember.id}`
        : '/api/members'
      const method = editingMember ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }

      await fetchMembers()
      resetForm()
      alert(editingMember ? 'Anggota berhasil diupdate' : 'Anggota berhasil ditambahkan')
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setFormData({
      username: member.username,
      password: '',
      nama: member.nama,
      email: member.email || '',
      alamat: member.alamat || '',
      telepon: member.telepon || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota ini?')) return

    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Terjadi kesalahan')
        return
      }
      await fetchMembers()
      alert('Anggota berhasil dihapus')
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nama: '',
      email: '',
      alamat: '',
      telepon: '',
    })
    setEditingMember(null)
    setShowForm(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1A3D64' }}>
              Kelola Anggota
            </h1>
            <p className="text-muted-foreground mt-2">
              Kelola data anggota perpustakaan
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: '#1A3D64' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Anggota
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Username *</label>
                    <Input
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Password {editingMember ? '(kosongkan jika tidak diubah)' : '*'}
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!editingMember}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nama Lengkap *</label>
                    <Input
                      value={formData.nama}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alamat</label>
                    <Input
                      value={formData.alamat}
                      onChange={(e) =>
                        setFormData({ ...formData, alamat: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telepon</label>
                    <Input
                      value={formData.telepon}
                      onChange={(e) =>
                        setFormData({ ...formData, telepon: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="submit"
                    style={{ backgroundColor: '#1A3D64' }}
                  >
                    {editingMember ? 'Update' : 'Tambah'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Daftar Anggota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cari anggota..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Total Peminjaman</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.username}
                        </TableCell>
                        <TableCell>{member.nama}</TableCell>
                        <TableCell>{member.email || '-'}</TableCell>
                        <TableCell>{member.telepon || '-'}</TableCell>
                        <TableCell>{member._count.transactions}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(member)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

