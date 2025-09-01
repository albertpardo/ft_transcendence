// src/views/tournament.ts

import { getNicknameForPlayerId } from './history'
import { MetaGameState, buttonSetter, getGameMetaInfo, setterUponMetaInfo } from './dashboard'
import { t, i18nReady } from '../i18n';

// stolen from backend/microservices/game_service/src/pong.ts
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function adminCheck() {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/admincheck`,
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

async function participantCheck() {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/participantcheck`,
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

async function deleteTournament() {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/delete`,
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

async function leaveTournament() {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/leave`,
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

export async function getCompleteTournamentInfo() {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/peridinfo`,
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

async function getFinalist() {
  const fresp = fetch(
    `${API_BASE_URL}/api/pong/tour/finalist`,
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

async function fillInTheTournTable() {
  const tournAllInfoRawResp = await getCompleteTournamentInfo();
  const tournAllInfoResp = await tournAllInfoRawResp.text();
  const tournAllInfoRespObj = JSON.parse(tournAllInfoResp);
  if (tournAllInfoRespObj.err !== "nil") {
    console.log("getting all the tourn info resulted in err:", tournAllInfoRespObj.err);
    document.getElementById("tourn-title").innerHTML = "<i>" + t('tournaments.noTournaments') + "</i>";
    document.getElementById("tourn-id").innerHTML = "";
    const bt = document.getElementById("big-table");
    if (bt) {
      bt.innerHTML = `
        <tbody>
          <tr>
            <td id="table-contender-1"> ${t('tournaments.contender')} 1</td>
            <td rowspan="2" id="table-quarterfinal-1">${t('tournaments.quarterFinal')} 1</td>
            <td rowspan="4" id="table-semifinal-1">${t('tournaments.semiFinal')} 1</td>
            <td rowspan="8" id="table-finalist">${t('tournaments.final')}!</td>
          </tr>
          <tr>
            <td id="table-contender-2">${t('tournaments.contender')} 2</td>
          </tr>
          <tr>
            <td id="table-contender-3">${t('tournaments.contender')} 3</td>
            <td rowspan="2" id="table-quarterfinal-2">${t('tournaments.quarterFinal')} 2</td>
          </tr>
          <tr>
            <td id="table-contender-4">${t('tournaments.contender')} 4</td>
          </tr>
          <tr>
            <td id="table-contender-5">${t('tournaments.contender')} 5</td>
            <td rowspan="2" id="table-quarterfinal-3">${t('tournaments.quarterFinal')} 3</td>
            <td rowspan="4" id="table-semifinal-2">${t('tournaments.semiFinal')} 2</td>
          </tr>
          <tr>
            <td id="table-contender-6">${t('tournaments.contender')} 6</td>
          </tr>
          <tr>
            <td id="table-contender-7">${t('tournaments.contender')} 7</td>
            <td rowspan="2" id="table-quarterfinal-4">${t('tournaments.quarterFinal')} 4</td>
          </tr>
          <tr>
            <td id="table-contender-8">${t('tournaments.contender')} 8</td>
          </tr>
        </tbody>
      `;
    }
  }
  else {
    const tourn = tournAllInfoRespObj.res;
    if (typeof tourn === "undefined") {
      console.error("weird error occured: tour is undefined, although no err received");
    }
    else {
      document.getElementById("tourn-title").innerHTML = "Tournament name: " + tourn.tName;
      document.getElementById("tourn-id").innerHTML = "id: " + tourn.tId;
      for (let i = 0; i < 3; i++) {
        let currMaxPN : number = Math.pow(2, i + 1);
        let currentTitle : string = ["table-contender-", "table-quarterfinal-", "table-semifinal-"][3 - i - 1];
        for (let j = 0; j < currMaxPN; j++) {
          if (tourn?.Ids[i][j] !== "" && tourn?.Ids[i][j] !== "failed") {
            let respNn = await getNicknameForPlayerId(tourn?.Ids[i][j]);
            let nnJson = JSON.parse(await respNn.text());
            let nicknameVs = "<i>unknown</i>";
            if (nnJson.err === "nil") {
              nicknameVs = nnJson.nick;
            }
            document.getElementById(`${currentTitle}${j + 1}`).innerHTML = "<b>" + nicknameVs + "</b>";
          }
          else {
            // TODO this just highlights the importance of protections against injection. TODO TODO TODO FIXME XXX FIXME TODO TODO TODO.
            document.getElementById(`${currentTitle}${j + 1}`).innerHTML = "<i>empty</i>";
          }
        }
      }
      const finRawResp = await getFinalist();
      const finResp = await finRawResp.text();
      const finObj = JSON.parse(finResp);
      if (finObj.err === "nil") {
        if (finObj.res !== "") {
          const finId = finObj.res;
          // looks familiar?
          let respNn = await getNicknameForPlayerId(finId);
          let nnJson = JSON.parse(await respNn.text());
          let nicknameVs = "<i>unknown</i>";
          if (nnJson.err === "nil") {
            nicknameVs = nnJson.nick;
          }
          document.getElementById('table-finalist').innerHTML = "<b>" + nicknameVs + "</b>";
        }
        else {
          document.getElementById('table-finalist').innerHTML = "finalist!";
        }
      }
      else {
        console.error("finalist lookup error:", e);
      }
    }
  }
}

export async function renderTournamentContent(hideableElements) {
  hideableElements.buttonArea.hidden = true;
  hideableElements.gameArea.classList.add("hidden");
  hideableElements.gameWindow.hidden = true;
  let tempHTML : string = `
    <h1 id="tourn-title">Tourn title</h1>
    <h1 id="tourn-id">Tourn ID</h1>
    <hr />
    <table id="big-table" class="table-fixed"><tbody>
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
    <div class="flex flex-col space-y-1">
    <button id="leave-tourn" disabled
     class=
     "
       w-full px-4 py-2 text-white bg-red-600
       rounded-md hover:bg-red-700 focus:outline-none
       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
       focus:ring-offset-gray-800
       disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
     ">
      ${t('tournaments.leaveTournament')}
    </button>
    <button id="force-rm-tourn" disabled
     class=
     "
       w-full px-4 py-2 text-white bg-red-600
       rounded-md hover:bg-red-700 focus:outline-none
       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
       focus:ring-offset-gray-800
       disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
     ">
      ${t('tournaments.destroyTournament')}
     
    </button>
    </div>
  `;
  hideableElements.contentArea.innerHTML = tempHTML;
  let tournAnihilationButton = document.getElementById("force-rm-tourn");
  let tournLeaveButton = document.getElementById("leave-tourn");
  let doIAdmin : boolean = false;
  let noadminFlag : boolean = false;
  let noparticipateFlag : boolean = false;
  if (tournAnihilationButton) {
    const checkAdminRawResp = await adminCheck();
    const checkAdminResp = await checkAdminRawResp.text();
    const checkAdminRespObj = JSON.parse(checkAdminResp);
    if (checkAdminRespObj.err === "nil") {
      doIAdmin = true;
      tournAnihilationButton.removeAttribute('disabled');
      tournAnihilationButton.addEventListener("click", async () => {
        const rawResOfDelete = await deleteTournament();
        const resOfDelete = await rawResOfDelete.text();
        const resOfDeleteObj = JSON.parse(resOfDelete);
        if (resOfDeleteObj.err === "nil") {
          localStorage.removeItem("tId");
          tournAnihilationButton.disabled = true;
          buttonSetter(MetaGameState.nothing);
          console.log("tourn deleted");
        }
        else {
          console.error("failed to delete tournament:", resOfDeleteObj.err);
        }
        await fillInTheTournTable();
      });
    }
    else {
      console.log("just checked and you don't admin anything:", checkAdminRespObj.err);
      tournAnihilationButton.disabled = true;
      noadminFlag = true;
    }
  }
  if (tournLeaveButton) {
    tournLeaveButton.disabled = true;
    const checkPartRawResp = await participantCheck();
    const checkPartResp = await checkPartRawResp.text();
    const checkPartRespObj = JSON.parse(checkPartResp);
    if (checkPartRespObj.err === "nil" && !doIAdmin) {
      tournLeaveButton.removeAttribute('disabled');
      tournLeaveButton.addEventListener("click", async () => {
        const rawResOfLeave = await leaveTournament();
        const resOfLeave = await rawResOfLeave.text();
        const resOfLeaveObj = JSON.parse(resOfLeave);
        if (resOfLeaveObj.err === "nil") {
          alert("left the tournament");
          localStorage.removeItem("tId");
          tournLeaveButton.disabled = true;
          console.log("button setting from tournament 3");
          buttonSetter(MetaGameState.nothing);
        }
        else {
          console.error("failed to leave tournament:", resOfLeaveObj.err);
        }
        await fillInTheTournTable();
      });
    }
    else {
      console.log("just checked and you don't participate in anything OR you admin the thing:", checkPartRespObj.err);
      tournLeaveButton.disabled = true;
      noparticipateFlag = true;
    }
  }
  if ((noadminFlag === true) && (noparticipateFlag === true)) {
    let metaInfo = await getGameMetaInfo();
    const gameInfo : HTMLElement = document.getElementById("game-info");
    if (gameInfo) {
      await setterUponMetaInfo(gameInfo, metaInfo);
    }
  }

  await fillInTheTournTable();
}

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

async function generateUpdateAllTourTable(canWeJoin: boolean) {
  const allTournamentsTable = document.getElementById('all-tournaments-table');
  const rawAllPublicTournamentsResponse = await fetchAllPublicTournaments();
  const allPTR = await rawAllPublicTournamentsResponse.text();
  console.log(allPTR);
  const allPTRObj = JSON.parse(allPTR);
  let count : number = 0;
  let tempInner : string = `
  <tr>
    <th>Name</th>
    <th>Players</th>
    <th>Join</th>
  </tr>
  `;
  for (var item of allPTRObj?.res) {
    tempInner += `
    <tr>
      <td>${item.tName}</td>
      <td>${item.joinedPN}/${item.maxPN}</td>
      <td><button id="join-button-${count}" class="
        mt-6 p-3 bg-blue-500 rounded-lg hover:bg-blue-400 transition text-white font-medium
        disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
      ">
        Join
      </button></td>
    </tr>`;
    count += 1;
  }
  allTournamentsTable.innerHTML = tempInner;
  for (let newCount = 0; newCount < count; newCount += 1) {
    if (!canWeJoin) {
      console.log("can join:", newCount);
      document.getElementById(`join-button-${newCount}`).disabled = true;
    }
    else {
      console.log("can't join:", newCount);
      document.getElementById(`join-button-${newCount}`).disabled = false;
    }
    document.getElementById(`join-button-${newCount}`).addEventListener('click', async () => {
      const rawResOfEnroll = await enrollInTournament(allPTRObj.res[newCount].tId);
      const resOfEnroll = await rawResOfEnroll.text();
      const resOfEnrollObj = JSON.parse(resOfEnroll);
      if (resOfEnrollObj.err === "nil") {
        console.log("enrolled in " + allPTRObj.res[newCount].tId);
        localStorage.setItem("tId", allPTRObj.res[newCount].tId);
        for (let newerCount = 0; newerCount < count; newerCount += 1) {
          let currentJB = document.getElementById(`join-button-${newerCount}`);
          if (currentJB) {
            currentJB.disabled = true;
          }
        }
        buttonSetter(MetaGameState.waittouropp);
        document.getElementById('register-tournament-button').disabled = true;
      }
      else {
        console.error("failed to enroll in " + allPTRObj.res[newCount].tId + " because: " + resOfEnrollObj.err);
      }
    });
  }
}

export async function renderTournamentManagerContent(hideableElements) {
  hideableElements.buttonArea.hidden = true;
  hideableElements.gameArea.classList.add("hidden");
  hideableElements.gameWindow.hidden = true;
 
 
  let tempHTML : string = `
    <h1 class="text-3xl font-bold mb-6">${t("tournaments.tournamentManagement")}</h1>
    <p class="mb-4 font-bold">${t("tournaments.create")}</p>
    <form class="mt-8 space-y-6" id="tournament-form">
      <div>
        <label for="tname">${t("tournaments.tournamentName")}</label>
        <input id="tname" name="tname" type="text" required
          class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="${t("tournaments.tournamentName")}">
        </input>
      </div>
      <div>
        <label for="players">${t("tournaments.maxPlayers")}</label>
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
          />
        <label for="rprivate">${t("tournaments.privatizeTournament")}</label>
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
          ${t("tournaments.registerTournament")}
        </button>
      </div>
    </form>

    <br />
    <hr />
    <br />
    <p class="mb-4 font-bold">${t("tournaments.joinTournamentById")}:</p>
    <form class="mt-8 space-y-6" id="join-by-id-form">
      <div>
        <label for="tid">${t("tournaments.tournamentId")}</label>
        <input id="tid" name="tid" type="text" required
          class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="${t("tournaments.ID")}">
        </input>
      </div>
      <div>
        <button type="submit" id="enter-tournament-by-id-button"
          class=
            "
            w-full px-4 py-2 text-white bg-blue-600
            rounded-md hover:bg-blue-700 focus:outline-none
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            focus:ring-offset-gray-800
            disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
        "
        disabled>
          ${t("tournaments.enterTournament")}
        </button>
      </div>
    </form>

    <br />
    <hr />
    <br />
    <p class="mb-4">${t("tournaments.myTournaments")}:</p>
    <div id="my-tournament"><p><i>${t("tournaments.noTournaments")}</i></p></div>

    <br />
    <hr />
    <br />
    <p class="mb-4">${t("tournaments.allTournaments")}:</p>
    <table class="table-fixed"><tbody id="all-tournaments-table">
    </tbody></table>
    <!-- actual table of all public tournaments TODO -->
  `;
  hideableElements.contentArea.innerHTML = tempHTML;
  let canWeJoin : bool = false;
  const tournamentForm = document.getElementById('tournament-form') as HTMLFormElement;
  const joinByIDForm = document.getElementById('join-by-id-form') as HTMLFormElement;
  const myTournamentField = document.getElementById('my-tournament');
  const metaInfo = await getGameMetaInfo();
  if (metaInfo.gType === "normal") {
    console.log("you're already in a normal game btw");
  }
  else {
    const checkPartRawResp = await participantCheck();
    const checkPartResp = await checkPartRawResp.text();
    const checkPartRespObj = JSON.parse(checkPartResp);
    console.log("check part resp obj:", checkPartRespObj);
    if (tournamentForm) {
      const submitButton = document.getElementById('register-tournament-button') as HTMLButtonElement;
      if (checkPartRespObj.err !== "nil") {
        canWeJoin = true;
        submitButton.removeAttribute('disabled');
        // "no tournament for this player found" => proceed with allowing to create the tournament
        tournamentForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const tnameEl = document.getElementById('tname') as HTMLInputElement;
          const playersEl = document.getElementById('players') as HTMLInputElement;
          const checkboxEl = document.getElementById('rprivate') as HTMLInputElement;
          submitButton.disabled = true;
          document.getElementById('enter-tournament-by-id-button').disabled = true;
          const rawCreateTournamentResp = await createTournament(tnameEl.value, playersEl.value, checkboxEl.checked);
          console.log(rawCreateTournamentResp);
          const tourResp = await rawCreateTournamentResp.text();
          const tourRespObj = JSON.parse(tourResp);
          if (tourRespObj.err === "nil") {
            console.log("registered a tournament:", tourRespObj.tId);
            canWeJoin = false;
            myTournamentField.innerHTML = "<a href=\"" + document.URL.substring(0, document.URL.search("#")) + "#tournament" + "\"><b><i>" + t("tournaments.view") + "</b></i></a>";
            localStorage.setItem('tId', tourRespObj.tId);
            buttonSetter(MetaGameState.waittouropp);
          }
          else {
            console.error("Tournament creation error: " + tourRespObj.err + " | " + tourRespObj.tId);
            submitButton.removeAttribute('disabled');
            document.getElementById('enter-tournament-by-id-button').removeAttribute("disabled");
            canWeJoin = true;
          }
          tournamentForm.reset();
          await generateUpdateAllTourTable(canWeJoin);
        });
      }
      else {
        console.log("can't allow generating a tournament");
        canWeJoin = false;
        localStorage.setItem('tId', checkPartRespObj.tId);
        submitButton.disabled = true;
        document.getElementById('enter-tournament-by-id-button').disabled = true;
        myTournamentField.innerHTML = "<a href=\"" + document.URL.substring(0, document.URL.search("#")) + "#tournament" + "\"><b><i>" + t("tournaments.view") + "</b></i></a>";
      }
    }
    if (joinByIDForm) {
      const enterByIdButton = document.getElementById('enter-tournament-by-id-button') as HTMLButtonElement;
      if (checkPartRespObj.err !== "nil") {
        enterByIdButton.removeAttribute('disabled');
        // "no tournament for this player found" => proceed with allowing to create the tournament
        joinByIDForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const tidEl = document.getElementById('tid') as HTMLInputElement;
          document.getElementById('register-tournament-button').disabled = true;
          enterByIdButton.disabled = true;
          const rawResOfEnroll = await enrollInTournament(tidEl.value);
          const resOfEnroll = await rawResOfEnroll.text();
          const resOfEnrollObj = JSON.parse(resOfEnroll);
          if (resOfEnrollObj.err === "nil") {
            console.log("enrolled in " + tidEl.value);
            canWeJoin = false;
            myTournamentField.innerHTML = "<a href=\"" + document.URL.substring(0, document.URL.search("#")) + "#tournament" + "\"><b><i>" + t("tournaments.view") + "</b></i></a>";
            localStorage.setItem("tId", tidEl.value);
            buttonSetter(MetaGameState.waittouropp);
          }
          else {
            console.error("failed to enroll in " + tidEl.value + " because: " + resOfEnrollObj.err);
            document.getElementById('register-tournament-button').removeAttribute("disabled");
            enterByIdButton.removeAttribute("disabled");
            canWeJoin = true;
          }
          joinByIDForm.reset();
          await generateUpdateAllTourTable(canWeJoin);
        });
      }
      else {
        console.log("can't allow joining a tournament");
        canWeJoin = false;
        localStorage.setItem('tId', checkPartRespObj.tId);
        document.getElementById('register-tournament-button').disabled = true;
        enterByIdButton.disabled = true;
        myTournamentField.innerHTML = "<a href=\"" + document.URL.substring(0, document.URL.search("#")) + "#tournament" + "\"><b><i>" + t("tournaments.view") + "</b></i></a>";
      }
    }
  }

  await generateUpdateAllTourTable(canWeJoin);
}
