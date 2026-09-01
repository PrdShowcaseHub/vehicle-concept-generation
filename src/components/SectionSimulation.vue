<template>
  <section id="simulation" class="section">
    <div class="section-header">
      <span class="section-tag">实战演练</span>
      <h2 class="section-title">模拟方案演示</h2>
      <p class="section-desc">以"长安启源品牌、6-8万紧凑型轿车市场、PHEV、2028年上市"为示例场景，串联全流程输出，展示从需求输入到产品概念生成的完整链路。</p>
    </div>

    <div class="callout callout-info">
      <SvgIcon name="lightbulb" :size="20" class="callout-icon" />
      <div class="callout-body">
        <strong>模拟场景设定</strong>
        {{ sim.background }}
      </div>
    </div>

    <!-- Step Navigation -->
    <div style="position: sticky; top: 60px; z-index: 40; background: var(--c-bg); padding: var(--sp-3) 0; margin: var(--sp-4) 0; border-bottom: 1px solid var(--c-border);">
      <div style="display: flex; gap: var(--sp-1); overflow-x: auto; padding-bottom: var(--sp-2);">
        <button
          v-for="s in simSteps"
          :key="s.id"
          @click="scrollToStep(s.id)"
          style="display: flex; flex-direction: column; align-items: center; gap: 2px; padding: var(--sp-2) var(--sp-3); border-radius: var(--r-md); min-width: 72px; transition: var(--transition);"
          :style="activeSim === s.id ? 'background: var(--c-primary); color: white;' : 'color: var(--c-text-secondary);'"
        >
          <span style="font-size: var(--fs-xs); font-weight: 600;">STEP {{ s.num }}</span>
          <span style="font-size: 11px;">{{ s.title }}</span>
        </button>
      </div>
    </div>

    <!-- Step 1: Price Ranking -->
    <div :id="simSteps[0].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-orange">步骤 1</span>
        {{ sim.priceRanking.title }}
      </h3>
      <p class="text-sm text-secondary mb-4">{{ sim.priceRanking.subtitle }}</p>
      <div class="callout callout-info" style="margin-bottom: var(--sp-4); padding: var(--sp-3) var(--sp-4);">
        <span class="text-xs text-muted">{{ sim.priceRanking.meta }}</span>
      </div>
      <div class="data-table">
        <table>
          <thead>
            <tr><th v-for="col in sim.priceRanking.columns" :key="col">{{ col }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in priceRankingRows" :key="ri" :class="{ 'highlight-row': row[row.length-1] === true }">
              <td v-for="(cell, ci) in row.slice(0, 8)" :key="ci" :class="{ 'num': ci > 0 && ci < 7 }">
                <span v-if="typeof cell === 'string' && cell.includes('★')" class="stars" v-html="renderStarString(cell)"></span>
                <span v-else>{{ cell }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <InsightCallout :text="sim.priceRanking.insight" />
    </div>

    <!-- Step 2: Competition -->
    <div :id="simSteps[1].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-orange">步骤 2</span>
        {{ sim.competition.title }}
      </h3>
      <p class="text-sm text-secondary mb-4">{{ sim.competition.subtitle }}</p>
      <SimpleTable :columns="sim.competition.columns" :rows="sim.competition.rows" />
      <InsightCallout :text="sim.competition.insight" />
    </div>

    <!-- Step 3: Competitor Funnel -->
    <div :id="simSteps[2].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-orange">步骤 3</span>
        {{ sim.competitorFunnel.title }}
      </h3>
      <div class="funnel">
        <div v-for="(layer, li) in sim.competitorFunnel.layers" :key="li" class="funnel-stage" :style="`border-left-color: ${funnelColors[li]};`">
          <div class="funnel-stage-num" :style="`background: ${funnelColors[li]};`">{{ li + 1 }}</div>
          <div class="funnel-stage-content">
            <div class="funnel-stage-title">{{ layer.title }}</div>
            <div v-if="layer.details" class="funnel-stage-desc">
              <div v-for="d in layer.details" :key="d" style="margin-top: 4px;">· {{ d }}</div>
            </div>
            <div v-if="layer.table" style="margin-top: var(--sp-3);">
              <SimpleTable :columns="layer.table.columns" :rows="layer.table.rows" compact />
            </div>
          </div>
        </div>
      </div>
      <h3 class="minor-title" style="font-size: var(--fs-md);">最终输出：竞品推荐清单</h3>
      <SimpleTable :columns="sim.competitorFunnel.finalOutput.columns" :rows="sim.competitorFunnel.finalOutput.rows" />
      <InsightCallout :text="sim.competitorFunnel.insight" />
    </div>

    <!-- Step 4: Competition Circle -->
    <div :id="simSteps[3].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-orange">步骤 4</span>
        {{ sim.competitionCircle.title }}
      </h3>
      <SimpleTable :columns="sim.competitionCircle.columns" :rows="sim.competitionCircle.rows" />
      <div class="callout callout-success">
        <SvgIcon name="target" :size="20" class="callout-icon" />
        <div class="callout-body">
          <strong>选定竞争圈：{{ sim.competitionCircle.selected }}</strong>
        </div>
      </div>
      <InsightCallout :text="sim.competitionCircle.insight" />
    </div>

    <!-- Step 5: File Upload (User Intervention) -->
    <div :id="simSteps[4].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-amber">步骤 5 · 用户干预点</span>
        {{ sim.fileUpload.title }}
      </h3>
      <p class="text-sm text-secondary mb-4">{{ sim.fileUpload.subtitle }}</p>

      <!-- 前置确认 -->
      <div style="background: #FFF7ED; border: 1px solid #FDBA74; border-radius: var(--r-lg); padding: var(--sp-4) var(--sp-5); margin-bottom: var(--sp-5);">
        <div style="font-weight: 700; color: #9A3412; font-size: var(--fs-md); margin-bottom: var(--sp-2);">⚠ {{ sim.fileUpload.promptTitle }}</div>
        <div style="font-size: var(--fs-sm); color: #7C2D12; margin-bottom: var(--sp-4);">{{ sim.fileUpload.promptDesc }}</div>
        <div style="display: flex; flex-direction: column; gap: var(--sp-2);">
          <div v-for="(item, i) in sim.fileUpload.preCheckItems" :key="i"
               style="display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-2) var(--sp-3); background: white; border-radius: var(--r-md); border: 1px solid #FED7AA;">
            <span :style="`width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: ${item.ok ? '#10B981' : '#D1D5DB'}; color: white;`">
              {{ item.ok ? '✓' : '○' }}
            </span>
            <span style="flex: 1; font-size: var(--fs-sm);">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 必传文件 -->
      <div style="padding: var(--sp-4); border: 2px dashed #FCA5A5; border-radius: var(--r-lg); background: #FEF2F2; margin-bottom: var(--sp-5);">
        <div style="display: flex; align-items: flex-start; gap: var(--sp-3); margin-bottom: var(--sp-3);">
          <span class="badge badge-danger" style="font-size: var(--fs-xs);">{{ sim.fileUpload.requiredFile.tag }}</span>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: var(--fs-md); color: #7F1D1D;">{{ sim.fileUpload.requiredFile.name }} <span style="color: var(--c-danger);">*</span></div>
            <div style="font-size: var(--fs-xs); color: #991B1B; margin-top: 2px;">{{ sim.fileUpload.requiredFile.desc }}</div>
            <div style="font-size: 11px; color: var(--c-text-muted); margin-top: 4px;">
              支持格式：{{ sim.fileUpload.requiredFile.supportedFormats.join(' / ') }} · 单文件 ≤ {{ sim.fileUpload.requiredFile.maxSize }}
            </div>
          </div>
        </div>
        <!-- Uploaded file card -->
        <div style="display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3); border: 1px solid var(--c-success); background: white; border-radius: var(--r-md);">
          <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px;">📊</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; font-size: var(--fs-sm); color: #065F46; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ sim.fileUpload.requiredFile.mockFile }}</div>
            <div style="font-size: 11px; color: #059669; margin-top: 2px;">
              {{ sim.fileUpload.requiredFile.mockSize }} · 上传于 {{ sim.fileUpload.requiredFile.mockTime }} · 格式校验通过
            </div>
          </div>
          <span class="badge badge-green" style="font-size: var(--fs-xs); padding: 4px 10px;">✓ 必传项已完成</span>
        </div>
      </div>

      <!-- 可选文件 -->
      <div style="padding: var(--sp-4); border: 2px dashed #93C5FD; border-radius: var(--r-lg); background: #EFF6FF; margin-bottom: var(--sp-5);">
        <div style="display: flex; align-items: flex-start; gap: var(--sp-3); margin-bottom: var(--sp-3);">
          <span class="badge badge-blue" style="font-size: var(--fs-xs);">{{ sim.fileUpload.optionalFile.tag }}</span>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: var(--fs-md); color: #1E3A8A;">{{ sim.fileUpload.optionalFile.name }}</div>
            <div style="font-size: var(--fs-xs); color: #1E40AF; margin-top: 2px;">{{ sim.fileUpload.optionalFile.desc }}</div>
            <div style="font-size: 11px; color: var(--c-text-muted); margin-top: 4px;">
              支持格式：{{ sim.fileUpload.optionalFile.supportedFormats.join(' / ') }} · 单文件 ≤ {{ sim.fileUpload.optionalFile.maxSize }}
            </div>
          </div>
        </div>
        <!-- Uploaded file card -->
        <div style="display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3); border: 1px solid var(--c-border); background: white; border-radius: var(--r-md);">
          <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px;">📈</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; font-size: var(--fs-sm); color: #1E3A8A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ sim.fileUpload.optionalFile.mockFile }}</div>
            <div style="font-size: 11px; color: var(--c-text-secondary); margin-top: 2px;">
              {{ sim.fileUpload.optionalFile.mockSize }} · 上传于 {{ sim.fileUpload.optionalFile.mockTime }} · 格式校验通过
            </div>
          </div>
          <span class="badge badge-blue" style="font-size: var(--fs-xs); padding: 4px 10px;">选填项已完成</span>
        </div>
      </div>

      <!-- 启动确认 -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--sp-4) var(--sp-5); background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%); border: 1px solid #C4B5FD; border-radius: var(--r-lg);">
        <div>
          <div style="font-weight: 600; font-size: var(--fs-sm); color: #4C1D95;">
            <span style="color: #7C3AED; margin-right: 4px;">✓</span>必传文件已上传
          </div>
          <div style="font-size: 11px; color: #6D28D9; margin-top: 4px;">{{ sim.fileUpload.confirmRule }}</div>
        </div>
        <button disabled style="padding: var(--sp-2) var(--sp-5); background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); color: white; border-radius: var(--r-md); font-weight: 600; font-size: var(--fs-sm); border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);">
          ▶ {{ sim.fileUpload.confirmAction }}
        </button>
      </div>
    </div>

    <!-- Step 6: Persona -->
    <div :id="simSteps[5].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-purple">步骤 6</span>
        {{ sim.persona.title }}
      </h3>
      <div class="persona-card">
        <div class="persona-header">
          <div class="persona-avatar">{{ sim.persona.nickname.charAt(0) }}</div>
          <div>
            <div class="persona-name">{{ sim.persona.nickname }}</div>
            <p class="text-sm" style="margin: 0; max-width: 500px;">{{ sim.persona.tagline }}</p>
          </div>
        </div>
        <div class="persona-dimensions">
          <div v-for="dim in sim.persona.dimensions" :key="dim.label" class="persona-dim">
            <div class="persona-dim-label">{{ dim.label }}</div>
            <div class="persona-dim-value">{{ dim.value }}</div>
          </div>
        </div>
      </div>
      <InsightCallout :text="sim.persona.insight" />
    </div>

    <!-- Step 7: Aesthetic -->
    <div :id="simSteps[6].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-purple">步骤 7</span>
        {{ sim.aesthetic.title }}
      </h3>
      <SimpleTable :columns="sim.aesthetic.columns" :rows="sim.aesthetic.rows" />
      <InsightCallout :text="sim.aesthetic.insight" />
    </div>

    <!-- Step 8: Demand Matrices + Mapping -->
    <div :id="simSteps[7].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-purple">步骤 8</span>
        需求交叉分析 + 配置映射
      </h3>
      <h3 class="minor-title" style="font-size: var(--fs-md);">{{ sim.demandMatrix1.title }}</h3>
      <SimpleTable :columns="sim.demandMatrix1.columns" :rows="sim.demandMatrix1.rows" rowType />
      <InsightCallout :text="sim.demandMatrix1.insight" />

      <h3 class="minor-title" style="font-size: var(--fs-md); margin-top: var(--sp-6);">{{ sim.demandMatrix2.title }}</h3>
      <SimpleTable :columns="sim.demandMatrix2.columns" :rows="sim.demandMatrix2.rows" rowType />
      <InsightCallout :text="sim.demandMatrix2.insight" />

      <h3 class="minor-title" style="font-size: var(--fs-md); margin-top: var(--sp-6);">{{ sim.demandMapping.title }}</h3>
      <SimpleTable :columns="sim.demandMapping.columns" :rows="sim.demandMapping.rows" />
      <InsightCallout :text="sim.demandMapping.insight" />
    </div>

    <!-- Step 9: Competitor Features -->
    <div :id="simSteps[8].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-green">步骤 9</span>
        {{ sim.competitorFeatures.title }}
      </h3>
      <SimpleTable :columns="sim.competitorFeatures.columns" :rows="sim.competitorFeatures.rows" />
      <InsightCallout :text="sim.competitorFeatures.insight" />
    </div>

    <!-- Step 10: Config Benchmark -->
    <div :id="simSteps[9].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-green">步骤 10</span>
        {{ sim.configBenchmark.title }}
      </h3>
      <SimpleTable :columns="sim.configBenchmark.columns" :rows="sim.configBenchmark.rows" />
      <InsightCallout :text="sim.configBenchmark.insight" />
    </div>

    <!-- Step 11: Strategy (Interactive) -->
    <div :id="simSteps[10].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-amber">步骤 11 · 用户干预点</span>
        {{ sim.strategy.title }}
      </h3>
      <div class="callout callout-warning">
        <SvgIcon name="warning" :size="20" class="callout-icon" />
        <div class="callout-body">
          <strong>{{ sim.strategy.trigger }}</strong>
          {{ sim.strategy.requirement }}
        </div>
      </div>
      <p class="text-sm text-secondary mt-4">点击下方策略卡片可高亮选中。系统已确认为策略B（差异化竞争）。</p>
      <div class="strategy-grid">
        <div
          v-for="strategy in sim.strategy.strategies"
          :key="strategy.key"
          class="strategy-card"
          :class="[`strategy-card-${strategy.key.toLowerCase()}`, { selected: selectedStrategy === strategy.key }]"
          @click="selectedStrategy = strategy.key"
        >
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-2);">
            <div class="strategy-card-title" style="margin-bottom: 0;">策略{{ strategy.key }}：{{ strategy.name }}</div>
            <span v-if="sim.strategy.confirmed === strategy.key" class="badge badge-green" style="font-size: var(--fs-xs);">✓ 已确认</span>
          </div>
          <div class="strategy-card-tag text-muted">{{ strategy.tag }}</div>
          <div style="margin-top: var(--sp-4);">
            <div v-for="(value, key) in strategy.details" :key="key" style="margin-bottom: var(--sp-3);">
              <div class="detail-label">{{ key }}</div>
              <div class="text-sm">{{ value }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="callout callout-success" v-if="selectedStrategy === sim.strategy.confirmed">
        <SvgIcon name="check" :size="20" class="callout-icon" />
        <div class="callout-body">
          <strong>人工确认记录</strong>
          {{ sim.strategy.confirmRecord }}
        </div>
      </div>
    </div>

    <!-- Step 12: Product Concept -->
    <div :id="simSteps[11].id" class="sim-step">
      <h3 class="minor-title">
        <span class="badge badge-blue">步骤 12</span>
        {{ sim.concept.title }}
      </h3>
      <div class="hero" style="padding: var(--sp-6) var(--sp-8); margin-bottom: var(--sp-6);">
        <h2 style="font-size: var(--fs-xl); position: relative;">{{ sim.concept.productName }}</h2>
      </div>

      <!-- Overview -->
      <h3 class="minor-title">一、产品定义概述</h3>
      <SimpleTable :columns="sim.concept.overview.columns" :rows="sim.concept.overview.rows" />

      <!-- Target Market -->
      <h3 class="minor-title">二、目标市场与竞争定位</h3>
      <div class="detail-label">2.1 目标市场</div>
      <SimpleTable :columns="sim.concept.targetMarket.columns" :rows="sim.concept.targetMarket.rows" />
      <div class="detail-label mt-4">2.2 竞争定位</div>
      <SimpleTable :columns="sim.concept.competitionPositioning.columns" :rows="sim.concept.competitionPositioning.rows" />

      <!-- Core Definition -->
      <h3 class="minor-title">四、产品核心定义</h3>
      <p class="lead">{{ sim.concept.coreDefinition.intro }}</p>
      <div class="callout callout-info">
        <SvgIcon name="lightbulb" :size="20" class="callout-icon" />
        <div class="callout-body">
          <strong>产品竞争力公式</strong>
          {{ sim.concept.coreDefinition.formula }}
        </div>
      </div>
      <div v-for="(dim, di) in sim.concept.coreDefinition.dimensions" :key="di" style="margin-top: var(--sp-5);">
        <h3 class="minor-title" style="font-size: var(--fs-md);">
          4.{{ di + 1 }} {{ dim.name }}
          <span class="text-muted text-xs" style="font-weight: 400;">· {{ dim.principle }}</span>
        </h3>
        <p>{{ dim.desc }}</p>
        <SimpleTable :columns="dim.table.columns" :rows="dim.table.rows" />
      </div>

      <!-- Pricing -->
      <h3 class="minor-title">五、{{ sim.concept.pricing.title }}</h3>
      <p class="lead">{{ sim.concept.pricing.intro }}</p>
      <SimpleTable :columns="sim.concept.pricing.table.columns" :rows="sim.concept.pricing.table.rows" />
      <div class="card-grid card-grid-3" style="margin-top: var(--sp-4);">
        <div v-for="tier in sim.concept.pricing.tiers" :key="tier.price" class="card" style="text-align: center;">
          <div style="font-size: var(--fs-xl); font-weight: 700; color: var(--c-primary);">{{ tier.price }}</div>
          <div class="badge badge-blue" style="margin: var(--sp-2) 0;">{{ tier.type }}</div>
          <p class="text-sm" style="margin: 0;">{{ tier.desc }}</p>
        </div>
      </div>

      <!-- Risk Matrix -->
      <h3 class="minor-title">六、{{ sim.concept.riskMatrix.title }}</h3>
      <SimpleTable :columns="sim.concept.riskMatrix.columns" :rows="sim.concept.riskMatrix.rows" rowType />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { simulationData } from '../data.js'
import SvgIcon from '../SvgIcon.vue'
import SimpleTable from './SimpleTable.vue'
import InsightCallout from './InsightCallout.vue'

// Flatten steps to top level for easy template access
const sim = { ...simulationData, ...simulationData.steps }

const simSteps = [
  { id: 'sim-1', num: 1, title: '市场扫描' },
  { id: 'sim-2', num: 2, title: '竞争格局' },
  { id: 'sim-3', num: 3, title: '竞品筛选' },
  { id: 'sim-4', num: 4, title: '竞争圈' },
  { id: 'sim-5', num: 5, title: '文件上传' },
  { id: 'sim-6', num: 6, title: '用户画像' },
  { id: 'sim-7', num: 7, title: '审美偏好' },
  { id: 'sim-8', num: 8, title: '需求交叉' },
  { id: 'sim-9', num: 9, title: '竞品特征' },
  { id: 'sim-10', num: 10, title: '配置对标' },
  { id: 'sim-11', num: 11, title: '策略确认' },
  { id: 'sim-12', num: 12, title: '产品概念' },
]

const funnelColors = ['#E3440D', '#DC6803', '#6938EF', '#155EEF']

const selectedStrategy = ref(sim.strategy.confirmed)
const activeSim = ref(simSteps[0].id)

// Pre-process price ranking rows: convert numeric scores to star strings
const priceRankingRows = computed(() =>
  sim.priceRanking.rows.map(row => {
    const newRow = [...row]
    if (typeof newRow[4] === 'number') newRow[4] = '★'.repeat(newRow[4]) + '☆'.repeat(Math.max(0, 5 - newRow[4]))
    if (typeof newRow[5] === 'number') newRow[5] = '★'.repeat(newRow[5]) + '☆'.repeat(Math.max(0, 5 - newRow[5]))
    return newRow
  })
)

function renderStarString(cell) {
  const match = String(cell).match(/^(★+)\s*(.*)$/)
  if (match) {
    const stars = match[1]
    const label = match[2]
    const dim = '☆'.repeat(Math.max(0, 5 - stars.length))
    return stars + '<span class="dim">' + dim + '</span>' + (label ? ' ' + label : '')
  }
  return cell
}

function scrollToStep(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

let observer = null
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeSim.value = entry.target.id
        }
      })
    },
    { rootMargin: '-120px 0px -70% 0px' }
  )
  simSteps.forEach(s => {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.sim-step {
  scroll-margin-top: 150px;
  margin-bottom: var(--sp-10);
  padding-bottom: var(--sp-6);
  border-bottom: 1px solid var(--c-border-light);
}
.sim-step:last-child { border-bottom: none; }
</style>
