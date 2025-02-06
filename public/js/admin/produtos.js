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
    // Primeiro, busca as categorias
    fetch('categorias?status=1', {
        method: 'GET',
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-internal-request': 'true'
        }
    })
        .then(response => response.json())
        .then(categorias => {
            const catOptions = categorias.itens.map(categoria => `
            <option value="${categoria.id}">${categoria.nome}</option>
        `).join('');

            // Criação do modal de novo produto
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
                        <label for="descricao">Descrição</label>
                        <input type="text" class="input" id="descricao" name="descricao">
                    </div>
                    <div class="form-group">
                        <label for="preco">Preço*</label>
                        <input type="number" class="input" id="preco" name="preco" step="0.1" required>
                    </div>
                    <div class="form-group">
                        <label for="imagens">Fotos</label>
                        <input type="file" id="imagens" name="imagens[]" multiple>
                    </div>
                </form>
            `,
                showCancelButton: true,
                confirmButtonText: 'Criar Produto',
                cancelButtonText: 'Cancelar',
                customClass: {
                    confirmButton: 'btn-dark-pattern',
                    cancelButton: 'btn-light-pattern'
                },
                preConfirm: () => {
                    const nome = document.getElementById('nome').value;
                    const categoria = document.getElementById('categoria').value;
                    const descricao = document.getElementById('descricao').value;
                    const preco = document.getElementById('preco').value;
                    const imagens = document.getElementById('imagens').files;

                    if (!nome || !categoria || !preco) {
                        Swal.showValidationMessage('Por favor, preencha todos os campos obrigatórios.');
                        return false;
                    }

                    const formData = new FormData();
                    formData.append('nome', nome);
                    formData.append('categoria', categoria);
                    formData.append('descricao', descricao);
                    formData.append('preco', preco);

                    if (imagens.length > 0) {
                        for (let i = 0; i < imagens.length; i++) {
                            formData.append('imagens', imagens[i]);
                        }
                    }

                    openVariacoesModal(formData, false);
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
});

function openVariacoesModal(formData, produtoId) {
    if (produtoId) {
        fetch(`produtos/variacoes/${produtoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-request': 'true'
            }
        })
            .then(response => response.json())
            .then(variacoesProduto => {
                const variacoes = Object.values(variacoesProduto.itens);
                const variacoesProdutoIds = variacoes.map(variacao => variacao.id);

                fetch('variacoes?status=1', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-internal-request': 'true'
                    }
                })
                    .then(response => response.json())
                    .then(variacoes => {
                        const varOptions = variacoes.itens.map(variacao => {
                            const isChecked = variacoesProdutoIds.includes(variacao.id);
                            return `
                        <div class="form-group">
                            <input type="checkbox" id="variacao_${variacao.id}" name="variacoes" value="${variacao.id}" ${isChecked ? 'checked' : ''}>
                            <label for="variacao_${variacao.id}">${variacao.nome}</label>
                        </div>
                    `;
                        }).join('');

                        Swal.fire({
                            title: 'Escolha as Variações',
                            html: `
                        <form id="variacaoForm">
                            ${varOptions}
                        </form>
                    `,
                            showCancelButton: true,
                            confirmButtonText: 'Confirmar Variações',
                            cancelButtonText: 'Cancelar',
                            customClass: {
                                confirmButton: 'btn-dark-pattern',
                                cancelButton: 'btn-light-pattern'
                            },
                            preConfirm: () => {
                                const variacoesSelecionadas = [];
                                document.querySelectorAll('input[name="variacoes"]:checked').forEach(checkbox => {
                                    variacoesSelecionadas.push(checkbox.value);
                                });

                                if (variacoesSelecionadas.length === 0) {
                                    Swal.showValidationMessage('Por favor, selecione ao menos uma variação.');
                                    return false;
                                }

                                formData.append('variacoes', JSON.stringify(variacoesSelecionadas));

                                return fetch(`produtos/${produtoId}`, {
                                    method: 'PUT',
                                    headers: {
                                        'x-internal-request': 'true'
                                    },
                                    body: formData
                                })
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error(response.error);
                                        }
                                        return response.json();
                                    })
                                    .then(data => {
                                        Swal.fire({
                                            title: 'Sucesso!',
                                            text: 'Variações associadas com sucesso!',
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
                            text: `Erro ao carregar as variações: ${error.message}`,
                            icon: 'error',
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'btn-dark-pattern',
                            }
                        });
                    });
            })
            .catch(error => {
                Swal.fire({
                    title: 'Erro',
                    text: `Erro ao carregar as variações associadas ao produto: ${error.message}`,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn-dark-pattern',
                    }
                });
            });

    } else {
        // Caso não tenha produtoId, apenas retorna as variações de status 1
        fetch('variacoes?status=1', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-request': 'true'
            }
        })
            .then(response => response.json())
            .then(variacoes => {
                const varOptions = variacoes.itens.map(variacao => `
                <div class="form-group">
                    <input type="checkbox" id="variacao_${variacao.id}" name="variacoes" value="${variacao.id}">
                    <label for="variacao_${variacao.id}">${variacao.nome}</label>
                </div>
            `).join('');

                Swal.fire({
                    title: 'Escolha as Variações',
                    html: `
                    <form id="variacaoForm">
                        ${varOptions}
                    </form>
                `,
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar Variações',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'btn-dark-pattern',
                        cancelButton: 'btn-light-pattern'
                    },
                    preConfirm: () => {
                        const variacoesSelecionadas = [];
                        document.querySelectorAll('input[name="variacoes"]:checked').forEach(checkbox => {
                            variacoesSelecionadas.push(checkbox.value);
                        });

                        if (variacoesSelecionadas.length === 0) {
                            Swal.showValidationMessage('Por favor, selecione ao menos uma variação.');
                            return false;
                        }

                        formData.append('variacoes', JSON.stringify(variacoesSelecionadas));

                        return fetch('produtos/', {
                            method: 'POST',
                            headers: {
                                'x-internal-request': 'true'
                            },
                            body: formData
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(response.error);
                                }
                                return response.json();
                            })
                            .then(data => {
                                Swal.fire({
                                    title: 'Sucesso!',
                                    text: 'Variações associadas com sucesso!',
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
                    text: `Erro ao carregar as variações: ${error.message}`,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn-dark-pattern',
                    }
                });
            });
    }
}

document.getElementById('itensContainer').addEventListener('click', async function (event) {
    const target = event.target;
    const id = target.dataset.id;

    if (target && target.id === 'editBtn') {
        try {
            const categorias = await fetch('categorias?status=1', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'x-internal-request': 'true' }
            }).then(res => res.json());

            const produto = await fetch(`produtos/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'x-internal-request': 'true' }
            }).then(res => res.json());

            const catOptions = categorias.itens.map(item => `<option value="${item.id}">${item.nome}</option>`).join('');

            const imagemHTML = produto.imagens.map(img => {
                if (img !== 'Nenhuma imagem disponível') {
                    return `
                        <div class="image-container">
                            <img src="${img}" />
                            <input type="checkbox" class="remove-img" data-path="${img}">
                        </div>
                    `;
                }
                return '';
            }).join('');

            Swal.fire({
                title: 'Atualizar produto',
                html: `
                    <form id="updateForm" enctype="multipart/form-data">
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
                            <label for="descricao">Descrição</label>
                            <input type="text" class="input" id="descricao" name="descricao" value="${produto.descricao || ''}">
                        </div>
                        <div class="form-group">
                            <label for="preco">Preço</label>
                            <input type="number" class="input" id="preco" name="preco" value="${produto.preco || ''}" step="0.1">
                        </div>
                        <div class="form-group">
                            <label>Imagens Atuais - selecione para excluí-las</label>
                            <div id="imagensAtuais">${imagemHTML || '<p>Nenhuma imagem</p>'}</div>
                        </div>
                        <div class="form-group">
                            <label for="imagens">Novas Imagens</label>
                            <input type="file" id="imagens" name="imagens" multiple>
                        </div>
                    </form>
                `,
                showCancelButton: true,
                confirmButtonText: 'Atualizar',
                cancelButtonText: 'Cancelar',
                customClass: {
                    confirmButton: 'btn-dark'
                },
                preConfirm: async () => {
                    const nome = document.getElementById('nome').value;
                    const categoria = document.getElementById('categoria').value;
                    const descricao = document.getElementById('descricao').value;
                    const preco = document.getElementById('preco').value;
                    const imagens = document.getElementById('imagens').files;

                    const removerImagens = Array.from(document.querySelectorAll('.remove-img:checked')).map(checkbox => checkbox.dataset.path);

                    const formData = new FormData();
                    formData.append('nome', nome);
                    formData.append('categoria', categoria);
                    formData.append('descricao', descricao);
                    formData.append('preco', preco);

                    for (const imagem of imagens) {
                        formData.append('imagens', imagem);
                    }

                    formData.append('removerImagens', JSON.stringify(removerImagens));

                    openVariacoesModal(formData, id);
                }
            });
        } catch (error) {
            Swal.fire({
                title: 'Erro',
                text: `Erro ao carregar os dados: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'btn-dark-pattern'
                }
            });
        }
    }

    // Ação de excluir produto
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
                        'Content-Type': 'application/json',
                        'x-internal-request': 'true'
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

    fetch(`produtos?nome=${encodeURIComponent(searchTerm)}`, {
        headers: {
            'x-internal-request': 'true'
        }
    })
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
    fetch(`produtos?nome=${encodeURIComponent(searchTerm)}`, {
        headers: {
            'x-internal-request': 'true'
        }
    })
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
                    'Content-Type': 'application/json',
                    'x-internal-request': 'true'
                },
                body: JSON.stringify({ removeImg: true })
            })
                .then(response => {
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
