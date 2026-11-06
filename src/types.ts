/**
 * 游戏内武器属性字段：
 * attributeStats：基础属性
 * secondaryStats：附加属性
 * skillStats：技能属性
 */
export interface Weapon {
  name: string
  type: string
  attributeStats: string
  secondaryStats: string
  skillStats: string
}

/** 淤积区能够随机出现的附加属性与技能属性。 */
export interface Alluvium {
  name: string
  secondaryStats: string[]
  skillStats: string[]
}

export interface WeaponAlluviumMatch {
  weapon: Weapon
  alluviums: Alluvium[]
}

/** 刻写券固定的非基础属性类型。 */
export type FixedAttributeType = 'secondaryStats' | 'skillStats'

/** 一个淤积区在当前刻写券配置下能够同时刷取的武器。 */
export interface AlluviumJointMatch {
  alluvium: Alluvium
  weapons: Weapon[]
}

/** 所有淤积区上的联合刷取结果。 */
export interface BaseAttributeOptimization {
  recommendedBaseStats: string[]
  alluviumMatches: AlluviumJointMatch[]
  /** 单个淤积区最多能够同时刷取的武器数量。 */
  bestSingleAlluviumCount: number
  /** 把各淤积区的可刷武器数量相加，用作并列时的第二排序条件。 */
  totalAlluviumWeaponMatches: number
  optimalCombinationCount: number
}
