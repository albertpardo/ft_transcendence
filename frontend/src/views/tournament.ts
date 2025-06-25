// src/views/tournament.ts

export function renderTournamentContent(hideableElements) {
  let tempHTML : string = `
    <h1>Hi</h1>
    <table class="table-fixed"><tbody>
      <tr>
        <td>contender 1</td>
        <td rowspan="2">quarterfinal 1</td>
        <td rowspan="4">semifinal 1</td>
        <td rowspan="8">finalist!</td>
      </tr>
      <tr>
        <td>contender 2</td>
      </tr>
      <tr>
        <td>contender 3</td>
        <td rowspan="2">quarterfinal 2</td>
      </tr>
      <tr>
        <td>contender 4</td>
      </tr>
      <tr>
        <td>contender 5</td>
        <td rowspan="2">quarterfinal 3</td>
        <td rowspan="4">semifinal 2</td>
      </tr>
      <tr>
        <td>contender 6</td>
      </tr>
      <tr>
        <td>contender 7</td>
        <td rowspan="2">quarterfinal 4</td>
      </tr>
      <tr>
        <td>contender 8</td>
      </tr>
    </tbody>
    </table>
  `;
  hideableElements.contentArea.innerHTML = tempHTML;
  hideableElements.startButton.hidden = true;
  hideableElements.giveupButton.hidden = true;
  hideableElements.gameArea.hidden = true;
  hideableElements.gameWindow.hidden = true;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function createTournament(tName : string, playersN : number, privacy : boolean) {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/enroll`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json,application/html,text/html,*/*',
        'Origin': 'https://127.0.0.1:3000/',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify({
        tName: tName,
        playersN: playersN,
        privacy: privacy,
      }),
      credentials: 'include',
      mode: 'cors',
    }
  );
}

export async function renderTournamentManagerContent(hideableElements) {
  let tempHTML : string = `
    <h1 class="text-3xl font-bold mb-6">Tournament management</h1>
    <p class="font-bold mb-4 text-xl" style="color:coral">You're already participating in a tournament.</p>
    <p class="mb-4 font-bold">Create a tournament:</p>
    <!-- form form form TODO XXX -->
      <form class="mt-8 space-y-6" id="tournament-form">
        <div>
          <label for="players">Tournament name</label>
          <input id="tname" name="tname" type="text" required
            class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tournament name">
          </input>
        </div>
        <div>
          <label for="players">Amount of participants</label>
          <select id="players" name="players" required
            class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder=2>
            <option value=2>2</option>
            <option value=4>4</option>
            <option value=8>8</option>
          </select>
        </div>
        <div>
          <input type="checkbox" id="rprivate" name="rprivate"
            checked />
          <label for="rprivate">Make it private</label>
        </div>
        <div>
          <button type="submit" id="register-tournament-button"
            class=
              "
              w-full px-4 py-2 text-white bg-blue-600
              rounded-md hover:bg-blue-700 focus:outline-none
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              focus:ring-offset-gray-800
          ">
            Register tournament
          </button>
        </div>
      </form>

    <p class="mb-4">My tournaments:</p>
    <table class="table-fixed"><tbody>
    </tbody></table>
    <!-- actual table of my tournaments TODO -->

    <p class="mb-4">All tournaments:</p>
    <table class="table-fixed"><tbody>
    </tbody></table>
    <!-- actual table of all public tournaments TODO -->
  `;
  hideableElements.contentArea.innerHTML = tempHTML;
  const tournamentForm = document.getElementById('tournament-form') as HTMLFormElement;
  if (tournamentForm) {
    tournamentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitButton = document.getElementById('register-tournament-button') as HTMLButtonElement;
      const tnameEl = document.getElementById('tname') as HTMLInputElement;
      const playersEl = document.getElementById('players') as HTMLInputElement;
      const checkboxEl = document.getElementById('rprivate') as HTMLInputElement;
      submitButton.disabled = true;
      await createTournament(tnameEl.value, playersEl.value, checkboxEl.checked);
      submitButton.disabled = false;
      tournamentForm.reset();
    });
  }
  hideableElements.startButton.hidden = true;
  hideableElements.giveupButton.hidden = true;
  hideableElements.gameArea.hidden = true;
  hideableElements.gameWindow.hidden = true;
}
