import { describe, expect, it } from 'vitest'
import { findMatchingAlluviums } from './recommendation'
import type { Alluvium, Weapon } from '../types'

const weapon: Weapon = {
  name: '光荣记忆',
  type: '单手剑',
  attributeStats: '敏捷提升',
  secondaryStats: '暴击率提升',
  skillStats: '夜幕',
}

const alluviums: Alluvium[] = [
  {
    name: '双属性均存在',
    secondaryStats: ['暴击率提升'],
    skillStats: ['夜幕'],
  },
  {
    name: '只有附加属性',
    secondaryStats: ['暴击率提升'],
    skillStats: ['附术'],
  },
  {
    name: '只有技能属性',
    secondaryStats: ['攻击提升'],
    skillStats: ['夜幕'],
  },
]

describe('findMatchingAlluviums', () => {
  it('only returns an Alluvium containing both target stats', () => {
    expect(findMatchingAlluviums(weapon, alluviums).map((item) => item.name))
      .toEqual(['双属性均存在'])
  })

  it('does not combine attributes from two different Alluviums', () => {
    const splitAlluviums = alluviums.filter(
      (item) => item.name !== '双属性均存在',
    )

    expect(findMatchingAlluviums(weapon, splitAlluviums)).toEqual([])
  })

  it('does not use attributeStats when matching', () => {
    const changedBaseStats = { ...weapon, attributeStats: '力量提升' }

    expect(findMatchingAlluviums(changedBaseStats, alluviums).map((item) => item.name))
      .toEqual(['双属性均存在'])
  })

  it('returns an empty array when no Alluvium can produce both stats', () => {
    expect(findMatchingAlluviums(weapon, [])).toEqual([])
  })
})
