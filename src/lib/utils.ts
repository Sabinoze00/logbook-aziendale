import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export const monthsItToNum = {
  gennaio: 'Gennaio',
  febbraio: 'Febbraio',
  marzo: 'Marzo',
  aprile: 'Aprile',
  maggio: 'Maggio',
  giugno: 'Giugno',
  luglio: 'Luglio',
  agosto: 'Agosto',
  settembre: 'Settembre',
  ottobre: 'Ottobre',
  novembre: 'Novembre',
  dicembre: 'Dicembre'
}

export function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  } catch {
    return '€0,00'
  }
}

export function convertEuToNumber(amountStr: string): number {
  if (typeof amountStr !== 'string') return 0.0

  // Rimuove il simbolo dell'euro e gli spazi, poi gestisce il formato europeo.
  const cleanStr = amountStr
    .replace('€', '')      // Rimuove il simbolo €
    .trim()                // Rimuove spazi bianchi
    .replace(/\./g, '')    // Rimuove i punti (separatori delle migliaia)
    .replace(',', '.')     // Sostituisce la virgola (decimale) con un punto

  try {
    const value = parseFloat(cleanStr);
    return isNaN(value) ? 0.0 : value;
  } catch {
    return 0.0
  }
}

export function extractMonthFromDate(date: Date): string | null {
  try {
    const monthNum = date.getMonth() + 1
    const monthMap: Record<number, string> = {
      1: 'Gennaio', 2: 'Febbraio', 3: 'Marzo', 4: 'Aprile',
      5: 'Maggio', 6: 'Giugno', 7: 'Luglio', 8: 'Agosto',
      9: 'Settembre', 10: 'Ottobre', 11: 'Novembre', 12: 'Dicembre'
    }
    return monthMap[monthNum] || null
  } catch {
    return null
  }
}