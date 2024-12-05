// src/services/vlibrasService.js
import axios from 'axios';

export const translateToLibras = async (text) => {
    const response = await axios.post('https://api.vlibras.gov.br/api/v1/translate', {
        text: text
    });
    return response.data.translatedText;
};