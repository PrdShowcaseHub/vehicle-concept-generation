<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <div class="sidebar-logo">P</div>
        <div>
          <div class="sidebar-title">整车产品概念生成</div>
          <div class="sidebar-subtitle">智能体开发指导文件</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div v-for="group in navGroups" :key="group.title" class="nav-section">
          <div class="nav-section-title">{{ group.title }}</div>
          <div
            v-for="item in group.items"
            :key="item.id"
            class="nav-item"
            :class="{ active: activeSection === item.id }"
            @click="scrollToSection(item.id)"
          >
            <SvgIcon :name="item.icon" :size="16" />
            <span>{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          </div>
        </div>
        <div style="padding: var(--sp-4) var(--sp-3); margin-top: auto;">
          <div style="font-size: 11px; color: var(--c-text-muted); text-align: center;">
            IT2026PS3057 · v1.0
          </div>
        </div>
      </nav>
    </aside>

    <div class="backdrop" :class="{ show: sidebarOpen }" @click="sidebarOpen = false"></div>

    <!-- Main content -->
    <main class="main">
      <header class="content-header">
        <button class="menu-toggle" @click="sidebarOpen = !sidebarOpen">
          <SvgIcon :name="sidebarOpen ? 'close' : 'menu'" :size="20" />
        </button>
        <div class="content-header-title">{{ currentTitle }}</div>
        <div class="content-header-meta">
          <span class="header-badge">需求 v1.0</span>
        </div>
      </header>
      <div class="content-body wide">
        <SectionIntro id="intro" ref="intro" />
        <SectionArchitecture id="architecture" />
        <SectionWorkflow id="workflow" />
        <SectionAgents id="agents" />
        <SectionSimulation id="simulation" />
        <SectionDebugger id="debugger" />
        <SectionExport id="export" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { navGroups } from './data.js'
import SvgIcon from './SvgIcon.vue'
import SectionIntro from './components/SectionIntro.vue'
import SectionArchitecture from './components/SectionArchitecture.vue'
import SectionWorkflow from './components/SectionWorkflow.vue'
import SectionAgents from './components/SectionAgents.vue'
import SectionSimulation from './components/SectionSimulation.vue'
import SectionDebugger from './components/SectionDebugger.vue'
import SectionExport from './components/SectionExport.vue'

const sidebarOpen = ref(false)
const activeSection = ref('intro')

const titleMap = {}
navGroups.forEach(g => g.items.forEach(i => { titleMap[i.id] = i.label }))

const currentTitle = computed(() => titleMap[activeSection.value] || '整车产品概念生成')

function scrollToSection(id) {
  activeSection.value = id
  sidebarOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 70
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

let observer = null
onMounted(() => {
  const sections = ['intro', 'architecture', 'workflow', 'agents', 'simulation', 'debugger', 'export']
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
          activeSection.value = entry.target.id
        }
      })
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: [0, 0.15, 0.5] }
  )
  sections.forEach(id => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>
