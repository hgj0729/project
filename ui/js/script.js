const menuOpenButton = document.getElementById("menuOpenButton");
const menuCloseButton = document.getElementById("menuCloseButton");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");

function openMobileMenu() {
    mobileMenu.classList.add("open");
    menuOverlay.classList.add("open");

    mobileMenu.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
    mobileMenu.classList.remove("open");
    menuOverlay.classList.remove("open");

    mobileMenu.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}

menuOpenButton.addEventListener("click", openMobileMenu);
menuCloseButton.addEventListener("click", closeMobileMenu);
menuOverlay.addEventListener("click", closeMobileMenu);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeMobileMenu();
    }
});