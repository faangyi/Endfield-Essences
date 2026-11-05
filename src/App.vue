<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { alluviums } from './data/alluvium'
import { weapons } from './data/weapons'
import {
  buildWeaponAlluviumMatches,
  findJointFarmingWeapons,
  optimizeBaseAttributeSelection,
} from './logic/recommendation'
import type { FixedAttributeType } from './types'

const selectedType = ref('全部类型')
const keyword = ref('')

const typeOptions = computed(() => [
  '全部类型',
  ...new Set(weapons.map((weapon) => weapon.type)),
])

const weaponAlluviumMatches = computed(() =>
  buildWeaponAlluviumMatches(weapons, alluviums),
)

const visibleResults = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()

  return weaponAlluviumMatches.value.filter(({ weapon }) => {
    const matchesType =
      selectedType.value === '全部类型' || weapon.type === selectedType.value

    const searchableText = [
      weapon.name,
      weapon.type,
      weapon.attributeStats,
      weapon.secondaryStats,
      weapon.skillStats,
    ]
      .join(' ')
      .toLocaleLowerCase()

    return matchesType && (!query || searchableText.includes(query))
  })
})

const totalAlluviumMatches = computed(() =>
  visibleResults.value.reduce(
    (total, result) => total + result.alluviums.length,
    0,
  ),
)

function resetFilters() {
  selectedType.value = '全部类型'
  keyword.value = ''
}

// Joint farming planner
const targetType = ref('全部类型')
const targetWeaponName = ref('光荣记忆')
const selectedAlluviumName = ref('')
const fixedAttributeType = ref<FixedAttributeType>('secondaryStats')
const baseSelectionMode = ref<'auto' | 'manual'>('auto')
const manualBaseStats = ref<string[]>([])

const baseAttributeOptions = computed(() => [
  ...new Set(weapons.map((weapon) => weapon.attributeStats)),
])

const targetTypeOptions = computed(() => [
  '全部类型',
  ...new Set(weapons.map((weapon) => weapon.type)),
])

const targetWeaponOptions = computed(() =>
  weapons.filter((weapon) =>
    targetType.value === '全部类型' || weapon.type === targetType.value,
  ),
)

const targetWeapon = computed(() =>
  weapons.find((weapon) => weapon.name === targetWeaponName.value)
  ?? targetWeaponOptions.value[0]
  ?? weapons[0],
)

watch(targetType, () => {
  if (!targetWeaponOptions.value.some((weapon) => weapon.name === targetWeaponName.value)) {
    targetWeaponName.value = targetWeaponOptions.value[0]?.name ?? ''
  }
})

const availableTargetAlluviums = computed(() =>
  targetWeapon.value
    ? weaponAlluviumMatches.value.find(
        (result) => result.weapon.name === targetWeapon.value.name,
      )?.alluviums ?? []
    : [],
)

watch(
  [targetWeaponName, availableTargetAlluviums],
  () => {
    if (!availableTargetAlluviums.value.some(
      (alluvium) => alluvium.name === selectedAlluviumName.value,
    )) {
      selectedAlluviumName.value = availableTargetAlluviums.value[0]?.name ?? ''
    }
  },
  { immediate: true },
)

const selectedAlluvium = computed(() =>
  availableTargetAlluviums.value.find(
    (alluvium) => alluvium.name === selectedAlluviumName.value,
  ),
)

const optimization = computed(() => {
  if (!selectedAlluvium.value || !targetWeapon.value) return null

  return optimizeBaseAttributeSelection(
    targetWeapon.value,
    selectedAlluvium.value,
    fixedAttributeType.value,
    weapons,
  )
})

const selectedBaseStats = computed(() => {
  if (baseSelectionMode.value === 'auto') {
    return optimization.value?.recommendedBaseStats ?? []
  }

  return manualBaseStats.value
})

const jointFarmingWeapons = computed(() => {
  if (!selectedAlluvium.value || !targetWeapon.value) return []

  return findJointFarmingWeapons(
    targetWeapon.value,
    selectedAlluvium.value,
    fixedAttributeType.value,
    selectedBaseStats.value,
    weapons,
  )
})

const selectedBaseStatsValid = computed(() =>
  selectedBaseStats.value.length === 3
  && selectedBaseStats.value.includes(targetWeapon.value.attributeStats),
)

function useAutomaticBaseStats() {
  baseSelectionMode.value = 'auto'
}

function useManualBaseStats() {
  if (baseSelectionMode.value === 'auto') {
    manualBaseStats.value = [...(optimization.value?.recommendedBaseStats ?? [])]
  }
  baseSelectionMode.value = 'manual'
}

function toggleBaseStat(attribute: string) {
  if (attribute === targetWeapon.value.attributeStats) return

  const current = [...manualBaseStats.value]
  const index = current.indexOf(attribute)

  if (index >= 0) {
    current.splice(index, 1)
  } else {
    if (current.length >= 3) {
      const removableIndex = current.findIndex(
        (item) => item !== targetWeapon.value.attributeStats,
      )
      if (removableIndex >= 0) current.splice(removableIndex, 1)
    }
    current.push(attribute)
  }

  manualBaseStats.value = current
}
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="终末地基质刷取指南首页">
        <span class="brand-mark">E</span>
        <span class="brand-copy">
          <strong>ENDFIELD</strong>
          <small>ESSENCE ROUTE GUIDE</small>
        </span>
      </a>
      <span class="topbar-note">WEAPON MATRIX PLANNER <i></i> ALLUVIUM</span>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow"><span></span> 武器基质刷取指南</p>
          <h1>找到适合每把武器的<br /><em>基质刷取区域。</em></h1>
          <p class="hero-description">
            根据武器属性与淤积区掉落池，规划刻写券固定属性，寻找能够一起刷取的武器。
          </p>
          <a class="hero-link" href="#planner">
            开始规划 <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div class="hero-art" aria-hidden="true">
          <div class="orbit orbit-one"></div>
          <div class="orbit orbit-two"></div>
          <div class="orbit orbit-three"></div>
          <div class="core-symbol">✳</div>
          <span class="art-label art-label-top">ATTRIBUTE SYNC</span>
          <span class="art-label art-label-bottom">ENDMINSTER / 001</span>
        </div>

        <div class="hero-index">FIELD NOTES <b>01 — 03</b></div>
      </section>

      <section class="notice" aria-label="数据说明">
        <span class="notice-icon">i</span>
        <p>
          联合刷取会同时检查固定属性、淤积区随机属性池和刻写券选择的三种基础属性。目标武器的基础属性始终保留。
        </p>
      </section>

      <section id="planner" class="joint-planner">
        <div class="section-heading">
          <div>
            <p class="eyebrow">JOINT FARMING / 02</p>
            <h2>联合刷取规划</h2>
            <p class="section-description">
              选择目标武器、淤积区与刻写券固定属性，自动寻找可以一起刷取的武器。
            </p>
          </div>
          <div class="planner-total">
            <strong>{{ jointFarmingWeapons.length }}</strong>
            <span>把可联合刷取</span>
          </div>
        </div>

        <div class="planner-panel">
          <div class="planner-step">
            <div class="step-heading">
              <span class="step-number">01</span>
              <div>
                <h3>选择目标武器</h3>
                <p>先选择你最想获得基质的武器。</p>
              </div>
            </div>
            <div class="planner-fields">
              <label class="filter-field">
                <span>武器类型</span>
                <select v-model="targetType">
                  <option v-for="type in targetTypeOptions" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </label>
              <label class="filter-field">
                <span>搜索 / 选择目标武器</span>
                <input
                  v-model="targetWeaponName"
                  type="search"
                  list="target-weapon-options"
                  placeholder="输入武器名称"
                  aria-label="搜索目标武器"
                />
                <datalist id="target-weapon-options">
                  <option
                    v-for="weapon in targetWeaponOptions"
                    :key="weapon.name"
                    :value="weapon.name"
                  />
                </datalist>
              </label>
            </div>
            <div class="target-weapon-summary">
              <div class="target-weapon-title">
                <strong>{{ targetWeapon.name }}</strong>
                <span class="weapon-type">{{ targetWeapon.type }}</span>
              </div>
              <div class="attribute-list">
                <span class="attribute">
                  <small>基础属性</small>
                  <b>{{ targetWeapon.attributeStats }}</b>
                </span>
                <span class="attribute target-attribute">
                  <small>附加属性</small>
                  <b>{{ targetWeapon.secondaryStats }}</b>
                </span>
                <span class="attribute target-attribute">
                  <small>技能属性</small>
                  <b>{{ targetWeapon.skillStats }}</b>
                </span>
              </div>
            </div>
          </div>

          <div class="planner-step">
            <div class="step-heading">
              <span class="step-number">02</span>
              <div>
                <h3>选择淤积区</h3>
                <p>仅显示能够同时产出目标武器两种非基础属性的区域。</p>
              </div>
            </div>
            <div v-if="availableTargetAlluviums.length" class="choice-chips">
              <button
                v-for="alluvium in availableTargetAlluviums"
                :key="alluvium.name"
                type="button"
                class="choice-chip"
                :class="{ active: selectedAlluviumName === alluvium.name }"
                @click="selectedAlluviumName = alluvium.name"
              >
                {{ alluvium.name }}
              </button>
            </div>
            <p v-else class="planner-empty">当前武器没有可用的淤积区数据。</p>
          </div>

          <div class="planner-step">
            <div class="step-heading">
              <span class="step-number">03</span>
              <div>
                <h3>选择刻写券固定属性</h3>
                <p>固定目标武器的一种非基础属性，另一种从当前淤积区的属性池随机产生。</p>
              </div>
            </div>
            <div class="fixed-stat-options">
              <button
                type="button"
                class="fixed-stat-option"
                :class="{ active: fixedAttributeType === 'secondaryStats' }"
                @click="fixedAttributeType = 'secondaryStats'"
              >
                <span>固定附加属性</span>
                <strong>{{ targetWeapon.secondaryStats }}</strong>
              </button>
              <button
                type="button"
                class="fixed-stat-option"
                :class="{ active: fixedAttributeType === 'skillStats' }"
                @click="fixedAttributeType = 'skillStats'"
              >
                <span>固定技能属性</span>
                <strong>{{ targetWeapon.skillStats }}</strong>
              </button>
            </div>
          </div>

          <div class="planner-step">
            <div class="step-heading">
              <span class="step-number">04</span>
              <div>
                <h3>选择三种基础属性</h3>
                <p>目标武器的基础属性必须包含在内，另外两种由系统优化或手动选择。</p>
              </div>
            </div>

            <div class="base-mode-switch">
              <button
                type="button"
                :class="{ active: baseSelectionMode === 'auto' }"
                @click="useAutomaticBaseStats"
              >
                自动选择最优组合
              </button>
              <button
                type="button"
                :class="{ active: baseSelectionMode === 'manual' }"
                @click="useManualBaseStats"
              >
                手动调整
              </button>
            </div>

            <div v-if="baseSelectionMode === 'auto' && optimization" class="optimization-note">
              <span class="result-dot"></span>
              自动计算了 {{ optimization.optimalCombinationCount }} 种并列最优组合，
              当前默认组合可覆盖 <strong>{{ optimization.maxMatches }}</strong> 把武器。
            </div>
            <div v-else class="optimization-note">
              手动选择三种基础属性。目标武器的基础属性已锁定，不能取消。
            </div>

            <div class="base-stat-options">
              <button
                v-for="attribute in baseAttributeOptions"
                :key="attribute"
                type="button"
                class="base-stat-option"
                :class="{
                  active: selectedBaseStats.includes(attribute),
                  locked: attribute === targetWeapon.attributeStats,
                }"
                :disabled="attribute === targetWeapon.attributeStats"
                @click="toggleBaseStat(attribute)"
              >
                <span class="base-stat-check">{{ selectedBaseStats.includes(attribute) ? '✓' : '+' }}</span>
                {{ attribute }}
                <small v-if="attribute === targetWeapon.attributeStats">目标锁定</small>
              </button>
            </div>
            <p class="base-selection-count">
              已选择 {{ selectedBaseStats.length }} / 3 种基础属性
              <span v-if="baseSelectionMode === 'manual'"> · 修改后结果会立即更新</span>
            </p>
          </div>
        </div>

        <div class="joint-results">
          <div class="joint-results-heading">
            <div>
              <p class="eyebrow">MATCHED WEAPONS / RESULT</p>
              <h3>联合刷取结果</h3>
            </div>
            <span class="joint-result-count">{{ jointFarmingWeapons.length }} 把武器</span>
          </div>

          <div v-if="selectedAlluvium && selectedBaseStatsValid && jointFarmingWeapons.length" class="joint-weapon-list">
            <article
              v-for="(weapon, index) in jointFarmingWeapons"
              :key="weapon.name"
              class="joint-weapon-card"
            >
              <span class="weapon-index">{{ (index + 1).toString().padStart(2, '0') }}</span>
              <div class="joint-weapon-info">
                <div class="weapon-title-line">
                  <h4>{{ weapon.name }}</h4>
                  <span class="weapon-type">{{ weapon.type }}</span>
                  <span v-if="weapon.name === targetWeapon.name" class="target-tag">目标武器</span>
                </div>
                <div class="attribute-list">
                  <span class="attribute" :class="{ 'target-attribute': weapon.attributeStats === targetWeapon.attributeStats }">
                    <small>基础</small><b>{{ weapon.attributeStats }}</b>
                  </span>
                  <span class="attribute" :class="{ 'target-attribute': weapon.secondaryStats === targetWeapon.secondaryStats }">
                    <small>附加</small><b>{{ weapon.secondaryStats }}</b>
                  </span>
                  <span class="attribute" :class="{ 'target-attribute': weapon.skillStats === targetWeapon.skillStats }">
                    <small>技能</small><b>{{ weapon.skillStats }}</b>
                  </span>
                </div>
              </div>
            </article>
          </div>
          <div v-else class="planner-empty result-empty">
            <span>⌕</span>
            <strong>{{ selectedBaseStatsValid ? '当前组合没有其他可联合刷取的武器' : '请完整选择三种基础属性' }}</strong>
            <p>可以尝试切换固定属性或手动调整基础属性组合。</p>
          </div>
          <p v-if="selectedAlluvium" class="result-footnote">
            刷取地点：{{ selectedAlluvium.name }} ·
            固定{{ fixedAttributeType === 'secondaryStats' ? '附加属性' : '技能属性' }}：{{
              fixedAttributeType === 'secondaryStats'
                ? targetWeapon.secondaryStats
                : targetWeapon.skillStats
            }}
          </p>
        </div>
      </section>

      <section id="weapon-catalog" class="planner-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">ALLUVIUM FINDER / 01</p>
            <h2>武器刷取区域一览</h2>
            <p class="section-description">
              查看每把武器能够同时产出目标附加属性与技能属性的所有淤积区。
            </p>
          </div>
          <div class="result-summary">
            <strong>{{ visibleResults.length.toString().padStart(2, '0') }}</strong>
            <span>把武器</span>
            <b>·</b>
            <strong>{{ totalAlluviumMatches.toString().padStart(2, '0') }}</strong>
            <span>条武器-淤积区匹配</span>
          </div>
        </div>

        <div class="filters">
          <label class="filter-field search-field">
            <span>搜索武器或属性</span>
            <div class="input-wrap">
              <span class="search-icon" aria-hidden="true">⌕</span>
              <input
                v-model="keyword"
                type="search"
                placeholder="输入武器名称、基础属性或目标属性"
                aria-label="搜索武器或属性"
              />
            </div>
          </label>

          <label class="filter-field type-field">
            <span>武器类型</span>
            <select v-model="selectedType" aria-label="按武器类型筛选">
              <option v-for="type in typeOptions" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </label>

          <button class="reset-button" type="button" @click="resetFilters">
            重置筛选
          </button>
        </div>

        <div v-if="visibleResults.length" class="weapon-list">
          <article
            v-for="(result, index) in visibleResults"
            :key="result.weapon.name"
            class="weapon-card"
          >
            <div class="weapon-card-main">
              <div class="weapon-index">{{ (index + 1).toString().padStart(2, '0') }}</div>
              <div class="weapon-info">
                <div class="weapon-title-line">
                  <h3>{{ result.weapon.name }}</h3>
                  <span class="weapon-type">{{ result.weapon.type }}</span>
                </div>
                <div class="attribute-list">
                  <span class="attribute">
                    <small>基础属性</small>
                    <b>{{ result.weapon.attributeStats }}</b>
                  </span>
                  <span class="attribute target-attribute">
                    <small>附加属性</small>
                    <b>{{ result.weapon.secondaryStats }}</b>
                  </span>
                  <span class="attribute target-attribute">
                    <small>技能属性</small>
                    <b>{{ result.weapon.skillStats }}</b>
                  </span>
                </div>
              </div>
              <div class="alluvium-count">
                <strong>{{ result.alluviums.length }}</strong>
                <span>可刷淤积区</span>
              </div>
            </div>

            <div class="alluvium-results">
              <template v-if="result.alluviums.length">
                <div class="alluvium-label">
                  <span class="result-dot"></span>
                  匹配淤积区
                </div>
                <div class="alluvium-chips">
                  <span
                    v-for="alluvium in result.alluviums"
                    :key="alluvium.name"
                    class="alluvium-chip"
                  >
                    <b>{{ alluvium.name }}</b>
                    <span>附加 ✓</span>
                    <span>技能 ✓</span>
                  </span>
                </div>
              </template>
              <div v-else class="no-alluvium">
                <span>—</span>
                当前数据中，没有同时包含这两种目标属性的淤积区。
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <span>⌕</span>
          <h3>没有找到符合条件的武器</h3>
          <p>试试其他关键词，或重置筛选条件。</p>
          <button type="button" class="reset-button" @click="resetFilters">
            清除筛选
          </button>
        </div>
      </section>

      <section class="rule-note">
        <div class="rule-number">RULE / 02</div>
        <div>
          <h2>联合刷取规则</h2>
          <p>
            使用刻写券时，固定属性必须与目标武器对应属性一致；另一种非基础属性从当前淤积区的八种属性中随机出现。
            三种基础属性必须包含目标武器的基础属性。自动模式会枚举所有可行组合，选择能覆盖最多武器的方案。
          </p>
        </div>
      </section>
    </main>

    <footer class="footer">
      <a class="brand footer-brand" href="#">
        <span class="brand-mark">E</span>
        <span class="brand-copy">
          <strong>ENDFIELD</strong>
          <small>ESSENCE ROUTE GUIDE</small>
        </span>
      </a>
      <span>非官方玩家工具 · 数据以游戏实际内容为准</span>
      <span class="footer-code">BUILD 0.2.0</span>
    </footer>
  </div>
</template>
