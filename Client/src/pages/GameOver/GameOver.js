import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './GameOver.css';

const GameOver = (props) => {
  const location = useLocation();
  const { winner } = location.state || { winner: 'Unknown' };

  return (
    <div className='game-end-container'>
      <h5>Game Over</h5>
      <p className='winner'>{winner} wins!</p>
      <Link to="/">Play Again</Link>
    </div>
  );
};

export default GameOver;
