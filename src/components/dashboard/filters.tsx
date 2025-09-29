'use client'

import { useState, useCallback, memo } from 'react'
import { FilterOptions } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, RefreshCw, Search, ChevronDown } from 'lucide-react'
import { useClickOutside } from '@/hooks/use-click-outside'

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
    <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/20 rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Filtri di Ricerca</span>
        </CardTitle>
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Ricarica Dati
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pb-12">
        {/* Date Range Presets */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">Intervalli Predefiniti</label>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Inizio</label>
            <input
              type="date"
              value={formatDateForInput(filters.startDate)}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Fine</label>
            <input
              type="date"
              value={formatDateForInput(filters.endDate)}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
            />
          </div>
        </div>

        {/* Filtri multi-selezione in layout verticale */}
        <div className="flex flex-col space-y-4">
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
  const [searchTerm, setSearchTerm] = useState('')

  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false)
    setSearchTerm('')
  })

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const handleSelectAll = () => {
    onChange(filteredOptions)
  }

  const handleDeselectAll = () => {
    onChange([])
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 bg-white text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
        >
          <div className="flex items-center justify-between">
            <span>
              {selected.length > 0
                ? `${selected.length} selezionati`
                : `Seleziona ${label.toLowerCase()}`
              }
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-hidden">
            {/* Search Box */}
            <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Cerca ${label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Select All/Deselect All buttons */}
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-sm"
              >
                Seleziona {filteredOptions.length > 0 ? `Filtrati (${filteredOptions.length})` : 'Tutti'}
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium"
              >
                Deseleziona Tutti
              </button>
            </div>

            {/* Options List */}
            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <div key={option} className="px-3 py-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-150">
                    <label className="flex items-center cursor-pointer text-black">
                      <input
                        type="checkbox"
                        checked={selected.includes(option)}
                        onChange={() => handleToggle(option)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium">{option}</span>
                    </label>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  <Search className="h-5 w-5 mx-auto mb-2 opacity-50" />
                  Nessun risultato trovato per &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})