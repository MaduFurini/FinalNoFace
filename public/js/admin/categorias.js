window.onload = function () {
    document.getElementById('searchInput').value = '';
}

document.querySelectorAll('.status-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const itemId = this.dataset.id;
        const newStatus = this.checked;

        fetch(`categorias/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-request': 'true'
            },
            body: JSON.stringify({ status: newStatus })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao atualizar o status');
                }

                return response.json();
            })
            .catch(error => {
                this.checked = !newStatus;

                Swal.fire({
                    title: 'Erro',
                    text: 'Erro ao atualizar o status. Tente novamente.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn-danger'
                    }
                });
            });
    });
});

document.getElementById('newItem').addEventListener('click', function () {
    Swal.fire({
        title: 'Criar nova categoria',
        html: `
            <form id="createForm">
                <div class="form-group">
                    <label for="nome">Nome*</label>
                    <input type="text" class="input" id="nome" name="nome" required>
                </div>
                <div class="form-group">
                    <label for="descricao">Descrição</label>
                    <input type="text" class="input" id="descricao" name="descricao">
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn-dark-pattern',
            cancelButton: 'btn-light-pattern'
        },
        preConfirm: () => {
            const nome = document.getElementById('nome').value;
            const descricao = document.getElementById('descricao').value;

            if (!nome) {
                Swal.showValidationMessage('Por favor, preencha todos os campos obrigatórios.');
                return false;
            }

            return fetch('categorias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-request': 'true'
                },
                body: JSON.stringify({ nome, descricao })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao criar categoria.');
                    }

                    return response.json();
                })
                .then(data => {
                    Swal.fire({
                        title: 'Sucesso!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn-dark-pattern',
                        }
                    });

                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                })
                .catch(error => {
                    Swal.showValidationMessage(`Erro: ${error.message}`);
                });
        }
    });
});

document.getElementById('itensContainer').addEventListener('click', async function (event) {
    const target = event.target;

    if (target && target.id === 'editBtn') {
        const id = target.dataset.id;

        try {
            const response = await fetch(`categorias/${id}`, {
                headers: {
                    'x-internal-request': 'true'
                }
            });
            const item = await response.json();

            if (item) {
                const { nome, descricao } = item;

                const result = await Swal.fire({
                    title: 'Atualizar categoria',
                    html: `
                        <form id="createForm">
                            <div class="form-group">
                                <label for="nome">Nome</label>
                                <input type="text" class="input" id="nome" name="nome" value="${nome}">
                            </div>
                            <div class="form-group">
                                <label for="descricao">Descrição</label>
                                <input type="text" class="input" id="descricao" name="descricao" value="${descricao}">
                            </div>
                        </form>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'btn-dark-pattern',
                        cancelButton: 'btn-light-pattern'
                    },
                    preConfirm: async () => {
                        const nome = document.getElementById('nome').value;
                        const descricao = document.getElementById('descricao').value;

                        try {
                            const updateResponse = await fetch(`categorias/${id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-internal-request': 'true'
                                },
                                body: JSON.stringify({ nome, descricao })
                            });

                            const data = await updateResponse.json();

                            if (!updateResponse.ok) {
                                throw new Error(data.message || 'Erro ao atualizar categoria.');
                            }

                            await Swal.fire({
                                title: 'Sucesso!',
                                text: data.message || 'Categoria atualizada com sucesso.',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                customClass: {
                                    confirmButton: 'btn-dark-pattern',
                                }
                            });

                            setTimeout(() => {
                                location.reload();
                            }, 1500);

                        } catch (error) {
                            Swal.showValidationMessage(`Erro: ${error.message}`);
                        }
                    }
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Erro',
                text: `Erro ao buscar categoria: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'btn-dark-pattern',
                }
            });
        }
    }

    if (target && target.id === 'deleteBtn') {
        const id = target.dataset.id;

        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Essa ação não pode ser desfeita!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'btn-dark-pattern',
                cancelButton: 'btn-light-pattern'
            },

            preConfirm: async () => {
                try {
                    const deleteResponse = await fetch(`categorias/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-internal-request': 'true'
                        },
                    });

                    const data = await deleteResponse.json();

                    if (!deleteResponse.ok) {
                        throw new Error(data.message || 'Erro ao excluir categoria.');
                    }

                    await Swal.fire({
                        title: 'Sucesso!',
                        text: data.message || 'Categoria excluída com sucesso.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn-dark-pattern',
                        }
                    });

                    setTimeout(() => {
                        location.reload();
                    }, 1500);

                } catch (error) {
                    Swal.showValidationMessage(`Erro: ${error.message}`);
                }
            }
        });
    }
});


document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = document.getElementById('searchInput').value;

    fetch(`categorias?nome=${encodeURIComponent(searchTerm)}`, {
        headers: {
            'x-internal-request': 'true'
        }
    })
        .then(response => response.json())
        .then(data => {
            render(data);
            updatePagination(data.currentPage, data.totalPages);
        })
        .catch(error => console.error('Erro ao buscar categorias:', error));
});

document.getElementById('clean').addEventListener('click', function () {
    document.getElementById('searchInput').value = '';

    const url = new URL(window.location);
    url.searchParams.delete('nome');
    window.history.replaceState({}, '', url);
    fetchItens();
});

function fetchItens(searchTerm = '') {
    fetch(`categorias?nome=${encodeURIComponent(searchTerm)}`, {
        headers: {
            'x-internal-request': 'true'
        }
    })
        .then(response => response.json())
        .then(data => {
            render(data);
            updatePagination(data.currentPage, data.totalPages);
        })
        .catch(error => console.error('Erro ao buscar categorias:', error));
}

function render(data) {
    const itensContainer = document.getElementById('itensContainer');
    itensContainer.innerHTML = '';

    if (data.itens && data.itens.length > 0) {
        data.itens.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.nome}</td>
                <td>${item.descricao}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" class="status-checkbox" data-id="${item.id}" ${item.status ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <button id="editBtn" class="btn btn-dark" style="margin-right: 5px;" data-id="${item.id}">Editar</button>
                    <button id="deleteBtn" class="btn btn-danger" data-id="${item.id}">Excluir</button>
                </td>
            `;
            itensContainer.appendChild(row);
        });
    } else {
        itensContainer.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">Não há categorias cadastradas</td>
            </tr>
        `;
    }
}

function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        if (i === currentPage) {
            pageItem.classList.add('active');
        }

        pageItem.innerHTML = `<a class="page-link" href="categorias?page=${i}">${i}</a>`;
        paginationContainer.appendChild(pageItem);
    }
}

fetchItens();


