const API_BASE_URL = "http://localhost:5000/api";

function formatMoney(amount) {
    return `TZS ${Number(amount || 0).toLocaleString("en-TZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}

async function loadProducts() {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(`${API_BASE_URL}/products`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const products = await response.json();

        if (!response.ok) {
            throw new Error(products.message || "Failed to load products.");
        }

        const table = document.getElementById("productsTable");

        table.innerHTML = "";

        products.forEach(product => {

            const costPrice = Number(product.costPrice || 0);
            const sellingPrice = Number(product.price || 0);

            const profit = sellingPrice - costPrice;

            const margin = sellingPrice > 0
                ? (profit / sellingPrice) * 100
                : 0;

            const image = product.images && product.images.length > 0
                 ? (
                       product.images[0].startsWith("/uploads")
                               ? `http://localhost:5000${product.images[0]}`
                             : `../${product.images[0]}`
                    )
                    : "../images/placeholder.jpg";

            const stock = Number(product.stock || 0);

let stockDisplay = "";

if (stock <= 0) {
    stockDisplay = `
        <span class="stock out-stock">
            ❌ Out of Stock
        </span>
    `;
} else if (stock <= 10) {
    stockDisplay = `
        <span class="stock low-stock">
            ⚠️ ${stock} left
        </span>
    `;
} else {
    stockDisplay = `
        <span class="stock in-stock">
            ✅ ${stock}
        </span>
    `;
}

        table.innerHTML += `
          <tr>

              <td>
                  <img
                        src="${image}"
                       width="60"
                       alt="${product.name}"
                      >
             </td>

                  <td>${product.name}</td>

                 <td>${product.category || "Uncategorized"}</td>

                  <td>${formatMoney(costPrice)}</td>

                 <td>${formatMoney(sellingPrice)}</td>

                 <td>
                     ${formatMoney(profit)}
                 </td>

                  <td>
                       ${margin.toFixed(1)}%
                  </td>

                  <td>
                     ${stockDisplay}
                 </td>

              <td>

                       <button onclick="addStock('${product._id}', ${stock})">
                            ➕ Add Stock
                        </button>

                        <button onclick="reduceStock('${product._id}', ${stock})">
                           ➖ Reduce Stock
                        </button>

                        <button onclick="editProduct('${product._id}')">
                             ✏ Edit
                        </button>

                        <button onclick="deleteProduct('${product._id}')">
                             🗑 Delete
                        </button>

                </td>

              </tr>
            `;

        });

    } catch (error) {

        console.error(error);

        alert(error.message || "Failed to load products.");

    }

}

function editProduct(id) {

    window.location.href = `edit-product.html?id=${id}`;

}

async function deleteProduct(id) {

    if (!confirm("Delete this product?")) return;

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(`${API_BASE_URL}/products/${id}`, {

            method: "DELETE",

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete product.");
        }

        alert("✅ Product deleted successfully.");

        loadProducts();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}

async function addStock(productId, currentStock) {

    const amount = prompt("How many items do you want to add?");

    if (amount === null) return;

    const quantity = Number(amount);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("❌ Please enter a valid whole number.");
        return;
    }

    await updateStock(
        productId,
        currentStock + quantity
    );
}


async function reduceStock(productId, currentStock) {

    const amount = prompt("How many items do you want to remove?");

    if (amount === null) return;

    const quantity = Number(amount);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("❌ Please enter a valid whole number.");
        return;
    }

    if (quantity > currentStock) {
        alert(
            `❌ You only have ${currentStock} item(s) in stock.`
        );
        return;
    }

    await updateStock(
        productId,
        currentStock - quantity
    );
}


async function updateStock(productId, newStock) {

    const token = localStorage.getItem("token");

    try {

        const productResponse = await fetch(
            `${API_BASE_URL}/products/${productId}`
        );

        const product = await productResponse.json();

        if (!productResponse.ok) {
            throw new Error(
                product.message || "Failed to load product."
            );
        }

        product.stock = newStock;

        const response = await fetch(
            `${API_BASE_URL}/products/${productId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(product)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to update stock."
            );
        }

        alert("✅ Stock updated successfully.");

        loadProducts();

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to update stock."
        );
    }
}

document.addEventListener("DOMContentLoaded", loadProducts);