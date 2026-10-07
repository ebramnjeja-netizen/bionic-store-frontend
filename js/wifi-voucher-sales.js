const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let voucherSales = [];


/* ========================================
   LOAD SALES HISTORY
======================================== */

async function loadVoucherSalesHistory() {

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
                "Failed to load voucher history."
            );

        }


        /*
        The API returns all vouchers.
        We only keep sold vouchers.
        */

        if (Array.isArray(data)) {

            voucherSales =
                data.filter(
                    voucher =>
                        voucher.status === "Sold"
                );

        } else {

            voucherSales = [];

        }


        updateSalesSummary();

        renderVoucherSales(
            voucherSales
        );


    } catch (error) {

        console.error(
            "Voucher sales history error:",
            error
        );

        showSalesMessage(
            "❌ Failed to load voucher sales history."
        );

    }

}


/* ========================================
   RENDER SALES
======================================== */

function renderVoucherSales(records) {

    const tableBody =
        document.getElementById(
            "voucherSalesTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (
        !records ||
        records.length === 0
    ) {

        showSalesMessage(
            "No voucher sales found."
        );

        return;

    }


    showSalesMessage("");


    records.forEach(
        voucher => {

            const row =
                document.createElement("tr");


            const saleDate =
                voucher.soldAt ||
                voucher.updatedAt ||
                voucher.createdAt;


            row.innerHTML = `

                <td>
                    <span class="voucher-code">
                        ${escapeHtml(
                            voucher.code || "-"
                        )}
                    </span>
                </td>


                <td>
                    ${escapeHtml(
                        voucher.packageName || "-"
                    )}
                    <br>
                    <small>
                        ${voucher.duration || 0}
                        ${escapeHtml(
                            voucher.durationUnit || ""
                        )}
                    </small>
                </td>


                <td>
                    ${escapeHtml(
                        voucher.customerName ||
                        "Walk-in Customer"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        voucher.customerPhone ||
                        "-"
                    )}
                </td>


                <td>
                    TZS ${formatMoney(
                        voucher.price
                    )}
                </td>


                <td>
                    TZS ${formatMoney(
                        voucher.amountReceived
                    )}
                </td>


                <td>
                    TZS ${formatMoney(
                        voucher.changeAmount
                    )}
                </td>


                <td>
                    <span class="payment-method">
                        ${escapeHtml(
                            voucher.paymentMethod ||
                            "Cash"
                        )}
                    </span>
                </td>


                <td>
                    ${
                        saleDate
                            ? new Date(
                                saleDate
                              ).toLocaleString()
                            : "-"
                    }
                </td>


                <td>
                    <span class="status-sold">
                        SOLD
                    </span>
                </td>

            `;


            tableBody.appendChild(row);

        }
    );

}


/* ========================================
   SUMMARY
======================================== */

function updateSalesSummary() {

    const total =
        voucherSales.length;


    const revenue =
        voucherSales.reduce(
            (sum, voucher) =>
                sum +
                (
                    Number(
                        voucher.price
                    ) || 0
                ),
            0
        );


    const received =
        voucherSales.reduce(
            (sum, voucher) =>
                sum +
                (
                    Number(
                        voucher.amountReceived
                    ) || 0
                ),
            0
        );


    const change =
        voucherSales.reduce(
            (sum, voucher) =>
                sum +
                (
                    Number(
                        voucher.changeAmount
                    ) || 0
                ),
            0
        );


    document.getElementById(
        "totalVoucherSales"
    ).textContent =
        total;


    document.getElementById(
        "totalVoucherRevenue"
    ).textContent =
        "TZS " +
        formatMoney(revenue);


    document.getElementById(
        "totalVoucherReceived"
    ).textContent =
        "TZS " +
        formatMoney(received);


    document.getElementById(
        "totalVoucherChange"
    ).textContent =
        "TZS " +
        formatMoney(change);

}


/* ========================================
   SEARCH + FILTER
======================================== */

function filterVoucherSales() {

    const searchInput =
        document.getElementById(
            "voucherSalesSearch"
        );


    const paymentFilter =
        document.getElementById(
            "voucherPaymentFilter"
        );


    const keyword =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const payment =
        paymentFilter
            ? paymentFilter.value
            : "";


    const filtered =
        voucherSales.filter(
            voucher => {

                const code =
                    String(
                        voucher.code || ""
                    ).toLowerCase();


                const customer =
                    String(
                        voucher.customerName || ""
                    ).toLowerCase();


                const phone =
                    String(
                        voucher.customerPhone || ""
                    ).toLowerCase();


                const matchesSearch =
                    code.includes(keyword) ||
                    customer.includes(keyword) ||
                    phone.includes(keyword);


                const matchesPayment =
                    !payment ||
                    voucher.paymentMethod ===
                        payment;


                return (
                    matchesSearch &&
                    matchesPayment
                );

            }
        );


    renderVoucherSales(filtered);

}


/* ========================================
   MESSAGE
======================================== */

function showSalesMessage(text) {

    const element =
        document.getElementById(
            "voucherSalesMessage"
        );


    if (element) {

        element.textContent =
            text;

    }

}


/* ========================================
   MONEY FORMAT
======================================== */

function formatMoney(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-TZ"
    );

}


/* ========================================
   SAFE HTML
======================================== */

function escapeHtml(value) {

    return String(
        value ?? ""
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


/* ========================================
   PAGE READY
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Wi-Fi Voucher Sales History ready."
        );


        const search =
            document.getElementById(
                "voucherSalesSearch"
            );


        const payment =
            document.getElementById(
                "voucherPaymentFilter"
            );


        if (search) {

            search.addEventListener(
                "input",
                filterVoucherSales
            );

        }


        if (payment) {

            payment.addEventListener(
                "change",
                filterVoucherSales
            );

        }


        loadVoucherSalesHistory();

    }
);