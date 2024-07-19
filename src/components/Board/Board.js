import React from 'react';
import Row from '../Row/Row';
import HorizontalWallRow from '../HorizontalWallRow/HorizontalWallRow';
import WallsLeft from '../WallsLeft/WallsLeft';
import GameLogic from '../../hooks/gameLogic';

const Board = () => {
    
    const boardSize = 9;
    const {state, handlePlayerClick, movePlayer, handleWallHover, handleWallClick } = GameLogic(boardSize);

    const rows = [];

    const render = () => {
        
        const {highlightedSquares, players, hoveredWalls, clickedWalls, initialPlayer} = state;
    
        for (let i = 0; i < boardSize; i++) {
            rows.push(
            <Row
                key={`row-${i}`}
                id={`row-${i}`}
                boardSize={boardSize}
                rowIndex={i}
                highlightedSquares={highlightedSquares}
                onPlayerClick={handlePlayerClick}
                movePlayer={movePlayer}
                players={players}
                onWallHover={handleWallHover}
                onWallClick={handleWallClick}
                hoveredWalls={hoveredWalls}
                clickedWalls={clickedWalls}
                initialPlayer={initialPlayer}
            />
            );
    
            if (i !== boardSize - 1) {
            rows.push(
                <HorizontalWallRow
                key={`hrow-${i}`}
                id={`hrow-${i}`}
                rowIndex={i}
                onWallHover={handleWallHover}
                onWallClick={handleWallClick}
                hoveredWalls={hoveredWalls}
                clickedWalls={clickedWalls}
                />
            );
            }
        }
    
      return (
        <div>
            <WallsLeft wallsLeft={players.find(player => player.name === 'player2').wallsLeft} player="player2s" />
            <table className='Board'>
                <tbody>            
                  {rows}
                </tbody>
            </table>
            <WallsLeft wallsLeft={players.find(player => player.name === 'player1').wallsLeft} player="player1s" />

        </div>
      );
    }

    return render();
    
}

export default Board;
