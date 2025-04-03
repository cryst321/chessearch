import React from 'react';
import '../styles/global.scss';
import {NavLink} from "react-router-dom";

const Home = () => {
    return (<>
        <h1>Welcome to ChessQuery!</h1>

        <h2>What is this?</h2>
        <p>This project is created to facilitate easy, flexible search for similar chess positions.</p>
        <p>ChessQuery lets you explore database of over 1000 chess games with ease, implementing informational retrieval
            algorithm for non-rigid search.</p>
        <p>We also have chess position analyzing tool, which uses Stockfish.</p>

        <h2>Key Features</h2>
        <ul>
            <li><strong>Smart Search:</strong> ChessQuery uses sophisticated algorithm to retrieve similar positions based
                on different criteria.
            </li>
            <li><strong>Interactive Chessboard:</strong> You can use FEN notation to make a query, or interact with our
                chessboard to create your desired position.
            </li>
            <li><strong>Flexibility:</strong> Unlike traditional systems, ChessQuery is not limited by the exact position of chess pieces.
            </li>
            <li><strong>Comprehensive Database:</strong> You can explore
                historical matches or modern ones for deeper analysis, and you can perform search on any existing position
                in out database.
            </li>
            <li><strong>Game Analysis:</strong> Review and analyze existing games and positions with Stockfish engine.
            </li>
        </ul>

        <h2>How it Works</h2>
        <p>
            Check out our <NavLink to="/about">About</NavLink> page for detailed information, or jump straight to
            our <NavLink to="/search">Search tool</NavLink>!
        </p>

        <h2>Links</h2>
        <p>Our website uses <a href={'https://stockfishchess.org/'}>Stockfish</a>,
            strong open-source chess engine.</p>
    </>)
}


export default Home;