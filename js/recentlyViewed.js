
 // =============================
 // RECENTLY VIEWED PRODUCTS
 // =============================

function saveRecentlyViewed(productId) {
    let viewed = JSON.parse(
        localStorage.getItem("recentlyViewed")
    ) || [];

    // Remove duplicate and add newest first
    viewed = viewed.filter(id => id !== productId);
    viewed.unshift(productId);

    // Keep only the latest 5
    viewed = viewed.slice(0, 5);

    localStorage.setItem(
        "recentlyViewed",
        JSON.stringify(viewed)
    );
}

function renderRecentlyViewed() {
    const container = document.getElementById("recentlyViewed");
    if (!container || !Array.isArray(products)) return;

    const viewed = JSON.parse(
        localStorage.getItem("recentlyViewed")
    ) || [];

    container.innerHTML = "";

    viewed.forEach(id => {
        const product = products.find(
            p => String(p._id || p.id) === String(id)
        );

        if (!product) return;

        const image = product.images?.[0] || product.image || "";
        const imageUrl = image
            ? image.startsWith("http")
                ? image
                : image.startsWith("/uploads/")
                    ? `https://bionic-store-backend.onrender.com${image}`
                    : `../images/${image.replace(/^.*\//, "")}`
            : "";

        const card = document.createElement("div");
        card.className = "recent-card";

        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = product.name || "Product";
        img.onerror = () => {
            img.style.display = "none";
        };

        const name = document.createElement("h4");
        name.textContent = product.name || "Product";

        const price = document.createElement("p");
        price.textContent = Number(product.price || 0).toLocaleString();

        card.append(img, name, price);

        
card.addEventListener("click", () => {
    localStorage.setItem(
        "selectedProduct",
        String(product._id || product.id)
    );

    window.location.href = "pages/product.html";
});


        container.appendChild(card);
    });
}

