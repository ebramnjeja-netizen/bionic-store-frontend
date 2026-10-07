// =============================
// PRODUCT COMPARISON
// =============================

let compareList = JSON.parse(localStorage.getItem("compareList")) || [];

function addToCompare(id){

    if(compareList.includes(id)){
        alert("Product already selected.");
        return;
    }

    if(compareList.length >= 2){
        alert("You can compare only 2 products.");
        return;
    }

    compareList.push(id);

    localStorage.setItem(
        "compareList",
        JSON.stringify(compareList)
    );

    alert("Added for comparison!");
}

window.addToCompare = addToCompare;




function renderComparison(){

    const table = document.getElementById("compareTable");

    if(!table) return;

    const selected = compareList.map(id =>
        products.find(p => p.id === id)
    );

    if(selected.length < 2){

        table.innerHTML =
            "<h2>Select two products to compare.</h2>";

        return;

    }

    table.innerHTML = `

<table class="compare-table">

<tr>

<th>Feature</th>

<th>${selected[0].name}</th>

<th>${selected[1].name}</th>

</tr>

<tr>

<td>Image</td>

<td><img src="../${selected[0].images[0]}" width="150"></td>

<td><img src="../${selected[1].images[0]}" width="150"></td>

</tr>

<tr>

<td>Price</td>

<td>$${selected[0].price}</td>

<td>$${selected[1].price}</td>

</tr>

<tr>

<td>Brand</td>

<td>${selected[0].brand}</td>

<td>${selected[1].brand}</td>

</tr>

<tr>

<td>Category</td>

<td>${selected[0].category}</td>

<td>${selected[1].category}</td>

</tr>

<tr>

<td>Rating</td>

<td>${selected[0].rating} ⭐</td>

<td>${selected[1].rating} ⭐</td>

</tr>

<tr>

<td>Stock</td>

<td>${selected[0].stock}</td>

<td>${selected[1].stock}</td>

</tr>

</table>

`;

}

renderComparison();