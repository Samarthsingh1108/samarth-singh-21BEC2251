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
