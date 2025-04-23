
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.scss';

const LoginModal = ({ isOpen, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const usernameInputRef = useRef(null);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        let timer;
        if (isOpen) {
            setShowContent(true);
            timer = setTimeout(() => {
                if (usernameInputRef.current) {
                    usernameInputRef.current.focus();
                }
            }, 50);

        } else {
            setShowContent(false);
            timer = setTimeout(() => {
                setUsername('');
                setPassword('');
                setError('');
                setIsLoading(false);
            }, 300);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);


    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(username, password);
            onClose();
        } catch (err) {
            let displayError = 'Login failed. Invalid credentials.';
            if (err && typeof err.message === 'string' && err.message.length < 100) {
                displayError = err.message;
            }
            setError(displayError);
            console.error("Login error in modal:", err);
        } finally {
            setIsLoading(false);
        }
    };


    return (<div
            className={`modal-overlay ${showContent ? 'modal-open' : ''}`}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Enter credentials:</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            ref={usernameInputRef}
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={isLoading} className="cancel-button">Cancel</button>
                        <button type="submit" disabled={isLoading} className="login-button">{isLoading ? 'Logging in...' : 'Log in'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
