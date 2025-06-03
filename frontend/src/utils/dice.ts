/**
 * Dice rolling utilities for D&D encounters
 */

export interface DiceRoll {
  roll: number
  modifier: number
  total: number
}

export interface DiceResult {
  rolls: number[]
  modifier: number
  total: number
  expression: string
}

/**
 * Roll a single die
 */
export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1
}

/**
 * Roll multiple dice
 */
export const rollDice = (count: number, sides: number): number[] => {
  return Array.from({ length: count }, () => rollDie(sides))
}

/**
 * Parse dice notation (e.g., "2d6+3", "1d20", "d4")
 */
export const parseDiceNotation = (notation: string): {
  count: number
  sides: number
  modifier: number
} => {
  const match = notation.toLowerCase().match(/^(\d*)d(\d+)([+-]\d+)?$/)
  
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`)
  }

  const count = parseInt(match[1] || '1')
  const sides = parseInt(match[2])
  const modifier = parseInt(match[3] || '0')

  return { count, sides, modifier }
}

/**
 * Roll dice from notation string
 */
export const rollFromNotation = (notation: string): DiceResult => {
  const { count, sides, modifier } = parseDiceNotation(notation)
  const rolls = rollDice(count, sides)
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier
  
  return {
    rolls,
    modifier,
    total,
    expression: notation
  }
}

/**
 * Roll initiative with dexterity modifier
 */
export const rollInitiative = (dexterityScore: number): DiceRoll => {
  const roll = rollDie(20)
  const modifier = Math.floor((dexterityScore - 10) / 2)
  const total = roll + modifier
  
  return { roll, modifier, total }
}

/**
 * Roll ability check
 */
export const rollAbilityCheck = (abilityScore: number, proficiencyBonus: number = 0): DiceRoll => {
  const roll = rollDie(20)
  const modifier = Math.floor((abilityScore - 10) / 2) + proficiencyBonus
  const total = roll + modifier
  
  return { roll, modifier, total }
}

/**
 * Roll saving throw
 */
export const rollSavingThrow = (abilityScore: number, proficiencyBonus: number = 0): DiceRoll => {
  return rollAbilityCheck(abilityScore, proficiencyBonus)
}

/**
 * Roll attack roll
 */
export const rollAttack = (attackBonus: number): DiceRoll => {
  const roll = rollDie(20)
  const modifier = attackBonus
  const total = roll + modifier
  
  return { roll, modifier, total }
}

/**
 * Check for critical hit (natural 20)
 */
export const isCriticalHit = (roll: DiceRoll): boolean => {
  return roll.roll === 20
}

/**
 * Check for critical miss (natural 1)
 */
export const isCriticalMiss = (roll: DiceRoll): boolean => {
  return roll.roll === 1
}

/**
 * Format dice result for display
 */
export const formatDiceResult = (result: DiceResult): string => {
  const rollsText = result.rolls.join(', ')
  const modifierText = result.modifier !== 0 
    ? ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}`
    : ''
  
  return `[${rollsText}]${modifierText} = ${result.total}`
}

/**
 * Get common dice notations
 */
export const COMMON_DICE = {
  d4: 'd4',
  d6: 'd6', 
  d8: 'd8',
  d10: 'd10',
  d12: 'd12',
  d20: 'd20',
  d100: 'd100'
} as const

/**
 * Common damage dice by weapon type
 */
export const WEAPON_DAMAGE = {
  dagger: '1d4',
  shortsword: '1d6',
  rapier: '1d8',
  longsword: '1d8',
  greatsword: '2d6',
  greataxe: '1d12',
  handaxe: '1d6',
  battleaxe: '1d8',
  warhammer: '1d8',
  maul: '2d6',
  shortbow: '1d6',
  longbow: '1d8',
  crossbow: '1d8',
  javelin: '1d6',
  spear: '1d6'
} as const

export default {
  rollDie,
  rollDice,
  parseDiceNotation,
  rollFromNotation,
  rollInitiative,
  rollAbilityCheck,
  rollSavingThrow,
  rollAttack,
  isCriticalHit,
  isCriticalMiss,
  formatDiceResult,
  COMMON_DICE,
  WEAPON_DAMAGE
}