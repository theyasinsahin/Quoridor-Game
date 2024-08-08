import React from 'react';
import Player from '../Player/Player';

const Square = (props) => {
  
  const { highlightedSquares, colIndex, rowIndex, player, onPlayerClick, movePlayer, id, isHighlighted, initialPlayer } = props;

  const handleClick = () => {
    if (player) {
      onPlayerClick(rowIndex, colIndex);
    } else if (highlightedSquares.length > 0) {
      for (let i = 0; i < highlightedSquares.length; i++) {
        if (highlightedSquares[i].col === colIndex && highlightedSquares[i].row === rowIndex) {
          movePlayer(rowIndex, colIndex);
        }
      }
    }
  };

  const squareClass = `Square ${isHighlighted ? 'highlighted' : ''}`;
  return (
    <td className={squareClass} id={id} onClick={handleClick}>
      <Player initialPlayer={initialPlayer } player={player}/>
    </td>
  );
}

export default Square;
