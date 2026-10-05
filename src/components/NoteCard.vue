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
      <!-- Показываем картинку, если она есть -->
      <img
          v-if="noteImageLoaded"
          :src="noteImagePath"
          :alt="note.name"
          class="note-image"
          @error="noteImageLoaded = false"
      />

      <!-- Иначе рендерим на canvas -->
      <canvas
          v-else
          ref="canvasRef"
          width="100"
          height="100"
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

// Для загрузки изображения
const noteImageLoaded = ref(false)
const noteImagePath = ref('')

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


// Функция для получения пути к изображению ноты
function getNoteImagePath(note) {
  const noteMap = { 'до': 'c', 'ре': 'd', 'ми': 'e', 'фа': 'f', 'соль': 'g', 'ля': 'a', 'си': 'b' }
  const octaveMap = { 'большая': '2', 'малая': '3', '1': '4', '2': '5', '3': '6' }

  let name = noteMap[note.name] || 'c'
  if (note.accidental === '#') name += '#'
  if (note.accidental === 'b') name += 'b'

  const octave = octaveMap[note.octave] || '4'
  const duration = note.duration || 'quarter'

  // Определяем ключ (treble или bass)
  const clef = gameStore.clef || 'treble'

  // Путь: /images/notes/[ключ]/[нота][октава]_[длительность].png
  return `/images/notes/${clef}/${name}${octave}_${duration}.png`
}

// Проверяем наличие изображения
function checkNoteImage() {
  if (props.note.isClef) return

  const imagePath = getNoteImagePath(props.note)
  noteImagePath.value = imagePath

  const img = new Image()
  img.onload = () => {
    noteImageLoaded.value = true
  }
  img.onerror = () => {
    noteImageLoaded.value = false
    // Если картинки нет, рендерим на canvas
    nextTick(() => drawNote())
  }
  img.src = imagePath
}

function getLedgerLines(position) {
  const lines = []
  if (position < 0) {
    for (let p = -2; p >= position; p -= 2) {
      lines.push(p)
    }
  } else if (position > 8) {
    for (let p = 10; p <= position; p += 2) {
      lines.push(p)
    }
  }
  return lines
}

function drawNote() {
  const canvas = canvasRef.value
  if (!canvas || props.note.isClef) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const startX = 20
  const startY = 35
  const lineSpacing = 6
  const lineWidth = 60

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
  ctx.font = '20px serif'
  ctx.fillStyle = '#374151'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const clefSymbol = gameStore.clef === 'treble' ? '𝄞' : '𝄢'
  ctx.fillText(clefSymbol, startX - 6, startY + 12)

  // 3. Позиция ноты
  const position = props.note.position ?? 0
  const noteY = startY + (position * lineSpacing / 2)
  const noteX = startX + lineWidth / 2 + 8

  // 4. Рисуем добавочные линии
  const ledgerLines = getLedgerLines(position)
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 1
  ledgerLines.forEach(ledgerPos => {
    const ledgerY = startY + (ledgerPos * lineSpacing / 2)
    ctx.beginPath()
    ctx.moveTo(noteX - 8, ledgerY)
    ctx.lineTo(noteX + 8, ledgerY)
    ctx.stroke()
  })

  // 5. Знак альтерации
  if (props.note.accidental) {
    ctx.font = 'bold 14px serif'
    ctx.fillStyle = '#1f2937'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const accidentalSymbol = props.note.accidental === '#' ? '♯' : '♭'
    ctx.fillText(accidentalSymbol, noteX - 8, noteY + 1)
  }

  // 6. Длительность ноты
  const duration = props.note.duration || 'quarter'
  const isWhole = duration === 'whole'
  const isFilled = duration === 'quarter'

  // 7. Головка ноты
  ctx.beginPath()
  ctx.ellipse(noteX, noteY, 5, 3.5, Math.PI / 6, 0, Math.PI * 2)

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
      ctx.moveTo(noteX + 4, noteY)
      ctx.lineTo(noteX + 4, noteY - 24)
    } else {
      ctx.moveTo(noteX - 4, noteY)
      ctx.lineTo(noteX - 4, noteY + 24)
    }
    ctx.stroke()
  }
}

function handleClick() {
  if (props.note.isClef) return

  // Проигрываем звук
  playNoteSound(props.note)

  if (!noteState.value.correct) {
    emit('click', props.note)
  }
}

onMounted(() => {
  // Сначала проверяем наличие картинки
  checkNoteImage()
})

watch(() => [props.note, gameStore.difficulty, gameStore.clef, gameStore.version], () => {
  noteImageLoaded.value = false
  nextTick(() => checkNoteImage())
}, { deep: true })
</script>

<style scoped>
.note-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  border: 2px solid transparent;
  aspect-ratio: 1;
  background-color: white;
  position: relative;
  width: 100%;
  max-width: 110px;
}

.note-card:hover:not(.correct):not(.wrong):not(.clef-card) {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.note-card:active:not(.correct):not(.wrong):not(.clef-card) {
  transform: scale(0.96);
}

.note-card.correct {
  border-color: #22c55e;
}

.note-card.wrong {
  border-color: #ef4444;
  background-color: #fee2e2 !important;
  animation: shake 0.4s;
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
  gap: 4px;
}

.clef-symbol {
  font-size: 48px;
  color: #6b5b95;
  line-height: 1;
}

.clef-label {
  font-size: 10px;
  color: #6b5b95;
  font-weight: 600;
  text-align: center;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.note-image {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: contain;
}

.note-canvas {
  width: 100px;
  height: 100px;
  display: block;
}

.note-label {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  font-style: italic;
  color: #374151;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 3px;
}

.note-label .accidental {
  font-size: 12px;
  font-weight: bold;
  font-style: normal;
}

.note-label .octave {
  font-size: 9px;
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
  transition: all 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

@media screen and (max-width: 480px) {
  .note-card {
    padding: 2px;
    border-radius: 8px;
    max-width: 90px;
  }

  .note-image,
  .note-canvas {
    width: 80px;
    height: 80px;
  }

  .note-label {
    font-size: 9px;
    padding: 2px 6px;
    bottom: 2px;
  }

  .note-label .accidental {
    font-size: 10px;
  }

  .note-label .octave {
    font-size: 8px;
  }

  .clef-symbol {
    font-size: 36px;
  }

  .clef-label {
    font-size: 8px;
  }
}
</style>