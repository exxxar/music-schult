<template>
  <div
      class="note-card"
      :class="cardClasses"
      @click="handleClick"
  >
    <canvas
        ref="canvasRef"
        :width="100"
        :height="120"
        class="note-canvas"
    ></canvas>
    <span v-if="showLabel" class="note-name" :class="labelClass">{{ note.name }}</span>
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

// Позиции нот на стане (относительно первой линии)
const NOTE_POSITIONS = {
  'до': -2,   // под станом (добавочная линия снизу)
  'ре': 0,    // на первой линии
  'ми': 1,    // в первом пространстве
  'фа': 2,    // на второй линии
  'соль': 3,  // во втором пространстве
  'ля': 4,    // на третьей линии
  'си': 5,    // в третьем пространстве
  'до2': 7,   // на четвёртой линии
}

function setCanvasRef(el, id) {
  if (el) {
    canvasRef.value = el
    nextTick(() => drawNote())
  }
}

const noteState = computed(() => {
  return gameStore.revealedNotes.get(props.note.id) || { revealed: false, correct: false }
})

const showLabel = computed(() => noteState.value.revealed)

const cardClasses = computed(() => {
  const classes = []

  if (noteState.value.correct) {
    classes.push('correct')
  } else if (noteState.value.revealed && !noteState.value.correct) {
    classes.push('wrong')
  }

  return classes
})

const labelClass = computed(() => {
  if (noteState.value.correct) return 'label-correct'
  if (noteState.value.revealed) return 'label-wrong'
  return ''
})

function drawNote() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const startX = 10
  const startY = 40
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

  // Рисуем скрипичный ключ (упрощённо)
  ctx.font = 'bold 24px serif'
  ctx.fillStyle = '#374151'
  ctx.fillText('𝄞', startX - 5, startY + 25)

  // Получаем позицию ноты
  const position = NOTE_POSITIONS[props.note.name] ?? 0

  // Вычисляем Y позицию ноты
  const noteY = startY + (position * lineSpacing / 2)
  const noteX = startX + lineWidth / 2 + 10

  // Рисуем добавочные линии если нужно
  if (position < 0 || position > 4) {
    ctx.beginPath()
    ctx.moveTo(noteX - 8, noteY)
    ctx.lineTo(noteX + 8, noteY)
    ctx.stroke()
  }

  // Рисуем ноту (овал)
  ctx.fillStyle = '#1f2937'
  ctx.beginPath()
  ctx.ellipse(noteX, noteY, 6, 4, Math.PI / 6, 0, Math.PI * 2)
  ctx.fill()

// Рисуем штиль (палочку вверх)
  ctx.beginPath()
  ctx.moveTo(noteX + 4, noteY + 2)  // начинаем чуть ниже центра
  ctx.lineTo(noteX + 4, noteY - 30)
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

watch(() => props.note, () => {
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
  background-color: #dcfce7;
}

.note-card.wrong {
  border-color: #ef4444;
  background-color: #fee2e2;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.note-canvas {
  width: 100px;
  height: 120px;
  display: block;
}

.note-name {
  margin-top: 6px;
  font-size: 13px;
  font-style: italic;
  font-weight: 600;
  text-align: center;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.label-correct {
  color: #22c55e;
}

.label-wrong {
  color: #ef4444;
}

@media screen and (max-width: 480px) {
  .note-card {
    padding: 6px;
    border-radius: 12px;
    min-height: 100px;
  }

  .note-canvas {
    width: 80px;
    height: 100px;
  }

  .note-name {
    font-size: 11px;
  }
}
</style>