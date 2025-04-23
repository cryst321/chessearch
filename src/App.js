import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import NoPage from "./pages/NoPage";
import About from "./pages/About";
import Home from "./pages/Home";
import Games from "./pages/Games/Games";
import Analyze from "./pages/Analyze";
import Search from "./pages/Search/Search";
import GamePage from "./pages/GamePage/GamePage";
import { AuthProvider } from './context/AuthContext';
import LoadGamesPage from "./pages/LoadGame";
import AdminProtectedRoute from "./components/Auth/AdminProtectedRoute";

function App() {
  return (
      <AuthProvider>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="search" element={<Search />} />
                  <Route path="games" element={<Games />} />
                  <Route path="game/:gameId" element={<GamePage />} />
                  <Route path="analyze" element={<Analyze />} />
                  <Route
                      path="load-games"
                      element={
                          <AdminProtectedRoute>
                              <LoadGamesPage />
                          </AdminProtectedRoute>
                      }/>
                  <Route path="*" element={<NoPage />} />
              </Route>
          </Routes>
      </BrowserRouter>
      </AuthProvider>

  );
}

export default App;
