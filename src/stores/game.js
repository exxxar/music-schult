import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ==========================================
// ДАННЫЕ НОТ
// ==========================================

// === V1 Скрипичный ключ: до 1-й → до 2-й октавы (8 нот) ===
const TREBLE_NOTES_V1 = [
    { name: 'до', key: 'C', position: 10, octave: '1' },
    { name: 'ре', key: 'D', position: 9, octave: '1' },
    { name: 'ми', key: 'E', position: 8, octave: '1' },
    { name: 'фа', key: 'F', position: 7, octave: '1' },
    { name: 'соль', key: 'G', position: 6, octave: '1' },
    { name: 'ля', key: 'A', position: 5, octave: '1' },
    { name: 'си', key: 'B', position: 4, octave: '1' },
    { name: 'до', key: 'C', position: 3, octave: '2' },
]

// === V1 Басовый ключ: до малой → до 1-й октавы (8 нот) ===
const BASS_NOTES_V1 = [
    { name: 'до', key: 'C', position: 5, octave: 'малая' },
    { name: 'ре', key: 'D', position: 4, octave: 'малая' },
    { name: 'ми', key: 'E', position: 3, octave: 'малая' },
    { name: 'фа', key: 'F', position: 2, octave: 'малая' },
    { name: 'соль', key: 'G', position: 1, octave: 'малая' },
    { name: 'ля', key: 'A', position: 0, octave: 'малая' },
    { name: 'си', key: 'B', position: -1, octave: 'малая' },
    { name: 'до', key: 'C', position: -2, octave: '1' },
]

// === V2 Скрипичный ключ: ПОЛНЫЙ ДИАПАЗОН (До 1-й → До 3-й, 15 нот) ===
// Используется для уровней 2, 3, 4
const TREBLE_NOTES_V2_FULL = [
    { name: 'до', key: 'C', position: 10, octave: '1' },       // До 1-й (2 добавочные снизу)
    { name: 'ре', key: 'D', position: 9, octave: '1' },        // Ре 1-й (под 1-й добавочной)
    { name: 'ми', key: 'E', position: 8, octave: '1' },        // Ми 1-й (1-я линия снизу)
    { name: 'фа', key: 'F', position: 7, octave: '1' },        // Фа 1-й (1-е пространство)
    { name: 'соль', key: 'G', position: 6, octave: '1' },      // Соль 1-й (2-я линия)
    { name: 'ля', key: 'A', position: 5, octave: '1' },        // Ля 1-й (2-е пространство)
    { name: 'си', key: 'B', position: 4, octave: '1' },        // Си 1-й (3-я линия)
    { name: 'до', key: 'C', position: 3, octave: '2' },        // До 2-й (3-е пространство)
    { name: 'ре', key: 'D', position: 2, octave: '2' },        // Ре 2-й (4-я линия)
    { name: 'ми', key: 'E', position: 1, octave: '2' },        // Ми 2-й (4-е пространство)
    { name: 'фа', key: 'F', position: 0, octave: '2' },        // Фа 2-й (5-я линия)
    { name: 'соль', key: 'G', position: -1, octave: '2' },     // Соль 2-й (над 5-й линией, без добавочной)
    { name: 'ля', key: 'A', position: -2, octave: '2' },       // Ля 2-й (1-я добавочная сверху)
    { name: 'си', key: 'B', position: -3, octave: '2' },       // Си 2-й (над 1-й добавочной)
    { name: 'до', key: 'C', position: -4, octave: '3' },       // До 3-й (2-я добавочная сверху)
]

// === V2 Басовый ключ: НАЧИНАЮЩИЙ (До большой → До малой, 8 нот) ===
const BASS_NOTES_V2_BEGINNER = [
    { name: 'до', key: 'C', position: 12, octave: 'большая' },  // До большой (2 добавочные снизу)
    { name: 'ре', key: 'D', position: 11, octave: 'большая' },  // Ре большой (под 1-й добавочной)
    { name: 'ми', key: 'E', position: 10, octave: 'большая' },  // Ми большой (1-я добавочная)
    { name: 'фа', key: 'F', position: 9, octave: 'большая' },   // Фа большой (под 1-й линией)
    { name: 'соль', key: 'G', position: 8, octave: 'большая' }, // Соль большой (1-я линия)
    { name: 'ля', key: 'A', position: 7, octave: 'большая' },   // Ля большой (1-е пространство)
    { name: 'си', key: 'B', position: 6, octave: 'большая' },   // Си большой (2-я линия)
    { name: 'до', key: 'C', position: 5, octave: 'малая' },     // До малой (2-е пространство)
]

// === V2 Басовый ключ: ПОЛНЫЙ ДИАПАЗОН (До большой → До 1-й, 16 нот) ===
// Используется для уровня 4 (Сложно)
const BASS_NOTES_V2_FULL = [
    ...BASS_NOTES_V2_BEGINNER,
    { name: 'ре', key: 'D', position: 4, octave: 'малая' },     // Ре малой (3-я линия)
    { name: 'ми', key: 'E', position: 3, octave: 'малая' },     // Ми малой (3-е пространство)
    { name: 'фа', key: 'F', position: 2, octave: 'малая' },     // Фа малой (4-я линия)
    { name: 'соль', key: 'G', position: 1, octave: 'малая' },   // Соль малой (4-е пространство)
    { name: 'ля', key: 'A', position: 0, octave: 'малая' },     // Ля малой (5-я линия)
    { name: 'си', key: 'B', position: -1, octave: 'малая' },    // Си малой (над 5-й линией)
    { name: 'до', key: 'C', position: -2, octave: '1' },        // До 1-й (1-я добавочная сверху)
]

// === V2 Хроматическая гамма ВВЕРХ (25 нот) ===
const CHROMATIC_UP = [
    { name: 'до', accidental: null, position: 10, octave: '1' },
    { name: 'до', accidental: '#', position: 9.5, octave: '1' },
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
    { name: 'соль', accidental: null, position: -1, octave: '2' },
    { name: 'соль', accidental: '#', position: -1.5, octave: '2' },
    { name: 'ля', accidental: null, position: -2, octave: '2' },
    { name: 'си', accidental: 'b', position: -2.5, octave: '2' },
    { name: 'си', accidental: null, position: -3, octave: '2' },
    { name: 'до', accidental: null, position: -4, octave: '3' },
]

const CHROMATIC_DOWN = [...CHROMATIC_UP].reverse()

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
    const version = ref('v2')
    const noteDuration = ref('quarter') // 'whole', 'half', 'quarter'

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

        const octaveName = target.octave === '1' ? 'первой'
            : target.octave === '2' ? 'второй'
                : target.octave === '3' ? 'третьей'
                    : target.octave === 'малая' ? 'малой'
                        : 'большой'

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

        // V2 логика
        if (clef.value === 'bass') {
            // Басовый ключ
            if (difficulty.value === 'hard' || difficulty.value === 'master') {
                return BASS_NOTES_V2_FULL // Полный диапазон для сложных уровней
            }
            return BASS_NOTES_V2_BEGINNER // Базовый диапазон для начинающих
        }

        // Скрипичный ключ
        if (difficulty.value === 'master') {
            return chromaticDirection.value === 'up' ? CHROMATIC_UP : CHROMATIC_DOWN
        }

        // Для всех остальных уровней скрипичного ключа используем полный диапазон (1-3 октавы)
        return TREBLE_NOTES_V2_FULL
    }

    function startGame(diff = difficulty.value, clefType = clef.value, direction = chromaticDirection.value, duration = noteDuration.value) {
        if (timerInterval) clearInterval(timerInterval)

        difficulty.value = diff
        clef.value = clefType
        chromaticDirection.value = direction
        noteDuration.value = duration

        const notesSource = getNotesForLevel()

        if (version.value === 'v1') {
            sequence.value = [...notesSource]
            const shuffled = shuffleArray(notesSource)

            grid.value = []
            let noteIndex = 0
            for (let i = 0; i < 9; i++) {
                if (i === 4) {
                    grid.value.push({
                        id: i,
                        isClef: true,
                        clef: clefType
                    })
                } else {
                    grid.value.push({
                        id: i,
                        ...shuffled[noteIndex],
                        isClef: false,
                        duration: duration
                    })
                    noteIndex++
                }
            }
        } else {
            const gridSize = getGridSize()
            const totalCells = gridSize * gridSize

            if (diff === 'hard') {
                sequence.value = shuffleArray(notesSource)
            } else {
                sequence.value = [...notesSource]
            }

            const gridNotes = [...notesSource]
            while (gridNotes.length < totalCells) {
                const randomNote = notesSource[Math.floor(Math.random() * notesSource.length)]
                gridNotes.push({ ...randomNote })
            }

            grid.value = shuffleArray(gridNotes).map((note, i) => ({
                id: i,
                ...note,
                isClef: false,
                duration: duration
            }))
        }

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
        if (note.isClef) return
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
        return `record_v2_${c}_${diff}_${dir}`
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
        noteDuration,
        startGame,
        checkNote,
        stopGame,
        getBestRecord,
        setVersion,
        getGridSize
    }
})