import { bfs } from "../../hooks/BFS/BfsLogic";
import { findBestWall } from "../../hooks/GameLogic/someLogics";


const actionCalculate = (state) => {
    const boardSize = 9;
    const player1 = state.players[0];
    const player2 = state.players[1];
    const possibleWallActions = state.possibleActions.putWall;
    const possibleMoveActions = state.possibleActions.moves;
 
    const clickedWalls = state.clickedWalls;
    const player1Way = player1.shortestWay;
    const player2Way = player2.shortestWay;

    const player1Dist = player1Way.length;
    const player2Dist = player2Way.length;

    console.log(state.playAs);
    if(state.playAs === 'player1'){
        if (player2Dist < player1Dist) {
            let bestAction = null;
            let shortestDistance = Infinity;
            possibleMoveActions.forEach(possibleMoveAction => {
                // Simulate the move
                const newPosition = { row: possibleMoveAction.row, col: possibleMoveAction.col };
                const newDistance = bfs(newPosition, player2.goalRow, boardSize, clickedWalls).length;
    
                if (newDistance < shortestDistance) {
                    shortestDistance = newDistance;
                    bestAction = possibleMoveAction;
                }
            });
            return { type: "move", col: bestAction.col, row: bestAction.row };
        } else {
            const bestWall = findBestWall(player1, state.players, player1Way, possibleWallActions, clickedWalls, bfs);
            if (bestWall) {
                return { type: "wall", orientation: bestWall.orientation, id: bestWall.id };
            } else {
                // If no valid wall placement found, move instead
                let shortestDistance = Infinity;
                let bestAction = null;
                possibleMoveActions.forEach(possibleMoveAction => {
                    // Simulate the move
                    const newPosition = { row: possibleMoveAction.row, col: possibleMoveAction.col };
                    const newDistance = bfs(newPosition, player2.goalRow, boardSize, clickedWalls).length;
    
                    if (newDistance < shortestDistance) {
                        shortestDistance = newDistance;
                        bestAction = possibleMoveAction;
                    }
                });
                return { type: "move", col: bestAction.col, row: bestAction.row };
            }
        }
    }else{
        if (player1Dist < player2Dist) {
            let bestAction = null;
            let shortestDistance = Infinity;
            possibleMoveActions.forEach(possibleMoveAction => {
                // Simulate the move
                const newPosition = { row: possibleMoveAction.row, col: possibleMoveAction.col };
                const newDistance = bfs(newPosition, player1.goalRow, boardSize, clickedWalls).length;
    
                if (newDistance < shortestDistance) {
                    shortestDistance = newDistance;
                    bestAction = possibleMoveAction;
                }
            });
            return { type: "move", col: bestAction.col, row: bestAction.row };
        } else {
            const bestWall = findBestWall(player2, state.players, player2Way, possibleWallActions, clickedWalls, bfs);
            if (bestWall) {
                return { type: "wall", orientation: bestWall.orientation, id: bestWall.id };
            } else {
                // If no valid wall placement found, move instead
                let shortestDistance = Infinity;
                let bestAction = null;
                possibleMoveActions.forEach(possibleMoveAction => {
                    // Simulate the move
                    const newPosition = { row: possibleMoveAction.row, col: possibleMoveAction.col };
                    const newDistance = bfs(newPosition, player1.goalRow, boardSize, clickedWalls).length;
    
                    if (newDistance < shortestDistance) {
                        shortestDistance = newDistance;
                        bestAction = possibleMoveAction;
                    }
                });
                return { type: "move", col: bestAction.col, row: bestAction.row };
            }
        }
    }
    
};







export default actionCalculate;