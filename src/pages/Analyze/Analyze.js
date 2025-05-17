import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { getChessAnalysis } from '../../services/analysisService';
import { FiTrash2, FiXCircle, FiPlayCircle, FiInfo, FiEye, FiEyeOff,FiTarget, FiRefreshCw } from 'react-icons/fi';
import './Analyze.scss';
import Tooltip from "../../components/Tooltip/Tooltip"
import { handlePromotion } from "../../services/chessUtils"

const BEST_MOVE_COLOR = "rgba(243,112,41,0.92)"
const CONTINUATION_COLOR = "rgba(111,58,175,0.82)"

const SOURCE_SQUARE_COLOR = "rgba(255, 170, 0, 0.4)"
const TARGET_SQUARE_COLOR = "rgba(255, 170, 0, 0.6)"


const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const KINGS_ONLY_EMPTY_FEN = '8/8/8/4k3/8/8/8/4K3 w - - 0 1';

const EvaluationBar = ({ evaluation, mate }) => {
    let percentage = 50

    if (mate) {
        percentage = mate > 0 ? 95 : 5
    } else if (evaluation !== undefined) {
        percentage = 50 + 50 * (2 / (1 + Math.exp(-0.004 * evaluation * 100)) - 1)

        percentage = Math.min(Math.max(percentage, 5), 95)
    }

    return (
        <div className="evaluation-bar-container">
            <div className="evaluation-bar">
                <div className="black-eval" style={{ height: `${100 - percentage}%` }}></div>
            </div>
            <div className="evaluation-text">
                {mate ? (
                    <span className={mate > 0 ? "white-mate" : "black-mate"}>M{Math.abs(mate)}</span>
                ) : (
                    evaluation !== undefined && (
                        <span className={evaluation > 0 ? "white-advantage" : evaluation < 0 ? "black-advantage" : ""}>
              {evaluation > 0 ? "+" : ""}
                            {evaluation.toFixed(1)}
            </span>
                    )
                )}
            </div>
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

    const [showArrows, setShowArrows] = useState(true)
    const [showThreats, setShowThreats] = useState(false)
    const [continuationDepth, setContinuationDepth] = useState(2)

    useEffect(() => {
        setFenInputValue(currentFen);
    }, [currentFen]);

    const trySetFen = (newFen) => {
        try {
            const tempGame = new Chess(newFen);
            setGame(tempGame);
            setCurrentFen(newFen);
            setFenInputValue(newFen)
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
    const toggleShowArrows = () => setShowArrows(!showArrows)
    const toggleShowThreats = () => setShowThreats(!showThreats)
    const handleSwitchSides = () => {
        try {
            const fenParts = currentFen.split(" ")
            if (fenParts.length < 2) {
                setFenError("Invalid FEN format.")
                return
            }
            fenParts[1] = fenParts[1] === "w"?"b":"w"

            const newFen = fenParts.join(" ")
            trySetFen(newFen)
        } catch (error) {
            console.error("Error switching sides:", error)
            setFenError("Could not switch sides.")
        }
    }
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
    const getCustomArrows = () => {
        if (!showArrows || !analysisResult || !analysisResult.from || !analysisResult.to) {
            return []
        }

        const arrows=[]

        arrows.push([analysisResult.from, analysisResult.to, BEST_MOVE_COLOR])

        if (analysisResult.continuationArr && analysisResult.continuationArr.length > 0) {
            const startIndex = analysisResult.continuationArr[0] === `${analysisResult.from}${analysisResult.to}` ? 1 : 0

            for (
                let i = startIndex;
                i < Math.min(startIndex + continuationDepth * 2, analysisResult.continuationArr.length);
                i++
            ) {
                const move = analysisResult.continuationArr[i]
                if (move && move.length >= 4) {
                    const from = move.substring(0, 2)
                    const to = move.substring(2, 4)
                    arrows.push([from, to, CONTINUATION_COLOR])
                }
            }
        }

        return arrows
    }

    const getCustomSquareStyles = () => {
        const styles = {}

        if (!analysisResult || !analysisResult.from || !analysisResult.to) {
            return styles
        }

        if (showArrows) {
            styles[analysisResult.from] = { backgroundColor: SOURCE_SQUARE_COLOR }
            styles[analysisResult.to] = { backgroundColor: TARGET_SQUARE_COLOR }
        }

        if (showThreats && game) {
            try {
                const fen = game.fen()
                const gameCopy = new Chess(fen)
                const turn = gameCopy.turn()
                const opponentColor = turn === "w" ? "b" : "w"
                const opponentSquares = []
                const board = gameCopy.board()

                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        const piece = board[i][j]
                        if (piece && piece.color === opponentColor) {
                            const file = "abcdefgh"[j]
                            const rank = 8 - i
                            opponentSquares.push(`${file}${rank}`)
                        }
                    }
                }

                for (const square of opponentSquares) {
                    const moves = gameCopy.moves({ verbose: true })

                    const isTargeted = moves.some((move) => move.to === square && move.captured)

                    if (isTargeted) {
                        styles[square] = {
                            ...styles[square],
                            boxShadow: "inset 0 0 0 4px rgba(111,58,175, 0.6)",
                        }
                    }
                }
            } catch (e) {
                console.error("Error analyzing threats:", e)
            }
        }

        return styles
    }
    const getSideToMove = () => {
        const fenParts = currentFen.split(" ")
        if (fenParts.length >= 2) {
            return fenParts[1]
        }
        return "w"
    }
    return (
        <div className="analyze-page-container">
            <h2>Analyze with Stockfish 17</h2>

            <div className="analyze-layout">
                <div className="board-setup-area-analyze">
                    <div className="board-controls-container">
                    <div className="board-controls-top">
                        <button onClick={handleResetBoard} className="control-button">Reset</button>
                        <button onClick={handleClearBoard} className="control-button">Clear Board</button>
                        <Tooltip content={isRemoveMode ? "Disable remove mode" : "Enable remove mode (click piece to remove)"}>
                            <button
                                onClick={toggleRemoveMode}
                                className={`control-button remove-mode-button ${isRemoveMode ? "active" : ""}`}
                                aria-label={isRemoveMode ? "Disable remove mode" : "Enable remove mode"}
                            >
                                {isRemoveMode ? <FiXCircle /> : <FiTrash2 />}
                                {isRemoveMode ? " ON" : " OFF"}
                            </button>
                        </Tooltip>
                        <Tooltip content={`${getSideToMove() === "w" ? "White" : "Black"} to move. Click to switch sides`}>
                            <button
                                onClick={handleSwitchSides}
                                className={`side-switch-button ${getSideToMove() === "w" ? "white-to-move" : "black-to-move"}`}
                                aria-label="Switch side to move"
                            >
                                <FiRefreshCw />
                            </button>
                        </Tooltip>
                        <div className="visualization-controls">

                            <Tooltip content={showArrows ? "Hide move arrows" : "Show move arrows"}>
                                <button
                                    onClick={toggleShowArrows}
                                    className={`icon-button ${showArrows && analysisResult ? "active" : ""}`}
                                    aria-label={showArrows ? "Hide move arrows" : "Show move arrows"}
                                    disabled={!analysisResult}
                                >
                                    {showArrows ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </Tooltip>
                            <Tooltip content={showThreats ? "Hide threatened pieces" : "Show threatened pieces"}>
                                <button
                                    onClick={toggleShowThreats}
                                    className={`icon-button ${showThreats && analysisResult ? "active" : ""}`}
                                    aria-label={showThreats ? "Hide threatened pieces" : "Show threatened pieces"}
                                    disabled={!analysisResult}
                                >
                                    <FiTarget />
                                </button>
                            </Tooltip>

                        </div>
                    </div>
                    </div>


                    <div className="board-container">
                        <div className="evaluation-bar-wrapper">
                            {analysisResult && analysisResult.eval !== undefined ? (
                                <EvaluationBar evaluation={analysisResult.eval} mate={analysisResult.mate} />
                            ) : (
                                <div className="evaluation-bar-placeholder"></div>
                            )}
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
                            customArrows={getCustomArrows()}
                            customSquareStyles={getCustomSquareStyles()}
                        /></div>
                    </div>
                    <div className="fen-input-container">
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
                    </div></div></div>

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
                            {analysisResult && (
                                <div className="visualization-legend">
                                    <div className="legend-item">
                                        <span className="arrow-sample best-move"></span>
                                        <span>Best move</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="arrow-sample continuation"></span>
                                        <span>Continuation</span>
                                    </div>
                                    {showThreats && (
                                        <div className="legend-item">
                                            <span className="square-sample threat"></span>
                                            <span>Threatened</span>
                                        </div>
                                    )}
                                </div>
                            )}
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
