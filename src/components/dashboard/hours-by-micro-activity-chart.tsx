'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HoursByMicroActivityChartProps {
  data: Array<{ microAttivita: string; ore: number }>
  isLoading?: boolean
}

const BASE_COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d084d0']

const generateColors = (count: number): string[] => {
  if (count <= BASE_COLORS.length) return BASE_COLORS.slice(0, count)
  const colors = [...BASE_COLORS]
  for (let i = 0; i < count - BASE_COLORS.length; i++) {
    const hue = (i * 137.5) % 360
    colors.push(`hsl(${hue}, 70%, 50%)`)
  }
  return colors
}

export function HoursByMicroActivityChart({ data, isLoading }: HoursByMicroActivityChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Ore per Micro Attività</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] items-center justify-center text-black">
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
          <CardTitle>Distribuzione Ore per Micro Attività</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] items-center justify-center text-black">
            Nessun dato disponibile
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalHours = data.reduce((sum, item) => sum + item.ore, 0)

  const preparedData = (() => {
    const sortedData = [...data].sort((a, b) => b.ore - a.ore)
    if (sortedData.length <= 10) return sortedData
    const topActivities = sortedData.slice(0, 9)
    const othersHours = sortedData.slice(9).reduce((sum, activity) => sum + activity.ore, 0)
    return [...topActivities, { microAttivita: 'Altro', ore: othersHours }]
  })()

  const formatTooltip = (value: number) => {
    const percentage = totalHours > 0 ? ((value / totalHours) * 100).toFixed(1) : 0
    return `${value.toFixed(1)} ore (${percentage}%)`
  }

  const chartColors = generateColors(preparedData.length)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione Ore per Micro Attività</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <PieChart>
            <Pie
              data={preparedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              innerRadius={40}
              fill="#8884d8"
              dataKey="ore"
              nameKey="microAttivita"
            >
              {preparedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
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