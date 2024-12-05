// src/App.js
import React, { useState } from 'react';
import VLibras from '@djpfs/react-vlibras';
import VideoPlayer from './components/VideoPlayer.js';
import CaptionDisplay from './components/CaptionDisplay.js';
import { fetchData } from './services/api.js';
import api from './services/api.js';


const App = () => {
    const [videoLink, setVideoLink] = useState('');
    const [videoId, setVideoId] = useState('');
    const [captions, setCaptions] = useState('');
    const [apiData, setApiData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVideoLinkChange = (e) => {
        setVideoLink(e.target.value);
    };

    const handleOpenVideo = async () => {
        setError(null);
        setCaptions('');
        const id = extractYouTubeVideoId(videoLink);
        
        if (!id) {
            setError('Por favor, insira um link válido do YouTube.');
            return;
        }
    
        setVideoId(id);
        setLoading(true);
    
        try {
            // Requisição POST para enviar o videoUrl
            const response = await fetchData('/process-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoUrl: videoLink }), // Enviando o corpo com o videoUrl
            });
    
            const { vlibrasResponse } = response;  // Verifica se a resposta tem vlibrasResponse
            setCaptions(vlibrasResponse.translatedCaptions);  // Exibe as legendas traduzidas
    
        } catch (error) {
            console.error('Erro:', error);
            setError('Ocorreu um erro ao processar sua solicitação.');
        } finally {
            setLoading(false);
        }
    };
    
    const extractYouTubeVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    return (
        <div className="App">
            <VLibras forceOnload={true} />
            <input
                type="text"
                value={videoLink}
                onChange={handleVideoLinkChange}
                placeholder="Cole o link do YouTube aqui"
            />
            <button onClick={handleOpenVideo}>Abrir Vídeo</button>
            {loading && <div>Carregando...</div>}
            {videoId && <VideoPlayer videoId={videoId} />}
            {captions && <CaptionDisplay captions={captions} />}
            {apiData && (
                <div>
                    <h2>Dados da API:</h2>
                    <pre>{JSON.stringify(apiData, null, 2)}</pre>
                </div>
            )}
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

export default App;