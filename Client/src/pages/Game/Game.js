import React, {useEffect, useRef} from 'react';
import Board from '../../components/GameComponents/Board/Board';
import WallsLeft from '../../components/GameComponents/WallsLeft/WallsLeft';
import GameLogic from '../../hooks/gameLogic';
import './Game.css';
import { useLocation } from 'react-router-dom';
import Notation from '../../components/GameComponents/Notation/Notation';
import CopyButton from '../../components/CopyButton/CopyButton';
import { socket } from '../../Socket';

const Game = (props) => {
    const location = useLocation();
    const {playerId, playerRole} = location.state;
    const boardSize = 9;
    const {state, handlePlayerClick, movePlayer, handleWallHover, handleWallClick, getHistoryStateAt, undo, toMainMenu } = GameLogic(boardSize);


    

    useEffect(() => {
        if (location.state.mode === 'Online') {
            const handleReceiveMove = (actionData) => {
                const { action } = actionData;
                if (action.type === 'move') {
                  movePlayer(action.row, action.col);
                } else {
                  handleWallClick(action.id, action.orientation, false);
                }
              };
      
          socket.on('receive-move', handleReceiveMove);
      
          return () => {
            socket.off('receive-move', handleReceiveMove);
          };
        }
      }, [movePlayer, handleWallClick]);
    

    const {players, initialPlayer, notations} = state;
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
                    <div>
                        <button onClick={undo} className='undo-button'>Undo</button>
                        <button onClick={toMainMenu} className='undo-button'>Back To Main Menu</button>
                        <CopyButton  notations={notations}/>
                        <Board 
                            state={state}
                            handlePlayerClick={handlePlayerClick}
                            movePlayer={movePlayer} 
                            handleWallHover={handleWallHover}
                            handleWallClick={handleWallClick}
                            boardSize={boardSize} 
                            playerId = {playerId}
                            playerRole = {playerRole}
                        />
                    </div>
                    
                    <div className="notation-section">
                        <div className="notation-header">
                            

                        </div>
                        
                        <Notation notations={notations} getHistoryStateAt={getHistoryStateAt}/>
                    </div>
                </div>
            </div>

        )
    }

    return render();
}

export default Game;