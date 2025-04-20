import React from 'react';
import './GameInfo.scss';

const GameInfo = ({ game }) => {
    if (!game) {
        return <div className="game-info-card placeholder">Loading game info...</div>;
    }

    return (
        <div className="game-info-card">
            <h3 className="game-info-title">Game Information</h3>
            <div className="info-item">
                <span className="info-label">Event:</span>
                <span className="info-value">{game.event || 'N/A'}</span>
            </div>
            <div className="info-item">
                <span className="info-label">Site:</span>
                <span className="info-value">{game.site || 'N/A'}</span>
            </div>
            <div className="info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">{game.date || 'N/A'}</span>
            </div>
            <div className="info-item">
                <span className="info-label">White:</span>
                <span className="info-value">{game.white || 'N/A'} {"("+game.whiteElo+")" || "???"}</span>
            </div>
            <div className="info-item">
                <span className="info-label">Black:</span>
                <span className="info-value">{game.black || 'N/A'} {"("+game.blackElo+")" || "???"}</span>
            </div>
            <div className="info-item">
                <span className="info-label">Result:</span>
                <span className="info-value">{game.result || 'N/A'}</span>
            </div>
            <div className="info-item">
                <span className="info-label">ECO:</span>
                <span className="info-value">{game.eco || 'N/A'}</span>
            </div>
            <div className="info-item pgn-section">
                <span className="info-label">PGN:</span>
                <textarea readOnly className="info-value pgn-text" value={game.pgn || ''} />
            </div>
        </div>
    );
};

export default GameInfo;