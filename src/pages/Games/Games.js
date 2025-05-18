import React, {useState, useEffect, useRef, useCallback} from 'react';
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
    const gamesGridRef = useRef(null);

    const [filters, setFilters] = useState({
        eco: '',
        dateFrom: '',
        dateTo: '',
        result: '',
        minElo: '',
        maxElo: '',
        playerName: ''
    });

    /**updates when user applies filters w button**/
    const [appliedFilters, setAppliedFilters] = useState(filters);

    const fetchGamePreviews = useCallback(async () => {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('size', PAGE_SIZE);


        if (appliedFilters.eco) params.append('eco', appliedFilters.eco);
        if (appliedFilters.dateFrom) params.append('dateFrom', appliedFilters.dateFrom);
        if (appliedFilters.dateTo) params.append('dateTo', appliedFilters.dateTo);
        if (appliedFilters.result) params.append('result', appliedFilters.result);
        if (appliedFilters.minElo !== '' && !isNaN(parseInt(appliedFilters.minElo))) params.append('minElo', appliedFilters.minElo);
        if (appliedFilters.maxElo !== '' && !isNaN(parseInt(appliedFilters.maxElo))) params.append('maxElo', appliedFilters.maxElo);
        if (appliedFilters.playerName) params.append('player', appliedFilters.playerName);


        const apiUrl = `${API_BASE_URL}?${params.toString()}`;
        console.log("Fetching:", apiUrl);
            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const paginatedData = await response.json();

                if (!paginatedData || !Array.isArray(paginatedData.previews)|| typeof paginatedData.totalPages !== 'number' || typeof paginatedData.totalGames !== 'number') {
                    console.error("Invalid data format received from server:", paginatedData);
                    throw new Error("Invalid data format received from server.");
                }

                setPreviews(paginatedData.previews);
                setTotalPages(paginatedData.totalPages);
                if (gamesGridRef.current) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (err) {
                console.error("Error fetching game previews:", err);
                setError(err.message || 'Failed to load games. Please try again.');
                setPreviews([]);
                setTotalPages(0);
            } finally {
                setIsLoading(false);
            }
        }, [currentPage, appliedFilters]);

    useEffect(() => {
        fetchGamePreviews();
    }, [fetchGamePreviews]);

        const goToPage = useCallback((pageIndex) => {
            const maxPage = totalPages > 0 ? totalPages - 1 : 0;
            const newPageIndex =Math.max(0, Math.min(maxPage, pageIndex));

            if (totalPages === 0) {
                setCurrentPage(0);
            } else if (newPageIndex !== currentPage) {
                setCurrentPage(newPageIndex);
            }
            setIsEditingPage(false);
    },[currentPage, totalPages]);

        const goToFirstPage = useCallback(() => {
            goToPage(0);
        }, [goToPage]);

        const goToPrevPage = useCallback(() => {
            goToPage(currentPage - 1);
        }, [currentPage, goToPage]);

        const goToNextPage = useCallback(() => {
            if (currentPage < totalPages - 1) {
                goToPage(currentPage + 1);
            }
        }, [currentPage, totalPages, goToPage]);

        const goToLastPage = useCallback(() => {
            if (totalPages > 0) {
                goToPage(totalPages - 1);
            }
        }, [totalPages, goToPage]);

        /* logic for inputing page number manually */
    const handlePageDisplayClick = useCallback (() => {
        if (isLoading || totalPages === 0) return;
        setEditPageValue(String(currentPage + 1));
        setIsEditingPage(true);
    },[isLoading,currentPage,totalPages]);


    useEffect(() => {
        if (isEditingPage && pageInputRef.current) {
            pageInputRef.current.focus();
            pageInputRef.current.select();
        }
    }, [isEditingPage]);


    const handlePageInputChange = useCallback((e) => {
        setEditPageValue(e.target.value);
    },[]);

   /* submitting page input */
    const handlePageInputSubmit = useCallback(() => {
        const targetPageOneBased = parseInt(editPageValue, 10);

        if (!isNaN(targetPageOneBased) && targetPageOneBased >= 1 && targetPageOneBased <= totalPages) {
            const targetPageZeroBased = targetPageOneBased - 1;
            goToPage(targetPageZeroBased);
        } else {
            console.warn("Invalid page number entered:", editPageValue);
            setIsEditingPage(false);
            setEditPageValue('');

        }
    },[editPageValue, totalPages, goToPage]);

    const handlePageInputKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handlePageInputSubmit();
        } else if (e.key === 'Escape') {
            setIsEditingPage(false);
            setEditPageValue('');
        }
    },[handlePageInputSubmit]);

    const handlePageInputBlur =  useCallback(() => {
        setIsEditingPage(false);
        setEditPageValue('');
    },[]);

        const handleFilterChange =  useCallback((e) => {
            const { name, value } = e.target;
            
    
            if ((name === 'minElo' || name === 'maxElo') && value !== '') {
                const numValue = parseInt(value);
                if (numValue < 0) return; 
            }
            
            setFilters(prevFilters => ({
                ...prevFilters,
                [name]: value
            }));
        },[]);

        const handleApplyFilters =  useCallback(() => {
            setCurrentPage(0);
            setAppliedFilters(filters);
        },[filters]);

        const handleClearFilters = useCallback(() => {
            const initialFilters = { eco: '', dateFrom: '', dateTo: '', result: '', minElo: '', maxElo: '', playerName: '' };
            setFilters(initialFilters);
            setCurrentPage(0);
            setAppliedFilters(initialFilters);
        },[]);

    const isFirstPage = currentPage === 0;
    const isLastPage = totalPages === 0 || currentPage >= totalPages - 1;

    return (
        <div className="games-page-container">
            <h2>Browse Games</h2>

            {/* filters */}
            <div className="filter-bar">
                <div className="filter-inputs">
                    <input
                        type="text"
                        name="playerName"
                        value={filters.playerName}
                        onChange={handleFilterChange}
                        placeholder="Player name"
                        aria-label="Filter by player's name"
                    />
                    <input
                        type="text"
                        name="eco"
                        value={filters.eco}
                        onChange={handleFilterChange}
                        placeholder="ECO code"
                        aria-label="Filter by ECO code"
                    />
                    <select
                        name="result"
                        value={filters.result}
                        onChange={handleFilterChange}
                        aria-label="Filter by game result"
                    >
                        <option value="">Any</option>
                        <option value="1-0">White won</option>
                        <option value="0-1">Black won</option>
                        <option value="1/2-1/2">Draw</option>
                    </select>
                    <input
                        type="number"
                        name="minElo"
                        value={filters.minElo}
                        onChange={handleFilterChange}
                        placeholder="Min ELO"
                        min="0"
                        aria-label="Filter by minimum ELO"
                    />
                    <input
                        type="number"
                        name="maxElo"
                        value={filters.maxElo}
                        onChange={handleFilterChange}
                        placeholder="Max ELO"
                        min="0"
                        aria-label="Filter by maximum ELO"
                    />
                    <div className="date-filters">
                        <label htmlFor="dateFrom" className="date-label">Date:</label>
                        <input
                            id="dateFrom"
                            type="date"
                            name="dateFrom"
                            value={filters.dateFrom}
                            onChange={handleFilterChange}
                            title="Date From"
                            aria-label="Filter by date from"
                        />
                        <span className="date-separator">-</span>
                        <input
                            type="date"
                            name="dateTo"
                            value={filters.dateTo}
                            onChange={handleFilterChange}
                            title="Date To"
                            aria-label="Filter by date to"
                        />
                    </div>
                </div>
                <div className="filter-buttons">
                    <button onClick={handleApplyFilters} disabled={isLoading} className="filter-button">
                        Search
                    </button>
                    <button onClick={handleClearFilters} disabled={isLoading} className="filter-button secondary">
                        Clear
                    </button>
                </div>
            </div>

            <div className="games-message-area">
            {isLoading && <div className="loading-indicator">Loading...</div>}
            {error && <div className="error-message">{error}</div>}

                {!isLoading && !error && previews.length === 0 && (
                    <p className="no-games-message">
                        {appliedFilters.eco || appliedFilters.dateFrom || appliedFilters.dateTo ||
                        appliedFilters.result || appliedFilters.minElo || appliedFilters.maxElo ||
                        appliedFilters.playerName ?
                            "No games found matching the applied filters." :
                            (currentPage > 0 && totalPages > 0 ? "You've reached the end." : "No games found.")
                        }</p>
                )}
            </div>

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

            { (totalPages > 0 || isLoading) &&
                <div className="pagination-controls">
                    <button
                        onClick={goToFirstPage}
                        disabled={isFirstPage || isLoading}
                        className="pagination-button icon-button"
                        aria-label="Go to first page"
                        title="Go to first page"
                    >
                        <FiChevronsLeft />
                    </button>
                    <button
                        onClick={goToPrevPage}
                        disabled={isFirstPage  || isLoading}
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
                            step="1"
                        />
                    ) : (
                        <span
                            className="page-number-display"
                            onClick={handlePageDisplayClick}
                            title="Click to enter page number"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePageDisplayClick(); }}
                            role="button"
                            aria-label={`Page ${currentPage + 1} of ${totalPages}. Click to edit.`}
                        >
                            [ {currentPage + 1}  / {totalPages} ]
                        </span>
                    )}

                    <button
                        onClick={goToNextPage}
                        disabled={isLastPage  || isLoading}
                        className="pagination-button icon-button"
                        aria-label="Next Page"
                        title="Next Page"
                    >
                        <FiChevronRight />
                    </button>
                    <button
                        onClick={goToLastPage}
                        disabled={isLastPage || isLoading}
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