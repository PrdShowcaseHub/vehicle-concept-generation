<script setup>
import { ref, computed } from 'vue'
import { EQUIP_DATA, EQUIP_CANDIDATES } from '../configData.js'

const emit = defineEmits(['toast'])

const categoryFilter = ref('all')
const search = ref('')
const rows = ref(EQUIP_DATA.map(e => ({ ...e })))
const showAddModal = ref(false)
const picked = ref([])
const pickerSearch = ref('')

const filtered = computed(() => rows.value.filter(r => {
  if (categoryFilter.value !== 'all' && r.category !== categoryFilter.value) return false
  if (search.value && !r.name.includes(search.value)) return false
  return true
}))
// 样本车型数：不同配置按有效样本统计存在微小差异，标题展示当前列表的样本区间
const sampleCountLabel = computed(() => {
  const vals = filtered.value.map(r => r.sampleCount).filter(Boolean)
  if (!vals.length) return '—'
  const lo = Math.min(...vals), hi = Math.max(...vals)
  return lo === hi ? lo + ' 款' : lo + '~' + hi + ' 款'
})

function growth(r) {
  if (r.y25 === 0) return null
  return ((r.y26 - r.y25) / r.y25 * 100)
}

function barClass(v) {
  if (v >= 60) return 'high'
  if (v >= 30) return 'mid'
  return 'low'
}

function removeRow(idx) {
  rows.value.splice(idx, 1)
  emit('toast', '配置已移除出竞争圈清单', 'success')
}

const candidates = computed(() => {
  const existing = rows.value.map(r => r.name)
  return EQUIP_CANDIDATES.filter(c => !existing.includes(c) && (!pickerSearch.value || c.includes(pickerSearch.value)))
})

function togglePick(name) {
  const i = picked.value.indexOf(name)
  if (i > -1) picked.value.splice(i, 1)
  else picked.value.push(name)
}

function confirmAdd() {
  picked.value.forEach(name => {
    rows.value.push({ name, category: '趋势', sampleCount: 18 + Math.floor(Math.random() * 9), y24: 6, y25: 9, y26: 13 })
  })
  emit('toast', `已添加 ${picked.value.length} 项配置（默认归为趋势配置，按阈值自动归类）`, 'success')
  picked.value = []
  showAddModal.value = false
}
</script>

<template>
  <div class="toolbar">
    <button class="btn btn-primary" @click="showAddModal = true">＋ 添加配置</button>
    <button class="btn btn-secondary" @click="emit('toast', '数据已刷新（来源：CAM / PMS多维分析系统）', 'success')">刷新数据</button>
    <button class="btn btn-secondary" @click="emit('toast', '《竞争圈配置装备率清单》导出成功', 'success')">导出清单</button>
  </div>

  <!-- 筛选栏 -->
  <div class="er-filter-bar">
    <div class="er-filter-item">
      <label>车格类别</label>
      <select class="form-select" style="width: 120px"><option>全部</option><option>紧凑型SUV</option><option>中型SUV</option><option>紧凑型轿车</option><option>中型轿车</option><option>MPV</option></select>
    </div>
    <div class="er-filter-item">
      <label>细分市场</label>
      <select class="form-select" style="width: 100px"><option>全部</option><option>A级SUV</option><option>B级SUV</option><option>A级轿车</option><option>B级轿车</option></select>
    </div>
    <div class="er-filter-item">
      <label>价格段</label>
      <select class="form-select" style="width: 100px"><option>全部</option><option>8-11万</option><option>11-14万</option><option>14-18万</option><option>18-25万</option><option>25万以上</option></select>
    </div>
    <div class="er-filter-item">
      <label>配置类别</label>
      <select class="form-select" v-model="categoryFilter" style="width: 150px">
        <option value="all">全部</option><option value="基础">基础（≥60%）</option>
        <option value="差异">差异（30-60%）</option><option value="趋势">趋势（15-30%+增长）</option>
      </select>
    </div>
    <div class="er-filter-item">
      <label>搜索配置项</label>
      <input class="form-input" v-model="search" placeholder="输入配置名称搜索" style="width: 170px">
    </div>
  </div>

  <!-- 竞争圈配置装备率清单 -->
  <div class="data-table">
    <div class="er-card-title">竞争圈配置装备率清单<span class="text-muted text-sm">{{ filtered.length }} 项配置 | 样本车型 {{ sampleCountLabel }}</span></div>
    <table>
      <thead>
        <tr>
          <th style="width: 120px">配置项</th><th style="width: 76px">类别</th><th style="width: 90px" title="样本车型数：当前细分市场+价格段下纳入装备率统计的全部在售车型型号数（装备率分母）">样本车型数</th>
          <th>2024年装备率</th><th>2025年装备率</th><th>2026年装备率</th>
          <th style="width: 100px">增长率(25→26)</th><th style="width: 44px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in filtered" :key="r.name">
          <td>{{ r.name }}</td>
          <td><span class="badge" :class="{ 基础: 'badge-green', 差异: 'badge-amber', 趋势: 'badge-purple' }[r.category]">{{ r.category }}</span></td>
          <td>{{ r.sampleCount }}</td>
          <td v-for="y in ['y24', 'y25', 'y26']" :key="y">
            <div class="er-bar-wrap">
              <div class="er-bar-track">
                <div class="er-bar-zone z-base"></div>
                <div class="er-bar-zone z-diff"></div>
                <div class="er-bar-threshold t60"></div>
                <div class="er-bar-threshold t30"></div>
                <div class="er-bar-fill" :class="barClass(r[y])" :style="{ width: r[y] + '%' }"></div>
              </div>
              <span class="er-bar-text">{{ r[y] }}%</span>
            </div>
          </td>
          <td><span class="er-growth-up" v-if="growth(r) !== null">+{{ growth(r).toFixed(1) }}% ↗</span></td>
          <td><button class="er-row-del" title="移除该配置" @click="removeRow(i)">×</button></td>
        </tr>
      </tbody>
    </table>
    <div class="er-legend">
      装备率阈值（按 2026 年最新值分类）：
      <span><b>≥60%</b> 基础配置（竞品都给了，不给丧失竞争力）</span>
      <span><b>30-60%</b> 差异配置（构建产品竞争力，实现溢价）</span>
      <span><b>15-30%+增长</b> 趋势配置（未来价值方向）</span>
      <span><b>&lt;15%</b> 未进入竞争圈</span>
    </div>
    <div class="er-legend-bar"><span class="lg-base">━━ 60% 基础线</span><span class="lg-diff">━━ 30% 差异线</span></div>
  </div>

  <div class="er-output">
    <strong>→ 输出物：</strong>本清单将自动同步至「配置管理 → 量价管理」与「配置组合方案 → 配置宽度设定」页面，按阈值自动归类为基础 / 差异 / 趋势三类配置清单。
  </div>

  <!-- 添加配置弹窗 -->
  <div v-if="showAddModal" class="modal-mask" @click.self="showAddModal = false">
    <div class="modal" style="max-width: 560px">
      <div class="modal-title">添加配置项至竞争圈清单</div>
      <div class="modal-desc">从配置原子库选择配置项，拉取近三年装备率数据后自动按阈值归类</div>
      <input class="form-input" v-model="pickerSearch" placeholder="搜索配置项..." style="margin-bottom: 12px">
      <div class="er-picker-list">
        <div v-for="c in candidates" :key="c" class="er-picker-item" :class="{ picked: picked.includes(c) }" @click="togglePick(c)">
          <span>{{ c }}</span><span v-if="picked.includes(c)" class="er-pick-check">✓</span>
        </div>
        <div v-if="!candidates.length" class="text-muted" style="padding: 20px; text-align: center">无匹配配置项</div>
      </div>
      <div class="modal-actions">
        <span class="text-muted text-sm" style="margin-right: auto">已选 {{ picked.length }} 项</span>
        <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
        <button class="btn btn-primary" :disabled="!picked.length" @click="confirmAdd">确认添加</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.er-filter-bar {
  display: flex; align-items: flex-end; gap: 14px; flex-wrap: wrap;
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px;
  padding: 14px 16px; margin-bottom: 16px;
}
.er-filter-item { display: flex; flex-direction: column; gap: 5px; }
.er-filter-item label { font-size: 12px; color: var(--c-text-muted); font-weight: 600; }
.er-card-title {
  font-size: 14px; font-weight: 700; padding: 14px 16px 12px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--c-border);
}

/* 装备率条 */
.er-bar-wrap { display: flex; align-items: center; gap: 8px; min-width: 170px; }
.er-bar-track { flex: 1; height: 14px; background: #F2F4F7; border-radius: 7px; position: relative; overflow: hidden; }
.er-bar-zone { position: absolute; top: 0; bottom: 0; }
.er-bar-zone.z-base { right: 0; width: 40%; background: #ECFDF3; }
.er-bar-zone.z-diff { right: 40%; width: 30%; background: #FFFAEB; }
.er-bar-threshold { position: absolute; top: 0; bottom: 0; width: 1.5px; }
.er-bar-threshold.t60 { left: 60%; background: #10B981; }
.er-bar-threshold.t30 { left: 30%; background: #F59E0B; }
.er-bar-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 7px 0 0 7px; transition: width 0.4s; }
.er-bar-fill.high { background: linear-gradient(90deg, #10B981 0%, #34D399 100%); }
.er-bar-fill.mid { background: linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%); }
.er-bar-fill.low { background: linear-gradient(90deg, #7C3AED 0%, #A78BFA 100%); }
.er-bar-text { font-size: 12px; font-weight: 700; min-width: 36px; text-align: right; }
.er-growth-up { color: #067647; font-weight: 600; font-size: 12.5px; }
.er-row-del {
  width: 22px; height: 22px; border-radius: 6px; background: #FEF3F2; color: #B42318;
  font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
}
.er-legend { padding: 12px 16px; font-size: 12px; color: var(--c-text-secondary); display: flex; gap: 14px; flex-wrap: wrap; }
.er-legend b { color: var(--c-text); }
.er-legend-bar { padding: 0 16px 14px; display: flex; gap: 18px; font-size: 11px; }
.lg-base { color: #10B981; font-weight: 600; }
.lg-diff { color: #F59E0B; font-weight: 600; }
.er-output {
  background: linear-gradient(135deg, #EFF4FF 0%, #F4F0FF 100%); border: 1px solid #B9D0FF;
  border-radius: 8px; padding: 12px 16px; font-size: 13px; margin-top: 16px; line-height: 1.7;
}

/* picker */
.er-picker-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-height: 300px; overflow-y: auto; }
.er-picker-item {
  display: flex; align-items: center; justify-content: space-between; padding: 8px 10px;
  border: 1px solid var(--c-border); border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.15s;
}
.er-picker-item:hover { border-color: var(--c-primary); color: var(--c-primary); }
.er-picker-item.picked { background: var(--c-primary-light); border-color: var(--c-primary); color: var(--c-primary); font-weight: 600; }
.er-pick-check { font-size: 12px; }
</style>
