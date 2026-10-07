// =============================
// USER INTERFACE
// =============================

function openCart() {

    document.getElementById("cartSidebar")
        .classList.add("active");

}

function closeCart() {

    document.getElementById("cartSidebar")
        .classList.remove("active");

}

// ========================================
// BIONIC STORE NOTIFICATIONS
// ========================================

function goToMyOrders() {
    window.location.href = "pages/my-orders.html";
}

function updateNotificationCount() {
    const notificationCount =
        document.getElementById("notificationCount");

    if (!notificationCount) return;

    const count =
        Number(localStorage.getItem("notificationCount")) || 0;

    notificationCount.textContent = count;

    if (count > 0) {
        notificationCount.style.display = "inline-flex";
    } else {
        notificationCount.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateNotificationCount();
});

// ========================================
// NOTIFICATION DROPDOWN
// ========================================

function toggleNotifications() {

    const dropdown =
        document.getElementById("notificationDropdown");

    if (!dropdown) return;

    dropdown.classList.toggle("show");

    if (dropdown.classList.contains("show")) {
        loadNotificationHistory();
    }
}


function loadNotificationHistory() {

    const notificationList =
        document.getElementById("notificationList");

    if (!notificationList) return;

    const notifications =
        JSON.parse(
            localStorage.getItem("orderNotifications")
        ) || [];

    if (notifications.length === 0) {

        notificationList.innerHTML = `
            <p class="no-notifications">
                No new notifications.
            </p>
        `;

        return;
    }

    notificationList.innerHTML =
        notifications.map(notification => `
            <div class="notification-item">
                ${notification.message}
            </div>
        `).join("");
}






window.openCart = openCart;
window.closeCart = closeCart;