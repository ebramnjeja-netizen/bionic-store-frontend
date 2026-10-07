// ========================================
// BIONIC STORE - CUSTOMER REVIEWS
// ========================================

function getSelectedProduct() {

    const productId =
        localStorage.getItem("selectedProduct");

    if (!productId) {
        return null;
    }

    return {
        _id: productId
    };
}


// ========================================
// LOAD REVIEWS
// ========================================

function loadReviews() {

    const product = getSelectedProduct();

    const reviewsList = document.getElementById("reviewsList");

    if (!product || !reviewsList) {
        return;
    }

    const storageKey = `reviews_${product.id}`;

    const reviews =
        JSON.parse(localStorage.getItem(storageKey)) || [];

    if (reviews.length === 0) {

        reviewsList.innerHTML = `
            <div class="no-reviews">
                ⭐ No reviews yet.
                Be the first customer to review this product!
            </div>
        `;

        return;
    }

    // ========================================
    // AVERAGE RATING
    // ========================================

    const totalRating = reviews.reduce(
        (sum, review) => sum + Number(review.rating),
        0
    );

    const averageRating =
        totalRating / reviews.length;

    const roundedRating =
        Math.round(averageRating);

    const stars =
        "⭐".repeat(roundedRating) +
        "☆".repeat(5 - roundedRating);


    // ========================================
    // RATING DISTRIBUTION
    // ========================================

    const ratingCounts = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    };

    reviews.forEach(review => {

        const rating = Number(review.rating);

        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating]++;
        }

    });


    // ========================================
    // REVIEW SUMMARY
    // ========================================

    let html = `
        <div class="review-summary">

            <div class="review-average">

                <span class="review-average-number">
                    ${averageRating.toFixed(1)}
                </span>

                <div class="review-stars">
                    ${stars}
                </div>

                <span class="review-count">
                    ${reviews.length}
                    ${reviews.length === 1 ? "review" : "reviews"}
                </span>

            </div>

            <div class="rating-breakdown">
    `;


    // Rating bars
    for (let rating = 5; rating >= 1; rating--) {

        const count = ratingCounts[rating];

        const percentage =
            (count / reviews.length) * 100;

        html += `
            <div class="rating-row">

                <span class="rating-label">
                    ${rating} ⭐
                </span>

                <div class="rating-bar">
                    <div
                        class="rating-bar-fill"
                        style="width: ${percentage}%">
                    </div>
                </div>

                <span class="rating-number">
                    ${count}
                </span>

            </div>
        `;
    }


    html += `
            </div>

        </div>

        <div class="review-list">
    `;


    // ========================================
    // INDIVIDUAL REVIEWS
    // ========================================

    reviews.forEach(review => {

        const rating =
            Number(review.rating);

        const reviewStars =
            "⭐".repeat(rating) +
            "☆".repeat(5 - rating);

        html += `
            <div class="review-card">

                <div class="review-card-header">

                    <span class="review-customer">
                        👤 ${escapeReviewHTML(review.name)}
                    </span>

                    <span class="review-date">
                        ${formatReviewDate(review.date)}
                    </span>

                </div>

                <div class="review-stars">
                    ${reviewStars}
                </div>

                <p class="review-text">
                    ${escapeReviewHTML(review.text)}
                </p>

            </div>
        `;
    });


    html += `
        </div>
    `;

    reviewsList.innerHTML = html;
}

async function hasPurchasedProduct(productId) {
    const token = localStorage.getItem("token");

    if (!token) {
        return false;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/orders/myorders`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            console.error(
                "Could not verify purchase."
            );
            return false;
        }

        const data = await response.json();

        const orders =
            Array.isArray(data)
                ? data
                : data.orders || [];

        return orders.some(order => {

            if (!Array.isArray(order.products)) {
                return false;
            }

            return order.products.some(item => {

                const orderedProductId =
                    item.product?._id ||
                    item.product;

                return String(orderedProductId) ===
                    String(productId);
            });
        });

    } catch (error) {

        console.error(
            "VERIFY PURCHASE ERROR:",
            error
        );

        return false;
    }
}

// ========================================
// SUBMIT REVIEW
// ========================================

async function submitReview() {

    const product = getSelectedProduct();

    if (!product) {
        alert("Product information not found.");
        return;
    }

    const user = getCurrentUser();

    if (!user) {
        alert("Please login before submitting a review.");
        window.location.href = "login.html";
        return;
    }

    const ratingInput =
        document.getElementById("reviewRating");

    const textInput =
        document.getElementById("reviewText");

    const rating =
        Number(ratingInput.value);

    const text =
        textInput.value.trim();


    if (!text) {
        alert("Please write your review.");
        textInput.focus();
        return;
    }

    if (rating < 1 || rating > 5) {
        alert("Please select a rating.");
        return;
    }


    const storageKey =
        `reviews_${product._id}`;

    const reviews =
        JSON.parse(localStorage.getItem(storageKey)) || [];

    const verified =
          await hasPurchasedProduct(product._id);


    reviews.unshift({

        userId: user._id || user.id || user.email,

        name: user.name,

        email: user.email,

        rating: rating,

        text: text,

        verified: verified,

        date: new Date().toISOString()

    });


    localStorage.setItem(
        storageKey,
        JSON.stringify(reviews)
    );


    ratingInput.value = "5";
    textInput.value = "";


    loadReviews();

    alert(
        "⭐ Thank you! Your review has been submitted."
    );
}

// ========================================
// FORMAT DATE
// ========================================

function formatReviewDate(date) {

    if (!date) {
        return "";
    }

    return new Date(date).toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


// ========================================
// SECURITY
// Prevent HTML entered by customers
// ========================================

function escapeReviewHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function loadReviewUser() {

    const nameInput =
        document.getElementById("reviewName");

    if (!nameInput) return;

    const user = getCurrentUser();

    if (!user) {

        nameInput.value = "";
        nameInput.placeholder =
            "Login to review";

        return;
    }

    nameInput.value =
        user.name || "";

}

// ========================================
// START REVIEWS
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadReviews();
        loadReviewUser();

    }
);