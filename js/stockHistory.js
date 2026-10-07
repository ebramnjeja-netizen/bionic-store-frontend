const API_BASE_URL = "http://localhost:5000/api";

let historyData = [];

async function loadHistory() {

    const token = localStorage.getItem("token");

    try {

        const url = API_BASE_URL + "/inventory/stock-history";

        const response = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

       if (response.status === 401) {

    console.warn(
        "Stock History: session expired."
    );

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    alert(
        "Your session has expired. Please login again."
    );

    window.location.href =
        "../index.html";

    return;
}


if (!response.ok) {

    throw new Error(
        data.message ||
        "Failed to load stock history"
    );

}

        historyData = data;

        renderHistory(historyData);

    } catch (error) {

        console.error("Stock history error:", error);

        const tableBody =
            document.querySelector("#historyTable tbody");

        if (tableBody) {

            tableBody.innerHTML =
                "<tr>" +
                "<td colspan='7' style='text-align:center;'>" +
                "Failed to load stock history." +
                "</td>" +
                "</tr>";

        }

    }
}


function renderHistory(records) {

    const tableBody =
        document.querySelector("#historyTable tbody");

    if (!tableBody) {
        console.error("History table not found.");
        return;
    }

    tableBody.innerHTML = "";

        let stockInTotal = 0;
    let stockOutTotal = 0;
    let manualUpdateTotal = 0;

    records.forEach(function(record) {

        const quantity =
            Math.abs(Number(record.quantityChanged || 0));

        if (record.action === "Stock In") {
            stockInTotal += quantity;
        }

        if (record.action === "Stock Out") {
            stockOutTotal += quantity;
        }

        if (record.action === "Manual Update") {
            manualUpdateTotal++;
        }

    });

    const stockInElement =
        document.getElementById("stockInTotal");

    const stockOutElement =
        document.getElementById("stockOutTotal");

    const manualUpdateElement =
        document.getElementById("manualUpdateTotal");

    const recordTotalElement =
        document.getElementById("historyRecordTotal");

    if (stockInElement) {
        stockInElement.textContent = stockInTotal;
    }

    if (stockOutElement) {
        stockOutElement.textContent = stockOutTotal;
    }

    if (manualUpdateElement) {
        manualUpdateElement.textContent = manualUpdateTotal;
    }

    if (recordTotalElement) {
        recordTotalElement.textContent = records.length;
    }

    if (!records || records.length === 0) {

        tableBody.innerHTML =
            "<tr>" +
            "<td colspan='7' style='text-align:center;'>" +
            "No stock history found." +
            "</td>" +
            "</tr>";

        return;
    }

    records.forEach(function(record) {

        let backgroundColor = "#f8f9fa";

        if (record.action === "Stock In") {
            backgroundColor = "#d4edda";
        }

        if (record.action === "Stock Out") {
            backgroundColor = "#f8d7da";
        }

        if (record.action === "Manual Update") {
            backgroundColor = "#fff3cd";
        }

        const productName =
            record.product && record.product.name
                ? record.product.name
                : "-";

        const userName =
            record.user && record.user.name
                ? record.user.name
                : "System";

        const createdDate =
            record.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : "-";

        const row = document.createElement("tr");

        row.style.background = backgroundColor;

        row.innerHTML =
            "<td>" + createdDate + "</td>" +
            "<td>" + productName + "</td>" +
            "<td>" + (record.action || "-") + "</td>" +
            "<td>" + (record.previousStock || 0) + "</td>" +
            "<td>" + (record.newStock || 0) + "</td>" +
            "<td>" + (record.quantityChanged || 0) + "</td>" +
            "<td>" + userName + "</td>";

        tableBody.appendChild(row);

    });
}


function searchHistory() {

    const searchInput =
        document.getElementById("searchHistory");

    const actionFilter =
        document.getElementById("historyActionFilter");

    const startDateInput =
        document.getElementById("historyStartDate");

    const endDateInput =
        document.getElementById("historyEndDate");

    const keyword =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

    const action =
        actionFilter
            ? actionFilter.value
            : "all";

    const startDate =
        startDateInput
            ? startDateInput.value
            : "";

    const endDate =
        endDateInput
            ? endDateInput.value
            : "";

    const filteredHistory =
        historyData.filter(function(record) {

            const productName =
                record.product && record.product.name
                    ? record.product.name.toLowerCase()
                    : "";

            const matchesProduct =
                productName.includes(keyword);

            const matchesAction =
                action === "all" ||
                record.action === action;

            let matchesDate = true;

            if (record.createdAt) {

                const recordDate =
                    new Date(record.createdAt);

                if (startDate) {

                    const start =
                        new Date(startDate);

                    start.setHours(0, 0, 0, 0);

                    if (recordDate < start) {
                        matchesDate = false;
                    }

                }

                if (endDate) {

                    const end =
                        new Date(endDate);

                    end.setHours(23, 59, 59, 999);

                    if (recordDate > end) {
                        matchesDate = false;
                    }

                }

            }

            return (
                matchesProduct &&
                matchesAction &&
                matchesDate
            );

        });

    renderHistory(filteredHistory);
}



function printStockHistory() {
    window.print();
}


function exportStockHistoryCSV() {

    const rows = [];

    rows.push([
        "Date",
        "Product",
        "Action",
        "Previous Stock",
        "New Stock",
        "Change",
        "User"
    ]);

    const records =
        document.querySelectorAll(
            "#historyTable tbody tr"
        );

    records.forEach(function(row) {

        const cells =
            row.querySelectorAll("td");

        if (cells.length === 7) {

            rows.push([
                cells[0].textContent.trim(),
                cells[1].textContent.trim(),
                cells[2].textContent.trim(),
                cells[3].textContent.trim(),
                cells[4].textContent.trim(),
                cells[5].textContent.trim(),
                cells[6].textContent.trim()
            ]);

        }

    });

    const csv =
        rows.map(function(row) {

            return row.map(function(value) {

                return `"${String(value)
                    .replace(/"/g, '""')}"`;

            }).join(",");

        }).join("\n");

    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "bionic-store-stock-history-" +
        new Date().toISOString().split("T")[0] +
        ".csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}





document.addEventListener("DOMContentLoaded", function() {

    const searchInput =
        document.getElementById("searchHistory");

    if (searchInput) {
    searchInput.addEventListener(
        "input",
        searchHistory
    );
}

const actionFilter =
    document.getElementById("historyActionFilter");

if (actionFilter) {
    actionFilter.addEventListener(
        "change",
        searchHistory
    );
}

const startDateInput =
    document.getElementById("historyStartDate");

if (startDateInput) {
    startDateInput.addEventListener(
        "change",
        searchHistory
    );
}

const endDateInput =
    document.getElementById("historyEndDate");

if (endDateInput) {
    endDateInput.addEventListener(
        "change",
        searchHistory
    );
}

    loadHistory();

});