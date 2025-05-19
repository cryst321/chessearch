import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import SideDecoration from '../components/SideDecoration/SideDecoration';
import { Outlet, useLocation } from "react-router-dom";
import './MainLayout.scss';

const MainLayout = () => {
    const location = useLocation();
    
    const showDecorations = ['/analyze', '/search', '/games','/about'].some(
        path => location.pathname === path
    );
    
    const isLoadPage = location.pathname === '/load-games';

    return (
        <div className="main-layout">
            <Navbar />
            <main className="content">
                {(showDecorations || isLoadPage) && (
                    <SideDecoration isAdminPage={isLoadPage} />
                )}
                <Outlet/>
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
