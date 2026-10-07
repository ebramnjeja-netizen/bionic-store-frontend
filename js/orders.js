const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let allOrders = [];


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        showMessage(
            "❌ Please login as an administrator."
        );

        return;

    }


    try {

        showMessage(
            "Loading sales..."
        );


        const response =
            await fetch(
                `${API_BASE_URL}/orders`,
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load sales."
            );

        }


        allOrders =
            Array.isArray(data)
                ? data
                : data.orders || [];


        updateSummary(
            allOrders
        );


        renderOrders(
            allOrders
        );


    } catch (error) {

        console.error(
            "LOAD ORDERS ERROR:",
            error
        );


        showMessage(
            `❌ ${error.message}`
        );

    }

}


// ========================================
// RENDER ORDERS
// ========================================

function renderOrders(
    orders
) {

    const table =
        document.getElementById(
            "ordersTable"
        );

    const tbody =
        document.getElementById(
            "ordersTableBody"
        );


    if (!table || !tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !orders ||
        orders.length === 0
    ) {

        table.style.display =
            "none";


        showMessage(
            "No sales found."
        );

        return;

    }


    table.style.display =
        "table";


    hideMessage();


    orders.forEach(
        (order, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            const customer =
                order.customer
                    ? order.customer.name
                    : order.user
                        ? order.user.name
                        : "Walk-in Customer";


            const items =
                order.products
                    ? order.products.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item.quantity
                            ),
                        0
                    )
                    : 0;


            const date =
                order.createdAt
                    ? new Date(
                        order.createdAt
                    ).toLocaleString()
                    : "-";


            const orderNumber =
                order._id
                    ? order._id
                        .slice(-8)
                        .toUpperCase()
                    : "-";


            row.innerHTML = `

                <td>
                  <strong>
                   <a
                      href="order-details.html?id=${order._id}"
                       class="order-link"
                   >
                        #${orderNumber}
                   </a>
                  </strong>
                </td>


                <td>
                    ${date}
                </td>


                <td>

                    <strong>
                        ${escapeHTML(
                            customer
                        )}
                    </strong>

                    ${
                        order.customer &&
                        order.customer.phone
                            ? `
                                <br>
                                <small>
                                    ${escapeHTML(
                                        order.customer.phone
                                    )}
                                </small>
                              `
                            : ""
                    }

                </td>


                <td>
                    ${items}
                </td>


                <td>
                    ${escapeHTML(
                        order.paymentMethod ||
                        "-"
                    )}
                </td>


                <td>

                    <strong>
                        TZS ${Number(
                            order.totalPrice || 0
                        ).toFixed(2)}
                    </strong>

                </td>


                <td>

                    <select
                        class="status-select"
                        onchange="updateOrderStatus(
                            '${order._id}',
                            this.value
                        )"
                    >

                        ${statusOptions(
                            order.status
                        )}

                    </select>

                </td>


                <td>

                    <button
                        onclick="viewInvoice(
                            '${order._id}'
                        )"
                    >
                        🧾 Invoice
                    </button>


                    <button
                        onclick="viewOrder(
                            '${order._id}'
                        )"
                    >
                        👁 View
                    </button>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}


// ========================================
// STATUS OPTIONS
// ========================================

function statusOptions(
    currentStatus
) {

    const statuses = [
    "Pending",
    "Processing",
    "Paid",
    "Shipped",
    "Delivered",
    "Completed",
    "Cancelled"
    ];


    return statuses
        .map(status => `

            <option
                value="${status}"
                ${
                    status === currentStatus
                        ? "selected"
                        : ""
                }
            >
                ${status}
            </option>

        `)
        .join("");

}


// ========================================
// UPDATE ORDER STATUS
// ========================================

async function updateOrderStatus(
    orderId,
    status
) {

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        alert(
            "Please login."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/orders/${orderId}/status`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({
                            status
                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update status."
            );

        }


        alert(
            "✅ Order status updated."
        );


        loadOrders();


    } catch (error) {

        console.error(
            "UPDATE STATUS ERROR:",
            error
        );


        alert(
            `❌ ${error.message}`
        );


        loadOrders();

    }

}


// ========================================
// VIEW INVOICE
// ========================================

function viewInvoice(
    orderId
) {

     window.location.href =
        `invoices.html?id=${orderId}`;

}


// ========================================
// VIEW ORDER
// ========================================

    function viewOrder(orderId) {

    window.location.href =
        `order-details.html?id=${orderId}`;

}



// ========================================
// SEARCH
// ========================================

function filterOrders() {

    const search =
        document.getElementById(
            "orderSearch"
        ).value
        .toLowerCase()
        .trim();


    const status =
        document.getElementById(
            "statusFilter"
        ).value;


    const payment =
        document.getElementById(
            "paymentFilter"
        ).value;


    const filtered =
        allOrders.filter(
            order => {

                const customer =
                    order.customer
                        ? order.customer.name
                        : order.user
                            ? order.user.name
                            : "Walk-in Customer";


                const orderId =
                    order._id || "";


                const matchesSearch =

                    orderId
                        .toLowerCase()
                        .includes(search)

                    ||

                    customer
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =
                    !status ||
                    order.status === status;


                const matchesPayment =
                    !payment ||
                    order.paymentMethod === payment;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPayment
                );

            }
        );


    renderOrders(
        filtered
    );

}


// ========================================
// SUMMARY
// ========================================

function updateSummary(
    orders
) {

    const totalOrders =
        orders.length;


    const totalRevenue =
        orders.reduce(
            (total, order) =>
                total +
                Number(
                    order.totalPrice || 0
                ),
            0
        );


    const paidOrders =
        orders.filter(
            order =>
                order.status === "Paid" ||
                order.status === "Completed"
        ).length;


    const pendingOrders =
        orders.filter(
            order =>
                order.status === "Pending" ||
                order.status === "Processing"
        ).length;


    document.getElementById(
        "totalOrders"
    ).textContent =
        totalOrders;


    document.getElementById(
          "totalRevenue"
    ).textContent =
         `TZS ${totalRevenue.toLocaleString()}`;


    document.getElementById(
        "paidOrders"
    ).textContent =
        paidOrders;


    document.getElementById(
        "pendingOrders"
    ).textContent =
        pendingOrders;

}


// ========================================
// MESSAGE
// ========================================

function showMessage(
    message
) {

    const element =
        document.getElementById(
            "ordersMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.style.display =
        "block";

}


// ========================================
// HIDE MESSAGE
// ========================================

function hideMessage() {

    const element =
        document.getElementById(
            "ordersMessage"
        );


    if (!element) {
        return;
    }


    element.style.display =
        "none";

}


// ========================================
// SECURITY
// ========================================

function escapeHTML(
    value
) {

    return String(
        value || ""
    )

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
    () => {

        loadOrders();


        document
            .getElementById(
                "refreshOrders"
            )
            ?.addEventListener(
                "click",
                loadOrders
            );


        document
            .getElementById(
                "orderSearch"
            )
            ?.addEventListener(
                "input",
                filterOrders
            );


        document
            .getElementById(
                "statusFilter"
            )
            ?.addEventListener(
                "change",
                filterOrders
            );


        document
            .getElementById(
                "paymentFilter"
            )
            ?.addEventListener(
                "change",
                filterOrders
            );

    }
);