<template>
  <section :id="props.id" class="section" style="background: var(--c-bg-subtle);">
    <div class="section-header">
      <h2 class="section-title">调试工作台</h2>
      <p class="section-desc">
        还原编排页的调试体验。左 / 中栏为线框占位，重点查看最右侧调试聊天窗口：设置边界 → 上传 IPV 数据 → 对话触发 → 自动执行并显示智能体调用日志。
      </p>
    </div>

    <!-- Three-column layout: 左边栏线框 | 中间画布线框 | 右侧重点调试框 -->
    <div class="debugger-shell">
      <!-- Left: sidebar wireframe -->
      <aside class="wire wire-left">
        <div class="wire-title">工作台菜单（线框）</div>
        <div class="wire-row wire-row-sm"></div>
        <div class="wire-row wire-row-sm"></div>
        <div class="wire-row wire-row-sm wire-active"></div>
        <div class="wire-row wire-row-sm"></div>
        <div class="wire-divider"></div>
        <div class="wire-row"></div>
        <div class="wire-row wire-row-sm"></div>
        <div class="wire-row wire-row-sm"></div>
        <div class="wire-divider"></div>
        <div class="wire-row"></div>
        <div class="wire-row wire-row-sm"></div>
      </aside>

      <!-- Middle: canvas wireframe -->
      <main class="wire wire-center">
        <div class="wire-canvas-header">
          <div class="wire-chip"></div>
          <div class="wire-chip wire-chip-long"></div>
          <div style="margin-left: auto;" class="wire-chip"></div>
          <div class="wire-chip wire-chip-primary">▶ 预览 / 调试</div>
        </div>
        <div class="wire-canvas-body">
          <!-- Three fake nodes connected -->
          <div class="wire-node">NODE 1</div>
          <div class="wire-line"></div>
          <div class="wire-node">NODE 2</div>
          <div class="wire-line"></div>
          <div class="wire-node wire-node-accent">NODE N</div>
        </div>
        <div class="wire-canvas-footer">
          <div class="wire-chip wire-chip-sm"></div>
          <div class="wire-chip wire-chip-sm"></div>
        </div>
      </main>

      <!-- RIGHT: Debug Chat Panel (FOCUS) -->
      <aside class="debug-panel" ref="panelEl">
        <div class="debug-panel-header">
          <div class="debug-panel-title">
            <span style="font-weight: 700;">调试 · 会话</span>
            <span class="debug-panel-sub">整车产品概念生成</span>
          </div>
          <button class="debug-reset" @click="resetRun" title="重新开始一轮">↻ 重置</button>
        </div>

        <!-- Message stream -->
        <div class="debug-stream" ref="streamEl">
          <div v-for="(m, i) in messages" :key="i" class="msg-row" :class="`msg-${m.role}`">
            <!-- Thinking / agent call log -->
            <div v-if="m.type === 'think'" class="msg-think">
              <div class="msg-think-title">
                <span class="dot-flash"></span>
                调用智能体 · <strong>{{ m.agent }}</strong>
              </div>
              <div class="msg-think-grid">
                <div><span class="msg-think-k">工作流</span><span class="msg-think-v">{{ m.workflow }}</span></div>
                <div><span class="msg-think-k">耗时</span><span class="msg-think-v">{{ m.time }}</span></div>
                <div><span class="msg-think-k">使用 Token</span><span class="msg-think-v">{{ m.token }}</span></div>
                <div><span class="msg-think-k">场景</span><span class="msg-think-v">{{ m.node }}</span></div>
              </div>
            </div>

            <!-- Step result: rendered as natural assistant message with conclusion -->
            <div v-else-if="m.type === 'step'" class="msg-step-wrap">
              <div class="msg-step-label">
                <span class="msg-step-label-dot"></span>
                <span class="msg-step-label-text"><strong>{{ m.stepName }}</strong> 完成 · 生成结论如下：</span>
              </div>
              <div class="msg-step-conclusion" v-html="m.html"></div>
            </div>

            <!-- User message bubble -->
            <div v-else-if="m.type === 'user'" class="msg-user-wrap">
              <div v-if="m.files && m.files.length" class="msg-user-file-card">
                <div class="msg-user-file-ico">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div class="msg-user-file-info">
                  <div class="msg-user-file-name">{{ m.files[0] }}</div>
                  <div class="msg-user-file-meta">Microsoft Excel · {{ (Math.random() * 8 + 1).toFixed(1) }} MB</div>
                </div>
              </div>
              <div v-if="m.text" class="msg-user-bubble">{{ m.text }}</div>
            </div>

            <!-- System notice (no interaction) -->
            <div v-else-if="m.type === 'notice'" class="msg-notice">
              <div class="msg-notice-icon">ℹ</div>
              <div class="msg-notice-body">
                <div class="msg-notice-title">{{ m.title }}</div>
                <div class="msg-notice-desc" v-html="m.desc"></div>
              </div>
            </div>

            <!-- Border form (step 1) -->
            <div v-else-if="m.type === 'form'" class="msg-form">
              <div class="msg-form-head">
                <span class="badge badge-blue badge-sm">前置</span>
                <strong>边界条件设置</strong>
              </div>
              <div class="msg-form-body">
                <div class="form-row">
                  <div class="form-field">
                    <label>细分大类</label>
                    <select v-model="form.category">
                      <option>中型SUV</option><option>紧凑型SUV</option><option>中大型SUV</option>
                      <option>中型轿车</option><option>紧凑型轿车</option><option>MPV</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>动力类型</label>
                    <select v-model="form.power">
                      <option>ICE</option><option>EV</option><option>PHEV</option><option>HEV</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-field">
                    <label>车型分动力加权成交价上限（元）</label>
                    <select v-model="form.priceMax">
                      <option>1000000</option><option>500000</option><option>300000</option><option>200000</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>车型分动力加权成交价下限（元）</label>
                    <select v-model="form.priceMin">
                      <option>0</option><option>50000</option><option>80000</option><option>100000</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-field">
                    <label>所属品牌</label>
                    <select v-model="form.brand">
                      <option>启源</option><option>深蓝</option><option>阿维塔</option><option>长安</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>上市时间</label>
                    <select v-model="form.year">
                      <option>2028</option><option>2027</option><option>2029</option>
                    </select>
                  </div>
                </div>
                <div class="form-hint">
                  ✎ 边界条件设置完成。请使用下方对话输入区的 <strong>＋</strong> 按钮上传 <strong>IPV 发布版数据</strong>，然后输入任意文字发送即可启动工作流。
                </div>
              </div>
            </div>

            <!-- File upload interaction (step 5) -->
            <div v-else-if="m.type === 'upload'" class="msg-form">
              <div class="msg-form-head">
                <strong>调研文件上传（项目专项调研 + NCBS）</strong>
              </div>
              <div class="msg-form-body">
                <!-- Pre-check: notice only, no interaction -->
                <div class="precheck-tip">
                  <ol style="margin: 0 0 0 18px; padding: 0; font-size: 12px; color: #7C2D12; line-height: 1.7;">
                    <li>竞争格局图（2026 实际 / 2028 预测）</li>
                    <li>竞品推荐清单（核心 / 主要 / 观察竞品）</li>
                    <li>目标竞争圈确定：入门紧凑产品圈</li>
                  </ol>
                </div>
                <!-- Files area: upload any then hit send -->
                <div class="upload-list">
                  <div class="upload-item" :class="{ uploaded: uploadFiles.required }">
                    <div class="upload-item-head">
                      <span class="badge badge-danger badge-sm">必传</span>
                      <strong>项目专项调研文件</strong>
                      <span class="text-muted" style="font-size: 11px; margin-left: 4px;">.xlsx / .xls / .pdf</span>
                    </div>
                    <div v-if="!uploadFiles.required" class="upload-item-actions">
                      <button class="btn-ghost" @click.stop="uploadFiles.required = '启源A06_项目专项调研_2026Q3.xlsx'">上传文件（模拟）</button>
                    </div>
                    <div v-else class="file-chip">📊 {{ uploadFiles.required }} <button class="btn-link" @click.stop="uploadFiles.required = ''">×</button></div>
                  </div>
                  <div class="upload-item" :class="{ uploaded: uploadFiles.optional }">
                    <div class="upload-item-head">
                      <span class="badge badge-blue badge-sm">选填</span>
                      <strong>NCBS 全国购车者调研</strong>
                      <span class="text-muted" style="font-size: 11px; margin-left: 4px;">.xlsx / .csv</span>
                    </div>
                    <div v-if="!uploadFiles.optional" class="upload-item-actions">
                      <button class="btn-ghost" @click.stop="uploadFiles.optional = 'NCBS_2026_H1_全国购车者_v2.xlsx'">上传文件（模拟）</button>
                      <span class="text-muted" style="font-size: 11px;">可跳过（必传项上传即可进入下一步）</span>
                    </div>
                    <div v-else class="file-chip">📈 {{ uploadFiles.optional }} <button class="btn-link" @click.stop="uploadFiles.optional = ''">×</button></div>
                  </div>
                </div>
                <div class="form-hint">
                  ✎ 任意上传文件后（必传项存在即可），在底部输入框发送任意内容或点击下方按钮，进入后续用户画像差异分析流程。
                </div>
                <button class="btn-primary-block" @click.stop="sendAfterFileUpload" :disabled="!uploadFiles.required || busy">
                  ✓ 上传完毕
                </button>
              </div>
            </div>

            <!-- Strategy selection (step 11) -->
            <div v-else-if="m.type === 'strategy'" class="msg-form">
              <div class="msg-form-head">
                <strong>竞争策略人工确认</strong>
              </div>
              <div class="msg-form-body">
                <div class="strategy-pair">
                  <div class="strategy-pick" :class="{ sel: chosenStrategy === 'A' }" @click.stop="chosenStrategy = 'A'">
                    <div class="strategy-pick-head">
                      <span style="font-weight: 700;">策略 A · 对位竞争</span>
                      <span v-if="chosenStrategy === 'A'" class="badge badge-green badge-sm">已选</span>
                    </div>
                    <div class="strategy-pick-sub">与核心竞品参数正面竞争，以价配比抢占份额。</div>
                    <ul>
                      <li>核心逻辑：配置对标核心竞品 +1，价格对标 -2%</li>
                      <li>价格定位：11.49 ～ 14.49 万元（比秦PLUS低2%）</li>
                      <li>配置策略：入门版增配 7 寸仪表 + 电动尾门</li>
                    </ul>
                  </div>
                  <div class="strategy-pick" :class="{ sel: chosenStrategy === 'B' }" @click.stop="chosenStrategy = 'B'">
                    <div class="strategy-pick-head">
                      <span style="font-weight: 700;">策略 B · 差异化竞争</span>
                      <span v-if="chosenStrategy === 'B'" class="badge badge-green badge-sm">已选</span>
                    </div>
                    <div class="strategy-pick-sub">在动力续航 / 设计 / 智能体验形成差异化锚点。</div>
                    <ul>
                      <li>核心逻辑：设计领先 + 智能座舱特色 + 动力差异化</li>
                      <li>价格定位：11.99 ～ 14.99 万元（与核心竞品拉开价差）</li>
                      <li>配置策略：标配 8155 芯片 + 大联屏，中配增 L2+</li>
                    </ul>
                  </div>
                </div>
                <button class="btn-primary-block" @click.stop="confirmStrategy" :disabled="!chosenStrategy || busy">
                  {{ busy ? '生成产品概念文件中...' : '✓ 确认所选策略，生成产品概念文件' }}
                </button>
              </div>
            </div>

            <!-- File outputs (step 12: 3 concept files) -->
            <div v-else-if="m.type === 'files'" class="msg-files">
              <div class="msg-files-head">
                <span class="badge badge-blue badge-sm">STEP 12</span>
                <strong>产品概念文件已生成</strong>
              </div>
              <div class="msg-files-list">
                <div class="file-out file-out-word">
                  <div class="file-out-ico">📄</div>
                  <div style="flex: 1; min-width: 0;">
                    <div class="file-out-name">产品概念文件（Word）.docx</div>
                    <div class="file-out-meta">2.48 MB · 38 页 · 含策划正文 / 附录 / 数据引用</div>
                  </div>
                  <button class="btn-ghost-sm">下载</button>
                </div>
                <div class="file-out file-out-ppt">
                  <div class="file-out-ico">📽</div>
                  <div style="flex: 1; min-width: 0;">
                    <div class="file-out-name">产品概念文件（PPT）.pptx</div>
                    <div class="file-out-meta">18.6 MB · 52 页 · 含关键图表 / 竞争对比 / 概念提案</div>
                  </div>
                  <button class="btn-ghost-sm">下载</button>
                </div>
                <div class="file-out file-out-img">
                  <div class="file-out-ico">🖼</div>
                  <div style="flex: 1; min-width: 0;">
                    <div class="file-out-name">产品概念文件（图片）.png</div>
                    <div class="file-out-meta">3.22 MB · 1920×1080 · 长图总结版 · 便于汇报分享</div>
                  </div>
                  <button class="btn-ghost-sm">下载</button>
                </div>
                <div class="file-out file-out-excel">
                  <div class="file-out-ico">📊</div>
                  <div style="flex: 1; min-width: 0;">
                    <div class="file-out-name">产品概念文件（EXCEL附件打包）.zip</div>
                    <div class="file-out-meta">6.84 MB · 含配置对标表 / 评分表 / 数据引用源</div>
                  </div>
                  <button class="btn-ghost-sm">下载</button>
                </div>
              </div>
              <div class="msg-files-foot">
                ✓ 本轮工作流完成 · 主智能体 + 三子智能体联合输出 · 可在「报告导出」汇总查看
              </div>
            </div>

          </div>

          <!-- Stream spinner (waiting) -->
          <div v-if="busy" class="msg-row msg-assistant">
            <div class="msg-think msg-think-pending">
              <div class="msg-think-title"><span class="dot-flash"></span>智能体处理中，请稍候...</div>
            </div>
          </div>
        </div>

        <!-- Input bar: rounded container with upload button inside -->
        <div class="debug-input-wrap">
          <!-- Attached file preview inside the input container -->
          <div v-if="attachments.length" class="debug-attach-list">
            <div v-for="(att, i) in attachments" :key="i" class="debug-attach-item">
              <span class="debug-attach-ico">📊</span>
              <span class="debug-attach-name">{{ att }}</span>
              <span class="debug-attach-meta">{{ (Math.random() * 5 + 1).toFixed(1) }} MB</span>
              <button class="debug-attach-remove" @click.stop="removeAttach(i)">×</button>
            </div>
          </div>
          <div class="debug-input">
            <!-- Upload button inside bottom-left of input container -->
            <div class="debug-input-tools">
              <span class="debug-input-attach" @click="tryQuickAttach" title="点击模拟上传文件">＋</span>
            </div>
            <textarea
              ref="inputEl"
              v-model="inputText"
              class="debug-input-area"
              rows="2"
              :placeholder="inputPlaceholder"
              @keydown.enter.exact.prevent="onSend"
            ></textarea>
            <button class="debug-send" :disabled="!canSend || busy" @click="onSend">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { simulationData } from '../data.js'

const props = defineProps({ id: String })

const streamEl = ref(null)
const panelEl = ref(null)
const inputEl = ref(null)

/* ===== Form state (step 1) ===== */
const form = reactive({
  category: '中型SUV',
  power: 'ICE',
  priceMax: '1000000',
  priceMin: '0',
  brand: '启源',
  year: '2028',
})
const attachments = ref([])
const uploadFiles = reactive({ required: '', optional: '' })

/* ===== Strategy state (step 11) ===== */
const chosenStrategy = ref(null)

/* ===== Runtime state ===== */
const busy = ref(false)
const stage = ref('idle')   // idle | after_step1 | after_step5_pending | after_strategy_pending | done
const messages = ref([])

const inputPlaceholder = computed(() => {
  if (stage.value === 'idle' && attachments.value.length === 0) return '点击 ＋ 上传 IPV 发布版数据后，输入"产品概念生成"启动工作流'
  if (stage.value === 'idle') return '输入任意文字并发送（建议：产品概念生成）'
  if (stage.value === 'after_step5_pending') return '文件已上传，输入内容发送继续...'
  if (stage.value === 'after_strategy_pending') return '请在上方策略卡中选择...'
  if (stage.value === 'done') return '✓ 工作流完成，点击右上 ↻ 重新开始'
  return ''
})

const canSend = computed(() => {
  if (busy.value) return false
  if (stage.value === 'idle') return attachments.value.length > 0 && !!inputText.value.trim()
  if (stage.value === 'after_step5_pending') return !!uploadFiles.required
  if (stage.value === 'after_strategy_pending') return false   // use button in card
  return !!inputText.value.trim()
})

/* ===== Utility: scroll to bottom ===== */
function scrollBottom() {
  nextTick(() => {
    const el = streamEl.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

/* ===== Utility: delay ===== */
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/* ===== Seed the initial welcome + step1 form ===== */
function seedInitial() {
  messages.value = []
  stage.value = 'idle'
  busy.value = false
  chosenStrategy.value = null
  attachments.value = []
  uploadFiles.required = ''
  uploadFiles.optional = ''
  form.category = '中型SUV'
  form.power = 'ICE'
  form.priceMax = '1000000'
  form.priceMin = '0'
  form.brand = '启源'
  form.year = '2028'
  inputText.value = ''
  pushMsg({ type: 'notice', title: '欢迎使用 · 整车产品概念生成',
    desc: `本流程需先设置<strong>边界条件</strong>并上传 <strong>IPV 发布数据</strong>，然后在输入框输入任意文字启动。` })
  pushMsg({ type: 'form' })
  scrollBottom()
}

function pushMsg(m) { messages.value.push(m); scrollBottom() }

/* ===== Helpers: build step result HTML ===== */
function stepHTML_1(f) {
  const d = simulationData.steps.priceRanking
  return `
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
      <strong>${d.title}</strong> · ${d.subtitle}<br>
      <span style="color:var(--c-text-muted);">${d.meta} · 数据源 ${f.length ? f.join(', ') : 'IPV.xlsx'}</span>
    </div>
    <table class="mini-table">
      <thead><tr>${d.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d.rows.map(r => `<tr>${r.slice(0, 8).map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:10px; padding:8px 10px; background:linear-gradient(135deg,#EFF4FF 0%,#F4F0FF 100%); border:1px solid #B9D0FF; border-radius:8px;">
      <div style="font-weight:600; font-size:12px; margin-bottom:3px; color:#155EEF;">✨ AI 洞察输出</div>
      <div style="font-size:12px; line-height:1.6; color:#1F2937;">${d.insight}</div>
    </div>
  `
}

function stepHTML_2() {
  const d = simulationData.steps.competition
  return `
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
      <strong>${d.title}</strong> · ${d.subtitle}
    </div>
    <table class="mini-table">
      <thead><tr>${d.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:10px; padding:8px 10px; background:linear-gradient(135deg,#EFF4FF 0%,#F4F0FF 100%); border:1px solid #B9D0FF; border-radius:8px;">
      <div style="font-weight:600; font-size:12px; margin-bottom:3px; color:#155EEF;">✨ AI 洞察输出</div>
      <div style="font-size:12px; line-height:1.6; color:#1F2937;">${d.insight}</div>
    </div>
  `
}

function stepHTML_3() {
  const d = simulationData.steps.competitorFunnel
  const finalT = d.finalOutput
  return `
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
      <strong>${d.title}</strong>
    </div>
    <div style="font-weight:600; font-size:11.5px; margin: 8px 0 4px; color:#475569;">最终竞品清单（核心 / 主要 / 观察）</div>
    <table class="mini-table">
      <thead><tr>${finalT.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${finalT.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:10px; padding:8px 10px; background:linear-gradient(135deg,#EFF4FF 0%,#F4F0FF 100%); border:1px solid #B9D0FF; border-radius:8px;">
      <div style="font-weight:600; font-size:12px; margin-bottom:3px; color:#155EEF;">✨ AI 洞察输出</div>
      <div style="font-size:12px; line-height:1.6; color:#1F2937;">${d.insight}</div>
    </div>
  `
}

function stepHTML_4() {
  const d = simulationData.steps.competitionCircle
  return `
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
      <strong>${d.title}</strong> · 已选择：<span style="color:var(--c-primary); font-weight:600;">${d.selected}</span>
    </div>
    <table class="mini-table">
      <thead><tr>${d.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:10px; padding:8px 10px; background:linear-gradient(135deg,#EFF4FF 0%,#F4F0FF 100%); border:1px solid #B9D0FF; border-radius:8px;">
      <div style="font-weight:600; font-size:12px; margin-bottom:3px; color:#155EEF;">✨ AI 洞察输出</div>
      <div style="font-size:12px; line-height:1.6; color:#1F2937;">${d.insight}</div>
    </div>
  `
}

function stepHTML_6() {
  const d = simulationData.steps.persona
  return `
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
      <strong>${d.title}</strong>
    </div>
    <div style="padding:10px 12px; background:#F8FAFC; border-radius:8px; margin-bottom:8px;">
      <div style="font-weight:700; font-size:13px; margin-bottom:2px;">${d.nickname}</div>
      <div style="font-size:12px; color:#475569; line-height:1.55;">${d.tagline}</div>
    </div>
    <table class="mini-table">
      <thead><tr><th>维度</th><th>画像描述</th></tr></thead>
      <tbody>${d.dimensions.map(dim => `<tr><td><strong>${dim.label}</strong></td><td>${dim.value}</td></tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:10px; padding:8px 10px; background:linear-gradient(135deg,#FFF0F6 0%,#F4F0FF 100%); border:1px solid #F5C9DC; border-radius:8px;">
      <div style="font-weight:600; font-size:12px; margin-bottom:3px; color:#BE185D;">✨ AI 洞察输出</div>
      <div style="font-size:12px; line-height:1.6; color:#1F2937;">${d.insight}</div>
    </div>
  `
}

function stepHTML_7() {
  const d = simulationData.steps.aesthetic
  return `
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
      <strong>${d.title}</strong>
    </div>
    <table class="mini-table">
      <thead><tr>${d.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:10px; padding:8px 10px; background:linear-gradient(135deg,#FFF0F6 0%,#F4F0FF 100%); border:1px solid #F5C9DC; border-radius:8px;">
      <div style="font-weight:600; font-size:12px; margin-bottom:3px; color:#BE185D;">✨ AI 洞察输出</div>
      <div style="font-size:12px; line-height:1.6; color:#1F2937;">${d.insight}</div>
    </div>
  `
}

function stepHTML_8() {
  const d1 = simulationData.steps.demandMatrix1
  const d2 = simulationData.steps.demandMatrix2
  const d3 = simulationData.steps.demandMapping
  return `
    <div style="font-weight:600; font-size:11.5px; margin-bottom:6px; color:#475569;">${d1.title}</div>
    <table class="mini-table">
      <thead><tr>${d1.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d1.rows.map(r => `<tr>${r.slice(0, 6).map((c, i) => i === 5 ? `<td><span style="color:${r[6] === 'highlight' ? '#BE185D' : r[6] === 'warning' ? '#D97706' : 'inherit'};">${c}</span></td>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:8px; font-size:11.5px;"><strong>关键洞察：</strong>${d1.insight}</div>
    <div style="margin-top:10px; font-weight:600; font-size:11.5px; color:#475569;">${d2.title}</div>
    <table class="mini-table">
      <thead><tr>${d2.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d2.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:8px; font-size:11.5px;"><strong>机会点：</strong>${d2.insight}</div>
    <div style="margin-top:10px; font-weight:600; font-size:11.5px; color:#475569;">${d3.title}</div>
    <table class="mini-table">
      <thead><tr>${d3.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d3.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:10px; padding:8px 10px; background:linear-gradient(135deg,#FFF0F6 0%,#F4F0FF 100%); border:1px solid #F5C9DC; border-radius:8px;">
      <div style="font-weight:600; font-size:12px; margin-bottom:3px; color:#BE185D;">✨ AI 洞察输出</div>
      <div style="font-size:12px; line-height:1.6; color:#1F2937;">${d3.insight}</div>
    </div>
  `
}

function stepHTML_9() {
  const d = simulationData.steps.competitorFeatures
  return `
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
      <strong>${d.title}</strong>
    </div>
    <table class="mini-table">
      <thead><tr>${d.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:10px; padding:8px 10px; background:linear-gradient(135deg,#F0FFF4 0%,#EFF4FF 100%); border:1px solid #B7E4C7; border-radius:8px;">
      <div style="font-weight:600; font-size:12px; margin-bottom:3px; color:#15803D;">✨ AI 洞察输出</div>
      <div style="font-size:12px; line-height:1.6; color:#1F2937;">${d.insight}</div>
    </div>
  `
}

function stepHTML_10() {
  const d = simulationData.steps.configBenchmark
  return `
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
      <strong>${d.title}</strong>
    </div>
    <table class="mini-table">
      <thead><tr>${d.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div style="margin-top:10px; padding:8px 10px; background:linear-gradient(135deg,#F0FFF4 0%,#EFF4FF 100%); border:1px solid #B7E4C7; border-radius:8px;">
      <div style="font-weight:600; font-size:12px; margin-bottom:3px; color:#15803D;">✨ AI 洞察输出</div>
      <div style="font-size:12px; line-height:1.6; color:#1F2937;">${d.insight}</div>
    </div>
  `
}

/* ===== Build thinking log ===== */
function think({ agent, workflow, time, token, node }) {
  return { type: 'think', agent, workflow, time, token, node }
}

/* ===== Main flow: step 1~4 after user sends ===== */
async function runSteps1to4(userText, userFiles = []) {
  busy.value = true
  stage.value = 'busy_s1_4'
  // echo user
  pushMsg({ type: 'user', text: userText, files: userFiles })
  await sleep(350)
  // Step 1 output after thinking
  pushMsg(think({ agent: '竞争圈及价格带变化智能分析助手（市场与竞争）', workflow: 'SPC-SUB1 / 市场扫描', time: '10.82 s', token: 'In 1,284 · Out 412', node: '细分市场（分价格）规模走势预判' }))
  await sleep(10800)
  pushMsg({ type: 'step', stepNum: 1, stepName: '市场扫描', agent: 'Sub1', html: stepHTML_1(userFiles) })
  await sleep(500)
  // Step 2
  pushMsg(think({ agent: '竞争圈及价格带变化智能分析助手（市场与竞争）', workflow: 'SPC-SUB1 / 竞争格局', time: '12.45 s', token: 'In 876 · Out 298', node: '市场竞争趋势分析' }))
  await sleep(12400)
  pushMsg({ type: 'step', stepNum: 2, stepName: '竞争格局分析', agent: 'Sub1', html: stepHTML_2() })
  await sleep(500)
  // Step 3
  pushMsg(think({ agent: '竞争圈及价格带变化智能分析助手（市场与竞争）', workflow: 'SPC-SUB1 / 竞品筛选', time: '11.36 s', token: 'In 1,102 · Out 356', node: '竞品自动筛选' }))
  await sleep(11300)
  pushMsg({ type: 'step', stepNum: 3, stepName: '竞品筛选', agent: 'Sub1', html: stepHTML_3() })
  await sleep(500)
  // Step 4
  pushMsg(think({ agent: '竞争圈及价格带变化智能分析助手（市场与竞争）', workflow: 'SPC-SUB1 / 竞争圈确定', time: '13.92 s', token: 'In 720 · Out 214', node: '目标竞争圈确定' }))
  await sleep(13900)
  pushMsg({ type: 'step', stepNum: 4, stepName: '目标竞争圈确定', agent: 'Sub1', html: stepHTML_4() })
  await sleep(600)

  // Step 5 intervention
  stage.value = 'after_step5_pending'
  busy.value = false
  pushMsg({ type: 'notice', title: 'STEP 5 · 用户干预点',
    desc: '前置 1~4 步自动执行完成。请<strong>在下方上传卡或输入区</strong>上传调研文件（必传：项目专项调研文件；选填：NCBS），然后发送任意内容继续。' })
  pushMsg({ type: 'upload' })
}

/* ===== Step 5 send → enter step 6~10 ===== */
async function runAfterFileUpload(userText, files) {
  busy.value = true
  stage.value = 'busy_s6_10'
  pushMsg({ type: 'user', text: userText || '（文件上传完毕，继续执行）', files: files })
  await sleep(300)
  // Step 6
  pushMsg(think({ agent: '用户画像差异智能分析助手（用户与体验）', workflow: 'SPC-SUB2 / 用户画像差异', time: '12.18 s', token: 'In 1,520 · Out 488', node: '目标用户特征生成' }))
  await sleep(12100)
  pushMsg({ type: 'step', stepNum: 6, stepName: '目标用户画像差异', agent: 'Sub2', html: stepHTML_6() })
  await sleep(500)
  // Step 7
  pushMsg(think({ agent: '用户画像差异智能分析助手（用户与体验）', workflow: 'SPC-SUB2 / 审美偏好聚类', time: '10.65 s', token: 'In 742 · Out 302', node: '目标用户审美偏好TOP3筛选' }))
  await sleep(10600)
  pushMsg({ type: 'step', stepNum: 7, stepName: '审美偏好聚类分析', agent: 'Sub2', html: stepHTML_7() })
  await sleep(500)
  // Step 8
  pushMsg(think({ agent: '用户画像差异智能分析助手（用户与体验）', workflow: 'SPC-SUB2 / 需求×配置交叉', time: '14.38 s', token: 'In 1,086 · Out 346', node: '目标用户需求交叉分析' }))
  await sleep(14300)
  pushMsg({ type: 'step', stepNum: 8, stepName: '需求交叉 × 配置映射', agent: 'Sub2', html: stepHTML_8() })
  await sleep(500)
  // Step 9
  pushMsg(think({ agent: '人群细分与趋势分析助手（产品与策略）', workflow: 'SPC-SUB3 / 竞品特征提取', time: '11.94 s', token: 'In 928 · Out 318', node: '目标市场特征总结' }))
  await sleep(11900)
  pushMsg({ type: 'step', stepNum: 9, stepName: '竞品产品特征提取', agent: 'Sub3', html: stepHTML_9() })
  await sleep(500)
  // Step 10
  pushMsg(think({ agent: '人群细分与趋势分析助手（产品与策略）', workflow: 'SPC-SUB3 / 配置等级对标', time: '12.73 s', token: 'In 812 · Out 284', node: '配置等级与对标分析' }))
  await sleep(12700)
  pushMsg({ type: 'step', stepNum: 10, stepName: '配置等级与对标分析', agent: 'Sub3', html: stepHTML_10() })
  await sleep(600)

  // Step 11 strategy selection
  busy.value = false
  stage.value = 'after_strategy_pending'
  pushMsg({ type: 'notice', title: 'STEP 11 · 用户干预点',
    desc: '6~10 步自动执行完成。请<strong>在下方策略卡中选择一个竞争策略</strong>，系统将生成最终的产品概念三件套。' })
  pushMsg({ type: 'strategy' })
}

/* ===== Strategy selected → generate 3 concept files ===== */
async function confirmStrategy() {
  if (!chosenStrategy.value || busy.value) return
  busy.value = true
  stage.value = 'generating'
  pushMsg({ type: 'user', text: `已确认：策略 ${chosenStrategy.value}（${chosenStrategy.value === 'A' ? '对位竞争' : '差异化竞争'}），请生成产品概念文件。` })
  await sleep(400)
  pushMsg(think({ agent: '整车产品概念生成（编排 + 整合）', workflow: 'SPC-MAIN / 概念生成', time: '14.76 s', token: 'In 2,488 · Out 1,120', node: '生成产品概念文件' }))
  // Wait ~14-15s simulated generation
  await sleep(14700)
  pushMsg({ type: 'step', stepNum: 12, stepName: '产品概念文件输出', agent: '主智能体', html: '<div style="font-size:12px;color:var(--c-text-secondary);margin-bottom:8px;">基于已确认竞争策略，生成产品概念三件套（Word/PPT/图片）。</div>' })
  pushMsg({ type: 'files' })
  busy.value = false
  stage.value = 'done'
}

/* ===== Input events ===== */
const inputText = ref('')

function tryQuickAttach() {
  if (stage.value === 'idle') {
    if (attachments.value.length === 0) {
      attachments.value.push('IPV发布版数据2026-06.xlsx')
    }
  } else if (stage.value === 'after_step5_pending') {
    if (!uploadFiles.required) uploadFiles.required = '启源A06_项目专项调研_2026Q3.xlsx'
    else if (!uploadFiles.optional) uploadFiles.optional = 'NCBS_2026_H1_全国购车者_v2.xlsx'
  }
}

function removeAttach(i) {
  attachments.value.splice(i, 1)
}

function onSend() {
  if (!canSend.value) return
  const text = inputText.value
  inputText.value = ''
  if (stage.value === 'idle') {
    const f = [...attachments.value]
    attachments.value = []
    runSteps1to4(text, f)
  } else if (stage.value === 'after_step5_pending') {
    const f = []
    if (uploadFiles.required) f.push(uploadFiles.required)
    if (uploadFiles.optional) f.push(uploadFiles.optional)
    runAfterFileUpload(text, f)
  } else {
    pushMsg({ type: 'user', text })
  }
}

function sendAfterFileUpload() {
  if (!uploadFiles.required || busy.value) return
  const f = []
  if (uploadFiles.required) f.push(uploadFiles.required)
  if (uploadFiles.optional) f.push(uploadFiles.optional)
  runAfterFileUpload('已上传调研文件', f)
}

function resetRun() {
  seedInitial()
}

onMounted(() => { seedInitial() })
</script>

<style scoped>
/* ===== Shell ===== */
.debugger-shell {
  display: grid;
  grid-template-columns: 160px 1fr 420px;
  gap: 10px;
  height: 680px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* ===== Wireframes (left & middle) ===== */
.wire {
  background: #FAFAFA;
  border-right: 1px dashed var(--c-border);
  padding: 12px;
  overflow: hidden;
}
.wire-left { display: flex; flex-direction: column; gap: 10px; }
.wire-title {
  font-size: 11px;
  color: var(--c-text-muted);
  font-weight: 600;
  padding: 4px 6px 6px;
  border-bottom: 1px dashed var(--c-border-light);
  margin-bottom: 4px;
}
.wire-row {
  height: 28px;
  border-radius: 6px;
  background: #EEF0F3;
  border: 1px dashed #D9DEE5;
}
.wire-row-sm { height: 20px; }
.wire-row.wire-active { background: #E6ECFF; border-color: #B8CCFF; }
.wire-divider {
  height: 1px;
  background: repeating-linear-gradient(90deg, #D9DEE5 0 6px, transparent 6px 10px);
  margin: 4px 2px;
}
.wire-canvas-header {
  display: flex; gap: 10px; align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--c-border-light);
}
.wire-chip {
  height: 22px; width: 74px; background: #EEF0F3; border: 1px dashed #D9DEE5; border-radius: 6px;
}
.wire-chip-sm { height: 18px; width: 96px; background: #EEF0F3; border: 1px dashed #D9DEE5; border-radius: 6px; }
.wire-chip-long { width: 180px; }
.wire-chip-primary {
  width: 110px;
  background: linear-gradient(135deg, #E0EAFF, #EEF4FF);
  border: 1px solid #B8CCFF;
  color: #2557D6;
  font-size: 11px;
  font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.wire-canvas-body {
  display: flex; align-items: center; justify-content: center;
  height: calc(100% - 92px);
  padding: 20px;
}
.wire-node {
  width: 130px; height: 72px; border: 2px dashed #C2C8D2;
  background: white; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #8A919C; font-size: 12px; font-weight: 600;
}
.wire-node-accent {
  border-color: #94A9FF;
  background: linear-gradient(135deg, #F0F4FF, #FAEBFF);
  color: #5B5BD6;
}
.wire-line {
  width: 46px; height: 2px; background: repeating-linear-gradient(90deg, #C2C8D2 0 6px, transparent 6px 10px);
}
.wire-canvas-footer {
  display: flex; gap: 8px; align-items: center; justify-content: center;
  padding-top: 10px; border-top: 1px dashed var(--c-border-light);
}

/* ===== Debug panel (RIGHT COLUMN, FOCUS) ===== */
.debug-panel {
  display: flex; flex-direction: column;
  background: white;
  border-left: 1px solid var(--c-border);
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.debug-panel-header {
  padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--c-border-light);
  background: linear-gradient(180deg, #FAFBFF, white);
}
.debug-panel-title { display: flex; flex-direction: column; line-height: 1.2; }
.debug-panel-sub { font-size: 11px; color: var(--c-text-muted); margin-top: 2px; font-weight: 400; }
.debug-reset {
  font-size: 12px; padding: 4px 10px; border-radius: 6px;
  border: 1px solid var(--c-border); background: white; color: var(--c-text-secondary);
  cursor: pointer;
}
.debug-reset:hover { color: var(--c-primary); border-color: var(--c-primary-light); background: var(--c-primary-bg); }

/* Stream */
.debug-stream {
  flex: 1 1 0; overflow-y: auto;
  min-height: 0;
  padding: 14px;
  background: #FAFBFC;
  display: flex; flex-direction: column; gap: 12px;
}
.msg-row { display: flex; }
.msg-assistant { justify-content: flex-start; }

/* User bubble */
.msg-user-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.msg-user-bubble {
  max-width: 85%;
  background: var(--c-primary);
  color: white;
  border-radius: 14px 14px 2px 14px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.55;
  box-shadow: 0 2px 6px rgba(21, 94, 239, 0.18);
}
.msg-user-file-card {
  max-width: 280px;
  background: white;
  border: 1px solid var(--c-border-light);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex; align-items: center; gap: 10px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.msg-user-file-ico {
  width: 40px; height: 40px;
  background: #22C55E;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  flex-shrink: 0;
}
.msg-user-file-info { min-width: 0; }
.msg-user-file-name {
  font-size: 13px;
  font-weight: 600;
  color: #1F2937;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.msg-user-file-meta {
  font-size: 11px;
  color: var(--c-text-muted);
  margin-top: 2px;
}

/* Think log card - subtle inline processing indicator */
.msg-think {
  width: 100%;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 2px 0;
  border-left: none;
}
.msg-think-pending {
  background: transparent;
  border-color: transparent;
  border-left-color: transparent;
}
.msg-think-title {
  font-size: 11.5px;
  color: var(--c-text-muted);
  font-weight: 500;
  display: flex; align-items: center; gap: 6px;
}
.msg-think-title strong {
  color: #475569;
  font-weight: 600;
}
.dot-flash {
  width: 6px; height: 6px; border-radius: 50%;
  background: #F59E0B;
  box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6);
  animation: pulse 1.2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(245,158,11,0.6); }
  70% { box-shadow: 0 0 0 6px rgba(245,158,11,0); }
  100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
}
.msg-think-grid {
  margin-top: 4px;
  margin-bottom: 6px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 3px 12px;
  font-size: 11px;
  color: var(--c-text-muted);
  padding-left: 12px;
  border-left: 2px dashed #E2E8F0;
}
.msg-think-k { color: var(--c-text-muted); margin-right: 4px; }
.msg-think-v { color: #475569; font-weight: 500; }

/* Step result: natural conversation style */
.msg-step-wrap {
  width: 100%;
  padding: 2px 0;
}
.msg-step-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12.5px;
  color: var(--c-text-secondary);
}
.msg-step-label-dot {
  width: 6px; height: 6px;
  background: #22C55E;
  border-radius: 50%;
  flex-shrink: 0;
}
.msg-step-label-text strong {
  color: #1F2937;
}
.msg-step-conclusion {
  padding: 12px 14px;
  background: white;
  border: 1px solid var(--c-border-light);
  border-radius: 10px;
  font-size: 12.5px;
  line-height: 1.7;
  color: #1F2937;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}
.msg-step-conclusion .mini-table {
  margin-bottom: 10px;
}
.msg-step-conclusion .mini-table th {
  background: #F8FAFC;
  font-weight: 600;
  color: #475569;
}
.msg-step-conclusion strong {
  color: #1F2937;
}

/* Mini table */
.mini-table {
  width: 100%; border-collapse: collapse; font-size: 11.5px;
}
.mini-table th, .mini-table td {
  border: 1px solid var(--c-border-light);
  padding: 5px 7px;
  text-align: left;
}
.mini-table th {
  background: #F4F6FA;
  color: #475569;
  font-weight: 600;
  font-size: 11px;
}
.mini-table tbody tr:nth-child(even) td { background: #FAFBFD; }

/* Notice */
.msg-notice {
  width: 100%;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex; gap: 10px; align-items: flex-start;
}
.msg-notice-icon {
  width: 24px; height: 24px; border-radius: 50%;
  background: #3B82F6; color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}
.msg-notice-title { font-weight: 700; font-size: 12.5px; color: #1E40AF; margin-bottom: 2px; }
.msg-notice-desc { font-size: 11.5px; color: #1E40AF; line-height: 1.6; }

/* Forms (border, upload, strategy) */
.msg-form {
  width: 100%;
  background: white;
  border: 1px solid var(--c-border-light);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15,23,42,0.04);
}
.msg-form-head {
  padding: 10px 14px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--c-border-light);
  background: #F7F9FC;
  font-size: 13px;
  color: #1F2937;
}
.msg-form-body { padding: 12px 14px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.form-field label {
  display: block; font-size: 11px; color: var(--c-text-secondary);
  font-weight: 500; margin-bottom: 4px;
}
.form-field select {
  width: 100%;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--c-border);
  border-radius: 7px;
  background: white;
  font-size: 12.5px;
  color: #1F2937;
  outline: none;
  cursor: pointer;
}
.form-field select:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px rgba(21,94,239,0.12); }

.upload-box {
  border: 2px dashed #CBD5E1;
  background: #F8FAFC;
  border-radius: 10px;
  padding: 14px 12px;
  text-align: center;
  margin-bottom: 10px;
  transition: all 0.2s;
}
.upload-box.uploaded {
  border-color: #10B981;
  background: #F0FDF4;
}
.upload-box-done {
  display: flex; align-items: center; gap: 10px; text-align: left;
}
.file-ico {
  width: 38px; height: 38px; background: #10B981; color: white;
  border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.file-name { font-size: 12.5px; font-weight: 600; color: #065F46; }
.file-meta { font-size: 11px; color: #059669; margin-top: 2px; }
.form-hint {
  padding: 8px 10px;
  background: #FFFBEB;
  border: 1px dashed #FDE68A;
  border-radius: 8px;
  font-size: 11.5px;
  color: #78350F;
  line-height: 1.55;
}
.form-hint em { color: #B45309; font-style: normal; font-weight: 600; }

.btn-ghost {
  padding: 6px 12px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  background: white;
  font-size: 12px;
  color: var(--c-text-secondary);
  cursor: pointer;
}
.btn-ghost:hover { color: var(--c-primary); border-color: var(--c-primary-light); background: var(--c-primary-bg); }
.btn-ghost-sm {
  padding: 4px 10px;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  background: white;
  font-size: 11px;
  color: var(--c-text-secondary);
  cursor: pointer;
  white-space: nowrap;
}
.btn-ghost-sm:hover { color: var(--c-primary); border-color: var(--c-primary-light); }
.btn-link {
  background: none; border: none; color: var(--c-primary);
  cursor: pointer; font-size: 11.5px; padding: 0 4px;
}
.btn-primary-block {
  width: 100%;
  margin-top: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #155EEF 0%, #4C6EF5 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(21, 94, 239, 0.22);
}
.btn-primary-block:disabled { opacity: 0.65; cursor: not-allowed; }

/* Precheck tip */
.precheck-tip {
  background: #FFF7ED;
  border: 1px solid #FDBA74;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

/* Upload list */
.upload-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
.upload-item {
  border: 1px dashed var(--c-border);
  border-radius: 8px;
  padding: 10px 12px;
  background: #FAFBFC;
  transition: all 0.2s;
}
.upload-item.uploaded {
  border-color: #10B981;
  background: #F0FDF4;
}
.upload-item-head {
  display: flex; align-items: center;
  font-size: 12.5px;
  margin-bottom: 8px;
  gap: 6px;
}
.upload-item-actions {
  display: flex; align-items: center; gap: 10px;
}
.file-chip {
  background: white;
  border: 1px solid var(--c-success);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 11.5px;
  color: #065F46;
  font-weight: 500;
  display: flex; align-items: center; justify-content: space-between;
}

/* Strategy pair */
.strategy-pair {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  margin-bottom: 10px;
}
.strategy-pick {
  border: 2px solid var(--c-border);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  background: white;
  transition: all 0.15s;
}
.strategy-pick:hover { border-color: #B8CCFF; }
.strategy-pick.sel {
  border-color: var(--c-primary);
  background: #EEF4FF;
  box-shadow: 0 2px 8px rgba(21,94,239,0.12);
}
.strategy-pick-head {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12.5px; margin-bottom: 4px;
}
.strategy-pick-sub {
  font-size: 11.5px; color: var(--c-text-secondary);
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--c-border-light);
}
.strategy-pick ul {
  margin: 0; padding-left: 16px;
  font-size: 11px; color: #334155; line-height: 1.7;
}

/* Files output (3 concept files) */
.msg-files {
  width: 100%;
  background: white;
  border: 1px solid #86EFAC;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.08);
}
.msg-files-head {
  padding: 10px 14px;
  display: flex; align-items: center; gap: 8px;
  font-size: 13px;
  background: linear-gradient(90deg, #ECFDF5, #EFF6FF);
  border-bottom: 1px solid #BBF7D0;
  color: #065F46;
}
.msg-files-list {
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 8px;
}
.file-out {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--c-border-light);
  background: #FAFBFC;
}
.file-out-word { border-color: #FECACA; background: #FEF2F2; }
.file-out-ppt  { border-color: #FBCFE8; background: #FDF2F8; }
.file-out-img  { border-color: #A7F3D0; background: #ECFDF5; }
.file-out-excel { border-color: #BFDBFE; background: #EFF6FF; }
.file-out-ico {
  width: 40px; height: 40px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  background: white;
}
.file-out-word .file-out-ico { color: #DC2626; }
.file-out-ppt  .file-out-ico { color: #DB2777; }
.file-out-img  .file-out-ico { color: #059669; }
.file-out-excel .file-out-ico { color: #2563EB; }
.file-out-name {
  font-size: 13px; font-weight: 700; color: #0F172A;
}
.file-out-meta {
  font-size: 11px; color: var(--c-text-secondary); margin-top: 2px;
}
.msg-files-foot {
  padding: 10px 14px;
  background: #F0FDF4;
  border-top: 1px dashed #86EFAC;
  font-size: 11.5px;
  color: #065F46;
  font-weight: 500;
}

/* ===== Input bar ===== */
.debug-input-wrap {
  flex-shrink: 0;
  border-top: 1px solid var(--c-border-light);
  background: white;
  padding: 10px 12px 8px;
}

/* Rounded big input container */
.debug-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.debug-attach-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 4px 6px 4px;
}
.debug-attach-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #F0F4FF;
  border: 1px solid #D4DDF5;
  border-radius: 8px;
  padding: 4px 24px 4px 8px;
  font-size: 11px;
  color: #1F2937;
  position: relative;
}
.debug-attach-ico { font-size: 13px; }
.debug-attach-name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
.debug-attach-meta { color: var(--c-text-muted); }
.debug-attach-remove {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px; height: 16px;
  border: none;
  background: transparent;
  color: var(--c-text-muted);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
}
.debug-attach-remove:hover { background: rgba(0,0,0,0.06); color: #374151; }

.debug-input {
  position: relative;
  padding: 10px 40px 38px 14px;
  border: 1.5px solid var(--c-border);
  border-radius: 16px;
  background: #FAFBFC;
  transition: border-color 0.15s, box-shadow 0.15s;
  min-height: 76px;
}
.debug-input:focus-within {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px rgba(21,94,239,0.10);
  background: white;
}
/* Bottom-left tools inside the container */
.debug-input-tools {
  position: absolute;
  bottom: 6px;
  left: 10px;
  display: flex; align-items: center; gap: 2px;
}
.debug-input-attach {
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--c-text-muted);
  transition: all 0.15s;
}
.debug-input-attach:hover {
  background: var(--c-primary-bg);
  color: var(--c-primary);
}
.debug-input-area {
  width: 100%;
  min-height: 44px;
  max-height: 140px;
  padding: 4px 2px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  line-height: 1.55;
  color: #1F2937;
  resize: none;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}
.debug-input-area::placeholder { color: var(--c-text-muted); }
.debug-input-area:focus { background: transparent; }

.debug-send {
  position: absolute;
  bottom: 6px;
  right: 10px;
  width: 30px; height: 30px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #155EEF 0%, #4C6EF5 100%);
  color: white;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(21,94,239,0.22);
  flex-shrink: 0;
}
.debug-send:disabled {
  background: #CBD5E1;
  cursor: not-allowed;
  box-shadow: none;
}

/* Badge utility variants (small) */
.badge-sm { font-size: 10.5px !important; padding: 2px 7px !important; }
.text-muted { color: var(--c-text-muted); }

/* Scrollbar for stream */
.debug-stream::-webkit-scrollbar { width: 6px; }
.debug-stream::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
.debug-stream::-webkit-scrollbar-track { background: transparent; }
</style>

<!-- Non-scoped styles for v-html injected content (tables, insight cards, etc.) -->
<style>
.mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
  margin: 6px 0 8px;
}
.mini-table th,
.mini-table td {
  border: 1px solid #E2E8F0;
  padding: 5px 8px;
  text-align: left;
  vertical-align: top;
  line-height: 1.45;
}
.mini-table th {
  background: #F4F6FA;
  color: #475569;
  font-weight: 600;
  font-size: 11px;
  white-space: nowrap;
}
.mini-table tbody tr:nth-child(even) td {
  background: #FAFBFD;
}
.mini-table tbody tr:hover td {
  background: #F0F4FF;
}
</style>
