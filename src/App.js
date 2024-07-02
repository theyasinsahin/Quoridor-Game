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
    const { highlightedSquares, colIndex, rowIndex, player, onPlayerClick} = this.props;

    if (player) {
      onPlayerClick(rowIndex, colIndex);
    }else if(highlightedSquares.length > 0){
      for (let i = 0; i < highlightedSquares.length; i++) {
        if(highlightedSquares[i].col === colIndex && highlightedSquares[i].row === rowIndex){
          // HighlightedSquares'e tıklayınca olacak şey
        }
      }
    }
  };

  render() {
    const { isTopMiddle, isBottomMiddle, player, id, isHighlighted } = this.props;
    const squareClass = `Square ${isHighlighted ? 'highlighted' : ''}`;
    
    return (
      <td className={squareClass} id={id} onClick={this.handleClick}>
        {isTopMiddle || isBottomMiddle ? <div className={player} id={player}></div> : null}
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
    var { boardSize, rowIndex, onPlayerClick, highlightedSquares } = this.props;
    const row = [];
    const middleIndex = Math.floor(boardSize / 2);

    for (let i = 0; i < boardSize; i++) {
      const isTopMiddle = rowIndex === 0 && i === middleIndex;
      const isBottomMiddle = rowIndex === boardSize-1 && i === middleIndex;
      const isHighlighted = highlightedSquares.some(
        (square) => square.row === rowIndex && square.col === i
      );

      let playerClass = '';
      if(isTopMiddle){
        playerClass = "player1";
      }else if(isBottomMiddle){
        playerClass = "player2";
      }
      row.push(
        <Square
          key={`square-${rowIndex}-${i}`}
          id={`square-${rowIndex}-${i}`}
          rowIndex={rowIndex}
          colIndex={i}
          isTopMiddle={isTopMiddle}
          isBottomMiddle={isBottomMiddle}
          player={playerClass}
          isHighlighted={isHighlighted}
          onPlayerClick={onPlayerClick}
          highlightedSquares={highlightedSquares}
        />
      );  

      if(i!==boardSize-1){
        row.push(<Wall key={`vwall-${rowIndex}-${i}`} id={`vwall-${rowIndex}-${i}`} orientation="vertical"/>);
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
    highlightedSquares: []
  };

  handlePlayerClick = (rowIndex, colIndex) => {
    const newHighlightedSquares = [];
    const boardSize = 9;
    
    if (rowIndex > 0) newHighlightedSquares.push({ row: rowIndex - 1, col: colIndex }); // up
    if (rowIndex < boardSize - 1) newHighlightedSquares.push({ row: rowIndex + 1, col: colIndex }); // down
    if (colIndex > 0) newHighlightedSquares.push({ row: rowIndex, col: colIndex - 1 }); // left
    if (colIndex < boardSize - 1) newHighlightedSquares.push({ row: rowIndex, col: colIndex + 1 }); // right

    this.setState({ highlightedSquares: newHighlightedSquares });
  };

  render() {
    const boardSize = 9;
    const rows = [];
    const { highlightedSquares } = this.state;

    for (let i = 0; i < boardSize; i++) {
      rows.push(
        <Row
          key={`row-${i}`}
          id={`row-${i}`}
          boardSize={boardSize}
          rowIndex={i}
          highlightedSquares={highlightedSquares}
          onPlayerClick={this.handlePlayerClick}
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
