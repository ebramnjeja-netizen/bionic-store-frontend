// ========================================
// BIONIC STORE CUSTOMER WI-FI
// ========================================

const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let selectedWifiVoucher = null;


// ========================================
// OFFICIAL PACKAGES
// ========================================

const OFFICIAL_WIFI_PACKAGES = [
    {
        packageName: "Bionic ROBO",
        price: 500,
        duration: 5,
        durationUnit: "Hours",
        icon: "🤖",
        badge: "🤖 ROBO"
    },
    {
        packageName: "Bionic HALF ROBOT",
        price: 1000,
        duration: 12,
        durationUnit: "Hours",
        icon: "⚡",
        badge: "⚡ POPULAR"
    },
    {
        packageName: "24 Hours CHIP",
        price: 1500,
        duration: 1,
        durationUnit: "Days",
        icon: "🔥",
        badge: "🔥 BEST VALUE"
    }
];


// ========================================
// LOAD CUSTOMER WI-FI PACKAGES
// ========================================

async function loadCustomerWifi() {

    const container =
        document.getElementById("wifiPackages");

    if (!container) return;

    try {

        const response =
            await fetch(WIFI_API);

        const vouchers =
            await response.json();

        if (!response.ok) {

            throw new Error(
                vouchers.message ||
                "Failed to load Wi-Fi packages."
            );
        }


        container.innerHTML =
            OFFICIAL_WIFI_PACKAGES.map(packageInfo => {

                const availableCount =
                    vouchers.filter(voucher =>
                        voucher.packageName === packageInfo.packageName &&
                        voucher.status === "Available"
                    ).length;


                const durationText =
                    packageInfo.durationUnit === "Days"
                        ? `${packageInfo.duration * 24} Hours`
                        : `${packageInfo.duration} ${packageInfo.durationUnit}`;


                if (availableCount === 0) {

                    return `
                        <div class="wifi-package-card wifi-sold-out">

                            <span class="wifi-package-badge">
                                ${packageInfo.badge}
                            </span>

                            <div class="wifi-icon">
                                ${packageInfo.icon}
                            </div>

                            <h3>
                                ${packageInfo.packageName}
                            </h3>

                            <p class="wifi-duration">
                                ${durationText}
                            </p>

                            <div class="wifi-price">
                                TZS ${packageInfo.price.toLocaleString()}
                            </div>

                            <p class="wifi-status">
                                ❌ Currently unavailable
                            </p>

                            <button
                                class="wifi-buy-btn"
                                disabled>

                                Sold Out

                            </button>

                        </div>
                    `;
                }


                

                return `
                    <div class="wifi-package-card">

                        <span class="wifi-package-badge ${
                            packageInfo.packageName ===
                            "Bionic HALF ROBOT"
                                ? "popular"
                                : packageInfo.packageName ===
                                  "24 Hours CHIP"
                                    ? "best"
                                    : ""
                        }">

                            ${packageInfo.badge}

                        </span>


                        <div class="wifi-icon">
                            ${packageInfo.icon}
                        </div>


                        <h3>
                            ${packageInfo.packageName}
                        </h3>


                        <p class="wifi-duration">
                            ${durationText}
                        </p>


                        <div class="wifi-price">
                            TZS ${packageInfo.price.toLocaleString()}
                        </div>


                        <p class="wifi-status">
                            🟢 ${availableCount} vouchers available
                        </p>


                        <button
                            class="wifi-buy-btn"
                            onclick="buyOfficialWifiPackage('${packageInfo.packageName}')">

                            Get This Package →

                        </button>

                    </div>
                `;

                

            }).join("");


    } catch (error) {

        console.error(
            "Customer Wi-Fi error:",
            error
        );


        container.innerHTML = `
            <div class="wifi-empty">

                <div class="wifi-icon">
                    ⚠️
                </div>

                <h3>
                    Wi-Fi packages unavailable
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>
        `;
    }
}



function showVoucherDetails(voucher) {

    const purchaseDate = voucher.soldAt
        ? new Date(voucher.soldAt).toLocaleString()
        : "N/A";

    const expiryDate = voucher.expiresAt
        ? new Date(voucher.expiresAt).toLocaleString()
        : "Not activated";

    const existingModal =
        document.getElementById("voucherDetailsModal");

    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement("div");

    modal.id = "voucherDetailsModal";

    modal.className = "voucher-details-modal";

    modal.innerHTML = `
        <div class="voucher-details-content">

            <button
                class="voucher-details-close"
                onclick="closeVoucherDetails()">
                ×
            </button>

            <h2>🎟️ Voucher Details</h2>

            <div class="voucher-code-box">
                <span>Voucher Code</span>

                <strong id="voucherDetailCode">
                    ${escapeHtml(voucher.code)}
                </strong>

                <button
                    onclick="copyVoucherCode('${escapeHtml(voucher.code)}')">
                    📋 Copy Code
                </button>
            </div>

            <div class="voucher-detail-list">

                <p>
                    📦 <strong>Package:</strong>
                    ${escapeHtml(voucher.packageName)}
                </p>

                <p>
                    💰 <strong>Price:</strong>
                    TZS ${Number(voucher.price || 0).toLocaleString()}
                </p>

                <p>
                    ⏱️ <strong>Duration:</strong>
                    ${Number(voucher.duration || 0)}
                    ${escapeHtml(voucher.durationUnit || "")}
                </p>

                <p>
                    🟢 <strong>Status:</strong>
                    ${escapeHtml(voucher.status)}
                </p>

                <p>
                    📅 <strong>Purchased:</strong>
                    ${purchaseDate}
                </p>

                <p>
                    ⏰ <strong>Expires:</strong>
                    ${expiryDate}
                </p>

            </div>

            <div class="voucher-connect-box">

                <h3>📶 How to Connect</h3>

                <ol>
                    <li>Turn on Wi-Fi on your phone or laptop.</li>
                    <li>
                        Connect to
                        <strong>Bionic Store Wi-Fi</strong>.
                    </li>
                    <li>
                        Enter the voucher code shown above.
                    </li>
                    <li>
                        Enjoy your internet access! 🚀
                    </li>
                </ol>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}


function closeVoucherDetails() {

    const modal =
        document.getElementById("voucherDetailsModal");

    if (modal) {
        modal.remove();
    }
}


function copyVoucherCode(code) {

    navigator.clipboard.writeText(code)
        .then(() => {

            alert("✅ Voucher code copied!");

        })
        .catch(() => {

            alert(
                "Unable to copy the voucher code. Please copy it manually."
            );

        });
}
// ========================================
// SELECT OFFICIAL PACKAGE
// ========================================

async function buyOfficialWifiPackage(packageName) {

    try {

        const response =
            await fetch(WIFI_API);

        const vouchers =
            await response.json();


        if (!response.ok) {

            throw new Error(
                vouchers.message ||
                "Unable to load Wi-Fi vouchers."
            );
        }


        const availableVoucher =
            vouchers.find(voucher =>
                voucher.packageName === packageName &&
                voucher.status === "Available"
            );


        if (!availableVoucher) {

            alert(
                "Sorry, this package is currently unavailable."
            );

            loadCustomerWifi();

            return;
        }


        openWifiCheckout(
            availableVoucher._id
        );


    } catch (error) {

        console.error(
            "Wi-Fi package selection error:",
            error
        );

        alert(
            "Unable to connect to the Wi-Fi system."
        );
    }
}


// ========================================
// OPEN WI-FI CHECKOUT
// ========================================

async function openWifiCheckout(voucherId) {

    try {

        const response =
            await fetch(
                `${WIFI_API}/${voucherId}`
            );

        const voucher =
            await response.json();


        if (!response.ok) {

            alert(
                voucher.message ||
                "Unable to load Wi-Fi package."
            );

            return;
        }


        if (voucher.status !== "Available") {

            alert(
                "Sorry, this Wi-Fi voucher is no longer available."
            );

            loadCustomerWifi();

            return;
        }


        selectedWifiVoucher = voucher;


        document.getElementById(
            "wifiCheckoutPackage"
        ).textContent =
            voucher.packageName;


        document.getElementById(
            "wifiCheckoutDuration"
        ).textContent =
            voucher.durationUnit === "Days"
                ? `${voucher.duration * 24} Hours`
                : `${voucher.duration} ${voucher.durationUnit}`;


        document.getElementById(
            "wifiCheckoutPrice"
        ).textContent =
            `TZS ${Number(
                voucher.price
            ).toLocaleString()}`;


        document.getElementById(
            "wifiCustomerName"
        ).value = "";


        document.getElementById(
            "wifiCustomerPhone"
        ).value = "";


        document.getElementById(
            "wifiAmountReceived"
        ).value = "";


        document.getElementById(
            "wifiCheckoutModal"
        ).classList.add("show");


    } catch (error) {

        console.error(
            "Open Wi-Fi checkout error:",
            error
        );

        alert(
            "Unable to connect to the Wi-Fi system."
        );
    }
}


// ========================================
// CLOSE WI-FI CHECKOUT
// ========================================

function closeWifiCheckout() {

    const modal =
        document.getElementById(
            "wifiCheckoutModal"
        );

    if (modal) {

        modal.classList.remove("show");

    }

    selectedWifiVoucher = null;
}


// ========================================
// PURCHASE WI-FI VOUCHER
// ========================================

async function submitWifiPurchase(event) {

    event.preventDefault();


    if (!selectedWifiVoucher) {

        alert(
            "Please select a Wi-Fi package."
        );

        return;
    }


    const customerName =
        document.getElementById(
            "wifiCustomerName"
        ).value.trim();


    const customerPhone =
        document.getElementById(
            "wifiCustomerPhone"
        ).value.trim();


    const paymentMethod =
        document.getElementById(
            "wifiPaymentMethod"
        ).value;


    const amountReceived =
        Number(
            document.getElementById(
                "wifiAmountReceived"
            ).value
        );


    if (!customerName) {

        alert(
            "Please enter your name."
        );

        return;
    }


    if (!customerPhone) {

        alert(
            "Please enter your phone number."
        );

        return;
    }


    if (!paymentMethod) {

        alert(
            "Please select a payment method."
        );

        return;
    }


    if (
        !amountReceived ||
        amountReceived < selectedWifiVoucher.price
    ) {

        alert(
            `Amount received must be at least TZS ${Number(
                selectedWifiVoucher.price
            ).toLocaleString()}.`
        );

        return;
    }


    const purchaseButton =
        document.getElementById(
            "wifiPurchaseButton"
        );


    purchaseButton.disabled = true;

    purchaseButton.textContent =
        "Processing...";


    try {

        const response =
            await fetch(
                `${WIFI_API}/${selectedWifiVoucher._id}/sell`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        customerName,

                        customerPhone,

                        paymentMethod,

                        amountReceived

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to purchase Wi-Fi voucher."
            );

            return;
        }


        const voucher =
            data.voucher;


        closeWifiCheckout();


        showWifiSuccess( voucher );


        loadCustomerWifi();

        loadCustomerWifiDashboard();

        checkWifiNotifications();


    } catch (error) {

        console.error(
            "Wi-Fi purchase error:",
            error
        );


        alert(
            "Unable to connect to Bionic Store Wi-Fi system."
        );


    } finally {

        purchaseButton.disabled = false;

        purchaseButton.textContent =
            "Purchase Wi-Fi Voucher";

    }
}


// ========================================
// SUCCESS
// ========================================

function showWifiSuccess(voucher) {

    const durationText =
        voucher.durationUnit === "Days"
            ? `${voucher.duration * 24} Hours`
            : `${voucher.duration} ${voucher.durationUnit}`;


    document.getElementById(
        "wifiSuccessPackage"
    ).textContent =
        voucher.packageName;


    document.getElementById(
        "wifiSuccessCode"
    ).textContent =
        voucher.code;


    document.getElementById(
        "wifiSuccessDuration"
    ).textContent =
        durationText;


    document.getElementById(
        "wifiSuccessPrice"
    ).textContent =
        `TZS ${Number(
            voucher.price
        ).toLocaleString()}`;


    document.getElementById(
        "wifiSuccessReceived"
    ).textContent =
        `TZS ${Number(
            voucher.amountReceived || 0
        ).toLocaleString()}`;


    document.getElementById(
        "wifiSuccessChange"
    ).textContent =
        `TZS ${Number(
            voucher.changeAmount || 0
        ).toLocaleString()}`;


    document.getElementById(
        "wifiSuccessModal"
    ).classList.add("show");
}


// ========================================
// CLOSE SUCCESS
// ========================================

function closeWifiSuccess() {

    const modal =
        document.getElementById(
            "wifiSuccessModal"
        );

    if (modal) {

        modal.classList.remove("show");

    }
}


// ========================================
// COPY VOUCHER CODE
// ========================================

async function copyWifiCode() {

    const code =
        document.getElementById(
            "wifiSuccessCode"
        ).textContent;


    try {

        await navigator.clipboard.writeText(
            code
        );

        alert(
            "Voucher code copied!"
        );

    } catch (error) {

        alert(
            `Your voucher code is: ${code}`
        );
    }
}



async function loadCustomerWifiHistory() {

    const results =
        document.getElementById("wifiHistoryResults");

    const token =
        localStorage.getItem("token");

    if (!token) {

        results.innerHTML = `
            <p class="history-error">
                🔐 Please login to view your Wi-Fi purchases.
            </p>
        `;

        return;
    }

    results.innerHTML = `
        <p class="history-loading">
            Loading your Wi-Fi purchases...
        </p>
    `;

    try {

        const response = await fetch(
            `${API_BASE_URL}/wifi-vouchers/customer-history`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const vouchers = await response.json();

        if (!response.ok) {

            throw new Error(
                vouchers.message ||
                "Failed to load purchase history."
            );
        }

        if (!vouchers.length) {

            results.innerHTML = `
                <p class="history-empty">
                    📭 You have no Wi-Fi purchases yet.
                </p>
            `;

            return;
        }

        results.innerHTML = vouchers.map(voucher => {

            const purchaseDate = voucher.soldAt
                ? new Date(voucher.soldAt).toLocaleString()
                : "N/A";

            const expiryDate = voucher.expiresAt
                ? new Date(voucher.expiresAt).toLocaleString()
                : "Not activated";

            return `
                <div
                    class="wifi-history-card"
                    onclick='showVoucherDetails(${JSON.stringify(voucher)})'
                    style="cursor: pointer;"
                >

                    <div class="history-header">

                        <h3>
                            ${escapeHtml(voucher.packageName)}
                        </h3>

                        <span class="history-status status-${voucher.status.toLowerCase()}">
                            ${escapeHtml(voucher.status)}
                        </span>

                    </div>

                    <p>
                        🎟️ <strong>Voucher:</strong>
                        ${escapeHtml(voucher.code)}
                    </p>

                    <p>
                        💰 <strong>Paid:</strong>
                        TZS ${Number(
                            voucher.price || 0
                        ).toLocaleString()}
                    </p>

                    <p>
                        📅 <strong>Purchased:</strong>
                        ${purchaseDate}
                    </p>

                    <p>
    ⏰ <strong>Expires:</strong>
    ${expiryDate}
</p>

${
    voucher.status === "Active" && voucher.expiresAt
        ? `
            <div
                class="wifi-countdown"
                data-expires="${voucher.expiresAt}"
            >
                🟢 <strong>Time Remaining:</strong>
                <span class="countdown-value">
                    Calculating...
                </span>
            </div>
        `
        : ""
}

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error(
            "Customer Wi-Fi history error:",
            error
        );

        results.innerHTML = `
            <p class="history-error">
                ❌ ${escapeHtml(error.message)}
            </p>
        `;
    }
}


function showVoucherDetails(voucher) {

    const purchaseDate = voucher.soldAt
        ? new Date(voucher.soldAt).toLocaleString()
        : "N/A";

    const expiryDate = voucher.expiresAt
        ? new Date(voucher.expiresAt).toLocaleString()
        : "Not activated";

    const existingModal =
        document.getElementById("voucherDetailsModal");

    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement("div");

    modal.id = "voucherDetailsModal";

    modal.className = "voucher-details-modal";

    modal.innerHTML = `
        <div class="voucher-details-content">

            <button
                class="voucher-details-close"
                onclick="closeVoucherDetails()">
                ×
            </button>

            <h2>🎟️ Voucher Details</h2>

            <div class="voucher-code-box">
                <span>Voucher Code</span>

                <strong id="voucherDetailCode">
                    ${escapeHtml(voucher.code)}
                </strong>

                <button
                    onclick="copyVoucherCode('${escapeHtml(voucher.code)}')">
                    📋 Copy Code
                </button>
            </div>

            <div class="voucher-detail-list">

                <p>
                    📦 <strong>Package:</strong>
                    ${escapeHtml(voucher.packageName)}
                </p>

                <p>
                    💰 <strong>Price:</strong>
                    TZS ${Number(voucher.price || 0).toLocaleString()}
                </p>

                <p>
                    ⏱️ <strong>Duration:</strong>
                    ${Number(voucher.duration || 0)}
                    ${escapeHtml(voucher.durationUnit || "")}
                </p>

                <p>
                    🟢 <strong>Status:</strong>
                    ${escapeHtml(voucher.status)}
                </p>

                <p>
                    📅 <strong>Purchased:</strong>
                    ${purchaseDate}
                </p>

                <p>
                    ⏰ <strong>Expires:</strong>
                    ${expiryDate}
                </p>

            </div>

            <div class="voucher-connect-box">

                <h3>📶 How to Connect</h3>

                <ol>
                    <li>Turn on Wi-Fi on your phone or laptop.</li>
                    <li>
                        Connect to
                        <strong>Bionic Store Wi-Fi</strong>.
                    </li>
                    <li>
                        Enter the voucher code shown above.
                    </li>
                    <li>
                        Enjoy your internet access! 🚀
                    </li>
                </ol>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}


function closeVoucherDetails() {

    const modal =
        document.getElementById("voucherDetailsModal");

    if (modal) {
        modal.remove();
    }
}


function copyVoucherCode(code) {

    navigator.clipboard.writeText(code)
        .then(() => {

            alert("✅ Voucher code copied!");

        })
        .catch(() => {

            alert(
                "Unable to copy the voucher code. Please copy it manually."
            );

        });
}


// =========================================
// CUSTOMER WI-FI DASHBOARD
// =========================================

async function loadCustomerWifiDashboard() {

    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/wifi-vouchers/customer-history`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const vouchers = await response.json();

        if (!response.ok) {
            throw new Error(
                vouchers.message ||
                "Failed to load Wi-Fi dashboard."
            );
        }

        const totalPurchases = vouchers.length;

        const activePurchases = vouchers.filter(
            voucher => voucher.status === "Active"
        ).length;

        const expiredPurchases = vouchers.filter(
            voucher => voucher.status === "Expired"
        ).length;

        const totalSpent = vouchers.reduce(
            (total, voucher) =>
                total + Number(voucher.price || 0),
            0
        );

        const latestVoucher = vouchers[0];

        document.getElementById(
            "wifiCustomerName"
        ).textContent =
            latestVoucher?.customerName || "-";

        document.getElementById(
            "wifiCustomerPhone"
        ).textContent =
            latestVoucher?.customerPhone || "-";

        document.getElementById(
            "wifiTotalPurchases"
        ).textContent =
            totalPurchases;

        document.getElementById(
            "wifiActivePurchases"
        ).textContent =
            activePurchases;

        document.getElementById(
            "wifiExpiredPurchases"
        ).textContent =
            expiredPurchases;

        document.getElementById(
            "wifiTotalSpent"
        ).textContent =
            `TZS ${totalSpent.toLocaleString()}`;

    } catch (error) {

        console.error(
            "Customer Wi-Fi dashboard error:",
            error
        );
    }
}


// =========================================
// ACTIVE WI-FI VOUCHER COUNTDOWN
// =========================================

function updateWifiCountdowns() {

    const countdowns =
        document.querySelectorAll(
            ".wifi-countdown"
        );

    countdowns.forEach(countdown => {

        const expiresAt =
            new Date(
                countdown.dataset.expires
            ).getTime();

        const now =
            new Date().getTime();

        const remaining =
            expiresAt - now;

        const value =
            countdown.querySelector(
                ".countdown-value"
            );

        if (!value) {
            return;
        }

        if (remaining <= 0) {

              value.textContent =
                 "Expired";

           countdown.classList.add(
                "countdown-expired"
             );

           return;
        }

        const totalSeconds =
            Math.floor(
                remaining / 1000
            );

        const days =
            Math.floor(
                totalSeconds / 86400
            );

        const hours =
            Math.floor(
                (totalSeconds % 86400) / 3600
            );

        const minutes =
            Math.floor(
                (totalSeconds % 3600) / 60
            );

        const seconds =
            totalSeconds % 60;

        let text = "";

        if (days > 0) {
            text += `${days}d `;
        }

        text += `${String(hours).padStart(2, "0")}h `;
        text += `${String(minutes).padStart(2, "0")}m `;
        text += `${String(seconds).padStart(2, "0")}s`;

        value.textContent =
            text;
    });
}

setInterval(
    updateWifiCountdowns,
    1000
);


// =========================================
// WI-FI STATUS AUTO-SYNC
// =========================================

setInterval(function () {

    const token =
        localStorage.getItem("token");

    if (!token) {
        return;
    }

    loadCustomerWifiHistory();
    loadCustomerWifiDashboard();
    checkWifiNotifications();

}, 30000);

// =========================================
// CUSTOMER WI-FI NOTIFICATIONS
// =========================================

function showWifiNotification(
    message,
    type = "info"
) {

    const area =
        document.getElementById(
            "wifiNotificationArea"
        );

    if (!area) {
        return;
    }

    area.innerHTML = `
        <div class="wifi-notification wifi-notification-${type}">

            <span class="wifi-notification-message">
                ${escapeHtml(message)}
            </span>

            <button
                type="button"
                onclick="closeWifiNotification()"
                class="wifi-notification-close">
                ×
            </button>

        </div>
    `;
}


function closeWifiNotification() {

    const area =
        document.getElementById(
            "wifiNotificationArea"
        );

    if (area) {
        area.innerHTML = "";
    }
}


async function checkWifiNotifications() {

    const token =
        localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/wifi-vouchers/customer-history`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const vouchers =
            await response.json();

        if (!response.ok) {
            return;
        }

        if (!vouchers.length) {
            return;
        }

        const activeVoucher =
            vouchers.find(
                voucher =>
                    voucher.status === "Active" &&
                    voucher.expiresAt
            );

        if (activeVoucher) {

            const remaining =
                new Date(
                    activeVoucher.expiresAt
                ).getTime() -
                Date.now();

            const remainingMinutes =
                Math.floor(
                    remaining / 60000
                );

            if (
                remaining > 0 &&
                remainingMinutes <= 30
            ) {

                showWifiNotification(
                    `⚠️ Your ${activeVoucher.packageName} voucher expires in approximately ${remainingMinutes} minute(s).`,
                    "warning"
                );

                return;
            }

            if (remaining > 0) {

                showWifiNotification(
                    `🟢 Your ${activeVoucher.packageName} voucher is active.`,
                    "success"
                );

                return;
            }
        }

        const latestExpiredVoucher =
            vouchers.find(
                voucher =>
                    voucher.status === "Expired"
            );

        if (latestExpiredVoucher) {

            showWifiNotification(
                `🔴 Your ${latestExpiredVoucher.packageName} voucher has expired.`,
                "error"
            );
        }

    } catch (error) {

        console.error(
            "Wi-Fi notification error:",
            error
        );
    }
}



// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    loadCustomerWifi
    
);




