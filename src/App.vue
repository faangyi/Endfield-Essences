<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { alluviums } from './data/alluvium'
import { weapons } from './data/weapons'
import {
  buildWeaponAlluviumMatches,
  findJointFarmingAlluviums,
  optimizeBaseAttributeSelection,
} from './logic/recommendation'
import type { FixedAttributeType } from './types'

const selectedWeaponName = ref('光荣记忆')
const selectedWeaponType = ref('全部')
const weaponKeyword = ref('')

const weaponTypes = computed(() => [
  '全部',
  ...new Set(weapons.map((weapon) => weapon.type)),
])

const filteredWeapons = computed(() => {
  const query = weaponKeyword.value.trim().toLocaleLowerCase()

  return weapons.filter((weapon) => {
    const matchesType =
      selectedWeaponType.value === '全部'
      || weapon.type === selectedWeaponType.value

    const matchesKeyword =
      !query || weapon.name.toLocaleLowerCase().includes(query)

    return matchesType && matchesKeyword
  })
})

const selectedWeapon = computed(() =>
  weapons.find((weapon) => weapon.name === selectedWeaponName.value) ?? weapons[0],
)

const weaponAlluviumMatches = computed(() =>
  buildWeaponAlluviumMatches(weapons, alluviums),
)

const fixedAttributeType = ref<FixedAttributeType>('secondaryStats')
const baseSelectionMode = ref<'auto' | 'manual'>('auto')
const manualBaseStats = ref<string[]>([])

const baseAttributeOptions = computed(() => [
  ...new Set(weapons.map((weapon) => weapon.attributeStats)),
])

const optimization = computed(() => {
  if (!selectedWeapon.value) return null

  return optimizeBaseAttributeSelection(
    selectedWeapon.value,
    fixedAttributeType.value,
    weapons,
    alluviums,
  )
})

const selectedBaseStats = computed(() =>
  baseSelectionMode.value === 'auto'
    ? optimization.value?.recommendedBaseStats ?? []
    : manualBaseStats.value,
)

const selectedBaseStatsValid = computed(() =>
  selectedBaseStats.value.length === 3
  && new Set(selectedBaseStats.value).size === 3
  && selectedBaseStats.value.includes(selectedWeapon.value.attributeStats),
)

const alluviumResults = computed(() => {
  if (!selectedBaseStatsValid.value || !selectedWeapon.value) return []

  if (baseSelectionMode.value === 'auto') {
    return optimization.value?.alluviumMatches ?? []
  }

  return findJointFarmingAlluviums(
    selectedWeapon.value,
    fixedAttributeType.value,
    selectedBaseStats.value,
    weapons,
    alluviums,
  )
})

function selectWeapon(name: string) {
  selectedWeaponName.value = name
}

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
  if (attribute === selectedWeapon.value.attributeStats) return

  const current = [...manualBaseStats.value]
  const index = current.indexOf(attribute)

  if (index >= 0) {
    current.splice(index, 1)
  } else {
    if (current.length >= 3) {
      const removableIndex = current.findIndex(
        (item) => item !== selectedWeapon.value.attributeStats,
      )
      if (removableIndex >= 0) current.splice(removableIndex, 1)
    }
    current.push(attribute)
  }

  manualBaseStats.value = current
}

// When the target weapon changes in manual mode, retain as much of the user's
// selection as possible while always including the new target's base attribute.
watch(selectedWeapon, (weapon) => {
  if (baseSelectionMode.value !== 'manual') return

  const retained = manualBaseStats.value
    .filter((attribute) => attribute !== weapon.attributeStats)
    .slice(0, 2)

  const next = [weapon.attributeStats, ...retained]

  for (const attribute of baseAttributeOptions.value) {
    if (next.length === 3) break
    if (!next.includes(attribute)) next.push(attribute)
  }

  manualBaseStats.value = next
})

// If the current category/search hides the selected weapon, keep the selection
// itself; users can still see its selected state when they clear the filter.
const selectedWeaponAlluviums = computed(() =>
  weaponAlluviumMatches.value.find(
    (result) => result.weapon.name === selectedWeapon.value.name,
  )?.alluviums ?? [],
)
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="终末地基质规划首页">
        <span class="brand-mark">E</span>
        <span class="brand-copy">
          <strong>终末地 · 基质规划</strong>
          <small>ENDFIELD ESSENCE PLANNER</small>
        </span>
      </a>
      <div class="topbar-meta">
        <span class="status-mark"></span>
        <span>刻写券联合刷取计算</span>
        <span class="topbar-divider">/</span>
        <span class="topbar-version">数据版 0.3</span>
      </div>
    </header>

    <main class="workspace">
      <section class="panel weapon-panel" aria-label="武器选择">
        <div class="panel-heading weapon-panel-heading">
          <div>
            <p class="section-kicker">01 / 武器库</p>
            <h1>选择目标武器</h1>
          </div>
          <span class="weapon-total">{{ filteredWeapons.length }} <small>/ {{ weapons.length }}</small></span>
        </div>

        <label class="weapon-search">
          <span class="search-symbol">⌕</span>
          <input
            v-model="weaponKeyword"
            type="search"
            placeholder="搜索武器名称"
            aria-label="搜索武器名称"
          />
          <kbd>⌕</kbd>
        </label>

        <div class="weapon-type-tabs" role="group" aria-label="武器种类">
          <button
            v-for="type in weaponTypes"
            :key="type"
            type="button"
            :class="{ active: selectedWeaponType === type }"
            @click="selectedWeaponType = type"
          >
            {{ type }}
          </button>
        </div>

        <div class="weapon-list-scroll">
          <div v-if="filteredWeapons.length" class="weapon-picker-list">
            <button
              v-for="(weapon, index) in filteredWeapons"
              :key="weapon.name"
              type="button"
              class="weapon-picker-card"
              :class="{ selected: selectedWeaponName === weapon.name }"
              :aria-pressed="selectedWeaponName === weapon.name"
              @click="selectWeapon(weapon.name)"
            >
              <span class="weapon-art-placeholder" aria-hidden="true">
                <span class="art-cross"></span>
                <span class="art-orbit"></span>
                <span class="art-initial">{{ weapon.name.slice(0, 1) }}</span>
                <small>图像待添加</small>
              </span>
              <span class="weapon-picker-info">
                <strong class="weapon-picker-name">{{ weapon.name }}</strong>
                <span class="weapon-picker-type">{{ weapon.type }}</span>
                <span class="weapon-stat-chips">
                  <span>{{ weapon.attributeStats }}</span>
                  <span>{{ weapon.secondaryStats }}</span>
                  <span>{{ weapon.skillStats }}</span>
                </span>
              </span>
              <span class="weapon-selected-mark" aria-hidden="true">✓</span>
            </button>
          </div>
          <div v-else class="weapon-empty">
            <strong>没有找到武器</strong>
            <span>请尝试其他名称或切换武器种类。</span>
          </div>
        </div>

        <div class="panel-footnote">
          <span class="footnote-square"></span>
          选择武器后，右侧配置与刷取地点自动更新
        </div>
      </section>

      <section class="panel planner-panel" aria-label="刻写券与刷取结果">
        <div class="panel-heading planner-panel-heading">
          <div>
            <p class="section-kicker">02 / 刻写券配置</p>
            <h2>联合刷取方案</h2>
          </div>
          <div class="target-summary">
            <span>当前目标</span>
            <strong>{{ selectedWeapon.name }}</strong>
          </div>
        </div>

        <div class="planner-controls">
          <section class="control-section fixed-section">
            <div class="control-title">
              <div>
                <h3>固定一种属性</h3>
                <p>刻写券固定其中一种，另一种从淤积区属性池随机出现</p>
              </div>
              <span class="control-index">固定属性 / 1</span>
            </div>
            <div class="fixed-stat-options">
              <button
                type="button"
                class="fixed-stat-option"
                :class="{ active: fixedAttributeType === 'secondaryStats' }"
                :aria-pressed="fixedAttributeType === 'secondaryStats'"
                @click="fixedAttributeType = 'secondaryStats'"
              >
                <span class="fixed-option-label">
                  <span class="radio-indicator"></span>
                  附加属性
                  <span v-if="fixedAttributeType === 'secondaryStats'" class="selected-label">已选</span>
                </span>
                <strong>{{ selectedWeapon.secondaryStats }}</strong>
              </button>
              <button
                type="button"
                class="fixed-stat-option"
                :class="{ active: fixedAttributeType === 'skillStats' }"
                :aria-pressed="fixedAttributeType === 'skillStats'"
                @click="fixedAttributeType = 'skillStats'"
              >
                <span class="fixed-option-label">
                  <span class="radio-indicator"></span>
                  技能属性
                  <span v-if="fixedAttributeType === 'skillStats'" class="selected-label">已选</span>
                </span>
                <strong>{{ selectedWeapon.skillStats }}</strong>
              </button>
            </div>
          </section>

          <section class="control-section base-section">
            <div class="control-title base-control-title">
              <div>
                <h3>选择三种基础属性</h3>
                <p>必须包含目标武器的基础属性，其余两种可以优化或手动指定</p>
              </div>
              <div class="base-mode-switch" role="group" aria-label="基础属性选择方式">
                <button
                  type="button"
                  :class="{ active: baseSelectionMode === 'auto' }"
                  @click="useAutomaticBaseStats"
                >
                  自动最优
                </button>
                <button
                  type="button"
                  :class="{ active: baseSelectionMode === 'manual' }"
                  @click="useManualBaseStats"
                >
                  手动选择
                </button>
              </div>
            </div>

            <div class="base-stat-options">
              <button
                v-for="attribute in baseAttributeOptions"
                :key="attribute"
                type="button"
                class="base-stat-option"
                :class="{
                  active: selectedBaseStats.includes(attribute),
                  locked: attribute === selectedWeapon.attributeStats,
                }"
                :disabled="baseSelectionMode === 'auto' || attribute === selectedWeapon.attributeStats"
                :aria-pressed="selectedBaseStats.includes(attribute)"
                @click="toggleBaseStat(attribute)"
              >
                <span class="base-check">{{ selectedBaseStats.includes(attribute) ? '✓' : '' }}</span>
                {{ attribute }}
                <small v-if="attribute === selectedWeapon.attributeStats">目标必选</small>
              </button>
            </div>

            <div class="optimization-summary">
              <span v-if="baseSelectionMode === 'auto'">
                <span class="signal-dot"></span>
                已比较全部基础属性组合，优先最大化单个淤积区的可刷武器数量
              </span>
              <span v-else>
                手动配置 · 已选择 {{ selectedBaseStats.length }} / 3 种基础属性
              </span>
              <strong v-if="baseSelectionMode === 'auto' && optimization">
                最多 {{ optimization.bestSingleAlluviumCount }} 把
              </strong>
              <strong v-else-if="baseSelectionMode === 'manual'">
                {{ selectedBaseStats.length === 3 ? '配置有效' : '还需选择 ' + (3 - selectedBaseStats.length) + ' 种' }}
              </strong>
            </div>
          </section>
        </div>

        <section class="output-section">
          <div class="output-heading">
            <div>
              <p class="section-kicker">03 / 刷取建议</p>
              <h3>推荐淤积区</h3>
            </div>
            <div class="output-count">
              <strong>{{ alluviumResults.length }}</strong>
              <span>个适配地点</span>
              <i></i>
              <strong>{{ alluviumResults.reduce((sum, item) => sum + item.weapons.length, 0) }}</strong>
              <span>条匹配</span>
            </div>
          </div>

          <div class="alluvium-results-scroll">
            <div v-if="!selectedBaseStatsValid" class="output-empty">
              <span class="empty-symbol">＋</span>
              <strong>请先选择三种基础属性</strong>
              <p>目标武器的基础属性必须保留在选择中。</p>
            </div>

            <div v-else-if="alluviumResults.length" class="alluvium-result-grid">
              <article
                v-for="(result, index) in alluviumResults"
                :key="result.alluvium.name"
                class="alluvium-result-card"
              >
                <header class="alluvium-card-heading">
                  <div class="alluvium-card-title">
                    <span class="alluvium-rank">{{ String(index + 1).padStart(2, '0') }}</span>
                    <h4>{{ result.alluvium.name }}</h4>
                  </div>
                  <span class="alluvium-match-count">
                    <strong>{{ result.weapons.length }}</strong>
                    <small>把可刷</small>
                  </span>
                </header>

                <div class="alluvium-card-weapons">
                  <div
                    v-for="weapon in result.weapons"
                    :key="weapon.name"
                    class="mini-weapon-card"
                    :class="{ 'is-target': weapon.name === selectedWeapon.name }"
                  >
                    <span class="mini-weapon-art" aria-hidden="true">
                      <span>{{ weapon.name.slice(0, 1) }}</span>
                    </span>
                    <span class="mini-weapon-info">
                      <strong>{{ weapon.name }}</strong>
                      <span>{{ weapon.attributeStats }} · {{ weapon.secondaryStats }} · {{ weapon.skillStats }}</span>
                    </span>
                    <span v-if="weapon.name === selectedWeapon.name" class="mini-target-label">目标</span>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="output-empty">
              <span class="empty-symbol">⌕</span>
              <strong>没有找到符合条件的淤积区</strong>
              <p>可以尝试切换固定属性，或手动调整基础属性组合。</p>
            </div>
          </div>

          <div class="output-footnote">
            <span>排序规则：可同时刷取的武器数量由多到少</span>
            <span>目标武器已计入数量</span>
          </div>
        </section>
      </section>
    </main>

    <footer class="page-footer">
      <span>终末地 · 武器基质规划工具</span>
      <span>非官方玩家工具 · 数据以游戏内实际内容为准</span>
      <span>资料版本 0.3</span>
    </footer>
  </div>
</template>
