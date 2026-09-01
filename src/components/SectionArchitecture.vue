<template>
  <section id="architecture" class="section">
    <div class="section-header">
      <span class="section-tag">架构总览</span>
      <h2 class="section-title">"1主 + 3子" 智能体集群架构</h2>
      <p class="section-desc">三个子智能体既可独立运作，也可在主智能体调度下串联协作，覆盖从"市场扫描→竞争定位→用户洞察→产品特征分析→产品概念生成"的完整产品策划工作流。</p>
    </div>

    <!-- Architecture Diagram -->
    <div class="subsection-title">架构拓扑图</div>
    <div class="workflow-canvas">
      <svg class="workflow-svg" viewBox="0 0 800 520" style="width: 100%; max-width: 800px; margin: 0 auto;">
        <defs>
          <marker id="archArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,3 L0,6 Z" fill="#98A2B3" />
          </marker>
          <marker id="archArrowMain" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,3 L0,6 Z" fill="#155EEF" />
          </marker>
          <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#EFF4FF" />
            <stop offset="100%" stop-color="#DBE7FF" />
          </linearGradient>
        </defs>

        <!-- Connecting lines -->
        <!-- Main to Sub1 (down-left) -->
        <path d="M 320 210 C 260 250, 220 270, 200 290" stroke="#98A2B3" stroke-width="2" fill="none" stroke-dasharray="6 4" marker-end="url(#archArrow)" />
        <!-- Sub1 to Sub2 -->
        <path d="M 200 380 C 200 410, 260 410, 300 400" stroke="#98A2B3" stroke-width="2" fill="none" stroke-dasharray="6 4" marker-end="url(#archArrow)" />
        <!-- Sub2 to Sub3 -->
        <path d="M 500 400 C 540 410, 600 410, 600 380" stroke="#98A2B3" stroke-width="2" fill="none" stroke-dasharray="6 4" marker-end="url(#archArrow)" />
        <!-- Sub3 back to Main -->
        <path d="M 680 290 C 680 250, 560 220, 480 200" stroke="#155EEF" stroke-width="2.5" fill="none" marker-end="url(#archArrowMain)" />

        <!-- User input -->
        <g>
          <rect x="340" y="30" width="120" height="50" rx="10" fill="#FFFFFF" stroke="#EAECF0" stroke-width="1.5" />
          <circle cx="365" cy="55" r="10" fill="#F2F4F7" />
          <text x="365" y="59" text-anchor="middle" font-size="11" fill="#475467" font-weight="600">U</text>
          <text x="385" y="52" font-size="12" fill="#101828" font-weight="600">用户输入</text>
          <text x="385" y="66" font-size="10" fill="#98A2B3">选项卡点选</text>
        </g>
        <!-- Arrow user -> main -->
        <path d="M 400 80 L 400 115" stroke="#155EEF" stroke-width="2.5" fill="none" marker-end="url(#archArrowMain)" />

        <!-- Main Agent (center top) -->
        <g>
          <rect x="280" y="120" width="240" height="90" rx="14" fill="url(#mainGrad)" stroke="#155EEF" stroke-width="2.5" />
          <rect x="280" y="120" width="240" height="90" rx="14" fill="none" stroke="#155EEF" stroke-width="2.5" />
          <circle cx="310" cy="150" r="16" fill="#155EEF" />
          <text x="310" y="155" text-anchor="middle" font-size="13" fill="white" font-weight="700">M</text>
          <text x="335" y="148" font-size="13" fill="#101828" font-weight="700">主智能体</text>
          <text x="335" y="164" font-size="10" fill="#475467">整车产品概念生成</text>
          <text x="335" y="182" font-size="9" fill="#98A2B3">调度 · 策略确认 · 概念生成 · 导出</text>
        </g>

        <!-- Sub Agent 1 (bottom left) -->
        <g>
          <rect x="80" y="290" width="220" height="90" rx="14" fill="#FFF4ED" stroke="#E3440D" stroke-width="2" />
          <circle cx="110" cy="320" r="16" fill="#E3440D" />
          <text x="110" y="325" text-anchor="middle" font-size="13" fill="white" font-weight="700">1</text>
          <text x="135" y="318" font-size="12" fill="#101828" font-weight="700">子智能体一</text>
          <text x="135" y="333" font-size="9" fill="#475467">竞争圈及价格带变化分析</text>
          <text x="135" y="350" font-size="9" fill="#98A2B3">市场扫描 · 竞争格局 · 竞品筛选</text>
          <text x="135" y="365" font-size="9" fill="#98A2B3">竞争圈确定</text>
        </g>

        <!-- Sub Agent 2 (bottom center) -->
        <g>
          <rect x="300" y="330" width="220" height="90" rx="14" fill="#F4F0FF" stroke="#6938EF" stroke-width="2" />
          <circle cx="330" cy="360" r="16" fill="#6938EF" />
          <text x="330" y="365" text-anchor="middle" font-size="13" fill="white" font-weight="700">2</text>
          <text x="355" y="358" font-size="12" fill="#101828" font-weight="700">子智能体二</text>
          <text x="355" y="373" font-size="9" fill="#475467">用户画像差异分析</text>
          <text x="355" y="390" font-size="9" fill="#98A2B3">画像 · 审美 · 需求交叉 · 映射</text>
        </g>

        <!-- Sub Agent 3 (bottom right) -->
        <g>
          <rect x="560" y="290" width="220" height="90" rx="14" fill="#ECFDF5" stroke="#0BA272" stroke-width="2" />
          <circle cx="590" cy="320" r="16" fill="#0BA272" />
          <text x="590" y="325" text-anchor="middle" font-size="13" fill="white" font-weight="700">3</text>
          <text x="615" y="318" font-size="12" fill="#101828" font-weight="700">子智能体三</text>
          <text x="615" y="333" font-size="9" fill="#475467">人群细分与趋势分析</text>
          <text x="615" y="350" font-size="9" fill="#98A2B3">数据采集 · 配置匹配</text>
          <text x="615" y="365" font-size="9" fill="#98A2B3">产品特征总结</text>
        </g>

        <!-- Data flow labels -->
        <text x="250" y="260" font-size="9" fill="#98A2B3" font-style="italic">市场数据传递</text>
        <text x="410" y="435" font-size="9" fill="#98A2B3" font-style="italic">用户洞察传递</text>
        <text x="610" y="435" font-size="9" fill="#98A2B3" font-style="italic">产品特征传递</text>
        <text x="560" y="240" font-size="9" fill="#155EEF" font-style="italic">全部分析结论汇总</text>

        <!-- Legend -->
        <g transform="translate(80, 470)">
          <line x1="0" y1="0" x2="30" y2="0" stroke="#98A2B3" stroke-width="2" stroke-dasharray="6 4" />
          <text x="36" y="4" font-size="10" fill="#475467">数据传递</text>
          <line x1="120" y1="0" x2="150" y2="0" stroke="#155EEF" stroke-width="2.5" />
          <text x="156" y="4" font-size="10" fill="#475467">结论汇总</text>
        </g>
      </svg>
    </div>

    <div class="callout callout-info" style="margin-top: var(--sp-4);">
      <SvgIcon name="info" :size="20" class="callout-icon" />
      <div class="callout-body">
        <strong>调度顺序</strong>
        严格按"市场扫描→竞争定位→用户洞察→产品特征分析→竞争策略确认→概念生成"的顺序执行。子智能体一输出自动作为子智能体二和三的输入；子智能体二和三的输出自动作为主智能体概念生成的输入。
      </div>
    </div>

    <!-- Agent Cards -->
    <div class="subsection-title">智能体详情</div>
    <div class="card-grid card-grid-2" style="margin-top: var(--sp-4);">
      <div
        v-for="agent in agents"
        :key="agent.id"
        class="agent-node"
        :class="`agent-node-${agent.color}`"
        style="grid-column: span 2;"
      >
        <div class="agent-node-header">
          <div class="agent-node-icon">{{ agent.icon }}</div>
          <div>
            <div class="agent-node-title">{{ agent.name }}</div>
            <div class="agent-node-role">{{ agent.role }} · {{ agent.code }}</div>
          </div>
        </div>
        <div class="agent-node-body">{{ agent.desc }}</div>
        <div class="agent-node-functions">
          <span v-for="fn in agent.functions" :key="fn" class="tag">{{ fn }}</span>
        </div>
      </div>
    </div>

    <!-- Business Process -->
    <div class="subsection-title">全局业务流程</div>
    <div class="card" style="margin-top: var(--sp-4);">
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--sp-2); font-size: var(--fs-sm);">
        <template v-for="(step, i) in processSteps" :key="i">
          <span class="badge" :class="processBadge(step.type)">{{ step.label }}</span>
          <span v-if="i < processSteps.length - 1" style="color: var(--c-text-muted);">→</span>
        </template>
      </div>
    </div>

    <!-- IT Systems -->
    <div class="subsection-title">IT系统现行状况</div>
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>系统名称</th>
            <th>现状</th>
            <th>集成方式</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sys in itSystems" :key="sys.name">
            <td class="font-semibold">{{ sys.name }}</td>
            <td>{{ sys.status }}</td>
            <td><span class="badge badge-gray">{{ sys.integration }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Roles -->
    <div class="subsection-title">组织机构与职能</div>
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th style="width: 220px;">角色</th>
            <th>职能</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.role">
            <td class="font-semibold">{{ role.role }}</td>
            <td>{{ role.duty }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { agents } from '../data.js'
import SvgIcon from '../SvgIcon.vue'

const processSteps = [
  { label: '用户输入初步需求', type: 'amber' },
  { label: '市场机会扫描', type: 'orange' },
  { label: '竞争定位与目标市场锁定', type: 'orange' },
  { label: '用户画像与需求洞察', type: 'purple' },
  { label: '产品特征深度对标分析', type: 'green' },
  { label: '竞争策略人工确认', type: 'amber' },
  { label: '产品概念整合生成', type: 'blue' },
  { label: '人工审核修订', type: 'gray' },
  { label: '最终方案输出', type: 'blue' },
]

const itSystems = [
  { name: 'DDM', status: '采购数据源', integration: '接口' },
  { name: 'IChangan', status: '知识库', integration: '接口' },
  { name: '供应商系统', status: '数据源', integration: '接口' },
  { name: '懂车帝', status: '外部车型配置与用户数据源', integration: 'API采集' },
  { name: '汽车之家', status: '外部车型配置与用户数据源', integration: 'API采集' },
  { name: '工信部装备工业发展中心', status: '公告数据源', integration: 'API采集' },
]

const roles = [
  { role: '产品定义副总师/产品策划人员', duty: '负责分析条件设定、数据复核修正、竞争策略人工确认、产品概念方案的最终确认' },
  { role: '其他预期读者', duty: '产品规划专员、部门领导、各细分市场部门，主要作为分析报告及数据的查看和使用方' },
  { role: '系统管理员', duty: '权限管理、数据源配置、系统维护' },
  { role: '数据管理员', duty: '数据标准维护、数据质量监控' },
]

function processBadge(type) {
  const map = { orange: 'badge-orange', purple: 'badge-purple', green: 'badge-green', blue: 'badge-blue', amber: 'badge-amber', gray: 'badge-gray' }
  return map[type] || 'badge-gray'
}
</script>
