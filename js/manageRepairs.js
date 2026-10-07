const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

async function loadRepairs() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login.");
        return;
    }

    try {

        const response = await fetch(`${API_BASE_URL}/repairs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const repairs = await response.json();

        if (!response.ok) {
            throw new Error(repairs.message || "Failed to load repairs.");
        }

        const tbody = document.querySelector("#repairTable tbody");

        tbody.innerHTML = "";

        repairs.forEach(repair => {

            tbody.innerHTML += `
            <tr>

                <td>${repair.customer ? repair.customer.name : "Guest"}</td>

                <td>${repair.deviceType}</td>

                <td>${repair.brand}</td>

                <td>${repair.model}</td>

                <td>

                    <select onchange="updateStatus('${repair._id}', this.value)">

                        <option ${repair.status==="Received"?"selected":""}>Received</option>

                        <option ${repair.status==="Diagnosing"?"selected":""}>Diagnosing</option>

                        <option ${repair.status==="Waiting for Parts"?"selected":""}>Waiting for Parts</option>

                        <option ${repair.status==="Repairing"?"selected":""}>Repairing</option>

                        <option ${repair.status==="Ready"?"selected":""}>Ready</option>

                        <option ${repair.status==="Completed"?"selected":""}>Completed</option>

                    </select>

                </td>

                <td>$${repair.estimatedCost || 0}</td>

                <td>

                    <button onclick="deleteRepair('${repair._id}')">
                        Delete
                    </button>

                </td>

            </tr>
            `;

        });

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

}

async function updateStatus(id, status) {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                status
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        alert("Repair updated.");

        loadRepairs();

    } catch (err) {

        alert(err.message);

    }

}

async function deleteRepair(id) {

    if (!confirm("Delete this repair request?")) return;

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {

            method: "DELETE",

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        alert("Repair deleted.");

        loadRepairs();

    } catch (err) {

        alert(err.message);

    }

}

document.addEventListener("DOMContentLoaded", loadRepairs);