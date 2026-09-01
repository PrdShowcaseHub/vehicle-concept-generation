<template>
  <section id="intro" class="section">
    <!-- Hero -->
    <div class="hero">
      <span class="hero-tag">智能体开发指导文件</span>
      <h1 class="hero-title">整车产品概念生成</h1>
      <p class="hero-desc">
        采用"1个主智能体 + 3个子智能体"的集群架构，实现从"市场扫描→竞争定位→用户洞察→产品特征分析→产品概念生成"的产品策划全链路智能化升级。
      </p>
      <div class="hero-stats">
        <div>
          <div class="hero-stat-num">1+3</div>
          <div class="hero-stat-label">智能体集群</div>
        </div>
        <div>
          <div class="hero-stat-num">11</div>
          <div class="hero-stat-label">子场景</div>
        </div>
        <div>
          <div class="hero-stat-num">5</div>
          <div class="hero-stat-label">策划链路阶段</div>
        </div>
        <div>
          <div class="hero-stat-num">6</div>
          <div class="hero-stat-label">数据源接入</div>
        </div>
      </div>
    </div>

    <!-- Pain Points -->
    <div class="subsection-title">项目背景：五大痛点</div>
    <p class="lead">产品策划全链路长期依赖人工经验，以下五个阶段存在显著效率瓶颈，亟需通过AI智能体实现智能化升级。</p>
    <div class="card-grid" style="margin-top: var(--sp-5);">
      <div v-for="(point, i) in introData.painPoints" :key="i" class="feature-card">
        <div class="feature-card-icon" :style="painIconStyle(i)">{{ i + 1 }}</div>
        <div class="feature-card-title">{{ point.phase }}</div>
        <div class="feature-card-desc">{{ point.desc }}</div>
      </div>
    </div>

    <!-- Goal -->
    <div class="subsection-title">项目目标</div>
    <div class="callout callout-info">
      <SvgIcon name="target" :size="20" class="callout-icon" />
      <div class="callout-body">
        <strong>构建"1个主智能体 + 3个子智能体"的智能体集群架构</strong>
        实现产品策划全链路的智能化升级，覆盖以下11个子场景：
      </div>
    </div>
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">序号</th>
            <th>子场景</th>
            <th>对应子智能体</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(scene, i) in scenes" :key="i">
            <td class="num">{{ i + 1 }}</td>
            <td>{{ scene.name }}</td>
            <td>
              <span class="badge" :class="agentBadge(scene.agent)">{{ scene.agentName }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Scope -->
    <div class="subsection-title">项目范围</div>
    <div class="card-grid card-grid-3">
      <div class="card">
        <div class="detail-label">面向用户</div>
        <p style="margin-top: var(--sp-2);">{{ introData.scope.users }}</p>
      </div>
      <div class="card">
        <div class="detail-label">产品范畴</div>
        <p style="margin-top: var(--sp-2);">{{ introData.scope.products }}</p>
      </div>
      <div class="card">
        <div class="detail-label">交互方式</div>
        <p style="margin-top: var(--sp-2);">{{ introData.scope.interaction }}</p>
      </div>
    </div>

    <!-- Terminology -->
    <div class="subsection-title">术语解释</div>
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th style="width: 200px;">术语</th>
            <th>解释及计算规则</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="term in introData.terminology" :key="term.term">
            <td><span class="font-mono font-semibold">{{ term.term }}</span></td>
            <td>{{ term.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { introData } from '../data.js'
import SvgIcon from '../SvgIcon.vue'

const scenes = [
  { name: '细分市场（分价格）规模走势预判', agent: 'orange', agentName: '竞争圈及价格带变化智能分析助手' },
  { name: '细分市场竞争趋势分析（含竞争圈确定）', agent: 'orange', agentName: '竞争圈及价格带变化智能分析助手' },
  { name: '竞品选择', agent: 'orange', agentName: '竞争圈及价格带变化智能分析助手' },
  { name: '多源数据采集与配置匹配', agent: 'green', agentName: '人群细分与趋势分析助手' },
  { name: '目标市场产品特征（含竞品特征）总结', agent: 'green', agentName: '人群细分与趋势分析助手' },
  { name: '目标用户特征', agent: 'purple', agentName: '用户画像差异智能分析助手' },
  { name: '目标用户审美偏好', agent: 'purple', agentName: '用户画像差异智能分析助手' },
  { name: '目标用户需求', agent: 'purple', agentName: '用户画像差异智能分析助手' },
  { name: '竞争策略', agent: 'amber', agentName: '主智能体（用户干预点）' },
  { name: '生成产品概念', agent: 'blue', agentName: '主智能体' },
]

function painIconStyle(i) {
  const colors = ['#D92D20', '#DC6803', '#6938EF', '#0BA272', '#155EEF']
  const bgs = ['#FEF3F2', '#FFFAEB', '#F4F0FF', '#ECFDF5', '#EFF4FF']
  return `background: ${bgs[i]}; color: ${colors[i]};`
}

function agentBadge(agent) {
  const map = { orange: 'badge-orange', green: 'badge-green', purple: 'badge-purple', blue: 'badge-blue', amber: 'badge-amber' }
  return map[agent] || 'badge-gray'
}
</script>
