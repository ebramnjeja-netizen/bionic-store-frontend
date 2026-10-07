const imageContainer = document.querySelector(".image-container");
const mainImage = document.getElementById("detailImage");

if (imageContainer && mainImage) {

    imageContainer.addEventListener("mousemove", (e) => {

        const rect = imageContainer.getBoundingClientRect();

        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        mainImage.style.transformOrigin = `${x}% ${y}%`;
    });

    imageContainer.addEventListener("mouseleave", () => {
        mainImage.style.transformOrigin = "center center";
    });

}