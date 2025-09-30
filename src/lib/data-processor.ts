import { LogbookEntry, FilterOptions, KPIData, ClientData, CompensData, MappingData } from './types'
import { extractMonthFromDate, convertEuToNumber } from './utils'
import { normalizeNames } from './string-normalizer'

export function processLogbookEntries(
  entries: LogbookEntry[],
  overrides?: Record<string, Record<string, string>>
): LogbookEntry[] {
  // Filter valid entries first
  let processedEntries = entries.map(entry => ({
    ...entry,
    meseFormattato: entry.data ? extractMonthFromDate(entry.data) || undefined : undefined
  })).filter(entry => entry.data && !isNaN(entry.data.getTime()))

  // Default empty overrides if not provided
  const mappingOverrides = overrides || {
    clienti: {},
    collaboratori: {},
    reparti: {},
    macroAttivita: {},
    microAttivita: {}
  }

  // Normalize names to group similar variants with manual overrides
  processedEntries = normalizeNames(processedEntries, 'cliente', 85, mappingOverrides.clienti)
  processedEntries = normalizeNames(processedEntries, 'nome', 85, mappingOverrides.collaboratori)
  processedEntries = normalizeNames(processedEntries, 'reparto1', 85, mappingOverrides.reparti)
  processedEntries = normalizeNames(processedEntries, 'macroAttivita', 85, mappingOverrides.macroAttivita)
  processedEntries = normalizeNames(processedEntries, 'microAttivita', 85, mappingOverrides.microAttivita)

  return processedEntries
}

export function filterLogbookData(
  entries: LogbookEntry[],
  filters: FilterOptions
): LogbookEntry[] {
  return entries.filter(entry => {
    // Date filter
    if (entry.data < filters.startDate || entry.data > filters.endDate) {
      return false
    }

    // Collaborators filter
    if (filters.collaborators?.length && !filters.collaborators.includes(entry.nome)) {
      return false
    }

    // Departments filter
    if (filters.departments?.length && !filters.departments.includes(entry.reparto1)) {
      return false
    }

    // Macro activities filter
    if (filters.macroActivities?.length && !filters.macroActivities.includes(entry.macroAttivita)) {
      return false
    }

    // Clients filter
    if (filters.clients?.length && !filters.clients.includes(entry.cliente)) {
      return false
    }

    return true
  })
}

export function aggregateHoursByCollaborator(entries: LogbookEntry[]) {
  const aggregated = entries.reduce((acc, entry) => {
    const hours = entry.minutiImpiegati / 60
    acc[entry.nome] = (acc[entry.nome] || 0) + hours
    return acc
  }, {} as Record<string, number>)

  return Object.entries(aggregated)
    .map(([nome, ore]) => ({ nome, ore }))
    .sort((a, b) => b.ore - a.ore)
}

export function aggregateHoursByClient(entries: LogbookEntry[]) {
  const aggregated = entries.reduce((acc, entry) => {
    const hours = entry.minutiImpiegati / 60
    acc[entry.cliente] = (acc[entry.cliente] || 0) + hours
    return acc
  }, {} as Record<string, number>)

  return Object.entries(aggregated)
    .map(([cliente, ore]) => ({ cliente, ore }))
    .sort((a, b) => b.ore - a.ore)
}

export function aggregateHoursByMacroActivity(entries: LogbookEntry[]) {
  const aggregated = entries.reduce((acc, entry) => {
    const hours = entry.minutiImpiegati / 60
    acc[entry.macroAttivita] = (acc[entry.macroAttivita] || 0) + hours
    return acc
  }, {} as Record<string, number>)

  return Object.entries(aggregated)
    .map(([macroAttivita, ore]) => ({ macroAttivita, ore }))
    .sort((a, b) => b.ore - a.ore)
}

export function aggregateHoursByMicroActivity(entries: LogbookEntry[]) {
  const aggregated = entries.reduce((acc, entry) => {
    const hours = entry.minutiImpiegati / 60
    // Aggiungi questa condizione per escludere le attività non specificate
    if (entry.microAttivita && entry.microAttivita.trim() !== '') {
      acc[entry.microAttivita] = (acc[entry.microAttivita] || 0) + hours
    }
    return acc
  }, {} as Record<string, number>)

  return Object.entries(aggregated)
    .map(([microAttivita, ore]) => ({ microAttivita, ore }))
    .sort((a, b) => b.ore - a.ore)
}

export function calculateKPIs(
  filteredEntries: LogbookEntry[],
  allEntries: LogbookEntry[],
  clients: ClientData[],
  compensi: CompensData[],
  mapping: MappingData[],
  filters: FilterOptions
): KPIData {
  // Total hours from filtered data
  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

  // Get unique months from filtered data
  const selectedMonths = Array.from(new Set(
    filteredEntries
      .map(entry => entry.meseFormattato)
      .filter(Boolean) as string[]
  ))

  // Get relevant collaborators (those in filtered data or all if none filtered)
  const relevantCollaborators = filters.collaborators?.length
    ? filters.collaborators
    : Array.from(new Set(filteredEntries.map(entry => entry.nome)))

  // Calculate total cost for selected collaborators in selected months
  let totalCostForSelectedCollaborators = 0
  let totalCompanyHoursForSelectedCollaborators = 0

  relevantCollaborators.forEach(collaboratorName => {
    const collaboratorCompensi = compensi.find(c => c.collaboratore === collaboratorName)
    if (collaboratorCompensi) {
      selectedMonths.forEach(month => {
        if (month && typeof collaboratorCompensi[month] === 'number') {
          totalCostForSelectedCollaborators += collaboratorCompensi[month] as number
        }
      })
    }
  })

  // Calculate total company hours for selected collaborators in date range
  const companyHoursFiltered = allEntries.filter(entry => {
    return entry.data >= filters.startDate &&
           entry.data <= filters.endDate &&
           relevantCollaborators.includes(entry.nome)
  })

  totalCompanyHoursForSelectedCollaborators = companyHoursFiltered.reduce(
    (sum, entry) => sum + entry.minutiImpiegati, 0
  ) / 60

  // Average hourly cost
  const averageHourlyCost = totalCompanyHoursForSelectedCollaborators > 0
    ? totalCostForSelectedCollaborators / totalCompanyHoursForSelectedCollaborators
    : 0

  // Cost for filtered hours
  const filteredHoursCost = totalHours * averageHourlyCost

  // Calculate revenue for selected clients in selected months
  const clientMap = mapping.reduce((acc, m) => {
    acc[m.clienteMap] = m.cliente
    return acc
  }, {} as Record<string, string>)

  const relevantClients = filters.clients?.length
    ? filters.clients
    : Array.from(new Set(filteredEntries.map(entry => entry.cliente)))

  let totalRevenue = 0
  relevantClients.forEach(clientName => {
    const mappedClientName = clientMap[clientName] || clientName
    const clientData = clients.find(c => c.cliente === mappedClientName)

    if (clientData) {
      selectedMonths.forEach(month => {
        if (month && clientData[month]) {
          const revenueValue = typeof clientData[month] === 'string'
            ? convertEuToNumber(clientData[month] as string)
            : clientData[month] as number
          totalRevenue += revenueValue
        }
      })
    }
  })

  // Calculate margin
  const margin = totalRevenue - filteredHoursCost
  const marginPercentage = totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0

  return {
    totalHours,
    averageHourlyCost,
    filteredHoursCost,
    totalRevenue,
    margin,
    marginPercentage
  }
}

export function getUniqueValues<K extends keyof LogbookEntry>(
  entries: LogbookEntry[],
  field: K
): string[] {
  const values = entries.map(entry => entry[field]).filter(Boolean) as string[]
  return Array.from(new Set(values)).sort()
}

export function getCollaboratorSummary(
  filteredEntries: LogbookEntry[],
  allEntries: LogbookEntry[],
  compensi: CompensData[],
  filters: FilterOptions
) {
  const collaborators = Array.from(new Set(filteredEntries.map(entry => entry.nome)))

  const selectedMonths = Array.from(new Set(
    filteredEntries
      .map(entry => entry.meseFormattato)
      .filter(Boolean) as string[]
  ))

  return collaborators.map(collaboratorName => {
    // Filtered hours for this collaborator
    const collaboratorFilteredEntries = filteredEntries.filter(entry => entry.nome === collaboratorName)
    const filteredHours = collaboratorFilteredEntries.reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

    // Unique clients for this collaborator (from filtered data)
    const uniqueClients = new Set(collaboratorFilteredEntries.map(entry => entry.cliente))
    const clientsCount = uniqueClients.size

    // Total compensation for selected months
    const collaboratorCompensi = compensi.find(c => c.collaboratore === collaboratorName)
    let totalCompensation = 0

    if (collaboratorCompensi) {
      selectedMonths.forEach(month => {
        if (month && typeof collaboratorCompensi[month] === 'number') {
          totalCompensation += collaboratorCompensi[month] as number
        }
      })
    }

    // Total hours for this collaborator in the period (not just filtered)
    const totalPeriodEntries = allEntries.filter(entry =>
      entry.nome === collaboratorName &&
      entry.data >= filters.startDate &&
      entry.data <= filters.endDate
    )
    const totalPeriodHours = totalPeriodEntries.reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

    // Effective hourly rate
    // Se ci sono ore lavorate, calcola il costo orario normalmente
    // Se non ci sono ore ma c'è compenso, imposta a -1 per indicare il caso speciale
    // Se non ci sono né ore né compenso, imposta a 0
    let effectiveHourlyRate = 0
    if (totalPeriodHours > 0) {
      effectiveHourlyRate = totalCompensation / totalPeriodHours
    } else if (totalCompensation > 0) {
      // Caso speciale: compenso presente ma zero ore lavorate
      effectiveHourlyRate = -1
    }

    return {
      collaboratore: collaboratorName,
      compensoTotale: totalCompensation,
      oreTotaliPeriodo: totalPeriodHours,
      costoOrarioEffettivo: effectiveHourlyRate,
      oreFiltrate: filteredHours,
      clientiSeguiti: clientsCount
    }
  }).sort((a, b) => a.collaboratore.localeCompare(b.collaboratore))
}

export function getDepartmentSummary(
  filteredEntries: LogbookEntry[],
  allEntries: LogbookEntry[],
  clients: ClientData[],
  compensi: CompensData[],
  mapping: MappingData[],
  filters: FilterOptions
) {
  const departments = Array.from(new Set(filteredEntries.map(entry => entry.reparto1)))

  // Get selected months for revenue calculation
  const selectedMonths = Array.from(new Set(
    filteredEntries
      .map(entry => entry.meseFormattato)
      .filter(Boolean) as string[]
  ))

  // Client mapping
  const clientMap = mapping.reduce((acc, m) => {
    acc[m.clienteMap] = m.cliente
    return acc
  }, {} as Record<string, string>)

  return departments.map(departmentName => {
    // Filtered hours for this department
    const departmentFilteredEntries = filteredEntries.filter(entry => entry.reparto1 === departmentName)
    const filteredHours = departmentFilteredEntries.reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

    // Unique clients for this department (from filtered data)
    const uniqueClients = new Set(departmentFilteredEntries.map(entry => entry.cliente))
    const clientsCount = uniqueClients.size

    // Unique collaborators for this department (from filtered data)
    const departmentCollaborators = Array.from(new Set(departmentFilteredEntries.map(entry => entry.nome)))
    const collaboratorsCount = departmentCollaborators.length

    // Total hours for this department in the period (not just filtered)
    const totalPeriodEntries = allEntries.filter(entry =>
      entry.reparto1 === departmentName &&
      entry.data >= filters.startDate &&
      entry.data <= filters.endDate
    )
    const totalPeriodHours = totalPeriodEntries.reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

    // Unique macro activities for this department
    const uniqueMacroActivities = new Set(departmentFilteredEntries.map(entry => entry.macroAttivita))
    const macroActivitiesCount = uniqueMacroActivities.size

    // Calculate costs based on actual hours worked for this department
    let totalCost = 0

    departmentCollaborators.forEach(collaboratorName => {
      // Get compensation for this collaborator in selected months
      const collaboratorCompensi = compensi.find(c => c.collaboratore === collaboratorName)
      let collaboratorTotalCompensation = 0

      if (collaboratorCompensi) {
        selectedMonths.forEach(month => {
          if (month && typeof collaboratorCompensi[month] === 'number') {
            collaboratorTotalCompensation += collaboratorCompensi[month] as number
          }
        })
      }

      // Total hours for this collaborator in the period
      const collaboratorPeriodEntries = allEntries.filter(entry =>
        entry.nome === collaboratorName &&
        entry.data >= filters.startDate &&
        entry.data <= filters.endDate
      )
      const collaboratorTotalHours = collaboratorPeriodEntries.reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

      // Hours worked by this collaborator for this department
      const collaboratorDeptHours = departmentFilteredEntries
        .filter(entry => entry.nome === collaboratorName)
        .reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

      // Calculate hourly cost and apply to actual hours worked
      if (collaboratorTotalHours > 0) {
        const hourlyCost = collaboratorTotalCompensation / collaboratorTotalHours
        totalCost += hourlyCost * collaboratorDeptHours
      }
    })

    // Calculate revenue proportional to hours worked by this department
    let totalRevenue = 0
    uniqueClients.forEach(clientName => {
      const mappedClientName = clientMap[clientName] || clientName
      const clientData = clients.find(c => c.cliente === mappedClientName)

      if (clientData) {
        // Calculate total hours worked on this client by ALL departments/collaborators
        const clientTotalHours = filteredEntries
          .filter(entry => entry.cliente === clientName)
          .reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

        // Calculate hours worked on this client by THIS department
        const departmentClientHours = departmentFilteredEntries
          .filter(entry => entry.cliente === clientName)
          .reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

        // Calculate client's total revenue for selected months
        let clientTotalRevenue = 0
        selectedMonths.forEach(month => {
          if (month && clientData[month]) {
            const revenueValue = typeof clientData[month] === 'string'
              ? convertEuToNumber(clientData[month] as string)
              : clientData[month] as number
            clientTotalRevenue += revenueValue
          }
        })

        // Proportional revenue: (department hours / total hours) × total revenue
        if (clientTotalHours > 0) {
          const proportionalRevenue = (departmentClientHours / clientTotalHours) * clientTotalRevenue
          totalRevenue += proportionalRevenue
        }
      }
    })

    // Calculate margin
    const margin = totalRevenue - totalCost
    const marginPercentage = totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0

    return {
      reparto: departmentName,
      oreTotaliPeriodo: totalPeriodHours,
      oreFiltrate: filteredHours,
      clientiSeguiti: clientsCount,
      collaboratori: collaboratorsCount,
      macroAttivita: macroActivitiesCount,
      costoTotale: totalCost,
      fatturatoTotale: totalRevenue,
      margine: margin,
      marginePercentuale: marginPercentage
    }
  }).sort((a, b) => a.reparto.localeCompare(b.reparto))
}

export function getClientSummary(
  filteredEntries: LogbookEntry[],
  allEntries: LogbookEntry[],
  clients: ClientData[],
  compensi: CompensData[],
  mapping: MappingData[],
  filters: FilterOptions
) {
  const clientNames = Array.from(new Set(filteredEntries.map(entry => entry.cliente)))

  // Get selected months for revenue calculation
  const selectedMonths = Array.from(new Set(
    filteredEntries
      .map(entry => entry.meseFormattato)
      .filter(Boolean) as string[]
  ))

  // Client mapping
  const clientMap = mapping.reduce((acc, m) => {
    acc[m.clienteMap] = m.cliente
    return acc
  }, {} as Record<string, string>)

  return clientNames.map(clientName => {
    // Filtered hours for this client
    const clientFilteredEntries = filteredEntries.filter(entry => entry.cliente === clientName)
    const filteredHours = clientFilteredEntries.reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

    // Unique collaborators for this client (from filtered data)
    const clientCollaborators = Array.from(new Set(clientFilteredEntries.map(entry => entry.nome)))
    const collaboratorsCount = clientCollaborators.length

    // Total hours for this client in the period (not just filtered)
    const totalPeriodEntries = allEntries.filter(entry =>
      entry.cliente === clientName &&
      entry.data >= filters.startDate &&
      entry.data <= filters.endDate
    )
    const totalPeriodHours = totalPeriodEntries.reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

    // Calculate costs based on actual hours worked for this client
    let totalCost = 0

    clientCollaborators.forEach(collaboratorName => {
      // Get compensation for this collaborator in selected months
      const collaboratorCompensi = compensi.find(c => c.collaboratore === collaboratorName)
      let collaboratorTotalCompensation = 0

      if (collaboratorCompensi) {
        selectedMonths.forEach(month => {
          if (month && typeof collaboratorCompensi[month] === 'number') {
            collaboratorTotalCompensation += collaboratorCompensi[month] as number
          }
        })
      }

      // Total hours for this collaborator in the period
      const collaboratorPeriodEntries = allEntries.filter(entry =>
        entry.nome === collaboratorName &&
        entry.data >= filters.startDate &&
        entry.data <= filters.endDate
      )
      const collaboratorTotalHours = collaboratorPeriodEntries.reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

      // Hours worked by this collaborator for this client
      const collaboratorClientHours = clientFilteredEntries
        .filter(entry => entry.nome === collaboratorName)
        .reduce((sum, entry) => sum + entry.minutiImpiegati, 0) / 60

      // Calculate hourly cost and apply to actual hours worked
      if (collaboratorTotalHours > 0) {
        const hourlyCost = collaboratorTotalCompensation / collaboratorTotalHours
        totalCost += hourlyCost * collaboratorClientHours
      }
    })

    // Calculate revenue for this client
    const mappedClientName = clientMap[clientName] || clientName
    const clientData = clients.find(c => c.cliente === mappedClientName)

    let totalRevenue = 0
    if (clientData) {
      selectedMonths.forEach(month => {
        if (month && clientData[month]) {
          const revenueValue = typeof clientData[month] === 'string'
            ? convertEuToNumber(clientData[month] as string)
            : clientData[month] as number
          totalRevenue += revenueValue
        }
      })
    }

    // Calculate margin
    const margin = totalRevenue - totalCost
    const marginPercentage = totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0

    return {
      cliente: clientName,
      oreTotaliPeriodo: totalPeriodHours,
      oreFiltrate: filteredHours,
      collaboratori: collaboratorsCount,
      costoTotale: totalCost,
      fatturatoTotale: totalRevenue,
      margine: margin,
      marginePercentuale: marginPercentage
    }
  }).sort((a, b) => a.cliente.localeCompare(b.cliente))
}

export function getClientMonthlyRevenue(
  filteredEntries: LogbookEntry[],
  clients: ClientData[],
  mapping: MappingData[]
) {
  const clientNames = Array.from(new Set(filteredEntries.map(entry => entry.cliente)))

  // Get all unique months from filtered data
  const allMonths = Array.from(new Set(
    filteredEntries
      .map(entry => entry.meseFormattato)
      .filter(Boolean) as string[]
  )).sort()

  // Client mapping
  const clientMap = mapping.reduce((acc, m) => {
    acc[m.clienteMap] = m.cliente
    return acc
  }, {} as Record<string, string>)

  return clientNames.map(clientName => {
    const mappedClientName = clientMap[clientName] || clientName
    const clientData = clients.find(c => c.cliente === mappedClientName)

    const monthlyData: Record<string, number> = {}
    let totalRevenue = 0

    allMonths.forEach(month => {
      let revenue = 0
      if (clientData && month && clientData[month]) {
        revenue = typeof clientData[month] === 'string'
          ? convertEuToNumber(clientData[month] as string)
          : clientData[month] as number
      }
      monthlyData[month] = revenue
      totalRevenue += revenue
    })

    return {
      cliente: clientName,
      monthlyRevenue: monthlyData,
      totale: totalRevenue
    }
  }).sort((a, b) => a.cliente.localeCompare(b.cliente))
}