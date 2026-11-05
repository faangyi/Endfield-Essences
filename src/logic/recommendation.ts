import type {
  Alluvium,
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
