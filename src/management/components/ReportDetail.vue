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

    <!-- 产品概念书（整合全部内容的最终报告） -->
    <div v-html="renderConceptReport(report)"></div>
  </div>
  <div v-else class="empty-state">报告不存在</div>
</template>
