import { useState } from "react";

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
                    if (!isWallBlockingMove(row, col, newRow, newCol, walls)) {
                        queue.push({ row: newRow, col: newCol });
                        visited[newRow][newCol] = true;
                    }
                }
            }
        }
    
        return false; // no path found
    };

    const isWallBlockingMove = (row, col, newRow, newCol, walls) => {
        // Check vertical walls
        if (newRow > row) {
            return walls.includes(`hwall-${row}-${col}`);
        } else if (newRow < row) {
            return walls.includes(`hwall-${newRow}-${col}`);
        }
        // Check horizontal walls
        if (newCol > col) {
            return walls.includes(`vwall-${row}-${col}`);
        } else if (newCol < col) {
            return walls.includes(`vwall-${row}-${newCol}`);
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

    const handlePlayerClick = (rowIndex, colIndex) => {
        const { players, initialPlayer } = state;

        const currentPlayer = players.find((player) => player.name === initialPlayer);

        if (currentPlayer.position.row === rowIndex && currentPlayer.position.col === colIndex) {
            const newHighlightedSquares = [];

            if (rowIndex > 0 && isValidMove(rowIndex, colIndex, rowIndex - 1, colIndex)) {
                newHighlightedSquares.push({ row: rowIndex - 1, col: colIndex });
            }
            if (rowIndex < boardSize - 1 && isValidMove(rowIndex, colIndex, rowIndex + 1, colIndex)) {
                newHighlightedSquares.push({ row: rowIndex + 1, col: colIndex });
            }
            if (colIndex > 0 && isValidMove(rowIndex, colIndex, rowIndex, colIndex - 1)) {
                newHighlightedSquares.push({ row: rowIndex, col: colIndex - 1 });
            }
            if (colIndex < boardSize - 1 && isValidMove(rowIndex, colIndex, rowIndex, colIndex + 1)) {
                newHighlightedSquares.push({ row: rowIndex, col: colIndex + 1 });
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
            alert("Player 1 kazandı");
        }
        if (initialPlayer === 'player2' && rowIndex === 8) {
            alert("Player 2 kazandı");
        }
    };
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
                if (newHoveredWalls.indexOf(nextWall) === -1 && clickedWalls.indexOf(nextWall) === -1 && col < 8){
                    if (index === -1 && clickedWalls.indexOf(nextWall) === -1){
                        newHoveredWalls.push(id);
                    } newHoveredWalls.push(nextWall);
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
    

    const handleWallClick = (id, orientation) => {
        const { players, clickedWalls, hoveredWalls } = state;
        const newClickedWalls = [...clickedWalls];
    
        if (orientation === 'vertical') {
            const parts = id.split('-');
            const row = parseInt(parts[1], 10);
            const col = parseInt(parts[2], 10);
            const belowWall = `vwall-${row + 1}-${col}`;
            if (hoveredWalls.indexOf(id) !== -1){
                newClickedWalls.push(id);
                newClickedWalls.push(belowWall);
            }else return;
        } else {
            const parts = id.split('-');
            const row = parseInt(parts[1], 10);
            const col = parseInt(parts[2], 10);
            const nextWall = `hwall-${row}-${col + 1}`;
            if(hoveredWalls.indexOf(id) !== -1){
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
            }));
        } else {
            alert('Invalid wall placement! This move would block all paths to the goal.');
        }
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