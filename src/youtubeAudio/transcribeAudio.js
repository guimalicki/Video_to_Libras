const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

async function transcribeAudio(audioStream) {
    // Criação da requisição para transcrição
    const request = {
        config: {
            encoding: 'LINEAR16', // Formato de codificação do áudio
            sampleRateHertz: 4800, // Taxa de amostragem do áudio
            audioChannelCount: 2,  // Definindo para 2 canais (estéreo)
            languageCode: 'pt-BR', // Código do idioma (português do Brasil)
        },
        interimResults: false, // Desativa resultados intermediários
        audio: {
            content: audioStream, // O conteúdo de áudio deve estar em base64
        },
    };

    try {
        // Chama a transcrição
        const [response] = await client.longRunningRecognize(request);

        console.log("Resposta completa da API:", JSON.stringify(response, null, 2));


        // Extrai os resultados e os tempos
        const results = response.results.map((result, index) => {
            const transcript = result.alternatives[0].transcript;
            const startTime = result.resultEndTime.seconds; // Tempo de início
            const endTime = result.resultEndTime.seconds + result.alternatives[0].confidence; // Estimativa de tempo de fim (ajuste conforme necessário)
            
            // Retorna o texto com os tempos de início e fim
            return { text: transcript, start: startTime, end: endTime };
        });

        // Retorna a transcrição com tempos
        return results;
    } catch (error) {
        console.error('Erro ao transcrever áudio:', error);
        throw error;
    }
}

module.exports = transcribeAudio;
