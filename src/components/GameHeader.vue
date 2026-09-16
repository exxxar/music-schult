<template>
  <div class="stats-bar">
    <div class="stat-item">
      <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span class="stat-label">Время:</span>
      <span class="stat-value time">{{ formattedTime }}</span>
    </div>

    <div class="stat-item">
      <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span class="stat-label">Верно:</span>
      <span class="stat-value correct">{{ score }}</span>
    </div>

    <div class="stat-item">
      <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      <span class="stat-label">Ошибки:</span>
      <span class="stat-value errors">{{ errors }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  timeElapsed: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  errors: {
    type: Number,
    default: 0
  }
})

const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeElapsed / 60)
  const seconds = props.timeElapsed % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
</script>