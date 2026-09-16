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
        <span v-if="note.accidental === '#'" class="accidental">♯</span>
        <span v-else-if="note.accidental === 'b'" class="accidental">♭</span>
        <span v-if="note.octave" class="octave">{{ note.octave }}</span>
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

  if (gameStore.version === 'v1') {
    if (diff === 'beginner') return true
    if (diff === 'easy') return noteState.value.correct
    return false
  }

  if (diff === 'beginner' || diff === 'easy') return true
  if (diff === 'medium' || diff === 'hard' || diff === 'master') {
    return noteState.value.correct
  }

  return false
})

const cardClasses = computed(() => {
  const classes = []
  if (noteState.value.correct) classes.push('correct')
  else if (noteState.value.temp) classes.push('wrong')
  return classes
})

const cardStyle = computed(() => {
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

function drawTrebleClef(ctx, x, y) {
  ctx.font = '36px serif'
  ctx.fillStyle = '#374151'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('𝄞', x, y)
}

function drawBassClef(ctx, x, y) {
  ctx.font = '32px serif'
  ctx.fillStyle = '#374151'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('𝄢', x, y)
}

function drawNote() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const isTreble = gameStore.clef === 'treble'
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

  // 2. Рисуем ключ
  if (isTreble) {
    drawTrebleClef(ctx, startX - 5, startY + 16)
  } else {
    drawBassClef(ctx, startX - 5, startY + 16)
  }

  // 3. Вычисляем позицию ноты
  const position = props.note.position ?? 0
  const noteY = startY + (position * lineSpacing / 2)
  const noteX = startX + lineWidth / 2 + 10

  // 4. Рисуем добавочную линию (ТОЛЬКО если нота за пределами стана)
  // position 0 = верхняя линия (Y=50), position 8 = нижняя линия (Y=82)
  if (position < 0 || position > 8) {
    ctx.beginPath()
    ctx.moveTo(noteX - 10, noteY)
    ctx.lineTo(noteX + 10, noteY)
    ctx.stroke()
  }

  // 5. Рисуем знак альтерации (диез/бемоль)
  if (props.note.accidental) {
    ctx.font = 'bold 18px serif'
    ctx.fillStyle = '#1f2937'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const accidentalSymbol = props.note.accidental === '#' ? '♯' : '♭'
    ctx.fillText(accidentalSymbol, noteX - 8, noteY + 2) // Чуть поднял для идеального центрирования
  }

  // 6. Рисуем головку ноты (овал)
  ctx.fillStyle = '#1f2937'
  ctx.beginPath()
  ctx.ellipse(noteX, noteY, 6, 4.5, Math.PI / 6, 0, Math.PI * 2)
  ctx.fill()

  // 7. Рисуем штиль
  // position < 3 (выше средней линии) -> штиль вверх. Иначе -> штиль вниз.
  const stemDirection = position < 3 ? 1 : -1
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 1.5
  ctx.beginPath()

  if (stemDirection === 1) {
    ctx.moveTo(noteX + 5, noteY)
    ctx.lineTo(noteX + 5, noteY - 30)
  } else {
    ctx.moveTo(noteX - 5, noteY)
    ctx.lineTo(noteX - 5, noteY + 30)
  }
  ctx.stroke()
}

function handleClick() {
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
}
</style>