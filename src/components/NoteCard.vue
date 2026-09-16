<template>
  <div
      class="note-card"
      :class="cardClasses"
      :style="cardStyle"
      @click="handleClick"
  >
    <canvas
        ref="canvasRef"
        :width="120"
        :height="140"
        class="note-canvas"
    ></canvas>
    <Transition name="fade">
      <span v-if="showLabel" class="note-label" :class="labelClass">
        {{ note.name }}
        <span v-if="note.octave === 'малая'" class="octave">м.</span>
        <span v-else-if="note.octave === '2'" class="octave">²</span>
      </span>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useGameStore } from '../stores/game'

const props = defineProps({
  note: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])
const gameStore = useGameStore()
const canvasRef = ref(null)

const NOTE_COLORS = {
  'до': '#ef4444',
  'ре': '#f97316',
  'ми': '#eab308',
  'фа': '#22c55e',
  'соль': '#0ea5e9',
  'ля': '#3b82f6',
  'си': '#a855f7',
}

const NOTE_BG_COLORS = {
  'до': '#fee2e2',
  'ре': '#ffedd5',
  'ми': '#fef9c3',
  'фа': '#dcfce7',
  'соль': '#e0f2fe',
  'ля': '#dbeafe',
  'си': '#f3e8ff',
}

const noteState = computed(() => {
  return gameStore.revealedNotes.get(props.note.id) || { correct: false, temp: false }
})

const showLabel = computed(() => {
  const diff = gameStore.difficulty

  // beginner и easy: подписи видны сразу
  if (diff === 'beginner' || diff === 'easy') return true

  // medium: подписи только после правильного нажатия
  if (diff === 'medium') return noteState.value.correct

  return false
})

const cardClasses = computed(() => {
  const classes = []

  if (noteState.value.correct) {
    classes.push('correct')
  } else if (noteState.value.temp) {
    classes.push('wrong')
  }

  return classes
})

const cardStyle = computed(() => {
  // Цвет фона для beginner уровня или после правильного ответа
  if (gameStore.difficulty === 'beginner' || noteState.value.correct) {
    return { backgroundColor: NOTE_BG_COLORS[props.note.name] || 'white' }
  }
  return {}
})

const labelClass = computed(() => {
  if (noteState.value.correct) return 'label-correct'
  if (noteState.value.temp) return 'label-wrong'
  return ''
})

function drawNote() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const isTreble = gameStore.clef === 'treble'
  const startX = 20
  const startY = 45
  const lineSpacing = 10
  const lineWidth = 80

  // Рисуем 5 линий стана
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 1.5

  for (let i = 0; i < 5; i++) {
    const y = startY + (i * lineSpacing)
    ctx.beginPath()
    ctx.moveTo(startX, y)
    ctx.lineTo(startX + lineWidth, y)
    ctx.stroke()
  }

  // Рисуем ключ
  ctx.font = 'bold 28px serif'
  ctx.fillStyle = '#374151'
  if (isTreble) {
    ctx.fillText('', startX - 8, startY + 28)
  } else {
    ctx.fillText('', startX - 8, startY + 30)
  }

  // Позиция ноты
  const position = props.note.position ?? 0

  const noteY = startY + (position * lineSpacing / 2)
  const noteX = startX + lineWidth / 2 + 15

  // Рисуем добавочную линию если нужно
  if (props.note.ledger) {
    ctx.beginPath()
    ctx.moveTo(noteX - 10, noteY)
    ctx.lineTo(noteX + 10, noteY)
    ctx.stroke()
  }

  // Рисуем ноту (овал)
  ctx.fillStyle = '#1f2937'
  ctx.beginPath()
  ctx.ellipse(noteX, noteY, 7, 5, Math.PI / 6, 0, Math.PI * 2)
  ctx.fill()

  // Рисуем штиль
  const stemDirection = position < 3 ? 1 : -1
  if (stemDirection === 1) {
    ctx.beginPath()
    ctx.moveTo(noteX + 5, noteY)
    ctx.lineTo(noteX + 5, noteY - 35)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(noteX - 5, noteY)
    ctx.lineTo(noteX - 5, noteY + 35)
    ctx.stroke()
  }
}

function handleClick() {
  if (!noteState.value.correct) {
    emit('click', props.note)
  }
}

onMounted(() => {
  setTimeout(() => drawNote(), 100)
})

watch(() => [props.note, gameStore.difficulty, gameStore.clef], () => {
  nextTick(() => drawNote())
}, { deep: true })
</script>

<style scoped>
.note-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
  border: 3px solid transparent;
  aspect-ratio: 1;
  background-color: white;
  position: relative;
  min-height: 120px;
}

.note-card:hover:not(.correct):not(.wrong) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.note-card:active:not(.correct):not(.wrong) {
  transform: scale(0.98);
}

.note-card.correct {
  border-color: #22c55e;
}

.note-card.wrong {
  border-color: #ef4444;
  background-color: #fee2e2 !important;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.note-canvas {
  width: 120px;
  height: 140px;
  display: block;
}

/* Красивая подпись ноты */
.note-label {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  font-style: italic;
  color: #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.note-label .octave {
  font-size: 11px;
  font-weight: 600;
  margin-left: 2px;
  opacity: 0.7;
  font-style: normal;
}

.label-correct {
  background: rgba(34, 197, 94, 0.15);
  color: #166534;
  border-color: rgba(34, 197, 94, 0.3);
}

.label-wrong {
  background: rgba(239, 68, 68, 0.15);
  color: #991b1b;
  border-color: rgba(239, 68, 68, 0.3);
}

/* Анимация появления */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

@media screen and (max-width: 480px) {
  .note-card {
    padding: 6px;
    border-radius: 12px;
    min-height: 100px;
  }

  .note-canvas {
    width: 100px;
    height: 120px;
  }

  .note-label {
    font-size: 12px;
    padding: 3px 10px;
    bottom: -4px;
    z-index: 10;
    left: 27px;
  }

  .note-label .octave {
    font-size: 10px;
  }
}
</style>