window.onload = function () {
    document.getElementById('searchInput').value = '';
}

document.querySelectorAll('.status-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const itemId = this.dataset.id;
        const newStatus = this.checked;

        fetch(`produtos/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
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
    fetch('categorias?status=1', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            return response.json()
        })
        .then(categorias => {
            const catOptions = categorias.itens.map(categoria => `
                <option value="${categoria.id}">${categoria.nome}</option>
            `).join('');

            return fetch('variacoes?status=1', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    return response.json()
                })
                .then(variacoes => {
                    const varOptions = variacoes.itens.map(variacao => `
                        <option value="${variacao.id}">${variacao.nome}</option>
                    `).join('');

                    Swal.fire({
                        title: 'Criar novo produto',
                        html: `
                            <form id="createForm" enctype="multipart/form-data">
                                <div class="form-group">
                                    <label for="nome">Nome*</label>
                                    <input type="text" class="input" id="nome" name="nome" required>
                                </div>
                                <div class="form-group">
                                    <label for="categoria">Categoria*</label>
                                    <select id="categoria" name="categoria" class="input" required>
                                        <option value="" disabled selected>Selecione uma categoria</option>
                                        ${catOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="variacao">Variação*</label>
                                    <select id="variacao" name="variacao" class="input" required>
                                        <option value="" disabled selected>Selecione uma variação</option>
                                        ${varOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="descricao">Descrição</label>
                                    <input type="text" class="input" id="descricao" name="descricao">
                                </div>
                                <div class="form-group">
                                    <label for="preco">Preço*</label>
                                    <input type="number" class="input" id="preco" name="preco" step="0.1" required>
                                </div>
                                <div class="form-group">
                                    <label for="imagem">Foto</label>
                                    <input type="file" id="imagem" name="imagem">
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
                            const categoria = document.getElementById('categoria').value;
                            const variacao = document.getElementById('variacao').value;
                            const descricao = document.getElementById('descricao').value;
                            const preco = document.getElementById('preco').value;
                            const imagem = document.getElementById('imagem').files[0];

                            if (!nome || !categoria || !variacao || !preco) {
                                Swal.showValidationMessage('Por favor, preencha todos os campos obrigatórios.');
                                return false;
                            }

                            const formData = new FormData();

                            formData.append('nome', nome);
                            formData.append('categoria', categoria);
                            formData.append('variacao', variacao);
                            formData.append('descricao', descricao);
                            formData.append('preco', preco);

                            if (imagem) {
                                formData.append('imagem', imagem);
                            }

                            return fetch('produtos', {
                                method: 'POST',
                                body: formData
                            })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Erro ao criar produto.');
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
        })
        .catch(error => {
            Swal.fire({
                title: 'Erro',
                text: `Erro ao carregar os dados: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'btn-dark-pattern',
                }
            });
        });
});

document.getElementById('itensContainer').addEventListener('click', function (event) {
    const target = event.target;
    const id = target.dataset.id;

    if (target && target.id === 'editBtn') {
        const createOptions = (items) => items.map(item => `<option value="${item.id}">${item.nome}</option>`).join('');

        Promise.all([
            fetch('categorias?status=1', { method: 'GET', headers: { 'Content-Type': 'application/json' } }).then(res => res.json()),
            fetch('variacoes?status=1', { method: 'GET', headers: { 'Content-Type': 'application/json' } }).then(res => res.json())
        ])
            .then(([categorias, variacoes]) => {
                const catOptions = createOptions(categorias.itens);
                const varOptions = createOptions(variacoes.itens);

                return fetch(`produtos/${id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
                    .then(res => res.json())
                    .then(produto => ({ catOptions, varOptions, produto }));
            })
            .then(({ catOptions, varOptions, produto }) => {
                Swal.fire({
                    title: 'Atualizar produto',
                    html: `
                        <form id="createForm" enctype="multipart/form-data">
                            <div class="form-group">
                                <label for="nome">Nome</label>
                                <input type="text" class="input" id="nome" name="nome" value="${produto.nome || ''}">
                            </div>
                            <div class="form-group">
                                <label for="categoria">Categoria</label>
                                <select id="categoria" name="categoria" class="input">
                                    <option value="" disabled selected>${produto.categoria}</option>
                                    ${catOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="variacao">Variação</label>
                                <select id="variacao" name="variacao" class="input">
                                    <option value="" disabled selected>${produto.variacao}</option>
                                    ${varOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="descricao">Descrição</label>
                                <input type="text" class="input" id="descricao" name="descricao" value="${produto.descricao || ''}">
                            </div>
                            <div class="form-group">
                                <label for="preco">Preço</label>
                                <input type="number" class="input" id="preco" name="preco" value="${produto.preco || ''}" step="0.1">
                            </div>
                            <div class="form-group">
                                <label for="imagem">Foto</label>
                                <input type="file" id="imagem" name="imagem" value="teste">
                            </div>
                            <button onclick="removeImg(${produto.id})" class="btn-danger">Remover imagem</button>
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
                        const categoria = document.getElementById('categoria').value;
                        const variacao = document.getElementById('variacao').value;
                        const descricao = document.getElementById('descricao').value;
                        const preco = document.getElementById('preco').value;
                        const imagem = document.getElementById('imagem').files[0];

                        const formData = new FormData();
                        formData.append('nome', nome);
                        formData.append('categoria', categoria);
                        formData.append('variacao', variacao);
                        formData.append('descricao', descricao);
                        formData.append('preco', preco);

                        if (imagem) {
                            formData.append('imagem', imagem);
                        }

                        return fetch(`produtos/${id}`, {
                            method: 'PUT',
                            body: formData
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Erro ao atualizar produto.');
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
            })
            .catch(error => {
                Swal.fire({
                    title: 'Erro',
                    text: `Erro ao carregar os dados: ${error.message}`,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn-dark-pattern',
                    }
                });
            });
    }

    if (target && target.id === 'deleteBtn') {
        Swal.fire({
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
            preConfirm: () => {
                return fetch(`produtos/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Erro ao excluir produto.');
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
    }
});


document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = document.getElementById('searchInput').value;

    fetch(`produtos?nome=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            render(data);
            updatePagination(data.currentPage, data.totalPages);
        })
});

document.getElementById('clean').addEventListener('click', function () {
    document.getElementById('searchInput').value = '';

    const url = new URL(window.location);
    url.searchParams.delete('nome');
    window.history.replaceState({}, '', url);
    fetchItens();
});

function fetchItens(searchTerm = '') {
    fetch(`produtos?nome=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            render(data);
            updatePagination(data.currentPage, data.totalPages);
        })
}

function render(data) {
    const itensContainer = document.getElementById('itensContainer');
    itensContainer.innerHTML = '';

    if (data.itens && data.itens.length > 0) {
        data.itens.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${item.img}" alt="${item.nome}" class="item-image">
                </td>
                <td>${item.nome}</td>
                <td>${item.categoria}</td>
                <td>${item.variacao}</td>
                <td>R$${item.preco}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" class="status-checkbox" data-id="${item.id}" ${item.status ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <button class="btn btn-dark" style="margin-right: 5px;" data-id="${item.id}">Editar</button>
                    <button class="btn btn-danger" data-id="${item.id}">Excluir</button>
                </td>
            `;
            itensContainer.appendChild(row);
        });
    } else {
        itensContainer.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">Não há produtos cadastrados</td>
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

        pageItem.innerHTML = `<a class="page-link" href="variacoes?page=${i}">${i}</a>`;
        paginationContainer.appendChild(pageItem);
    }
}

fetchItens();

function removeImg(productId) {
    Swal.fire({
        title: 'Remover Imagem',
        text: 'Você tem certeza que deseja remover a imagem deste produto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn-danger',
            cancelButton: 'btn-light'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`produtos/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ removeImg: true })
            })
                .then(response => {
                    console.log(response);
                    if (!response.ok) {
                        throw new Error('Erro ao remover a imagem');
                    }
                    return response.json();
                })
                .then(data => {
                    Swal.fire({
                        title: 'Sucesso!',
                        text: 'Imagem removida com sucesso',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn-dark'
                        }
                    });

                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                })
                .catch(error => {
                    Swal.fire('Erro', `Erro ao remover a imagem: ${error.message}`, 'error');
                });
        }
    });
}
