<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import {
  mockReports,
  generateSteps,
  workbenchSteps,
  thinkHtml,
  sleep,
} from '../data.js'

const emit = defineEmits(['toast', 'go-audit'])
const props = defineProps({ role: { type: String, default: 'admin' } })

// ============== State ==============
const boundary = ref({
  brand: '长安启源',
  segment: '紧凑型轿车',
  energy: 'PHEV',
  priceRange: '6-10万',
  launchYear: '2028',
})
const messages = ref([])
const currentStep = ref(0)
const running = ref(false)
const attachedFile = ref(null)
const wbInput = ref('')
const wbStatus = ref('就绪')

const streamRef = ref(null)

const brandOpts = ['长安启源', '深蓝', '阿维塔', '长安', '长安欧尚']
const segmentOpts = ['紧凑型轿车', '中型轿车', '紧凑SUV', '中大型SUV', '紧凑型轿车', '中大型轿跑']
const energyOpts = ['PHEV', 'BEV', 'ICE', 'REEV']
const priceOpts = ['5-7万', '6-8万', '6-10万', '7-10万', '8-11万', '8-12万', '10-15万', '25-35万']
const yearOpts = ['2027', '2028', '2029', '2030']

let msgSeq = 0
function pushWbMsg(html, type) {
  messages.value.push({ id: ++msgSeq, html, type: type || 'bot' })
  nextTick(() => {
    const stream = streamRef.value
    if (stream) stream.scrollTop = stream.scrollHeight
  })
}
function popWbMsg() {
  messages.value.pop()
}

function nodeClass(i) {
  if (currentStep.value > i) return 'done'
  if (currentStep.value === i) return 'active'
  return ''
}
function nodeStatus(i) {
  if (currentStep.value > i) return '✓ 完成'
  if (currentStep.value === i) return '处理中...'
  return '待执行'
}

function updateBoundary(key, value) {
  boundary.value[key] = value
  emit('toast', '边界条件已更新：' + key + ' = ' + value, 'success')
}
function resetBoundary() {
  boundary.value = { brand: '长安启源', segment: '紧凑型轿车', energy: 'PHEV', priceRange: '6-10万', launchYear: '2028' }
  emit('toast', '边界条件已重置', 'warning')
}

function toggleAttach() {
  attachedFile.value = attachedFile.value ? null : { name: 'IPV发布版数据_20260825.xlsx', size: '2.4 MB' }
}

async function sendWbMessage() {
  if (running.value) return
  const text = (wbInput.value || '').trim()
  if (!text && !attachedFile.value) {
    emit('toast', '请输入文字或上传IPV文件', 'warning')
    return
  }
  running.value = true
  wbStatus.value = '处理中'

  // User message
  let userMsg = text
  if (attachedFile.value) userMsg = `📎 ${attachedFile.value.name}<br>${text}`
  pushWbMsg(userMsg, 'user')
  wbInput.value = ''

  // Determine phase
  if (currentStep.value === 0 && attachedFile.value) {
    // Step 1: 价格排名 → 自动连续执行 Step 2-4 → 停在 Step 5（文件上传干预点）
    await runStep1()
    await runAutoSteps(2, 4)
  } else if (currentStep.value === 5) {
    // Step 5: 文件上传干预点，用户随便传什么发送 → 自动连续执行 Step 6-10 → 停在 Step 11（策略选择）
    await runAutoSteps(6, 10)
  } else {
    pushWbMsg('当前无需手动输入，请等待自动步骤完成或进行策略选择。', 'bot')
  }

  running.value = false
  wbStatus.value = '就绪'
}

async function runStep1() {
  // Attach file consumed
  const fileName = attachedFile.value ? attachedFile.value.name : 'IPV.xlsx'
  attachedFile.value = null

  pushWbMsg('<strong>智能体处理中，请稍候...</strong>', 'thinking')
  await sleep(1200)
  // Remove thinking msg
  popWbMsg()
  pushWbMsg(thinkHtml('市场扫描模块', 'SPC-CMP / 价格排名', '12.4 s', 'In 1,856 · Out 742', '价格细分市场排名与评分'), 'thinking')
  await sleep(1500)

  const d = mockReports[0].steps[0]
  pushWbMsg(`
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
      <strong>${d.title}</strong> · ${d.subtitle}<br>
      <span style="color:var(--c-text-muted);">${d.meta} · 数据源 ${fileName}</span>
    </div>
    <table class="msg-table">
      <thead><tr>${d.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div class="msg-insight">
      <div class="msg-insight-title">✨ AI 洞察输出</div>
      ${d.insight}
    </div>
  `, 'bot')

  currentStep.value = 1
}

async function runAutoSteps(start, end) {
  for (let i = start; i <= end; i++) {
    pushWbMsg('<strong>智能体处理中，请稍候...</strong>', 'thinking')
    await sleep(1200)
    popWbMsg()

    const stepIdx = i - 1
    const d = mockReports[0].steps[stepIdx]
    const agentMap = {
      2: { agent: '竞争分析模块', workflow: 'SPC-CMP / 竞争格局', time: '13.8 s', token: 'In 2,142 · Out 980' },
      3: { agent: '竞争分析模块', workflow: 'SPC-CMP / 竞品筛选', time: '11.2 s', token: 'In 1,920 · Out 824' },
      4: { agent: '竞争分析模块', workflow: 'SPC-CMP / 竞争圈', time: '10.6 s', token: 'In 1,648 · Out 612' },
      6: { agent: '用户洞察模块', workflow: 'SPC-USR / 用户画像', time: '14.3 s', token: 'In 2,356 · Out 1,028' },
      7: { agent: '用户洞察模块', workflow: 'SPC-USR / 审美偏好', time: '12.1 s', token: 'In 2,108 · Out 892' },
      8: { agent: '用户洞察模块', workflow: 'SPC-USR / 需求交叉', time: '13.5 s', token: 'In 2,256 · Out 968' },
      9: { agent: '产品特征模块', workflow: 'SPC-FEA / 竞品特征', time: '11.8 s', token: 'In 1,932 · Out 856' },
      10: { agent: '产品特征模块', workflow: 'SPC-FEA / 配置基准', time: '12.6 s', token: 'In 2,048 · Out 912' },
    }
    const a = agentMap[i]
    pushWbMsg(thinkHtml(a.agent, a.workflow, a.time, a.token, d.name), 'thinking')
    await sleep(1500)

    let bodyHtml = ''
    if (d.persona) {
      bodyHtml = `
        <div style="display:flex; align-items:flex-start; gap:12px; padding:12px; background:var(--c-surface-2); border-radius:8px;">
          <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#7C3AED,#5B21B6); color:white; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; flex-shrink:0;">${d.persona.nickname.charAt(0)}</div>
          <div style="flex:1;">
            <div style="font-weight:700; font-size:13px;">${d.persona.nickname}</div>
            <div style="font-size:11px; color:var(--c-text-muted); margin-bottom:8px;">${d.persona.tagline}</div>
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:4px 10px;">
              ${d.persona.dimensions.map(dim => `
                <div>
                  <div style="font-size:10px; color:var(--c-text-muted);">${dim.label}</div>
                  <div style="font-size:11px;">${dim.value}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `
    } else if (d.selected) {
      bodyHtml = `
        <div style="padding:8px 12px; background:#ECFDF3; border:1px solid #A7F3D0; border-radius:8px; margin-bottom:8px; color:#065F46; font-weight:600; font-size:12px;">✓ 选定竞争圈：${d.selected}</div>
        <table class="msg-table">
          <thead><tr>${d.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${d.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      `
    } else if (d.columns) {
      bodyHtml = `
        <table class="msg-table">
          <thead><tr>${d.columns.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${d.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      `
    }
    pushWbMsg(`
      <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
        <strong>${d.title}</strong>${d.subtitle ? ' · ' + d.subtitle : ''}
      </div>
      ${bodyHtml}
      <div class="msg-insight">
        <div class="msg-insight-title">✨ AI 洞察输出</div>
        ${d.insight}
      </div>
    `, 'bot')

    currentStep.value = i
    await sleep(400)
  }
  // After step 4 done (currentStep=4), show file upload intervention prompt
  if (currentStep.value === 4) {
    pushWbMsg(`
      <div style="padding:10px 12px; background:#FFFAEB; border:1px solid #FDE68A; border-radius:8px; font-size:12px; color:#92400E;">
        ⚠ <strong>用户干预点</strong>：已生成的前置分析结果（竞争格局图、竞品推荐清单、目标竞争圈）请查阅。<br>
        请上传调研文件（或输入任意文字）继续后续 Step 6-10。
      </div>
    `, 'bot')
    currentStep.value = 5
  }
  // After step 10 done (currentStep=10), auto run strategy step (Step 11)
  if (currentStep.value === 10) {
    await runStrategyStep()
  }
}

async function runStrategyStep() {
  pushWbMsg('<strong>智能体处理中，请稍候...</strong>', 'thinking')
  await sleep(1200)
  popWbMsg()

  const d = mockReports[0].steps[10]
  pushWbMsg(thinkHtml('主智能体·整车产品概念生成', 'SPC-MAIN / 策略确认', '15.8 s', 'In 2,612 · Out 1,180', '竞争策略人工确认'), 'thinking')
  await sleep(1500)

  pushWbMsg(`
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:8px;">
      <strong>${d.title}</strong> · ${d.subtitle}
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      ${d.strategies.map(st => `
        <div style="padding:10px; border:2px solid ${st.selected ? '#10B981' : 'var(--c-border)'}; border-radius:8px; background:${st.selected ? '#ECFDF3' : 'var(--c-surface)'}; cursor:pointer;" onclick="confirmStrategy('${st.key}')">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
            <strong style="font-size:12px;">策略${st.key}：${st.name}</strong>
            ${st.selected ? '<span class="badge badge-green" style="font-size:10px;">✓ 已确认</span>' : '<span class="badge badge-gray" style="font-size:10px;">点击选择</span>'}
          </div>
          <div style="font-size:11px; color:var(--c-text-secondary);">${st.desc}</div>
        </div>
      `).join('')}
    </div>
  `, 'bot')

  currentStep.value = 11
}

function confirmStrategy(key) {
  const d = mockReports[0].steps[10]
  d.strategies.forEach(s => (s.selected = s.key === key))
  // Re-render the last strategy message: push a confirmation
  pushWbMsg(`已选择 <strong>策略${key}</strong>，正在生成产品概念文件...`, 'thinking')
  setTimeout(async () => {
    // remove the "正在生成" thinking
    if (messages.value.length && messages.value[messages.value.length - 1].type === 'thinking') {
      popWbMsg()
    }
    await runFinalStep()
    running.value = false
    wbStatus.value = '就绪'
  }, 2500)
}

async function runFinalStep() {
  const d = mockReports[0].steps[11]
  pushWbMsg(thinkHtml('主智能体·整车产品概念生成', 'SPC-MAIN / 概念生成', '14.76 s', 'In 2,488 · Out 1,120', '生成产品概念文件'), 'thinking')
  await sleep(1500)

  pushWbMsg(`
    <div style="font-size:12px; color:var(--c-text-secondary); margin-bottom:6px;">
      <strong>${d.title}</strong> · ${d.subtitle}
    </div>
    <div class="msg-files">
      ${d.files.map(f => `
        <div class="msg-file-card">
          <div class="msg-file-icon" style="background:${f.color}">${f.name.split('.')[1].toUpperCase().slice(0, 2)}</div>
          <div class="msg-file-info">
            <div class="msg-file-name">${f.name}</div>
            <div class="msg-file-meta">${f.size}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `, 'bot')

  // Create as concept plan option
  pushWbMsg(`
    <div style="padding:14px; background:linear-gradient(135deg,#F5F3FF 0%, #EFF4FF 100%); border:1px solid #C4B5FD; border-radius:10px;">
      <div style="font-weight:700; font-size:13px; color:#4C1D95; margin-bottom:6px;">✨ 产品概念已生成完毕</div>
      <div style="font-size:12px; color:#5B21B6; margin-bottom:10px;">是否将本次生成结果创建为概念方案，流转至审核中心进行校验与发布？</div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-primary" onclick="createAsConceptPlan()">✓ 创建为概念方案</button>
        <button class="btn btn-secondary" onclick="window.__wbToast('演示：已忽略，可继续在调试工作台调整', 'warning')">暂不创建</button>
      </div>
    </div>
  `, 'bot')

  currentStep.value = 12
}

function createAsConceptPlan() {
  // 工作台流转生成原始文件（只读，需创建副本后才能编辑发布）
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const newId = 'RPT-' + now.slice(0, 10).replace(/-/g, '') + '-' + String(mockReports.length + 1).padStart(3, '0')
  const newReport = {
    id: newId,
    name: '长安启源A07 · 6-8万紧凑型PHEV轿车（调试生成）',
    brand: '长安启源',
    segment: '紧凑型轿车',
    priceRange: '6-8万',
    energy: 'PHEV',
    launchYear: '2028',
    status: 'readonly',
    fileType: 'original',
    creator: '规划部 · 张明',
    createdAt: now,
    publishedAt: null,
    versions: [{ v: 'v1.0', time: now, desc: '工作台初始生成版本' }],
    steps: generateSteps('长安启源A07', '入门紧凑产品圈'),
  }
  mockReports.push(newReport)
  emit('toast', '已创建原始文件 ' + newId + '，流转至审核中心', 'success')
  setTimeout(() => {
    emit('go-audit', newId)
  }, 800)
}

// 由于策略卡片和"创建概念方案"按钮通过 v-html 注入，需要把回调挂到 window 上
window.confirmStrategy = confirmStrategy
window.createAsConceptPlan = createAsConceptPlan
window.__wbToast = (text, type) => emit('toast', text, type)
</script>

<template>
  <div class="workbench">
    <!-- 边界条件 -->
    <div class="wb-panel">
      <div class="wb-panel-header">
        <span>边界条件</span>
        <button class="btn btn-ghost" style="padding:2px 8px; font-size:11px;" @click="resetBoundary">↺ 重置</button>
      </div>
      <div class="wb-config">
        <div class="wb-config-item">
          <div class="wb-config-label">品牌</div>
          <select class="form-select" @change="updateBoundary('brand', $event.target.value)">
            <option v-for="o in brandOpts" :key="o" :selected="o === boundary.brand">{{ o }}</option>
          </select>
        </div>
        <div class="wb-config-item">
          <div class="wb-config-label">细分市场</div>
          <select class="form-select" @change="updateBoundary('segment', $event.target.value)">
            <option v-for="o in segmentOpts" :key="o" :selected="o === boundary.segment">{{ o }}</option>
          </select>
        </div>
        <div class="wb-config-item">
          <div class="wb-config-label">能源类型</div>
          <select class="form-select" @change="updateBoundary('energy', $event.target.value)">
            <option v-for="o in energyOpts" :key="o" :selected="o === boundary.energy">{{ o }}</option>
          </select>
        </div>
        <div class="wb-config-item">
          <div class="wb-config-label">价格区间</div>
          <select class="form-select" @change="updateBoundary('priceRange', $event.target.value)">
            <option v-for="o in priceOpts" :key="o" :selected="o === boundary.priceRange">{{ o }}</option>
          </select>
        </div>
        <div class="wb-config-item">
          <div class="wb-config-label">上市年份</div>
          <select class="form-select" @change="updateBoundary('launchYear', $event.target.value)">
            <option v-for="o in yearOpts" :key="o" :selected="o === boundary.launchYear">{{ o }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 工作流编排 -->
    <div class="wb-panel">
      <div class="wb-panel-header">
        <span>工作流编排</span>
        <span class="text-xs text-muted">12 节点</span>
      </div>
      <div class="wb-canvas">
        <div class="wb-flow">
          <template v-for="(s, i) in workbenchSteps" :key="s.num">
            <div class="wb-node" :class="nodeClass(i)">
              <div class="wb-node-icon">{{ s.num }}</div>
              <div class="wb-node-name">{{ s.name }}</div>
              <div class="wb-node-status">{{ nodeStatus(i) }}</div>
            </div>
            <div v-if="i < workbenchSteps.length - 1" class="wb-arrow">↓</div>
          </template>
        </div>
      </div>
    </div>

    <!-- 调试工作台 -->
    <div class="wb-panel wb-debug">
      <div class="wb-panel-header">
        <span>调试工作台</span>
        <span class="text-xs text-muted">{{ wbStatus }}</span>
      </div>
      <div class="wb-debug-stream" ref="streamRef">
        <div class="msg msg-bot">你好！我是<strong>整车产品概念生成</strong>智能体。设置边界条件 → 上传 IPV 数据 → 在对话框输入任意文字即可启动工作流。</div>
        <div
          v-for="m in messages"
          :key="m.id"
          class="msg"
          :class="'msg-' + m.type"
          v-html="m.html"
        ></div>
      </div>
      <div class="wb-debug-input">
        <div v-if="attachedFile" class="attached-file">
          <span>📊</span>
          <span>{{ attachedFile.name }}</span>
          <span class="text-xs text-muted">· {{ attachedFile.size }}</span>
          <span class="close-x" @click="toggleAttach()">×</span>
        </div>
        <div class="input-row">
          <button
            class="attach-btn"
            :class="{ 'has-attached': !!attachedFile }"
            title="上传IPV发布版数据"
            @click="toggleAttach()"
          >＋</button>
          <textarea
            v-model="wbInput"
            placeholder="上传IPV发布版数据后，输入任意文字启动工作流"
            @keydown="if($event.key==='Enter' && !$event.shiftKey){$event.preventDefault(); sendWbMessage()}"
          ></textarea>
          <button class="send-btn" :disabled="running" @click="sendWbMessage()">➤</button>
        </div>
      </div>
    </div>
  </div>
</template>
