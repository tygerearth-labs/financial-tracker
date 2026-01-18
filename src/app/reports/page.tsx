'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import FinancialTrackerApp from '@/components/FinancialTrackerApp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowDownCircle, ArrowUpCircle, Target, Download } from 'lucide-react'
import { format } from 'date-fns'

interface Category {
  id: string
  name: string
  type: string
  color: string
}

interface Income {
  id: string
  amount: number
  description: string | null
  date: Date
  category: Category
}

interface Expense {
  id: string
  amount: number
  description: string | null
  date: Date
  category: Category
}

interface SavingsTarget {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  startDate: Date
  targetDate: Date
  allocationPercent: number
}

export default function ReportsPage() {
  const { activeProfile } = useProfile()
  const [incomeList, setIncomeList] = useState<Income[]>([])
  const [expenseList, setExpenseList] = useState<Expense[]>([])
  const [savingsList, setSavingsList] = useState<SavingsTarget[]>([])

  useEffect(() => {
    if (activeProfile) {
      loadAllData()
    }
  }, [activeProfile])

  const loadAllData = async () => {
    if (!activeProfile) return

    try {
      const [incomeRes, expenseRes, savingsRes] = await Promise.all([
        fetch(`/api/income?profileId=${activeProfile.id}`),
        fetch(`/api/expense?profileId=${activeProfile.id}`),
        fetch(`/api/savings?profileId=${activeProfile.id}`),
      ])

      if (incomeRes.ok) setIncomeList(await incomeRes.json())
      if (expenseRes.ok) setExpenseList(await expenseRes.json())
      if (savingsRes.ok) setSavingsList(await savingsRes.json())
    } catch (error) {
      console.error('Error loading reports data:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const exportToCSV = (data: any[], filename: string, type: 'income' | 'expense' | 'savings') => {
    let csv = ''

    if (type === 'income' || type === 'expense') {
      csv = 'Tanggal,Deskripsi,Kategori,Jumlah\n'
      csv += data.map((item: Income | Expense) => {
        return [
          format(new Date(item.date), 'dd/MM/yyyy'),
          item.description || '-',
          item.category.name,
          item.amount,
        ].join(',')
      }).join('\n')
    } else if (type === 'savings') {
      csv = 'Nama Target,Jumlah Target,Jumlah Saat Ini,Tanggal Mulai,Tanggal Target,Persentase Alokasi\n'
      csv += data.map((item: SavingsTarget) => {
        return [
          item.name,
          item.targetAmount,
          item.currentAmount,
          format(new Date(item.startDate), 'dd/MM/yyyy'),
          format(new Date(item.targetDate), 'dd/MM/yyyy'),
          `${item.allocationPercent}%`,
        ].join(',')
      }).join('\n')
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportAllToCSV = () => {
    // Export income
    if (incomeList.length > 0) {
      exportToCSV(incomeList, `kas-masuk-${activeProfile?.name}`, 'income')
    }

    // Export expense
    if (expenseList.length > 0) {
      exportToCSV(expenseList, `kas-keluar-${activeProfile?.name}`, 'expense')
    }

    // Export savings
    if (savingsList.length > 0) {
      exportToCSV(savingsList, `target-tabungan-${activeProfile?.name}`, 'savings')
    }

    if (incomeList.length === 0 && expenseList.length === 0 && savingsList.length === 0) {
      alert('Tidak ada data untuk diekspor')
    }
  }

  const calculateTotalIncome = () => {
    return incomeList.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTotalExpense = () => {
    return expenseList.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateBalance = () => {
    return calculateTotalIncome() - calculateTotalExpense()
  }

  if (!activeProfile) {
    return <FinancialTrackerApp><div /></FinancialTrackerApp>
  }

  return (
    <FinancialTrackerApp>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
            <p className="text-muted-foreground mt-2">
              Ringkasan dan laporan keuangan lengkap
            </p>
          </div>
          <Button onClick={exportAllToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export Semua Data
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kas Masuk</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(calculateTotalIncome())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kas Keluar</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(calculateTotalExpense())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${calculateBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculateBalance())}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Tables */}
        <Tabs defaultValue="income" className="space-y-4">
          <TabsList>
            <TabsTrigger value="income">Kas Masuk</TabsTrigger>
            <TabsTrigger value="expense">Kas Keluar</TabsTrigger>
            <TabsTrigger value="savings">Target Tabungan</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Riwayat Kas Masuk</CardTitle>
                    <CardDescription>
                      Daftar semua transaksi pemasukan
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(incomeList, `kas-masuk-${activeProfile.name}`, 'income')}
                    disabled={incomeList.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto">
                  {incomeList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ArrowDownCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Belum ada data kas masuk</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incomeList.map((income) => (
                          <TableRow key={income.id}>
                            <TableCell>{format(new Date(income.date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{income.description || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: income.category.color }}
                                />
                                {income.category.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(income.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expense" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Riwayat Kas Keluar</CardTitle>
                    <CardDescription>
                      Daftar semua transaksi pengeluaran
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(expenseList, `kas-keluar-${activeProfile.name}`, 'expense')}
                    disabled={expenseList.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto">
                  {expenseList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ArrowUpCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Belum ada data kas keluar</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="savings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Target Tabungan</CardTitle>
                    <CardDescription>
                      Daftar semua target tabungan
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(savingsList, `target-tabungan-${activeProfile.name}`, 'savings')}
                    disabled={savingsList.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto">
                  {savingsList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Belum ada target tabungan</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Target</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Saat Ini</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Tanggal Target</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {savingsList.map((savings) => {
                          const progress = Math.min((savings.currentAmount / savings.targetAmount) * 100, 100)
                          return (
                            <TableRow key={savings.id}>
                              <TableCell className="font-medium">{savings.name}</TableCell>
                              <TableCell>{formatCurrency(savings.targetAmount)}</TableCell>
                              <TableCell>{formatCurrency(savings.currentAmount)}</TableCell>
                              <TableCell>{progress.toFixed(1)}%</TableCell>
                              <TableCell>
                                {format(new Date(savings.targetDate), 'dd/MM/yyyy')}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FinancialTrackerApp>
  )
}
