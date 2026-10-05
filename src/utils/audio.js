// src/utils/audio.js

const audioPlayers = new Map()

function getNoteFileName(note, duration = null) {
    const noteMap = { 'до': 'c', 'ре': 'd', 'ми': 'e', 'фа': 'f', 'соль': 'g', 'ля': 'a', 'си': 'b' }
    const octaveMap = { 'большая': '2', 'малая': '3', '1': '4', '2': '5', '3': '6' }

    let name = noteMap[note.name] || 'c'
    if (note.accidental === '#') name += '#'
    if (note.accidental === 'b') name += 'b'

    const octave = octaveMap[note.octave] || '4'

    // Используем переданную длительность или из ноты
    const durationValue = duration || note.duration || 'whole'
    const durationMap = {
        'whole': 'whole',
        'half': 'whole',
        'quarter': 'whole'
    }
    const durationSuffix = durationMap[durationValue] || 'whole'

    return `${name}${octave}_${durationSuffix}.m4a`
}

// Проверяем, существует ли файл
function checkFileExists(url) {
    return fetch(url, { method: 'HEAD' })
        .then(response => response.ok)
        .catch(() => false)
}

export async function playNoteSound(note) {
    const requestedDuration = note.duration || 'whole'
    let fileName = getNoteFileName(note, requestedDuration)
    let finalFileName = fileName

    // Если запрашиваемая длительность не whole, проверяем наличие файла
    if (requestedDuration !== 'whole') {
        const fileExists = await checkFileExists(`/sounds/${fileName}`)

        // Если файла нет, пробуем whole
        if (!fileExists) {
            const wholeFileName = getNoteFileName(note, 'whole')
            const wholeExists = await checkFileExists(`/sounds/${wholeFileName}`)

            if (wholeExists) {
                finalFileName = wholeFileName
                console.log(`Используем whole вместо ${requestedDuration} для ${note.name}`)
            }
        }
    }

    // Если для этой ноты уже есть плеер, перематываем и играем заново
    if (audioPlayers.has(finalFileName)) {
        const player = audioPlayers.get(finalFileName)
        player.currentTime = 0
        player.play()
        return
    }

    // Создаем новый плеер
    const audio = new Audio(`/sounds/${finalFileName}`)
    audio.volume = 0.8

    audio.addEventListener('ended', () => {
        audioPlayers.delete(finalFileName)
    })

    audioPlayers.set(finalFileName, audio)

    audio.play().catch(() => {
        console.warn(`Файл /sounds/${finalFileName} не найден. Добавьте его в папку public/sounds/`)
        audioPlayers.delete(finalFileName)
    })
}