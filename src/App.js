import React from 'react';
import './App.css';

class Wall extends React.Component {
  render() {
    const className = `Wall ${this.props.orientation}`;
    return <td className={className} id={this.props.id}></td>;
  }
}

class Square extends React.Component {

  render() {
    const { isTopMiddle, isBottomMiddle, player, id } = this.props;
    return (
      <td className='Square' id={id}>
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
    var { boardSize, rowIndex } = this.props;
    const row = []; // A row has 9 squares
    const middleIndex = Math.floor(boardSize / 2);

    for (let i = 0; i < boardSize; i++) {
      const isTopMiddle = rowIndex === 0 && i === middleIndex;
      const isBottomMiddle = rowIndex === boardSize - 1 && i === middleIndex;

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
          isTopMiddle={isTopMiddle}
          isBottomMiddle={isBottomMiddle}
          player={playerClass}
        />
      );  

      if(i!==boardSize-1){
        row.push(<Wall key={`vwall-${rowIndex}-${i}`} id={`vwall-${rowIndex}-${i}`} orientation="vertical"/>);
      }
    }
    
      return (
        <tr key={`row-${rowIndex}`} id={`row-${rowIndex}`}>{row}</tr>
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
  render() {
    const boardSize = 9;
    const rows = [];

    for (let i = 0; i < boardSize; i++) {
      rows.push(<Row key={`row-${i}`} id={`row-${i}`} boardSize={boardSize} rowIndex={i} />);
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
