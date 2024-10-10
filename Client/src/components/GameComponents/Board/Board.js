import React from 'react';
import Row from '../Row/Row';
import HorizontalWallRow from '../HorizontalWallRow/HorizontalWallRow';
import './Board.css';

const Board = (props) => {
    
    const {state, handlePlayerClick, movePlayer, handleWallHover, handleWallClick, boardSize } = props;

    const rows = [];

        
        const {highlightedSquares, players, hoveredWalls, clickedWalls, initialPlayer, clickedSpaces, hoveredSpaces, playAs, nickNames, isThereComp } = state;
    
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
                playAs = {playAs}
                nickNames = {nickNames}
                isThereComp = {isThereComp}
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
                hoveredSpaces={hoveredSpaces}
                clickedWalls={clickedWalls}
                clickedSpaces={clickedSpaces}
                initialPlayer = {initialPlayer}
                playAs = {playAs} 
                nickNames = {nickNames}
                isThereComp = {isThereComp}
                />
            );
            }
        }
    
      return (
        <div>
            <table className='Board'>
                <tbody>            
                  {rows}
                </tbody>
            </table>

        </div>
      );
    

    
}

export default Board;
