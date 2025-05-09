import React, {useState, useEffect, useRef, useCallback} from 'react';
import { Chessboard } from 'react-chessboard';
import './ChessBoardDisplay.scss';
import { FiCopy, FiCheck, FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight } from 'react-icons/fi';

const ChessBoardDisplay = ({ positions, initialMoveIndex }) => {
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [currentFen, setCurrentFen] = useState(
        positions && positions.length > 0 ? positions[0]?.fen : 'start'
    );
    const [isFenCopied, setIsFenCopied] = useState(false);

    const [isEditingMove, setIsEditingMove] = useState(false);
    const [editMoveValue, setEditMoveValue] = useState('');
    const moveInputRef = useRef(null);

    useEffect(() => {
        const totalMoves = Array.isArray(positions) ? positions.length : 0;
        let startingIndex = 0;

        if (initialMoveIndex !== undefined && initialMoveIndex !== null &&
            initialMoveIndex >= 0 && initialMoveIndex < totalMoves) {
            startingIndex = initialMoveIndex;
        }

        setCurrentMoveIndex(startingIndex);
        if (positions && positions[startingIndex]) {
            setCurrentFen(positions[startingIndex].fen || 'start');
        } else {
            setCurrentFen('start');
        }

        setIsFenCopied(false);
        setIsEditingMove(false);
    }, [positions, initialMoveIndex]);

    const goToMove = useCallback((index) => {
        const totalMoves = Array.isArray(positions) ? positions.length : 0;
        const newIndex = Math.max(0, Math.min(totalMoves > 0 ? totalMoves - 1 : 0, index));

        if (positions && positions[newIndex]) {
            setCurrentFen(positions[newIndex].fen);
            setCurrentMoveIndex(newIndex);
            setIsFenCopied(false);
            setIsEditingMove(false);
        }
    }, [positions]);

    const handleGoToStart = useCallback(() => {
        goToMove(0);
    }, [goToMove]);


    const handlePreviousMove = useCallback(() => {
        goToMove(currentMoveIndex - 1);
    }, [currentMoveIndex, goToMove]);

    const handleNextMove = useCallback(() => {
        goToMove(currentMoveIndex + 1);
    }, [currentMoveIndex, goToMove]);

    const handleGoToEnd = useCallback(() => {
        const totalMoves = Array.isArray(positions) ? positions.length : 0;
        goToMove(totalMoves > 0 ? totalMoves - 1 : 0);
    }, [positions, goToMove]);

    const handleMoveCounterClick = () => {
        const totalMoves = Array.isArray(positions) ? positions.length : 0;
        if (totalMoves > 0) {
            setEditMoveValue(String(currentMoveIndex + 1));
            setIsEditingMove(true);
        }
    };

    useEffect(() => {
        if (isEditingMove && moveInputRef.current) {
            moveInputRef.current.focus();
            moveInputRef.current.select();
        }
    }, [isEditingMove]);

    const handleMoveInputChange = (e) => {
        setEditMoveValue(e.target.value);
    };

    const handleMoveInputSubmit = () => {
        const totalMoves = Array.isArray(positions) ? positions.length : 0;
        const targetDisplayNumber = parseInt(editMoveValue, 10);
        const targetIndex = targetDisplayNumber - 1;

        if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < totalMoves) {
            goToMove(targetIndex);
        } else {
            console.warn("Invalid move number entered:", editMoveValue);
            setIsEditingMove(false);
        }
    };

    const handleMoveInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleMoveInputSubmit();
        } else if (e.key === 'Escape') {
            setIsEditingMove(false);
            setEditMoveValue('');
        }
    };

    const handleMoveInputBlur = () => {
        setIsEditingMove(false);
        setEditMoveValue('');
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
            if (isEditingMove) return;
            if (event.key === 'ArrowLeft') handlePreviousMove();
            else if (event.key === 'ArrowRight') handleNextMove();
            else if (event.key === 'Home') { event.preventDefault(); handleGoToStart(); }
            else if (event.key === 'End') { event.preventDefault(); handleGoToEnd(); }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handlePreviousMove, handleNextMove, isEditingMove, handleGoToStart, handleGoToEnd]);

    const totalMoves = Array.isArray(positions) ? positions.length : 0;
    const displayMoveNumber = totalMoves > 0 ? currentMoveIndex + 1 : 0;
    const displayTotalMoves = totalMoves;
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
                    onClick={handleGoToStart}
                    disabled={isFirstMove || totalMoves === 0}
                    className="move-button icon-button"
                    aria-label="Go to first move"
                    title="Go to first move"
                >
                    <FiChevronsLeft />
                </button>

                <button
                    onClick={handlePreviousMove}
                    disabled={isFirstMove || totalMoves === 0}
                    className="move-button icon-button"
                    aria-label="Previous move"
                    title="Previous move (Left Arrow)"
                >
                    <FiChevronLeft />
                </button>

                <div className="move-counter-container">
                    {isEditingMove ? (
                        <input
                            ref={moveInputRef}
                            type="number"
                            className="move-input"
                            value={editMoveValue}
                            onChange={handleMoveInputChange}
                            onKeyDown={handleMoveInputKeyDown}
                            onBlur={handleMoveInputBlur}
                            min="1"
                            max={displayTotalMoves > 0 ? displayTotalMoves : 1}
                            step="1"
                        />
                    ) : (
                        <span
                            className="move-counter"
                            onClick={handleMoveCounterClick}
                            title="Click to enter move number (1-based index)"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key==='Enter' || e.key=== ' ') handleMoveCounterClick();}}
                            role="button"
                            aria-label={`Current move ${displayMoveNumber} of ${displayTotalMoves}. Click to edit.`}
                        >
                        {displayMoveNumber} / {displayTotalMoves}
                        </span>
                    )}
                </div>

                <button
                    onClick={handleNextMove}
                    disabled={isLastMove || totalMoves === 0}
                    className="move-button icon-button"
                    aria-label="Next move"
                    title="Next move (Right Arrow)"
                >
                    <FiChevronRight />
                </button>
                <button
                    onClick={handleGoToEnd}
                    disabled={isLastMove || totalMoves === 0}
                    className="move-button icon-button"
                    aria-label="Go to last move"
                    title="Go to last move"
                >
                    <FiChevronsRight />
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