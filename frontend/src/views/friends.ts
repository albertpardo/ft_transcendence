// src/views/friends.ts
import { t } from '../i18n'

function renderFriendsTable(friends: Friend[]) {
  const tbody = document.querySelector<HTMLTableSectionElement>("table tbody");
  if (!tbody) return;

  tbody.innerHTML = ""; // limpiar antes de renderizar

  friends.forEach(friend => {
    const row = document.createElement("tr");

    const nickCell = document.createElement("td");
    nickCell.textContent = friend.nickname;

    const statusCell = document.createElement("td");
	if (friend.status === "online") statusCell.textContent = "🟢";
	else statusCell.textContent = "🔴";

    row.appendChild(nickCell);
    row.appendChild(statusCell);
    tbody.appendChild(row);
  });
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

  let friendsData;
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Friends</h1>
	<div class="flex flex-col items-center gap-6 p-7 md:flex-row md:gap-8 rounded-2xl">
        <input id="form-friendnick" name="tfriendnick" type="text" required 
	      class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Friend's Nickname">
	    </input>
      <button id="add-friend" type="submit"
        class="w-full p-2 bg-blue-500 rounded-lg hover:bg-blue-400 transition text-white font-medium disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none" >
        Add friend
      </button>
	</div>
    <p id="errorArea1" class="text-red-500"></p>
	<table class="table-fixed">
 	  <thead>
        <tr>
   	      <th>Friend's Nickname</th>
   	      <th>Status</th>
   	    </tr>
	  </thead>
      <tbody>
      </tbody>
	</table>
  `;

  const addFriendButton = document.getElementById("add-friend") as HTMLButtonElement;
  const errorContent = document.getElementById("errorArea1") as HTMLParagraphElement;
  const friendNick = document.getElementById("form-friendnick") as HTMLInputElement;

  friendNick.addEventListener("focus", () => {
    const errorContent = document.getElementById("errorArea1");

	errorContent.textContent = "";
  });

  addFriendButton.addEventListener("click", async () => {
	  const friendNick = document.getElementById("form-friendnick") as HTMLInputElement;

	 // alert(`${friendNick.value}`);
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
		  errorContent.textContent = t("friendsMsg.addFailed");
          console.log("!response.ok -- ", t("friendsMsg.addFailed"));  
          //alert("!response.ok -- Failed to add Friend's Nickname.");
		}
	  } catch (err) {
        errorContent.textContent = t("friendsMsg.addError");
		console.error(t("friendsMsg.addError"), err);
		//alert("An error occured while adding the friend's nickname.");
      }
  });

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
	  errorContent.textContent = t("friendsMsg.getFailed");
	  console.error(t("friendsMsg.getFailed"));
    } else {
      friendsData = await res.json();
	  console.log('🎸🎸🎸Received friend data:', friendsData);
      renderFriendsTable(friendsData);
	}
  } catch (err) {
    console.error(err);
	errorContent.textContent = t("friendsMsg.getError");
    return;
  }
}
