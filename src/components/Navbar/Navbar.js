import React, {useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import '../../styles/global.scss';
import './Navbar.scss'
import {FiLogIn, FiLogOut} from "react-icons/fi";
import LoginModal from "../Auth/LoginModal";

const Navbar = () => {
    const { isLoggedIn, isAdmin, currentUser, logout } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const handleLoginClick = () => {setIsLoginModalOpen(true);};
    const handleLogoutClick = () => {logout();};
    const closeLoginModal = () => {setIsLoginModalOpen(false);};
    return (
        <>
        <nav className="navbar">
            <div className="navbar-content">

            <ul className="navbar-links">
                <li><NavLink exact to="/" activeClassName="active">Home</NavLink></li>
                <li><NavLink to="/about" activeClassName="active">About</NavLink></li>
                <li><NavLink to="/search" activeClassName="active">Search!</NavLink></li>
                <li><NavLink to="/games" activeClassName="active">Browse Games</NavLink></li>
                <li><NavLink to="/analyze" activeClassName="active">Analyze</NavLink></li>
                {isAdmin && (
                    <li><NavLink to="/load-games" activeClassName="active">Load</NavLink></li>
                )}
            </ul>
                <div className="navbar-auth-controls">
                    {isLoggedIn ? (
                        <>
                                <span className="welcome-message">
                                    Welcome, {currentUser?.username || 'Admin'}!
                                </span>
                            <button
                                onClick={handleLogoutClick}
                                className="auth-button logout-button"
                                title="Log Out"
                                aria-label="Log Out"
                            >
                                <FiLogOut />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleLoginClick}
                            className="auth-button login-button"
                            title="Admin Login"
                            aria-label="Admin Login"
                        >
                            <FiLogIn />
                        </button>
                    )}
                </div>

            </div>
        </nav>
    <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        </>
    );
};

export default Navbar;
