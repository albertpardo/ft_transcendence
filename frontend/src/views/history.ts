// src/views/history.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getHistoryForPlayerId(userId: string) {
  const response = await fetch(
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
  );
  return (response);
}

export async function getNicknameForPlayerId(userId: string) {
  const response = await fetch(
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
  );
  return (response);
}

export async function renderHistoryContent(hideableElements) {
  let tempInnerHTML : string = `
    <h1 class="text-3xl font-bold mb-6">Match History</h1>
    <p class="mb-4">History of matches</p>
    <table class="table-fixed"><tbody><tr>
    <th>Date</th>
    <th>Opponent</th>
    <th>Side</th>
    <th>Type</th>
    <th>Score</th>
    <th>Result</th>
    </tr>
  `;
  // TODO FIXME spam protection? cache the thing maybe? make it independently get downloaded in the background once every something minutes.
  const rawHist = await getHistoryForPlayerId(localStorage.getItem('userId'));
  const rawHistBody = await rawHist.text();
  const parsedHist = JSON.parse(rawHistBody);
  for (const entry of parsedHist) {
    const idL : string = entry.leftId;
    const idR : string = entry.rightId;
    let side : string = "";
    let nicnknameVs : string = "unknown";
    let res : string = "";
    if (localStorage.getItem('userId') === idL) {
      if (entry.winner === "L") {
        if (entry.finish === "forefit") {
          res = "Win (enemy forefit)";
        }
        else {
          res = "Win";
        }
      }
      else {
        if (entry.finish === "forefit") {
          res = "Loss (forefit)";
        }
        else {
          res = "Loss";
        }
      }
      side = "Left";
      let respNn = await getNicknameForPlayerId(idR);
      nicnknameVs = JSON.parse(await respNn.text())?.nickname;
    }
    else {
      if (entry.winner === "R") {
        if (entry.finish === "forefit") {
          res = "Win (enemy forefit)";
        }
        else {
          res = "Win";
        }
      }
      else {
        if (entry.finish === "forefit") {
          res = "Loss (forefit)";
        }
        else {
          res = "Loss";
        }
      }
      side = "Right";
      let respNn = await getNicknameForPlayerId(idL);
      nicnknameVs = JSON.parse(await respNn.text())?.nickname;
    }
    const thisdate = new Date(entry.date);
    tempInnerHTML += `<tr>
      <td>${thisdate.toDateString()}, ${thisdate.toTimeString()}</td>
      <td>${nicnknameVs}</td>
      <td>${side}</td>
      <td>${entry.gameType}</td>
      <td>${entry.scoreL} : ${entry.scoreR}</td>
      <td>${res}</td>
      </tr>
    `;
  }
  hideableElements.contentArea.innerHTML = tempInnerHTML;
  hideableElements.gameArea.setAttribute("class", "md:hidden flex flex-col items-center justify-center");
}

