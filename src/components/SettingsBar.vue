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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

const props = defineProps({
  difficulty: { type: String, default: 'beginner' },
  clef: { type: String, default: 'treble' },
  direction: { type: String, default: 'up' }
})

defineEmits(['select-difficulty', 'select-clef', 'select-direction'])

const gameStore = useGameStore()

const currentDifficulty = computed(() => props.difficulty)
const currentClef = computed(() => props.clef)
const currentDirection = computed(() => props.direction)

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
  { value: 'bass', label: 'Басовый', icon: '𝄢' }
]
</script>