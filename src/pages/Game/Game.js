import React from 'react';
import Board from '../../components/Board/Board';
import WallsLeft from '../../components/WallsLeft/WallsLeft';
import GameLogic from '../../hooks/gameLogic';

const Game = () => {
    
    const boardSize = 9;
    const {state, handlePlayerClick, movePlayer, handleWallHover, handleWallClick } = GameLogic(boardSize);

    const {players} = state;
    const render = () => {
        return (
            <div>
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