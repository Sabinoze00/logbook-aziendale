import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ChevronUp, ChevronDown, Download } from 'lucide-react'

interface DepartmentSummaryTableProps {
  data: Array<{
    reparto: string
    oreTotaliPeriodo: number
    oreFiltrate: number
    clientiSeguiti: number
    collaboratori: number
    macroAttivita: number
    costoTotale: number
    fatturatoTotale: number
    margine: number
    marginePercentuale: number
  }>
  isLoading?: boolean
}

type SortKey = 'reparto' | 'oreTotaliPeriodo' | 'oreFiltrate' | 'clientiSeguiti' | 'collaboratori' | 'macroAttivita' | 'costoTotale' | 'fatturatoTotale' | 'margine' | 'marginePercentuale'
type SortDirection = 'asc' | 'desc'

export function DepartmentSummaryTable({ data, isLoading }: DepartmentSummaryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Calculate totals
  const totals = {
    oreTotaliPeriodo: data.reduce((sum, row) => sum + row.oreTotaliPeriodo, 0),
    oreFiltrate: data.reduce((sum, row) => sum + row.oreFiltrate, 0),
    clientiSeguiti: data.reduce((sum, row) => sum + row.clientiSeguiti, 0),
    collaboratori: data.reduce((sum, row) => sum + row.collaboratori, 0),
    macroAttivita: data.reduce((sum, row) => sum + row.macroAttivita, 0),
    costoTotale: data.reduce((sum, row) => sum + row.costoTotale, 0),
    fatturatoTotale: data.reduce((sum, row) => sum + row.fatturatoTotale, 0),
    margine: 0,
    marginePercentuale: 0
  }

  totals.margine = totals.fatturatoTotale - totals.costoTotale
  totals.marginePercentuale = totals.fatturatoTotale > 0 ? (totals.margine / totals.fatturatoTotale) * 100 : 0

  // Sort data based on current sort settings
  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0

    let aValue = a[sortKey]
    let bValue = b[sortKey]

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

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
    const headers = ['Reparto', 'Ore Totali nel Periodo', 'Ore Lavorate (Filtrate)', 'Clienti Seguiti', 'Collaboratori', 'Macro Attività', 'Costo Totale', 'Fatturato Totale', 'Margine €', 'Margine %']
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        `"${row.reparto}"`,
        row.oreTotaliPeriodo.toFixed(1),
        row.oreFiltrate.toFixed(1),
        row.clientiSeguiti,
        row.collaboratori,
        row.macroAttivita,
        row.costoTotale.toFixed(2),
        row.fatturatoTotale.toFixed(2),
        row.margine.toFixed(2),
        row.marginePercentuale.toFixed(1)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `riepilogo_reparti_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Helper function to render sortable header
  const renderSortableHeader = (label: string, key: SortKey) => (
    <th className="text-right py-3 px-4 font-medium text-black">
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
          <CardTitle>Riepilogo Reparti</CardTitle>
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
          <CardTitle>Riepilogo Reparti</CardTitle>
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
        <CardTitle>Riepilogo Reparti</CardTitle>
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
                <th className="text-left py-3 px-4 font-medium text-black">
                  <button
                    onClick={() => handleSort('reparto')}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Reparto
                    {sortKey === 'reparto' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                {renderSortableHeader('Ore Tot. nel Periodo', 'oreTotaliPeriodo')}
                {renderSortableHeader('Ore Lavorate (Filtrate)', 'oreFiltrate')}
                {renderSortableHeader('Clienti Seguiti', 'clientiSeguiti')}
                {renderSortableHeader('Collaboratori', 'collaboratori')}
                {renderSortableHeader('Macro Attività', 'macroAttivita')}
                {renderSortableHeader('Costo Totale', 'costoTotale')}
                {renderSortableHeader('Fatturato Totale', 'fatturatoTotale')}
                {renderSortableHeader('Margine €', 'margine')}
                {renderSortableHeader('Margine %', 'marginePercentuale')}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-black">{row.reparto}</td>
                  <td className="py-3 px-4 text-right text-black">{row.oreTotaliPeriodo.toFixed(1)} h</td>
                  <td className="py-3 px-4 text-right text-black">{row.oreFiltrate.toFixed(1)} h</td>
                  <td className="py-3 px-4 text-right text-black">{row.clientiSeguiti}</td>
                  <td className="py-3 px-4 text-right text-black">{row.collaboratori}</td>
                  <td className="py-3 px-4 text-right text-black">{row.macroAttivita}</td>
                  <td className="py-3 px-4 text-right text-black">{formatCurrency(row.costoTotale)}</td>
                  <td className="py-3 px-4 text-right text-black">{formatCurrency(row.fatturatoTotale)}</td>
                  <td className={`py-3 px-4 text-right font-medium ${row.margine >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(row.margine)}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${row.marginePercentuale >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.marginePercentuale.toFixed(1)}%
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
                <td className="py-3 px-4 text-black">TOTALE</td>
                <td className="py-3 px-4 text-right text-black">{totals.oreTotaliPeriodo.toFixed(1)} h</td>
                <td className="py-3 px-4 text-right text-black">{totals.oreFiltrate.toFixed(1)} h</td>
                <td className="py-3 px-4 text-right text-black">{totals.clientiSeguiti}</td>
                <td className="py-3 px-4 text-right text-black">{totals.collaboratori}</td>
                <td className="py-3 px-4 text-right text-black">{totals.macroAttivita}</td>
                <td className="py-3 px-4 text-right text-black">{formatCurrency(totals.costoTotale)}</td>
                <td className="py-3 px-4 text-right text-black">{formatCurrency(totals.fatturatoTotale)}</td>
                <td className={`py-3 px-4 text-right font-medium ${totals.margine >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.margine)}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${totals.marginePercentuale >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totals.marginePercentuale.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}