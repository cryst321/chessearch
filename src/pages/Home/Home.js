import React from 'react';
import '../../styles/global.scss';
import {NavLink} from "react-router-dom";
import { GiChessKing, GiChessKnight, GiChessRook, GiChessBishop } from 'react-icons/gi';
import './Home.scss';

const Home = () => {
    return (
        <div className="home-container">
            <h1><GiChessKing className="header-icon" /> Welcome to ChessQuery!</h1>

            <h2><GiChessKnight className="section-icon" /> What is this?</h2>
            <p>ChessQuery is a chess position search engine that helps you find similar positions across a database of chess games.</p>
            <p>Using an advanced information retrieval algorithm based on Ganguly's research, ChessQuery can find similar positions even when pieces are not in exact same squares.</p>
            <p>You can also analyze positions using Stockfish and explore games with comprehensive filtering options.</p>

            <h2><GiChessRook className="section-icon" /> Key Features</h2>
            <ul>
                <li><strong>Intelligent position search:</strong> retrieve similar chess positions using a non-rigid search algorithm that understands piece relationships and board structure.
                </li>
                <li><strong>Interactive interface:</strong> set up positions using our interactive chessboard or FEN notation, with support for both search and analysis.
                </li>
                <li><strong>Large database:</strong> browse our collection of chess games. You can explore historical matches or modern ones for deeper analysis, perform search or analysis on any existing position in out database.
                </li>
                <li><strong>Position analysis:</strong> analyze any position with Stockfish engine to get detailed evaluations and best move suggestions.
                </li>
                <li><strong>Flexible filtering:</strong> aside from our information retrieval algorithm, you can use basic filtering tool to find games that match your criteria.
                </li>
            </ul>

            <h2><GiChessBishop className="section-icon" /> How it Works</h2>
            <p>
                Start by exploring our <NavLink to="/games">Games database</NavLink>, try out the <NavLink to="/search">Searching tool</NavLink> for retrieving similar chess positions, or use our <NavLink to="/analyze">Analysis tool</NavLink>!
            </p>

            <h2><GiChessKnight className="section-icon" /> Technology & References</h2>
            <p>ChessQuery is powered by several excellent tools and research:</p>
            <ul>
                <li><a href="https://stockfishchess.org/" target="_blank" rel="noopener noreferrer">Stockfish</a> — powerful open-source chess engine</li>
                <li><a href="https://chess-api.com/" target="_blank" rel="noopener noreferrer">Chess API</a> — free chess API that we use for position analysis</li>
                <li><a href="https://lucene.apache.org/" target="_blank" rel="noopener noreferrer">Lucene</a> — open-source software for indexing and search features</li>
                <li><a href="https://doras.dcu.ie/20378/1/ganguly-sigir2014.pdf" target="_blank" rel="noopener noreferrer">Retrieval of Similar Chess Positions</a> — research paper by Debasis Ganguly, Johannes Leveling and Gareth J. F. Jones, that forms the basis of our similarity search algorithm</li>
            </ul>
        </div>
    );
}

export default Home;