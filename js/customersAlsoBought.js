
function renderCustomersAlsoBought(product) {
    const container = document.getElementById("customersAlsoBought");

    if (!container) {
        console.log("Customers Also Bought section not found");
        return;
    }

    container.innerHTML = "";

    if (!product || !Array.isArray(products)) {
        console.log("Product list is not ready");
        return;
    }

    const currentId = String(product._id || product.id);
    const category = String(product.category || "")
    .toLowerCase()
    .replace(/s$/, "");

    const recommendations = products.filter(item =>
        String(item._id || item.id) !== currentId &&
        category &&
        String(item.category || "")
             .toLowerCase()
             .replace(/s$/, "") === category
    ).slice(0, 4);

    console.log("Customers Also Bought recommendations:", recommendations);

    if (recommendations.length === 0) {
        container.innerHTML = "<p>No related products available yet.</p>";
        return;
    }

    recommendations.forEach(item => {
        const image = item.images?.[0] || item.image || "";
        const filename = image.split("/").pop();

        let imageUrl = "";
        if (image.startsWith("http")) {
            imageUrl = image;
        } else if (image.startsWith("/uploads/")) {
            imageUrl = `https://bionic-store-frontend.onrender.com/images/${filename}`;
        } else if (filename) {
            imageUrl = `../images/${filename}`;
        }

        const card = document.createElement("div");
        card.className = "product-card";
        card.style.cursor = "pointer";

        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = item.name || "Product image";
        img.onerror = () => {
            img.style.display = "none";
        };

        const name = document.createElement("h4");
        name.textContent = item.name || "Product";

        const price = document.createElement("p");
        price.textContent =
            `TZS ${Number(item.price || 0).toLocaleString("en-TZ")}`;

        card.append(img, name, price);

        card.addEventListener("click", () => {
            localStorage.setItem(
                "selectedProduct",
                String(item._id || item.id)
            );
            window.location.href = "product.html";
        });

        container.appendChild(card);
    });
}



