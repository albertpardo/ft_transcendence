export async function renderSecuritySettings(
    contentArea: HTMLElement,
    startButton: HTMLElement,
    gameArea: HTMLElement,
    gameWindow: HTMLElement
) {
    gameArea.hidden = true;
    startButton.hidden = true;
  
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  
    const response = await fetch(`${API_BASE_URL}/api/auth/2fa/status`, { headers });
    const { has_2fa, has_seen_2fa_prompt, qr_code_image_url } = await response.json();
    const firstTime2FA = !has_seen_2fa_prompt;
  
    // if the prompt hasn't been seen, send the prompt
    if (firstTime2FA) {
      await fetch(`${API_BASE_URL}/api/auth/2fa/seen-2fa-prompt`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ has_seen_2fa_prompt: true }),
      });
    }
  
    contentArea.innerHTML = `
      <div class="text-white space-y-6 max-w-md mx-auto">
        <h2 class="text-2xl font-bold text-center">Two Factors Authentication Settings</h2>
        <p>${firstTime2FA ? 'For account security, please select whether to enable 2FA(Two-Factor Authentication) or not.' : 'You may enable or disable 2FA security settings.'}</p>
  
        <div class="space-y-2">
          <p>Scan the following QR code using Google Authenticator:</p>
          <img src="${qr_code_image_url}" alt="QR Code" class="mx-auto w-48 h-48 border border-gray-700 rounded" />
        </div>
  
        <input
          id="otp-input"
          type="text"
          placeholder="Enter verification code"
          class="w-full p-3 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-400"
        />
  
        <div class="flex gap-4 justify-between">
          <button
            id="enable-2fa-btn"
            class="flex-1 p-3 rounded ${has_2fa ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white font-medium"
            ${has_2fa ? 'disabled' : ''}
          >Verify and Enable 2FA</button>
          ${firstTime2FA
            ? `<button id="skip-2fa" class="p-2 bg-gray-600 rounded-lg hover:bg-gray-700 text-white">Skip 2FA setup</button>`
            : `<button
                id="disable-2fa-btn"
                class="flex-1 p-3 rounded ${has_2fa ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 cursor-not-allowed'} text-white font-medium"
                ${!has_2fa ? 'disabled' : ''}
                >Disable 2FA</button>`
          }
        </div>
      </div>
    `;

    const enableBtn = document.getElementById('enable-2fa-btn') as HTMLButtonElement;
    const disableBtn = document.getElementById('disable-2fa-btn') as HTMLButtonElement;
    const otpInput = document.getElementById('otp-input') as HTMLInputElement;
  
    enableBtn?.addEventListener('click', async () => {
      const otp = otpInput.value.trim();
      if (!otp) {
        alert("Please enter a verification code.");
        return;
      }
  
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/enable`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ otp }),
      });
  
      if (res.ok) {
        alert("2FA enabled successfully!");
        enableBtn.disabled = true;
        enableBtn.classList.remove("bg-green-600", "hover:bg-green-700");
        enableBtn.classList.add("bg-gray-700", "cursor-not-allowed");
    
        if (!firstTime2FA) {
            disableBtn.disabled = false;
            disableBtn.classList.remove("bg-gray-700", "cursor-not-allowed");
            disableBtn.classList.add("bg-red-600", "hover:bg-red-700");
        } else {
            window.location.hash = '#home';
        }
      } else {
          const err = await res.text();
          alert("Failed to enable 2FA: " + err);
      }
    });

    if (firstTime2FA) {
        document.getElementById('skip-2fa')!.addEventListener('click', async() => {
            await fetch(`${API_BASE_URL}/api/auth/2fa/skip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await fetch(`${API_BASE_URL}/api/auth/finalize-login`);
            const data = await res.json();
            localStorage.setItem('jwt', data.token);
            window.location.hash = '#home';
/*
        document.getElementById('skip-2fa')!.addEventListener('click', async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/2fa/seen-2fa-prompt`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ has_seen_2fa_prompt: true }),
            });
    
            if (response.ok) {
              window.location.hash = '#home';
            } else {
              alert('Error: Unable to skip 2FA setup.');
            }
          } catch (err) {
            console.error(err);
          }
*/
        });
      }

    if (!firstTime2FA && disableBtn) {
        disableBtn?.addEventListener('click', async () => {
        const confirm = window.confirm("Are you sure you want to disable 2FA?");
        if (!confirm) return;
  
        const res = await fetch(`${API_BASE_URL}/api/auth/2fa/disable`, {
            method: 'POST',
            headers,
        });
  
        if (res.ok) {
            alert("2FA disabled.");
            disableBtn.disabled = true;
            disableBtn.classList.remove("bg-red-600", "hover:bg-red-700");
            disableBtn.classList.add("bg-gray-700", "cursor-not-allowed");
  
            enableBtn.disabled = false;
            enableBtn.classList.remove("bg-gray-700", "cursor-not-allowed");
            enableBtn.classList.add("bg-green-600", "hover:bg-green-700");
        } else {
            const err = await res.text();
            alert("Failed to disable 2FA: " + err);
        }
      });
    }
  }
  