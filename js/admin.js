const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

async function loadDashboard() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login.");
        window.location.href = "login.html";
        return;
    }

    try {

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.isAdmin) {
            alert("Admin access only.");
            window.location.href = "../index.html";
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load dashboard");
        }

        // Dashboard cards
        document.getElementById("totalProducts").textContent = data.totalProducts;
        document.getElementById("totalOrders").textContent = data.totalOrders;
        document.getElementById("totalUsers").textContent = data.totalUsers;
        document.getElementById("totalSales").textContent =
            `TZS ${Number(data.totalSales || 0).toLocaleString("en-TZ")}`;
        // Sales chart
        const ctx = document.getElementById("salesChart");

        if (ctx) {
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    datasets: [{
                        label: "Sales (TZS)",
                        data: data.monthlySales,
                        borderWidth: 3,
                        tension: 0.3,
                        fill: false
                    }]
                }
            });
        }

        // Recent Orders
        const table = document.getElementById("recentOrders");

        if (table) {

            table.innerHTML = `
                <tr>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            `;

            data.recentOrders.forEach(order => {

                table.innerHTML += `
                    <tr>
                        <td>${order.user ? order.user.name : "Guest"}</td>
                        <td>
                             TZS ${Number(order.totalPrice || 0).toLocaleString("en-TZ")}
                        </td>
                        <td>${order.status}</td>
                    </tr>
                `;

            });

        }

        // Low Stock Products
        const lowStockTable = document.getElementById("lowStockTable");

        if (lowStockTable) {

            lowStockTable.innerHTML = `
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            `;

            data.lowStockProducts.forEach(product => {

                const stock = Number(product.stock || 0);

                 const status =
                        stock <= 0
                          ? "❌ Out of Stock"
                         : "⚠️ Low Stock";

                lowStockTable.innerHTML += `
                     <tr>

                           <td>
                             ${product.name}
                         </td>

                              <td>
                                ${product.category || "Uncategorized"}
                             </td>

                              <td>
                                   ${stock}
                              </td>

                              <td>
                                    ${status}
                             </td>

                              <td>
                                 <button
                                      onclick="manageProduct('${product._id}')">
                                      📦 Manage
                                 </button>
                             </td>

                          </tr>
                         `;

                    });

        }

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

}

function manageProduct(productId) {
    window.location.href =
        `edit-product.html?id=${productId}`;
}



document.addEventListener("DOMContentLoaded", loadDashboard);