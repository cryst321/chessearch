import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiChevronRight } from 'react-icons/fi';
import '../styles/global.scss';
import './About.scss';

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
                    <p>ChessQuery is a comprehensive chess analysis and search platform that combines modern web technologies with advanced chess algorithms.</p>
                    <div className="screenshot-placeholder">
                        <p>[Screenshot of main interface]</p>
                    </div>
                </>
            )
        },
        {
            id: 'search',
            title: 'Position Search Technology',
            content: (
                <>
                    <p>Our position search engine uses advanced information retrieval techniques based on Ganguly's research to find similar chess positions.</p>
                    <div className="screenshot-placeholder">
                        <p>[Screenshot of search interface]</p>
                    </div>
                    <h4>How it works:</h4>
                    <ul>
                        <li>Non-rigid position matching</li>
                        <li>Piece relationship analysis</li>
                        <li>Pattern recognition algorithms</li>
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
                        <p>[Screenshot of analysis board]</p>
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
                    <p>Our extensive database contains thousands of chess games from various sources.</p>
                    <div className="screenshot-placeholder">
                        <p>[Screenshot of database interface]</p>
                    </div>
                    <h4>Features:</h4>
                    <ul>
                        <li>Advanced filtering system</li>
                        <li>Historical and modern games</li>
                        <li>Comprehensive game metadata</li>
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
                        <li>Node.js backend</li>
                        <li>Stockfish integration</li>
                        <li>Custom search indexing</li>
                    </ul>
                </>
            )
        }
    ];

    // Admin-only section
    const adminSection = {
        id: 'admin',
        title: 'Management Tools',
        content: (
            <>
                <p>The Load Games tool is a powerful administrative interface for managing the chess database.</p>
                <div className="screenshot-placeholder">
                    <p>[Screenshot]</p>
                </div>
                <h4>Key Features:</h4>
                <ul>
                    <li>Bulk PGN import functionality</li>
                    <li>Game validation and preprocessing</li>
                    <li>Database maintenance tools</li>
                    <li>Import status monitoring</li>
                </ul>
                <h4>Usage Instructions:</h4>
                <ol>
                    <li>Prepare PGN files with valid game data</li>
                    <li>Use the upload interface to select files</li>
                    <li>Monitor import progress in real-time</li>
                    <li>Verify successful import through the games database</li>
                </ol>
                <p className="note">Note: This tool is only available to administrators and requires authentication.</p>
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

            {/* Admin section - only visible to admins */}
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