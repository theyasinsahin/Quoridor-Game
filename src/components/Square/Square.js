import React from 'react';

function Square(props) {
  const handleClick = () => {
    const { highlightedSquares, colIndex, rowIndex, player, onPlayerClick, movePlayer } = props;

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

  const { player, id, isHighlighted } = props;
  const squareClass = `Square ${isHighlighted ? 'highlighted' : ''}`;

  return (
    <td className={squareClass} id={id} onClick={handleClick}>
      {player ? <div className={player} id={player}></div> : null}
    </td>
  );
}

export default Square;
