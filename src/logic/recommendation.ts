import type {
  FarmingLocation,
  Weapon,
  WeaponLocationMatch,
} from '../types'

/**
 * Return only locations that can produce both of the weapon's target
 * attributes at the same time.
 *
 * The basic attribute is intentionally ignored: according to the game
 * rules provided for this project, it can appear at every location.
 *
 * Important: do not match the two attributes across different locations.
 * Both checks must pass against the same FarmingLocation.
 */
export function findMatchingLocations(
  weapon: Weapon,
  locations: FarmingLocation[],
): FarmingLocation[] {
  return locations.filter((location) => {
    const hasAdditionalAttribute =
      location.additionalAttributes.includes(weapon.additionalAttribute)

    const hasSkillAttribute =
      location.skillAttributes.includes(weapon.skillAttribute)

    return hasAdditionalAttribute && hasSkillAttribute
  })
}

/**
 * Build the location recommendations for a collection of weapons.
 * Weapons with no valid location are kept in the result so the UI can
 * explain that the current data contains no matching farming location.
 */
export function buildWeaponLocationMatches(
  weapons: Weapon[],
  locations: FarmingLocation[],
): WeaponLocationMatch[] {
  return weapons.map((weapon) => ({
    weapon,
    locations: findMatchingLocations(weapon, locations),
  }))
}
