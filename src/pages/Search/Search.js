import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
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

    useEffect(() => {
        setFenInputValue(currentFen);
    }, [currentFen]);

    const onPieceDrop = useCallback((sourceSquare, targetSquare) => {
        setFenError('');
        const gameCopy = new Chess(currentFen);
        const piece = gameCopy.get(sourceSquare);
        if (piece) {
            gameCopy.remove(sourceSquare);
            gameCopy.put(piece, targetSquare);
            const newFen = gameCopy.fen();
            setCurrentFen(newFen);
            setGame(gameCopy);
            return true;
        }
        return false;
    }, [currentFen]);

    const handleResetBoard = () => {
        setFenError('');
        const newGame = new Chess(START_FEN);
        setGame(newGame);
        setCurrentFen(START_FEN);
        setIsRemoveMode(false);
    };

    const handleClearBoard = () => {
        setFenError('');
        const newGame = new Chess(KINGS_ONLY_EMPTY_FEN);
        setGame(newGame);
        setCurrentFen(KINGS_ONLY_EMPTY_FEN);
        setIsRemoveMode(false);
    };


    const handleFenInputChange = (event) => {
        setFenInputValue(event.target.value);
        setFenError('');
    };

    const handleImportFen = () => {
        setFenError('');
        const fenToLoad = fenInputValue.trim();
        if (!fenToLoad) {
            setFenError("Empty FEN string; can't load.");
            return;
        }
        try {

            const tempGame = new Chess(fenToLoad);

            setCurrentFen(tempGame.fen());
            setGame(tempGame);
            console.log("FEN loaded successfully");
            setIsRemoveMode(false);

        } catch (e) {
            console.error("Error loading FEN:", e);
            setFenError('Invalid FEN string');
        }
    };

    const handleSearch = () => {
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
            setFenError('');
            const gameCopy = new Chess(currentFen);
            const piece = gameCopy.get(square);

            if (piece) {
                console.log(`Removing piece ${piece.type} from ${square}`);
                gameCopy.remove(square);
                const newFen = gameCopy.fen();
                setCurrentFen(newFen);
                setGame(gameCopy);
            } else {
                console.log(`No piece to remove on ${square}`);
            }
        }
    }, [isRemoveMode, currentFen]);


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
                        >
                            {isRemoveMode ? 'Remove Mode: ON' : 'Remove Mode: OFF'}
                        </button>
                    </div>

                    <div className="search-board-wrapper">
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
                        {isRemoveMode && <div className="remove-mode-indicator">Remove Mode Active: Click piece to remove</div>}
                    </div>

                    <div className="fen-input-area">
                        <label htmlFor="fenInput">FEN String:</label>
                        <input
                            type="text"
                            id="fenInput"
                            className="fen-input"
                            value={fenInputValue}
                            onChange={handleFenInputChange}
                            placeholder="Enter FEN string here"
                        />
                        <button onClick={handleImportFen} className="control-button import-button">Load FEN</button>
                        {fenError && <span className="fen-error-message">{fenError}</span>}
                    </div>
                </div>

                <div className="search-params-area">
                    <h3>Retrieval options</h3>
                    <div className="param-item">
                        <label htmlFor="maxResults">Number of results:</label>
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
            </div>

        </div>
    );
};

export default Search;