function searchProducts() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach(card => {

        const productName = card.querySelector("h3").textContent.toLowerCase();
        const category = card.querySelector("small").textContent.toLowerCase();

        if (
            productName.includes(keyword) ||
            category.includes(keyword)
        ) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

}

window.searchProducts = searchProducts;