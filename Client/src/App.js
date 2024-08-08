import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Game from './pages/Game/Game';
import GameOver from './pages/GameOver/GameOver';
import StartPage from './pages/Start/StartPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<StartPage />} />
          <Route exact path="/game" element={<Game />} />
          <Route path="/game-over" element={<GameOver />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
