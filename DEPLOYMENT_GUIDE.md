# Guida al Deploy su Vercel

Questa guida ti aiuterà a deployare la dashboard Next.js su Vercel.

## Prerequisiti

1. Account GitHub/GitLab/Bitbucket
2. Account Vercel (gratuito)
3. Credenziali Google Service Account configurate

## Step 1: Preparazione Repository

1. **Push del codice su Git:**
   ```bash
   git add .
   git commit -m "Initial Next.js dashboard implementation"
   git push origin main
   ```

## Step 2: Import su Vercel

1. Vai su [vercel.com](https://vercel.com)
2. Clicca "New Project"
3. Seleziona la tua repository
4. Vercel rileverà automaticamente Next.js

## Step 3: Configurazione Variabili d'Ambiente

Nella sezione "Environment Variables" di Vercel, aggiungi:

### GOOGLE_SHEETS_URL
- **Name**: `GOOGLE_SHEETS_URL`
- **Value**: Il tuo URL completo del foglio Google Sheets
- **Environment**: Production, Preview, Development

### GOOGLE_SERVICE_ACCOUNT_KEY
- **Name**: `GOOGLE_SERVICE_ACCOUNT_KEY`
- **Value**: Il contenuto completo del JSON delle credenziali (come stringa)
- **Environment**: Production, Preview, Development

**Esempio formato JSON:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Step 4: Deploy

1. Clicca "Deploy"
2. Vercel builderà e deployerà l'applicazione
3. Al completamento, riceverai l'URL di produzione

## Step 5: Verifiche Post-Deploy

### Test Funzionalità
1. Visita l'URL di produzione
2. Verifica che i dati si carichino correttamente
3. Testa tutti i filtri e le visualizzazioni

### Controllo Performance
1. Controlla i Vercel Function logs
2. Verifica i tempi di caricamento
3. Testa su dispositivi mobile

## Troubleshooting

### Errore: "Google Service Account credentials not configured"
- Verifica che `GOOGLE_SERVICE_ACCOUNT_KEY` sia impostata
- Controlla che il JSON sia valido
- Assicurati che sia presente in tutti gli ambienti

### Errore: "Failed to fetch sheet"
- Verifica che `GOOGLE_SHEETS_URL` sia corretto
- Controlla che il foglio sia condiviso con il Service Account
- Verifica che i nomi dei fogli siano corretti

### Errore: "Function timeout"
- Il foglio potrebbe essere troppo grande
- Considera di ottimizzare i dati
- Controlla i logs di Vercel Functions

## Configurazioni Avanzate

### Custom Domain
1. Vai su Project Settings > Domains
2. Aggiungi il tuo dominio personalizzato
3. Configura i DNS records

### Analytics
1. Abilita Vercel Analytics nel progetto
2. Monitora le performance in tempo reale

### Monitoring
1. Configura alerts per errori
2. Monitora usage e performance metrics

## Aggiornamenti

Per deployare aggiornamenti:

1. **Push delle modifiche:**
   ```bash
   git add .
   git commit -m "Update dashboard features"
   git push origin main
   ```

2. **Deploy automatico:**
   - Vercel deploierà automaticamente ad ogni push su main
   - Puoi monitorare il deploy dalla dashboard Vercel

## Best Practices

### Sicurezza
- Mai committare credenziali nel codice
- Usa sempre variabili d'ambiente per dati sensibili
- Abilita HTTPS (Vercel lo fa automaticamente)

### Performance
- Il caching è già configurato (30 minuti)
- Monitora i Function usage per evitare limiti
- Considera di implementare ISR per dati molto statici

### Manutenzione
- Monitora regolarmente i logs
- Aggiorna le dipendenze periodicamente
- Testa le nuove features su branch separate prima del merge

## Support

Se incontri problemi:

1. **Controlla i Vercel Function Logs:**
   - Vai su Vercel Dashboard > Functions
   - Controlla i logs per errori specifici

2. **Verifica configurazione Google:**
   - Controlla permessi del Service Account
   - Verifica che le API siano abilitate
   - Testa la connessione manualmente

3. **Contatta il supporto:**
   - Vercel ha un ottimo supporto community
   - Usa GitHub Issues per problemi specifici al codice