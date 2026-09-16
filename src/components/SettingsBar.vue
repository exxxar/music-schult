<template>
  <div class="settings-section">
    <div class="button-group">
      <button
          v-for="level in difficultyLevels"
          :key="level.value"
          @click="$emit('select-difficulty', level.value)"
          :class="['btn', { active: currentDifficulty === level.value }]"
      >
        <span class="icon">{{ level.icon }}</span>
        {{ level.label }}
      </button>
    </div>

    <div class="button-group">
      <button
          v-for="instrument in instruments"
          :key="instrument.value"
          @click="$emit('select-instrument', instrument.value)"
          :class="['btn', { active: currentInstrument === instrument.value }]"
      >
        <span class="icon">{{ instrument.icon }}</span>
        {{ instrument.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  difficulty: {
    type: String,
    default: 'easy'
  },
  instrument: {
    type: String,
    default: 'piano'
  }
})

defineEmits(['select-difficulty', 'select-instrument'])

const currentDifficulty = computed(() => props.difficulty)
const currentInstrument = computed(() => props.instrument)

const difficultyLevels = [
  { value: 'beginner', label: '1-Начинающий', icon: '♪' },
  { value: 'easy', label: '2-Легко', icon: '♫' },
  { value: 'medium', label: '3-Средне', icon: '♬' }
]

const instruments = [
  { value: 'piano', label: 'Пианино', icon: '🎹' },
  { value: 'violin', label: 'Скрипка', icon: '🎻' },
  { value: 'trumpet', label: 'Труба', icon: '🎺' }
]
</script>