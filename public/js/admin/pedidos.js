window.onload = function () {
    document.getElementById('searchInput').value = '';
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toggle-details').forEach(toggle => {
        toggle.addEventListener('click', function () {
            const detailsRow = this.closest('tr').nextElementSibling;

            if (detailsRow.style.display === 'none' || detailsRow.style.display === '') {
                detailsRow.style.display = 'table-row';
                buscarPedido(toggle);
            } else {
                detailsRow.style.display = 'none';
            }
        });
    });
});

// Ação para editar pedido
document.getElementById('itensContainer').addEventListener('click', async function (event) {
    const target = event.target;

    if (target && target.id === 'editBtn') {
        const id = target.dataset.id;

        try {
            const response = await fetch(`pedidos/${id}`, {
                headers: { 'x-internal-request': 'true' }
            });
            const item = await response.json();

            if (item) {
                const statusOptions = ["Realizado", "Em andamento", "Entregue", "Cancelado", "Inativado", "Devolvido", "Trocado"];
                const pagOptions = ["debito", "credito", "dinheiro", "pix"];
                const selectedStatus = item.status;
                const selectedPag = item.formaPagamento === null ? 'Indefinido' : item.formaPagamento;

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
                                <label for="contato">Forma de contato</label>
                                <input type="text" class="input" id="contato" name="contato" value="${item.contato ?? ''}">
                            </div>
                            <div class="form-group">
                                <label for="observacao">Observação</label>
                                <input type="text" class="input" id="observacao" name="observacao" value="${item.observacao ?? ''}">
                            </div>
                        </form>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: ' btn-dark'
                    },
                    preConfirm: async () => {
                        const status = document.getElementById('status').value;
                        let obs = document.getElementById('observacao').value;
                        const formaPag = document.getElementById('formaPag').value;
                        const contato = document.getElementById('contato').value;

                        if (obs.trim() === '') {
                            obs = null;
                        }
                        try {
                            const updateResponse = await fetch(`pedidos/${id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-internal-request': 'true'
                                },
                                body: JSON.stringify({ status, obs, formaPag, contato })
                            });

                            if (!updateResponse.ok) {
                                throw new Error('Erro ao atualizar pedido.');
                            }

                            Swal.fire('Sucesso!', 'Pedido atualizado com sucesso.', 'success');
                            setTimeout(() => location.reload(), 1500);
                        } catch (error) {
                            Swal.showValidationMessage(`Erro: ${error.message}`);
                        }
                    }
                });
            }
        } catch (error) {
            Swal.fire('Erro', `Erro ao buscar pedido: ${error.message}`, 'error');
        }
    }
});

document.getElementById('deleteBtn').addEventListener('click', function () {
    const id = this.dataset.id;

    Swal.fire({
        title: 'Tem certeza?',
        text: "Essa ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: ' btn-dark'
        },
        preConfirm: () => {
            return fetch(`pedidos/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'x-internal-request': 'true' }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Erro ao excluir pedido.');
                    return response.json();
                })
                .then(data => {
                    Swal.fire('Sucesso!', data.message, 'success');
                    setTimeout(() => location.reload(), 1500);
                })
                .catch(error => Swal.showValidationMessage(`Erro: ${error.message}`));
        }
    });
});

document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = this.value;

    fetch(`pedidos?codigo=${encodeURIComponent(searchTerm)}`, {
        headers: { 'x-internal-request': 'true' }
    })
        .then(response => response.json())
        .then(data => {
            render(data);
            updatePagination(data.currentPage, data.totalPages);
        });
});

document.getElementById('clean').addEventListener('click', function () {
    document.getElementById('searchInput').value = '';
    const url = new URL(window.location);
    url.searchParams.delete('nome');
    window.history.replaceState({}, '', url);
    fetchItens();
});

function fetchItens() {
    fetch('pedidos')
        .then(response => response.json())
        .then(data => {
            render(data);
            updatePagination(data.currentPage, data.totalPages);
        })
        .catch(error => {
            console.error('Erro ao carregar itens:', error);
        });
}

function render(data) {
    const itensContainer = document.getElementById('itensContainer');
    itensContainer.innerHTML = '';

    if (data.itens && data.itens.length > 0) {
        data.itens.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.codigo}</td>
                <td>R$${item.valorTotal}</td>
                <td>${item.formaPagamento ? item.formaPagamento : 'Indefinido' }</td>
                <td>${item.observacao ? item.observacao : '' }</td>
                <td>${item.status}</td>
                <td>${item.contato}</td>
                <td>${new Date(item.createdAt).toLocaleString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}</td>
                <td>${new Date(item.updatedAt).toLocaleString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}</td>
                <td>
                    <button id="editBtn" class="btn btn-dark" style="margin-right: 5px;" data-id="${item.id}">Editar</button>
                    <button id="deleteBtn" class="btn btn-danger" data-id="${item.id}">Excluir</button>
                    <button class="toggle-details" data-id="${item.id}">Abrir Detalhes</button>
                </td>
            `;
            itensContainer.appendChild(row);
        });
    } else {
        itensContainer.innerHTML = '<tr><td colspan="8">Nenhum pedido encontrado</td></tr>';
    }
}

// Atualizar paginação
function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.innerHTML = `<a href="pedidos?page=${i}">${i}</a>`;
        paginationContainer.appendChild(pageItem);
    }
}

function mostrarTooltip(element, content) {
    const tooltip = element.nextElementSibling;
    if (tooltip) {
        tooltip.innerHTML = content;
        tooltip.style.display = 'block';

        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.bottom + window.scrollY}px`;
        tooltip.style.left = `${rect.left + window.scrollX}px`;
    }
}

function esconderTooltip(element) {
    const tooltip = element.nextElementSibling;
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

function buscarPedido(element) {
    const pedidoId = element.getAttribute('data-id');

    mostrarTooltip(element, 'Carregando...');

    fetch(`pedidos/produtos/${pedidoId}`, {
        headers: {
            'x-internal-request': 'true'
        }
    })
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

            let produtosContent = '';
            produtos.forEach(p => {
                produtosContent += `
                    <div>
                        <strong>Nome do Produto:</strong> ${p.nome}<br>
                        <strong>Quantidade:</strong> ${p.quantidade}<br>
                        <strong>Preço:</strong> R$${p.preco}<br>
                        <strong>Variação:</strong> ${p.variacao}<br>
                    </div>
                    <hr>
                `;
            });

            document.getElementById('pedido-produtos').innerHTML = produtosContent;

            mostrarTooltip(element, 'Detalhes carregados.');
        })
        .catch(() => {
            mostrarTooltip(element, 'Erro ao carregar produtos.');
        });
}


function filtrarPedidosPorStatus() {
    const status = document.getElementById("statusFilter").value.toLowerCase();
    const rows = document.querySelectorAll("#itensContainer tr");
    let found = false;

    rows.forEach(row => {
        const statusCell = row.querySelector("td:nth-child(6)");
        if (statusCell) {
            const cellValue = statusCell.textContent.toLowerCase();
            if (status === "" || cellValue === status) {
                row.style.display = "";
                found = true;
            } else {
                row.style.display = "none";
            }
        }
    });

    const noResultsMessage = document.getElementById("noResultsMessage");
    if (!found) {
        if (!noResultsMessage) {
            const noResultsRow = document.createElement("tr");
            noResultsRow.id = "noResultsMessage";
            noResultsRow.innerHTML = `
                <td colspan="8" style="text-align: center;">Não há pedidos correspondentes</td>
            `;
            document.getElementById("itensContainer").appendChild(noResultsRow);
        }
    } else {
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
}
