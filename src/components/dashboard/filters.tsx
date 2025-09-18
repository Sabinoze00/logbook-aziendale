'use client'

import { useState } from 'react'
import { FilterOptions } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, RefreshCw } from 'lucide-react'

interface FiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  availableCollaborators: string[]
  availableDepartments: string[]
  availableMacroActivities: string[]
  availableClients: string[]
  onRefresh: () => void
  isLoading?: boolean
}

export function Filters({
  filters,
  onFiltersChange,
  availableCollaborators,
  availableDepartments,
  availableMacroActivities,
  availableClients,
  onRefresh,
  isLoading = false
}: FiltersProps) {
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: new Date(value)
    })
  }

  const handleMultiSelectChange = (field: keyof FilterOptions, values: string[]) => {
    onFiltersChange({
      ...filters,
      [field]: values.length > 0 ? values : undefined
    })
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtri
        </CardTitle>
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Ricarica Dati
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Data Inizio</label>
            <input
              type="date"
              value={formatDateForInput(filters.startDate)}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Data Fine</label>
            <input
              type="date"
              value={formatDateForInput(filters.endDate)}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Multi-select filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MultiSelectFilter
            label="Collaboratori"
            options={availableCollaborators}
            selected={filters.collaborators || []}
            onChange={(values) => handleMultiSelectChange('collaborators', values)}
          />

          <MultiSelectFilter
            label="Reparti"
            options={availableDepartments}
            selected={filters.departments || []}
            onChange={(values) => handleMultiSelectChange('departments', values)}
          />

          <MultiSelectFilter
            label="Macro Attività"
            options={availableMacroActivities}
            selected={filters.macroActivities || []}
            onChange={(values) => handleMultiSelectChange('macroActivities', values)}
          />

          <MultiSelectFilter
            label="Clienti"
            options={availableClients}
            selected={filters.clients || []}
            onChange={(values) => handleMultiSelectChange('clients', values)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface MultiSelectFilterProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
}

function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {selected.length > 0
            ? `${selected.length} selezionati`
            : `Seleziona ${label.toLowerCase()}`
          }
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map(option => (
              <div key={option} className="px-3 py-2 hover:bg-gray-100">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => handleToggle(option)}
                    className="mr-2"
                  />
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}