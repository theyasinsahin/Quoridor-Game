from Pawn import Pawn, Direction
import random
import torch
import torch.nn as nn
import torch.nn.functional as F


class QLinearNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(68, 256)
        self.layer2 = nn.Linear(256, 512)
        self.layer3 = nn.Linear(512, 256)
        self.layer4 = nn.Linear(256, 16)

    def forward(self, x):
        x = F.relu(self.layer1(x))
        x = F.relu(self.layer2(x))
        x = F.relu(self.layer3(x))
        x = F.sigmoid(self.layer4(x))
        return x

def get_state(pawn, opponent, activeWalls):
    """
    Will Return State that Contain:
    Current Location
    Opponent Location
    Distance to target
    Opponent's distance to target
    Remaining Walls of Opponent
    Remaining Walls
    Active Walls
    """
    activeWalls = [*activeWalls] + [(-1, -1, -1)] * (20 - len(activeWalls))
    activeWalls = [j for i in activeWalls for j in i]
    state = [pawn.x, pawn.y,
             opponent.x, opponent.y,
             pawn.closestPathLength(),
             opponent.closestPathLength(),
             pawn.remainingWalls,
             opponent.remainingWalls,
             *activeWalls]
    return state


def get_action(model, state, playerPawn, opponentPawn):
    """
     ---ActionSet
     --Move()
     -PossibleMoves
     --PlaceWall
     -WallID'S
    """
    """
    --ActionSet in Binary
    0,1 = Move X
    2 = Move X + or -
    3,4 = Move Y
    5 = Move Y + or -
    6, 7, 8, 9 = PlaceWall X
    10, 11, 12, 13 = PlaceWall Y
    14 = PlaceWall Alignment
    15 = Decision Between Move and PlaceWall"""
    state0 = torch.tensor(state, dtype=torch.float)

    prediction = model(state0).tolist()
    prediction = list(map(lambda x: "1" if x >= 0.5 else "0", prediction))
    if prediction[-1]:
        move_x = int("".join(prediction[:2]) * 1 if prediction[2] else -1, 2)
        move_y = int("".join(prediction[3:5]) * 1 if prediction[5] else -1, 2)
        action = [move_x, move_y]
    else:
        wall_x = int("".join(prediction[6:10]), 2)
        wall_y = int("".join(prediction[10:14]), 2)
        alg = int(prediction[14])
        action = (wall_x, wall_y, alg)
    if len(action) == 2:
        try:
            Direction(action)
        except ValueError:
            print(action)
            print("Fuck1")
            return randomMove(playerPawn, opponentPawn, "Move")
        moves = list(map(lambda x: x.value, opponentPawn.possibleMoves()))
        print(moves)
        if action not in moves:
            print(action)
            print("Fuck2")
            return randomMove(playerPawn, opponentPawn, "Move")
    else:
        walls = opponentPawn.possibleWalls()
        wallLeft = opponentPawn.remainingWalls
        if action not in walls or wallLeft < 0:
            print(action)
            print("Fuck3")
            return randomMove(playerPawn, opponentPawn, "Wall")
        else:
            playerPawn.placeWall(action)
            if not (playerPawn.canReachEnd() and opponentPawn.canReachEnd()):
                playerPawn.removeWall(action)
                print(action)
                print("Fuck4")
                return randomMove(playerPawn, opponentPawn, "Wall")
            playerPawn.removeWall(action)
    return action

def randomMove(playerPawn, opponentPawn, actionType):
    if actionType == "Move":
        return random.choice(playerPawn.possibleMoves()).value
    action = random.choice(playerPawn.possibleWalls())
    playerPawn.placeWall(action)
    while not (playerPawn.canReachEnd() and opponentPawn.canReachEnd()):
        playerPawn.removeWall(action)
        action = random.choice(playerPawn.possibleWalls())
    return action


def organise_data(result):
        # Initialize the walls array with all zeros
        maze = [[[0, 0] for _ in range(9)] for _ in range(9)]

        # Process the clicked walls and update the walls array
        for wall in result['clickedWalls']:
            if wall.startswith('hwall'):
                _, row, col = wall.split('-')
                row, col = int(row), int(col)
                maze[row][col][1] = 1
            elif wall.startswith('vwall'):
                _, row, col = wall.split('-')
                row, col = int(row), int(col)
                maze[row][col][0] = 1

        # Retrieve the players information
        players = result['players']

        return maze, players

def convertMazeToWalls(maze):
    walls = list()
    maze = list(maze)
    for i in range(len(maze) - 1):
        for j in range(len(maze[i]) - 1):
            if maze[i][j][0] == maze[i + 1][j][0] == 1:
                maze[i][j][0] = 0
                maze[i + 1][j][0] = 0
                walls.append((i, j, 0))
            if maze[i][j][1] == maze[i][j + 1][1] == 1:
                maze[i][j][1] = 0
                maze[i][j + 1][1] = 0
                walls.append((i, j, 1))
    return walls