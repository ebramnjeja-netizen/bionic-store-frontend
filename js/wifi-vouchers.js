const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let vouchersData = [];
let currentSellingVoucher = null;


/* ========================================
   LOAD VOUCHERS
======================================== */

async function loadVouchers() {



    const tableBody =
        document.getElementById("voucherTableBody");

    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Loading vouchers...
                </td>
            </tr>
        `;
    }

    try {

    const token =
        localStorage.getItem("token");

    await fetch(
       "https://bionic-store-backend.onrender.com/api/wifi-vouchers/update-expired",
        {
            method: "POST",

            headers: {
                "Authorization":
                    "Bearer " + token
            }
        }
             );

        } catch (error) {

              console.error(
             "Expiry update error:",
              error
              );

        }

    try {

        const response = await fetch(
            `${API_BASE_URL}/wifi-vouchers`
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load vouchers."
            );

        }

        vouchersData =
            Array.isArray(data)
                ? data
                : [];

        renderVouchers(vouchersData);

        showWifiMessage("");

        updateVoucherStats(vouchersData);

        updateWifiRevenueDashboard(vouchersData);

        updateWifiRevenueChart(vouchersData);

        updateWifiPackageChart(vouchersData);

        updateWifiPaymentChart(vouchersData);

     } catch (error) {

        console.error(
            "Load vouchers error:",
            error
        );

        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        ❌ Failed to load voucher inventory.
                    </td>
                </tr>
            `;

        }

        showWifiMessage(
            "❌ Failed to load voucher inventory."
        );

    }

}

function updateVoucherStats(vouchers) {

    const available =
        vouchers.filter(
            voucher => voucher.status === "Available"
        ).length;

    const sold =
        vouchers.filter(
            voucher => voucher.status === "Sold"
        ).length;

    const active =
        vouchers.filter(
            voucher => voucher.status === "Active"
        ).length;

    const expired =
        vouchers.filter(
            voucher => voucher.status === "Expired"
        ).length;

    const cancelled =
        vouchers.filter(
            voucher => voucher.status === "Cancelled"
        ).length;


    const availableEl =
        document.getElementById("availableCount");

    const soldEl =
        document.getElementById("soldCount");

    const activeEl =
        document.getElementById("activeCount");

    const expiredEl =
        document.getElementById("expiredCount");

    const cancelledEl =
        document.getElementById("cancelledCount");


    if (availableEl)
        availableEl.textContent = available;

    if (soldEl)
        soldEl.textContent = sold;

    if (activeEl)
        activeEl.textContent = active;

    if (expiredEl)
        expiredEl.textContent = expired;

    if (cancelledEl)
        cancelledEl.textContent = cancelled;
}

function formatWifiMoney(amount) {

    return "TZS " +
        Number(amount || 0).toLocaleString();
}


function updateWifiRevenueDashboard(vouchers) {

    const soldVouchers =
        vouchers.filter(
            voucher =>
                voucher.status === "Sold" ||
                voucher.status === "Active" ||
                voucher.status === "Expired"
        );


    const totalRevenue =
        soldVouchers.reduce(
            (total, voucher) =>
                total + Number(voucher.price || 0),
            0
        );


    const now = new Date();


    const startOfDay =
        new Date(now);

    startOfDay.setHours(
        0, 0, 0, 0
    );


    const startOfWeek =
        new Date(now);

    const day =
        startOfWeek.getDay();

    const difference =
        day === 0 ? 6 : day - 1;

    startOfWeek.setDate(
        startOfWeek.getDate() - difference
    );

    startOfWeek.setHours(
        0, 0, 0, 0
    );


    const startOfMonth =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );


    let todayRevenue = 0;
    let weekRevenue = 0;
    let monthRevenue = 0;


    soldVouchers.forEach(voucher => {

        if (!voucher.soldAt) {
            return;
        }


        const soldDate =
            new Date(voucher.soldAt);

        const price =
            Number(voucher.price || 0);


        if (soldDate >= startOfDay) {
            todayRevenue += price;
        }


        if (soldDate >= startOfWeek) {
            weekRevenue += price;
        }


        if (soldDate >= startOfMonth) {
            monthRevenue += price;
        }

    });


    /*
    ========================================
    BEST SELLING PACKAGE
    ========================================
    */

    const packageMap = {};


    soldVouchers.forEach(voucher => {

        const packageName =
            voucher.packageName || "Unknown";

        if (!packageMap[packageName]) {

            packageMap[packageName] = {
                count: 0,
                revenue: 0
            };

        }

        packageMap[packageName].count++;

        packageMap[packageName].revenue +=
            Number(voucher.price || 0);

    });


    let bestPackage = "—";
    let bestCount = 0;


    Object.keys(packageMap).forEach(
        packageName => {

            if (
                packageMap[packageName].count >
                bestCount
            ) {

                bestCount =
                    packageMap[packageName].count;

                bestPackage =
                    packageName;
            }

        }
    );


    /*
    ========================================
    UPDATE PAGE
    ========================================
    */

    const totalRevenueEl =
        document.getElementById(
            "totalWifiRevenue"
        );

    const todayRevenueEl =
        document.getElementById(
            "todayWifiRevenue"
        );

    const weekRevenueEl =
        document.getElementById(
            "weekWifiRevenue"
        );

    const monthRevenueEl =
        document.getElementById(
            "monthWifiRevenue"
        );

    const totalSoldEl =
        document.getElementById(
            "totalWifiSold"
        );

    const bestPackageEl =
        document.getElementById(
            "bestWifiPackage"
        );


    if (totalRevenueEl)
        totalRevenueEl.textContent =
            formatWifiMoney(totalRevenue);

    if (todayRevenueEl)
        todayRevenueEl.textContent =
            formatWifiMoney(todayRevenue);

    if (weekRevenueEl)
        weekRevenueEl.textContent =
            formatWifiMoney(weekRevenue);

    if (monthRevenueEl)
        monthRevenueEl.textContent =
            formatWifiMoney(monthRevenue);

    if (totalSoldEl)
        totalSoldEl.textContent =
            soldVouchers.length;

    if (bestPackageEl)
        bestPackageEl.textContent =
            bestPackage;

}

/* ========================================
   RENDER VOUCHERS
======================================== */

function renderVouchers(vouchers) {

    const tableBody =
        document.getElementById(
            "voucherTableBody"
        );

    if (!tableBody) {

        console.error(
            "voucherTableBody not found."
        );

        return;

    }

    tableBody.innerHTML = "";


    if (!vouchers || vouchers.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    No vouchers found.
                </td>
            </tr>
        `;

        return;

    }


    vouchers.forEach(function (voucher) {

        const row =
            document.createElement("tr");


        const statusClass =
            "status-" +
            String(voucher.status || "available")
                .toLowerCase();


        let actions = "";

            if (voucher.status === "Available") {

          actions = `
              <button
            type="button"
            onclick="openSellVoucherModal('${voucher._id}')"
            style="
                background:#de8855;
                color:blue;
                border:none;
                padding:4px 7px;
                border-radius:5px;
                cursor:pointer;
                margin-left:4px;
            ">
            💰 Sell
             </button>

                <button
            onclick="deleteVoucher('${voucher._id}')"
            style="
                background:#dc2626;
                color:white;
                border:none;
                padding:4px 7px;
                border-radius:5px;
                cursor:pointer;
                margin-left:4px;
            ">
                🗑️ Delete
              </button>

          `;

        } else if (voucher.status === "Sold") {

    actions = `
        <button
            type="button"
            onclick="activateVoucher('${voucher._id}')">
            📶 Activate
        </button>
         `;

        } else if (voucher.status === "Active") {

     actions = `
          <span>
            📶 Active
          </span>
         `;

            } else if (voucher.status === "Expired") {

         actions = `
        <span>
            ❌ Expired
        </span>
          `;

        } else if (voucher.status === "Cancelled") {

         actions = `
        <span>
            🚫 Cancelled
        </span>
         `;
        }


        row.innerHTML = `

            <td>
                <span class="voucher-code">
                    ${voucher.code || "-"}
                </span>
            </td>

            <td>
                ${voucher.packageName || "-"}
            </td>

            <td>
                TSh ${Number(
                    voucher.price || 0
                ).toLocaleString()}
            </td>

            <td>
                ${voucher.duration || "-"}
                ${voucher.durationUnit || ""}
            </td>

            <td>
                <span class="${statusClass}">
                    ${voucher.status || "-"}
                </span>
            </td>

            <td>
                ${
                    voucher.customerName
                        ? voucher.customerName
                        : "-"
                }

                ${
                    voucher.customerPhone
                        ? `<br><small>${voucher.customerPhone}</small>`
                        : ""
                }
            </td>

            <td>
                ${actions}
            </td>

        `;


        tableBody.appendChild(row);

    });

}

async function deleteVoucher(id) {

    const confirmed = confirm(
        "⚠️ Delete this available voucher?\n\n" +
        "This cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `/api/wifi-vouchers/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete voucher."
            );

        }

        alert(
            "✅ Voucher deleted successfully."
        );

        await loadVouchers();

    } catch (error) {

        console.error(
            "Delete voucher error:",
            error
        );

        alert(
            "❌ " + error.message
        );

    }
}

async function activateVoucher(voucherId) {

    const confirmed = confirm(
        "📶 Activate this Wi-Fi voucher?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const token =
            localStorage.getItem("token");

        if (!token) {

            alert(
                "❌ You are not logged in."
            );

            return;
        }

        const response =
            await fetch(
                `/wifi-vouchers/${voucherId}/activate`,
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to activate voucher."
            );
        }

        alert(
            "✅ Voucher activated successfully!"
        );

        await loadVouchers();

    } catch (error) {

        console.error(
            "Voucher activation error:",
            error
        );

        alert(
            "❌ " + error.message
        );
    }
}

/* ========================================
   CREATE VOUCHER
======================================== */

async function createVoucher(event) {

    event.preventDefault();


    const packageName =
        document.getElementById(
            "packageName"
        ).value.trim();


    const price =
        document.getElementById(
            "voucherPrice"
        ).value;


    const duration =
        document.getElementById(
            "voucherDuration"
        ).value;


    const durationUnit =
        document.getElementById(
            "durationUnit"
        ).value;


    if (!packageName) {

        alert(
            "Please enter a package name."
        );

        return;

    }


    if (
        price === "" ||
        Number(price) < 0
    ) {

        alert(
            "Please enter a valid price."
        );

        return;

    }


    if (
        duration === "" ||
        Number(duration) < 1
    ) {

        alert(
            "Please enter a valid duration."
        );

        return;

    }


    const submitButton =
        document.querySelector(
            "#voucherForm button[type='submit']"
        );


    try {

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Creating...";

        }


        const response =
            await fetch(
                `${API_BASE_URL}/wifi-vouchers`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        packageName:
                            packageName,

                        price:
                            Number(price),

                        duration:
                            Number(duration),

                        durationUnit:
                            durationUnit

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create voucher."
            );

        }


        alert(
            "✅ Wi-Fi voucher created successfully!"
        );


        document.getElementById(
            "voucherForm"
        ).reset();


        document.getElementById(
            "durationUnit"
        ).value = "Hours";


        await loadVouchers();


    } catch (error) {

        console.error(
            "Create voucher error:",
            error
        );

        alert(
            "❌ " +
            error.message
        );

    } finally {

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                "➕ Create Voucher";

        }

    }

}


/* ========================================
   SHOW MESSAGE
======================================== */

function showWifiMessage(message) {

    const element =
        document.getElementById(
            "wifiMessage"
        );

    if (element) {

        element.textContent =
            message;

    }

}


/* ========================================
   OPEN SELL MODAL
======================================== */

function openSellVoucherModal(voucherId) {

    const voucher =
        vouchersData.find(function (item) {

            return item._id === voucherId;

        });


    if (!voucher) {

        alert(
            "❌ Voucher not found."
        );

        return;

    }


    if (voucher.status !== "Available") {

        alert(
            `Voucher is already ${voucher.status}.`
        );

        return;

    }


    currentSellingVoucher =
        voucher;


    const code =
        document.getElementById(
            "saleVoucherCode"
        );

    const packageElement =
        document.getElementById(
            "saleVoucherPackage"
        );

    const priceElement =
        document.getElementById(
            "saleVoucherPrice"
        );

    const customerName =
        document.getElementById(
            "saleCustomerName"
        );

    const customerPhone =
        document.getElementById(
            "saleCustomerPhone"
        );

    const amountReceived =
        document.getElementById(
            "saleAmountReceived"
        );

    const modal =
        document.getElementById(
            "sellVoucherModal"
        );


    if (code) {

        code.textContent =
            voucher.code;

    }


    if (packageElement) {

        packageElement.textContent =
            voucher.packageName;

    }


    if (priceElement) {

        priceElement.textContent =
            "TSh " +
            Number(
                voucher.price || 0
            ).toLocaleString();

    }


    if (customerName) {

        customerName.value = "";

    }


    if (customerPhone) {

        customerPhone.value = "";

    }


    if (amountReceived) {

        amountReceived.value =
            voucher.price || 0;

    }


    calculateVoucherChange();


    if (modal) {

        modal.style.display =
            "flex";

    }

}


/* ========================================
   CLOSE SELL MODAL
======================================== */

function closeSellVoucherModal() {

    const modal =
        document.getElementById(
            "sellVoucherModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

    currentSellingVoucher =
        null;

}


/* ========================================
   CALCULATE CHANGE
======================================== */

function calculateVoucherChange() {

    if (!currentSellingVoucher) {

        return;

    }


    const amountInput =
        document.getElementById(
            "saleAmountReceived"
        );


    const changeElement =
        document.getElementById(
            "saleChangeAmount"
        );


    if (!amountInput || !changeElement) {

        return;

    }


    const received =
        Number(
            amountInput.value
        ) || 0;


    const price =
        Number(
            currentSellingVoucher.price
        ) || 0;


    const change =
        Math.max(
            0,
            received - price
        );


    changeElement.textContent =
        "TSh " +
        change.toLocaleString();

}


/* ========================================
   CONFIRM VOUCHER SALE
======================================== */

async function confirmVoucherSale(event) {
       
    const token = localStorage.getItem("token");

        if (!token) {
      alert("Please login first.");
      window.location.href = "login.html";
      return;
                }
    event.preventDefault();


    if (!currentSellingVoucher) {

        alert(
            "❌ No voucher selected."
        );

        return;

    }


    const customerName =
        document.getElementById(
            "saleCustomerName"
        ).value.trim();


    const customerPhone =
        document.getElementById(
            "saleCustomerPhone"
        ).value.trim();


    const paymentMethod =
        document.getElementById(
            "salePaymentMethod"
        ).value;


    const amountReceived =
        Number(
            document.getElementById(
                "saleAmountReceived"
            ).value
        ) || 0;


    const price =
        Number(
            currentSellingVoucher.price
        ) || 0;


    if (amountReceived < price) {

        alert(
            "❌ Amount received is less than voucher price."
        );

        return;

    }


    const confirmed =
        window.confirm(

            "Sell Wi-Fi Voucher?\n\n" +

            "Voucher: " +
            currentSellingVoucher.code +

            "\nPackage: " +
            currentSellingVoucher.packageName +

            "\nPrice: TSh " +
            price.toLocaleString() +

            "\nCustomer: " +
            customerName +

            "\nPhone: " +
            customerPhone +

            "\nPayment: " +
            paymentMethod +

            "\n\nConfirm sale?"

        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(

                `${API_BASE_URL}/wifi-vouchers/${currentSellingVoucher._id}/sell`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                           "Authorization":
                        "Bearer " + token 

                    },

                    body: JSON.stringify({

                        customerName:
                            customerName,

                        customerPhone:
                            customerPhone,

                        paymentMethod:
                            paymentMethod,

                        amountReceived:
                            amountReceived,

                        changeAmount:
                            amountReceived - price

                    })

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "Failed to complete voucher sale."

            );

        }


       // ========================================
// SAVE RECEIPT DATA
// ========================================

        const voucher = data.voucher;

            if (!voucher) {

              throw new Error(
             "Voucher sale completed, but voucher data was not returned."
                  );

            }

        const receiptData = {

                        code:
                           voucher.code || "",

                          packageName:
                          voucher.packageName || "",

                          price:
                           Number(voucher.price) || 0,

                         duration:
                              Number(voucher.duration) || 0,

                         durationUnit:
                              voucher.durationUnit || "Hours",

                         customerName:
                             voucher.customerName ||
                            "Walk-in Customer",

                         customerPhone:
                         voucher.customerPhone || "",

                         paymentMethod:
                         voucher.paymentMethod ||
                         "Cash",

                         amountReceived:
                          Number(
                         voucher.amountReceived
                          ) || 0,

                         changeAmount:
                         Number(
                         voucher.changeAmount
                          ) || 0,

                         createdAt:
                         voucher.soldAt ||
                         new Date().toISOString()

                    };


// ========================================
// STORE RECEIPT
// ========================================

                localStorage.setItem(
                 "wifiVoucherReceipt",
                 JSON.stringify(receiptData)
                    );


                    console.log(
                      "Wi-Fi voucher receipt saved:",
                       receiptData
                        );


// ========================================
// CLOSE SALE MODAL
// ========================================

            closeSellVoucherModal();


// ========================================
// OPEN RECEIPT
// ========================================

            window.location.href =
              "wifi-voucher-receipt.html";


    } catch (error) {

        console.error(
            "Voucher sale error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* ========================================
   ACTIVATE VOUCHER
======================================== */

async function activateVoucher(voucherId) {

    const confirmed =
        window.confirm(
            "Activate this Wi-Fi voucher?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(

                `${API_BASE_URL}/wifi-vouchers/${voucherId}/activate`,

                {
                    method: "PUT",
                      headers: {
                      "Authorization":
                     "Bearer " +
                       localStorage.getItem("token")
                      }
                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "Failed to activate voucher."

            );

        }


        alert(
            "✅ Wi-Fi voucher activated successfully!"
        );


        await loadVouchers();


    } catch (error) {

        console.error(
            "Activate voucher error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* ========================================
   DELETE VOUCHER
======================================== */

async function deleteVoucher(voucherId) {

    const confirmed =
        window.confirm(
            "Delete this Wi-Fi voucher?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(

                `${API_BASE_URL}/wifi-vouchers/${voucherId}`,

                {
                 method: "DELETE",
                 headers: {
                 "Authorization":
                 "Bearer " +
                   localStorage.getItem("token")
                       }
                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "Failed to delete voucher."

            );

        }


        alert(
            "🗑️ Voucher deleted successfully."
        );


        await loadVouchers();


    } catch (error) {

        console.error(
            "Delete voucher error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );

    }

}


/* ========================================
   INITIALIZE
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Wi-Fi Voucher page ready."
        );


        const voucherForm =
            document.getElementById(
                "voucherForm"
            );


        if (voucherForm) {

            voucherForm.addEventListener(
                "submit",
                createVoucher
            );

        }


        const sellForm =
            document.getElementById(
                "sellVoucherForm"
            );


        if (sellForm) {

            sellForm.addEventListener(
                "submit",
                confirmVoucherSale
            );

        }


        const amountInput =
            document.getElementById(
                "saleAmountReceived"
            );


        if (amountInput) {

            amountInput.addEventListener(
                "input",
                calculateVoucherChange
            );

        }


        const modal =
            document.getElementById(
                "sellVoucherModal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        closeSellVoucherModal();

                    }

                }
            );

        }


        loadVouchers();
      

    }
);

let wifiRevenueChart = null;


function updateWifiRevenueChart(vouchers) {

    const soldVouchers = vouchers.filter(
        voucher =>
            voucher.status === "Sold" ||
            voucher.status === "Active" ||
            voucher.status === "Expired"
    );


    const dailySales = {};


    soldVouchers.forEach(voucher => {

        if (!voucher.soldAt) {
            return;
        }


        const date =
            new Date(voucher.soldAt)
                .toISOString()
                .split("T")[0];


        if (!dailySales[date]) {
            dailySales[date] = 0;
        }


        dailySales[date] +=
            Number(voucher.price || 0);

    });


    const dates =
        Object.keys(dailySales).sort();


    const revenue =
        dates.map(
            date => dailySales[date]
        );


    const canvas =
        document.getElementById(
            "wifiRevenueChart"
        );


    if (!canvas) {
        return;
    }




    canvas.innerHTML =
        '<canvas id="wifiRevenueCanvas"></canvas>';


    const chartCanvas =
        document.getElementById(
            "wifiRevenueCanvas"
        );


    if (wifiRevenueChart) {

        wifiRevenueChart.destroy();

    }


    wifiRevenueChart =
        new Chart(
            chartCanvas,
            {
                type: "line",

                data: {

                    labels: dates,

                    datasets: [

                        {
                            label:
                                "Revenue (TZS)",

                            data:
                                revenue,

                            tension: 0.3,

                            fill: true

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: true
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
                                            Number(value)
                                                .toLocaleString()
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}

let wifiPackageChart = null;


function updateWifiPackageChart(vouchers) {

    const soldVouchers = vouchers.filter(
        voucher =>
            voucher.status === "Sold" ||
            voucher.status === "Active" ||
            voucher.status === "Expired"
    );


    const packageSales = {};


    soldVouchers.forEach(voucher => {

        const packageName =
            voucher.packageName || "Unknown";

        if (!packageSales[packageName]) {

            packageSales[packageName] = 0;

        }

        packageSales[packageName] +=
            Number(voucher.price || 0);

    });


    const packages =
        Object.keys(packageSales)
            .sort(
                (a, b) =>
                    packageSales[b] -
                    packageSales[a]
            );


    const revenue =
        packages.map(
            packageName =>
                packageSales[packageName]
        );


    const container =
        document.getElementById(
            "wifiPackageChart"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        '<canvas id="wifiPackageCanvas"></canvas>';


    const canvas =
        document.getElementById(
            "wifiPackageCanvas"
        );


    if (wifiPackageChart) {

        wifiPackageChart.destroy();

    }


    wifiPackageChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: packages,

                    datasets: [

                        {
                            label:
                                "Revenue (TZS)",

                            data: revenue

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: true
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
                                            Number(value)
                                                .toLocaleString()
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}

let wifiPaymentChart = null;


function updateWifiPaymentChart(vouchers) {

    const soldVouchers = vouchers.filter(
        voucher =>
            voucher.status === "Sold" ||
            voucher.status === "Active" ||
            voucher.status === "Expired"
    );


    const paymentSales = {};


    soldVouchers.forEach(voucher => {

        const method =
            voucher.paymentMethod || "Other";

        if (!paymentSales[method]) {

            paymentSales[method] = 0;

        }

        paymentSales[method] +=
            Number(voucher.price || 0);

    });


    const methods =
        Object.keys(paymentSales)
            .sort(
                (a, b) =>
                    paymentSales[b] -
                    paymentSales[a]
            );


    const revenue =
        methods.map(
            method =>
                paymentSales[method]
        );


    const container =
        document.getElementById(
            "wifiPaymentChart"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        '<canvas id="wifiPaymentCanvas"></canvas>';


    const canvas =
        document.getElementById(
            "wifiPaymentCanvas"
        );


    if (wifiPaymentChart) {

        wifiPaymentChart.destroy();

    }


    wifiPaymentChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: methods,

                    datasets: [

                        {
                            label:
                                "Revenue (TZS)",

                            data: revenue

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: "right"

                        }

                    }

                }

            }
        );

}