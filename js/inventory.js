
const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let products = [];

function getInventoryImageUrl(product) {
    const imagePath = product.images?.[0] || product.image || "";

    if (!imagePath) return "../images/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;

    const fileName = imagePath.split("/").pop().replace(/\.jpeg$/i, ".jpg");

    if (imagePath.startsWith("/uploads/")) {
        return `https://bionic-store-frontend.onrender.com/images/${fileName}`;
    }

    return `../images/${fileName}`;
}

function getToken() {
    return localStorage.getItem("token");
}

async function loadInventory() {
    const tbody = document.querySelector("#inventoryTable tbody");

    if (!tbody) {
        console.error("Inventory table body was not found.");
        return;
    }

    tbody.innerHTML = `<tr><td colspan="6">Loading inventory...</td></tr>`;

    const token = getToken();

    if (!token) {
        tbody.innerHTML = `<tr><td colspan="6">Please log in as an administrator to view inventory.</td></tr>`;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/inventory`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || `Unable to load inventory (${response.status}).`);
        }

        if (!Array.isArray(data)) {
            throw new Error(data.message || "The server returned an unexpected inventory response.");
        }

        products = data;
        renderInventory(products);
    } catch (err) {
        console.error("Inventory loading failed:", err);
        tbody.innerHTML = `<tr><td colspan="6">${err.message || "Could not load inventory."}</td></tr>`;
    }
}

function renderInventory(list) {
    const tbody = document.querySelector("#inventoryTable tbody");
    if (!tbody) return;

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6">No products found.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(product => {
        const image = getInventoryImageUrl(product);
        const stock = Number(product.stock || 0);

        let status = "🟢 In Stock";
        if (stock === 0) status = "🔴 Out";
        else if (stock <= 5) status = "🟡 Low";

        return `
            <tr>
                <td>
                    <img src="${image}" alt="${product.name || "Product"}"
                         width="60" onerror="this.onerror=null;this.src='../images/placeholder.png'">
                </td>
                <td>${product.name || "Unnamed product"}</td>
                <td>${product.category || "Uncategorized"}</td>
                <td>
                    <input type="number" min="0" step="1"
                           id="stock-${product._id}" value="${stock}" style="width:70px;">
                </td>
                <td>${status}</td>
                <td><button type="button" onclick="saveStock('${product._id}')">Save</button></td>
            </tr>
        `;
    }).join("");
}

async function saveStock(id) {
    const input = document.getElementById(`stock-${id}`);
    if (!input) return;

    const stock = input.value.trim();

    if (stock === "" || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
        alert("Enter a non-negative whole number for stock.");
        return;
    }

    const token = getToken();
    if (!token) {
        alert("Please log in as an administrator again.");
        return;
    }

    const button = input.closest("tr")?.querySelector("button");
    if (button) {
        button.disabled = true;
        button.textContent = "Saving...";
    }

    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ stock: Number(stock) })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || `Unable to save stock (${response.status}).`);
        }

        alert("Stock updated successfully.");
        await loadInventory();
    } catch (err) {
        console.error("Stock update failed:", err);
        alert(err.message || "Could not update stock.");
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Save";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const keyword = searchInput.value.toLowerCase().trim();

            const filtered = products.filter(product =>
                (product.name || "").toLowerCase().includes(keyword) ||
                (product.category || "").toLowerCase().includes(keyword)
            );

            renderInventory(filtered);
        });
    }

    loadInventory();
});
