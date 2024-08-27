const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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
        // Add other characters and their positions for player A
    ];
    gameState.players.B.characters = [
        { type: 'Pawn', position: [4, 4] },
        // Add other characters and their positions for player B
    ];

    // Initialize the board with player positions
    gameState.board[0][0] = 'A-Pawn';
    gameState.board[4][4] = 'B-Pawn';
    // Add other characters to the board based on their initial positions
};

const processMove = (player, character, move) => {
    // Validate the move based on character type and current position
    const playerData = gameState.players[player];
    const charData = playerData.characters.find(c => c.type === character);

    if (!charData) {
        return { valid: false, message: 'Character not found' };
    }

    const [x, y] = charData.position;
    let newX = x, newY = y;

    // Update position based on the move
    switch (move) {
        case 'L': newX -= 1; break;
        case 'R': newX += 1; break;
        case 'F': newY -= 1; break;
        case 'B': newY += 1; break;
        // Handle other moves like diagonal for Hero2, etc.
    }

    // Ensure the move is within bounds and doesn't land on a friendly character
    if (newX < 0 || newX >= 5 || newY < 0 || newY >= 5 ||
        gameState.board[newY][newX]?.startsWith(player)) {
        return { valid: false, message: 'Invalid move' };
    }

    // Check if there's an opponent character to eliminate
    if (gameState.board[newY][newX] && !gameState.board[newY][newX].startsWith(player)) {
        // Remove the opponent character
        const opponent = gameState.board[newY][newX][0]; // 'A' or 'B'
        gameState.players[opponent].characters = gameState.players[opponent].characters.filter(c => c.position[0] !== newX || c.position[1] !== newY);
    }

    // Update the character's position
    gameState.board[y][x] = null;
    gameState.board[newY][newX] = `${player}-${character}`;
    charData.position = [newX, newY];

    // Switch turns
    gameState.players.A.turn = !gameState.players.A.turn;
    gameState.players.B.turn = !gameState.players.B.turn;

    return { valid: true, gameState };
};

wss.on('connection', (ws) => {
    console.log('New player connected');

    // Send initial game state to the connected player
    ws.send(JSON.stringify({ type: 'gameState', data: gameState }));

    // Handle messages from clients
    ws.on('message', (message) => {
        console.log('Received:', message);

        const { player, character, move } = JSON.parse(message);
        const result = processMove(player, character, move);

        if (result.valid) {
            // Broadcast updated game state to all clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'gameState', data: result.gameState }));
                }
            });
        } else {
            // Send an invalid move message to the current player
            ws.send(JSON.stringify({ type: 'invalidMove', message: result.message }));
        }
    });

    ws.on('close', () => {
        console.log('Player disconnected');
    });
});

initializeGame();

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
