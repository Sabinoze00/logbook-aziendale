'use client'

import { useState, useCallback, memo, Fragment } from 'react'
import { FilterOptions } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, RefreshCw, Check, ChevronsUpDown } from 'lucide-react'
import { Listbox, Transition } from '@headlessui/react'

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

  const handleCollaboratorsChange = useCallback((values: string[]) => handleMultiSelectChange('collaborators', values), [handleMultiSelectChange])
  const handleDepartmentsChange = useCallback((values: string[]) => handleMultiSelectChange('departments', values), [handleMultiSelectChange])
  const handleMacroActivitiesChange = useCallback((values: string[]) => handleMultiSelectChange('macroActivities', values), [handleMultiSelectChange])
  const handleClientsChange = useCallback((values: string[]) => handleMultiSelectChange('clients', values), [handleMultiSelectChange])

  const formatDateForInput = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  }

  const applyPresetRange = (preset: string) => {
    const today = new Date()
    let startDate = new Date()

    switch (preset) {
      case 'oggi':
        startDate = new Date()
        break
      case 'ultimi7giorni':
        startDate.setDate(today.getDate() - 7)
        break
      case 'ultimi30giorni':
        startDate.setDate(today.getDate() - 30)
        break
      case 'questomese':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'mesescorso':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
        onFiltersChange({ ...filters, startDate, endDate: lastMonthEnd })
        return
      case 'questanno':
        startDate = new Date(today.getFullYear(), 0, 1)
        break
    }
    onFiltersChange({ ...filters, startDate, endDate: today })
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtri
        </CardTitle>
        <Button onClick={onRefresh} disabled={isLoading} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Ricarica
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-black">Intervalli Predefiniti</label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'oggi', label: 'Oggi' },
              { key: 'ultimi7giorni', label: 'Ultimi 7 giorni' },
              { key: 'ultimi30giorni', label: 'Ultimi 30 giorni' },
              { key: 'questomese', label: 'Questo mese' },
              { key: 'mesescorso', label: 'Mese scorso' },
              { key: 'questanno', label: 'Quest\'anno' }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Data Inizio</label>
            <input
              type="date"
              value={formatDateForInput(filters.startDate)}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Data Fine</label>
            <input
              type="date"
              value={formatDateForInput(filters.endDate)}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
        </div>
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
  const [query, setQuery] = useState('')

  const filteredOptions = query === ''
    ? options
    : options.filter(option => option.toLowerCase().includes(query.toLowerCase()))

  const handleSelectAll = () => onChange(filteredOptions)
  const handleDeselectAll = () => onChange([])

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-black">{label}</label>
      <Listbox value={selected} onChange={onChange} multiple>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-sm">
            <span className="block truncate text-black">
              {selected.length > 0 ? `${selected.length} selezionati` : `Seleziona ${label.toLowerCase()}`}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className="p-2">
                <input
                  type="text"
                  placeholder={`Cerca ${label.toLowerCase()}...`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-black"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    {`Seleziona Filtrati (${filteredOptions.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Deseleziona Tutti
                  </button>
                </div>
              </div>
              {filteredOptions.map((option, optionIdx) => (
                <Listbox.Option
                  key={optionIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
})