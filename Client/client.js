// Establish WebSocket connection with the server
const ws = new WebSocket('ws://localhost:8080');

// Handle incoming messages from the server
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'gameState') {
        renderGameBoard(message.data); // Render the game board with the updated game state
    } else if (message.type === 'invalidMove') {
        alert(`Invalid Move: ${message.message}`); // Display an alert for invalid moves
    }
};

// Function to send a move command to the server
const sendMove = (player, character, move) => {
    ws.send(JSON.stringify({ player, character, move }));
};

// Function to render the game board based on the current game state
const renderGameBoard = (gameState) => {
    const board = document.getElementById('game-board');
    board.innerHTML = ''; // Clear the current board

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            const character = gameState.board[row][col];
            if (character) {
                cell.innerText = character; // Display character
                cell.classList.add(`player-${character[0]}`); // Add class for player-specific styling
                // Add click event for the current player's characters
                cell.onclick = () => {
                    if (gameState.players[character[0]].turn) {
                        displayValidMoves(character, row, col);
                    }
                };
            }

            board.appendChild(cell);
        }
    }
};

// Function to display valid moves for a selected character
const displayValidMoves = (character, row, col) => {
    const moveControls = document.getElementById('move-controls');
    moveControls.innerHTML = ''; // Clear previous move controls

    const validMoves = getValidMoves(character, row, col);
    validMoves.forEach(move => {
        const moveButton = document.createElement('button');
        moveButton.innerText = move;
        moveButton.onclick = () => sendMove(character[0], character.split('-')[1], move); // Send move to the server
        moveControls.appendChild(moveButton);
    });
};

// Function to determine valid moves based on character type and current position
const getValidMoves = (character, row, col) => {
    const moves = [];
    const type = character.split('-')[1];

    switch (type) {
        case 'Pawn':
            if (col > 0) moves.push('L');
            if (col < 4) moves.push('R');
            if (row > 0) moves.push('F');
            if (row < 4) moves.push('B');
            break;
        case 'Hero1':
            if (col > 1) moves.push('L');
            if (col < 3) moves.push('R');
            if (row > 1) moves.push('F');
            if (row < 3) moves.push('B');
            break;
        case 'Hero2':
            if (row > 1 && col > 1) moves.push('FL');
            if (row > 1 && col < 3) moves.push('FR');
            if (row < 3 && col > 1) moves.push('BL');
            if (row < 3 && col < 3) moves.push('BR');
            break;
        // Add additional cases for other character types (e.g., Hero3) if needed
    }

    return moves;
};

// Initial game board setup on page load
document.addEventListener('DOMContentLoaded', () => {
    renderGameBoard({
        board: Array(5).fill(null).map(() => Array(5).fill(null)),
        players: {
            A: { turn: true },
            B: { turn: false }
        }
    });
});
