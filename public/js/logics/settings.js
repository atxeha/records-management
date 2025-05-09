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

export function showPassword() {
    document.getElementById("toggleIcon").addEventListener("click", (event) => {
        event.preventDefault();
        togglePassword()
    })

    function togglePassword() {
        const passwordInput = document.getElementById("settingsPass");
        const toggleIcon = document.getElementById("toggleIcon");
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

function repopulateFields() {
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
                repopulateFields()
            } else {
                window.electronAPI.showToast(response.message, false)
            }
        } catch (error) {
            window.electronAPI.showToast(error.message, false)
        }
    })
}

export function toggleTheme() {
    const theme = document.getElementById("themeBtn");

    theme.addEventListener("click", ()=>{
        console.log(theme.textContent)
        theme.textContent === "dark_mode" ? theme.textContent = "light_mode" : theme.textContent = "dark_mode";
    })
}
