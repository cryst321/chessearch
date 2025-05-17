import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import {FiTrash2, FiXCircle, FiChevronRight, FiRefreshCw, FiInfo} from 'react-icons/fi';
import { findSimilarPositions } from '../../services/searchService';
import './Search.scss';
import Tooltip from "../../components/Tooltip/Tooltip";
import { handlePieceDrop, handleSquareClick, trySetFen, switchSides, getSideToMove }  from "../../services/chessUtils"

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
    const trySetFenWrapper = useCallback(
        (newFen) => {
            return trySetFen(newFen, setGame, setCurrentFen, setFenInputValue, setFenError)
        },
        [setGame, setCurrentFen, setFenInputValue, setFenError],
    )

    const onPieceDrop = useCallback(
        (sourceSquare, targetSquare, piece) => {
            setFenError("")
            return handlePieceDrop(sourceSquare, targetSquare, piece, currentFen, trySetFenWrapper)
        },
        [currentFen, trySetFenWrapper],
    )
    const onSquareClick = useCallback(
        (square) => {
            handleSquareClick(square, isRemoveMode, currentFen, trySetFenWrapper)
        },
        [isRemoveMode, currentFen, trySetFenWrapper],
    )
    const handleResetBoard = () => {
        trySetFenWrapper(START_FEN)
        setIsRemoveMode(false)
    }

    const handleClearBoard = () => {
        trySetFenWrapper(KINGS_ONLY_EMPTY_FEN)
        setIsRemoveMode(false)
    }
    const handleSwitchSides = useCallback(() => {
        switchSides(currentFen, trySetFenWrapper, setFenError)
    }, [currentFen, trySetFenWrapper, setFenError])


    const getSideToMove = () => {
        const fenParts = currentFen.split(" ")
        if (fenParts.length >= 2) {
            return fenParts[1]
        }
        return "w"
    }
    const handleFenInputChange = (event) => {
        setFenInputValue(event.target.value)
        setFenError("")
    }

    const handleImportFen = () => {
        const fenToLoad = fenInputValue.trim()
        if (!fenToLoad) {
            setFenError("Empty FEN string.")
            return
        }
        if (trySetFenWrapper(fenToLoad)) {
            console.log("FEN loaded successfully")
            setIsRemoveMode(false)
        }
    }

    const handleSearch = async () => {
        setSearchError('');
        setFenError('');
        if (!trySetFenWrapper(currentFen)) {
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

    const toggleHelpSection = () => {
        setIsHelpOpen(!isHelpOpen);
    };

    const sideToMove = getSideToMove(currentFen)

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
                        <Tooltip content={`${sideToMove === "w" ? "White" : "Black"} to move. Click to switch sides`}>
                            <button
                                onClick={handleSwitchSides}
                                className={`side-switch-button ${sideToMove === "w" ? "white-to-move" : "black-to-move"}`}
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
                            onSquareClick={onSquareClick}
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