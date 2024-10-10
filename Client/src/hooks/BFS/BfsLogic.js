import { isValidMove, isWallBlockingMove } from "../GameLogic/someLogics";

/////////////////  BFS ALGORITHM /////////////////////////
export const bfs = (start, goalRow, boardSize, walls) => {
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
export const reconstructPath = (previous, start, goal) => {
    const path = [];
    let current = goal;

    while (current) {
        path.unshift(current); // Add current position to the beginning of the path
        current = previous[`${current.row},${current.col}`]; // Move to the previous position
    }

    return path; // Return the reconstructed path
};

