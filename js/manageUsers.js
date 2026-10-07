const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", loadUsers);

async function loadUsers() {

    try {

        const response = await fetch(`${API_BASE_URL}/users`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const users = await response.json();

        const tbody = document.getElementById("usersBody");

        tbody.innerHTML = "";

        users.forEach(user => {

            tbody.innerHTML += `

                <tr>

                    <td>${user.name}</td>

                    <td>${user.email}</td>

                    <td>
                        ${user.isAdmin ? "👑 Admin" : "👤 Customer"}
                    </td>

                    <td>

                        <button onclick="toggleAdmin('${user._id}', ${user.isAdmin})">

                            ${user.isAdmin ? "Remove Admin" : "Make Admin"}

                        </button>

                        <button onclick="deleteUser('${user._id}')">

                            Delete

                        </button>

                    </td>

                </tr>

            `;

        });

    } catch (error) {

        console.error(error);

        alert("Failed to load users.");

    }

}

async function toggleAdmin(id, isAdmin) {

    try {

        const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`

            },

            body: JSON.stringify({

                isAdmin: !isAdmin

            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message);

        }

        loadUsers();

    } catch (error) {

        alert(error.message);

    }

}

async function deleteUser(id) {

    if (!confirm("Delete this user?")) return;

    try {

        const response = await fetch(`${API_BASE_URL}/users/${id}`, {

            method: "DELETE",

            headers: {

                Authorization: `Bearer ${token}`

            }

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message);

        }

        loadUsers();

    } catch (error) {

        alert(error.message);

    }

}