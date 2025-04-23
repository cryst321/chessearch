
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.scss';

const LoginModal = ({ isOpen, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {login} = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
            onClose();
            setUsername('');
            setPassword('');
        } catch (err) {setError(err.message || 'Login failed. Invalid credentials.');
            let displayError = 'Login failed: invalid credentials.';
            if (err && typeof err.message === 'string' && err.message.length < 100) {
                displayError = err.message;
            }
            setError(displayError);
            console.error("Login error in modal:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Log in</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
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
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {/* displayed if login failed */}
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={isLoading} className="cancel-button">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="login-button">
                            {isLoading ? 'Logging in...' : 'Log in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
