/**
 * Normalize a string by removing spaces, converting to lowercase, and removing accents
 */
export function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '') // Remove all whitespace
    .trim()
}

/**
 * Calculate Levenshtein distance between two strings
 * (minimum number of single-character edits needed to change one string into another)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[len1][len2]
}

/**
 * Calculate similarity percentage between two strings (0-100)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeForComparison(str1)
  const normalized2 = normalizeForComparison(str2)

  if (normalized1 === normalized2) return 100

  const distance = levenshteinDistance(normalized1, normalized2)
  const maxLength = Math.max(normalized1.length, normalized2.length)

  if (maxLength === 0) return 100

  return ((maxLength - distance) / maxLength) * 100
}

/**
 * Find the canonical name from a list of names based on similarity
 * Returns the name with the highest occurrence count, or the first one found if all equal
 * Can accept manual overrides to force specific mappings
 */
export function findCanonicalName(
  names: string[],
  threshold: number = 85,
  manualOverrides: Record<string, string> = {}
): Map<string, string> {
  const nameGroups = new Map<string, string[]>() // normalized -> original names
  const nameCounts = new Map<string, number>()   // original name -> count

  // Count occurrences
  names.forEach(name => {
    nameCounts.set(name, (nameCounts.get(name) || 0) + 1)
  })

  // Group similar names
  names.forEach(name => {
    const normalized = normalizeForComparison(name)

    // Check if this name matches any existing group
    let foundGroup = false
    for (const [groupNorm, groupNames] of nameGroups.entries()) {
      const similarity = calculateSimilarity(normalized, groupNorm)

      if (similarity >= threshold) {
        groupNames.push(name)
        foundGroup = true
        break
      }
    }

    // If no group found, create new one
    if (!foundGroup) {
      nameGroups.set(normalized, [name])
    }
  })

  // Create mapping: each variant -> most common name in group
  const mapping = new Map<string, string>()

  for (const groupNames of nameGroups.values()) {
    // Find most common name in this group
    let canonicalName = groupNames[0]
    let maxCount = nameCounts.get(canonicalName) || 0

    groupNames.forEach(name => {
      const count = nameCounts.get(name) || 0
      if (count > maxCount) {
        maxCount = count
        canonicalName = name
      }
    })

    // Map all variants to canonical name
    groupNames.forEach(name => {
      mapping.set(name, canonicalName)
    })
  }

  // Apply manual overrides (these take precedence over fuzzy matching)
  Object.entries(manualOverrides).forEach(([original, canonical]) => {
    mapping.set(original, canonical)
  })

  return mapping
}

/**
 * Normalize a list of entries by grouping similar names
 */
export function normalizeNames<T extends { [key: string]: unknown }>(
  entries: T[],
  fieldName: keyof T,
  threshold: number = 85,
  manualOverrides: Record<string, string> = {}
): T[] {
  // Extract all unique names
  const allNames = Array.from(new Set(entries.map(entry => String(entry[fieldName]))))

  // Find canonical names
  const nameMapping = findCanonicalName(allNames, threshold, manualOverrides)

  // Apply mapping
  return entries.map(entry => ({
    ...entry,
    [fieldName]: nameMapping.get(String(entry[fieldName])) || entry[fieldName]
  }))
}