document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function () {
        const produtoId = this.dataset.id;

        fetch(`/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ parameter: produtoId })
        }).then(data => {
            window.location.href = 'produto';
        })
    });
});

document.querySelectorAll('.spoiler').forEach(item => {
    item.addEventListener('click', function () {
        document.getElementById('selected-image').src = item.getAttribute('src');
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