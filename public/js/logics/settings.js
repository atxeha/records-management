export function logout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {

            localStorage.setItem("logoutMessage", "logout successful.");
            localStorage.removeItem("activeUser");
            localStorage.removeItem("loginMessage");

            await window.electronAPI.navigate("login.html")
        })
    }
}

export function showPassword(iconId, inputId) {
    document.getElementById(iconId).addEventListener("click", (event) => {
        event.preventDefault();
        togglePassword()
    })

    function togglePassword() {
        const passwordInput = document.getElementById(inputId);
        const toggleIcon = document.getElementById(iconId);
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleIcon.textContent = "visibility";
        } else {
            passwordInput.type = "password";
            toggleIcon.textContent = "visibility_off";
        }
    }
}

let user = JSON.parse(localStorage.getItem("activeUser"));

export function populateFields() {
    const name = document.getElementById("settingsName");
    const email = document.getElementById("settingsEmail");
    const username = document.getElementById("settingsUser");
    const password = document.getElementById("settingsPass");

    if (user) {
        name.value = user.name;
        email.value = user.email;
        username.value = user.username;
        password.value = user.password
    }
}

export function updateAccountInfo() {
    const form = document.getElementById("updateAccountForm");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const newName = document.getElementById("settingsName")
        const newEmail = document.getElementById("settingsEmail")
        const newUsername = document.getElementById("settingsUser")
        const newPassword = document.getElementById("settingsPass")

        if (!newName || !newEmail || !newUsername || !newPassword) {
            window.electronAPI.showToast("All fields required.", false)
            return;
        }

        const data = {
            id: user.id,
            name: newName.value,    
            email: newEmail.value,
            username: newUsername.value,
            password: newPassword.value,
        }

        try {
            const response = await window.electronAPI.updateAccount(data)

            if(response.success) {
                window.electronAPI.showToast(response.message, true)

                user = localStorage.setItem("activeUser", JSON.stringify(response.data))
                populateFields()
            } else {
                window.electronAPI.showToast(response.message, false)
            }
        } catch (error) {
            window.electronAPI.showToast(error.message, false)
        }
    })
}

export function addStaff(){
    const form = document.getElementById("addStaffForm");
    const modal = new bootstrap.Modal(document.getElementById("addStaffModal"));

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const staffName = document.getElementById("staffName");
        const staffEmail = document.getElementById("staffEmail");
        const staffUsername = document.getElementById("staffUser");
        const staffPassword = document.getElementById("staffPass");

        const data = {
            name: staffName.value.trim(),
            email: staffEmail.value.trim(),
            username: staffUsername.value.trim(),
            password: staffPassword.value.trim(),
        }

        try {
            const res = await window.electronAPI.addStaff(data);

            if (res.success) {
                window.electronAPI.showToast(res.message, true);
                modal.hide();
            } else {
                window.electronAPI.showToast(res.message, false);
            }
        } catch (error) {
            window.electronAPI.showToast(error.message, false);
        }
    })
}
