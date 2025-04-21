import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/global.scss';
import './Navbar.scss'

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="navbar-links">
                <li><NavLink exact to="/" activeClassName="active">Home</NavLink></li>
                <li><NavLink to="/about" activeClassName="active">About</NavLink></li>
                <li><NavLink to="/search" activeClassName="active">Search!</NavLink></li>
                <li><NavLink to="/games" activeClassName="active">Browse Games</NavLink></li>
                <li><NavLink to="/analyze" activeClassName="active">Analyze</NavLink></li>
            </ul>
        </nav>
    );
};

export default Navbar;
