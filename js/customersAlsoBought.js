function renderCustomersAlsoBought(product) {

    const container =
        document.getElementById("customersAlsoBought");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!product || !product.alsoBought) {
        return;
    }

    product.alsoBought.forEach(productId => {

        const item = products.find(
            p => String(p._id) === String(productId)
        );

        if (!item) {
            return;
        }

        const image =
            item.images && item.images.length
                ? item.images[0]
                : "";

        let imageUrl = "";

        if (image.startsWith("/uploads")) {

            imageUrl =
                `http://localhost:5000${image}`;

        } else if (image.startsWith("http")) {

            imageUrl = image;

        } else {

            imageUrl = `../${image}`;

        }

        container.innerHTML += `

            <div
                class="product-card"
                onclick="openProduct('${item._id}')"
            >

                <img
                    src="${imageUrl}"
                    alt="${item.name}"
                >

                <h4>${item.name}</h4>

                <p>
                    $${Number(item.price).toFixed(2)}
                </p>

            </div>

        `;

    });

}