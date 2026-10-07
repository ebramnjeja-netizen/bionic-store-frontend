const API_BASE_URL = "http://localhost:5000/api";

let products = [];

async function loadInventory() {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(`${API_BASE_URL}/inventory`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        products = await response.json();

        renderInventory(products);

    } catch (err) {

        console.error(err);

    }

}

function renderInventory(list) {

    const tbody = document.querySelector("#inventoryTable tbody");

    tbody.innerHTML = "";

    list.forEach(product => {

        const image = product.images && product.images.length
            ? product.images[0]
            : "../images/placeholder.png";

        let status = "🟢 In Stock";

        if (product.stock <= 5)
            status = "🟡 Low";

        if (product.stock === 0)
            status = "🔴 Out";

        tbody.innerHTML += `

        <tr>

            <td>

                <img
                    src="http://localhost:5000/${image.replace(/^\//, "")}"
                    width="60">

            </td>

            <td>${product.name}</td>

            <td>${product.category}</td>

            <td>

                <input
                    type="number"
                    id="stock-${product._id}"
                    value="${product.stock}"
                    style="width:70px;">

            </td>

            <td>${status}</td>

            <td>

                <button
                    onclick="saveStock('${product._id}')">

                    Save

                </button>

            </td>

        </tr>

        `;

    });

}

async function saveStock(id) {

    const token = localStorage.getItem("token");

    const stock = document.getElementById(`stock-${id}`).value;

    try {

        const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`

            },

            body: JSON.stringify({

                stock

            })

        });

        if (!response.ok)
            throw new Error("Failed to update stock");

        loadInventory();

    } catch (err) {

        alert(err.message);

    }

}

document.getElementById("searchInput").addEventListener("keyup", function () {

    const keyword = this.value.toLowerCase();

    const filtered = products.filter(product =>

        product.name.toLowerCase().includes(keyword) ||

        product.category.toLowerCase().includes(keyword)

    );

    renderInventory(filtered);

});

document.addEventListener("DOMContentLoaded", loadInventory);