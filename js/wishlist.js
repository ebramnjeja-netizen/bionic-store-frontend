let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

function toggleWishlist(id){

    if(wishlist.includes(id)){
        wishlist = wishlist.filter(item => item !== id);
    }else{
        wishlist.push(id);
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    alert("Wishlist updated ❤️");
}

window.toggleWishlist = toggleWishlist;