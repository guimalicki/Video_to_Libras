import React, { useState } from 'react';
import axios from 'axios';

const LibrasTranslator = () => {
    const [text, setText] = useState('');
    const [gloss, setGloss] = useState('');
    const [videoId, setVideoId] = useState('');
    const [videoStatus, setVideoStatus] = useState(null);
    const [error, setError] = useState(null);

    // Função para traduzir o texto para glosa (Libras)
    const handleTranslate = async () => {
        try {
            const response = await axios.get(`https://api.vlibras.gov.br/translate?text=${encodeURIComponent(text)}`);
            setGloss(response.data.translatedText); // Ajuste de acordo com a estrutura da resposta
        } catch (error) {
            console.error('Erro ao traduzir:', error);
            setError('Erro ao traduzir o texto.');
        }
    };

    // Função para gerar o vídeo em Libras a partir da glosa
    const handleGenerateVideo = async () => {
        try {
            // Enviar a glosa para gerar o vídeo
            const response = await axios.post('https://api.vlibras.gov.br/video', 
                { gloss: gloss }, // Aqui enviamos a glosa
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            setVideoId(response.data.id); // Recebe o id do vídeo gerado
        } catch (error) {
            console.error('Erro ao gerar vídeo:', error);
            setError('Erro ao gerar o vídeo.');
        }
    };

    // Função para verificar o status da geração do vídeo
    const checkVideoStatus = async () => {
        try {
            const response = await axios.get(`https://api.vlibras.gov.br/video/status/${videoId}`);
            setVideoStatus(response.data); // Exibe o status do vídeo gerado
        } catch (error) {
            console.error('Erro ao verificar status do vídeo:', error);
            setError('Erro ao verificar o status do vídeo.');
        }
    };

    return (
        <div>
            <h1>Tradutor para Libras</h1>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite o texto para tradução"
            />
            <button onClick={handleTranslate}>Traduzir</button>
            {gloss && (
                <div>
                    <h2>Glosa (Tradução para Libras):</h2>
                    <p>{gloss}</p>
                </div>
            )}
            <button onClick={handleGenerateVideo}>Gerar Vídeo</button>
            {videoId && <button onClick={checkVideoStatus}>Verificar Status do Vídeo</button>}
            {videoStatus && (
                <div>
                    <h2>Status do Vídeo:</h2>
                    <pre>{JSON.stringify(videoStatus, null, 2)}</pre>
                </div>
            )}
            {error && <div style={{ color: 'red' }}><h3>{error}</h3></div>}
        </div>
    );
};

export default LibrasTranslator;
