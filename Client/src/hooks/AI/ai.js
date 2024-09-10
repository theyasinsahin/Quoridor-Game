const _ = require('lodash');  // CommonJS (Node.js)


const BOARD_SIZE = 9;

class TreeNode {
    constructor(move, parent, uctConst){
        this.numWins = 0;
        this.numSims = 0;
        this.children = [];
        this.isTerminal = false;
        this.parent = parent;
        this.move = move;
        this.uctConst = uctConst;
    }


    get isLeaf() {
        return this.children.length === 0;
    }

    get isNew() {
        return this.numSims === 0;
    }

    // References: 
    // Levente Kocsis, Csaba Szepesva ́ri (2006 ) "Bandit based Monte-Carlo Planning"
    // Peter Auer, Cesa-Bianchi, Fischer (2002) "Finite-time Analysis of the Multiarmed Bandit Problem"
    // Do google search for "monte carlo tree search uct"
    get uct() {
        if (this.parent === null || this.parent.numSims === 0) {
            throw "UCT_ERROR"
        }
        if (this.numSims === 0) {
            return Infinity;
        }
        return (this.numWins / this.numSims) + Math.sqrt((this.uctConst * Math.log(this.parent.numSims)) / this.numSims);
    }

    get winRate() {
        return this.numWins / this.numSims;
    }

    get maxUCTChild() {
        let maxUCTIndices;
        let maxUCT = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            const uct = this.children[i].uct;
            if (uct > maxUCT) {
                maxUCT = uct;
                maxUCTIndices = [i];  
            } else if (uct === maxUCT) {
                maxUCTIndices.push(i);
            }
        }
        const maxUCTIndex = randomChoice(maxUCTIndices);
        //const maxUCTIndex = maxUCTIndices[0];
        return this.children[maxUCTIndex];
    }

    get maxWinRateChild(){
        let maxWinRateChildIdx;
        let maxWinRate = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            if(maxWinRate < this.children[i].winRate){
                maxWinRate = this.children[i].winRate;
                maxWinRateChildIdx = i;
            }
        }
        return this.children[maxWinRateChildIdx];
    }

    get maxSimsChild(){
        let maxSimsChildIdx;
        let maxSims = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            if(maxSims < this.children[i].numSims){
                maxSims = this.children[i].numSims;
                maxSimsChildIdx = i;
            }
        }
        return this.children[maxSimsChildIdx];
    }

    addChild(childNode){
        this.children.push(childNode);
    }

    printChildren() {
        for (let i = 0; i < this.children.length; i++) {
            console.log(`children[${i}].move: ${this.children[i].move}`);
        }
    }
}

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
                    let move, childNode;
                    const moves = getPossibleMoveActions(this.state);
                    for (let i = 0; i < moves.length; i++) {
                        move = {type: "move", row:moves[i].row, col: moves[i].col};
                        childNode = new TreeNode(move, currentNode, uctConst);
                        currentNode.addChild(childNode);
                    }
                    const walls = getPossibleWallActions(this.state);
                    let currentPlayer = simulationGame.players.find(player => player.name === simulationGame.initialPlayer);

                    if(currentPlayer.wallsLeft > 0){
                        for (let i = 0; i < walls.length; i++) {
                            move = walls[i];
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
            
            
            if(currentPlayer.wallsLeft > 0){
                if(Math.random() < 0.6){ //60% ihtimalle hareket edecek
                    const movePosition = randomChoice(moves);
                    const action = {type: "move", row: movePosition.row, col: movePosition.col};
                    this.getAction(simulationGame, action);
                    
                }else{
                    let action = randomChoice(walls);
                    if(action){
                        this.getAction(simulationGame, action);
                    }else{
                        const movePosition = randomChoice(moves);
                        action = {type: "move", row: movePosition.row, col: movePosition.col};
                        this.getAction(simulationGame, action);
                    }
                    
                }
            }else{
                const movePosition = randomChoice(moves);
                const action = {type: "move", row: movePosition.row, col: movePosition.col};
                this.getAction(simulationGame, action);
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
            //console.log("Search'ün yüzde ", i+1, "kadarı tamamlandı");
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

const findBestWall = (player, players, playerWay, possibleWallActions, clickedWalls, bfs) => {
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

        if (isValidWallPlacement(players, clickedWalls, bfs)) {
            const extendedPath = simulateWallEffect(player, clickedWalls, bfs);
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

const simulateWallEffect = (player, walls, bfs) => {
    // Simulate placing the wall and calculate the new shortest path for the opponent
    const start = player.position;
    const newWay = bfs(start, player.goalRow, BOARD_SIZE, walls);

    return newWay;
};

const isValidWallPlacement = (players, walls, bfs) => {
    const player1 = players[0];
    const player2 = players[1];

    // Check if both players have a valid path to their respective goals
    const path1 = bfs(player1.position, player1.goalRow, BOARD_SIZE, walls);
    const path2 = bfs(player2.position, player2.goalRow, BOARD_SIZE, walls);

    return path1.length > 0 && path2.length > 0;
};

export default AI;