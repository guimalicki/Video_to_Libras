// src/services/youtubeService.js
import axios from 'axios';

const API_KEY = 'AIzaSyCGM-hkAcndiGxy0Mj8uYc85igc874SPZk'; // Substitua pela sua chave da API do YouTube
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/captions';

/**
 * Obtém as legendas de um vídeo do YouTube pelo seu ID.
 * @param {string} videoId - O ID do vídeo do YouTube.
 * @returns {Promise<Object>} - Retorna um objeto com as legendas do vídeo.
 * @throws {Error} - Lança um erro se a chamada à API falhar.
 */
export const getVideoCaptions = async (videoId) => {
    // Valida o videoId
    if (!videoId) {
        throw new Error('O ID do vídeo é obrigatório.');
    }

    try {
        const response = await axios.get(YOUTUBE_API_URL, {
            params: {
                part: 'snippet',
                videoId: videoId,
                key: API_KEY,
            },
        });
        return response.data; // Retorna os dados das legendas
    } catch (error) {
        console.error("Erro ao obter legendas:", error.response ? error.response.data : error);
        throw error; // Re-lança o erro para que possa ser tratado em outro lugar
    }
};