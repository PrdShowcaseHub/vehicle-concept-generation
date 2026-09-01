<script setup>
import { computed } from 'vue'
import { getReport, statusMeta, renderConceptReport } from '../data.js'

const emit = defineEmits(['toast', 'back'])
const props = defineProps({
  reportId: { type: String, required: true },
  role: { type: String, default: 'admin' },
})

const report = computed(() => getReport(props.reportId))
const sm = computed(() => report.value ? statusMeta(report.value.status) : null)
const permissionNote = computed(() =>
  props.role === 'viewer'
    ? '<span class="report-section-lock">🔒 查看权限：只读</span>'
    : '<span class="report-section-lock">📖 查看权限：全板块可见</span>'
)
const visibleSteps = computed(() => {
  if (!report.value) return []
  return report.value.steps.filter(s => s.id !== 's5') // hide upload step in detail
})

function stepBadgeClass(s) {
  if (s.id === 's11') return 'badge-amber'
  if (s.id === 's12') return 'badge-blue'
  return 'badge-orange'
}
</script>

<template>
  <div v-if="report" class="report-detail">
    <button class="btn btn-ghost mb-4" @click="emit('back')">← 返回报告列表</button>

    <div class="report-detail-header">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div>
          <div class="report-detail-title">{{ report.name }}</div>
          <div class="report-detail-meta">
            <span>编号：{{ report.id }}</span>
            <span>·</span>
            <span>创建人：{{ report.creator }}</span>
            <span>·</span>
            <span>创建：{{ report.createdAt }}</span>
            <span>·</span>
            <span>发布：{{ report.publishedAt || '—' }}</span>
            <span>·</span>
            <span class="badge" :class="'badge-' + sm.color">{{ sm.label }}</span>
          </div>
          <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
            <span v-for="t in (report.tags || [])" :key="t" class="badge badge-blue">{{ t }}</span>
            <span class="badge badge-gray">👁 浏览 {{ report.views || 0 }}</span>
            <span class="badge badge-gray">📥 下载 {{ report.downloads || 0 }}</span>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" @click="emit('toast', '演示：导出 PDF', 'success')">📄 导出PDF</button>
          <button class="btn btn-primary" @click="emit('toast', '演示：打包下载全部附件', 'success')">📦 打包下载</button>
        </div>
      </div>
    </div>

    <!-- 产品概念书 -->
    <div v-html="renderConceptReport(report)"></div>

    <!-- 步骤详情 -->
    <div v-for="s in visibleSteps" :key="s.id" class="report-section">
      <div class="report-section-title">
        <span class="badge" :class="stepBadgeClass(s)">步骤 {{ s.num }}</span>
        {{ s.title }}
        <span class="ai-tag">✨ {{ s.source }}</span>
        <span v-html="permissionNote"></span>
      </div>
      <div v-if="s.subtitle" class="text-sm text-muted mb-4">{{ s.subtitle }}</div>
      <div v-if="s.meta" class="text-sm text-muted mb-4">{{ s.meta }}</div>

      <!-- persona -->
      <div
        v-if="s.persona"
        style="display:flex; align-items:flex-start; gap:14px; padding:14px; background:var(--c-surface-2); border-radius:var(--r-md);"
      >
        <div style="width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#7C3AED,#5B21B6); color:white; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700;">{{ s.persona.nickname.charAt(0) }}</div>
        <div style="flex:1;">
          <div style="font-weight:700; font-size:14px;">{{ s.persona.nickname }}</div>
          <div class="text-sm text-muted">{{ s.persona.tagline }}</div>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px 14px; margin-top:10px;">
            <div v-for="d in s.persona.dimensions" :key="d.label">
              <span class="text-xs text-muted">{{ d.label }}</span>
              <div class="text-sm">{{ d.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- selected (竞争圈) -->
      <div v-else-if="s.selected">
        <div class="callout" style="background:var(--c-success-light); border:1px solid #A7F3D0; border-radius:var(--r-md); padding:10px 14px; margin-bottom:10px; color:#065F46; font-weight:600;">✓ 选定竞争圈：{{ s.selected }}</div>
        <table class="report-mini-table">
          <thead><tr><th v-for="c in s.columns" :key="c">{{ c }}</th></tr></thead>
          <tbody>
            <tr v-for="(row, ri) in s.rows" :key="ri">
              <td v-for="(c, ci) in row" :key="ci">{{ c }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- strategies -->
      <div v-else-if="s.strategies" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div
          v-for="st in s.strategies"
          :key="st.key"
          :style="{
            padding: '14px',
            border: '2px solid ' + (st.selected ? '#10B981' : 'var(--c-border)'),
            borderRadius: 'var(--r-md)',
            background: st.selected ? '#ECFDF3' : 'var(--c-surface)'
          }"
        >
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
            <strong>策略{{ st.key }}：{{ st.name }}</strong>
            <span v-if="st.selected" class="badge badge-green">✓ 已确认</span>
          </div>
          <div class="text-sm text-secondary">{{ st.desc }}</div>
        </div>
      </div>

      <!-- files -->
      <div v-else-if="s.files" class="msg-files">
        <div v-for="(f, fi) in ((report.fileType === 'copy' && s.id === 's12') ? s.files.filter(f => f.name.includes('Word')) : s.files)" :key="fi" class="msg-file-card">
          <div class="msg-file-icon" :style="{ background: f.color }">{{ f.name.split('.')[1].toUpperCase().slice(0, 2) }}</div>
          <div class="msg-file-info">
            <div class="msg-file-name">{{ f.name }}</div>
            <div class="msg-file-meta">{{ f.size }}</div>
          </div>
          <button class="btn btn-secondary" @click="emit('toast', '演示：下载 ' + f.name, 'success')">下载</button>
        </div>
      </div>

      <!-- columns table -->
      <table v-else-if="s.columns" class="report-mini-table">
        <thead><tr><th v-for="c in s.columns" :key="c">{{ c }}</th></tr></thead>
        <tbody>
          <tr v-for="(row, ri) in s.rows" :key="ri">
            <td v-for="(c, ci) in row" :key="ci">{{ c }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="s.insight" class="insight-box">
        <div class="insight-title">✨ AI 洞察</div>
        <div class="insight-text">{{ s.insight }}</div>
      </div>
    </div>
  </div>
  <div v-else class="empty-state">报告不存在</div>
</template>
