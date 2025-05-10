import React, {useState, useEffect, useRef} from 'react';
import { Link } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';

import './Games.scss';
import { FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight } from 'react-icons/fi';


const API_BASE_URL = 'http://localhost:8080/api/game';
const PAGE_SIZE = 10;

/**
 * Page for displaying preview (last FEN position and general details) of 10 games based on pagination and filters
 * @returns {JSX.Element}
 * @constructor
 */
const Games = () => {
    const [previews, setPreviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(0);

    const [isEditingPage, setIsEditingPage] = useState(false);
    const [editPageValue, setEditPageValue] = useState('');
    const pageInputRef = useRef(null);

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
                const paginatedData = await response.json();

                if (!paginatedData || !Array.isArray(paginatedData.previews)) {
                    throw new Error("Invalid data format received from server.");
                }

                setPreviews(paginatedData.previews);
                setTotalPages(paginatedData.totalPages);

            } catch (err) {
                console.error("Error fetching game previews:", err);
                setError(err.message || 'Failed to load games. Please try again.');
                setPreviews([]);
                setTotalPages(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGamePreviews();

    }, [currentPage]);
    const goToPage = (pageIndex) => {
        const newPageIndex = Math.max(0, Math.min(totalPages>0 ? totalPages-1 : 0, pageIndex));

        setCurrentPage(newPageIndex);
        setIsEditingPage(false);
    };
    const goToFirstPage = () => {
        goToPage(0);
    };

    const goToPrevPage = () => {
        goToPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            goToPage(currentPage + 1);
        }
    };

    const goToLastPage = () => {
        if (totalPages > 0) {
            goToPage(totalPages - 1);
        }
    };

    /* logic for inputing page number manually */
    const handlePageDisplayClick = () => {
        if (isLoading || totalPages === 0) return;
        setEditPageValue(String(currentPage + 1));
        setIsEditingPage(true);
    };


    useEffect(() => {
        if (isEditingPage && pageInputRef.current) {
            pageInputRef.current.focus();
            pageInputRef.current.select();
        }
    }, [isEditingPage]);


    const handlePageInputChange = (e) => {
        setEditPageValue(e.target.value);
    };

   /* submitting page input */
    const handlePageInputSubmit = () => {
        const targetPageOneBased = parseInt(editPageValue, 10);

        if (!isNaN(targetPageOneBased) && targetPageOneBased >= 1 && targetPageOneBased <= totalPages) {
            const targetPageZeroBased = targetPageOneBased - 1;
            goToPage(targetPageZeroBased);
        } else {
            console.warn("Invalid page number entered:", editPageValue);
            setIsEditingPage(false);
        }
    };

    const handlePageInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handlePageInputSubmit();
        } else if (e.key === 'Escape') {
            setIsEditingPage(false);
            setEditPageValue('');
        }
    };

    const handlePageInputBlur = () => {
        setIsEditingPage(false);
        setEditPageValue('');
    };

    const hasMorePages = currentPage < totalPages - 1;

    return (
        <div className="games-page-container">
            <h2>Browse Games</h2>

            {isLoading && <div className="loading-indicator">Loading...</div>}
            {error && <div className="error-message">{error}</div>}

            {!isLoading && !error && previews.length === 0 && currentPage > 0 && (
                <p>You've reached the end, or this page is empty.</p>
            )}
            {!isLoading && !error && previews.length === 0 && currentPage === 0 && (
                <p>No games found.</p>
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
                                    <div className="board-placeholder">Error displaying final position.</div>
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

            { (totalPages > 0) &&
                <div className="pagination-controls">
                    <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 0 || isLoading}
                        className="pagination-button icon-button"
                        aria-label="Go to first page"
                        title="Go to first page"
                    >
                        <FiChevronsLeft />
                    </button>
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 0 || isLoading}
                        className="pagination-button icon-button"
                        aria-label="Previous Page"
                        title="Previous Page"
                    >
                        <FiChevronLeft />
                    </button>

                    {isEditingPage ? (
                        <input
                            ref={pageInputRef}
                            type="number"
                            className="page-number-input"
                            value={editPageValue}
                            onChange={handlePageInputChange}
                            onKeyDown={handlePageInputKeyDown}
                            onBlur={handlePageInputBlur}
                            min="1"
                            max={totalPages > 0 ? totalPages : 1}
                        />
                    ) : (
                        <span
                            className="page-number-display"
                            onClick={handlePageDisplayClick}
                            title="Click to enter page number"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePageDisplayClick(); }}
                            role="button"
                            aria-label={`Page ${currentPage + 1}. Click to edit.`}
                        >
                            [ {currentPage + 1}  / {totalPages} ]
                        </span>
                    )}

                    <button
                        onClick={goToNextPage}
                        disabled={!hasMorePages || isLoading}
                        className="pagination-button icon-button"
                        aria-label="Next Page"
                        title="Next Page"
                    >
                        <FiChevronRight />
                    </button>
                    <button
                        onClick={goToLastPage}
                        disabled={currentPage >= totalPages - 1 || isLoading || totalPages === 0}
                        className="pagination-button icon-button"
                        aria-label="Go to last page"
                        title="Go to last page"
                    >
                        <FiChevronsRight />
                    </button>
                </div>
            }
        </div>

    );
};

export default Games;