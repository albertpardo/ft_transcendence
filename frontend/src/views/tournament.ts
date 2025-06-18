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

export function renderTournamentManagerContent(hideableElements) {
  let tempHTML : string = `
    <h1 class="text-3xl font-bold mb-6">Tournament management</h1>
    <p class="mb-4">You're already participating in a tournament</p>
    <p class="mb-4">Create a tournament:</p>
    <!-- form form form TODO XXX -->
      <form class="mt-8 space-y-6" id="tournament-form">
        <div>
          <input id="tname" name="tname" type="text" required 
            class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Tournament name">
            Tournament name
          </input>
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
  const tournamentForm = document.getElementById('tournament-form') as HTMLFormElement;
  if (tournamentForm) {
    tournamentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitButton = document.getElementById('register-tournament-button') as HTMLButtonElement;
      const tnameEl = document.getElementById('tname') as HTMLInputElement;
      submitButton.disabled = true;
      console.log("submitted:", tnameEl.value);
      submitButton.disabled = false;
      tnameEl.reset();
    });
  }
  hideableElements.contentArea.innerHTML = tempHTML;
  hideableElements.startButton.hidden = true;
  hideableElements.giveupButton.hidden = true;
  hideableElements.gameArea.hidden = true;
  hideableElements.gameWindow.hidden = true;
}
