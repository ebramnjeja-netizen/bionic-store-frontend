const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let dashboardOrders = [];
let dashboardProducts = [];
let dashboardCustomers = [];
let dashboardRepairs = [];


// ========================================
// GET TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("token");
}


// ========================================
// LOAD DASHBOARD
// ========================================

async function loadDashboard() {

    const token = getToken();

    if (!token) {
        showDashboardMessage(
            "❌ Please login as an administrator."
        );
        return;
    }

    try {

        await Promise.all([
            loadOrders(token),
            loadProducts(token),
            loadCustomers(token),
            loadRepairs(token)
        ]);

        updateDashboard();

    } catch (error) {
          console.error("DASHBOARD ERROR:", error);
         console.error("ERROR MESSAGE:", error.message);
          console.error("ERROR STACK:", error.stack);
    }
}


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders(token) {

    const response = await fetch(
        `${API_BASE_URL}/orders`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to load orders."
        );
    }

    dashboardOrders =
        Array.isArray(data)
            ? data
            : data.orders || [];
}


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts(token) {

    const response = await fetch(
        `${API_BASE_URL}/products`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to load products."
        );
    }

    dashboardProducts =
        Array.isArray(data)
            ? data
            : data.products || [];
}


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers(token) {

    const response = await fetch(
        `${API_BASE_URL}/customers`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to load customers."
        );
    }

    dashboardCustomers =
        Array.isArray(data)
            ? data
            : data.customers || [];
}


// ========================================
// LOAD REPAIRS
// ========================================

async function loadRepairs(token) {

    const response = await fetch(
        `${API_BASE_URL}/repairs`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to load repairs."
        );
    }

    dashboardRepairs =
        Array.isArray(data)
            ? data
            : data.repairs || [];
}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

    updateCards();

    updateCashFlowSnapshot();

    updateSalesProfitChart();

    updateBusinessHealth();

    updateMonthlySalesTarget();

    updateSalesForecast();

    updateRecentSales();

    updateLowStock();

    updateRecentRepairs();

    updateTopProducts();

    updateAnalytics();

    updateAdminAlerts();

    hideDashboardMessage();

    updateRealBusinessSnapshot();

}

// ========================================
// CASH FLOW SNAPSHOT
// ========================================

function updateCashFlowSnapshot() {

    const totalSales = dashboardOrders.reduce(
        (sum, order) =>
            sum + Number(order.totalPrice || 0),
        0
    );

    const totalProfit = dashboardOrders.reduce(
        (sum, order) =>
            sum + Number(order.totalProfit || 0),
        0
    );

    const totalCollected = dashboardOrders.reduce(
        (sum, order) =>
            sum + Number(
                order.amountReceived ||
                order.totalPrice ||
                0
            ),
        0
    );

    const repairDue = dashboardRepairs.reduce(
        (sum, repair) =>
            sum + Number(repair.amountDue || 0),
        0
    );

    const totalDue = repairDue;

    setText(
        "cashFlowSales",
        `TZS ${totalSales.toLocaleString("en-TZ")}`
    );

    setText(
        "cashFlowProfit",
        `TZS ${totalProfit.toLocaleString("en-TZ")}`
    );

    setText(
        "cashFlowCollected",
        `TZS ${totalCollected.toLocaleString("en-TZ")}`
    );

    setText(
        "cashFlowDue",
        `TZS ${totalDue.toLocaleString("en-TZ")}`
    );

    setText(
        "cashFlowRepairDue",
        `TZS ${repairDue.toLocaleString("en-TZ")}`
    );
}

// =============================
// MONTHLY SALES TARGET
// =============================

function updateMonthlySalesTarget() {

    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlySales =
        dashboardOrders
            .filter(order => {

                if (!order.createdAt) {
                    return false;
                }

                if (order.status === "Cancelled") {
                    return false;
                }

                const orderDate =
                    new Date(order.createdAt);

                return (
                    orderDate.getMonth() === currentMonth &&
                    orderDate.getFullYear() === currentYear
                );

            })
            .reduce(
                (sum, order) =>
                    sum + Number(order.totalPrice || 0),
                0
            );

    let target =
        Number(
            localStorage.getItem(
                "bionicMonthlySalesTarget"
            )
        );

    if (!target || target <= 0) {
        target = 5000000;
    }

    const percentage =
        target > 0
            ? (monthlySales / target) * 100
            : 0;

    const remaining =
        Math.max(target - monthlySales, 0);

    const progress =
        Math.min(percentage, 100);

    setText(
        "monthlySalesTargetCurrent",
        `TZS ${monthlySales.toLocaleString("en-TZ")}`
    );

    setText(
        "monthlySalesTargetPercent",
        `${percentage.toFixed(1)}%`
    );

    setText(
        "monthlySalesTargetRemaining",
        remaining > 0
            ? `TZS ${remaining.toLocaleString("en-TZ")} remaining`
            : "🎉 Target reached!"
    );

    const input =
        document.getElementById(
            "monthlySalesTargetInput"
        );

    if (input && !input.value) {
        input.value = target;
    }

    const progressBar =
        document.getElementById(
            "monthlySalesTargetProgress"
        );

    if (progressBar) {
        progressBar.style.width =
            `${progress}%`;
    }

    const message =
        document.getElementById(
            "monthlySalesTargetMessage"
        );

    if (message) {

        if (percentage >= 100) {

            message.textContent =
                "🎉 Excellent! Your monthly sales target has been reached.";

        } else if (percentage >= 75) {

            message.textContent =
                "🔥 Great progress! You are getting close to your target.";

        } else if (percentage >= 50) {

            message.textContent =
                "💪 You are halfway there. Keep pushing sales.";

        } else {

            message.textContent =
                "📈 Keep building sales toward your monthly target.";

        }
    }
}


// =============================
// SAVE MONTHLY TARGET
// =============================

function saveMonthlySalesTarget() {

    const input =
        document.getElementById(
            "monthlySalesTargetInput"
        );

    if (!input) {
        return;
    }

    const target =
        Number(input.value);

    if (!target || target <= 0) {

        alert(
            "Please enter a valid sales target."
        );

        return;
    }

    localStorage.setItem(
        "bionicMonthlySalesTarget",
        target
    );

    updateMonthlySalesTarget();

    alert(
        "Monthly sales target saved successfully."
    );
}

// ========================================
// SUMMARY CARDS
// ========================================

function updateCards() {

    const today =
        new Date();

    const todayString =
        today.toDateString();


    const todayOrders =
        dashboardOrders.filter(
            order =>
                order.createdAt &&
                new Date(
                    order.createdAt
                ).toDateString() === todayString
        );


    const todaySales =
        todayOrders.reduce(
            (total, order) =>
                total +
                Number(
                    order.totalPrice || 0
                ),
            0
        );


    const lowStock =
        dashboardProducts.filter(
            product =>
                Number(product.stock) <= 5
        );


    const activeRepairs =
        dashboardRepairs.filter(
            repair =>
                ![
                    "Completed",
                    "Cancelled"
                ].includes(
                    repair.status
                )
        );


        // ========================================
// UPDATE SALES PACE
// ========================================

setText(
    "dailySalesPace",
    `TZS ${Math.round(
        dailySalesPace
    ).toLocaleString("en-TZ")}`
);


setText(
    "daysRemaining",
    daysRemaining
);


setText(
    "expectedMonthEndSales",
    `TZS ${Math.round(
        expectedMonthEndSales
    ).toLocaleString("en-TZ")}`
);


setText(
    "requiredDailySales",
    `TZS ${Math.round(
        requiredDailySales
    ).toLocaleString("en-TZ")}`
);


const requiredLabel =
    document.getElementById(
        "requiredDailySalesLabel"
    );


if (requiredLabel) {

    if (
        currentSales >= target
    ) {

        requiredLabel.textContent =
            "🎉 Monthly target already reached";

    } else if (
        expectedMonthEndSales >= target
    ) {

        requiredLabel.textContent =
            "🔥 Current pace can reach target";

    } else {

        requiredLabel.textContent =
            "⚠️ Current pace is below target";

    }

}

            // ========================================
    // REAL BUSINESS SNAPSHOT
    // ========================================

    const totalProfit = dashboardOrders.reduce(
        (sum, order) =>
            sum + Number(order.totalProfit || 0),
        0
    );

    const inventoryValue = dashboardProducts.reduce(
        (sum, product) =>
            sum +
            (Number(product.costPrice || 0) *
             Number(product.stock || 0)),
        0
    );

    const totalAmountDue = dashboardRepairs.reduce(
        (sum, repair) =>
            sum + Number(repair.amountDue || 0),
        0
    );

    setText(
        "dashboardTotalProfit",
        `TZS ${totalProfit.toLocaleString("en-TZ")}`
    );

    setText(
        "dashboardStockValue",
        `TZS ${inventoryValue.toLocaleString("en-TZ")}`
    );

    setText(
        "dashboardAmountDue",
        `TZS ${totalAmountDue.toLocaleString("en-TZ")}`
    );


    setText(
             "todaySales",
             `TZS ${todaySales.toLocaleString("en-TZ", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
         })}`
        );

    setText(
        "totalOrders",
        dashboardOrders.length
    );

    setText(
        "totalCustomers",
        dashboardCustomers.length
    );

    setText(
        "lowStock",
        lowStock.length
    );

    setText(
        "activeRepairs",
        activeRepairs.length
    );

    setText(
        "posSales",
        dashboardOrders.filter(
            order =>
                order.orderType === "POS"
        ).length
    );
}


// ========================================
// RECENT SALES
// ========================================

function updateRecentSales() {

    const container =
        document.getElementById(
            "recentSales"
        );

    if (!container) {
        return;
    }


    const recent =
        [...dashboardOrders]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML =
            "<p>No sales yet.</p>";

        return;
    }


    container.innerHTML =
        recent.map(order => {

            const customer =
                order.customer
                    ? order.customer.name
                    : "Walk-in Customer";

            const id =
                order._id
                    ? order._id
                        .slice(-8)
                        .toUpperCase()
                    : "-";


            return `

                <div class="dashboard-list-item">

                    <div>

                        <strong>
                            #${id}
                        </strong>

                        <small>
                            ${escapeHTML(
                                customer
                            )}
                        </small>

                    </div>

                    <strong>
                           TZS ${Number(
                           order.totalPrice || 0
                          ).toLocaleString("en-TZ", {
                           minimumFractionDigits: 0,
                           maximumFractionDigits: 2
                           })}
                    </strong>

                </div>

            `;

        }).join("");
}


// ========================================
// LOW STOCK
// ========================================

function updateLowStock() {

    const container =
        document.getElementById(
            "lowStockProducts"
        );

    if (!container) {
        return;
    }


    const lowStock =
        dashboardProducts
            .filter(
                product =>
                    Number(product.stock) <= 5
            )
            .sort(
                (a, b) =>
                    Number(a.stock) -
                    Number(b.stock)
            )
            .slice(0, 6);


    if (lowStock.length === 0) {

        container.innerHTML =
            "<p>✅ No low-stock products.</p>";

        return;
    }


    container.innerHTML =
        lowStock.map(product => `

            <div class="dashboard-list-item">

                <div>

                    <strong>
                        ${escapeHTML(
                            product.name
                        )}
                    </strong>

                    <small>
                        Low stock
                    </small>

                </div>

                <strong>
                    ${product.stock}
                </strong>

            </div>

        `).join("");
}


// ========================================
// RECENT REPAIRS
// ========================================

function updateRecentRepairs() {

    const container =
        document.getElementById(
            "recentRepairs"
        );

    if (!container) {
        return;
    }


    const recent =
        [...dashboardRepairs]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML =
            "<p>No repairs yet.</p>";

        return;
    }


    container.innerHTML =
        recent.map(repair => {

            return `

                <div class="dashboard-list-item">

                    <div>

                        <strong>
                            ${escapeHTML(
                                repair.brand || ""
                            )}
                            ${escapeHTML(
                                repair.model || ""
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                repair.deviceType || ""
                            )}
                        </small>

                    </div>

                    <span>
                        ${escapeHTML(
                            repair.status || "Received"
                        )}
                    </span>

                </div>

            `;

        }).join("");
}


// ========================================
// BUSINESS HEALTH
// ========================================

function updateBusinessHealth() {

    const totalSales = dashboardOrders.reduce(
        (sum, order) =>
            sum + Number(order.totalPrice || 0),
        0
    );

    const totalProfit = dashboardOrders.reduce(
        (sum, order) =>
            sum + Number(order.totalProfit || 0),
        0
    );

    const profitMargin =
        totalSales > 0
            ? (totalProfit / totalSales) * 100
            : 0;


    const lowStockProducts =
        dashboardProducts.filter(
            product =>
                Number(product.stock || 0) <= 5
        ).length;


    const activeRepairs =
        dashboardRepairs.filter(
            repair =>
                ![
                    "Completed",
                    "Cancelled"
                ].includes(repair.status)
        ).length;


    const amountDue =
        dashboardRepairs.reduce(
            (sum, repair) =>
                sum + Number(repair.amountDue || 0),
            0
        );


    setText(
        "healthProfitability",
        profitMargin > 0
            ? `${profitMargin.toFixed(1)}% margin`
            : "No profit yet"
    );


    setText(
        "healthInventory",
        lowStockProducts > 0
            ? `${lowStockProducts} low-stock`
            : "Healthy"
    );


    setText(
        "healthRepairs",
        activeRepairs > 0
            ? `${activeRepairs} active`
            : "No active repairs"
    );


    setText(
        "healthPayments",
        amountDue > 0
            ? `TZS ${amountDue.toLocaleString("en-TZ")} due`
            : "All collected"
    );
}

// ========================================
// TOP PRODUCT PERFORMANCE
// ========================================

function updateTopProducts() {

    const productStats = {};

    dashboardOrders.forEach(order => {

        if (!order.products) return;

        order.products.forEach(item => {

            const productId =
                item.product ||
                item.productId ||
                item._id;

            const productName =
                item.name ||
                item.productName ||
                "Unknown Product";

            if (!productId) return;

            if (!productStats[productId]) {

                productStats[productId] = {
                    name: productName,
                    units: 0,
                    revenue: 0,
                    profit: 0
                };

            }

            const quantity =
                Number(item.quantity || 1);

            const price =
                Number(item.price || 0);

            const costPrice =
                Number(item.costPrice || 0);

            productStats[productId].units += quantity;

            productStats[productId].revenue +=
                price * quantity;

            productStats[productId].profit +=
                (price - costPrice) * quantity;

        });

    });


    const topProducts =
        Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);


    const container =
        document.getElementById("topProducts");

    if (!container) return;


    if (topProducts.length === 0) {

        container.innerHTML =
            `<p class="empty-state">
                No product sales yet.
            </p>`;

        return;
    }


    container.innerHTML =
        topProducts.map((product, index) => `

            <div class="top-product-performance">

                <div class="top-product-rank">
                    #${index + 1}
                </div>

                <div class="top-product-info">

                    <strong>
                        ${product.name}
                    </strong>

                    <small>
                        ${product.units} units sold
                    </small>

                </div>

                <div class="top-product-revenue">

                    <strong>
                        TZS ${product.revenue.toLocaleString("en-TZ")}
                    </strong>

                    <small>
                        Revenue
                    </small>

                </div>

                <div class="top-product-profit">

                    <strong>
                        TZS ${product.profit.toLocaleString("en-TZ")}
                    </strong>

                    <small>
                        Profit
                    </small>

                </div>

            </div>

        `).join("");
}


// ========================================
// SET TEXT
// ========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// ========================================
// MESSAGE
// ========================================

function showDashboardMessage(
    message
) {

    const element =
        document.getElementById(
            "dashboardMessage"
        );

    if (element) {

        element.textContent =
            message;

        element.style.display =
            "block";
    }
}


function hideDashboardMessage() {

    const element =
        document.getElementById(
            "dashboardMessage"
        );

    if (element) {
        element.style.display =
            "none";
    }
}


// ========================================
// SECURITY
// ========================================

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// REFRESH
// ========================================

function refreshDashboard() {
    loadDashboard();
}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboard();

        const refresh =
            document.getElementById(
                "refreshDashboard"
            );

        if (refresh) {

            refresh.addEventListener(
                "click",
                refreshDashboard
            );

        }

    }
);


// ========================================
// SALES ANALYTICS
// ========================================

let salesChart = null;
let orderTypeChart = null;
let paymentChart = null;

// ========================================
// SALES VS PROFIT TREND
// ========================================

function updateSalesProfitChart() {

    const dailyData = {};

    dashboardOrders.forEach(order => {

        if (!order.createdAt) return;

        const date = new Date(order.createdAt)
            .toLocaleDateString("en-TZ", {
                day: "2-digit",
                month: "short"
            });

        if (!dailyData[date]) {
            dailyData[date] = {
                sales: 0,
                profit: 0
            };
        }

        dailyData[date].sales +=
            Number(order.totalPrice || 0);

        dailyData[date].profit +=
            Number(order.totalProfit || 0);
    });

    const labels = Object.keys(dailyData);

    const sales = labels.map(
        date => dailyData[date].sales
    );

    const profit = labels.map(
        date => dailyData[date].profit
    );

    const canvas =
        document.getElementById("salesProfitChart");

    if (!canvas) return;

    if (
        salesProfitChart &&
        typeof salesProfitChart.destroy === "function"
    ) {
        salesProfitChart.destroy();
    }

    salesProfitChart = new Chart(canvas, {

        type: "line",

        data: {
            labels: labels,

            datasets: [

                {
                    label: "Sales",
                    data: sales,
                    tension: 0.3
                },

                {
                    label: "Profit",
                    data: profit,
                    tension: 0.3
                }

            ]
        },

        options: {

            responsive: true,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    position: "bottom"
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {

                            return `${context.dataset.label}: TZS ${Number(
                                context.raw || 0
                            ).toLocaleString("en-TZ")}`;

                        }
                    }
                }
            },

            scales: {

                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: function(value) {
                            return "TZS " +
                                Number(value)
                                    .toLocaleString("en-TZ");
                        }
                    }
                }

            }
        }

    });
}


// ========================================
// UPDATE ALL ANALYTICS
// ========================================

function updateAnalytics() {

    createSalesChart();

    createOrderTypeChart();

    createPaymentChart();

    updateRevenueSummary();

    updateSalesPerformance();

    updateCustomerInsights();

    updateInventoryIntelligence();

    updateFinancialIntelligence();

    updateBusinessDecisionCenter();

}


// ========================================
// SALES — LAST 7 DAYS
// ========================================

function createSalesChart() {

    const canvas =
        document.getElementById(
            "salesChart"
        );

    if (!canvas) {
        return;
    }


    const labels = [];

    const salesData = [];


    // Create last 7 days

    const days =
         Number(selectedAnalyticsDays || 7);

    for (
         let i = days - 1;
         i >= 0;
          i--
    ) {

        const date =
            new Date();

        date.setHours(
            0,
            0,
            0,
            0
        );

        date.setDate(
            date.getDate() - i
        );


        labels.push(
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            )
        );


        const dateString =
            date.toDateString();


        const dailySales =
            dashboardOrders
                .filter(order => {

                    if (!order.createdAt) {
                        return false;
                    }

                    return new Date(
                        order.createdAt
                    ).toDateString()
                    === dateString;

                })
                .reduce(
                    (
                        total,
                        order
                    ) => {

                        return total +
                            Number(
                                order.totalPrice || 0
                            );

                    },
                    0
                );


        salesData.push(
            Number(
                dailySales.toFixed(2)
            )
        );

    }


    if (salesChart) {

        salesChart.destroy();

    }


    salesChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "Sales",

                            data:
                                salesData,

                            tension:
                                0.35,

                            fill:
                                true,

                            borderWidth:
                                3,

                            pointRadius:
                                4

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(
                                        context
                                    ) {

                                        return (
                                              "TZS " +
                                              Number(
                                                 context.raw
                                              ).toLocaleString("en-TZ", {
                                                     minimumFractionDigits: 0,
                                                     maximumFractionDigits: 2
                                              })
                                        );

                                    }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                callback:
                                    function(
                                        value
                                    ) {

                                        return (
                                           "TZS " +
                                           Number(value).toLocaleString("en-TZ")
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


// ========================================
// POS VS ONLINE
// ========================================

function createOrderTypeChart() {

    const canvas =
        document.getElementById(
            "orderTypeChart"
        );

    if (!canvas) {
        return;
    }


    let posOrders = 0;

    let onlineOrders = 0;


    dashboardOrders.forEach(
        order => {

            if (
                order.orderType === "POS"
            ) {

                posOrders++;

            } else {

                onlineOrders++;

            }

        }
    );


    if (orderTypeChart) {

        orderTypeChart.destroy();

    }


    orderTypeChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [

                        "POS",

                        "Online"

                    ],

                    datasets: [

                        {

                            data: [

                                posOrders,

                                onlineOrders

                            ],

                            borderWidth:
                                0

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "65%",

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }
        );

}


// ========================================
// PAYMENT METHODS
// ========================================

function createPaymentChart() {
    const canvas = document.getElementById("paymentChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (paymentChart) {
        paymentChart.destroy();
    }

    const analyticsOrders = getAnalyticsOrders();

    const paymentMethods = [
        "Cash",
        "M-Pesa",
        "Airtel Money",
        "Card",
        "Bank Transfer"
    ];

    const paymentRevenue = paymentMethods.map(method => {
        return analyticsOrders
            .filter(order => order.paymentMethod === method)
            .reduce(
                (sum, order) =>
                    sum + Number(order.totalPrice || 0),
                0
            );
    });

    paymentChart = new Chart(ctx, {
        type: "doughnut",

        data: {
            labels: paymentMethods,

            datasets: [{
                label: "Revenue",

                data: paymentRevenue
            }]
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {

                            const value =
                                Number(context.raw || 0);

                            return `${context.label}: TZS ${value.toLocaleString("en-TZ")}`;
                        }
                    }
                }
            }
        }
    });
} 

// ========================================
// ANALYTICS RANGE
// ========================================

let selectedAnalyticsDays = 7;


// ========================================
// FILTER ORDERS BY DATE
// ========================================

function getAnalyticsOrders() {

    const now = new Date();

    const startDate = new Date();

    startDate.setDate(
        now.getDate() -
        selectedAnalyticsDays +
        1
    );

    startDate.setHours(
        0, 0, 0, 0
    );

    return dashboardOrders.filter(
        order => {

            if (!order.createdAt) {
                return false;
            }

            const orderDate =
                new Date(
                    order.createdAt
                );

            return orderDate >= startDate &&
                   orderDate <= now;

        }
    );
}


// ========================================
// UPDATE REVENUE SUMMARY
// ========================================

function updateRevenueSummary() {

    const orders =
        getAnalyticsOrders();


    const totalRevenue =
        orders.reduce(
            (total, order) =>
                total +
                Number(
                    order.totalPrice || 0
                ),
            0
        );


    const averageOrder =
        orders.length > 0
            ? totalRevenue / orders.length
            : 0;


    const posRevenue =
        orders
            .filter(
                order =>
                    order.orderType === "POS"
            )
            .reduce(
                (total, order) =>
                    total +
                    Number(
                        order.totalPrice || 0
                    ),
                0
            );


    const onlineRevenue =
        orders
            .filter(
                order =>
                    order.orderType !== "POS"
            )
            .reduce(
                (total, order) =>
                    total +
                    Number(
                        order.totalPrice || 0
                    ),
                0
            );


    setText(
     "analyticsRevenue",
     `TZS ${totalRevenue.toLocaleString("en-TZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
         })}`
    );


    setText(
       "averageOrderValue",
       `TZS ${averageOrder.toLocaleString("en-TZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
     })}`
    );


    setText(
     "posRevenue",
     `TZS ${posRevenue.toLocaleString("en-TZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })}`
    );


    setText(
      "onlineRevenue",
      `TZS ${onlineRevenue.toLocaleString("en-TZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
     })}`
    );
}

// ========================================
// ANALYTICS RANGE CHANGE
// ========================================

document.addEventListener(
    "DOMContentLoaded",


    
    () => {


        const exportButton =
    document.getElementById(
        "exportSales"
    );

if (exportButton) {

    exportButton.addEventListener(
        "click",
        exportSalesCSV
    );

}


const printButton =
    document.getElementById(
        "printDashboard"
    );

if (printButton) {

    printButton.addEventListener(
        "click",
        printDashboard
    );

}

        const range =
            document.getElementById(
                "analyticsRange"
            );

        if (!range) {
            return;
        }


        range.addEventListener(
            "change",
             () => {

                  selectedAnalyticsDays =
                      Number(range.value);

                 createSalesChart();
                  createOrderTypeChart();
                 createPaymentChart();

                  updateRevenueSummary();
                  updateSalesPerformance();
                   updateCustomerInsights();
                  updateInventoryIntelligence();
                  updateFinancialIntelligence();

               }
           );


        updateRevenueSummary();

    }
);

// ========================================
// SALES PERFORMANCE
// ========================================

function updateSalesPerformance() {

    const orders = getAnalyticsOrders();

    const days = Number(
        selectedAnalyticsDays || 7
    );

    // ========================================
    // CURRENT PERIOD
    // ========================================

    const currentRevenue =
        orders
            .filter(order =>
                order.status !== "Cancelled"
            )
            .reduce(
                (total, order) =>
                    total +
                    Number(order.totalPrice || 0),
                0
            );

    const currentProfit =
        orders
            .filter(order =>
                order.status !== "Cancelled"
            )
            .reduce(
                (total, order) =>
                    total +
                    Number(order.totalProfit || 0),
                0
            );

    const currentOrders =
        orders.filter(
            order =>
                order.status !== "Cancelled"
        );


    // ========================================
    // PREVIOUS PERIOD
    // ========================================

    const now = new Date();

    const previousEnd =
        new Date(now);

    previousEnd.setDate(
        previousEnd.getDate() - days
    );

    previousEnd.setHours(
        23,
        59,
        59,
        999
    );


    const previousStart =
        new Date(previousEnd);

    previousStart.setDate(
        previousStart.getDate() -
        days +
        1
    );

    previousStart.setHours(
        0,
        0,
        0,
        0
    );


    const previousOrders =
        dashboardOrders.filter(order => {

            if (!order.createdAt) {
                return false;
            }

            if (
                order.status ===
                "Cancelled"
            ) {
                return false;
            }

            const orderDate =
                new Date(
                    order.createdAt
                );

            return (
                orderDate >= previousStart &&
                orderDate <= previousEnd
            );

        });


    const previousRevenue =
        previousOrders.reduce(
            (total, order) =>
                total +
                Number(
                    order.totalPrice || 0
                ),
            0
        );


    const previousProfit =
        previousOrders.reduce(
            (total, order) =>
                total +
                Number(
                    order.totalProfit || 0
                ),
            0
        );


    // ========================================
    // GROWTH CALCULATOR
    // ========================================

    function calculateGrowth(
        current,
        previous
    ) {

        if (previous > 0) {

            return (
                (
                    (current - previous) /
                    previous
                ) * 100
            );

        }

        if (current > 0) {
            return 100;
        }

        return 0;
    }


    const salesGrowth =
        calculateGrowth(
            currentRevenue,
            previousRevenue
        );


    const profitGrowth =
        calculateGrowth(
            currentProfit,
            previousProfit
        );


    const previousOrderCount =
        previousOrders.length;


    const orderGrowth =
        calculateGrowth(
            currentOrders.length,
            previousOrderCount
        );


    // ========================================
    // UPDATE SALES GROWTH
    // ========================================

    const growthElement =
        document.getElementById(
            "salesGrowth"
        );

    if (growthElement) {

        growthElement.textContent =
            `${salesGrowth >= 0 ? "+" : ""}${salesGrowth.toFixed(1)}%`;

        growthElement.style.color =
            salesGrowth >= 0
                ? "#16a34a"
                : "#dc2626";
    }


    const growthLabel =
        document.getElementById(
            "salesGrowthLabel"
        );

    if (growthLabel) {

        growthLabel.textContent =
            salesGrowth >= 0
                ? "Sales increased"
                : "Sales decreased";
    }


    // ========================================
    // UPDATE CURRENT / PREVIOUS SALES
    // ========================================

    setText(
        "currentPeriodSales",
        `TZS ${currentRevenue.toLocaleString("en-TZ")}`
    );


    setText(
        "previousPeriodSales",
        `TZS ${previousRevenue.toLocaleString("en-TZ")}`
    );


    // ========================================
    // UPDATE ORDERS
    // ========================================

    setText(
        "currentPeriodOrders",
        currentOrders.length.toLocaleString("en-TZ")
    );


    const orderGrowthElement =
        document.getElementById(
            "orderGrowth"
        );

    if (orderGrowthElement) {

        orderGrowthElement.textContent =
            `${orderGrowth >= 0 ? "+" : ""}${orderGrowth.toFixed(1)}%`;

        orderGrowthElement.style.color =
            orderGrowth >= 0
                ? "#16a34a"
                : "#dc2626";
    }


    const orderGrowthLabel =
        document.getElementById(
            "orderGrowthLabel"
        );

    if (orderGrowthLabel) {

        orderGrowthLabel.textContent =
            orderGrowth >= 0
                ? "Orders increased"
                : "Orders decreased";
    }


    // ========================================
    // UPDATE PROFIT
    // ========================================

    setText(
        "currentPeriodProfit",
        `TZS ${currentProfit.toLocaleString("en-TZ")}`
    );


    const profitGrowthElement =
        document.getElementById(
            "profitGrowth"
        );

    if (profitGrowthElement) {

        profitGrowthElement.textContent =
            `${profitGrowth >= 0 ? "+" : ""}${profitGrowth.toFixed(1)}%`;

        profitGrowthElement.style.color =
            profitGrowth >= 0
                ? "#16a34a"
                : "#dc2626";
    }

}

// ========================================
// SALES GROWTH & FORECAST
// ========================================

let monthlyForecastChart = null;


function updateSalesForecast() {

    const orders =
        dashboardOrders || [];


    // ========================================
    // PREPARE LAST 6 MONTHS
    // ========================================

    const now =
        new Date();

    const months = [];

    for (let i = 5; i >= 0; i--) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );

        months.push({
            year:
                date.getFullYear(),

            month:
                date.getMonth(),

            label:
                date.toLocaleDateString(
                    "en-TZ",
                    {
                        month: "short",
                        year: "numeric"
                    }
                ),

            sales: 0,
            profit: 0
        });

    }


    // ========================================
    // CALCULATE MONTHLY SALES
    // ========================================

    orders.forEach(order => {

        if (!order.createdAt) {
            return;
        }

        if (
            order.status ===
            "Cancelled"
        ) {
            return;
        }

        const orderDate =
            new Date(
                order.createdAt
            );


        const matchingMonth =
            months.find(item =>
                item.year ===
                    orderDate.getFullYear()
                &&
                item.month ===
                    orderDate.getMonth()
            );


        if (!matchingMonth) {
            return;
        }


        matchingMonth.sales +=
            Number(
                order.totalPrice || 0
            );


        matchingMonth.profit +=
            Number(
                order.totalProfit || 0
            );

    });


    // ========================================
    // CURRENT / PREVIOUS MONTH
    // ========================================

    const currentMonth =
        months[months.length - 1];


    const previousMonth =
        months[months.length - 2];


    const currentSales =
        currentMonth.sales;

        // ========================================
// CURRENT MONTH SALES PACE
// ========================================

const currentDate =
    new Date();

const currentDay =
    currentDate.getDate();

const daysInMonth =
    new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

const daysRemaining =
    Math.max(
        daysInMonth - currentDay,
        0
    );


// Daily sales pace
const dailySalesPace =
    currentDay > 0
        ? currentSales / currentDay
        : 0;


// Expected sales by month end
const expectedMonthEndSales =
    dailySalesPace *
    daysInMonth;



// Amount still needed
const targetRemaining =
    Math.max(
        target - currentSales,
        0
    );


// Required daily sales
const requiredDailySales =
    daysRemaining > 0
        ? targetRemaining / daysRemaining
        : 0;


    const previousSales =
        previousMonth.sales;


    let growth = 0;


    if (previousSales > 0) {

        growth =
            (
                (
                    currentSales -
                    previousSales
                ) /
                previousSales
            ) * 100;

    } else if (
        currentSales > 0
    ) {

        growth = 100;

    }


    // ========================================
    // NEXT MONTH FORECAST
    // ========================================
    //
    // Simple baseline:
    // average of the previous
    // three completed months.
    //
    // ========================================

    const completedMonths =
        months
            .slice(0, -1)
            .map(month =>
                month.sales
            );


    const monthsWithSales =
        completedMonths.filter(
            sales => sales > 0
        );


    let forecast = 0;


    if (
        monthsWithSales.length > 0
    ) {

        const total =
            monthsWithSales.reduce(
                (sum, sales) =>
                    sum + sales,
                0
            );


        forecast =
            total /
            monthsWithSales.length;

    }


    // ========================================
    // MONTHLY TARGET
    // ========================================


    const targetDifference =
        forecast - target;


    // ========================================
    // UPDATE CARDS
    // ========================================

    setText(
        "forecastCurrentMonth",
        `TZS ${currentSales.toLocaleString("en-TZ")}`
    );


    const growthElement =
        document.getElementById(
            "forecastGrowth"
        );


    if (growthElement) {

        growthElement.textContent =
            `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;

        growthElement.style.color =
            growth >= 0
                ? "#16a34a"
                : "#dc2626";

    }


    setText(
        "nextMonthForecast",
        `TZS ${Math.round(
            forecast
        ).toLocaleString("en-TZ")}`
    );


    const targetDifferenceElement =
        document.getElementById(
            "forecastTargetDifference"
        );


    if (
        targetDifferenceElement
    ) {

        const absoluteDifference =
            Math.abs(
                targetDifference
            );


        targetDifferenceElement.textContent =
            `TZS ${Math.round(
                absoluteDifference
            ).toLocaleString("en-TZ")}`;


        targetDifferenceElement.style.color =
            targetDifference >= 0
                ? "#16a34a"
                : "#dc2626";

    }


    const targetLabel =
        document.getElementById(
            "forecastTargetLabel"
        );


    if (targetLabel) {

        targetLabel.textContent =
            targetDifference >= 0
                ? "Forecast above target"
                : "Forecast below target";

    }


    // ========================================
    // CREATE MONTHLY CHART
    // ========================================

    const canvas =
        document.getElementById(
            "monthlyForecastChart"
        );


    if (!canvas) {
        return;
    }


    if (
        monthlyForecastChart &&
        typeof monthlyForecastChart.destroy ===
            "function"
    ) {

        monthlyForecastChart.destroy();

    }


    monthlyForecastChart =
        new Chart(
            canvas,
            {
                type: "line",

                data: {

                    labels:
                        months.map(
                            month =>
                                month.label
                        ),

                    datasets: [

                        {
                            label:
                                "Sales",

                            data:
                                months.map(
                                    month =>
                                        month.sales
                                ),

                            tension:
                                0.3
                        },

                        {
                            label:
                                "Profit",

                            data:
                                months.map(
                                    month =>
                                        month.profit
                                ),

                            tension:
                                0.3
                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    interaction: {
                        mode:
                            "index",
                        intersect:
                            false
                    },

                    plugins: {

                        legend: {
                            position:
                                "bottom"
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(
                                        context
                                    ) {

                                        return (
                                            `${context.dataset.label}: TZS ` +
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

                            beginAtZero:
                                true,

                            ticks: {

                                callback:
                                    function(
                                        value
                                    ) {

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

// ========================================
// CUSTOMER & SALES INSIGHTS
// ========================================

function updateCustomerInsights() {

    const customers =
        dashboardCustomers || [];

    const orders =
        dashboardOrders || [];


    // ========================================
    // TOTAL CUSTOMERS
    // ========================================

    const totalCustomers =
        customers.length;


    setText(
        "insightTotalCustomers",
        totalCustomers
    );


    // ========================================
    // CUSTOMER SPENDING MAP
    // ========================================

    const customerMap =
        new Map();


    customers.forEach(customer => {

        if (!customer || !customer._id) {
            return;
        }

        customerMap.set(
            String(customer._id),
            {
                id: String(customer._id),

                name:
                    customer.name ||
                    "Unknown Customer",

                phone:
                    customer.phone ||
                    "",

                orders: 0,

                spending: 0
            }
        );

    });


    // ========================================
    // CURRENT MONTH
    // ========================================

    const now =
        new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();


    const monthlyBuyerIds =
        new Set();


    // ========================================
    // PROCESS ORDERS
    // ========================================

    orders.forEach(order => {

        // Ignore cancelled orders
        if (
            order.status ===
            "Cancelled"
        ) {
            return;
        }


        if (!order.customer) {
            return;
        }


        const customerId =

            typeof order.customer === "object"

                ? order.customer._id

                : order.customer;


        if (!customerId) {
            return;
        }


        const key =
            String(customerId);


        // Create customer if
        // not already loaded
        if (!customerMap.has(key)) {

            customerMap.set(
                key,
                {
                    id: key,

                    name:
                        order.customer?.name ||
                        order.customerName ||
                        "Unknown Customer",

                    phone:
                        order.customer?.phone ||
                        "",

                    orders: 0,

                    spending: 0
                }
            );

        }


        const customer =
            customerMap.get(key);


        // Count order

        customer.orders += 1;


        // Add spending

        customer.spending +=
            Number(
                order.totalPrice || 0
            );


        // ====================================
        // MONTHLY BUYER
        // ====================================

        if (
            order.createdAt
        ) {

            const orderDate =
                new Date(
                    order.createdAt
                );


            if (
                orderDate.getMonth() ===
                    currentMonth &&

                orderDate.getFullYear() ===
                    currentYear
            ) {

                monthlyBuyerIds.add(
                    key
                );

            }

        }

    });


    // ========================================
    // CUSTOMERS WHO BOUGHT THIS MONTH
    // ========================================

    setText(
        "insightMonthlyBuyers",
        monthlyBuyerIds.size
    );


    // ========================================
    // SORT CUSTOMERS
    // ========================================

    const sortedCustomers =

        [...customerMap.values()]

            .filter(
                customer =>
                    customer.orders > 0
            )

            .sort(
                (a, b) =>
                    b.spending -
                    a.spending
            );


    // ========================================
    // MOST VALUABLE CUSTOMER
    // ========================================

    const topCustomer =
        sortedCustomers[0];


    if (topCustomer) {

        setText(
            "topCustomerName",
            topCustomer.name
        );


        setText(
            "topCustomerAmount",

            `TZS ${
                topCustomer.spending
                    .toLocaleString("en-TZ")
            }`
        );

    } else {

        setText(
            "topCustomerName",
            "No customer data"
        );


        setText(
            "topCustomerAmount",
            "TZS 0"
        );

    }


    // ========================================
    // REPEAT CUSTOMERS
    // ========================================

    const repeatCustomers =

        sortedCustomers.filter(
            customer =>
                customer.orders >= 2
        ).length;


    setText(
        "repeatCustomers",
        repeatCustomers
    );


    // ========================================
    // ACTIVE CUSTOMERS
    // ========================================

    const activeCustomers =
        sortedCustomers.length;


    // ========================================
    // AVERAGE CUSTOMER SPENDING
    // ========================================

    const totalCustomerSpending =

        sortedCustomers.reduce(
            (total, customer) =>
                total +
                customer.spending,
            0
        );


    const averageCustomerSpend =

        activeCustomers > 0

            ? totalCustomerSpending /
              activeCustomers

            : 0;


    setText(
        "averageCustomerSpend",

        `TZS ${
            averageCustomerSpend
                .toLocaleString("en-TZ")
        }`
    );


    // ========================================
    // TOP 5 CUSTOMERS
    // ========================================

    const container =
        document.getElementById(
            "topCustomersList"
        );


    if (!container) {
        return;
    }


    if (
        sortedCustomers.length === 0
    ) {

        container.innerHTML = `
            <p>
                No customer purchases yet.
            </p>
        `;

        return;
    }


    container.innerHTML =

        sortedCustomers

            .slice(0, 5)

            .map(
                (customer, index) => {

                    return `

                        <div
                            class="top-customer-row"
                        >

                            <div
                                class="top-customer-rank"
                            >
                                ${index + 1}
                            </div>


                            <div
                                class="top-customer-info"
                            >

                                <strong>
                                    ${escapeHTML(
                                        customer.name
                                    )}
                                </strong>

                                <small>
                                    ${
                                        customer.orders
                                    }

                                    ${
                                        customer.orders === 1
                                            ? "order"
                                            : "orders"
                                    }
                                </small>

                            </div>


                            <strong
                                class="top-customer-spending"
                            >

                                TZS ${
                                    customer.spending
                                        .toLocaleString(
                                            "en-TZ"
                                        )
                                }

                            </strong>

                        </div>

                    `;

                }
            )

            .join("");

}



    // ========================================
    // EXPORT SALES CSV
    // ========================================

    function exportSalesCSV() {

    const orders =
        getAnalyticsOrders();

    if (orders.length === 0) {

        alert(
            "No sales available for this period."
        );

        return;
    }


    const rows = [

        [
            "Order ID",
            "Date",
            "Customer",
            "Order Type",
            "Payment Method",
            "Total"
        ]

    ];


    orders.forEach(order => {

        const customer =
            order.customer?.name ||
            "Walk-in Customer";


        rows.push([

            order._id || "",

            order.createdAt
                ? new Date(
                    order.createdAt
                  ).toLocaleString()
                : "",

            customer,

            order.orderType ||
                "Online",

            order.paymentMethod ||
                "Unknown",

            Number(
                order.totalPrice || 0
            ).toFixed(2)

        ]);

    });


    const csv =
        rows
            .map(row =>
                row.map(value => {

                    const text =
                        String(value)
                        .replace(/"/g, '""');

                    return `"${text}"`;

                }).join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        `bionic-store-sales-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}


// ========================================
// PRINT DASHBOARD
// ========================================

function printDashboard() {

    window.print();

}


// ========================================
// ADMIN ALERTS
// ========================================

function updateAdminAlerts() {

    const container =
        document.getElementById(
            "dashboardAlerts"
        );

    const countElement =
        document.getElementById(
            "alertCount"
        );


    if (!container) {
        return;
    }


    const alerts = [];


    // ====================================
    // LOW STOCK
    // ====================================

    const criticalStock =
        dashboardProducts.filter(
            product =>
                Number(product.stock) <= 2
        );


    const lowStock =
        dashboardProducts.filter(
            product =>
                Number(product.stock) > 2 &&
                Number(product.stock) <= 5
        );


    if (criticalStock.length > 0) {

        alerts.push({

            type: "critical",

            icon: "🚨",

            title:
                `${criticalStock.length} product${
                    criticalStock.length === 1
                        ? ""
                        : "s"
                } critically low`,

            message:
                "Stock level is 2 or below.",

            link:
                "inventory.html"

        });

    }


    if (lowStock.length > 0) {

        alerts.push({

            type: "warning",

            icon: "⚠️",

            title:
                `${lowStock.length} product${
                    lowStock.length === 1
                        ? ""
                        : "s"
                } low in stock`,

            message:
                "Consider restocking soon.",

            link:
                "inventory.html"

        });

    }


    // ====================================
    // REPAIRS
    // ====================================

    const waitingParts =
        dashboardRepairs.filter(
            repair =>
                repair.status ===
                "Waiting for Parts"
        );


    const readyRepairs =
        dashboardRepairs.filter(
            repair =>
                repair.status ===
                "Ready"
        );


    if (waitingParts.length > 0) {

        alerts.push({

            type: "warning",

            icon: "🔧",

            title:
                `${waitingParts.length} repair${
                    waitingParts.length === 1
                        ? ""
                        : "s"
                } waiting for parts`,

            message:
                "Parts are required before repair can continue.",

            link:
                "repairs.html"

        });

    }


    if (readyRepairs.length > 0) {

        alerts.push({

            type: "success",

            icon: "✅",

            title:
                `${readyRepairs.length} repair${
                    readyRepairs.length === 1
                        ? ""
                        : "s"
                } ready`,

            message:
                "Customer repair is ready for collection.",

            link:
                "repairs.html"

        });

    }


    // ====================================
    // PROCESSING ORDERS
    // ====================================

    const processingOrders =
        dashboardOrders.filter(
            order =>
                order.status ===
                "Processing"
        );


    if (processingOrders.length > 0) {

        alerts.push({

            type: "info",

            icon: "🧾",

            title:
                `${processingOrders.length} order${
                    processingOrders.length === 1
                        ? ""
                        : "s"
                } processing`,

            message:
                "These orders still need attention.",

            link:
                "orders.html"

        });

    }


    // ====================================
    // UPDATE COUNT
    // ====================================

    if (countElement) {

        countElement.textContent =
            alerts.length;

    }


    // ====================================
    // NO ALERTS
    // ====================================

    if (alerts.length === 0) {

        container.innerHTML = `

            <div class="no-alerts">

                <span>
                    🎉
                </span>

                <strong>
                    Everything looks good!
                </strong>

                <p>
                    No urgent alerts right now.
                </p>

            </div>

        `;

        return;

    }


    // ====================================
    // RENDER ALERTS
    // ====================================

    container.innerHTML =
        alerts.map(
            alert => `

                <a
                    href="${alert.link}"
                    class="dashboard-alert ${alert.type}"
                >

                    <div
                        class="alert-icon"
                    >
                        ${alert.icon}
                    </div>


                    <div
                        class="alert-content"
                    >

                        <strong>
                            ${escapeHTML(
                                alert.title
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                alert.message
                            )}
                        </p>

                    </div>


                    <span
                        class="alert-arrow"
                    >
                        →
                    </span>

                </a>

            `
        ).join("");

}



// ========================================
// ADMIN SIDEBAR
// ========================================

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle(
        "open"
    );

}


// ========================================
// ADMIN SETTINGS
// ========================================

function openAdminSettings(event) {

    event.preventDefault();

    alert(
        "⚙️ Admin Settings will be available in the next upgrade."
    );

}


// ========================================
// ADMIN LOGOUT
// ========================================

function adminLogout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );

    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "../index.html";

}

// =============================
// INVENTORY INTELLIGENCE
// =============================

function updateInventoryIntelligence() {

    const criticalStockCount = document.getElementById("criticalStockCount");
    const lowStockCount = document.getElementById("lowStockCount");
    const stockValueElement = document.getElementById("stockValue");
    const outOfStockCount = document.getElementById("outOfStockCount");

    const fastMovingElement = document.getElementById("fastMovingProducts");
    const slowMovingElement = document.getElementById("slowMovingProducts");

    const riskMessage = document.getElementById("inventoryRiskMessage");
    const inventoryTable = document.getElementById("inventoryInsightsTable");

    if (!criticalStockCount ||
        !lowStockCount ||
        !stockValueElement ||
        !outOfStockCount ||
        !inventoryTable) {
        return;
    }

    // -----------------------------
    // Product inventory data
    // -----------------------------

    const inventory = dashboardProducts.map(product => {

        const stock = Number(
            product.stock ??
            product.quantity ??
            product.inventory ??
            0
        );

        const price = Number(product.price || 0);

        const stockValue = stock * price;

        // Calculate units sold
        let unitsSold = 0;

        dashboardOrders.forEach(order => {

            if (!Array.isArray(order.products)) {
                return;
            }

            order.products.forEach(item => {

                const itemProductId =
                    item.product?._id ||
                    item.product ||
                    null;

                const productId =
                    product._id ||
                    product.id ||
                    null;

                if (
                    itemProductId &&
                    productId &&
                    String(itemProductId) === String(productId)
                ) {
                    unitsSold += Number(item.quantity || 0);
                }

                // Fallback to product name
                else if (
                    item.name &&
                    product.name &&
                    item.name.toLowerCase() ===
                    product.name.toLowerCase()
                ) {
                    unitsSold += Number(item.quantity || 0);
                }

            });

        });

        let status = "Healthy";

        if (stock === 0) {
            status = "Out of Stock";
        }
        else if (stock <= 2) {
            status = "Critical";
        }
        else if (stock <= 5) {
            status = "Low Stock";
        }

        return {
            id: product._id || product.id,
            name: product.name || "Unknown Product",
            stock,
            price,
            stockValue,
            unitsSold,
            status
        };

    });

    // -----------------------------
    // Summary calculations
    // -----------------------------

    const criticalProducts =
        inventory.filter(product =>
            product.stock >= 0 &&
            product.stock <= 2
        );

    const lowStockProducts =
        inventory.filter(product =>
            product.stock > 2 &&
            product.stock <= 5
        );

    const outOfStockProducts =
        inventory.filter(product =>
            product.stock === 0
        );

    const totalStockValue =
        inventory.reduce(
            (sum, product) =>
                sum + product.stockValue,
            0
        );

    criticalStockCount.textContent =
        criticalProducts.length;

    lowStockCount.textContent =
        lowStockProducts.length;

    outOfStockCount.textContent =
        outOfStockProducts.length;

    stockValueElement.textContent =
        `TZS ${totalStockValue.toLocaleString("en-TZ")}`;



const totalUnitsElement =
    document.getElementById(
        "totalInventoryUnits"
    );

if (totalUnitsElement) {

    totalUnitsElement.textContent =
        totalInventoryUnits.toLocaleString(
            "en-TZ"
        );

}


const inventoryCostElement =
    document.getElementById(
        "inventoryCostValue"
    );

if (inventoryCostElement) {

    inventoryCostElement.textContent =
        `TZS ${totalInventoryCost.toLocaleString(
            "en-TZ"
        )}`;

}


const turnoverElement =
    document.getElementById(
        "inventoryTurnover"
    );

if (turnoverElement) {

    turnoverElement.textContent =
        `${inventoryTurnover.toFixed(1)}x`;

}


        // -----------------------------
// INVENTORY INTELLIGENCE METRICS
// -----------------------------

const totalInventoryUnits =
    inventory.reduce(
        (sum, product) =>
            sum + product.stock,
        0
    );


// Inventory cost currently tied up in stock
const totalInventoryCost =
    dashboardProducts.reduce(
        (sum, product) => {

            const stock = Number(
                product.stock || 0
            );

            const costPrice = Number(
                product.costPrice || 0
            );

            return sum +
                (stock * costPrice);

        },
        0
    );


// Total units sold
const totalUnitsSold =
    inventory.reduce(
        (sum, product) =>
            sum + product.unitsSold,
        0
    );


// Stock turnover indicator
const inventoryTurnover =
    totalInventoryUnits > 0
        ? totalUnitsSold /
          totalInventoryUnits
        : 0;

    // -----------------------------
    // Fast-moving products
    // -----------------------------

    const fastMoving =
        [...inventory]
            .sort((a, b) =>
                b.unitsSold - a.unitsSold
            )
            .filter(product =>
                product.unitsSold > 0
            )
            .slice(0, 5);

    if (fastMovingElement) {

        if (fastMoving.length === 0) {

            fastMovingElement.innerHTML = `
                <p class="empty-state">
                    No sales data available yet.
                </p>
            `;

        }
        else {

            fastMovingElement.innerHTML =
                fastMoving.map((product, index) => `
                    <div class="inventory-product-row">

                        <div class="inventory-product-rank">
                            #${index + 1}
                        </div>

                        <div class="inventory-product-info">
                            <strong>
                                ${escapeHTML(product.name)}
                            </strong>

                            <span>
                                ${product.unitsSold} units sold
                            </span>
                        </div>

                        <div class="inventory-product-stock">
                            ${product.stock} left
                        </div>

                    </div>
                `).join("");

        }

    }

    // -----------------------------
    // Slow-moving products
    // -----------------------------

    const slowMoving =
        [...inventory]
            .sort((a, b) =>
                a.unitsSold - b.unitsSold
            )
            .slice(0, 5);

    if (slowMovingElement) {

        if (slowMoving.length === 0) {

            slowMovingElement.innerHTML = `
                <p class="empty-state">
                    No inventory data available.
                </p>
            `;

        }
        else {

            slowMovingElement.innerHTML =
                slowMoving.map(product => `
                    <div class="inventory-product-row">

                        <div class="inventory-product-rank">
                            🐢
                        </div>

                        <div class="inventory-product-info">

                            <strong>
                                ${escapeHTML(product.name)}
                            </strong>

                            <span>
                                ${product.unitsSold} units sold
                            </span>

                        </div>

                        <div class="inventory-product-stock">
                            ${product.stock} left
                        </div>

                    </div>
                `).join("");

        }

    }

    // -----------------------------
    // Stock risk alert
    // -----------------------------

    if (riskMessage) {

        if (outOfStockProducts.length > 0) {

            riskMessage.innerHTML =
                `🚨 <strong>${outOfStockProducts.length}</strong> product(s) are completely out of stock. Restocking is recommended.`;

        }

        else if (criticalProducts.length > 0) {

            riskMessage.innerHTML =
                `⚠️ <strong>${criticalProducts.length}</strong> product(s) have critically low stock. Consider restocking soon.`;

        }

        else if (lowStockProducts.length > 0) {

            riskMessage.innerHTML =
                `⚠️ <strong>${lowStockProducts.length}</strong> product(s) have low stock levels.`;

        }

        else {

            riskMessage.innerHTML =
                `✅ Inventory looks healthy. No immediate stock risks detected.`;

        }

    }

    // -----------------------------
    // Inventory table
    // -----------------------------

    const sortedInventory =
        [...inventory].sort((a, b) => {

            const priority = {
                "Out of Stock": 1,
                "Critical": 2,
                "Low Stock": 3,
                "Healthy": 4
            };

            return priority[a.status] -
                   priority[b.status];

        });

    inventoryTable.innerHTML =
        sortedInventory.map(product => {

            let statusClass = "healthy";

            if (product.status === "Out of Stock") {
                statusClass = "out";
            }
            else if (product.status === "Critical") {
                statusClass = "critical";
            }
            else if (product.status === "Low Stock") {
                statusClass = "low";
            }

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>
                    </td>

                    <td>
                        ${product.stock}
                    </td>

                    <td>
                        TZS ${product.stockValue.toLocaleString("en-TZ")}
                    </td>

                    <td>
                        ${product.unitsSold}
                    </td>

                    <td>
                        <span class="inventory-status ${statusClass}">
                            ${product.status}
                        </span>
                    </td>

                </tr>
            `;

        }).join("");

}

// =============================
// PROFIT & FINANCIAL INTELLIGENCE
// =============================

let revenueProfitChart = null;

function updateFinancialIntelligence() {

    const revenueElement =
        document.getElementById("financialRevenue");

    const cogsElement =
        document.getElementById("financialCOGS");

    const profitElement =
        document.getElementById("financialProfit");

    const marginElement =
        document.getElementById("financialMargin");

    const discountsElement =
        document.getElementById("financialDiscounts");

    const ordersElement =
        document.getElementById("financialOrders");

    const averageSaleElement =
        document.getElementById("financialAverageSale");

    const grossRevenueElement =
        document.getElementById("financialGrossRevenue");

    const todayProfitElement =
         document.getElementById("financialTodayProfit");

    const monthProfitElement =
          document.getElementById("financialMonthProfit");

    if (!revenueElement) {
        return;
    }

    const analyticsOrders =
        getAnalyticsOrders();


    const now = new Date();

    const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(
         now.getFullYear(),
          now.getMonth(),
          1
    );

    let todayProfit = 0;
    let monthProfit = 0;

    analyticsOrders.forEach(order => {

    const orderDate =
        new Date(order.createdAt);

    const orderProfit =
        Number(order.totalProfit || 0);

       if (orderDate >= todayStart) {
        todayProfit += orderProfit;
      }

      if (orderDate >= monthStart) {
        monthProfit += orderProfit;
     }

    });


// --------------------------------
// Revenue
// --------------------------------

let revenue = 0;
let discounts = 0;
let grossRevenue = 0;
let cogs = 0;

const productFinancials = {};

analyticsOrders.forEach(order => {

    const total =
        Number(order.totalPrice || 0);

    const discount =
        Number(order.discount || 0);

    revenue += total;
    discounts += discount;
    grossRevenue += total + discount;

    if (!Array.isArray(order.products)) {
        return;
    }

    order.products.forEach(item => {

        const quantity =
            Number(item.quantity || 0);

        const sellingPrice =
            Number(item.price || 0);

        const product =
            item.product &&
            typeof item.product === "object"
                ? item.product
                : null;

        const costPrice =
            Number(
                item.costPrice ??
                product?.costPrice ??
                product?.purchasePrice ??
                product?.buyingPrice ??
                product?.cost ??
                0
            );

        const productRevenue =
            sellingPrice * quantity;

        const productCost =
            costPrice * quantity;

        const productProfit =
            productRevenue - productCost;

        const productKey =
            product?._id ||
            item.product ||
            item.name ||
            "unknown";

        const productName =
            item.name ||
            product?.name ||
            "Unknown Product";

        if (!productFinancials[productKey]) {

            productFinancials[productKey] = {
                name: productName,
                revenue: 0,
                cost: 0,
                profit: 0,
                quantity: 0
            };

        }

        productFinancials[productKey].revenue +=
            productRevenue;

        productFinancials[productKey].cost +=
            productCost;

        productFinancials[productKey].profit +=
            productProfit;

        productFinancials[productKey].quantity +=
            quantity;

        cogs += productCost;

    });

});

const profit =
    analyticsOrders.reduce(
        (sum, order) =>
            sum + Number(order.totalProfit || 0),
        0
    );

const margin =
    revenue > 0
        ? (profit / revenue) * 100
        : 0;

const orderCount =
    analyticsOrders.length;

const averageSale =
    orderCount > 0
        ? revenue / orderCount
        : 0;

        // ========================================
// PROFIT INTELLIGENCE METRICS
// ========================================

const profitPerOrder =
    orderCount > 0
        ? profit / orderCount
        : 0;


// Monthly profit target
let profitTarget =
    Number(
        localStorage.getItem(
            "bionicMonthlyProfitTarget"
        )
    );

if (
    !profitTarget ||
    profitTarget <= 0
) {
    profitTarget = 1000000;
}


// Current month profit progress
const profitTargetProgress =
    profitTarget > 0
        ? (monthProfit / profitTarget) * 100
        : 0;


    // --------------------------------
    // Summary
    // --------------------------------

    revenueElement.textContent =
        `TZS ${revenue.toLocaleString("en-TZ")}`;

    cogsElement.textContent =
        `TZS ${cogs.toLocaleString("en-TZ")}`;

    profitElement.textContent =
        `TZS ${profit.toLocaleString("en-TZ")}`;

    marginElement.textContent =
        `${margin.toFixed(1)}%`;

    discountsElement.textContent =
        `TZS ${discounts.toLocaleString("en-TZ")}`;

    ordersElement.textContent =
        orderCount;

    averageSaleElement.textContent =
        `TZS ${averageSale.toLocaleString("en-TZ")}`;

    grossRevenueElement.textContent =
        `TZS ${grossRevenue.toLocaleString("en-TZ")}`;

    if (todayProfitElement) {
    todayProfitElement.textContent =
        `TZS ${todayProfit.toLocaleString("en-TZ")}`;
    }

    if (monthProfitElement) {
         monthProfitElement.textContent =
              `TZS ${monthProfit.toLocaleString("en-TZ")}`;
    }
          
                updateProfitByDay();



    const profitPerOrderElement =
    document.getElementById(
        "financialProfitPerOrder"
    );

if (profitPerOrderElement) {

    profitPerOrderElement.textContent =
        `TZS ${Math.round(
            profitPerOrder
        ).toLocaleString("en-TZ")}`;

}


const profitTargetElement =
    document.getElementById(
        "financialProfitTarget"
    );

if (profitTargetElement) {

    profitTargetElement.textContent =
        `TZS ${profitTarget.toLocaleString(
            "en-TZ"
        )}`;

}


const profitTargetProgressElement =
    document.getElementById(
        "financialProfitTargetProgress"
    );

if (profitTargetProgressElement) {

    profitTargetProgressElement.textContent =
        `${profitTargetProgress.toFixed(1)}%`;

    profitTargetProgressElement.style.color =
        profitTargetProgress >= 100
            ? "#16a34a"
            : "#2563eb";

}



function saveMonthlyProfitTarget() {

    const input =
        document.getElementById(
            "monthlyProfitTargetInput"
        );

    if (!input) {
        return;
    }

    const target =
        Number(input.value);

    if (
        !target ||
        target <= 0
    ) {

        alert(
            "Please enter a valid monthly profit target."
        );

        return;
    }

    localStorage.setItem(
        "bionicMonthlyProfitTarget",
        target
    );

    updateFinancialIntelligence();

    alert(
        "Monthly profit target saved successfully."
    );

}




    // --------------------------------
    // Most profitable products
    // --------------------------------

    const profitableProducts =
        Object.values(productFinancials)
            .filter(product =>
                product.profit > 0
            )
            .sort((a, b) =>
                b.profit - a.profit
            )
            .slice(0, 5);

    const profitableContainer =
        document.getElementById(
            "mostProfitableProducts"
        );

    if (profitableContainer) {

        if (profitableProducts.length === 0) {

            profitableContainer.innerHTML = `
                <p class="empty-state">
                    No profit data available yet.
                </p>
            `;

        } else {

            profitableContainer.innerHTML =
                profitableProducts.map(
                    (product, index) => `
                        <div class="financial-product-row">

                            <div class="financial-rank">
                                #${index + 1}
                            </div>

                            <div class="financial-product-info">

                                <strong>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </strong>

                                <span>
                                    ${product.quantity}
                                    units sold
                                </span>

                            </div>

                            <strong>
                                TZS ${product.profit.toLocaleString("en-TZ")}
                            </strong>

                        </div>
                    `
                ).join("");

        }

    }


    // =============================
// PROFIT BY DAY
// =============================

function updateProfitByDay() {

    const chart =
        document.getElementById("profitByDayChart");

    if (!chart) {
        return;
    }

    const analyticsOrders =
        getAnalyticsOrders();

    const dailyProfit = {};

    // Create the selected number of days
    const days =
         Number(selectedAnalyticsDays || 7);

    const today =
          new Date();

        today.setHours(0, 0, 0, 0);

        for (let i = days - 1; i >= 0; i--) {

        const date =
            new Date(today);

        date.setDate(
            today.getDate() - i
        );

        const dateKey =
            date.toISOString().split("T")[0];

        dailyProfit[dateKey] = 0;
    }

    // Add profit from orders
    if (analyticsOrders && analyticsOrders.length > 0) {

        analyticsOrders.forEach(order => {

            const orderDate =
                new Date(order.createdAt);

            orderDate.setHours(0, 0, 0, 0);

            const dateKey =
                orderDate.toISOString().split("T")[0];

            if (dailyProfit[dateKey] !== undefined) {

                dailyProfit[dateKey] +=
                    Number(order.totalProfit || 0);

            }

        });

    }

    const dateKeys =
        Object.keys(dailyProfit);

    const maxProfit =
        Math.max(
            ...dateKeys.map(
                day => dailyProfit[day]
            ),
            1
        );

    chart.innerHTML = "";

    dateKeys.forEach(day => {

        const profit =
            dailyProfit[day];

        const column =
            document.createElement("div");

        column.className =
            "profit-day-column";

        const value =
            document.createElement("div");

        value.className =
            "profit-day-value";

        value.textContent =
            `TZS ${profit.toLocaleString("en-TZ")}`;

        const bar =
            document.createElement("div");

        bar.className =
            "profit-day-bar";

        const barHeight =
            profit > 0
                ? (profit / maxProfit) * 180
                : 4;

        bar.style.height =
            `${Math.max(barHeight, 4)}px`;

        // Show zero-profit days clearly
        if (profit === 0) {
            bar.style.opacity = "0.25";
        }

        const label =
            document.createElement("div");

        label.className =
            "profit-day-label";

        const displayDate =
            new Date(day + "T00:00:00");

        label.textContent =
            displayDate.toLocaleDateString(
                "en-TZ",
                {
                    weekday: "short",
                    day: "numeric"
                }
            );

        column.appendChild(value);
        column.appendChild(bar);
        column.appendChild(label);

        chart.appendChild(column);

    });

}

const profitTargetInput =
    document.getElementById(
        "monthlyProfitTargetInput"
    );

if (
    profitTargetInput &&
    !profitTargetInput.value
) {

    profitTargetInput.value =
        profitTarget;

}


// ========================================
// BUSINESS DECISION CENTER
// ========================================

function updateBusinessDecisionCenter() {

    const promoteContainer =
        document.getElementById(
            "productsToPromote"
        );

    const watchContainer =
        document.getElementById(
            "productsToWatch"
        );

    const reviewContainer =
        document.getElementById(
            "productsToReview"
        );

    const restockContainer =
        document.getElementById(
            "restockPriority"
        );

    const opportunityContainer =
        document.getElementById(
            "profitOpportunities"
        );

    if (
        !promoteContainer ||
        !watchContainer ||
        !reviewContainer ||
        !restockContainer ||
        !opportunityContainer
    ) {
        return;
    }


    // ========================================
    // BUILD PRODUCT PERFORMANCE DATA
    // ========================================

    const productStats = {};


    dashboardOrders.forEach(order => {

        if (
            order.status === "Cancelled"
        ) {
            return;
        }

        if (
            !Array.isArray(order.products)
        ) {
            return;
        }


        order.products.forEach(item => {

            const productId =
                item.product?._id ||
                item.product ||
                item.productId ||
                item._id ||
                item.name;


            if (!productId) {
                return;
            }


            const name =
                item.name ||
                item.productName ||
                "Unknown Product";


            const quantity =
                Number(
                    item.quantity || 0
                );


            const sellingPrice =
                Number(
                    item.price || 0
                );


            const costPrice =
                Number(
                    item.costPrice ||
                    item.product?.costPrice ||
                    0
                );


            const revenue =
                sellingPrice *
                quantity;


            const cost =
                costPrice *
                quantity;


            const profit =
                revenue -
                cost;


            const key =
                String(productId);


            if (
                !productStats[key]
            ) {

                productStats[key] = {

                    name,

                    unitsSold: 0,

                    revenue: 0,

                    cost: 0,

                    profit: 0

                };

            }


            productStats[key].unitsSold +=
                quantity;


            productStats[key].revenue +=
                revenue;


            productStats[key].cost +=
                cost;


            productStats[key].profit +=
                profit;

        });

    });


    // ========================================
    // ADD CURRENT STOCK
    // ========================================

    const products =
        Object.values(
            productStats
        ).map(product => {

            const databaseProduct =
                dashboardProducts.find(
                    item => {

                        const productName =
                            String(
                                item.name || ""
                            ).toLowerCase();

                        return (
                            productName ===
                            String(
                                product.name
                            ).toLowerCase()
                        );

                    }
                );


            const stock =
                Number(
                    databaseProduct?.stock || 0
                );


            const margin =
                product.revenue > 0
                    ? (
                        product.profit /
                        product.revenue
                    ) * 100
                    : 0;


            return {

                ...product,

                stock,

                margin

            };

        });


    // ========================================
    // PRODUCTS TO PROMOTE
    // ========================================

    const promote =
        products
            .filter(product =>
                product.unitsSold >= 2 &&
                product.profit > 0 &&
                product.margin >= 20
            )
            .sort(
                (a, b) =>
                    b.profit - a.profit
            )
            .slice(0, 5);


    // ========================================
    // PRODUCTS TO WATCH
    // ========================================

    const watch =
        products
            .filter(product =>
                product.unitsSold > 0 &&
                product.margin < 20
            )
            .sort(
                (a, b) =>
                    a.margin - b.margin
            )
            .slice(0, 5);


    // ========================================
    // PRODUCTS TO REVIEW
    // ========================================

    const review =
        products
            .filter(product =>
                product.unitsSold <= 1 ||
                product.profit <= 0
            )
            .sort(
                (a, b) =>
                    a.profit - b.profit
            )
            .slice(0, 5);


    // ========================================
    // RESTOCK PRIORITY
    // ========================================

    const restock =
        products
            .filter(product =>
                product.stock <= 5 &&
                product.unitsSold > 0
            )
            .sort(
                (a, b) => {

                    const scoreA =
                        a.unitsSold /
                        Math.max(
                            a.stock,
                            1
                        );

                    const scoreB =
                        b.unitsSold /
                        Math.max(
                            b.stock,
                            1
                        );

                    return scoreB - scoreA;

                }
            )
            .slice(0, 5);


    // ========================================
    // PROFIT OPPORTUNITIES
    // ========================================

    const opportunities =
        products
            .filter(product =>
                product.revenue > 0 &&
                product.margin < 30
            )
            .sort(
                (a, b) =>
                    b.revenue - a.revenue
            )
            .slice(0, 5);


    // ========================================
    // UPDATE COUNTERS
    // ========================================

    setText(
        "productsToPromoteCount",
        promote.length
    );

    setText(
        "productsToWatchCount",
        watch.length
    );

    setText(
        "productsToReviewCount",
        review.length
    );

    setText(
        "restockPriorityCount",
        restock.length
    );


    // ========================================
    // RENDER HELPER
    // ========================================

    function renderProducts(
        container,
        list,
        type
    ) {

        if (
            !list ||
            list.length === 0
        ) {

            container.innerHTML = `
                <p class="empty-state">
                    No products currently identified.
                </p>
            `;

            return;

        }


        container.innerHTML =
            list.map(
                product => `

                    <div class="decision-product-row">

                        <div class="decision-product-info">

                            <strong>
                                ${escapeHTML(
                                    product.name
                                )}
                            </strong>

                            <span>
                                ${product.unitsSold}
                                units sold
                            </span>

                        </div>


                        <div class="decision-product-metrics">

                            <strong>
                                TZS ${Math.round(
                                    product.profit
                                ).toLocaleString(
                                    "en-TZ"
                                )}
                            </strong>

                            <span>
                                ${product.margin.toFixed(
                                    1
                                )}% margin
                            </span>

                        </div>

                    </div>

                `
            ).join("");

    }


    renderProducts(
        promoteContainer,
        promote,
        "promote"
    );


    renderProducts(
        watchContainer,
        watch,
        "watch"
    );


    renderProducts(
        reviewContainer,
        review,
        "review"
    );


    // ========================================
    // RESTOCK RENDER
    // ========================================

    if (
        restock.length === 0
    ) {

        restockContainer.innerHTML = `
            <p class="empty-state">
                ✅ No urgent restocking opportunities detected.
            </p>
        `;

    } else {

        restockContainer.innerHTML =
            restock.map(
                product => `

                    <div class="decision-product-row">

                        <div class="decision-product-info">

                            <strong>
                                ${escapeHTML(
                                    product.name
                                )}
                            </strong>

                            <span>
                                ${product.unitsSold}
                                units sold
                            </span>

                        </div>

                        <div class="decision-product-metrics">

                            <strong>
                                ${product.stock}
                                left
                            </strong>

                            <span>
                                TZS ${Math.round(
                                    product.profit
                                ).toLocaleString(
                                    "en-TZ"
                                )}
                                profit
                            </span>

                        </div>

                    </div>

                `
            ).join("");

    }


    // ========================================
    // PROFIT OPPORTUNITIES
    // ========================================

    if (
        opportunities.length === 0
    ) {

        opportunityContainer.innerHTML = `
            <p class="empty-state">
                No major margin opportunities detected.
            </p>
        `;

    } else {

        opportunityContainer.innerHTML =
            opportunities.map(
                product => `

                    <div class="profit-opportunity-row">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    product.name
                                )}
                            </strong>

                            <span>
                                Revenue:
                                TZS ${Math.round(
                                    product.revenue
                                ).toLocaleString(
                                    "en-TZ"
                                )}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${product.margin.toFixed(
                                    1
                                )}%
                            </strong>

                            <span>
                                Current margin
                            </span>

                        </div>

                    </div>

                `
            ).join("");

    }

}


    // --------------------------------
    // Low-margin products
    // --------------------------------

    const lowMarginProducts =
        Object.values(productFinancials)
            .filter(product =>
                product.revenue > 0
            )
            .map(product => {

                const productMargin =
                    (
                        product.profit /
                        product.revenue
                    ) * 100;

                return {
                    ...product,
                    margin: productMargin
                };

            })
            .filter(product =>
                product.margin < 20
            )
            .sort((a, b) =>
                a.margin - b.margin
            )
            .slice(0, 5);

    const lowMarginContainer =
        document.getElementById(
            "lowMarginProducts"
        );

    if (lowMarginContainer) {

        if (lowMarginProducts.length === 0) {

            lowMarginContainer.innerHTML = `
                <p class="empty-state">
                    ✅ No low-margin products detected.
                </p>
            `;

        } else {

            lowMarginContainer.innerHTML =
                lowMarginProducts.map(
                    product => `
                        <div class="financial-product-row">

                            <div class="financial-warning">
                                ⚠️
                            </div>

                            <div class="financial-product-info">

                                <strong>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </strong>

                                <span>
                                    Profit:
                                    TZS ${product.profit.toLocaleString("en-TZ")}
                                </span>

                            </div>

                            <strong>
                                ${product.margin.toFixed(1)}%
                            </strong>

                        </div>
                    `
                ).join("");

        }

    }

    // --------------------------------
    // Financial insight
    // --------------------------------

    const insight =
        document.getElementById(
            "financialInsightMessage"
        );

    if (insight) {

        if (revenue === 0) {

            insight.textContent =
                "No sales revenue is available for the selected period yet.";

        } else if (cogs === 0) {

            insight.textContent =
                "Revenue is available, but product cost prices have not been recorded yet. Add cost prices to calculate real profit.";

        } else if (margin < 10) {

            insight.textContent =
                `⚠️ Estimated profit margin is only ${margin.toFixed(1)}%. Review product pricing and costs.`;

        } else if (margin < 20) {

            insight.textContent =
                `💡 Estimated profit margin is ${margin.toFixed(1)}%. There may be opportunities to improve pricing or reduce costs.`;

        } else {

            insight.textContent =
                `✅ Estimated profit margin is ${margin.toFixed(1)}%. Your product margins look healthy for the selected period.`;

        }

    }

    // --------------------------------
    // Revenue vs profit chart
    // --------------------------------

    createRevenueProfitChart(
        analyticsOrders
    );

}


// =============================
// REVENUE VS PROFIT CHART
// =============================

function createRevenueProfitChart(orders) {

    const canvas =
        document.getElementById(
            "revenueProfitChart"
        );

    if (!canvas) {
        return;
    }

    const ctx =
        canvas.getContext("2d");

    if (revenueProfitChart) {
        revenueProfitChart.destroy();
    }

    const labels = [];
    const revenueData = [];
    const profitData = [];

    const days =
        Number(selectedAnalyticsDays || 7);

    for (let i = days - 1; i >= 0; i--) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );

        const dayString =
            date.toDateString();

        const dayOrders =
            orders.filter(order =>
                order.createdAt &&
                new Date(
                    order.createdAt
                ).toDateString() === dayString
            );

        let dayRevenue = 0;
        let dayCost = 0;

        dayOrders.forEach(order => {

            dayRevenue +=
                Number(
                    order.totalPrice || 0
                );

            if (!Array.isArray(order.products)) {
                return;
            }

            order.products.forEach(item => {

                const quantity =
                    Number(item.quantity || 0);

                const sellingPrice =
                    Number(item.price || 0);

                const product =
                    item.product &&
                    typeof item.product === "object"
                        ? item.product
                        : null;

                const costPrice =
                    Number(
                        product?.costPrice ??
                        product?.purchasePrice ??
                        product?.buyingPrice ??
                        product?.cost ??
                        0
                    );

                dayCost +=
                    costPrice * quantity;

            });

        });

        labels.push(
            date.toLocaleDateString(
                "en-TZ",
                {
                    month: "short",
                    day: "numeric"
                }
            )
        );

        revenueData.push(dayRevenue);

        profitData.push(
            dayRevenue - dayCost
        );

    }

    revenueProfitChart =
        new Chart(
            ctx,
            {
                type: "line",

                data: {
                    labels,

                    datasets: [

                        {
                            label: "Revenue",
                            data: revenueData,
                            tension: 0.35,
                            fill: false,
                            borderWidth: 3
                        },

                        {
                            label: "Profit",
                            data: profitData,
                            tension: 0.35,
                            fill: false,
                            borderWidth: 3
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            position: "bottom"
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            context.dataset.label +
                                            ": TZS " +
                                            Number(
                                                context.raw || 0
                                            ).toLocaleString("en-TZ")
                                        );

                                    }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    function(value) {

                                        return (
                                            "TZS " +
                                            Number(
                                                value
                                            ).toLocaleString("en-TZ")
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}



