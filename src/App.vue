<template>
  <div class="container">
    <h1 class="app-title">Таблицы Шульте для музыкантов</h1>

    <SettingsBar
        :difficulty="pendingDifficulty"
        :instrument="pendingInstrument"
        @select-difficulty="handleDifficultySelect"
        @select-instrument="handleInstrumentSelect"
    />

    <GameHeader
        :time-elapsed="gameStore.timeElapsed"
        :score="gameStore.score"
        :errors="gameStore.errors"
    />

    <div class="target-note" v-if="gameStore.targetNote && gameStore.isPlaying">
      <div class="target-note-box">
        Найди ноту: {{ gameStore.targetNote.name }}
      </div>
    </div>

    <div class="game-grid">
      <NoteCard
          v-for="note in gameStore.grid"
          :key="note.id"
          :note="note"
          @click="handleNoteClick(note)"
      />
    </div>

    <!-- Модальное окно подтверждения -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="cancelChange">
      <div class="modal-content">
        <h3 class="modal-title">Начать новую игру?</h3>
        <p class="modal-text">
          Изменение настроек сбросит текущий прогресс.
        </p>
        <div class="modal-buttons">
          <button class="modal-btn cancel" @click="cancelChange">
            Отмена
          </button>
          <button class="modal-btn confirm" @click="confirmChange">
            Да, начать
          </button>
        </div>
      </div>
    </div>
  </div>

  <button
      @click="startNewGame"
      class="new-game-btn"
  >
    Новая игра
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/game'
import GameHeader from './components/GameHeader.vue'
import SettingsBar from './components/SettingsBar.vue'
import NoteCard from './components/NoteCard.vue'

const gameStore = useGameStore()

// Текущие отображаемые значения (до подтверждения)
const pendingDifficulty = ref('easy')
const pendingInstrument = ref('piano')

// Применённые значения (после подтверждения)
const activeDifficulty = ref('easy')
const activeInstrument = ref('piano')

// Состояние модального окна
const showConfirmModal = ref(false)
const pendingChange = ref(null) // { type: 'difficulty'|'instrument', value: string }

function handleDifficultySelect(value) {
  if (value === activeDifficulty.value) return
  pendingDifficulty.value = value
  pendingChange.value = { type: 'difficulty', value }
  showConfirmModal.value = true
}

function handleInstrumentSelect(value) {
  if (value === activeInstrument.value) return
  pendingInstrument.value = value
  pendingChange.value = { type: 'instrument', value }
  showConfirmModal.value = true
}

function confirmChange() {
  if (pendingChange.value) {
    if (pendingChange.value.type === 'difficulty') {
      activeDifficulty.value = pendingChange.value.value
    } else {
      activeInstrument.value = pendingChange.value.value
    }
    startNewGame()
  }
  showConfirmModal.value = false
  pendingChange.value = null
}

function cancelChange() {
  // Откатываем к предыдущим значениям
  pendingDifficulty.value = activeDifficulty.value
  pendingInstrument.value = activeInstrument.value
  showConfirmModal.value = false
  pendingChange.value = null
}

function startNewGame() {
  gameStore.startGame(activeDifficulty.value)
}

function handleNoteClick(note) {
  gameStore.checkNote(note)
}

onMounted(() => {
  startNewGame()
})

onUnmounted(() => {
  gameStore.stopGame()
})
</script>

<style scoped>
/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #6b5b95;
  margin-bottom: 12px;
  text-align: center;
}

.modal-text {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.cancel {
  background-color: #f3f4f6;
  color: #6b7280;
}

.modal-btn.cancel:hover {
  background-color: #e5e7eb;
}

.modal-btn.confirm {
  background-color: #9b8ec4;
  color: white;
}

.modal-btn.confirm:hover {
  background-color: #8b7ab8;
}

.modal-btn:active {
  transform: scale(0.98);
}
</style>