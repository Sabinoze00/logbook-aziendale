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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Distribuzione Ore per Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              Caricamento dati...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Distribuzione Ore per Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              Nessun dato disponibile
            </div>
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

  const totalHours = data.reduce((sum, item) => sum + item.ore, 0)

  const formatTooltip = (value: number) => {
    const percentage = totalHours > 0 ? ((value / totalHours) * 100).toFixed(1) : 0
    return `${value.toFixed(1)} ore (${percentage}%)`
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
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          Distribuzione Ore per Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={550}>
          <PieChart>
            <Pie
              data={preparedData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={160}
              innerRadius={70}
              fill="#8884d8"
              dataKey="ore"
              nameKey="cliente"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(payload: any) => {
                if (onPieClick && payload && payload.cliente) {
                  onPieClick(payload.cliente)
                }
              }}
              style={{ cursor: onPieClick ? 'pointer' : 'default' }}
            >
              {preparedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}