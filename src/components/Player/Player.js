import React from 'react';
import './Player.css';

const Player = (props) => {
  
  const { player, initialPlayer } = props;


  const playerClass = `${player ? player:null} ${(player && initialPlayer === player) ? "turn" : null}`;
  return (
  <div>
    {player ? <div className={playerClass} id={player}></div> : null}
  </div>
  );
}

export default Player;
