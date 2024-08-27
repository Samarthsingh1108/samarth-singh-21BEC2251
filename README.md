# Samarth-Singh-21BEC2251

**1. Project Setup**
 
**1.1 Server-Side Setup**

   Language & Framework: Choose a server-side language (e.g., Node.js with Express).
   
   Dependencies: Install necessary libraries for websocket communication (e.g., ws for Node.js).
   ```bash
npm init -y
npm install express ws
```
**1.2 Client-Side Setup**

HTML/CSS/JS: Set up a basic web interface with HTML, CSS, and JavaScript.

Websocket Client: Use the browser’s WebSocket API to communicate with the server.

**2. Server Implementation
2.1 Setting up the WebSocket Server**

Create a basic Express server and initialize a WebSocket server:
```
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New player connected');
    // Handle messages from clients
    ws.on('message', (message) => {
        console.log('Received:', message);
        // Process the move and update game state
    });
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
```
**2.2 Implementing Game Logic**

Game State: Maintain the game state on the server, including player positions and turns.
```
let gameState = {
    board: Array(5).fill(null).map(() => Array(5).fill(null)), // 5x5 grid
    players: {
        A: { characters: [], turn: true },
        B: { characters: [], turn: false }
    }
};

const initializeGame = () => {
    // Setup initial positions for both players
    gameState.players.A.characters = [
        { type: 'Pawn', position: [0, 0] },
        // Other characters...
    ];
    gameState.players.B.characters = [
        { type: 'Pawn', position: [4, 4] },
        // Other characters...
    ];
};

initializeGame();
```
**2.3 Processing Moves**

Move Validation: Check if the move is valid (e.g., within bounds, correct character type).

Game State Update: Update the game board and handle character elimination.
```
const processMove = (player, character, move) => {
    // Validate the move based on character type and current position
    // Update the game state and check for any eliminations
    // Switch turns
};
```
**3. Websocket Communication**

**3.1 Event Handling**

Game Initialization: Send initial game state to clients when they connect.

Move Events: Receive move commands from clients and broadcast updates.

```
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'gameState', gameState }));

    ws.on('message', (message) => {
        const { player, character, move } = JSON.parse(message);
        const result = processMove(player, character, move);

        if (result.valid) {
            broadcastGameState();
        } else {
            ws.send(JSON.stringify({ type: 'invalidMove', reason: result.reason }));
        }
    });
});

const broadcastGameState = () => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'gameState', gameState }));
        }
    });
};
```
**4. Client Implementation**

**4.1 Web Interface**

Grid Display: Create a 5x5 grid using HTML/CSS.

Character Representation: Use different colors or labels for characters.

```
<div id="game-board">
    <!-- Grid cells go here -->
</div>
```
**4.2 WebSocket Communication**

Connect to Server: Use the WebSocket API to connect and communicate with the server.
```
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'gameState') {
        renderGameBoard(message.gameState);
    } else if (message.type === 'invalidMove') {
        alert(`Invalid Move: ${message.reason}`);
    }
};

const sendMove = (player, character, move) => {
    ws.send(JSON.stringify({ player, character, move }));
};
```
**4.3 Rendering the Game State**

Update Grid: Render the game board based on the current state sent by the server.
```
const renderGameBoard = (gameState) => {
    const board = document.getElementById('game-board');
    board.innerHTML = ''; // Clear the current board

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const character = gameState.board[row][col];
            if (character) {
                cell.innerText = character.type; // Display character
            }
            board.appendChild(cell);
        }
    }
};
```
**5. Game Logic Integration**

Linking Moves to UI: Allow players to click on characters, see valid moves, and submit those moves to the server.
