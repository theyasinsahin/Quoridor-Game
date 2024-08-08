import GameLogic from "./gameLogic";

const bfs = (start, goalRow, boardSize, walls) => {
    const { isWallBlockingMove } = GameLogic(9);
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

export default bfs;