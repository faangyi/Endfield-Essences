import type {
  Alluvium,
  AlluviumJointMatch,
  BaseAttributeOptimization,
  FixedAttributeType,
  Weapon,
} from '../types'

/**
 * 找出能够同时产出目标武器附加属性与技能属性的淤积区。
 * 基础属性不参与此判断，因为它在所有淤积区均可能出现。
 */
export function findMatchingAlluviums(
  weapon: Weapon,
  alluviums: Alluvium[],
): Alluvium[] {
  return alluviums.filter((alluvium) =>
    alluvium.secondaryStats.includes(weapon.secondaryStats)
    && alluvium.skillStats.includes(weapon.skillStats),
  )
}

/**
 * 在一个指定淤积区中，寻找能够与目标武器一起刷取的武器。
 *
 * 固定附加属性时：候选武器附加属性相同，技能属性存在于该区技能池。
 * 固定技能属性时：候选武器技能属性相同，附加属性存在于该区附加属性池。
 * 基础属性必须属于刻写券选定的三种属性，且必须恰好选择三种。
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

  // 所选淤积区必须能够产出目标武器本身。
  if (
    !alluvium.secondaryStats.includes(target.secondaryStats)
    || !alluvium.skillStats.includes(target.skillStats)
  ) {
    return []
  }

  const fixedPool = fixedAttributeType === 'secondaryStats'
    ? alluvium.secondaryStats
    : alluvium.skillStats

  const randomPool = fixedAttributeType === 'secondaryStats'
    ? alluvium.skillStats
    : alluvium.secondaryStats

  const fixedValue = target[fixedAttributeType]

  if (!fixedPool.includes(fixedValue)) return []

  return weapons.filter((candidate) => {
    const randomValue = fixedAttributeType === 'secondaryStats'
      ? candidate.skillStats
      : candidate.secondaryStats

    return (
      candidate[fixedAttributeType] === fixedValue
      && randomPool.includes(randomValue)
      && selectedBaseStatSet.has(candidate.attributeStats)
    )
  })
}

/**
 * 不再要求用户预先指定淤积区。
 * 对全部淤积区分别计算联合刷取武器，并按武器数量从多到少排序。
 * 不符合目标武器基础属性组合的淤积区不会出现在结果中。
 */
export function findJointFarmingAlluviums(
  target: Weapon,
  fixedAttributeType: FixedAttributeType,
  selectedBaseStats: string[],
  weapons: Weapon[],
  alluviums: Alluvium[],
): AlluviumJointMatch[] {
  return alluviums
    .map((alluvium) => ({
      alluvium,
      weapons: findJointFarmingWeapons(
        target,
        alluvium,
        fixedAttributeType,
        selectedBaseStats,
        weapons,
      ),
    }))
    .filter((match) => match.weapons.length > 0)
    .sort((a, b) => b.weapons.length - a.weapons.length)
}

/**
 * 自动优化三种基础属性。
 *
 * 目标武器的基础属性固定占一个名额，其余两个名额从其他基础属性中
 * 枚举选择。优化目标按顺序为：
 * 1. 最大化单个淤积区能够同时刷取的武器数量；
 * 2. 若并列，最大化所有淤积区的武器-地点匹配总数；
 * 3. 若仍并列，最大化有可用结果的淤积区数量。
 *
 * 所有指标仍然只对可同时刷取的武器进行计数，且目标武器包含在结果中。
 */
export function optimizeBaseAttributeSelection(
  target: Weapon,
  fixedAttributeType: FixedAttributeType,
  weapons: Weapon[],
  alluviums: Alluvium[],
): BaseAttributeOptimization {
  const allBaseStats = [...new Set(weapons.map((weapon) => weapon.attributeStats))]
  const optionalBaseStats = allBaseStats.filter(
    (attribute) => attribute !== target.attributeStats,
  )

  let recommendedBaseStats: string[] = []
  let alluviumMatches: AlluviumJointMatch[] = []
  let bestSingleAlluviumCount = -1
  let totalAlluviumWeaponMatches = -1
  let bestAlluviumCount = -1
  let optimalCombinationCount = 0

  if (!allBaseStats.includes(target.attributeStats) || optionalBaseStats.length < 2) {
    return {
      recommendedBaseStats,
      alluviumMatches,
      bestSingleAlluviumCount: 0,
      totalAlluviumWeaponMatches: 0,
      optimalCombinationCount: 0,
    }
  }

  for (let first = 0; first < optionalBaseStats.length - 1; first += 1) {
    for (let second = first + 1; second < optionalBaseStats.length; second += 1) {
      const candidateBaseStats = [
        target.attributeStats,
        optionalBaseStats[first],
        optionalBaseStats[second],
      ]

      const candidateMatches = findJointFarmingAlluviums(
        target,
        fixedAttributeType,
        candidateBaseStats,
        weapons,
        alluviums,
      )

      const candidateBestSingle = candidateMatches.reduce(
        (best, match) => Math.max(best, match.weapons.length),
        0,
      )
      const candidateTotalMatches = candidateMatches.reduce(
        (total, match) => total + match.weapons.length,
        0,
      )
      const candidateAlluviumCount = candidateMatches.length

      const isBetter =
        candidateBestSingle > bestSingleAlluviumCount
        || (
          candidateBestSingle === bestSingleAlluviumCount
          && candidateTotalMatches > totalAlluviumWeaponMatches
        )
        || (
          candidateBestSingle === bestSingleAlluviumCount
          && candidateTotalMatches === totalAlluviumWeaponMatches
          && candidateAlluviumCount > bestAlluviumCount
        )

      if (isBetter) {
        recommendedBaseStats = candidateBaseStats
        alluviumMatches = candidateMatches
        bestSingleAlluviumCount = candidateBestSingle
        totalAlluviumWeaponMatches = candidateTotalMatches
        bestAlluviumCount = candidateAlluviumCount
        optimalCombinationCount = 1
      } else if (
        candidateBestSingle === bestSingleAlluviumCount
        && candidateTotalMatches === totalAlluviumWeaponMatches
        && candidateAlluviumCount === bestAlluviumCount
      ) {
        optimalCombinationCount += 1
      }
    }
  }

  return {
    recommendedBaseStats,
    alluviumMatches,
    bestSingleAlluviumCount: Math.max(bestSingleAlluviumCount, 0),
    totalAlluviumWeaponMatches: Math.max(totalAlluviumWeaponMatches, 0),
    optimalCombinationCount,
  }
}

