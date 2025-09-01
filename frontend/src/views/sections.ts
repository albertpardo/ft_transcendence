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
    <p class="mb-4 text-center">${t('home.intro')}</p>

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

