import { bfs } from '../../hooks/BFS/BfsLogic';
import { isValidMove, isWallBlockingMove, findBestWall } from '../../hooks/GameLogic/someLogics';
import { TreeNode } from './TreeNode';

const _ = require('lodash');  // CommonJS (Node.js)

const BOARD_SIZE = 9;

class MonteCarloTreeSearch{
    constructor(state, uctConst){
        this.root = new TreeNode(null, null, this.uctConst);
        this.state = state;
        this.uctConst = uctConst;
        this.totalNumOfSims = 0;
    }

    search(numOfSims){
        const uctConst = this.uctConst;

        let currentNode = this.root;
        const limitOfTotalNumOfSims = this.totalNumOfSims + numOfSims;
        
      
        while(this.totalNumOfSims < limitOfTotalNumOfSims) {
            // Selection // Ağacı gezerek bir yaprak düğüm bulur.
            if(currentNode.isTerminal){
                this.rollout(currentNode);
                currentNode = this.root;
            } else if (currentNode.isLeaf){
                if(currentNode.isNew){
                    this.rollout(currentNode);
                } else {
                    // Expansion // Seçilen yaprak düğümüne yeni çocuk düğüm ekler
                    const simulationGame = this.getSimulationGameAtNode(currentNode);
                    let currentPlayer = simulationGame.players.find(player => player.name === simulationGame.initialPlayer);
                    let opponentPlayer = simulationGame.players.find(player => player.name !== simulationGame.initialPlayer);

                    let move, childNode;
                    //const moves = getPossibleMoveActions(simulationGame);
                    const bestPaths = bfsAllShortestPaths(currentPlayer.position, currentPlayer.goalRow, BOARD_SIZE, simulationGame.clickedWalls);
                    for (let i = 0; i < bestPaths.length; i++) {
                        move = {type: "move", row:bestPaths[i][0][1].row, col: bestPaths[i][0][1].col};
                        childNode = new TreeNode(move, currentNode, uctConst);
                        currentNode.addChild(childNode);
                    }
                    const walls = getPossibleWallActions(simulationGame);
                    const bestWalls = findAllBestWalls(opponentPlayer, simulationGame.players, bestPaths[0], walls, simulationGame.clickedWalls);
                    if(currentPlayer.wallsLeft > 0){
                        for (let i = 0; i < bestWalls.length; i++) {
                            move = bestWalls[i];
                            childNode = new TreeNode(move, currentNode, uctConst);
                            currentNode.addChild(childNode);
                        }
                    }
                    this.rollout(randomChoice(currentNode.children));
                }
            }else {
                currentNode = currentNode.maxUCTChild;
            }
        }
    }

    selectBestMove(){
        const best = this.root.maxSimsChild;
        return {move: best.move, winRate: best.winRate};
    }

    rollout(node){
        this.totalNumOfSims++;
        const simulationGame = this.getSimulationGameAtNode(node);

        // the pawn of this node is the pawn who moved immediately before,
        const nodePawn = simulationGame.initialPlayer === 'player1' ? simulationGame.players[0] : simulationGame.players[1];

        if((simulationGame.players[0].position.row === simulationGame.players[0].goalRow) || simulationGame.players[1].position.row === simulationGame.players[1].goalRow){
            node.isTerminal = true;
        }
  
        while(!((simulationGame.players[0].position.row === simulationGame.players[0].goalRow) || (simulationGame.players[1].position.row === simulationGame.players[1].goalRow))){
            const moves = getPossibleMoveActions(simulationGame);

            const walls = getPossibleWallActions(simulationGame);
            const currentPlayer = simulationGame.initialPlayer === 'player1' ? simulationGame.players[0] : simulationGame.players[1];
            const opponentPlayer = simulationGame.initialPlayer === 'player1' ? simulationGame.players[1] : simulationGame.players[0];
            
            const currentPlayerWay = bfs(currentPlayer.position, currentPlayer.goalRow, BOARD_SIZE, simulationGame.clickedWalls)
            const opponentPlayerWay = bfs(opponentPlayer.position, opponentPlayer.goalRow, BOARD_SIZE, simulationGame.clickedWalls)
            const currentPlayerDist = currentPlayer.length;
            const opponentPlayerDist = opponentPlayer.length;
            

            if (currentPlayerDist < opponentPlayerDist) {
                let bestAction = null;
                let shortestDistance = Infinity;
                moves.forEach(possibleMoveAction => {
                    // Simulate the move
                    const newPosition = { row: possibleMoveAction.row, col: possibleMoveAction.col };
                    const newDistance = bfs(newPosition, currentPlayer.goalRow, BOARD_SIZE, simulationGame.clickedWalls).length;
        
                    if (newDistance < shortestDistance) {
                        shortestDistance = newDistance;
                        bestAction = possibleMoveAction;
                    }
                });
                const action = { type: "move", col: bestAction.col, row: bestAction.row };
                this.getAction(simulationGame, action);
            } else {
                const bestWall = findBestWall(opponentPlayer, simulationGame.players, opponentPlayerWay, walls, simulationGame.clickedWalls, bfs);
                if (bestWall) {
                    const action = { type: "wall", orientation: bestWall.orientation, id: bestWall.id };
                    this.getAction(simulationGame, action);
                } else {
                    // If no valid wall placement found, move instead
                    let shortestDistance = Infinity;
                    let bestAction = null;
                    moves.forEach(possibleMoveAction => {
                        // Simulate the move
                        const newPosition = { row: possibleMoveAction.row, col: possibleMoveAction.col };
                        const newDistance = bfs(newPosition, currentPlayer.goalRow, BOARD_SIZE, simulationGame.clickedWalls).length;
        
                        if (newDistance < shortestDistance) {
                            shortestDistance = newDistance;
                            bestAction = possibleMoveAction;
                        }
                    });
                    const action = { type: "move", col: bestAction.col, row: bestAction.row };
                    this.getAction(simulationGame, action);
                }
            }
        }

        // Backpropagation
        let ancestor = node;
        let ancestorPawnIndex = nodePawn.name === 'player1' ? 0:1;
        const { players } = simulationGame;
        const winner = players.find(player => player.position.row === player.goalRow);
        while(ancestor !== null){
            ancestor.numSims++;
            
            let winnerIndex;
            if(winner){
                winnerIndex = winner.name === 'player1' ? 0:1;
            }
            if(winnerIndex === ancestorPawnIndex) {
                ancestor.numWins += 1;
            }
            ancestor = ancestor.parent;
            ancestorPawnIndex = (ancestorPawnIndex+1) % 2; 
        }
    }

    getSimulationGameAtNode(node){
        const simulationGame = _.cloneDeep(this.state);
        const stack = [];

        let ancestor = node;
        while(ancestor.parent !== null){
            stack.push(ancestor.move);
            ancestor = ancestor.parent;
        }

        while(stack.length > 0){
            const move = stack.pop();
            this.getAction(simulationGame, move);
        }

        return simulationGame;
    }
    
    
    getAction(simulationGame, action){
        let currentPlayer = simulationGame.players.find(player => player.name === simulationGame.initialPlayer);
    
        // Move Part
        if(action.type === "move"){
            if(currentPlayer.name === "player1"){
                simulationGame.players[0].position = {row: action.row, col: action.col};
            }else if(currentPlayer.name === "player2"){
                simulationGame.players[1].position = {row: action.row, col: action.col};
            }
        }
        // Wall Part
        else if(action.type === "wall"){
            const parts = action.id.split('-');
            const row = parseInt(parts[1], 10);
            const col = parseInt(parts[2], 10);
            const spaceId = `space-${row}-${col}`;
            if(action.orientation === "vertical"){
                const belowWall = `vwall-${row + 1}-${col}`;
                simulationGame.clickedWalls.push(action.id);
                simulationGame.clickedWalls.push(belowWall);
    
                simulationGame.clickedSpaces.push(spaceId);
    
            }else if(action.orientation === "horizontal"){
                const nextWall = `hwall-${row}-${col + 1}`;
                simulationGame.clickedWalls.push(action.id);
                simulationGame.clickedWalls.push(nextWall);
    
                simulationGame.clickedSpaces.push(spaceId);
    
            }
    
    
            if(currentPlayer.name === "player1"){
                simulationGame.players[0].wallsLeft -= 1;
            }else if(currentPlayer.name === "player2"){
                simulationGame.players[1].wallsLeft -= 1;
            }
        }

        simulationGame.initialPlayer = simulationGame.initialPlayer === 'player1' ? 'player2' : 'player1';
    }
}


class AI {
    constructor(numOfMCTSSims, uctConst, forWorker = false){
        this.numOfMCTSSims = numOfMCTSSims;
        this.uctConst = uctConst;
        this.forWorker = forWorker;
    }

    chooseNextMove(state){
        const d0 = new Date();
        const currentPlayer = state.players.find((player) => player.name === state.initialPlayer);
        const opponentPlayer = state.players.find((player) => player.name !== state.initialPlayer);
        const currentPlayerWay = bfs(currentPlayer.position, currentPlayer.goalRow, BOARD_SIZE, state.clickedWalls);

        const possibleWallActions = getPossibleWallActions(state);
       
        // heuristic:
        // for first move of each pawn
        // make move to best option
        if(state.turn < 3){
            const position = currentPlayer.shortestWay[1]; // Because shortestWay[0] is start position

            return {type: "move", row: position.row, col: position.col};
        }
        
        // heuristic: common openings
        if (state.turn < 6 && opponentPlayer.position.col === 4 && opponentPlayer.position.row === 6 && Math.random() < 0.5) {
            console.log("heuristic");
            const bestMoves = [
                {type:"wall", id:"hwall-5-3", orientation:"horizontal"},
                {type:"wall", id:"hwall-5-4", orientation:"horizontal"},
                {type:"wall", id:"vwall-4-3", orientation:"vertical"},
                {type:"wall", id:"vwall-4-4", orientation:"vertical"}
            ];
            return randomChoice(bestMoves); 
        }
        if (state.turn < 6 && opponentPlayer.position.col === 4 && opponentPlayer.position.row === 2 && Math.random() < 0.5) {
            console.log("heuristic");
            const bestMoves = [
                {type:"wall", id:"hwall-2-3", orientation:"horizontal"},
                {type:"wall", id:"hwall-2-4", orientation:"horizontal"},
                {type:"wall", id:"vwall-3-3", orientation:"vertical"},
                {type:"wall", id:"vwall-3-4", orientation:"vertical"}
            ];
            return randomChoice(bestMoves); 
        }

        // heuristic: if opponent's wall over and AI's path shorter than opponent, move to shortest way
        if(opponentPlayer.wallsLeft === 0 && currentPlayer.shortestWay < opponentPlayer.shortestWay){
            const position = bfs(currentPlayer.position,currentPlayer.goalRow, BOARD_SIZE, state.clickedWalls)[1]; // Because shortestWay[0] is start position
            return {type: "move", row: position.row, col: position.col};
        }




        const mcts = new MonteCarloTreeSearch(state, this.uctConst);

        //Simulation Start
        const nSearch = 200; // Simülasyon işleminin kaça bölünerek yapılacağını belirtir.
        const nBatch = Math.ceil(this.numOfMCTSSims / nSearch) // Her bir döngüde yapılacak simülasyon sayısı
        //postMessage(0); // Döngünün başladığını haber verir.
        for (let i = 0; i < nBatch; i++) {
            mcts.search(nBatch);
            //console.log("Searh'ün", (nSearch/nBatch), "kadarı tamamlandı");
            //postMessage((i+1)/nSearch); işlemdeki ilerlemeyi haberdar eder
        }

        console.log("mcts.selectBestMove çalıştırılacak");
        const best = mcts.selectBestMove();
        let bestMove = best.move;
        const winRate = best.winRate;

        const d1 = new Date();
        const uctConst = mcts.root.children[0].uctConst;
        console.log(`time taken by AI for ${(this.numOfMCTSSimulations)} rollouts, c=${(uctConst)}: ${(d1.getTime() - d0.getTime())/1000} sec`);
    
        console.log(`estimated AI win rate: ${winRate}`);
        console.log(bestMove);
        return bestMove;
    }

    randomMove(possibleActions, player){
        // Objeyi birleştirmek ve düz bir dizi elde etmek
        if(player.wallsLeft > 0){
            const allActions = Object.values(possibleActions).flat();

            const randomAction = randomChoice(allActions);
    
            if(randomAction.type === "move"){
                return {type: "move", row: randomAction.row, col: randomAction.col};
            }else{
                console.log("random move part ",randomAction);
                return {type: "wall", id: randomAction.id, orientation: randomAction.orientation};
            }
        }

        const randomAction = randomChoice(possibleActions.moves);

        return {type: "move", row: randomAction.row, col: randomAction.col};  
    }

}


function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

///////////// Some Logic Functions
const getPossibleMoveActions = (state) => {
    const { initialPlayer, players, clickedWalls } = state;
   
    const currentPlayer = players.find((player) => player.name === initialPlayer);
    const rowIndex = currentPlayer.position.row
    const colIndex = currentPlayer.position.col


    const possibleMoveArray = [];


        const addToPossibleMoveArray = (row, col) => {
            if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && isValidMove(rowIndex, colIndex, row, col, clickedWalls)) {
                possibleMoveArray.push({ row, col });
            }
        };

        const checkAdjacentPlayer = (row, col) => {
            return players.some((player) => player.position.row === row && player.position.col === col && player.name !== initialPlayer);
        };

        // Up
        if (rowIndex > 0 && isValidMove(rowIndex, colIndex, rowIndex - 1, colIndex, clickedWalls) && !isWallBlockingMove(rowIndex, colIndex, rowIndex - 1, colIndex, clickedWalls)) {
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
        if (rowIndex < BOARD_SIZE - 1 && isValidMove(rowIndex, colIndex, rowIndex + 1, colIndex, clickedWalls) && !isWallBlockingMove(rowIndex, colIndex, rowIndex+1,colIndex,clickedWalls)) {
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
        if (colIndex < BOARD_SIZE - 1 && isValidMove(rowIndex, colIndex, rowIndex, colIndex + 1, clickedWalls) && !isWallBlockingMove(rowIndex, colIndex, rowIndex, colIndex + 1,clickedWalls)) {
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

const getPossibleWallActions = (state) => {
    let player = state.players.find(player => player.name === state.initialPlayer);
    const {clickedWalls, clickedSpaces} = state;

    const possibleWallActions = []; 
    // Generate possible wall actions 
    if(player.wallsLeft>0){       
        for (let row = 0; row < BOARD_SIZE - 1; row++) {
            for (let col = 0; col < BOARD_SIZE - 1; col++) {
                const vwallId = `vwall-${row}-${col}`;
                const vBelowWallId = `vwall-${row+1}-${col}`;
                const hwallId = `hwall-${row}-${col}`;
                const hNextWallId = `hwall-${row}-${col+1}`;
                const spaceId = `space-${row}-${col}`;

                if (!clickedWalls.includes(vwallId) && !clickedWalls.includes(vBelowWallId) && !clickedSpaces.includes(spaceId)) {
                    clickedWalls.push(vwallId);
                    clickedWalls.push(vBelowWallId);
                    if(bfs(player.position, player.goalRow, BOARD_SIZE, clickedWalls).length>0){
                        possibleWallActions.push({ type: 'wall', id: vwallId, orientation: 'vertical' });
                    }
                    clickedWalls.pop();
                    clickedWalls.pop();
                }

                if (!clickedWalls.includes(hwallId) && !clickedWalls.includes(hNextWallId) && !clickedSpaces.includes(spaceId)) {
                    clickedWalls.push(hwallId);
                    clickedWalls.push(hNextWallId);
                    if(bfs(player.position, player.goalRow, BOARD_SIZE, clickedWalls).length>0){
                        possibleWallActions.push({ type: 'wall', id: hwallId, orientation: 'horizontal' });
                    }
                    clickedWalls.pop();
                    clickedWalls.pop();
                }
            }
        }
    }
    return possibleWallActions;
}

const bfsAllShortestPaths = (start, goalRow, boardSize, walls) => {
    const directions = [
        { row: -1, col: 0 }, // up
        { row: 1, col: 0 },  // down
        { row: 0, col: -1 }, // left
        { row: 0, col: 1 }   // right
    ];

    const queue = [start];
    const visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
    const distance = Array.from({ length: boardSize }, () => Array(boardSize).fill(Infinity));
    const previous = {}; // Object to store previous positions for multiple paths

    visited[start.row][start.col] = true;
    distance[start.row][start.col] = 0;
    previous[`${start.row},${start.col}`] = [];

    let shortestPaths = [];
    let minDistance = Infinity;

    while (queue.length > 0) {
        const { row, col } = queue.shift();

        if (row === goalRow) {
            if (distance[row][col] < minDistance) {
                minDistance = distance[row][col];
                shortestPaths = []; // Clear paths since we're focusing on shortest ones
            }
            if (distance[row][col] === minDistance) {
                shortestPaths.push(reconstructPathForAllPaths(previous, start, { row, col })); // Collect path
            }
            continue; // Continue to explore other nodes
        }

        for (const direction of directions) {
            const newRow = row + direction.row;
            const newCol = col + direction.col;

            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && !visited[newRow][newCol]) {
                if (!isWallBlockingMove(row, col, newRow, newCol, walls) && isValidMove(row, col, newRow, newCol, walls)) {
                    const newDistance = distance[row][col] + 1;

                    if (newDistance <= distance[newRow][newCol]) {
                        if (newDistance < distance[newRow][newCol]) {
                            queue.push({ row: newRow, col: newCol });
                            visited[newRow][newCol] = true;
                        }

                        distance[newRow][newCol] = newDistance;

                        if (!previous[`${newRow},${newCol}`]) {
                            previous[`${newRow},${newCol}`] = [];
                        }

                        previous[`${newRow},${newCol}`].push({ row, col }); // Track all possible previous positions
                    }
                }
            }
        }
    }

    return shortestPaths; // Return all the shortest paths found
};

// Function to reconstruct paths (handles multiple previous nodes)
const reconstructPathForAllPaths = (previous, start, goal) => {
    const paths = [];
    const stack = [[goal, []]]; // Stack to backtrack paths

    while (stack.length > 0) {
        const [current, path] = stack.pop();
        const newPath = [current, ...path];

        if (current.row === start.row && current.col === start.col) {
            paths.push(newPath); // If we've reached the start, save the path
        } else if (previous[`${current.row},${current.col}`]) {
            for (const prev of previous[`${current.row},${current.col}`]) {
                stack.push([prev, newPath]); // Continue backtracking
            }
        }
    }

    return paths;
};



const findAllBestWalls = (player, players, playerWay, possibleWallActions, clickedWalls) => {
    let AllBestWalls = [];
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
                
                while(AllBestWalls.length>0){
                    AllBestWalls.pop();
                }
                
                AllBestWalls.push(wall);
            }else if(extension === maxExtension){
                AllBestWalls.push(wall);
            }
        }

        clickedWalls.pop();
        clickedWalls.pop();
    });

    return AllBestWalls;
};

const simulateWallEffect = (player, walls) => {
    // Simulate placing the wall and calculate the new shortest path for the opponent
    const start = player.position;
    const newWay = bfs(start, player.goalRow, BOARD_SIZE, walls);

    return newWay;
};

const isValidWallPlacement = (players, walls) => {
    const player1 = players[0];
    const player2 = players[1];

    // Check if both players have a valid path to their respective goals
    const path1 = bfs(player1.position, player1.goalRow, BOARD_SIZE, walls);
    const path2 = bfs(player2.position, player2.goalRow, BOARD_SIZE, walls);

    return path1.length > 0 && path2.length > 0;
};

export default AI;