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


    async function getNicknameForPlayerId(userId: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/nickname`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) return "Player 1";

    const data = await response.json();
    return data?.nickname || data?.username || 'Player 1';
  } catch (err) {
    console.error('Error fetching nickname:', err);
    return "Player 1";
  }
}


export async function renderHistoryContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  // ✅ Clear and hide game elements
  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true;

  el.innerHTML = '';

  const userId = localStorage.getItem('userId');
  if (!userId) {
    el.innerHTML = `<p class="text-red-500">${t('historic.notLoggedIn')}</p>`;
    return;
  }

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    el.innerHTML = `<p class="text-red-500">${t('historic.noAuthToken')}</p>`;
    return;
  }

  let tempInnerHTML = `
    <h1 class="text-3xl font-bold mb-6 text-white">${t('historic.title')}</h1>
    <p class="mb-4 text-white">${t('historic.description')}</p>
    <div class="flex justify-center">
      <table class="table-fixed border-separate border-spacing-x-6 bg-gray-900 text-white w-auto">
        <thead>
          <tr>
            <th class="px-6 py-3 text-center">${t('historic.result')}</th>
            <th class="px-6 py-3 text-center">${t('historic.score')}</th>
            <th class="px-6 py-3 text-center">${t('historic.opponent')}</th>
            <th class="px-6 py-3 text-center">${t('historic.date')}</th>
          </tr>
        </thead>
        <tbody>
  `;

  try {
    // ✅ Get history
    const rawHist = await getHistoryForPlayerId(userId);
    if (!rawHist.ok) {
      throw new Error(`Failed to fetch history: ${rawHist.status}`);
    }
    const rawHistBody = await rawHist.text();
    const parsedHist = JSON.parse(rawHistBody);

    if (!Array.isArray(parsedHist)) {
      throw new Error('Invalid history data');
    }

    for (const entry of parsedHist) {
      const idL = entry.leftId;
      const idR = entry.rightId;

      if (!idL || !idR) continue;

      let nicknameL = await getNicknameForPlayerId(idL);
      let nicknameR = await getNicknameForPlayerId(idR);

      const isLocalLeft = userId === idL;
      const localScore = isLocalLeft ? entry.scoreL : entry.scoreR;
      const oppScore = isLocalLeft ? entry.scoreR : entry.scoreL;
      const opponent = isLocalLeft ? nicknameR : nicknameL;
      const didWin = localScore > oppScore;
      const resultText = didWin ? `${t('historic.victory')}` : `${t('historic.loss')}`;
      const resultColorClass = didWin ? 'text-green-400 font-semibold' : 'text-red-500 font-semibold';

      const thisdate = new Date(entry.date);
      const formattedDate = thisdate.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'numeric',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/,/g, '');

      tempInnerHTML += `
        <tr>
          <td class="${resultColorClass} text-center">${resultText}</td>
          <td class="text-center">${localScore} : ${oppScore}</td>
          <td class="text-center">${opponent}</td>
          <td class="text-center">${formattedDate}</td>
        </tr>
      `;
    }
  } catch (err) {
    console.error('❌ Failed to render history:', err);
    tempInnerHTML += `
      <tr>
        <td colspan="4" class="text-red-400 text-center p-4">
          ${t('historic.failedToLoad')}
        </td>
      </tr>
    `;
  }

  tempInnerHTML += `
        </tbody>
      </table>
    </div>
  `;

  el.innerHTML = tempInnerHTML;
}