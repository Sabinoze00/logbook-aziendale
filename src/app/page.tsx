import { loadSheetsData } from '@/lib/google-sheets'
import { loadMappingOverrides } from '@/lib/mapping-overrides'
import { processLogbookEntries } from '@/lib/data-processor'
import { DashboardClient } from '@/components/dashboard-client'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // Revalidate every 30 minutes

export default async function DashboardPage() {
  try {
    if (!process.env.GOOGLE_SHEETS_URL) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Errore di Configurazione</h1>
            <p className="text-black">
              URL del foglio Google non configurato. Controlla le variabili d&apos;ambiente.
            </p>
          </div>
        </div>
      )
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Errore di Configurazione</h1>
            <p className="text-black">
              Credenziali Google Service Account non configurate. Controlla le variabili d&apos;ambiente.
            </p>
          </div>
        </div>
      )
    }

    const data = await loadSheetsData(process.env.GOOGLE_SHEETS_URL)

    // Load overrides and process entries server-side
    const overrides = loadMappingOverrides()
    const processedLogbook = processLogbookEntries(data.logbook, overrides)

    // Replace the raw logbook with processed entries
    const processedData = {
      ...data,
      logbook: processedLogbook
    }

    return <DashboardClient initialData={processedData} />
  } catch (error) {
    console.error('Error loading dashboard:', error)

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Errore di Caricamento</h1>
          <p className="text-black mb-4">
            Impossibile caricare i dati dal foglio Google Sheets.
          </p>
          <div className="text-sm text-black">
            <p>Verifica:</p>
            <ul className="list-disc list-inside mt-2">
              <li>La connessione Internet</li>
              <li>Che le credenziali Google siano valide</li>
              <li>Che il foglio sia accessibile e condiviso con l&apos;account di servizio</li>
              <li>Che i nomi dei fogli siano corretti: &quot;Logbook&quot;, &quot;Clienti&quot;, &quot;Compensi collaboratori&quot;</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
}
