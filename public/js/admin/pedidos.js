window.onload = function () {
    document.getElementById('searchInput').value = '';
}

document.getElementById('itensContainer').addEventListener('click', async function (event) {
    const target = event.target;

    if (target && target.id === 'editBtn') {
        const id = target.dataset.id;

        try {
            const response = await fetch(`pedidos/${id}`);
            const item = await response.json();

            if (item) {
                const statusOptions = [
                    "Realizado",
                    "Em andamento",
                    "Entregue",
                    "Cancelado",
                    "Inativado",
                ];

                const pagOptions = [
                    "debito",
                    "credito",
                    "dinheiro",
                    "pix",
                ];

                const selectedStatus = item.status;
                const selectedPag = item.formaPagamento;

                const filteredOptions = statusOptions.filter(status => status !== selectedStatus);
                const filteredOptionsPag = pagOptions.filter(pag => pag !== selectedPag);

                Swal.fire({
                    title: 'Atualizar pedido',
                    html: `
                    <form id="createForm">
                        <div class="form-group">
                            <label for="status">Status</label>
                            <select id="status" name="status" class="input">
                                <option value="${selectedStatus}" disabled selected>${selectedStatus}</option>
                                ${filteredOptions.map(status => `<option value="${status}">${status}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="formaPag">Forma de pagamento</label>
                            <select id="formaPag" name="formaPag" class="input">
                                <option value="${selectedPag}" disabled selected>${selectedPag}</option>
                                ${filteredOptionsPag.map(pag => `<option value="${pag}">${pag}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="observacao">Observação</label>
                            <input type="text" class="input" id="observacao" name="observacao" value="${item.observacao ?? ''}">
                        </div>
                    </form>
                `,
                    didOpen: () => {
                        const cpfField = document.getElementById('cpf');
                        if (cpfField) {
                            cpfField.addEventListener('input', function () {
                                mascaraCpf(cpfField);
                            });
                        }
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'btn-dark-pattern',
                        cancelButton: 'btn-light-pattern'
                    },
                    preConfirm: async () => {
                        const status = document.getElementById('status').value;
                        const obs = document.getElementById('observacao').value;
                        const formaPag = document.getElementById('formaPag').value;

                        try {
                            const updateResponse = await fetch(`pedidos/${id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ status, obs, formaPag })
                            });

                            const data = await updateResponse.json();

                            if (!updateResponse.ok) {
                                throw new Error(data.message || 'Erro ao atualizar pedido.');
                            }

                            await Swal.fire({
                                title: 'Sucesso!',
                                text: data.message || 'Pedido atualizado com sucesso.',
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
                text: `Erro ao buscar pedido: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'btn-dark-pattern',
                }
            });
        }
    }
});


// document.getElementById('deleteBtn').addEventListener('click', function () {
//     const id = document.getElementById('deleteBtn').dataset.id;
//
//     Swal.fire({
//         title: 'Tem certeza?',
//         text: "Essa ação não pode ser desfeita!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonText: 'Sim, excluir!',
//         cancelButtonText: 'Cancelar',
//         customClass: {
//             confirmButton: 'btn-dark-pattern',
//             cancelButton: 'btn-light-pattern'
//         },
//
//         preConfirm: () => {
//             return fetch(`funcionarios/${id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//             })
//                 .then(response => {
//                     if (!response.ok) {
//                         throw new Error('Erro ao excluir funcionário.');
//                     }
//
//                     return response.json();
//                 })
//                 .then(data => {
//                     Swal.fire({
//                         title: 'Sucesso!',
//                         text: data.message,
//                         icon: 'success',
//                         confirmButtonText: 'OK',
//                         customClass: {
//                             confirmButton: 'btn-dark-pattern',
//                         }
//                     });
//
//                     setTimeout(() => {
//                         location.reload();
//                     }, 1500);
//                 })
//                 .catch(error => {
//                     Swal.showValidationMessage(`Erro: ${error.message}`);
//                 });
//         }
//     })
// });

document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = document.getElementById('searchInput').value;

    fetch(`pedidos?codigo=${encodeURIComponent(searchTerm)}`)
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
    fetch(`pedidos?codigo=${encodeURIComponent(searchTerm)}`)
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
                <td>${item.codigo}</td>
                <td style="position: relative;">
                  <span
                    class="material-symbols-sharp info-icon"
                    style="color: blue; cursor: pointer;"
                    data-id="${item.id_usuario}>"
                    onmouseover="buscarCliente(this)"
                    onmouseout="esconderTooltip(this)">
                    info
                  </span>
                  <div class="tooltip" style="display: none;">
                    Carregando...
                  </div>
                </td>
                <td style="position: relative;">
                  <span
                    class="material-symbols-sharp info-icon"
                    style="color: blue; cursor: pointer;"
                    data-id="${item.id}>"
                    onmouseover="buscarPedido(this)"
                    onmouseout="esconderTooltip(this)">
                    info
                  </span>
                  <div class="tooltip" style="display: none;">
                    Carregando...
                  </div>
                </td>
                <td>R$${item.valorTotal}</td>
                <td>${item.formaPagamento}</td>
                <td>${item.observacao}</td>
                <td>${item.status}</td>
                <td>
                  ${new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'America/Sao_Paulo'
                    }).format(new Date(item.createdAt))}
                </td>
                <td>
                    <button id="editBtn" class="btn btn-dark" style="margin-right: 5px;" data-id="${item.id}">Editar</button>
                </td>
            `;
            itensContainer.appendChild(row);
        });
    } else {
        itensContainer.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center;">Não há funcionários cadastrados</td>
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

        pageItem.innerHTML = `<a class="page-link" href="pedidos?page=${i}">${i}</a>`;
        paginationContainer.appendChild(pageItem);
    }
}

fetchItens();

function mostrarTooltip(element, content) {
    const tooltip = element.nextElementSibling;

    tooltip.innerHTML = content;
    tooltip.style.display = 'block';

    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + window.scrollY}px`;
    tooltip.style.left = `${rect.left + window.scrollX}px`;
}

function esconderTooltip(element) {
    const tooltip = element.nextElementSibling;
    tooltip.style.display = 'none';
}

function buscarCliente(element) {
    const usuarioId = element.getAttribute('data-id');

    mostrarTooltip(element, 'Carregando...');

    fetch(`usuarios/${usuarioId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar usuário');
            }
            return response.json();
        })
        .then(user => {
            if (user) {
                const content = `
                    <div>
                        <strong>Cliente:</strong> ${user.nome}<br>
                        <strong>CPF:</strong> ${user.cpf}<br>
                    </div>
                    <hr>
                `;
                mostrarTooltip(element, content);
            } else {
                mostrarTooltip(element, 'Usuário não encontrado.');
            }
        })
        .catch(() => {
            mostrarTooltip(element, 'Erro ao carregar informações do cliente.');
        });
}

function buscarPedido(element) {
    const pedidoId = element.getAttribute('data-id');
    const tooltip = element.nextElementSibling;

    mostrarTooltip(element, 'Carregando...');

    fetch(`pedidos/produtos/${pedidoId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos');
            }

            return response.json();
        })
        .then(produtos => {
            if (produtos.length === 0) {
                mostrarTooltip(element, 'Nenhum produto encontrado.');
                return;
            }

            let content = '';
            produtos.forEach(p => {
                content += `
                    <div>
                        <strong>Nome do Produto:</strong> ${p.nome}<br>
                        <strong>Quantidade:</strong> ${p.quantidade}
                    </div>
                    <hr>
                `;
            });
            mostrarTooltip(element, content);
        })
        .catch(() => {
            mostrarTooltip(element, 'Erro ao carregar produtos.');
        });
}
