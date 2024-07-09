import { useState } from "react";

const GameLogic = (boardSize) => {
    const [state, setState] = useState({
        highlightedSquares: [],
        players: [
        { position: { row: 0, col: Math.floor(boardSize / 2) }, name: 'player2' },
        { position: { row: 8, col: Math.floor(boardSize / 2) }, name: 'player1' },
        ],
        initialPlayer: 'player1',
        hoveredWalls: [],
    });

    const handlePlayerClick = (rowIndex, colIndex) => {
        const { players, initialPlayer } = state;

        const currentPlayer = players.find((player) => player.name === initialPlayer);

        if (currentPlayer.position.row === rowIndex && currentPlayer.position.col === colIndex) {
          const newHighlightedSquares = [];
          const boardSize = 9;
    
          if (rowIndex > 0) newHighlightedSquares.push({ row: rowIndex - 1, col: colIndex });
          if (rowIndex < boardSize - 1) newHighlightedSquares.push({ row: rowIndex + 1, col: colIndex });
          if (colIndex > 0) newHighlightedSquares.push({ row: rowIndex, col: colIndex - 1 });
          if (colIndex < boardSize - 1) newHighlightedSquares.push({ row: rowIndex, col: colIndex + 1 });
    
          setState((prevState) => ({
            ...prevState,
            highlightedSquares: newHighlightedSquares,
          }));        
        }
    };

    const movePlayer = (rowIndex, colIndex) => {
        const { players, initialPlayer } = state;

        const newPlayers = players.map((player) =>
            player.name === initialPlayer ? { ...player, position: { row: rowIndex, col: colIndex } } : player
        );
                        
        const nextPlayer = initialPlayer === 'player1' ? 'player2' : 'player1';

        setState((prevState) => ({
            ...prevState,
            players: newPlayers,
            initialPlayer: nextPlayer,
            highlightedSquares: [],
        }))
    
        if (initialPlayer === 'player1' && rowIndex === 0) { alert("Player 1 kazandı"); }
        if (initialPlayer === 'player2' && rowIndex === 8) { alert("Player 2 kazandı"); }
    };

    const handleWallHover = (id, orientation, isHovering) => {
        const { hoveredWalls } = state;
    
        let newHoveredWalls = [...hoveredWalls];
    
        const index = hoveredWalls.indexOf(id);
    
        if (isHovering) {
            if (index === -1) newHoveredWalls.push(id);
            if (orientation === 'vertical') {
                const parts = id.split('-');
                const row = parseInt(parts[1], 10);
                const col = parseInt(parts[2], 10);
                const belowWall = `vwall-${row + 1}-${col}`;
                if (newHoveredWalls.indexOf(belowWall) === -1) newHoveredWalls.push(belowWall);
            } else {
                const parts = id.split('-');
                const row = parseInt(parts[1], 10);
                const col = parseInt(parts[2], 10);
                const nextWall = `hwall-${row}-${col + 1}`;
                if (newHoveredWalls.indexOf(nextWall) === -1) newHoveredWalls.push(nextWall);
            }
        } else{
            for (let i = 0; i < newHoveredWalls.length+1; i++) {
                newHoveredWalls.pop();
            }
        } 
        
    
        setState((prevState) => ({
            ...prevState,
            hoveredWalls: newHoveredWalls,
        }));
    };

    return ({
        state,
        handlePlayerClick,
        movePlayer,
        handleWallHover
    });
}

export default GameLogic;