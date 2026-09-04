<script setup>
import { ref, computed } from 'vue'
import { RIVAL_CARS, RIVAL_CONFIG_GROUPS } from '../configData.js'

const emit = defineEmits(['toast'])

// ============== 数据 ==============
const cars = ref(RIVAL_CARS.map(c => ({ ...c })))

// ============== 筛选 ==============
const energyFilter = ref('all')
const statusFilter = ref('all')
const search = ref('')
const energyOptions = computed(() => [...new Set(cars.value.map(c => c.energy))])

const filtered = computed(() => cars.value.filter(c => {
  if (energyFilter.value !== 'all' && c.energy !== energyFilter.value) return false
  if (statusFilter.value !== 'all' && c.status !== statusFilter.value) return false
  if (search.value && !c.name.includes(search.value)) return false
  return true
}))

// KPI
const stats = computed(() => ({
  total: cars.value.length,
  done: cars.value.filter(c => c.status === '已采集').length,
  partial: cars.value.filter(c => c.status === '部分缺失').length,
  todo: cars.value.filter(c => c.status === '待补充').length,
}))

// ============== 数据同步（内部数据源） ==============
// 稳定伪随机（按车型名生成，保证每次查看结果一致）
function seeded(s) {
  let h = 7
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 9973
  return h
}
// 按价格段生成指导价区间（采集时兜底）
function mockMsrp(band, name) {
  const m = band.match(/(\d+)-(\d+)万/)
  if (!m) return '—'
  const h = seeded(name)
  const lo = Number(m[1]) + 0.2 + (h % 5) * 0.1
  const hi = Number(m[2]) - 0.2 - (h % 4) * 0.1
  return lo.toFixed(2) + '-' + hi.toFixed(2) + '万'
}
function collectRow(c) {
  c.status = '已采集'
  c.items = 640 + Math.floor(Math.random() * 90)
  c.versions = c.versions || 3 + seeded(c.name) % 4
  c.msrp = c.msrp || mockMsrp(c.price, c.name)
  c.updated = new Date().toISOString().slice(0, 10)
  emit('toast', '「' + c.name + '」配置数据采集完成', 'success')
}
function collectAll() {
  const todo = cars.value.filter(c => c.status !== '已采集')
  if (!todo.length) { emit('toast', '所有竞品数据均已完成采集', 'default'); return }
  todo.forEach(collectRow)
  emit('toast', '已对 ' + todo.length + ' 款车型完成数据采集补齐', 'success')
}

// ============== 车型详情（清单详情） ==============
const detailCar = ref(null)

// 搭载明细：按配置域分组，逐项生成搭载情况（稳定伪随机）
const NOTES = { 标配: '全系搭载', 选装: '中高配可选装', 未搭载: '—' }
const detailGroups = computed(() => {
  if (!detailCar.value) return []
  return RIVAL_CONFIG_GROUPS.map(g => ({
    cat: g.cat,
    rows: g.items.map(name => {
      const h = seeded(detailCar.value.name + name)
      const v = h % 10
      // 「部分缺失」车型：约 1/8 配置项数据缺失
      if (detailCar.value.status === '部分缺失' && v === 3) {
        return { name, fit: '数据缺失', note: '待数据源同步补充' }
      }
      const fit = v < 5 ? '标配' : v < 8 ? '选装' : '未搭载'
      return { name, fit, note: NOTES[fit] }
    }),
  }))
})
const detailFlat = computed(() => detailGroups.value.flatMap(g => g.rows))
const detailStat = computed(() => {
  const valid = detailFlat.value.filter(r => r.fit !== '数据缺失')
  const std = valid.filter(r => r.fit === '标配').length
  const opt = valid.filter(r => r.fit === '选装').length
  const miss = detailFlat.value.filter(r => r.fit === '数据缺失').length
  return { total: detailFlat.value.length, std, opt, miss, rate: valid.length ? Math.round((std / valid.length) * 100) : 0 }
})

function fitBadge(f) {
  return { 标配: 'badge-green', 选装: 'badge-blue', 未搭载: 'badge-gray', 数据缺失: 'badge-amber' }[f] || 'badge-gray'
}
function statusBadge(s) {
  return { 已采集: 'badge-green', 部分缺失: 'badge-amber', 待补充: 'badge-gray' }[s] || 'badge-gray'
}
</script>

<template>
  <!-- 工具栏 -->
  <div class="toolbar">
    <button class="btn btn-secondary" @click="collectAll">同步数据</button>
    <button class="btn btn-secondary" @click="emit('toast', '《竞品车型配置数据清单》导出成功', 'success')">导出清单</button>
  </div>

  <!-- KPI -->
  <div class="rd-stats">
    <span><b>{{ stats.total }}</b> 竞品车型</span>
    <span><b>{{ stats.done }}</b> 已采集</span>
    <span><b>{{ stats.partial }}</b> 部分缺失</span>
    <span><b>{{ stats.todo }}</b> 待补充</span>
  </div>

  <!-- 筛选栏 -->
  <div class="rd-filter-bar">
    <div class="rd-filter-item">
      <label>能源类型</label>
      <select class="form-select" v-model="energyFilter" style="width: 110px">
        <option value="all">全部</option>
        <option v-for="e in energyOptions" :key="e" :value="e">{{ e }}</option>
      </select>
    </div>
    <div class="rd-filter-item">
      <label>数据状态</label>
      <select class="form-select" v-model="statusFilter" style="width: 110px">
        <option value="all">全部</option><option>已采集</option><option>部分缺失</option><option>待补充</option>
      </select>
    </div>
    <div class="rd-filter-item">
      <label>搜索车型</label>
      <input class="form-input" v-model="search" placeholder="输入竞品车型名称搜索" style="width: 190px">
    </div>
  </div>

  <!-- 竞品车型清单 -->
  <div class="data-table">
    <div class="rd-card-title">竞品车型清单<span class="text-muted text-sm">共 {{ filtered.length }} 款</span></div>
    <table>
      <thead>
        <tr>
          <th>竞品车型</th><th style="width: 110px">指导价区间</th><th style="width: 80px">价格段</th><th style="width: 96px">级别</th>
          <th style="width: 82px">能源类型</th><th style="width: 76px">在售版本</th><th style="width: 92px">配置数据项</th>
          <th style="width: 88px">数据状态</th><th style="width: 96px">更新时间</th><th style="width: 130px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in filtered" :key="c.name">
          <td>
            <strong>{{ c.name }}</strong>
            <span v-if="c.ours" class="badge badge-purple" style="margin-left: 6px">本品对标</span>
          </td>
          <td>{{ c.msrp || '—' }}</td>
          <td>{{ c.price }}</td>
          <td>{{ c.level }}</td>
          <td>{{ c.energy }}</td>
          <td>{{ c.versions ? c.versions + ' 款' : '—' }}</td>
          <td>{{ c.items ? c.items + ' 项' : '—' }}</td>
          <td><span class="badge" :class="statusBadge(c.status)">{{ c.status }}</span></td>
          <td class="text-muted">{{ c.updated }}</td>
          <td>
            <a class="rd-link" @click="detailCar = c">查看</a>
            <a v-if="c.status !== '已采集'" class="rd-link" style="margin-left: 8px" @click="collectRow(c)">采集</a>
            <a class="rd-link" style="margin-left: 8px" @click="emit('toast', '「' + c.name + '」配置数据导出成功', 'success')">下载</a>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="rd-note">
      数据来源：CAM / 汽车之家 / 威尔森，周期性采集更新；数据状态为「部分缺失 / 待补充」的车型可执行「采集」或「数据采集补齐」。
    </div>
  </div>

  <!-- 清单详情弹窗 -->
  <div v-if="detailCar" class="modal-mask" @click.self="detailCar = null">
    <div class="modal rd-detail-modal" style="width: 760px; max-width: calc(100vw - 48px)">
      <div class="modal-title">
        {{ detailCar.name }}
        <span v-if="detailCar.ours" class="badge badge-purple" style="margin-left: 8px">本品对标</span>
      </div>

      <!-- 基本信息 -->
      <div class="rd-sec-title">基本信息</div>
      <div class="rd-info-grid">
        <div class="rd-info-item"><label>价格段</label><span>{{ detailCar.price }}</span></div>
        <div class="rd-info-item"><label>指导价区间</label><span>{{ detailCar.msrp || '待同步' }}</span></div>
        <div class="rd-info-item"><label>级别</label><span>{{ detailCar.level }}</span></div>
        <div class="rd-info-item"><label>能源类型</label><span>{{ detailCar.energy }}</span></div>
        <div class="rd-info-item"><label>在售版本</label><span>{{ detailCar.versions ? detailCar.versions + ' 款' : '待采集' }}</span></div>
        <div class="rd-info-item"><label>配置数据项</label><span>{{ detailCar.items ? detailCar.items + ' 项' : '待采集' }}</span></div>
        <div class="rd-info-item">
          <label>数据状态</label>
          <span><span class="badge" :class="statusBadge(detailCar.status)">{{ detailCar.status }}</span></span>
        </div>
        <div class="rd-info-item"><label>更新时间</label><span>{{ detailCar.updated }}</span></div>
      </div>

      <!-- 配置搭载明细 -->
      <template v-if="detailCar.status === '待补充'">
        <div class="rd-empty">
          <div class="rd-empty-title">该车型配置数据待采集</div>
          <div class="rd-empty-desc">采集完成后可查看各配置域的搭载明细（标配 / 选装 / 未搭载）。</div>
          <button class="btn btn-primary" style="height: 30px; font-size: 12px" @click="collectRow(detailCar)">立即采集</button>
        </div>
      </template>
      <template v-else>
        <div class="rd-sec-title">配置搭载明细<span class="text-muted text-sm" style="font-weight: 400; margin-left: 8px">按配置域分组</span></div>
        <div class="rd-detail-scroll">
          <table class="rd-detail-table">
            <thead><tr><th style="width: 180px">配置项</th><th style="width: 90px">搭载情况</th><th>搭载说明</th></tr></thead>
            <tbody>
              <template v-for="g in detailGroups" :key="g.cat">
                <tr class="rd-cat-row"><td :colspan="3">{{ g.cat }}</td></tr>
                <tr v-for="r in g.rows" :key="r.name">
                  <td>{{ r.name }}</td>
                  <td><span class="badge" :class="fitBadge(r.fit)">{{ r.fit }}</span></td>
                  <td class="text-muted">{{ r.note }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div class="rd-stat-bar">
          <span>标配 <b>{{ detailStat.std }}</b> 项</span>
          <span>选装 <b>{{ detailStat.opt }}</b> 项</span>
          <span>未搭载 <b>{{ detailStat.total - detailStat.std - detailStat.opt - detailStat.miss }}</b> 项</span>
          <span v-if="detailStat.miss">数据缺失 <b>{{ detailStat.miss }}</b> 项</span>
          <span class="rd-stat-rate">标配率 <b>{{ detailStat.rate }}%</b></span>
        </div>
        <div class="rd-note" style="padding: 8px 0 0">
          数据来源：CAM / 汽车之家 / 威尔森；更新于 {{ detailCar.updated }}。
          <template v-if="detailCar.status === '部分缺失'">该车型部分配置项数据缺失，可执行「同步数据」更新。</template>
        </div>
      </template>

      <div class="modal-actions">
        <button class="btn btn-secondary" @click="detailCar = null">关闭</button>
        <button class="btn btn-secondary" v-if="detailCar.status !== '待补充'" @click="emit('toast', '「' + detailCar.name + '」配置数据导出成功', 'success')">下载数据</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rd-stats {
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px;
  padding: 12px 18px; font-size: 13px; color: var(--c-text-secondary);
  display: flex; gap: 26px; flex-wrap: wrap; margin-bottom: 14px;
}
.rd-stats b { font-size: 18px; color: var(--c-primary); margin-right: 4px; }
.rd-card-title {
  font-size: 14px; font-weight: 700; padding: 14px 16px 12px;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  border-bottom: 1px solid var(--c-border);
}
.rd-note { font-size: 12px; color: var(--c-text-muted); padding: 12px 16px; line-height: 1.8; }
.rd-link { color: var(--c-primary); font-size: 13px; cursor: pointer; }
.rd-link:hover { text-decoration: underline; }

/* 筛选栏 */
.rd-filter-bar {
  display: flex; gap: 14px; align-items: flex-end; flex-wrap: wrap;
  background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px;
  padding: 12px 16px; margin-bottom: 14px;
}
.rd-filter-item { display: flex; flex-direction: column; gap: 5px; }
.rd-filter-item label { font-size: 12px; color: var(--c-text-muted); font-weight: 600; }

/* 详情弹窗 */
.rd-detail-modal { display: flex; flex-direction: column; max-height: calc(100vh - 80px); overflow: hidden; }
.rd-sec-title {
  font-size: 13px; font-weight: 700; color: var(--c-text-secondary);
  margin: 14px 0 8px; padding-left: 8px; border-left: 3px solid var(--c-primary);
}
.rd-info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 14px; }
.rd-info-item {
  background: var(--c-surface-2); border: 1px solid var(--c-border-light); border-radius: 8px;
  padding: 8px 12px; font-size: 12.5px;
}
.rd-info-item label { display: block; font-size: 11px; color: var(--c-text-muted); margin-bottom: 4px; }
.rd-info-item span { font-weight: 600; color: var(--c-text); }
.rd-detail-scroll { overflow-y: auto; border: 1px solid var(--c-border); border-radius: 8px; }
.rd-detail-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.rd-detail-table th {
  background: var(--c-surface-2); color: var(--c-text-secondary); padding: 8px 12px;
  text-align: left; font-weight: 600; border-bottom: 1px solid var(--c-border);
  position: sticky; top: 0; z-index: 1;
}
.rd-detail-table td { padding: 7px 12px; border-bottom: 1px solid var(--c-border-light); }
.rd-cat-row td {
  background: var(--c-surface-2); color: var(--c-text-secondary);
  font-weight: 700; font-size: 12px; padding: 6px 12px;
}
.rd-stat-bar {
  display: flex; gap: 18px; align-items: center; flex-wrap: wrap;
  font-size: 12px; color: var(--c-text-secondary); padding: 10px 2px 0;
}
.rd-stat-bar b { color: var(--c-text); font-size: 13px; }
.rd-stat-rate { margin-left: auto; font-weight: 600; }
.rd-stat-rate b { color: var(--c-primary); font-size: 15px; }
.rd-empty { text-align: center; padding: 28px 0 20px; }
.rd-empty-title { font-size: 14px; font-weight: 700; color: var(--c-text-secondary); margin-bottom: 6px; }
.rd-empty-desc { font-size: 12px; color: var(--c-text-muted); margin-bottom: 14px; }
</style>
