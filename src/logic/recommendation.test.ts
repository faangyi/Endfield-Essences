import { describe, expect, it } from 'vitest'
import {
  findJointFarmingWeapons,
  findMatchingAlluviums,
  optimizeBaseAttributeSelection,
} from './recommendation'
import type { Alluvium, Weapon } from '../types'

const targetWeapon: Weapon = {
  name: '光荣记忆',
  type: '单手剑',
  attributeStats: '敏捷提升',
  secondaryStats: '暴击率提升',
  skillStats: '夜幕',
}

const miningAlluvium: Alluvium = {
  name: '矿脉源区',
  secondaryStats: ['暴击率提升', '攻击提升'],
  skillStats: ['夜幕', '附术', '切骨'],
}

const weapons: Weapon[] = [
  targetWeapon,
  {
    name: '扶摇',
    type: '单手剑',
    attributeStats: '主能力提升',
    secondaryStats: '暴击率提升',
    skillStats: '夜幕',
  },
  {
    name: '楔子',
    type: '手铳',
    attributeStats: '主能力提升',
    secondaryStats: '暴击率提升',
    skillStats: '附术',
  },
  {
    name: '不同固定附加属性',
    type: '单手剑',
    attributeStats: '力量提升',
    secondaryStats: '攻击提升',
    skillStats: '夜幕',
  },
  {
    name: '随机技能不在地点池中',
    type: '单手剑',
    attributeStats: '意志提升',
    secondaryStats: '暴击率提升',
    skillStats: '医疗',
  },
  {
    name: '相同技能但随机附加属性不在地点池中',
    type: '单手剑',
    attributeStats: '智识提升',
    secondaryStats: '生命提升',
    skillStats: '夜幕',
  },
]

describe('findMatchingAlluviums', () => {
  it('only returns an Alluvium containing both target stats', () => {
    expect(findMatchingAlluviums(targetWeapon, [miningAlluvium]).map((item) => item.name))
      .toEqual(['矿脉源区'])
  })

  it('does not combine attributes from two different Alluviums', () => {
    const splitAlluviums: Alluvium[] = [
      { name: '只有附加属性', secondaryStats: ['暴击率提升'], skillStats: [] },
      { name: '只有技能属性', secondaryStats: [], skillStats: ['夜幕'] },
    ]

    expect(findMatchingAlluviums(targetWeapon, splitAlluviums)).toEqual([])
  })

  it('does not use attributeStats when matching an Alluvium', () => {
    const changedBaseStats = { ...targetWeapon, attributeStats: '力量提升' }

    expect(findMatchingAlluviums(changedBaseStats, [miningAlluvium]).map((item) => item.name))
      .toEqual(['矿脉源区'])
  })
})

describe('findJointFarmingWeapons', () => {
  it('finds weapons sharing a fixed secondary stat and a random skill stat', () => {
    const matches = findJointFarmingWeapons(
      targetWeapon,
      miningAlluvium,
      'secondaryStats',
      ['敏捷提升', '主能力提升', '力量提升'],
      weapons,
    )

    expect(matches.map((weapon) => weapon.name)).toEqual([
      '光荣记忆',
      '扶摇',
      '楔子',
    ])
  })

  it('finds weapons sharing a fixed skill stat and a random secondary stat', () => {
    const matches = findJointFarmingWeapons(
      targetWeapon,
      miningAlluvium,
      'skillStats',
      ['敏捷提升', '主能力提升', '力量提升'],
      weapons,
    )

    expect(matches.map((weapon) => weapon.name)).toEqual([
      '光荣记忆',
      '扶摇',
    ])
  })

  it('requires exactly three base stats including the target weapon base stat', () => {
    expect(
      findJointFarmingWeapons(
        targetWeapon,
        miningAlluvium,
        'secondaryStats',
        ['主能力提升', '力量提升', '意志提升'],
        weapons,
      ),
    ).toEqual([])

    expect(
      findJointFarmingWeapons(
        targetWeapon,
        miningAlluvium,
        'secondaryStats',
        ['敏捷提升', '主能力提升'],
        weapons,
      ),
    ).toEqual([])
  })
})

describe('optimizeBaseAttributeSelection', () => {
  it('chooses the combination that matches the most weapons', () => {
    const optimizationWeapons: Weapon[] = [
      targetWeapon,
      ...Array.from({ length: 3 }, (_, index) => ({
        name: \`力量武器\${index + 1}\`,
        type: '单手剑',
        attributeStats: '力量提升',
        secondaryStats: '暴击率提升',
        skillStats: '夜幕',
      })),
      ...Array.from({ length: 2 }, (_, index) => ({
        name: \`意志武器\${index + 1}\`,
        type: '单手剑',
        attributeStats: '意志提升',
        secondaryStats: '暴击率提升',
        skillStats: '夜幕',
      })),
      {
        name: '智识武器',
        type: '单手剑',
        attributeStats: '智识提升',
        secondaryStats: '暴击率提升',
        skillStats: '夜幕',
      },
      {
        name: '主能力武器',
        type: '单手剑',
        attributeStats: '主能力提升',
        secondaryStats: '暴击率提升',
        skillStats: '夜幕',
      },
    ]

    const result = optimizeBaseAttributeSelection(
      targetWeapon,
      miningAlluvium,
      'secondaryStats',
      optimizationWeapons,
    )

    expect(result.recommendedBaseStats).toEqual([
      '敏捷提升',
      '力量提升',
      '意志提升',
    ])
    expect(result.maxMatches).toBe(6)
    expect(result.optimalCombinationCount).toBe(1)
    expect(result.matchingWeapons).toHaveLength(6)
  })

  it('reports ties while returning a stable default combination', () => {
    const result = optimizeBaseAttributeSelection(
      targetWeapon,
      miningAlluvium,
      'secondaryStats',
      weapons,
    )

    expect(result.recommendedBaseStats).toEqual([
      '敏捷提升',
      '力量提升',
      '意志提升',
    ])
    expect(result.optimalCombinationCount).toBeGreaterThan(1)
  })
})
