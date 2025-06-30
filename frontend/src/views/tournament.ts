// src/views/tournament.ts

// stolen from backend/microservices/game_service/src/pong.ts
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function renderTournamentContent(hideableElements) {
  hideableElements.startButton.hidden = true;
  hideableElements.giveupButton.hidden = true;
  hideableElements.gameArea.hidden = true;
  hideableElements.gameWindow.hidden = true;
  let tempHTML : string = `
    <h1>Hi</h1>
    <table class="table-fixed"><tbody>
      <tr>
        <td id="table-contender-1">contender 1</td>
        <td rowspan="2" id="table-quarterfinal-1">quarterfinal 1</td>
        <td rowspan="4" id="table-semifinal-1">semifinal 1</td>
        <td rowspan="8" id="table-finalist">finalist!</td>
      </tr>
      <tr>
        <td id="table-contender-2">contender 2</td>
      </tr>
      <tr>
        <td id="table-contender-3">contender 3</td>
        <td rowspan="2" id="table-quarterfinal-2">quarterfinal 2</td>
      </tr>
      <tr>
        <td id="table-contender-4">contender 4</td>
      </tr>
      <tr>
        <td id="table-contender-5">contender 5</td>
        <td rowspan="2" id="table-quarterfinal-3">quarterfinal 3</td>
        <td rowspan="4" id="table-semifinal-2">semifinal 2</td>
      </tr>
      <tr>
        <td id="table-contender-6">contender 6</td>
      </tr>
      <tr>
        <td id="table-contender-7">contender 7</td>
        <td rowspan="2" id="table-quarterfinal-4">quarterfinal 4</td>
      </tr>
      <tr>
        <td id="table-contender-8">contender 8</td>
      </tr>
    </tbody>
    </table>
  `;
  hideableElements.contentArea.innerHTML = tempHTML;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function createTournament(tName : string, playersN : number, privacy : boolean) {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/create`,
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
  return fresp;
}

async function checkOnTournamentForm() {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json,application/html,text/html,*/*',
        'Origin': 'https://127.0.0.1:3000/',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: JSON.stringify({
        tName: "",
        playersN: -1,
        privacy: false,
      }),
      credentials: 'include',
      mode: 'cors',
    }
  );
  return fresp;
}

async function enrollInTournament(tId: string) {
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
        tId: tId,
      }),
      credentials: 'include',
      mode: 'cors',
    }
  );
  return fresp;
}

// getting all public tournaments will be available only to registered users
// to account for how taxing this operation can be on the database and to limit
// the possible DOS attack vulnerabilities
async function fetchAllPublicTournaments() {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/all`,
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

export async function renderTournamentManagerContent(hideableElements) {
  hideableElements.startButton.hidden = true;
  hideableElements.giveupButton.hidden = true;
  hideableElements.gameArea.hidden = true;
  hideableElements.gameWindow.hidden = true;
  let tempHTML : string = `
    <p id="error-text-field" class="font-bold mb-4 text-xl" style="color:coral" hidden>You're already participating in a tournament.</p>
    <h1 class="text-3xl font-bold mb-6">Tournament management</h1>
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
              disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
          "
          disabled>
            Register tournament
          </button>
        </div>
      </form>

    <p class="mb-4">My tournament:</p>
    <div id="my-tournament"><p><i>none</i></p></div>

    <br>
    <p class="mb-4">All tournaments:</p>
    <table class="table-fixed"><tbody id="all-tournaments-table">
      <th>
        <td>Name</td>
        <td>Players</td>
        <td></td>
      </th>
    </tbody></table>
    <!-- actual table of all public tournaments TODO -->
  `;
  hideableElements.contentArea.innerHTML = tempHTML;
  const tournamentForm = document.getElementById('tournament-form') as HTMLFormElement;
  const errorField = document.getElementById('error-text-field');
  const myTournamentField = document.getElementById('my-tournament');
  if (tournamentForm) {
    const submitButton = document.getElementById('register-tournament-button') as HTMLButtonElement;
    const checkOnTournamentRawResp = await checkOnTournamentForm();
    const checkResp = await checkOnTournamentRawResp.text();
    const checkRespObj = JSON.parse(checkResp);
    if (checkRespObj.err?.substring(0, 3) === "no ") {
      submitButton.disabled = false;
      // "no tournament for this player found" => proceed with allowing to create the tournament
      tournamentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tnameEl = document.getElementById('tname') as HTMLInputElement;
        const playersEl = document.getElementById('players') as HTMLInputElement;
        const checkboxEl = document.getElementById('rprivate') as HTMLInputElement;
        submitButton.disabled = true;
        const rawCreateTournamentResp = await createTournament(tnameEl.value, playersEl.value, checkboxEl.checked);
        console.log(rawCreateTournamentResp);
        const tourResp = await rawCreateTournamentResp.text();
        const tourRespObj = JSON.parse(tourResp);
        if (tourRespObj.err !== "nil") {
          alert("Tournament creation error: " + tourRespObj.err);
          submitButton.disabled = false;
//          errorField.innerHTML = "Tournament creation error: " + tId;
//          errorField.hidden = false;
        }
        else {
//          errorField.hidden = true;
          console.log("registerd a tournament:", tourRespObj.tId);
          myTournamentField.innerHTML = "<a href=\"" + document.URL.substring(0, document.URL.search("#")) + "#tournament" + "\"><b><i>Click to view</b></i></a>"
          localStorage.setItem('tId', tourRespObj.tId);
        }
        tournamentForm.reset();
      });
    }
    else {
      localStorage.setItem('tId', checkRespObj.err);
      submitButton.disabled = true;
      errorField.hidden = true;
      console.log("already registerd in a tournament:", checkRespObj.err);
      myTournamentField.innerHTML = "<a href=\"" + document.URL.substring(0, document.URL.search("#")) + "#tournament" + "\"><b><i>Click to view</b></i></a>"
    }
  }

  const allTournamentsTable = document.getElementById('all-tournaments-table');
  const rawAllPublicTournamentsResponse = await fetchAllPublicTournaments();
  const allPTR = await rawAllPublicTournamentsResponse.text();
  const allPTRObj = JSON.parse(allPTR);
  let count : number = 0;
  let tempInner : string = "";
  for (var item of allPTRObj?.res) {
    tempInner += `
    <tr>
      <td>${item.tName}</td>
      <td>${item.joinedPN}/${item.maxPN}</td>
      <td><button id="join-button-${count}" class="mt-6 p-3 bg-blue-500 rounded-lg hover:bg-blue-400 transition text-white font-medium">Join</button></td>
    </tr>`;
    count += 1;
  }
  allTournamentsTable.innerHTML = tempInner;
  for (let newCount = 0; newCount < count; newCount += 1) {
    document.getElementById(`join-button-${newCount}`).addEventListener('click', async () => {
      const rawResOfEnroll = await enrollInTournament(allPTRObj.res[newCount].tId);
      const resOfEnroll = await rawResOfEnroll.text();
      const resOfEnrollObj = JSON.parse(resOfEnroll);
      if (resOfEnrollObj.err === "nil") {
        alert("enrolled in " + allPTRObj.res[newCount].tId);
        localStorage.setItem("tId", allPTRObj.res[newCount].tId);
      }
      else {
        alert("failed to enroll in " + allPTRObj.res[newCount].tId);
      }
    });
  }
}
