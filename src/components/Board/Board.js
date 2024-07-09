import React from 'react';
import Row from '../Row/Row';
import HorizontalWallRow from '../HorizontalWallRow/HorizontalWallRow';
import GameLogic from '../../hooks/gameLogic';

function Board() {
    
    const boardSize = 9;
    const {state, handlePlayerClick, movePlayer, handleWallHover } = GameLogic(boardSize);

    const rows = [];

    const render = () => {
        
        const {highlightedSquares, players, hoveredWalls} = state;
    
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
                hoveredWalls={hoveredWalls}
            />
            );
    
            if (i !== boardSize - 1) {
            rows.push(
                <HorizontalWallRow
                key={`hrow-${i}`}
                id={`hrow-${i}`}
                rowIndex={i}
                onWallHover={handleWallHover}
                hoveredWalls={hoveredWalls}
                />
            );
            }
        }
    
      return (
        <table className='Board'>
          <tbody>{rows}</tbody>
        </table>
      );
    }

    return render();
    
}

export default Board;
