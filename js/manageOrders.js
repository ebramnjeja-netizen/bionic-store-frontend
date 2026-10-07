const API_BASE_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", loadOrders);

async function loadOrders() {

    try {

        const response = await fetch(`${API_BASE_URL}/orders`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const orders = await response.json();

        const tbody = document.getElementById("ordersBody");

        tbody.innerHTML = "";

        orders.forEach(order => {

             const orderNumber = order._id
              ? order._id.slice(-8).toUpperCase()
             : "-";

          tbody.innerHTML += `
           <tr>

            <td>
                <a
                    href="order-details.html?id=${order._id}"
                    class="order-link"
                >
                    #${orderNumber}
                    </a>
                    </td>

                   <td>${order.user.name}</td>

                    <td>${order.user.email}</td>

                    <td>$${order.totalPrice}</td>

                    <td>${order.paymentMethod}</td>

                    <td>

                <select onchange="updateStatus('${order._id}', this.value)">

                 <option value="Processing"
              ${order.status === "Processing" ? "selected" : ""}>
                  Processing
              </option>

              <option value="Shipped"
                 ${order.status === "Shipped" ? "selected" : ""}>
                    Shipped
                 </option>

              <option value="Delivered"
                       ${order.status === "Delivered" ? "selected" : ""}>
                 Delivered
                     </option>

                  <option value="Cancelled"
                 ${order.status === "Cancelled" ? "selected" : ""}>
                   Cancelled
                </option>

            </select>

            </td>

                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(error);

        alert("Failed to load orders.");

    }

}


async function updateStatus(orderId, status) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/orders/${orderId}/status`,
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({ status })

            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        alert("✅ Order status updated.");

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}