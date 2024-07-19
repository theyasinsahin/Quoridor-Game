import React from 'react';

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
  const playerClass = `${player ? player:null} ${(player && initialPlayer === player) ? "turn" : null}`;
  return (
    <td className={squareClass} id={id} onClick={handleClick}>
      {player ? <div className={playerClass} id={player}></div> : null}
    </td>
  );
}

export default Square;