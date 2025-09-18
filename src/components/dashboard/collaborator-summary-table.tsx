import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface CollaboratorSummaryTableProps {
  data: Array<{
    collaboratore: string
    compensoTotale: number
    oreTotaliPeriodo: number
    costoOrarioEffettivo: number
    oreFiltrate: number
    clientiSeguiti: number
  }>
}

export function CollaboratorSummaryTable({ data }: CollaboratorSummaryTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo Collaboratori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            Nessun dato disponibile
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riepilogo Collaboratori</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Collaboratore</th>
                <th className="text-right py-3 px-4 font-medium">Compenso Tot. nei Mesi Sel.</th>
                <th className="text-right py-3 px-4 font-medium">Ore Tot. nel Periodo</th>
                <th className="text-right py-3 px-4 font-medium">Costo Orario Effettivo</th>
                <th className="text-right py-3 px-4 font-medium">Ore Lavorate (Filtrate)</th>
                <th className="text-right py-3 px-4 font-medium">Clienti Seguiti (Filtrati)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{row.collaboratore}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(row.compensoTotale)}</td>
                  <td className="py-3 px-4 text-right">{row.oreTotaliPeriodo.toFixed(1)} h</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(row.costoOrarioEffettivo)}</td>
                  <td className="py-3 px-4 text-right">{row.oreFiltrate.toFixed(1)} h</td>
                  <td className="py-3 px-4 text-right">{row.clientiSeguiti}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}