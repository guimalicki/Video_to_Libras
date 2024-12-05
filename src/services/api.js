// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/', // URL base do seu backend
});

// Função para gerar conteúdo SRT a partir da transcrição
const generateSRT = (transcript) => {
  // Implementação simplificada para gerar SRT
  // Você deve formatar isso corretamente de acordo com o padrão SRT
  return `1\n00:00:01,000 --> 00:00:05,000\n${transcript}\n`;
};

// Função para fazer requisição GET ou POST
export const fetchData = async (endpoint, options = {}) => {
  try {
    const method = options.method || 'GET';
    const response = await api({
      url: endpoint,
      method: method,
      headers: options.headers || { 'Content-Type': 'application/json' },
      data: options.body || {}, // Corpo da requisição para POST
      params: options.params || {}, // Parâmetros para GET
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    throw error; // Repassa o erro para ser tratado no frontend
  }
};

export const sendSRTToApi = async (transcript) => {
  if (!transcript) {
    throw new Error("A transcrição não pode estar vazia.");
  }

  const srtContent = generateSRT(transcript);
  const formData = new FormData();
  formData.append('srtFile', new Blob([srtContent], { type: 'text/srt' }), 'legenda.srt');

  try {
    const response = await api.post('/seu-endpoint', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (response.status === 200) {
      return response.data; // Retorna a resposta da API
    } else {
      console.error("Erro na resposta da API:", response);
      throw new Error("Erro ao enviar SRT para a API.");
    }
  } catch (error) {
    console.error("Erro ao enviar SRT:", error);
    throw error;
  }
};