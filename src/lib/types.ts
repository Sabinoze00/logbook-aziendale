export interface LogbookEntry {
  nome: string
  data: Date
  mese: string
  giorno: string
  reparto1: string
  macroAttivita: string
  microAttivita: string
  cliente: string
  note: string
  minutiImpiegati: number
  meseFormattato?: string
}

export interface ClientData {
  cliente: string
  [month: string]: string | number // Monthly revenue data
}

export interface CompensData {
  collaboratore: string
  [month: string]: string | number // Monthly compensation data
}

export interface MappingData {
  cliente: string
  clienteMap: string
}

export interface FilterOptions {
  startDate: Date
  endDate: Date
  collaborators?: string[]
  departments?: string[]
  macroActivities?: string[]
  clients?: string[]
}

export interface KPIData {
  totalHours: number
  averageHourlyCost: number
  filteredHoursCost: number
  totalRevenue: number
  margin: number
  marginPercentage: number
}

export interface DashboardData {
  logbook: LogbookEntry[]
  clients: ClientData[]
  compensi: CompensData[]
  mapping: MappingData[]
}