import React from 'react';
import Board from '../../components/Board/Board';
import WallsLeft from '../../components/WallsLeft/WallsLeft';
import GameLogic from '../../hooks/gameLogic';
import './Game.css';
import { useLocation } from 'react-router-dom';

const Game = (props) => {
    const location = useLocation();
    const { player1Name, player2Name, mode } = location.state || {};

    const boardSize = 9;
    const {state, handlePlayerClick, movePlayer, handleWallHover, handleWallClick } = GameLogic(boardSize);

    const {players} = state;
    const render = () => {
        return (
            <div className='game-container'>
                <h1 className='game-title'>Quoridor Game</h1>
                <div className='game-content'>
                    <div className='player-section'>
                        <div className='up'>
                            <p className='name'>Player 2: {mode === 'AI' ? 'AI' : player2Name}</p>
                            <WallsLeft wallsLeft={players.find(player => player.name === 'player2').wallsLeft} player="player2s" />
                        </div>
                        <div className='down'>
                            <p className='name'>Player 1: {player1Name}</p>
                            <WallsLeft wallsLeft={players.find(player => player.name === 'player1').wallsLeft} player="player1s" />
                        </div>
                    </div>
                    <Board 
                        state={state}
                        handlePlayerClick={handlePlayerClick}
                        movePlayer={movePlayer} 
                        handleWallHover={handleWallHover}
                        handleWallClick={handleWallClick}
                        boardSize={boardSize} 
                    />
                </div>
            </div>

        )
    }

    return render();
}

export default Game;