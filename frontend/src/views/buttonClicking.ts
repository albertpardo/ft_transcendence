// src/views/buttonClicking.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function registerPlayer() {
  const fresp = fetch(
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
  );
  return fresp;
}

export async function movePaddle(d: number) {
  const fresp = fetch(
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
  );
  return fresp;
}

export async function forefit() {
  const fresp = fetch(
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
  );
  return fresp;
}

export async function confirmParticipation() {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/confirm`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json,application/html,text/html,*/*',
        'Origin': 'https://127.0.0.1:3000/',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      },
      credentials: 'include',
      mode: 'cors',
    }
  );
  return fresp;
}
