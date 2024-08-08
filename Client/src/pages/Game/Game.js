import React from 'react';
import Board from '../../components/Board/Board';
import WallsLeft from '../../components/WallsLeft/WallsLeft';
import GameLogic from '../../hooks/gameLogic';
import { useLocation } from 'react-router-dom';

const Game = () => {
    const location = useLocation();
    const { player1Name, player2Name, mode } = location.state || {};

    const boardSize = 9;
    const {state, handlePlayerClick, movePlayer, handleWallHover, handleWallClick } = GameLogic(boardSize);

    const {players} = state;
    const render = () => {
        return (
            <div>
                <h1>Quoridor Game</h1>
                <p>Player 1: {player1Name}</p>
            <p>Player 2: {mode === 'AI' ? 'AI' : player2Name}</p>
            <WallsLeft wallsLeft={players.find(player => player.name === 'player2').wallsLeft} player="player2s" />
                <Board 
                state={state}
                handlePlayerClick={handlePlayerClick}
                movePlayer={movePlayer} 
                handleWallHover={handleWallHover}
                handleWallClick={handleWallClick}
                boardSize={boardSize} />
            <WallsLeft wallsLeft={players.find(player => player.name === 'player1').wallsLeft} player="player1s" />
        </div>
        )
    }

    return render();
}

export default Game;