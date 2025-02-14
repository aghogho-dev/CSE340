document.addEventListener("DOMContentLoaded", async () => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    if (cartItems.length > 0) {
        const response = await fetch("/inv/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart: cartItems }),
        });

        if (response.ok) {
            console.log("Cart data sent to the server");
            console.log(response)
        } else {
            console.error("Failed to send cart data");
        }
    }
});




