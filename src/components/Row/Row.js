import React from 'react';
import Square from '../Square/Square';
import Wall from '../Wall/Wall';

const Row = (props) => {
  const { 
    boardSize, 
    rowIndex, 
    onPlayerClick, 
    highlightedSquares, 
    movePlayer, 
    players, 
    onWallHover, 
    hoveredWalls,
  } = props;
  const row = [];

  for (let i = 0; i < boardSize; i++) {
    const playerClass = players.find(
      (player) => player.position.row === rowIndex && player.position.col === i
    )?.name || '';
    const isHighlighted = highlightedSquares.some(
      (square) => square.row === rowIndex && square.col === i
    );

    row.push(
      <Square
        key={`square-${rowIndex}-${i}`}
        id={`square-${rowIndex}-${i}`}
        rowIndex={rowIndex}
        colIndex={i}
        player={playerClass}
        isHighlighted={isHighlighted}
        onPlayerClick={onPlayerClick}
        highlightedSquares={highlightedSquares}
        movePlayer={movePlayer}
      />
    );

    if (i !== boardSize - 1) {
      const vWallId = `vwall-${rowIndex}-${i}`;
      row.push(
        <Wall
          key={vWallId}
          id={vWallId}
          orientation="vertical"
          onWallHover={onWallHover}
          isHovered={hoveredWalls.includes(vWallId)}
        />
      );
    }
  }

  return (
    <tr key={`row-${rowIndex}`} id={`row-${rowIndex}`}>
      {row}
    </tr>
  );
}

export default Row;
