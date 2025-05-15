//src/views/profile.ts

export async function renderProfileContent(el: HTMLElement) {
    // Obtener datos del usuario
    let userData;
    try {
      const res = await fetch("http://127.0.0.1:4000/api/users/id/1"); // hardcoded
      if (!res.ok) throw new Error("Failed to fetch user data");
      userData = await res.json();
    } catch (err) {
      console.error(err);
      el.innerHTML = `<p class="text-red-500">Error loading profile. Please try again later.</p>`;
      return;
    }
  
    const { name, nickname, email, password = "", avatar } = userData;
  
    el.innerHTML = `
      <div class="w-full max-w-6xl p-10 bg-gray-800 rounded-lg shadow-md mx-auto my-8">
        <h1 class="text-4xl font-bold mb-10 text-center">Your Profile</h1>
        
        <div class="flex flex-col md:flex-row gap-12">
          <!-- Columna izquierda -->
          <div class="md:w-1/3 flex flex-col items-center space-y-6">
            <div class="bg-gray-800 p-6 rounded-lg w-full flex flex-col items-center">
              <img id="avatar-preview" src="${avatar}" alt="Profile Avatar"
                   class="w-40 h-40 rounded-full border-4 border-blue-600 mb-6">
              <h2 id="display-username" class="text-3xl font-bold mt-2">${name}</h2>
              <p class="text-gray-400 text-lg mt-2">@${nickname}</p>
              <p class="text-gray-300 mt-4 text-center">Member since: January 2025</p>
              <button id="edit-btn"
                      class="mt-6 px-6 py-3 bg-yellow-500 text-white text-lg rounded-lg hover:bg-yellow-600 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
  
          <!-- Columna derecha -->
          <div class="md:w-2/3">
            <form id="profile-form" class="space-y-6">
              <div>
                <label class="block text-white mb-1" for="form-name">Name</label>
                <input id="form-name" type="text" value="${name}"
                       class="w-full p-3 rounded-lg bg-gray-600 text-white" disabled />
              </div>
  
              <div>
                <label class="block text-white mb-1" for="form-nickname">Nickname</label>
                <input id="form-nickname" type="text" value="${nickname}"
                       class="w-full p-3 rounded-lg bg-gray-600 text-white" disabled />
              </div>
  
              <div>
                <label class="block text-white mb-1" for="form-email">Email</label>
                <input id="form-email" type="email" value="${email}"
                       class="w-full p-3 rounded-lg bg-gray-600 text-white" disabled />
              </div>
  
              <div>
                <label class="block text-white mb-1" for="form-password">Password</label>
                <input id="form-password" type="password" value="${password}"
                       class="w-full p-3 rounded-lg bg-gray-600 text-white" disabled />
              </div>
  
              <div>
                <label class="block text-white mb-1" for="form-avatar">Avatar Image</label>
                <input id="form-avatar" type="file" accept="image/*"
                       class="w-full p-3 rounded-lg bg-gray-600 text-white" disabled />
              </div>
  
              <div>
                <button type="submit" id="save-btn"
                        class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition" disabled>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  
    // 2. Activar edición
    const form = document.getElementById("profile-form") as HTMLFormElement;
    const editBtn = document.getElementById("edit-btn")!;
    const inputs = form.querySelectorAll("input");
    const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
    const avatarInput = document.getElementById("form-avatar") as HTMLInputElement;
    const avatarPreview = document.getElementById("avatar-preview") as HTMLImageElement;
  
    editBtn.addEventListener("click", () => {
      inputs.forEach((input) => (input.disabled = false));
      saveBtn.disabled = false;
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
  
    // 3. Guardar cambios
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const formData = new FormData();
      formData.append("name", (document.getElementById("form-name") as HTMLInputElement).value);
      formData.append("nickname", (document.getElementById("form-nickname") as HTMLInputElement).value);
      formData.append("email", (document.getElementById("form-email") as HTMLInputElement).value);
      formData.append("password", (document.getElementById("form-password") as HTMLInputElement).value);
      if (avatarInput.files?.[0]) {
        formData.append("avatar", avatarInput.files[0]);
      }
  
      try {
        const response = await fetch("http://127.0.0.1:4000/api/users/id/1", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            nickname,
            email,
            password,
            avatar: avatarPreview.src
          })
        });
  
        if (response.ok) {
          alert("Profile updated successfully");
          inputs.forEach((input) => (input.disabled = true));
          saveBtn.disabled = true;
        } else {
          alert("Failed to update profile");
        }
      } catch (err) {
        console.error("Error updating profile:", err);
        alert("An error occurred while updating the profile.");
      }
    });
  }
  