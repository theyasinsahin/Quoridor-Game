import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const GameLogic = (boardSize) => {

     ///////////////// This is for change the file /////////////
    const navigate = useNavigate();
    const location = useLocation();
    const { player1Name, player2Name, mode } = location.state || { player1Name: 'Player 1', player2Name: 'Player 2', mode: '2Player'};


    const [state, setState] = useState({
        nickNames: [
            player1Name,
            player2Name
        ],
        highlightedSquares: [],
        players: [
        { position: { row: 0, col: Math.floor(boardSize / 2) }, name: 'player2', wallsLeft: 10, shortestWay: [{}]},
        { position: { row: 8, col: Math.floor(boardSize / 2) }, name: 'player1', wallsLeft: 10, shortestWay: [{}]},
        ],
        initialPlayer: 'player1',
        hoveredWalls: [],
        hoveredSpaces: [],
        clickedWalls: [],
        clickedSpaces: [],
    });


    useEffect(() => {
        // State değiştiğinde verileri gönder
        if(mode === "AI" && state.initialPlayer === "player2"){
            sendStateToBackendforAI();
        }if(mode === "Bot" && state.initialPlayer === "player2"){
            sendStateToBackendforBot();
        }
    }, [state.players]);

    const sendStateToBackendforBot = () => {
        axios.post('http://localhost:5000/get-action-bot', {
            state: state,
            actions: getPossibleActions(state.players[0])
        })
        .then(response => {
            const action = response.data
            if(action.type=== "move"){
                movePlayer(action.row, action.col);
            }else if (action.type === "wall"){
                handleWallClick(action.id, action.orientation, false);
            }
            console.log(action)
        })
        .catch(error => {
            console.error('Error sending data to Python:', error);
        });
    }
    
    const sendStateToBackendforAI = () => {
        axios.post('http://localhost:5000/update-state', {
            clickedWalls: state.clickedWalls,
            players: state.players
        })
        .then(response => {
            const action = response.data
            if(action.length === 2){
                movePlayer(action[0], action[1]);
            }else{
                const orientation = (action[2] === 0) ? 'vertical' : 'horizontal';

                const id = (orientation === "horizontal") ? "hwall-"+action[0]+"-"+action[1] : "vwall-"+action[0]+"-"+action[1]
                handleWallClick(id, orientation, false);
            }
            console.log(action);
        })
        .catch(error => {
            console.error('Error sending data to Python:', error);
        });
    };

   
    

    /////////////////  BFS ALGORITHM /////////////////////////
    const bfs = (start, goalRow, boardSize, walls) => {
        const directions = [
            { row: -1, col: 0 }, // up
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }, // left
            { row: 0, col: 1 }   // right
        ];
    
        const queue = [start];
        const visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
        const previous = {}; // Object to store previous positions
        visited[start.row][start.col] = true;
    
        while (queue.length > 0) {
            const { row, col } = queue.shift();
    
            if (row === goalRow) {
                return reconstructPath(previous, start, { row, col }); // Reconstruct the path
            }
    
            for (const direction of directions) {
                const newRow = row + direction.row;
                const newCol = col + direction.col;
                
                if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && !visited[newRow][newCol]) {
                    if (!isWallBlockingMove(row, col, newRow, newCol, walls) && isValidMove(row, col, newRow, newCol)) {
                        queue.push({ row: newRow, col: newCol });
                        visited[newRow][newCol] = true;
                        previous[`${newRow},${newCol}`] = { row, col }; // Track the path
                    }
                }
            }
        }
    
        return []; // Return empty array if no path found
    };
    
    // Function to reconstruct the path
    const reconstructPath = (previous, start, goal) => {
        const path = [];
        let current = goal;
    
        while (current) {
            path.unshift(current); // Add current position to the beginning of the path
            current = previous[`${current.row},${current.col}`]; // Move to the previous position
        }
    
        return path; // Return the reconstructed path
    };

    ////////////// VALID MOVES
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


    //////////////////// CLICK EVENTS //////////////////
    const handlePlayerClick = (rowIndex, colIndex) => {
        const { players, initialPlayer, clickedWalls } = state;
    
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
                    if (isWallBlockingMove(rowIndex - 1, colIndex, rowIndex - 2, colIndex, clickedWalls) || rowIndex-2 < 0) {
                        if(!isWallBlockingMove(rowIndex - 1, colIndex, rowIndex - 1, colIndex - 1, clickedWalls))
                            addHighlightedSquare(rowIndex - 1, colIndex - 1); // Left of the adjacent player
                        if(!isWallBlockingMove(rowIndex - 1, colIndex, rowIndex - 1, colIndex + 1, clickedWalls))
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
                    if (isWallBlockingMove(rowIndex + 1, colIndex, rowIndex + 2, colIndex, clickedWalls) || rowIndex+2>8) {
                        if(!isWallBlockingMove(rowIndex + 1, colIndex, rowIndex + 1, colIndex - 1, clickedWalls))
                            addHighlightedSquare(rowIndex + 1, colIndex - 1); // Left of the adjacent player
                        if(!isWallBlockingMove(rowIndex + 1, colIndex, rowIndex + 1, colIndex + 1, clickedWalls))
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
                    if (isWallBlockingMove(rowIndex, colIndex - 1, rowIndex, colIndex - 2, clickedWalls) || colIndex-2 <0) {
                        if (!isWallBlockingMove(rowIndex, colIndex - 1, rowIndex - 1, colIndex - 1, clickedWalls))
                            addHighlightedSquare(rowIndex - 1, colIndex - 1); // Above the adjacent player
                        if (!isWallBlockingMove(rowIndex, colIndex - 1, rowIndex + 1, colIndex - 1, clickedWalls))
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
                    if (isWallBlockingMove(rowIndex, colIndex + 1, rowIndex, colIndex + 2, clickedWalls) || colIndex+2 > 8) {
                        if (!isWallBlockingMove(rowIndex, colIndex + 1, rowIndex - 1, colIndex + 1, clickedWalls))
                            addHighlightedSquare(rowIndex - 1, colIndex + 1); // Above the adjacent player
                        if (!isWallBlockingMove(rowIndex, colIndex + 1, rowIndex + 1, colIndex + 1, clickedWalls))
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
            return newHighlightedSquares;
        }
    };
    

    const movePlayer = (rowIndex, colIndex) => {
        const { players, initialPlayer, nickNames } = state;
        const currentPlayer = players.find((player) => player.name === initialPlayer);

        const currentRow = currentPlayer.position.row;
        const currentCol = currentPlayer.position.col;

        if (!isValidMove(currentRow, currentCol, rowIndex, colIndex)) {
            alert("Cannot move through walls!");
            return;
        }

        const player2Dist = bfs(players[0].position, 8, boardSize, state.clickedWalls);
        const player1Dist = bfs(players[1].position, 0, boardSize, state.clickedWalls);

        const newPlayers = players.map((player, index) => {
            const updatedPlayer = player.name === initialPlayer 
                ? { ...player, position: { row: rowIndex, col: colIndex } } 
                : player;
            
            // Update shortestWay based on the index
            if (index === 0) {
                return { ...updatedPlayer, shortestWay: player2Dist };
            } else if (index === 1) {
                return { ...updatedPlayer, shortestWay: player1Dist };
            }
        });

        const nextPlayer = initialPlayer === 'player1' ? 'player2' : 'player1';
        setState((prevState) => ({
            ...prevState,
            players: newPlayers,
            initialPlayer: nextPlayer,
            highlightedSquares: [],
        }));

        if (initialPlayer === 'player1' && rowIndex === 0) {
            navigate('/game-over', { state: {winner: nickNames[0]} });
        }
        if (initialPlayer === 'player2' && rowIndex === 8) {
            navigate('/game-over', { state: {winner: nickNames[1]} });
        }
    };

    
    const handleWallClick = (id, orientation, flag) => {
        const { players, clickedWalls, hoveredWalls, initialPlayer, clickedSpaces } = state;
        const newClickedWalls = [...clickedWalls];
        const newClickedSpaces = [...clickedSpaces];
        
        const currentPlayer = players.find((player) => player.name === initialPlayer);
    
        if(currentPlayer.wallsLeft <= 0){
            alert("Your walls are over! You can only move.");
            return;
        }
        const parts = id.split('-');
        const row = parseInt(parts[1], 10);
        const col = parseInt(parts[2], 10);
        const spaceId = `space-${row}-${col}`;
        if (orientation === 'vertical') {
            const belowWall = `vwall-${row + 1}-${col}`;
            if (hoveredWalls.indexOf(id) !== -1 && clickedSpaces.indexOf(spaceId) === -1 && clickedWalls.indexOf(id) === -1 && flag){
                newClickedWalls.push(id);
                newClickedSpaces.push(spaceId);
                newClickedWalls.push(belowWall);
            } else if (clickedWalls.indexOf(id) === -1 && clickedSpaces.indexOf(spaceId) === -1 && clickedWalls.indexOf(belowWall) === -1 && flag === false){
                newClickedWalls.push(id);
                newClickedSpaces.push(spaceId);
                newClickedWalls.push(belowWall);
            } else {
                return;
            }
        } else {
            const nextWall = `hwall-${row}-${col + 1}`;
            if(hoveredWalls.indexOf(id) !== -1 && clickedWalls.indexOf(id) === -1 && flag){
                newClickedWalls.push(id);
                newClickedSpaces.push(spaceId);
                newClickedWalls.push(nextWall);
            } else if (clickedWalls.indexOf(id) === -1 && clickedWalls.indexOf(nextWall) === -1 && flag === false){
                newClickedWalls.push(id);
                newClickedSpaces.push(spaceId);
                newClickedWalls.push(nextWall);
            }else {
                return;
            }
        }
    
        const player1Start = players.find(player => player.name === 'player1').position;
        const player2Start = players.find(player => player.name === 'player2').position;
    

        const player1Dist = bfs(player1Start, 0, boardSize, newClickedWalls);
        const player2Dist = bfs(player2Start, 8, boardSize, newClickedWalls);

        if (player1Dist.length!==0 && player2Dist.length!==0) {
            setState((prevState) => ({
                ...prevState,
                clickedWalls: newClickedWalls,
                clickedSpaces: newClickedSpaces,
                players: prevState.players.map((player, index) => {
                    // Update wallsLeft if the player matches initialPlayer
                    const updatedPlayer = player.name === state.initialPlayer ? { ...player, wallsLeft: player.wallsLeft - 1 } : player;
                    
                    // Update shortestWay based on the index
                    if (index === 0) {
                        return { ...updatedPlayer, shortestWay: player2Dist };
                    } else if (index === 1) {
                        return { ...updatedPlayer, shortestWay: player1Dist };
                    }
                }),                
                initialPlayer: prevState.initialPlayer === 'player1' ? 'player2' : 'player1',
                highlightedSquares: [],
            }));
        } else {          
            alert('Invalid wall placement! This move would block all paths to the goal.');
        }
    };
    
    

    //////////////////////// HOVER EVENTS ///////////////////////////
    const handleWallHover = (id, orientation, isHovering) => {
        const { hoveredWalls, clickedWalls, hoveredSpaces, clickedSpaces } = state;
        const newHoveredWalls = [...hoveredWalls];
        const newHoveredSpaces = [...hoveredSpaces];

        const index = hoveredWalls.indexOf(id);
    
        const parts = id.split('-');
        const row = parseInt(parts[1], 10);
        const col = parseInt(parts[2], 10);
        const spaceId = `space-${row}-${col}`;
        if (isHovering) {
            if (orientation === 'vertical') {
                const belowWall = `vwall-${row + 1}-${col}`;
                if (newHoveredWalls.indexOf(belowWall) === -1 && clickedSpaces.indexOf(spaceId) === -1 && clickedWalls.indexOf(belowWall)===-1 && row < 8){
                    if (index === -1 && clickedWalls.indexOf(id)===-1){
                        newHoveredWalls.push(id);
                        newHoveredSpaces.push(spaceId);
                        newHoveredWalls.push(belowWall);
                    }
                } 
            } else {
                const nextWall = `hwall-${row}-${col + 1}`;
                if (newHoveredWalls.indexOf(nextWall) === -1 && clickedSpaces.indexOf(spaceId) === -1 && clickedWalls.indexOf(id) === -1 && col < 8){
                    if (index === -1 && clickedWalls.indexOf(nextWall) === -1){
                        newHoveredWalls.push(id);
                        newHoveredSpaces.push(spaceId);
                        newHoveredWalls.push(nextWall);
                    } 
                }
            }
        } else {
            while (newHoveredWalls.length) {
                newHoveredWalls.pop();
            }
            while (newHoveredSpaces.length) {
                newHoveredSpaces.pop();
            }
        }
    
        setState((prevState) => ({
            ...prevState,
            hoveredWalls: newHoveredWalls,
            hoveredSpaces: newHoveredSpaces,
        }));
    };


    const getPossibleActions = (player) => {
        const { players } = state;
        const moves = handlePlayerClick(player.position.row, player.position.col);
        const possibleWallActions = [];
        
        
        const currentPlayer = players.find((player) => player.name === 'player2');
        // Generate possible wall actions 
        if(currentPlayer.wallsLeft>0){       
            for (let row = 0; row < boardSize - 1; row++) {
                for (let col = 0; col < boardSize - 1; col++) {
                    const vwallId = `vwall-${row}-${col}`;
                    const vBelowWallId = `vwall-${row+1}-${col}`;
                    const hwallId = `hwall-${row}-${col}`;
                    const hNextWallId = `hwall-${row}-${col+1}`;
                    const spaceId = `space-${row}-${col}`;
        
                    if (!state.clickedWalls.includes(vwallId) && !state.clickedWalls.includes(vBelowWallId) && !state.clickedSpaces.includes(spaceId)) {
                        possibleWallActions.push({ type: 'wall', id: vwallId, orientation: 'vertical' });
                    }
        
                    if (!state.clickedWalls.includes(hwallId) && !state.clickedWalls.includes(hNextWallId) && !state.clickedSpaces.includes(spaceId)) {
                        possibleWallActions.push({ type: 'wall', id: hwallId, orientation: 'horizontal' });
                    }
                }
            }
        }
    
        return { moves, putWall: possibleWallActions };
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