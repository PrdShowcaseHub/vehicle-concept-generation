<script setup>
import { ref, computed, reactive } from 'vue'
import {
  COMBO_PROJECTS, WIDTH_LIST, WIDTH_REVIEW, KANO_LIST, GRADIENT_TRIMS,
  VALIDATE_TABS, MIX_CHECK, COMPETITOR_ADVANTAGE, FEASIBILITY_CHECK, PROFIT_CHECK, CHANGE_LOG, COMBO_EQUIP_LIST,
  VP_PLAN_INPUT,
} from '../configData.js'

const emit = defineEmits(['toast'])

// ============== 视图：列表 / 工作区 ==============
const view = ref('list')
const currentProject = ref(null)
const step = ref(1)
const validateTab = ref('EATP目标验证')

const STEPS = [
  { n: 1, name: '承接量价方案 · 框定竞争圈装备率清单', desc: '承接量价方案（价格梯度/销量结构）+ 竞争圈装备率' },
  { n: 2, name: '设定配置宽度', desc: '基础/差异/趋势三类配置清单设定' },
  { n: 3, name: '配置宽度审视', desc: '用户需求 / 亮点买点 / 八大域体验' },
  { n: 4, name: '搭建配置梯度', desc: '在量价方案价格梯度上搭配置 · KANO分级 · MIX' },
  { n: 5, name: '产品配置组合验证', desc: '用户维度 / EATP / 级差 / 竞争策略 / 可行性 / 盈利' },
  { n: 6, name: '形成节点市场配置表', desc: 'KO节点交付 · 上传财务效益分析流程' },
]

function openProject(p) {
  // 切方案前：把当前方案的工作数据存档，避免不同方案之间数据串台
  snapshotToCache(currentProject.value)
  currentProject.value = p
  validateTab.value = 'EATP目标验证'
  view.value = 'workspace'
  if (!projCache[p.id]) projCache[p.id] = defaultWorkspace()
  restoreWorkspace(p, projCache[p.id])
}

function phaseBadge(phase) {
  if (phase.includes('锁定')) return 'badge-purple'
  if (phase.includes('变更')) return 'badge-amber'
  return 'badge-blue'
}

// 步骤1：装备率清单（与装备率分析同源）
const equipList = COMBO_EQUIP_LIST

// 步骤2：配置宽度
const widthRows = ref(WIDTH_LIST.map(r => ({ ...r })))
const widthTypeFilter = ref('all')
const widthFiltered = computed(() => widthRows.value.filter(r => widthTypeFilter.value === 'all' || r.type === widthTypeFilter.value))
const widthStats = computed(() => ({
  基础: widthRows.value.filter(r => r.type === '基础' && r.decision !== '不搭载').length,
  差异: widthRows.value.filter(r => r.type === '差异' && r.decision !== '不搭载').length,
  趋势: widthRows.value.filter(r => r.type === '趋势' && r.decision !== '不搭载').length,
}))
function decisionBadge(d) {
  return { 搭载: 'badge-green', 不搭载: 'badge-gray', VAVE: 'badge-amber' }[d] || 'badge-gray'
}
function cycleDecision(r) {
  const i = widthRows.value.indexOf(r)
  const order = ['搭载', 'VAVE', '不搭载']
  r.decision = order[(order.indexOf(r.decision) + 1) % order.length]
}

// 步骤4：KANO + 梯度
const kanoList = KANO_LIST
const trims = ref(GRADIENT_TRIMS.map(t => ({ ...t })))
const mixTotal = computed(() => {
  const nums = trims.value.filter(t => typeof t.mix === 'number').map(t => t.mix)
  return nums.reduce((a, b) => a + b, 0)
})

// 步骤5：EATP 计算器
const eatp = reactive({
  atp: 159800, btp: 149800, cpvDiff: 4200,
  benchmark: '长安启源 vs 比亚迪（短期）',
})
const eatpValue = computed(() => {
  const v = ((eatp.atp - eatp.btp) - eatp.cpvDiff) / eatp.btp * 100
  return v.toFixed(2)
})
const eatpTarget = computed(() => {
  if (eatp.benchmark.includes('引力')) return { center: 0, range: 2 }
  if (eatp.benchmark.includes('短期')) return { center: -5, range: 2 }
  return { center: 0, range: 2 }
})
const eatpVerdict = computed(() => {
  const v = parseFloat(eatpValue.value)
  const t = eatpTarget.value
  if (v > t.center + t.range) return { text: `EATP 高于目标范围（${t.center - t.range}%~${t.center + t.range}%）：配置竞争力不足，建议按促弃购优先级 + CPV/成本排序增配`, type: 'warn' }
  if (v < t.center - t.range) return { text: `EATP 低于目标范围（${t.center - t.range}%~${t.center + t.range}%）：配置竞争力过于充分，建议审减CPV/成本较低配置`, type: 'warn' }
  return { text: `✓ EATP 在目标范围内（${t.center - t.range}%~${t.center + t.range}%），配置竞争力符合竞争策略`, type: 'ok' }
})

// 级差计算器
const gap = reactive({ lowPrice: 139800, highPrice: 159800, lowCpv: 4100, highCpv: 6300 })
const gapValue = computed(() => {
  const d = gap.highCpv - gap.lowCpv
  if (d === 0) return '—'
  return ((gap.highPrice - gap.lowPrice) / d).toFixed(2)
})
const gapVerdict = computed(() => {
  const v = parseFloat(gapValue.value)
  if (isNaN(v)) return { text: '请输入有效数值', type: 'warn' }
  if (v >= 0.6 && v <= 0.8) return { text: '✓ 基础→主力级差在目标区间 0.6~0.8，梯度合理', type: 'ok' }
  if (v > 0.8 && v <= 1.2) return { text: '✓ 主力→魅力级差在目标区间 0.8~1.2，梯度合理', type: 'ok' }
  if (v < 0.6) return { text: '级差低于目标范围：上一级配置更具产品力，审视效益后决定是否审减', type: 'warn' }
  return { text: '级差高于目标范围：上一级配置竞争力不足，审视增配提升价值', type: 'warn' }
})

// ============== 方案列表：新建 + 项目级数据存档 ==============
const projects = ref(COMBO_PROJECTS.map(p => ({ ...p })))
const todayStr = () => {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}
const defaultVer = () => {
  const d = new Date()
  return 'V' + d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0')
}

// 候选车型（与量价管理车型目录同源）
const CAR_CANDIDATES = [
  { code: 'C798', carName: '长安启源 C798', kind: '中大型SUV · 增程 REEV' },
  { code: 'C390', carName: '深蓝 G318', kind: '硬派SUV · 增程 REEV' },
  { code: 'C673', carName: '长安 CS75PLUS', kind: '紧凑型SUV · 燃油 GAS' },
  { code: 'C857', carName: '深蓝 SL03', kind: '中型轿车 · 纯电 EV' },
  { code: 'C928', carName: '长安 UNI-V', kind: '紧凑型轿车 · 插混 PHEV' },
  { code: 'C363', carName: '欧尚 Z6', kind: '紧凑型SUV · 油混 HEV' },
]
// 流程阶段 → 默认入口步骤/环节（与左侧步骤导航对应）
const PHASE_START = {
  'FKO-KO 搭建': { step: 1, stage: '量价承接' },
  'KO节点交付': { step: 6, stage: '形成配置表' },
  'KO-CC 变更管理': { step: 7, stage: '变更审视' },
}

// 每个方案独立的工作数据存档（步骤2宽度决策 / 步骤4梯度 / 步骤5计算器 / 当前步骤）
const projCache = {}
function snapshotToCache(p) {
  if (!p) return
  projCache[p.id] = {
    widthRows: widthRows.value.map(r => ({ ...r })),
    trims: trims.value.map(t => ({ ...t })),
    eatp: { ...eatp }, gap: { ...gap }, step: step.value,
  }
}
function defaultWorkspace() {
  return {
    widthRows: WIDTH_LIST.map(r => ({ ...r })),
    trims: GRADIENT_TRIMS.map(t => ({ ...t })),
    eatp: { atp: 159800, btp: 149800, cpvDiff: 4200, benchmark: '长安启源 vs 比亚迪（短期）' },
    gap: { lowPrice: 139800, highPrice: 159800, lowCpv: 4100, highCpv: 6300 },
  }
}
function restoreWorkspace(p, st) {
  widthRows.value = st.widthRows.map(r => ({ ...r }))
  trims.value = st.trims.map(t => ({ ...t }))
  Object.assign(eatp, st.eatp)
  Object.assign(gap, st.gap)
  step.value = st.step || p.step || 1
}

function goList() {
  snapshotToCache(currentProject.value)
  view.value = 'list'
}

function saveProgress() {
  const p = currentProject.value
  snapshotToCache(p)
  p.step = step.value
  p.updated = todayStr()
  emit('toast', '已保存当前步骤进展（本方案数据已存档）', 'success')
}

// ---------- 新建方案 ----------
const createOpen = ref(false)
const createForm = ref({ carText: '', price: '14-18万', phase: 'FKO-KO 搭建', version: '', owner: '陈思远' })
function openCreate() {
  createForm.value = { carText: '', price: '14-18万', phase: 'FKO-KO 搭建', version: defaultVer(), owner: '陈思远' }
  createOpen.value = true
}
function submitCreate() {
  const f = createForm.value
  const t = (f.carText || '').trim()
  if (!t) { emit('toast', '请选择车型项目', 'warn'); return }
  let car = CAR_CANDIDATES.find(c => c.carName === t) || CAR_CANDIDATES.find(c => c.code === t.toUpperCase())
  const code = car ? car.code : 'CX' + Math.floor(100 + Math.random() * 900)
  const carName = car ? car.carName : t
  const kind = car ? car.kind : '自定义车型'
  const start = PHASE_START[f.phase] || { step: 1, stage: '量价承接' }
  const p = {
    id: 'CB-' + code, carCode: code, carName,
    segment: kind + ' · ' + f.price,
    phase: f.phase, stage: start.stage, step: start.step,
    owner: f.owner, versions: (f.version || '').trim() || defaultVer(),
    updated: todayStr(),
  }
  projects.value.push(p)
  projCache[p.id] = defaultWorkspace()
  createOpen.value = false
  openProject(p)
  emit('toast', '已创建配置组合方案「' + carName + '」并进入工作区', 'success')
}
</script>

<template>
  <!-- ================= 方案列表 ================= -->
  <div v-if="view === 'list'">
    <div class="toolbar">
      <button class="btn btn-primary" @click="openCreate">＋ 新建方案</button>
      <button class="btn btn-secondary" @click="emit('toast', '方案清单已导出', 'success')">导出</button>
    </div>

    <div class="cc-intro">
      配置组合方案通过<strong>设定配置宽度、搭建配置梯度、产品配置变更审视、锁定产品配置组合方案</strong>四大标准化步骤，
      基于市场竞争、趋势、用户、战略、技术可行性、成本与效益六大审视维度，覆盖配置组合搭建、变更到锁定的全流程。
      <br>
      <strong>业务关系：</strong>量价方案先行确定「价格梯度 + 销量结构」的骨架，配置组合方案在价格梯度上逐级搭配置，并用 EATP / 级差验证对价格锚点做校验，两者持续迭代、互相校验。
      <span class="cc-phase-legend">
        <span class="badge badge-blue">FKO-KO 搭建</span>
        <span class="badge badge-amber">KO-CC 变更管理</span>
        <span class="badge badge-purple">CC-VS/LS 锁定管理</span>
      </span>
    </div>

    <div class="data-table">
      <div class="cc-card-title">配置组合方案清单<span class="text-muted text-sm">共 {{ projects.length }} 个项目</span></div>
      <table>
        <thead>
          <tr><th>车型项目</th><th>细分市场</th><th>流程阶段</th><th>当前环节</th><th>方案版本</th><th>责任人</th><th>最近更新</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="p in projects" :key="p.id" @click="openProject(p)">
            <td><strong>{{ p.carName }}</strong><div class="text-muted text-xs">{{ p.carCode }}</div></td>
            <td>{{ p.segment }}</td>
            <td><span class="badge" :class="phaseBadge(p.phase)">{{ p.phase }}</span></td>
            <td>步骤{{ p.step }} · {{ p.stage }}</td>
            <td>{{ p.versions }}</td>
            <td>{{ p.owner }}</td>
            <td>{{ p.updated }}</td>
            <td><a class="cc-link" @click.stop="openProject(p)">进入工作区</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ================= 工作区 ================= -->
  <div v-else class="cc-workspace">
    <!-- 头部 -->
    <div class="cc-ws-header">
      <button class="btn btn-secondary" style="height: 30px; font-size: 12px" @click="goList">← 返回方案列表</button>
      <div>
        <div class="cc-ws-title">{{ currentProject.carName }} · 配置组合方案</div>
        <div class="cc-ws-sub">{{ currentProject.segment }} · {{ currentProject.phase }} · 责任人：{{ currentProject.owner }}</div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary" @click="saveProgress">保存进展</button>
        <button class="btn btn-primary" @click="emit('toast', '配置组合方案已提交多方评审（项目总监/产品市场总监/财务）', 'success')">提交评审</button>
      </div>
    </div>

    <div class="cc-ws-layout">
      <!-- 左侧步骤导航 -->
      <aside class="cc-steps">
        <div class="cc-steps-title">配置组合搭建 · 六大步骤</div>
        <div v-for="s in STEPS" :key="s.n" class="cc-step-item" :class="{ active: step === s.n, done: step > s.n }" @click="step = s.n">
          <span class="cc-step-num">{{ step > s.n ? '✓' : s.n }}</span>
          <span class="cc-step-info">
            <span class="cc-step-name">{{ s.name }}</span>
            <span class="cc-step-desc">{{ s.desc }}</span>
          </span>
        </div>
        <div class="cc-steps-title" style="margin-top: 8px">变更与锁定</div>
        <div class="cc-step-item" :class="{ active: step === 7 }" @click="step = 7">
          <span class="cc-step-num">7</span>
          <span class="cc-step-info">
            <span class="cc-step-name">配置变更管理</span>
            <span class="cc-step-desc">KO-CC 变更审视与评审</span>
          </span>
        </div>
      </aside>

      <!-- 右侧内容 -->
      <div class="cc-content">
        <!-- 步骤1 -->
        <template v-if="step === 1">
          <div class="cc-vp-handover">
            <div class="cc-vp-head">
              <div>
                <div class="cc-vp-title">① 承接量价方案</div>
                <div class="cc-vp-sub">量价管理同步 · 方案版本 {{ VP_PLAN_INPUT.planVer }} · 生命周期 {{ VP_PLAN_INPUT.lifecycle }}</div>
              </div>
              <div class="flex gap-2">
                <span class="badge badge-green">{{ VP_PLAN_INPUT.status }}</span>
                <button class="btn btn-secondary" style="height: 28px; font-size: 12px" @click="emit('toast', '已从「配置管理 → 量价管理」同步最新量价方案（价格梯度/销量结构）', 'success')">从量价管理同步</button>
              </div>
            </div>
            <div class="cc-vp-facts">
              <div class="cc-vp-fact"><div class="cc-vp-fact-label">量价组合四要素</div><div class="cc-vp-fact-value">{{ VP_PLAN_INPUT.modelCount }}<br>{{ VP_PLAN_INPUT.configCount }}</div></div>
              <div class="cc-vp-fact"><div class="cc-vp-fact-label">价格梯度</div><div class="cc-vp-fact-value">{{ VP_PLAN_INPUT.priceGradient }}</div></div>
              <div class="cc-vp-fact"><div class="cc-vp-fact-label">销量结构</div><div class="cc-vp-fact-value">{{ VP_PLAN_INPUT.salesStructure }}</div></div>
              <div class="cc-vp-fact"><div class="cc-vp-fact-label">生命周期销量</div><div class="cc-vp-fact-value">{{ VP_PLAN_INPUT.lifecycle }} · {{ VP_PLAN_INPUT.totalVolume }}</div></div>
            </div>
            <div class="cc-vp-grad">
              <div class="cc-vp-grad-title">价格梯度骨架（配置组合在其上逐级搭配置）</div>
              <table>
                <thead><tr><th>车型状态</th><th>预算标准价</th><th>MIX设定</th><th>2027规划销量</th><th>配置定位</th></tr></thead>
                <tbody>
                  <tr v-for="g in VP_PLAN_INPUT.gradient" :key="g.trim">
                    <td><strong>{{ g.trim }}</strong></td>
                    <td>¥{{ g.price.toLocaleString() }}</td>
                    <td>{{ g.mix }}%</td>
                    <td>{{ g.vol2027 }}</td>
                    <td class="text-muted" style="font-size: 12px">{{ g.role }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="cc-note">量价先行：量价方案先确定价格梯度与销量结构骨架；本步骤在骨架上，结合竞争圈装备率，为步骤④搭建配置梯度提供价格锚点，EATP / 级差验证（步骤⑤）反向校验该锚点。</div>
          </div>

          <div class="data-table" style="margin-top: 14px">
            <div class="cc-card-title">①-2 竞争圈配置及装备率清单
              <span class="flex gap-2">
                <span class="text-muted text-sm">承接产品定位 · 竞争圈（1核心竞品 + 主要竞品≤3 + 1观察对象）</span>
                <button class="btn btn-secondary" style="height: 28px; font-size: 12px" @click="emit('toast', '已从「装备率分析」同步最新竞争圈配置清单', 'success')">从装备率分析同步</button>
              </span>
            </div>
            <table>
              <thead><tr><th>配置项</th><th>类别</th><th title="样本车型数：纳入装备率统计的全部在售车型型号数（装备率分母）">样本车型数</th><th>2024装备率</th><th>2025装备率</th><th>2026装备率</th><th>增长率(25→26)</th></tr></thead>
              <tbody>
                <tr v-for="r in equipList" :key="r.name">
                  <td>{{ r.name }}</td>
                  <td><span class="badge" :class="{ 基础: 'badge-green', 差异: 'badge-amber', 趋势: 'badge-purple' }[r.category]">{{ r.category }}</span></td>
                  <td>{{ r.sampleCount }}</td>
                  <td>{{ r.y24 }}%</td><td>{{ r.y25 }}%</td><td>{{ r.y26 }}%</td>
                  <td><span style="color: #067647; font-weight: 600">+{{ (((r.y26 - r.y25) / r.y25) * 100).toFixed(1) }}% ↗</span></td>
                </tr>
              </tbody>
            </table>
            <div class="cc-note">数据来源：CAM / PMS多维分析系统（装备率数据以定点咨询商为准）；本清单与「配置管理 → 装备率分析」同源维护。</div>
          </div>
        </template>

        <!-- 步骤2 -->
        <template v-else-if="step === 2">
          <div class="cc-width-stats">
            <div class="cc-width-stat"><div class="cc-ws-label">基础配置（≥60%）</div><div class="cc-ws-value">{{ widthStats['基础'] }} 项</div><div class="cc-ws-desc">竞品都给了，不给丧失竞争力</div></div>
            <div class="cc-width-stat"><div class="cc-ws-label">差异配置（30-60%）</div><div class="cc-ws-value">{{ widthStats['差异'] }} 项</div><div class="cc-ws-desc">构建产品竞争力，实现溢价</div></div>
            <div class="cc-width-stat"><div class="cc-ws-label">趋势配置（15-30%+增长）</div><div class="cc-ws-value">{{ widthStats['趋势'] }} 项</div><div class="cc-ws-desc">未来价值方向</div></div>
          </div>
          <div class="data-table">
            <div class="cc-card-title">② 配置宽度清单（基础 / 差异 / 趋势）
              <span class="flex gap-2 items-center">
                <select class="form-select" v-model="widthTypeFilter" style="width: 110px; height: 30px; font-size: 12px">
                  <option value="all">全部类别</option><option value="基础">基础</option><option value="差异">差异</option><option value="趋势">趋势</option>
                </select>
              </span>
            </div>
            <table>
              <thead><tr><th>配置项</th><th>类别</th><th>2026装备率</th><th>增长率</th><th>CPV(元)</th><th>成本(元)</th><th>CPV/成本</th><th>决策</th><th>判定依据</th></tr></thead>
              <tbody>
                <tr v-for="r in widthFiltered" :key="r.name" :class="{ 'cc-row-off': r.decision === '不搭载' }">
                  <td>{{ r.name }}</td>
                  <td><span class="badge" :class="{ 基础: 'badge-green', 差异: 'badge-amber', 趋势: 'badge-purple' }[r.type]">{{ r.type }}</span></td>
                  <td>{{ r.rate }}%</td>
                  <td>+{{ r.growth }}%</td>
                  <td>{{ r.cpv.toLocaleString() }}</td>
                  <td>{{ r.cost.toLocaleString() }}</td>
                  <td><span :style="{ color: r.cpv / r.cost >= 2 ? '#067647' : r.cpv / r.cost >= 1 ? '#B54708' : '#B42318', fontWeight: 700 }">{{ (r.cpv / r.cost).toFixed(1) }}</span></td>
                  <td><span class="badge cc-decision" :class="decisionBadge(r.decision)" @click="cycleDecision(r)" title="点击切换决策" style="cursor: pointer">{{ r.decision }}</span></td>
                  <td class="text-muted" style="font-size: 12px">{{ r.basis }}</td>
                </tr>
              </tbody>
            </table>
            <div class="cc-note">
              设定规则：基础配置装备率≥80%全部装备，60~80%按增长率二次排序；差异配置装备率≥40%不受增长率影响，并与产品亮点买点结合；趋势配置取越级圈15%≤装备率＜30%且连续2年正增长。
              保留原则：基础硬件与基础配置、亮点买点相关配置、CPV高于成本两倍及以上、配置选择率高于均值；CPV与成本倒挂且选择率高 → 保留并输入VAVE降本需求。
            </div>
          </div>
        </template>

        <!-- 步骤3 -->
        <template v-else-if="step === 3">
          <div class="data-table">
            <div class="cc-card-title">③ 配置宽度审视</div>
            <table>
              <thead><tr><th style="width: 110px">审视维度</th><th>审视项</th><th style="width: 90px">结果</th><th>审视说明</th></tr></thead>
              <tbody>
                <tr v-for="r in WIDTH_REVIEW" :key="r.item">
                  <td><span class="badge badge-blue">{{ r.dim }}</span></td>
                  <td>{{ r.item }}</td>
                  <td><span class="badge" :class="r.result === '通过' ? 'badge-green' : 'badge-amber'">{{ r.result }}</span></td>
                  <td class="text-muted">{{ r.detail }}</td>
                </tr>
              </tbody>
            </table>
            <div class="cc-note">审视责任角色：产品策划总师（用户需求/亮点买点/八大域体验）+ 市场策划副总师（成本与CPV）。配置宽度需向项目总监、产品市场总监、财务多方评审确认并达成一致意见后锁定。</div>
          </div>
          <div class="cc-review-alert">
            <strong>关注项 1 项：</strong>「超感智能座舱」买点缺少 AR-HUD 支撑 —— 建议回到步骤②将 AR-HUD 补充至趋势配置清单，或由产品定义副总师确认买点调整。
            <button class="btn btn-secondary" style="height: 26px; font-size: 12px; margin-left: 8px" @click="emit('toast', '已生成审视意见工单，推送至产品定义副总师', 'success')">推送意见</button>
          </div>
        </template>

        <!-- 步骤4 -->
        <template v-else-if="step === 4">
          <div class="card">
            <div class="cc-card-title">④-1 配置分级（KANO模型 · 用户调研结果）</div>
            <table class="cc-inner-table">
              <thead><tr><th>配置项</th><th>KANO属性</th><th>等级</th><th>CPV(元)</th><th>成本(元)</th><th>去向</th></tr></thead>
              <tbody>
                <tr v-for="k in kanoList" :key="k.name">
                  <td>{{ k.name }}</td>
                  <td><span class="badge" :class="{ 必备配置: 'badge-green', 期望配置: 'badge-blue', 魅力配置: 'badge-purple', 无差异配置: 'badge-gray' }[k.kano]">{{ k.kano }}</span></td>
                  <td>{{ k.grade }}</td>
                  <td>{{ k.cpv.toLocaleString() }}</td>
                  <td>{{ k.cost.toLocaleString() }}</td>
                  <td class="text-muted" style="font-size: 12px">{{ { 必备配置: '基础车型 + 主力车型', 期望配置: '主力车型', 魅力配置: '魅力车型', 无差异配置: '不搭载/选装' }[k.kano] }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="data-table">
            <div class="cc-card-title">④-2 配置梯度与MIX设定
              <span class="flex gap-2">
                <span class="text-muted text-sm">MIX合计：{{ mixTotal }}%</span>
                <button class="btn btn-secondary" style="height: 28px; font-size: 12px" @click="emit('toast', '已打开选装包选择与组合策略方案', 'default')">选装包策略</button>
              </span>
            </div>
            <table>
              <thead><tr><th>车型状态</th><th>配置构成</th><th>MIX设定(%)</th><th>预算标准价(元)</th><th>配置要点</th></tr></thead>
              <tbody>
                <tr v-for="t in trims" :key="t.trim">
                  <td><strong>{{ t.trim }}</strong></td>
                  <td>{{ t.role }}</td>
                  <td v-if="typeof t.mix === 'number'"><span class="cc-edit-cell"><input class="cc-mix-input" type="number" v-model.number="t.mix" min="0" max="100"> <span class="cc-unit">%</span></span></td>
                  <td v-else class="text-muted">—</td>
                  <td v-if="typeof t.price === 'number'"><span class="cc-edit-cell"><input class="cc-price-input" type="number" v-model.number="t.price" step="100"> <span class="cc-unit">元</span></span></td>
                  <td v-else class="text-muted">—</td>
                  <td class="text-muted" style="font-size: 12px">{{ t.features }}</td>
                </tr>
              </tbody>
            </table>
            <div class="cc-note">
              主力车型：必备+期望配置 + 低成本高CPV配置（CPV/成本≥2），MIX设定在 40~60% 区间；其他车型以主力为基准设置（必备→基础车型、魅力→魅力车型），单车型MIX≥10%；
              需审视核心竞品各车型MIX，检验竞争对位有效性。
              <strong>预算标准价承接量价方案的价格梯度（基础 ¥139,800 / 主力 ¥159,800 / 魅力 ¥189,800）</strong>，配置在对应价格档位下搭建。
            </div>
          </div>
        </template>

        <!-- 步骤5 -->
        <template v-else-if="step === 5">
          <div class="vp-tabs-like">
            <div v-for="t in VALIDATE_TABS" :key="t" class="cc-vtab" :class="{ active: validateTab === t }" @click="validateTab = t">{{ t }}</div>
          </div>

          <!-- 用户维度验证 -->
          <div v-if="validateTab === '用户维度验证'" class="data-table">
            <div class="cc-card-title">主力配置有效性 & MIX达成（调研验证）</div>
            <table>
              <thead><tr><th>车型状态</th><th>设定Mix</th><th>实际Mix</th><th>相对偏差率</th><th>结论</th><th>调整动作</th></tr></thead>
              <tbody>
                <tr v-for="m in MIX_CHECK" :key="m.trim">
                  <td>{{ m.trim }}</td>
                  <td>{{ m.target }}%</td>
                  <td>{{ m.actual }}%</td>
                  <td><span :style="{ color: Math.abs(m.dev) >= 20 ? '#B42318' : '#067647', fontWeight: 700 }">{{ m.dev > 0 ? '+' : '' }}{{ m.dev }}%</span></td>
                  <td><span class="badge" :class="m.result === '需调整' ? 'badge-amber' : m.result === '达成' ? 'badge-green' : 'badge-blue'">{{ m.result }}</span></td>
                  <td class="text-muted" style="font-size: 12px">{{ m.action }}</td>
                </tr>
              </tbody>
            </table>
            <div class="cc-note">相对偏差率 =（设定Mix − 实际Mix）/ 设定Mix。Mix＜预设目标 → 审视增加配置；Mix＞预设目标 → 审视减少配置；偏差率≥±20%时基于用户促弃购及付费意愿调整。Mix≤5%的配置（SVP版本除外）需取舍或合并。</div>
          </div>

          <!-- EATP 验证 -->
          <div v-else-if="validateTab === 'EATP目标验证'" class="card">
            <div class="cc-card-title">EATP 计算（配置及终端成交价综合竞争力对比）</div>
            <div class="cc-formula">
              EATP = [（ATP − BTP）−（a − b）] / BTP × 100%　<span class="text-muted">（ATP本品TP · BTP竞品TP · a/b 两者配置差异用户感知价值CPV）</span>
            </div>
            <div class="cc-calc-grid">
              <div class="form-row"><span class="form-label">本品TP</span><input class="form-input" type="number" v-model.number="eatp.atp"></div>
              <div class="form-row"><span class="form-label">竞品TP</span><input class="form-input" type="number" v-model.number="eatp.btp"></div>
              <div class="form-row"><span class="form-label">CPV差(a−b)</span><input class="form-input" type="number" v-model.number="eatp.cpvDiff"></div>
              <div class="form-row"><span class="form-label">对标关系</span>
                <select class="form-select" v-model="eatp.benchmark">
                  <option>长安引力 vs 吉利（短期/长期）</option>
                  <option>长安启源 vs 比亚迪（短期）</option>
                  <option>长安启源 vs 比亚迪（长期）</option>
                </select>
              </div>
            </div>
            <div class="cc-calc-result">
              <div class="cc-calc-value">{{ eatpValue }}%</div>
              <div class="cc-calc-verdict" :class="eatpVerdict.type">{{ eatpVerdict.text }}</div>
            </div>
            <div class="cc-note">目标范围：长安引力vs吉利 短期/长期0%（±2）；长安启源vs比亚迪 短期-5%（±2）、长期0%（±2）。本品TP / 竞品TP 锚点取自量价方案。</div>
          </div>

          <!-- 级差验证 -->
          <div v-else-if="validateTab === '级差目标验证'" class="card">
            <div class="cc-card-title">级差计算（相邻配置竞争力）</div>
            <div class="cc-formula">
              级差 =（较高配置价格 − 较低配置价格）/（较高配置CPV − 较低配置CPV）
            </div>
            <div class="cc-calc-grid">
              <div class="form-row"><span class="form-label">较低配置价格</span><input class="form-input" type="number" v-model.number="gap.lowPrice"></div>
              <div class="form-row"><span class="form-label">较高配置价格</span><input class="form-input" type="number" v-model.number="gap.highPrice"></div>
              <div class="form-row"><span class="form-label">较低配置CPV</span><input class="form-input" type="number" v-model.number="gap.lowCpv"></div>
              <div class="form-row"><span class="form-label">较高配置CPV</span><input class="form-input" type="number" v-model.number="gap.highCpv"></div>
            </div>
            <div class="cc-calc-result">
              <div class="cc-calc-value">{{ gapValue }}</div>
              <div class="cc-calc-verdict" :class="gapVerdict.type">{{ gapVerdict.text }}</div>
            </div>
            <div class="cc-note">级差目标范围：基础车型→主力车型 0.6~0.8；主力车型→魅力车型 0.8~1.2。级差＜目标范围：上一级配置更具产品力，审视效益决定是否审减；级差＞目标范围：上一级配置竞争力不足，审视增配。相邻配置价格取自量价方案价格梯度。</div>
          </div>

          <!-- 竞争策略验证 -->
          <div v-else-if="validateTab === '竞争策略验证'" class="data-table">
            <div class="cc-card-title">本品 VS 核心竞品（比亚迪宋PLUS DM-i）配置优劣势对比</div>
            <table>
              <thead><tr><th>竞争维度</th><th>本品（C798）</th><th>核心竞品</th><th>判定</th><th>制胜要素支撑</th></tr></thead>
              <tbody>
                <tr v-for="c in COMPETITOR_ADVANTAGE" :key="c.dim">
                  <td><strong>{{ c.dim }}</strong></td>
                  <td>{{ c.ours }}</td>
                  <td class="text-muted">{{ c.theirs }}</td>
                  <td><span class="badge" :class="c.verdict === '领先' ? 'badge-green' : 'badge-amber'">{{ c.verdict }}</span></td>
                  <td class="text-muted" style="font-size: 12px">{{ c.note }}</td>
                </tr>
              </tbody>
            </table>
            <div class="cc-note">将配置组合方案还原至竞争策略：确保本品解决了竞品的不满意内容、优势配置吻合用户需求，形成对竞品的压制，支撑制胜要素达成。</div>
          </div>

          <!-- 可行性验证 -->
          <div v-else-if="validateTab === '可行性验证'" class="data-table">
            <div class="cc-card-title">技术可行性验证（项目组协同）</div>
            <table>
              <thead><tr><th>验证项</th><th style="width: 80px">结果</th><th>说明</th></tr></thead>
              <tbody>
                <tr v-for="f in FEASIBILITY_CHECK" :key="f.item">
                  <td>{{ f.item }}</td>
                  <td><span class="badge badge-green">{{ f.result }}</span></td>
                  <td class="text-muted">{{ f.note }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 盈利策略验证 -->
          <div v-else class="data-table">
            <div class="cc-card-title">盈利策略验证（原价/财务测算）</div>
            <table>
              <thead><tr><th>验证项</th><th style="width: 90px">结果</th><th>说明</th></tr></thead>
              <tbody>
                <tr v-for="p in PROFIT_CHECK" :key="p.item">
                  <td>{{ p.item }}</td>
                  <td><span class="badge" :class="p.result === '达标' ? 'badge-green' : 'badge-amber'">{{ p.result }}</span></td>
                  <td class="text-muted">{{ p.note }}</td>
                </tr>
              </tbody>
            </table>
            <div class="cc-note">将产品配置组合方案及规划量价输入原价、财务测算成本与效益。效益未达标时：对比材料成本寻找恶化原因、调整效益较好车型MIX占比（保持合理性）、按促弃购优先级+CPV/成本审减配置。</div>
          </div>
        </template>

        <!-- 步骤6 -->
        <template v-else-if="step === 6">
          <div class="card">
            <div class="cc-card-title">⑥ 节点市场配置表（KO节点交付物）</div>
            <div class="cc-deliver">
              <div class="cc-deliver-file">
                <div class="cc-file-icon" style="background: #EFF4FF; color: #155EEF">表</div>
                <div>
                  <div class="cc-file-name">{{ currentProject.carCode }} 节点市场配置表 {{ currentProject.versions }}.xlsx</div>
                  <div class="cc-file-meta">配置明细 + 配置组合方案 · 基于步骤⑤验证后审视调整 · {{ currentProject.updated }}</div>
                </div>
                <div class="flex gap-2"><button class="btn btn-secondary" style="height: 28px; font-size: 12px">预览</button><button class="btn btn-secondary" style="height: 28px; font-size: 12px">下载</button></div>
              </div>
              <div class="cc-deliver-file">
                <div class="cc-file-icon" style="background: #ECFDF3; color: #067647">财</div>
                <div>
                  <div class="cc-file-name">《新品研发效益分析前提输入提交申请表》· 配置量价表</div>
                  <div class="cc-file-meta">KO节点由财务部发起 · 上传配置量价表（模板参考附件《配置表模板》）</div>
                </div>
                <button class="btn btn-primary" style="height: 28px; font-size: 12px" @click="emit('toast', '已上传至财务《新品研发效益分析前提输入提交申请表》流程', 'success')">上传财务流程</button>
              </div>
            </div>
            <div class="cc-note">
              形成路径：基于产品配置组合验证（步骤⑤六项验证全部通过），将审视调整后的配置明细和产品配置组合方案整理成为节点市场配置表，在KO节点交付。
            </div>
          </div>
        </template>

        <!-- 步骤7 变更管理 -->
        <template v-else-if="step === 7">
          <div class="data-table">
            <div class="cc-card-title">配置变更记录（KO-CC节点）
              <button class="btn btn-primary" style="height: 28px; font-size: 12px" @click="emit('toast', '新增变更记录：需组织产品市场总监/营销总监/项目总监/财务经营部评审', 'default')">＋ 发起配置变更</button>
            </div>
            <table>
              <thead><tr><th>变更日期</th><th>配置表版本号</th><th>变更内容</th><th>变更来源/原因</th><th>评审状态</th><th>责任人</th></tr></thead>
              <tbody>
                <tr v-for="c in CHANGE_LOG" :key="c.date">
                  <td>{{ c.date }}</td>
                  <td><strong>{{ c.ver }}</strong></td>
                  <td>{{ c.content }}</td>
                  <td><span class="badge badge-blue">{{ c.source }}</span></td>
                  <td><span class="badge" :class="c.review === '已评审' ? 'badge-green' : 'badge-red'">{{ c.review }}</span></td>
                  <td>{{ c.owner }}</td>
                </tr>
              </tbody>
            </table>
            <div class="cc-note">
              变更管理规则：借调产品配置组合验证原则（步骤⑤）进行配置变更审视；变更需组织产品市场总监、营销总监、项目总监、财务经营部副总经理等相关部门评审确认并达成一致意见（或会议纪要支撑）；
              各节点上传配置量价表时需附节点配置增减明细及变更原因。CC-VS/LS节点完成配置锁定后输出终版产品配置组合方案。
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <!-- ============== 新建方案弹窗 ============== -->
  <div v-if="createOpen" class="modal-mask" @click.self="createOpen = false">
    <div class="modal" style="width: 540px; max-width: calc(100vw - 48px)">
      <div class="modal-title">新建配置组合方案</div>
      <div class="modal-desc">选择车型项目后创建方案工作区，按六大步骤承接量价方案并搭建配置组合；创建后自动进入步骤①，可随时「保存进展」。</div>
      <div class="cc-create-field">
        <label>车型项目</label>
        <input class="form-input" list="cc-car-candidates" v-model="createForm.carText" placeholder="选择车型，如：长安启源 C798">
        <datalist id="cc-car-candidates">
          <option v-for="c in CAR_CANDIDATES" :key="c.code" :value="c.carName">{{ c.code }} · {{ c.kind }}</option>
        </datalist>
        <span class="cc-create-hint">候选车型与量价管理目录一致；也可以直接输入其它车型名称</span>
      </div>
      <div class="cc-create-grid">
        <div class="cc-create-field">
          <label>价格段</label>
          <select class="form-select" v-model="createForm.price">
            <option v-for="b in ['8-11万', '11-14万', '14-18万', '18-25万', '25万以上']" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
        <div class="cc-create-field">
          <label>起始流程阶段</label>
          <select class="form-select" v-model="createForm.phase">
            <option v-for="(v, k) in PHASE_START" :key="k" :value="k">{{ k }}（从步骤{{ v.step }}开始）</option>
          </select>
        </div>
        <div class="cc-create-field">
          <label>方案版本</label>
          <input class="form-input" v-model="createForm.version" placeholder="如 V2026.09">
        </div>
        <div class="cc-create-field">
          <label>责任人</label>
          <select class="form-select" v-model="createForm.owner">
            <option v-for="o in ['陈思远', '王铭']" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="createOpen = false">取消</button>
        <button class="btn btn-primary" @click="submitCreate">创建方案</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cc-create-field { margin-bottom: 12px; }
.cc-create-field label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--c-text-secondary); }
.cc-create-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
.cc-create-hint { display: block; font-size: 11px; color: var(--c-text-muted); margin-top: 5px; }
.cc-intro {
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px;
  padding: 14px 18px; font-size: 13px; color: var(--c-text-secondary); line-height: 1.8; margin-bottom: 16px;
}
.cc-phase-legend { display: inline-flex; gap: 8px; margin-left: 12px; flex-wrap: wrap; }
.cc-card-title {
  font-size: 14px; font-weight: 700; padding: 14px 16px 12px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  border-bottom: 1px solid var(--c-border);
}
/* card 容器内的标题：横线通栏、与下方内容拉开间距、左右与内容对齐 */
.card > .cc-card-title {
  margin: -20px -20px 16px;
  padding: 14px 20px 12px;
  border-radius: var(--r-lg) var(--r-lg) 0 0;
}
.cc-link { color: var(--c-primary); font-size: 13px; cursor: pointer; }
.cc-link:hover { text-decoration: underline; }
.cc-note { font-size: 12px; color: var(--c-text-muted); padding: 12px 16px; line-height: 1.8; }

/* 量价方案承接面板 */
.cc-vp-handover {
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 12px;
  overflow: hidden; border-top: 3px solid var(--c-primary);
}
.cc-vp-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 14px 18px; flex-wrap: wrap; }
.cc-vp-title { font-size: 15px; font-weight: 700; }
.cc-vp-sub { font-size: 12px; color: var(--c-text-muted); margin-top: 3px; }
.cc-vp-facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 0 18px 14px; }
.cc-vp-fact { background: var(--c-surface-2); border-radius: 8px; padding: 10px 14px; }
.cc-vp-fact-label { font-size: 11px; color: var(--c-text-muted); margin-bottom: 4px; }
.cc-vp-fact-value { font-size: 12.5px; font-weight: 600; line-height: 1.5; }
.cc-vp-grad { border-top: 1px solid var(--c-border); padding: 14px 18px; }
.cc-vp-grad-title { font-size: 12px; font-weight: 700; color: var(--c-text-secondary); margin-bottom: 8px; }
.cc-vp-grad table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.cc-vp-grad th { background: var(--c-surface-2); color: var(--c-text-secondary); padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 1px solid var(--c-border); }
.cc-vp-grad td { padding: 8px 12px; border-bottom: 1px solid var(--c-border-light); }
.cc-vp-grad tbody tr:last-child td { border-bottom: none; }
.cc-vp-handover > .cc-note { border-top: 1px solid var(--c-border-light); }


/* workspace */
.cc-ws-header {
  display: flex; align-items: center; gap: 16px; margin-bottom: 14px; flex-wrap: wrap;
}
.cc-ws-title { font-size: 18px; font-weight: 700; }
.cc-ws-sub { font-size: 12px; color: var(--c-text-muted); margin-top: 2px; }
.cc-ws-layout { display: grid; grid-template-columns: 250px 1fr; gap: 14px; align-items: start; }
.cc-steps {
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 12px;
  padding: 10px; position: sticky; top: 80px;
}
.cc-steps-title {
  font-size: 11px; font-weight: 700; color: var(--c-text-muted);
  padding: 8px 10px 6px; text-transform: uppercase; letter-spacing: 0.5px;
}
.cc-step-item {
  display: flex; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer;
  transition: all 0.15s; align-items: flex-start; margin-bottom: 2px;
}
.cc-step-item:hover { background: var(--c-surface-2); }
.cc-step-item.active { background: var(--c-primary-light); }
.cc-step-item.active .cc-step-num { background: var(--c-primary); color: white; }
.cc-step-item.done .cc-step-num { background: var(--c-success); color: white; }
.cc-step-num {
  width: 22px; height: 22px; border-radius: 50%; background: var(--c-surface-2); color: var(--c-text-secondary);
  font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cc-step-info { display: flex; flex-direction: column; gap: 2px; }
.cc-step-name { font-size: 12.5px; font-weight: 600; color: var(--c-text); }
.cc-step-item.active .cc-step-name { color: var(--c-primary); }
.cc-step-desc { font-size: 10.5px; color: var(--c-text-muted); line-height: 1.4; }
.cc-content { min-width: 0; }

/* step2 stats */
.cc-width-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px; }
.cc-width-stat { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px; padding: 14px 16px; }
.cc-ws-label { font-size: 12px; color: var(--c-text-muted); margin-bottom: 4px; }
.cc-ws-value { font-size: 22px; font-weight: 700; }
.cc-ws-desc { font-size: 11px; color: var(--c-text-muted); margin-top: 4px; }
.cc-row-off { opacity: 0.55; }
.cc-decision { min-width: 52px; text-align: center; }

/* step3 */
.cc-review-alert {
  background: #FFFAEB; border: 1px solid #FDE68A; border-radius: 8px;
  padding: 12px 16px; font-size: 13px; color: #92400E; margin-top: 14px; line-height: 1.7;
  display: flex; align-items: center; flex-wrap: wrap;
}

/* step4 */
.cc-inner-table { width: 100%; font-size: 12.5px; border-collapse: collapse; }
.cc-inner-table th { background: var(--c-surface-2); color: var(--c-text-secondary); padding: 9px 12px; text-align: left; font-weight: 600; border-bottom: 1px solid var(--c-border); }
.cc-inner-table td { padding: 9px 12px; border-bottom: 1px solid var(--c-border-light); }
.cc-inner-table tbody tr:last-child td { border-bottom: none; }
.cc-mix-input {
  width: 64px; border: 1px solid var(--c-border); border-radius: 6px; padding: 4px 8px;
  font-size: 13px; outline: none; text-align: right; font-family: inherit;
  -moz-appearance: textfield;
}
.cc-mix-input::-webkit-outer-spin-button, .cc-mix-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.cc-mix-input:focus { border-color: var(--c-primary); }
/* 价格输入：6 位数字较大，需更宽列 + 隐藏步进按钮避免遮挡 */
.cc-price-input {
  width: 108px; border: 1px solid var(--c-border); border-radius: 6px; padding: 4px 8px;
  font-size: 13px; outline: none; text-align: right; font-family: inherit;
  -moz-appearance: textfield;
}
.cc-price-input::-webkit-outer-spin-button, .cc-price-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.cc-price-input:focus { border-color: var(--c-primary); }
/* 输入框 + 单位同行显示 */
.cc-edit-cell { display: inline-flex; align-items: center; gap: 3px; white-space: nowrap; }
.cc-unit { font-size: 12px; color: var(--c-text-muted); }

/* step5 */
.vp-tabs-like { display: flex; gap: 4px; margin-bottom: 14px; border-bottom: 2px solid var(--c-border); flex-wrap: wrap; }
.cc-vtab {
  padding: 9px 14px; font-size: 13px; font-weight: 600; color: var(--c-text-muted);
  cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px;
}
.cc-vtab.active { color: var(--c-primary); border-bottom-color: var(--c-primary); }
.cc-formula {
  background: var(--c-surface-2); border-radius: 8px; padding: 10px 14px;
  font-size: 13px; font-weight: 600; margin-bottom: 14px; font-family: 'SF Mono', Consolas, monospace;
}
.cc-calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; margin-bottom: 14px; }
.cc-calc-result {
  display: flex; align-items: center; gap: 18px; background: var(--c-surface-2);
  border-radius: 10px; padding: 14px 18px; margin-bottom: 12px; flex-wrap: wrap;
}
.cc-calc-value { font-size: 28px; font-weight: 800; color: var(--c-primary); }
.cc-calc-verdict { font-size: 13px; flex: 1; min-width: 200px; line-height: 1.7; }
.cc-calc-verdict.ok { color: #067647; }
.cc-calc-verdict.warn { color: #B54708; }

/* step6 */
.cc-deliver { display: flex; flex-direction: column; gap: 10px; }
.cc-deliver-file {
  display: flex; align-items: center; gap: 14px; background: var(--c-surface-2);
  border-radius: 10px; padding: 14px 16px;
}
.cc-file-icon {
  width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; flex-shrink: 0;
}
.cc-file-name { font-size: 14px; font-weight: 600; }
.cc-file-meta { font-size: 12px; color: var(--c-text-muted); margin-top: 2px; }
.cc-deliver-file > div:nth-child(2) { flex: 1; }
</style>
