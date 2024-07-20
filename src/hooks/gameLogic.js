import { useState } from "react";
import { useNavigate } from 'react-router-dom';

const GameLogic = (boardSize) => {
    const [state, setState] = useState({
        highlightedSquares: [],
        players: [
        { position: { row: 0, col: Math.floor(boardSize / 2) }, name: 'player2', wallsLeft: 10 },
        { position: { row: 8, col: Math.floor(boardSize / 2) }, name: 'player1', wallsLeft: 10 },
        ],
        initialPlayer: 'player1',
        hoveredWalls: [],
        clickedWalls: [],
    });

    ///////////////// This is for change the file /////////////
    const navigate = useNavigate();

    /////////////////  BFS ALGORITHM /////////////////////////
    const bfs = (start, goalRow, boardSize, walls) => {
        const directions = [
            { row: -1, col: 0 }, // up
            { row: 1, col: 0 }, // down
            { row: 0, col: -1 }, // left
            { row: 0, col: 1 }  // right
        ];
    
        const queue = [start];
        const visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
        visited[start.row][start.col] = true;
    
        while (queue.length > 0) {
            const { row, col } = queue.shift();
    
            if (row === goalRow) {
                return true; // found a path to the goal
            }
    
            for (const direction of directions) {
                const newRow = row + direction.row;
                const newCol = col + direction.col;
    
                if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && !visited[newRow][newCol]) {
                    if (!isWallBlockingMove(row, col, newRow, newCol)) {
                        queue.push({ row: newRow, col: newCol });
                        visited[newRow][newCol] = true;
                    }
                }
            }
        }
    
        return false; // no path found
    };

    ////////////// VALID MOVES
    const isWallBlockingMove = (row, col, newRow, newCol) => {
        const {clickedWalls} = state;
        
        // Check vertical walls
        if (newRow > row) {
            return clickedWalls.includes(`hwall-${row}-${col}`);
        } else if (newRow < row) {
            return clickedWalls.includes(`hwall-${newRow}-${col}`);
        }
        // Check horizontal walls
        if (newCol > col) {
            return clickedWalls.includes(`vwall-${row}-${col}`);
        } else if (newCol < col) {
            return clickedWalls.includes(`vwall-${row}-${newCol}`);
        }
        return false;
    };


    // Check if the move is valid (not through a wall)
    const isValidMove = (currentRow, currentCol, targetRow, targetCol) => {
        const { clickedWalls } = state;

        // Moving vertically
        if (currentRow !== targetRow && currentCol === targetCol) {
            const step = currentRow < targetRow ? 1 : -1;
            for (let i = currentRow; i !== targetRow; i += step) {
                const wallId = step === 1 ? `hwall-${i}-${currentCol}` : `hwall-${i-1}-${currentCol}`;
                if (clickedWalls.includes(wallId)) return false;
            }
        }

        // Moving horizontally
        if (currentCol !== targetCol && currentRow === targetRow) {
            const step = currentCol < targetCol ? 1 : -1;
            for (let i = currentCol; i !== targetCol; i += step) {
                const wallId = step === 1 ? `vwall-${currentRow}-${i}` : `vwall-${currentRow}-${i-1}`;
                if (clickedWalls.includes(wallId)) return false;
            }
        }

        return true;
    };


    //////////////////// CLICK EVENTS //////////////////
    const handlePlayerClick = (rowIndex, colIndex) => {
        const { players, initialPlayer } = state;
    
        const currentPlayer = players.find((player) => player.name === initialPlayer);

        if (currentPlayer.position.row === rowIndex && currentPlayer.position.col === colIndex) {
            const newHighlightedSquares = [];
    
            const addHighlightedSquare = (row, col) => {
                if (row >= 0 && row < boardSize && col >= 0 && col < boardSize && isValidMove(rowIndex, colIndex, row, col)) {
                    newHighlightedSquares.push({ row, col });
                }
            };
    
            const checkAdjacentPlayer = (row, col) => {
                return players.some((player) => player.position.row === row && player.position.col === col);
            };
    
            // Up
            if (rowIndex > 0 && isValidMove(rowIndex, colIndex, rowIndex - 1, colIndex)) {
                if (checkAdjacentPlayer(rowIndex - 1, colIndex)) {
                    addHighlightedSquare(rowIndex - 2, colIndex); // Behind the adjacent player
                    if (isWallBlockingMove(rowIndex - 1, colIndex, rowIndex - 2, colIndex)) {
                        addHighlightedSquare(rowIndex - 1, colIndex - 1); // Left of the adjacent player
                        addHighlightedSquare(rowIndex - 1, colIndex + 1); // Right of the adjacent player
                    }
                } else {
                    addHighlightedSquare(rowIndex - 1, colIndex);
                }
            }
    
            // Down
            if (rowIndex < boardSize - 1 && isValidMove(rowIndex, colIndex, rowIndex + 1, colIndex)) {
                if (checkAdjacentPlayer(rowIndex + 1, colIndex)) {
                    addHighlightedSquare(rowIndex + 2, colIndex); // Behind the adjacent player
                    if (isWallBlockingMove(rowIndex + 1, colIndex, rowIndex + 2, colIndex)) {
                        addHighlightedSquare(rowIndex + 1, colIndex - 1); // Left of the adjacent player
                        addHighlightedSquare(rowIndex + 1, colIndex + 1); // Right of the adjacent player
                    }
                } else {
                    addHighlightedSquare(rowIndex + 1, colIndex);
                }
            }
    
            // Left
            if (colIndex > 0 && isValidMove(rowIndex, colIndex, rowIndex, colIndex - 1)) {
                if (checkAdjacentPlayer(rowIndex, colIndex - 1)) {
                    addHighlightedSquare(rowIndex, colIndex - 2); // Behind the adjacent player
                    if (isWallBlockingMove(rowIndex, colIndex - 1, rowIndex, colIndex - 2)) {
                        addHighlightedSquare(rowIndex - 1, colIndex - 1); // Above the adjacent player
                        addHighlightedSquare(rowIndex + 1, colIndex - 1); // Below the adjacent player
                    }
                } else {
                    addHighlightedSquare(rowIndex, colIndex - 1);
                }
            }
    
            // Right
            if (colIndex < boardSize - 1 && isValidMove(rowIndex, colIndex, rowIndex, colIndex + 1)) {
                if (checkAdjacentPlayer(rowIndex, colIndex + 1)) {
                    addHighlightedSquare(rowIndex, colIndex + 2); // Behind the adjacent player
                    if (isWallBlockingMove(rowIndex, colIndex + 1, rowIndex, colIndex + 2)) {
                        addHighlightedSquare(rowIndex - 1, colIndex + 1); // Above the adjacent player
                        addHighlightedSquare(rowIndex + 1, colIndex + 1); // Below the adjacent player
                    }
                } else {
                    addHighlightedSquare(rowIndex, colIndex + 1);
                }
            }
    
            setState((prevState) => ({
                ...prevState,
                highlightedSquares: newHighlightedSquares,
            }));        
        }
    };
    

    const movePlayer = (rowIndex, colIndex) => {
        const { players, initialPlayer } = state;
        const currentPlayer = players.find((player) => player.name === initialPlayer);

        const currentRow = currentPlayer.position.row;
        const currentCol = currentPlayer.position.col;

        if (!isValidMove(currentRow, currentCol, rowIndex, colIndex)) {
            alert("Cannot move through walls!");
            return;
        }

        const newPlayers = players.map((player) =>
            player.name === initialPlayer ? { ...player, position: { row: rowIndex, col: colIndex } } : player
        );

        const nextPlayer = initialPlayer === 'player1' ? 'player2' : 'player1';

        setState((prevState) => ({
            ...prevState,
            players: newPlayers,
            initialPlayer: nextPlayer,
            highlightedSquares: [],
        }));

        if (initialPlayer === 'player1' && rowIndex === 0) {
            navigate('/game-over', { state: {winner: 'Player 1'} });
        }
        if (initialPlayer === 'player2' && rowIndex === 8) {
            navigate('/game-over', { state: {winner: 'Player 2'} });
        }
    };

    
    

    const handleWallClick = (id, orientation) => {
        const { players, clickedWalls, hoveredWalls, initialPlayer } = state;
        const newClickedWalls = [...clickedWalls];
        
        const currentPlayer = players.find((player) => player.name === initialPlayer);

        if(currentPlayer.wallsLeft <= 0){
            alert("Yor walls are over! You can only move.");
            return;
        }
        
        if (orientation === 'vertical') {
            const parts = id.split('-');
            const row = parseInt(parts[1], 10);
            const col = parseInt(parts[2], 10);
            const belowWall = `vwall-${row + 1}-${col}`;
            if (hoveredWalls.indexOf(id) !== -1 && clickedWalls.indexOf(id) === -1){
                newClickedWalls.push(id);
                newClickedWalls.push(belowWall);
            }else return;
        } else {
            const parts = id.split('-');
            const row = parseInt(parts[1], 10);
            const col = parseInt(parts[2], 10);
            const nextWall = `hwall-${row}-${col + 1}`;
            if(hoveredWalls.indexOf(id) !== -1 && clickedWalls.indexOf(id) === -1){
                newClickedWalls.push(id);
                newClickedWalls.push(nextWall);
            }else return;
        }
    
        const player1Start = players.find(player => player.name === 'player1').position;
        const player2Start = players.find(player => player.name === 'player2').position;
    
        const player1CanReachGoal = bfs(player1Start, 0, boardSize, newClickedWalls);
        const player2CanReachGoal = bfs(player2Start, 8, boardSize, newClickedWalls);
    
        if (player1CanReachGoal && player2CanReachGoal) {
            setState((prevState) => ({
                ...prevState,
                clickedWalls: newClickedWalls,
                players: prevState.players.map(player => player.name === state.initialPlayer ? { ...player, wallsLeft: player.wallsLeft - 1 } : player),
                initialPlayer: prevState.initialPlayer === 'player1' ? 'player2' : 'player1',
                highlightedSquares: [],
            }));
        } else {
            alert('Invalid wall placement! This move would block all paths to the goal.');
        }
    };
    

    //////////////////////// HOVER EVENTS ///////////////////////////
    const handleWallHover = (id, orientation, isHovering) => {
        const { hoveredWalls, clickedWalls } = state;
        let newHoveredWalls = [...hoveredWalls];
    
        const index = hoveredWalls.indexOf(id);
    
        if (isHovering) {
        
            if (orientation === 'vertical') {
                const parts = id.split('-');
                const row = parseInt(parts[1], 10);
                const col = parseInt(parts[2], 10);
    
                const belowWall = `vwall-${row + 1}-${col}`;
                if (newHoveredWalls.indexOf(belowWall) === -1 && clickedWalls.indexOf(belowWall)===-1 && row < 8){
                    if (index === -1 && clickedWalls.indexOf(id)===-1){
                        newHoveredWalls.push(id);
                        newHoveredWalls.push(belowWall);
                    }
                } 
            } else {
                const parts = id.split('-');
                const row = parseInt(parts[1], 10);
                const col = parseInt(parts[2], 10);
    
                const nextWall = `hwall-${row}-${col + 1}`;
                if (newHoveredWalls.indexOf(nextWall) === -1 && clickedWalls.indexOf(id) === -1 && col < 8){
                    if (index === -1 && clickedWalls.indexOf(nextWall) === -1){
                        newHoveredWalls.push(id);
                        newHoveredWalls.push(nextWall);
                    } 
                }
            }
        } else {
            while (newHoveredWalls.length) {
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
        handleWallHover,
        handleWallClick,
    });
}

export default GameLogic;