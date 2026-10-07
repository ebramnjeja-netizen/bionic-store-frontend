const API_BASE_URL = "https://bionic-store-backend.onrender.com/api";

const token = localStorage.getItem("token");

if (!token) {
    alert("Please login as admin.");
    window.location.href = "login.html";
}

let uploadedImage = "";

// ==========================
// Image Preview
// ==========================
document.getElementById("productImage").addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        document.getElementById("previewImage").src = e.target.result;
        document.getElementById("previewImage").style.display = "block";

    };

    reader.readAsDataURL(file);

});

// ==========================
// Upload Image
// ==========================
async function uploadImage() {

    const file = document.getElementById("productImage").files[0];

    if (!file) {
        return "";
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {

        method: "POST",

        headers: {
            Authorization: `Bearer ${token}`
        },

        body: formData

    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    uploadedImage = data.imageUrl;

    return uploadedImage;

}

// ==========================
// Add Product
// ==========================
document.getElementById("addProductForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    try {

        const image = await uploadImage();

        const product = {

            name: document.getElementById("name").value,

            price: Number(document.getElementById("price").value),

            category: document.getElementById("category").value,

            description: document.getElementById("description").value,

            rating: Number(document.getElementById("rating").value),

            badge: document.getElementById("badge").value,

            stock: Number(document.getElementById("stock").value),

            images: image ? [image] : []

        };

        const response = await fetch(`${API_BASE_URL}/products`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`

            },

            body: JSON.stringify(product)

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        alert("✅ Product added successfully!");

        document.getElementById("addProductForm").reset();

        document.getElementById("previewImage").style.display = "none";

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});