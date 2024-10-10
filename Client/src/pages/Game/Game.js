import React from 'react';
import Board from '../../components/GameComponents/Board/Board';
import WallsLeft from '../../components/GameComponents/WallsLeft/WallsLeft';
import GameLogic from '../../hooks/gameLogic';
import './Game.css';
import { useLocation } from 'react-router-dom';

const Game = (props) => {
    const location = useLocation();

    const boardSize = 9;
    const {state, handlePlayerClick, movePlayer, handleWallHover, handleWallClick } = GameLogic(boardSize);

    const {players, notations, initialPlayer} = state;
    const render = () => {
        return (
            <div className='game-container'>
                <h1 className='game-title'>Quoridor Game</h1>
                <div className='game-content'>
                    <div className='player-section'>
                        <div className='up'>
                            <p className='name'>Player 2: {state.nickNames[1]}</p>
                            <WallsLeft wallsLeft={players.find(player => player.name === 'player2').wallsLeft} player="player2s" />
                        </div>
                        <div className='down'>
                            <p className='name'>Player 1: {state.nickNames[0]}</p>
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
                    <div className="notation-section">
                        <div className="notation-header">
                            


                        </div>
                        <div className="notation-content">
                            {notations.map((move, index) => {
                                // Her iki elemanı bir grup olarak ele alıyoruz (örneğin: ["e2", "e8"])
                                if (index % 2 === 0) {
                                    return (
                                        <div className="notation-move" key={index / 2}>
                                            <span>{index / 2 + 1}.</span>
                                            <span className="move">{notations[index]}</span>
                                            <span className="move">{notations[index + 1]}</span>
                                        </div>
                                    );
                                } else {
                                    return null; // Tek eleman için bir şey döndürme (çiftli grup halinde işleniyor)
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>

        )
    }

    return render();
}

export default Game;