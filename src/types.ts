/**
 * Weapon data used by the matching algorithm.
 *
 * baseAttribute is displayed as weapon information, but it does not
 * participate in location matching: every location can produce it.
 */
export interface Weapon {
  id: string
  name: string
  type: string
  baseAttribute: string
  additionalAttribute: string
  skillAttribute: string
}

/**
 * One farming location and the two attribute pools available there.
 * A location matches a weapon only when BOTH weapon attributes are present
 * in this same location.
 */
export interface FarmingLocation {
  id: string
  name: string
  additionalAttributes: string[]
  skillAttributes: string[]
}

export interface WeaponLocationMatch {
  weapon: Weapon
  locations: FarmingLocation[]
}
