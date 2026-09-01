<template>
  <section id="agents" class="section">
    <div class="section-header">
      <span class="section-tag">智能体编排</span>
      <h2 class="section-title">智能体配置</h2>
      <p class="section-desc">每个智能体由若干功能节点组成，每个节点定义了输入方式、业务规则与输出规范。切换标签页查看不同智能体的节点配置详情。</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <div
        v-for="agent in agentList"
        :key="agent.key"
        class="tab"
        :class="{ active: activeTab === agent.key }"
        @click="activeTab = agent.key"
      >
        {{ agent.role }}
      </div>
    </div>

    <!-- Agent header -->
    <div class="agent-node" :class="`agent-node-${currentAgent.color}`" style="margin-bottom: var(--sp-6);">
      <div class="agent-node-header">
        <div class="agent-node-icon">{{ currentAgent.icon }}</div>
        <div>
          <div class="agent-node-title">{{ currentAgent.title }}</div>
          <div class="agent-node-role">{{ currentAgent.role }} · {{ currentAgent.nodes.length }} 个功能节点</div>
        </div>
      </div>
    </div>

    <!-- Nodes -->
    <div v-for="(node, i) in currentAgent.nodes" :key="node.id" style="margin-bottom: var(--sp-6);">
      <div class="detail-panel">
        <div class="detail-panel-header">
          <div style="display: flex; align-items: center; gap: var(--sp-3); flex: 1;">
            <div class="step-num" :style="`background: ${nodeColor}; color: white;`">{{ i + 1 }}</div>
            <div style="flex: 1;">
              <div class="detail-panel-title">{{ node.name }}</div>
              <div class="detail-panel-id">{{ node.id }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">功能描述</div>
          <p>{{ node.desc }}</p>
        </div>

        <div class="detail-section">
          <div class="detail-label">业务规则</div>
          <div class="rule-list">
            <div v-for="(rule, ri) in node.rules" :key="ri" class="rule-item">
              {{ rule }}
            </div>
          </div>
        </div>

        <!-- Special: Input interaction config mockup -->
        <div v-if="node.id === 'SPC-PROD-001'" style="margin-top: var(--sp-5);">
          <div class="detail-label">配置界面预览</div>
          <div class="config-mockup">
            <div class="config-mockup-header">
              <span class="config-mockup-dot" style="background: #FF5F57;"></span>
              <span class="config-mockup-dot" style="background: #FEBC2E;"></span>
              <span class="config-mockup-dot" style="background: #28C840;"></span>
              <span style="margin-left: var(--sp-2); font-size: var(--fs-xs); color: var(--c-text-muted);">智能体输入交互 · 选项卡点选</span>
            </div>
            <div class="config-mockup-body">
              <div class="config-field">
                <div class="config-field-label">细分大类 <span style="color: var(--c-danger);">*</span> <span class="text-xs text-muted">（多选）</span></div>
                <div class="config-chip-group">
                  <span class="config-chip selected">紧凑型轿车</span>
                  <span class="config-chip">中型轿车</span>
                  <span class="config-chip selected">紧凑型SUV</span>
                  <span class="config-chip">中型SUV</span>
                  <span class="config-chip">中型MPV</span>
                  <span class="config-chip">大型SUV</span>
                </div>
              </div>
              <div class="config-field">
                <div class="config-field-label">动力类型 <span style="color: var(--c-danger);">*</span> <span class="text-xs text-muted">（多选）</span></div>
                <div class="config-chip-group">
                  <span class="config-chip selected">PHEV</span>
                  <span class="config-chip">EV</span>
                  <span class="config-chip">HEV</span>
                  <span class="config-chip">ICE</span>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4);">
                <div class="config-field">
                  <div class="config-field-label">价格区间下限（元）</div>
                  <div class="config-input-mock">60,000</div>
                </div>
                <div class="config-field">
                  <div class="config-field-label">价格区间上限（元）</div>
                  <div class="config-input-mock">80,000</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4);">
                <div class="config-field">
                  <div class="config-field-label">所属品牌</div>
                  <div class="config-input-mock">启源</div>
                </div>
                <div class="config-field">
                  <div class="config-field-label">上市时间</div>
                  <div class="config-input-mock">2028年</div>
                </div>
              </div>
              <div class="config-field" style="margin-bottom: 0;">
                <div class="config-field-label">手动上传IPV数据</div>
                <div style="border: 2px dashed var(--c-border); border-radius: var(--r-md); padding: var(--sp-4); text-align: center; color: var(--c-text-muted); font-size: var(--fs-sm);">
                  📎 点击或拖拽上传 IPV 数据文件 (.xlsx / .csv)
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Special: Competitor funnel visualization -->
        <div v-if="node.id === 'SPC-MKT-004'" style="margin-top: var(--sp-5);">
          <div class="detail-label">竞品筛选漏斗（四层筛选逻辑）</div>
          <div class="funnel">
            <div v-for="(layer, li) in competitorFunnel" :key="li" class="funnel-stage" :style="`border-left-color: ${funnelColors[li]};`">
              <div class="funnel-stage-num" :style="`background: ${funnelColors[li]};`">{{ li + 1 }}</div>
              <div class="funnel-stage-content">
                <div class="funnel-stage-title">{{ layer.title }}</div>
                <div class="funnel-stage-desc">{{ layer.desc }}</div>
              </div>
            </div>
          </div>
          <div class="callout callout-success" style="margin-top: var(--sp-4);">
            <SvgIcon name="check" :size="20" class="callout-icon" />
            <div class="callout-body">
              <strong>最终输出</strong>
              1个核心竞品 + 0~3个主要竞品 + 1个观察竞品，并注明每款竞品的筛选逻辑。基于筛选出的竞品与目标市场价格区间，自动生成核心竞争圈特征描述。
            </div>
          </div>
        </div>

        <!-- Special: File upload mockup (SPC-USER-000) -->
        <div v-if="node.id === 'SPC-USER-000'" style="margin-top: var(--sp-5);">
          <div class="detail-label">配置界面预览 · 调研文件人工上传</div>
          <div class="config-mockup">
            <div class="config-mockup-header">
              <span class="config-mockup-dot" style="background: #FF5F57;"></span>
              <span class="config-mockup-dot" style="background: #FEBC2E;"></span>
              <span class="config-mockup-dot" style="background: #28C840;"></span>
              <span style="margin-left: var(--sp-2); font-size: var(--fs-xs); color: var(--c-text-muted);">子智能体二前置 · 用户干预节点</span>
            </div>
            <div class="config-mockup-body">

              <!-- 前置确认 -->
              <div style="background: #FFF7ED; border: 1px solid #FDBA74; border-radius: var(--r-md); padding: var(--sp-3) var(--sp-4); margin-bottom: var(--sp-5);">
                <div style="font-weight: 600; color: #9A3412; font-size: var(--fs-sm); margin-bottom: var(--sp-2);">⚠ 前置分析结果确认</div>
                <div style="font-size: var(--fs-xs); color: #7C2D12; margin-bottom: var(--sp-3);">以下为系统已生成的前置分析结果</div>
                <div style="display: flex; flex-direction: column; gap: var(--sp-2); font-size: var(--fs-sm);">
                  <label style="display: flex; align-items: center; gap: var(--sp-2); cursor: pointer;">
                    <input type="checkbox" checked disabled style="width: 16px; height: 16px; accent-color: var(--c-primary);" />
                    <span>竞争格局图（2026年实际 / 2028年预测）</span>
                    <span class="badge badge-green" style="margin-left: auto;">已生成 ✓</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: var(--sp-2); cursor: pointer;">
                    <input type="checkbox" checked disabled style="width: 16px; height: 16px; accent-color: var(--c-primary);" />
                    <span>竞品推荐清单（核心竞品 / 主要竞品 / 观察竞品）</span>
                    <span class="badge badge-green" style="margin-left: auto;">已生成 ✓</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: var(--sp-2); cursor: pointer;">
                    <input type="checkbox" checked disabled style="width: 16px; height: 16px; accent-color: var(--c-primary);" />
                    <span>目标竞争圈确定：入门紧凑产品圈</span>
                    <span class="badge badge-green" style="margin-left: auto;">已确认 ✓</span>
                  </label>
                </div>
                <label style="display: flex; align-items: center; gap: var(--sp-2); cursor: pointer; margin-top: var(--sp-3); padding-top: var(--sp-3); border-top: 1px dashed #FDBA74;">
                  <input type="checkbox" checked disabled style="width: 18px; height: 18px; accent-color: var(--c-primary);" />
                  <span style="font-weight: 600; color: #9A3412;">我已确认上述内容无误，同意进入文件上传环节</span>
                </label>
              </div>

              <!-- 必传文件 -->
              <div class="config-field">
                <div class="config-field-label">
                  <span class="badge badge-danger" style="margin-right: var(--sp-2);">必传</span>
                  项目专项调研文件 <span style="color: var(--c-danger);">*</span>
                </div>
                <div style="font-size: var(--fs-xs); color: var(--c-text-muted); margin-bottom: var(--sp-2);">
                  目标细分市场项目专属调研问卷数据 · 支持格式 .xlsx / .xls / .csv / .pdf · 单文件 ≤ 50MB
                </div>
                <!-- 已上传文件卡 -->
                <div style="display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3); border: 1px solid var(--c-success); background: #F0FDF4; border-radius: var(--r-md);">
                  <div style="width: 40px; height: 40px; background: #10B981; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px;">📊</div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: var(--fs-sm); color: #065F46; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">启源A06_项目专项调研问卷_2026Q3.xlsx</div>
                    <div style="font-size: var(--fs-xs); color: #059669;">32.8 MB · 上传于 2026-08-14 10:32 · 格式校验通过</div>
                  </div>
                  <span class="badge badge-green" style="font-size: var(--fs-xs);">✓ 必传项已完成</span>
                </div>
              </div>

              <!-- 可选文件 -->
              <div class="config-field" style="margin-bottom: 0;">
                <div class="config-field-label">
                  <span class="badge badge-blue" style="margin-right: var(--sp-2);">选填</span>
                  NCBS全国购车者调研
                </div>
                <div style="font-size: var(--fs-xs); color: var(--c-text-muted); margin-bottom: var(--sp-2);">
                  全国购车者基准调研数据，用于画像的行业基准交叉比对 · 支持格式 .xlsx / .xls / .csv · 单文件 ≤ 200MB
                </div>
                <!-- 已上传文件卡 -->
                <div style="display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3); border: 1px solid var(--c-border); background: white; border-radius: var(--r-md);">
                  <div style="width: 40px; height: 40px; background: #3B82F6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px;">📈</div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: var(--fs-sm); color: #1E3A8A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">NCBS_2026_H1_全国购车者调研_v2.xlsx</div>
                    <div style="font-size: var(--fs-xs); color: var(--c-text-secondary);">156.4 MB · 上传于 2026-08-14 10:35 · 格式校验通过</div>
                  </div>
                  <span class="badge badge-blue" style="font-size: var(--fs-xs);">选填项已完成</span>
                </div>
              </div>

              <!-- 启动按钮 -->
              <div style="margin-top: var(--sp-5); padding-top: var(--sp-4); border-top: 1px solid var(--c-border-light); display: flex; align-items: center; justify-content: space-between;">
                <div style="font-size: var(--fs-xs); color: var(--c-text-muted);">✓ 勾选确认已完成 · ✓ 必传文件已上传 · 可启动分析</div>
                <button disabled style="padding: var(--sp-2) var(--sp-5); background: var(--c-primary); color: white; border-radius: var(--r-md); font-weight: 600; font-size: var(--fs-sm); border: none; cursor: pointer; opacity: 0.85;">
                  ▶ 启动用户画像差异智能分析
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Special: Product concept template -->
        <div v-if="node.id === 'SPC-CONC-002'" style="margin-top: var(--sp-5);">
          <div class="detail-label">产品概念建议书 · 固定章节模板</div>
          <div class="code-block" style="font-size: var(--fs-xs);">
<span class="com">// 产品概念建议书模板</span>
<span class="kw">一、</span>产品定义概述
    - 产品名称建议、品牌归属、品类、目标上市年份、产品定位

<span class="kw">二、</span>目标市场与竞争定位
    - 目标价格带、细分市场容量、核心竞品、竞争策略

<span class="kw">三、</span>目标用户画像
    - 用户昵称 + 五维度摘要

<span class="kw">四、</span>产品核心定义
    - 车格尺寸、造型风格、动力形式、主要配置、亮点买点TOP3

<span class="kw">五、</span>成本与定价策略建议

<span class="kw">六、</span>核心风险矩阵
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { agentConfigs } from '../data.js'
import SvgIcon from '../SvgIcon.vue'

const activeTab = ref('sub1')

const agentList = [
  { key: 'sub1', role: '子智能体一' },
  { key: 'sub2', role: '子智能体二' },
  { key: 'sub3', role: '子智能体三' },
  { key: 'main', role: '主智能体' },
]

const iconMap = { sub1: '1', sub2: '2', sub3: '3', main: 'M' }

const currentAgent = computed(() => ({
  ...agentConfigs[activeTab.value],
  icon: iconMap[activeTab.value],
}))

const colorMap = {
  sub1: '#E3440D',
  sub2: '#6938EF',
  sub3: '#0BA272',
  main: '#155EEF',
}

const nodeColor = computed(() => colorMap[activeTab.value])

const competitorFunnel = [
  { title: '产品定位框定竞品边界', desc: '动力标准 + 品类/品种标准 + 价格段标准 + 车格标准（本品车长±150mm）' },
  { title: '销量排名锁定竞品圈', desc: '拉取近6个月月均销量TOP5的产品' },
  { title: '主要竞争品牌优先修正', desc: 'TOP5产品按主要竞争品牌优先、销量次之的原则修正排序' },
  { title: '人群相似性与对比购买修正', desc: '从购车预算、家庭生命周期、购车情形、价值观四个要素进行人群相似性检核' },
]

const funnelColors = ['#E3440D', '#DC6803', '#6938EF', '#155EEF']
</script>
