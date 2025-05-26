export async function renderProfileContent(el: HTMLElement) {
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  let userData;
  try {
    const res = await fetch(`http://127.0.0.1:4000/api/users/id/1`);
    console.log("userId", userId);
    if (!res.ok) throw new Error("Failed to fetch user data");
    userData = await res.json();
  } catch (err) {
    console.error(err);
    el.innerHTML = `<p class="text-red-500">Error loading profile. Please try again later.</p>`;
    return;
  }

  const { name, nickname, email, password = "", avatar, createAt } = userData;

  let memberSince = "Member since: ";
  if (createAt) {
    const dateOfRegister = new Date(createAt);
    memberSince = `Member since: ${dateOfRegister.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })}`;
  }

  el.innerHTML = `
    <div class="w-full max-w-6xl p-10 bg-gray-900 rounded-lg shadow-md mx-auto my-8">
      <h1 class="text-4xl font-bold mb-10 text-center">Your Profile</h1>

      <div class="flex flex-col md:flex-row gap-12">
        <div class="md:w-1/3 flex flex-col items-center space-y-6">
          <div class="bg-gray-800 p-6 rounded-lg w-full flex flex-col items-center">
            <img id="avatar-preview" src="${avatar || '/public/assets/images/default-avatar.png'}"
                 alt="Profile Avatar" class="w-40 h-40 rounded-full border-4 border-blue-600 mb-6">
            <h2 id="display-username" class="text-3xl font-bold mt-2">${name}</h2>
            <p class="text-gray-400 text-lg mt-2">@${nickname}</p>
            <p class="text-gray-300 mt-4 text-center">${memberSince}</p>
            <button id="edit-btn"
                    class="mt-6 px-4 py-2 bg-blue-500 text-white text-base rounded-lg hover:bg-cyan-600 transition-colors">Edit</button>
          </div>
        </div>

        <div class="md:w-2/3">

          <form id="profile-form" class="space-y-6">
            <div>
              <label class="block text-white mb-1" for="form-name">Name</label>
              <input id="form-name" type="text" value="${name}"
                     class="w-full p-3 rounded-lg bg-gray-700 text-gray-400 disabled:bg-gray-700 disabled:text-gray-400 enabled:bg-gray-600 enabled:text-white transition-colors" disabled />
            </div>
            <div>
              <label class="block text-white mb-1" for="form-nickname">Nickname</label>
              <input id="form-nickname" type="text" value="${nickname}"
                     class="w-full p-3 rounded-lg bg-gray-700 text-gray-400 disabled:bg-gray-700 disabled:text-gray-400 enabled:bg-gray-600 enabled:text-white transition-colors" disabled />
            </div>
            <div>
              <label class="block text-white mb-1" for="form-email">Email</label>
              <input id="form-email" type="email" value="${email}"
                     class="w-full p-3 rounded-lg bg-gray-700 text-gray-400 disabled:bg-gray-700 disabled:text-gray-400 enabled:bg-gray-600 enabled:text-white transition-colors" disabled />
            </div>
            <div>
              <label class="block text-white mb-1" for="form-password">Password</label>
              <input id="form-password" type="password" value="${password}"
                     class="w-full p-3 rounded-lg bg-gray-700 text-gray-400 disabled:bg-gray-700 disabled:text-gray-400 enabled:bg-gray-600 enabled:text-white transition-colors" disabled />
            </div>
            <div>
              <label class="block text-white mb-1" for="form-avatar">Avatar Image</label>
              <input id="form-avatar" type="file" accept="image/*"
                     class="w-full p-3 rounded-lg bg-gray-700 text-gray-400 disabled:bg-gray-700 disabled:text-gray-400 enabled:bg-gray-600 enabled:text-white transition-colors" disabled />
            </div>
            <div class="flex flex-col md:flex-row gap-4 justify-between">
              <button type="submit" id="save-btn"
                      class="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Save Changes
              </button>
              <button type="button" id="delete-btn"
                      class="px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Delete Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Confirm Delete -->
    <div id="delete-modal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 hidden">
      <div class="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold text-white mb-4">Delete Account</h3>
        <p class="text-gray-300 mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
        <div class="flex justify-end space-x-4">
          <button id="cancel-delete" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition">
            Cancel
          </button>
          <button id="confirm-delete" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Confirm Save -->
    <div id="save-modal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 hidden">
      <div class="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold text-white mb-4">Confirm Save</h3>
        <p class="text-gray-300 mb-6">Are you sure you want to save these changes?</p>
        <div class="flex justify-end space-x-4">
          <button id="cancel-save" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition">
            Cancel
          </button>
          <button id="confirm-save" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition">
            Save
          </button>
        </div>
      </div>
    </div>

<!-- Success Save alert -->
<div id="success-alert" class="fixed bottom-6 right-6 z-50 hidden opacity-0 px-6 py-4 bg-green-600 text-white rounded-lg shadow-lg font-medium transition-opacity duration-500">
  Profile updated successfully!
</div>
<!-- Success Delete alert-->
<div id="success-delete" class="fixed bottom-6 right-6 z-50 hidden opacity-0 px-6 py-4 bg-green-600 text-white rounded-lg shadow-lg font-medium transition-opacity duration-500">
  Account deleted successfully!
</div>
  `;

  const form = document.getElementById("profile-form") as HTMLFormElement;
  const editBtn = document.getElementById("edit-btn")!;
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

  editBtn.addEventListener("click", () => {
    inputs.forEach((input) => {
      input.disabled = false;
      if (input.type !== "file") input.select();
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
  });

  cancelSaveBtn.addEventListener("click", () => {
    saveModal.classList.add("hidden");
  });

  confirmSaveBtn.addEventListener("click", async () => {
    const nameInput = document.getElementById("form-name") as HTMLInputElement;
    const nicknameInput = document.getElementById("form-nickname") as HTMLInputElement;
    const emailInput = document.getElementById("form-email") as HTMLInputElement;
    const passwordInput = document.getElementById("form-password") as HTMLInputElement;

    const updatedData = {
      name: nameInput.value,
      nickname: nicknameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
      avatar: avatarPreview.src
    };

    try {
      const response = await fetch(`http://127.0.0.1:4000/api/users/id/1`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        displayUsername.textContent = nameInput.value;
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
  });

  cancelDeleteBtn.addEventListener("click", () => {
    deleteModal.classList.add("hidden");
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`http://127.0.0.1:4000/api/users/id/1`, {
        method: "DELETE"
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
