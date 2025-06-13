// src/views/sections.ts
// export function renderLoginContent(el: HTMLElement) {
//     el.innerHTML = `
//       <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
//         <h1 class="text-4xl font-bold mb-8">Transcendence</h1>
//         <input id="username" placeholder="Username" class="mb-4 p-3 rounded bg-gray-700 w-full max-w-md" />
//         <input id="password" type="password" placeholder="Password" class="mb-6 p-3 rounded bg-gray-700 w-full max-w-md" />
//         <button id="login-btn" class="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg">
//           LOGIN
//         </button>
//       </div>
//     `;
//     document.getElementById('login-btn')!.addEventListener('click', () => {
//       // tras login correcto guardas token y vas a dashboard
//       localStorage.setItem('authToken', '…');
//       window.location.hash = '#home';
//       route();
//     });
//   }
  

// src/views/sections.ts

// import { doSomething } from './buttonClicking';

export function renderHomeContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Welcome to Transcendence!</h1>
    <p class="mb-4">Sección de inicio con texto e imagen de prueba.</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg mb-6" alt="Demo">
  `;
  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true;
}

export function renderPlayContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
  `;
  // on this view, show the button and the registered games list
  bu.hidden = false;
  gArea.hidden = false;
  gWin.hidden = false;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getHistoryForPlayerId(userId: string, done: (error: Error | null, res?: Response) => void) {
  fetch(
    `${API_BASE_URL}/api/pong/hist`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json,application/html,text/html,*/*',
        'Origin': 'https://127.0.0.1:3000/',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify({
        userId: userId,
      }),
      credentials: 'include',
      mode: 'cors',
    }
  )
  .then((response) => done(null, response))
  .catch((error) => done(error));
}

function getNicknameForPlayerId(userId: string, done: (error: Error | null, res?: Response) => void) {
  fetch(
    `${API_BASE_URL}/api/public/nickname`,
    {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({
        userId: userId,
      }),
    }
  )
  .then((response) => done(null, response))
  .catch((error) => done(error));
}

export function renderHistoryContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Match History</h1>
    <p class="mb-4">History of matches</p>
  `;
  el.innerHTML += `
    <table><tr>
    <th>Date</th>
    <th>Opponent</th>
    <th>Score</th>
    <th>Result</th>
    </tr>
  `;
  // TODO FIXME spam protection? cache the thing maybe? make it independently get downloaded in the background once every something minutes.
  getHistoryForPlayerId(localStorage.getItem('userId'), function (error, response) {
    if (error) {
      console.error(error);
      el.innerHTML += "</table>";
    }
    else {
      response?.text().then((result) => {
        let parsedHist = JSON.parse(result);
        for (const entry of parsedHist) {
          const idL : string = entry.leftId;
          const idR : string = entry.rightId;
          // fallbacks for if getNickname fails I guess
          let nicknameL : string = idL;
          let nicknameR : string = idR;
          getNicknameForPlayerId(idL, function (error, response) {
            if (error) {
              console.error(error);
            }
            else {
              response?.text().then((result) => {
                let parsedHist = JSON.parse(result);
                nicknameL = parsedHist.nickname;
                getNicknameForPlayerId(idR, function (error, response) {
                  if (error) {
                    console.error(error);
                  }
                  else {
                    response?.text().then((result) => {
                      let parsedHist = JSON.parse(result);
                      nicknameR = parsedHist.nickname;
                      el.innerHTML += `<tr>
                        <td>${Date(entry.date * 1000)}</td>
                        <td>${localStorage.getItem('userId') === idL ? nicknameR : nicknameL}</td>
                        <td>${entry.scoreL} : ${entry.scoreR}</td>
                        <td>${localStorage.getItem('userId') === idL ? (entry.scoreL > entry.scoreR ? "Victory" : "Loss") : (entry.scoreL < entry.scoreR ? "Victory" : "Loss")}</td>
                        </tr><br>
                      `;
                    });
                  }
                });
              });
            }
          });
        }
      });
      el.innerHTML += "</table>";
    }
  });
  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true;
}

export function renderTournamentContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Tournaments</h1>
    <p class="mb-4">Tournaments (texto de ejemplo).</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg" alt="Tournament">
  `;
  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true;
}

export function renderStatsContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Stats</h1>
    <p class="mb-4">Stats (texto de ejemplo).</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg" alt="Stats">
  `;
  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true;
}
