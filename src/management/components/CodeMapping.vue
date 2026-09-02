<script setup>
import { ref, computed } from 'vue'
import { CODE_MAPPING, CODE_OPTIONS } from '../configData.js'

const emit = defineEmits(['toast'])

const rows = ref(CODE_MAPPING.map(r => ({ ...r })))
const editIdx = ref(-1)
const editForm = ref({ tcode: '', tname: '' })
const conflictIdx = ref(-1)

const total = computed(() => 186)
const mapped = computed(() => 172)
const conflicts = computed(() => rows.value.filter(r => r.status === '多对一').length + 7)
const unmapped = computed(() => rows.value.filter(r => r.status === '未映射').length + 5)

function ringColor(v, max) {
  if (v / max >= 0.9) return '#10B981'
  if (v / max >= 0.3) return '#F59E0B'
  return '#EF4444'
}

function startEdit(idx) {
  editIdx.value = idx
  const r = rows.value[idx]
  // 已有映射时回填为「码 名称」完整文本，保证编辑框可读
  editForm.value = { tcode: r.tcode ? (r.tname ? r.tcode + ' ' + r.tname : r.tcode) : '', tname: r.tname }
}

function saveEdit() {
  const r = rows.value[editIdx.value]
  const pick = (editForm.value.tcode || '').trim()
  if (pick) {
    const [code, ...rest] = pick.split(/\s+/)
    let name = rest.join(' ') || ''
    if (!name) {
      // 仅输入编码时，从候选码表补全名称
      const hit = CODE_OPTIONS.find(o => o.split(/\s+/)[0] === code)
      if (hit) name = hit.split(/\s+/).slice(1).join(' ')
    }
    r.tcode = code
    r.tname = name || r.tname
    if (r.status === '未映射') {
      r.status = '一对一'
      r.reason = ''
      emit('toast', '映射关系已保存，未映射项 -1', 'success')
    } else {
      emit('toast', '映射关系已保存', 'success')
    }
  }
  editIdx.value = -1
}

function generateTech() {
  emit('toast', '工程技术配置表生成中：已按二段码汇总 186 项配置 → 172 个工程总成…', 'default')
  setTimeout(() => emit('toast', '《工程技术配置表》已生成并通过同步校验', 'success'), 1200)
}

function statusBadge(s) {
  return { '一对一': 'badge-green', '多对一': 'badge-amber', '未映射': 'badge-red' }[s] || 'badge-gray'
}
</script>

<template>
  <div class="toolbar">
    <button class="btn btn-primary" @click="generateTech">生成工程技术配置表</button>
    <button class="btn btn-secondary" @click="emit('toast', '同步状态已刷新：EATP原子库 → 二段码映射，最近同步 10 分钟前', 'success')">同步状态</button>
  </div>

  <!-- KPI 行 -->
  <div class="cm-kpi-row">
    <div class="cm-kpi-card" v-for="k in [
      { label: '映射总数', value: total, desc: '项', ratio: 1, color: '#155EEF' },
      { label: '已映射', value: mapped, desc: '92%', ratio: 0.92, color: '#10B981' },
      { label: '冲突(多对一)', value: conflicts, desc: '项', ratio: 0.08, color: '#F59E0B' },
      { label: '未映射', value: unmapped, desc: '项', ratio: 0.06, color: '#EF4444' },
    ]" :key="k.label">
      <div class="cm-kpi-ring">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#EAECF0" stroke-width="6" />
          <circle cx="32" cy="32" r="28" fill="none" :stroke="k.color" stroke-width="6"
            :stroke-dasharray="175.9" :stroke-dashoffset="175.9 * (1 - k.ratio)" transform="rotate(-90 32 32)" stroke-linecap="round" />
        </svg>
      </div>
      <div class="cm-kpi-info">
        <div class="cm-kpi-label">{{ k.label }}</div>
        <div class="cm-kpi-value">{{ k.value }}</div>
        <div class="cm-kpi-desc">{{ k.desc }}</div>
      </div>
    </div>
  </div>

  <!-- 映射关系表 -->
  <div class="data-table">
    <div class="cm-card-title">映射关系维护<span class="text-muted text-sm">共 {{ rows.length }} 项</span></div>
    <table>
      <thead>
        <tr><th>市场配置编码</th><th>配置名称</th><th>工程二段码</th><th>二段码名称</th><th>对应状态</th><th>冲突原因</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in rows" :key="r.code" :class="{ 'cm-row-conflict': r.status === '多对一', 'cm-row-unmapped': r.status === '未映射' }">
          <td>{{ r.code }}</td>
          <td>{{ r.name }}</td>
          <template v-if="editIdx === i">
            <td colspan="2">
              <input class="form-input cm-code-input" list="cm-tcode-options" v-model="editForm.tcode"
                     placeholder="请选择或输入工程二段码" @keyup.enter="saveEdit">
              <datalist id="cm-tcode-options">
                <option v-for="o in CODE_OPTIONS" :key="o" :value="o">{{ o }}</option>
              </datalist>
            </td>
            <td><span class="badge badge-blue">编辑中</span></td>
            <td>—</td>
            <td>
              <a class="cm-link" @click="saveEdit">保存</a>
              <a class="cm-link" style="margin-left: 6px; color: #B42318" @click="editIdx = -1">取消</a>
            </td>
          </template>
          <template v-else>
            <td v-if="r.tcode">{{ r.tcode }}</td>
            <td v-else class="text-muted">—</td>
            <td v-if="r.tname">{{ r.tname }}</td>
            <td v-else class="text-muted">—</td>
            <td><span class="badge" :class="statusBadge(r.status)">{{ r.status }}{{ r.status === '多对一' ? ' ⚠' : '' }}{{ r.status === '未映射' ? ' ✕' : '' }}</span></td>
            <td>{{ r.reason || '—' }}</td>
            <td>
              <a v-if="r.status !== '未映射' && r.status !== '多对一'" class="cm-link" @click="startEdit(i)">编辑</a>
              <a v-if="r.status === '多对一'" class="cm-link" @click="conflictIdx = i">查看冲突</a>
              <a v-if="r.status === '未映射'" class="cm-link" @click="startEdit(i)">建立映射</a>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 冲突详情弹窗 -->
  <div v-if="conflictIdx > -1" class="modal-mask" @click.self="conflictIdx = -1">
    <div class="modal" style="max-width: 620px">
      <div class="modal-title">多对一冲突详情 · {{ rows[conflictIdx].code }}</div>
      <div class="modal-desc">市场侧多个配置编码指向同一工程二段码，需工程侧确认状态码拆分规则</div>
      <div class="cm-conflict-box">
        <div class="cm-conflict-side">
          <div class="cm-side-title">市场侧配置</div>
          <div class="cm-node market">
            <div class="cm-node-code">{{ rows[conflictIdx].code }}</div>
            <div class="cm-node-name">{{ rows[conflictIdx].name }}</div>
          </div>
          <div class="cm-node market" v-if="rows.find(r => r.tcode === rows[conflictIdx].tcode && r.code !== rows[conflictIdx].code)">
            <div class="cm-node-code">{{ rows.find(r => r.tcode === rows[conflictIdx].tcode && r.code !== rows[conflictIdx].code).code }}</div>
            <div class="cm-node-name">{{ rows.find(r => r.tcode === rows[conflictIdx].tcode && r.code !== rows[conflictIdx].code).name }}</div>
          </div>
        </div>
        <div class="cm-conflict-arrow">→</div>
        <div class="cm-conflict-side">
          <div class="cm-side-title">工程二段码</div>
          <div class="cm-node tech">
            <div class="cm-node-code">{{ rows[conflictIdx].tcode }}</div>
            <div class="cm-node-name">{{ rows[conflictIdx].tname }}</div>
          </div>
        </div>
      </div>
      <div class="cm-conflict-reason">冲突原因：{{ rows[conflictIdx].reason }}</div>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="conflictIdx = -1">关闭</button>
        <button class="btn btn-primary" @click="conflictIdx = -1; emit('toast', '已发起工程侧确认', 'success')">发起工程确认</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cm-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.cm-kpi-card {
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 12px;
  padding: 16px; display: flex; align-items: center; gap: 14px;
}
.cm-kpi-label { font-size: 12px; color: var(--c-text-muted); }
.cm-kpi-value { font-size: 24px; font-weight: 700; line-height: 1.2; }
.cm-kpi-desc { font-size: 11px; color: var(--c-text-secondary); }
.cm-code-input { min-width: 240px; height: 30px; font-size: 12px; padding: 0 8px; }
.cm-card-title {
  font-size: 14px; font-weight: 700; padding: 14px 16px 12px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--c-border);
}
.cm-link { color: var(--c-primary); font-size: 13px; cursor: pointer; }
.cm-link:hover { text-decoration: underline; }
.cm-row-conflict { background: #FFFDF5; }
.cm-row-unmapped { background: #FEFAFA; }

/* conflict modal */
.cm-conflict-box { display: flex; align-items: center; gap: 20px; justify-content: center; margin: 16px 0; }
.cm-side-title { font-size: 11px; color: var(--c-text-muted); font-weight: 700; margin-bottom: 8px; text-align: center; }
.cm-node {
  border: 1.5px solid var(--c-border); border-radius: 10px; padding: 10px 16px; text-align: center;
  margin-bottom: 8px; min-width: 150px;
}
.cm-node.market { border-color: #B9D0FF; background: #EFF4FF; }
.cm-node.tech { border-color: #FDE68A; background: #FFFAEB; }
.cm-node-code { font-size: 12px; font-weight: 700; color: var(--c-text-secondary); }
.cm-node-name { font-size: 13px; font-weight: 600; margin-top: 2px; }
.cm-conflict-arrow { font-size: 22px; color: var(--c-text-muted); }
.cm-conflict-reason {
  background: var(--c-surface-2); border-radius: 8px; padding: 10px 14px;
  font-size: 13px; color: var(--c-text-secondary);
}
</style>
