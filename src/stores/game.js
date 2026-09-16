import { defineStore } from 'pinia'
import { ref } from 'vue'

const NOTES_DATA = [
    { name: 'до', key: 'C' },
    { name: 'ре', key: 'D' },
    { name: 'ми', key: 'E' },
    { name: 'фа', key: 'F' },
    { name: 'соль', key: 'G' },
    { name: 'ля', key: 'A' },
    { name: 'си', key: 'B' },
    { name: 'до2', key: 'C' },
]

export const useGameStore = defineStore('game', () => {
    const grid = ref([])
    const targetNote = ref(null)
    const score = ref(0)
    const errors = ref(0)
    const timeElapsed = ref(0)
    const isPlaying = ref(false)
    const revealedNotes = ref(new Map()) // id -> { revealed: bool, correct: bool }
    let timerInterval = null

    function startGame(difficulty = 'easy') {
        if (timerInterval) {
            clearInterval(timerInterval)
        }

        const newGrid = []
        for (let i = 0; i < 9; i++) {
            const randomNote = NOTES_DATA[Math.floor(Math.random() * NOTES_DATA.length)]
            newGrid.push({
                id: i,
                ...randomNote
            })
        }

        grid.value = newGrid
        revealedNotes.value = new Map()

        pickNewTarget()

        score.value = 0
        errors.value = 0
        timeElapsed.value = 0
        isPlaying.value = true

        timerInterval = setInterval(() => {
            timeElapsed.value++
        }, 1000)
    }

    function pickNewTarget() {
        const availableNotes = grid.value.filter(note => !revealedNotes.value.get(note.id)?.correct)

        if (availableNotes.length === 0) {
            isPlaying.value = false
            if (timerInterval) {
                clearInterval(timerInterval)
            }
            return
        }

        const randomIndex = Math.floor(Math.random() * availableNotes.length)
        targetNote.value = availableNotes[randomIndex]
    }

    function checkNote(note) {
        if (!isPlaying.value) return
        if (revealedNotes.value.get(note.id)?.correct) return

        const isCorrect = note.name === targetNote.value?.name

        revealedNotes.value.set(note.id, {
            revealed: true,
            correct: isCorrect
        })

        if (isCorrect) {
            score.value++
            // Убираем красную подсветку через 500мс
            setTimeout(() => {
                pickNewTarget()
            }, 500)
        } else {
            errors.value++
            // Убираем красную подсветку через 800мс
            setTimeout(() => {
                revealedNotes.value.set(note.id, { revealed: false, correct: false })
            }, 800)
        }
    }

    function stopGame() {
        isPlaying.value = false
        if (timerInterval) {
            clearInterval(timerInterval)
            timerInterval = null
        }
    }

    return {
        grid,
        targetNote,
        score,
        errors,
        timeElapsed,
        isPlaying,
        revealedNotes,
        startGame,
        checkNote,
        stopGame
    }
})