<template>
  <div
      class="note-card"
      :class="cardClasses"
      :style="cardStyle"
      @click="handleClick"
  >
    <!-- Центральный квадрат с ключом -->
    <div v-if="note.isClef" class="clef-display">
      <span class="clef-symbol">{{ note.clef === 'treble' ? '𝄞' : '𝄢' }}</span>
      <span class="clef-label">{{ note.clef === 'treble' ? 'Скрипичный' : 'Басовый' }}</span>
    </div>

    <!-- Обычный квадрат с нотой -->
    <template v-else>
      <canvas
          ref="canvasRef"
          :width="120"
          :height="140"
          class="note-canvas"
      ></canvas>
      <Transition name="fade">
        <span v-if="showLabel" class="note-label" :class="labelClass">
          {{ note.name }}
          <span v-if="note.accidental === '#'" class="accidental">♯</span>
          <span v-else-if="note.accidental === 'b'" class="accidental"></span>
          <span v-if="note.octave" class="octave">{{ note.octave }}</span>
        </span>
      </Transition>
    </template>
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
  if (props.note.isClef) return false

  const diff = gameStore.difficulty
  const ver = gameStore.version

  if (ver === 'v1') {
    if (diff === 'beginner') return true
    if (diff === 'easy') return noteState.value.correct
    return false
  }

  if (diff === 'beginner' || diff === 'easy') return true
  return noteState.value.correct
})

const cardClasses = computed(() => {
  const classes = []
  if (props.note.isClef) {
    classes.push('clef-card')
  } else {
    if (noteState.value.correct) classes.push('correct')
    else if (noteState.value.temp) classes.push('wrong')
  }
  return classes
})

const cardStyle = computed(() => {
  if (props.note.isClef) return {}

  const isBeginner = gameStore.difficulty === 'beginner'
  if (isBeginner || noteState.value.correct) {
    return { backgroundColor: NOTE_BG_COLORS[props.note.name] || 'white' }
  }
  return {}
})

const labelClass = computed(() => {
  if (noteState.value.correct) return 'label-correct'
  if (noteState.value.temp) return 'label-wrong'
  return ''
})

/**
 * Отрисовка ноты на canvas.
 *
 * Правила отрисовки по длительности:
 * - whole (целая): открытый овал, БЕЗ штиля
 * - half (половинная): открытый овал, СО штилем
 * - quarter (четвертная): закрашенный овал, СО штилем
 *
 * Направление штиля (стандартное правило):
 * - position >= 4 (на 3-й линии и ниже) → штиль ВВЕРХ
 * - position < 4 (выше 3-й линии) → штиль ВНИЗ
 */
function drawNote() {
  const canvas = canvasRef.value
  if (!canvas || props.note.isClef) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Параметры стана
  const startX = 25
  const startY = 50
  const lineSpacing = 8
  const lineWidth = 70

  // 1. Рисуем 5 линий стана
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) {
    const y = startY + (i * lineSpacing)
    ctx.beginPath()
    ctx.moveTo(startX, y)
    ctx.lineTo(startX + lineWidth, y)
    ctx.stroke()
  }

  // 2. Рисуем ключ (маленький)
  ctx.font = '24px serif'
  ctx.fillStyle = '#374151'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const clefSymbol = gameStore.clef === 'treble' ? '𝄞' : '𝄢'
  ctx.fillText(clefSymbol, startX - 5, startY + 16)

  // 3. Позиция ноты
  const position = props.note.position ?? 0
  const noteY = startY + (position * lineSpacing / 2)
  const noteX = startX + lineWidth / 2 + 10

  // 4. Добавочная линия (только если нота стоит на ней)
  if (props.note.ledger) {
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(noteX - 10, noteY)
    ctx.lineTo(noteX + 10, noteY)
    ctx.stroke()
  }

  // 5. Знак альтерации
  if (props.note.accidental) {
    ctx.font = 'bold 18px serif'
    ctx.fillStyle = '#1f2937'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const accidentalSymbol = props.note.accidental === '#' ? '♯' : '♭'
    ctx.fillText(accidentalSymbol, noteX - 10, noteY + 2)
  }

  // 6. Определяем длительность
  const duration = props.note.duration || 'quarter'
  const isWhole = duration === 'whole'
  const isHalf = duration === 'half'
  const isFilled = duration === 'quarter' // только четвертная закрашена

  // 7. Рисуем головку ноты
  ctx.beginPath()
  ctx.ellipse(noteX, noteY, 6, 4.5, Math.PI / 6, 0, Math.PI * 2)

  if (isFilled) {
    // Четвертная: закрашенная
    ctx.fillStyle = '#1f2937'
    ctx.fill()
  } else {
    // Целая или половинная: открытая (только обводка)
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // 8. Рисуем штиль (НЕТ у целой ноты)
  if (!isWhole) {
    const stemUp = position >= 4
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1.5
    ctx.beginPath()

    if (stemUp) {
      ctx.moveTo(noteX + 5, noteY)
      ctx.lineTo(noteX + 5, noteY - 30)
    } else {
      ctx.moveTo(noteX - 5, noteY)
      ctx.lineTo(noteX - 5, noteY + 30)
    }
    ctx.stroke()
  }
}

function handleClick() {
  if (props.note.isClef) return
  if (!noteState.value.correct) {
    emit('click', props.note)
  }
}

onMounted(() => {
  setTimeout(() => drawNote(), 100)
})

watch(() => [props.note, gameStore.difficulty, gameStore.clef, gameStore.version], () => {
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

.note-card:hover:not(.correct):not(.wrong):not(.clef-card) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.note-card:active:not(.correct):not(.wrong):not(.clef-card) {
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

.note-card.clef-card {
  background: linear-gradient(135deg, #f3f0ff 0%, #e9d5ff 100%);
  border-color: #8b7ab8;
  cursor: default;
}

.clef-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.clef-symbol {
  font-size: 64px;
  color: #6b5b95;
  line-height: 1;
}

.clef-label {
  font-size: 12px;
  color: #6b5b95;
  font-weight: 600;
  text-align: center;
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.note-label .accidental {
  font-size: 16px;
  font-weight: bold;
  font-style: normal;
}

.note-label .octave {
  font-size: 11px;
  font-weight: 600;
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
    bottom: 6px;
  }

  .note-label .accidental {
    font-size: 14px;
  }

  .note-label .octave {
    font-size: 10px;
  }

  .clef-symbol {
    font-size: 48px;
  }

  .clef-label {
    font-size: 10px;
  }
}
</style>