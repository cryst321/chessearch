import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChessBoardDisplay from '../components/ChessBoardDisplay/ChessBoardDisplay';
import GameInfo from '../components/GameInfo/GameInfo';
import './GamePage.scss';

const API_BASE_URL = 'http://localhost:8080/api/game';

const api = {
    getGameById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Status: ${response.status}`);
        }
        return await response.json();
    },
};


const GamePage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();

    const [gameData, setGameData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
            <button onClick={handleBack} className="back-button">
                &larr; Back to Games List
            </button>
            <h1 className="game-page-title">Game Details (ID: {gameId})</h1>
            <div className="game-layout">
                {/* Chessboard */}
                <div className="chessboard-section">
                    <ChessBoardDisplay positions={gameData.positions} />
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
