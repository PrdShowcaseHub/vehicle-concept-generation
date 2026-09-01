<template>
  <div class="data-table" :style="compact ? 'font-size: var(--fs-xs);' : ''">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, ri) in rows"
          :key="ri"
          :class="rowType ? rowTypeClass(row) : (row[row.length-1] === true ? 'highlight-row' : '')"
        >
          <td
            v-for="(cell, ci) in displayCells(row)"
            :key="ci"
            :class="cellClass(row, ci)"
          >
            <span v-if="isStars(cell)" class="stars" v-html="renderStars(cell)"></span>
            <span v-else>{{ cell }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  compact: { type: Boolean, default: false },
  rowType: { type: Boolean, default: false },
})

function displayCells(row) {
  if (props.rowType) {
    // Last element is a type string, don't display it
    return row.slice(0, -1)
  }
  // Check if last element is boolean (highlight flag)
  if (typeof row[row.length - 1] === 'boolean') {
    return row.slice(0, -1)
  }
  return row
}

function rowTypeClass(row) {
  const type = row[row.length - 1]
  if (type === 'highlight') return 'highlight-row'
  if (type === 'danger') return ''
  if (type === 'warning') return ''
  return ''
}

function cellClass(row, ci) {
  if (!props.rowType) return ''
  const type = row[row.length - 1]
  // Style the last visible cell (the type label)
  const lastVisibleIndex = row.length - 2
  if (ci === lastVisibleIndex) {
    if (type === 'highlight') return 'highlight'
    if (type === 'danger') return 'danger'
    if (type === 'warning') return 'warning'
    if (type === 'success') return 'success'
  }
  return ''
}

function isStars(cell) {
  return typeof cell === 'string' && cell.includes('★')
}

function renderStars(cell) {
  if (typeof cell !== 'string') return cell
  // Handle patterns like "★★★★★ 强力推荐"
  const match = cell.match(/^(★+)\s*(.*)$/)
  if (match) {
    const stars = match[1]
    const label = match[2]
    const dim = '☆'.repeat(Math.max(0, 5 - stars.length))
    return stars + '<span class="dim">' + dim + '</span>' + (label ? ' ' + label : '')
  }
  return cell
}
</script>

<style scoped>
.data-table .num { font-variant-numeric: tabular-nums; font-family: var(--font-mono); }
.data-table td.highlight { background: var(--c-primary-light) !important; font-weight: 500; }
.data-table td.danger { background: #FEF3F2 !important; color: var(--c-danger); font-weight: 500; }
.data-table td.warning { background: var(--c-intervention-bg) !important; color: var(--c-intervention); font-weight: 500; }
.data-table td.success { background: var(--c-sub3-bg) !important; color: var(--c-success); font-weight: 500; }
</style>
