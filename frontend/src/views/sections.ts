import { route } from '../router';


export function renderHomeContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {


   el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Welcome to Transcendence!</h1>
    <p class="mb-4">Sección de inicio con texto e imagen de prueba.</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg mb-6" alt="Demo">
  `;

  bu.classList.add('hidden');
  gArea.classList.add('hidden');
  gWin.classList.add('hidden');

}

export function renderPlayContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
  `;
  // on this view, show the button and the registered games list
 /*  bu.hidden = false;
  gArea.hidden = false;
  gWin.hidden = false; */
  bu.classList.remove('hidden');
  gArea.classList.remove('hidden');
  gWin.classList.remove('hidden');
}

export function renderTournamentContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Tournaments</h1>
    <p class="mb-4">Tournaments (texto de ejemplo).</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg" alt="Tournament">
  `;
 /*  bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true; */
  bu.classList.add('hidden');
  gArea.classList.add('hidden');
  gWin.classList.add('hidden');
}

export function renderStatsContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Stats</h1>
    <p class="mb-4">Stats (texto de ejemplo).</p>
    <img src="https://placehold.co/1000x400/444444/ffffff?text=Demo" class="w-full rounded-lg" alt="Stats">
  `;
  /* bu.hidden = true;
  gArea.hidden = true;
  gWin.hidden = true; */
  bu.classList.add('hidden');
  gArea.classList.add('hidden');
  gWin.classList.add('hidden');
}

