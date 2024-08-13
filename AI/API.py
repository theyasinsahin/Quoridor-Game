from flask import Flask, request, jsonify
from flask_cors import CORS
from Logic import *
from BotLogic import *
import torch

app = Flask(__name__)
CORS(app)  # CORS'u etkinleştir


"""  AI  """
AI = QLinearNet()
AI.load_state_dict(torch.load("Model.pth", weights_only=False))
AI.eval()

@app.route('/update-state', methods=['POST'])
def update_state():
    data = request.json
    maze, players, walls = organise_data(data)

    playerX = players[0]['position']['col']
    playerY = players[0]['position']['row']
    playerWall = players[0]['wallsLeft']

    opponentX = players[1]['position']['col']
    opponentY = players[1]['position']['row']
    opponentWall = players[1]['wallsLeft']

    playerPawn = Pawn("Player", playerX, playerY, maze)  # Red
    playerPawn.remainingWalls = playerWall
    opponentPawn = Pawn("Opponent", opponentX, opponentY, maze)  # Blue
    opponentPawn.remainingWalls = opponentWall

    playerPawn.setOpponent(opponentPawn)
    opponentPawn.setOpponent(playerPawn)

    state = get_state(playerPawn, opponentPawn, walls)
    action = get_action(AI, state, playerPawn, opponentPawn)
    action = list(action)
    if len(action) == 2:
        action[0] += playerX
        action[1] += playerY
    action[0], action[1] = action[1], action[0]
    return jsonify(action)


@app.route('/get_string', methods=['GET'])
def get_string():
    data = "Merhaba, bu bir test mesajıdır!"
    return jsonify({"message": data})


if __name__ == '__main__':
    app.run(debug=True)
