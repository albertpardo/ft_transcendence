// src/views/friends.ts
import { t } from '../i18n'

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
    <h1 class="text-3xl font-bold mb-6" >Friends</h1>
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
  `;

//  hideableElements.contentArea.innerHTML = tempInnerHTML;
  
  const addFriendButton = document.getElementById("add-friend");

  addFriendButton.addEventListener("click", async () => {
	  const friendNick = document.getElementById("form-friendnick") as HTMLInputElement;

	  alert(`${friendNick.value}`);
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
          console.log("!response.ok -- Failed to add Friend's Nickname.");  
          alert("!response.ok -- Failed to add Friend's Nickname.");
		}
	  } catch (err) {
        console.error("Error adding your friend's Nickname:", err);
		alert("An error occured while adding the friend's nickname.");
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
      //    el.innerHTML += `<p class="text-red-500">Failed to fetch friends data.</p>`;
	  console.error("Failed to fetch friends data.");
    } else {
      friendsData = await res.json();
	  console.log('🎸🎸🎸Received friend data:', friendsData);
	}
  } catch (err) {
    console.error(err);
//    el.innerHTML += `<p class="text-red-500">Error loading friends. Please try again later.</p>`;
    return;
  }

//falta el manejador del botón "Add friend"
  // Errores : si el nickname no está o si falla el ADD

  // Hacer la consulta al backend/user_management 
  // Si falla -> ERROR en tempInnerHTML

  // Si NO falla -> componer las filas

/*
  el.innerHTML += `
	<table class="table-fixed">
 	  <thead>
        <tr>
   	      <th>Friend's Nickname</th>
   	      <th>Status</th>
   	    </tr>
	  </thead>
  `;
 */
//  Componer filas poner 🟢 o 🔴 para saber el estado en lugar del texto recibido
  //  formato
  //  <tbody>
  //  PAra cada fila
  //    <tr>
  //      <td> Nick </td>
  //      <td> Estado </td>
  //    </tr>
  //Fin fila
  //  </tbody>
  //
/*
  el.innerHTML += `
	</table>
  `;
*/
}
