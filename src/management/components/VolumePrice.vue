<script setup>
import { ref, computed, reactive } from 'vue'
import { CONFIG_SKELETON, CONFIG_CARS } from '../configData.js'

const emit = defineEmits(['toast'])

// ============== 视图状态 ==============
// mode: list 车型清单 | detail 版本详情 | editor 配置表编辑 | flow 版本流程
const mode = ref('list')
const currentCarId = ref('C798')
const currentVersionIdx = ref(0)
const detailTab = ref('cfg') // cfg | ver | price
const showVersionChange = ref(false)
const showSnapshot = ref(false) // 发布快照说明弹窗

function openSnapshot() {
  showSnapshot.value = true
}

function confirmSnapshot() {
  const v = currentVersion.value
  if (!v) return
  v.snapshotAt = '2026-09-02'
  showSnapshot.value = false
  emit('toast', `已发布快照：${v.ver}（${v.ms}版）配置表与量价方案已固化，供下游模块同步与追溯`, 'success')
}

function hasSnapshot(v) {
  return !!v.snapshotAt
}

const cars = reactive(CONFIG_CARS)
const car = computed(() => cars[currentCarId.value])

// ============== 列表：筛选 ==============
const powerFilter = ref('all')
const levelFilter = ref('all')
const keyword = ref('')

const filteredCars = computed(() => {
  return Object.values(CONFIG_CARS).filter(c => {
    if (powerFilter.value !== 'all' && c.meta.powerKey !== powerFilter.value) return false
    if (levelFilter.value !== 'all' && !c.meta.level.includes(levelFilter.value)) return false
    if (keyword.value && !(c.meta.code + c.meta.name).toLowerCase().includes(keyword.value.toLowerCase())) return false
    return true
  })
})

function resetFilter() {
  powerFilter.value = 'all'; levelFilter.value = 'all'; keyword.value = ''
}

function statusBadge(status) {
  return { '生效中': 'badge-green', '已发布': 'badge-blue', '已退回': 'badge-red', '草稿': 'badge-gray' }[status] || 'badge-gray'
}

function hasDraft(c) {
  return c.versions.some(v => v.status === '草稿')
}

// ============== 详情 ==============
function openDetail(id) {
  currentCarId.value = id
  currentVersionIdx.value = 0
  detailTab.value = 'cfg'
  mode.value = 'detail'
}

const currentVersion = computed(() => car.value.versions[currentVersionIdx.value] || car.value.versions[0])

const configItems = computed(() => {
  return CONFIG_SKELETON.map(it => {
    const o = car.value.override[it.name]
    return { ...it, l1: (o && o.l1) || it.l1, l2: (o && o.l2) || it.l2, l3: (o && o.l3) || it.l3 }
  })
})

const groupedConfig = computed(() => {
  const groups = []
  configItems.value.forEach(it => {
    let g = groups.find(x => x.cat1 === it.cat1)
    if (!g) { g = { cat1: it.cat1, items: [] }; groups.push(g) }
    g.items.push(it)
  })
  return groups
})

const years = ['y25', 'y26', 'y27', 'y28', 'y29']
const yearLabels = ['2025', '2026', '2027', '2028', '2029']

function fmt(v) {
  return typeof v === 'number' ? v.toLocaleString('en-US') : v
}

const priceSummary = computed(() => {
  const p = car.value.price
  let total = 0
  p.sales[0].rows.forEach(r => years.forEach(y => { if (typeof r[y] === 'number') total += r[y] }))
  const stdVals = []
  p.std[0].rows.forEach(r => years.forEach(y => { if (typeof r[y] === 'number') stdVals.push(r[y]) }))
  const mixAvg = p.mix[0].rows.map(r => {
    let s = 0, n = 0
    years.forEach(y => { if (typeof r[y] === 'number') { s += r[y]; n++ } })
    return { level: r.level, avg: n ? s / n : 0 }
  })
  const main = mixAvg.length ? mixAvg.slice().sort((a, b) => b.avg - a.avg)[0] : null
  return {
    total: total ? total.toLocaleString('en-US') + ' 辆' : '【待补充】',
    std: stdVals.length ? `¥${Math.min(...stdVals).toLocaleString('en-US')} ~ ¥${Math.max(...stdVals).toLocaleString('en-US')}` : '【待补充】',
    main: main ? `${main.level}（MIX 均值 ${Math.round(main.avg)}%）` : '【待补充】',
  }
})

// ============== 编辑器（新增：配置表编辑页面） ==============
const editorRows = ref([])
const editorMeta = reactive({ ver: '', ms: 'CC', summary: '', reason: '用户需求洞察', checks: [] })
const editorStatus = ref('草稿') // 草稿 → 待审核 → 审核中 → 已发布

function openEditor(id, isNew) {
  currentCarId.value = id
  const c = cars[id]
  editorRows.value = CONFIG_SKELETON.map(it => {
    const o = c.override[it.name]
    return {
      cat1: it.cat1, cat2: it.cat2, name: it.name, explain: it.explain,
      l1: (o && o.l1) || it.l1, l2: (o && o.l2) || it.l2, l3: (o && o.l3) || it.l3,
    }
  })
  if (isNew) {
    editorMeta.ver = nextVersionName(c)
    editorMeta.ms = 'CC'
    editorMeta.summary = ''
  } else {
    const draft = c.versions.find(v => v.status === '草稿') || c.versions[0]
    editorMeta.ver = draft.ver
    editorMeta.ms = draft.ms
    editorMeta.summary = draft.summary.startsWith('【待补充') ? '' : draft.summary
    editorStatus.value = draft.status
  }
  editorMeta.reason = '用户需求洞察'
  editorMeta.checks = [
    { dim: '① 用户需求洞察', level: '—', kind: '—', reason: '', note: '' },
    { dim: '② 市场竞争变化', level: '—', kind: '—', reason: '', note: '' },
    { dim: '③ 公司战略牵引', level: '—', kind: '—', reason: '', note: '' },
    { dim: '④ 降本增效', level: '—', kind: '—', reason: '', note: '' },
  ]
  editorStatus.value = '草稿'
  mode.value = 'editor'
}

function nextVersionName(c) {
  const draft = c.versions.find(v => v.status === '草稿')
  return draft ? draft.ver : 'V2027.02'
}

function addRow() {
  editorRows.value.push({ cat1: '智能/安全', cat2: '座舱', name: '', explain: '手动填写类', l1: '—', l2: '—', l3: '—', isNew: true })
}

function removeRow(idx) {
  editorRows.value.splice(idx, 1)
}

const editorGroups = computed(() => {
  const groups = []
  editorRows.value.forEach(it => {
    let g = groups.find(x => x.cat1 === it.cat1)
    if (!g) { g = { cat1: it.cat1, items: [] }; groups.push(g) }
    g.items.push(it)
  })
  return groups
})

// 量价编辑数据
const editorPrice = ref(null)
function initEditorPrice() {
  const p = JSON.parse(JSON.stringify(car.value.price))
  editorPrice.value = p
}

function saveDraft() {
  emit('toast', `已保存草稿 ${editorMeta.ver}（配置 ${editorRows.value.length} 项）`, 'success')
}

function submitReview() {
  if (!editorMeta.summary.trim()) {
    emit('toast', '请填写变更摘要后再提交审核', 'warning')
    return
  }
  editorStatus.value = '待审核'
  emit('toast', `${editorMeta.ver} 已提交审核，待部门会签`, 'success')
}

const approvalSteps = [
  { name: '产品市场总监', status: 'done' },
  { name: '营销总监', status: 'done' },
  { name: '项目总监', status: 'active' },
  { name: '财务经营部', status: 'pending' },
]

function doApprove(pass) {
  if (pass) {
    editorStatus.value = '已发布'
    emit('toast', '审批通过，版本已发布并同步至二段码映射/装备率分析', 'success')
  } else {
    editorStatus.value = '草稿'
    emit('toast', '版本已退回，请修改后重新提交', 'warning')
  }
}

const flowSteps = ['草稿', '待审核', '审核中', '已发布']
function flowIdx() {
  return flowSteps.indexOf(editorStatus.value) === -1 ? 0 : flowSteps.indexOf(editorStatus.value)
}

const changeReasons = ['用户需求洞察', '市场竞争变化', '公司战略牵引', '降本增效', '技术可行性', '成本与效益']
</script>

<template>
  <!-- ================= 列表视图 ================= -->
  <div v-if="mode === 'list'">
    <div class="vp-toolbar">
      <button class="btn btn-primary" @click="openEditor('C390', true)">＋ 新建版本（编辑器）</button>
      <button class="btn btn-secondary" @click="emit('toast', '导出成功', 'success')">导出</button>
      <button class="btn btn-secondary" @click="mode = 'flow'">版本流程说明</button>
    </div>

    <div class="vp-alert">
      <strong>量价方案：</strong>先确定<strong>量价组合</strong>（车型数量 + 配置数量 + 价格梯度 + 销量分布），作为<strong>配置组合方案</strong>的输入骨架——配置组合在价格梯度上逐级搭配置。
      <br>
      <strong>数据联动：</strong>本配置表基于 EATP 系统同源管理，量价配置表与配置表由同一人同步输出。版本变更审批通过后，将自动同步至二段码映射、装备率分析、配置组合方案等相关模块。点击车型进入「配置表版本详情」，可查看该车型的 Lev1/Lev2/Lev3 配置、版本更新内容与量价方案；草稿版本可进入<strong>配置表编辑器</strong>完成编辑与送审。
    </div>

    <!-- 筛选栏 -->
    <div class="vp-filter-bar">
      <div class="vp-filter-item">
        <label>动力形式</label>
        <select class="form-select" v-model="powerFilter" style="width: 130px">
          <option value="all">全部</option><option value="增程">增程 REEV</option><option value="纯电">纯电 EV</option>
          <option value="插混">插混 PHEV</option><option value="燃油">燃油 GAS</option><option value="油混">油混 HEV</option>
        </select>
      </div>
      <div class="vp-filter-item">
        <label>级别</label>
        <select class="form-select" v-model="levelFilter" style="width: 110px">
          <option value="all">全部</option><option value="SUV">SUV</option><option value="轿车">轿车</option><option value="MPV">MPV</option>
        </select>
      </div>
      <div class="vp-filter-item">
        <label>搜索车型</label>
        <input class="form-input" v-model="keyword" placeholder="输入车型代号/名称搜索" style="width: 200px">
      </div>
      <div class="vp-filter-actions">
        <button class="btn btn-primary" style="height: 30px; font-size: 12px">查询</button>
        <button class="btn btn-secondary" style="height: 30px; font-size: 12px" @click="resetFilter">重置</button>
      </div>
    </div>

    <!-- 车型清单 -->
    <div class="data-table">
      <div class="vp-card-title">车型配置表清单<span class="text-muted text-sm">共 {{ filteredCars.length }} 款</span></div>
      <table>
        <thead>
          <tr><th>车型代号</th><th>车型名称</th><th>动力形式</th><th>级别</th><th>当前版本</th><th>版本状态</th><th>最近更新</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in filteredCars" :key="c.meta.code" @click="openDetail(c.meta.code)">
            <td><strong>{{ c.meta.code }}</strong></td>
            <td>{{ c.meta.name }}</td>
            <td><span class="badge badge-blue">{{ c.meta.power }}</span></td>
            <td>{{ c.meta.level }}</td>
            <td>{{ c.meta.version }}</td>
            <td><span class="badge" :class="statusBadge(c.meta.status)">{{ c.meta.status }}</span></td>
            <td>{{ c.meta.date }}</td>
            <td>
              <a class="vp-link" @click.stop="openDetail(c.meta.code)">查看配置表</a>
              <a v-if="hasDraft(c)" class="vp-link" style="margin-left: 8px" @click.stop="openEditor(c.meta.code, false)">编辑草稿</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ================= 详情视图 ================= -->
  <div v-else-if="mode === 'detail'" class="vp-detail">
    <div class="vp-detail-header">
      <button class="btn btn-secondary" style="height: 30px; font-size: 12px" @click="mode = 'list'">← 返回车型列表</button>
      <div class="vp-detail-title">{{ car.meta.name }} · 配置表版本详情</div>
      <div class="flex gap-2">
        <button v-if="car.versions.some(v => v.status === '草稿')" class="btn btn-primary" @click="openEditor(currentCarId, false)">编辑草稿版本</button>
        <button class="btn btn-secondary" title="将当前版本配置表与量价方案固化为只读快照，作为下游模块同步与追溯基准；后续版本变更不影响已发布快照" @click="openSnapshot">发布快照</button>
        <button class="btn btn-secondary" @click="emit('toast', '导出成功', 'success')">导出</button>
      </div>
    </div>

    <!-- 车型信息条 -->
    <div class="vp-car-info">
      <div class="vp-ci"><span class="vp-ci-label">车型代号</span><span class="vp-ci-value">{{ car.meta.code }}</span></div>
      <div class="vp-ci"><span class="vp-ci-label">动力形式</span><span class="vp-ci-value">{{ car.meta.power }}</span></div>
      <div class="vp-ci"><span class="vp-ci-label">级别</span><span class="vp-ci-value">{{ car.meta.level }}</span></div>
      <div class="vp-ci"><span class="vp-ci-label">发动机+变速器</span><span class="vp-ci-value">{{ car.meta.engine }}</span></div>
      <div class="vp-ci"><span class="vp-ci-label">当前版本</span><span class="vp-ci-value">{{ car.meta.version }}</span></div>
      <div class="vp-ci"><span class="vp-ci-label">版本状态</span><span class="vp-ci-value"><span class="badge" :class="statusBadge(car.meta.status)">{{ car.meta.status }}</span></span></div>
      <div class="vp-ci"><span class="vp-ci-label">最近更新</span><span class="vp-ci-value">{{ car.meta.date }}</span></div>
    </div>

    <!-- 版本选择器 -->
    <div class="vp-version-bar">
      <span class="vp-version-label">当前版本</span>
      <select class="form-select" v-model="currentVersionIdx" style="width: 260px">
        <option v-for="(v, i) in car.versions" :key="v.ver + i" :value="i">{{ v.ver }} · {{ v.ms }}版（{{ v.status }}）</option>
      </select>
      <span class="badge" :class="statusBadge(currentVersion.status)">{{ currentVersion.status }}</span>
      <span v-if="currentVersion.snapshotAt" class="badge badge-purple" title="该版本已生成发布快照">快照已发布</span>
      <span class="vp-version-meta">里程碑: {{ currentVersion.ms }}</span>
      <span class="vp-version-meta">责任人: {{ currentVersion.owner }}</span>
      <span class="vp-version-meta">发布时间: {{ currentVersion.date }}</span>
    </div>

    <!-- Tabs -->
    <div class="vp-tabs">
      <div class="vp-tab" :class="{ active: detailTab === 'cfg' }" @click="detailTab = 'cfg'">配置表<span class="vp-tab-count">{{ configItems.length }}</span></div>
      <div class="vp-tab" :class="{ active: detailTab === 'ver' }" @click="detailTab = 'ver'">版本记录<span class="vp-tab-count">{{ car.versions.length }}</span></div>
      <div class="vp-tab" :class="{ active: detailTab === 'price' }" @click="detailTab = 'price'">量价方案</div>
    </div>

    <!-- Tab1 配置表 -->
    <div v-if="detailTab === 'cfg'" class="data-table">
      <div class="vp-card-title">配置表（标准配置原子库视图）<span class="text-muted text-sm">{{ configItems.length }} 项 · 含 Lev1/Lev2/Lev3 三档配置</span></div>
      <table>
        <thead>
          <tr><th>一级分类</th><th>二级分类</th><th>配置条目</th><th>配置解释</th><th>Lev1</th><th>Lev2</th><th>Lev3</th></tr>
        </thead>
        <tbody>
          <template v-for="g in groupedConfig" :key="g.cat1">
            <tr v-for="(it, i) in g.items" :key="it.name">
              <td v-if="i === 0" class="vp-cat1" :rowspan="g.items.length">{{ g.cat1 }}</td>
              <td>{{ it.cat2 }}</td>
              <td><strong>{{ it.name }}</strong></td>
              <td class="text-muted">{{ it.explain }}</td>
              <td>{{ it.l1 }}</td><td>{{ it.l2 }}</td><td>{{ it.l3 }}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <div class="vp-note">注：Lev1/Lev2/Lev3 为同一配置项在不同配置等级下的取值，依据《标准配置原子库》结构呈现；示例数据，待 EATP 对接后替换真实值。</div>
    </div>

    <!-- Tab2 版本记录 -->
    <div v-else-if="detailTab === 'ver'" class="data-table">
      <div class="vp-card-title">版本记录<span class="text-muted text-sm">共 {{ car.versions.length }} 个版本</span></div>
      <table>
        <thead>
          <tr><th>版本号</th><th>里程碑</th><th>责任人</th><th>状态</th><th>快照</th><th>发布时间</th><th>变更摘要</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="(v, i) in car.versions" :key="v.ver + i">
            <td><strong>{{ v.ver }}</strong></td>
            <td><span class="badge badge-blue">{{ v.ms }}</span></td>
            <td>{{ v.owner }}</td>
            <td><span class="badge" :class="statusBadge(v.status)">{{ v.status }}</span></td>
            <td><span v-if="v.snapshotAt" class="text-muted text-sm">{{ v.snapshotAt }}</span><span v-else class="text-muted">—</span></td>
            <td>{{ v.date }}</td>
            <td>{{ v.summary }}</td>
            <td>
              <a class="vp-link" v-if="v.change" @click="showVersionChange = true">查看更新内容</a>
              <a class="vp-link" v-if="v.status === '草稿'" style="margin-left: 8px" @click="openEditor(currentCarId, false)">编辑</a>
              <span v-if="!v.change && v.status !== '草稿'" class="text-muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tab3 量价方案 -->
    <div v-else class="card">
      <div class="vp-card-title">量价方案<span class="text-muted text-sm">生命周期 2025-2029 · 配置等级 Lev1/Lev2/Lev3</span></div>
      <div class="vp-summary">
        <div class="vp-summary-item"><div class="vp-summary-label">生命周期总目标销量 (2025-2029)</div><div class="vp-summary-value">{{ priceSummary.total }}</div></div>
        <div class="vp-summary-item"><div class="vp-summary-label">预算标准价区间</div><div class="vp-summary-value">{{ priceSummary.std }}</div></div>
        <div class="vp-summary-item"><div class="vp-summary-label">主力配置等级</div><div class="vp-summary-value">{{ priceSummary.main }}</div></div>
      </div>

      <div class="vp-block-title">销量规划 <span class="vp-unit">单位：辆</span></div>
      <table class="vp-price-table">
        <thead><tr><th>配置等级</th><th v-for="y in yearLabels" :key="y">{{ y }}</th></tr></thead>
        <tbody>
          <tr v-for="r in car.price.sales[0].rows" :key="r.level">
            <td class="vp-level">{{ r.level }}</td>
            <td v-for="y in years" :key="y">{{ fmt(r[y]) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="vp-block-title">MIX 规划 <span class="vp-unit">单位：%</span></div>
      <table class="vp-price-table">
        <thead><tr><th>配置等级</th><th v-for="y in yearLabels" :key="y">{{ y }}</th></tr></thead>
        <tbody>
          <tr v-for="r in car.price.mix[0].rows" :key="r.level">
            <td class="vp-level">{{ r.level }}</td>
            <td v-for="y in years" :key="y">{{ fmt(r[y]) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="vp-block-title">预算标准价规划 <span class="vp-unit">单位：元</span></div>
      <table class="vp-price-table">
        <thead><tr><th>配置等级</th><th v-for="y in yearLabels" :key="y">{{ y }}</th></tr></thead>
        <tbody>
          <tr v-for="r in car.price.std[0].rows" :key="r.level">
            <td class="vp-level">{{ r.level }}</td>
            <td v-for="y in years" :key="y">{{ fmt(r[y]) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="vp-block-title">选装包规划 <span class="vp-unit">价格(元) / 预期销量(辆) / 渗透率</span></div>
      <table class="vp-price-table">
        <thead><tr><th>选装包</th><th>内容</th><th>选装范围</th><th>配置等级</th><th>价格(元)</th><th>预期销量(辆)</th><th>渗透率</th></tr></thead>
        <tbody>
          <template v-for="o in car.price.options" :key="o.name">
            <tr v-for="r in o.rows" :key="o.name + r.level">
              <td class="vp-level">{{ o.name }}</td>
              <td>{{ o.content }}</td>
              <td>{{ o.range }}</td>
              <td class="vp-level">{{ r.level }}</td>
              <td>{{ fmt(r.price) }}</td>
              <td>{{ fmt(r.sales) }}</td>
              <td>{{ r.rate }}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <div class="vp-note">注：量价方案依据《XX项目生命周期量价规划方案》结构呈现（销量 / MIX / 预算标准价 / 选装包），示例数据，待量价模块对接后替换。</div>
    </div>

    <!-- 版本更新内容弹窗 -->
    <div v-if="showVersionChange && currentVersion.change" class="modal-mask" @click.self="showVersionChange = false">
      <div class="modal" style="max-width: 780px">
        <div class="modal-title">版本更新内容 · {{ currentVersion.ver }}</div>
        <div class="modal-desc">{{ currentVersion.ms }}版 · {{ currentVersion.date }} · 责任人 {{ currentVersion.owner }}</div>
        <div class="vp-chg-section">
          <div class="vp-chg-title">增配项</div>
          <ul class="vp-chg-list"><li v-for="a in currentVersion.change.adds" :key="a">{{ a }}</li></ul>
        </div>
        <div class="vp-chg-section">
          <div class="vp-chg-title">减配项</div>
          <ul class="vp-chg-list reduce"><li v-for="r in currentVersion.change.reduces" :key="r">{{ r }}</li></ul>
        </div>
        <div class="vp-chg-section">
          <div class="vp-chg-title">配置变更四大维度点检</div>
          <table class="editable-table">
            <thead><tr><th>审视维度</th><th>配置等级</th><th>增/减配</th><th>变更原因</th><th>备注</th></tr></thead>
            <tbody>
              <tr v-for="c in currentVersion.change.checks" :key="c.dim">
                <td>{{ c.dim }}</td><td>{{ c.level }}</td><td>{{ c.kind }}</td><td>{{ c.reason }}</td><td class="text-muted">{{ c.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showVersionChange = false">关闭</button>
          <button class="btn btn-primary" @click="showVersionChange = false; emit('toast', '变更点检表已导出', 'success')">导出点检表</button>
        </div>
      </div>
    </div>

    <!-- 发布快照说明弹窗 -->
    <div v-if="showSnapshot" class="modal-mask" @click.self="showSnapshot = false">
      <div class="modal" style="max-width: 640px">
        <div class="modal-title">发布快照</div>
        <div class="modal-desc">将 <strong>{{ currentVersion.ver }}（{{ currentVersion.ms }}版）</strong> 的配置表与量价方案固化为只读快照，作为下游模块同步与追溯的基准；快照生成后该版本内容不再改动，后续新建/编辑版本不影响已发布快照。</div>
        <div class="vp-snap-points">
          <div><b>为什么发布快照？</b><span>配置表版本会持续迭代（草稿 → 审核 → 新版本），下游 EATP、二段码映射、装备率分析、配置组合方案需要一份「冻结且稳定」的取值来源，避免被在途编辑干扰。</span></div>
          <div><b>快照里有什么？</b><span>{{ car.meta.name }} · {{ currentVersion.ver }} 的 Lev1/Lev2/Lev3 配置表、版本更新内容与量价方案（销量 / MIX / 预算标准价 / 选装包）。</span></div>
          <div><b>快照可追溯吗？</b><span>每次发布快照都会在「版本记录」中留存时间戳，可在历史版本与当前在编版本间比对差异。</span></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showSnapshot = false">取消</button>
          <button class="btn btn-primary" @click="confirmSnapshot">确认发布快照</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= 编辑器视图（新增） ================= -->
  <div v-else-if="mode === 'editor'" class="vp-editor">
    <div class="vp-detail-header">
      <button class="btn btn-secondary" style="height: 30px; font-size: 12px" @click="mode = 'list'">← 返回车型列表</button>
      <div class="vp-detail-title">配置表编辑器 · {{ car.meta.name }} <span class="badge" :class="statusBadge(editorStatus)" style="margin-left: 8px">{{ editorStatus }}</span></div>
      <div class="flex gap-2">
        <button class="btn btn-secondary" @click="saveDraft">保存草稿</button>
        <button class="btn btn-primary" :disabled="editorStatus !== '草稿'" @click="submitReview">提交审核</button>
      </div>
    </div>

    <!-- 版本状态流 -->
    <div class="vp-flow-bar">
      <template v-for="(s, i) in flowSteps" :key="s">
        <div class="status-node" :class="{ active: i === flowIdx(), done: i < flowIdx() }">{{ s }}</div>
        <span v-if="i < flowSteps.length - 1" class="status-arrow">→</span>
      </template>
      <span class="vp-flow-tip">流程：草稿 → 提交审核 → 产品市场总监/营销总监/项目总监/财务 会签 → 发布（自动同步二段码映射/装备率分析）</span>
    </div>

    <!-- 审批中面板 -->
    <div v-if="editorStatus !== '草稿' && editorStatus !== '已发布'" class="card">
      <div class="vp-card-title">部门会签进度<span class="text-muted text-sm">配置变更评审 · 多部门会签</span></div>
      <div class="vp-approval-row">
        <div v-for="(a, i) in approvalSteps" :key="a.name" class="vp-approval-step">
          <div class="vp-approval-num" :class="a.status">{{ i + 1 }}</div>
          <div class="vp-approval-name">{{ a.name }}</div>
          <div class="vp-approval-status">{{ { done: '已通过', active: '审核中', pending: '待审核' }[a.status] }}</div>
        </div>
      </div>
      <div class="edit-actions">
        <button class="btn btn-danger" @click="doApprove(false)">退回修改</button>
        <button class="btn btn-success" @click="doApprove(true)">审批通过并发布</button>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="card">
      <div class="vp-card-title">版本信息</div>
      <div class="vp-form-grid">
        <div class="form-row"><span class="form-label">版本号</span><input class="form-input" v-model="editorMeta.ver" :disabled="editorStatus !== '草稿'"></div>
        <div class="form-row"><span class="form-label">里程碑</span>
          <select class="form-select" v-model="editorMeta.ms" :disabled="editorStatus !== '草稿'">
            <option>FKO</option><option>KO</option><option>CC</option><option>VS</option><option>LS</option>
          </select>
        </div>
        <div class="form-row"><span class="form-label">主要变更来源</span>
          <select class="form-select" v-model="editorMeta.reason" :disabled="editorStatus !== '草稿'">
            <option v-for="r in changeReasons" :key="r">{{ r }}</option>
          </select>
        </div>
        <div class="form-row" style="grid-template-columns: 120px 1fr">
          <span class="form-label">变更摘要</span>
          <textarea class="form-textarea" v-model="editorMeta.summary" placeholder="如：增加全景天幕；调整主力车型MIX" :disabled="editorStatus !== '草稿'"></textarea>
        </div>
      </div>
      <div class="vp-chg-section">
        <div class="vp-chg-title">配置变更四大维度点检（提交审核前必填）</div>
        <table class="editable-table">
          <thead><tr><th>审视维度</th><th>配置等级</th><th>增/减配</th><th>变更原因</th></tr></thead>
          <tbody>
            <tr v-for="c in editorMeta.checks" :key="c.dim">
              <td>{{ c.dim }}</td>
              <td><select v-model="c.level" :disabled="editorStatus !== '草稿'"><option>—</option><option>LEV1</option><option>LEV2</option><option>LEV3</option></select></td>
              <td><select v-model="c.kind" :disabled="editorStatus !== '草稿'"><option>—</option><option>增配</option><option>减配</option></select></td>
              <td><input v-model="c.reason" placeholder="填写变更原因" :disabled="editorStatus !== '草稿'"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 配置表编辑 -->
    <div class="data-table">
      <div class="vp-card-title">
        配置表编辑（标准配置原子库）
        <span class="flex gap-2 items-center">
          <span class="text-muted text-sm">{{ editorRows.length }} 项</span>
          <button class="btn btn-primary" style="height: 28px; font-size: 12px" :disabled="editorStatus !== '草稿'" @click="addRow">＋ 添加配置项</button>
        </span>
      </div>
      <table>
        <thead>
          <tr><th>一级分类</th><th>二级分类</th><th>配置条目</th><th>配置解释</th><th>Lev1</th><th>Lev2</th><th>Lev3</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="(it, idx) in editorRows" :key="idx">
            <td><select v-model="it.cat1" :disabled="editorStatus !== '草稿'" class="vp-cell-input"><option>基本信息</option><option>车身</option><option>发动机/增程器</option><option>电动机</option><option>底盘/悬架</option><option>智能/安全</option></select></td>
            <td><input v-model="it.cat2" :disabled="editorStatus !== '草稿'" class="vp-cell-input"></td>
            <td><input v-model="it.name" :disabled="editorStatus !== '草稿'" class="vp-cell-input vp-cell-strong"></td>
            <td><input v-model="it.explain" :disabled="editorStatus !== '草稿'" class="vp-cell-input"></td>
            <td><input v-model="it.l1" :disabled="editorStatus !== '草稿'" class="vp-cell-input"></td>
            <td><input v-model="it.l2" :disabled="editorStatus !== '草稿'" class="vp-cell-input"></td>
            <td><input v-model="it.l3" :disabled="editorStatus !== '草稿'" class="vp-cell-input"></td>
            <td><button class="vp-row-del" :disabled="editorStatus !== '草稿'" @click="removeRow(idx)" title="删除该配置项">×</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 量价编辑 -->
    <div class="card" v-if="editorPrice">
      <div class="vp-card-title">量价设定（销量 / MIX / 预算标准价）<span class="text-muted text-sm">送审后随配置表一并进入财务《新品研发效益分析》流程</span></div>
      <template v-for="key in ['sales', 'mix', 'std']" :key="key">
        <div class="vp-block-title">{{ { sales: '销量规划（辆）', mix: 'MIX 规划（%）', std: '预算标准价规划（元）' }[key] }}</div>
        <table class="editable-table">
          <thead><tr><th>配置等级</th><th v-for="y in yearLabels" :key="y">{{ y }}</th></tr></thead>
          <tbody>
            <tr v-for="r in editorPrice[key][0].rows" :key="key + r.level">
              <td class="vp-level">{{ r.level }}</td>
              <td v-for="y in years" :key="y"><input v-model="r[y]" :disabled="editorStatus !== '草稿'" class="vp-cell-input"></td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
    <div v-else class="card">
      <div class="vp-card-title">量价设定</div>
      <button class="btn btn-secondary" @click="initEditorPrice">加载量价数据开始编辑</button>
    </div>
  </div>

  <!-- ================= 流程说明视图（新增） ================= -->
  <div v-else-if="mode === 'flow'" class="card">
    <div class="vp-detail-header" style="margin-bottom: 16px">
      <button class="btn btn-secondary" style="height: 30px; font-size: 12px" @click="mode = 'list'">← 返回车型列表</button>
      <div class="vp-detail-title">量价方案制定与配置表版本管理流程</div>
      <span></span>
    </div>
    <div class="vp-flow-pos">
      <strong>业务顺序：</strong>量价方案在配置组合方案之前制定——先确定价格梯度与销量结构，配置组合再在其上逐级搭配置；本页面的量价方案经「版本流转 + 节点锁定」后，作为配置组合方案与财务效益分析的输入。
    </div>
    <div class="vp-flow-big">
      <div class="vp-flow-node done">
        <div class="vp-flow-num">1</div>
        <div class="vp-flow-name">新建版本（草稿）</div>
        <div class="vp-flow-desc">从上一版本复制，或基于标准配置原子库搭建；填写版本号/里程碑/变更摘要</div>
      </div>
      <div class="vp-flow-arrow">→</div>
      <div class="vp-flow-node done">
        <div class="vp-flow-num">2</div>
        <div class="vp-flow-name">配置编辑 + 四大维度点检</div>
        <div class="vp-flow-desc">增/减配逐项填写用户需求洞察、市场竞争变化、公司战略牵引、降本增效四维点检；同步编辑量价设定</div>
      </div>
      <div class="vp-flow-arrow">→</div>
      <div class="vp-flow-node active">
        <div class="vp-flow-num">3</div>
        <div class="vp-flow-name">提交审核（部门会签）</div>
        <div class="vp-flow-desc">产品市场总监、营销总监、项目总监、财务经营部会签，需达成一致意见或会议纪要支撑</div>
      </div>
      <div class="vp-flow-arrow">→</div>
      <div class="vp-flow-node">
        <div class="vp-flow-num">4</div>
        <div class="vp-flow-name">发布生效</div>
        <div class="vp-flow-desc">审批通过后版本生效，自动同步二段码映射、装备率分析；上传财务《新品研发效益分析前提输入提交申请表》配置量价表</div>
      </div>
      <div class="vp-flow-arrow">→</div>
      <div class="vp-flow-node">
        <div class="vp-flow-num">5</div>
        <div class="vp-flow-name">节点锁定（VS/LS）</div>
        <div class="vp-flow-desc">CC-VS/LS 节点完成配置锁定，输出终版配置组合方案与最终版配置量价表</div>
      </div>
    </div>
    <div class="vp-note" style="margin-top: 16px">
      版本经审核通过后发布生效，退回版本可修改后重新提交；全部版本保留变更记录（变更日期、变更内容、配置表版本号、变更来源/原因）。已发布的版本可生成只读快照，作为下游模块同步与追溯基准。
    </div>
  </div>
</template>

<style scoped>
.vp-toolbar { display: flex; gap: 8px; margin-bottom: 14px; }
.vp-alert {
  background: #EFF4FF; border: 1px solid #B9D0FF; border-radius: 8px;
  padding: 12px 16px; font-size: 13px; color: #1F2937; margin-bottom: 16px; line-height: 1.7;
}
.vp-filter-bar {
  display: flex; align-items: flex-end; gap: 14px; flex-wrap: wrap;
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px;
  padding: 14px 16px; margin-bottom: 16px;
}
.vp-filter-item { display: flex; flex-direction: column; gap: 5px; }
.vp-filter-item label { font-size: 12px; color: var(--c-text-muted); font-weight: 600; }
.vp-filter-actions { margin-left: auto; display: flex; gap: 8px; }
.vp-card-title {
  font-size: 14px; font-weight: 700; padding: 14px 16px 12px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border-bottom: 1px solid var(--c-border); flex-wrap: wrap;
}
/* card 容器内的标题：横线通栏、与下方内容拉开间距、左右与内容对齐 */
.card > .vp-card-title {
  margin: -20px -20px 16px;
  padding: 14px 20px 12px;
  border-radius: var(--r-lg) var(--r-lg) 0 0;
}
.vp-link { color: var(--c-primary); font-size: 13px; cursor: pointer; }
.vp-link:hover { text-decoration: underline; }

/* detail */
.vp-detail-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;
}
.vp-detail-title { font-size: 18px; font-weight: 700; }
.vp-car-info {
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px;
  padding: 14px 18px; display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 12px;
}
.vp-ci { display: flex; flex-direction: column; gap: 3px; }
.vp-ci-label { font-size: 11px; color: var(--c-text-muted); }
.vp-ci-value { font-size: 13px; font-weight: 600; }
.vp-version-bar {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px;
  padding: 12px 16px; margin-bottom: 12px;
}
.vp-version-label { font-size: 13px; font-weight: 700; color: var(--c-text-secondary); }
.vp-version-meta { font-size: 12px; color: var(--c-text-muted); }
.vp-tabs { display: flex; gap: 4px; margin-bottom: 14px; border-bottom: 2px solid var(--c-border); }
.vp-tab {
  padding: 10px 16px; font-size: 14px; font-weight: 600; color: var(--c-text-muted);
  cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; display: flex; align-items: center; gap: 6px;
}
.vp-tab.active { color: var(--c-primary); border-bottom-color: var(--c-primary); }
.vp-tab-count { font-size: 11px; background: var(--c-surface-2); border-radius: 8px; padding: 1px 7px; }
.vp-tab.active .vp-tab-count { background: var(--c-primary-light); color: var(--c-primary); }
.vp-cat1 { font-weight: 700; background: #FAFBFD; }
.vp-note { font-size: 12px; color: var(--c-text-muted); padding: 12px 16px; line-height: 1.6; }

/* price plan */
.vp-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
.vp-summary-item { background: var(--c-surface-2); border-radius: 8px; padding: 12px 14px; }
.vp-summary-label { font-size: 11px; color: var(--c-text-muted); margin-bottom: 4px; }
.vp-summary-value { font-size: 17px; font-weight: 700; }
.vp-block-title { font-size: 13px; font-weight: 700; margin: 16px 0 8px; display: flex; align-items: center; gap: 8px; }
.vp-unit { font-size: 11px; font-weight: 500; color: var(--c-text-muted); }
.vp-price-table { width: 100%; border: 1px solid var(--c-border); border-radius: 8px; overflow: hidden; font-size: 12.5px; border-collapse: collapse; }
.vp-price-table th { background: var(--c-surface-2); color: var(--c-text-secondary); padding: 9px 12px; text-align: left; font-weight: 600; border-bottom: 1px solid var(--c-border); white-space: nowrap; }
.vp-price-table td { padding: 9px 12px; border-bottom: 1px solid var(--c-border-light); }
.vp-price-table tbody tr:last-child td { border-bottom: none; }
.vp-price-table tbody tr:nth-child(even) td { background: #FAFBFD; }
.vp-level { font-weight: 600; }

/* version change modal */
.vp-chg-section { margin-bottom: 16px; }
.vp-chg-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.vp-chg-list { margin: 0 0 0 18px; font-size: 13px; }
.vp-chg-list li { color: #067647; margin-bottom: 4px; }
.vp-chg-list.reduce li { color: #B42318; }

/* publish snapshot modal */
.vp-snap-points { display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px; }
.vp-snap-points > div {
  background: #F8FAFC; border: 1px solid var(--c-border); border-radius: 10px; padding: 12px 14px;
}
.vp-snap-points b { display: block; font-size: 13px; color: #344054; margin-bottom: 4px; }
.vp-snap-points span { font-size: 13px; color: #475467; line-height: 1.7; display: block; }

/* editor */
.vp-flow-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px;
  padding: 14px 18px; margin-bottom: 14px;
}
.vp-flow-tip { font-size: 11px; color: var(--c-text-muted); width: 100%; margin-top: 6px; }
.vp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; margin-bottom: 16px; }
.vp-cell-input {
  width: 100%; border: none; background: transparent; font-size: 12.5px; padding: 4px 6px;
  border-radius: 4px; outline: none; font-family: inherit;
}
.vp-cell-input:focus { background: var(--c-primary-light); box-shadow: inset 0 0 0 2px var(--c-primary); }
.vp-cell-strong { font-weight: 700; }
.vp-row-del {
  width: 22px; height: 22px; border-radius: 6px; background: #FEF3F2; color: #B42318;
  font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
}
.vp-row-del:disabled { opacity: 0.4; cursor: not-allowed; }
.vp-approval-row { display: flex; gap: 12px; flex-wrap: wrap; }
.vp-approval-step { flex: 1; min-width: 140px; background: var(--c-surface-2); border-radius: 8px; padding: 12px; text-align: center; }
.vp-approval-num {
  width: 26px; height: 26px; border-radius: 50%; margin: 0 auto 6px; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; background: var(--c-border); color: var(--c-text-muted);
}
.vp-approval-num.done { background: var(--c-success); color: white; }
.vp-approval-num.active { background: var(--c-primary); color: white; }
.vp-approval-name { font-size: 13px; font-weight: 600; }
.vp-approval-status { font-size: 11px; color: var(--c-text-muted); margin-top: 2px; }

/* flow page */
.vp-flow-pos {
  background: #EFF4FF; border: 1px solid #B9D0FF; border-radius: 8px;
  padding: 12px 16px; font-size: 13px; color: #1F2937; margin-bottom: 16px; line-height: 1.7;
}
.vp-flow-big { display: flex; align-items: stretch; gap: 8px; flex-wrap: wrap; }
.vp-flow-node { flex: 1; min-width: 170px; background: var(--c-surface-2); border: 1px solid var(--c-border); border-radius: 10px; padding: 14px; }
.vp-flow-node.active { border-color: var(--c-primary); background: var(--c-primary-light); }
.vp-flow-node.done { border-color: var(--c-success); }
.vp-flow-num {
  width: 24px; height: 24px; border-radius: 50%; background: var(--c-border); color: var(--c-text-secondary);
  font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;
}
.vp-flow-node.active .vp-flow-num { background: var(--c-primary); color: white; }
.vp-flow-node.done .vp-flow-num { background: var(--c-success); color: white; }
.vp-flow-name { font-size: 13px; font-weight: 700; margin-bottom: 5px; }
.vp-flow-desc { font-size: 11.5px; color: var(--c-text-secondary); line-height: 1.6; }
.vp-flow-arrow { align-self: center; color: var(--c-text-muted); font-size: 16px; }
</style>
