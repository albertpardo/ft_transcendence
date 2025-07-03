// src/views/buttonClicking.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function registerPlayer(done: (error: Error | null, res?: Response) => void) {
  fetch(
    `${API_BASE_URL}/api/pong/game/add`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json,application/html,text/html,*/*',
        'Origin': 'https://127.0.0.1:3000/',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      },
      credentials: 'include',
      mode: 'cors',
    }
  )
  .then((response) => done(null, response))
  .catch((error) => done(error));
}

export function movePaddle(d: number, done: (error: Error | null, res?: Response) => void) {
  fetch(
    `${API_BASE_URL}/api/pong/game/move`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json,application/html,text/html,*/*',
        'Origin': 'https://127.0.0.1:3000/',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify({
        mov: d,
      }),
      credentials: 'include',
      mode: 'cors',
    }
  )
  .then((response) => done(null, response))
  .catch((error) => done(error));
}

export function forefit(done: (error: Error | null, res?: Response) => void) {
  fetch(
    `${API_BASE_URL}/api/pong/game/forefit`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json,application/html,text/html,*/*',
        'Origin': 'https://127.0.0.1:3000/',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      },
      credentials: 'include',
      mode: 'cors',
    }
  )
  .then((response) => done(null, response))
  .catch((error) => done(error));
}
