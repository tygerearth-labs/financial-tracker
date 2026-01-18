'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import FinancialTrackerApp from '@/components/FinancialTrackerApp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { ArrowUpCircle, Plus, Edit, Trash2, FolderPlus } from 'lucide-react'
import { format } from 'date-fns'

interface Category {
  id: string
  name: string
  type: string
  color: string
}

interface Expense {
  id: string
  amount: number
  description: string | null
  date: Date
  category: Category
}

export default function ExpensePage() {
  const { activeProfile } = useProfile()
  const [expenseList, setExpenseList] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
  })
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#ef4444',
  })

  useEffect(() => {
    if (activeProfile) {
      loadExpense()
      loadCategories()
    }
  }, [activeProfile])

  const loadExpense = async () => {
    if (!activeProfile) return
    try {
      const response = await fetch(`/api/expense?profileId=${activeProfile.id}`)
      if (response.ok) {
        const data = await response.json()
        setExpenseList(data)
      }
    } catch (error) {
      console.error('Error loading expense:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=EXPENSE')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleCreateExpense = async () => {
    if (!activeProfile) return

    try {
      const response = await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseForm,
          profileId: activeProfile.id,
        }),
      })

      if (response.ok) {
        await loadExpense()
        setExpenseForm({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          categoryId: '',
        })
        setDialogOpen(false)
        toast({
          title: 'Berhasil',
          description: 'Data kas keluar telah ditambahkan',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menambahkan data kas keluar',
        variant: 'destructive',
      })
    }
  }

  const handleEditExpense = async () => {
    if (!editingExpense) return

    try {
      const response = await fetch(`/api/expense/${editingExpense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      })

      if (response.ok) {
        await loadExpense()
        setExpenseForm({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          categoryId: '',
        })
        setEditingExpense(null)
        setDialogOpen(false)
        toast({
          title: 'Berhasil',
          description: 'Data kas keluar telah diperbarui',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui data kas keluar',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expense/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadExpense()
        toast({
          title: 'Berhasil',
          description: 'Data kas keluar telah dihapus',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus data kas keluar',
        variant: 'destructive',
      })
    }
  }

  const handleCreateCategory = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...categoryForm,
          type: 'EXPENSE',
        }),
      })

      if (response.ok) {
        await loadCategories()
        setCategoryForm({ name: '', color: '#ef4444' })
        setCategoryDialogOpen(false)
        toast({
          title: 'Berhasil',
          description: 'Kategori baru telah dibuat',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal membuat kategori',
        variant: 'destructive',
      })
    }
  }

  const openCreateDialog = () => {
    setEditingExpense(null)
    setExpenseForm({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
    })
    setDialogOpen(true)
  }

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense)
    setExpenseForm({
      amount: expense.amount.toString(),
      description: expense.description || '',
      date: new Date(expense.date).toISOString().split('T')[0],
      categoryId: expense.category.id,
    })
    setDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (!activeProfile) {
    return <FinancialTrackerApp><div /></FinancialTrackerApp>
  }

  return (
    <FinancialTrackerApp>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kas Keluar</h1>
            <p className="text-muted-foreground mt-2">
              Kelola semua pengeluaran keuangan Anda
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Kategori
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Kategori Baru</DialogTitle>
                  <DialogDescription>
                    Buat kategori untuk mengelompokkan kas keluar
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Nama Kategori</Label>
                    <Input
                      id="categoryName"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="Contoh: Makanan, Transportasi, dll"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryColor">Warna</Label>
                    <Input
                      id="categoryColor"
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <Button onClick={handleCreateCategory} className="w-full">
                    Buat Kategori
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kas Keluar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingExpense ? 'Edit Kas Keluar' : 'Tambah Kas Keluar'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingExpense ? 'Edit data kas keluar Anda' : 'Tambah data kas keluar baru'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah (Rp)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input
                      id="date"
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Kategori</Label>
                    <Select
                      value={expenseForm.categoryId}
                      onValueChange={(value) => setExpenseForm({ ...expenseForm, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Textarea
                      id="description"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                      placeholder="Deskripsi kas keluar"
                    />
                  </div>
                  <Button
                    onClick={editingExpense ? handleEditExpense : handleCreateExpense}
                    className="w-full"
                  >
                    {editingExpense ? 'Simpan Perubahan' : 'Tambah Kas Keluar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Kas Keluar</CardTitle>
            <CardDescription>
              Daftar semua transaksi kas keluar Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto">
              {expenseList.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ArrowUpCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Belum ada data kas keluar</p>
                  <p className="text-sm mt-2">Klik tombol tambah untuk memulai</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseList.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{expense.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: expense.category.color }}
                            />
                            {expense.category.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FinancialTrackerApp>
  )
}
