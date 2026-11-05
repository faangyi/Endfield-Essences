/**
 * Weapon fields use the in-game data names:
 * attributeStats = 基础属性
 * secondaryStats = 附加属性
 * skillStats = 技能属性
 */
export interface Weapon {
  name: string
  type: string
  attributeStats: string
  secondaryStats: string
  skillStats: string
}

/**
 * One Alluvium and the two attribute pools available there.
 * Weapon attributeStats is omitted from matching because it can appear
 * at every Alluvium.
 */
export interface Alluvium {
  name: string
  secondaryStats: string[]
  skillStats: string[]
}

export interface WeaponAlluviumMatch {
  weapon: Weapon
  alluviums: Alluvium[]
}
