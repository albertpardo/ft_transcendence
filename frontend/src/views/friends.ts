// src/views/friends.ts
import { t } from '../i18n'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function renderFriendsContent(hideableElements) {
  let tempInnerHTML : string = `
    <h1 class="text-3xl font-bold mb-6" >Friends</h1>
	<div class="flex flex-col items-center gap-6 p-7 md:flex-row md:gap-8 rounded-2xl">
        <input id="tfriendnick" name="tfriendnick" type="text" required 
	      class="w-full px-3 py-2 text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Friend's Nickname">
	    </input>
      <button id="add-friend"
        class="w-full p-2 bg-blue-500 rounded-lg hover:bg-blue-400 transition text-white font-medium disabled:border-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none">
        Add friend
      </button>
	</div>
  `;

//falta el manejador del botón "Add friend"
  // Errores : si el nickname no está o si falla el ADD

  // Hacer la consulta al backend/user_management 
  // Si falla -> ERROR en tempInnerHTML

  // Si NO falla -> componer las filas

  tempInnerHTML += `
	<table class="table-fixed">
 	  <thead>
        <tr>
   	      <th>Friend's Nickname</th>
   	      <th>Status</th>
   	    </tr>
	  </thead>
  `;
//  Componer filas Al igual poner 🟢 o 🔴 para saber el estado
  //  formato
  //  <tbody>
  //  PAra cada fila
  //    <tr>
  //      <td> uno </td>
  //      <td> dos </td>
  //    </tr>
  //Fin fila
  //  </tbody>
  //
  tempInnerHTML += `
	</table>
  `;
  hideableElements.contentArea.innerHTML = tempInnerHTML;
  hideableElements.buttonArea.hidden = true;
  hideableElements.gameArea.classList.add("hidden");
  hideableElements.gameWindow.hidden = true;
}
