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
            <Route exact path="/" element={<StartPage /*user={user} logout={logout}*//>} />
            <Route exact path="/game" element={<Game /*logout={logout}*/ />} />
            <Route path="/game-over" element={<GameOver /*logout={logout}*//>} />
          </Routes>        
      </div>
    </Router>
  );
}

export default App;
