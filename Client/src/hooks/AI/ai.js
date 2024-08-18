import GameLogic from "../gameLogic";
//import MonteCarloTreeSearch from "./MCTS";

const boardSize = 9;
class AI {
    constructor(numOfMCTSSimulations, uctConst, aiDevelopMode = false, forWorker = false) {
        this.numOfMCTSSimulations = numOfMCTSSimulations // number
        this.uctConst = uctConst;
        this.aiDevelopMode = aiDevelopMode; // boolean;
        this.forWorker = forWorker; // boolean;
    }

    chooseNextMove(state){
        // heuristic:
        // for first move of each pawn
        // go forward if possible
        if(state.turn < 2){

            const shortestWayforPlayer2 = bfs(state.players[0].position, state.players[0].goalRow, boardSize, state.clickedWalls);
            const nextPosition = shortestWayforPlayer2[1];

            return{type: "move", col: nextPosition.col, row: nextPosition.row};
        }


        //const mcts = new MonteCarloTreeSearch(state, this.uctConst);
        
        const nSearch = 50;
        const nBatch = Math.ceil(this.numOfMCTSSimulations / nSearch);

        for (let i = 0; i < nSearch; i++) {
            //mcts.search(nBatch);
        }
        
    }
}

const findBestWall = (state, player1Way, possibleWallActions, clickedWalls, bfs) => {
    let bestWall = null;
    let maxExtension = 0;

    possibleWallActions.forEach(wall => {
        const id = wall.id;
        const rowCol = id.split('-');
        const direction = rowCol[0][0];
        const row = parseInt(rowCol[1]);
        const col = parseInt(rowCol[2]);

        let newId;
        if (direction === "v") {
            newId = `vwall-${row + 1}-${col}`;
        } else if (direction === "h") {
            newId = `hwall-${row}-${col + 1}`;
        }

        clickedWalls.push(id, newId);

        if (isValidWallPlacement(state, clickedWalls, bfs)) {
            const extendedPath = simulateWallEffect(state, clickedWalls, bfs);
            const extension = extendedPath.length - player1Way.length;

            if (extension > maxExtension) {
                maxExtension = extension;
                bestWall = wall;
            }
        }

        clickedWalls.pop();
        clickedWalls.pop();
    });

    return bestWall;
};

const isValidWallPlacement = (state, walls, bfs) => {
    const player1 = state.players[1];
    const player2 = state.players[0];

    // Check if both players have a valid path to their respective goals
    const path1 = bfs(player1.position, player1.goalRow, boardSize, walls);
    const path2 = bfs(player2.position, player2.goalRow, boardSize, walls);

    return path1.length > 0 && path2.length > 0;
};

const simulateWallEffect = (state, walls, bfs) => {
    // Simulate placing the wall and calculate the new shortest path for the opponent
    const start = state.players[1].position;
    const newWay = bfs(start, state.players[1].goalRow, boardSize, walls);

    return newWay;
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
                if (!isWallBlockingMove(row, col, newRow, newCol, walls) && isValidMove(row, col, newRow, newCol, walls)) {
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
const isValidMove = (currentRow, currentCol, targetRow, targetCol, clickedWalls) => {

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
export default AI;