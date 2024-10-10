import { bfs } from "../BFS/BfsLogic";

////////////// VALID MOVES
export const isWallBlockingMove = (row, col, newRow, newCol, walls) => {
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
export const isValidMove = (currentRow, currentCol, targetRow, targetCol, clickedWalls) => {

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

export const findBestWall = (player, players, playerWay, possibleWallActions, clickedWalls) => {
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

        if (isValidWallPlacement(players, clickedWalls)) {
            const extendedPath = simulateWallEffect(player, clickedWalls);
            const extension = extendedPath.length - playerWay.length;

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

const isValidWallPlacement = (players, walls) => {
    const boardSize = 9;
    const player1 = players[0];
    const player2 = players[1];

    // Check if both players have a valid path to their respective goals
    const path1 = bfs(player1.position, player1.goalRow, boardSize, walls);
    const path2 = bfs(player2.position, player2.goalRow, boardSize, walls);

    return path1.length > 0 && path2.length > 0;
};

const simulateWallEffect = (player, walls) => {
    const boardSize = 9;
    // Simulate placing the wall and calculate the new shortest path for the opponent
    const start = player.position;
    const newWay = bfs(start, player.goalRow, boardSize, walls);

    return newWay;
};