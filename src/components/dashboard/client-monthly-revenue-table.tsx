import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ChevronUp, ChevronDown, Download } from 'lucide-react'

interface ClientMonthlyRevenueTableProps {
  data: Array<{
    cliente: string
    monthlyRevenue: Record<string, number>
    totale: number
  }>
  isLoading?: boolean
}

type SortKey = 'cliente' | 'totale' | string // string for dynamic month columns
type SortDirection = 'asc' | 'desc'

export function ClientMonthlyRevenueTable({ data, isLoading }: ClientMonthlyRevenueTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('cliente')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Get all unique months across all clients
  const allMonths = useMemo(() => {
    if (data.length === 0) return []
    const monthsSet = new Set<string>()
    data.forEach(row => {
      Object.keys(row.monthlyRevenue).forEach(month => monthsSet.add(month))
    })
    return Array.from(monthsSet).sort()
  }, [data])

  // Calculate totals row
  const totalsRow = useMemo(() => {
    const monthlyTotals: Record<string, number> = {}
    let grandTotal = 0

    allMonths.forEach(month => {
      monthlyTotals[month] = data.reduce((sum, row) => sum + (row.monthlyRevenue[month] || 0), 0)
      grandTotal += monthlyTotals[month]
    })

    return {
      monthlyTotals,
      grandTotal
    }
  }, [data, allMonths])

  // Sort data based on current sort settings
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      if (sortKey === 'cliente') {
        aValue = a.cliente.toLowerCase()
        bValue = b.cliente.toLowerCase()
      } else if (sortKey === 'totale') {
        aValue = a.totale
        bValue = b.totale
      } else {
        // Sorting by a month column
        aValue = a.monthlyRevenue[sortKey] || 0
        bValue = b.monthlyRevenue[sortKey] || 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortDirection])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  // CSV Export function
  const exportToCSV = () => {
    const headers = ['Cliente', ...allMonths, 'Totale']
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        `"${row.cliente}"`,
        ...allMonths.map(month => (row.monthlyRevenue[month] || 0).toFixed(2)),
        row.totale.toFixed(2)
      ].join(',')),
      // Totals row
      [
        '"TOTALE"',
        ...allMonths.map(month => totalsRow.monthlyTotals[month].toFixed(2)),
        totalsRow.grandTotal.toFixed(2)
      ].join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `fatturato_mensile_clienti_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Helper function to render sortable header
  const renderSortableHeader = (label: string, key: SortKey) => (
    <th className="text-right py-3 px-4 font-medium text-black min-w-[120px]">
      <button
        onClick={() => handleSort(key)}
        className="flex items-center gap-1 hover:text-blue-600 transition-colors ml-auto"
      >
        {label}
        {sortKey === key && (
          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </button>
    </th>
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fatturato Mensile per Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-gray-900">
            Caricamento dati...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fatturato Mensile per Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-gray-900">
            Nessun dato disponibile
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fatturato Mensile per Cliente</CardTitle>
        <Button onClick={exportToCSV} size="sm" variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Esporta CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-black sticky left-0 bg-white z-10">
                  <button
                    onClick={() => handleSort('cliente')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Cliente
                    {sortKey === 'cliente' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                {allMonths.map(month => renderSortableHeader(month, month))}
                {renderSortableHeader('Totale', 'totale')}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-black sticky left-0 bg-white">{row.cliente}</td>
                  {allMonths.map(month => (
                    <td key={month} className="py-3 px-4 text-right text-black">
                      {formatCurrency(row.monthlyRevenue[month] || 0)}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right font-semibold text-black">
                    {formatCurrency(row.totale)}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
                <td className="py-3 px-4 text-black sticky left-0 bg-gray-100">TOTALE</td>
                {allMonths.map(month => (
                  <td key={month} className="py-3 px-4 text-right text-black">
                    {formatCurrency(totalsRow.monthlyTotals[month])}
                  </td>
                ))}
                <td className="py-3 px-4 text-right text-black">
                  {formatCurrency(totalsRow.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}