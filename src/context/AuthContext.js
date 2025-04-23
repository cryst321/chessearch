import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { loginUser, logoutUser, checkStatus } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    /**
     * user data
     */
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkStatus()
            .then(user => {
                if (user) {
                    console.log("User found from session:", user);
                    setCurrentUser(user);
                } else {
                    console.log("No active session found");
                    setCurrentUser(null);
                }
            })
            .catch(error => {
                console.error("Error checking authentication:", error);
                setCurrentUser(null);
            })
            .finally(() => {setIsLoading(false);});
    }, []);

    const login = useCallback(async (username, password) => {
        try {
            const user = await loginUser(username, password);
            setCurrentUser(user);
            console.log("Login successful:", user);
            return user;
        } catch (error) {
            console.error("Login failed :", error);
            setCurrentUser(null);
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setCurrentUser(null);
            console.log("User state cleared.");
        }
    }, []);

    const isLoggedIn = !!currentUser;
    const isAdmin = currentUser?.role === 'ROLE_ADMIN';

    const contextValue = useMemo(() => ({
        currentUser,
        isLoggedIn,
        isAdmin,
        login,
        logout,
        isLoading
    }), [currentUser, isLoggedIn, isAdmin, login, logout, isLoading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};