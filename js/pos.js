const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";


let posCustomers = [];
let products = [];
let cart = [];

function formatMoney(amount) {
    return `TZS ${Number(amount || 0).toLocaleString("en-TZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}

// ==================================================
// LOAD POS CUSTOMERS
// ==================================================

async function loadPOSCustomers() {

    const token =
        localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {

        const response =
            await fetch(
                CUSTOMER_API_URL,
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

        posCustomers = data;

        const select =
            document.getElementById(
                "posCustomer"
            );

        if (!select) {
            return;
        }

        select.innerHTML = `
            <option value="">
                Walk-in Customer
            </option>
        `;

        posCustomers.forEach(customer => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                customer._id;

            option.textContent =
                `${customer.name} - ${customer.phone}`;

            select.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Customer loading error:",
            error
        );

    }
}


// ==================================================
// LOAD PRODUCTS
// ==================================================


async function loadProducts() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Admin login required to load POS products.");
        return;
    }

    try {
        const response = await  fetch(
            `${API_BASE_URL}/products/admin/all`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load products"
            );
        }

        products = Array.isArray(data)
            ? data
            : data.products || [];

        renderProducts();

    } catch (error) {
        console.error("POS product loading error:", error);

        const grid = document.getElementById("productGrid");

        if (grid) {
            grid.innerHTML = `
                <p>❌ Failed to load products. Please check your admin login.</p>
            `;
        }
    }
}


// ==================================================
// RENDER PRODUCTS
// ==================================================

function renderProducts(list = products) {

    const grid =
        document.getElementById(
            "productGrid"
        );

    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    if (list.length === 0) {

        grid.innerHTML = `
            <p>No products found.</p>
        `;

        return;
    }

    list.forEach(product => {

        const image =
            product.images &&
            product.images.length
                ? product.images[0]
                : "";

        const imageUrl =
            image.startsWith("/uploads")
                ? `https://bionic-store-backend.onrender.com${image}`
                : image.startsWith("http")
                    ? image
                    : `../${image}`;

        const outOfStock =
            Number(product.stock) <= 0;

        grid.innerHTML += `

            <div class="pos-product-card">

                <img
                    src="${imageUrl}"
                    alt="${escapeHTML(product.name)}"
                    onerror="this.style.display='none'"
                >

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    $${Number(product.price).toFixed(2)}
                </p>

                <small>
                    Stock: ${product.stock}
                </small>

                <button
                    onclick="addToCart('${product._id}')"
                    ${outOfStock ? "disabled" : ""}
                >
                    ${
                        outOfStock
                            ? "❌ Out of Stock"
                            : "➕ Add"
                    }
                </button>

            </div>

        `;

    });

}


// ==================================================
// ADD TO CART
// ==================================================

function addToCart(productId) {

    const product =
        products.find(
            p => p._id === productId
        );

    if (!product) {
        return;
    }

    const existing =
        cart.find(
            item =>
                item.productId === productId
        );

    if (existing) {

        if (
            existing.quantity >=
            Number(product.stock)
        ) {

            alert(
                "Not enough stock."
            );

            return;
        }

        existing.quantity++;

    } else {

        cart.push({

            productId:
                product._id,

            name:
                product.name,

            price:
                Number(product.price),

            quantity: 1,

            stock:
                Number(product.stock)

        });

    }

    renderCart();

}


// ==================================================
// CHANGE QUANTITY
// ==================================================

function changeQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            item =>
                item.productId === productId
        );

    if (!item) {
        return;
    }

    item.quantity += amount;

    if (
        item.quantity >
        item.stock
    ) {

        item.quantity =
            item.stock;

        alert(
            "Maximum available stock reached."
        );

    }

    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item =>
                    item.productId !== productId
            );

    }

    renderCart();

}


// ==================================================
// REMOVE ITEM
// ==================================================

function removeFromCart(productId) {

    cart =
        cart.filter(
            item =>
                item.productId !== productId
        );

    renderCart();

}


// ==================================================
// CALCULATE TOTALS
// ==================================================

function calculateTotals() {

    const subtotal =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );

    const discountInput =
        document.getElementById(
            "discount"
        );

    const discount =
        discountInput
            ? Number(
                discountInput.value
            ) || 0
            : 0;

    const safeDiscount =
        Math.max(
            0,
            Math.min(
                discount,
                subtotal
            )
        );

    const total =
        Math.max(
            0,
            subtotal -
            safeDiscount
        );

    const subtotalElement =
        document.getElementById(
            "subtotal"
        );

    if (subtotalElement) {

        subtotalElement.textContent =
         formatMoney(subtotal);

    }

    const totalElement =
        document.getElementById(
            "grandTotal"
        );

    if (totalElement) {

        totalElement.textContent =
         formatMoney(total);

    }

    calculateChange(total);

    return {

        subtotal,

        discount:
            safeDiscount,

        total

    };

}


// ==================================================
// CALCULATE CHANGE
// ==================================================

function calculateChange(total = null) {

    if (total === null) {

        const totals =
            calculateTotals();

        total =
            totals.total;

    }

    const receivedElement =
        document.getElementById(
            "amountReceived"
        );

    const received =
        receivedElement
            ? Number(
                receivedElement.value
            ) || 0
            : 0;

    const change =
        Math.max(
            0,
            received -
            total
        );

    const changeElement =
        document.getElementById(
            "changeAmount"
        );

    if (changeElement) {

        changeElement.textContent =
         formatMoney(change);

    }

}


// ==================================================
// RENDER CART
// ==================================================

function renderCart() {

    const container =
        document.getElementById(
            "cartItems"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (cart.length === 0) {

        container.innerHTML = `

            <p class="empty-cart">
                No products added.
            </p>

        `;

        calculateTotals();

        return;
    }

    cart.forEach(item => {

        const itemTotal =
            item.price *
            item.quantity;

        container.innerHTML += `

            <div class="pos-cart-item">

                <div>

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <small>
                          ${formatMoney(item.price)}
                    </small>

                </div>


                <div class="quantity-controls">

                    <button
                        onclick="changeQuantity(
                            '${item.productId}',
                            -1
                        )"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="changeQuantity(
                            '${item.productId}',
                            1
                        )"
                    >
                        +
                    </button>

                </div>


                <strong>
                       ${formatMoney(itemTotal)}
                </strong>


                <button
                    onclick="removeFromCart(
                        '${item.productId}'
                    )"
                >
                    ❌
                </button>

            </div>

        `;

    });

    calculateTotals();

}


// ==================================================
// PRODUCT SEARCH
// ==================================================

function setupProductSearch() {

    const searchInput =
        document.getElementById(
            "productSearch"
        );

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .toLowerCase()
                    .trim();

            const filtered =
                products.filter(
                    product =>
                        product.name
                            .toLowerCase()
                            .includes(keyword)
                );

            renderProducts(
                filtered
            );

        }
    );

}


// ==================================================
// DISCOUNT
// ==================================================

function setupDiscount() {

    const discount =
        document.getElementById(
            "discount"
        );

    if (!discount) {
        return;
    }

    discount.addEventListener(
        "input",
        calculateTotals
    );

}


// ==================================================
// CASH RECEIVED
// ==================================================

function setupAmountReceived() {

    const amountReceived =
        document.getElementById(
            "amountReceived"
        );

    if (!amountReceived) {
        return;
    }

    amountReceived.addEventListener(
        "input",
        calculateTotals
    );

}


// ==================================================
// COMPLETE SALE
// ==================================================

async function completeSale() {

    // ------------------------------------------
    // CHECK CART
    // ------------------------------------------

    if (cart.length === 0) {

        alert(
            "Please add products first."
        );

        return;
    }


    // ------------------------------------------
    // GET TOKEN
    // ------------------------------------------

    const token =
        localStorage.getItem(
            "token"
        );

    if (!token) {

        alert(
            "Please login before completing a sale."
        );

        return;
    }


    // ==================================================
    // FORMAT TZS
    // ==================================================

    function formatMoney(amount) {

      return `TZS ${Number(amount || 0).toLocaleString(
        "en-TZ",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
      )}`;

    }


    // ------------------------------------------
    // CALCULATE TOTALS
    // ------------------------------------------

    const totals =
        calculateTotals();


    // ------------------------------------------
    // PAYMENT METHOD
    // ------------------------------------------

    const paymentElement =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

    const paymentMethod =
        paymentElement
            ? paymentElement.value
            : "Cash";


    // ------------------------------------------
    // AMOUNT RECEIVED
    // ------------------------------------------

    const amountElement =
        document.getElementById(
            "amountReceived"
        );

    const received =
        amountElement
            ? Number(
                amountElement.value
            ) || 0
            : 0;


    // ------------------------------------------
    // CASH VALIDATION
    // ------------------------------------------

    if (
        paymentMethod === "Cash" &&
        received < totals.total
    ) {

        alert(
            "Amount received is less than the total."
        );

        return;
    }


    // ------------------------------------------
    // PREPARE SALE ITEMS
    // ------------------------------------------

    const saleItems =
        cart.map(item => ({

            productId:
                item.productId,

            quantity:
                item.quantity

        }));


    // ------------------------------------------
    // CUSTOMER
    // ------------------------------------------

    const customerElement =
        document.getElementById(
            "posCustomer"
        );

    const customerId =
        customerElement
            ? customerElement.value
            : "";


    // ------------------------------------------
    // BUTTON
    // ------------------------------------------

    const button =
        document.getElementById(
            "completeSale"
        );

    if (button) {

        button.disabled = true;

        button.textContent =
            "Processing...";

    }


    try {

        // --------------------------------------
        // SEND SALE TO SERVER
        // --------------------------------------

        const response =
            await fetch(
                `${API_BASE_URL}/pos/checkout`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            items:
                                saleItems,

                            customerId,

                            paymentMethod,

                            discount:
                                totals.discount,

                            amountReceived:
                                received

                        })

                }
            );


        const data =
            await response.json();


        // --------------------------------------
        // SERVER ERROR
        // --------------------------------------

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Sale failed"
            );

        }


        // --------------------------------------
        // SUCCESS
        // --------------------------------------

        alert(
            "✅ Sale completed successfully!"
        );


        // --------------------------------------
        // CLEAR CART
        // --------------------------------------

        cart = [];

        renderCart();


        // --------------------------------------
        // OPEN INVOICE
        // --------------------------------------

        if (data.orderId) {

              window.location.href =
             `pos-receipt.html?id=${data.orderId}`;

        } else {

            alert(
                "Sale completed, but no order ID was returned."
            );

        }


    } catch (error) {

        console.error(
            "POS SALE ERROR:",
            error
        );

        alert(
            error.message ||
            "Unable to complete sale."
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "✅ Complete Sale";

        }

    }

}


// ==================================================
// SECURITY HELPER
// ==================================================

function escapeHTML(value) {

    return String(value || "")

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


// ==================================================
// EVENT SETUP
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPOSCustomers();

        loadProducts();

        renderCart();

        setupProductSearch();

        setupDiscount();

        setupAmountReceived();


        const refreshButton =
            document.getElementById(
                "refreshCustomers"
            );

        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadPOSCustomers
            );

        }


        const completeButton =
            document.getElementById(
                "completeSale"
            );

        if (completeButton) {

            completeButton.addEventListener(
                "click",
                completeSale
            );

        }

    }
);