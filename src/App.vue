<script setup lang="ts">
import { computed, ref } from 'vue'
import { alluviums } from './data/alluvium'
import { weapons } from './data/weapons'
import { buildWeaponAlluviumMatches } from './logic/recommendation'

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
            根据武器的附加属性与技能属性，快速筛选能够同时产出两种目标属性的淤积区。
          </p>
          <a class="hero-link" href="#planner">
            开始查询 <span aria-hidden="true">↓</span>
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
          已接入武器与淤积区数据。每条推荐都要求目标附加属性和技能属性同时出现在同一个淤积区。
        </p>
      </section>

      <section id="planner" class="planner-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">ALLUVIUM FINDER / 01</p>
            <h2>武器刷取区域</h2>
            <p class="section-description">
              选择或搜索武器，查看同时包含目标附加属性与技能属性的淤积区。
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
        <div class="rule-number">RULE / 01</div>
        <div>
          <h2>匹配规则</h2>
          <p>
            一个淤积区必须同时包含武器指定的附加属性和技能属性，才会被列为可刷取区域。
            两种属性分别出现在不同淤积区时，不视为匹配。基础属性不参与淤积区筛选。
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
      <span class="footer-code">BUILD 0.1.0</span>
    </footer>
  </div>
</template>
