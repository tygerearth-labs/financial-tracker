'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import FinancialTrackerApp from '@/components/FinancialTrackerApp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowDownCircle, ArrowUpCircle, Target, TrendingUp, PieChart, DollarSign, Calendar, TrendingDown, Globe } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
}

export default function DashboardPage() {
  const { activeProfile } = useProfile()
  const [loading, setLoading] = useState(true)
  const [incomeList, setIncomeList] = useState<Income[]>([])
  const [expenseList, setExpenseList] = useState<Expense[]>([])
  const [savingsList, setSavingsList] = useState<SavingsTarget[]>([])
  const [filterPeriod, setFilterPeriod] = useState<'month' | 'year' | 'all'>('month')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    if (activeProfile) {
      loadData()
      loadNews()
    }
  }, [activeProfile, filterPeriod, selectedMonth, selectedYear])

  const loadData = async () => {
    if (!activeProfile) return

    setLoading(true)
    try {
      const [incomeRes, expenseRes, savingsRes] = await Promise.all([
        fetch(`/api/income?profileId=${activeProfile.id}&month=${filterPeriod === 'month' ? selectedMonth : ''}&year=${filterPeriod === 'all' ? '' : selectedYear}`),
        fetch(`/api/expense?profileId=${activeProfile.id}&month=${filterPeriod === 'month' ? selectedMonth : ''}&year=${filterPeriod === 'all' ? '' : selectedYear}`),
        fetch(`/api/savings?profileId=${activeProfile.id}`),
      ])

      if (incomeRes.ok) setIncomeList(await incomeRes.json())
      if (expenseRes.ok) setExpenseList(await expenseRes.json())
      if (savingsRes.ok) setSavingsList(await savingsRes.json())
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNews = async () => {
    try {
      // Fetch global economic news using web-search skill
      const response = await fetch('/api/news')
      if (response.ok) {
        const data = await response.json()
        setNews(data)
      }
    } catch (error) {
      console.error('Error loading news:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateTotalIncome = () => incomeList.reduce((sum, item) => sum + item.amount, 0)
  const calculateTotalExpense = () => expenseList.reduce((sum, item) => sum + item.amount, 0)
  const calculateBalance = () => calculateTotalIncome() - calculateTotalExpense()

  // Financial health ratio (Savings Rate)
  const calculateSavingsRate = () => {
    const income = calculateTotalIncome()
    const expense = calculateTotalExpense()
    if (income === 0) return 0
    return ((income - expense) / income) * 100
  }

  // Debt/credit ratio (Expense/Income ratio)
  const calculateExpenseRatio = () => {
    const income = calculateTotalIncome()
    const expense = calculateTotalExpense()
    if (income === 0) return 0
    return (expense / income) * 100
  }

  // Group expenses by category
  const getExpenseByCategory = () => {
    const categoryMap: Record<string, number> = {}
    expenseList.forEach((expense) => {
      const categoryName = expense.category.name
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + expense.amount
    })
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      color: expenseList.find(e => e.category.name === name)?.category.color || '#000000'
    }))
  }

  // Group income by category
  const getIncomeByCategory = () => {
    const categoryMap: Record<string, number> = {}
    incomeList.forEach((income) => {
      const categoryName = income.category.name
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + income.amount
    })
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      color: incomeList.find(i => i.category.name === name)?.category.color || '#000000'
    }))
  }

  // Monthly trend data
  const getMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = selectedYear
    const data = []

    for (let i = 0; i < 12; i++) {
      const month = i + 1
      const monthIncome = incomeList.filter(item => {
        const date = new Date(item.date)
        return date.getMonth() + 1 === month && date.getFullYear() === currentYear
      }).reduce((sum, item) => sum + item.amount, 0)

      const monthExpense = expenseList.filter(item => {
        const date = new Date(item.date)
        return date.getMonth() + 1 === month && date.getFullYear() === currentYear
      }).reduce((sum, item) => sum + item.amount, 0)

      data.push({
        month: months[i],
        income: monthIncome,
        expense: monthExpense
      })
    }

    return data
  }

  const calculateSavingsProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  if (!activeProfile) {
    return null
  }

  const expenseByCategory = getExpenseByCategory()
  const incomeByCategory = getIncomeByCategory()
  const monthlyTrend = getMonthlyTrend()
  const savingsRate = calculateSavingsRate()
  const expenseRatio = calculateExpenseRatio()

  return (
    <FinancialTrackerApp>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Selamat datang di Financial Tracker untuk {activeProfile.name}
        </p>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <Select value={filterPeriod} onValueChange={(value: any) => setFilterPeriod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Bulanan</SelectItem>
                  <SelectItem value="year">Tahunan</SelectItem>
                  <SelectItem value="all">Semua Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filterPeriod === 'month' && (
              <div className="flex-1 min-w-[150px]">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(selectedYear, i).toLocaleString('id-ID', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(filterPeriod === 'month' || filterPeriod === 'year') && (
              <div className="flex-1 min-w-[150px]">
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${calculateBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculateBalance())}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filterPeriod === 'month' ? 'Bulan ini' : filterPeriod === 'year' ? 'Tahun ini' : 'Semua data'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kas Masuk</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotalIncome())}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filterPeriod === 'month' ? 'Bulan ini' : filterPeriod === 'year' ? 'Tahun ini' : 'Semua data'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kas Keluar</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(calculateTotalExpense())}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filterPeriod === 'month' ? 'Bulan ini' : filterPeriod === 'year' ? 'Tahun ini' : 'Semua data'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Tabungan</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {savingsRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {savingsRate >= 20 ? 'Sangat baik' : savingsRate >= 10 ? 'Baik' : 'Perlu ditingkatkan'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Ratios */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Rasio Kesehatan Keuangan
            </CardTitle>
            <CardDescription>
              Indikator kesehatan keuangan Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tingkat Tabungan</span>
                    <span className={`font-medium ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {savingsRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(savingsRate, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Ideal: ≥ 20% | Baik: 10-20% | Perlu ditingkatkan: {"<"} 10%
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rasio Pengeluaran</span>
                    <span className={`font-medium ${expenseRatio <= 70 ? 'text-green-600' : expenseRatio <= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {expenseRatio.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(expenseRatio, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Ideal: ≤ 70% | Baik: 70-90% | Perlu ditingkatkan: {">"} 90%
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Rasio Hutang Piutang
            </CardTitle>
            <CardDescription>
              Analisis hutang dan piutang Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="text-center py-6">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {(calculateTotalIncome() - calculateTotalExpense() >= 0 ? '0' : 'N/A')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Hutang Aktif
                    </p>
                  </div>
                  <div className="text-center py-4 border-t">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {formatCurrency(calculateTotalIncome())}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Piutang (Kas Masuk)
                    </p>
                  </div>
                  <div className="text-center py-4 border-t">
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      {formatCurrency(calculateTotalExpense())}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Hutang (Kas Keluar)
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Grafik Arus Kas</CardTitle>
            <CardDescription>
              Perbandingan kas masuk dan keluar per bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Kas Masuk" fill="#10b981" />
                    <Bar dataKey="expense" name="Kas Keluar" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Pengeluaran</CardTitle>
            <CardDescription>
              Komposisi pengeluaran berdasarkan kategori
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : expenseByCategory.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Belum ada data pengeluaran</p>
                </div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Income Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Pemasukan</CardTitle>
          <CardDescription>
            Komposisi pemasukan berdasarkan kategori
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : incomeByCategory.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <PieChart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Belum ada data pemasukan</p>
              </div>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Savings Targets Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progress Target Tabungan
          </CardTitle>
          <CardDescription>
            Pantau pencapaian target tabungan Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : savingsList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada target tabungan</p>
              <p className="text-sm mt-2">Buat target tabungan untuk memulai</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savingsList.map((savings) => {
                const progress = calculateSavingsProgress(savings.currentAmount, savings.targetAmount)
                return (
                  <div key={savings.id} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h4 className="font-semibold">{savings.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(savings.currentAmount)} / {formatCurrency(savings.targetAmount)}
                      </p>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={`font-medium ${progress >= 100 ? 'text-green-600' : ''}`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    {savings.allocationPercent > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Alokasi</span>
                        <span className="font-medium text-primary">{savings.allocationPercent}%</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Economic News */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Berita Ekonomi Global
          </CardTitle>
          <CardDescription>
            Update terbaru seputar ekonomi dan keuangan global
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Tidak ada berita tersedia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(item.publishedAt).toLocaleString('id-ID', { dateStyle: 'medium' })}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Baca selengkapnya
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </FinancialTrackerApp>
  )
}
