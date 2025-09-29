'use client'

import { DashboardData } from '@/lib/types'
import { useDashboard } from '@/hooks/use-dashboard'
import { MetricsCards } from '@/components/dashboard/metrics-cards'
import { Filters } from '@/components/dashboard/filters'
import { HoursByCollaboratorChart } from '@/components/dashboard/hours-by-collaborator-chart'
import { HoursByClientChart } from '@/components/dashboard/hours-by-client-chart'
import { CollaboratorSummaryTable } from '@/components/dashboard/collaborator-summary-table'

interface DashboardClientProps {
  initialData: DashboardData
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const {
    filters,
    setFilters,
    kpis,
    hoursByCollaborator,
    hoursByClient,
    collaboratorSummary,
    availableCollaborators,
    availableDepartments,
    availableMacroActivities,
    availableClients,
    isLoading,
    error,
    refreshData,
    handleDrillDown,
    recordCount
  } = useDashboard({ initialData })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Errore</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Aziendale</h1>
              <p className="text-sm text-gray-600 mt-1">
                Visualizzazione e analisi dei dati aziendali in tempo reale
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Record visualizzati: {recordCount}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8">
        <div className="space-y-8">
          {/* Filters */}
          <Filters
            filters={filters}
            onFiltersChange={setFilters}
            availableCollaborators={availableCollaborators}
            availableDepartments={availableDepartments}
            availableMacroActivities={availableMacroActivities}
            availableClients={availableClients}
            onRefresh={refreshData}
            isLoading={isLoading}
          />

          {/* Metrics Cards */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Metriche Chiave del Periodo Selezionato
            </h2>
            <MetricsCards kpis={kpis} isLoading={isLoading} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <HoursByCollaboratorChart
              data={hoursByCollaborator}
              isLoading={isLoading}
              onBarClick={(collaboratorName) => handleDrillDown('collaborators', collaboratorName)}
            />
            <HoursByClientChart
              data={hoursByClient}
              isLoading={isLoading}
              onPieClick={(clientName) => handleDrillDown('clients', clientName)}
            />
          </div>

          {/* Collaborator Summary Table */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Riepilogo Collaboratori (basato sui filtri applicati)
            </h2>
            <CollaboratorSummaryTable data={collaboratorSummary} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}