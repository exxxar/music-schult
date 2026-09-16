import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ==========================================
// ДАННЫЕ НОТ (Позиции рассчитаны для формулы: Y = 50 + (position * 4))
// position 0 = верхняя (5-я) линия стана (Y=50)
// position 8 = нижняя (1-я) линия стана (Y=82)
// position < 0 = выше стана (добавочная линия)
// position > 8 = ниже стана (добавочная линия)
// ==========================================

// === V1 Скрипичный ключ: НАЧИНАЮЩИЙ (строго внутри стана, 1-я октава) ===
const TREBLE_NOTES_V1_BEGINNER = [
    { name: 'ми', key: 'E', position: 8, octave: '1' },   // 1-я линия снизу
    { name: 'фа', key: 'F', position: 7, octave: '1' },   // 1-е пространство
    { name: 'соль', key: 'G', position: 6, octave: '1' }, // 2-я линия
    { name: 'ля', key: 'A', position: 5, octave: '1' },   // 2-е пространство
    { name: 'си', key: 'B', position: 4, octave: '1' },   // 3-я линия
    { name: 'до', key: 'C', position: 3, octave: '2' },   // 3-е пространство (верх стана)
]

// === V1 Басовый ключ: НАЧИНАЮЩИЙ (строго внутри стана, малая октава) ===
const BASS_NOTES_V1_BEGINNER = [
    { name: 'до', key: 'C', position: 5, octave: 'малая' }, // 2-е пространство снизу
    { name: 'ре', key: 'D', position: 4, octave: 'малая' }, // 3-я линия
    { name: 'ми', key: 'E', position: 3, octave: 'малая' }, // 3-е пространство
    { name: 'фа', key: 'F', position: 2, octave: 'малая' }, // 4-я линия
    { name: 'соль', key: 'G', position: 1, octave: 'малая' }, // 4-е пространство
    { name: 'ля', key: 'A', position: 0, octave: 'малая' },   // 5-я линия (верхняя)
]

// === V1 Скрипичный ключ: ЛЕГКО и СРЕДНЕ (добавляем крайние ноты) ===
const TREBLE_NOTES_V1_ADVANCED = [
    { name: 'до', key: 'C', position: 10, octave: '1', ledger: true }, // добавочная снизу
    { name: 'ре', key: 'D', position: 9, octave: '1' },                // под станом
    ...TREBLE_NOTES_V1_BEGINNER,
]

// === V1 Басовый ключ: ЛЕГКО и СРЕДНЕ (добавляем крайние ноты) ===
const BASS_NOTES_V1_ADVANCED = [
    ...BASS_NOTES_V1_BEGINNER,
    { name: 'си', key: 'B', position: -1, octave: 'малая' },           // над станом
    { name: 'до', key: 'C', position: -2, octave: '1', ledger: true }, // добавочная сверху
]

// === V2 Уровень 1 (Начинающий): Базовый диапазон внутри стана ===
const TREBLE_NOTES_V2_BEGINNER = [
    { name: 'ми', key: 'E', position: 8, octave: '1' },
    { name: 'фа', key: 'F', position: 7, octave: '1' },
    { name: 'соль', key: 'G', position: 6, octave: '1' },
    { name: 'ля', key: 'A', position: 5, octave: '1' },
    { name: 'си', key: 'B', position: 4, octave: '1' },
    { name: 'до', key: 'C', position: 3, octave: '2' },
]

// === V2 Уровни 2-3: До 2-й → До 3-й октавы ===
const TREBLE_NOTES_V2_2_3 = [
    { name: 'до', key: 'C', position: 3, octave: '2' },
    { name: 'ре', key: 'D', position: 2, octave: '2' },
    { name: 'ми', key: 'E', position: 1, octave: '2' },
    { name: 'фа', key: 'F', position: 0, octave: '2' },
    { name: 'соль', key: 'G', position: -1, octave: '2', ledger: true },
    { name: 'ля', key: 'A', position: -2, octave: '2', ledger: true },
    { name: 'си', key: 'B', position: -3, octave: '2', ledger: true },
    { name: 'до', key: 'C', position: -4, octave: '3', ledger: true },
]

// === V2 Уровень 4 (Сложно): До 1-й → До 3-й (15 нот) ===
const TREBLE_NOTES_V2_1_3 = [
    { name: 'до', key: 'C', position: 10, octave: '1', ledger: true },
    { name: 'ре', key: 'D', position: 9, octave: '1' },
    { name: 'ми', key: 'E', position: 8, octave: '1' },
    { name: 'фа', key: 'F', position: 7, octave: '1' },
    { name: 'соль', key: 'G', position: 6, octave: '1' },
    { name: 'ля', key: 'A', position: 5, octave: '1' },
    { name: 'си', key: 'B', position: 4, octave: '1' },
    { name: 'до', key: 'C', position: 3, octave: '2' },
    { name: 'ре', key: 'D', position: 2, octave: '2' },
    { name: 'ми', key: 'E', position: 1, octave: '2' },
    { name: 'фа', key: 'F', position: 0, octave: '2' },
    { name: 'соль', key: 'G', position: -1, octave: '2', ledger: true },
    { name: 'ля', key: 'A', position: -2, octave: '2', ledger: true },
    { name: 'си', key: 'B', position: -3, octave: '2', ledger: true },
    { name: 'до', key: 'C', position: -4, octave: '3', ledger: true },
]

// === V2 Уровень 5 (Мастер): Хроматическая гамма ВВЕРХ (25 нот) ===
const CHROMATIC_UP = [
    { name: 'до', accidental: null, position: 10, octave: '1', ledger: true },
    { name: 'до', accidental: '#', position: 9.5, octave: '1', ledger: true },
    { name: 'ре', accidental: null, position: 9, octave: '1' },
    { name: 'ре', accidental: '#', position: 8.5, octave: '1' },
    { name: 'ми', accidental: null, position: 8, octave: '1' },
    { name: 'фа', accidental: null, position: 7, octave: '1' },
    { name: 'фа', accidental: '#', position: 6.5, octave: '1' },
    { name: 'соль', accidental: null, position: 6, octave: '1' },
    { name: 'соль', accidental: '#', position: 5.5, octave: '1' },
    { name: 'ля', accidental: null, position: 5, octave: '1' },
    { name: 'си', accidental: 'b', position: 4.5, octave: '1' },
    { name: 'си', accidental: null, position: 4, octave: '1' },
    { name: 'до', accidental: null, position: 3, octave: '2' },
    { name: 'до', accidental: '#', position: 2.5, octave: '2' },
    { name: 'ре', accidental: null, position: 2, octave: '2' },
    { name: 'ре', accidental: '#', position: 1.5, octave: '2' },
    { name: 'ми', accidental: null, position: 1, octave: '2' },
    { name: 'фа', accidental: null, position: 0, octave: '2' },
    { name: 'фа', accidental: '#', position: -0.5, octave: '2' },
    { name: 'соль', accidental: null, position: -1, octave: '2', ledger: true },
    { name: 'соль', accidental: '#', position: -1.5, octave: '2', ledger: true },
    { name: 'ля', accidental: null, position: -2, octave: '2', ledger: true },
    { name: 'си', accidental: 'b', position: -2.5, octave: '2', ledger: true },
    { name: 'си', accidental: null, position: -3, octave: '2', ledger: true },
    { name: 'до', accidental: null, position: -4, octave: '3', ledger: true },
]

// === V2 Уровень 5 (Мастер): Хроматическая гамма ВНИЗ (25 нот) ===
const CHROMATIC_DOWN = [
    { name: 'до', accidental: null, position: -4, octave: '3', ledger: true },
    { name: 'си', accidental: null, position: -3, octave: '2', ledger: true },
    { name: 'си', accidental: 'b', position: -2.5, octave: '2', ledger: true },
    { name: 'ля', accidental: null, position: -2, octave: '2', ledger: true },
    { name: 'ля', accidental: 'b', position: -1.5, octave: '2', ledger: true },
    { name: 'соль', accidental: null, position: -1, octave: '2', ledger: true },
    { name: 'фа', accidental: '#', position: -0.5, octave: '2' },
    { name: 'фа', accidental: null, position: 0, octave: '2' },
    { name: 'ми', accidental: null, position: 1, octave: '2' },
    { name: 'ми', accidental: 'b', position: 1.5, octave: '2' },
    { name: 'ре', accidental: null, position: 2, octave: '2' },
    { name: 'ре', accidental: 'b', position: 2.5, octave: '2' },
    { name: 'до', accidental: null, position: 3, octave: '2' },
    { name: 'си', accidental: null, position: 4, octave: '1' },
    { name: 'си', accidental: 'b', position: 4.5, octave: '1' },
    { name: 'ля', accidental: null, position: 5, octave: '1' },
    { name: 'ля', accidental: 'b', position: 5.5, octave: '1' },
    { name: 'соль', accidental: null, position: 6, octave: '1' },
    { name: 'фа', accidental: '#', position: 6.5, octave: '1' },
    { name: 'фа', accidental: null, position: 7, octave: '1' },
    { name: 'ми', accidental: null, position: 8, octave: '1' },
    { name: 'ми', accidental: 'b', position: 8.5, octave: '1' },
    { name: 'ре', accidental: null, position: 9, octave: '1' },
    { name: 'ре', accidental: 'b', position: 9.5, octave: '1' },
    { name: 'до', accidental: null, position: 10, octave: '1', ledger: true },
]

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
    const version = ref('v2') // 'v1' или 'v2'

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
            if (difficulty.value === 'beginner') {
                return clef.value === 'treble' ? TREBLE_NOTES_V1_BEGINNER : BASS_NOTES_V1_BEGINNER
            }
            return clef.value === 'treble' ? TREBLE_NOTES_V1_ADVANCED : BASS_NOTES_V1_ADVANCED
        }

        // V2 логика
        if (difficulty.value === 'master') {
            return chromaticDirection.value === 'up' ? CHROMATIC_UP : CHROMATIC_DOWN
        }
        if (difficulty.value === 'hard') {
            return TREBLE_NOTES_V2_1_3
        }
        if (difficulty.value === 'beginner') {
            return TREBLE_NOTES_V2_BEGINNER
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

        // Создаём сетку (заполняем нужным количеством нот + случайные для заполнения)
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