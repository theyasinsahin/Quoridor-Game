import axios from 'axios';
import { bfs } from './pathfinding.js'; // bfs fonksiyonunu pathfinding.js gibi bir dosyaya taşıyabilirsiniz

class Bot {
    constructor(boardSize) {
        this.boardSize = boardSize;
        this.player = { position: { row: 0, col: Math.floor(boardSize / 2) }, name: 'player2', wallsLeft: 10 };
        this.opponent = { position: { row: 8, col: Math.floor(boardSize / 2) }, name: 'player1', wallsLeft: 10 };
    }

    setPlayerState(player, opponent) {
        this.player = player;
        this.opponent = opponent;
    }

    async calculateBestMove(state) {
        const { clickedWalls } = state;
        
        const playerStart = this.player.position;
        const opponentStart = this.opponent.position;

        // Öncelikle en kısa yolu bulmak için BFS kullanarak mesafeyi hesaplayın
        const playerPath = bfs(playerStart, 8, this.boardSize, clickedWalls);
        const opponentPath = bfs(opponentStart, 0, this.boardSize, clickedWalls);

        if (!playerPath || !opponentPath) {
            throw new Error('No path to goal');
        }

        const playerDistance = playerPath.length;
        const opponentDistance = opponentPath.length;

        // En kısa mesafeye göre hareketi seçin
        if (playerDistance <= opponentDistance) {
            // Oyuncuyu hareket ettirin
            const nextMove = playerPath[1]; // İlk adım oyuncunun mevcut konumu olduğundan, ikinci adımı alın
            return ['move', nextMove.row, nextMove.col];
        } else {
            // Duvar koyarak rakibi engelleyin
            const bestWallPlacement = this.findBestWallPlacement(state);
            if (bestWallPlacement) {
                return ['wall', bestWallPlacement.row, bestWallPlacement.col, bestWallPlacement.orientation];
            } else {
                const nextMove = playerPath[1];
                return ['move', nextMove.row, nextMove.col];
            }
        }
    }

    findBestWallPlacement(state) {
        const { clickedWalls } = state;

        // Basit bir strateji ile duvar yerleştirme
        for (let row = 0; row < this.boardSize - 1; row++) {
            for (let col = 0; col < this.boardSize - 1; col++) {
                if (!clickedWalls.includes(`hwall-${row}-${col}`) && !clickedWalls.includes(`hwall-${row}-${col + 1}`)) {
                    return { row, col, orientation: 'horizontal' };
                }
                if (!clickedWalls.includes(`vwall-${row}-${col}`) && !clickedWalls.includes(`vwall-${row + 1}-${col}`)) {
                    return { row, col, orientation: 'vertical' };
                }
            }
        }

        return null;
    }

    async makeMove(state) {
        const action = await this.calculateBestMove(state);
        if (action[0] === 'move') {
            const [_, row, col] = action;
            this.movePlayer(row, col);
        } else if (action[0] === 'wall') {
            const [_, row, col, orientation] = action;
            this.placeWall(row, col, orientation);
        }
    }

    movePlayer(row, col) {
        axios.post('http://localhost:5000/move-player', { row, col })
            .then(response => {
                console.log('Player moved:', response.data);
            })
            .catch(error => {
                console.error('Error moving player:', error);
            });
    }

    placeWall(row, col, orientation) {
        axios.post('http://localhost:5000/place-wall', { row, col, orientation })
            .then(response => {
                console.log('Wall placed:', response.data);
            })
            .catch(error => {
                console.error('Error placing wall:', error);
            });
    }
}

export default Bot;
