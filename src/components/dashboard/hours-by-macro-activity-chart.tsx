'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HoursByMacroActivityChartProps {
  data: Array<{ macroAttivita: string; ore: number }>
  isLoading?: boolean
  onPieClick?: (macroAttivita: string) => void
}

const ACTIVITY_COLORS = [
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#F97316', // Orange
  '#8B5A2B', // Brown
  '#6B7280', // Gray
  '#14B8A6', // Teal
]

// Generate dynamic colors using vibrant HSL
const generateActivityColors = (count: number): string[] => {
  if (count <= ACTIVITY_COLORS.length) {
    return ACTIVITY_COLORS.slice(0, count)
  }

  const colors = [...ACTIVITY_COLORS]
  const additionalColors = count - ACTIVITY_COLORS.length

  for (let i = 0; i < additionalColors; i++) {
    // Generate vibrant colors with good saturation
    const hue = (i * 137.5) % 360 // Golden angle for good distribution
    const saturation = 65 + (i % 3) * 10 // 65-85% saturation
    const lightness = 50 + (i % 4) * 5 // 50-65% lightness
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
  }

  return colors
}

export function HoursByMacroActivityChart({ data, isLoading, onPieClick }: HoursByMacroActivityChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Distribuzione Ore per Macro Attività</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
          <CardTitle className="text-xl font-bold text-gray-800">Distribuzione Ore per Macro Attività</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              Nessun dato disponibile
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for pie chart, grouping small activities into "Altre"
  const preparedData = (() => {
    const sortedData = [...data].sort((a, b) => b.ore - a.ore)

    if (sortedData.length <= 8) {
      return sortedData
    }

    const topActivities = sortedData.slice(0, 7)
    const othersHours = sortedData.slice(7).reduce((sum, activity) => sum + activity.ore, 0)

    return [
      ...topActivities,
      { macroAttivita: 'Altre Attività', ore: othersHours }
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
  const chartColors = generateActivityColors(preparedData.length)

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          Distribuzione Ore per Macro Attività
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={preparedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              innerRadius={50}
              fill="#8884d8"
              dataKey="ore"
              nameKey="macroAttivita"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(payload: any) => {
                if (onPieClick && payload && payload.macroAttivita && payload.macroAttivita !== 'Altre Attività') {
                  onPieClick(payload.macroAttivita)
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