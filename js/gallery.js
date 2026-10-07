function changeImage(image, thumb) {

    document.getElementById("detailImage").src = image;

    document.querySelectorAll(".thumb").forEach(t => {
        t.classList.remove("active");
    });

    thumb.classList.add("active");

}

window.changeImage = changeImage;