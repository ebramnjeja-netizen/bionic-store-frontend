const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

console.log("Invoice JS loaded");

function formatMoney(amount) {
    const value = Number(amount) || 0;
    return "TZS " + value.toFixed(2);
}

function generateInvoiceNumber() {
    return "REP-" + String(Date.now()).slice(-8);
}

function loadRepairInvoice() {

    const repairData = localStorage.getItem("repairInvoice");

    if (!repairData) {
        console.log("No repair invoice data found.");
        return;
    }

    let repair;

    try {
        repair = JSON.parse(repairData);
    } catch (error) {
        console.error("Invalid repair invoice data:", error);
        return;
    }

    const invoiceNumber = document.getElementById("invoiceNumber");

    if (invoiceNumber) {
        invoiceNumber.textContent =
            repair.invoiceNumber || generateInvoiceNumber();
    }

    const invoiceDate = document.getElementById("invoiceDate");

    if (invoiceDate) {
        invoiceDate.textContent = new Date().toLocaleString();
    }

    const customerName = document.getElementById("customerName");
    const customerPhone = document.getElementById("customerPhone");

    if (customerName) {

        if (repair.customer && repair.customer.name) {
            customerName.textContent = repair.customer.name;
        } else {
            customerName.textContent = "Walk-in Customer";
        }
    }

    if (customerPhone) {

        if (repair.customer && repair.customer.phone) {
            customerPhone.textContent = repair.customer.phone;
        } else {
            customerPhone.textContent = "-";
        }
    }

    const invoiceProducts =
        document.getElementById("invoiceProducts");

    const invoiceSubtotal =
        document.getElementById("invoiceSubtotal");

    const invoiceDiscount =
        document.getElementById("invoiceDiscount");

    const grandTotal =
        document.getElementById("grandTotal");

    const cost =
        Number(repair.estimatedCost) || 0;

    if (invoiceProducts) {

        invoiceProducts.innerHTML = "";

        const row = document.createElement("tr");

        const device =
            repair.deviceType || "Device";

        const brand =
            repair.brand || "";

        const model =
            repair.model || "";

        const problem =
            repair.problem || "Repair Service";

        const productName =
            device + " - " + brand + " " + model;

        const cellNumber =
            document.createElement("td");

        cellNumber.textContent = "1";

        const cellProduct =
            document.createElement("td");

        cellProduct.innerHTML =
            productName +
            "<br><small>" +
            problem +
            "</small>";

        const cellQuantity =
            document.createElement("td");

        cellQuantity.textContent = "1";

        const cellPrice =
            document.createElement("td");

        cellPrice.textContent =
            formatMoney(cost);

        const cellTotal =
            document.createElement("td");

        cellTotal.textContent =
            formatMoney(cost);

        row.appendChild(cellNumber);
        row.appendChild(cellProduct);
        row.appendChild(cellQuantity);
        row.appendChild(cellPrice);
        row.appendChild(cellTotal);

        invoiceProducts.appendChild(row);
    }

    if (invoiceSubtotal) {
        invoiceSubtotal.textContent =
            formatMoney(cost);
    }

    if (invoiceDiscount) {
        invoiceDiscount.textContent =
            formatMoney(0);
    }

    if (grandTotal) {
        grandTotal.textContent =
            formatMoney(cost);
    }

    const paymentMethod =
        document.getElementById("paymentMethod");

    const amountReceived =
        document.getElementById("amountReceived");

    const changeAmount =
        document.getElementById("changeAmount");

    const payment =
        repair.paymentMethod || "Cash";

    const received =
        Number(repair.amountReceived) || cost;

    const change =
        received - cost;

    if (paymentMethod) {
        paymentMethod.textContent = payment;
    }

    if (amountReceived) {
        amountReceived.textContent =
            formatMoney(received);
    }

    if (changeAmount) {
        changeAmount.textContent =
            formatMoney(change >= 0 ? change : 0);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("Invoice page ready");

        loadRepairInvoice();
    }
);