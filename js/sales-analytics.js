const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

const token = localStorage.getItem("token");

let allAnalyticsSales = [];


// ========================================
// FORMAT MONEY
// ========================================

function formatMoney(amount) {

    return `TZS ${Number(amount || 0).toLocaleString("en-TZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}


// ========================================
// LOAD SALES
// ========================================

async function loadAnalytics() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/orders`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                "Failed to load sales data"
            );

        }

        const orders = await response.json();


        // Only POS sales
        allAnalyticsSales = orders.filter(
            order => order.orderType === "POS"
        );


        applyAnalyticsFilter();

    } catch (error) {

        console.error(
            "Analytics error:",
            error
        );

    }

}


// ========================================
// FILTER
// ========================================

function applyAnalyticsFilter() {

    const filter =
        document.getElementById(
            "analyticsDateFilter"
        ).value;

    const now = new Date();

    let filteredSales =
        [...allAnalyticsSales];


    if (filter === "today") {

        filteredSales =
            filteredSales.filter(sale => {

                const date =
                    new Date(sale.createdAt);

                return (
                    date.toDateString() ===
                    now.toDateString()
                );

            });

    }


    if (filter === "week") {

        const startOfWeek =
            new Date(now);

        const day =
            startOfWeek.getDay();

        const difference =
            day === 0 ? 6 : day - 1;

        startOfWeek.setDate(
            startOfWeek.getDate() -
            difference
        );

        startOfWeek.setHours(
            0, 0, 0, 0
        );


        filteredSales =
            filteredSales.filter(sale => {

                return (
                    new Date(sale.createdAt) >=
                    startOfWeek
                );

            });

    }


    if (filter === "month") {

        filteredSales =
            filteredSales.filter(sale => {

                const date =
                    new Date(sale.createdAt);

                return (
                    date.getMonth() ===
                    now.getMonth() &&

                    date.getFullYear() ===
                    now.getFullYear()
                );

            });

    }


    updateAnalytics(filteredSales);

}


// ========================================
// UPDATE ANALYTICS
// ========================================

function updateAnalytics(sales) {

    const totalSales =
        sales.length;


    const totalRevenue =
        sales.reduce(
            (sum, sale) =>
                sum +
                Number(sale.totalPrice || 0),
            0
        );


    const averageSale =
        totalSales > 0
            ? totalRevenue / totalSales
            : 0;


    // Today's revenue
    const today =
        new Date();

    const todayRevenue =
        sales
            .filter(sale => {

                const date =
                    new Date(sale.createdAt);

                return (
                    date.toDateString() ===
                    today.toDateString()
                );

            })
            .reduce(
                (sum, sale) =>
                    sum +
                    Number(
                        sale.totalPrice || 0
                    ),
                0
            );


    document.getElementById(
        "analyticsTotalSales"
    ).textContent = totalSales;


    document.getElementById(
        "analyticsTotalRevenue"
    ).textContent =
        formatMoney(totalRevenue);


    document.getElementById(
        "analyticsAverageSale"
    ).textContent =
        formatMoney(averageSale);


    document.getElementById(
        "analyticsTodayRevenue"
    ).textContent =
        formatMoney(todayRevenue);


    updatePaymentAnalytics(sales);

    updateProductAnalytics(sales);

    updateDailyAnalytics(sales);

}


// ========================================
// PAYMENT ANALYTICS
// ========================================

function updatePaymentAnalytics(sales) {

    const paymentTotals = {};


    sales.forEach(sale => {

        const payment =
            sale.payment ||
            "Unknown";

        if (!paymentTotals[payment]) {

            paymentTotals[payment] = 0;

        }

        paymentTotals[payment] +=
            Number(
                sale.totalPrice || 0
            );

    });


    const container =
        document.getElementById(
            "paymentAnalytics"
        );


    const entries =
        Object.entries(paymentTotals);


    if (entries.length === 0) {

        container.innerHTML =
            "<p>No sales data.</p>";

        return;

    }


    container.innerHTML =
        entries
            .sort((a, b) => b[1] - a[1])
            .map(([payment, total]) => `

                <div class="analytics-row">

                    <span>
                        ${escapeHTML(payment)}
                    </span>

                    <strong>
                        ${formatMoney(total)}
                    </strong>

                </div>

            `)
            .join("");

}


// ========================================
// PRODUCT ANALYTICS
// ========================================

function updateProductAnalytics(sales) {

    const products = {};


    sales.forEach(sale => {

        if (!sale.products) return;


        sale.products.forEach(item => {

            const name =
                item.name ||
                "Unknown Product";

            const quantity =
                Number(
                    item.quantity || 0
                );


            if (!products[name]) {

                products[name] = 0;

            }


            products[name] += quantity;

        });

    });


    const container =
        document.getElementById(
            "productAnalytics"
        );


    const entries =
        Object.entries(products);


    if (entries.length === 0) {

        container.innerHTML =
            "<p>No product data.</p>";

        return;

    }


    container.innerHTML =
        entries
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, quantity], index) => `

                <div class="analytics-row">

                    <span>
                        ${index + 1}. 
                        ${escapeHTML(name)}
                    </span>

                    <strong>
                        ${quantity} sold
                    </strong>

                </div>

            `)
            .join("");

}


// ========================================
// DAILY ANALYTICS
// ========================================

function updateDailyAnalytics(sales) {

    const dailyTotals = {};


    sales.forEach(sale => {

        const date =
            new Date(sale.createdAt);


        const key =
            date.toLocaleDateString(
                "en-TZ",
                {
                    day: "2-digit",
                    month: "short"
                }
            );


        if (!dailyTotals[key]) {

            dailyTotals[key] = 0;

        }


        dailyTotals[key] +=
            Number(
                sale.totalPrice || 0
            );

    });


    const container =
        document.getElementById(
            "dailyAnalytics"
        );


    const entries =
        Object.entries(dailyTotals);


    if (entries.length === 0) {

        container.innerHTML =
            "<p>No sales data.</p>";

        return;

    }


    container.innerHTML =
        entries
            .slice(-10)
            .reverse()
            .map(([date, total]) => `

                <div class="analytics-row">

                    <span>
                        ${date}
                    </span>

                    <strong>
                        ${formatMoney(total)}
                    </strong>

                </div>

            `)
            .join("");

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAnalytics();


        document
            .getElementById(
                "analyticsDateFilter"
            )
            .addEventListener(
                "change",
                applyAnalyticsFilter
            );

    }
);




