'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Loader2 } from 'lucide-react'

interface HoursByMicroActivityChartProps {
  data: Array<{ microAttivita: string; ore: number }>
  isLoading?: boolean
}

export function HoursByMicroActivityChart({ data, isLoading }: HoursByMicroActivityChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Distribuzione Ore per Micro Attività</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-black font-medium">Caricamento dati...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Distribuzione Ore per Micro Attività</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-black font-medium">Nessuna micro attività trovata</p>
            <p className="text-gray-600 text-sm">Prova a modificare i filtri per visualizzare i dati</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mostra solo le top 20 per leggibilità
  const sortedData = [...data].sort((a, b) => a.ore - b.ore).slice(0, 20)

  // Custom tooltip per mostrare ore formattate
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-black">{label}</p>
          <p className="text-emerald-600 font-medium">
            Ore: {payload[0].value.toFixed(1)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/20 rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold">Distribuzione Ore per Micro Attività</span>
            <p className="text-emerald-100 text-sm font-normal mt-1">
              {data.length > 20 ? `Top 20 di ${data.length} micro attività` : `${data.length} micro attività`}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={Math.max(500, sortedData.length * 40)}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 200, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              tick={{ fill: '#374151', fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis
              dataKey="microAttivita"
              type="category"
              width={180}
              tick={{ fill: '#374151', fontSize: 11 }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="ore"
              fill="url(#microActivityGradient)"
              radius={[0, 4, 4, 0]}
              stroke="#10b981"
              strokeWidth={1}
            />
            <defs>
              <linearGradient id="microActivityGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}