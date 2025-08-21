// src/views/history.ts
import { t } from '../i18n'

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
    let nicknameVs : string = "unknown";
    let res : string = "";
    if (localStorage.getItem('userId') === idL) {
      if (entry.winner === "L") {
        if (entry.finish === "forfeit") {
          res = t("historic.winForefit");
        }
        else if (entry.finish === "absence" || entry.finish === "technical") {
          res = t("historic.winAbsence");
        }
        else {
          res = t("historic.win");
        }
      }
      else {
        if (entry.finish === "forfeit") {
          res = t("historic.lossForfeit");
        }
        else if (entry.finish === "technical") {
          res = t("historic.lossAbsence");
        }
        else {
          res = t("historic.loss");
        }
      }
      side = "Left";
      if (entry.finish !== "absence") {
        let respNn = await getNicknameForPlayerId(idR);
        let nnJson = JSON.parse(await respNn.text());
        nicknameVs = "<i>unknown</i>";
        if (nnJson.err === "nil") {
          nicknameVs = nnJson.nick;
        }
      }
    }
    else {
      if (entry.winner === "R") {
        if (entry.finish === "forfeit") {
          res = t("historic.winForefit");
        }
        else if (entry.finish === "absence" || entry.finish === "technical") {
          res = t("historic.winAbsence");
        }
        else {
          res = t("historic.win");
        }
      }
      else {
        if (entry.finish === "forfeit") {
          res = t("historic.lossForfeit");
        }
        else if (entry.finish === "technical") {
          res = t("historic.lossAbsence");
        }
        else {
          res = t("historic.loss");
        }
      }
      side = "Right";
      if (entry.finish !== "absence") {
        let respNn = await getNicknameForPlayerId(idL);
        let nnJson = JSON.parse(await respNn.text());
        nicknameVs = "<i>unknown</i>";
        if (nnJson.err === "nil") {
          nicknameVs = nnJson.nick;
        }
      }
    }
    const thisdate = new Date(entry.date);
    tempInnerHTML += `<tr>
      <td>${thisdate.toDateString()}, ${thisdate.toTimeString()}</td>
      <td>${nicknameVs}</td>
      <td>${side}</td>
      <td>${entry.gameType}</td>
      <td>${entry.scoreL} : ${entry.scoreR}</td>
      <td>${res}</td>
      </tr>
    `;
  }
  hideableElements.contentArea.innerHTML = tempInnerHTML;
  hideableElements.buttonArea.hidden = true;
  hideableElements.gameArea.classList.add("hidden");
  hideableElements.gameWindow.hidden = true;
}
