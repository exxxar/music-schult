import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// === V1: Скрипичный + Басовый ключи (3 уровня) ===
const TREBLE_NOTES_V1 = [
    { name: 'до', key: 'C', position: 0, octave: '1', ledger: true },
    { name: 'ре', key: 'D', position: 1, octave: '1' },
    { name: 'ми', key: 'E', position: 2, octave: '1' },
    { name: 'фа', key: 'F', position: 3, octave: '1' },
    { name: 'соль', key: 'G', position: 4, octave: '1' },
    { name: 'ля', key: 'A', position: 5, octave: '1' },
    { name: 'си', key: 'B', position: 6, octave: '1' },
    { name: 'до', key: 'C', position: 7, octave: '2' },
]

const BASS_NOTES_V1 = [
    { name: 'до', key: 'C', position: 2.5, octave: 'малая' },
    { name: 'ре', key: 'D', position: 3, octave: 'малая' },
    { name: 'ми', key: 'E', position: 3.5, octave: 'малая' },
    { name: 'фа', key: 'F', position: 4, octave: 'малая' },
    { name: 'соль', key: 'G', position: 4.5, octave: 'малая' },
    { name: 'ля', key: 'A', position: 5, octave: 'малая' },
    { name: 'си', key: 'B', position: 5.5, octave: 'малая' },
    { name: 'до', key: 'C', position: 6, octave: '1', ledger: true },
]

// === V2: Только скрипичный ключ (5 уровней) ===
const TREBLE_NOTES_V2_2_3 = [
    { name: 'до', key: 'C', position: 7, octave: '2' },
    { name: 'ре', key: 'D', position: 8, octave: '2' },
    { name: 'ми', key: 'E', position: 9, octave: '2', ledger: true },
    { name: 'фа', key: 'F', position: 10, octave: '2', ledger: true },
    { name: 'соль', key: 'G', position: 11, octave: '2', ledger: true },
    { name: 'ля', key: 'A', position: 12, octave: '2', ledger: true },
    { name: 'си', key: 'B', position: 13, octave: '2', ledger: true },
    { name: 'до', key: 'C', position: 14, octave: '3', ledger: true },
]

const TREBLE_NOTES_V2_1_3 = [
    { name: 'до', key: 'C', position: 0, octave: '1', ledger: true },
    { name: 'ре', key: 'D', position: 1, octave: '1' },
    { name: 'ми', key: 'E', position: 2, octave: '1' },
    { name: 'фа', key: 'F', position: 3, octave: '1' },
    { name: 'соль', key: 'G', position: 4, octave: '1' },
    { name: 'ля', key: 'A', position: 5, octave: '1' },
    { name: 'си', key: 'B', position: 6, octave: '1' },
    { name: 'до', key: 'C', position: 7, octave: '2' },
    { name: 'ре', key: 'D', position: 8, octave: '2' },
    { name: 'ми', key: 'E', position: 9, octave: '2', ledger: true },
    { name: 'фа', key: 'F', position: 10, octave: '2', ledger: true },
    { name: 'соль', key: 'G', position: 11, octave: '2', ledger: true },
    { name: 'ля', key: 'A', position: 12, octave: '2', ledger: true },
    { name: 'си', key: 'B', position: 13, octave: '2', ledger: true },
    { name: 'до', key: 'C', position: 14, octave: '3', ledger: true },
]

const CHROMATIC_UP = [
    { name: 'до', accidental: null, position: 0, octave: '1', ledger: true },
    { name: 'до', accidental: '#', position: 0.5, octave: '1', ledger: true },
    { name: 'ре', accidental: null, position: 1, octave: '1' },
    { name: 'ре', accidental: '#', position: 1.5, octave: '1' },
    { name: 'ми', accidental: null, position: 2, octave: '1' },
    { name: 'фа', accidental: null, position: 3, octave: '1' },
    { name: 'фа', accidental: '#', position: 3.5, octave: '1' },
    { name: 'соль', accidental: null, position: 4, octave: '1' },
    { name: 'соль', accidental: '#', position: 4.5, octave: '1' },
    { name: 'ля', accidental: null, position: 5, octave: '1' },
    { name: 'ля', accidental: 'b', position: 5.5, octave: '1' },
    { name: 'си', accidental: null, position: 6, octave: '1' },
    { name: 'до', accidental: null, position: 7, octave: '2' },
    { name: 'до', accidental: '#', position: 7.5, octave: '2' },
    { name: 'ре', accidental: null, position: 8, octave: '2' },
    { name: 'ре', accidental: '#', position: 8.5, octave: '2' },
    { name: 'ми', accidental: null, position: 9, octave: '2', ledger: true },
    { name: 'фа', accidental: null, position: 10, octave: '2', ledger: true },
    { name: 'фа', accidental: '#', position: 10.5, octave: '2', ledger: true },
    { name: 'соль', accidental: null, position: 11, octave: '2', ledger: true },
    { name: 'соль', accidental: '#', position: 11.5, octave: '2', ledger: true },
    { name: 'ля', accidental: null, position: 12, octave: '2', ledger: true },
    { name: 'ля', accidental: 'b', position: 12.5, octave: '2', ledger: true },
    { name: 'си', accidental: null, position: 13, octave: '2', ledger: true },
    { name: 'до', accidental: null, position: 14, octave: '3', ledger: true },
]

const CHROMATIC_DOWN = [...CHROMATIC_UP].reverse()

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

export const useGameStore = defineStore('game', () => {
    const grid = ref([])
    const sequence = ref([])
    const currentIndex = ref(0)
    const score = ref(0)
    const errors = ref(0)
    const timeElapsed = ref(0)
    const isPlaying = ref(false)
    const isFinished = ref(false)
    const revealedNotes = ref(new Map())
    const difficulty = ref('beginner')
    const clef = ref('treble')
    const chromaticDirection = ref('up')
    const version = ref('v2') // v1 или v2

    let timerInterval = null

    const currentTarget = computed(() => {
        return sequence.value[currentIndex.value] || null
    })

    const currentNoteName = computed(() => {
        const target = currentTarget.value
        if (!target) return ''

        let noteName = target.name
        if (target.accidental === '#') noteName += ' диез'
        if (target.accidental === 'b') noteName += ' бемоль'

        const octaveName = target.octave === '1' ? 'первой' : target.octave === '2' ? 'второй' : target.octave === '3' ? 'третьей' : 'малой'
        return `${noteName} ${octaveName} октавы`
    })

    function shuffleArray(array) {
        const result = [...array]
        for (let i = result.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1))
            const temp = result[i]
            result[i] = result[randomIndex]
            result[randomIndex] = temp
        }
        return result
    }

    function getGridSize() {
        if (version.value === 'v1') return 3
        if (difficulty.value === 'master') return 5
        if (difficulty.value === 'hard') return 4
        return 3
    }

    function getNotesForLevel() {
        if (version.value === 'v1') {
            return clef.value === 'treble' ? TREBLE_NOTES_V1 : BASS_NOTES_V1
        }

        // V2
        if (difficulty.value === 'master') {
            return chromaticDirection.value === 'up' ? CHROMATIC_UP : CHROMATIC_DOWN
        }
        if (difficulty.value === 'hard') {
            return TREBLE_NOTES_V2_1_3
        }
        return TREBLE_NOTES_V2_2_3
    }

    function startGame(diff = difficulty.value, clefType = clef.value, direction = chromaticDirection.value) {
        if (timerInterval) clearInterval(timerInterval)

        difficulty.value = diff
        clef.value = clefType
        chromaticDirection.value = direction

        const notesSource = getNotesForLevel()
        const gridSize = getGridSize()
        const totalCells = gridSize * gridSize

        // Создаём последовательность
        if (version.value === 'v2' && diff === 'hard') {
            sequence.value = shuffleArray(notesSource)
        } else {
            sequence.value = [...notesSource]
        }

        // Создаём сетку
        const gridNotes = [...notesSource]
        while (gridNotes.length < totalCells) {
            const randomNote = notesSource[Math.floor(Math.random() * notesSource.length)]
            gridNotes.push({ ...randomNote })
        }

        grid.value = shuffleArray(gridNotes).map((note, i) => ({
            id: i,
            ...note
        }))

        revealedNotes.value = new Map()
        currentIndex.value = 0
        score.value = 0
        errors.value = 0
        timeElapsed.value = 0
        isPlaying.value = true
        isFinished.value = false

        timerInterval = setInterval(() => {
            timeElapsed.value++
        }, 1000)
    }

    function checkNote(note) {
        if (!isPlaying.value) return
        if (revealedNotes.value.get(note.id)?.correct) return

        const target = currentTarget.value
        if (!target) return

        const isCorrect =
            note.name === target.name &&
            note.octave === target.octave &&
            note.accidental === target.accidental

        if (isCorrect) {
            revealedNotes.value.set(note.id, { correct: true })
            score.value++
            currentIndex.value++

            if (currentIndex.value >= sequence.value.length) {
                isPlaying.value = false
                isFinished.value = true
                if (timerInterval) clearInterval(timerInterval)
                saveRecord()
            }
        } else {
            errors.value++
            revealedNotes.value.set(note.id, { correct: false, temp: true })
            setTimeout(() => {
                if (revealedNotes.value.get(note.id)?.temp) {
                    revealedNotes.value.delete(note.id)
                }
            }, 600)
        }
    }

    function getRecordKey() {
        const ver = version.value
        const diff = difficulty.value
        const c = clef.value
        const dir = chromaticDirection.value

        if (ver === 'v1') {
            return `record_v1_${c}_${diff}`
        }
        return `record_v2_${diff}_${dir}`
    }

    function saveRecord() {
        const key = getRecordKey()
        const existing = JSON.parse(localStorage.getItem(key) || 'null')

        const newRecord = {
            time: timeElapsed.value,
            errors: errors.value,
            date: new Date().toISOString()
        }

        if (!existing ||
            timeElapsed.value < existing.time ||
            (timeElapsed.value === existing.time && errors.value < existing.errors)) {
            localStorage.setItem(key, JSON.stringify(newRecord))
        }
    }

    function getBestRecord() {
        const key = getRecordKey()
        return JSON.parse(localStorage.getItem(key) || 'null')
    }

    function setVersion(newVersion) {
        version.value = newVersion
        // Сбрасываем настройки при смене версии
        if (newVersion === 'v1') {
            difficulty.value = 'beginner'
            clef.value = 'treble'
        } else {
            difficulty.value = 'beginner'
            chromaticDirection.value = 'up'
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
        sequence,
        currentIndex,
        currentTarget,
        currentNoteName,
        score,
        errors,
        timeElapsed,
        isPlaying,
        isFinished,
        revealedNotes,
        difficulty,
        clef,
        chromaticDirection,
        version,
        startGame,
        checkNote,
        stopGame,
        getBestRecord,
        setVersion,
        getGridSize
    }
})