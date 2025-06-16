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

async function getNicknameForPlayerId(userId: string) {
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

export async function renderHistoryContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  let tempInnerHTML : string = `
    <h1 class="text-3xl font-bold mb-6">Match History</h1>
    <p class="mb-4">History of matches</p>
    <table class="table-fixed"><tbody><tr>
    <th>Date</th>
    <th>Opponent</th>
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
    // fallbacks for if getNickname fails I guess
    let nicknameL : string = idL;
    let nicknameR : string = idR;
    const respNickL = await getNicknameForPlayerId(idL);
    const respNickLBody = await respNickL.text();
    nicknameL = JSON.parse(respNickLBody)?.nickname;
    const respNickR = await getNicknameForPlayerId(idR);
    const respNickRBody = await respNickR.text();
    nicknameR = JSON.parse(respNickRBody)?.nickname;
    const thisdate = new Date(entry.date);
    tempInnerHTML += `<tr>
      <td>${thisdate.toDateString()}, ${thisdate.toTimeString()}</td>
      <td>${localStorage.getItem('userId') === idL ? nicknameR : nicknameL}</td>
      <td>${entry.scoreL} : ${entry.scoreR}</td>
      <td>${localStorage.getItem('userId') === idL ? (entry.scoreL > entry.scoreR ? "Victory" : "Loss") : (entry.scoreL < entry.scoreR ? "Victory" : "Loss")}</td>
      </tr>
    `;
  }
  el.innerHTML = tempInnerHTML;
  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true;
}

