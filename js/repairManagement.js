const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let repairsData = [];
let currentRepairId = null;

console.log("Repair Management JS loaded");


// ========================================
// LOAD REPAIRS
// ========================================

async function loadRepairs() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    try {

        const response = await fetch(
            API_BASE_URL + "/repairs",
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load repairs"
            );
        }

        if (Array.isArray(data)) {
            repairsData = data;
        } else if (Array.isArray(data.repairs)) {
            repairsData = data.repairs;
        } else {
            repairsData = [];
        }

        updateSummary();
        renderRepairs(repairsData);
        updateRepairStatusChart();
        updateTechnicianWorkload();
        updateRepairPriorityOverview();
        updateAverageRepairTime();
        updateOverdueRepairs();
        renderOverdueRepairList();
        renderUpcomingRepairList();



    } catch (error) {

        console.error(
            "Failed to load repairs:",
            error
        );

        showMessage(
            "❌ Failed to load repair requests."
        );

    }
}


// ========================================
// RENDER REPAIRS
// ========================================

function renderRepairs(records) {

    const tableBody =
        document.getElementById(
            "repairsTableBody"
        );

    const table =
        document.getElementById(
            "repairsTable"
        );

    if (!tableBody) {
        console.error(
            "repairsTableBody was not found."
        );
        return;
    }

    tableBody.innerHTML = "";

    if (!records || records.length === 0) {

        if (table) {
            table.style.display = "none";
        }

        showMessage(
            "No repair requests found."
        );

        return;
    }

    if (table) {
        table.style.display = "table";
    }

    showMessage("");

    records.forEach(function (repair) {

        const row =
            document.createElement("tr");


        const customerName =
            repair.customer &&
            repair.customer.name
                ? repair.customer.name
                : "Walk-in Customer";


        const customerPhone =
            repair.customer &&
            repair.customer.phone
                ? repair.customer.phone
                : "-";


        const deviceType =
            repair.deviceType || "-";


        const brand =
            repair.brand || "-";


        const model =
            repair.model || "-";


        const problem =
            repair.problem || "-";


        const status =
            repair.status || "Received";


        const priority =
            repair.priority || "Normal";


        const estimatedCost =
            Number(
                repair.estimatedCost || 0
            );


        const amountPaid =
            Number(
                repair.amountPaid || 0
            );


        const amountDue =
            Number(
                repair.amountDue ??
                Math.max(
                    estimatedCost -
                    amountPaid,
                    0
                )
            );


        const date =
            repair.createdAt
                ? new Date(
                    repair.createdAt
                ).toLocaleDateString()
                : "-";


        const repairNumber =
            repair.repairNumber ||
            (
                repair.repairNumber
                  ? repair.repairNumber
                 : "#" + String(repair._id || "")
                       .slice(-6)
                      .toUpperCase()
            );


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHTML(repairNumber)}
                </strong>
            </td>

            <td>
                ${escapeHTML(customerName)}
                <br>
                <small>
                    ${escapeHTML(customerPhone)}
                </small>
            </td>

            <td>
                ${escapeHTML(deviceType)}
                <br>
                <small>
                    ${escapeHTML(
                        brand + " " + model
                    )}
                </small>
            </td>

            <td>
                ${escapeHTML(problem)}
            </td>

            <td>

            "<td>" +
    (
        repair.paymentStatus === "Paid"
            ? "✅ Paid"
            : repair.paymentStatus === "Partially Paid"
                ? "🟡 Partially Paid"
                : "🔴 Unpaid"
    ) +
"</td>" +

"<td>TZS " +
    Number(repair.amountDue || 0).toLocaleString("en-TZ") +
"</td>" +


                <span class="repair-priority ${getPriorityClass(priority)}">
                    ${escapeHTML(priority)}
                </span>
            </td>

            <td>
                ${formatMoney(estimatedCost)}
                <br>
                <small>
                    Paid: ${formatMoney(amountPaid)}
                </small>
                <br>
                <small>
                    Due: ${formatMoney(amountDue)}
                </small>
            </td>

            <td>
                ${escapeHTML(date)}
            </td>

            <td>
                ${createStatusSelect(
                    repair._id,
                    status
                )}
            </td>

            <td>
                <button
                    type="button"
                    class="repair-view-btn"
                    data-id="${repair._id}"
                >
                    View
                </button>
            </td>

        `;

        tableBody.appendChild(row);

    });

    attachRepairEvents();
}


// ========================================
// STATUS SELECT
// ========================================

function createStatusSelect(
    repairId,
    currentStatus
) {

    const statuses = [
        "Received",
        "Diagnosing",
        "Waiting for Parts",
        "Repairing",
        "Ready",
        "Completed",
        "Cancelled"
    ];


    let html = `
        <select
            class="repair-status-select"
            data-id="${repairId}"
        >
    `;


    statuses.forEach(function (status) {

        const selected =
            status === currentStatus
                ? " selected"
                : "";


        html += `
            <option
                value="${escapeHTML(status)}"
                ${selected}
            >
                ${escapeHTML(status)}
            </option>
        `;

    });


    html += "</select>";

    return html;
}


// ========================================
// SUMMARY
// ========================================

function updateSummary() {

    const total = repairsData.length;

    const pending = repairsData.filter(function (repair) {
        return repair.status === "Received";
    }).length;

    const active = repairsData.filter(function (repair) {
        return (
            repair.status === "Diagnosing" ||
            repair.status === "Waiting for Parts" ||
            repair.status === "Repairing"
        );
    }).length;

    const ready = repairsData.filter(function (repair) {
        return repair.status === "Ready";
    }).length;

    const urgent = repairsData.filter(function (repair) {
        return repair.priority === "Urgent";
    }).length;

    const unpaid = repairsData.filter(function (repair) {
        return repair.paymentStatus === "Unpaid";
    }).length;

    const totalDue = repairsData.reduce(function (total, repair) {

        return total + Number(repair.amountDue || 0);

    }, 0);

    const totalRevenue = repairsData.reduce(
          (sum, repair) => sum + Number(repair.amountPaid || 0),
                       0
        );

        document.getElementById("totalRepairRevenue").textContent =
          "TZS " + totalRevenue.toLocaleString("en-TZ");


    const averageRepairValue =
    repairsData.length > 0
        ? totalRevenue / repairsData.length
        : 0;

const averageRepairElement =
    document.getElementById("averageRepairValue");

if (averageRepairElement) {
    averageRepairElement.textContent =
        "TZS " + averageRepairValue.toLocaleString("en-TZ");
}      


const completedRepairs = repairsData.filter(
    repair => repair.status === "Completed"
).length;

const completionRate =
    repairsData.length > 0
        ? (completedRepairs / repairsData.length) * 100
        : 0;

const completedElement =
    document.getElementById("completedRepairs");

const completionRateElement =
    document.getElementById("repairCompletionRate");

if (completedElement) {
    completedElement.textContent = completedRepairs;
}

if (completionRateElement) {
    completionRateElement.textContent =
        completionRate.toFixed(1) + "%";
}



    const totalElement =
        document.getElementById("totalRepairs");

    const pendingElement =
        document.getElementById("pendingRepairs");

    const activeElement =
        document.getElementById("activeRepairs");

    const readyElement =
        document.getElementById("readyRepairs");

    const urgentElement =
        document.getElementById("urgentRepairs");

    const unpaidElement =
        document.getElementById("unpaidRepairs");

    const dueElement =
        document.getElementById("totalRepairDue");


    if (totalElement) {
        totalElement.textContent = total;
    }

    if (pendingElement) {
        pendingElement.textContent = pending;
    }

    if (activeElement) {
        activeElement.textContent = active;
    }

    if (readyElement) {
        readyElement.textContent = ready;
    }

    if (urgentElement) {
        urgentElement.textContent = urgent;
    }

    if (unpaidElement) {
        unpaidElement.textContent = unpaid;
    }

    if (dueElement) {

        dueElement.textContent =
            "TZS " +
            totalDue.toLocaleString("en-TZ");

    }
}

// ========================================
// SEARCH + FILTER
// ========================================

function filterRepairs() {

    const searchInput = document.getElementById("repairSearch");
    const statusFilter = document.getElementById("repairStatusFilter");
    const priorityFilter = document.getElementById("repairPriorityFilter");
    const paymentFilter = document.getElementById("repairPaymentFilter");
    const startDateInput = document.getElementById("repairStartDate");
    const endDateInput = document.getElementById("repairEndDate");

    const search = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const status = statusFilter
        ? statusFilter.value
        : "";

    const priority = priorityFilter
        ? priorityFilter.value
        : "";

    const payment = paymentFilter
        ? paymentFilter.value
        : "";

    const startDate = startDateInput
        ? startDateInput.value
        : "";

    const endDate = endDateInput
        ? endDateInput.value
        : "";

    const filteredRepairs = repairsData.filter(repair => {

        const customerName =
            repair.customer?.name || "";

        const customerPhone =
            repair.customer?.phone || "";

        const searchableText = `
            ${repair.repairNumber || ""}
            ${customerName}
            ${customerPhone}
            ${repair.brand || ""}
            ${repair.model || ""}
            ${repair.deviceType || ""}
            ${repair.problem || ""}
        `.toLowerCase();

        const matchesSearch =
            searchableText.includes(search);

        const matchesStatus =
            !status ||
            repair.status === status;

        const matchesPriority =
            !priority ||
            repair.priority === priority;

        const matchesPayment =
            !payment ||
            repair.paymentStatus === payment;

        const repairDate = repair.createdAt
            ? new Date(repair.createdAt)
            : null;

        const matchesStartDate =
            !startDate ||
            (repairDate &&
             repairDate >= new Date(startDate + "T00:00:00"));

        const matchesEndDate =
            !endDate ||
            (repairDate &&
             repairDate <= new Date(endDate + "T23:59:59"));

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority &&
            matchesPayment &&
            matchesStartDate &&
            matchesEndDate
        );
    });

    renderRepairs(filteredRepairs);
}
// ========================================
// UPDATE STATUS
// ========================================

async function updateRepairStatus(
    repairId,
    newStatus
) {

    const confirmed =
        window.confirm(
            "Change this repair status to:\n\n" +
            newStatus +
            "\n\nContinue?"
        );


    if (!confirmed) {

        await loadRepairs();

        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/repairs/" +
                repairId,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update repair"
            );

        }


        await loadRepairs();


        alert(
            "Repair status updated successfully."
        );


    } catch (error) {

        console.error(
            "Update repair error:",
            error
        );


        alert(
            error.message ||
            "Failed to update repair."
        );


        await loadRepairs();

    }

}


function updateTechnicianWorkload() {

    const container = document.getElementById("technicianWorkload");

    if (!container) return;

    const technicianCounts = {};

    repairsData.forEach(repair => {

        const technician =
            repair.technicianName &&
            repair.technicianName.trim()
                ? repair.technicianName.trim()
                : "Unassigned";

        technicianCounts[technician] =
            (technicianCounts[technician] || 0) + 1;
    });

    const technicians = Object.entries(technicianCounts);

    if (!technicians.length) {
        container.innerHTML =
            "<p>No technician data available.</p>";
        return;
    }

    container.innerHTML = technicians
        .sort((a, b) => b[1] - a[1])
        .map(([technician, count]) => `
            <div class="technician-row">
                <strong>👨‍🔧 ${escapeHTML(technician)}</strong>
                <span>${count} repair${count === 1 ? "" : "s"}</span>
            </div>
        `)
        .join("");
}


// ========================================
// VIEW REPAIR
// ========================================

function viewRepair(repairId) {

    const repair =
        repairsData.find(function (item) {

            return item._id === repairId;

        });


    if (!repair) {

        alert(
            "Repair not found."
        );

        return;
    }


    currentRepairId =
        repairId;


    const customerName =
        repair.customer &&
        repair.customer.name
            ? repair.customer.name
            : "Walk-in Customer";


    const customerPhone =
        repair.customer &&
        repair.customer.phone
            ? repair.customer.phone
            : "-";


    const repairDate =
        repair.createdAt
            ? new Date(
                repair.createdAt
            ).toLocaleString()
            : "-";


    setText(
        "detailRepairId",
        repair.repairNumber ||
        "#" +
        String(
            repair._id || ""
        )
        .slice(-6)
        .toUpperCase()
    );


    setText(
        "detailCustomer",
        customerName
    );


    setText(
        "detailPhone",
        customerPhone
    );


    setText(
        "detailDeviceType",
        repair.deviceType || "-"
    );


    setText(
        "detailBrand",
        repair.brand || "-"
    );


    setText(
        "detailModel",
        repair.model || "-"
    );


    setText(
        "detailSerial",
        repair.serialNumber || "-"
    );


    setText(
        "detailStatus",
        repair.status || "Received"
    );


    setText(
        "detailProblem",
        repair.problem || "-"
    );


    setText(
        "detailDate",
        repairDate
    );


    // ========================================
    // NEW REPAIR DETAILS
    // ========================================

    setInputValue(
        "detailPriority",
        repair.priority || "Normal"
    );


    setInputValue(
        "detailDeviceCondition",
        repair.deviceCondition || ""
    );


    setInputValue(
        "detailRepairCost",
        repair.estimatedCost || 0
    );


    setInputValue(
        "detailAmountPaid",
        repair.amountPaid || 0
    );


    setInputValue(
        "detailTechnicianName",
        repair.technicianName || ""
    );


    setInputValue(
        "detailTechnicianNotes",
        repair.technicianNotes || ""
    );


    setInputValue(
        "detailExpectedCompletionDate",
        repair.expectedCompletionDate
            ? new Date(
                repair.expectedCompletionDate
            )
            .toISOString()
            .split("T")[0]
            : ""
    );


    const approval =
        document.getElementById(
            "detailCustomerApproval"
        );


    if (approval) {

        approval.checked =
            repair.customerApproval === true;

    }


    // Payment information

    setText(
        "detailPaymentStatus",
        repair.paymentStatus || "Unpaid"
    );


    setText(
        "detailAmountDue",
        formatMoney(
            repair.amountDue || 0
        )
    );


    // ========================================
    // OPEN MODAL
    // ========================================

    const modal =
        document.getElementById(
            "repairDetailsModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }


    // ========================================
    // INVOICE BUTTON
    // ========================================

    const invoiceButton =
        document.getElementById(
            "generateRepairInvoice"
        );


    if (invoiceButton) {

        invoiceButton.onclick =
            function () {

                generateRepairInvoice(
                    repair._id
                );

            };

    }

}


// ========================================
// SAVE REPAIR DETAILS
// ========================================

async function saveRepairDetails() {

    if (!currentRepairId) {

        alert(
            "No repair selected."
        );

        return;
    }


    const token =
        localStorage.getItem("token");


    const costInput =
        document.getElementById(
            "detailRepairCost"
        );


    const notesInput =
        document.getElementById(
            "detailTechnicianNotes"
        );


    const priorityInput =
        document.getElementById(
            "detailPriority"
        );


    const conditionInput =
        document.getElementById(
            "detailDeviceCondition"
        );


    const amountPaidInput =
        document.getElementById(
            "detailAmountPaid"
        );


    const technicianInput =
        document.getElementById(
            "detailTechnicianName"
        );


    const expectedDateInput =
        document.getElementById(
            "detailExpectedCompletionDate"
        );


    const approvalInput =
        document.getElementById(
            "detailCustomerApproval"
        );


    const estimatedCost =
        costInput
            ? Number(costInput.value) || 0
            : 0;


    const amountPaid =
        amountPaidInput
            ? Number(
                amountPaidInput.value
            ) || 0
            : 0;


    if (estimatedCost < 0) {

        alert(
            "Estimated cost cannot be negative."
        );

        return;
    }


    if (amountPaid < 0) {

        alert(
            "Amount paid cannot be negative."
        );

        return;
    }


    if (
        estimatedCost > 0 &&
        amountPaid > estimatedCost
    ) {

        alert(
            "Amount paid cannot be greater than estimated cost."
        );

        return;
    }


    const updateData = {

        estimatedCost,

        amountPaid,

        priority:
            priorityInput
                ? priorityInput.value
                : undefined,

        deviceCondition:
            conditionInput
                ? conditionInput.value.trim()
                : undefined,

        technicianName:
            technicianInput
                ? technicianInput.value.trim()
                : undefined,

        technicianNotes:
            notesInput
                ? notesInput.value.trim()
                : "",

        expectedCompletionDate:
            expectedDateInput
                ? expectedDateInput.value
                : null,

        customerApproval:
            approvalInput
                ? approvalInput.checked
                : false

    };


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/repairs/" +
                currentRepairId,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body:
                        JSON.stringify(
                            updateData
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save repair."
            );

        }


        alert(
            "✅ Repair details saved successfully."
        );


        closeRepairModal();


        await loadRepairs();


    } catch (error) {

        console.error(
            "Save repair error:",
            error
        );


        alert(
            error.message ||
            "Failed to save repair."
        );

    }

}


// ========================================
// CLOSE MODAL
// ========================================

function closeRepairModal() {

    const modal =
        document.getElementById(
            "repairDetailsModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    currentRepairId =
        null;
}


// ========================================
// TABLE EVENTS
// ========================================

function attachRepairEvents() {

    const statusSelects =
        document.querySelectorAll(
            ".repair-status-select"
        );


    statusSelects.forEach(
        function (select) {

            select.addEventListener(
                "change",
                function () {

                    updateRepairStatus(
                        this.dataset.id,
                        this.value
                    );

                }
            );

        }
    );


    const viewButtons =
        document.querySelectorAll(
            ".repair-view-btn"
        );


    viewButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    viewRepair(
                        this.dataset.id
                    );

                }
            );

        }
    );

}


// ========================================
// HELPERS
// ========================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}


function setInputValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.value =
            value;

    }

}


function formatMoney(amount) {

    return (
        "TZS " +
        Number(
            amount || 0
        ).toLocaleString(
            "en-TZ"
        )
    );

}


function escapeHTML(value) {

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


function getPriorityClass(priority) {

    if (priority === "Urgent") {
        return "urgent";
    }

    return "normal";

}


// ========================================
// MESSAGE
// ========================================

function showMessage(text) {

    const message =
        document.getElementById(
            "repairsMessage"
        );


    if (message) {

        message.textContent =
            text;

    }

}


// ========================================
// PAGE READY
// ========================================
document
    .getElementById("repairStartDate")
    ?.addEventListener("change", filterRepairs);

document
    .getElementById("repairEndDate")
    ?.addEventListener("change", filterRepairs);


document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Repair Management page ready"
        );


        const searchInput =
            document.getElementById(
                "repairSearch"
            );


        const statusFilter =
            document.getElementById(
                "repairStatusFilter"
            );


        const priorityFilter =
              document.getElementById(
             "repairPriorityFilter"
          );

        const paymentFilter =
                 document.getElementById(
               "repairPaymentFilter"
         );


        const refreshButton =
            document.getElementById(
                "refreshRepairs"
            );


        const saveButton =
            document.getElementById(
                "saveRepairDetails"
            );


        const closeButton =
            document.getElementById(
                "closeRepairModal"
            );


        const closeButtonBottom =
            document.getElementById(
                "closeRepairModalButton"
            );


        const modal =
            document.getElementById(
                "repairDetailsModal"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterRepairs
            );

        }


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                filterRepairs
            );

        }

        if (priorityFilter) {
           priorityFilter.addEventListener(
            "change",
              filterRepairs
          );
        }

        if (paymentFilter) {
              paymentFilter.addEventListener(
             "change",
                   filterRepairs
          );
        }


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadRepairs
            );

        }


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                saveRepairDetails
            );

        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeRepairModal
            );

        }


        if (closeButtonBottom) {

            closeButtonBottom.addEventListener(
                "click",
                closeRepairModal
            );

        }


        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        closeRepairModal();

                    }

                }
            );

        }


        loadRepairs();

    }
);


// ========================================
// GENERATE REPAIR INVOICE
// ========================================

async function generateRepairInvoice(
    repairId
) {

    console.log(
        "Generate invoice clicked:",
        repairId
    );


    const repair =
        repairsData.find(
            function (item) {
                return item._id === repairId;
            }
        );


    if (!repair) {

        alert(
            "❌ Repair record not found."
        );

        return;
    }


    if (
        repair.status !== "Ready" &&
        repair.status !== "Completed"
    ) {

        alert(
            "⚠️ The repair must be Ready or Completed before generating an invoice."
        );

        return;
    }


    const invoiceData = {

        invoiceNumber:
            repair.repairNumber ||
            (
                "REP-" +
                String(
                    Date.now()
                ).slice(-8)
            ),

        customerName:
            repair.customer &&
            repair.customer.name
                ? repair.customer.name
                : "Walk-in Customer",

        customerPhone:
            repair.customer &&
            repair.customer.phone
                ? repair.customer.phone
                : "",

        deviceType:
            repair.deviceType || "",

        brand:
            repair.brand || "",

        model:
            repair.model || "",

        problem:
            repair.problem || "",

        estimatedCost:
            Number(
                repair.estimatedCost
            ) || 0,

        paymentMethod:
            "Cash",

        amountReceived:
            Number(
                repair.amountPaid
            ) || 0,

        changeAmount:
            Math.max(
                (
                    Number(
                        repair.amountPaid
                    ) || 0
                ) -
                (
                    Number(
                        repair.estimatedCost
                    ) || 0
                ),
                0
            ),

        status:
            "Completed"
    };


    try {

        const token =
            localStorage.getItem(
                "token"
            );


        const response =
            await fetch(
                API_BASE_URL +
                "/invoice-history",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            token
                    },

                    body:
                        JSON.stringify(
                            invoiceData
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save invoice"
            );

        }


        localStorage.setItem(
            "repairInvoice",
            JSON.stringify({

                ...invoiceData,

                customer:
                    repair.customer ||
                    null,

                repairId:
                    repair._id,

                serialNumber:
                    repair.serialNumber ||
                    "",

                technicianNotes:
                    repair.technicianNotes ||
                    "",

                paymentStatus:
                    repair.paymentStatus ||
                    "Unpaid",

                amountDue:
                    repair.amountDue ||
                    0,

                createdAt:
                    new Date().toISOString()

            })
        );


        alert(
            "✅ Invoice generated and saved successfully!"
        );


        window.location.href =
            "invoices.html";


    } catch (error) {

        console.error(
            "Save invoice error:",
            error
        );


        alert(
            "❌ Invoice could not be saved.\n\n" +
            error.message
        );

    }

}



let repairStatusChart = null;

function updateRepairStatusChart() {

    const statuses = [
        "Received",
        "Diagnosing",
        "Waiting for Parts",
        "Repairing",
        "Ready",
        "Completed",
        "Cancelled"
    ];

    const counts = statuses.map(status =>
        repairsData.filter(repair => repair.status === status).length
    );

    const canvas = document.getElementById("repairStatusChart");

    if (!canvas) return;

    if (
        repairStatusChart &&
        typeof repairStatusChart.destroy === "function"
    ) {
        repairStatusChart.destroy();
    }

    repairStatusChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: statuses,
            datasets: [{
                data: counts
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


function updateRepairPriorityOverview() {

    const container =
        document.getElementById("repairPriorityOverview");

    if (!container) return;

    const normal = repairsData.filter(
        repair => repair.priority !== "Urgent"
    ).length;

    const urgent = repairsData.filter(
        repair => repair.priority === "Urgent"
    ).length;

    container.innerHTML = `
        <div class="priority-row">
            <strong>🟢 Normal Repairs</strong>
            <span>${normal}</span>
        </div>

        <div class="priority-row urgent">
            <strong>🚨 Urgent Repairs</strong>
            <span>${urgent}</span>
        </div>
    `;
}


function updateAverageRepairTime() {

    const element = document.getElementById("averageRepairTime");

    if (!element) return;

    const completedRepairs = repairsData.filter(repair =>
        repair.status === "Completed" &&
        repair.createdAt &&
        repair.updatedAt
    );

    if (!completedRepairs.length) {
        element.textContent = "0 days";
        return;
    }

    const totalDays = completedRepairs.reduce((sum, repair) => {

        const created = new Date(repair.createdAt);
        const completed = new Date(repair.updatedAt);

        const days =
            (completed - created) /
            (1000 * 60 * 60 * 24);

        return sum + Math.max(days, 0);

    }, 0);

    const averageDays =
        totalDays / completedRepairs.length;

    element.textContent =
        averageDays.toFixed(1) +
        (averageDays === 1 ? " day" : " days");
}


function updateOverdueRepairs() {

    const element = document.getElementById("overdueRepairs");

    if (!element) return;

    const now = new Date();

    const overdue = repairsData.filter(repair => {

        if (
            repair.status === "Completed" ||
            repair.status === "Cancelled"
        ) {
            return false;
        }

        if (!repair.expectedCompletionDate) {
            return false;
        }

        return new Date(repair.expectedCompletionDate) < now;
    });

    element.textContent = overdue.length;
}

function renderOverdueRepairList() {

    const container = document.getElementById("overdueRepairList");

    if (!container) return;

    const now = new Date();

    const overdueRepairs = repairsData.filter(repair => {

        if (
            repair.status === "Completed" ||
            repair.status === "Cancelled"
        ) {
            return false;
        }

        if (!repair.expectedCompletionDate) {
            return false;
        }

        return new Date(repair.expectedCompletionDate) < now;
    });

    if (!overdueRepairs.length) {
        container.innerHTML = `
            <p class="no-overdue">
                ✅ No overdue repairs
            </p>
        `;
        return;
    }

    container.innerHTML = overdueRepairs.map(repair => {

        const customerName =
            repair.customer?.name || "Unknown Customer";

        const repairNumber =
            repair.repairNumber ||
            "#" + String(repair._id || "").slice(-6).toUpperCase();

        const expectedDate =
            new Date(repair.expectedCompletionDate)
                .toLocaleDateString("en-TZ");

        return `
            <div class="overdue-repair-row">

                <div>
                    <strong>${escapeHTML(repairNumber)}</strong>
                    <span>
                        ${escapeHTML(customerName)}
                    </span>
                </div>

                <div>
                    <span class="overdue-date">
                        📅 ${expectedDate}
                    </span>

                    <span class="overdue-status">
                        ${escapeHTML(repair.status || "Received")}
                    </span>
                </div>

            </div>
        `;

    }).join("");
}


function renderUpcomingRepairList() {

    const container = document.getElementById("upcomingRepairList");

    if (!container) return;

    const now = new Date();

    const upcoming = repairsData
        .filter(repair => {

            if (
                repair.status === "Completed" ||
                repair.status === "Cancelled"
            ) {
                return false;
            }

            if (!repair.expectedCompletionDate) {
                return false;
            }

            const date = new Date(repair.expectedCompletionDate);

            return date >= now;
        })
        .sort(
            (a, b) =>
                new Date(a.expectedCompletionDate) -
                new Date(b.expectedCompletionDate)
        )
        .slice(0, 10);

    if (!upcoming.length) {
        container.innerHTML = `
            <p class="no-upcoming">
                📭 No upcoming repair deadlines
            </p>
        `;
        return;
    }

    container.innerHTML = upcoming.map(repair => {

        const repairNumber =
            repair.repairNumber ||
            "#" + String(repair._id || "")
                .slice(-6)
                .toUpperCase();

        const customerName =
            repair.customer?.name || "Unknown Customer";

        const expectedDate =
            new Date(repair.expectedCompletionDate)
                .toLocaleDateString("en-TZ");

        return `
            <div class="upcoming-repair-row">

                <div>
                    <strong>${escapeHTML(repairNumber)}</strong>
                    <span>${escapeHTML(customerName)}</span>
                </div>

                <div>
                    <span class="upcoming-date">
                        📅 ${expectedDate}
                    </span>

                    <span class="upcoming-status">
                        ${escapeHTML(repair.status || "Received")}
                    </span>
                </div>

            </div>
        `;

    }).join("");
}


function exportRepairsCSV() {

    const searchInput = document.getElementById("repairSearch");
    const statusFilter = document.getElementById("repairStatusFilter");
    const priorityFilter = document.getElementById("repairPriorityFilter");
    const paymentFilter = document.getElementById("repairPaymentFilter");
    const startDateInput = document.getElementById("repairStartDate");
    const endDateInput = document.getElementById("repairEndDate");

    const search = searchInput?.value.toLowerCase().trim() || "";
    const status = statusFilter?.value || "";
    const priority = priorityFilter?.value || "";
    const payment = paymentFilter?.value || "";
    const startDate = startDateInput?.value || "";
    const endDate = endDateInput?.value || "";

    const filteredRepairs = repairsData.filter(repair => {

        const customerName = repair.customer?.name || "";
        const customerPhone = repair.customer?.phone || "";

        const searchableText = `
            ${repair.repairNumber || ""}
            ${customerName}
            ${customerPhone}
            ${repair.deviceType || ""}
            ${repair.brand || ""}
            ${repair.model || ""}
            ${repair.problem || ""}
        `.toLowerCase();

        const repairDate = repair.createdAt
            ? new Date(repair.createdAt)
            : null;

        return (
            searchableText.includes(search) &&
            (!status || repair.status === status) &&
            (!priority || repair.priority === priority) &&
            (!payment || repair.paymentStatus === payment) &&
            (
                !startDate ||
                (repairDate &&
                    repairDate >= new Date(startDate + "T00:00:00"))
            ) &&
            (
                !endDate ||
                (repairDate &&
                    repairDate <= new Date(endDate + "T23:59:59"))
            )
        );
    });

    if (!filteredRepairs.length) {
        alert("No repairs match the current filters.");
        return;
    }

    const headers = [
        "Repair Number",
        "Customer",
        "Phone",
        "Device",
        "Brand",
        "Model",
        "Problem",
        "Priority",
        "Payment Status",
        "Amount Paid",
        "Amount Due",
        "Status",
        "Technician",
        "Expected Completion",
        "Date Submitted"
    ];

    const rows = filteredRepairs.map(repair => [
        repair.repairNumber || "",
        repair.customer?.name || "",
        repair.customer?.phone || "",
        repair.deviceType || "",
        repair.brand || "",
        repair.model || "",
        repair.problem || "",
        repair.priority || "Normal",
        repair.paymentStatus || "Unpaid",
        Number(repair.amountPaid || 0),
        Number(repair.amountDue || 0),
        repair.status || "",
        repair.technicianName || "",
        repair.expectedCompletionDate
            ? new Date(repair.expectedCompletionDate)
                .toLocaleDateString("en-TZ")
            : "",
        repair.createdAt
            ? new Date(repair.createdAt)
                .toLocaleDateString("en-TZ")
            : ""
    ]);

    const csv = [
        headers,
        ...rows
    ]
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

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
        `bionic-repairs-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


















