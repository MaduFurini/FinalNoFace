document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function () {
        const produtoId = this.dataset.id;


        window.location.href = `produto/${produtoId}`;
    });
});

document.querySelectorAll('.spoiler').forEach(item => {
    item.addEventListener('click', function () {
        const largeImageUrl = item.getAttribute('src');
        console.log(largeImageUrl)

        document.getElementById('selected-image').src = largeImageUrl;

        console.log('Imagem trocada para:', largeImageUrl);
    });
});

let selectedId = null;

document.querySelectorAll('.variacao').forEach(item => {
    item.addEventListener('click', function () {
        const idVarioacao = item.getAttribute('data-id');
        const nomeVarioacao = item.getAttribute('data-nome');

        document.getElementById('selected-name').textContent = `Variação Selecionada: ${nomeVarioacao}`;

        selectedId = idVarioacao;

        document.querySelectorAll('.variacao').forEach(variacao => {
            variacao.classList.remove('selected');
        });

        item.classList.add('selected');
    });
});