<template>
  <div class="settings-section">
    <!-- V1: Выбор ключа -->
    <div v-if="gameStore.version === 'v1'" class="button-group">
      <button
          v-for="c in clefs"
          :key="c.value"
          @click="$emit('select-clef', c.value)"
          :class="['btn', { active: currentClef === c.value }]"
      >
        <span class="icon">{{ c.icon }}</span>
        {{ c.label }}
      </button>
    </div>

    <!-- Уровни -->
    <div class="button-group">
      <button
          v-for="level in availableLevels"
          :key="level.value"
          @click="$emit('select-difficulty', level.value)"
          :class="['btn', { active: currentDifficulty === level.value }]"
      >
        <span class="icon">{{ level.icon }}</span>
        {{ level.label }}
      </button>
    </div>

    <!-- V2: Выбор направления для 5 уровня -->
    <div v-if="gameStore.version === 'v2' && currentDifficulty === 'master'" class="button-group">
      <button
          @click="$emit('select-direction', 'up')"
          :class="['btn', { active: currentDirection === 'up' }]"
      >
        <span class="icon">↑</span>
        Вверх
      </button>
      <button
          @click="$emit('select-direction', 'down')"
          :class="['btn', { active: currentDirection === 'down' }]"
      >
        <span class="icon">↓</span>
        Вниз
      </button>
    </div>

    <!-- Длительность нот -->
    <div class="button-group duration-group">
      <button
          v-for="d in durations"
          :key="d.value"
          @click="$emit('select-duration', d.value)"
          :class="['btn', 'duration-btn', { active: currentDuration === d.value }]"
      >
        <span class="duration-icon" :class="`dur-${d.value}`"></span>
        {{ d.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const props = defineProps({
  difficulty: { type: String, default: 'beginner' },
  clef: { type: String, default: 'treble' },
  direction: { type: String, default: 'up' },
  duration: { type: String, default: 'quarter' }
})

defineEmits(['select-difficulty', 'select-clef', 'select-direction', 'select-duration'])

const gameStore = useGameStore()

const currentDifficulty = computed(() => props.difficulty)
const currentClef = computed(() => props.clef)
const currentDirection = computed(() => props.direction)
const currentDuration = computed(() => props.duration)

const availableLevels = computed(() => {
  if (gameStore.version === 'v1') {
    return [
      { value: 'beginner', label: '1-Начинающий', icon: '♪' },
      { value: 'easy', label: '2-Легко', icon: '♫' },
      { value: 'medium', label: '3-Средне', icon: '♬' }
    ]
  }
  return [
    { value: 'beginner', label: '1-Начинающий', icon: '♪' },
    { value: 'easy', label: '2-Легко', icon: '♫' },
    { value: 'medium', label: '3-Средне', icon: '♬' },
    { value: 'hard', label: '4-Сложно', icon: '♩' },
    { value: 'master', label: '5-Мастер', icon: '' }
  ]
})

const clefs = [
  { value: 'treble', label: 'Скрипичный', icon: '𝄞' },
  { value: 'bass', label: 'Басовый', icon: '' }
]

const durations = [
  { value: 'whole', label: 'Целая' },
  { value: 'half', label: 'Половинная' },
  { value: 'quarter', label: 'Четвертная' }
]
</script>

<style scoped>
.duration-group {
  margin-top: 4px;
}

.duration-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.duration-icon {
  display: inline-block;
  width: 12px;
  height: 16px;
  position: relative;
}

/* Целая нота: открытый овал без штиля */
.dur-whole::before {
  content: '';
  position: absolute;
  top: 6px;
  left: 1px;
  width: 10px;
  height: 7px;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  transform: rotate(-20deg);
}

/* Половинная нота: открытый овал со штилем */
.dur-half::before {
  content: '';
  position: absolute;
  top: 6px;
  left: 1px;
  width: 10px;
  height: 7px;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  transform: rotate(-20deg);
}
.dur-half::after {
  content: '';
  position: absolute;
  top: -4px;
  left: 10px;
  width: 1.5px;
  height: 18px;
  background-color: currentColor;
}

/* Четвертная нота: закрашенный овал со штилем */
.dur-quarter::before {
  content: '';
  position: absolute;
  top: 6px;
  left: 1px;
  width: 10px;
  height: 7px;
  background-color: currentColor;
  border-radius: 50%;
  transform: rotate(-20deg);
}
.dur-quarter::after {
  content: '';
  position: absolute;
  top: -4px;
  left: 10px;
  width: 1.5px;
  height: 18px;
  background-color: currentColor;
}
</style>