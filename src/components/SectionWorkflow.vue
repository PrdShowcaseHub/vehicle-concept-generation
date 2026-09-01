<template>
  <section id="workflow" class="section">
    <div class="section-header">
      <span class="section-tag">智能体编排</span>
      <h2 class="section-title">工作流画布</h2>
      <p class="section-desc">12个步骤节点按"市场扫描→竞争定位→用户洞察→产品特征分析→竞争策略确认→概念生成"顺序串联编排。点击任意节点查看详细输入输出与执行说明。</p>
    </div>

    <!-- Canvas -->
    <div class="workflow-canvas">
      <svg class="workflow-svg" viewBox="0 0 740 520" style="width: 100%;" @click="deselect">
        <defs>
          <marker id="wfArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#98A2B3" />
          </marker>
        </defs>

        <!-- Phase backgrounds -->
        <rect x="10" y="28" width="720" height="106" rx="10" fill="#FFF4ED" opacity="0.4" />
        <text x="24" y="46" font-size="11" fill="#E3440D" font-weight="600">阶段一：市场与竞争分析</text>

        <rect x="10" y="148" width="540" height="106" rx="10" fill="#F4F0FF" opacity="0.4" />
        <text x="24" y="166" font-size="11" fill="#6938EF" font-weight="600">阶段二：用户洞察</text>

        <rect x="10" y="268" width="180" height="106" rx="10" fill="#ECFDF5" opacity="0.4" />
        <text x="24" y="286" font-size="11" fill="#0BA272" font-weight="600">阶段三：产品特征分析</text>

        <rect x="10" y="388" width="700" height="106" rx="10" fill="#EFF4FF" opacity="0.4" />
        <text x="24" y="406" font-size="11" fill="#155EEF" font-weight="600">阶段四：概念生成</text>

        <!-- Connection lines -->
        <!-- Row 1: 1→2→3→4 -->
        <path d="M 170 82 L 186 82" stroke="#98A2B3" stroke-width="2" fill="none" marker-end="url(#wfArrow)" />
        <path d="M 340 82 L 356 82" stroke="#98A2B3" stroke-width="2" fill="none" marker-end="url(#wfArrow)" />
        <path d="M 510 82 L 526 82" stroke="#98A2B3" stroke-width="2" fill="none" marker-end="url(#wfArrow)" />
        <!-- 4→5 (curve down-left) -->
        <path d="M 605 114 C 605 145, 95 145, 95 172" stroke="#98A2B3" stroke-width="2" fill="none" stroke-dasharray="5 3" marker-end="url(#wfArrow)" />
        <!-- Row 2: 5→6→7 -->
        <path d="M 170 202 L 186 202" stroke="#98A2B3" stroke-width="2" fill="none" marker-end="url(#wfArrow)" />
        <path d="M 340 202 L 356 202" stroke="#98A2B3" stroke-width="2" fill="none" marker-end="url(#wfArrow)" />
        <!-- 7→8 (curve down-left) -->
        <path d="M 435 234 C 435 265, 95 265, 95 292" stroke="#98A2B3" stroke-width="2" fill="none" stroke-dasharray="5 3" marker-end="url(#wfArrow)" />
        <!-- 8→9 (vertical) -->
        <path d="M 95 352 L 95 388" stroke="#98A2B3" stroke-width="2" fill="none" stroke-dasharray="5 3" marker-end="url(#wfArrow)" />
        <!-- Row 4: 9→10→11→12 -->
        <path d="M 170 442 L 186 442" stroke="#DC6803" stroke-width="2.5" fill="none" marker-end="url(#wfArrow)" />
        <path d="M 340 442 L 356 442" stroke="#155EEF" stroke-width="2" fill="none" marker-end="url(#wfArrow)" />
        <path d="M 510 442 L 526 442" stroke="#155EEF" stroke-width="2" fill="none" marker-end="url(#wfArrow)" />

        <!-- Nodes -->
        <g v-for="(step, i) in positions" :key="i"
           class="workflow-node-group"
           :class="{ active: selectedStep === i }"
           @click.stop="selectStep(i)"
        >
          <rect
            :x="step.x" :y="step.y" width="150" height="54" rx="10"
            :fill="nodeColors[steps[i].agent].bg"
            :stroke="selectedStep === i ? nodeColors[steps[i].agent].border : nodeColors[steps[i].agent].borderLight"
            :stroke-width="selectedStep === i ? 2.5 : 1.5"
            class="workflow-node-rect"
          />
          <!-- Step number circle -->
          <circle :cx="step.x + 22" :cy="step.y + 27" r="13"
                  :fill="steps[i].isIntervention ? '#DC6803' : nodeColors[steps[i].agent].border" />
          <text :x="step.x + 22" :y="step.y + 31" text-anchor="middle"
                font-size="12" fill="white" font-weight="700">{{ steps[i].num }}</text>
          <!-- Title -->
          <text :x="step.x + 42" :y="step.y + 22" font-size="11" fill="#101828" font-weight="600">
            {{ truncate(steps[i].title, 9) }}
          </text>
          <!-- Agent indicator -->
          <text :x="step.x + 42" :y="step.y + 38" font-size="9" :fill="nodeColors[steps[i].agent].border">
            {{ steps[i].isIntervention ? '⚠ 用户干预点' : agentShortName(steps[i].agent) }}
          </text>
          <!-- Intervention icon -->
          <text v-if="steps[i].isIntervention" :x="step.x + 135" :y="step.y + 16"
                font-size="10" fill="#DC6803">⚠</text>
        </g>
      </svg>
    </div>

    <!-- Legend -->
    <div class="flex gap-4" style="margin-top: var(--sp-3); flex-wrap: wrap;">
      <div class="flex items-center gap-2" v-for="item in legendItems" :key="item.label">
        <div :style="`width: 12px; height: 12px; border-radius: 3px; background: ${item.color};`"></div>
        <span class="text-sm text-secondary">{{ item.label }}</span>
      </div>
    </div>

    <!-- Detail Panel -->
    <div class="detail-panel" style="margin-top: var(--sp-6);" v-if="selectedStepData">
      <div class="detail-panel-header">
        <div style="display: flex; align-items: center; gap: var(--sp-3);">
          <div class="step-num" :style="`background: ${nodeColors[selectedStepData.agent].border}; color: white;`">
            {{ selectedStepData.num }}
          </div>
          <div>
            <div class="detail-panel-title">{{ selectedStepData.title }}</div>
            <div class="detail-panel-id">{{ selectedStepData.role }}</div>
          </div>
        </div>
        <div style="display: flex; gap: var(--sp-2);">
          <span class="badge" :class="phaseBadge(selectedStepData.phase)">{{ selectedStepData.phase }}</span>
          <span v-if="selectedStepData.isIntervention" class="badge badge-amber">⚠ 用户干预点</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-label">执行说明</div>
        <p>{{ selectedStepData.desc }}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4);">
        <div class="detail-section">
          <div class="detail-label">
            <SvgIcon name="download" :size="12" style="display: inline; vertical-align: middle; margin-right: 4px; transform: rotate(180deg);" />输入
          </div>
          <div class="config-input-mock">{{ selectedStepData.input }}</div>
        </div>
        <div class="detail-section">
          <div class="detail-label">
            <SvgIcon name="arrow" :size="12" style="display: inline; vertical-align: middle; margin-right: 4px;" />输出
          </div>
          <div class="config-input-mock" style="background: var(--c-primary-light); color: var(--c-primary);">{{ selectedStepData.output }}</div>
        </div>
      </div>

      <!-- Navigation -->
      <div style="display: flex; justify-content: space-between; margin-top: var(--sp-5); padding-top: var(--sp-4); border-top: 1px solid var(--c-border-light);">
        <button class="nav-item" style="padding: var(--sp-2) var(--sp-4);" v-if="selectedStep > 0" @click="selectStep(selectedStep - 1)">
          ← 上一步
        </button>
        <span v-else></span>
        <button class="nav-item" style="padding: var(--sp-2) var(--sp-4);" v-if="selectedStep < steps.length - 1" @click="selectStep(selectedStep + 1)">
          下一步 →
        </button>
      </div>
    </div>

    <!-- Step list (alternative view) -->
    <div class="subsection-title" style="margin-top: var(--sp-8);">完整步骤列表</div>
    <div class="step-list">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="step-item"
        :class="{ active: selectedStep === i }"
        @click="selectStep(i); scrollToDetail()"
      >
        <div class="step-num" :style="step.isIntervention ? 'background: var(--c-intervention); color: white;' : ''">{{ step.num }}</div>
        <div class="step-content">
          <div class="step-title">{{ step.title }}</div>
          <div class="step-desc">{{ step.phase }} · {{ step.role }}</div>
          <div class="step-meta">
            <span class="badge" :class="agentBadge(step.agent)">{{ agentShortName(step.agent) }}</span>
            <span v-if="step.isIntervention" class="badge badge-amber">用户干预点</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { workflowSteps as steps } from '../data.js'
import SvgIcon from '../SvgIcon.vue'

const selectedStep = ref(0)

const nodeColors = {
  sub1: { bg: '#FFF4ED', border: '#E3440D', borderLight: '#FDA29B' },
  sub2: { bg: '#F4F0FF', border: '#6938EF', borderLight: '#BDB4FE' },
  sub3: { bg: '#ECFDF5', border: '#0BA272', borderLight: '#6CE9A6' },
  main: { bg: '#EFF4FF', border: '#155EEF', borderLight: '#B9D0FF' },
}

const legendItems = [
  { color: '#E3440D', label: '子智能体一·市场分析' },
  { color: '#6938EF', label: '子智能体二·用户画像' },
  { color: '#0BA272', label: '子智能体三·趋势分析' },
  { color: '#155EEF', label: '主智能体·概念生成' },
  { color: '#DC6803', label: '用户干预点' },
]

// Node positions on canvas
const positions = [
  { x: 20, y: 55 },    // 1
  { x: 190, y: 55 },   // 2
  { x: 360, y: 55 },   // 3
  { x: 530, y: 55 },   // 4
  { x: 20, y: 175 },   // 5
  { x: 190, y: 175 },  // 6
  { x: 360, y: 175 },  // 7
  { x: 20, y: 295 },   // 8
  { x: 20, y: 415 },   // 9
  { x: 190, y: 415 },  // 10
  { x: 360, y: 415 },  // 11
  { x: 530, y: 415 },  // 12
]

const selectedStepData = computed(() => steps[selectedStep.value])

function selectStep(i) {
  selectedStep.value = i
}

function deselect() {
  // keep selection, don't deselect on canvas click
}

function scrollToDetail() {
  setTimeout(() => {
    const panel = document.querySelector('.detail-panel')
    if (panel) {
      const top = panel.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, 50)
}

function truncate(str, len) {
  return str.length > len ? str.slice(0, len) + '…' : str
}

function agentShortName(agent) {
  const map = {
    sub1: '子智能体一',
    sub2: '子智能体二',
    sub3: '子智能体三',
    main: '主智能体',
  }
  return map[agent] || agent
}

function agentBadge(agent) {
  const map = { sub1: 'badge-orange', sub2: 'badge-purple', sub3: 'badge-green', main: 'badge-blue' }
  return map[agent] || 'badge-gray'
}

function phaseBadge(phase) {
  if (phase.includes('市场')) return 'badge-orange'
  if (phase.includes('用户')) return 'badge-purple'
  if (phase.includes('产品特征')) return 'badge-green'
  if (phase.includes('概念')) return 'badge-blue'
  return 'badge-gray'
}
</script>
