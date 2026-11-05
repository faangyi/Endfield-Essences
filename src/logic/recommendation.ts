import type {
  Alluvium,
  BaseAttributeOptimization,
  FixedAttributeType,
  Weapon,
  WeaponAlluviumMatch,
} from '../types'

/**
 * Find Alluviums that can produce both target attributes of a weapon.
 *
 * Both conditions must be true in the same Alluvium:
 * - secondaryStats contains the weapon's secondaryStats
 * - skillStats contains the weapon's skillStats
 *
 * attributeStats is intentionally not checked because it is available
 * at every Alluvium.
 */
export function findMatchingAlluviums(
  weapon: Weapon,
  alluviums: Alluvium[],
): Alluvium[] {
  return alluviums.filter((alluvium) => {
    const hasSecondaryStats =
      alluvium.secondaryStats.includes(weapon.secondaryStats)

    const hasSkillStats =
      alluvium.skillStats.includes(weapon.skillStats)

    return hasSecondaryStats && hasSkillStats
  })
}

/**
 * Find all weapons that can be produced alongside the target weapon by
 * fixing one of its two non-base attributes in the selected Alluvium.
 *
 * Rules:
 * - The target weapon's two non-base attributes must both exist in the
 *   selected Alluvium.
 * - The candidate must share the fixed attribute with the target.
 * - The candidate's other non-base attribute must be in this Alluvium's
 *   corresponding random attribute pool.
 * - Exactly three base attributes must be selected, including the target's
 *   own base attribute.
 */
export function findJointFarmingWeapons(
  target: Weapon,
  alluvium: Alluvium,
  fixedAttributeType: FixedAttributeType,
  selectedBaseStats: string[],
  weapons: Weapon[],
): Weapon[] {
  const selectedBaseStatSet = new Set(selectedBaseStats)

  if (
    selectedBaseStats.length !== 3
    || selectedBaseStatSet.size !== 3
    || !selectedBaseStatSet.has(target.attributeStats)
  ) {
    return []
  }

  // The selected Alluvium must be able to produce the target weapon itself.
  if (
    !alluvium.secondaryStats.includes(target.secondaryStats)
    || !alluvium.skillStats.includes(target.skillStats)
  ) {
    return []
  }

  const fixedPool =
    fixedAttributeType === 'secondaryStats'
      ? alluvium.secondaryStats
      : alluvium.skillStats

  const randomPool =
    fixedAttributeType === 'secondaryStats'
      ? alluvium.skillStats
      : alluvium.secondaryStats

  const fixedValue = target[fixedAttributeType]

  if (!fixedPool.includes(fixedValue)) {
    return []
  }

  return weapons.filter((candidate) => {
    const candidateRandomValue =
      fixedAttributeType === 'secondaryStats'
        ? candidate.skillStats
        : candidate.secondaryStats

    return (
      candidate[fixedAttributeType] === fixedValue
      && randomPool.includes(candidateRandomValue)
      && selectedBaseStatSet.has(candidate.attributeStats)
    )
  })
}

/**
 * Search every possible three-base-attribute selection that includes the
 * target weapon's base attribute. Return the selection that produces the
 * largest number of jointly farmable weapons.
 *
 * If several selections have the same result, the first one in the stable
 * order of base attributes found in the weapons data is chosen by default.
 */
export function optimizeBaseAttributeSelection(
  target: Weapon,
  alluvium: Alluvium,
  fixedAttributeType: FixedAttributeType,
  weapons: Weapon[],
): BaseAttributeOptimization {
  const allBaseStats = [...new Set(weapons.map((weapon) => weapon.attributeStats))]
  const optionalBaseStats = allBaseStats.filter(
    (attribute) => attribute !== target.attributeStats,
  )

  let recommendedBaseStats: string[] = []
  let matchingWeapons: Weapon[] = []
  let maxMatches = -1
  let optimalCombinationCount = 0

  if (!allBaseStats.includes(target.attributeStats) || optionalBaseStats.length < 2) {
    return {
      recommendedBaseStats,
      matchingWeapons,
      maxMatches: 0,
      optimalCombinationCount: 0,
    }
  }

  // The target's base attribute is mandatory, so only two of the remaining
  // base attributes need to be selected.
  for (let first = 0; first < optionalBaseStats.length - 1; first += 1) {
    for (let second = first + 1; second < optionalBaseStats.length; second += 1) {
      const candidateBaseStats = [
        target.attributeStats,
        optionalBaseStats[first],
        optionalBaseStats[second],
      ]

      const candidateMatches = findJointFarmingWeapons(
        target,
        alluvium,
        fixedAttributeType,
        candidateBaseStats,
        weapons,
      )

      if (candidateMatches.length > maxMatches) {
        maxMatches = candidateMatches.length
        recommendedBaseStats = candidateBaseStats
        matchingWeapons = candidateMatches
        optimalCombinationCount = 1
      } else if (candidateMatches.length === maxMatches) {
        optimalCombinationCount += 1
      }
    }
  }

  return {
    recommendedBaseStats,
    matchingWeapons,
    maxMatches: Math.max(maxMatches, 0),
    optimalCombinationCount,
  }
}

/**
 * Generate matching Alluviums for every weapon.
 * Weapons without a match remain in the output with an empty alluviums array.
 */
export function buildWeaponAlluviumMatches(
  weapons: Weapon[],
  alluviums: Alluvium[],
): WeaponAlluviumMatch[] {
  return weapons.map((weapon) => ({
    weapon,
    alluviums: findMatchingAlluviums(weapon, alluviums),
  }))
}
