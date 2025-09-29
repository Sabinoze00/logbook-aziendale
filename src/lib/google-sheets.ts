import { google } from 'googleapis'
import { LogbookEntry, ClientData, CompensData, MappingData, DashboardData } from './types'
import { convertEuToNumber } from './utils'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
]

// Default client mapping if Mappa sheet doesn't exist
const DEFAULT_CLIENT_MAPPING = [
  ['ACOS MEDICA', 'Acos Medica'],
  ['Bovo Garden Srl', 'Flobflower'],
  ['Business Gates S.r.l.', 'Business Gates'],
  ['CARL ZEISS VISION ITALIA S.P.A.', 'Zeiss'],
  ['CAROVILLA PIERLUIGI (SONIT)', 'Sonit'],
  ['Cisa S.p.a.', 'Cisa'],
  ['CoLibrì System S.p.A.', 'Colibrì'],
  ['CURCAPIL DI CARLUCCI DONATO SNC', 'Curcapil'],
  ['Elettrocasa S.r.l.', 'Elettrocasa'],
  ['FIDELIA - S.R.L.', 'Casaviva'],
  ['FLO.MAR. S.R.L.S.', 'Flomar'],
  ['Fratelli Bonella', 'Fratelli Bonella'],
  ['HOMIT S.R.L.', 'Divani Store'],
  ['NOWAVE', 'Nowave'],
  ['PATRIZIO BRESEGHELLO', 'Patrizio Breseghello'],
  ['POLONORD ADESTE', 'Polonord'],
  ['SAIET', 'Saiet'],
  ['SAN PIETRO LAB', 'San Pietro Lab'],
  ['Sivec Srl', 'Passione Fiori'],
  ['STILMAR DI MARISE RICCARDO (COCCOLE)', 'Coccole'],
  ['TOMAINO SRL', 'Tomaino']
]

function getGoogleSheetsClient() {
  try {
    // Parse credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}')

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    })

    return google.sheets({ version: 'v4', auth })
  } catch (error) {
    console.error('Error creating Google Sheets client:', error)
    throw new Error('Failed to authenticate with Google Sheets')
  }
}

async function getSheetData(spreadsheetId: string, sheetName: string): Promise<string[][]> {
  const sheets = getGoogleSheetsClient()

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    })

    return response.data.values || []
  } catch (error) {
    console.error(`Error fetching sheet ${sheetName}:`, error)
    throw new Error(`Failed to fetch ${sheetName} sheet`)
  }
}

function processLogbookData(rawData: string[][]): LogbookEntry[] {
  if (!rawData || rawData.length < 2) return []

  const [headers, ...rows] = rawData

  return rows
    .map(row => {
      const entry: Partial<LogbookEntry> = {}
      const rowData = headers.reduce((obj, header, index) => {
        obj[header.toLowerCase()] = row[index] || ''
        return obj
      }, {} as Record<string, string>)

      entry.nome = rowData['nome']
      entry.mese = rowData['mese']
      entry.giorno = rowData['giorno']
      entry.reparto1 = rowData['reparto1'] || rowData['reparto']
      entry.macroAttivita = rowData['macro attività']
      entry.microAttivita = rowData['micro attività']
      entry.cliente = rowData['cliente']
      entry.note = rowData['note']
      entry.minutiImpiegati = parseInt(rowData['minuti impiegati']) || 0

      const parsedDate = parseDate(rowData['data'])
      if (parsedDate) {
        entry.data = parsedDate
        return entry as LogbookEntry
      }
      return null
    })
    .filter((entry): entry is LogbookEntry => entry !== null) // Filtra solo le voci con date valide
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null

  // Prova il formato DD/MM/YYYY prima
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (match) {
    const [, day, month, year] = match
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    // Ulteriore controllo per date come 31/02/YYYY
    if (date.getDate() === parseInt(day)) return date
  }

  // Prova altri formati comuni
  const parsedDate = new Date(dateStr)
  if (!isNaN(parsedDate.getTime())) {
      return parsedDate
  }

  return null // Ritorna null se nessun formato è valido
}

function processClientData(rawData: string[][]): ClientData[] {
  if (!rawData || rawData.length < 2) return []

  const [headers, ...rows] = rawData

  return rows
    .filter(row => row.some(cell => cell && cell.trim()))
    .filter(row => {
      // Filter only 'Actual' rows if 'Actual' column exists
      const actualIndex = headers.findIndex(h => h.toLowerCase() === 'actual')
      return actualIndex === -1 || row[actualIndex] === 'Actual'
    })
    .map(row => {
      const client: Partial<ClientData> = {}

      headers.forEach((header, index) => {
        if (header.toLowerCase() === 'cliente') {
          client.cliente = row[index] || ''
        } else if (header.toLowerCase() !== 'actual') {
          // Store monthly revenue data
          client[header] = row[index] || ''
        }
      })

      return client as ClientData
    })
}

function processCompensData(rawData: string[][]): CompensData[] {
  if (!rawData || rawData.length < 2) return []

  const [headers, ...rows] = rawData

  return rows
    .filter(row => row.some(cell => cell && cell.trim()))
    .map(row => {
      const compenso: Partial<CompensData> = {}

      headers.forEach((header, index) => {
        if (header.toLowerCase() === 'collaboratore' || header.toLowerCase() === 'collaboaratore') {
          compenso.collaboratore = row[index] || ''
        } else {
          // Convert monetary values to numbers
          const value = row[index] || ''
          if (value) {
            const numericValue = convertEuToNumber(value)
            compenso[header] = numericValue
          } else {
            compenso[header] = 0
          }
        }
      })

      return compenso as CompensData
    })
}

function processMappingData(rawData: string[][]): MappingData[] {
  if (!rawData || rawData.length < 2) {
    // Return default mapping
    return DEFAULT_CLIENT_MAPPING.map(([cliente, clienteMap]) => ({
      cliente,
      clienteMap
    }))
  }

  const [headers, ...rows] = rawData

  return rows
    .filter(row => row.some(cell => cell && cell.trim()))
    .map(row => {
      const mapping: Partial<MappingData> = {}

      headers.forEach((header, index) => {
        if (header.toLowerCase() === 'cliente') {
          mapping.cliente = row[index] || ''
        } else if (header.toLowerCase() === 'cliente map') {
          mapping.clienteMap = row[index] || ''
        }
      })

      return mapping as MappingData
    })
}

export async function loadSheetsData(spreadsheetUrl: string): Promise<DashboardData> {
  // Extract spreadsheet ID from URL
  const match = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!match) {
    throw new Error('Invalid Google Sheets URL')
  }

  const spreadsheetId = match[1]

  try {
    // Load all sheets in parallel
    const [logbookData, clientsData, compensiData, mappingData] = await Promise.allSettled([
      getSheetData(spreadsheetId, 'Logbook'),
      getSheetData(spreadsheetId, 'Clienti'),
      getSheetData(spreadsheetId, 'Compensi collaboratori'),
      getSheetData(spreadsheetId, 'Mappa').catch(() => []), // Optional sheet
    ])

    const logbook = logbookData.status === 'fulfilled'
      ? processLogbookData(logbookData.value)
      : []

    const clients = clientsData.status === 'fulfilled'
      ? processClientData(clientsData.value)
      : []

    const compensi = compensiData.status === 'fulfilled'
      ? processCompensData(compensiData.value)
      : []

    const mapping = mappingData.status === 'fulfilled'
      ? processMappingData(mappingData.value)
      : processMappingData([]) // Use default mapping

    return {
      logbook,
      clients,
      compensi,
      mapping
    }
  } catch (error) {
    console.error('Error loading sheets data:', error)
    throw new Error('Failed to load data from Google Sheets')
  }
}