'use client'

import { useState, useEffect, useMemo } from 'react'
import { DashboardData, FilterOptions } from '@/lib/types'
import {
  processLogbookEntries,
  filterLogbookData,
  calculateKPIs,
  getUniqueValues,
  getCollaboratorSummary,
  aggregateHoursByCollaborator,
  aggregateHoursByClient
} from '@/lib/data-processor'

interface UseDashboardProps {
  initialData: DashboardData
}

export function useDashboard({ initialData }: UseDashboardProps) {
  const [data, setData] = useState<DashboardData>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Process logbook entries
  const processedLogbook = useMemo(() => {
    return processLogbookEntries(data.logbook)
  }, [data.logbook])

  // Initialize filters with dynamic date range
  const [filters, setFilters] = useState<FilterOptions>(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      startDate: thirtyDaysAgo,
      endDate: today
    }
  })

  // Update filters when processedLogbook changes to use full date range
  useEffect(() => {
    if (processedLogbook.length > 0) {
      const dates = processedLogbook.map(entry => entry.data.getTime())
      const minDate = new Date(Math.min(...dates))
      const maxDate = new Date(Math.max(...dates))

      setFilters(prevFilters => ({
        ...prevFilters,
        startDate: minDate,
        endDate: maxDate
      }))
    }
  }, [processedLogbook])

  // Get unique values for filter options
  const availableCollaborators = useMemo(() => {
    return getUniqueValues(processedLogbook, 'nome')
  }, [processedLogbook])

  const availableDepartments = useMemo(() => {
    return getUniqueValues(processedLogbook, 'reparto1')
  }, [processedLogbook])

  const availableMacroActivities = useMemo(() => {
    return getUniqueValues(processedLogbook, 'macroAttivita')
  }, [processedLogbook])

  const availableClients = useMemo(() => {
    return getUniqueValues(processedLogbook, 'cliente')
  }, [processedLogbook])

  // Filter data based on current filters
  const filteredLogbook = useMemo(() => {
    return filterLogbookData(processedLogbook, filters)
  }, [processedLogbook, filters])

  // Calculate KPIs
  const kpis = useMemo(() => {
    return calculateKPIs(
      filteredLogbook,
      processedLogbook,
      data.clients,
      data.compensi,
      data.mapping,
      filters
    )
  }, [filteredLogbook, processedLogbook, data.clients, data.compensi, data.mapping, filters])

  // Get aggregated data for charts
  const hoursByCollaborator = useMemo(() => {
    return aggregateHoursByCollaborator(filteredLogbook)
  }, [filteredLogbook])

  const hoursByClient = useMemo(() => {
    return aggregateHoursByClient(filteredLogbook)
  }, [filteredLogbook])

  // Get collaborator summary
  const collaboratorSummary = useMemo(() => {
    return getCollaboratorSummary(
      filteredLogbook,
      processedLogbook,
      data.compensi,
      filters
    )
  }, [filteredLogbook, processedLogbook, data.compensi, filters])

  // Refresh data function
  const refreshData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/dashboard-data', {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const newData = await response.json()
      setData(newData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Drill-down functionality for interactive charts
  const handleDrillDown = (filterKey: 'collaborators' | 'clients', value: string) => {
    // Quando si fa un drill-down, si imposta un solo valore per quel filtro
    // e si resettano gli altri filtri di tipo multi-selezione per evitare conflitti.
    setFilters(prevFilters => ({
      ...prevFilters,
      collaborators: filterKey === 'collaborators' ? [value] : undefined,
      clients: filterKey === 'clients' ? [value] : undefined,
      // Opzionale: resetta altri filtri per una visione più pulita
      departments: undefined,
      macroActivities: undefined,
    }))
  }

  return {
    // Data
    data,
    filteredLogbook,
    kpis,
    hoursByCollaborator,
    hoursByClient,
    collaboratorSummary,

    // Filters
    filters,
    setFilters,
    availableCollaborators,
    availableDepartments,
    availableMacroActivities,
    availableClients,

    // State
    isLoading,
    error,
    refreshData,

    // Interactive functionality
    handleDrillDown,

    // Computed values
    recordCount: filteredLogbook.length
  }
}