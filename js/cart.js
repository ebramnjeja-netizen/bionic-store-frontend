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
            image: product.images?.[0]?.startsWith("/uploads/")
                ? `https://bionic-store-frontend.onrender.com/images/${product.images[0].split("/").pop().replace(/\.jpeg$/i, ".jpg")}`
                : (product.images?.[0] || product.image || "images/phone.jpg"),
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

        let imageUrl = item.image || "";

        // Convert old local backend upload URLs to live frontend images.
        if (
            imageUrl.includes("localhost:5000/uploads/") ||
            imageUrl.startsWith("/uploads/")
        ) {
            const filename = imageUrl
                .split("/")
                .pop()
                .replace(/\.jpeg$/i, ".jpg");

            imageUrl = `https://bionic-store-frontend.onrender.com/images/${filename}`;
        }

        // Keep local product images working.
        if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("../")) {
            imageUrl = `images/${imageUrl.replace(/^images\//, "")}`;
        }

        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${imageUrl}" width="70" alt="${item.name || "Product"}">

                <div>
                    <h4>${item.name}</h4>
                    <p>TZS ${Number(item.price || 0).toLocaleString("en-TZ")}</p>
                    <p>Qty: ${item.quantity}</p>
                </div>
            </div>
        `;
    });

    if (cartCount) cartCount.textContent = cart.length;
    if (cartTotal) {
        cartTotal.textContent = "TZS " + total.toLocaleString("en-TZ");
    }
}


function renderCartPage() {

    const container = document.getElementById("cartPageItems");
    const totalElement = document.getElementById("cartPageTotal");

    if (!container || !totalElement) return;

    container.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        container.innerHTML = "<h2>Your cart is empty.</h2>";
        totalElement.textContent = "TZS 0";
        return;

    }

    cart.forEach(item => {

        total += item.price * item.quantity;

        container.innerHTML += `
<div class="cart-page-item">

     <img
         src="${item.image?.replace(
               /^http:\/\/localhost:5000\/uploads\//,
               "https://bionic-store-frontend.onrender.com/images/"
          ).replace(/^\/uploads\//, "https://bionic-store-frontend.onrender.com/images/").replace(/\.jpeg$/i, ".jpg") || "images/phone.jpg"}"
         width="70"
         alt="${item.name || "Product"}"
    >

    <div class="cart-info">

        <h3>${item.name}</h3>

        <p>TZS ${Number(item.price || 0).toLocaleString("en-TZ")}</p>

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

        <h4>Subtotal: TZS ${(item.price * item.quantity).toLocaleString("en-TZ")}</h4>

        <button
            class="remove-btn"
            onclick="removeFromCart('${item._id}')">

            🗑 Remove

        </button>

        </div>

        </div>
        `;

    });

    totalElement.textContent = "TZS " + total.toLocaleString("en-TZ");

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

