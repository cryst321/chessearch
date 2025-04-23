import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import './ChessBoardDisplay.scss';
import { FiCopy, FiCheck } from 'react-icons/fi';

const ChessBoardDisplay = ({ positions }) => {
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [currentFen, setCurrentFen] = useState(
        positions && positions.length > 0 ? positions[0]?.fen : 'start'
    );
    const [isFenCopied, setIsFenCopied] = useState(false);

    useEffect(() => {
        if (positions && positions.length > 0) {
            setCurrentMoveIndex(0);
            setCurrentFen(positions[0]?.fen || 'start');
        } else {
            setCurrentMoveIndex(0);
            setCurrentFen('start');
        }
        setIsFenCopied(false);
    }, [positions]);



    const handlePreviousMove = () => {
        setCurrentMoveIndex((prevIndex) => {
            const newIndex = Math.max(0, prevIndex - 1);
            if (positions && positions[newIndex]) {
                setCurrentFen(positions[newIndex].fen);
            }
            return newIndex;
        });
    };

    const handleNextMove = () => {
        setCurrentMoveIndex((prevIndex) => {
            const newIndex = Math.min(positions ? positions.length - 1 : 0, prevIndex + 1);
            if (positions && positions[newIndex]) {
                setCurrentFen(positions[newIndex].fen);
            }
            return newIndex;
        });
    };

    const handleCopyFen = () => {
        if (!currentFen || currentFen === 'start') {
            console.warn("Attempted to copy invalid FEN:", currentFen);
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(currentFen)
                .then(() => {
                    console.log("FEN copied to clipboard:", currentFen);
                    setIsFenCopied(true);
                    setTimeout(() => {
                        setIsFenCopied(false);
                    }, 1500);
                })
                .catch(err => {
                    console.error('Failed to copy FEN: ', err);
                });
        } else {
            console.warn('Clipboard API not available.');
        }
    };
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                handlePreviousMove();
            } else if (event.key === 'ArrowRight') {
                handleNextMove();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handlePreviousMove, handleNextMove]);
    const totalMoves = Array.isArray(positions) ? positions.length : 0;
    const isFirstMove = currentMoveIndex === 0;
    const isLastMove = currentMoveIndex >= totalMoves - 1;

    return (
        <div className="chessboard-container">
            {/* chessboard component */}
            <div className="board-wrapper">
                <Chessboard
                    position={currentFen}
                    id="GameViewBoard"
                    boardWidth={Math.min(560, window.innerWidth > 768 ? 560 : window.innerWidth - 40)}
                    arePiecesDraggable={false}

                    customBoardStyle={{
                        borderRadius: '4px',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                    }}
                    customDarkSquareStyle={{ backgroundColor: 'rgb(111,143,114)' }}
                    customLightSquareStyle={{ backgroundColor: 'rgb(173,189,143)' }}
                />
            </div>

            {/* navigation */}
            <div className="move-controls">
                <button
                    onClick={handlePreviousMove}
                    disabled={isFirstMove}
                    className="move-button"
                >
                    Previous
                </button>
                <span className="move-counter">
                    {totalMoves > 0 ? currentMoveIndex + 1 : 0} / {totalMoves}
                </span>
                <button
                    onClick={handleNextMove}
                    disabled={isLastMove}
                    className="move-button"
                >
                    Next
                </button>
            </div>

            {/*<p className="fen-display">{currentFen}</p>*/}
            <div className="fen-container">
                <p className="fen-display" title={currentFen}>{currentFen}</p>
                {currentFen && currentFen !== 'start' && (
                    <button
                        onClick={handleCopyFen}
                        className={`copy-fen-button ${isFenCopied ? 'copied' : ''}`}
                        aria-label={isFenCopied ? 'FEN Copied!' : 'Copy FEN to clipboard'}
                        title={isFenCopied ? 'Copied!' : 'Copy FEN'}
                        type="button"
                    >
                        {isFenCopied ? <FiCheck /> : <FiCopy />}
                    </button>
                )}

            </div>

        </div>

    );
};

export default ChessBoardDisplay;