from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # CORS'u etkinleştir

def orginase_datas(result):
        # Initialize the walls array with all zeros
        walls = [[[0, 0] for _ in range(9)] for _ in range(9)]

        # Process the clicked walls and update the walls array
        for wall in result['clickedWalls']:
            if wall.startswith('hwall'):
                _, row, col = wall.split('-')
                row, col = int(row), int(col)
                walls[row][col][1] = 1
            elif wall.startswith('vwall'):
                _, row, col = wall.split('-')
                row, col = int(row), int(col)
                walls[row][col][0] = 1

        # Retrieve the players information
        players = result['players']

        return walls, players

@app.route('/update-state', methods=['POST'])
def update_state():
    data = request.json
    clicked_walls = data.get('clickedWalls')
    players = data.get('players')

    result = {'clickedWalls': clicked_walls, 'players': players}
    
    return jsonify(orginase_datas(result))

@app.route('/get_string', methods=['GET'])
def get_string():
    data = "Merhaba, bu bir test mesajıdır!"
    return jsonify({"message": data})

if __name__ == '__main__':
    app.run(debug=True)
    

