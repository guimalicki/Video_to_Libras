const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

async function downloadAudio(videoUrl, outputPath) {
    try {
        const info = await ytdl.getInfo(videoUrl);
        const audioStream = ytdl(videoUrl, { filter: 'audioonly' });

        // Define o nome do arquivo de saída
        const fileName = `${info.videoDetails.title}.mp3`; // ou .m4a
        const fullPath = path.join(outputPath, fileName);

        // Cria um stream de escrita para o arquivo
        const fileStream = fs.createWriteStream(fullPath);
        audioStream.pipe(fileStream);

        // Retorna uma Promise que resolve quando o download for concluído
        return new Promise((resolve, reject) => {
            fileStream.on('finish', () => {
                console.log(`Áudio salvo em: ${fullPath}`);
                resolve(fullPath);
            });
            fileStream.on('error', (error) => {
                console.error('Erro ao salvar o arquivo:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Erro ao baixar o áudio:', error);
        throw error;
    }
}

// Exemplo de uso
const videoUrl = 'https://www.youtube.com/watch?v=EXEMPLO'; // Substitua pelo URL do vídeo desejado
const outputPath = './downloads'; // Diretório onde o áudio será salvo

downloadAudio(videoUrl, outputPath)
    .then((filePath) => {
        console.log(`Download concluído: ${filePath}`);
    })
    .catch((error) => {
        console.error('Erro no download:', error);
    });