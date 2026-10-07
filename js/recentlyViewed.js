// =============================
// RECENTLY VIEWED PRODUCTS
// =============================

function saveRecentlyViewed(productId) {

    let viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    // Remove duplicate if it already exists
    viewed = viewed.filter(id => id !== productId);

    // Add newest to the beginning
    viewed.unshift(productId);

    // Keep only the latest 5
    viewed = viewed.slice(0, 5);

    localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
}

function renderRecentlyViewed() {

    const container = document.getElementById("recentlyViewed");

    if (!container) return;

    const viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    container.innerHTML = "";

    viewed.forEach(id => {

        const product = products.find(p => p.id === id);

        if (!product) return;

        container.innerHTML += `

        <div class="recent-card" onclick="openProduct(${product.id})">

            <img src="../${product.images[0]}" alt="${product.name}">

            <h4>${product.name}</h4>

            <p>$${product.price}</p>

        </div>

        `;

    });

}