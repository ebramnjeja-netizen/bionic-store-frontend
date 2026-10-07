const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

console.log("Wi-Fi Sales Report JS loaded");


function formatMoney(amount) {

    return "TSh " +
        Number(amount || 0).toLocaleString();

}


async function loadWifiSalesReport() {

    const token =
        localStorage.getItem("token");

    const message =
        document.getElementById(
            "wifiReportMessage"
        );

    try {

        if (message) {
            message.textContent =
                "Loading sales report...";
        }


        const response =
            await fetch(
                API_BASE_URL +
                "/wifi-vouchers/sales-report",
                {
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
                "Failed to load sales report."
            );

        }


        /* =========================
           SUMMARY
        ========================= */

        document.getElementById(
            "totalVouchersSold"
        ).textContent =
            data.totalVouchersSold || 0;


        document.getElementById(
            "totalWifiRevenue"
        ).textContent =
            formatMoney(
                data.totalRevenue
            );


        document.getElementById(
            "todayWifiSales"
        ).textContent =
            data.todaySales || 0;


        document.getElementById(
            "todayWifiRevenue"
        ).textContent =
            formatMoney(
                data.todayRevenue
            );


        /* =========================
           BEST PACKAGE
        ========================= */

        const best =
            data.bestSellingPackage;


        if (best) {

            document.getElementById(
                "bestPackageName"
            ).textContent =
                best.packageName || "-";


            document.getElementById(
                "bestPackageSold"
            ).textContent =
                best.vouchersSold || 0;


            document.getElementById(
                "bestPackageRevenue"
            ).textContent =
                formatMoney(
                    best.revenue
                );

        }


        /* =========================
           PACKAGE SALES
        ========================= */

        const packageBody =
            document.getElementById(
                "wifiPackageSalesBody"
            );

        packageBody.innerHTML = "";


        if (
            Array.isArray(
                data.packageSales
            )
        ) {

            data.packageSales.forEach(
                function (item) {

                    const row =
                        document.createElement(
                            "tr"
                        );

                    row.innerHTML =

                        "<td>" +
                        (
                            item.packageName ||
                            "-"
                        ) +
                        "</td>" +

                        "<td>" +
                        (
                            item.vouchersSold ||
                            0
                        ) +
                        "</td>" +

                        "<td>" +
                        formatMoney(
                            item.revenue
                        ) +
                        "</td>";

                    packageBody.appendChild(
                        row
                    );

                }
            );

        }


        /* =========================
           PAYMENT METHODS
        ========================= */

        const paymentBody =
            document.getElementById(
                "wifiPaymentMethodsBody"
            );

        paymentBody.innerHTML = "";


        if (
            Array.isArray(
                data.paymentMethods
            )
        ) {

            data.paymentMethods.forEach(
                function (item) {

                    const row =
                        document.createElement(
                            "tr"
                        );

                    row.innerHTML =

                        "<td>" +
                        (
                            item.paymentMethod ||
                            "-"
                        ) +
                        "</td>" +

                        "<td>" +
                        (
                            item.vouchersSold ||
                            0
                        ) +
                        "</td>" +

                        "<td>" +
                        formatMoney(
                            item.revenue
                        ) +
                        "</td>";

                    paymentBody.appendChild(
                        row
                    );

                }
            );

        }


        /* =========================
           DAILY SALES
        ========================= */

        const dailyBody =
            document.getElementById(
                "wifiDailySalesBody"
            );

        dailyBody.innerHTML = "";


        if (
            Array.isArray(
                data.dailySales
            )
        ) {

            data.dailySales.forEach(
                function (item) {

                    const row =
                        document.createElement(
                            "tr"
                        );

                    row.innerHTML =

                        "<td>" +
                        (
                            item.date ||
                            "-"
                        ) +
                        "</td>" +

                        "<td>" +
                        (
                            item.vouchersSold ||
                            0
                        ) +
                        "</td>" +

                        "<td>" +
                        formatMoney(
                            item.revenue
                        ) +
                        "</td>";

                    dailyBody.appendChild(
                        row
                    );

                }
            );

        }


        if (message) {

            message.textContent =
                "✅ Wi-Fi sales report loaded.";

        }


    } catch (error) {

        console.error(
            "Wi-Fi sales report error:",
            error
        );


        if (message) {

            message.textContent =
                "❌ " + error.message;

        }

    }

}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Wi-Fi Sales Report page ready."
        );

        loadWifiSalesReport();

    }
);