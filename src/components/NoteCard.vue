<template>
  <div
      class="note-card"
      :class="cardClasses"
      :style="cardStyle"
      @click="handleClick"
  >
    <div v-if="note.isClef" class="clef-display">
      <span class="clef-symbol">{{ note.clef === 'treble' ? '𝄞' : '𝄢' }}</span>
      <span class="clef-label">{{ note.clef === 'treble' ? 'Скрипичный' : 'Басовый' }}</span>
    </div>

    <template v-else>
      <canvas
          ref="canvasRef"
          :width="120"
          :height="160"
          class="note-canvas"
      ></canvas>
      <Transition name="fade">
        <span v-if="showLabel" class="note-label" :class="labelClass">
          {{ note.name }}
          <span v-if="note.accidental === '#'" class="accidental">♯</span>
          <span v-else-if="note.accidental === 'b'" class="accidental">♭</span>
          <span v-if="note.octave" class="octave">{{ note.octave }}</span>
        </span>
      </Transition>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useGameStore } from '../stores/game'
import { playNoteSound } from '../utils/audio'

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
 * Вычисляет позиции всех добавочных линий для ноты
 * Возвращает массив Y-координат добавочных линий
 */
function getLedgerLines(position) {
  const lines = []

  if (position < 0) {
    // Нота выше стана (position < 0 = выше верхней линии)
    // Добавочные линии на position 0, -2, -4, ... (чётные отрицательные)
    for (let p = 0; p >= position; p -= 2) {
      if (p !== 0) lines.push(p)
    }
  } else if (position > 8) {
    // Нота ниже стана (position > 8 = ниже нижней линии)
    // Добавочные линии на position 8, 10, 12, ... (чётные положительные)
    for (let p = 8; p <= position; p += 2) {
      if (p !== 8) lines.push(p)
    }
  }

  return lines
}

function drawNote() {
  const canvas = canvasRef.value
  if (!canvas || props.note.isClef) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Параметры стана (увеличенный canvas)
  const startX = 30
  const startY = 60  // Верхняя (5-я) линия стана
  const lineSpacing = 8
  const lineWidth = 80

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

  // 2. Рисуем ключ (маленький, слева от ноты)
  ctx.font = '28px serif'
  ctx.fillStyle = '#374151'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const clefSymbol = gameStore.clef === 'treble' ? '𝄞' : '𝄢'
  ctx.fillText(clefSymbol, startX - 10, startY + 16)

  // 3. Позиция ноты
  const position = props.note.position ?? 0
  const noteY = startY + (position * lineSpacing / 2)
  const noteX = startX + lineWidth / 2 + 10

  // 4. Рисуем все добавочные линии
  const ledgerLines = getLedgerLines(position)
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 1
  ledgerLines.forEach(ledgerPos => {
    const ledgerY = startY + (ledgerPos * lineSpacing / 2)
    ctx.beginPath()
    ctx.moveTo(noteX - 12, ledgerY)
    ctx.lineTo(noteX + 12, ledgerY)
    ctx.stroke()
  })

  // 5. Знак альтерации
  if (props.note.accidental) {
    ctx.font = 'bold 20px serif'
    ctx.fillStyle = '#1f2937'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const accidentalSymbol = props.note.accidental === '#' ? '♯' : '♭'
    ctx.fillText(accidentalSymbol, noteX - 12, noteY + 2)
  }

  // 6. Длительность ноты
  const duration = props.note.duration || 'quarter'
  const isWhole = duration === 'whole'
  const isFilled = duration === 'quarter'

  // 7. Головка ноты
  ctx.beginPath()
  ctx.ellipse(noteX, noteY, 7, 5, Math.PI / 6, 0, Math.PI * 2)

  if (isFilled) {
    ctx.fillStyle = '#1f2937'
    ctx.fill()
  } else {
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // 8. Штиль (нет у целой ноты)
  if (!isWhole) {
    const stemUp = position >= 4
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1.5
    ctx.beginPath()

    if (stemUp) {
      ctx.moveTo(noteX + 6, noteY)
      ctx.lineTo(noteX + 6, noteY - 35)
    } else {
      ctx.moveTo(noteX - 6, noteY)
      ctx.lineTo(noteX - 6, noteY + 35)
    }
    ctx.stroke()
  }
}

function handleClick() {
  if (props.note.isClef) return

  playNoteSound(props.note)

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
  min-height: 130px;
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
  height: 160px;
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
    min-height: 110px;
  }

  .note-canvas {
    width: 120px;
    height: 140px;
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