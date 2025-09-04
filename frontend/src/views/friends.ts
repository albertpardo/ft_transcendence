// src/views/friends.ts
import { t } from '../i18n'

interface Friend {
  nickname: string;
  status: string;
}

function renderFriendsTable(friends: Friend[]) {
  const tbody = document.querySelector<HTMLTableSectionElement>("table tbody");
  if (!tbody) return;

  tbody.innerHTML = ""; // limpiar antes de renderizar

  friends.forEach(friend => {
    const row = document.createElement("tr");

    const nickCell = document.createElement("td");
    nickCell.textContent = friend.nickname;

    const statusCell = document.createElement("td");
    statusCell.className = "text-center";
	if (friend.status === "online") statusCell.textContent = "🟢";
	else statusCell.textContent = "🔴";

    row.appendChild(nickCell);
    row.appendChild(statusCell);
    tbody.appendChild(row);
  });
}
 
async function getFriendsAndRenderFriendsTable( authstringheader : string, API_BASE_URL: string, errorContent: HTMLElement) {
  let friendsData;

  try {
    const res = await fetch(`${API_BASE_URL}/api/friends`, {
      method: 'GET',
      headers: {
        "Use-me-to-authorize": authstringheader,
        "Content-Type": "application/json",
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!res.ok) {
	    errorContent.textContent = t("friendsTxt.getFailed");
	    console.error(t("friendsTxt.getFailed"));
    } else {
      friendsData = await res.json();
      renderFriendsTable(friendsData);
	  }
  } catch (err) {
    console.error(err);
	  errorContent.textContent = t("friendsTxt.getError");
    return;
  }
}

export async function renderFriendsContent(hideableElements) {
  hideableElements.buttonArea.hidden = true;
  hideableElements.gameArea.classList.add("hidden");
  hideableElements.gameWindow.hidden = true;
  const el = hideableElements.contentArea;

  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  const authToken : string = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  if (!authToken) {
    el.innerHTML = `<p class="text-red-500">${t("profiles.not_logged_in")}</p>`;
    return;
  }

  const authstringheader : string = "Bearer " + authToken;

  el.innerHTML = `
    <div class="w-full flex flex-col items-center gap-6 p-7 md:flex-row md:gap-8 rounded-2xl">
      <h1 class="w-full text-3xl font-bold mb-6 whitespace-nowrap">${t("friends")}</h1>
        <button id="refresh"
          class="text-3xl p-2 bg-blue-500 rounded-lg hover:bg-blue-400 transition text-white font-medium disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none">
          ⟳
        </button>
    </div>
    <div class="w-full flex flex-col items-center gap-6 p-7 md:flex-row md:gap-8 rounded-2xl">
      <input id="form-friendnick" name="tfriendnick" type="text" required 
        class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder=${t("friendsTxt.nickTxt")}>
	    </input>
      <button id="add-friend" type="submit"
        class="w-full p-2 bg-blue-500 rounded-lg hover:bg-blue-400 transition text-white font-medium disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none" >
        ${t("friendsTxt.addBtn")}
      </button>
	  </div>
    <p id="errorArea1" class="text-red-500"></p>
  <table class="min-w-full divide-y divide-gray-700">
  <thead>
    <tr>
      <th class="px-0 py-3 text-left text-xs font-medium text-white-300 tracking-wider">${t("friendsTxt.nickRow")}</th>
      <th class="px-0 py-3 text-center text-xs font-medium text-white-300 tracking-wider w-16">${t("friendsTxt.statusRow")}</th>
 
    </tr>
  </thead>
  <tbody >
  </tbody>
    </table>
`;

  const refreshButton = document.getElementById("refresh") as HTMLButtonElement;
  const addFriendButton = document.getElementById("add-friend") as HTMLButtonElement;
  const errorContent = document.getElementById("errorArea1") as HTMLParagraphElement;
  const friendNick = document.getElementById("form-friendnick") as HTMLInputElement;

  refreshButton.addEventListener("click", async () => {
    getFriendsAndRenderFriendsTable(authstringheader, API_BASE_URL, errorContent );
  });
  
  friendNick.addEventListener("focus", () => {
	  errorContent.textContent = "";
  });

  addFriendButton.addEventListener("click", async () => {
	  const friendNick = document.getElementById("form-friendnick") as HTMLInputElement;

	  const updatedData: {
        nick: string;
    } = {
        nick: friendNick.value
	  }
      
	  try {
      const response = await fetch(`${API_BASE_URL}/api/friends`, {
        method: "PUT",
        headers: { 
          "Use-me-to-authorize": authstringheader,
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });
	  	if (!response.ok) {
		    errorContent.textContent = t("friendsTxt.addFailed");
        console.error("!response.ok -- ", t("friendsTxt.addFailed"));  
	  	}
	  } catch (err) {
      errorContent.textContent = t("friendsTxt.addError");
		  console.error(t("friendsTxt.addError"), err);
    }
  });

  getFriendsAndRenderFriendsTable(authstringheader, API_BASE_URL, errorContent );
}
