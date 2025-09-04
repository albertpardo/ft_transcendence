import { route } from '../router';
import { getGameMetaInfo, setterUponMetaInfo } from './dashboard';
import { t } from '../i18n';

export function renderHomeContent(hideableElements) {
  hideableElements.buttonArea.hidden = true;
  hideableElements.gameArea.classList.add("hidden");
  hideableElements.gameWindow.hidden = true;
  const el = hideableElements.contentArea;
  const bu = hideableElements.buttonArea;
  const gArea = hideableElements.gameArea;
  const gWin = hideableElements.gameWindow;
  el.innerHTML = `
    <h1 class="text-3xl font-bold mb-6 text-center">${t('welcome')} 👋</h1>
   <!-- <p class="mb-4 text-center">${t('home.intro')}</p> -->

    <!-- Language Switcher -->
    <div id="lang-switcher" class="mt-8 p-4 bg-gray-800 rounded-lg text-white text-sm max-w-md mx-auto">
      <p class="text-center text-sm mb-3 font-medium">${t('select.language')}:</p>
      <div class="grid grid-cols-3 gap-2">
        <button data-lang="ca" class="px-3 py-2 rounded hover:bg-blue-600 flex flex-col items-center justify-center gap-1 transition">
          🏴 <span class="text-xs font-semibold">Català</span>
        </button>
        <button data-lang="zh" class="px-3 py-2 rounded hover:bg-blue-600 flex flex-col items-center justify-center gap-1 transition">
          🇨🇳 <span class="text-xs font-semibold">中文</span>
        </button>

        <button data-lang="de" class="px-3 py-2 rounded hover:bg-blue-600 flex flex-col items-center justify-center gap-1 transition">
          🇩🇪 <span class="text-xs font-semibold">Deutsch</span>
        </button>
        <button data-lang="en" class="px-3 py-2 rounded hover:bg-blue-600 flex flex-col items-center justify-center gap-1 transition">
          🇬🇧 <span class="text-xs font-semibold">English</span>
        </button>
        <button data-lang="es" class="px-3 py-2 rounded hover:bg-blue-600 flex flex-col items-center justify-center gap-1 transition">
          🇪🇸 <span class="text-xs font-semibold">Español</span>
        </button>
        <button data-lang="fr" class="px-3 py-2 rounded hover:bg-blue-600 flex flex-col items-center justify-center gap-1 transition">
          🇫🇷 <span class="text-xs font-semibold">Français</span>
        </button>
        <button data-lang="it" class="px-3 py-2 rounded hover:bg-blue-600 flex flex-col items-center justify-center gap-1 transition">
          🇮🇹 <span class="text-xs font-semibold">Italiano</span>
        </button>
        <button data-lang="qu" class="px-3 py-2 rounded hover:bg-blue-600 flex flex-col items-center justify-center gap-1 transition">
          🇵🇪 <span class="text-xs font-semibold">Runa Simi</span>
        </button>
        <button data-lang="ru" class="px-3 py-2 rounded hover:bg-blue-600 flex flex-col items-center justify-center gap-1 transition">
          🇷🇺 <span class="text-xs font-semibold">Русский</span>
        </button>
      </div>
    </div>
    <!-- End Language Switcher 
    <div class="max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-lg">
    <h2 class="text-2xl font-bold mb-4 text-center text-blue-400">Game Instructions</h2>
    
    <p class="mb-6 leading-relaxed">
    This guide will help you navigate through all the game features and controls.
    <br><br>
    
    <strong class="text-yellow-400">Game Controls</strong>
    <br>
    • <strong>Online games:</strong> Use <kbd class="bg-gray-700 px-2 py-1 rounded text-sm">W</kbd>/<kbd class="bg-gray-700 px-2 py-1 rounded text-sm">S</kbd> to control your paddle
    <br>
        • <strong>Local games:</strong> Use <kbd class="bg-gray-700 px-2 py-1 rounded text-sm">W</kbd>/<kbd class="bg-gray-700 px-2 py-1 rounded text-sm">S</kbd> for the left paddle and <kbd class="bg-gray-700 px-2 py-1 rounded text-sm">O</kbd>/<kbd class="bg-gray-700 px-2 py-1 rounded text-sm">L</kbd> for the right paddle
        <br>
        • Alternative controls: <kbd class="bg-gray-700 px-2 py-1 rounded text-sm">↑</kbd>/<kbd class="bg-gray-700 px-2 py-1 rounded text-sm">↓</kbd> arrow keys or up & down on mobile
        <br>
        • <strong class="text-red-400">Important:</strong> If using full screen mode, it is strongly recommended NOT to use the arrow key controls
        <br><br>
        <h4 class="text-2xl font-bold mb-4 text-center text-blue-400">Navigation Menu Description</h4>
        <strong class="text-yellow-400">Profile</strong>
        <br>
        Profile Management:
        <br>
        In your profile section, you can customize your gaming experience by changing your profile image (avatar), password, nickname, email address, and username. Note that these options are only available if you are not logged in through Google OAuth.
        <br><br>
        
        <strong class="text-yellow-400">Play Pong</strong>
        <br>
        Features:
        <br>
        • Choose random opponents for quick games
        <br>
        • Forfeit ongoing games when needed
        <br>
        • Start local games on the same screen using the controls explained above
        <br>
        • Confirm participation in tournament games
        <br>
        • Enjoy seamless gameplay with responsive controls
        <br><br>
        
        <strong class="text-yellow-400">Match History</strong>
        <br>
        View a comprehensive summary of all your games, including details about opponents you faced and whether the matches were tournament games or regular game types.
        <br><br>
        
        <strong class="text-yellow-400">Tournament</strong>
        <br>
        See the structure of ongoing tournaments and track their progress. Results of winners are displayed in an easy-to-follow tree structure showing the tournament bracket advancement.
        <br><br>
        
        <strong class="text-yellow-400">Tournament Management</strong>
        <br>
        • Create tournaments for 2, 4, or 8 players
        <br>
        • Set tournaments as private or open to public
        <br>
        • Join tournaments by ID or browse available tournaments
        <br>
        • Tournament listings display name, participant count (current/maximum), and join buttons
        <br><br>
        
        <strong class="text-yellow-400">Friends</strong>
        <br>
        Add players to your friends list to see their online status at a glance. Use the refresh button to update the online status view and stay connected with your gaming community.
        </p>
        </div> 
        -->
        <div class="max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-lg">
  <h2 class="text-2xl font-bold mb-4 text-center text-blue-400">${t('instructions.title')}</h2>
  
  <p class="mb-6 leading-relaxed">
    ${t('instructions.intro')}
    <br><br>
    
    <strong class="text-yellow-400">${t('instructions.controls.title')}</strong>
    <br>
    • <strong>${t('instructions.controls.online')}</strong> ${t('instructions.controls.onlineText')}
    <br>
    • <strong>${t('instructions.controls.local')}</strong> ${t('instructions.controls.localText')}
    <br>
    • ${t('instructions.controls.altControls')}
    <br>
    • <strong class="text-red-400">${t('instructions.controls.important')}</strong> ${t('instructions.controls.importantText')}
    <br><br>

    <h4 class="text-2xl font-bold mb-4 text-center text-blue-400">${t('instructions.navMenu.title')}</h4>
    
    <strong class="text-yellow-400">${t('instructions.navMenu.profile')}</strong>
    <br>
    ${t('instructions.navMenu.profileText')}
    <br><br>
    
    <strong class="text-yellow-400">${t('instructions.navMenu.playPong')}</strong>
    <br>
    ${t('instructions.navMenu.playPongText')}
    <br><br>
    
    <strong class="text-yellow-400">${t('instructions.navMenu.history')}</strong>
    <br>
    ${t('instructions.navMenu.historyText')}
    <br><br>
    
    <strong class="text-yellow-400">${t('instructions.navMenu.tournament')}</strong>
    <br>
    ${t('instructions.navMenu.tournamentText')}
    <br><br>

    <strong class="text-yellow-400">${t('instructions.navMenu.tournamentMgmt')}</strong>
    <br>
    ${t('instructions.navMenu.tournamentMgmtText')}
    <br><br>
    
    <strong class="text-yellow-400">${t('instructions.navMenu.friends')}</strong>
    <br>
    ${t('instructions.navMenu.friendsText')}
  </p>
</div>

  `;

  // Hide game-related elements
  bu.hidden = true;  
  gArea.hidden = true;
  gWin.hidden = true;

  // Attach language switcher events
  el.querySelectorAll('#lang-switcher button').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang')!;
      localStorage.setItem('userLanguage', lang);
      window.location.reload();
    });
  });
}

export async function renderPlayContent(hideableElements) {
  hideableElements.contentArea.innerHTML = `
  `;
  hideableElements.buttonArea.hidden = false;
  hideableElements.gameArea.classList.remove("hidden");
  hideableElements.gameWindow.hidden = false;
  const metaInfo = await getGameMetaInfo();
  setterUponMetaInfo(hideableElements.gameInfo, metaInfo);
}

