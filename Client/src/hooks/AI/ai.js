import GameLogic from "../gameLogic";
//import MNode from "./MNode";
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
        const {bfs} = GameLogic(boardSize);
        // heuristic:
        // for first move of each pawn
        // go forward if possible

        if(state.turn < 2){
            const shortestWayforPlayer2 = bfs(state.players[0].position, state.players[0].goalRow, boardSize, state.clickedWalls);
            const nextPosition = shortestWayforPlayer2[1];

            return{type: "move", col: nextPosition.col, row: nextPosition.row};
        }

    }
}

export default AI;