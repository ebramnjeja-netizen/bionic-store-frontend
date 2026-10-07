const API_BASE_URL = "http://localhost:5000/api";

console.log("Invoice JS loaded");


function formatMoney(amount) {

    const value = Number(amount) || 0;

    return "TZS " + value.toLocaleString("en-TZ");
}


function generateInvoiceNumber() {

    return "INV-" + String(Date.now()).slice(-8);

}


function getOrderId() {

    return new URLSearchParams(
        window.location.search
    ).get("id");

}


async function loadOrderInvoice(orderId) {

    const token =
        localStorage.getItem("token");

    if (!token) {

        alert("Please login.");

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/orders/${orderId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const order =
            await response.json();


        if (!response.ok) {

            throw new Error(
                order.message ||
                "Failed to load order."
            );

        }


        renderOrderInvoice(order);


    } catch (error) {

        console.error(
            "ORDER INVOICE ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to load invoice."
        );

    }

}


function renderOrderInvoice(order) {

    const invoiceNumber =
        document.getElementById(
            "invoiceNumber"
        );


    const invoiceDate =
        document.getElementById(
            "invoiceDate"
        );


    const customerName =
        document.getElementById(
            "customerName"
        );


    const customerPhone =
        document.getElementById(
            "customerPhone"
        );


    if (invoiceNumber) {

        invoiceNumber.textContent =
            "INV-" +
            String(
                order._id || ""
            ).slice(-8).toUpperCase();

    }


    if (invoiceDate) {

        invoiceDate.textContent =
            order.createdAt
                ? new Date(
                    order.createdAt
                ).toLocaleString()
                : new Date().toLocaleString();

    }


    const customer =
        order.customer ||
        order.user ||
        {};


    if (customerName) {

        customerName.textContent =
            customer.name ||
            "Walk-in Customer";

    }


    if (customerPhone) {

        customerPhone.textContent =
            order.phone ||
            customer.phone ||
            "-";

    }


    const invoiceProducts =
        document.getElementById(
            "invoiceProducts"
        );


    if (invoiceProducts) {

        invoiceProducts.innerHTML = "";


        if (
            Array.isArray(
                order.products
            )
        ) {

            order.products.forEach(
                (item, index) => {

                    const quantity =
                        Number(
                            item.quantity || 0
                        );


                    const price =
                        Number(
                            item.price || 0
                        );


                    const total =
                        price * quantity;


                    const product =
                        item.product &&
                        typeof item.product === "object"
                            ? item.product
                            : null;


                    const name =
                        item.name ||
                        product?.name ||
                        "Product";


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHTML(name)}
                        </td>

                        <td>
                            ${quantity}
                        </td>

                        <td>
                            ${formatMoney(price)}
                        </td>

                        <td>
                            ${formatMoney(total)}
                        </td>

                    `;


                    invoiceProducts.appendChild(
                        row
                    );

                }
            );

        }

    }


    const subtotal =
        Array.isArray(order.products)
            ? order.products.reduce(
                (total, item) =>
                    total +
                    (
                        Number(
                            item.price || 0
                        ) *
                        Number(
                            item.quantity || 0
                        )
                    ),
                0
            )
            : Number(
                order.totalPrice || 0
            );


    const discount =
        Number(
            order.discount || 0
        );


    const grandTotal =
        Number(
            order.totalPrice || 0
        );


    const invoiceSubtotal =
        document.getElementById(
            "invoiceSubtotal"
        );


    const invoiceDiscount =
        document.getElementById(
            "invoiceDiscount"
        );


    const grandTotalElement =
        document.getElementById(
            "grandTotal"
        );


    if (invoiceSubtotal) {

        invoiceSubtotal.textContent =
            formatMoney(subtotal);

    }


    if (invoiceDiscount) {

        invoiceDiscount.textContent =
            formatMoney(discount);

    }


    if (grandTotalElement) {

        grandTotalElement.textContent =
            formatMoney(grandTotal);

    }


    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        );


    const amountReceived =
        document.getElementById(
            "amountReceived"
        );


    const changeAmount =
        document.getElementById(
            "changeAmount"
        );


    if (paymentMethod) {

        paymentMethod.textContent =
            order.paymentMethod ||
            "Cash";

    }


    const received =
        Number(
            order.amountReceived
        ) || grandTotal;


    const change =
        Math.max(
            received - grandTotal,
            0
        );


    if (amountReceived) {

        amountReceived.textContent =
            formatMoney(received);

    }


    if (changeAmount) {

        changeAmount.textContent =
            formatMoney(change);

    }


    console.log(
        "Sales invoice loaded successfully."
    );

}


function escapeHTML(value) {

    return String(
        value || ""
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


function loadRepairInvoice() {

    const repairData =
        localStorage.getItem(
            "repairInvoice"
        );


    if (!repairData) {

        return;

    }


    let repair;


    try {

        repair =
            JSON.parse(
                repairData
            );

    } catch (error) {

        console.error(
            "Invalid repair invoice data:",
            error
        );

        return;

    }


    const invoiceNumber =
        document.getElementById(
            "invoiceNumber"
        );


    const invoiceDate =
        document.getElementById(
            "invoiceDate"
        );


    const customerName =
        document.getElementById(
            "customerName"
        );


    const customerPhone =
        document.getElementById(
            "customerPhone"
        );


    if (invoiceNumber) {

        invoiceNumber.textContent =
            repair.invoiceNumber ||
            "REP-" +
            String(
                Date.now()
            ).slice(-8);

    }


    if (invoiceDate) {

        invoiceDate.textContent =
            new Date().toLocaleString();

    }


    if (customerName) {

        customerName.textContent =
            repair.customer?.name ||
            "Walk-in Customer";

    }


    if (customerPhone) {

        customerPhone.textContent =
            repair.customer?.phone ||
            "-";

    }


    const cost =
        Number(
            repair.estimatedCost
        ) || 0;


    const invoiceProducts =
        document.getElementById(
            "invoiceProducts"
        );


    if (invoiceProducts) {

        invoiceProducts.innerHTML = `

            <tr>

                <td>1</td>

                <td>

                    ${escapeHTML(
                        repair.deviceType ||
                        "Device"
                    )}

                    <br>

                    <small>
                        ${escapeHTML(
                            repair.problem ||
                            "Repair Service"
                        )}
                    </small>

                </td>

                <td>1</td>

                <td>
                    ${formatMoney(cost)}
                </td>

                <td>
                    ${formatMoney(cost)}
                </td>

            </tr>

        `;

    }


    document.getElementById(
        "invoiceSubtotal"
    ).textContent =
        formatMoney(cost);


    document.getElementById(
        "invoiceDiscount"
    ).textContent =
        formatMoney(0);


    document.getElementById(
        "grandTotal"
    ).textContent =
        formatMoney(cost);


    document.getElementById(
        "paymentMethod"
    ).textContent =
        repair.paymentMethod ||
        "Cash";


    const received =
        Number(
            repair.amountReceived
        ) || cost;


    document.getElementById(
        "amountReceived"
    ).textContent =
        formatMoney(received);


    document.getElementById(
        "changeAmount"
    ).textContent =
        formatMoney(
            Math.max(
                received - cost,
                0
            )
        );


    console.log(
        "Repair invoice loaded successfully."
    );

}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Invoice page ready"
        );


        const orderId =
            getOrderId();


        if (orderId) {

            loadOrderInvoice(
                orderId
            );

        } else {

            loadRepairInvoice();

        }

    }
);




