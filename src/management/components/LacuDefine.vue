<script setup>
import { ref, computed } from 'vue'
import { LACU_TREE, LACU_BOOKS, LACU_TARGETS, LACU_CHANGES } from '../configData.js'

const emit = defineEmits(['toast'])

// ============== 视图：目标书列表 / 工作区 ==============
const view = ref('list')
const currentBook = ref(null)
const workTab = ref('tree') // tree | flow | changes
const expandedL1 = ref('1')
const selectedL2 = ref('1.8')
const search = ref('')

// ============== 可编辑状态（定级 + 流程） ==============
const books = ref(JSON.parse(JSON.stringify(LACU_BOOKS)))
const changes = ref(JSON.parse(JSON.stringify(LACU_CHANGES)))
const targetsMap = ref({})          // { l2code: [rows] }，当前打开的目标书数据
const editMode = ref(false)
const dirty = ref(false)
const approvals = ref([])           // 审批链：产品CEO → 公司VP → 公司级评审会
const flowLogs = ref([])            // 流程操作日志

const today = new Date().toISOString().slice(0, 10)

// 稳定伪随机（按编码生成，保证演示数据进度与目标书一致）
function seeded(code) {
  let h = 7
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) % 9973
  return h
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

// 打开目标书：初始化可编辑指标数据
function openBook(b) {
  currentBook.value = b
  workTab.value = 'tree'
  expandedL1.value = '1'
  selectedL2.value = '1.8'
  editMode.value = false
  dirty.value = false
  view.value = 'workspace'
  flowLogs.value = [{ time: today + ' 09:30', text: '进入工作区（' + b.car + ' ' + b.version + '，状态：' + b.status + '）' }]
  // 新建目标书从空白开始（全部待定级/待确认），不继承既有车型预置数据；对标列预填新建时填写的对标对象
  const rivalDefault = b._fresh ? ((b.rival || '').trim() || '—') : '—'
  const map = b._fresh ? {} : JSON.parse(JSON.stringify(LACU_TARGETS))
  // 为所有 L2 生成/补齐行（依据目标书进度决定预置定级比例）
  LACU_TREE.forEach(l1 => l1.l2.forEach(l2 => {
    if (map[l2.code]) return
    if (l2.l3 && l2.l3.length) {
      map[l2.code] = l2.l3.map(x => {
        const h = seeded(x.code)
        const graded = (h % 100) < b.progress
        return {
          code: x.code, name: x.name,
          grade: graded ? GRADE_POOL[h % GRADE_POOL.length] : '待定级',
          target: '待确认', ours: '—', rival: rivalDefault, gap: '—',
          status: '待定义',
        }
      })
    } else {
      const h = seeded(l2.code)
      const graded = (h % 100) < b.progress
      map[l2.code] = [{ code: l2.code, name: l2.name, grade: graded ? GRADE_POOL[h % GRADE_POOL.length] : '待定级', target: '待确认', ours: '—', rival: rivalDefault, gap: '—', status: '待定义' }]
    }
  }))
  targetsMap.value = map
}

// ============== LACU 定级体系（PALS 竞争定位分级） ==============
// L 行业领导 / A 行业领先 / C 具备竞争力 / U 不具备竞争力（成本妥协项）
const GRADE_LEVELS = [
  { v: 'L', name: '行业领导', badge: 'badge-green', quantile: '前10%', desc: '明显优于竞品，做卖点' },
  { v: 'A', name: '行业领先', badge: 'badge-blue', quantile: '70-90分位', desc: '跟头部竞品齐平' },
  { v: 'C', name: '具备竞争力', badge: 'badge-gray', quantile: '30-70分位', desc: '行业平均水平，不掉队即可' },
  { v: 'U', name: '不具备竞争力', badge: 'badge-amber', quantile: '后30%', desc: '允许弱于竞品，成本妥协项' },
]
const gradeBadge = g => (GRADE_LEVELS.find(x => x.v === g) || {}).badge || 'badge-gray'
const gradeName = g => (GRADE_LEVELS.find(x => x.v === g) || {}).name || '待定级'
const quantileOf = g => (GRADE_LEVELS.find(x => x.v === g) || {}).quantile || '—'
const gradeDesc = g => (GRADE_LEVELS.find(x => x.v === g) || {}).desc || ''
// 预置定级池：L/A 多为卖点与齐平项，C 为常规项，U 少量作为成本妥协
const GRADE_POOL = ['L', 'L', 'A', 'A', 'C', 'C', 'C', 'U']

function statusBadge(s) {
  return {
    已发布: 'badge-green', 共创评审中: 'badge-blue', 编制中: 'badge-amber',
    验收监控中: 'badge-purple', 审核批准中: 'badge-orange', 已验收: 'badge-green',
  }[s] || 'badge-gray'
}

function toggleL1(code) {
  expandedL1.value = expandedL1.value === code ? '' : code
}

// 选中二级指标的目标数据
const currentL2 = computed(() => {
  for (const l1 of LACU_TREE) {
    const l2 = l1.l2.find(x => x.code === selectedL2.value)
    if (l2) return { l1: l1, ...l2 }
  }
  return null
})

const targetRows = computed(() => targetsMap.value[selectedL2.value] || [])

// ============== 编辑：定级 / 目标值 ==============
const canEdit = computed(() => ['编制中', '共创评审中', '验收监控中'].includes(currentBook.value?.status))

function enterEdit() {
  if (!canEdit.value) {
    emit('toast', '当前状态「' + currentBook.value.status + '」不可直接编辑：已发布目标书请通过「发起变更」解锁编辑', 'warn')
    return
  }
  editMode.value = true
}

function saveEdit() {
  currentBook.value.progress = gradedPct()
  currentBook.value.date = today
  dirty.value = false
  emit('toast', '已保存定级与目标值（草稿），当前定级进度 ' + currentBook.value.progress + '%', 'success')
  flowLogs.value.unshift({ time: now(), text: '保存指标定级与目标值，定级进度更新为 ' + currentBook.value.progress + '%' })
}

function cancelEdit() {
  // 还原未保存的修改：重新生成
  const b = currentBook.value
  editMode.value = false
  dirty.value = false
  if (b) { const bk = b; openBook(bk); }
  emit('toast', '已退出编辑并放弃未保存的修改', 'default')
}

function now() {
  const d = new Date()
  return today + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

// 定级进度：非「待定级」行占比
function gradedPct() {
  let total = 0, graded = 0
  Object.values(targetsMap.value).forEach(rows => rows.forEach(r => {
    total++
    if (r.grade && r.grade !== '待定级') graded++
  }))
  return total ? Math.round((graded / total) * 100) : 0
}

// 新增三级指标
const modal = ref(null) // { title, tip, inputLabel, inputValue, textarea, comment, confirmText, danger, onOk }
function openAddIndicator() {
  if (!editMode.value) { emit('toast', '请先进入编辑模式再新增指标', 'warn'); return }
  modal.value = {
    title: '新增三级指标', tip: '指标体系各级数量由产品策划部动态审视；新增指标将进入「待定级」状态，需在共创环节确认定级与目标值。',
    inputLabel: '指标名称', inputValue: '', confirmText: '新增', onOk: (name) => {
      const rows = targetsMap.value[selectedL2.value] || []
      const code = selectedL2.value + '.' + (rows.length + 1)
      rows.push({ code, name, grade: '待定级', target: '', ours: '—', rival: '—', gap: '—', status: '待定义', _new: true })
      dirty.value = true
      emit('toast', '已新增三级指标 ' + code + ' ' + name, 'success')
    },
  }
}

function removeRow(r) {
  const rows = targetsMap.value[selectedL2.value] || []
  const i = rows.findIndex(x => x.code === r.code)
  if (i > -1) { rows.splice(i, 1); dirty.value = true; emit('toast', '已删除指标 ' + r.code + '（未保存）', 'default') }
}

// ============== 流程操作 ==============
function confirmModal(opts) { modal.value = { comment: '', ...opts } }
function closeModal() { modal.value = null }
function submitModal() {
  const m = modal.value
  if (!m) return
  if (m.inputLabel && !m.inputValue?.trim()) { emit('toast', '请填写' + m.inputLabel, 'warn'); return }
  modal.value = null
  m.onOk(m.inputLabel ? m.inputValue.trim() : undefined, m.comment?.trim() || '')
}

// 主操作：按状态推进
function primaryAction() {
  const b = currentBook.value
  if (b.status === '编制中') {
    confirmModal({
      title: '提交共创评审', tip: '将「' + b.car + ' LACU目标书 ' + b.version + '」提交共创评审，由产品定义副总师组织相关业务单元人员对各级指标定级与目标值进行共创确认。',
      needComment: false, confirmText: '提交评审', onOk: () => {
        b.status = '共创评审中'
        flowLogs.value.unshift({ time: now(), text: '提交共创评审（当前定级进度 ' + b.progress + '%）' })
        emit('toast', '已提交共创评审，状态变更为「共创评审中」', 'success')
        workTab.value = 'flow'
      },
    })
  } else if (b.status === '共创评审中') {
    confirmModal({
      title: '共创评审 · 通过', tip: '评审通过后形成正式《整车指标定义目标书》，进入审核批准链路（产品CEO → 公司VP → 公司级评审会）。',
      needComment: true, commentLabel: '评审意见（可选）', confirmText: '评审通过', onOk: (_i, comment) => {
        b.status = '审核批准中'
        approvals.value = [
          { role: '产品CEO', status: '待审批' },
          { role: '公司VP', status: '待审批' },
          { role: '公司级评审会', status: '待审批' },
        ]
        flowLogs.value.unshift({ time: now(), text: '共创评审通过' + (comment ? '，意见：' + comment : '') + '，进入审核批准链路' })
        emit('toast', '共创评审通过，进入审核批准链路', 'success')
        workTab.value = 'flow'
      },
    })
  } else if (b.status === '审核批准中') {
    approveCurrent()
  } else if (b.status === '已发布') {
    confirmModal({
      title: '启动验收监控', tip: '发布后进入持续监控：跟踪目标书达成情况，同步至配置宽度审视与亮点买点达成审视。',
      confirmText: '启动监控', onOk: () => {
        b.status = '验收监控中'
        flowLogs.value.unshift({ time: now(), text: '启动验收监控' })
        emit('toast', '已启动验收监控，可在「指标树与目标值」中持续更新本品达成值', 'success')
      },
    })
  } else if (b.status === '验收监控中') {
    confirmModal({
      title: '完成验收', tip: '组织目标书达成验收，输出验收结论。验收后目标书归档为「已验收」。',
      needComment: true, commentLabel: '验收结论', confirmText: '完成验收', onOk: (_i, comment) => {
        b.status = '已验收'
        flowLogs.value.unshift({ time: now(), text: '完成验收，结论：' + (comment || '整体达成') })
        emit('toast', '验收完成，目标书已归档', 'success')
      },
    })
  }
}

function secondaryAction() {
  const b = currentBook.value
  if (b.status === '共创评审中') {
    confirmModal({
      title: '共创评审 · 退回', tip: '退回后目标书回到「编制中」，可继续调整指标定级与目标值。',
      needComment: true, commentLabel: '退回原因', confirmText: '确认退回', danger: true, onOk: (_i, comment) => {
        b.status = '编制中'
        flowLogs.value.unshift({ time: now(), text: '共创评审退回' + (comment ? '，原因：' + comment : '') })
        emit('toast', '已退回，目标书回到「编制中」', 'warn')
      },
    })
  } else if (b.status === '审核批准中') {
    rejectApproval()
  }
}

// 审批链操作
function approveCurrent() {
  const cur = approvals.value.find(a => a.status === '待审批')
  if (!cur) return
  confirmModal({
    title: cur.role + ' · 审批通过', tip: '审批链路：产品CEO审核 → 公司VP审核 → 公司级评审会批准。',
    needComment: true, commentLabel: '审批意见（可选）', confirmText: '通过', onOk: (_i, comment) => {
      cur.status = '已通过'
      cur.comment = comment
      cur.time = now()
      const next = approvals.value.find(a => a.status === '待审批')
      if (!next) {
        currentBook.value.status = '已发布'
        changes.value.unshift({ ver: currentBook.value.version, date: today, seq: 1, content: '目标书经共创评审与三级审批（产品CEO/公司VP/公司级评审会）后正式发布' })
        flowLogs.value.unshift({ time: now(), text: '公司级评审会批准，目标书正式发布' })
        emit('toast', '三级审批全部通过，目标书已发布', 'success')
      } else {
        flowLogs.value.unshift({ time: now(), text: cur.role + '审批通过' + (comment ? '，意见：' + comment : '') + '，流转至 ' + next.role })
        emit('toast', cur.role + '已通过，流转至 ' + next.role, 'success')
      }
    },
  })
}

function rejectApproval() {
  const cur = approvals.value.find(a => a.status === '待审批')
  if (!cur) return
  confirmModal({
    title: cur.role + ' · 退回', tip: '退回后目标书回到「编制中」，可调整后重新发起共创评审。',
    needComment: true, commentLabel: '退回原因', confirmText: '确认退回', danger: true, onOk: (_i, comment) => {
      currentBook.value.status = '编制中'
      flowLogs.value.unshift({ time: now(), text: cur.role + '退回' + (comment ? '，原因：' + comment : '') + '，目标书回到编制中' })
      emit('toast', '已退回「' + cur.role + '」，目标书回到编制中', 'warn')
    },
  })
}

// 已发布目标书：发起变更
function startChange() {
  const b = currentBook.value
  confirmModal({
    title: '发起指标变更', tip: '变更将生成新版本目标书并解锁编辑，需同步至配置宽度审视与亮点买点定义及管理清单。',
    needComment: true, commentLabel: '变更内容', confirmText: '发起变更', onOk: (_i, comment) => {
      b.version = nextMinor(b.version)
      b.status = '编制中'
      b.date = today
      changes.value.unshift({ ver: b.version, date: today, seq: 1, content: comment || '发起变更（编辑中）' })
      flowLogs.value.unshift({ time: now(), text: '发起变更，生成新版本 ' + b.version + ' 并解锁编辑' })
      emit('toast', '已发起变更，新版本 ' + b.version + ' 解锁编辑', 'success')
      workTab.value = 'tree'
    },
  })
}

function nextMinor(v) {
  const m = /^V(\d+)\.(\d+)$/.exec(v || 'V1.0')
  if (!m) return 'V1.1'
  return 'V' + m[1] + '.' + (parseInt(m[2], 10) + 1)
}

// 流程步骤（依据产品市场方案制定流程 2.3 整车指标（LACU）定义）—— 状态随目标书实时联动
const FLOW_BASE = [
  { n: 1, name: '接收产品定义调研结论', role: '产品定义副总师', desc: '接收客户需求洞察流程输出的调研结论（KO阶段产品定义调研）' },
  { n: 2, name: '组织跨域共创', role: '产品定义副总师', desc: '基于产品概念和竞争策略，组织相关业务单元人员进行共创，确定各级指标定级与目标值' },
  { n: 3, name: '形成整车指标定义目标书', role: '产品定义副总师', desc: '一级指标（10）/二级指标（78）/三级指标（186）目标值、竞品对标、工程对应指标' },
  { n: 4, name: '审核与批准', role: '产品CEO / 公司VP / 公司级评审会', desc: '产品市场方案（含整车指标LACU）审核批准' },
  { n: 5, name: '持续监控与验收', role: '产品定义副总师', desc: '监控目标书达成情况并组织验收（同步至配置宽度审视、亮点买点达成审视）' },
]

const FLOW = computed(() => {
  const s = currentBook.value?.status || '编制中'
  const st2 = ['编制中', '共创评审中'].includes(s) ? 'active' : 'done'
  const st34 = s === '审核批准中' ? 'active' : ['已发布', '验收监控中', '已验收'].includes(s) ? 'done' : 'pending'
  const st5 = s === '验收监控中' ? 'active' : s === '已验收' ? 'done' : 'pending'
  return FLOW_BASE.map(f => ({ ...f, status: f.n === 1 ? 'done' : f.n === 2 ? st2 : f.n <= 4 ? st34 : st5 }))
})

const searchResults = computed(() => {
  if (!search.value.trim()) return null
  const kw = search.value.trim()
  const res = []
  LACU_TREE.forEach(l1 => {
    if (l1.name.includes(kw)) res.push({ level: '一级', code: l1.code, name: l1.name, l1: l1.name })
    l1.l2.forEach(l2 => {
      if (l2.name.includes(kw) || l2.code.startsWith(kw)) res.push({ level: '二级', code: l2.code, name: l2.name, l1: l1.name })
      l2.l3.forEach(l3 => {
        if (l3.name.includes(kw) || l3.code.startsWith(kw)) res.push({ level: '三级', code: l3.code, name: l3.name, l1: l1.name })
      })
    })
  })
  return res.slice(0, 30)
})

// 统计
const l2Count = computed(() => LACU_TREE.reduce((s, l1) => s + l1.l2.length, 0))

const primaryLabel = computed(() => ({
  编制中: '提交共创评审', 共创评审中: '评审通过', 审核批准中: '审批通过（当前节点）',
  已发布: '启动验收监控', 验收监控中: '完成验收', 已验收: '',
}[currentBook.value?.status] || ''))

const secondaryLabel = computed(() => ({
  共创评审中: '退回修改', 审核批准中: '退回',
}[currentBook.value?.status] || ''))

// ============== 新建目标书 ==============
const createOpen = ref(false)
const createForm = ref({ car: '', node: 'FKO', version: 'V1.0', owner: '陈思远', rival: '' })
function openCreate() {
  createForm.value = { car: '', node: 'FKO', version: 'V1.0', owner: '陈思远', rival: '' }
  createOpen.value = true
}
function submitCreate() {
  const f = createForm.value
  const t = (f.car || '').trim()
  if (!t) { emit('toast', '请选择车型项目', 'warn'); return }
  const car = CAR_CANDIDATES.find(c => c.carName === t) || CAR_CANDIDATES.find(c => c.code === t.toUpperCase())
  const carName = car ? car.carName : t
  const id = 'VB-02.02-D' + String(books.value.length + 1).padStart(2, '0')
  const b = {
    id, car: carName,
    version: (f.version || '').trim() || 'V1.0',
    node: f.node, status: '编制中', owner: f.owner, date: today, progress: 0,
    rival: (f.rival || '').trim(),
    _fresh: true, // 新建书：指标体系全量复制、全部「待定级/待确认」
  }
  books.value.push(b)
  createOpen.value = false
  openBook(b)
  emit('toast', '已创建「' + carName + '」LACU 目标书（指标体系 10/78/186 全量复制），请开始定级', 'success')
}
</script>

<template>
  <!-- ================= 目标书列表 ================= -->
  <div v-if="view === 'list'">
    <div class="toolbar">
      <button class="btn btn-primary" @click="openCreate">＋ 新建目标书</button>
      <button class="btn btn-secondary" @click="emit('toast', '指标体系库：一级指标 10 · 二级指标 78 · 三级指标 186（产品策划部动态审视、定期发布）', 'default')">指标体系库</button>
    </div>

    <div class="lc-intro">
      <strong>产品 LACU 目标书</strong>：立项阶段输出，基于 <b>PALS</b>（Product Attribute Leadership Strategy，产品属性领先策略）对标分级方法，
      为每项配置 / 性能 / 感官质量条目定义市场竞争定位（<b>L</b> 行业领导 / <b>A</b> 行业领先 / <b>C</b> 具备竞争力 / <b>U</b> 成本妥协），
      再转换为可量化的整车指标（一、二、三级）与工程对应指标，作为配置表原子库的配套定义文档，并持续监控验收。
      <div class="lc-intro-stats">
        <span><b>10</b> 一级指标</span><span><b>78</b> 二级指标</span><span><b>186</b> 三级指标</span>
      </div>
    </div>

    <div class="data-table">
      <div class="lc-card-title">LACU 目标书清单<span class="text-muted text-sm">共 {{ books.length }} 份</span></div>
      <table>
        <thead>
          <tr><th>交付物编码</th><th>车型项目</th><th>版本</th><th>节点</th><th>状态</th><th>指标定级进度</th><th>责任人</th><th>更新时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="b in books" :key="b.id" @click="openBook(b)">
            <td>{{ b.id }}</td>
            <td><strong>{{ b.car }}</strong></td>
            <td>{{ b.version }}</td>
            <td><span class="badge badge-blue">{{ b.node }}</span></td>
            <td><span class="badge" :class="statusBadge(b.status)">{{ b.status }}</span></td>
            <td style="min-width: 140px">
              <div class="lc-progress"><div class="lc-progress-fill" :style="{ width: b.progress + '%' }"></div></div>
              <span class="text-xs text-muted">{{ b.progress }}%</span>
            </td>
            <td>{{ b.owner }}</td>
            <td>{{ b.date }}</td>
            <td><a class="lc-link" @click.stop="openBook(b)">进入工作区</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ================= 工作区 ================= -->
  <div v-else class="lc-workspace">
    <div class="lc-ws-header">
      <button class="btn btn-secondary" style="height: 30px; font-size: 12px" @click="view = 'list'">← 返回目标书列表</button>
      <div>
        <div class="lc-ws-title">{{ currentBook.car }} · 产品LACU目标书（{{ currentBook.node }}）</div>
        <div class="lc-ws-sub">{{ currentBook.id }} · {{ currentBook.version }} · 责任人：{{ currentBook.owner }} · 更新于 {{ currentBook.date }}</div>
      </div>
      <div class="flex gap-2">
        <span class="badge" :class="statusBadge(currentBook.status)" style="align-self: center">{{ currentBook.status }}</span>
        <button class="btn btn-secondary" @click="emit('toast', '目标书已导出（封面 + 变更记录 + 整车指标）', 'success')">导出目标书</button>
        <button v-if="secondaryLabel" class="btn btn-secondary" style="color: #B42318" @click="secondaryAction">{{ secondaryLabel }}</button>
        <button v-if="primaryLabel" class="btn btn-primary" @click="primaryAction">{{ primaryLabel }}</button>
        <button v-else class="btn btn-primary" @click="startChange">发起变更</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="lc-tabs">
      <div class="lc-tab" :class="{ active: workTab === 'tree' }" @click="workTab = 'tree'">指标树与目标值</div>
      <div class="lc-tab" :class="{ active: workTab === 'flow' }" @click="workTab = 'flow'">定义流程<span v-if="dirty" class="lc-dot"></span></div>
      <div class="lc-tab" :class="{ active: workTab === 'changes' }" @click="workTab = 'changes'">变更记录</div>
    </div>

    <!-- 指标树 -->
    <div v-if="workTab === 'tree'" class="lc-tree-layout">
      <aside class="lc-tree">
        <input class="form-input" v-model="search" placeholder="搜索指标名称/编码..." style="margin-bottom: 10px">
        <template v-if="!searchResults">
          <div v-for="l1 in LACU_TREE" :key="l1.code" class="lc-l1">
            <div class="lc-l1-head" :class="{ open: expandedL1 === l1.code }" @click="toggleL1(l1.code)">
              <span class="lc-caret">{{ expandedL1 === l1.code ? '▾' : '▸' }}</span>
              <span class="lc-l1-code">{{ l1.code }}</span>
              <span class="lc-l1-name">{{ l1.name }}</span>
              <span class="lc-l1-count">{{ l1.l2.length }}</span>
            </div>
            <div v-show="expandedL1 === l1.code" class="lc-l2-list">
              <div v-for="l2 in l1.l2" :key="l2.code" class="lc-l2" :class="{ active: selectedL2 === l2.code }" @click="selectedL2 = l2.code">
                <span class="lc-l2-code">{{ l2.code }}</span>
                <span class="lc-l2-name">{{ l2.name }}</span>
                <span v-if="l2.l3.length" class="lc-l2-count">{{ l2.l3.length }}</span>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="lc-search-results">
          <div v-for="r in searchResults" :key="r.code" class="lc-l2" @click="search = ''">
            <span class="badge" :class="{ 一级: 'badge-purple', 二级: 'badge-blue', 三级: 'badge-gray' }[r.level]" style="margin-right: 6px">{{ r.level }}</span>
            <span>{{ r.code }} {{ r.name }}</span>
          </div>
          <div v-if="!searchResults.length" class="text-muted" style="padding: 16px; text-align: center; font-size: 12px">无匹配指标</div>
        </div>
      </aside>

      <div class="lc-target">
        <div class="data-table">
          <div class="lc-card-title">
            <span>{{ currentL2 ? currentL2.code + ' ' + currentL2.name : '' }}
              <span class="text-muted text-sm" style="font-weight: 400; margin-left: 8px">所属一级：{{ currentL2 ? currentL2.l1.code + ' ' + currentL2.l1.name : '' }}</span>
            </span>
            <span style="display: flex; gap: 8px">
              <template v-if="!editMode">
                <button class="btn btn-secondary" style="height: 28px; font-size: 12px" @click="enterEdit">✏️ 进入编辑（定级 / 目标值）</button>
                <button class="btn btn-secondary" style="height: 28px; font-size: 12px" @click="openAddIndicator">＋ 新增三级指标</button>
              </template>
              <template v-else>
                <button class="btn btn-secondary" style="height: 28px; font-size: 12px" @click="openAddIndicator">＋ 新增三级指标</button>
                <button class="btn btn-secondary" style="height: 28px; font-size: 12px" @click="cancelEdit">放弃修改</button>
                <button class="btn btn-primary" style="height: 28px; font-size: 12px" @click="saveEdit">保存{{ dirty ? '（有未保存修改）' : '' }}</button>
              </template>
            </span>
          </div>
          <table>
            <thead>
              <tr><th style="width: 80px">指标编码</th><th>指标名称</th><th style="width: 150px">定级</th><th>目标值</th><th>本品达成</th><th>核心竞品对标</th><th style="width: 90px">差距</th><th style="width: 90px">验收状态</th><th v-if="editMode" style="width: 50px">操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in targetRows" :key="r.code">
                <td>{{ r.code }}</td>
                <td><strong>{{ r.name }}</strong></td>
                <!-- 定级 -->
                <td v-if="!editMode">
                  <span class="badge" :class="r.grade === '待定级' ? 'badge-gray' : gradeBadge(r.grade)"
                        :title="r.grade === '待定级' ? '待定级：尚未确定' : r.grade + ' ' + gradeName(r.grade)">{{ r.grade === '待定级' ? '待定级' : r.grade }}</span>
                </td>
                <td v-else>
                  <select class="form-select lc-sm" :class="{ 'lc-pending': r.grade === '待定级' }" v-model="r.grade" @change="dirty = true" :title="r.grade === '待定级' ? '待定级：尚未确定，待共创确认' : (gradeName(r.grade) + ' · ' + quantileOf(r.grade))">
                    <option v-for="g in ['L', 'A', 'C', 'U', '待定级']" :key="g" :value="g">{{ g === '待定级' ? '待定级' : g + ' ' + gradeName(g) }}</option>
                  </select>
                </td>
                <!-- 目标值 / 达成 / 对标 / 差距 -->
                <td v-if="!editMode">{{ r.target }}</td>
                <td v-else><input class="form-input lc-sm" v-model="r.target" @input="dirty = true" placeholder="输入目标值"></td>
                <td v-if="!editMode">{{ r.ours }}</td>
                <td v-else><input class="form-input lc-sm" v-model="r.ours" @input="dirty = true" placeholder="实测/达成值"></td>
                <td v-if="!editMode" class="text-muted">{{ r.rival }}</td>
                <td v-else><input class="form-input lc-sm" v-model="r.rival" @input="dirty = true" placeholder="竞品对标值"></td>
                <td v-if="!editMode" :style="{ color: String(r.gap).startsWith('-') ? '#B42318' : '#067647', fontWeight: 600 }">{{ r.gap }}</td>
                <td v-else><input class="form-input lc-sm" v-model="r.gap" @input="dirty = true" placeholder="差距"></td>
                <!-- 验收状态 -->
                <td v-if="!editMode"><span class="badge" :class="r.status === '达成' ? 'badge-green' : r.status === '关注' ? 'badge-amber' : r.status === '未达成' ? 'badge-red' : 'badge-gray'">{{ r.status }}</span></td>
                <td v-else>
                  <select class="form-select lc-sm" v-model="r.status" @change="dirty = true">
                    <option v-for="s in ['待定义', '达成', '关注', '未达成']" :key="s" :value="s">{{ s }}</option>
                  </select>
                </td>
                <td v-if="editMode"><a class="lc-link" style="color: #B42318" @click="removeRow(r)">删除</a></td>
              </tr>
            </tbody>
          </table>
          <div class="lc-gradebar">
            <span class="lc-gradebar-label">定级标准（PALS 竞争定位）</span>
            <span v-for="lv in GRADE_LEVELS" :key="lv.v" class="lc-gradechip">
              <span class="badge" :class="lv.badge">{{ lv.v }}</span>
              <span class="lc-gradechip-name">{{ lv.name }}</span>
              <span class="lc-gradechip-quantile">{{ lv.quantile }}</span>
              <span class="lc-gradechip-desc">{{ lv.desc }}</span>
            </span>
            <span class="lc-gradechip">
              <span class="badge badge-gray">—</span>
              <span class="lc-gradechip-name">待定级</span>
              <span class="lc-gradechip-quantile"></span>
              <span class="lc-gradechip-desc">未定，待共创确认</span>
            </span>
          </div>
          <div class="lc-note">
            定级说明：每项指标依据产品概念与竞争策略，在共创环节定出 <b>L / A / C / U</b> 竞争定位等级（L=行业领导、A=行业领先、C=具备竞争力、U=成本妥协项）；
            每项指标关联「工程对应指标」（如总布置客观指标、外观品质属性、操作品质等），作为产品开发与验收的输入基准。
            <template v-if="editMode"><br><b>编辑模式：</b>可直接修改定级、目标值、本品达成、竞品对标、差距与验收状态；「保存」后定级进度将自动重算，并通过「提交共创评审」进入后续流程。</template>
            <template v-else-if="currentBook.status === '已发布' || currentBook.status === '已验收'"><br><b>当前目标书已{{ currentBook.status }}：</b>指标只读。如需调整，请通过顶部「发起变更」生成新版本解锁编辑。</template>
          </div>
        </div>
      </div>
    </div>

    <!-- 定义流程 -->
    <div v-else-if="workTab === 'flow'" class="card" style="padding-bottom: 16px">
      <div class="lc-card-title">整车指标（LACU）定义流程
        <span class="badge" :class="statusBadge(currentBook.status)">当前状态：{{ currentBook.status }}</span>
      </div>
      <div class="lc-flow">
        <div v-for="f in FLOW" :key="f.n" class="lc-flow-node" :class="f.status">
          <div class="lc-flow-head">
            <div class="lc-flow-num">{{ f.status === 'done' ? '✓' : f.n }}</div>
            <div class="lc-flow-name">{{ f.name }}</div>
          </div>
          <div class="lc-flow-role"><span class="badge badge-blue">{{ f.role }}</span></div>
          <div class="lc-flow-desc">{{ f.desc }}</div>
        </div>
      </div>

      <!-- 审批链路（审核批准中） -->
      <div v-if="currentBook.status === '审核批准中'" class="lc-approve">
        <div class="lc-approve-title">审核批准链路（产品市场方案审批链）</div>
        <div class="lc-approve-chain">
          <template v-for="(a, i) in approvals" :key="a.role">
            <div class="lc-approve-node" :class="{ done: a.status === '已通过', current: a.status === '待审批' && i === approvals.findIndex(x => x.status === '待审批') }">
              <div class="lc-approve-role">{{ a.role }}</div>
              <div class="lc-approve-st">{{ a.status }}</div>
              <div v-if="a.comment" class="lc-approve-cm">“{{ a.comment }}”</div>
              <div v-if="a.time" class="lc-approve-cm">{{ a.time }}</div>
            </div>
            <div v-if="i < approvals.length - 1" class="lc-approve-arrow">→</div>
          </template>
        </div>
        <div class="lc-approve-actions">
          <button class="btn btn-primary" @click="approveCurrent">审批通过（当前节点）</button>
          <button class="btn btn-secondary" style="color: #B42318" @click="rejectApproval">退回</button>
        </div>
      </div>

      <!-- 当前可执行操作提示 -->
      <div class="lc-note" style="margin-top: 4px">
        输入：调研结论（客户需求洞察流程，客户调研中心总经理同意后的调研结论）。输出：整车指标定义目标书。
        审批链路：产品市场方案（整车指标LACU、亮点买点、配置表、体验定义）→ 产品CEO审核 → 公司VP审核 → 公司级评审会批准。
        <template v-if="currentBook.status === '编制中'"><br>▶ 下一步：在「指标树与目标值」完成定级与目标值编辑后，点击顶部「提交共创评审」。</template>
        <template v-else-if="currentBook.status === '共创评审中'"><br>▶ 下一步：共创评审确认定级与目标值 → 「评审通过」进入审核批准链路，或「退回修改」。</template>
        <template v-else-if="currentBook.status === '审核批准中'"><br>▶ 下一步：逐级完成 产品CEO → 公司VP → 公司级评审会 审批，全部通过后目标书自动发布。</template>
        <template v-else-if="currentBook.status === '已发布'"><br>▶ 下一步：点击顶部「启动验收监控」，持续跟踪目标书达成情况。</template>
        <template v-else-if="currentBook.status === '验收监控中'"><br>▶ 下一步：在指标树中更新本品达成值与验收状态，完成后「完成验收」归档。</template>
      </div>

      <!-- 流程操作日志 -->
      <div class="lc-log">
        <div class="lc-log-title">流程操作日志</div>
        <div v-for="(l, i) in flowLogs" :key="i" class="lc-log-item">
          <span class="lc-log-time">{{ l.time }}</span>
          <span>{{ l.text }}</span>
        </div>
      </div>
    </div>

    <!-- 变更记录 -->
    <div v-else class="data-table">
      <div class="lc-card-title">整车指标变更记录
        <button class="btn btn-primary" style="height: 28px; font-size: 12px" @click="startChange">＋ 发起变更</button>
      </div>
      <table>
        <thead><tr><th>变更后版本号</th><th>时间</th><th>序号</th><th>变更内容</th></tr></thead>
        <tbody>
          <tr v-for="(c, i) in changes" :key="i">
            <td><strong>{{ c.ver }}</strong></td>
            <td>{{ c.date }}</td>
            <td>{{ c.seq }}</td>
            <td>{{ c.content }}</td>
          </tr>
        </tbody>
      </table>
      <div class="lc-note">指标体系各级数量由产品策划部动态审视、定期发布；变更需同步至配置宽度审视与亮点买点定义及管理清单。</div>
    </div>

    <!-- ============== 通用确认/输入弹窗 ============== -->
    <div v-if="modal" class="lc-modal-mask" @click.self="closeModal">
      <div class="lc-modal">
        <div class="lc-modal-title">{{ modal.title }}</div>
        <div class="lc-modal-tip">{{ modal.tip }}</div>
        <div v-if="modal.inputLabel" class="lc-modal-field">
          <label>{{ modal.inputLabel }}</label>
          <input class="form-input" v-model="modal.inputValue" :placeholder="'请输入' + modal.inputLabel">
        </div>
        <div v-if="modal.needComment" class="lc-modal-field">
          <label>{{ modal.commentLabel || '备注（可选）' }}</label>
          <textarea class="form-textarea" rows="3" v-model="modal.comment" placeholder="请输入意见（可选）"></textarea>
        </div>
        <div class="lc-modal-actions">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn" :class="modal.danger ? 'btn-secondary' : 'btn-primary'"
                  :style="modal.danger ? 'color: #B42318; border-color: #B42318' : ''" @click="submitModal">{{ modal.confirmText || '确定' }}</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ============== 新建目标书弹窗 ============== -->
  <div v-if="createOpen" class="modal-mask" @click.self="createOpen = false">
    <div class="modal" style="width: 520px; max-width: calc(100vw - 48px)">
      <div class="modal-title">新建 LACU 目标书</div>
      <div class="modal-desc">从最新指标体系（一级 10 / 二级 78 / 三级 186）全量复制生成，所有指标初始为「待定级 / 待确认」，创建后进入编制，完成定级编辑即可提交共创评审。</div>
      <div class="lc-create-field">
        <label>车型项目</label>
        <input class="form-input" list="lc-car-candidates" v-model="createForm.car" placeholder="选择车型，如：长安启源 C798">
        <datalist id="lc-car-candidates">
          <option v-for="c in CAR_CANDIDATES" :key="c.code" :value="c.carName">{{ c.code }} · {{ c.kind }}</option>
        </datalist>
        <span class="lc-create-hint">候选车型与量价管理目录一致；也可以直接输入其它车型名称</span>
      </div>
      <div class="lc-create-grid">
        <div class="lc-create-field">
          <label>项目节点</label>
          <select class="form-select" v-model="createForm.node">
            <option v-for="n in ['FKO', 'KO', 'CC', 'VS', 'LS']" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <div class="lc-create-field">
          <label>版本号</label>
          <input class="form-input" v-model="createForm.version" placeholder="如 V1.0">
        </div>
        <div class="lc-create-field">
          <label>责任人</label>
          <select class="form-select" v-model="createForm.owner">
            <option v-for="o in ['陈思远', '王铭']" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
        <div class="lc-create-field">
          <label>竞品对标对象（可选）</label>
          <input class="form-input" v-model="createForm.rival" placeholder="如：比亚迪宋PLUS DM-i">
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="createOpen = false">取消</button>
        <button class="btn btn-primary" @click="submitCreate">创建目标书</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lc-intro {
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px;
  padding: 14px 18px; font-size: 13px; color: var(--c-text-secondary); line-height: 1.8; margin-bottom: 16px;
}
.lc-intro-stats { display: flex; gap: 22px; margin-top: 10px; }
.lc-intro-stats b { font-size: 18px; color: var(--c-primary); margin-right: 4px; }
.lc-card-title {
  font-size: 14px; font-weight: 700; padding: 14px 16px 12px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  border-bottom: 1px solid var(--c-border);
}
/* card 容器内的标题：横线通栏、与下方内容拉开间距、左右与内容对齐 */
.card > .lc-card-title {
  margin: -20px -20px 16px;
  padding: 14px 20px 12px;
  border-radius: var(--r-lg) var(--r-lg) 0 0;
}
.lc-link { color: var(--c-primary); font-size: 13px; cursor: pointer; }
.lc-link:hover { text-decoration: underline; }
.lc-progress { height: 6px; background: var(--c-border); border-radius: 3px; overflow: hidden; margin-bottom: 4px; width: 120px; }
.lc-progress-fill { height: 100%; background: var(--c-primary); border-radius: 3px; }
.lc-note { font-size: 12px; color: var(--c-text-muted); padding: 12px 16px; line-height: 1.8; }

/* LACU 定级图例条（PALS L/A/C/U） */
.lc-gradebar {
  display: flex; align-items: center; gap: 6px 16px; flex-wrap: wrap;
  padding: 8px 16px; border-bottom: 1px dashed var(--c-border);
  background: #FAFBFD; font-size: 12px;
}
.lc-gradebar-label { font-weight: 700; color: #344054; margin-right: 4px; }
.lc-gradechip { display: inline-flex; align-items: center; gap: 4px; color: var(--c-text-muted); }
.lc-gradechip-name { font-weight: 600; color: #344054; }
.lc-gradechip-quantile { color: var(--c-text-muted); }
.lc-gradechip-desc { color: #98A2B3; }


/* workspace */
.lc-ws-header { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; flex-wrap: wrap; }
.lc-ws-title { font-size: 18px; font-weight: 700; }
.lc-ws-sub { font-size: 12px; color: var(--c-text-muted); margin-top: 2px; }
.lc-tabs { display: flex; gap: 4px; margin-bottom: 14px; border-bottom: 2px solid var(--c-border); }
.lc-tab {
  padding: 10px 16px; font-size: 14px; font-weight: 600; color: var(--c-text-muted);
  cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px;
}
.lc-tab.active { color: var(--c-primary); border-bottom-color: var(--c-primary); }
.lc-dot {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #F79009;
  margin-left: 6px; vertical-align: middle;
}

/* tree */
.lc-tree-layout { display: grid; grid-template-columns: 300px 1fr; gap: 14px; align-items: start; }
/* 目标值表格超宽兜底：横向可滚动，避免右侧列被 .data-table 的 overflow:hidden 裁掉导致"值展示不全" */
.lc-target .data-table { overflow-x: auto; }
.lc-tree {
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 12px;
  padding: 12px; position: sticky; top: 80px; max-height: calc(100vh - 120px); overflow-y: auto;
}
.lc-l1-head {
  display: flex; align-items: center; gap: 6px; padding: 8px 10px; border-radius: 8px;
  cursor: pointer; font-size: 13px; font-weight: 700; transition: background 0.15s;
}
.lc-l1-head:hover { background: var(--c-surface-2); }
.lc-l1-head.open { background: var(--c-primary-light); color: var(--c-primary); }
.lc-caret { font-size: 10px; width: 12px; color: var(--c-text-muted); }
.lc-l1-code { color: var(--c-text-muted); font-size: 12px; font-weight: 600; }
.lc-l1-name { flex: 1; }
.lc-l1-count {
  font-size: 10px; background: var(--c-surface-2); color: var(--c-text-muted);
  border-radius: 8px; padding: 1px 7px; font-weight: 700;
}
.lc-l1-head.open .lc-l1-count { background: var(--c-primary); color: white; }
.lc-l2-list { padding: 2px 0 6px 14px; }
.lc-l2 {
  display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 8px;
  font-size: 12.5px; cursor: pointer; color: var(--c-text-secondary); transition: all 0.15s;
}
.lc-l2:hover { background: var(--c-surface-2); color: var(--c-text); }
.lc-l2.active { background: var(--c-primary-light); color: var(--c-primary); font-weight: 600; }
.lc-l2-code { font-size: 11px; color: var(--c-text-muted); min-width: 32px; }
.lc-l2.active .lc-l2-code { color: var(--c-primary); }
.lc-l2-name { flex: 1; line-height: 1.4; }
.lc-l2-count { font-size: 10px; color: var(--c-text-muted); }
.lc-search-results { max-height: 500px; overflow-y: auto; }

/* 编辑模式小控件 */
.lc-sm { height: 28px; font-size: 12px; padding: 0 8px; min-width: 70px; }
.lc-pending { border-color: #F79009; color: #B54708; }

/* flow */
.lc-flow { display: flex; gap: 10px; flex-wrap: wrap; }
.lc-flow-node { flex: 1; min-width: 180px; background: var(--c-surface-2); border: 1px solid var(--c-border); border-radius: 10px; padding: 14px; }
.lc-flow-node.active { border-color: var(--c-primary); background: var(--c-primary-light); }
.lc-flow-node.done { border-color: var(--c-success); }
.lc-flow-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.lc-flow-num {
  width: 24px; height: 24px; border-radius: 50%; background: var(--c-border); color: var(--c-text-secondary);
  font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.lc-flow-node.active .lc-flow-num { background: var(--c-primary); color: white; }
.lc-flow-node.done .lc-flow-num { background: var(--c-success); color: white; }
.lc-flow-name { font-size: 13px; font-weight: 700; line-height: 1.4; }
.lc-flow-role { margin-bottom: 6px; }
.lc-flow-desc { font-size: 11.5px; color: var(--c-text-secondary); line-height: 1.6; }

/* 审批链 */
.lc-approve { margin-top: 16px; border: 1px solid var(--c-border); border-radius: 10px; padding: 14px 16px; background: var(--c-surface); }
.lc-approve-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; }
.lc-approve-chain { display: flex; align-items: stretch; gap: 10px; flex-wrap: wrap; }
.lc-approve-node {
  flex: 1; min-width: 150px; border: 1px solid var(--c-border); border-radius: 10px;
  padding: 10px 12px; text-align: center; background: var(--c-surface-2);
}
.lc-approve-node.done { border-color: var(--c-success); }
.lc-approve-node.current { border-color: var(--c-primary); background: var(--c-primary-light); }
.lc-approve-role { font-size: 13px; font-weight: 700; }
.lc-approve-st { font-size: 12px; margin-top: 4px; color: var(--c-text-muted); }
.lc-approve-node.current .lc-approve-st { color: var(--c-primary); font-weight: 600; }
.lc-approve-cm { font-size: 11px; color: var(--c-text-muted); margin-top: 4px; line-height: 1.5; }
.lc-approve-arrow { align-self: center; color: var(--c-text-muted); font-size: 16px; }
.lc-approve-actions { display: flex; gap: 10px; margin-top: 14px; }

/* 流程日志 */
.lc-log { margin: 14px 16px 0; border-top: 1px dashed var(--c-border); padding-top: 12px; }
.lc-log-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.lc-log-item { display: flex; gap: 12px; font-size: 12px; color: var(--c-text-secondary); padding: 4px 0; }
.lc-log-time { color: var(--c-text-muted); flex-shrink: 0; }

/* 新建目标书弹窗表单 */
.lc-create-field { margin-bottom: 12px; }
.lc-create-field label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--c-text-secondary); }
.lc-create-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
.lc-create-hint { display: block; font-size: 11px; color: var(--c-text-muted); margin-top: 5px; }

/* 弹窗 */
.lc-modal-mask {
  position: fixed; inset: 0; background: rgba(16, 24, 40, 0.5); z-index: 1000;
  display: flex; align-items: center; justify-content: center;
}
.lc-modal {
  width: 460px; max-width: calc(100vw - 48px); background: var(--c-surface);
  border-radius: 14px; padding: 22px; box-shadow: 0 20px 50px rgba(16, 24, 40, 0.2);
}
.lc-modal-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.lc-modal-tip { font-size: 12.5px; color: var(--c-text-secondary); line-height: 1.7; margin-bottom: 14px; }
.lc-modal-field { margin-bottom: 12px; }
.lc-modal-field label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--c-text-secondary); }
.lc-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
</style>
