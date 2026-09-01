<template>
  <section id="export" class="section">
    <div class="section-header">
      <span class="section-tag">报告输出</span>
      <h2 class="section-title">报告导出</h2>
      <p class="section-desc">主智能体支持将产品概念建议书一键导出为PPT和Word格式，同时将全流程的所有中间产物以Excel附件形式打包提供。</p>
    </div>

    <!-- Export Formats -->
    <div class="subsection-title">导出格式</div>
    <div class="card-grid card-grid-3">
      <div v-for="fmt in exportData.formats" :key="fmt.type" class="feature-card" style="text-align: center;">
        <div style="font-size: 36px; margin-bottom: var(--sp-3);">{{ fmt.icon }}</div>
        <div class="feature-card-title">{{ fmt.title }}</div>
        <div class="feature-card-desc" style="margin-top: var(--sp-2);">{{ fmt.desc }}</div>
        <div style="margin-top: var(--sp-4);">
          <span class="badge" :class="`badge-${fmt.color}`">{{ fmt.type }} 格式</span>
        </div>
      </div>
    </div>

    <!-- Export Interface Mockup -->
    <div class="subsection-title">导出界面预览</div>
    <div class="config-mockup">
      <div class="config-mockup-header">
        <span class="config-mockup-dot" style="background: #FF5F57;"></span>
        <span class="config-mockup-dot" style="background: #FEBC2E;"></span>
        <span class="config-mockup-dot" style="background: #28C840;"></span>
        <span style="margin-left: var(--sp-2); font-size: var(--fs-xs); color: var(--c-text-muted);">产品概念建议书 · 导出</span>
      </div>
      <div class="config-mockup-body">
        <div style="text-align: center; margin-bottom: var(--sp-5);">
          <div style="font-size: var(--fs-lg); font-weight: 600; margin-bottom: var(--sp-1);">长安启源 · 6-8万紧凑型智能电混轿车（2028年款）</div>
          <div class="text-sm text-muted">产品概念建议书已生成完成，请选择导出格式</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4); margin-bottom: var(--sp-5);">
          <div v-for="fmt in exportData.formats" :key="fmt.type"
               style="border: 2px solid var(--c-border); border-radius: var(--r-lg); padding: var(--sp-4); text-align: center; cursor: pointer; transition: var(--transition);"
               :style="selectedFormat === fmt.type ? `border-color: var(--c-${fmt.color === 'orange' ? 'sub1' : fmt.color === 'blue' ? 'primary' : 'sub3'}); background: var(--c-${fmt.color === 'orange' ? 'sub1' : fmt.color === 'blue' ? 'primary' : 'sub3'}-bg);` : ''"
               @click="selectedFormat = fmt.type">
            <div style="font-size: 28px; margin-bottom: var(--sp-2);">{{ fmt.icon }}</div>
            <div class="font-semibold text-sm">{{ fmt.type }}</div>
          </div>
        </div>

        <div style="background: var(--c-bg); border-radius: var(--r-md); padding: var(--sp-4); margin-bottom: var(--sp-4);">
          <div class="detail-label" style="margin-bottom: var(--sp-3);">导出内容清单</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-2);">
            <div v-for="item in exportChecklist" :key="item" style="display: flex; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--c-text-secondary);">
              <SvgIcon name="check" :size="14" style="color: var(--c-success); flex-shrink: 0;" />
              {{ item }}
            </div>
          </div>
        </div>

        <div style="display: flex; gap: var(--sp-3);">
          <button style="flex: 1; padding: var(--sp-3); border-radius: var(--r-md); background: var(--c-primary); color: white; font-weight: 600; font-size: var(--fs-sm); transition: var(--transition);"
                  @click="exportStatus = 'exporting'; setTimeout(() => exportStatus = 'done', 1500)">
            <span v-if="exportStatus === 'idle'">📥 一键导出（{{ selectedFormat }}）</span>
            <span v-if="exportStatus === 'exporting'">⏳ 正在生成报告...</span>
            <span v-if="exportStatus === 'done'">✅ 导出成功！</span>
          </button>
          <button style="padding: var(--sp-3) var(--sp-5); border-radius: var(--r-md); border: 1px solid var(--c-border); color: var(--c-text-secondary); font-size: var(--fs-sm);"
                  @click="exportStatus = 'idle'">
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- Requirements Info -->
    <div class="subsection-title">非功能性需求与安全规范</div>
    <div class="card-grid card-grid-2">
      <div class="card">
        <div class="detail-label">可靠性</div>
        <p style="margin-top: var(--sp-2);">系统应具备高可用性，支持7×24小时稳定运行，单点故障不影响整体服务。关键数据查询链路需设计容错与重试机制，确保在数据源波动或接口超时场景下能降级返回缓存或明确提示。</p>
      </div>
      <div class="card">
        <div class="detail-label">易用性</div>
        <p style="margin-top: var(--sp-2);">提供自然语言交互界面，支持模糊匹配与同义词自动识别。操作指引清晰，用户无需培训即可上手使用。</p>
      </div>
      <div class="card">
        <div class="detail-label">安全需求</div>
        <p style="margin-top: var(--sp-2);">符合《长安汽车AI大模型安全管理办法》等安全规范，数据访问控制方面严格控制数据的访问权限，只有授权用户才能访问和操作数据。</p>
      </div>
      <div class="card">
        <div class="detail-label">接口需求</div>
        <p style="margin-top: var(--sp-2);">接口协议必须是http或https，必须是restful风格，接口数据量大小低于10M。接口路径命名、版本控制、接口注册管理流程具体参照规范执行。</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: var(--sp-12); padding: var(--sp-6); background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-xl); text-align: center;">
      <div style="font-size: var(--fs-lg); font-weight: 600; margin-bottom: var(--sp-2);">整车产品概念生成 · 智能体开发指导文件</div>
      <p class="text-sm text-muted" style="margin: 0;">项目编号：IT2026PS3057 · 版本：1.0 · 2026年08月14日</p>
      <p class="text-xs text-muted" style="margin-top: var(--sp-2);">本教程基于需求分析文档制作，涵盖"1主智能体+3子智能体"集群架构的完整使用指南</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { exportData } from '../data.js'
import SvgIcon from '../SvgIcon.vue'

const selectedFormat = ref('PPT')
const exportStatus = ref('idle')

const exportChecklist = [
  '产品定义概述',
  '目标市场与竞争定位',
  '目标用户画像',
  '产品核心定义',
  '成本与定价策略建议',
  '核心风险矩阵',
  '价格细分市场排名表',
  '竞争格局数据表',
  '竞品推荐清单',
  '用户需求交叉矩阵',
  '需求→配置映射表',
  '竞品配置对标明细表',
]
</script>
