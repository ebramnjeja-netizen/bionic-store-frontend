const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let salesChart = null;

function formatMoney(amount) {
    return `TZS ${Number(amount || 0).toLocaleString("en-TZ")}`;
}

function getDateString(date) {
    return date.toISOString().split("T")[0];
}

function getDateRange(range) {

    const today = new Date();

    let startDate = new Date(today);
    let endDate = new Date(today);

    if (range === "today") {

        startDate = new Date(today);

    }

    else if (range === "week") {

        const day = today.getDay();

        const difference = day === 0 ? 6 : day - 1;

        startDate.setDate(
            today.getDate() - difference
        );

    }

    else if (range === "month") {

        startDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

    }

    else if (range === "year") {

        startDate = new Date(
            today.getFullYear(),
            0,
            1
        );

    }

    else if (range === "custom") {

        const startInput =
            document.getElementById("reportStartDate");

        const endInput =
            document.getElementById("reportEndDate");

        if (!startInput.value || !endInput.value) {

            alert("Please select both start and end dates.");

            return null;

        }

        if (startInput.value > endInput.value) {

            alert("Start date cannot be after end date.");

            return null;

        }

        return {
            startDate: startInput.value,
            endDate: endInput.value
        };

    }

    return {
        startDate: getDateString(startDate),
        endDate: getDateString(endDate)
    };

}


async function loadReports(startDate = null, endDate = null) {

    const token = localStorage.getItem("token");

    try {

        let url = `${API_BASE_URL}/reports`;

        if (startDate && endDate) {

            url +=
                `?startDate=${encodeURIComponent(startDate)}` +
                `&endDate=${encodeURIComponent(endDate)}`;

        }

        const response = await fetch(url, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load reports"
            );

        }


        // ==============================
        // SUMMARY
        // ==============================

        document.getElementById("totalRevenue").textContent =
            formatMoney(
                data.business?.totalRevenue
            );

        document.getElementById("totalOrders").textContent =
            data.totalOrders || 0;

        document.getElementById("totalProducts").textContent =
            data.totalProducts || 0;

        document.getElementById("totalUsers").textContent =
            data.totalUsers || 0;

         document.getElementById("totalExpenses").textContent =
              formatMoney(data.business?.totalExpenses);

        document.getElementById("netProfit").textContent =
               formatMoney(data.business?.netProfit);

        document.getElementById("profitMargin").textContent =
             `${Number(data.business?.profitMargin || 0).toLocaleString("en-TZ")}%`;

        // ==============================
        // SALES CHART
        // ==============================

        const chartCanvas =
            document.getElementById("salesChart");

        if (chartCanvas) {

            if (salesChart) {
                salesChart.destroy();
            }

            salesChart = new Chart(
                chartCanvas,
                {

                    type: "bar",

                    data: {

                        labels:
                            (data.topProducts || []).map(
                                product => product._id
                            ),

                        datasets: [{

                            label: "Units Sold",

                            data:
                                (data.topProducts || []).map(
                                    product =>
                                        product.quantitySold
                                ),

                            borderWidth: 1

                        }]

                    },

                    options: {

                        responsive: true,

                        scales: {

                            y: {
                                beginAtZero: true
                            }

                        }

                    }

                }
            );

        }


        // ==============================
// REVENUE VS PROFIT CHART
// ==============================

const revenueProfitCanvas =
    document.getElementById("revenueProfitChart");

if (revenueProfitCanvas) {

    if (
          window.revenueProfitChart &&
         typeof window.revenueProfitChart.destroy === "function"
    ) {
          window.revenueProfitChart.destroy();
    }
    
    window.revenueProfitChart =
        new Chart(
            revenueProfitCanvas,
            {
                type: "line",

                data: {

                    labels:
                        (data.revenueProfitData || []).map(
                            item => item._id
                        ),

                    datasets: [

                        {
                            label: "Revenue",

                            data:
                                (data.revenueProfitData || []).map(
                                    item =>
                                        Number(item.revenue || 0)
                                ),

                            borderWidth: 2,

                            tension: 0.3
                        },

                        {
                            label: "Net Profit",

                            data:
                                (data.revenueProfitData || []).map(
                                    item =>
                                        Number(item.profit || 0)
                                ),

                            borderWidth: 2,

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

                    },

                    plugins: {

                        tooltip: {

                            callbacks: {

                                label: function(context) {

                                    return context.dataset.label +
                                        ": TZS " +
                                        Number(context.raw)
                                            .toLocaleString("en-TZ");

                                }

                            }

                        }

                    }

                }

            }
        );

}

        // ==============================
        // TOP PRODUCTS
        // ==============================

        const topBody =
            document.querySelector(
                "#topProducts tbody"
            );

        if (topBody) {

            topBody.innerHTML = "";

            if (!data.topProducts?.length) {

                topBody.innerHTML = `
                    <tr>
                        <td colspan="2">
                            No sales found for this period.
                        </td>
                    </tr>
                `;

            } else {

                data.topProducts.forEach(product => {

                    topBody.innerHTML += `
                        <tr>
                            <td>${product._id}</td>
                            <td>${product.quantitySold}</td>
                        </tr>
                    `;

                });

            }

        }


        // ==============================
        // RECENT ORDERS
        // ==============================

        const recentBody =
            document.querySelector(
                "#recentOrders tbody"
            );

        if (recentBody) {

            recentBody.innerHTML = "";

            if (!data.recentOrders?.length) {

                recentBody.innerHTML = `
                    <tr>
                        <td colspan="3">
                            No orders found for this period.
                        </td>
                    </tr>
                `;

            } else {

                data.recentOrders.forEach(order => {

                    recentBody.innerHTML += `
                        <tr>

                            <td>
                                ${
                                    order.user
                                        ? order.user.name
                                        : "Guest"
                                }
                            </td>

                            <td>
                                ${
                                    order.user
                                        ? order.user.email
                                        : "-"
                                }
                            </td>

                            <td>
                                ${formatMoney(order.totalPrice)}
                            </td>

                        </tr>
                    `;

                });

            }

        }

    } catch (err) {

        console.error(
            "REPORTS ERROR:",
            err
        );

        alert(
            err.message ||
            "Failed to load reports"
        );

    }

}


function printReport() {
    window.print();
}


function exportReportCSV() {

    const rows = [];

    rows.push([
        "Bionic Store Business Report"
    ]);

    rows.push([]);

    rows.push([
        "Total Revenue",
        document.getElementById("totalRevenue")?.textContent || "TZS 0"
    ]);

    rows.push([
        "Total Orders",
        document.getElementById("totalOrders")?.textContent || "0"
    ]);

    rows.push([
        "Total Products",
        document.getElementById("totalProducts")?.textContent || "0"
    ]);

    rows.push([
        "Total Customers",
        document.getElementById("totalUsers")?.textContent || "0"
    ]);

    rows.push([
        "Total Expenses",
        document.getElementById("totalExpenses")?.textContent || "TZS 0"
    ]);

    rows.push([
        "Net Profit",
        document.getElementById("netProfit")?.textContent || "TZS 0"
    ]);

    rows.push([
        "Profit Margin",
        document.getElementById("profitMargin")?.textContent || "0%"
    ]);

    rows.push([]);

    rows.push([
        "Top Selling Products"
    ]);

    rows.push([
        "Product",
        "Units Sold"
    ]);

    document
        .querySelectorAll("#topProducts tbody tr")
        .forEach(row => {

            const cells = row.querySelectorAll("td");

            if (cells.length >= 2) {

                rows.push([
                    cells[0].textContent.trim(),
                    cells[1].textContent.trim()
                ]);

            }

        });


    rows.push([]);

    rows.push([
        "Recent Orders"
    ]);

    rows.push([
        "Customer",
        "Email",
        "Total"
    ]);

    document
        .querySelectorAll("#recentOrders tbody tr")
        .forEach(row => {

            const cells = row.querySelectorAll("td");

            if (cells.length >= 3) {

                rows.push([
                    cells[0].textContent.trim(),
                    cells[1].textContent.trim(),
                    cells[2].textContent.trim()
                ]);

            }

        });


    const csv = rows
        .map(row =>
            row.map(value =>
                `"${String(value).replace(/"/g, '""')}"`
            ).join(",")
        )
        .join("\n");


    const blob = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
    );


    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `bionic-store-report-${new Date().toISOString().split("T")[0]}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


function setReportRange(range) {

    const dates =
        getDateRange(range);

    if (!dates) {
        return;
    }

    loadReports(
        dates.startDate,
        dates.endDate
    );

}


// Load all reports initially

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadReports();

    }
);



