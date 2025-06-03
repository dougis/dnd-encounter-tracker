/**
 * Formatting utilities for displaying data
 */

/**
 * Format health as a fraction with percentage
 */
export const formatHealth = (current: number, max: number): string => {
  const percentage = Math.round((current / max) * 100)
  return `${current}/${max} (${percentage}%)`
}

/**
 * Format initiative with dexterity tiebreaker
 */
export const formatInitiative = (initiative: number, dexterity: number): string => {
  const dexMod = Math.floor((dexterity - 10) / 2)
  return `${initiative} (DEX ${dexMod >= 0 ? '+' : ''}${dexMod})`
}

/**
 * Format ability score with modifier
 */
export const formatAbilityScore = (score: number): string => {
  const modifier = Math.floor((score - 10) / 2)
  return `${score} (${modifier >= 0 ? '+' : ''}${modifier})`
}

/**
 * Format duration (e.g., combat rounds, spell duration)
 */
export const formatDuration = (rounds: number): string => {
  if (rounds === 1) return '1 round'
  if (rounds < 10) return `${rounds} rounds`
  
  const minutes = Math.floor(rounds / 10)
  const remainingRounds = rounds % 10
  
  if (remainingRounds === 0) {
    return minutes === 1 ? '1 minute' : `${minutes} minutes`
  }
  
  return `${minutes}m ${remainingRounds}r`
}

/**
 * Format challenge rating
 */
export const formatChallengeRating = (cr: string | number): string => {
  if (typeof cr === 'string') return cr
  if (cr < 1) return `1/${Math.round(1 / cr)}`
  return cr.toString()
}

/**
 * Format XP value with commas
 */
export const formatXP = (xp: number): string => {
  return xp.toLocaleString()
}

/**
 * Format currency (gold pieces)
 */
export const formatCurrency = (amount: number, currency: string = 'gp'): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k ${currency}`
  }
  return `${amount} ${currency}`
}

/**
 * Format distance
 */
export const formatDistance = (feet: number): string => {
  if (feet >= 5280) {
    const miles = feet / 5280
    return `${miles.toFixed(1)} mile${miles !== 1 ? 's' : ''}`
  }
  return `${feet} ft`
}

/**
 * Format weight
 */
export const formatWeight = (pounds: number): string => {
  if (pounds >= 2000) {
    const tons = pounds / 2000
    return `${tons.toFixed(1)} ton${tons !== 1 ? 's' : ''}`
  }
  return `${pounds} lb${pounds !== 1 ? 's' : ''}`
}

/**
 * Format time elapsed
 */
export const formatTimeElapsed = (startTime: string): string => {
  const start = new Date(startTime)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Format date for display
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format date and time for display
 */
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  }
  return 'Just now'
}

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert camelCase to Title Case
 */
export const camelToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim()
}

/**
 * Pluralize a word based on count
 */
export const pluralize = (word: string, count: number): string => {
  if (count === 1) return word
  
  // Simple pluralization rules
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies'
  }
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es'
  }
  return word + 's'
}

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export default {
  formatHealth,
  formatInitiative,
  formatAbilityScore,
  formatDuration,
  formatChallengeRating,
  formatXP,
  formatCurrency,
  formatDistance,
  formatWeight,
  formatTimeElapsed,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  capitalize,
  camelToTitle,
  pluralize,
  truncate
}