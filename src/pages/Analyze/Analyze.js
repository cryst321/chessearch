import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { getChessAnalysis } from '../../services/analysisService';
import { FiTrash2, FiXCircle, FiPlayCircle, FiInfo } from 'react-icons/fi';
import './Analyze.scss';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const KINGS_ONLY_EMPTY_FEN = '8/8/8/4k3/8/8/8/4K3 w - - 0 1';
const Tooltip = ({ children, content }) => {
    return (
        <div className="tooltip-container">
            {children}
            <div className="tooltip-content">{content}</div>
        </div>
    )
}
const Analyze = () => {
    const [game, setGame] = useState(new Chess(START_FEN));
    const [currentFen, setCurrentFen] = useState(START_FEN);
    const [fenInputValue, setFenInputValue] = useState(START_FEN);
    const [fenError, setFenError] = useState('');
    const [isRemoveMode, setIsRemoveMode] = useState(false);

    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState('');

    const [analysisDepth, setAnalysisDepth] = useState(12);
    const [maxThinkingTime, setMaxThinkingTime] = useState(50)

    useEffect(() => {
        setFenInputValue(currentFen);
    }, [currentFen]);

    const trySetFen = (newFen) => {
        try {
            const tempGame = new Chess(newFen);
            setGame(tempGame);
            setCurrentFen(newFen);
            setFenError('');
            setAnalysisResult(null);
            setAnalysisError('');
            return true;
        } catch (e) {
            console.error("Invalid FEN:", newFen, e);
            setFenError("Only valid positions allowed.");
            return false;
        }
    };

    const onPieceDrop = useCallback((sourceSquare, targetSquare) => {
        const gameCopy = new Chess(currentFen);
        const piece = gameCopy.get(sourceSquare);
        if (piece) {
            gameCopy.remove(sourceSquare);
            gameCopy.put(piece, targetSquare);
            const newFen = gameCopy.fen();
            return trySetFen(newFen);
        }
        return false;
    }, [currentFen]);

    const handleResetBoard = () => trySetFen(START_FEN);
    const handleClearBoard = () => trySetFen(KINGS_ONLY_EMPTY_FEN);

    const handleFenInputChange = (event) => {
        setFenInputValue(event.target.value);
        setFenError('');
    };

    const handleImportFen = () => {
        const fenToLoad = fenInputValue.trim();
        if (!fenToLoad) {
            setFenError("Empty FEN string; can't load.");
            return;
        }
        trySetFen(fenToLoad);
    };

    const toggleRemoveMode = () => setIsRemoveMode(!isRemoveMode);

    const handleSquareClick = useCallback((square) => {
        if (isRemoveMode) {
            const gameCopy = new Chess(currentFen);
            const piece = gameCopy.get(square);
            if (piece) {
                gameCopy.remove(square);
                const newFen = gameCopy.fen();
                trySetFen(newFen);
            }
        }
    }, [isRemoveMode, currentFen]);

    const handleAnalyzePosition = async () => {
        if (!trySetFen(currentFen)) {
            setAnalysisError("Cannot analyze an invalid board position.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysisError('');
        setAnalysisResult(null);
        try {
            const options = {   depth: analysisDepth,
                maxThinkingTime: maxThinkingTime };
            const data = await getChessAnalysis(currentFen, options);
            setAnalysisResult(data);
        } catch (error) {
            setAnalysisError(error.message || "Analysis failed. Please try again.");
            console.error("Analysis API error:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="analyze-page-container">
            <h2>Analyze Chess Position</h2>

            <div className="analyze-layout">
                <div className="board-setup-area-analyze">
                    <div className="board-controls-top">
                        <button onClick={handleResetBoard} className="control-button">Reset Board</button>
                        <button onClick={handleClearBoard} className="control-button">Clear Board</button>
                        <button
                            onClick={toggleRemoveMode}
                            className={`control-button remove-mode-button ${isRemoveMode ? 'active' : ''}`}
                            title={isRemoveMode ? 'Disable Remove Mode' : 'Enable Remove Mode (Click piece to remove)'}
                        >
                            {isRemoveMode ? <FiXCircle /> : <FiTrash2 />}
                            {isRemoveMode ? ' ON' : ' OFF'}
                        </button>
                    </div>

                    <div className={`search-board-wrapper ${isRemoveMode ? 'remove-active' : ''}`}>
                        <Chessboard
                            position={currentFen}
                            onPieceDrop={onPieceDrop}
                            onSquareClick={handleSquareClick}
                            arePiecesDraggable={!isRemoveMode}
                            boardWidth={Math.min(500, window.innerWidth > 768 ? 500 : window.innerWidth - 40)}
                            customBoardStyle={{
                                borderRadius: '4px',
                                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                            }}
                            customDarkSquareStyle={{ backgroundColor: 'rgb(111,143,114)' }}
                            customLightSquareStyle={{ backgroundColor: 'rgb(173,189,143)'}}
                        />
                    </div>

                    <div className="fen-input-area">
                        <label htmlFor="fenInput">FEN String:</label>
                        <input
                            type="text"
                            id="fenInput"
                            className={`fen-input ${fenError ? 'input-error' : ''}`}
                            value={fenInputValue}
                            onChange={handleFenInputChange}
                            placeholder="Enter FEN string here or setup board"
                            aria-invalid={!!fenError}
                            aria-describedby={fenError ? "fen-error-msg" : undefined}
                        />
                        <button onClick={handleImportFen} className="control-button import-button">Load FEN</button>
                        {fenError && <span id="fen-error-msg" className="fen-error-message">{fenError}</span>}
                    </div></div>

                <div className="analysis-controls">
                    <div className="analysis-options">

                        <h3>Analysis options</h3>
                        <div className="param-inputs-wrapper">
                        <div className="param-item">
                            <Tooltip content="Search depth affects analysis accuracy. Max: 18, default: 12. Higher values provide more accurate evaluations but take longer. Depth 12 ≈ 2350 FIDE elo, Depth 18 ≈ 2750 FIDE elo.">
                                <label htmlFor="analysisDepth">
                                    Depth: <FiInfo className="info-icon" />
                                </label>
                            </Tooltip>
                            <input
                                type="number"
                                id="analysisDepth"
                                className="param-input"
                                value={analysisDepth}
                                onChange={(e) => setAnalysisDepth(Math.max(1, Math.min(18, parseInt(e.target.value,10) || 12 )))}
                                min="1" max="18"
                            />
                        </div>
                        <div className="param-item">
                            <Tooltip content="Maximum thinking time in milliseconds. Max: 100, default: 50. Higher values may improve analysis quality but take longer to complete.">
                                <label htmlFor="maxThinkingTime">
                                    Time: <FiInfo className="info-icon" />
                                </label>
                            </Tooltip>
                            <input
                                type="number"
                                id="maxThinkingTime"
                                className="param-input"
                                value={maxThinkingTime}
                                onChange={(e) => setMaxThinkingTime(Math.max(10, Math.min(100, Number.parseInt(e.target.value, 10)||50)))}
                                min="10" max="100"
                            />
                        </div>
                    </div>

                    </div>

                    <button onClick={handleAnalyzePosition} className="analyze-button" disabled={isAnalyzing}>
                        {isAnalyzing ? 'Analyzing...' : <><FiPlayCircle /> Analyze position</>}
                    </button>

                    {isAnalyzing && <div className="loading-indicator analysis-loading">Fetching analysis...</div>}
                    {analysisError && <div className="error-message analysis-error">{analysisError}</div>}

                    {analysisResult && (
                        <div className="analysis-result-display">
                            <h4>Analysis result:</h4>
                            {analysisResult.type === 'bestmove' && (
                                <>
                                    <p><strong>Best move (SAN):</strong> {analysisResult.san || 'N/A'}</p>
                                    <p><strong>Evaluation:</strong> {analysisResult.eval !== undefined ? analysisResult.eval : 'N/A'}
                                        {analysisResult.mate ? ` (Mate in ${analysisResult.mate})` : ''}
                                    </p>
                                    <p><strong>Depth:</strong> {analysisResult.depth || 'N/A'}</p>
                                    <p><strong>Win chance:</strong> {analysisResult.winChance!==undefined ? `${analysisResult.winChance.toFixed(2)}%` : 'N/A'}</p>
                                    {analysisResult.continuationArr && analysisResult.continuationArr.length > 0 && (
                                        <p><strong>Main line:</strong> {analysisResult.continuationArr.join(' ')}</p>
                                    )}
                                </>
                            )}
                            {analysisResult.text && <p className="analysis-text-description">{analysisResult.text}</p>}
                            <div className="api-attribution">
                                Powered by{" "}
                                <a href="https://chess-api.com" target="_blank" rel="noopener noreferrer">
                                    chess-api.com
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analyze;
