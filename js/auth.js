
// Register
async function register(name, email, password) {

    try {

        const response = await fetch(`${API_BASE_URL}/users/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })

        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Registration successful! Please log in.");

    } catch (error) {

        console.error(error);
        alert("Registration failed.");

    }

}

// Login
async function login(email, password) {

    try {

        const response = await fetch(`${API_BASE_URL}/users/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert(`Welcome ${data.user.name}!`);

        window.location.href = "../index.html";

    } 
    
    catch (error) {

    console.error("LOGIN ERROR:", error);

    alert(error.message);

         }

}


// Current user
function getCurrentUser() {

    return JSON.parse(localStorage.getItem("user"));

}

async function handleRegister() {

    const name = document.getElementById("registerName").value;

    const email = document.getElementById("registerEmail").value;

    const password = document.getElementById("registerPassword").value;

    await register(name, email, password);

}

async function handleLogin() {

    const email = document.getElementById("loginEmail").value;

    const password = document.getElementById("loginPassword").value;

    await login(email, password);

}

function updateNavbarUser() {

    const loginBtn = document.getElementById("loginBtn");
    const loginText = document.getElementById("loginText");

    if (!loginBtn || !loginText) return;

    const user = getCurrentUser();

    if (user) {

        loginText.textContent = `Hi, ${user.name}`;

         loginBtn.onclick = function () {

    if (confirm(`Logged in as ${user.name}\n\nDo you want to logout?`)) {
        logout();
    }

    };
    
    } else {

        loginText.textContent = "Login";

        loginBtn.onclick = function () {
            window.location.href = "pages/login.html";
        };

    }

}

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("You have been logged out.");

    if (window.location.pathname.includes("/pages/")) {
        window.location.href = "../index.html";
    } else {
        window.location.href = "index.html";
    }

}