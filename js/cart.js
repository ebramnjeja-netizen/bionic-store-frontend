// =============================
// CART
// =============================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {

    const product = products.find(
        p => p._id === productId
    );

    if (!product) {
        alert("Product not found.");
        return;
    }

    const stock = Number(product.stock || 0);

    if (stock <= 0) {
        alert("❌ This product is currently out of stock.");
        return;
    }

    const existing = cart.find(
        item => item._id === productId
    );

    if (existing) {

        if (existing.quantity >= stock) {
            alert(`⚠️ Only ${stock} item(s) available in stock.`);
            return;
        }

        existing.quantity++;

    } else {

        cart.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0].startsWith("/uploads")
                ? `http://localhost:5000${product.images[0]}`
                : product.images[0],
            quantity: 1
        });

    }

    saveCart();
    updateCart();

    alert(product.name + " added to cart!");
}

function updateCart() {

    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItems) return;

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        total += item.price * item.quantity;

        cartItems.innerHTML += `
            <div class="cart-item">

                <img src="${item.image}" width="70">

                <div>

                    <h4>${item.name}</h4>

                    <p>$${item.price}</p>

                    <p>Qty: ${item.quantity}</p>

                </div>

            </div>
        `;

    });

    cartCount.textContent = cart.length;
    cartTotal.textContent = "$" + total.toFixed(2);

}

function renderCartPage() {

    const container = document.getElementById("cartPageItems");
    const totalElement = document.getElementById("cartPageTotal");

    if (!container || !totalElement) return;

    container.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        container.innerHTML = "<h2>Your cart is empty.</h2>";
        totalElement.textContent = "$0.00";
        return;

    }

    cart.forEach(item => {

        total += item.price * item.quantity;

        container.innerHTML += `
<div class="cart-page-item">

    <img src="../${item.image}" width="120">

    <div class="cart-info">

        <h3>${item.name}</h3>

        <p>£${item.price}</p>

        <div class="qty-controls">

            <button onclick="decreaseQuantity('${item._id}')">
                -
            </button>

            <span>${item.quantity}</span>

            <p>📦 Available: ${getProductStock(item._id)}</p>

            <button onclick="increaseQuantity('${item._id}')">
                +
            </button>

        </div>

        <h4>Subtotal: £${(item.price * item.quantity).toFixed(2)}</h4>

        <button
            class="remove-btn"
            onclick="removeFromCart('${item._id}')">

            🗑 Remove

        </button>

        </div>

        </div>
        `;

    });

    totalElement.textContent = "$" + total.toFixed(2);

}

function increaseQuantity(productId) {

    const item = cart.find(
        p => p._id === productId
    );

    if (!item) return;

    const product = products.find(
        p => p._id === productId
    );

    if (!product) return;

    const stock = Number(product.stock || 0);

    if (item.quantity >= stock) {
        alert(`⚠️ Only ${stock} item(s) available in stock.`);
        return;
    }

    item.quantity++;

    saveCart();
    updateCart();
    renderCartPage();
}

function decreaseQuantity(productId) {

    const item = cart.find(p => p._id === productId);

    if (!item) return;

    item.quantity--;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCart();
    renderCartPage();

}

function removeFromCart(productId) {

    cart = cart.filter(item => item._id !== productId);

    saveCart();
    updateCart();
    renderCartPage();

}

function clearCart() {

    cart = [];

    saveCart();

    updateCart();

    renderCartPage();

}


function getProductStock(productId) {

    const product = products.find(
        p => p._id === productId
    );

    if (!product) {
        return "Unknown";
    }

    return Number(product.stock || 0);
}

