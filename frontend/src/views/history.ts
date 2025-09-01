// src/views/history.ts
import { t, i18nReady } from '../i18n';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getHistoryForPlayerId(userId: string) {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    throw new Error('No auth token found');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/pong/hist`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json,application/html,text/html,*/*',
        'Origin': 'https://127.0.0.1:3000/',
        'Authorization': 'Bearer ' + authToken,
      },
      body: JSON.stringify({ userId }),
      credentials: 'include',
      mode: 'cors',
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

export async function getNicknameForPlayerId(userId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/public/nickname`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ userId }),
    }
  );
  return response;
}

export async function renderHistoryContent(hideableElements) {
  try {
    await i18nReady;
  } catch (err) {
    console.error('i18n not ready, using fallback keys:', err);
  }

  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');

  if (!userId) {
    hideableElements.contentArea.innerHTML = `<p class="text-red-500">${t('historic.notLoggedIn')}</p>`;
    hideableElements.buttonArea.hidden = true;
    hideableElements.gameArea.classList.add("hidden");
    hideableElements.gameWindow.hidden = true;
    return;
  }

  if (!authToken) {
    hideableElements.contentArea.innerHTML = `<p class="text-red-500">${t('historic.noAuthToken')}</p>`;
    hideableElements.buttonArea.hidden = true;
    hideableElements.gameArea.classList.add("hidden");
    hideableElements.gameWindow.hidden = true;
    return;
  }

  let tempInnerHTML = `
    <h1 class="text-3xl font-bold mb-6">${t('historic.title')}</h1>
    <p class="mb-4">${t('historic.description')}</p>
    <div class="flex justify-center">
      <table class="table-fixed border-separate border-spacing-x-6 bg-gray-900 text-white w-auto">
        <thead>
          <tr>
            <th class="text-center">${t('historic.date')}</th>
            <th class="text-center">${t('historic.opponent')}</th>
            <th class="text-center">${t('historic.side')}</th>
            <th class="text-center">${t('historic.type')}</th>
            <th class="text-center">${t('historic.score')}</th>
            <th class="text-center">${t('historic.result')}</th>
          </tr>
        </thead>
        <tbody>
  `;

  try {
    const rawHist = await getHistoryForPlayerId(userId);
    const rawHistBody = await rawHist.text();
    const parsedHist = JSON.parse(rawHistBody);
    
   if (!Array.isArray(parsedHist) || parsedHist.length === 0) {
      tempInnerHTML += `
        <tr>
        <td colspan="6" class="text-gray-400 text-center p-4">
            ${t('historic.noGames')}
          </td>
        </tr>
      `;
    } else {
      for (const entry of parsedHist) {
        const idL = entry.leftId;
        const idR = entry.rightId;
        let side = "";
        let nicknameVs = "unknown";
        let res = "";
        
        const isUserLeft = String(userId) === String(idL);
        const userWon = isUserLeft ? (entry.state === "left") : (entry.state === "right");
        
        if (isUserLeft) {
            if (entry.state === "left") {
              res = entry.finish === "forfeit" ? t("historic.winForfeit") :
                   (entry.finish === "absence" || entry.finish === "technical") ? t("historic.winAbsence") :
                   t("historic.win");
            } else {
              res = entry.finish === "forfeit" ? t("historic.lossForfeit") :
                   (entry.finish === "technical") ? t("historic.lossAbsence") :
                   t("historic.loss");
            }
            // side = "Left";
            side = t('historic.left');
          if (entry.finish !== "absence") {
            const respNn = await getNicknameForPlayerId(idR);
            const nnJson = JSON.parse(await respNn.text());
            nicknameVs = "<i>unknown</i>";
            if (nnJson.err === "nil") {
              nicknameVs = nnJson.nick;
            }
          }
        } else {
          if (entry.state === "right") {
              res = entry.finish === "forfeit" ? t("historic.winForfeit") :
                   (entry.finish === "absence" || entry.finish === "technical") ? t("historic.winAbsence") :
                   t("historic.win");
            } else {
              res = entry.finish === "forfeit" ? t("historic.lossForfeit") :
                   (entry.finish === "technical") ? t("historic.lossAbsence") :
                   t("historic.loss");
            }
            // side = "Right";
            side = t('historic.right');
          if (entry.finish !== "absence") {
            const respNn = await getNicknameForPlayerId(idL);
            const nnJson = JSON.parse(await respNn.text());
            nicknameVs = "<i>unknown</i>";
            if (nnJson.err === "nil") {
              nicknameVs = nnJson.nick;
            }
          }
        }
        

        const resultColorClass = userWon ? 'text-green-400 font-semibold' : 'text-red-500 font-semibold';
        const opponentNameColored = `<span class="text-red-500 font-medium">${nicknameVs}</span>`;
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
            <td class="text-center">${formattedDate}</td>
            <td class="text-center">${opponentNameColored}</td>
            <td class="text-center">${side}</td>
            <td class="text-center">${entry.gameType}</td>
            <td class="text-center">${entry.scoreL} : ${entry.scoreR}</td>
            <td class="text-center ${resultColorClass}">${res}</td>
          </tr>
        `;
      }
    }
  } catch (err) {
    console.error('Failed to render history:', err);
    tempInnerHTML += `
      <tr>
        <td colspan="6" class="text-red-400 text-center p-4">
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

  hideableElements.contentArea.innerHTML = tempInnerHTML;
  hideableElements.buttonArea.hidden = true;
  hideableElements.gameArea.classList.add("hidden");
  hideableElements.gameWindow.hidden = true;
}