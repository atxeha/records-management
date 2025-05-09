document.addEventListener("DOMContentLoaded", () => {
    const logoutMessage = localStorage.getItem("logoutMessage");

    if (logoutMessage) {

        window.electronAPI.showToast(logoutMessage, true);

        localStorage.removeItem("logoutMessage");
    }

    document.getElementById("toggleIcon").addEventListener("click", (event) => {
        event.preventDefault();
        togglePassword()
    })

    function togglePassword() {
        const passwordInput = document.getElementById("password");
        const toggleIcon = document.getElementById("toggleIcon");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleIcon.textContent = "visibility";
        } else {
            passwordInput.type = "password";
            toggleIcon.textContent = "visibility_off";
        }
    }

    const loginForm = document.getElementById("loginForm");

    if (window.electronAPI) {
        if (loginForm) {
            loginForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const username = document.getElementById("username").value.trim();
                const password = document.getElementById("password").value.trim();

                if (!username || !password) {
                    window.electronAPI.showToast("All fields required.", false)
                    return;
                }

                const data = {
                    username: username,
                    password: password,
                }

                const response = await window.electronAPI.checkLogin(data);

                if (response.success) {
                    localStorage.setItem("loginMessage", response.message);
                    localStorage.setItem("activeUser", JSON.stringify(response.user));

                    window.electronAPI.navigate("main.html")
                } else {

                    window.electronAPI.showToast(response.message, false);
                }
            })
        }
    }
})