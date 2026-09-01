<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path :d="iconPath" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { icons } from './data.js'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 20 },
  strokeWidth: { type: Number, default: 2 },
})

const iconPath = computed(() => icons[props.name] || icons.home)
</script>
