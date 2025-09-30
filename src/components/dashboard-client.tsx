'use client'

import { DashboardData } from '@/lib/types'
import { useDashboard } from '@/hooks/use-dashboard'
import { MetricsCards } from '@/components/dashboard/metrics-cards'
import { Filters } from '@/components/dashboard/filters'
import { HoursByCollaboratorChart } from '@/components/dashboard/hours-by-collaborator-chart'
import { HoursByClientChart } from '@/components/dashboard/hours-by-client-chart'
import { HoursByMacroActivityChart } from '@/components/dashboard/hours-by-macro-activity-chart'
import { HoursByMicroActivityChart } from '@/components/dashboard/hours-by-micro-activity-chart'
import { CollaboratorSummaryTable } from '@/components/dashboard/collaborator-summary-table'
import { DepartmentSummaryTable } from '@/components/dashboard/department-summary-table'
import { ClientSummaryTable } from '@/components/dashboard/client-summary-table'
import { ClientMonthlyRevenueTable } from '@/components/dashboard/client-monthly-revenue-table'

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
    hoursByMacroActivity,
    hoursByMicroActivity,
    collaboratorSummary,
    departmentSummary,
    clientSummary,
    clientMonthlyRevenue,
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
          <p className="text-gray-900 mb-4">{error}</p>
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
              <p className="text-sm text-gray-900 mt-1">
                Visualizzazione e analisi dei dati aziendali in tempo reale
              </p>
            </div>
            <div className="text-sm text-gray-900">
              Record visualizzati: {recordCount}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Colonna Filtri (20% della larghezza su schermi grandi) */}
          <div className="lg:col-span-1 filters-column">
            <div className="lg:sticky lg:top-8">
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
            </div>
          </div>

          {/* Colonna Contenuti (80% della larghezza) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Metrics Cards */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">
                Metriche Chiave del Periodo Selezionato
              </h2>
              <MetricsCards kpis={kpis} isLoading={isLoading} />
            </div>

            {/* Layout a griglia per i grafici - sempre 2 per riga */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <HoursByMacroActivityChart
                data={hoursByMacroActivity}
                isLoading={isLoading}
                onPieClick={(macroActivity) => handleDrillDown('macroActivities', macroActivity)}
              />
              <HoursByMicroActivityChart data={hoursByMicroActivity} isLoading={isLoading} />
            </div>

            {/* Collaborator Summary Table */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">
                Riepilogo Collaboratori (basato sui filtri applicati)
              </h2>
              <CollaboratorSummaryTable data={collaboratorSummary} isLoading={isLoading} />
            </div>

            {/* Department Summary Table */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">
                Riepilogo Reparti (basato sui filtri applicati)
              </h2>
              <DepartmentSummaryTable data={departmentSummary} isLoading={isLoading} />
            </div>

            {/* Client Summary Table */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">
                Riepilogo Clienti (basato sui filtri applicati)
              </h2>
              <ClientSummaryTable data={clientSummary} isLoading={isLoading} />
            </div>

            {/* Client Monthly Revenue Table */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">
                Fatturato Mensile per Cliente
              </h2>
              <ClientMonthlyRevenueTable data={clientMonthlyRevenue} isLoading={isLoading} />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}