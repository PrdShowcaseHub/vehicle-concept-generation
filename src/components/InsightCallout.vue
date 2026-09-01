<template>
  <div class="callout callout-info" style="margin-top: var(--sp-4); background: linear-gradient(135deg, #EFF4FF 0%, #F4F0FF 100%); border-color: #B9D0FF;">
    <div style="flex-shrink: 0; width: 28px; height: 28px; border-radius: var(--r-md); background: linear-gradient(135deg, #155EEF, #6938EF); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
      ✨
    </div>
    <div class="callout-body">
      <strong style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        AI 洞察输出
        <span class="badge badge-blue" style="font-size: 10px;">智能分析</span>
      </strong>
      {{ text }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, required: true }
})
</script>
