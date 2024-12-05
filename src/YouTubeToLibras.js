import React, { useState } from 'react';
import axios from 'axios';

const YouTubeToLibras = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [glossText, setGlossText] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoStatus, setVideoStatus] = useState(null);
  const [error, setError] = useState('');

  // Função para baixar o áudio e transcrever
  const handleTranscribeAndTranslate = async () => {
    try {
      // Chama o backend para baixar o áudio e transcrever
      const response = await axios.post('http://localhost:5000/process-video', { videoUrl: youtubeUrl });
      
      // Recebe a transcrição do áudio do backend
      const transcribedText = response.data.transcript;
      setTranscribedText(transcribedText);
      
      // Envia a transcrição para a API do VLibras para obter a glosa
      const glossResponse = await axios.get('http://api.vlibras.gov.br/translate', {
        params: { text: transcribedText },
      });
      setGlossText(glossResponse.data);  // Armazena a glosa
    } catch (error) {
      console.error("Erro ao transcrever ou traduzir:", error);
      setError("Erro ao processar o vídeo.");
    }
  };

  // Função para gerar vídeo a partir da glosa
  const handleGenerateVideo = async () => {
    try {
      const response = await axios.post('http://api.vlibras.gov.br/video', { gloss: glossText });
      setVideoId(response.data.id);  // Recebe o id do vídeo gerado
    } catch (error) {
      console.error("Erro ao gerar o vídeo:", error);
      setError("Erro ao gerar o vídeo.");
    }
  };

  // Função para verificar o status do vídeo gerado
  const checkVideoStatus = async () => {
    try {
      const response = await axios.get(`http://api.vlibras.gov.br/video/status/${videoId}`);
      setVideoStatus(response.data);  // Exibe o status do vídeo
    } catch (error) {
      console.error("Erro ao verificar status do vídeo:", error);
      setError("Erro ao verificar o status do vídeo.");
    }
  };

  return (
    <div>
      <h1>Tradutor de YouTube para Libras</h1>
      <input
        type="text"
        placeholder="Cole o link do YouTube aqui"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
      />
      <button onClick={handleTranscribeAndTranslate}>Traduzir</button>
      {transcribedText && (
        <div>
          <h2>Texto Transcrito:</h2>
          <p>{transcribedText}</p>
        </div>
      )}
      {glossText && (
        <div>
          <h2>Resultado da Tradução (Glosa):</h2>
          <p>{glossText}</p>
        </div>
      )}
      {videoId && (
        <div>
          <button onClick={handleGenerateVideo}>Gerar Vídeo</button>
        </div>
      )}
      {videoStatus && (
        <div>
          <h2>Status do Vídeo:</h2>
          <pre>{JSON.stringify(videoStatus, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div style={{ color: 'red' }}>
          <h3>{error}</h3>
        </div>
      )}
    </div>
  );
};

export default YouTubeToLibras;
