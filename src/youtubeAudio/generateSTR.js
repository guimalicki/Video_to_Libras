function generateSRT(transcriptData) {
    let srtContent = '';
    
    transcriptData.forEach((item, index) => {
        const startTime = formatTime(item.start); // Formata o tempo de início
        const endTime = formatTime(item.end);     // Formata o tempo de fim

        // Adiciona a legenda no formato SRT
        srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n\n`;
    });

    return srtContent.trim();  // Remove a última linha em branco extra
}

// Função para formatar os tempos no padrão SRT (hh:mm:ss,SSS)
function formatTime(seconds) {
    const date = new Date(seconds * 1000); // Converte os segundos para milissegundos
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')},${String(date.getMilliseconds()).padStart(3, '0')}`;
}

module.exports = generateSRT;
