// src/views/buttonClicking.ts

export function registerPlayer(socket: WebSocket) {
  socket.send(JSON.stringify({
    playerId: localStorage.getItem("authToken"),
    getIn: true,
    mov: 0,
  }));
}

export function movePaddle(socket: WebSocket, d: number) {
  socket.send(JSON.stringify({
    playerId: localStorage.getItem("authToken"),
    getIn: false,
    mov: d,
  }));
}
