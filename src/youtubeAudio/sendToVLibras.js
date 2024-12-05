const axios = require('axios');

async function sendToVLibras(gloss, subtitles) {
    try {
        const response = await axios.post('https://api.vlibras.gov.br/video', { gloss, subtitles });
        return response.data;
    } catch (error) {
        console.error('Erro ao enviar para VLibras:', error);
    }
}

module.exports = sendToVLibras;