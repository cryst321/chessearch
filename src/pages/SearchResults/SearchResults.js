import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import './SearchResults.scss';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const SearchResults = () => {
    const location = useLocation();
    const { results, queryFen } = location.state || { results: [], queryFen: '' };

    const [showAll, setShowAll] = useState(false);
    const [isQueryBoardVisible, setIsQueryBoardVisible] = useState(false);

    useEffect(() => {
        if (!results || results.length === 0) {
            console.warn("No results passed to SearchResults page or results are empty.");
        }
        setIsQueryBoardVisible(false);
    }, [results]);

    if (!results || results.length === 0) {
        return (
            <div className="search-results-container">
                <h2>Search Results</h2>
                <p>No results to display. Please try a new <Link to="/search">search</Link>.</p>
                {queryFen && <p>Original query FEN: {queryFen}</p>}
            </div>
        );
    }
    const toggleQueryBoard = () => {
        setIsQueryBoardVisible(!isQueryBoardVisible);
    };
    const bestResult = results[0];
    const otherResults = results.slice(1);

    return (
        <div className="search-results-container">
            <h2>Search Results</h2>
            {queryFen && (
                <div className="query-fen-section">
                    <p className="query-fen-display">
                        Showing results for FEN: <strong>{queryFen}</strong>
                        <button
                            onClick={toggleQueryBoard}
                            className={`toggle-query-board ${isQueryBoardVisible ? 'visible' : ''}`}
                            aria-expanded={isQueryBoardVisible}
                            aria-controls="query-board-container"
                            title={isQueryBoardVisible ? 'Hide Query Board' : 'Show Query Board'}
                        >
                            {isQueryBoardVisible ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </p>
                    <div
                        id="query-board-container"
                        className={`query-board-display ${isQueryBoardVisible ? 'visible' : ''}`}
                    ><div>
                    <Chessboard
                            position={queryFen}
                            arePiecesDraggable={false}
                            boardWidth={240}
                            customBoardStyle={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                            customDarkSquareStyle={{ backgroundColor: 'rgb(111,143,114)' }}
                            customLightSquareStyle={{ backgroundColor: 'rgb(173,189,143)'}}
                        />
                        </div>
                        </div>
                </div>
            )}
            {bestResult && (
                <div className="best-result-section">
                    <h3>Top Match:</h3>
                    <div className="search-result-item best-match-item">
                        <Link
                            to={`/game/${bestResult.gameId}`}
                            state={{ initialMoveIndex: bestResult.moveNumber - 1}}
                            className="result-link"
                        >
                            <div className="result-board large-board">
                                <Chessboard
                                    position={bestResult.positionFen}
                                    arePiecesDraggable={false}
                                    boardWidth={320}
                                    customBoardStyle={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                                    customDarkSquareStyle={{ backgroundColor: 'rgb(111,143,114)' }}
                                    customLightSquareStyle={{ backgroundColor: 'rgb(173,189,143)'}}
                                />
                            </div>
                            <div className="result-details">
                                <p>Game ID: {bestResult.gameId}</p>
                                <p>Move: {bestResult.moveNumber }</p>
                                <p className="fen-preview-text">{bestResult.positionFen}</p>
                                <span className="view-game-prompt">Click to view full game</span>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* other results*/}
            {otherResults.length > 0 && (
                <div className="other-results-section">
                    <button onClick={() => setShowAll(!showAll)} className="show-more-button">
                        {showAll ? `Hide ${otherResults.length} other matches` : `Show ${otherResults.length} more matches...`}
                    </button>
                    {showAll && (
                        <div className="other-results-grid">
                            {otherResults.map((result) => (
                                <div key={`${result.gameId}-${result.moveNumber}-${result.positionFen}`} className="search-result-item">
                                    <Link
                                        to={`/game/${result.gameId}`}
                                        state={{ initialMoveIndex: result.moveNumber - 1}}
                                        className="result-link"
                                    >
                                        <div className="result-board small-board">
                                            <Chessboard
                                                position={result.positionFen}
                                                arePiecesDraggable={false}
                                                boardWidth={180}
                                                customBoardStyle={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                                                customDarkSquareStyle={{ backgroundColor: 'rgb(111,143,114)' }}
                                                customLightSquareStyle={{ backgroundColor: 'rgb(173,189,143)'}}
                                            />
                                        </div>
                                        <div className="result-details small-details">
                                            <p>Game ID: {result.gameId}</p>
                                            <p>Move: {result.moveNumber}</p>
                                            <span className="view-game-prompt mini">View game</span>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>)}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
