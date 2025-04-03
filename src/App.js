import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import NoPage from "./pages/NoPage";
import About from "./pages/About";
import Home from "./pages/Home";
import Games from "./pages/Games";
import Analyze from "./pages/Analyze";
import Search from "./pages/Search";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="search" element={<Search />} />
                  <Route path="games" element={<Games />} />
                  <Route path="analyze" element={<Analyze />} />
                  <Route path="*" element={<NoPage />} />
              </Route>
          </Routes>
      </BrowserRouter>

  );
}

export default App;
