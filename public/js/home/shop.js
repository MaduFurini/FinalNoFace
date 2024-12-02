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
        // Obtém o ID e o nome da variação clicada
        const idVarioacao = item.getAttribute('data-id');
        const nomeVarioacao = item.getAttribute('data-nome');

        // Atualiza o texto exibido com o nome da variação
        document.getElementById('selected-name').textContent = `Variação Selecionada: ${nomeVarioacao}`;

        // Armazena o ID da variação para uso posterior
        selectedId = idVarioacao;

        // Adiciona a classe 'selected' à variação clicada para mudar a cor
        document.querySelectorAll('.variacao').forEach(variacao => {
            variacao.classList.remove('selected'); // Remove a seleção de outras variações
        });

        item.classList.add('selected'); // Adiciona a classe 'selected' à variação clicada

        // Log para verificar se o ID foi armazenado
        console.log('ID da variação selecionada:', selectedId);
    });
});

function changeImage(src) {
    document.getElementById('selected-image').src = src;
}