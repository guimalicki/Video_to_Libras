const downloadAudio = require('./downloadAudio');
const transcribeAudio = require('./transcribeAudio');
const generateSRT = require('./generateSRT');
const sendToVLibras = require('./sendToVLibras');
const translateToLibras = require('./vlibrasService'); // Supondo que a função de tradução para Libras esteja aqui

// Função principal para processar o vídeo do YouTube
async function processYouTubeVideo(videoUrl) {
    try {
        // Baixa o áudio do vídeo
        const audioStream = await downloadAudio(videoUrl);
        
        // Transcreve o áudio
        const transcript = await transcribeAudio(audioStream);
        
        // Gera o conteúdo SRT a partir da transcrição
        const srtContent = generateSRT(transcript);
        
        // Traduz a transcrição para a Glosa (Libras)
        const gloss = await translateToLibras(transcript);  // Aqui você traduz a transcrição para Libras (Glosa)
        
        // Envia a transcrição e o SRT para a API do VLibras
        const response = await sendToVLibras(gloss, srtContent);
        
        // Exibe a resposta da API
        console.log('Resposta da API do VLibras:', response);
    } catch (error) {
        // Trata erros que possam ocorrer durante o processamento
        console.error('Erro ao processar o vídeo:', error);
    }
}

// Verifica se o arquivo está sendo executado diretamente
if (require.main === module) {
    // URL do vídeo do YouTube (substitua pela URL real)
    const videoUrl = 'https://www.youtube.com/watch?v=your_video_id'; 
    processYouTubeVideo(videoUrl);
}

// Exporta a função para que possa ser utilizada em outros arquivos
module.exports = processYouTubeVideo;
