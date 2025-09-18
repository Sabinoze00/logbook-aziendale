import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPIData } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface MetricsCardsProps {
  kpis: KPIData
}

export function MetricsCards({ kpis }: MetricsCardsProps) {
  const metrics = [
    {
      title: "Ore Lavorate (Filtrate)",
      value: `${kpis.totalHours.toFixed(1)} h`,
      description: "Ore totali nel periodo filtrato"
    },
    {
      title: "Costo Orario Medio",
      value: formatCurrency(kpis.averageHourlyCost),
      description: "Costo medio per ora"
    },
    {
      title: "Costo Ore Filtrate",
      value: formatCurrency(kpis.filteredHoursCost),
      description: "Costo totale delle ore filtrate"
    },
    {
      title: "Fatturato Stimato",
      value: formatCurrency(kpis.totalRevenue),
      description: "Fatturato totale stimato"
    },
    {
      title: "Margine Stimato",
      value: `${formatCurrency(kpis.margin)} (${kpis.marginPercentage.toFixed(1)}%)`,
      description: "Margine di profitto stimato"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}