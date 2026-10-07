const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";


// ========================================
// LOAD CUSTOMER ORDERS
// ========================================

async function loadCustomerOrders() {

    const token =
        localStorage.getItem("token");


    const loginMessage =
        document.getElementById(
            "ordersLoginMessage"
        );

    const ordersSection =
        document.getElementById(
            "customerOrdersSection"
        );


    if (!token) {

        if (loginMessage) {
            loginMessage.style.display =
                "block";
        }

        if (ordersSection) {
            ordersSection.style.display =
                "none";
        }

        return;

    }


    if (loginMessage) {
        loginMessage.style.display =
            "none";
    }


    if (ordersSection) {
        ordersSection.style.display =
            "block";
    }


    showCustomerOrdersMessage(
        "Loading your orders..."
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/orders`,
                {
                    method: "GET",

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
                "Failed to load your orders."
            );

        }


        const orders =
            Array.isArray(data)
                ? data
                : data.orders || [];

                
                
        console.log("MY ORDERS DATA:", orders);
        console.log("FIRST ORDER PRODUCTS:", orders[0].products);
        console.log("FIRST PRODUCT ITEM:", orders[0].products[0]);

        renderCustomerOrders(
            orders
        );
        updateOrderNotifications(orders);


    } catch (error) {

        console.error(
            "CUSTOMER ORDERS ERROR:",
            error
        );


        showCustomerOrdersMessage(
            `❌ ${error.message}`
        );

    }

}



// ========================================
// RENDER CUSTOMER ORDERS
// ========================================

function renderCustomerOrders(
    orders
) {

    const list =
        document.getElementById(
            "customerOrdersList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    if (
        !orders ||
        orders.length === 0
    ) {

        showCustomerOrdersMessage(
            "📦 You have no orders yet."
        );

        return;

    }


    hideCustomerOrdersMessage();


    orders.forEach(
        order => {

            const orderCard =
                document.createElement(
                    "div"
                );


            orderCard.className =
                "customer-order-card";


            const orderNumber =
                order._id
                    ? order._id
                        .slice(-8)
                        .toUpperCase()
                    : "-";


            const orderDate =
                order.createdAt
                    ? new Date(
                        order.createdAt
                    ).toLocaleString()
                    : "-";


            const status =
                order.status ||
                "Pending";

            let statusMessage = "";

            if (status === "Pending") {
                  statusMessage = "🕐 Your order has been received and is waiting for processing.";
            } else if (status === "Processing") {
                  statusMessage = "⚙️ Your order is now being processed.";
            } else if (status === "Paid") {
                 statusMessage = "💳 Your payment has been confirmed.";
            } else if (status === "Shipped") {
                 statusMessage = "🚚 Your order has been shipped.";
            } else if (status === "Delivered") {
                 statusMessage = "📦 Your order has been delivered.";
            } else if (status === "Completed") {
                 statusMessage = "✅ Your order has been completed. Thank you for shopping with Bionic Store!";
            } else if (status === "Cancelled") {
                  statusMessage = "❌ Your order has been cancelled.";
            }


            const total =
                Number(
                    order.totalPrice || 0
                );


            const itemCount =
                order.products
                    ? order.products.reduce(
                        (
                            totalItems,
                            item
                        ) =>
                            totalItems +
                            Number(
                                item.quantity || 0
                            ),
                        0
                    )
                    : 0;


            orderCard.innerHTML = `

                <div class="customer-order-card-header">

                    <div>

                        <span>
                            Order
                        </span>

                        <strong>
                            #${orderNumber}
                        </strong>

                    </div>

                    <div class="customer-order-notification">
                          ${statusMessage}
                     </div>


                    <span
                        class="
                            customer-order-status
                            status-${status
                                .toLowerCase()
                                .replace(/\s+/g, "-")}
                        "
                    >
                        ${status}
                    </span>

                </div>



                <div class="customer-order-card-info">

                    <div>

                        <span>
                            📅 Date
                        </span>

                        <strong>
                            ${orderDate}
                        </strong>

                    </div>


                    <div>

                        <span>
                            🛍️ Items
                        </span>

                        <strong>
                            ${itemCount}
                        </strong>

                    </div>


                    <div>

                        <span>
                            💳 Payment
                        </span>

                        <strong>
                            ${escapeHTML(
                                order.paymentMethod ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            💰 Total
                        </span>

                        <strong>
                            TZS ${total.toLocaleString()}
                        </strong>

                    </div>

                </div>



                <div class="customer-order-progress">

                    ${renderOrderProgress(
                        status
                    )}

                </div>



                <div class="customer-order-actions">

                    <button
                        type="button"
                        onclick="viewCustomerOrder(
                            '${order._id}'
                        )"
                    >
                        👁 View Details
                    </button>

                </div>

            `;


            list.appendChild(
                orderCard
            );

        }
    );

}



// ========================================
// ORDER PROGRESS
// ========================================

function renderOrderProgress(
    status
) {

    const steps = [
       "Pending",
      "Processing",
        "Paid",
       "Shipped",
        "Delivered",
       "Completed"
    ];


    let currentIndex =
        steps.indexOf(status);


    if (status === "Paid") {
    currentIndex = 2;
}

if (status === "Shipped") {
    currentIndex = 3;
}

if (status === "Delivered") {
    currentIndex = 4;
}

if (status === "Completed") {
    currentIndex = 5;
}


    if (currentIndex < 0) {
        currentIndex = 0;
    }


    return `

        <div class="order-progress">

            ${steps.map(
                (
                    step,
                    index
                ) => `

                    <div
                        class="
                            order-progress-step
                            ${
                                index <= currentIndex
                                    ? "completed"
                                    : ""
                            }
                        "
                    >

                        <div
                            class="
                                order-progress-dot
                            "
                        >
                            ${
                                index <= currentIndex
                                    ? "✓"
                                    : ""
                            }
                        </div>


                        <span>
                            ${step}
                        </span>

                    </div>

                `
            ).join("")}

        </div>

    `;

}



// ========================================
// VIEW ORDER
// ========================================

function viewCustomerOrder(
    orderId
) {

    window.location.href =
        `order-details.html?id=${orderId}`;

}



// ========================================
// MESSAGE
// ========================================

function showCustomerOrdersMessage(
    message
) {

    const element =
        document.getElementById(
            "customerOrdersMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.style.display =
        "block";

}


function hideCustomerOrdersMessage() {

    const element =
        document.getElementById(
            "customerOrdersMessage"
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
// ORDER STATUS NOTIFICATIONS
// ========================================

function updateOrderNotifications(orders) {

    const previousOrders =
        JSON.parse(localStorage.getItem("orderStatusSnapshot")) || {};

    const notifications =
        JSON.parse(localStorage.getItem("orderNotifications")) || [];

    orders.forEach(order => {

        const orderId = order._id;
        const currentStatus = order.status || "Pending";

        if (
            previousOrders[orderId] &&
            previousOrders[orderId] !== currentStatus
        ) {

            let message = "";

            if (currentStatus === "Processing") {
                message = "⚙️ Your order is now being processed.";
            } else if (currentStatus === "Paid") {
                message = "💳 Your payment has been confirmed.";
            } else if (currentStatus === "Shipped") {
                message = "🚚 Your order has been shipped.";
            } else if (currentStatus === "Delivered") {
                message = "📦 Your order has been delivered.";
            } else if (currentStatus === "Completed") {
                message =
                    "✅ Your order has been completed. Thank you for shopping with Bionic Store!";
            } else if (currentStatus === "Cancelled") {
                message = "❌ Your order has been cancelled.";
            }

            if (message) {

                notifications.unshift({
                    orderId: orderId,
                    status: currentStatus,
                    message: message,
                    date: new Date().toISOString()
                });

            }
        }

        previousOrders[orderId] = currentStatus;
    });

    // Keep the latest 10 notifications
    const latestNotifications =
        notifications.slice(0, 10);

    localStorage.setItem(
        "orderStatusSnapshot",
        JSON.stringify(previousOrders)
    );

    localStorage.setItem(
        "orderNotifications",
        JSON.stringify(latestNotifications)
    );

    localStorage.setItem(
        "notificationCount",
        latestNotifications.length
    );

    if (typeof updateNotificationCount === "function") {
        updateNotificationCount();
    }
}






// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCustomerOrders();


        document
            .getElementById(
                "refreshCustomerOrders"
            )
            ?.addEventListener(
                "click",
                loadCustomerOrders
            );

    }
);

