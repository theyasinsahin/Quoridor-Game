from Pawn import Pawn
from Logic import *
import torch

# AI
AI = QLinearNet()
AI.load_state_dict(torch.load("Model.pth", weights_only=False))
AI.eval()
# Game Elements
maze = [[[0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]]
walls = convertMazeToWalls(maze)

playerX = 4
playerY = 0
playerWall = 10
opponentX = 4
opponentY = 8
opponentWall = 10

playerPawn = Pawn("Player", playerX, playerY, maze)
opponentPawn = Pawn("Player", opponentX, opponentY, maze)
playerPawn.remainingWalls = playerWall
opponentPawn.remainingWalls = opponentWall
playerPawn.setOpponent(opponentPawn)
opponentPawn.setOpponent(playerPawn)

state = get_state(opponentPawn, playerPawn, walls)
action = get_action(AI, state, playerPawn, opponentPawn)
action = list(action)
if len(action) == 2:
    action[0] += playerX
    action[1] += playerY
action[0], action[1] = action[1], action[0]
