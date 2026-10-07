// ========================================
// BIONIC STORE - INVOICE HISTORY
// ========================================

const API_BASE_URL = "http://localhost:5000/api";

console.log("Invoice History JS loaded");


// ========================================
// LOAD INVOICE HISTORY
// ========================================

async function loadInvoiceHistory() {

    console.log("Loading invoice history...");

    try {

        const response = await fetch(
            `${API_BASE_URL}/invoice-history`
        );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const invoices =
            await response.json();

        console.log(
            "Invoice history loaded:",
            invoices
        );

        renderInvoiceHistory(invoices);

    } catch (error) {

        console.error(
            "Failed to load invoice history:",
            error
        );

        const container =
            document.getElementById(
                "invoiceHistory"
            );

        if (container) {

            container.innerHTML = `
                <div class="history-error">
                    ❌ Failed to load invoice history.
                </div>
            `;

        }

    }

}


// ========================================
// RENDER INVOICES
// ========================================

function renderInvoiceHistory(invoices) {

    const container =
        document.getElementById(
            "invoiceHistory"
        );

    if (!container) {

        console.error(
            "invoiceHistory container not found."
        );

        return;

    }


    if (!invoices || invoices.length === 0) {

        container.innerHTML = `
            <div class="empty-history">
                📭 No invoices found.
            </div>
        `;

        return;

    }


    container.innerHTML = invoices.map(
        invoice => `

        <div class="invoice-history-card">

            <div class="invoice-history-header">

                <strong>
                    ${invoice.invoiceNumber || "-"}
                </strong>

                <span>
                    ${invoice.status || "Completed"}
                </span>

            </div>


            <div class="invoice-history-details">

                <p>
                    <strong>Customer:</strong>
                    ${invoice.customerName || "Walk-in Customer"}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${invoice.customerPhone || "-"}
                </p>

                <p>
                    <strong>Device:</strong>
                    ${invoice.deviceType || "Device"}
                </p>

                <p>
                    <strong>Brand:</strong>
                    ${invoice.brand || "-"}
                </p>

                <p>
                    <strong>Model:</strong>
                    ${invoice.model || "-"}
                </p>

                <p>
                    <strong>Problem:</strong>
                    ${invoice.problem || "Repair Service"}
                </p>

                <p>
                    <strong>Cost:</strong>
                    $${Number(
                        invoice.estimatedCost || 0
                    ).toFixed(2)}
                </p>

                <p>
                    <strong>Payment:</strong>
                    ${invoice.paymentMethod || "Cash"}
                </p>

            </div>


            <div class="invoice-history-footer">

                <span>
                    ${formatInvoiceDate(
                        invoice.createdAt
                    )}
                </span>

                <button
                    type="button"
                    onclick="viewInvoice('${invoice._id}')"
                >
                    👁 View
                </button>

                <button
                    type="button"
                    onclick="deleteInvoice('${invoice._id}')"
                >
                    🗑 Delete
                </button>

            </div>

        </div>

        `
    ).join("");

}


// ========================================
// FORMAT DATE
// ========================================

function formatInvoiceDate(date) {

    if (!date) {
        return "-";
    }

    try {

        return new Date(date).toLocaleString();

    } catch (error) {

        return "-";

    }

}


// ========================================
// VIEW INVOICE
// ========================================

function viewInvoice(id) {

    if (!id) {
        return;
    }

    window.location.href =
        `invoices.html?id=${id}`;

}


// ========================================
// DELETE INVOICE
// ========================================

async function deleteInvoice(id) {

    if (!id) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this invoice?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/invoice-history/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to delete invoice."
            );

        }


        alert(
            "Invoice deleted successfully."
        );


        loadInvoiceHistory();


    } catch (error) {

        console.error(
            "Delete invoice error:",
            error
        );

        alert(
            "Failed to delete invoice."
        );

    }

}


// ========================================
// PAGE READY
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Invoice History page ready"
        );

        loadInvoiceHistory();

    }
);