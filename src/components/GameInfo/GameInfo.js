import React, {useState} from 'react';
import './GameInfo.scss';
import { FiCopy, FiCheck } from 'react-icons/fi';

const GameInfo = ({ game }) => {
    const [isPgnCopied, setIsPgnCopied] = useState(false);

    if (!game) {
        return <div className="game-info-card placeholder">Loading game info...</div>;
    }
    const handleCopyPgn = () => {
        if (!game?.pgn) {
            console.warn("Empty PGN");
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(game.pgn)
                .then(() => {
                    console.log("PGN copied to clipboard");
                    setIsPgnCopied(true);
                    setTimeout(() => {
                        setIsPgnCopied(false);
                    }, 1500);
                })
                .catch(err => {
                    console.error('Failed to copy PGN: ', err);
                });
        } else {
            console.warn('Clipboard API not available.');
        }
    };
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
            {/*<div className="info-item pgn-section">*/}
            {/*    <span className="info-label">PGN:</span>*/}
            {/*    <textarea readOnly className="info-value pgn-text" value={game.pgn || ''} />*/}
            {/*</div>*/}
            <div className="info-item pgn-section">
                <span className="info-label">PGN:</span>
                <div className="pgn-textarea-wrapper">
                    <textarea
                        readOnly
                        className="info-value pgn-text"
                        value={game.pgn || ''}
                    />
                    {game.pgn && (
                        <button
                            onClick={handleCopyPgn}
                            className={`copy-button pgn-copy-button ${isPgnCopied ? 'copied' : ''}`}
                            aria-label={isPgnCopied ? 'PGN Copied!' : 'Copy PGN to clipboard'}
                            title={isPgnCopied ? 'Copied!' : 'Copy PGN'}
                            type="button"
                        >
                            {isPgnCopied ? <FiCheck /> : <FiCopy />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameInfo;