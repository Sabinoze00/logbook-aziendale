import fs from 'fs'
import path from 'path'

/**
 * Load manual overrides from JSON file
 * This function can only be used server-side (API routes, Server Components)
 */
export function loadMappingOverrides(): Record<string, Record<string, string>> {
  try {
    const overridesPath = path.join(process.cwd(), 'mapping-overrides.json')
    if (fs.existsSync(overridesPath)) {
      const fileContent = fs.readFileSync(overridesPath, 'utf-8')
      return JSON.parse(fileContent)
    }
  } catch (error) {
    console.warn('Could not load mapping overrides:', error)
  }
  return {
    clienti: {},
    collaboratori: {},
    reparti: {},
    macroAttivita: {},
    microAttivita: {}
  }
}