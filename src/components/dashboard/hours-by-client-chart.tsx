'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HoursByClientChartProps {
  data: Array<{ cliente: string; ore: number }>
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d084d0'
]

export function HoursByClientChart({ data }: HoursByClientChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Ore per Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            Nessun dato disponibile
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for pie chart, grouping small clients into "Altri"
  const preparedData = (() => {
    const sortedData = [...data].sort((a, b) => b.ore - a.ore)

    if (sortedData.length <= 10) {
      return sortedData
    }

    const topClients = sortedData.slice(0, 9)
    const othersHours = sortedData.slice(9).reduce((sum, client) => sum + client.ore, 0)

    return [
      ...topClients,
      { cliente: 'Altri', ore: othersHours }
    ]
  })()

  const formatTooltip = (value: any, name: string) => {
    if (name === 'ore') {
      return [`${value.toFixed(1)} ore`, 'Ore Lavorate']
    }
    return [value, name]
  }

  const renderCustomizedLabel = (entry: any) => {
    const total = preparedData.reduce((sum, item) => sum + item.ore, 0)
    const percent = ((entry.ore / total) * 100).toFixed(1)
    return `${percent}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione Ore per Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={preparedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              innerRadius={40}
              fill="#8884d8"
              dataKey="ore"
            >
              {preparedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}