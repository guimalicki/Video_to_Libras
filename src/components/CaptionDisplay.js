// src/components/CaptionDisplay.js
import React from 'react';

const CaptionDisplay = ({ captions }) => {
    return (
        <div>
            <h2>Legendas em Libras</h2>
            <p>{captions}</p>
        </div>
    );
};

export default CaptionDisplay;