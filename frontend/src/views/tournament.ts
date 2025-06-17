// src/views/tournament.ts

export function renderTournamentContent(hideableElements) {
  let tempHTML : string = `
    <h1>Hi</h1>
  `;
  hideableElements.contentArea.innerHTML = tempHTML;
  hideableElements.startButton.hidden = true;
  hideableElements.giveupButton.hidden = true;
  hideableElements.gameArea.hidden = true;
  hideableElements.gameWindow.hidden = true;
}

export function renderTournamentManagerContent(hideableElements) {
  let tempHTML : string = `
    <h1 class="text-3xl font-bold mb-6">Tournament management</h1>
    <p class="mb-4">You're already participating in a tournament</p>
    <p class="mb-4">Create a tournament:</p>
    <!-- form form form XXX -->

    <p class="mb-4">My tournaments:</p>
    <table class="table-fixed"><tbody>
    </tbody></table>

    <p class="mb-4">All tournaments:</p>
    <table class="table-fixed"><tbody>
    </tbody></table>

    <table class="table-fixed"><tbody>
      <tr>
        <td>contender 1</td>
        <td rowspan="2">quarterfinal 1</td>
        <td rowspan="4">semifinal 1</td>
        <td rowspan="8">finalist!</td>
      </tr>
      <tr>
        <td>contender 2</td>
      </tr>
      <tr>
        <td>contender 3</td>
        <td rowspan="2">quarterfinal 2</td>
      </tr>
      <tr>
        <td>contender 4</td>
      </tr>
      <tr>
        <td>contender 5</td>
        <td rowspan="2">quarterfinal 3</td>
        <td rowspan="4">semifinal 2</td>
      </tr>
      <tr>
        <td>contender 6</td>
      </tr>
      <tr>
        <td>contender 7</td>
        <td rowspan="2">quarterfinal 4</td>
      </tr>
      <tr>
        <td>contender 8</td>
      </tr>
    </tbody>
    </table>
  `;
  hideableElements.contentArea.innerHTML = tempHTML;
  hideableElements.startButton.hidden = true;
  hideableElements.giveupButton.hidden = true;
  hideableElements.gameArea.hidden = true;
  hideableElements.gameWindow.hidden = true;
}
