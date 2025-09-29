import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPIData } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface MetricsCardsProps {
  kpis: KPIData
  isLoading?: boolean
}

export function MetricsCards({ kpis, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
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
            <p className="text-xs text-gray-900">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}