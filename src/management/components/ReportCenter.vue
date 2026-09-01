<script setup>
import { ref, computed } from 'vue'
import {
  mockReports,
  statusMeta,
  renderLineChart,
  renderPieChart,
  renderDonutChart,
  renderBarChart,
} from '../data.js'

const emit = defineEmits(['toast', 'open-report'])
const props = defineProps({ role: { type: String, default: 'admin' } })

const reportsFilter = ref({ keyword: '', status: 'all' })
const reportsPage = ref(1)
const reportsPageSize = ref(5)

const published = computed(() => mockReports.filter(r => r.status === 'published'))

// 维度统计
const brandCount = computed(() => {
  const obj = {}
  published.value.forEach(r => { obj[r.brand] = (obj[r.brand] || 0) + 1 })
  return obj
})
const energyCount = computed(() => {
  const obj = {}
  published.value.forEach(r => { obj[r.energy] = (obj[r.energy] || 0) + 1 })
  return obj
})
const segmentCount = computed(() => {
  const obj = {}
  published.value.forEach(r => { obj[r.segment] = (obj[r.segment] || 0) + 1 })
  return obj
})
const priceCount = computed(() => {
  const obj = {}
  published.value.forEach(r => { obj[r.priceRange] = (obj[r.priceRange] || 0) + 1 })
  return obj
})
const topBrand = computed(() => {
  const e = Object.entries(brandCount.value).sort((a, b) => b[1] - a[1])[0]
  return e || ['—', 0]
})
const topEnergy = computed(() => {
  const e = Object.entries(energyCount.value).sort((a, b) => b[1] - a[1])[0]
  return e || ['—', 0]
})

// 月度趋势
const monthTrend = computed(() => {
  const monthKeys = ['06月', '07月', '08月']
  return monthKeys.map(m => ({
    m,
    v: published.value.filter(r => (r.publishedAt || '').includes('2026-' + m.replace('月', '').padStart(2, '0'))).length,
  }))
})
const maxTrend = computed(() => Math.max(1, ...monthTrend.value.map(t => t.v)))
const downloadTrend = computed(() => [
  { m: '06月', v: published.value.filter(r => (r.publishedAt || '').includes('2026-06')).reduce((s, r) => s + (r.downloads || 0), 0) + 18 },
  { m: '07月', v: published.value.filter(r => (r.publishedAt || '').includes('2026-07')).reduce((s, r) => s + (r.downloads || 0), 0) + 22 },
  { m: '08月', v: published.value.filter(r => (r.publishedAt || '').includes('2026-08')).reduce((s, r) => s + (r.downloads || 0), 0) + 15 },
])
const maxDl = computed(() => Math.max(1, ...downloadTrend.value.map(t => t.v)))

const hotList = computed(() => published.value.slice().sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 3))
const recentList = computed(() => published.value.slice().sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')).slice(0, 4))

const stats = computed(() => [
  { label: '已发布报告', value: published.value.length, trend: '+1 本周', up: true },
  { label: '累计下载', value: published.value.reduce((s, r) => s + (r.downloads || 0), 0), trend: '+24 本周', up: true },
  { label: '平均生成耗时', value: '3.2 天', trend: '0.4 ↓', up: true },
  { label: '活跃用户', value: '36', trend: '+5 本周', up: true },
])

// 过滤 + 分页
const filtered = computed(() => published.value.filter(r => {
  const kw = reportsFilter.value.keyword.trim()
  const matchKw = !kw || r.name.includes(kw) || r.brand.includes(kw) || r.id.includes(kw)
  const matchStatus = reportsFilter.value.status === 'all' ? true : r.status === reportsFilter.value.status
  return matchKw && matchStatus
}))
const total = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / reportsPageSize.value)))
const curPage = computed(() => reportsPage.value)
const pageStart = computed(() => (curPage.value - 1) * reportsPageSize.value)
const pageRows = computed(() => filtered.value.slice(pageStart.value, pageStart.value + reportsPageSize.value))

// 页码按钮（最多显示 7 个，当前页居中）
const pageNumbers = computed(() => {
  const nums = []
  const tp = totalPages.value
  const cp = curPage.value
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) nums.push(i)
  } else {
    nums.push(1)
    const left = Math.max(2, cp - 2)
    const right = Math.min(tp - 1, cp + 2)
    if (left > 2) nums.push('...')
    for (let i = left; i <= right; i++) nums.push(i)
    if (right < tp - 1) nums.push('...')
    nums.push(tp)
  }
  return nums
})
const rangeStart = computed(() => total.value === 0 ? 0 : (curPage.value - 1) * reportsPageSize.value + 1)
const rangeEnd = computed(() => Math.min(curPage.value * reportsPageSize.value, total.value))

// 维度占比条
function distBars(obj, color) {
  const t = Object.values(obj).reduce((a, b) => a + b, 0) || 1
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
    const pct = Math.round(v / t * 100)
    return { k, v, pct, color }
  })
}

function statusBadgeClass(r) {
  return 'badge-' + statusMeta(r.status).color
}

function filterReports(keyword) {
  reportsFilter.value.keyword = keyword
  reportsPage.value = 1
}
function gotoReportsPage(p) {
  reportsPage.value = p
}
function changeReportsPageSize(size) {
  reportsPageSize.value = parseInt(size, 10)
  reportsPage.value = 1
}
function openReport(id) {
  emit('open-report', id)
}
</script>

<template>
  <div>
    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-trend" :class="s.up ? 'up' : 'down'">{{ s.trend }}</div>
      </div>
    </div>

    <!-- 列表主体 -->
    <div class="toolbar">
      <div class="search-box">
        <span>🔍</span>
        <input
          placeholder="搜索报告名称、品牌、编号..."
          :value="reportsFilter.keyword"
          @input="filterReports($event.target.value)"
        />
      </div>
      <div class="text-xs text-muted" style="margin-left:auto; align-self:center;">共 {{ published.length }} 份已发布报告</div>
      <button class="btn btn-secondary" @click="emit('toast', '演示：导出报告列表 CSV', 'success')">📥 导出列表</button>
    </div>

    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>报告编号</th>
            <th>方案名称</th>
            <th>品牌</th>
            <th>细分市场</th>
            <th>价格区间</th>
            <th>能源</th>
            <th>状态</th>
            <th>下载量</th>
            <th>创建时间</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="pageRows.length">
            <tr v-for="r in pageRows" :key="r.id" @click="openReport(r.id)">
              <td><span class="text-sm text-muted">{{ r.id }}</span></td>
              <td><strong>{{ r.name }}</strong></td>
              <td>{{ r.brand }}</td>
              <td>{{ r.segment }}</td>
              <td>{{ r.priceRange }}</td>
              <td><span class="badge badge-purple" style="white-space:nowrap;">{{ r.energy }}</span></td>
              <td><span class="badge" :class="statusBadgeClass(r)" style="white-space:nowrap;">{{ statusMeta(r.status).label }}</span></td>
              <td><strong style="color:var(--c-primary)">{{ r.downloads || 0 }}</strong></td>
              <td class="text-sm text-muted">{{ r.createdAt }}</td>
              <td class="text-sm text-muted">{{ r.publishedAt || '—' }}</td>
              <td style="white-space:nowrap;">
                <button class="btn btn-ghost" @click.stop="openReport(r.id)">查看</button>
                <button class="btn btn-ghost" @click.stop="emit('toast', '演示：下载 ' + r.name, 'success')">下载</button>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="11">
              <div class="empty-state">
                <div class="empty-state-icon">📂</div>
                <div class="empty-state-text">无匹配报告</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <div class="page-info">第 {{ rangeStart }}-{{ rangeEnd }} 条 / 共 {{ total }} 条</div>
        <div class="page-controls">
          <button class="page-btn" :disabled="curPage <= 1" @click="gotoReportsPage(curPage - 1)">‹ 上一页</button>
          <template v-for="(n, i) in pageNumbers" :key="i">
            <span v-if="n === '...'" class="page-ellipsis">···</span>
            <button
              v-else
              class="page-num"
              :class="{ active: n === curPage }"
              @click="gotoReportsPage(n)"
            >{{ n }}</button>
          </template>
          <button class="page-btn" :disabled="curPage >= totalPages" @click="gotoReportsPage(curPage + 1)">下一页 ›</button>
          <span class="page-jump">
            跳至
            <input
              type="number"
              min="1"
              :max="totalPages"
              :value="curPage"
              @change="gotoReportsPage(Math.min(Math.max(1, parseInt($event.target.value) || 1), totalPages))"
            />
            页
          </span>
          <select class="page-size-select" :value="reportsPageSize" @change="changeReportsPageSize($event.target.value)">
            <option value="5" :selected="reportsPageSize === 5">5 条/页</option>
            <option value="10" :selected="reportsPageSize === 10">10 条/页</option>
            <option value="20" :selected="reportsPageSize === 20">20 条/页</option>
            <option value="50" :selected="reportsPageSize === 50">50 条/页</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 数据分析看板 -->
    <div style="margin-top:28px; margin-bottom:12px; display:flex; align-items:center; gap:10px;">
      <div style="width:4px; height:18px; background:var(--c-primary); border-radius:2px;"></div>
      <h3 style="font-size:16px; font-weight:700; margin:0;">📊 数据分析</h3>
      <span class="text-xs text-muted">基于已发布报告的多维度统计</span>
    </div>

    <!-- 第一排：折线图 + 饼图 + 环形图 -->
    <div style="display:grid; grid-template-columns:1.3fr 1fr 1fr; gap:16px; margin-bottom:16px;">
      <div class="card">
        <div class="card-title">
          <span>📈 发布与下载趋势</span>
          <span class="text-xs text-muted">近3个月</span>
        </div>
        <div v-html="renderLineChart(monthTrend, downloadTrend, maxTrend, maxDl)"></div>
        <div style="display:flex; gap:14px; margin-top:10px; font-size:11px;">
          <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:10px; height:2px; background:#155EEF; display:inline-block;"></span>发布量</span>
          <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:10px; height:2px; background:#10B981; display:inline-block;"></span>下载量</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>🏷️ 品牌分布</span>
          <span class="text-xs text-muted">Top：{{ topBrand[0] }} · {{ topBrand[1] }}份</span>
        </div>
        <div v-html="renderPieChart(brandCount, ['#155EEF', '#6938EF', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'])"></div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>⚡ 能源类型占比</span>
          <span class="text-xs text-muted">主流：{{ topEnergy[0] }}</span>
        </div>
        <div v-html="renderDonutChart(energyCount, ['#10B981', '#F59E0B', '#155EEF', '#EF4444'])"></div>
      </div>
    </div>

    <!-- 第二排：柱状图 + 环形图 -->
    <div style="display:grid; grid-template-columns:1.3fr 1fr; gap:16px; margin-bottom:16px;">
      <div class="card">
        <div class="card-title">
          <span>📍 细分市场分布</span>
          <span class="text-xs text-muted">按方案数量</span>
        </div>
        <div v-html="renderBarChart(segmentCount, 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)')"></div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>🎯 价格区间分布</span>
          <span class="text-xs text-muted">环形占比</span>
        </div>
        <div v-html="renderDonutChart(priceCount, ['#155EEF', '#6938EF', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'])"></div>
      </div>
    </div>

    <!-- 热门下载 + 最近发布 -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
      <div class="card">
        <div class="card-title">
          <span>🔥 热门下载 Top3</span>
          <span class="text-xs text-muted">按下载量排序</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <template v-if="hotList.length">
            <div
              v-for="(r, i) in hotList"
              :key="r.id"
              style="display:flex; align-items:center; gap:12px; padding:10px 12px; background:var(--c-surface-2); border-radius:var(--r-md); cursor:pointer;"
              @click="openReport(r.id)"
            >
              <div
                style="width:28px; height:28px; border-radius:50%; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0;"
                :style="{ background: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : '#D97706' }"
              >{{ i + 1 }}</div>
              <div style="flex:1; min-width:0;">
                <div style="font-weight:600; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ r.name }}</div>
                <div class="text-xs text-muted">{{ r.brand }} · {{ r.energy }} · {{ r.priceRange }}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:700; color:var(--c-primary); font-size:14px;">{{ r.downloads || 0 }}</div>
                <div class="text-xs text-muted">次下载</div>
              </div>
            </div>
          </template>
          <div v-else class="empty-state"><div class="empty-state-text">暂无数据</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>🕒 最近发布</span>
          <span class="text-xs text-muted">按发布时间倒序</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <template v-if="recentList.length">
            <div
              v-for="r in recentList"
              :key="r.id"
              style="display:flex; align-items:center; gap:10px; padding:8px 10px; border-left:3px solid var(--c-success); background:var(--c-success-light); border-radius:0 var(--r-md) var(--r-md) 0; cursor:pointer;"
              @click="openReport(r.id)"
            >
              <div style="flex:1; min-width:0;">
                <div style="font-weight:600; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ r.name }}</div>
                <div class="text-xs text-muted">{{ r.publishedAt }} · {{ r.creator }}</div>
              </div>
              <span class="badge" :class="statusBadgeClass(r)">{{ statusMeta(r.status).label }}</span>
            </div>
          </template>
          <div v-else class="empty-state"><div class="empty-state-text">暂无数据</div></div>
        </div>
      </div>
    </div>
  </div>
</template>
