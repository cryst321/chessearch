import React, { useState, useRef, useEffect } from 'react';
import { uploadPgnFile, uploadPgnString, rebuildSearchIndex, clearSearchIndex, clearAllData, getIndexStats, API_ADMIN_BASE } from '../../services/adminService';
import './LoadGamesPage.scss';

const LoadGamesPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [pgnText, setPgnText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingOperation, setLoadingOperation] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [rebuildProgress, setRebuildProgress] = useState(null);
    const [indexStats, setIndexStats] = useState(null);
    const eventSourceRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        loadIndexStats();
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    const loadIndexStats = async () => {
        try {
            const stats = await getIndexStats();
            setIndexStats(stats);
        } catch (error) {
            console.error('Failed to load index stats:', error);
        }
    };

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setMessage('');
            setMessageType('');
        } else {
            setSelectedFile(null);
        }
    };

    const handleTextChange = (event) => {
        setPgnText(event.target.value);
        setMessage('');
        setMessageType('');
    };

    const displayFeedback = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 7000);
    };

    const handleUploadFile = async () => {
        if (!selectedFile) {
            displayFeedback('Please select PGN file first.', 'error');
            return;
        }
        setIsLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const responseMessage = await uploadPgnFile(selectedFile);
            displayFeedback(responseMessage, 'success');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            displayFeedback(error.message || 'File upload failed.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadText = async () => {
        if (!pgnText.trim()) {
            displayFeedback('Please enter PGN text.', 'error');
            return;
        }
        setIsLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const responseMessage = await uploadPgnString(pgnText);
            displayFeedback(responseMessage, 'success');
            setPgnText('');
        } catch (error) {
            displayFeedback(error.message || 'PGN text submission failed.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const setupEventSource = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const eventSource = new EventSource(`${API_ADMIN_BASE}/rebuild-progress`, {
            withCredentials: true
        });
        eventSourceRef.current = eventSource;

        eventSource.addEventListener('progress', (event) => {
            setRebuildProgress(event.data);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        });

        eventSource.addEventListener('error', () => {
            eventSource.close();
            eventSourceRef.current = null;
            
            reconnectTimeoutRef.current = setTimeout(() => {
                if (isLoading) {
                    setupEventSource();
                }
            }, 2000);
        });

        return eventSource;
    };

    const handleRebuildIndex = async () => {
        setLoadingOperation('rebuild');
        setMessage('');
        setMessageType('');
        setRebuildProgress(null);

        try {
            const responseMessage = await rebuildSearchIndex();
            displayFeedback(responseMessage, 'success');
            setupEventSource();
        } catch (error) {
            displayFeedback(error.message || 'Index rebuild failed.', 'error');
            setLoadingOperation(null);
        }
    };

    const handleClearIndex = async () => {
        if (window.confirm("Are you sure you want to clear the entire search index? This action can't be undone.")) {
            setLoadingOperation('clearIndex');
            setMessage('');
            setMessageType('');
            try {
                const responseMessage = await clearSearchIndex();
                displayFeedback(responseMessage, 'success');
                loadIndexStats(); 
            } catch (error) {
                displayFeedback(error.message || 'Clearing index failed.', 'error');
            } finally {
                setLoadingOperation(null);
            }
        }
    };

    const handleClearAllData = async () => {
        if (window.confirm("Are you sure you want to clear all games from the database and the search index? This action cannot be undone.")) {
            setLoadingOperation('clearAll');
            setMessage('');
            setMessageType('');
            try {
                const responseMessage = await clearAllData();
                displayFeedback(responseMessage, 'success');
                loadIndexStats(); 
            } catch (error) {
                displayFeedback(error.message || 'Clearing all data failed.', 'error');
            } finally {
                setLoadingOperation(null);
            }
        }
    };

    return (
        <div className="load-games-container">
            <h2>Management Tools</h2>

            {indexStats && (
                <div className="index-stats">
                    <p>Total games in database: {indexStats.totalGames}</p>
                    <p>Indexed positions: {indexStats.totalDocuments}</p>
                </div>
            )}

            {message && (
                <div className={`feedback-message ${messageType === 'error' ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="upload-section">
                <h3>Upload PGN file</h3>
                <div className="file-upload-group">
                    <div className="form-group">
                        <label htmlFor="pgn-file-input">Select PGN file:</label>
                        <input
                            type="file"
                            id="pgn-file-input"
                            accept=".pgn"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            disabled={isLoading}
                        />
                    </div>
                    <button onClick={handleUploadFile} disabled={isLoading || !selectedFile} className="admin-action-button">
                        {isLoading && selectedFile ? 'Uploading file...' : 'Upload file'}
                    </button>
                </div>
            </div>

            <div className="upload-section">
                <h3>Paste PGN text</h3>
                <div className="form-group">
                    <label htmlFor="pgn-text-input">PGN data:</label>
                    <textarea
                        id="pgn-text-input"
                        value={pgnText}
                        onChange={handleTextChange}
                        placeholder="Paste one or more PGN games here..."
                        rows={10}
                        disabled={isLoading}
                    />
                </div>
                <button onClick={handleUploadText} disabled={isLoading || !pgnText.trim()} className="admin-action-button">
                    {isLoading && pgnText.trim() ? 'Submitting text...' : 'Submit PGN text'}
                </button>
            </div>

            <div className="index-management-section">
                <h3>Index management</h3>
                <button 
                    onClick={handleRebuildIndex} 
                    disabled={!!loadingOperation} 
                    className="admin-action-button rebuild-button"
                >
                    {loadingOperation === 'rebuild' ? 'Rebuilding...' : 'Rebuild index'}
                </button>
                <button 
                    onClick={handleClearIndex} 
                    disabled={!!loadingOperation} 
                    className="admin-action-button clear-button"
                >
                    {loadingOperation === 'clearIndex' ? 'Clearing...' : 'Clear index'}
                </button>
                <button 
                    onClick={handleClearAllData} 
                    disabled={!!loadingOperation} 
                    className="admin-action-button clear-button"
                >
                    {loadingOperation === 'clearAll' ? 'Clearing data...' : 'Clear all data'}
                </button>
                {rebuildProgress && (
                    <div className="rebuild-progress">
                        <p>{rebuildProgress}</p>
                    </div>
                )}
                <p className="warning-text">
                    Warning: rebuilding or clearing the index can take time and affect search availability.
                </p>
            </div>
        </div>
    );
};

export default LoadGamesPage;
