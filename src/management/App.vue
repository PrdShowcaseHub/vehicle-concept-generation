<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockReports } from './data.js'
import Workbench from './components/Workbench.vue'
import ReportCenter from './components/ReportCenter.vue'
import ReportDetail from './components/ReportDetail.vue'
import AuditCenter from './components/AuditCenter.vue'
import VolumePrice from './components/VolumePrice.vue'
import EquipRate from './components/EquipRate.vue'
import CodeMapping from './components/CodeMapping.vue'
import ConfigCombo from './components/ConfigCombo.vue'
import LacuDefine from './components/LacuDefine.vue'

// ============== Root State ==============
const currentSection = ref('workbench')
const role = ref('admin')
const toasts = ref([])
const reportDetailId = ref(null)        // 报告中心：查看详情
const pendingAuditReportId = ref(null)  // 工作台生成后跳转审核并打开

const titles = {
  workbench: '工作台',
  audit: '审核中心',
  reports: '报告中心',
  vp: '量价管理',
  equip: '装备率分析',
  codemap: '二段码映射',
  combo: '配置组合方案',
  lacu: 'LACU定义',
}
const pageTitle = computed(() => titles[currentSection.value] || '')
const groups = {
  workbench: '产品概念报告', audit: '产品概念报告', reports: '产品概念报告',
  vp: '配置管理', equip: '配置管理', codemap: '配置管理',
  combo: '产品定义', lacu: '产品定义',
}
const breadcrumb = computed(() => {
  const g = groups[currentSection.value]
  return '整车产品概念管理平台 / ' + (g ? g + ' / ' : '') + (titles[currentSection.value] || '')
})
const auditBadge = computed(() => mockReports.length)
const reportsBadge = computed(() => mockReports.filter(r => r.status === 'published').length)

// ============== Toast ==============
let toastSeq = 0
function toast(text, type = 'default') {
  const id = ++toastSeq
  toasts.value.push({ id, text, type })
  setTimeout(() => {
    toasts.value = toasts.value = toasts.value.filter(t => t.id !== id)
  }, 2500)
}

// ============== Router ==============
function switchSection(section) {
  currentSection.value = section
  if (section !== 'reports') reportDetailId.value = null
}

function openReport(id) {
  reportDetailId.value = id
}

function backToReports() {
  reportDetailId.value = null
}

function goAudit(reportId) {
  pendingAuditReportId.value = reportId
  currentSection.value = 'audit'
}

onMounted(() => {
  switchSection('workbench')
})
</script>

<template>
  <div class="app">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">P</div>
        <div>
          <div class="sidebar-title">整车产品概念管理平台</div>
          <div class="sidebar-subtitle">管理 · 审核 · 发布</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-group-label">产品概念报告</div>
        <button
          class="nav-item"
          :class="{ active: currentSection === 'workbench' }"
          @click="switchSection('workbench')"
        >
          <span class="nav-icon">⚡</span>
          <span>工作台</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: currentSection === 'audit' }"
          @click="switchSection('audit')"
        >
          <span class="nav-icon">🔍</span>
          <span>审核中心</span>
          <span class="nav-badge">{{ auditBadge }}</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: currentSection === 'reports' }"
          @click="switchSection('reports')"
        >
          <span class="nav-icon">📊</span>
          <span>报告中心</span>
          <span class="nav-badge">{{ reportsBadge }}</span>
        </button>

        <div class="nav-group-label">配置管理</div>
        <button
          class="nav-item"
          :class="{ active: currentSection === 'vp' }"
          @click="switchSection('vp')"
        >
          <span class="nav-icon">📒</span>
          <span>量价管理</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: currentSection === 'equip' }"
          @click="switchSection('equip')"
        >
          <span class="nav-icon">📈</span>
          <span>装备率分析</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: currentSection === 'codemap' }"
          @click="switchSection('codemap')"
        >
          <span class="nav-icon">🔗</span>
          <span>二段码映射</span>
        </button>

        <div class="nav-group-label">产品定义</div>
        <button
          class="nav-item"
          :class="{ active: currentSection === 'combo' }"
          @click="switchSection('combo')"
        >
          <span class="nav-icon">🧩</span>
          <span>配置组合方案</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: currentSection === 'lacu' }"
          @click="switchSection('lacu')"
        >
          <span class="nav-icon">🎯</span>
          <span>LACU定义</span>
        </button>

        <div class="nav-group-label">其他</div>
        <button class="nav-item" @click="toast('演示版本，暂未开放', 'warning')">
          <span class="nav-icon">⚙️</span>
          <span>系统设置</span>
        </button>
        <button class="nav-item" @click="toast('演示版本，暂未开放', 'warning')">
          <span class="nav-icon">👥</span>
          <span>权限管理</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        v1.0 · 演示版 · 2026.08
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <header class="header">
        <div>
          <div class="header-breadcrumb">{{ breadcrumb }}</div>
          <div class="header-title">{{ pageTitle }}</div>
        </div>
        <div class="header-actions">
          <div class="role-switch">
            <span>当前角色</span>
            <select v-model="role">
              <option value="admin">管理员</option>
              <option value="reviewer">审核员</option>
              <option value="viewer">查看员</option>
            </select>
          </div>
          <div class="user-chip">
            <div class="user-avatar">规</div>
            <span class="user-name">规划部 · 张明</span>
          </div>
        </div>
      </header>

      <div class="content">
        <!-- 工作台 -->
        <Workbench
          v-if="currentSection === 'workbench'"
          :role="role"
          @toast="toast"
          @go-audit="goAudit"
        />

        <!-- 报告中心：列表 -->
        <ReportCenter
          v-else-if="currentSection === 'reports' && !reportDetailId"
          :role="role"
          @toast="toast"
          @open-report="openReport"
        />

        <!-- 报告中心：详情 -->
        <ReportDetail
          v-else-if="currentSection === 'reports' && reportDetailId"
          :role="role"
          :report-id="reportDetailId"
          @toast="toast"
          @back="backToReports"
        />

        <!-- 审核中心 -->
        <AuditCenter
          v-else-if="currentSection === 'audit'"
          :role="role"
          :initial-report-id="pendingAuditReportId"
          @toast="toast"
        />

        <!-- 量价管理 -->
        <VolumePrice
          v-else-if="currentSection === 'vp'"
          @toast="toast"
        />

        <!-- 装备率分析 -->
        <EquipRate
          v-else-if="currentSection === 'equip'"
          @toast="toast"
        />

        <!-- 二段码映射 -->
        <CodeMapping
          v-else-if="currentSection === 'codemap'"
          @toast="toast"
        />

        <!-- 配置组合方案 -->
        <ConfigCombo
          v-else-if="currentSection === 'combo'"
          @toast="toast"
        />

        <!-- LACU定义 -->
        <LacuDefine
          v-else-if="currentSection === 'lacu'"
          @toast="toast"
        />
      </div>
    </main>
  </div>

  <!-- Toast Container -->
  <div class="toast-container">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="t.type"
    >
      {{ t.text }}
    </div>
  </div>
</template>
