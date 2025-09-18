# Dashboard Aziendale - Next.js

Una dashboard moderna per l'analisi dei dati aziendali, costruita con Next.js e integrata con Google Sheets per il recupero dati in tempo reale.

## Caratteristiche

- 🚀 **Next.js 14** con App Router e TypeScript
- 📊 **Integrazione Google Sheets** per dati in tempo reale
- 📈 **Visualizzazioni interattive** con Recharts
- 🎨 **UI moderna** con Tailwind CSS
- ⚡ **Performance ottimizzate** con caching e ISR
- 📱 **Design responsive** per tutti i dispositivi
- 🌍 **Localizzazione italiana** per date e valute

## Prerequisiti

- Node.js 18.0 o superiore
- Account Google con accesso a Google Sheets
- Credenziali Service Account Google

## Setup Locale

1. **Clona il repository e installa le dipendenze:**
   ```bash
   cd nextjs-dashboard
   npm install
   ```

2. **Configura le variabili d'ambiente:**
   ```bash
   cp .env.example .env.local
   ```

   Modifica `.env.local` con:
   - `GOOGLE_SHEETS_URL`: URL del tuo foglio Google Sheets
   - `GOOGLE_SERVICE_ACCOUNT_KEY`: JSON delle credenziali del Service Account

3. **Avvia il server di sviluppo:**
   ```bash
   npm run dev
   ```

## Deploy su Vercel

1. **Push su GitHub/GitLab/Bitbucket**

2. **Importa il progetto su Vercel:**
   - Vai su [vercel.com](https://vercel.com)
   - Clicca "New Project"
   - Importa dalla tua repository

3. **Configura le variabili d'ambiente:**
   - Aggiungi `GOOGLE_SHEETS_URL`
   - Aggiungi `GOOGLE_SERVICE_ACCOUNT_KEY`

4. **Deploy automatico:**
   - Vercel deploierà automaticamente ad ogni push

## Configurazione Google Sheets

### Setup Service Account

1. Vai alla [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita le API:
   - Google Sheets API
   - Google Drive API
4. Crea un Service Account:
   - Vai su "IAM & Admin" > "Service Accounts"
   - Crea nuovo service account
   - Scarica il file JSON delle credenziali

### Struttura Fogli Google Sheets

Il tuo foglio deve contenere questi worksheets:

#### Logbook
Colonne richieste:
- Nome (collaboratore)
- Data (formato DD/MM/YYYY)
- Mese
- Giorno
- Reparto1
- Macro attività
- Micro attività
- Cliente
- Note
- Minuti Impiegati

#### Clienti
- Cliente (nome cliente)
- Colonne mesi: Gennaio, Febbraio, etc.
- Valori fatturato in formato europeo (€ 1.234,56)

#### Compensi collaboratori
- Collaboratore (nome)
- Colonne mesi: Gennaio, Febbraio, etc.
- Valori compensi in formato numerico

#### Mappa (opzionale)
- Cliente (nome originale)
- Cliente Map (nome mappato)

### Permessi

Condividi il foglio Google Sheets con l'email del Service Account (visibile nel file JSON delle credenziali).

## Funzionalità

### Dashboard Principale
- **Metriche KPI**: Ore lavorate, costi orari, fatturato, margini
- **Filtri avanzati**: Data, collaboratori, reparti, attività, clienti
- **Grafici interattivi**: Ore per collaboratore, distribuzione clienti
- **Tabella riepilogo**: Dettagli collaboratori con metriche

### Performance
- **Caching**: 30 minuti per dati Google Sheets
- **ISR**: Rigenerazione incrementale statica
- **API caching**: Response caching per performance ottimali

### Localizzazione
- **Date**: Formato italiano
- **Valute**: Euro con separatori italiani
- **UI**: Testo in italiano

## Struttura Progetto

```
src/
├── app/
│   ├── api/dashboard-data/    # API route per dati
│   └── page.tsx               # Pagina principale
├── components/
│   ├── dashboard/             # Componenti dashboard
│   └── ui/                    # Componenti UI base
├── hooks/
│   └── use-dashboard.ts       # Hook logica dashboard
└── lib/
    ├── google-sheets.ts       # Integrazione Google Sheets
    ├── data-processor.ts      # Processamento dati
    ├── types.ts               # TypeScript types
    └── utils.ts               # Utilities

```

## API

### GET /api/dashboard-data
Endpoint per recuperare i dati dal foglio Google Sheets.

**Response:**
```json
{
  "logbook": [...],
  "clients": [...],
  "compensi": [...],
  "mapping": [...]
}
```

## Tecnologie Utilizzate

- **Next.js 14**: Framework React
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Recharts**: Grafici e visualizzazioni
- **Google APIs**: Integrazione Google Sheets
- **Lucide React**: Icone
- **Date-fns**: Manipolazione date

## Note di Sicurezza

- Le credenziali Google sono gestite come variabili d'ambiente
- Non committare mai le credenziali nel codice
- Utilizza sempre HTTPS in produzione
- Le API hanno timeout configurati per evitare hanging requests

## Support

Per problemi o domande:
1. Controlla la configurazione delle variabili d'ambiente
2. Verifica i permessi del foglio Google Sheets
3. Controlla i logs di Vercel per errori di deployment
