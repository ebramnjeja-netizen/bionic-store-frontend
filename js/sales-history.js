const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

const token =
    localStorage.getItem("token");

let allSales = [];


// ========================================
// FORMAT MONEY
// ========================================

function formatMoney(amount) {

    return `TZS ${Number(amount || 0)
        .toLocaleString("en-TZ", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}`;

}


// ========================================
// LOAD SALES
// ========================================

async function loadSales() {

    const tbody =
        document.getElementById(
            "salesTableBody"
        );

    if (!token) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    Please login first.
                </td>
            </tr>
        `;

        return;

    }


    try {

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
                "Failed to load sales"
            );

        }


        // --------------------------------
        // POS SALES ONLY
        // --------------------------------

        allSales =
            data.filter(
                order =>
                    order.orderType === "POS"
            );


        updateSummary();

        renderSales();


    } catch (error) {

        console.error(
            "SALES HISTORY ERROR:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    Failed to load sales.
                </td>
            </tr>
        `;

    }

}


// ========================================
// UPDATE SUMMARY
// ========================================

function updateSummary() {

    const totalSales =
        allSales.length;


    const totalRevenue =
        allSales.reduce(
            (sum, sale) =>
                sum +
                Number(
                    sale.totalPrice || 0
                ),
            0
        );


    const today =
        new Date();


    const todayString =
        today.toLocaleDateString(
            "en-TZ"
        );


    const todaySales =
        allSales.filter(
            sale =>
                new Date(
                    sale.createdAt
                ).toLocaleDateString(
                    "en-TZ"
                ) === todayString
        ).length;


    document.getElementById(
        "totalSales"
    ).textContent =
        totalSales;


    document.getElementById(
        "totalRevenue"
    ).textContent =
        formatMoney(
            totalRevenue
        );


    document.getElementById(
        "todaySales"
    ).textContent =
        todaySales;

}


// ========================================
// RENDER SALES
// ========================================

function renderSales(
    sales = allSales
) {

    const tbody =
        document.getElementById(
            "salesTableBody"
        );


    if (!sales.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    No POS sales found.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        sales.map(
            sale => {

                const receiptNumber =
                    sale._id
                        ? sale._id
                            .slice(-8)
                            .toUpperCase()
                        : "-";


                const customer =
                    sale.customer &&
                    sale.customer.name
                        ? sale.customer.name
                        : "Walk-in Customer";


                const date =
                    sale.createdAt
                        ? new Date(
                            sale.createdAt
                        ).toLocaleString(
                            "en-TZ"
                        )
                        : "-";


                return `

                    <tr>

                        <td>

                            <a
                                href="pos-receipt.html?id=${sale._id}"
                                class="order-link">

                                <strong>
                                    #${receiptNumber}
                                </strong>

                            </a>

                        </td>


                        <td>
                            ${escapeHTML(
                                customer
                            )}
                        </td>


                        <td>

                            <strong>
                                ${formatMoney(
                                    sale.totalPrice
                                )}
                            </strong>

                        </td>


                        <td>
                            ${escapeHTML(
                                sale.paymentMethod ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${date}
                        </td>


                        <td>

                            <button
                                type="button"
                                onclick="viewSale('${sale._id}')">

                                👁 View

                            </button>


                            <button
                                type="button"
                                onclick="printSale('${sale._id}')">

                                🧾 Receipt

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// ========================================
// VIEW SALE
// ========================================

function viewSale(orderId) {

    window.location.href =
        `order-details.html?id=${orderId}`;

}


// ========================================
// PRINT RECEIPT
// ========================================

function printSale(orderId) {

    window.location.href =
        `pos-receipt.html?id=${orderId}`;

}

// ========================================
// SEARCH + PAYMENT + DATE FILTER
// ========================================

function filterSales() {

    const searchValue =
        document.getElementById("salesSearch").value
            .toLowerCase()
            .trim();

    const paymentValue =
        document.getElementById("paymentFilter").value;

    const dateValue =
        document.getElementById("dateFilter").value;

    const now = new Date();

    const filtered = allSales.filter(sale => {

        const customerName =
            sale.customer?.name ||
            sale.user?.name ||
            "Walk-in Customer";

        const receiptNumber =
            sale._id ||
            sale.orderNumber ||
            "";

        const matchesSearch =
            customerName.toLowerCase().includes(searchValue) ||
            receiptNumber.toLowerCase().includes(searchValue);

        const matchesPayment =
            !paymentValue ||
            sale.payment === paymentValue;

        const saleDate = new Date(sale.createdAt);

        let matchesDate = true;

        if (dateValue === "today") {

            matchesDate =
                saleDate.toDateString() === now.toDateString();

        } else if (dateValue === "week") {

            const startOfWeek = new Date(now);

            const day = startOfWeek.getDay();

            const difference =
                day === 0 ? 6 : day - 1;

            startOfWeek.setDate(
                startOfWeek.getDate() - difference
            );

            startOfWeek.setHours(0, 0, 0, 0);

            matchesDate =
                saleDate >= startOfWeek;

        } else if (dateValue === "month") {

            matchesDate =
                saleDate.getMonth() === now.getMonth() &&
                saleDate.getFullYear() === now.getFullYear();
        }

        return (
            matchesSearch &&
            matchesPayment &&
            matchesDate
        );
    });

    // Update table
    renderSales(filtered);

    // Update summary cards
    updateFilteredSummary(filtered);
}

function updateFilteredSummary(sales) {

    const totalSales = sales.length;

    const totalRevenue = sales.reduce(
        (sum, sale) =>
            sum + Number(sale.totalPrice || 0),
        0
    );

    const today = new Date();

    const todaySales = sales.filter(sale => {

        const saleDate = new Date(sale.createdAt);

        return (
            saleDate.toDateString() ===
            today.toDateString()
        );

    }).length;

    document.getElementById("totalSales").textContent =
        totalSales;

    document.getElementById("totalRevenue").textContent =
        formatMoney(totalRevenue);

    document.getElementById("todaySales").textContent =
        todaySales;
}

// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ========================================
// EVENTS
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSales();


        document
            .getElementById(
                "salesSearch"
            )
            .addEventListener(
                "input",
                filterSales
            );


        document
            .getElementById(
                "paymentFilter"
            )
            .addEventListener(
                "change",
                filterSales
            );

         document
             .getElementById(
               "dateFilter"
             )
              .addEventListener(
                  "change",
                 filterSales
             );
    }
);