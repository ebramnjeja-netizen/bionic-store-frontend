document.addEventListener("DOMContentLoaded", async () => {

    if (typeof updateNavbarUser === "function") {
        updateNavbarUser();
    }

    if (typeof updateCart === "function") {
        updateCart();
    }

    if (typeof renderRecentlyViewed === "function") {
        renderRecentlyViewed();
    }

});



