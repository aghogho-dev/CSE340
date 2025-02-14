const showHideBtn = document.querySelector("#show-hide");
showHideBtn.addEventListener("click", () => {
    const pwInput = document.querySelector("#account_password");
    const typeAttr = pwInput.getAttribute("type");

    if (typeAttr === "password") {
        pwInput.setAttribute("type", "text");
        showHideBtn.innerHTML = "Hide Password";
        console.log("Hide password");
    } else {
        pwInput.setAttribute("type", "password");
        showHideBtn.innerHTML = "Show Password";
        console.log("Show password");
    }
});
