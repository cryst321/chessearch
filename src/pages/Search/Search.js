import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { FiTrash2, FiXCircle, FiChevronRight } from 'react-icons/fi';
import './Search.scss';

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
    const onPieceDrop = useCallback((sourceSquare, targetSquare) => {
        setFenError('');
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

    const handleResetBoard = () => {
        trySetFen(START_FEN);
        setIsRemoveMode(false);
    };

    const handleClearBoard = () => {
        trySetFen(KINGS_ONLY_EMPTY_FEN);
        setIsRemoveMode(false);
    };


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

    const handleSearch = () => {
        if (!trySetFen(currentFen)) {
            alert("Can't perform search: invalid board position.");
            return;
        }
        console.log('Search initiated with FEN:', currentFen);
        console.log('Max results parameter:', maxResults);
        alert("Search functionality not implemented yet!");
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
                            className={`fen-input ${fenError ? 'input-error' : ''}`}                            value={fenInputValue}
                            alue={fenInputValue}
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
                            <label htmlFor="maxResults">Results:</label>
                            <input
                                type="number"
                                id="maxResults"
                                className="param-input"
                                value={maxResults}
                                onChange={(e) => setMaxResults(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                min="1"
                            />
                        </div>
                        <button onClick={handleSearch} className="search-button">
                            Search!
                        </button>
                    </div>



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