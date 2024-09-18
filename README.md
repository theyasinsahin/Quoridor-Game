# Quoridor Game

![Quoridor Game](path_to_screenshot.png)

This is a Quoridor board game implemented using **React** with an AI player based on the **Monte Carlo Tree Search (MCTS)** algorithm. The project helped me gain a deeper understanding of React's component-based structure and demonstrated how to integrate AI into a game environment.

## Features
- **React Framework:** Built with a structured React component architecture.
- **Monte Carlo Tree Search (MCTS):** AI opponent that makes strategic decisions.
- **Breadth-First Search (BFS):** Ensures both players have a valid path to their goal, a core rule of the Quoridor game.
- **Simple Bot:** Added for a more casual gameplay experience.
- **Multiple Game Modes:** Choose between playing against another player, the AI, or a simple bot.

## Game Modes

The game offers three different modes for players:
1. **2 Player Mode:** Play against a friend on the same device.
2. **Against AI:** Challenge a more strategic AI opponent powered by the MCTS algorithm.
3. **Against Bot:** Play against a simpler bot for a relaxed gameplay experience.

## Screenshots

- **Main Menu**
  
  ![Main Menu](path_to_screenshot.png)

- **Gameplay**

  ![Gameplay](path_to_screenshot.png)

## Key Algorithms and Techniques

### Monte Carlo Tree Search (MCTS)
The **MCTS** algorithm is used to develop a sophisticated AI opponent that explores potential moves and outcomes by simulating many possible game sequences. This approach allows the AI to make statistically strong decisions during gameplay.

### Breadth-First Search (BFS)
In Quoridor, one key rule is that both players must have a reachable path to their goal. To enforce this rule, the **BFS** algorithm is used to check if both players have valid paths after every wall placement.

### React Component Structure
The project was also an excellent opportunity to refine my React skills, particularly in terms of:
- **Componentization:** The game is broken down into reusable components like `Board`, `Square`, and `Wall`.
- **State Management:** Efficient state handling to manage turns, board updates, and move legality checks.
- **Hooks & Context API:** Making use of React’s modern hooks for state and side-effects, and Context API for global state sharing between components.

## What I Learned
This project allowed me to:
- **Master React's component-based architecture** and learn how to properly organize a project into reusable parts.
- **Implement complex algorithms** such as MCTS and BFS in a React environment.
- **Understand game state management** and user interaction in a web-based game.
- **Build an AI opponent** that can make strategic decisions.

## Installation

To install and run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quoridor-game.git
Navigate to the project directory:
  ```bash
  cd quoridor-game
```
Install dependencies:
  ```bash
  npm install
```
Start the development server:
  ```bash
  npm start
```
##Future Enhancements
Improved AI Performance: Optimize the MCTS algorithm for faster decision-making.
Multiplayer Mode: Add real-time multiplayer using WebSockets or Firebase.
Customizable Themes: Allow users to customize the board and player colors.
License
This project is licensed under the MIT License. See the LICENSE file for details.

Contact
Feel free to reach out for questions, suggestions, or contributions! You can contact me at: theyasinsahin@gmail.com






