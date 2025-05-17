import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import {FiTrash2, FiXCircle, FiChevronRight, FiRefreshCw, FiInfo} from 'react-icons/fi';
import { findSimilarPositions } from '../../services/searchService';
import './Search.scss';
import Tooltip from "../../components/Tooltip/Tooltip";
import { handlePromotion } from "../../services/chessUtils"

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const KINGS_ONLY_EMPTY_FEN = '8/8/8/4k3/8/8/8/4K3 w - - 0 1';

const Search = () => {
    const [game, setGame] = useState(new Chess(START_FEN));
    const [currentFen, setCurrentFen] = useState(START_FEN);
    const [fenInputValue, setFenInputValue] = useState(START_FEN);
    const [maxResults, setMaxResults] = useState(10);
    const [fenError, setFenError] = useState('');

    const [isRemoveMode, setIsRemoveMode] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        setFenInputValue(currentFen);
    }, [currentFen]);

    /* validate FEN before updating */
    const trySetFen = (newFen) => {
        try {
            const tempGame = new Chess(newFen);
            setGame(tempGame);
            setCurrentFen(newFen);
            setFenError('');
            return true;
        } catch (e) {
            console.error("Invalid FEN generated:", newFen, e);
            setFenError("Only valid positions allowed.");
            return false;
        }
    };
    const onPieceDrop = useCallback(
        (sourceSquare, targetSquare, piece) => {
            setFenError("")
            const gameCopy = new Chess(currentFen)

            const pieceObj = gameCopy.get(sourceSquare)
            if (pieceObj && pieceObj.type === "p") {
                const targetRank = targetSquare.charAt(1)
                const isPromotionMove =
                    (pieceObj.color === "w" && targetRank === "8") || (pieceObj.color === "b" && targetRank === "1")

                if (isPromotionMove) {
                    console.log("Promotion detected. Piece:", piece)
                    let promotionPiece = "q"

                    if (piece && piece.length > 1) {
                        promotionPiece = piece.charAt(1).toLowerCase()
                        console.log("Promotion piece extracted:", promotionPiece)
                    }

                    const newFen = handlePromotion(
                        gameCopy,
                        sourceSquare,
                        targetSquare,
                        pieceObj.color === "w" ? "wP" : "bP",
                        promotionPiece,
                    )

                    if (newFen) {
                        return trySetFen(newFen)
                    }
                    return false
                }
            }
            if (pieceObj) {
                gameCopy.remove(sourceSquare)
                gameCopy.put(pieceObj, targetSquare)
                const newFen = gameCopy.fen()
                return trySetFen(newFen)
            }
            return false
        },
        [currentFen],
    )

    const handleResetBoard = () => {
        trySetFen(START_FEN);
        setIsRemoveMode(false);
    };

    const handleClearBoard = () => {
        trySetFen(KINGS_ONLY_EMPTY_FEN);
        setIsRemoveMode(false);
    };

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

    const getSideToMove = () => {
        const fenParts = currentFen.split(" ")
        if (fenParts.length >= 2) {
            return fenParts[1]
        }
        return "w"
    }
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
        if (trySetFen(fenToLoad)) {
            console.log("FEN loaded successfully");
            setIsRemoveMode(false);
        }
    };

    const handleSearch = async () => {
        setSearchError('');
        setFenError('');
        if (!trySetFen(currentFen)) {
            return;
        }
        setIsSearching(true);
        try {
            const results = await findSimilarPositions(currentFen, maxResults);
            console.log('Search results:', results);
            navigate('/search-results', {
                state: {
                    results: results,
                    queryFen: currentFen
                }
            });

        } catch (error) {
            console.error("Search failed:", error);
            setSearchError(error.message || "Search failed. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const toggleRemoveMode = () => {
        setIsRemoveMode(!isRemoveMode);
        setFenError('');
        console.log("Remove mode:", !isRemoveMode ? "ON" : "OFF");
    };
    const handleSquareClick = useCallback((square) => {
        if (isRemoveMode) {
            const gameCopy = new Chess(currentFen);
            const piece = gameCopy.get(square);

            if (piece) {
                console.log(`Removing piece ${piece.type} from ${square}`);
                gameCopy.remove(square);
                const newFen = gameCopy.fen();
                trySetFen(newFen);
            } else {
                console.log(`No piece to remove on ${square}`);
            }
        }
    }, [isRemoveMode, currentFen]);

    const toggleHelpSection = () => {
        setIsHelpOpen(!isHelpOpen);
    };
    return (
        <div className="search-page-container">
            <h2>Setup Position for Search</h2>
            <div className="search-layout">
                <div className="board-setup-area">
                    <div className="board-controls-top">
                        <button onClick={handleResetBoard} className="control-button">Reset Board</button>
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
                        {fenError && <span id="fen-error-msg" className="fen-error-message">{fenError}</span>}                    </div>
                </div>

                <div className="search-params-area">
                    <h3>Retrieval options</h3>
                    <div className="search-action-group">
                        <div className="param-item">
                            <Tooltip content="Maximum number of results that you wish to receive. Searching algorithm may return lesser than that.">
                                <label htmlFor="maxResults">
                                    Results: <FiInfo className="info-icon" />
                                </label>
                            </Tooltip>
                            <input
                                type="number"
                                id="maxResults"
                                className="param-input"
                                value={maxResults}
                                onChange={(e) => setMaxResults(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                min="1"
                                disabled={isSearching}
                            />
                        </div>
                        <button onClick={handleSearch}
                                className="search-button"
                                disabled={isSearching}>
                            {isSearching ? 'Searching...' : 'Search!'}
                        </button>
                    </div>
                    {searchError && <p className="search-error-message">{searchError}</p>}


                    <div className="help-text-section">
                        <h4
                            className={`help-title ${isHelpOpen ? 'expanded' : ''}`}
                            onClick={toggleHelpSection}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleHelpSection();}}
                            tabIndex={0}
                            role="button"
                            aria-expanded={isHelpOpen}
                            aria-controls="help-content-list"
                        >
                            How to use:
                            <FiChevronRight className="toggle-icon" />
                        </h4>
                        <div
                            id="help-content-list"
                            className={`help-content ${isHelpOpen ? 'expanded' : ''}`}
                        >
                            <ul>
                                <li>Drag pieces on the board to set up desired position.</li>
                                <li>Alternatively, paste a valid FEN string into the input box and click "Load FEN".</li>
                                <li>Click "Reset Board" to return the starting position.</li>
                                <li>Click "Clear Board" to remove all pieces (except kings).</li>
                                <li>To remove pieces off the board, toggle "Remove Mode" ON and click on them. Toggle OFF to drag pieces again.</li>
                                <li>Set the desired number of results and click "Search!" to retrieve similar positions.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Search;