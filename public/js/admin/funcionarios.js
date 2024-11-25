window.onload = function () {
    document.getElementById('searchInput').value = '';
}

document.querySelectorAll('.status-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const itemId = this.dataset.id;
        const newStatus = this.checked;

        fetch(`funcionarios/${itemId}`, {
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
    Swal.fire({
        title: 'Criar novo funcionário',
        html: `
            <form id="createForm">
                <div class="form-group">
                    <label for="nome">Nome*</label>
                    <input type="text" class="input" id="nome" name="nome" required>
                </div>
                <div class="form-group">
                    <label for="cpf">CPF*</label>
                    <input type="text" class="input" id="cpf" name="cpf" required>
                </div>
                <div class="form-group">
                    <label for="email">Email*</label>
                    <input type="text" class="input" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="senha">Senha*</label>
                    <input type="password" class="input" id="senha" name="senha" required>
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
        preConfirm: () => {
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const cpf = document.getElementById('cpf').value;
            const senha = document.getElementById('senha').value;

            if (!nome || !email || !cpf || !senha) {
                Swal.showValidationMessage('Por favor, preencha todos os campos obrigatórios.');
                return false;
            }

            return fetch('funcionarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, email, cpf, senha })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao criar funcionário.');
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

document.getElementById('editBtn').addEventListener('click',   function () {
    const id = document.getElementById('editBtn').dataset.id;

    fetch(`funcionarios/${id}`)
        .then(response => response.json())
        .then(item => {
            if (item) {
                Swal.fire({
                    title: 'Atualizar funcionário',
                    html: `
                        <form id="createForm">
                            <div class="form-group">
                                <label for="nome">Nome</label>
                                <input type="text" class="input" id="nome" name="nome" value="${item.nome}">
                            </div>
                            <div class="form-group">
                                <label for="cpf">CPF</label>
                                <input type="text" class="input" id="cpf" name="cpf" value="${item.cpf}">
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="text" class="input" id="email" name="email" value="${item.email}">
                            </div>
                            <div class="form-group">
                                <label for="senha">Senha</label>
                                <input type="password" class="input" id="senha" name="senha">
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
                    preConfirm: () => {
                        const nome = document.getElementById('nome').value;
                        const email = document.getElementById('email').value;
                        const cpf = document.getElementById('cpf').value;
                        const senha = document.getElementById('senha').value;

                        return fetch(`funcionarios/${id}}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ nome, email, cpf, senha })
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Erro ao atualizar funcionário.');
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
                                Swal.showValidationMessage(`Erro: ${error.error}`);
                            });
                    }
                });
            }
        })
});

document.getElementById('deleteBtn').addEventListener('click', function () {
    const id = document.getElementById('deleteBtn').dataset.id;

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
            return fetch(`funcionarios/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao excluir funcionário.');
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
    })
});

document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = document.getElementById('searchInput').value;

    fetch(`funcionarios?nome=${encodeURIComponent(searchTerm)}`)
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
    fetch(`funcionarios?nome=${encodeURIComponent(searchTerm)}`)
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
                <td>${item.nome}</td>
                <td>${item.email}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" class="status-checkbox" data-id="${item.id}" ${item.status ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <button class="btn btn-dark" style="margin-right: 5px;" data-id="${item.id}">Editar</button>
                </td>
            `;
            itensContainer.appendChild(row);
        });
    } else {
        itensContainer.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">Não há funcionários cadastrados</td>
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

        pageItem.innerHTML = `<a class="page-link" href="funcionarios?page=${i}">${i}</a>`;
        paginationContainer.appendChild(pageItem);
    }
}

fetchItens();

function mascaraCpf(cpfInput) {
    let valor = cpfInput.value.replace(/\D/g, '');

    if (valor.length > 11) valor = valor.slice(0, 11);

    cpfInput.value = valor
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    if (valor.length === 11) {
        if (!validarCPF(valor)) {
            Swal.fire({
                title: 'Erro!',
                text: 'CPF não é válido, por favor digite um correto.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            cpfInput.value = '';
        }
    }
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(9))) {
        return false;
    }

    soma = 0;

    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(10))) {
        return false;
    }

    return true;
}