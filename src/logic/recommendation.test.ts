import { describe, expect, it } from 'vitest'
import { findMatchingLocations } from './recommendation'
import type { FarmingLocation, Weapon } from '../types'

const weapon: Weapon = {
  id: 'test-weapon',
  name: '测试武器',
  type: '单手剑',
  baseAttribute: '敏捷',
  additionalAttribute: '暴击',
  skillAttribute: '夜幕',
}

const locations: FarmingLocation[] = [
  {
    id: 'both',
    name: '两种属性都存在',
    additionalAttributes: ['暴击'],
    skillAttributes: ['夜幕'],
  },
  {
    id: 'additional-only',
    name: '只有附加属性',
    additionalAttributes: ['暴击'],
    skillAttributes: ['技能增幅'],
  },
  {
    id: 'skill-only',
    name: '只有技能属性',
    additionalAttributes: ['攻击强化'],
    skillAttributes: ['夜幕'],
  },
]

describe('findMatchingLocations', () => {
  it('only returns a location containing both target attributes', () => {
    expect(findMatchingLocations(weapon, locations).map((item) => item.id))
      .toEqual(['both'])
  })

  it('does not combine attributes from two different locations', () => {
    const splitLocations = locations.filter((item) => item.id !== 'both')

    expect(findMatchingLocations(weapon, splitLocations)).toEqual([])
  })

  it('does not use the weapon base attribute for location matching', () => {
    const changedBaseAttribute = { ...weapon, baseAttribute: '力量' }

    expect(findMatchingLocations(changedBaseAttribute, locations).map((item) => item.id))
      .toEqual(['both'])
  })

  it('returns an empty array when no location can produce both attributes', () => {
    expect(findMatchingLocations(weapon, [])).toEqual([])
  })
})
