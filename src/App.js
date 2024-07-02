import React from 'react';
import './App.css';

class Wall extends React.Component {
  render() {
    const className = `Wall ${this.props.orientation}`;
    return <td className={className} id={this.props.id}></td>;
  }
}

class Square extends React.Component {

  handleClick = () => {
    const { highlightedSquares, colIndex, rowIndex, player, onPlayerClick, movePlayer} = this.props;

    if (player) {
      onPlayerClick(rowIndex, colIndex);
    }else if(highlightedSquares.length > 0){
      for (let i = 0; i < highlightedSquares.length; i++) {
        if(highlightedSquares[i].col === colIndex && highlightedSquares[i].row === rowIndex){
          movePlayer(rowIndex, colIndex);
        }
      }
    }
  };

  render() {
    const { isTopMiddle, isBottomMiddle, player, id, isHighlighted } = this.props;
    const squareClass = `Square ${isHighlighted ? 'highlighted' : ''}`;
    
    return (
      <td className={squareClass} id={id} onClick={this.handleClick}>
        {player ? <div className={player} id={player}></div> : null}
      </td>
    );
  }
}

class Space extends React.Component {
  render() {
    return(
      <td className='Space' id={this.props.id}></td>
    );
  }
}

class Row extends React.Component {
  render(){
    const { boardSize, rowIndex, onPlayerClick, highlightedSquares, movePlayer, playerPositions } = this.props;
    const row = [];

    for (let i = 0; i < boardSize; i++) {
      const playerClass = playerPositions.find(
        (player) => player.row === rowIndex && player.col === i
      )?.className || '';
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
        row.push(<Wall key={`vwall-${rowIndex}-${i}`} id={`vwall-${rowIndex}-${i}`} orientation="vertical" />);
      }
    }
    
      return (
        <tr key={`row-${rowIndex}`} id={`row-${rowIndex}`}>
          {row}
        </tr>
      );
  }
}

class HorizontalWallRow extends React.Component {
  render() {
    const boardSize = 9;
    const row = [] // A row has 9 walls with spaces between them
    for (let i = 0; i < boardSize; i++) {
      row.push(<Wall key={`hwall-${this.props.rowIndex}-${i}`} id={`hwall-${this.props.rowIndex}-${i}`} orientation="horizontal"/>);
      
      if(i !== boardSize-1){
        row.push(<Space key={`space-${this.props.rowIndex}-${i}`} id={`space-${this.props.rowIndex}-${i}`} />);
      }
    }

    return (
      <tr key={`hrow-${this.props.rowIndex}`} id={`hrow-${this.props.rowIndex}`}>{row}</tr>
    );
  }
}

class Board extends React.Component {
  
  state = {
    highlightedSquares: [],
    playerPositions: [
      { row: 0, col: Math.floor(9 / 2), className: 'player2' },
      { row: 8, col: Math.floor(9 / 2), className: 'player1' },
    ],
    currentPlayer:'player1'
  };

  handlePlayerClick = (rowIndex, colIndex) => {
    const { playerPositions, currentPlayer } = this.state;
    const currentPlayerPosition = playerPositions.find((player) => player.className === currentPlayer);

    if (currentPlayerPosition.row === rowIndex && currentPlayerPosition.col === colIndex) {
      const newHighlightedSquares = [];
      const boardSize = 9;

      if (rowIndex > 0) newHighlightedSquares.push({ row: rowIndex - 1, col: colIndex });
      if (rowIndex < boardSize - 1) newHighlightedSquares.push({ row: rowIndex + 1, col: colIndex });
      if (colIndex > 0) newHighlightedSquares.push({ row: rowIndex, col: colIndex - 1 });
      if (colIndex < boardSize - 1) newHighlightedSquares.push({ row: rowIndex, col: colIndex + 1 });

      this.setState({ highlightedSquares: newHighlightedSquares });
    }
  };

  movePlayer = (rowIndex, colIndex) => {
    const { playerPositions, currentPlayer } = this.state;
    const newPlayerPositions = playerPositions.map((player) =>
      player.className === currentPlayer ? { ...player, row: rowIndex, col: colIndex } : player
    );

    const nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    this.setState({ playerPositions: newPlayerPositions, highlightedSquares: [], currentPlayer: nextPlayer });

    if(currentPlayer === 'player1' && rowIndex===0){alert("Player 1 kazandı");}
    if(currentPlayer === 'player2' && rowIndex===8){alert("Player 2 kazandı");}
  };  

  render() {
    const boardSize = 9;
    const rows = [];
    const { highlightedSquares, playerPositions } = this.state;

    for (let i = 0; i < boardSize; i++) {
      rows.push(
        <Row
          key={`row-${i}`}
          id={`row-${i}`}
          boardSize={boardSize}
          rowIndex={i}
          highlightedSquares={highlightedSquares}
          onPlayerClick={this.handlePlayerClick}
          movePlayer={this.movePlayer}
          playerPositions={playerPositions}
        />
      );      
      if (i !== boardSize-1) {
        rows.push(<HorizontalWallRow key={`hrow-${i}`} id={`hrow-${i}`} rowIndex={i}/>);
      }
    }
    return (
      <table className='Board'>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

function App() {
  return(
    <div className='App'>
      <Board />      
    </div>
  );
}

export default App;
