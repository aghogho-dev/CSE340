const addToCartButton = document.querySelector(".add-to-cart");

if (addToCartButton) {
    addToCartButton.addEventListener("click", async function () {
        const inv_id = parseInt(this.getAttribute("data-id"));

        console.log("Inventory Id in add cart.js:", inv_id);
        console.log(typeof inv_id);

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        let productIndex = cart.findIndex(item => item[0].inv_id == inv_id); 

        if (productIndex !== -1) {
            cart[productIndex][0].quantity += 1;
        } else {
            try {
                console.log("Fetching product from server...");

                let response = await fetch(`/inv/cart/${inv_id}`);

                if (!response.ok) {
                    throw new Error("Product not found");
                }

                let productData = await response.json();

                productData[0].quantity = 1; 

                cart.push(productData); 
            } catch (error) {
                console.error("Error fetching product:", error);
                return; 
            }
        }

        localStorage.setItem("cart", JSON.stringify(cart)); 

        alert("Product added to cart!");
    });
} else {
    console.error("Add to Cart button not found in the DOM.");
}
