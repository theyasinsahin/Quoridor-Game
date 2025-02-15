import PriorityQueue from "./PriorityQueue";
import { isValidMove, isWallBlockingMove } from "./GameLogic/someLogics";

const heuristic = (current, goalRow) => {
    return Math.abs(current.row - goalRow) + Math.abs(current.col - 0) * 0.1; // Slight bias towards rows
};



export const aStar = (start, goalRow, boardSize, walls, players, initialPlayer) => {
    const openSet = new PriorityQueue();
    const visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
    const previous = {}; // To store the path
    const gScore = Array.from({ length: boardSize }, () => Array(boardSize).fill(Infinity));
    const fScore = Array.from({ length: boardSize }, () => Array(boardSize).fill(Infinity));

    gScore[start.row][start.col] = 0;
    fScore[start.row][start.col] = heuristic(start, goalRow);

    openSet.enqueue(start, fScore[start.row][start.col]);
    
    while (!openSet.isEmpty()) {
        // Find the node with the lowest fScore
        const current = openSet.dequeue(); // Get the node with the lowest fScore

        const { row, col } = current;

        if (row === goalRow) {
            return reconstructPath(previous, { row, col }); // Path found
        }

        visited[row][col] = true;
        const possibleMoves = getPossibleMoveActions(row, col, players, walls, initialPlayer);
        
        for (const move of possibleMoves) {
            const newRow = move.row;
            const newCol = move.col;

            if (visited[newRow][newCol]) continue; // Skip already visited nodes

            const tentativeGScore = gScore[row][col] + 1; // Each move has a cost of 1
            
            if (tentativeGScore < gScore[newRow][newCol]) {
                // This path is better
                previous[`${newRow},${newCol}`] = { row, col };
                gScore[newRow][newCol] = tentativeGScore;
                fScore[newRow][newCol] = gScore[newRow][newCol] + heuristic({ row: newRow, col: newCol }, goalRow);

                openSet.enqueue({ row: newRow, col: newCol }, fScore[newRow][newCol]);
            }
        }
    }

    return []; // No path found
};
  
// Function to reconstruct the path
export const reconstructPath = (previous, goal) => {
    const path = [];
    let current = goal;

    while (current) {
        path.unshift(current); // Add current position to the beginning of the path
        current = previous[`${current.row},${current.col}`]; // Move to the previous position
    }

    return path; // Return the reconstructed path
};



const getPossibleMoveActions = (rowIndex, colIndex, players, clickedWalls, initialPlayer) => {
    
    const boardSize = 9;

    const possibleMoveArray = [];

        const addToPossibleMoveArray = (row, col) => {
            if (row >= 0 && row < boardSize && col >= 0 && col < boardSize && isValidMove(rowIndex, colIndex, row, col, clickedWalls)) {
                possibleMoveArray.push({ row, col });
            }
        };

        const checkAdjacentPlayer = (row, col) => {
            return players.some((player) => player.position.row === row && player.position.col === col && player.name !== initialPlayer);
        };

        // Up
        if (rowIndex > 0 && isValidMove(rowIndex, colIndex, rowIndex - 1, colIndex, clickedWalls) && !isWallBlockingMove(rowIndex, colIndex, rowIndex - 1,colIndex,clickedWalls)) {
            if (checkAdjacentPlayer(rowIndex - 1, colIndex)) {
                addToPossibleMoveArray(rowIndex - 2, colIndex); // Behind the adjacent player
                if (isWallBlockingMove(rowIndex - 1, colIndex, rowIndex - 2, colIndex, clickedWalls) || rowIndex-2 < 0) {
                    if(!isWallBlockingMove(rowIndex - 1, colIndex, rowIndex - 1, colIndex - 1, clickedWalls))
                        addToPossibleMoveArray(rowIndex - 1, colIndex - 1); // Left of the adjacent player
                    if(!isWallBlockingMove(rowIndex - 1, colIndex, rowIndex - 1, colIndex + 1, clickedWalls))
                        addToPossibleMoveArray(rowIndex - 1, colIndex + 1); // Right of the adjacent player
                }
            } else {
                if (!isWallBlockingMove(rowIndex, colIndex, rowIndex - 1, colIndex, clickedWalls)) {
                    addToPossibleMoveArray(rowIndex - 1, colIndex);
                }
            }
        }

        // Down
        if (rowIndex < boardSize - 1 && isValidMove(rowIndex, colIndex, rowIndex + 1, colIndex, clickedWalls) && !isWallBlockingMove(rowIndex, colIndex, rowIndex+1,colIndex,clickedWalls)) {
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
        if (colIndex > 0 && isValidMove(rowIndex, colIndex, rowIndex, colIndex - 1, clickedWalls) && !isWallBlockingMove(rowIndex, colIndex, rowIndex, colIndex - 1,clickedWalls)) {
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
        if (colIndex < boardSize - 1 && isValidMove(rowIndex, colIndex, rowIndex, colIndex + 1, clickedWalls) && !isWallBlockingMove(rowIndex, colIndex, rowIndex, colIndex + 1,clickedWalls)) {
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


export const aStarAllPaths = (start, goalRow, boardSize, walls, players, initialPlayer) => {
    const openSet = new PriorityQueue();
    const visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
    
    // Initialize each cell with an empty array to store multiple previous nodes
    const previous = Array.from({ length: boardSize }, () =>
        Array.from({ length: boardSize }, () => []) 
    );

    const gScore = Array.from({ length: boardSize }, () => Array(boardSize).fill(Infinity));
    const fScore = Array.from({ length: boardSize }, () => Array(boardSize).fill(Infinity));

    gScore[start.row][start.col] = 0;
    fScore[start.row][start.col] = heuristic(start, goalRow);

    openSet.enqueue(start, fScore[start.row][start.col]);

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();

        const { row, col } = current;

        if (row === goalRow) {
            // Continue even after finding a path, we will find all paths later
            continue;
        }

        visited[row][col] = true;

        const possibleMoves = getPossibleMoveActions(row, col, players, walls, initialPlayer);
        
        for (const move of possibleMoves) {
            const newRow = move.row;
            const newCol = move.col;

            if (visited[newRow][newCol]) continue; // Skip already visited nodes

            const tentativeGScore = gScore[row][col] + 1; // Each move has a cost of 1

            if (tentativeGScore <= gScore[newRow][newCol]) {
                // If this path is strictly better
                if (tentativeGScore < gScore[newRow][newCol]) {
                    gScore[newRow][newCol] = tentativeGScore;
                    fScore[newRow][newCol] = gScore[newRow][newCol] + heuristic({ row: newRow, col: newCol }, goalRow);
                    openSet.enqueue({ row: newRow, col: newCol }, fScore[newRow][newCol]);
                    
                    // Clear previously stored paths since this is a better path
                    previous[newRow][newCol] = [];
                }
            
                // Whether it's better or equally good, store the new path
                previous[newRow][newCol].push({ row, col });
            }
        }
    }

    return reconstructAllPaths(previous, { row: goalRow, col: start.col }, start);
};


// Function to reconstruct all paths from the start to the goal
const reconstructAllPaths = (previous, goal, start) => {
    const paths = [];
    const currentPath = [];

    const dfs = (node) => {
        currentPath.push(node);

        if (node.row === start.row && node.col === start.col) {
            paths.push([...currentPath].reverse());
        } else {
            for (const prev of previous[node.row][node.col]) {
                dfs(prev);
            }
        }

        currentPath.pop();
    };

    dfs(goal);
    return paths;
};