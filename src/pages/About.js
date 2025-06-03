import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiChevronRight } from 'react-icons/fi';
import '../styles/global.scss';
import './About.scss';


import mainInterfaceScreenshot from '../assets/images/Group 407.jpg';
import searchInterfaceScreenshot from '../assets/images/Group 408.jpg';
import analysisBoardScreenshot from '../assets/images/img.png';
import databaseInterfaceScreenshot from '../assets/images/Group 406.jpg';
import adminToolScreenshot from '../assets/images/img5.png';

const About = () => {
    const { isAdmin } = useAuth();
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const sections = [
        {
            id: 'overview',
            title: 'Project Overview',
            content: (
                <>
                    <p>ChessQuery is a comprehensive chess platform that allows fuzzy search for similar chess positions.</p>
                    <div className="screenshot-placeholder">
                        <img src={mainInterfaceScreenshot} alt="Main interface screenshot" className="section-screenshot" />
                    </div>
                </>
            )
        },
        {
            id: 'search',
            title: 'Position Search Technology',
            content: (
                <>
                    <p>Our position search engine uses information retrieval techniques based on Ganguly's research to find similar chess positions.</p>
                    <div className="screenshot-placeholder">
                        <img src={searchInterfaceScreenshot} alt="Search interface screenshot" className="section-screenshot" />
                    </div>
                    <h4>How it works:</h4>
                    <ul>
                        <li>Non-rigid position matching</li>
                        <li>Piece relationship analysis</li>
                        <li>Static and dynamic position patterns are taken into account</li>
                    </ul>
                    <h4>How to use:</h4>
                    <ul>
                        <li>Import any valid FEN position or use our interactive chessboard to create any position you like</li>
                        <li>Move and delete pieces, clear chessboard or reset starting position with ease</li>
                        <li>Select maximum amount of results to retrieve</li>
                        <li>Search!</li>
                    </ul>
                </>
            )
        },
        {
            id: 'analysis',
            title: 'Analysis Features',
            content: (
                <>
                    <p>Powered by Stockfish 17, our analysis tools provide deep insights into chess positions.</p>
                    <div className="screenshot-placeholder">
                        <img src={analysisBoardScreenshot} alt="Analysis board screenshot" className="section-screenshot" />
                    </div>
                    <h4>Key capabilities:</h4>
                    <ul>
                        <li>Real-time position evaluation</li>
                        <li>Best move suggestions</li>
                        <li>Line continuation analysis</li>
                    </ul>
                </>
            )
        },
        {
            id: 'database',
            title: 'Game Database',
            content: (
                <>
                    <p>Our extensive database contains thousands of chess games from lichess database.</p>
                    <div className="screenshot-placeholder">
                        <img src={databaseInterfaceScreenshot} alt="Database interface screenshot" className="section-screenshot" />
                    </div>
                    <h4>Features:</h4>
                    <ul>
                        <li>Filtering</li>
                        <li>Actual games from lichess.org</li>
                        <li>Comprehensive game metadata</li>
                        <li>Move between moves with ease, copy FEN's or open positions in analyzing tool</li>
                    </ul>
                </>
            )
        },
        {
            id: 'tech',
            title: 'Technical Stack',
            content: (
                <>
                    <p>Built with modern web technologies and chess-specific libraries.</p>
                    <h4>Core technologies:</h4>
                    <ul>
                        <li>React for frontend</li>
                        <li>Spring Boot backend (Java)</li>
                        <li>Stockfish integration</li>
                        <li>Apache Lucene for informational retrieval</li>
                    </ul>
                </>
            )
        }
    ];

    const adminSection = {
        id: 'admin',
        title: 'Management Tools',
        content: (
            <>
                <p>We have a powerful administrative interface for managing the chess database.</p>
                <div className="screenshot-placeholder">
                    <img src={adminToolScreenshot} alt="Admin management tool screenshot" className="section-screenshot" />
                </div>
                <h4>Key Features:</h4>
                <ul>
                    <li>Bulk PGN import functionality</li>
                    <li>Game validation and preprocessing</li>
                    <li>Database maintenance tools</li>
                    <li>Clear and rebuild Lucene index</li>
                    <li>Import status monitoring</li>
                </ul>
                <h4>Usage instructions:</h4>
                <ol>
                    <li>Prepare PGN files with valid game data</li>
                    <li>Use the upload interface to select files</li>
                    <li>Monitor import progress in real-time</li>
                    <li>Verify successful import through the games database</li>
                </ol>
                <p className="note">Note: this tool is only available to administrators and requires authentication.</p>
            </>
        )
    };

    return (
        <div className="about-container">
            <h1>About ChessQuery</h1>

            {sections.map(section => (
                <div key={section.id} className="section">
                    <h2
                        className={`section-header ${expandedSections[section.id] ? 'expanded' : ''}`}
                        onClick={() => toggleSection(section.id)}
                    >
                        {section.title}
                        <FiChevronRight className="toggle-icon" />
                    </h2>
                    <div className={`section-content ${expandedSections[section.id] ? 'expanded' : ''}`}>
                        {section.content}
                    </div>
                </div>
            ))}

            {isAdmin && (
                <div className="section admin-section">
                    <h2
                        className={`section-header ${expandedSections[adminSection.id] ? 'expanded' : ''}`}
                        onClick={() => toggleSection(adminSection.id)}
                    >
                        {adminSection.title}
                        <FiChevronRight className="toggle-icon" />
                    </h2>
                    <div className={`section-content ${expandedSections[adminSection.id] ? 'expanded' : ''}`}>
                        {adminSection.content}
                    </div>
                </div>
            )}
        </div>
    );
};

export default About;
