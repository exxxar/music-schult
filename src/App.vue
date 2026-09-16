<template>
  <div class="container">
    <h1 class="app-title">Таблицы Шульте для музыкантов</h1>

    <SettingsBar
        :difficulty="pendingDifficulty"
        :clef="pendingClef"
        :direction="pendingDirection"
        @select-difficulty="handleDifficultySelect"
        @select-clef="handleClefSelect"
        @select-direction="handleDirectionSelect"
    />

    <GameHeader
        :time-elapsed="gameStore.timeElapsed"
        :score="gameStore.score"
        :errors="gameStore.errors"
        :total="gameStore.sequence.length"
    />

    <div class="target-note" v-if="gameStore.currentNoteName && gameStore.isPlaying">
      <div class="target-note-box">
        Найди ноту: <strong>{{ gameStore.currentNoteName }}</strong>
      </div>
    </div>

    <div v-if="gameStore.isFinished" class="finish-message">
      <div class="finish-box">
        <h2>🎉 Отлично!</h2>
        <p>Время: {{ formatTime(gameStore.timeElapsed) }}</p>
        <p>Ошибок: {{ gameStore.errors }}</p>
      </div>
    </div>

    <div class="game-grid" :class="`grid-${gameStore.getGridSize()}`">
      <NoteCard
          v-for="note in gameStore.grid"
          :key="note.id"
          :note="note"
          @click="handleNoteClick(note)"
      />
    </div>

    <!-- Свитч V1/V2 -->
    <div class="version-switch">
      <button
          :class="['version-btn', { active: gameStore.version === 'v1' }]"
          @click="switchVersion('v1')"
      >
        V1
      </button>
      <button
          :class="['version-btn', { active: gameStore.version === 'v2' }]"
          @click="switchVersion('v2')"
      >
        V2
      </button>
    </div>
  </div>

  <button
      @click="startNewGame"
      class="new-game-btn"
  >
    {{ gameStore.isFinished ? 'Играть снова' : 'Новая игра' }}
  </button>

  <!-- Модальное окно -->
  <div v-if="showConfirmModal" class="modal-overlay" @click.self="cancelChange">
    <div class="modal-content">
      <h3 class="modal-title">Начать новую игру?</h3>
      <p class="modal-text">Изменение настроек сбросит текущий прогресс.</p>
      <div class="modal-buttons">
        <button class="modal-btn cancel" @click="cancelChange">Отмена</button>
        <button class="modal-btn confirm" @click="confirmChange">Да, начать</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/game'
import GameHeader from './components/GameHeader.vue'
import SettingsBar from './components/SettingsBar.vue'
import NoteCard from './components/NoteCard.vue'

const gameStore = useGameStore()

const pendingDifficulty = ref('beginner')
const pendingClef = ref('treble')
const pendingDirection = ref('up')
const activeDifficulty = ref('beginner')
const activeClef = ref('treble')
const activeDirection = ref('up')

const showConfirmModal = ref(false)
const pendingChange = ref(null)

function handleDifficultySelect(value) {
  if (value === activeDifficulty.value) return
  pendingDifficulty.value = value
  pendingChange.value = { type: 'difficulty', value }
  showConfirmModal.value = true
}

function handleClefSelect(value) {
  if (value === activeClef.value) return
  pendingClef.value = value
  pendingChange.value = { type: 'clef', value }
  showConfirmModal.value = true
}

function handleDirectionSelect(value) {
  if (value === activeDirection.value) return
  pendingDirection.value = value
  pendingChange.value = { type: 'direction', value }
  showConfirmModal.value = true
}

function switchVersion(newVersion) {
  if (gameStore.version === newVersion) return

  // Спрашиваем подтверждение если игра идёт
  if (gameStore.isPlaying && gameStore.score > 0) {
    pendingChange.value = { type: 'version', value: newVersion }
    showConfirmModal.value = true
  } else {
    gameStore.setVersion(newVersion)
    startNewGame()
  }
}

function confirmChange() {
  if (pendingChange.value) {
    if (pendingChange.value.type === 'difficulty') {
      activeDifficulty.value = pendingChange.value.value
    } else if (pendingChange.value.type === 'clef') {
      activeClef.value = pendingChange.value.value
    } else if (pendingChange.value.type === 'direction') {
      activeDirection.value = pendingChange.value.value
    } else if (pendingChange.value.type === 'version') {
      gameStore.setVersion(pendingChange.value.value)
    }
    startNewGame()
  }
  showConfirmModal.value = false
  pendingChange.value = null
}

function cancelChange() {
  pendingDifficulty.value = activeDifficulty.value
  pendingClef.value = activeClef.value
  pendingDirection.value = activeDirection.value
  showConfirmModal.value = false
  pendingChange.value = null
}

function startNewGame() {
  gameStore.startGame(activeDifficulty.value, activeClef.value, activeDirection.value)
}

function handleNoteClick(note) {
  gameStore.checkNote(note)
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

onMounted(() => {
  startNewGame()
})

onUnmounted(() => {
  gameStore.stopGame()
})
</script>

<style scoped>
.game-grid {
  display: grid;
  gap: 8px;
  max-width: 400px;
  margin: 0 auto 20px;
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
  max-width: 500px;
}

.grid-5 {
  grid-template-columns: repeat(5, 1fr);
  max-width: 600px;
}

/* Свитч версий */
.version-switch {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 16px;
  max-width: 200px;
  margin-left: auto;
  margin-right: auto;
}

.version-btn {
  flex: 1;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.version-btn:hover {
  color: #6b5b95;
}

.version-btn.active {
  background: white;
  color: #6b5b95;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.finish-message {
  text-align: center;
  margin-bottom: 20px;
}

.finish-box {
  display: inline-block;
  background-color: #dcfce7;
  border: 2px solid #22c55e;
  border-radius: 16px;
  padding: 16px 32px;
  color: #166534;
}

.finish-box h2 {
  margin-bottom: 8px;
  font-size: 22px;
}

.finish-box p {
  font-size: 15px;
  margin: 4px 0;
}

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
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
</style>