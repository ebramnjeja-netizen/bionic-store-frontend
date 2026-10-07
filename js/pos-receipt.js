const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";


// ========================================
// FORMAT MONEY
// ========================================

function formatMoney(amount) {

    return `TZS ${Number(amount || 0).toLocaleString(
        "en-TZ",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )}`;

}


// ========================================
// LOAD RECEIPT
// ========================================

async function loadReceipt() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const orderId =
        params.get("id");


    if (!orderId) {

        alert("Receipt order ID is missing.");

        return;

    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        alert("Please login.");

        window.location.href =
            "../index.html";

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
                "Failed to load receipt."
            );

        }


        renderReceipt(order);


    } catch (error) {

        console.error(
            "RECEIPT ERROR:",
            error
        );

        alert(
            error.message ||
            "Unable to load receipt."
        );

    }

}


// ========================================
// RENDER RECEIPT
// ========================================

function renderReceipt(order) {

    const receiptNumber =
        order._id
            ? order._id
                .slice(-8)
                .toUpperCase()
            : "-";


    document.getElementById(
        "receiptNumber"
    ).textContent =
        `#${receiptNumber}`;


    document.getElementById(
        "receiptDate"
    ).textContent =
        order.createdAt
            ? new Date(
                order.createdAt
            ).toLocaleString("en-TZ")
            : "-";


    const customer =
        order.customer
            ? order.customer.name
            : "Walk-in Customer";


    const phone =
        order.customer &&
        order.customer.phone
            ? order.customer.phone
            : "-";


    document.getElementById(
        "customerName"
    ).textContent =
        customer;


    document.getElementById(
        "customerPhone"
    ).textContent =
        phone;


    const itemsContainer =
        document.getElementById(
            "receiptItems"
        );


    itemsContainer.innerHTML = "";


    let subtotal = 0;


    if (Array.isArray(order.products)) {

        order.products.forEach(item => {

            const quantity =
                Number(item.quantity || 0);

            const price =
                Number(item.price || 0);

            const itemTotal =
                price * quantity;


            subtotal += itemTotal;


            itemsContainer.innerHTML += `

                <tr>

                    <td>
                        ${escapeHTML(
                            item.name || "-"
                        )}
                    </td>

                    <td>
                        ${quantity}
                    </td>

                    <td>
                        ${formatMoney(price)}
                    </td>

                    <td>
                        ${formatMoney(itemTotal)}
                    </td>

                </tr>

            `;

        });

    }


    const discount =
        Number(order.discount || 0);


    const total =
        Number(
            order.totalPrice ||
            Math.max(
                0,
                subtotal - discount
            )
        );


    const received =
        Number(
            order.amountReceived || 0
        );


    const change =
        Number(
            order.change || 0
        );


    document.getElementById(
        "receiptSubtotal"
    ).textContent =
        formatMoney(subtotal);


    document.getElementById(
        "receiptDiscount"
    ).textContent =
        formatMoney(discount);


    document.getElementById(
        "receiptTotal"
    ).textContent =
        formatMoney(total);


    document.getElementById(
        "receiptPayment"
    ).textContent =
        order.paymentMethod || "Cash";


    document.getElementById(
        "receiptReceived"
    ).textContent =
        formatMoney(received);


    document.getElementById(
        "receiptChange"
    ).textContent =
        formatMoney(change);

}


// ========================================
// SECURITY
// ========================================

function escapeHTML(value) {

    return String(value || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    loadReceipt
);