def action_calculate(state, possibleMoveActions, possibleWallActions, clickedWalls):
    player1 = state['players'][1]
    player2 = state['players'][0]

    player1Way = player1['shortestWay']
    player2Way = player2['shortestWay']

    player1Dist = len(player1Way)
    player2Dist = len(player2Way)

    if player2Dist < player1Dist:
        bestAction = None
        shortestDistance = float('inf')

        for possibleMoveAction in possibleMoveActions:
            # Simulate the move
            newPosition = {'row': possibleMoveAction['row'], 'col': possibleMoveAction['col']}
            newDistance = len(bfs(newPosition, 8, 9, clickedWalls))
            print(newPosition,": ", newDistance)
            if newDistance < shortestDistance:
                shortestDistance = newDistance
                bestAction = possibleMoveAction

        return {'type': "move", 'col': bestAction['col'], 'row': bestAction['row']}
    else:
        best_wall = find_best_wall(state, player1Way, possibleWallActions, clickedWalls)
        if best_wall:
            return {'type': "wall", 'orientation': best_wall['orientation'], 'id': best_wall['id']}
        else:
            # If no valid wall placement found, move instead
            shortestDistance = float('inf')
            for possibleMoveAction in possibleMoveActions:
                # Simulate the move
                newPosition = {'row': possibleMoveAction['row'], 'col': possibleMoveAction['col']}
                newDistance = len(bfs(newPosition, 8, 9, clickedWalls))

                if newDistance < shortestDistance:
                    shortestDistance = newDistance
                    bestAction = possibleMoveAction

            return {'type': "move", 'col': bestAction['col'], 'row': bestAction['row']}

def find_best_wall(state, player1Way, possibleWallActions, clickedWalls):
    best_wall = None
    max_extension = 0
    for wall in possibleWallActions:
        id = wall['id']
        row_col = id.split('-')
        direction = row_col[0][0]
        row = int(row_col[1])
        col = int(row_col[2])
        
        if direction == "v":
            new_id = f"vwall-{row+1}-{col}"
        elif direction == "h":
            new_id = f"hwall-{row}-{col+1}"
        
        clickedWalls.append(id)
        clickedWalls.append(new_id)
        
        if is_valid_wall_placement(state, clickedWalls):
            extended_path = simulate_wall_effect(state, clickedWalls)
            extension = len(extended_path) - len(player1Way)

            if extension > max_extension:
                max_extension = extension
                best_wall = wall
        
        clickedWalls.pop()
        clickedWalls.pop()

    return best_wall

def is_valid_wall_placement(state, walls):
    board_size = 9
    player1 = state['players'][1]
    player2 = state['players'][0]
    goalRow1 = 0  # Player 1's goal row
    goalRow2 = board_size - 1  # Player 2's goal row
    
    # Check if both players have a valid path to their respective goals
    path1 = bfs(player1['position'], goalRow1, board_size, walls)
    path2 = bfs(player2['position'], goalRow2, board_size, walls)
    
    return bool(path1) and bool(path2)

def simulate_wall_effect(state, wall):
    # Duvarı yerleştir
    board_size = 9  # veya uygun bir board_size değeri belirleyin

    # Yeni yolu hesapla
    start = state['players'][1]['position']
    goalRow = 0  # Rakip hedef satırı
    new_way = bfs(start, goalRow, board_size, wall)
    return new_way

from collections import deque

def bfs(start, goalRow, board_size, walls):
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    queue = deque([start])
    visited = [[False] * board_size for _ in range(board_size)]
    previous = {}
    visited[start['row']][start['col']] = True

    while queue:
        current = queue.popleft()
        row, col = current['row'], current['col']

        if row == goalRow:
            return reconstruct_path(previous, start, {'row': row, 'col': col})

        for direction in directions:
            new_row, new_col = row + direction[0], col + direction[1]
            
            if (0 <= new_row < board_size and 
                0 <= new_col < board_size and 
                not visited[new_row][new_col] and 
                not is_wall_blocking_move(row, col, new_row, new_col, walls)):

                queue.append({'row': new_row, 'col': new_col})
                visited[new_row][new_col] = True
                previous[(new_row, new_col)] = (row, col)

    return []

def reconstruct_path(previous, start, goal):
    path = []
    current = (goal['row'], goal['col'])
    while current:
        path.insert(0, {'row': current[0], 'col': current[1]})
        current = previous.get(current)
    return path

def is_wall_blocking_move(row, col, new_row, new_col, walls):
    if new_row > row:
        return f'hwall-{row}-{col}' in walls
    elif new_row < row:
        return f'hwall-{new_row}-{col}' in walls
    if new_col > col:
        return f'vwall-{row}-{col}' in walls
    elif new_col < col:
        return f'vwall-{row}-{new_col}' in walls
    return False
