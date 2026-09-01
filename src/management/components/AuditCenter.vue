<script setup>
import { ref, computed, watch } from 'vue'
import { mockReports, getReport, statusMeta } from '../data.js'

const emit = defineEmits(['toast'])
const props = defineProps({
  role: { type: String, default: 'admin' },
  initialReportId: { type: String, default: null },
})

// ============== State ==============
const auditReportId = ref(null)
const auditStepId = ref(null)
const auditFilter = ref({ keyword: '', status: 'all', type: 'all' })
const auditPage = ref(1)
const auditPageSize = ref(5)
const showCopyModal = ref(false)
const copyOriginalId = ref(null)
const copyVersions = ref([])
const selectedVersion = ref(null)

// 监听外部传入的初始报告ID（工作台生成后跳转打开）
watch(
  () => props.initialReportId,
  (id) => {
    if (id) {
      openAudit(id)
    }
  },
  { immediate: true }
)

const currentReport = computed(() => auditReportId.value ? getReport(auditReportId.value) : null)
const currentStep = computed(() => {
  if (!currentReport.value) return null
  return currentReport.value.steps.find(x => x.id === auditStepId.value) || null
})

const canReview = computed(() => props.role === 'admin' || props.role === 'reviewer')

// ============== List ==============
const filtered = computed(() => {
  return mockReports.filter(r => {
    const kw = auditFilter.value.keyword.trim()
    const matchKw = !kw || r.name.includes(kw) || r.brand.includes(kw) || r.id.includes(kw)
    const matchStatus = auditFilter.value.status === 'all' ? true : r.status === auditFilter.value.status
    const matchType = auditFilter.value.type === 'all' ? true : r.fileType === auditFilter.value.type
    return matchKw && matchStatus && matchType
  })
})
const total = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / auditPageSize.value)))
const curPage = computed(() => auditPage.value)
const pageStart = computed(() => (curPage.value - 1) * auditPageSize.value)
const pageRows = computed(() => filtered.value.slice(pageStart.value, pageStart.value + auditPageSize.value))

const stats = computed(() => [
  { label: '只读（原始）', value: mockReports.filter(r => r.status === 'readonly').length, color: 'gray' },
  { label: '草稿', value: mockReports.filter(r => r.status === 'draft').length, color: 'gray' },
  { label: '待校验', value: mockReports.filter(r => r.status === 'reviewing').length, color: 'amber' },
  { label: '已发布', value: mockReports.filter(r => r.status === 'published').length, color: 'green' },
])

const pageNumbers = computed(() => {
  const nums = []
  const tp = totalPages.value
  const cp = curPage.value
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) nums.push(i)
  } else {
    nums.push(1)
    const left = Math.max(2, cp - 2)
    const right = Math.min(tp - 1, cp + 2)
    if (left > 2) nums.push('...')
    for (let i = left; i <= right; i++) nums.push(i)
    if (right < tp - 1) nums.push('...')
    nums.push(tp)
  }
  return nums
})
const rangeStart = computed(() => total.value === 0 ? 0 : (curPage.value - 1) * auditPageSize.value + 1)
const rangeEnd = computed(() => Math.min(curPage.value * auditPageSize.value, total.value))

function filterAudit(keyword) {
  auditFilter.value.keyword = keyword
  auditPage.value = 1
}
function filterAuditStatus(status) {
  auditFilter.value.status = status
  auditPage.value = 1
}
function filterAuditType(type) {
  auditFilter.value.type = type
  auditPage.value = 1
}
function gotoAuditPage(p) {
  auditPage.value = p
}
function changeAuditPageSize(size) {
  auditPageSize.value = parseInt(size, 10)
  auditPage.value = 1
}

// ============== Detail ==============
const statusFlow = ['draft', 'reviewing', 'verified', 'published']
const visibleSteps = computed(() => {
  if (!currentReport.value) return []
  const r = currentReport.value
  return r.fileType === 'original' ? r.steps : r.steps.filter(s => s.id !== 's12')
})
const flowIdx = computed(() => currentReport.value ? statusFlow.indexOf(currentReport.value.status) : -1)
const isOriginal = computed(() => currentReport.value ? currentReport.value.fileType === 'original' : false)

function stepStateClass(s) {
  if (isOriginal.value) return 'readonly'
  if (!s.editable) return 'readonly'
  return s.edited ? 'edited' : ''
}
function stepTag(s) {
  if (isOriginal.value) return '只读'
  if (!s.editable) return '只读'
  return s.edited ? '已编辑' : '可编辑'
}

function openAudit(id) {
  auditReportId.value = id
  const r = getReport(id)
  if (r) {
    const visible = r.fileType === 'copy' ? r.steps.filter(s => s.id !== 's12') : r.steps
    const firstEditable = visible.find(s => s.editable)
    auditStepId.value = firstEditable ? firstEditable.id : (visible[0] ? visible[0].id : null)
  }
}

function backToAuditList() {
  auditReportId.value = null
  auditStepId.value = null
}

function selectAuditStep(stepId) {
  auditStepId.value = stepId
}

const canEditStep = computed(() => {
  if (!currentStep.value) return false
  return !isOriginal.value && canReview.value && currentStep.value.editable
})

// ============== Edit Panel body ==============
function stepBadgeClass(s) {
  if (s.id === 's11') return 'badge-amber'
  if (s.id === 's12') return 'badge-blue'
  return 'badge-orange'
}

// ============== Status transitions ==============
function submitForReview(id) {
  const r = getReport(id)
  if (!r) return
  r.status = 'reviewing'
  emit('toast', '报告已提交校验', 'success')
}
function verifyReport(id) {
  const r = getReport(id)
  if (!r) return
  r.status = 'verified'
  emit('toast', '校验通过，可发布', 'success')
}
function rejectReview(id) {
  const r = getReport(id)
  if (!r) return
  r.status = 'draft'
  emit('toast', '已驳回，回到草稿状态', 'warning')
}
function publishReport(id) {
  const r = getReport(id)
  if (!r) return
  r.status = 'published'
  r.publishedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
  emit('toast', '已发布至报告中心', 'success')
}
function unpublishReport(id) {
  const r = getReport(id)
  if (!r) return
  r.status = 'verified'
  r.publishedAt = null
  emit('toast', '已下架，回到已校验状态', 'warning')
}
function deleteReport(id) {
  const r = getReport(id)
  if (!r) return
  if (!confirm(`确认删除副本「${r.name}」吗？此操作不可恢复。`)) return
  const idx = mockReports.findIndex(x => x.id === id)
  if (idx > -1) {
    mockReports.splice(idx, 1)
    emit('toast', '副本已删除', 'success')
    backToAuditList()
  }
}
function returnToDraft(id) {
  const r = getReport(id)
  if (!r) return
  r.status = 'draft'
  emit('toast', '已打回修改，回到草稿状态', 'warning')
}

function saveStepEdit(stepId) {
  const r = currentReport.value
  if (!r) return
  const s = r.steps.find(x => x.id === stepId)
  if (s) {
    s.edited = true
  }
  emit('toast', '步骤「' + (s ? s.name : '') + '」已保存，标记为已编辑', 'success')
}

// ============== Copy & Regenerate ==============
function showCreateCopyModal(originalId) {
  const r = getReport(originalId)
  if (!r) return
  copyOriginalId.value = originalId
  copyVersions.value = r.versions || [{ v: 'v1.0', time: r.createdAt, desc: '工作台初始生成版本' }]
  selectedVersion.value = copyVersions.value[0].v
  showCopyModal.value = true
}

function confirmCreateCopy() {
  const originalId = copyOriginalId.value
  const orig = getReport(originalId)
  if (!orig) return
  const ver = selectedVersion.value || 'v1.0'

  // 深拷贝前11步（无 s12）
  const copySteps = orig.steps.filter(s => s.id !== 's12').map(s => ({
    ...s,
    edited: false,
    rows: s.rows ? s.rows.map(r => [...r]) : undefined,
    persona: s.persona ? { ...s.persona, dimensions: s.persona.dimensions.map(d => ({ ...d })) } : undefined,
    strategies: s.strategies ? s.strategies.map(st => ({ ...st })) : undefined,
    files: s.files ? s.files.map(f => ({ ...f })) : undefined,
  }))

  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const newId = 'RPT-' + now.slice(0, 10).replace(/-/g, '') + '-' + String(mockReports.length + 1).padStart(3, '0')
  const copyReport = {
    id: newId,
    name: orig.name + '（副本）',
    brand: orig.brand,
    segment: orig.segment,
    priceRange: orig.priceRange,
    energy: orig.energy,
    launchYear: orig.launchYear,
    status: 'draft',
    fileType: 'copy',
    parentId: originalId,
    parentVersion: ver,
    creator: props.role === 'admin' ? '管理员' : (props.role === 'reviewer' ? '审核员' : '查看员'),
    createdAt: now,
    publishedAt: null,
    steps: copySteps,
  }
  mockReports.push(copyReport)

  showCopyModal.value = false
  emit('toast', '已基于 ' + ver + ' 创建副本 ' + newId, 'success')
  setTimeout(() => openAudit(newId), 200)
}

function regenerateReport(id) {
  const r = getReport(id)
  if (!r) return

  const hasS12 = r.steps.find(s => s.id === 's12')
  if (hasS12) {
    r.steps = r.steps.filter(s => s.id !== 's12')
  }
  r.steps.push({
    id: 's12', num: 12, name: '产品概念整合生成', editable: false, edited: false,
    source: '主智能体 · SPC-MAIN',
    title: '产品概念最终报告已重新生成',
    subtitle: r.name.replace('（副本）', ''),
    files: [
      { name: '产品概念最终报告（Word）.docx', size: '2.4 MB', color: '#155EEF' },
    ],
    insight: '基于编辑后的内容重新生成产品概念最终报告（Word）。',
  })

  emit('toast', '🔄 正在重新生成报告...', 'success')
  setTimeout(() => {
    emit('toast', '✓ 报告已重新生成，最终报告（Word）已生成', 'success')
    openAudit(id)
  }, 1500)
}
</script>

<template>
  <!-- 列表 -->
  <div v-if="!auditReportId">
    <div class="stats-grid">
      <div
        v-for="s in stats"
        :key="s.label"
        class="stat-card"
        :style="{ borderLeft: '3px solid var(--c-' + (s.color === 'gray' ? 'text-muted' : s.color) + ')' }"
      >
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="text-xs text-muted mt-4">实时统计</div>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span>🔍</span>
        <input
          placeholder="搜索报告编号、名称、品牌..."
          :value="auditFilter.keyword"
          @input="filterAudit($event.target.value)"
        />
      </div>
      <div style="display:flex; gap:10px; align-items:center; margin-left:auto;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="text-xs text-muted">类型</span>
          <select
            class="page-size-select"
            style="min-width:110px;"
            :value="auditFilter.type"
            @change="filterAuditType($event.target.value)"
          >
            <option value="all">全部类型</option>
            <option value="original">原始文件</option>
            <option value="copy">副本</option>
          </select>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="text-xs text-muted">状态</span>
          <select
            class="page-size-select"
            style="min-width:110px;"
            :value="auditFilter.status"
            @change="filterAuditStatus($event.target.value)"
          >
            <option value="all">全部状态</option>
            <option value="readonly">只读</option>
            <option value="draft">草稿</option>
            <option value="reviewing">待校验</option>
            <option value="verified">已校验</option>
            <option value="published">已发布</option>
          </select>
        </div>
      </div>
    </div>

    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>报告编号</th>
            <th>方案名称</th>
            <th>品牌</th>
            <th>细分市场</th>
            <th>类型</th>
            <th>状态</th>
            <th>创建人</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="pageRows.length">
            <tr v-for="r in pageRows" :key="r.id" @click="openAudit(r.id)">
              <td><span class="text-sm text-muted">{{ r.id }}</span></td>
              <td><strong>{{ r.name }}</strong></td>
              <td>{{ r.brand }}</td>
              <td>{{ r.segment }}</td>
              <td style="white-space:nowrap;">
                <span v-if="r.fileType === 'original'" class="badge badge-gray">原始文件</span>
                <span v-else class="badge badge-blue">副本</span>
              </td>
              <td style="white-space:nowrap;"><span class="badge" :class="'badge-' + statusMeta(r.status).color">{{ statusMeta(r.status).label }}</span></td>
              <td>{{ r.creator }}</td>
              <td class="text-sm text-muted">{{ r.createdAt }}</td>
              <td>
                <button class="btn btn-ghost" @click.stop="openAudit(r.id)">{{ r.fileType === 'original' ? '查看' : (r.status === 'published' ? '查看' : '审核') }}</button>
                <button
                  v-if="r.fileType === 'original'"
                  class="btn btn-ghost"
                  style="color:var(--c-primary)"
                  @click.stop="showCreateCopyModal(r.id)"
                >创建副本</button>
                <button
                  v-if="canReview && r.fileType !== 'original' && r.status === 'draft'"
                  class="btn btn-ghost"
                  style="color:var(--c-primary)"
                  @click.stop="submitForReview(r.id)"
                >提交校验</button>
                <button
                  v-if="canReview && r.fileType !== 'original' && r.status === 'verified'"
                  class="btn btn-ghost"
                  style="color:var(--c-success)"
                  @click.stop="publishReport(r.id)"
                >发布</button>
                <button
                  v-if="canReview && r.fileType !== 'original' && r.status === 'published'"
                  class="btn btn-ghost"
                  style="color:var(--c-warning)"
                  @click.stop="unpublishReport(r.id)"
                >下架</button>
                <button
                  v-if="canReview && r.fileType !== 'original'"
                  class="btn btn-ghost"
                  style="color:var(--c-danger)"
                  @click.stop="deleteReport(r.id)"
                >删除</button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="9">
              <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">无匹配数据</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <div class="page-info">第 {{ rangeStart }}-{{ rangeEnd }} 条 / 共 {{ total }} 条</div>
        <div class="page-controls">
          <button class="page-btn" :disabled="curPage <= 1" @click="gotoAuditPage(curPage - 1)">‹ 上一页</button>
          <template v-for="(n, i) in pageNumbers" :key="i">
            <span v-if="n === '...'" class="page-ellipsis">···</span>
            <button
              v-else
              class="page-num"
              :class="{ active: n === curPage }"
              @click="gotoAuditPage(n)"
            >{{ n }}</button>
          </template>
          <button class="page-btn" :disabled="curPage >= totalPages" @click="gotoAuditPage(curPage + 1)">下一页 ›</button>
          <span class="page-jump">
            跳至
            <input
              type="number"
              min="1"
              :max="totalPages"
              :value="curPage"
              @change="gotoAuditPage(Math.min(Math.max(1, parseInt($event.target.value) || 1), totalPages))"
            />
            页
          </span>
          <select class="page-size-select" :value="auditPageSize" @change="changeAuditPageSize($event.target.value)">
            <option value="5" :selected="auditPageSize === 5">5 条/页</option>
            <option value="10" :selected="auditPageSize === 10">10 条/页</option>
            <option value="20" :selected="auditPageSize === 20">20 条/页</option>
            <option value="50" :selected="auditPageSize === 50">50 条/页</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- 详情 -->
  <div v-else-if="currentReport">
    <button class="btn btn-ghost mb-4" @click="backToAuditList">← 返回审核列表</button>

    <div class="audit-status-bar">
      <div>
        <div class="text-sm text-muted mb-2">
          {{ currentReport.id }} · {{ currentReport.name }}
          <span
            v-if="isOriginal"
            class="badge badge-gray"
            style="margin-left:8px;"
          >原始文件</span>
          <span v-else class="badge badge-blue" style="margin-left:8px;">副本</span>
          <span
            v-if="!isOriginal && currentReport.parentVersion"
            class="text-xs text-muted"
            style="margin-left:6px;"
          >基于 {{ currentReport.parentId || '' }} {{ currentReport.parentVersion }}</span>
        </div>
        <div
          v-if="isOriginal"
          style="display:flex; align-items:center; gap:8px; padding:8px 14px; background:#F8FAFC; border:1px solid var(--c-border); border-radius:var(--r-md); font-size:13px;"
        >
          <span style="color:var(--c-text-muted);">📋 原始文件只读，不可直接编辑。请选择版本创建副本后编辑发布。</span>
        </div>
        <div v-else class="status-flow">
          <template v-for="(s, i) in statusFlow" :key="s">
            <span
              class="status-node"
              :class="i < flowIdx ? 'done' : (i === flowIdx ? 'active' : '')"
            >{{ statusMeta(s).label }}</span>
            <span v-if="i < 3" class="status-arrow">→</span>
          </template>
        </div>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button v-if="isOriginal" class="btn btn-primary" @click="showCreateCopyModal(currentReport.id)">创建副本</button>
        <template v-else>
          <button v-if="canReview && currentReport.status === 'draft'" class="btn btn-secondary" @click="submitForReview(currentReport.id)">提交校验</button>
          <button v-if="canReview && currentReport.status === 'reviewing'" class="btn btn-success" @click="verifyReport(currentReport.id)">校验通过</button>
          <button v-if="canReview && currentReport.status === 'reviewing'" class="btn btn-warning" @click="rejectReview(currentReport.id)">驳回</button>
          <button v-if="canReview && currentReport.status === 'verified'" class="btn btn-primary" @click="publishReport(currentReport.id)">发布</button>
          <button v-if="canReview && currentReport.status === 'published'" class="btn btn-secondary" @click="unpublishReport(currentReport.id)">下架</button>
          <button v-if="canReview && (currentReport.status === 'verified' || currentReport.status === 'reviewing')" class="btn btn-secondary" @click="returnToDraft(currentReport.id)">打回修改</button>
          <button v-if="canReview && currentReport.status === 'draft'" class="btn btn-secondary" style="color:var(--c-primary)" @click="regenerateReport(currentReport.id)">重新生成报告</button>
        </template>
      </div>
    </div>

    <!-- 版本历史 -->
    <div
      v-if="isOriginal"
      style="margin-bottom:16px; padding:14px 18px; background:linear-gradient(135deg,#EFF4FF 0%,#F5F3FF 100%); border:1px solid #C4B5FD; border-radius:var(--r-lg);"
    >
      <div style="font-weight:700; font-size:13px; color:#4C1D95; margin-bottom:10px;">📦 版本历史</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <div
          v-for="(v, i) in (currentReport.versions || [])"
          :key="i"
          style="padding:8px 14px; background:white; border:1px solid #C4B5FD; border-radius:var(--r-md); font-size:12px;"
        >
          <strong style="color:#5B21B6;">{{ v.v }}</strong>
          <span style="color:var(--c-text-muted); margin-left:6px;">{{ v.time }}</span>
          <div style="color:var(--c-text-secondary); margin-top:2px;">{{ v.desc }}</div>
        </div>
      </div>
    </div>

    <div class="audit-layout">
      <!-- 步骤侧栏 -->
      <div class="audit-steps">
        <div class="audit-steps-title">
          {{ isOriginal ? '查看步骤' : '审核步骤' }}
          <span v-if="!isOriginal" class="text-xs text-muted" style="margin-left:6px;">（1-11可编辑，无输出物）</span>
        </div>
        <div
          v-for="s in visibleSteps"
          :key="s.id"
          class="audit-step-item"
          :class="[auditStepId === s.id ? 'active' : '', stepStateClass(s)]"
          @click="selectAuditStep(s.id)"
        >
          <div class="audit-step-num">{{ s.num }}</div>
          <div class="audit-step-name">{{ s.name }}</div>
          <span class="audit-step-tag">{{ stepTag(s) }}</span>
        </div>
        <div
          v-if="!isOriginal"
          style="padding:10px 12px; margin-top:8px; background:#FFF7ED; border:1px dashed #FDBA74; border-radius:var(--r-md); font-size:11px; color:#9A3412;"
        >
          Step 12 输出物编辑后由系统重新生成
        </div>
      </div>

      <!-- 编辑面板 -->
      <div v-if="currentStep" class="edit-panel">
        <div class="edit-panel-header">
          <div>
            <div class="edit-panel-title">
              <span class="badge" :class="stepBadgeClass(currentStep)">步骤 {{ currentStep.num }}</span>
              {{ currentStep.title }}
            </div>
            <div class="edit-panel-subtitle">{{ currentStep.source }} · {{ currentStep.editable ? '可编辑' : '只读' }}</div>
          </div>
          <div class="ai-tag">✨ AI 产出</div>
        </div>

        <div v-if="isOriginal" class="readonly-notice">🔒 原始文件只读，不可编辑。请点击上方「创建副本」生成可编辑副本。</div>
        <div v-else-if="!currentStep.editable" class="readonly-notice">🔒 该步骤数据来源为「{{ currentStep.source }}」，不可编辑。如需调整请前往源头修改后重新生成。</div>
        <div v-else-if="role === 'viewer'" class="readonly-notice">🔒 当前角色为查看员，无编辑权限。切换为审核员/管理员可编辑。</div>

        <div v-if="currentStep.subtitle" class="text-sm text-secondary mb-4">{{ currentStep.subtitle }}</div>
        <div v-if="currentStep.meta" class="text-sm text-muted mb-4">{{ currentStep.meta }}</div>

        <!-- persona -->
        <div v-if="currentStep.persona" style="padding:14px; background:var(--c-surface-2); border-radius:var(--r-md);">
          <div style="display:grid; grid-template-columns:120px 1fr; gap:10px;">
            <div class="form-label">画像昵称</div>
            <input class="form-input" :value="currentStep.persona.nickname" :disabled="!canEditStep" />
            <div class="form-label">画像标语</div>
            <input class="form-input" :value="currentStep.persona.tagline" :disabled="!canEditStep" />
          </div>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:12px;">
            <div v-for="(d, di) in currentStep.persona.dimensions" :key="di">
              <div class="text-xs text-muted">{{ d.label }}</div>
              <input class="form-input" :value="d.value" :disabled="!canEditStep" />
            </div>
          </div>
        </div>

        <!-- selected (竞争圈) -->
        <div v-else-if="currentStep.selected">
          <div class="form-row">
            <div class="form-label">选定竞争圈</div>
            <select class="form-select" :disabled="!canEditStep">
              <option :selected="currentStep.selected === '入门紧凑产品圈'">入门紧凑产品圈</option>
              <option :selected="currentStep.selected === '主流品质产品圈'">主流品质产品圈</option>
              <option :selected="currentStep.selected === '高端运动产品圈'">高端运动产品圈</option>
            </select>
          </div>
          <table class="editable-table">
            <thead>
              <tr>
                <th v-for="c in currentStep.columns" :key="c">{{ c }}</th>
                <th v-if="canEditStep">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in currentStep.rows" :key="ri">
                <td v-for="(c, ci) in row" :key="ci"><input :value="c" :disabled="!canEditStep" /></td>
                <td v-if="canEditStep"><button class="btn btn-ghost" @click="emit('toast', '演示：删除行')">✗</button></td>
              </tr>
            </tbody>
          </table>
          <button v-if="canEditStep" class="btn btn-secondary mt-4" @click="emit('toast', '演示：新增行')">+ 新增行</button>
        </div>

        <!-- strategies -->
        <div v-else-if="currentStep.strategies" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div
            v-for="st in currentStep.strategies"
            :key="st.key"
            :style="{
              padding: '14px',
              border: '2px solid ' + (st.selected ? '#10B981' : 'var(--c-border)'),
              borderRadius: 'var(--r-md)',
              background: st.selected ? '#ECFDF3' : 'var(--c-surface)'
            }"
          >
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <input type="radio" :checked="st.selected" :disabled="!canEditStep" name="strategy" />
              <strong>策略{{ st.key }}：{{ st.name }}</strong>
            </div>
            <input class="form-input" :value="st.desc" :disabled="!canEditStep" />
          </div>
        </div>

        <!-- files -->
        <div v-else-if="currentStep.files" class="msg-files">
          <div v-for="(f, fi) in currentStep.files" :key="fi" class="msg-file-card">
            <div class="msg-file-icon" :style="{ background: f.color }">{{ f.name.split('.')[1].toUpperCase().slice(0, 2) }}</div>
            <div class="msg-file-info">
              <div class="msg-file-name">{{ f.name }}</div>
              <div class="msg-file-meta">{{ f.size }}</div>
            </div>
            <span class="badge badge-gray">主智能体生成</span>
          </div>
        </div>

        <!-- columns table -->
        <table v-else-if="currentStep.columns" class="editable-table">
          <thead>
            <tr>
              <th v-for="c in currentStep.columns" :key="c">{{ c }}</th>
              <th v-if="canEditStep">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in currentStep.rows" :key="ri">
              <td v-for="(c, ci) in row" :key="ci"><input :value="c" :disabled="!canEditStep" /></td>
              <td v-if="canEditStep"><button class="btn btn-ghost" @click="emit('toast', '演示：删除行')">✗</button></td>
            </tr>
          </tbody>
        </table>
        <button v-if="currentStep.columns && canEditStep" class="btn btn-secondary mt-4" @click="emit('toast', '演示：新增行')">+ 新增行</button>

        <!-- insight -->
        <div v-if="currentStep.insight" class="form-row" style="grid-template-columns:1fr; margin-top:14px;">
          <div>
            <div class="form-label mb-2">✨ AI 洞察输出</div>
            <textarea class="form-textarea" :disabled="!canEditStep">{{ currentStep.insight }}</textarea>
          </div>
        </div>

        <!-- 编辑操作 -->
        <div v-if="canEditStep" class="edit-actions">
          <button class="btn btn-secondary" @click="emit('toast', '已重置为本步骤AI原始产出', 'warning')">↺ 重置AI原始</button>
          <button class="btn btn-primary" @click="saveStepEdit(currentStep.id)">💾 保存修改</button>
        </div>
      </div>
    </div>

    <!-- 创建副本模态框 -->
    <div v-if="showCopyModal" class="modal-mask" @click.self="showCopyModal = false">
      <div style="background:white; border-radius:12px; width:420px; padding:24px; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div style="font-size:16px; font-weight:700; margin-bottom:6px;">📋 创建副本</div>
        <div style="font-size:13px; color:var(--c-text-muted); margin-bottom:18px;">基于原始文件的指定版本创建可编辑副本，副本编辑后需重新生成报告。</div>

        <div style="margin-bottom:16px;">
          <div style="font-size:13px; font-weight:600; margin-bottom:8px;">选择版本</div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <label
              v-for="(v, i) in copyVersions"
              :key="i"
              :style="{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                border: '1px solid var(--c-border)',
                borderRadius: '8px',
                cursor: 'pointer',
                borderColor: selectedVersion === v.v ? 'var(--c-primary)' : 'var(--c-border)',
                background: selectedVersion === v.v ? '#EFF4FF' : 'white'
              }"
            >
              <input
                type="radio"
                name="copyVersion"
                :value="v.v"
                v-model="selectedVersion"
                style="accent-color:var(--c-primary);"
              />
              <div>
                <div style="font-weight:600; font-size:13px;">{{ v.v }}</div>
                <div style="font-size:11px; color:var(--c-text-muted);">{{ v.time }} · {{ v.desc }}</div>
              </div>
            </label>
          </div>
        </div>

        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
          <button class="btn btn-secondary" @click="showCopyModal = false">取消</button>
          <button class="btn btn-primary" @click="confirmCreateCopy">✓ 创建副本</button>
        </div>
      </div>
    </div>
  </div>
</template>
