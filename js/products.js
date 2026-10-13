function renderStars(rating = 5) {
    let stars = "";

    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? "⭐" : "☆";
    }

    return stars;
}

function getStockStatus(stock) {
    if (stock > 10) {
        return `<span class="stock in-stock">✅ In Stock</span>`;
    }

    if (stock > 0) {
        return `<span class="stock low-stock">⚠️ Only ${stock} left</span>`;
    }

    return `<span class="stock out-stock">❌ Out of Stock</span>`;
}

function renderProducts() {

    const productGrid = document.getElementById("productGrid");

    if (!productGrid) return;

    if (!products || products.length === 0) {

        productGrid.innerHTML = "<h2>No products found.</h2>";

        return;

    }

    productGrid.innerHTML = "";

    products.forEach(product => {

       const image =
          product.images && product.images.length
        ? (
            product.images[0].startsWith("/uploads")
                     ? `https://bionic-store-backend.onrender.com${product.images[0]}`
                : (
                    product.images[0].startsWith("http")
                        ? product.images[0]
                        : `images/${product.images[0]}`
                  )
          )
        : `images/${product.images[0]}`

            console.log(product.images[0]);
            console.log(image);   
            console.log("IMAGE URL:", image);  

        

        productGrid.innerHTML += `
        <div class="product-card" onclick="openProduct('${product._id}')">

            ${product.badge ? `<div class="badge">${product.badge}</div>` : ""}

            <img src="${image}" alt="${product.name}">

            <h3>${product.name}</h3>

            <small>${product.category}</small>

            <div class="rating">
                ${renderStars(product.rating)}
            </div>

            <p class="price">TZS ${Number(product.price || 0).toLocaleString("en-TZ", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            })}</p>

            ${getStockStatus(product.stock)}

            <div class="product-buttons">

                ${
                    Number(product.stock || 0) > 0
                         ? `
                          <button
                             onclick="event.stopPropagation(); addToCart('${product._id}')">
                               🛒 Add to Cart
                          </button>
                       `
                      : `
                          <button
                            class="out-of-stock-btn"
                           disabled>
                           ❌ Out of Stock
                          </button>
                        `
                }

            </div>

        </div>
        `;
    });
}


function filterProducts() {

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const ratingFilter =
        document.getElementById("ratingFilter");

    if (!searchInput || !categoryFilter || !ratingFilter) {
        return;
    }

    const search =
        searchInput.value.toLowerCase().trim();

    const category =
        categoryFilter.value;

    const rating =
        ratingFilter.value;

    const filteredProducts =
        products.filter(product => {

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search);

            const matchesCategory =
                category === "all" ||
                product.category.toLowerCase() ===
                category.toLowerCase();

            const matchesRating =
                rating === "all" ||
                Number(product.rating || 0) >=
                Number(rating);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesRating
            );
        });

    renderFilteredProducts(filteredProducts);
}

function renderFilteredProducts(productList) {

    const productGrid =
        document.getElementById("productGrid");

    if (!productGrid) return;

    productGrid.innerHTML = "";

    if (!productList.length) {

        productGrid.innerHTML = `
            <h2>No products found.</h2>
        `;

        return;
    }

    productList.forEach(product => {

        const image =
            product.images && product.images.length
                ? (
                    product.images[0].startsWith("/uploads")
                        ? `https://bionic-store-backend.onrender.com/api${product.images[0]}`
                        : (
                            product.images[0].startsWith("http")
                                ? product.images[0]
                                : `images/${product.images[0]}`
                        )
                )
                : `images/${product.image}`;

        productGrid.innerHTML += `
            <div
                class="product-card"
                onclick="openProduct('${product._id}')"
            >

                ${
                    product.badge
                        ? `<div class="badge">${product.badge}</div>`
                        : ""
                }

                <img
                    src="${image}"
                    alt="${product.name}"
                >

                <h3>${product.name}</h3>

                <small>${product.category}</small>

                <div class="rating">
                    ${renderStars(product.rating)}
                </div>

                <p class="price">
                    TZS ${Number(product.price || 0).toLocaleString("en-TZ")}
                </p>

                ${getStockStatus(product.stock)}

                <div class="product-buttons">

                    <button
                        onclick="event.stopPropagation(); addToCart('${product._id}')"
                    >
                        🛒 Add to Cart
                    </button>

                </div>

            </div>
        `;
    });
}

function setupProductFilters() {

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const ratingFilter =
        document.getElementById("ratingFilter");

    const clearFilters =
        document.getElementById("clearFilters");

    if (!searchInput || !categoryFilter || !ratingFilter) {
        return;
    }

    const categories = [
        ...new Set(
            products.map(product => product.category)
        )
    ];

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });

    searchInput.addEventListener(
        "input",
        filterProducts
    );

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );

    ratingFilter.addEventListener(
        "change",
        filterProducts
    );

    clearFilters.addEventListener(
        "click",
        () => {

            searchInput.value = "";
            categoryFilter.value = "all";
            ratingFilter.value = "all";

            renderProducts();
        }
    );
}




function openProduct(id) {

    localStorage.setItem("selectedProduct", id);

    window.location.href = "pages/product.html";
}