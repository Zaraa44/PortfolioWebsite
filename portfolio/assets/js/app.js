document.querySelector('.scroll-arrow').addEventListener('click', () => {
    const next = document.querySelector('.hero').nextElementSibling;
    if (next) {
        next.scrollIntoView({ behavior: "smooth" });
    }
});
