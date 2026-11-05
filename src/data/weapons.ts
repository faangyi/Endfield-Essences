import type { Weapon } from '../types'

/**
 * DEMO DATA ONLY.
 * Replace these rows with the verified weapon table when it is provided.
 */
export const weapons: Weapon[] = [
  {
    id: 'glory-memory',
    name: '光荣记忆',
    type: '演示类型 A',
    baseAttribute: '敏捷',
    additionalAttribute: '暴击',
    skillAttribute: '夜幕',
  },
  {
    id: 'demo-weapon-02',
    name: '演示武器·02',
    type: '演示类型 B',
    baseAttribute: '力量',
    additionalAttribute: '攻击强化',
    skillAttribute: '技能增幅',
  },
  {
    id: 'demo-weapon-03',
    name: '演示武器·03',
    type: '演示类型 A',
    baseAttribute: '意志',
    additionalAttribute: '暴击',
    skillAttribute: '技能增幅',
  },
]
