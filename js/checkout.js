function formatMoney(value) {
    return `TZS ${Number(value || 0).toLocaleString("en-TZ")}`;
}

function loadCheckout() {


const checkoutItems = document.getElementById("checkoutItems");
const subtotalElement = document.getElementById("checkoutSubtotal");
const deliveryElement = document.getElementById("checkoutDelivery");
const totalElement = document.getElementById("checkoutTotal");

if (!checkoutItems) return;

if (!cart.length) {

    checkoutItems.innerHTML = `
        <div class="empty-checkout">
            <h3>🛒 Your cart is empty</h3>
            <p>Please add products before checking out.</p>
            <a href="../index.html">← Continue Shopping</a>
        </div>
    `;

    subtotalElement.textContent = formatMoney(0);
    deliveryElement.textContent = "FREE";
    totalElement.textContent = formatMoney(0);

    return;
}

let subtotal = 0;

checkoutItems.innerHTML = "";

cart.forEach(item => {

    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const itemTotal = price * quantity;

    subtotal += itemTotal;

    let image = "";

    if (item.images && item.images.length) {

        image = item.images[0].startsWith("/uploads")
            ? `https://bionic-store-backend.onrender.com/api${item.images[0]}`
            : item.images[0].startsWith("http")
                ? item.images[0]
                : `../${item.images[0]}`;

    } else if (item.image) {

        image = `../${item.image}`;

    }

    checkoutItems.innerHTML += `
        <div class="checkout-item">

            ${image ? `
                <img src="${image}" alt="${item.name}">
            ` : ""}

            <div class="checkout-item-info">

                <h3>${item.name || "Product"}</h3>

                <p>${formatMoney(price)}</p>

                <span>Quantity: ${quantity}</span>

            </div>

            <strong>
                ${formatMoney(itemTotal)}
            </strong>

        </div>
    `;
});

const deliveryFee = 0;
const total = subtotal + deliveryFee;

subtotalElement.textContent = formatMoney(subtotal);
deliveryElement.textContent = "FREE";
totalElement.textContent = formatMoney(total);


}

function applyCoupon() {

    const couponInput =
        document.getElementById("couponCode");

    const message =
        document.getElementById("couponMessage");

    const discountElement =
        document.getElementById("checkoutDiscount");

    const totalElement =
        document.getElementById("checkoutTotal");

    if (!couponInput) return;

    const code =
        couponInput.value.trim().toUpperCase();

    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                (Number(item.price) || 0) *
                (Number(item.quantity) || 1),
            0
        );

    let discount = 0;

    if (code === "BIONIC10") {

        discount = subtotal * 0.10;

        message.textContent =
            "🎉 Coupon applied! 10% discount.";

    } else {

        message.textContent =
            "❌ Invalid coupon code.";

    }

    discountElement.textContent =
        formatMoney(discount);

    totalElement.textContent =
        formatMoney(subtotal - discount);
}


async function placeOrder() {


const token = localStorage.getItem("token");

if (!token) {

    alert("Please login before placing your order.");

    window.location.href = "login.html";

    return;
}

if (!cart.length) {

    alert("Your cart is empty.");

    window.location.href = "cart.html";

    return;
}

const fullName =
    document.getElementById("fullName").value.trim();

const phone =
    document.getElementById("phone").value.trim();

const email =
    document.getElementById("email").value.trim();

const shippingAddress =
    document.getElementById("shippingAddress").value.trim();

const paymentMethod =
    document.getElementById("paymentMethod").value;

    const couponCode =
    document.getElementById("couponCode")?.value
        .trim()
        .toUpperCase() || "";

let discount = 0;

const subtotal = cart.reduce(
    (total, item) =>
        total +
        (Number(item.price) || 0) *
        (Number(item.quantity) || 1),
    0
);

if (couponCode === "BIONIC10") {
    discount = subtotal * 0.10;
}

if (!fullName || !phone || !email || !shippingAddress) {

    alert("Please complete all customer information.");

    return;
}

const products = cart.map(item => ({
    product: item._id || item.id,
    quantity: Number(item.quantity) || 1
}));

const orderData = {
    products,
    shippingAddress,
    phone,
    email,
    paymentMethod,
    customerName: fullName,
    couponCode,
    discount
};

try {

    const response = await fetch(
        `${API_BASE_URL}/orders`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        }
    );

    const data = await response.json();

    if (!response.ok) {

    if (
        response.status === 400 &&
        data.message &&
        data.message.toLowerCase().includes("stock")
    ) {
        throw new Error(
            "❌ Sorry, one or more products no longer have enough stock. Please return to your cart and update the quantities."
        );
    }

    throw new Error(
        data.message || "Failed to place order."
    );
}

    const createdOrder = data.order || data;

    localStorage.setItem(
        "lastOrder",
        JSON.stringify(createdOrder)
    );

    localStorage.removeItem("cart");

    cart = [];

    window.location.href = "order-success.html";

} catch (error) {

    console.error("PLACE ORDER ERROR:", error);

    alert(
        error.message ||
        "Something went wrong while placing your order."
    );
}


}

document.addEventListener("DOMContentLoaded", loadCheckout);

document
    .getElementById("applyCoupon")
    ?.addEventListener(
        "click",
        applyCoupon
    );