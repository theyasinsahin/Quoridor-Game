import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { aStar, reconstructPath, aStarAllPaths } from "./AStar";

let canItMove = true;
let isGameOver = false;
const user = JSON.parse(localStorage.getItem('user'));

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
        notations: [],
        history: [], // track game states
        reset: false,
    });

    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            history: [...prevState.history, prevState],
        }))
    },[])

    useEffect(() => {
        const {players, initialPlayer, clickedWalls, nickNames, playAs} = state;
        const currentPlayer = players.find((player) => player.name === initialPlayer);

        if(((mode !== "AI" || mode !== "Bot" || mode !== "Online") && initialPlayer === playAs) || mode=== '2Player'){
            const newHighlightedSquares = getPossibleMoveActions(currentPlayer.position.row, currentPlayer.position.col, state.players, clickedWalls);
            setState((prevState) => ({
                ...prevState,
                highlightedSquares: newHighlightedSquares,
            }))
        }
        
    }, [state.initialPlayer])


    useEffect(() => {

        //console.log(aStarAllPaths(state.players[0].position, state.players[0].goalRow, boardSize, state.clickedWalls, state.players, state.initialPlayer));
        //console.log(aStarAllPaths(state.players[1].position, state.players[1].goalRow, boardSize, state.clickedWalls, state.players, state.initialPlayer));
        // State değiştiğinde verileri gönder
        if(mode === "AI" && ((state.initialPlayer === "player2" && state.playAs==="player1") || (state.initialPlayer === "player1" && state.playAs==="player2"))){
            updatePossibleActions();
        }if(mode === "Bot" && ((state.initialPlayer === "player2" && state.playAs==="player1") || (state.initialPlayer === "player1" && state.playAs==="player2"))){
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


    const getHistoryStateAt = (index) => {
        setState((prevState) => ({
            ...prevState,
            players: state.history[index+2].players,
            initialPlayer: state.history[index+2].initialPlayer,
            clickedWalls: [...state.history[index+2].clickedWalls],
            clickedSpaces: [...state.history[index+2].clickedSpaces],
            possibleActions: {...state.history[index+2].possibleActions},
            highlightedSquares: [...state.history[index+2].highlightedSquares],
        }));
        
        if(index !== state.turn-1 || isGameOver){
            canItMove = false;
        }else{
            canItMove = true;
        }
    }

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
        if(canItMove){
            if(state.history[state.history.length-1] === state){
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
            }
        }      
    };
    
const movePlayer = useCallback((rowIndex, colIndex) => {
    if (!canItMove) return;

    const { players, initialPlayer, nickNames, notations } = state;
    const currentPlayer = players.find(player => player.name === initialPlayer);
    const { row: currentRow, col: currentCol } = currentPlayer.position;

    if (!isValidMove(currentRow, currentCol, rowIndex, colIndex)) {
        alert("Cannot move through walls!");
        return;
    }

    const newMove = `${String.fromCharCode(97 + colIndex)}${9 - rowIndex}`;
    const updatedPlayers = updatePlayerPosition(players, initialPlayer, rowIndex, colIndex);
    
    updateShortestPaths(updatedPlayers);

    const nextPlayer = initialPlayer === 'player1' ? 'player2' : 'player1';
    const newState = createNewState(updatedPlayers, nextPlayer, newMove, notations);

    setState(prevState => ({
        ...newState,
        history: [...prevState.history, newState],
    }));

    checkForWin(rowIndex, initialPlayer, nickNames);
}, [state]);

const updatePlayerPosition = (players, playerName, rowIndex, colIndex) => {
    const updatedPlayers = players.map(player => 
        player.name === playerName 
            ? { ...player, position: { row: rowIndex, col: colIndex } }
            : player
    );
    console.log(updatedPlayers);
    return updatedPlayers;
};

const updateShortestPaths = (players) => {
    players.forEach((player, index) => {
        const distance = aStar(player.position, player.goalRow, boardSize, state.clickedWalls, players, state.initialPlayer);
        players[index].shortestWay = distance;
    });
};

const createNewState = (players, nextPlayer, newMove, notations) => {
    return {
        playAs: state.playAs,
        nickNames: state.nickNames,
        highlightedSquares: [],
        players,
        initialPlayer: nextPlayer,
        turn: state.turn + 1,
        hoveredWalls: [],
        hoveredSpaces: [],
        clickedWalls: [...state.clickedWalls],
        clickedSpaces: [...state.clickedSpaces],
        possibleActions: { ...state.possibleActions },
        notations: [...notations, newMove],
    };
};

const checkForWin = (rowIndex, currentPlayer, nickNames) => {
    if ((currentPlayer === 'player1' && rowIndex === 0) || 
        (currentPlayer === 'player2' && rowIndex === 8)) {
        const message = `${nickNames[currentPlayer === 'player1' ? 0 : 1]} won`;
        isGameOver = true;
        alert(message);
        canItMove = false;
    }
};

    const toMainMenu = () => {
        navigate('/');
    }
    function areObjectsEqualExceptHighlightedSquares(obj1, obj2) {
        // Clone the objects to avoid mutating the original ones
        const obj1Clone = { ...obj1 };
        const obj2Clone = { ...obj2 };
      
        // Remove the 'highlightedSquares' property from both objects
        delete obj1Clone.highlightedSquares;
        delete obj2Clone.highlightedSquares;
        delete obj2Clone.history;
        
        // Compare the remaining properties
        return JSON.stringify(obj1Clone) === JSON.stringify(obj2Clone);
      }
    
    const handleWallClick = useCallback((id, orientation, flag) => {
        if(canItMove){
            const { players, clickedWalls, hoveredWalls, initialPlayer, clickedSpaces, notations } = state;
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
            let newMove;
            if (orientation === 'vertical') {
                const belowWall = `vwall-${row + 1}-${col}`;
                if (hoveredWalls.indexOf(id) !== -1 && clickedSpaces.indexOf(spaceId) === -1 && clickedWalls.indexOf(id) === -1 && flag){
                    newClickedWalls.push(id);
                    newClickedSpaces.push(spaceId);
                    newClickedWalls.push(belowWall);
                    newMove = `v${String.fromCharCode(97 + col)}${9 - row-1}`;
    
                } else if (clickedWalls.indexOf(id) === -1 && clickedSpaces.indexOf(spaceId) === -1 && clickedWalls.indexOf(belowWall) === -1 && flag === false){
                    newClickedWalls.push(id);
                    newClickedSpaces.push(spaceId);
                    newClickedWalls.push(belowWall);
                    newMove = `v${String.fromCharCode(97 + col)}${9 - row-1}`;
                } else {
                    return;
                }
            } else {
                const nextWall = `hwall-${row}-${col + 1}`;
                if(hoveredWalls.indexOf(id) !== -1 && clickedWalls.indexOf(id) === -1 && flag){
                    newClickedWalls.push(id);
                    newClickedSpaces.push(spaceId);
                    newClickedWalls.push(nextWall);
                    newMove = `h${String.fromCharCode(97 + col)}${9 - row-1}`;
                } else if (clickedWalls.indexOf(id) === -1 && clickedWalls.indexOf(nextWall) === -1 && flag === false){
                    newClickedWalls.push(id);
                    newClickedSpaces.push(spaceId);
                    newClickedWalls.push(nextWall);
                    newMove = `h${String.fromCharCode(97 + col)}${9 - row-1}`;
                }else {
                    return;
                }
            }
        
            const player1Start = players.find(player => player.name === 'player1').position;
            const player2Start = players.find(player => player.name === 'player2').position;
        
            const player1Way = aStar(player1Start, 0, boardSize, newClickedWalls, state.players, state.initialPlayer);
            const player2Way = aStar(player2Start, 8, boardSize, newClickedWalls, state.players, state.initialPlayer);
    
            if (player1Way.length!==0 && player2Way.length!==0) {

                const newState = {
                    playAs: state.playAs,
                    nickNames: state.nickNames,
                    turn:state.turn+1,
                    hoveredWalls: [],
                    hoveredSpaces: [],
                    possibleActions: {...state.possibleActions},
                    clickedWalls: newClickedWalls,
                    clickedSpaces: newClickedSpaces,
                    players: state.players.map((player, index) => {
                        // Update wallsLeft if the player matches initialPlayer
                        const updatedPlayer = player.name === state.initialPlayer ? { ...player, wallsLeft: player.wallsLeft - 1 } : player;
                        
                        
                        // Update shortestWay based on the index
                        if (index === 0) {
                            return { ...updatedPlayer, shortestWay: player1Way };
                        } else if (index === 1) {
                            return { ...updatedPlayer, shortestWay: player2Way };
                        }
                    }),                
                    initialPlayer: state.initialPlayer === 'player1' ? 'player2' : 'player1',
                    highlightedSquares: [],
                    notations: [...notations, newMove],
                };
        
                setState((prevState) => ({
                    ...newState,
                    history: [...prevState.history, newState], // <-- Save this state to history
                }));
            } else {          
                alert('Invalid wall placement! This move would block all paths to the goal.');
            }
        }   
    }, []);
    
    
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

    const undo = () => {
        if(state.turn > 0){
            const newState = state.history[state.history.length-2];
            const newHistory = [...state.history];
            newHistory.pop();
            if(state.history.length > 0){
                setState(prevState => ({
                    ...prevState,
                    players: [...newState.players],
                    clickedSpaces: [...newState.clickedSpaces],
                    clickedWalls: [...newState.clickedWalls],
                    highlightedSquares: [newState.highlightedSquares],
                    initialPlayer: newState.initialPlayer,
                    notations: [...newState.notations],
                    turn: newState.turn,
                    history: [...newHistory],
                }));
            }
            isGameOver = false;
            canItMove = true;
        }
    }


    return ({
        state,
        handlePlayerClick,
        movePlayer,
        handleWallHover,
        handleWallClick,
        aStar,
        isValidMove,
        isWallBlockingMove,
        getPossibleActions,
        reconstructPath,
        getHistoryStateAt,
        undo,
        toMainMenu,
    });
}

export default GameLogic;