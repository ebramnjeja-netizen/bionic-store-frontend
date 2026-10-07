const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";


// ========================================
// GET ORDER ID
// ========================================

const params =
    new URLSearchParams(window.location.search);

const orderId =
    params.get("id");


// ========================================
// FORMAT MONEY
// ========================================

function formatMoney(value) {

    return `TZS ${Number(value || 0).toLocaleString()}`;

}


// ========================================
// SECURITY
// ========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ========================================
// LOAD ORDER
// ========================================

async function loadOrderDetails() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert("Please login.");

        window.location.href =
            "login.html";

        return;

    }


    if (!orderId) {

        alert("Order ID is missing.");

        window.location.href =
            "orders.html";

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/orders/${orderId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const order =
            await response.json();


        if (!response.ok) {

            throw new Error(
                order.message ||
                "Failed to load order"
            );

        }


        displayOrder(order);


    } catch (error) {

        console.error(
            "ORDER DETAILS ERROR:",
            error
        );


        alert(error.message);

    }

}


// ========================================
// DISPLAY ORDER
// ========================================

function displayOrder(order) {

    // ------------------------------------
    // ORDER INFORMATION
    // ------------------------------------

    document.getElementById(
         "orderNumber"
    ).textContent =
         `Order #${String(order._id || "").slice(-6).toUpperCase()}`;


    document.getElementById(
        "orderStatus"
    ).textContent =
        order.status || "Processing";


    document.getElementById(
        "orderDate"
    ).textContent =
        order.createdAt
            ? new Date(
                order.createdAt
            ).toLocaleString()
            : "-";


    document.getElementById(
        "paymentMethod"
    ).textContent =
        order.paymentMethod || "Cash";


    document.getElementById(
        "orderType"
    ).textContent =
        order.orderType || "Online";


    // ------------------------------------
    // CUSTOMER
    // ------------------------------------

    const customer =
        order.customer || null;


    document.getElementById(
        "customerName"
    ).textContent =
        customer?.name ||
        order.customerName ||
        "Walk-in Customer";


    document.getElementById(
        "customerPhone"
    ).textContent =
        customer?.phone ||
        order.phone ||
        "-";


    document.getElementById(
        "customerEmail"
    ).textContent =
        customer?.email ||
        "-";


    // ------------------------------------
    // PRODUCTS
    // ------------------------------------

    const table =
        document.getElementById(
            "orderProducts"
        );


    const products =
        Array.isArray(order.products)
            ? order.products
            : [];


    if (!products.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="text-align:center;"
                >
                    No products found.
                </td>

            </tr>

        `;

    } else {

        table.innerHTML = "";


        let calculatedSubtotal = 0;


        products.forEach(item => {

            const price =
                Number(item.price) || 0;


            const quantity =
                Number(item.quantity) || 0;


            const itemTotal =
                price * quantity;


            calculatedSubtotal +=
                itemTotal;


            table.innerHTML += `

                <tr>

                    <td>
                        ${escapeHTML(
                            item.name || "Product"
                        )}
                    </td>

                    <td>
                        ${formatMoney(price)}
                    </td>

                    <td>
                        ${quantity}
                    </td>

                    <td>
                        ${formatMoney(itemTotal)}
                    </td>

                </tr>

            `;

        });


        // --------------------------------
        // FINANCIAL SUMMARY
        // --------------------------------

        const discount =
            Number(order.discount) || 0;


        const subtotal =
            calculatedSubtotal;


        const total =
            Number(order.totalPrice) ||
            Math.max(
                subtotal - discount,
                0
            );


        const amountReceived =
            Number(order.amountReceived) || 0;


        const change =
            Number(order.change) || 0;


        document.getElementById(
            "orderSubtotal"
        ).textContent =
            formatMoney(subtotal);


        document.getElementById(
            "orderDiscount"
        ).textContent =
            formatMoney(discount);


        document.getElementById(
            "orderTotal"
        ).textContent =
            formatMoney(total);


        document.getElementById(
            "amountReceived"
        ).textContent =
            formatMoney(amountReceived);


        document.getElementById(
            "orderChange"
        ).textContent =
            formatMoney(change);

    }

}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    loadOrderDetails
);
