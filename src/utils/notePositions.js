// Хардкод координат нот на canvas 120x140
// Стан: 5 линий, startY=45, spacing=8
// Линии: 45, 53, 61, 69, 77
// Ноты между линиями: 49, 57, 65, 73

export const NOTE_POSITIONS = {
    // Скрипичный ключ
    treble: {
        // До 1-й октавы (под станом, добавочная линия)
        'C1': { x: 70, y: 85, ledger: true, stemDown: false },
        'D1': { x: 70, y: 77, ledger: false, stemDown: false },
        'E1': { x: 70, y: 73, ledger: false, stemDown: false },
        'F1': { x: 70, y: 69, ledger: false, stemDown: false },
        'G1': { x: 70, y: 65, ledger: false, stemDown: false },
        'A1': { x: 70, y: 61, ledger: false, stemDown: false },
        'B1': { x: 70, y: 57, ledger: false, stemDown: false },
        'C2': { x: 70, y: 53, ledger: false, stemDown: false },
        'D2': { x: 70, y: 49, ledger: false, stemDown: true },
        'E2': { x: 70, y: 45, ledger: true, stemDown: true },
        'F2': { x: 70, y: 41, ledger: true, stemDown: true },
        'G2': { x: 70, y: 37, ledger: true, stemDown: true },
        'A2': { x: 70, y: 33, ledger: true, stemDown: true },
        'B2': { x: 70, y: 29, ledger: true, stemDown: true },
        'C3': { x: 70, y: 25, ledger: true, stemDown: true },

        // Хроматические (между линиями)
        'C#1': { x: 70, y: 81, ledger: true, stemDown: false },
        'D#1': { x: 70, y: 75, ledger: false, stemDown: false },
        'F#1': { x: 70, y: 67, ledger: false, stemDown: false },
        'G#1': { x: 70, y: 63, ledger: false, stemDown: false },
        'Bb1': { x: 70, y: 59, ledger: false, stemDown: false },
        'C#2': { x: 70, y: 51, ledger: false, stemDown: false },
        'D#2': { x: 70, y: 47, ledger: false, stemDown: true },
        'F#2': { x: 70, y: 39, ledger: true, stemDown: true },
        'G#2': { x: 70, y: 35, ledger: true, stemDown: true },
        'Bb2': { x: 70, y: 31, ledger: true, stemDown: true },
    },

    // Басовый ключ
    bass: {
        'C_small': { x: 70, y: 73, ledger: false, stemDown: false },
        'D_small': { x: 70, y: 69, ledger: true, stemDown: false },
        'E_small': { x: 70, y: 65, ledger: false, stemDown: false },
        'F_small': { x: 70, y: 61, ledger: false, stemDown: false },
        'G_small': { x: 70, y: 57, ledger: false, stemDown: false },
        'A_small': { x: 70, y: 53, ledger: false, stemDown: false },
        'B_small': { x: 70, y: 49, ledger: false, stemDown: true },
        'C1': { x: 70, y: 45, ledger: false, stemDown: true },
    }
}

// Функция получения ключа для маппинга
export function getNoteKey(note) {
    const name = note.name
    const octave = note.octave
    const accidental = note.accidental || ''

    // Басовый ключ
    if (octave === 'малая') {
        return `${name}_${accidental}_small`
    }

    // Скрипичный ключ
    return `${name}${accidental}${octave}`
}