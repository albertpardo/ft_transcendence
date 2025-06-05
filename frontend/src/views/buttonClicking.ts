// src/views/buttonClicking.ts

export function registerPlayer(socket: WebSocket) {
  const stuff : string = JSON.stringify({
    playerId: localStorage.getItem("userId"),
    getIn: true,
    mov: 0,
  });
  console.log("sending ts:", stuff);
  socket.send(stuff);
}

export function movePaddle(socket: WebSocket, d: number) {
  socket.send(JSON.stringify({
    playerId: localStorage.getItem("userId"),
    getIn: false,
    mov: d,
  }));
}
