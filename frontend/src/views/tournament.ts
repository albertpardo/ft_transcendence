// src/views/tournament.ts

import { getNicknameForPlayerId } from './history'
import { MetaGameState, buttonSetter, getGameMetaInfo, setterUponMetaInfo } from './dashboard'
import { t, i18nReady } from '../i18n';

// stolen from backend/microservices/game_service/src/pong.ts
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function generateBracketHTML(tournamentSize: number) {
  let html = `<h1 id="tourn-title">Tourn title</h1>
    <h1 id="tourn-id">Tourn ID</h1>
    <hr />
    <div class="overflow-x-auto">
      <table id="big-table" class="min-w-full divide-y divide-gray-700">
        <tbody>`;
  
  // For 2-player tournament
  if (tournamentSize === 2) {
    html += `
      <tr>
        <td id="table-contender-1" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 1</td>
        <td rowspan="2" id="table-finalist" class="px-6 py-4 whitespace-nowrap">${t('tournaments.final')}</td>
      </tr>
      <tr>
        <td id="table-contender-2" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 2</td>
      </tr>
    `;
  } 
  // For 4-player tournament - CORRECTED STRUCTURE (NO QUARTERFINALS!)
  else if (tournamentSize === 4) {
    html += `
      <tr>
        <td id="table-contender-1" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 1</td>
        <td rowspan="2" id="table-semifinal-1" class="px-6 py-4 whitespace-nowrap">${t('tournaments.semiFinal')} 1</td>
        <td rowspan="4" id="table-finalist" class="px-6 py-4 whitespace-nowrap">${t('tournaments.final')}</td>
      </tr>
      <tr>
        <td id="table-contender-2" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 2</td>
      </tr>
      <tr>
        <td id="table-contender-3" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 3</td>
        <td rowspan="2" id="table-semifinal-2" class="px-6 py-4 whitespace-nowrap">${t('tournaments.semiFinal')} 2</td>
      </tr>
      <tr>
        <td id="table-contender-4" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 4</td>
      </tr>
    `;
  }
  // For 8-player tournament
  else {
    html += `
      <tr>
        <td id="table-contender-1" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 1</td>
        <td rowspan="2" id="table-quarterfinal-1" class="px-6 py-4 whitespace-nowrap">${t('tournaments.quarterFinal')} 1</td>
        <td rowspan="4" id="table-semifinal-1" class="px-6 py-4 whitespace-nowrap">${t('tournaments.semiFinal')} 1</td>
        <td rowspan="8" id="table-finalist" class="px-6 py-4 whitespace-nowrap">${t('tournaments.final')}</td>
      </tr>
      <tr>
        <td id="table-contender-2" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 2</td>
      </tr>
      <tr>
        <td id="table-contender-3" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 3</td>
        <td rowspan="2" id="table-quarterfinal-2" class="px-6 py-4 whitespace-nowrap">${t('tournaments.quarterFinal')} 2</td>
      </tr>
      <tr>
        <td id="table-contender-4" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 4</td>
      </tr>
      <tr>
        <td id="table-contender-5" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 5</td>
        <td rowspan="2" id="table-quarterfinal-3" class="px-6 py-4 whitespace-nowrap">${t('tournaments.quarterFinal')} 3</td>
        <td rowspan="4" id="table-semifinal-2" class="px-6 py-4 whitespace-nowrap">${t('tournaments.semiFinal')} 2</td>
      </tr>
      <tr>
        <td id="table-contender-6" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 6</td>
      </tr>
      <tr>
        <td id="table-contender-7" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 7</td>
        <td rowspan="2" id="table-quarterfinal-4" class="px-6 py-4 whitespace-nowrap">${t('tournaments.quarterFinal')} 4</td>
      </tr>
      <tr>
        <td id="table-contender-8" class="px-6 py-4 whitespace-nowrap">${t('tournaments.contender')} 8</td>
      </tr>
    `;
  }
  
  html += `</tbody></table>
    </div>
    <div class="flex flex-col space-y-1 mt-4">
    <button id="leave-tourn" disabled
     class="
       w-full px-4 py-2 text-white bg-red-600
       rounded-md hover:bg-red-700 focus:outline-none
       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
       focus:ring-offset-gray-800
       disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
     ">
      ${t('tournaments.leaveTournament')}
    </button>
    <button id="force-rm-tourn" disabled
     class="
       w-full px-4 py-2 text-white bg-red-600
       rounded-md hover:bg-red-700 focus:outline-none
       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
       focus:ring-offset-gray-800
       disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none
     ">
      ${t('tournaments.destroyTournament')}
    </button>
    </div>`;
  
  return html;
}

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


export async function renderTournamentContent(hideableElements) {
  hideableElements.buttonArea.hidden = true;
  hideableElements.gameArea.classList.add("hidden");
  hideableElements.gameWindow.hidden = true;
  
  const tournAllInfoRawResp = await getCompleteTournamentInfo();
  const tournAllInfoResp = await tournAllInfoRawResp.text();
  const tournAllInfoRespObj = JSON.parse(tournAllInfoResp);
 
  const rawAllPublicTournamentsResponse = await fetchAllPublicTournaments();
  const allPTR = await rawAllPublicTournamentsResponse.text();
  const allPTRObj = JSON.parse(allPTR);
  
  let bracketSize = 8;
  
  type TournamentInfo = {
    tId: string;
    tName: string;
    maxPN: number;
    joinedPN?: number;
  };

  if (tournAllInfoRespObj.err === "nil" && tournAllInfoRespObj.res) {
    const tourn = tournAllInfoRespObj.res;
    const currentTournamentId = tourn.tId;

    let currentTournament: TournamentInfo | undefined = undefined;
    if (allPTRObj && allPTRObj.res && Array.isArray(allPTRObj.res)) {
      currentTournament = (allPTRObj.res as TournamentInfo[]).find(t => t.tId === currentTournamentId);
    }

    if (currentTournament) {
      const tournamentSize = currentTournament.maxPN || 8;
      console.log("Found tournament with size:", tournamentSize);

      if (tournamentSize === 2 || tournamentSize === 4) {
        bracketSize = tournamentSize;
      }
     } else {
      console.warn("Could not find current tournament in public tournaments list, trying to determine size from tournament data");
      if (tourn.Ids) {
        if (tourn.Ids[0] && tourn.Ids[0].length === 2 && 
            (!tourn.Ids[1] || tourn.Ids[1].every(id => id === ""))) {
          bracketSize = 2;
        } else if (tourn.Ids[0] && tourn.Ids[0].length === 2 &&
                   tourn.Ids[1] && tourn.Ids[1].length === 4) {
          bracketSize = 4;
        } else {
          bracketSize = 8;
        }
      }
    } 
  }

  // console.log("Final bracket size determined:", bracketSize);

  // Generate bracket HTML based on ACTUAL tournament size
  let tempHTML = generateBracketHTML(bracketSize);
  hideableElements.contentArea.innerHTML = tempHTML;
  
  let tournAnihilationButton = document.getElementById("force-rm-tourn");
  let tournLeaveButton = document.getElementById("leave-tourn");
  let doIAdmin = false;
  let noadminFlag = false;
  let noparticipateFlag = false;
  
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
          (tournAnihilationButton as HTMLButtonElement).disabled = true;
          buttonSetter(MetaGameState.nothing);
        }
        else {
          console.error("failed to delete tournament:", resOfDeleteObj.err);
        }
        await fillInTheTournTable(tournAllInfoRespObj, bracketSize);
      });
    }
    else {
      (tournAnihilationButton as HTMLButtonElement).disabled = true;
      noadminFlag = true;
    }
  }
  
  if (tournLeaveButton) {
    (tournLeaveButton as HTMLButtonElement).disabled = true;
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
          (tournLeaveButton as HTMLButtonElement).disabled = true;
          buttonSetter(MetaGameState.nothing);
        }
        else {
          console.error("failed to leave tournament:", resOfLeaveObj.err);
        }
        await fillInTheTournTable(tournAllInfoRespObj, bracketSize);
      });
    }
    else {
      console.warn("just checked and you don't participate in anything OR you admin the thing:", checkPartRespObj.err);
      (tournLeaveButton as HTMLButtonElement).disabled = true;
      noparticipateFlag = true;
    }
  }
  
  if ((noadminFlag === true) && (noparticipateFlag === true)) {
    let metaInfo = await getGameMetaInfo();
    const gameInfo = document.getElementById("game-info");
    if (gameInfo) {
      await setterUponMetaInfo(gameInfo, metaInfo);
    }
  }

  await fillInTheTournTable(tournAllInfoRespObj, bracketSize);
}


async function fillInTheTournTable(tournAllInfoRespObj, bracketSize = 8) {
  console.log("=== TOURNAMENT DEBUG INFO ===");
  console.log("Filling in tournament table with bracket size:", bracketSize);
  
  if (tournAllInfoRespObj.err !== "nil") {
    document.getElementById("tourn-title")!.innerHTML = "<i>" + t('tournaments.noTournaments') + "</i>";
    document.getElementById("tourn-id")!.innerHTML = "";
    const bt = document.getElementById("big-table");
    if (bt) {
      bt.innerHTML = "";
    }
    return;
  }

  const tourn = tournAllInfoRespObj.res;
  if (typeof tourn === "undefined") {
    console.error("weird error occured: tour is undefined, although no err received");
    return;
  }

  console.log("Complete tournament object:", tourn);
  console.log("Tournament Ids structure:", tourn.Ids);
  console.log("Number of levels in Ids:", tourn.Ids ? tourn.Ids.length : 0);
  
  // Log each level
  if (tourn.Ids) {
    tourn.Ids.forEach((level, index) => {
      console.log(`Level ${index}:`, level, `(length: ${level ? level.length : 0})`);
    });
  }

  document.getElementById("tourn-title")!.innerHTML = t('tournaments.tournamentName') + ": " + tourn.tName;
  document.getElementById("tourn-id")!.innerHTML = "id: " + tourn.tId;

  console.log("Tournament size for filling table:", bracketSize);
  
  // For 2-player bracket
  if (bracketSize === 2) {
    console.log("=== FILLING 2-PLAYER BRACKET ===");
    
    // For 2-player, we just need to find where the 2 initial players are stored
    // Let's check all levels to find the one with exactly 2 players
    let contenderData = null;
    for (let level = 0; level < tourn.Ids.length; level++) {
      if (tourn.Ids[level] && tourn.Ids[level].length >= 2) {
        console.log(`Found potential contenders at level ${level}:`, tourn.Ids[level]);
        contenderData = tourn.Ids[level];
        break; // Use the first level that has at least 2 players
      }
    }
    
    if (contenderData) {
      for (let j = 0; j < 2; j++) {
        const element = document.getElementById(`table-contender-${j + 1}`);
        console.log(`Processing contender ${j + 1}, element:`, element);
        
        if (element && j < contenderData.length && 
            contenderData[j] !== "" && contenderData[j] !== "failed") {
          console.log(`Fetching nickname for player ID: ${contenderData[j]}`);
          let respNn = await getNicknameForPlayerId(contenderData[j]);
          let nnJson = JSON.parse(await respNn.text());
          let nicknameVs = "<i>unknown</i>";
          if (nnJson.err === "nil") {
            nicknameVs = nnJson.nick;
          }
          element.innerHTML = "<b>" + nicknameVs + "</b>";
          console.log(`Set contender ${j + 1} to: ${nicknameVs}`);
        }
        else if (element) {
          element.innerHTML = "<i>" + t('tournaments.empty') + "</i>";
          console.log(`Set contender ${j + 1} to empty`);
        }
      }
    } else {
      console.warn("No contender data found for 2-player tournament");
      for (let j = 0; j < 2; j++) {
        const element = document.getElementById(`table-contender-${j + 1}`);
        if (element) {
          element.innerHTML = "<i>" + t('tournaments.empty') + "</i>";
        }
      }
    }
  }
  // For 4-player bracket
  else if (bracketSize === 4) {
    console.log("=== FILLING 4-PLAYER BRACKET ===");
    
    // For 4-player tournaments, we need semifinals and contenders
    // Semifinals should be in an earlier level, contenders in a later level
    
    // Find semifinals (should be 2 players)
    let semifinalData = null;
    for (let level = 0; level < tourn.Ids.length; level++) {
      if (tourn.Ids[level] && tourn.Ids[level].length >= 2) {
        console.log(`Found potential semifinals at level ${level}:`, tourn.Ids[level]);
        semifinalData = tourn.Ids[level];
        break;
      }
    }
    
    // Fill semifinals
    if (semifinalData) {
      for (let j = 0; j < 2; j++) {
        const element = document.getElementById(`table-semifinal-${j + 1}`);
        console.log(`Processing semifinal ${j + 1}, element:`, element);
        
        if (element && j < semifinalData.length && 
            semifinalData[j] !== "" && semifinalData[j] !== "failed") {
          console.log(`Fetching nickname for semifinal player ID: ${semifinalData[j]}`);
          let respNn = await getNicknameForPlayerId(semifinalData[j]);
          let nnJson = JSON.parse(await respNn.text());
          let nicknameVs = "<i>unknown</i>";
          if (nnJson.err === "nil") {
            nicknameVs = nnJson.nick;
          }
          element.innerHTML = "<b>" + nicknameVs + "</b>";
          console.log(`Set semifinal ${j + 1} to: ${nicknameVs}`);
        } else if (element) {
          element.innerHTML = "<i>" + t('tournaments.empty') + "</i>";
          console.log(`Set semifinal ${j + 1} to empty`);
        }
      }
    }
    
    // Find contenders (should be 4 players)
    let contenderData = null;
    for (let level = 0; level < tourn.Ids.length; level++) {
      if (tourn.Ids[level] && tourn.Ids[level].length >= 4) {
        console.log(`Found potential contenders at level ${level}:`, tourn.Ids[level]);
        contenderData = tourn.Ids[level];
        break;
      }
    }
    
    // Fill contenders
    if (contenderData) {
      for (let j = 0; j < 4; j++) {
        const element = document.getElementById(`table-contender-${j + 1}`);
        console.log(`Processing contender ${j + 1}, element:`, element);
        
        if (element && j < contenderData.length && 
            contenderData[j] !== "" && contenderData[j] !== "failed") {
          console.log(`Fetching nickname for contender player ID: ${contenderData[j]}`);
          let respNn = await getNicknameForPlayerId(contenderData[j]);
          let nnJson = JSON.parse(await respNn.text());
          let nicknameVs = "<i>unknown</i>";
          if (nnJson.err === "nil") {
            nicknameVs = nnJson.nick;
          }
          element.innerHTML = "<b>" + nicknameVs + "</b>";
          console.log(`Set contender ${j + 1} to: ${nicknameVs}`);
        }
        else if (element) {
          element.innerHTML = "<i>" + t('tournaments.empty') + "</i>";
          console.log(`Set contender ${j + 1} to empty`);
        }
      }
    } else {
      console.warn("No contender data found for 4-player tournament");
      // Set all to empty
      for (let j = 0; j < 4; j++) {
        const element = document.getElementById(`table-contender-${j + 1}`);
        if (element) {
          element.innerHTML = "<i>" + t('tournaments.empty') + "</i>";
        }
      }
    }
  }
  // For 8-player bracket
  else {
    console.log("=== FILLING 8-PLAYER BRACKET ===");
    // Keep your existing 8-player logic
    // Fill semifinals first (they're in tourn.Ids[0])
    for (let j = 0; j < 2; j++) {
      const element = document.getElementById(`table-semifinal-${j + 1}`);
      if (element && 0 < tourn.Ids.length && j < tourn.Ids[0].length && 
          tourn.Ids[0][j] !== "" && tourn.Ids[0][j] !== "failed") {
        let respNn = await getNicknameForPlayerId(tourn.Ids[0][j]);
        let nnJson = JSON.parse(await respNn.text());
        let nicknameVs = "<i>unknown</i>";
        if (nnJson.err === "nil") {
          nicknameVs = nnJson.nick;
        }
        element.innerHTML = "<b>" + nicknameVs + "</b>";
      } else if (element) {
        element.innerHTML = "<i>" + t('tournaments.empty') + "</i>";
      }
    }
    
    // Fill quarterfinals next (they're in tourn.Ids[1])
    for (let j = 0; j < 4; j++) {
      const element = document.getElementById(`table-quarterfinal-${j + 1}`);
      if (element && 1 < tourn.Ids.length && j < tourn.Ids[1].length && 
          tourn.Ids[1][j] !== "" && tourn.Ids[1][j] !== "failed") {
        let respNn = await getNicknameForPlayerId(tourn.Ids[1][j]);
        let nnJson = JSON.parse(await respNn.text());
        let nicknameVs = "<i>unknown</i>";
        if (nnJson.err === "nil") {
          nicknameVs = nnJson.nick;
        }
        element.innerHTML = "<b>" + nicknameVs + "</b>";
      } else if (element) {
        element.innerHTML = "<i>" + t('tournaments.empty') + "</i>";
      }
    }
    
    // Fill contenders last (they're in tourn.Ids[2])
    for (let j = 0; j < 8; j++) {
      const element = document.getElementById(`table-contender-${j + 1}`);
      if (element && 2 < tourn.Ids.length && j < tourn.Ids[2].length && 
          tourn.Ids[2][j] !== "" && tourn.Ids[2][j] !== "failed") {
        let respNn = await getNicknameForPlayerId(tourn.Ids[2][j]);
        let nnJson = JSON.parse(await respNn.text());
        let nicknameVs = "<i>unknown</i>";
        if (nnJson.err === "nil") {
          nicknameVs = nnJson.nick;
        }
        element.innerHTML = "<b>" + nicknameVs + "</b>";
      }
      else if (element) {
        element.innerHTML = "<i>" + t('tournaments.empty') + "</i>";
      }
    }
  }
  
  // FINALIST HANDLING - this should work for all tournament sizes
  console.log("=== FILLING FINALIST ===");
  const finRawResp = await getFinalist();
  const finResp = await finRawResp.text();
  const finObj = JSON.parse(finResp);
  console.log("Finalist response:", finObj);
  
  if (finObj.err === "nil") {
    const element = document.getElementById('table-finalist');
    if (element) {
      if (finObj.res !== "") {
        const finId = finObj.res;
        console.log(`Fetching nickname for finalist ID: ${finId}`);
        let respNn = await getNicknameForPlayerId(finId);
        let nnJson = JSON.parse(await respNn.text());
        let nicknameVs = "<i>unknown</i>";
        if (nnJson.err === "nil") {
          nicknameVs = nnJson.nick;
        }
        element.innerHTML = "<b>" + nicknameVs + "</b>";
        console.log(`Set finalist to: ${nicknameVs}`);
      }
      else {
        element.innerHTML = t('tournaments.final');
        console.log("Set finalist to default text");
      }
    }
  }
  else {
    console.error("finalist lookup error:", finObj.err);
  }
  
  console.log("=== TOURNAMENT FILL COMPLETE ===");
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
  const allPTRObj = JSON.parse(allPTR);
  let count : number = 0;
  let tempInner : string = `
    <table class="min-w-full divide-y divide-gray-700">
    <thead>
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-white-300 tracking-wider">${t("tournaments.tournamentName")}</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-white-300 tracking-wider">${t("tournaments.players")}</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-white-300 tracking-wider">${t("tournaments.join")}</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-700 bg-gray-800 rounded-lg">
`;
  if (!allPTRObj || !allPTRObj.res) {
  tempInner += `
      <tr>
        <td colspan="3" class="px-6 py-4 whitespace-nowrap text-center">
          <i>${t('tournaments.noTournaments')}</i>
        </td>
      </tr>
    </tbody>
  </table>
  `;
  allTournamentsTable!.innerHTML = tempInner;
  return;
}
  for (var item of allPTRObj.res) {
  tempInner += `
      <tr class="hover:bg-gray-700 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-white">${item.tName}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-300">${item.joinedPN}/${item.maxPN}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right">
          <button id="join-button-${count}" class="
            px-4 py-2 bg-blue-600 hover:bg-blue-700 
            text-white font-medium rounded-md transition-colors
            disabled:bg-gray-600 disabled:cursor-not-allowed
          ">
            ${t("tournaments.join")}
          </button>
        </td>
      </tr>
  `;
  count += 1;
  }
  allTournamentsTable!.innerHTML = tempInner;
  for (let newCount = 0; newCount < count; newCount += 1) {
    if (!canWeJoin) {
      (document.getElementById(`join-button-${newCount}`) as HTMLButtonElement)!.disabled = true;
    }
    else {
      console.warn("can't join count:", newCount);
      (document.getElementById(`join-button-${newCount}`) as HTMLButtonElement)!.disabled = false;
    }
    document.getElementById(`join-button-${newCount}`)!.addEventListener('click', async () => {
      const rawResOfEnroll = await enrollInTournament(allPTRObj.res[newCount].tId);
      const resOfEnroll = await rawResOfEnroll.text();
      const resOfEnrollObj = JSON.parse(resOfEnroll);
      if (resOfEnrollObj.err === "nil") {
        localStorage.setItem("tId", allPTRObj.res[newCount].tId);
        for (let newerCount = 0; newerCount < count; newerCount += 1) {
          let currentJB = document.getElementById(`join-button-${newerCount}`);
          if (currentJB) {
            (currentJB as HTMLButtonElement).disabled = true;
          }
        }
        buttonSetter(MetaGameState.waittouropp);
        (document.getElementById('register-tournament-button') as HTMLButtonElement)!.disabled = true;
        (document.getElementById('enter-tournament-by-id-button') as HTMLButtonElement)!.disabled = true;
        const myTournamentField = document.getElementById('my-tournament');
        if (myTournamentField) {
          myTournamentField.textContent = t("tournaments.view");
          myTournamentField.classList.remove("bg-gray-700");
          myTournamentField.classList.add("bg-blue-600", "hover:bg-blue-700");
          myTournamentField.removeAttribute("disabled");
          myTournamentField.onclick = () => {
            window.location.hash = "tournament";
        }
      }
        
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
    <div>
      <button type="button"
        class="w-full px-4 py-2 text-white bg-gray-700 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none"
        id="my-tournament"
        disabled>
        ${t("tournaments.noTournaments")}
      </button>
    </div>
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
          (document.getElementById('enter-tournament-by-id-button') as HTMLButtonElement).disabled = true;
          const rawCreateTournamentResp = await createTournament(tnameEl.value, playersEl.value, checkboxEl.checked);
          const tourResp = await rawCreateTournamentResp.text();
          const tourRespObj = JSON.parse(tourResp);
          if (tourRespObj.err === "nil") {
            canWeJoin = false;
            // myTournamentField.innerHTML = "<a href=\"" + document.URL.substring(0, document.URL.search("#")) + "#tournament" + "\"><b><i>" + t("tournaments.view") + "</b></i></a>";
            myTournamentField!.textContent = t("tournaments.view");
            myTournamentField!.classList.remove("bg-gray-700");
            myTournamentField!.classList.add("bg-blue-600", "hover:bg-blue-700");
            myTournamentField!.removeAttribute("disabled");
            myTournamentField!.addEventListener("click", () => {
              window.location.hash = "tournament";
            });
            localStorage.setItem('tId', tourRespObj.tId);
            buttonSetter(MetaGameState.waittouropp);
          }
          else {
            console.error("Tournament creation error: " + tourRespObj.err + "; tId (if available): " + tourRespObj.tId);
            submitButton.removeAttribute('disabled');
            document.getElementById('enter-tournament-by-id-button')!.removeAttribute("disabled");
            canWeJoin = true;
          }
          tournamentForm.reset();
          await generateUpdateAllTourTable(canWeJoin);
        });
      }
      else {
        console.warn("can't allow generating a tournament");
        canWeJoin = false;
        localStorage.setItem('tId', checkPartRespObj.tId);
        submitButton.disabled = true;
        (document.getElementById('enter-tournament-by-id-button') as HTMLButtonElement).disabled = true;
        myTournamentField!.textContent = t("tournaments.view");
        myTournamentField!.classList.remove("bg-gray-700");
        myTournamentField!.classList.add("bg-blue-600", "hover:bg-blue-700");
        myTournamentField!.removeAttribute("disabled");
        myTournamentField!.addEventListener("click", () => {
          window.location.hash = "tournament";
        });
        // myTournamentField.innerHTML = "<a href=\"" + document.URL.substring(0, document.URL.search("#")) + "#tournament" + "\"><b><i>" + t("tournaments.view") + "</b></i></a>";
      }
    }
    if (joinByIDForm) {
      const enterByIdButton = document.getElementById('enter-tournament-by-id-button') as HTMLButtonElement;
      if (checkPartRespObj.err !== "nil" && canWeJoin) {
        enterByIdButton.removeAttribute('disabled');
        // "no tournament for this player found" => proceed with allowing to create the tournament
        joinByIDForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const tidEl = document.getElementById('tid') as HTMLInputElement;
          (document.getElementById('register-tournament-button') as HTMLButtonElement).disabled = true;
          enterByIdButton.disabled = true;
          const rawResOfEnroll = await enrollInTournament(tidEl.value);
          const resOfEnroll = await rawResOfEnroll.text();
          const resOfEnrollObj = JSON.parse(resOfEnroll);
          if (resOfEnrollObj.err === "nil") {
            canWeJoin = false;
            // myTournamentField.innerHTML = "<a href=\"" + document.URL.substring(0, document.URL.search("#")) + "#tournament" + "\"><b><i>" + t("tournaments.view") + "</b></i></a>";
            myTournamentField!.textContent = t("tournaments.view");
            myTournamentField!.classList.remove("bg-gray-700");
            myTournamentField!.classList.add("bg-blue-600", "hover:bg-blue-700");
            myTournamentField!.removeAttribute("disabled");
            localStorage.setItem("tId", tidEl.value);
            buttonSetter(MetaGameState.waittouropp);
          }
          else {
            console.error("failed to enroll in " + tidEl.value + " because: " + resOfEnrollObj.err);
            document.getElementById('register-tournament-button')!.removeAttribute("disabled");
            enterByIdButton.removeAttribute("disabled");
            canWeJoin = true;
          }
          joinByIDForm.reset();
          await generateUpdateAllTourTable(canWeJoin);
        });
      }
      else {
        console.warn("can't allow joining a tournament");
        canWeJoin = false;
        localStorage.setItem('tId', checkPartRespObj.tId);
        (document.getElementById('register-tournament-button') as HTMLButtonElement).disabled = true;
        (enterByIdButton as HTMLButtonElement).disabled = true;
        // myTournamentField.innerHTML = "<a href=\"" + document.URL.substring(0, document.URL.search("#")) + "#tournament" + "\"><b><i>" + t("tournaments.view") + "</b></i></a>";
        myTournamentField!.textContent = t("tournaments.view");
        myTournamentField!.classList.remove("bg-gray-700");
        myTournamentField!.classList.add("bg-blue-600", "hover:bg-blue-700");
        myTournamentField!.removeAttribute("disabled");
        myTournamentField!.addEventListener("click", () => {
          window.location.hash = "tournament";
        });
      }
    }
  }

  await generateUpdateAllTourTable(canWeJoin);
}