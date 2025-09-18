import { NextResponse } from 'next/server'
import { loadSheetsData } from '@/lib/google-sheets'

export async function GET() {
  try {
    if (!process.env.GOOGLE_SHEETS_URL) {
      return NextResponse.json(
        { error: 'Google Sheets URL not configured' },
        { status: 500 }
      )
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return NextResponse.json(
        { error: 'Google Service Account credentials not configured' },
        { status: 500 }
      )
    }

    const data = await loadSheetsData(process.env.GOOGLE_SHEETS_URL)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
      }
    })
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}