const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

const token = localStorage.getItem("token");

const productId = new URLSearchParams(window.location.search).get("id");

document.addEventListener("DOMContentLoaded", () => {

    loadProduct();

    document
        .getElementById("editProductForm")
        .addEventListener("submit", updateProduct);

});

async function loadProduct() {

    try {

const response = await fetch(
    `${API_BASE_URL}/products/admin/${productId}`,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);



        const product = await response.json();

        if (!response.ok) {
            throw new Error(product.message || "Failed to load product.");
        }

        document.getElementById("name").value = product.name;

        document.getElementById("price").value = product.price;

        document.getElementById("costPrice").value = product.costPrice ?? 0;

        document.getElementById("stock").value = product.stock;

        document.getElementById("category").value = product.category;

        document.getElementById("description").value = product.description;

        document.getElementById("rating").value = product.rating;

        document.getElementById("badge").value = product.badge || "";

        document.getElementById("image").value =
            product.images && product.images.length > 0
                ? product.images[0]
                : "";

    } catch (error) {

        console.error(error);

        alert(error.message || "Failed to load product.");

    }

}

async function updateProduct(e) {

    e.preventDefault();

    const updatedProduct = {

        name: document.getElementById("name").value,

        price: Number(
            document.getElementById("price").value
        ),

        costPrice: Number(
            document.getElementById("costPrice").value
        ),

        stock: Number(
            document.getElementById("stock").value
        ),

        category: document.getElementById("category").value,

        description: document.getElementById("description").value,

        rating: Number(
            document.getElementById("rating").value
        ),

        badge: document.getElementById("badge").value,

        images: [
            document.getElementById("image").value
        ]

    };

    try {

        const response = await fetch(
            `${API_BASE_URL}/products/${productId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(updatedProduct)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to update product."
            );
        }

        alert("✅ Product updated successfully!");

        window.location.href = "manage-products.html";

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}