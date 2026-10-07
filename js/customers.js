const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let customers = [];


// =========================
// AUTHORIZATION
// =========================

function getToken() {

    return localStorage.getItem("token");

}


// =========================
// LOAD CUSTOMERS
// =========================

async function loadCustomers() {

    const token = getToken();

    if (!token) {

        alert("Please login.");

        window.location.href =
            "login.html";

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/customers`,
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
                "Failed to load customers"
            );

        }


        customers = data;

        updateCustomerSummary();

        displayCustomers(customers);


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// =========================
// DISPLAY CUSTOMERS
// =========================

function displayCustomers(list) {

    const tbody =
        document.getElementById(
            "customerTableBody"
        );


    if (!list.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >

                    No customers found.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML = "";


    list.forEach(customer => {


        const lastPurchase =
            customer.lastPurchaseDate

                ? new Date(
                    customer.lastPurchaseDate
                ).toLocaleDateString()

                : "No purchase";


        const totalPurchases =
            `TZS ${Number(
                customer.totalPurchases || 0
            ).toLocaleString("en-TZ")}`;


        tbody.innerHTML += `

            <tr>


                <td>

                    <strong>

                    <div class="customer-name-cell">

    <div class="customer-avatar-small">
        ${escapeHTML(
            (customer.name || "C")
                .charAt(0)
                .toUpperCase()
        )}
    </div>

    <strong>
        ${escapeHTML(customer.name || "-")}
    </strong>

</div>


                    </strong>

                </td>


                <td>

                    ${escapeHTML(
                        customer.phone
                    )}

                </td>


                <td>

                    ${customer.email

                        ? escapeHTML(
                            customer.email
                        )

                        : "-"

                    }

                </td>


                <td>

                    ${customer.totalOrders || 0}

                </td>


                <td>

                    ${totalPurchases}

                </td>


                <td>

                    ${lastPurchase}

                </td>


                <td>

                    <button
                         class="customer-action edit"
                         onclick="editCustomer('${customer._id}')">
                         ✏️ Edit
                    </button>

                    <button
                          class="customer-action view"
                         onclick="viewCustomer('${customer._id}')">
                          👁️ View
                    </button>

                     <button
                         class="customer-action delete"
                           onclick="deleteCustomer('${customer._id}')">
                           🗑️ Delete
                     </button>

                </td>


            </tr>

        `;

    });

}


// =========================
// SEARCH
// =========================

function updateCustomerSummary() {

    const totalCustomers = customers.length;

    const totalOrders = customers.reduce(
        (total, customer) =>
            total + Number(customer.totalOrders || 0),
        0
    );

    const totalPurchases = customers.reduce(
        (total, customer) =>
            total + Number(customer.totalPurchases || 0),
        0
    );

    const activeCustomers = customers.filter(
        customer =>
            Number(customer.totalOrders || 0) > 0
    ).length;

    const totalElement =
        document.getElementById("customerTotal");

    const ordersElement =
        document.getElementById("customerOrdersTotal");

    const purchasesElement =
        document.getElementById("customerPurchasesTotal");

    const activeElement =
        document.getElementById("activeCustomerTotal");

    if (totalElement) {
        totalElement.textContent = totalCustomers;
    }

    if (ordersElement) {
        ordersElement.textContent = totalOrders;
    }

    if (purchasesElement) {
        purchasesElement.textContent =
            "TZS " +
            totalPurchases.toLocaleString("en-TZ");
    }

    if (activeElement) {
        activeElement.textContent = activeCustomers;
    }
}


function searchCustomers() {

    const searchInput =
        document.getElementById("customerSearch");

    const orderFilter =
        document.getElementById("customerOrderFilter");

    const search =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

    const filter =
        orderFilter
            ? orderFilter.value
            : "all";

    const filtered =
        customers.filter(customer => {

            const name =
                (customer.name || "")
                    .toLowerCase();

            const phone =
                (customer.phone || "")
                    .toLowerCase();

            const email =
                (customer.email || "")
                    .toLowerCase();

            const matchesSearch =
                name.includes(search) ||
                phone.includes(search) ||
                email.includes(search);

            let matchesFilter = true;

            if (filter === "active") {

                matchesFilter =
                    Number(customer.totalOrders || 0) > 0;

            }

            if (filter === "new") {

                matchesFilter =
                    Number(customer.totalOrders || 0) === 0;

            }

            return (
                matchesSearch &&
                matchesFilter
            );

        });

    displayCustomers(filtered);
}




// =========================
// OPEN ADD MODAL
// =========================

function openAddCustomer() {

    document.getElementById(
        "customerModalTitle"
    ).textContent =
        "Add Customer";


    document.getElementById(
        "customerForm"
    ).reset();


    document.getElementById(
        "customerId"
    ).value = "";


    document.getElementById(
        "customerModal"
    ).classList.add("active");

}


// =========================
// CLOSE MODAL
// =========================

function closeCustomerModal() {

    document.getElementById(
        "customerModal"
    ).classList.remove("active");

}


// =========================
// SAVE CUSTOMER
// =========================

async function saveCustomer(event) {

    event.preventDefault();


    const token = getToken();


    const id =
        document.getElementById(
            "customerId"
        ).value;


    const customer = {

        name:
            document.getElementById(
                "customerName"
            ).value.trim(),

        phone:
            document.getElementById(
                "customerPhone"
            ).value.trim(),

        email:
            document.getElementById(
                "customerEmail"
            ).value.trim(),

        address:
            document.getElementById(
                "customerAddress"
            ).value.trim(),

        notes:
            document.getElementById(
                "customerNotes"
            ).value.trim()

    };


    try {

        const url = id

            ? `${API_BASE_URL}/customers/${id}`

            : `${API_BASE_URL}/customers`;


        const method =
            id ? "PUT" : "POST";


        const response =
            await fetch(
                url,
                {
                    method,

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(customer)

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save customer"
            );

        }


        alert(
            id
                ? "Customer updated successfully."
                : "Customer added successfully."
        );


        closeCustomerModal();

        loadCustomers();


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}

function viewCustomer(id) {

    window.location.href =
        `customer-details.html?id=${id}`;

}


// =========================
// EDIT CUSTOMER
// =========================

function editCustomer(id) {

    const customer =
        customers.find(
            item => item._id === id
        );


    if (!customer) {

        return;

    }


    document.getElementById(
        "customerModalTitle"
    ).textContent =
        "Edit Customer";


    document.getElementById(
        "customerId"
    ).value =
        customer._id;


    document.getElementById(
        "customerName"
    ).value =
        customer.name || "";


    document.getElementById(
        "customerPhone"
    ).value =
        customer.phone || "";


    document.getElementById(
        "customerEmail"
    ).value =
        customer.email || "";


    document.getElementById(
        "customerAddress"
    ).value =
        customer.address || "";


    document.getElementById(
        "customerNotes"
    ).value =
        customer.notes || "";


    document.getElementById(
        "customerModal"
    ).classList.add("active");

}


// =========================
// DELETE CUSTOMER
// =========================

async function deleteCustomer(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this customer?"
        );


    if (!confirmed) {

        return;

    }


    const token = getToken();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/customers/${id}`,
                {
                    method: "DELETE",

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
                "Failed to delete customer"
            );

        }


        alert(
            "Customer deleted successfully."
        );


        loadCustomers();


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// =========================
// SECURITY
// =========================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =========================
// EVENTS
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCustomers();



        document.getElementById(
            "addCustomerBtn"
        ).addEventListener(
            "click",
            openAddCustomer
        );


        document.getElementById(
            "closeCustomerModal"
        ).addEventListener(
            "click",
            closeCustomerModal
        );


        document.getElementById(
            "customerForm"
        ).addEventListener(
            "submit",
            saveCustomer
        );


        document.getElementById(
            "customerSearch"
        ).addEventListener(
            "input",
            searchCustomers
        );

        document.getElementById(
              "customerOrderFilter"
        ).addEventListener(
             "change",
         searchCustomers
        );

    }
);