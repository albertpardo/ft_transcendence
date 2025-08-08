import { t } from "../i18n";
import { syncAuthTokens } from "./login";

export async function renderProfileContent(el: HTMLElement, bu: HTMLElement, gArea: HTMLElement, gWin: HTMLElement) {

  bu.classList.add('hidden');
  gArea.classList.add('hidden');
  gWin.classList.add('hidden');

  syncAuthTokens();
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  const authToken: string = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || "";
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (!authToken) {
    const cookieToken = document.cookie.match("authToken=([^;]+)")?.[1];
    if (cookieToken) {
      localStorage.setItem("authToken", cookieToken);
      window.location.reload(); // Reload to ensure proper state
      return;
    }
    el.innerHTML = `<p class="text-red-500">${t("profiles.notLogged")}</p>`;
    return;
  }
//debugg block  start
function simpleJwtDecode(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Usage:
const decoded = simpleJwtDecode(authToken);
if (!decoded) {
  el.innerHTML = `<p class="text-red-500">${t("profiles.invalid_token")}</p>`;
  return;
}
console.log("✅ Decoded token:", decoded);
//debugg block end
  let userData;
  const authstringheader : string = "Bearer " + authToken;
  try {
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      headers: {
        "Authorization": authstringheader,
        "use-me-to-authorize": authstringheader,
        "Content-Type": "application/json",
      },
      credentials: 'include',
      mode: 'cors',
    });


    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch user data: ${res.status} ${text}`);
    }
    console.log('Profile fetch status:', res.status);
    console.log('Profile fetch headers:', [...res.headers.entries()]);
    userData = await res.json();

    console.log('🎸🎸🎸Received user on login:', userData);

  } catch (err) {
    console.error(err);
    el.innerHTML = `<p class="text-red-500">${t("profiles.error_loading")}</p>`;
    return;
  }

  const { username, nickname, email, avatar, createAt } = userData;

  let memberSince = `${t("profiles.member.since")} `;
  if (createAt) {
    const dateOfRegister = new Date(createAt);
    memberSince = `${t("profiles.member.since")}: ${dateOfRegister.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })}`;
  }

  const passwordDots = '••••••••';
  el.innerHTML = `
    <div class="w-full max-w-6xl p-10 bg-gray-900 rounded-lg shadow-md mx-auto my-8">
      <h1 class="text-4xl font-bold mb-10 text-center">${t("profiles.title")}</h1>

      <div class="flex flex-col md:flex-row gap-12">
        <div class="md:w-1/3 flex flex-col items-center space-y-6">
          <div class="bg-gray-800 p-6 rounded-lg w-full flex flex-col items-center">
            <img id="avatar-preview" src="${avatar || '/assets/images/default-avatar.png'}"
                 alt="Profile Avatar" class="w-40 h-40 rounded-full border-4 border-blue-600 mb-6">
            <h2 id="display-username" class="text-3xl font-bold mt-2">${username}</h2>
            <p class="text-gray-400 text-lg mt-2">@${nickname}</p>
            <p class="text-gray-300 mt-4 text-center">${memberSince}</p>
            <button id="edit-btn"
                    class="mt-6 px-4 py-2 bg-blue-500 text-white text-base rounded-lg hover:bg-cyan-600 transition-colors">${t("profiles.edit")}</button>
          </div>
        </div>

        <div class="md:w-2/3">

          <form id="profile-form" class="space-y-6">
            <div>
              <label class="block text-white mb-1" for="form-username">${t("profiles.username")}</label>
              <input id="form-username" type="text" value="${username}"
                     class="w-full p-3 rounded-lg bg-gray-700 text-gray-400 disabled:bg-gray-700 disabled:text-gray-400 enabled:bg-gray-600 enabled:text-white transition-colors" disabled />
            </div>
            <div>
              <label class="block text-white mb-1" for="form-nickname">${t("profiles.nickname")}</label>
              <input id="form-nickname" type="text" value="${nickname}"
                     class="w-full p-3 rounded-lg bg-gray-700 text-gray-400 disabled:bg-gray-700 disabled:text-gray-400 enabled:bg-gray-600 enabled:text-white transition-colors" disabled />
            </div>
            <div>
              <label class="block text-white mb-1" for="form-email">${t("profiles.email")}</label>
              <input id="form-email" type="email" value="${email}"
                     class="w-full p-3 rounded-lg bg-gray-700 text-gray-400 disabled:bg-gray-700 disabled:text-gray-400 enabled:bg-gray-600 enabled:text-white transition-colors" disabled />
            </div>
                <div class="relative">
                  <label class="block text-white mb-1" for="form-password">${t("profiles.password")}</label>
                  <div class="relative">
                    <input id="form-password" type="password" value="${passwordDots}"
                           class="w-full p-3 rounded-lg bg-gray-700 text-gray-400 disabled:bg-gray-700 disabled:text-gray-400 enabled:bg-gray-600 enabled:text-white transition-colors" disabled readonly data-is-dummy="true" />
                    <button type="button" id="password-toggle"
                            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      
                        <g id="open-eye">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </g>
                        <g id="closed-eye" class="hidden">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>
              <div>
              <label class="block text-white mb-1" for="form-avatar">${t("profiles.avatar.image")}</label>
              <input id="form-avatar" type="file" accept="image/*"
                     class="w-full p-3 rounded-lg bg-gray-700 text-gray-400 disabled:bg-gray-700 disabled:text-gray-400 enabled:bg-gray-600 enabled:text-white transition-colors" disabled />
            </div>
            <div class="flex flex-col md:flex-row gap-4 justify-between">
              <button type="submit" id="save-btn"
                      class="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                ${t("profiles.save.changes")}
              </button>
              <button type="button" id="delete-btn"
                      class="px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                ${t("profiles.delete.account")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Confirm Delete -->
    <div id="delete-modal" class="fixed inset-0 bg-black bg-opacity-75 items-center justify-center z-50 hidden">
      <div class="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold text-white mb-4">${t("profiles.delete.account")}</h3>
        <p class="text-gray-300 mb-6">${t("profiles.confirm.delete")}</p>
        <div class="flex justify-end space-x-4">
          <button id="cancel-delete" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition">
            ${t("profiles.cancel")}
          </button>
          <button id="confirm-delete" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition">
            ${t("profiles.delete")}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Confirm Save -->
    <div id="save-modal" class="fixed inset-0 bg-black bg-opacity-75 items-center justify-center z-50 hidden">
      <div class="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold text-white mb-4">${t("profiles.confirm.save")}</h3>
        <p class="text-gray-300 mb-6">${t("profiles.confirm.save.text")}</p>
        <div class="flex justify-end space-x-4">
          <button id="cancel-save" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition">
            ${t("profiles.cancel")}
          </button>
          <button id="confirm-save" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition">
            ${t("profiles.save")}
          </button>
        </div>
      </div>
    </div>

<!-- Success Save alert -->
<div id="success-alert" class="fixed bottom-6 right-6 z-50 hidden opacity-0 px-6 py-4 bg-green-600 text-white rounded-lg shadow-lg font-medium transition-opacity duration-500">
  ${t("profiles.success.update")}
</div>
<!-- Success Delete alert-->
<div id="success-delete" class="fixed bottom-6 right-6 z-50 hidden opacity-0 px-6 py-4 bg-green-600 text-white rounded-lg shadow-lg font-medium transition-opacity duration-500">
  ${t("profiles.success.delete")}
</div>
  `;

  const form = document.getElementById("profile-form") as HTMLFormElement;
  if (!form) {
    console.error("Profile form not found");
    return;
  }
  const editBtn = document.getElementById("edit-btn");
  
  const inputs = form.querySelectorAll("input");
  const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
  const deleteBtn = document.getElementById("delete-btn") as HTMLButtonElement;
  const avatarInput = document.getElementById("form-avatar") as HTMLInputElement;
  const avatarPreview = document.getElementById("avatar-preview") as HTMLImageElement;
  const displayUsername = document.getElementById("display-username") as HTMLHeadingElement;

  const deleteModal = document.getElementById("delete-modal") as HTMLDivElement;
  const cancelDeleteBtn = document.getElementById("cancel-delete") as HTMLButtonElement;
  const confirmDeleteBtn = document.getElementById("confirm-delete") as HTMLButtonElement;

  const saveModal = document.getElementById("save-modal") as HTMLDivElement;
  const cancelSaveBtn = document.getElementById("cancel-save") as HTMLButtonElement;
  const confirmSaveBtn = document.getElementById("confirm-save") as HTMLButtonElement;
  const passwordToggle = document.getElementById('password-toggle') as HTMLButtonElement;
  const passwordInput = document.getElementById('form-password') as HTMLInputElement;
  const openEye = document.getElementById('open-eye') as HTMLImageElement;
  const closedEye = document.getElementById('closed-eye') as HTMLImageElement;

  if (
    !editBtn || !saveBtn || !deleteBtn || !avatarInput || !avatarPreview || !displayUsername ||
    !deleteModal || !cancelDeleteBtn || !confirmDeleteBtn ||
    !saveModal || !cancelSaveBtn || !confirmSaveBtn ||
    !passwordInput || !passwordToggle || !openEye || !closedEye
  ) {
    console.error("❌ Missing DOM element(s) in profile page.");
    return; // corrected
  }


  if (passwordInput && passwordToggle && openEye && closedEye) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      
      // Toggle eye icons
      if (isPassword) {
        openEye.classList.add('hidden');
        closedEye.classList.remove('hidden');
      } else {
        openEye.classList.remove('hidden');
        closedEye.classList.add('hidden');
      }
    });
  }

  editBtn.addEventListener("click", () => {
    inputs.forEach((input) => {
      input.disabled = false;
      
      // Special handling for password field
      if (input.id === 'form-password') {
        const isDummy = input.getAttribute('data-is-dummy') === 'true';
        
        if (isDummy) {
          // Clear the dummy  s when editing
          input.value = '';
          input.removeAttribute('readonly');
          input.setAttribute('placeholder', 'Enter new password');
          input.removeAttribute('data-is-dummy');
        }
        
        if (input.type !== "file") input.select();
      } else {
        if (input.type !== "file") input.select();
      }
    });
    
    saveBtn.disabled = false;
    deleteBtn.disabled = false;
  });

  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        avatarPreview.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    saveModal.classList.remove("hidden");
    saveModal.classList.add("flex");
  });

  cancelSaveBtn.addEventListener("click", () => {
    saveModal.classList.add("hidden");
    saveModal.classList.remove("flex");
  });

  confirmSaveBtn.addEventListener("click", async () => {
    const usernameInput = document.getElementById("form-username") as HTMLInputElement;
    const nicknameInput = document.getElementById("form-nickname") as HTMLInputElement;
    const emailInput = document.getElementById("form-email") as HTMLInputElement;
    const passwordInput = document.getElementById("form-password") as HTMLInputElement;

    const updatedData: {
      username: string;
      nickname: string;
      email: string;
      avatar: string;
      password?: string; 
     } = {
      username: usernameInput.value,
      nickname: nicknameInput.value,
      email: emailInput.value,
      avatar: avatarPreview.src
    };

    if (passwordInput.value.trim() !== "" && !passwordInput.hasAttribute('data-is-dummy')) {
      updatedData.password = passwordInput.value;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
         
        },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        displayUsername.textContent = usernameInput.value;
        const nicknameDisplay = displayUsername.nextElementSibling;
        if (nicknameDisplay) nicknameDisplay.textContent = `@${nicknameInput.value}`;
        const successAlert = document.getElementById("success-alert")!;
        successAlert.classList.remove("hidden");
        setTimeout(() => {
          successAlert.classList.remove("opacity-0");
        }, 10); // Slight delay to allow transition
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
          successAlert.classList.add("opacity-0");
          setTimeout(() => successAlert.classList.add("hidden"), 500); // Wait for fade-out
        }, 4000);
        
        //not sure:
        passwordInput.type = 'password';
        passwordInput.value = passwordDots;
        passwordInput.setAttribute('readonly', 'true');
        passwordInput.setAttribute('data-is-dummy', 'true');
        passwordInput.removeAttribute('placeholder');
        
        // Reset eye icons to open state
        if (openEye && closedEye) {
          openEye.classList.remove('hidden');
          closedEye.classList.add('hidden');
        }

        inputs.forEach((input) => (input.disabled = true));
        saveBtn.disabled = true;
        deleteBtn.disabled = true;
        saveModal.classList.add("hidden");
      } else {
        alert("Failed to update profile");
        saveModal.classList.add("hidden");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("An error occurred while updating the profile.");
      saveModal.classList.add("hidden");
    }
  });

  deleteBtn.addEventListener("click", () => {
    deleteModal.classList.remove("hidden");
    deleteModal.classList.add("flex");
  });

  cancelDeleteBtn.addEventListener("click", () => {
    deleteModal.classList.add("hidden");
    deleteModal.classList.remove("flex");
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          'Accept-Encoding': 'identity',
        },
        method: "DELETE",
        credentials: 'include'
      });

      if (response.ok) {
        // alert("Account deleted successfully");
        const successDelete = document.getElementById("success-delete")!;
        successDelete.classList.remove("hidden");
        setTimeout(() => {
          successDelete.classList.remove("opacity-0");
        }, 10); // Slight delay to allow transition
        // Auto-hide after 4 seconds
        setTimeout(() => {
          successDelete.classList.add("opacity-0");
          setTimeout(() => successDelete.classList.add("hidden"), 500); // Wait for fade-out
        }, 4000);
        deleteModal.classList.add("hidden");
        localStorage.removeItem('userId');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('authToken');
        setTimeout(() => {
          window.location.replace("/");
        }, 2000); // 2 segundos de espera antes de redirigir
      } else {
        alert("Failed to delete account");
        deleteModal.classList.add("hidden");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("An error occurred while deleting the account");
      deleteModal.classList.add("hidden");
    }
  });
}
