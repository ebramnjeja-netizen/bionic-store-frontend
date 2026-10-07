const API_BASE_URL = "http://localhost:5000/api";

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

    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );

    }
}

window.addEventListener(
    "DOMContentLoaded",
    loadProducts
);