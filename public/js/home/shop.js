document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function () {
        const produtoId = this.dataset.id;


        window.location.href = `produto/${produtoId}`;
    });
});
