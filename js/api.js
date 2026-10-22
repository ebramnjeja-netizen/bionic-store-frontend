const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

let products = [];

async function loadProducts() {
    try {

        const response =
            await fetch(
                `${API_BASE_URL}/products`
            );

        if (!response.ok) {
            throw new Error(
                "Failed to fetch products"
            );
        }

        products =
            await response.json();

        console.log(
            "Products loaded:",
            products
        );

        renderProducts();
        setupProductFilters();
        renderRecentlyViewed();

    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );

    }

    
}




async function loadProductDetails() {
    const detailImage = document.getElementById("detailImage");

    if (!detailImage) return;

    const productId = localStorage.getItem("selectedProduct");

    console.log("Selected product ID:", productId);

    if (!productId) {
        console.error("No selected product ID found.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
            throw new Error("Failed to load product details.");
        }

        const productList = await response.json();

        const product = productList.find(
            item => String(item._id) === String(productId)
        );

        products = productList;
        console.log("Products available for recommendations:", products.length);


        console.log("Selected product:", product);
        console.log("Product image paths:", product?.images, product?.image);




        if (!product) {
            console.error("Selected product was not found.");
            return;
        }

        const name = document.getElementById("detailName");
        const category = document.getElementById("detailCategory");
        const price = document.getElementById("detailPrice");
        const description = document.getElementById("detailDescription");
        const thumbnailGallery = document.getElementById("thumbnailGallery");

        if (name) name.textContent = product.name || "";
        if (category) category.textContent = product.category || "";
        if (price) {
            price.textContent =
                `TZS ${Number(product.price || 0).toLocaleString("en-TZ")}`;
        }
        if (description) description.textContent = product.description || "";

        const images = product.images?.length
            ? product.images
            : product.image
                ? [product.image]
                : [];

        function getDetailImageUrl(path) {
            if (!path) return "";

            if (path.startsWith("http")) {
                if (path.includes("localhost:5000/uploads/")) {
                    const filename = path.split("/").pop()
                        .replace(/\.jpeg$/i, ".jpg");
                    return `https://bionic-store-frontend.onrender.com/images/${filename}`;
                }
                return path;
            }

            const filename = path.split("/").pop()
                .replace(/\.jpeg$/i, ".jpg");

            if (path.startsWith("/uploads/")) {
                return `https://bionic-store-frontend.onrender.com/images/${filename}`;
            }

            return `../images/${filename}`;
        }

        const imageUrls = images.map(getDetailImageUrl).filter(Boolean);

        if (imageUrls.length) {
            detailImage.src = imageUrls[0];
            detailImage.alt = product.name || "Product image";
        } else {
            detailImage.removeAttribute("src");
            detailImage.alt = "No product image available";
        }

        console.log("DETAIL PAGE IMAGE URL:", detailImage.src);
        console.log("DETAIL PAGE THUMBNAILS:", imageUrls);

        if (thumbnailGallery) {
            thumbnailGallery.innerHTML = imageUrls.map((url, index) => `
                <img
                    src="${url}"
                    alt="${product.name || "Product"} image ${index + 1}"
                    class="thumb ${index === 0 ? "active" : ""}"
                    onclick="changeImage('${url}', this)"
                >
            `).join("");
        }

           console.log("Calling Customers Also Bought:", product.name);

            if (typeof renderCustomersAlsoBought === "function") {
                     renderCustomersAlsoBought(product);
                }

    } catch (error) {
        console.error("Failed to load product details:", error);
    }
}


window.addEventListener("DOMContentLoaded", async () => {
    if (document.getElementById("detailImage")) {
        await loadProductDetails();
        return;
    }

    if (document.getElementById("productGrid")) {
        await loadProducts();
    }
});









