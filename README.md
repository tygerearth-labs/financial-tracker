# Financial Tracker

Aplikasi pencatatan keuangan modern dengan dukungan multi-profil, built with Next.js 15, TypeScript, Tailwind CSS, dan shadcn/ui.

## ✨ Fitur Utama

### 🎯 Multi-Profile Support
- Kelola keuangan untuk beberapa profil (Profil 1, Profil 2, Profil 3, dll)
- Data terisolasi untuk setiap profil
- Switch profile dengan mudah dari dropdown di pojok kanan atas
- CRUD Profile management (Tambah, Edit, Hapus)

### 💰 Kas Masuk (Income)
- Form pemasukan dengan kategori
- Edit dan Delete data
- Management kategori pemasukan
- Filter berdasarkan tanggal
- Tampilan tabel dengan warna kategori

### 💸 Kas Keluar (Expense)
- Form pengeluaran dengan kategori
- Edit dan Delete data
- Management kategori pengeluaran
- Filter berdasarkan tanggal
- Tampilan tabel dengan warna kategori

### 🎯 Target Tabungan (Savings)
- Set target tabungan dengan tujuan tertentu
- Jangka waktu dan nominal target
- Sistem alokasi berdasarkan persentase dari kas masuk
- Progress tracking visual
- Management target (Tambah, Edit, Hapus)

### 📊 Laporan (Reports)
- Tabel lengkap kas masuk dan keluar
- Ringkasan target tabungan
- Export data ke Excel/CSV
- Total income, expense, dan balance

### 🎨 User Experience
- **Responsive Design**: Works on mobile and desktop
- **Dark/Light Theme**: Toggle theme dengan tombol di header
- **Modern UI**: Built with shadcn/ui components
- **Sticky Footer**: Footer selalu di bawah
- **Clean Layout**: Simple minimalist design

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.7 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **State Management**: React Context (Profile), Local Storage
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📁 Struktur Project

```
my-project/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── app/
│   │   ├── api/                   # API Routes
│   │   │   ├── profiles/          # Profile CRUD
│   │   │   ├── income/            # Income CRUD
│   │   │   ├── expense/           # Expense CRUD
│   │   │   ├── categories/        # Category CRUD
│   │   │   └── savings/           # Savings CRUD
│   │   ├── income/                # Income page
│   │   ├── expense/               # Expense page
│   │   ├── savings/               # Savings page
│   │   ├── reports/               # Reports page
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Dashboard page
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── providers/             # Theme provider
│   │   └── FinancialTrackerApp.tsx # Main app shell
│   ├── contexts/
│   │   └── ProfileContext.tsx      # Profile state management
│   ├── hooks/
│   │   └── use-toast.ts           # Toast hook
│   └── lib/
│       ├── db.ts                  # Prisma client
│       └── utils.ts               # Utilities
├── public/                        # Static assets
├── INSTALLATION.md                # Installation guide
└── package.json                   # Dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd my-project

# Install dependencies
bun install

# Setup database
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 Pages Overview

### 1. Dashboard (`/`)
- Quick stats (Total Balance, Income, Expense, Savings Progress)
- Financial health ratios (Savings rate, Expense ratio)
- Cash flow charts (monthly income vs expense)
- Income and expense distribution by category (pie charts)
- Savings target progress cards
- Debt/credit ratio analysis
- Global economic news feed
- Filter by month, year, or all data
- Profile-based filtering

### 2. Kas Masuk (`/income`)
- Form tambah kas masuk
- Tabel riwayat kas masuk
- Kategori management
- Edit/Delete functionality

### 3. Kas Keluar (`/expense`)
- Form tambah kas keluar
- Tabel riwayat kas keluar
- Kategori management
- Edit/Delete functionality

### 4. Target Tabungan (`/savings`)
- Form set target tabungan
- Progress tracking cards
- Alokasi persentase
- Edit/Delete functionality

### 5. Laporan (`/reports`)
- Summary cards (Total Income, Expense, Balance)
- Tabbed interface for different data types
- Export to CSV/Excel
- Comprehensive data tables

## 🔌 API Routes

### Profiles
- `GET /api/profiles` - Get all profiles
- `POST /api/profiles` - Create new profile
- `GET /api/profiles/[id]` - Get single profile
- `PATCH /api/profiles/[id]` - Update profile
- `DELETE /api/profiles/[id]` - Delete profile

### Categories
- `GET /api/categories?type=INCOME|EXPENSE` - Get categories
- `POST /api/categories` - Create category
- `PATCH /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Income
- `GET /api/income?profileId=X&month=Y&year=Z` - Get income records
- `POST /api/income` - Create income record
- `GET /api/income/[id]` - Get single income
- `PATCH /api/income/[id]` - Update income
- `DELETE /api/income/[id]` - Delete income

### Expense
- `GET /api/expense?profileId=X&month=Y&year=Z` - Get expense records
- `POST /api/expense` - Create expense record
- `GET /api/expense/[id]` - Get single expense
- `PATCH /api/expense/[id]` - Update expense
- `DELETE /api/expense/[id]` - Delete expense

### Savings
- `GET /api/savings?profileId=X` - Get savings targets
- `POST /api/savings` - Create savings target
- `GET /api/savings/[id]` - Get single savings target
- `PATCH /api/savings/[id]` - Update savings target
- `DELETE /api/savings/[id]` - Delete savings target

### News
- `GET /api/news` - Get global economic news

## 🌐 Deployment

### Vercel (Recommended)
See [INSTALLATION.md](./INSTALLATION.md) for detailed instructions.

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

## 🎨 Customization

### Colors & Theme
Edit `src/app/globals.css` for theme customization.

### Components
All UI components are in `src/components/ui/` using shadcn/ui.

## 📄 License

Created by **Tyger Earth | Ahtjong Labs**

© 2024 Financial Tracker. All rights reserved.

## 🤝 Contributing

This is a personal project. For contributions, please contact the creator.

## 📞 Support

For installation and deployment help, see [INSTALLATION.md](./INSTALLATION.md).

---

**Built with ❤️ using Next.js, TypeScript, and shadcn/ui**
