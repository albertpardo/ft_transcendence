// src/views/dashboard.ts
import { route } from '../router';
import { renderHomeContent, renderPlayContent, renderTournamentContent, renderStatsContent } from './sections';
import { renderProfileContent } from './profile';

export function initDashboard() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const app = document.getElementById('app')!;
  
  app.innerHTML = `
    <!-- Mobile Header with Menu Toggle -->
    <header class="md:hidden fixed top-0 left-0 right-0 bg-gray-900 z-50 p-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">Transcendence</h1>
      <button id="mobile-menu-toggle" class="text-white p-2 hover:bg-gray-700 rounded-lg transition">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </header>

    <!-- Sidebar/Navigation -->
    <aside id="sidebar" class="
      fixed top-0 left-0 bottom-0 z-40
      w-full md:w-64
      bg-gray-900 p-4 md:p-6
      transform md:transform-none transition-transform duration-300 ease-in-out
      -translate-x-full md:translate-x-0
      flex flex-col
    ">
      <!-- Mobile close button -->
      <div class="md:hidden flex justify-end mb-4">
        <button id="mobile-menu-close" class="text-white p-2 hover:bg-gray-700 rounded-lg transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Logo/Title -->
      <h2 class="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center text-white">Transcendence</h2>
      
      <!-- Navigation -->
      <nav class="flex-grow space-y-2 md:space-y-3">
        <a href="#home" class="
          nav-link block p-3 md:p-4 rounded-lg text-center font-medium 
          hover:bg-blue-500 transition text-white
          ${hash === 'home' ? 'bg-blue-600' : 'bg-gray-700'}
        ">
          <span class="md:hidden">🏠</span>
          <span class="hidden md:inline">Dashboard</span>
          <span class="md:hidden ml-2">Dashboard</span>
        </a>
        <a href="#profile" class="
          nav-link block p-3 md:p-4 rounded-lg text-center font-medium 
          hover:bg-blue-500 transition text-white
          ${hash === 'profile' ? 'bg-blue-600' : 'bg-gray-700'}
        ">
          <span class="md:hidden">👤</span>
          <span class="hidden md:inline">Profile</span>
          <span class="md:hidden ml-2">Profile</span>
        </a>
        <a href="#play" class="
          nav-link block p-3 md:p-4 rounded-lg text-center font-medium 
          hover:bg-blue-500 transition text-white
          ${hash === 'play' ? 'bg-blue-600' : 'bg-gray-700'}
        ">
          <span class="md:hidden">🎮</span>
          <span class="hidden md:inline">Play Pong</span>
          <span class="md:hidden ml-2">Play Pong</span>
        </a>
        <a href="#tournament" class="
          nav-link block p-3 md:p-4 rounded-lg text-center font-medium 
          hover:bg-blue-500 transition text-white
          ${hash === 'tournament' ? 'bg-blue-600' : 'bg-gray-700'}
        ">
          <span class="md:hidden">🏆</span>
          <span class="hidden md:inline">Tournament</span>
          <span class="md:hidden ml-2">Tournament</span>
        </a>
        <a href="#stats" class="
          nav-link block p-3 md:p-4 rounded-lg text-center font-medium 
          hover:bg-blue-500 transition text-white
          ${hash === 'stats' ? 'bg-blue-600' : 'bg-gray-700'}
        ">
          <span class="md:hidden">📊</span>
          <span class="hidden md:inline">Stats</span>
          <span class="md:hidden ml-2">Stats</span>
        </a>
      </nav>
      
      <!-- Logout Button -->
      <button id="logout-btn" class="
        mt-auto w-full p-3 bg-red-600 rounded-lg 
        hover:bg-red-700 transition text-white font-medium
      ">
        <span class="md:hidden">🚪</span>
        <span class="hidden md:inline">Logout</span>
        <span class="md:hidden ml-2">Logout</span>
      </button>
    </aside>

    <!-- Backdrop for mobile menu -->
    <div id="mobile-backdrop" class="
      md:hidden fixed inset-0 bg-black bg-opacity-50 z-30
      opacity-0 pointer-events-none transition-opacity duration-300
    "></div>

    <!-- Main Content Area -->
    <main id="content-area" class="
      pt-16 md:pt-0 md:ml-64 
      p-4 md:p-6 lg:p-8 xl:p-12 
      min-h-screen overflow-auto
      bg-gray-900
    "></main>
  `;

  // Mobile menu functionality
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle')!;
  const mobileMenuClose = document.getElementById('mobile-menu-close')!;
  const sidebar = document.getElementById('sidebar')!;
  const backdrop = document.getElementById('mobile-backdrop')!;

  function openMobileMenu() {
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100');
    document.body.classList.add('overflow-hidden');
  }

  function closeMobileMenu() {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    backdrop.classList.remove('opacity-100');
    document.body.classList.remove('overflow-hidden');
  }

  mobileMenuToggle.addEventListener('click', openMobileMenu);
  mobileMenuClose.addEventListener('click', closeMobileMenu);
  backdrop.addEventListener('click', closeMobileMenu);

  // Close mobile menu when navigation link is clicked
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) { // md breakpoint
        closeMobileMenu();
      }
    });
  });

  // Close mobile menu on window resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      closeMobileMenu();
    }
  });

  // Logout functionality
  document.getElementById('logout-btn')!.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.hash = 'login';
    route();
  });

  // Render active section
  const contentArea = document.getElementById('content-area')!;
  switch (hash) {
    case 'profile':    renderProfileContent(contentArea);    break;
    case 'play':       renderPlayContent(contentArea);       break;
    case 'tournament': renderTournamentContent(contentArea); break;
    case 'stats':      renderStatsContent(contentArea);      break;
    default:           renderHomeContent(contentArea);
  }
}

// Initialize dashboard only once when starting the app
initDashboard();