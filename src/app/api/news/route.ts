import { NextResponse } from 'next/server'

// API route to fetch global economic news
export async function GET() {
  try {
    // Using web-search skill to fetch economic news
    // This is a simplified version - in production you might want to use a dedicated news API
    const searchResults = await fetchEconomicNews()

    return NextResponse.json(searchResults)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

async function fetchEconomicNews() {
  // Simulate news data for now - in production you would use a real news API
  // This is a placeholder to demonstrate the functionality
  const mockNews = [
    {
      title: 'Pertumbuhan Ekonomi Global Membaik di Q4 2024',
      description: 'Laporan terbaru menunjukkan pemulihan ekonomi global dengan pertumbuhan yang positif di berbagai sektor utama.',
      url: 'https://example.com/news1',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Bank SentraI Tetapkan Suku Bunga Stabil',
      description: 'Keputusan bank sentral mempertahankan suku bunga untuk menjaga stabilitas ekonomi dan mengendalikan inflasi.',
      url: 'https://example.com/news2',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Pasar Saham Global Mengalami Kenaikan',
      description: 'Indeks saham global menunjukkan tren positif didukung oleh kinerja perusahaan yang baik dan sentimen investor yang optimis.',
      url: 'https://example.com/news3',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: 'Harga Komoditas Mulai Stabil Setelah Volatilitas',
      description: 'Setelah periode volatilitas yang tinggi, harga komoditas utama mulai menunjukkan stabilitas yang lebih baik.',
      url: 'https://example.com/news4',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  return mockNews
}
