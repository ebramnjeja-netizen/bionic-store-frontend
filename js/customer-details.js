const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";


// =========================
// GET CUSTOMER ID
// =========================

const params =
    new URLSearchParams(
        window.location.search
    );

const customerId =
    params.get("id");


// =========================
// LOAD CUSTOMER DETAILS
// =========================

async function loadCustomerDetails() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert("Please login.");

        window.location.href =
            "login.html";

        return;

    }


    if (!customerId) {

        alert(
            "Customer ID is missing."
        );

        window.location.href =
            "customers.html";

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/customers/${customerId}`,
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
                "Failed to load customer"
            );

        }


        displayCustomer(data);


        loadPurchaseHistory(token);

        loadRepairHistory(token);


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// =========================
// DISPLAY CUSTOMER
// =========================

function displayCustomer(customer) {

    document.getElementById(
        "customerName"
    ).textContent =
        customer.name || "-";


    document.getElementById(
        "customerPhone"
    ).textContent =
        customer.phone || "-";


    document.getElementById(
        "customerEmail"
    ).textContent =
        customer.email || "-";


    document.getElementById(
        "customerAddress"
    ).textContent =
        customer.address || "-";


    document.getElementById(
        "totalOrders"
    ).textContent =
        customer.totalOrders || 0;


    document.getElementById(
    "totalPurchases"
    ).textContent =
    `TZS ${Number(
        customer.totalPurchases || 0
    ).toLocaleString()}`;


    document.getElementById(
        "lastPurchase"
    ).textContent =
        customer.lastPurchaseDate
            ? new Date(
                customer.lastPurchaseDate
            ).toLocaleDateString()
            : "None";


    document.getElementById(
        "customerNotes"
    ).textContent =
        customer.notes || "No notes.";


    document.getElementById(
        "editCustomerBtn"
    ).onclick = () => {

        window.location.href =
            `customers.html?edit=${customer._id}`;

    };

}



function updateCustomerActivity(orders) {

    if (!Array.isArray(orders) || !orders.length) {

        document.getElementById(
            "averageOrderValue"
        ).textContent = "TZS 0";

        document.getElementById(
            "highestOrderValue"
        ).textContent = "TZS 0";

        document.getElementById(
            "totalItemsPurchased"
        ).textContent = "0";

        document.getElementById(
            "purchaseFrequency"
        ).textContent = "No purchases";

        document.getElementById(
            "paymentMethods"
        ).textContent = "-";

        return;
    }

    const totals = orders.map(
        order => Number(order.totalPrice || 0)
    );

    const totalSpent =
        totals.reduce(
            (sum, value) => sum + value,
            0
        );

    const averageOrder =
        totalSpent / orders.length;

    const highestOrder =
        Math.max(...totals);

    const totalItems =
        orders.reduce(
            (total, order) => {

                if (!Array.isArray(order.products)) {
                    return total;
                }

                return total +
                    order.products.reduce(
                        (sum, item) =>
                            sum +
                            Number(item.quantity || 0),
                        0
                    );

            },
            0
        );

    const paymentMethods =
        [
            ...new Set(
                orders.map(
                    order =>
                        order.paymentMethod || "Cash"
                )
            )
        ];

    const firstPurchase =
        orders
            .map(order => new Date(order.createdAt))
            .filter(date => !isNaN(date))
            .sort((a, b) => a - b)[0];

    const frequency =
        orders.length === 1
            ? "1 order"
            : `${orders.length} orders`;

    document.getElementById(
        "averageOrderValue"
    ).textContent =
        `TZS ${averageOrder.toLocaleString("en-TZ")}`;

    document.getElementById(
        "highestOrderValue"
    ).textContent =
        `TZS ${highestOrder.toLocaleString("en-TZ")}`;

    document.getElementById(
        "totalItemsPurchased"
    ).textContent =
        totalItems;

    document.getElementById(
        "customerSince"
    ).textContent =
        firstPurchase
            ? firstPurchase.toLocaleDateString("en-TZ")
            : "-";

    document.getElementById(
        "purchaseFrequency"
    ).textContent =
        frequency;

    document.getElementById(
        "paymentMethods"
    ).textContent =
        paymentMethods.join(", ");
}



function updateProductPurchaseBreakdown(orders) {

    const table =
        document.getElementById(
            "productPurchaseBreakdown"
        );

    if (!table) return;

    const productMap = {};

    orders.forEach(order => {

        if (!Array.isArray(order.products)) {
            return;
        }

        order.products.forEach(item => {

            const product =
                item.product &&
                typeof item.product === "object"
                    ? item.product
                    : null;

            const productId =
                item.product?._id ||
                item.product ||
                item._id ||
                item.name ||
                "unknown";

            const productName =
                item.name ||
                product?.name ||
                "Product";

            const quantity =
                Number(item.quantity || 0);

            const price =
                Number(item.price || 0);

            if (!productMap[productId]) {

                productMap[productId] = {
                    name: productName,
                    quantity: 0,
                    total: 0
                };

            }

            productMap[productId].quantity +=
                quantity;

            productMap[productId].total +=
                price * quantity;

        });

    });

    const products =
        Object.values(productMap)
            .sort(
                (a, b) =>
                    b.total - a.total
            );

    if (!products.length) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    style="text-align:center;">
                    No product purchases found.
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = "";

    products.forEach(product => {

        table.innerHTML += `

            <tr>

                <td>
                    <strong>
                        ${escapeHTML(product.name)}
                    </strong>
                </td>

                <td>
                    ${product.quantity}
                </td>

                <td>
                    <strong>
                        TZS ${product.total.toLocaleString("en-TZ")}
                    </strong>
                </td>

            </tr>

        `;

    });

}

function updateCustomerValue(orders) {

    const valueElement =
        document.getElementById("customerValue");

    const productElement =
        document.getElementById("mostPurchasedProduct");

    const paymentElement =
        document.getElementById("preferredPayment");

    const segmentElement =
        document.getElementById("customerSegment");

    if (!Array.isArray(orders) || !orders.length) {

        if (valueElement)
            valueElement.textContent = "TZS 0";

        if (productElement)
            productElement.textContent = "-";

        if (paymentElement)
            paymentElement.textContent = "-";

        if (segmentElement)
            segmentElement.textContent = "New Customer";

        return;
    }

    const customerValue =
        orders.reduce(
            (total, order) =>
                total +
                Number(order.totalPrice || 0),
            0
        );

    const productMap = {};

    orders.forEach(order => {

        if (!Array.isArray(order.products)) {
            return;
        }

        order.products.forEach(item => {

            const product =
                item.product &&
                typeof item.product === "object"
                    ? item.product
                    : null;

            const name =
                item.name ||
                product?.name ||
                "Product";

            const quantity =
                Number(item.quantity || 0);

            productMap[name] =
                (productMap[name] || 0) +
                quantity;

        });

    });

    const mostPurchased =
        Object.entries(productMap)
            .sort((a, b) => b[1] - a[1])[0];

    const paymentMap = {};

    orders.forEach(order => {

        const method =
            order.paymentMethod || "Cash";

        paymentMap[method] =
            (paymentMap[method] || 0) + 1;

    });

    const preferredPayment =
        Object.entries(paymentMap)
            .sort((a, b) => b[1] - a[1])[0];

    let segment = "New Customer";

    if (orders.length >= 10) {

        segment = "VIP Customer";

    } else if (orders.length >= 5) {

        segment = "Loyal Customer";

    } else if (orders.length >= 2) {

        segment = "Returning Customer";

    }

    if (valueElement) {

        valueElement.textContent =
            `TZS ${customerValue.toLocaleString("en-TZ")}`;

    }

    if (productElement) {

        productElement.textContent =
            mostPurchased
                ? `${mostPurchased[0]} (${mostPurchased[1]})`
                : "-";

    }

    if (paymentElement) {

        paymentElement.textContent =
            preferredPayment
                ? preferredPayment[0]
                : "-";

    }

    if (segmentElement) {

        segmentElement.textContent =
            segment;

    }

}


function updateCustomerSpendingChart(orders) {

    const canvas =
        document.getElementById(
            "customerSpendingChart"
        );

    if (!canvas) return;

    if (
        window.customerSpendingChart &&
        typeof window.customerSpendingChart.destroy === "function"
    ) {
        window.customerSpendingChart.destroy();
    }

    if (!Array.isArray(orders) || !orders.length) {
        return;
    }

    const sortedOrders =
        [...orders].sort(
            (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
        );

    const labels =
        sortedOrders.map(order =>
            new Date(
                order.createdAt
            ).toLocaleDateString("en-TZ")
        );

    const values =
        sortedOrders.map(order =>
            Number(order.totalPrice || 0)
        );

    window.customerSpendingChart =
        new Chart(
            canvas.getContext("2d"),
            {
                type: "line",

                data: {
                    labels: labels,

                    datasets: [
                        {
                            label: "Order Spending (TZS)",

                            data: values,

                            tension: 0.3,

                            fill: false,

                            borderWidth: 2,

                            pointRadius: 4
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: true
                        },

                        tooltip: {

                            callbacks: {

                                label: function(context) {

                                    return (
                                        "TZS " +
                                        Number(
                                            context.raw || 0
                                        ).toLocaleString(
                                            "en-TZ"
                                        )
                                    );

                                }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback: function(value) {

                                    return (
                                        "TZS " +
                                        Number(
                                            value
                                        ).toLocaleString(
                                            "en-TZ"
                                        )
                                    );

                                }

                            }

                        }

                    }

                }

            }
        );
}




// =========================
// PURCHASE HISTORY
// =========================

async function loadPurchaseHistory(token) {

    const table =
        document.getElementById("purchaseHistory");

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/customers/${customerId}/orders`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const orders =
            await response.json();

         updateCustomerActivity(orders);

         updateCustomerValue(orders);

         updateCustomerSpendingChart(orders);
         

        if (!response.ok) {

            throw new Error(
                orders.message ||
                "Failed to load orders"
            );

        }

        updateProductPurchaseBreakdown(orders);

        if (!Array.isArray(orders) || !orders.length) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="text-align:center;">
                        No purchase history.
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML = "";

        orders.forEach(order => {

            const itemCount =
                Array.isArray(order.products)
                    ? order.products.reduce(
                        (total, item) =>
                            total +
                            Number(item.quantity || 0),
                        0
                    )
                    : 0;

            const orderDate =
                order.createdAt
                    ? new Date(
                        order.createdAt
                    ).toLocaleDateString("en-TZ")
                    : "-";

            const total =
                Number(order.totalPrice || 0);

            const status =
                order.status || "Processing";

            table.innerHTML += `

                <tr>

                    <td>
                        <a
                            href="order-details.html?id=${order._id}"
                            class="order-link">
                            #${String(order._id).slice(-6).toUpperCase()}
                        </a>
                    </td>

                    <td>
                        ${orderDate}
                    </td>

                    <td>
                        ${itemCount}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.paymentMethod || "Cash"
                        )}
                    </td>

                    <td>
                        <strong>
                            TZS ${total.toLocaleString("en-TZ")}
                        </strong>
                    </td>

                    <td>
                        <span class="customer-order-status">
                            ${escapeHTML(status)}
                        </span>
                    </td>

                    <td>

                 <button
                      class="customer-order-action"
                       onclick="viewCustomerOrder('${order._id}')">
                        👁️ View
                  </button>

                    <button
                          class="customer-order-action invoice"
                         onclick="viewCustomerInvoice('${order._id}')">
                          🧾 Invoice
                     </button>

                </td>

                </tr>

            `;
        });

    } catch (error) {

        console.error(
            "CUSTOMER PURCHASE HISTORY ERROR:",
            error
        );

        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;">
                    Unable to load purchase history.
                </td>
            </tr>
        `;
    }
}




// =========================
// REPAIR HISTORY
// =========================

async function loadRepairHistory(token) {

    const table =
        document.getElementById(
            "repairHistory"
        );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/repairs?customerId=${customerId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const repairs =
            await response.json();


        if (!response.ok) {

            throw new Error(
                repairs.message ||
                "Failed to load repairs"
            );

        }


        if (!repairs.length) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="text-align:center;">

                        No repair history.

                    </td>

                </tr>

            `;

            document.getElementById(
                "totalRepairs"
            ).textContent = "0";

            return;

        }


        document.getElementById(
            "totalRepairs"
        ).textContent =
            repairs.length;


        table.innerHTML = "";


        repairs.forEach(repair => {

            table.innerHTML += `

                <tr>

                    <td>
                        ${escapeHTML(
                            repair.deviceType || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            repair.brand || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            repair.model || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            repair.problem || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            repair.status ||
                            "Pending"
                        )}
                    </td>

                    <td>
                        ${repair.createdAt
                            ? new Date(
                                repair.createdAt
                            ).toLocaleDateString()
                            : "-"
                        }
                    </td>

                </tr>

            `;

        });


    } catch (error) {

        console.error(error);

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align:center;">

                    No repair history available.

                </td>

            </tr>

        `;

    }

}


// =========================
// VIEW CUSTOMER ORDER
// =========================

function viewCustomerOrder(orderId) {

    window.location.href =
        `order-details.html?id=${orderId}`;

}


function viewCustomerInvoice(orderId) {

    window.location.href =
        `invoices.html?id=${orderId}`;

}


// =========================
// SECURITY
// =========================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =========================
// START
// =========================

document.addEventListener(
    "DOMContentLoaded",
    loadCustomerDetails
);