import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import './Games.scss';


const API_BASE_URL = 'http://localhost:8080/api/game';
const PAGE_SIZE = 10;

const Games = () => {
    const [previews, setPreviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchGamePreviews = async () => {
            setIsLoading(true);
            setError(null);
            const apiUrl = `${API_BASE_URL}?page=${currentPage}&size=${PAGE_SIZE}`;

            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid data format received from server.");
                }

                setPreviews(data);
                setHasMore(data.length === PAGE_SIZE);

            } catch (err) {
                console.error("Error fetching game previews:", err);
                setError(err.message || 'Failed to load games. Please try again.');
                setPreviews([]);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGamePreviews();

    }, [currentPage]);

    const goToNextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const goToPrevPage = () => {
        setCurrentPage(prevPage => Math.max(0, prevPage - 1));
    };

    return (
        <div className="games-page-container">
            <h2>Browse Games</h2>

            {isLoading && <div className="loading-indicator">Loading...</div>}
            {error && <div className="error-message">{error}</div>}

            {!isLoading && !error && previews.length === 0 && (
                <p>No games found for this page.</p>
            )}

            <div className="game-previews-grid">
                {previews.map((preview) => (
                    <div key={preview.gameId} className="game-preview-card">
                        <Link to={`/game/${preview.gameId}`} className="preview-link">
                            <div className="preview-board">
                                {preview.lastFen ? (
                                    <Chessboard
                                        id={`board-${preview.gameId}`}
                                        position={preview.lastFen}
                                        arePiecesDraggable={false}
                                        boardWidth={160}
                                        customBoardStyle={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}
                                        customDarkSquareStyle={{ backgroundColor: 'rgb(111,143,114)' }}
                                        customLightSquareStyle={{ backgroundColor: 'rgb(173,189,143)' }}
                                    />
                                ) : (
                                    <div className="board-placeholder">No final position available</div>
                                )}
                            </div>
                            <div className="preview-details">
                                <p><strong>White:</strong> {preview.white || 'N/A'}</p>
                                <p><strong>Black:</strong> {preview.black || 'N/A'}</p>
                                <p><strong>Result:</strong> {preview.result || 'N/A'}</p>
                                <p><strong>Date:</strong> {preview.date || 'N/A'}</p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <div className="pagination-controls">

                <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 0 || isLoading}
                    aria-label="Previous Page"
                >
                    &larr;
                </button>

                <span>[ {currentPage + 1} ]</span>

                <button
                    onClick={goToNextPage}
                    disabled={!hasMore || isLoading}
                    aria-label="Next Page"
                >
                    &rarr;
                </button>
            </div>

        </div>
    );
};

export default Games;