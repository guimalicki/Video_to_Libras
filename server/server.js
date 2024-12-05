import express from 'express';
import { exec } from 'child_process';
import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para permitir que o servidor entenda requisições JSON
app.use(express.json());

// Caminho completo para o áudio
const audioPath = path.join('C:', 'Users', 'Sources', 'youtube-to-libras', 'audio.mp3');
// Caminho do arquivo convertido (LINEAR16)
const convertedAudioPath = path.join('C:', 'Users', 'Sources', 'youtube-to-libras', 'converted_audio.wav');
// Caminho do arquivo SRT
const srtFilePath = path.join('C:', 'Users', 'Sources', 'youtube-to-libras', 'legendas.srt');

// Configuração do Google Cloud Storage
const storage = new Storage();
const bucketName = 'youtube-to-libra';  // Substitua pelo nome do seu bucket

// Função para garantir que o arquivo anterior de áudio seja removido
const removeOldAudio = () => {
  if (fs.existsSync(audioPath)) {
    console.log("Removendo o áudio anterior...");
    fs.unlinkSync(audioPath);  // Remove o arquivo de áudio anterior
  }

  if (fs.existsSync(convertedAudioPath)) {
    console.log("Removendo o áudio convertido anterior...");
    fs.unlinkSync(convertedAudioPath);  // Remove o áudio convertido anterior
  }
};

// Função para gerar o arquivo .srt com transcrição e timestamps
const generateSRT = (transcript, response) => {
  let srtContent = '';
  let index = 1;
  
  response.results.forEach((result, idx) => {
    const startTime = result.resultEndTime.seconds + (result.resultEndTime.nanos / 1e9);
    const endTime = response.results[idx + 1] ? response.results[idx + 1].resultEndTime.seconds : startTime + 5; // Definir duração de 5 segundos para o próximo trecho
    const startTimeFormatted = new Date(startTime * 1000).toISOString().substr(11, 8).replace('.', ',');
    const endTimeFormatted = new Date(endTime * 1000).toISOString().substr(11, 8).replace('.', ',');

    srtContent += `${index}\n${startTimeFormatted} --> ${endTimeFormatted}\n${result.alternatives[0].transcript}\n\n`;
    index++;
  });

  fs.writeFileSync(srtFilePath, srtContent);
  console.log("Arquivo SRT gerado com sucesso.");
  return srtFilePath;
};

// Função para fazer o upload para o GCS e obter o URI
const uploadToGCS = async (convertedAudioPath) => {
  const bucket = storage.bucket(bucketName);
  const gcsFileName = path.basename(convertedAudioPath);
  const file = bucket.file(gcsFileName);

  await bucket.upload(convertedAudioPath, {
    destination: gcsFileName,
  });

  console.log(`Áudio carregado para o GCS: gs://${bucketName}/${gcsFileName}`);
  return `gs://${bucketName}/${gcsFileName}`;  // Retorna o URI GCS
};

// Função para enviar o arquivo SRT para a API do VLibras
const sendSRTToVLibras = async (srtFilePath) => {
  try {
    const formData = new FormData();
    formData.append('srtFile', fs.createReadStream(srtFilePath));

    const response = await axios.post('https://api.vlibras.gov.br/translate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('Resposta da API do VLibras:', response.data);
  } catch (error) {
    console.error('Erro ao enviar o SRT para a API do VLibras:', error);
  }
};

// Rota de teste para a raiz
app.get('/', (req, res) => {
  res.send('Servidor backend está funcionando!');
});

// Rota para processar o vídeo do YouTube
app.post('/process-video', async (req, res) => {
  const { videoUrl } = req.body;

  console.log("Iniciando o processamento do vídeo:", videoUrl);

  try {
    console.log("Baixando o áudio...");

    // Remover o áudio antigo antes de baixar o novo
    removeOldAudio();

    // Usando yt-dlp para baixar o áudio no caminho especificado
    exec(`yt-dlp -f bestaudio -o "${audioPath}" ${videoUrl}`, (err, stdout, stderr) => {
      if (err) {
        console.error("Erro ao baixar o áudio:", err);
        return res.status(500).json({ error: 'Erro ao baixar o áudio.' });
      }
      console.log("Áudio baixado com sucesso.");

      // Verificando se o áudio foi baixado corretamente
      if (!fs.existsSync(audioPath)) {
        console.error("Áudio não foi baixado corretamente.");
        return res.status(500).json({ error: 'Áudio não encontrado após download.' });
      }

      // Chamar a função de transcrição após o download
      convertAndTranscribeAudio(audioPath, convertedAudioPath, res);
    });
  } catch (error) {
    console.error("Erro ao processar o vídeo:", error);
    res.status(500).json({ error: 'Erro ao processar o vídeo.' });
  }
});

// Função para converter o áudio usando ffmpeg
const convertAudio = (audioPath, convertedAudioPath) => {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i "${audioPath}" -ac 1 -ar 16000 -f wav "${convertedAudioPath}"`, (err, stdout, stderr) => {
      if (err) {
        console.error("Erro ao converter áudio:", err);
        reject(err);
      } else {
        console.log("Áudio convertido com sucesso.");
        resolve(convertedAudioPath);
      }
    });
  });
};

// Função para transcrever o áudio
const convertAndTranscribeAudio = async (audioPath, convertedAudioPath, res) => {
  try {
    // Converte o áudio para o formato correto (LINEAR16)
    await convertAudio(audioPath, convertedAudioPath);

    // Verificar se o áudio foi convertido corretamente
    if (!fs.existsSync(convertedAudioPath)) {
      console.error("Áudio convertido não encontrado.");
      return res.status(500).json({ error: 'Erro ao converter o áudio.' });
    }

    // Envia o áudio para o Google Cloud Storage e obtém o URI
    const gcsUri = await uploadToGCS(convertedAudioPath);

    // Transcrever o áudio usando o URI do GCS
    const client = new SpeechClient();
    const audio = {
      uri: gcsUri,
    };

    const request = {
      audio: audio,
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        audioChannelCount: 1,
        languageCode: 'pt-BR',
      },
    };

    console.log("Enviando áudio para transcrição...");
    const [operation] = await client.longRunningRecognize(request);
    const operationName = operation.name;
    console.log(`Operação iniciada: ${operationName}`);

    let [response] = await operation.promise();

    console.log("Resposta da API:", JSON.stringify(response, null, 2));

    // Gerar o arquivo SRT com a transcrição e timestamps
    const srtFilePath = generateSRT(response.results, response);

    // Enviar o arquivo SRT para a API do VLibras
    await sendSRTToVLibras(srtFilePath);

    // Retorna a transcrição para o cliente
    res.status(200).json({ transcript: response });

  } catch (error) {
    console.error("Erro ao transcrever o áudio:", error);
    res.status(500).json({ error: 'Erro ao transcrever o áudio.' });
  }
};

// Inicia o servidor na porta configurada
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
