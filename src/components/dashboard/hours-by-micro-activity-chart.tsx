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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Distribuzione Ore per Micro Attività</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <CardTitle className="text-xl font-bold text-gray-800">Distribuzione Ore per Micro Attività</CardTitle>
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
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          Distribuzione Ore per Micro Attività
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
              outerRadius={160}
              innerRadius={70}
              fill="#8884d8"
              dataKey="ore"
              nameKey="microAttivita"
            >
              {preparedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
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