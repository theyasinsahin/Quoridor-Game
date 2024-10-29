import React from 'react';
import Player from '../Player/Player';
import './Square.css';
import { socket } from '../../../Socket';

const Square = (props) => {
  const { highlightedSquares, colIndex, rowIndex, player, onPlayerClick, movePlayer, id, isHighlighted, initialPlayer, boardSize, playerId, playerRole } = props;

  const handleClick = () => {
    if (player) {
      //onPlayerClick(rowIndex, colIndex);
    } else if (highlightedSquares.length > 0) {
      for (let i = 0; i < highlightedSquares.length; i++) {
        if (highlightedSquares[i].col === colIndex && highlightedSquares[i].row === rowIndex) {
          
          movePlayer(rowIndex, colIndex);
          
          const action = {type: "move", row:rowIndex, col: colIndex};
          // Emit the move to the server
          socket.emit('player-move', playerId, {action, playerRole});
        }
      }
    }
  };

  const squareClass = `Square ${isHighlighted ? 'highlighted' : ''}`;

  // Sütun ve satır etiketleri için koşullu render
  const columnLabel = rowIndex === boardSize - 1 ? String.fromCharCode(97 + colIndex) : null; // 'a', 'b', 'c', ...
  const rowLabel = colIndex === boardSize - 1 ? 9 - rowIndex : null; // '1', '2', '3', ...

  return (
    <td className={squareClass} id={id} onClick={handleClick}>
      {/* Eğer son satırdaysak sütun harfini göster */}
      {columnLabel && <div className="column-label">{columnLabel}</div>}

      {/* Eğer son sütundaysak satır numarasını göster */}
      {rowLabel && <div className="row-label">{rowLabel}</div>}
      
      {/* Oyuncuyu render et */}
      <Player initialPlayer={initialPlayer} player={player} />
    </td>
  );
}

export default Square;
