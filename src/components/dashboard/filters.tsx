'use client'

import { useState, useCallback, memo } from 'react'
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

  const handleMultiSelectChange = useCallback((field: keyof FilterOptions, values: string[]) => {
    onFiltersChange({
      ...filters,
      [field]: values.length > 0 ? values : undefined
    })
  }, [filters, onFiltersChange])

  // Memoized callbacks for each filter to prevent unnecessary re-renders
  const handleCollaboratorsChange = useCallback((values: string[]) => {
    handleMultiSelectChange('collaborators', values)
  }, [handleMultiSelectChange])

  const handleDepartmentsChange = useCallback((values: string[]) => {
    handleMultiSelectChange('departments', values)
  }, [handleMultiSelectChange])

  const handleMacroActivitiesChange = useCallback((values: string[]) => {
    handleMultiSelectChange('macroActivities', values)
  }, [handleMultiSelectChange])

  const handleClientsChange = useCallback((values: string[]) => {
    handleMultiSelectChange('clients', values)
  }, [handleMultiSelectChange])

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // Preset date ranges
  const applyPresetRange = (preset: string) => {
    const today = new Date()
    const startDate = new Date()

    switch (preset) {
      case 'today':
        onFiltersChange({ ...filters, startDate: today, endDate: today })
        break
      case 'last7days':
        startDate.setDate(today.getDate() - 7)
        onFiltersChange({ ...filters, startDate, endDate: today })
        break
      case 'last30days':
        startDate.setDate(today.getDate() - 30)
        onFiltersChange({ ...filters, startDate, endDate: today })
        break
      case 'thisMonth':
        startDate.setDate(1)
        onFiltersChange({ ...filters, startDate, endDate: today })
        break
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
        onFiltersChange({ ...filters, startDate: lastMonth, endDate: lastMonthEnd })
        break
      case 'thisYear':
        const yearStart = new Date(today.getFullYear(), 0, 1)
        onFiltersChange({ ...filters, startDate: yearStart, endDate: today })
        break
    }
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
        {/* Date Range Presets */}
        <div>
          <label className="block text-sm font-medium mb-2">Intervalli Predefiniti</label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'today', label: 'Oggi' },
              { key: 'last7days', label: 'Ultimi 7 giorni' },
              { key: 'last30days', label: 'Ultimi 30 giorni' },
              { key: 'thisMonth', label: 'Questo mese' },
              { key: 'lastMonth', label: 'Mese scorso' },
              { key: 'thisYear', label: 'Quest\'anno' }
            ].map(preset => (
              <Button
                key={preset.key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPresetRange(preset.key)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

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
            onChange={handleCollaboratorsChange}
          />

          <MultiSelectFilter
            label="Reparti"
            options={availableDepartments}
            selected={filters.departments || []}
            onChange={handleDepartmentsChange}
          />

          <MultiSelectFilter
            label="Macro Attività"
            options={availableMacroActivities}
            selected={filters.macroActivities || []}
            onChange={handleMacroActivitiesChange}
          />

          <MultiSelectFilter
            label="Clienti"
            options={availableClients}
            selected={filters.clients || []}
            onChange={handleClientsChange}
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

const MultiSelectFilter = memo(function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const handleSelectAll = () => {
    onChange(options)
  }

  const handleDeselectAll = () => {
    onChange([])
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
            {/* Select All/Deselect All buttons */}
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Seleziona Tutti
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs px-2 py-1 bg-gray-100 text-black rounded hover:bg-gray-200 transition-colors"
              >
                Deseleziona Tutti
              </button>
            </div>
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
})