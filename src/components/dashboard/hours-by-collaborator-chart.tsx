'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HoursByCollaboratorChartProps {
  data: Array<{ nome: string; ore: number }>
  isLoading?: boolean
  onBarClick?: (collaboratore: string) => void
}

export function HoursByCollaboratorChart({ data, isLoading, onBarClick }: HoursByCollaboratorChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ore Lavorate per Collaboratore</CardTitle>
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
          <CardTitle>Ore Lavorate per Collaboratore</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[500px] items-center justify-center text-muted-foreground">
            Nessun dato disponibile
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort data in ascending order for better visualization
  const sortedData = [...data].sort((a, b) => a.ore - b.ore)

  const formatTooltip = (value: any, name: string) => {
    if (name === 'ore') {
      return [`${value.toFixed(1)} ore`, 'Ore Lavorate']
    }
    return [value, name]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ore Lavorate per Collaboratore</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(500, data.length * 50)}>
          <BarChart
            data={sortedData}
            layout="horizontal"
            margin={{
              top: 5,
              right: 30,
              left: 100,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="nome" type="category" width={100} />
            <Tooltip formatter={formatTooltip} />
            <Bar
              dataKey="ore"
              fill="#8884d8"
              onClick={(payload) => {
                if (onBarClick && payload) {
                  onBarClick(payload.nome)
                }
              }}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}