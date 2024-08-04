from flask import Flask, request, jsonify
from flask_cors import CORS
from Logic import *
import torch

app = Flask(__name__)
CORS(app)  # CORS'u etkinleştir
AI = torch.load("Model.pth")


@app.route('/update-state', methods=['POST'])
def update_state():
    data = request.json
    maze, players = organise_data(data)
    walls = convertMazeToWalls(maze)

    playerX = players[0]['position']['col']
    playerY = players[0]['position']['row']

    opponentX = players[1]['position']['row']
    opponentY = players[1]['position']['row']

    playerPawn = Pawn("Player", playerX, playerY, maze)
    opponentPawn = Pawn("Player", opponentX, opponentY, maze)

    playerPawn.setOpponent(opponentPawn)
    opponentPawn.setOpponent(playerPawn)

    state = get_state(opponentPawn, playerPawn, walls)
    action = get_action(AI, state, playerPawn, opponentPawn)
    
    return jsonify(action)

@app.route('/get_string', methods=['GET'])
def get_string():
    data = "Merhaba, bu bir test mesajıdır!"
    return jsonify({"message": data})

if __name__ == '__main__':
    app.run(debug=True)
    

