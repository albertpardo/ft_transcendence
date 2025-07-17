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
  <h1 class="text-3xl font-bold mb-6 text-white">Match History</h1>
  <p class="mb-4 text-white">History of matches</p>
  <div class="flex justify-center">
    <table class="table-fixed border-separate border-spacing-x-6 bg-gray-900 text-white w-auto">
      <thead>
        <tr>
          <th class="px-6 py-3 text-center">Result</th>
          <th class="px-6 py-3 text-center">Score</th>
          <th class="px-6 py-3 text-center">Opponent</th>
          <th class="px-6 py-3 text-center">Date</th>
        </tr>
      </thead>
      <tbody>
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

    const isLocalLeft = localStorage.getItem('userId') === idL;
    const localScore = isLocalLeft ? entry.scoreL : entry.scoreR;
    const oppScore = isLocalLeft ? entry.scoreR : entry.scoreL;
    const opponent = isLocalLeft ? nicknameR : nicknameL;
    const didWin = localScore > oppScore;
    const resultText = didWin ? 'Victory' : 'Loss';
    const resultColorClass = didWin ? 'text-green-400 font-semibold' : 'text-red-500 font-semibold';

    const thisdate = new Date(entry.date);
    const formattedDate = thisdate.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'numeric',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '').replace(',', ''); 
    // const rowClass = entry.win ? 'text-green-400' : 'text-red-500';
    const rowClass = ''; 
    tempInnerHTML += `<tr class="${rowClass}">
      <td class="${resultColorClass} text-center">${resultText}</td>
      <td class="text-center">${localScore} : ${oppScore}</td>
      <td class="text-red-500 text-center">${opponent}</td>
      <td class="text-center">${formattedDate}</td>
    </tr>`;


  }
  el.innerHTML = tempInnerHTML;
  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true;
}

