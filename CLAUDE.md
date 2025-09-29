# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server on port 3000
- **Build**: `npm run build` - Creates production build
- **Production start**: `npm run start` - Runs production build
- **Linting**: `npm run lint` - Runs ESLint (note: lint command has no arguments specified)

## Project Overview

This is a Next.js 15 dashboard application for business data analysis, built with:
- **Next.js 15** with App Router and TypeScript
- **Google Sheets integration** for real-time data fetching
- **Recharts** for interactive visualizations
- **Tailwind CSS** for styling
- **Italian localization** for dates and currency formatting

## Architecture

### Data Flow
1. **Google Sheets → API Route → Server Components → Client Components**
2. Server-side data fetching with 30-minute caching (`revalidate = 1800`)
3. Client-side state management through custom hooks
4. Real-time filtering and KPI calculations

### Key Components Structure
```
src/
├── app/
│   ├── api/dashboard-data/route.ts    # API endpoint for Google Sheets data
│   ├── page.tsx                       # Main dashboard server component
│   └── layout.tsx                     # Root layout
├── components/
│   ├── dashboard-client.tsx           # Main client-side dashboard wrapper
│   ├── dashboard/                     # Dashboard-specific components
│   │   ├── metrics-cards.tsx          # KPI cards display
│   │   ├── filters.tsx                # Filter controls
│   │   ├── hours-by-collaborator-chart.tsx
│   │   ├── hours-by-client-chart.tsx
│   │   └── collaborator-summary-table.tsx
│   └── ui/                           # Reusable UI components
├── hooks/
│   └── use-dashboard.ts              # Dashboard state management and logic
└── lib/
    ├── google-sheets.ts              # Google Sheets API integration
    ├── data-processor.ts             # Data filtering and KPI calculations
    ├── types.ts                      # TypeScript type definitions
    └── utils.ts                      # Utility functions
```

### Data Layer
- **Google Sheets Integration** (`google-sheets.ts`): Handles authentication and data fetching from 4 sheets:
  - "Logbook": Time tracking entries
  - "Clienti": Client revenue data (with European currency formatting)
  - "Compensi collaboratori": Employee compensation data
  - "Mappa": Client name mapping (optional, has default fallback)

- **Data Processing** (`data-processor.ts`): Complex business logic for:
  - Date filtering and parsing (supports DD/MM/YYYY format primarily)
  - KPI calculations (hours, costs, revenue, margins)
  - Aggregations by collaborator and client
  - European currency parsing (€ 1.234,56 format)

### State Management
- **Custom hook** (`use-dashboard.ts`) manages all dashboard state:
  - Filter options (date range, collaborators, departments, activities, clients)
  - Processed data and KPIs
  - Loading and error states
  - Drill-down functionality for chart interactions

## Google Sheets Configuration

### Required Environment Variables
- `GOOGLE_SHEETS_URL`: Full URL to the Google Sheets document
- `GOOGLE_SERVICE_ACCOUNT_KEY`: JSON credentials as string

### Sheet Structure Requirements
- **Logbook**: Must have columns: Nome, Data (DD/MM/YYYY), Mese, Giorno, Reparto1, Macro attività, Micro attività, Cliente, Note, Minuti Impiegati
- **Clienti**: Must have "Cliente" column + monthly columns (Gennaio, Febbraio, etc.) with European currency format
- **Compensi collaboratori**: Must have "Collaboratore" column + monthly compensation columns
- **Mappa** (optional): Cliente → Cliente Map mappings

## Important Implementation Details

### Date Parsing
The application primarily expects DD/MM/YYYY format but has fallbacks for multiple date formats. There's specific debugging logic for user "Jean" in the date parsing.

### Currency Handling
European currency format (€ 1.234,56) is parsed using `convertEuToNumber()` utility function.

### Caching Strategy
- API responses cached for 30 minutes (`Cache-Control: public, s-maxage=1800`)
- Server components use ISR with 30-minute revalidation
- Parallel sheet loading with `Promise.allSettled()` for resilience

### Error Handling
- Graceful degradation for missing sheets (Mappa sheet has default mapping)
- Environment variable validation with user-friendly error messages
- API error boundaries with retry functionality

## Development Notes

- TypeScript paths configured with `@/*` alias for `./src/*`
- Uses `dynamic = 'force-dynamic'` and ISR for optimal performance
- Client components are separated from server components following Next.js App Router patterns
- Italian UI text throughout the application
- Responsive design with Tailwind CSS