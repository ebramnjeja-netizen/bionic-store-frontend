document.addEventListener(
    "DOMContentLoaded",
    loadBusinessDashboard
);


async function loadBusinessDashboard() {

    const loading =
        document.getElementById("loading");

    const content =
        document.getElementById("dashboardContent");

    const errorBox =
        document.getElementById("dashboardError");


    try {

        // ========================================
        // AUTHENTICATION
        // ========================================

        const token =
            localStorage.getItem("token");

        if (!token) {

            throw new Error(
                "Please login as an administrator."
            );

        }


        // ========================================
        // LOAD BUSINESS DATA
        // ========================================

        const response =
            await fetch(
                "/api/business/dashboard",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load business dashboard."
            );

        }


        // ========================================
        // MONEY FORMAT
        // ========================================

        function money(value) {

            return "TZS " +
                Number(value || 0)
                    .toLocaleString();

        }


        // ========================================
        // SHOP
        // ========================================

        document.getElementById(
            "shopRevenue"
        ).textContent =
            money(data.shop.revenue);


        document.getElementById(
            "shopRevenue2"
        ).textContent =
            money(data.shop.revenue);


        document.getElementById(
            "shopOrders"
        ).textContent =
            data.shop.orders;


        const shopExpenses =
            document.getElementById(
                "shopExpenses"
            );

        if (shopExpenses) {

            shopExpenses.textContent =
                money(data.shop.expenses);

        }


        const shopProfit =
            document.getElementById(
                "shopProfit"
            );

        if (shopProfit) {

            shopProfit.textContent =
                money(data.shop.profit);

        }


        // ========================================
        // WIFI
        // ========================================

        document.getElementById(
            "wifiRevenue"
        ).textContent =
            money(data.wifi.revenue);


        document.getElementById(
            "wifiRevenue2"
        ).textContent =
            money(data.wifi.revenue);


        document.getElementById(
            "wifiVouchers"
        ).textContent =
            data.wifi.vouchersSold;


        const wifiExpenses =
            document.getElementById(
                "wifiExpenses"
            );

        if (wifiExpenses) {

            wifiExpenses.textContent =
                money(data.wifi.expenses);

        }


        const wifiProfit =
            document.getElementById(
                "wifiProfit"
            );

        if (wifiProfit) {

            wifiProfit.textContent =
                money(data.wifi.profit);

        }


        // ========================================
        // BUSINESS TOTALS
        // ========================================

        document.getElementById(
            "totalRevenue"
        ).textContent =
            money(
                data.business.totalRevenue
            );


        document.getElementById(
            "totalExpenses"
        ).textContent =
            money(
                data.business.totalExpenses
            );


        document.getElementById(
            "netProfit"
        ).textContent =
            money(
                data.business.netProfit
            );


        document.getElementById(
            "profitMargin"
        ).textContent =
            data.business.profitMargin +
            "%";


        // ========================================
        // BUSINESS SUMMARY
        // ========================================

        document.getElementById(
            "summaryRevenue"
        ).textContent =
            money(
                data.business.totalRevenue
            );


        document.getElementById(
            "summaryExpenses"
        ).textContent =
            money(
                data.business.totalExpenses
            );


        document.getElementById(
            "summaryProfit"
        ).textContent =
            money(
                data.business.netProfit
            );



// ========================================
// FINANCIAL BREAKDOWN
// ========================================

const breakdownShopProfit =
    document.getElementById(
        "breakdownShopProfit"
    );

if (breakdownShopProfit) {

    breakdownShopProfit.textContent =
        money(data.shop.profit);

}


const breakdownWifiProfit =
    document.getElementById(
        "breakdownWifiProfit"
    );

if (breakdownWifiProfit) {

    breakdownWifiProfit.textContent =
        money(data.wifi.profit);

}


const breakdownBusinessProfit =
    document.getElementById(
        "breakdownBusinessProfit"
    );

if (breakdownBusinessProfit) {

    breakdownBusinessProfit.textContent =
        money(data.business.netProfit);

}




        // ========================================
        // SHOW DASHBOARD
        // ========================================

        loading.style.display =
            "none";

        content.style.display =
            "block";


        console.log(
            "✅ Business dashboard loaded:",
            data
        );


    } catch (error) {

        console.error(
            "Business dashboard error:",
            error
        );


        loading.style.display =
            "none";


        errorBox.style.display =
            "block";


        errorBox.textContent =
            "❌ " + error.message;

    }

}
