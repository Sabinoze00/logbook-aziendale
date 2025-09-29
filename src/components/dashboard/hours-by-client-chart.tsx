'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HoursByClientChartProps {
  data: Array<{ cliente: string; ore: number }>
  isLoading?: boolean
  onPieClick?: (cliente: string) => void
}

const BASE_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d084d0'
]

// Generate dynamic colors using HSL for better variety
const generateColors = (count: number): string[] => {
  if (count <= BASE_COLORS.length) {
    return BASE_COLORS.slice(0, count)
  }

  const colors = [...BASE_COLORS]
  const additionalColors = count - BASE_COLORS.length

  for (let i = 0; i < additionalColors; i++) {
    // Generate colors with good contrast and variety
    const hue = (i * 137.5) % 360 // Golden angle approximation for good distribution
    const saturation = 60 + (i % 3) * 15 // Vary saturation between 60-90%
    const lightness = 45 + (i % 4) * 10 // Vary lightness between 45-75%
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
  }

  return colors
}

export function HoursByClientChart({ data, isLoading, onPieClick }: HoursByClientChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Ore per Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] items-center justify-center text-muted-foreground">
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
          <CardTitle>Distribuzione Ore per Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] items-center justify-center text-muted-foreground">
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

  const formatTooltip = (value: number, name: string) => {
    if (name === 'ore') {
      return [`${value.toFixed(1)} ore`, 'Ore Lavorate']
    }
    return [value, name]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomizedLabel = (entry: any) => {
    const total = preparedData.reduce((sum, item) => sum + item.ore, 0)
    const percent = ((entry.ore / total) * 100).toFixed(1)
    return `${percent}%`
  }

  // Generate colors based on the number of data points
  const chartColors = generateColors(preparedData.length)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione Ore per Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(payload: any) => {
                if (onPieClick && payload && payload.cliente) {
                  onPieClick(payload.cliente)
                }
              }}
              style={{ cursor: onPieClick ? 'pointer' : 'default' }}
            >
              {preparedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index]} />
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