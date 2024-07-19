import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Board from './components/Board/Board';
import GameOver from './components/GameOver/GameOver';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Board />} />
          <Route path="/game-over" element={<GameOver />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
