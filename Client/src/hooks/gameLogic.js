import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
const GameLogic = (boardSize) => {

     ///////////////// This is for change the file /////////////
    const navigate = useNavigate();
    const location = useLocation();
    const { player1Name, player2Name, mode, playerRole } = location.state || { player1Name: 'Player 1', player2Name: 'Player 2', mode: '2Player', playerRole:'player1'};


    const [state, setState] = useState({
        playAs: playerRole,
        nickNames: [
            playerRole === 'player1' ? player1Name : player2Name,
            playerRole === 'player1' ? player2Name : player1Name
        ],
        highlightedSquares: [],
        players:
        [{ position: { row: 8, col: Math.floor(boardSize / 2) }, name: 'player1', wallsLeft: 10, shortestWay: [{}], goalRow:0},
        { position: { row: 0, col: Math.floor(boardSize / 2) }, name: 'player2', wallsLeft: 10, shortestWay: [{}], goalRow:8},
        ],
        initialPlayer: 'player1',
        turn: 0,
        hoveredWalls: [],
        hoveredSpaces: [],
        clickedWalls: [],
        clickedSpaces: [],
        possibleActions: {},
    });

    useEffect(() => {
        const player1Way = bfs(state.players[0].position, state.players[0].goalRow, boardSize, state.clickedWalls, state.players);
        const player2Way = bfs(state.players[1].position, state.players[1].goalRow, boardSize, state.clickedWalls, state.players);

        setState((prevState) => ({
            ...prevState,
            players: [
                { ...prevState.players[0], shortestWay: player1Way },
                { ...prevState.players[1], shortestWay: player2Way },
            ]
        }))
    }, [])

    

    useEffect(() => {
        const turn = state.turn + 1;
        setState((prevState) => ({
            ...prevState,
            turn: turn
        }))
    }, [state.initialPlayer])


    useEffect(() => {

        // State değiştiğinde verileri gönder
        if(mode === "AI" && ((state.initialPlayer === "player2" && state.playAs==="player1") || (state.initialPlayer === "player1" && state.playAs==="player2"))){
            
            updatePossibleActions();
            
        }if(mode === "Bot" && ((state.initialPlayer === "player2" && state.playAs==="player1") || (state.initialPlayer === "player1" && state.playAs==="player2"))){
             //refresh state.possibleActions 
            updatePossibleActions();
        }

    }, [state.players]);

    useEffect(() => {
        if(((state.initialPlayer === "player2" && state.playAs==="player1") || (state.initialPlayer === "player1" && state.playAs==="player2")) && mode==='Bot'){
            // Create a new web worker
            const myWorker = new Worker(new URL('worker.js', import.meta.url), { type: 'module' });
           
            // Set up event listener for messages from the worker
            myWorker.onmessage = function (response) {
                const action = response.data;
                console.log(action);

                if (action.type === "move") {
                    movePlayer(action.row, action.col);
                } else if (action.type === "wall") {
                    handleWallClick(action.id, action.orientation, false);
                }
            };         
            myWorker.postMessage(state);
            
            // Clean up the worker when the component unmounts
            return () => {
                myWorker.terminate();
            };
        }

        if(((state.initialPlayer === "player2" && state.playAs==="player1") || (state.initialPlayer === "player1" && state.playAs==="player2")) && mode==='AI'){
            // Create a new web worker
            const myWorker = new Worker(new URL('worker.js', import.meta.url), { type: 'module' });
        
            // Set up event listener for messages from the worker
            myWorker.onmessage = function (response) {
                const action = response.data;
                console.log(action);
                if (action.type === "move") {
                    movePlayer(action.row, action.col);
                } else if (action.type === "wall") {
                    handleWallClick(action.id, action.orientation, false);
                }
            };    
            myWorker.postMessage(state);
            
            // Clean up the worker when the component unmounts
            return () => {
                myWorker.terminate();
            };
        }
    }, [state.possibleActions])


    const sendStateToBackendforAI = () => {
        axios.post('http://localhost:5000/update-state', {
            clickedWalls: state.clickedWalls,
            players: state.players
        })
        .then(response => {
            const action = response.data
            if(action.length === 2){
                //movePlayer(action[0], action[1]);
            }else{
                const orientation = (action[2] === 0) ? 'vertical' : 'horizontal';

                const id = (orientation === "horizontal") ? "hwall-"+action[0]+"-"+action[1] : "vwall-"+action[0]+"-"+action[1]
                handleWallClick(id, orientation, false);
            }
        })
        .catch(error => {
            console.error('Error sending data to Python:', error);
        });
    };

   
    /////////////////  BFS ALGORITHM /////////////////////////
    const bfs = (start, goalRow, boardSize, walls, players) => {
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
    
            const possibleMoves = getPossibleMoveActions(row, col, players, walls);
            
            for (const move of possibleMoves) {
                const newRow = move.row;
                const newCol = move.col;

                if (!visited[newRow][newCol]) {
                                      
                    queue.push({ row: newRow, col: newCol });
                    visited[newRow][newCol] = true;
                    previous[`${newRow},${newCol}`] = { row, col }; // Track the path
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
        const {players, initialPlayer, clickedWalls} = state;
        const currentPlayer = players.find((player) => player.name === initialPlayer);

        if(currentPlayer.position.row === rowIndex && currentPlayer.position.col === colIndex){
            const newHighlightedSquares = getPossibleMoveActions(rowIndex, colIndex, state.players, clickedWalls);

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

        

        const newPlayers = players.map((player, index) => {
            const updatedPlayer = player.name === initialPlayer 
                ? { ...player, position: { row: rowIndex, col: colIndex } } 
                : player;
            
            // Update shortestWay based on the index
            if (index === 0) {
                return updatedPlayer;
            } else if (index === 1) {
                return updatedPlayer;
            }
        });

        const player1Dist = bfs(newPlayers[0].position, newPlayers[0].goalRow, boardSize, state.clickedWalls, newPlayers);
        const player2Dist = bfs(newPlayers[1].position, newPlayers[1].goalRow, boardSize, state.clickedWalls, newPlayers);

        newPlayers[0].shortestWay = player1Dist;
        newPlayers[1].shortestWay = player2Dist;

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
    
        const player1Dist = bfs(player1Start, 0, boardSize, newClickedWalls, state.players);
        const player2Dist = bfs(player2Start, 8, boardSize, newClickedWalls, state.players);

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
                        return { ...updatedPlayer, shortestWay: player1Dist };
                    } else if (index === 1) {
                        return { ...updatedPlayer, shortestWay: player2Dist };
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

    const getPossibleMoveActions = (rowIndex, colIndex, players, clickedWalls) => {
        const { initialPlayer } = state;
    
        const possibleMoveArray = [];

    
            const addToPossibleMoveArray = (row, col) => {
                if (row >= 0 && row < boardSize && col >= 0 && col < boardSize && isValidMove(rowIndex, colIndex, row, col)) {
                    possibleMoveArray.push({ row, col });
                }
            };
    
            const checkAdjacentPlayer = (row, col) => {
                return players.some((player) => player.position.row === row && player.position.col === col && player.name !== initialPlayer);
            };
    
            // Up
            if (rowIndex > 0 && isValidMove(rowIndex, colIndex, rowIndex - 1, colIndex) && !isWallBlockingMove(rowIndex, colIndex, rowIndex - 1,colIndex,clickedWalls)) {
                if (checkAdjacentPlayer(rowIndex - 1, colIndex)) {
                    addToPossibleMoveArray(rowIndex - 2, colIndex); // Behind the adjacent player
                    if (isWallBlockingMove(rowIndex - 1, colIndex, rowIndex - 2, colIndex, clickedWalls) || rowIndex-2 < 0) {
                        if(!isWallBlockingMove(rowIndex - 1, colIndex, rowIndex - 1, colIndex - 1, clickedWalls))
                            addToPossibleMoveArray(rowIndex - 1, colIndex - 1); // Left of the adjacent player
                        if(!isWallBlockingMove(rowIndex - 1, colIndex, rowIndex - 1, colIndex + 1, clickedWalls))
                            addToPossibleMoveArray(rowIndex - 1, colIndex + 1); // Right of the adjacent player
                    }
                } else {
                    if(!isWallBlockingMove()){
                        addToPossibleMoveArray(rowIndex - 1, colIndex);
                    }
                }
            }
    
            // Down
            if (rowIndex < boardSize - 1 && isValidMove(rowIndex, colIndex, rowIndex + 1, colIndex) && !isWallBlockingMove(rowIndex, colIndex, rowIndex+1,colIndex,clickedWalls)) {
                if (checkAdjacentPlayer(rowIndex + 1, colIndex)) {
                    addToPossibleMoveArray(rowIndex + 2, colIndex); // Behind the adjacent player
                    if (isWallBlockingMove(rowIndex + 1, colIndex, rowIndex + 2, colIndex, clickedWalls) || rowIndex+2>8) {
                        if(!isWallBlockingMove(rowIndex + 1, colIndex, rowIndex + 1, colIndex - 1, clickedWalls))
                            addToPossibleMoveArray(rowIndex + 1, colIndex - 1); // Left of the adjacent player
                        if(!isWallBlockingMove(rowIndex + 1, colIndex, rowIndex + 1, colIndex + 1, clickedWalls))
                            addToPossibleMoveArray(rowIndex + 1, colIndex + 1); // Right of the adjacent player
                    }
                } else {
                        addToPossibleMoveArray(rowIndex + 1, colIndex);
                }
            }
    
            // Left
            if (colIndex > 0 && isValidMove(rowIndex, colIndex, rowIndex, colIndex - 1) && !isWallBlockingMove(rowIndex, colIndex, rowIndex, colIndex - 1,clickedWalls)) {
                if (checkAdjacentPlayer(rowIndex, colIndex - 1)) {
                    addToPossibleMoveArray(rowIndex, colIndex - 2); // Behind the adjacent player
                    if (isWallBlockingMove(rowIndex, colIndex - 1, rowIndex, colIndex - 2, clickedWalls) || colIndex-2 <0) {
                        if (!isWallBlockingMove(rowIndex, colIndex - 1, rowIndex - 1, colIndex - 1, clickedWalls))
                            addToPossibleMoveArray(rowIndex - 1, colIndex - 1); // Above the adjacent player
                        if (!isWallBlockingMove(rowIndex, colIndex - 1, rowIndex + 1, colIndex - 1, clickedWalls))
                            addToPossibleMoveArray(rowIndex + 1, colIndex - 1); // Below the adjacent player
                    }
                } else {
                    addToPossibleMoveArray(rowIndex, colIndex - 1);
                }
            }
    
            // Right
            if (colIndex < boardSize - 1 && isValidMove(rowIndex, colIndex, rowIndex, colIndex + 1) && !isWallBlockingMove(rowIndex, colIndex, rowIndex, colIndex + 1,clickedWalls)) {
                if (checkAdjacentPlayer(rowIndex, colIndex + 1)) {
                    addToPossibleMoveArray(rowIndex, colIndex + 2); // Behind the adjacent player
                    if (isWallBlockingMove(rowIndex, colIndex + 1, rowIndex, colIndex + 2, clickedWalls) || colIndex+2 > 8) {
                        if (!isWallBlockingMove(rowIndex, colIndex + 1, rowIndex - 1, colIndex + 1, clickedWalls))
                            addToPossibleMoveArray(rowIndex - 1, colIndex + 1); // Above the adjacent player
                        if (!isWallBlockingMove(rowIndex, colIndex + 1, rowIndex + 1, colIndex + 1, clickedWalls))
                            addToPossibleMoveArray(rowIndex + 1, colIndex + 1); // Below the adjacent player
                    }
                } else {
                    addToPossibleMoveArray(rowIndex, colIndex + 1);
                }
            }
            
        return possibleMoveArray;
    }

    const getPossibleWallActions = (player) => {
        const {clickedWalls, clickedSpaces} = state;

        const possibleWallActions = []; 
        // Generate possible wall actions 
        if(player.wallsLeft>0){       
            for (let row = 0; row < boardSize - 1; row++) {
                for (let col = 0; col < boardSize - 1; col++) {
                    const vwallId = `vwall-${row}-${col}`;
                    const vBelowWallId = `vwall-${row+1}-${col}`;
                    const hwallId = `hwall-${row}-${col}`;
                    const hNextWallId = `hwall-${row}-${col+1}`;
                    const spaceId = `space-${row}-${col}`;

                    if (!clickedWalls.includes(vwallId) && !clickedWalls.includes(vBelowWallId) && !clickedSpaces.includes(spaceId)) {
                        possibleWallActions.push({ type: 'wall', id: vwallId, orientation: 'vertical' });
                    }

                    if (!clickedWalls.includes(hwallId) && !clickedWalls.includes(hNextWallId) && !clickedSpaces.includes(spaceId)) {
                        possibleWallActions.push({ type: 'wall', id: hwallId, orientation: 'horizontal' });
                    }
                }
            }
        }
        return possibleWallActions;
    }

    const getPossibleActions = (player) => {

        const moves = getPossibleMoveActions(player.position.row, player.position.col, state.players, state.clickedWalls);
        const possibleWallActions = getPossibleWallActions(player);
        
        return { moves, putWall: possibleWallActions };
    };

    const updatePossibleActions = () => {
        let player;
        if(state.playAs === 'player1'){
            player = state.players[1];
        }else{
            player = state.players[0];
        }

        const newPossibleActions = getPossibleActions(player);
        // Update state with new possibleActions
        setState(prevState => ({
            ...prevState, 
            possibleActions: newPossibleActions
        }));
    };

    return ({
        state,
        handlePlayerClick,
        movePlayer,
        handleWallHover,
        handleWallClick,
        bfs,
        isValidMove,
        isWallBlockingMove,
        getPossibleActions,
        reconstructPath,
    });
}

export default GameLogic;