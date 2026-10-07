const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let wifiVouchers = [];


/* ========================================
   LOAD DATA
======================================== */

async function loadWifiDashboard() {

    // =====================================
// WI-FI STATUS OVERVIEW
// =====================================

async function loadWifiStatusOverview() {

    try {

        const response = await fetch(
            API_BASE_URL + "/wifi-vouchers"
        );

        const vouchers = await response.json();

        if (!response.ok) {

            throw new Error(
                vouchers.message ||
                "Failed to load Wi-Fi vouchers."
            );

        }

        const available =
            vouchers.filter(
                voucher =>
                    voucher.status === "Available"
            ).length;

        const active =
            vouchers.filter(
                voucher =>
                    voucher.status === "Active"
            ).length;

        const expired =
            vouchers.filter(
                voucher =>
                    voucher.status === "Expired"
            ).length;

        const total =
            vouchers.length;


        document.getElementById(
            "availableVouchers"
        ).textContent = available;


        document.getElementById(
            "activeVouchers"
        ).textContent = active;


        document.getElementById(
            "expiredVouchers"
        ).textContent = expired;


        document.getElementById(
            "totalVouchers"
        ).textContent = total;


    } catch (error) {

        console.error(
            "Wi-Fi status overview error:",
            error
        );

    }

}

    const token =
        localStorage.getItem("token");

    if (!token) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/wifi-vouchers`,
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
                "Failed to load Wi-Fi vouchers."
            );

        }


        wifiVouchers =
            Array.isArray(data)
                ? data
                : [];


        updateDashboard();


    } catch (error) {

        console.error(
            "Wi-Fi dashboard error:",
            error
        );

        showDashboardMessage(
            "❌ Failed to load Wi-Fi dashboard."
        );

    }

}


/* ========================================
   UPDATE DASHBOARD
======================================== */

function updateDashboard() {

    const total =
        wifiVouchers.length;


    const sold =
        wifiVouchers.filter(
            voucher =>
                voucher.status === "Sold"
        );


    const available =
        wifiVouchers.filter(
            voucher =>
                voucher.status === "Available"
        );


    const revenue =
        sold.reduce(
            (sum, voucher) =>
                sum +
                (
                    Number(
                        voucher.price
                    ) || 0
                ),
            0
        );


    const today =
        new Date();


    const todaySales =
        sold.filter(
            voucher =>
                isSameDay(
                    getSaleDate(voucher),
                    today
                )
        ).length;


    const monthSales =
        sold.filter(
            voucher =>
                isSameMonth(
                    getSaleDate(voucher),
                    today
                )
        ).length;


    document.getElementById(
        "totalVouchers"
    ).textContent =
        total;


    document.getElementById(
        "totalRevenue"
    ).textContent =
        "TZS " +
        formatMoney(revenue);


    document.getElementById(
        "todaySales"
    ).textContent =
        todaySales;


    document.getElementById(
        "monthSales"
    ).textContent =
        monthSales;


    document.getElementById(
        "availableVouchers"
    ).textContent =
        available.length;


    document.getElementById(
        "soldVouchers"
    ).textContent =
        sold.length;


    renderPackageSales(sold);

    renderPaymentSales(sold);

    showDashboardMessage("");

}


/* ========================================
   SALES BY PACKAGE
======================================== */

function renderPackageSales(sold) {

    const container =
        document.getElementById(
            "packageSales"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const packages = {};


    sold.forEach(
        voucher => {

            const name =
                voucher.packageName ||
                "Unknown Package";


            if (!packages[name]) {

                packages[name] = {
                    count: 0,
                    revenue: 0
                };

            }


            packages[name].count++;

            packages[name].revenue +=
                Number(
                    voucher.price
                ) || 0;

        }
    );


    const names =
        Object.keys(packages);


    if (!names.length) {

        container.innerHTML =
            "<p>No package sales yet.</p>";

        return;
    }


    names
        .sort(
            (a, b) =>
                packages[b].count -
                packages[a].count
        )
        .forEach(
            name => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "report-row";


                row.innerHTML = `

                    <span>
                        ${escapeHtml(name)}
                    </span>

                    <strong>
                        ${packages[name].count}
                        sold
                        —
                        TZS
                        ${formatMoney(
                            packages[name].revenue
                        )}
                    </strong>

                `;


                container.appendChild(row);

            }
        );

}


/* ========================================
   SALES BY PAYMENT METHOD
======================================== */

function renderPaymentSales(sold) {

    const container =
        document.getElementById(
            "paymentSales"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const methods = {};


    sold.forEach(
        voucher => {

            const method =
                voucher.paymentMethod ||
                "Cash";


            if (!methods[method]) {

                methods[method] = {
                    count: 0,
                    revenue: 0
                };

            }


            methods[method].count++;

            methods[method].revenue +=
                Number(
                    voucher.price
                ) || 0;

        }
    );


    const names =
        Object.keys(methods);


    if (!names.length) {

        container.innerHTML =
            "<p>No payment data yet.</p>";

        return;
    }


    names.forEach(
        method => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "report-row";


            row.innerHTML = `

                <span>
                    ${escapeHtml(method)}
                </span>

                <strong>
                    ${methods[method].count}
                    sales
                    —
                    TZS
                    ${formatMoney(
                        methods[method].revenue
                    )}
                </strong>

            `;


            container.appendChild(row);

        }
    );

}


/* ========================================
   DATE HELPERS
======================================== */

function getSaleDate(voucher) {

    return new Date(
        voucher.soldAt ||
        voucher.updatedAt ||
        voucher.createdAt
    );

}


function isSameDay(date1, date2) {

    if (
        !date1 ||
        isNaN(date1.getTime())
    ) {
        return false;
    }


    return (
        date1.getFullYear() ===
            date2.getFullYear() &&

        date1.getMonth() ===
            date2.getMonth() &&

        date1.getDate() ===
            date2.getDate()
    );

}


function isSameMonth(date1, date2) {

    if (
        !date1 ||
        isNaN(date1.getTime())
    ) {
        return false;
    }


    return (
        date1.getFullYear() ===
            date2.getFullYear() &&

        date1.getMonth() ===
            date2.getMonth()
    );

}


/* ========================================
   HELPERS
======================================== */

function formatMoney(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-TZ"
    );

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function showDashboardMessage(text) {

    const element =
        document.getElementById(
            "dashboardMessage"
        );


    if (element) {

        element.textContent =
            text;

    }

}


/* ========================================
   PAGE READY
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Wi-Fi Sales Dashboard ready."
        );

        loadWifiDashboard();
        loadWifiStatusOverview();

        setInterval(function () {
              loadDashboard();
              loadWifiStatusOverview();
        }, 30000);

    }
);