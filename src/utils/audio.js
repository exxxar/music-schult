// src/utils/audio.js (Вариант для MP3 - самый надежный для PWA)

const audioPlayers = new Map()

function getNoteFileName(note) {
    const noteMap = { 'до': 'c', 'ре': 'd', 'ми': 'e', 'фа': 'f', 'соль': 'g', 'ля': 'a', 'си': 'b' }
    const octaveMap = { 'большая': '2', 'малая': '3', '1': '4', '2': '5', '3': '6' }

    let name = noteMap[note.name] || 'c'
    if (note.accidental === '#') name += '#'
    if (note.accidental === 'b') name += 'b'

    return `${name}${octaveMap[note.octave] || '4'}.mp3`
}

export function playNoteSound(note) {
    const fileName = getNoteFileName(note)

    // Если для этой ноты уже есть плеер, останавливаем его
    if (audioPlayers.has(fileName)) {
        audioPlayers.get(fileName).currentTime = 0
        audioPlayers.get(fileName).play()
        return
    }

    // Создаем новый плеер для этой ноты
    const audio = new Audio(`/sounds/${fileName}`)
    audio.volume = 0.8 // Громкость от 0 до 1

    audio.addEventListener('ended', () => {
        audioPlayers.delete(fileName)
    })

    audioPlayers.set(fileName, audio)

    audio.play().catch(() => {
        console.warn(`Файл /sounds/${fileName} не найден. Добавьте его в папку public/sounds/`)
        audioPlayers.delete(fileName)
    })
}