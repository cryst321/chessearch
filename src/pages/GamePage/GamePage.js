import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DeleteOutlined } from '@ant-design/icons';
import * as api from '../../services/api';
import ChessBoardDisplay from '../../components/ChessBoardDisplay/ChessBoardDisplay';
import GameInfo from '../../components/GameInfo/GameInfo';

import './GamePage.scss';

/**
 * Page for displaying a chess game and relevant metadata
 * @returns {JSX.Element}
 * @constructor
 */
const GamePage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [gameData, setGameData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const initialMoveIndexFromSearch = location.state?.initialMoveIndex;

    useEffect(() => {
        const fetchGame = async () => {
            if (!gameId) {
                setError("No game ID provided.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            setGameData(null);

            console.log(`Fetching game with ID: ${gameId}`);

            try {
                const data = await api.getGameById(gameId);
                if (data) {
                    console.log("Game data received:", data);
                    setGameData(data);
                } else {
                    setError(`Game with ID ${gameId} not found.`);
                }
            } catch (err) {
                console.error("Failed to fetch game:", err);
                setError(`Failed to load game data. ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGame();
    }, [gameId]);

    const handleBack = () => {
        navigate('/games');
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
            api.deleteGame(gameId)
                .then(() => {
                    navigate('/games');
                })
                .catch(() => {
                    alert('Failed to delete game. Please try again.');
                });
        }
    };

    if (isLoading) {
        return <div className="game-page-loading">Loading game data...</div>;
    }

    if (error) {
        return (
            <div className="game-page-error">
                <p>Error: {error}</p>
                <button onClick={handleBack} className="back-button">Back to Games List</button>
            </div>
        );
    }

    /* game not found */
    if (!gameData) {
        return (
            <div className="game-page-not-found">
                <p>Game not found.</p>
                <button onClick={handleBack} className="back-button">Back to Games List</button>
            </div>
        );
    }

    return (
        <div className="game-page-container">
            <div className="page-header">
                <button
                    onClick={handleBack}
                    className="back-button icon-button"
                    aria-label="Back to Games List"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <h1 className="game-page-title">{gameData.white} vs. {gameData.black} (ID: {gameId})</h1>
                {isAdmin && (
                    <button 
                        className="delete-button" 
                        onClick={handleDelete}
                        title="Delete game"
                    >
                        <DeleteOutlined />
                    </button>
                )}
            </div>
            <div className="game-layout">
                {/* Chessboard */}
                <div className="chessboard-section">
                    <ChessBoardDisplay
                        positions={gameData.positions}
                        initialMoveIndex={initialMoveIndexFromSearch}
                    />
                </div>
                {/* Game info */}
                <div className="game-info-section">
                    <GameInfo game={gameData} />
                </div>
            </div>
        </div>
    );
};

export default GamePage;
