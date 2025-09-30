import { NextResponse } from 'next/server'
import { loadSheetsData } from '@/lib/google-sheets'
import { findCanonicalName } from '@/lib/string-normalizer'
import { loadMappingOverrides } from '@/lib/mapping-overrides'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const spreadsheetUrl = process.env.GOOGLE_SHEETS_URL
    if (!spreadsheetUrl) {
      return NextResponse.json({
        error: 'GOOGLE_SHEETS_URL not configured'
      }, { status: 500 })
    }

    // Fetch data from Google Sheets
    const data = await loadSheetsData(spreadsheetUrl)

    if (!data.logbook || data.logbook.length === 0) {
      return NextResponse.json({
        error: 'No data available',
        mappings: {}
      }, { status: 404 })
    }

    // Extract all names for each entity type
    const clientNames = Array.from(new Set(
      data.logbook.map(row => row.cliente).filter(Boolean)
    ))

    const collaboratorNames = Array.from(new Set(
      data.logbook.map(row => row.nome).filter(Boolean)
    ))

    const departmentNames = Array.from(new Set(
      data.logbook.map(row => row.reparto1).filter(Boolean)
    ))

    const macroActivityNames = Array.from(new Set(
      data.logbook.map(row => row.macroAttivita).filter(Boolean)
    ))

    const microActivityNames = Array.from(new Set(
      data.logbook.map(row => row.microAttivita).filter(Boolean)
    ))

    // Load manual overrides
    const overrides = loadMappingOverrides()

    // Generate mappings with 85% threshold and manual overrides
    const clientMapping = findCanonicalName(clientNames, 85, overrides.clienti)
    const collaboratorMapping = findCanonicalName(collaboratorNames, 85, overrides.collaboratori)
    const departmentMapping = findCanonicalName(departmentNames, 85, overrides.reparti)
    const macroActivityMapping = findCanonicalName(macroActivityNames, 85, overrides.macroAttivita)
    const microActivityMapping = findCanonicalName(microActivityNames, 85, overrides.microAttivita)

    // Convert Maps to objects and filter only non-identical mappings
    const clientMappingObj: Record<string, string> = {}
    clientMapping.forEach((canonical, original) => {
      if (original !== canonical) {
        clientMappingObj[original] = canonical
      }
    })

    const collaboratorMappingObj: Record<string, string> = {}
    collaboratorMapping.forEach((canonical, original) => {
      if (original !== canonical) {
        collaboratorMappingObj[original] = canonical
      }
    })

    const departmentMappingObj: Record<string, string> = {}
    departmentMapping.forEach((canonical, original) => {
      if (original !== canonical) {
        departmentMappingObj[original] = canonical
      }
    })

    const macroActivityMappingObj: Record<string, string> = {}
    macroActivityMapping.forEach((canonical, original) => {
      if (original !== canonical) {
        macroActivityMappingObj[original] = canonical
      }
    })

    const microActivityMappingObj: Record<string, string> = {}
    microActivityMapping.forEach((canonical, original) => {
      if (original !== canonical) {
        microActivityMappingObj[original] = canonical
      }
    })

    // Count statistics
    const stats = {
      clienti: {
        totaleOriginali: clientNames.length,
        totaleCanonci: new Set(clientMapping.values()).size,
        mappingApplicati: Object.keys(clientMappingObj).length
      },
      collaboratori: {
        totaleOriginali: collaboratorNames.length,
        totaleCanonci: new Set(collaboratorMapping.values()).size,
        mappingApplicati: Object.keys(collaboratorMappingObj).length
      },
      reparti: {
        totaleOriginali: departmentNames.length,
        totaleCanonci: new Set(departmentMapping.values()).size,
        mappingApplicati: Object.keys(departmentMappingObj).length
      },
      macroAttivita: {
        totaleOriginali: macroActivityNames.length,
        totaleCanonci: new Set(macroActivityMapping.values()).size,
        mappingApplicati: Object.keys(macroActivityMappingObj).length
      },
      microAttivita: {
        totaleOriginali: microActivityNames.length,
        totaleCanonci: new Set(microActivityMapping.values()).size,
        mappingApplicati: Object.keys(microActivityMappingObj).length
      }
    }

    const response = {
      generatedAt: new Date().toISOString(),
      threshold: '85%',
      description: 'Mapping automatico basato su fuzzy matching (Levenshtein distance) con override manuali',
      overridesApplied: overrides,
      stats,
      mappings: {
        clienti: clientMappingObj,
        collaboratori: collaboratorMappingObj,
        reparti: departmentMappingObj,
        macroAttivita: macroActivityMappingObj,
        microAttivita: microActivityMappingObj
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    })

  } catch (error) {
    console.error('Error generating name mappings:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate name mappings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}