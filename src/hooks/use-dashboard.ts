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
  aggregateHoursByClient,
  aggregateHoursByMacroActivity,
  aggregateHoursByMicroActivity
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
    if (processedLogbook && processedLogbook.length > 0) {
      const dates = processedLogbook.map(entry => entry.data.getTime()).filter(time => !isNaN(time))
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates))
        const maxDate = new Date(Math.max(...dates))

        setFilters(prevFilters => ({
          ...prevFilters,
          startDate: minDate,
          endDate: maxDate
        }))
      } else {
        // Fallback nel caso non ci siano date valide
        const today = new Date()
        setFilters(prevFilters => ({
          ...prevFilters,
          startDate: today,
          endDate: today
        }))
      }
    } else {
      // Fallback se non ci sono proprio log
      const today = new Date()
      setFilters(prevFilters => ({
        ...prevFilters,
        startDate: today,
        endDate: today
      }))
    }
  }, [processedLogbook])

  // Get unique values for filter options - dynamic filtering (cascading filters)
  const availableCollaborators = useMemo(() => {
    // Crea un set di filtri temporaneo senza il filtro dei collaboratori
    const partialFilters = { ...filters }
    delete (partialFilters as Partial<FilterOptions>).collaborators

    // Filtra i dati usando solo gli altri filtri
    const partiallyFilteredData = filterLogbookData(processedLogbook, partialFilters)

    // Estrai i valori unici dal risultato parzialmente filtrato
    return getUniqueValues(partiallyFilteredData, 'nome')
  }, [processedLogbook, filters])

  const availableDepartments = useMemo(() => {
    // Crea un set di filtri temporaneo senza il filtro dei dipartimenti
    const partialFilters = { ...filters }
    delete (partialFilters as Partial<FilterOptions>).departments

    // Filtra i dati usando solo gli altri filtri
    const partiallyFilteredData = filterLogbookData(processedLogbook, partialFilters)

    // Estrai i valori unici dal risultato parzialmente filtrato
    return getUniqueValues(partiallyFilteredData, 'reparto1')
  }, [processedLogbook, filters])

  const availableMacroActivities = useMemo(() => {
    // Crea un set di filtri temporaneo senza il filtro delle macro attività
    const partialFilters = { ...filters }
    delete (partialFilters as Partial<FilterOptions>).macroActivities

    // Filtra i dati usando solo gli altri filtri
    const partiallyFilteredData = filterLogbookData(processedLogbook, partialFilters)

    // Estrai i valori unici dal risultato parzialmente filtrato
    return getUniqueValues(partiallyFilteredData, 'macroAttivita')
  }, [processedLogbook, filters])

  const availableClients = useMemo(() => {
    // Crea un set di filtri temporaneo senza il filtro dei clienti
    const partialFilters = { ...filters }
    delete (partialFilters as Partial<FilterOptions>).clients

    // Filtra i dati usando solo gli altri filtri
    const partiallyFilteredData = filterLogbookData(processedLogbook, partialFilters)

    // Estrai i valori unici dal risultato parzialmente filtrato
    return getUniqueValues(partiallyFilteredData, 'cliente')
  }, [processedLogbook, filters])

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

  const hoursByMacroActivity = useMemo(() => {
    return aggregateHoursByMacroActivity(filteredLogbook)
  }, [filteredLogbook])

  const hoursByMicroActivity = useMemo(() => {
    return aggregateHoursByMicroActivity(filteredLogbook)
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
        throw new Error('Failed to fetch data from API')
      }

      const newData = await response.json()

      // Sanificazione e validazione completa dei dati ricevuti
      const sanitizedData = {
        logbook: Array.isArray(newData.logbook) ? newData.logbook : [],
        clients: Array.isArray(newData.clients) ? newData.clients : [],
        compensi: Array.isArray(newData.compensi) ? newData.compensi : [],
        mapping: Array.isArray(newData.mapping) ? newData.mapping : []
      }

      setData(sanitizedData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Drill-down functionality for interactive charts
  const handleDrillDown = (filterKey: 'collaborators' | 'clients' | 'macroActivities', value: string) => {
    // Quando si fa un drill-down, si imposta un solo valore per quel filtro
    // e si resettano gli altri filtri di tipo multi-selezione per evitare conflitti.
    setFilters(prevFilters => ({
      ...prevFilters,
      collaborators: filterKey === 'collaborators' ? [value] : undefined,
      clients: filterKey === 'clients' ? [value] : undefined,
      macroActivities: filterKey === 'macroActivities' ? [value] : undefined,
      // Opzionale: resetta altri filtri per una visione più pulita
      departments: undefined,
    }))
  }

  return {
    // Data
    data,
    filteredLogbook,
    kpis,
    hoursByCollaborator,
    hoursByClient,
    hoursByMacroActivity,
    hoursByMicroActivity,
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