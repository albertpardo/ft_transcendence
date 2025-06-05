// src/views/buttonClicking.ts

export function registerPlayer(socket: WebSocket) {
  const stuff : string = JSON.stringify({
    playerId: localStorage.getItem("userId"),
    getIn: true,
    mov: 0,
  });
  socket.send(stuff);
}
// with a variable for debug purposes ^

export function movePaddle(socket: WebSocket, d: number) {
  socket.send(JSON.stringify({
    playerId: localStorage.getItem("userId"),
    getIn: false,
    mov: d,
  }));
}
