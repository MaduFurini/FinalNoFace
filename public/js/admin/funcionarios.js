window.onload = function () {
    document.getElementById('searchInput').value = '';
}

document.addEventListener("DOMContentLoaded", function() {
    const telefones = document.querySelectorAll("#telefone");

    telefones.forEach(function(telefone) {
        let telefoneFormatado = mascaraTel(telefone.textContent);
        telefone.textContent = telefoneFormatado;
    });
});

document.querySelectorAll('.status-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const itemId = this.dataset.id;
        const newStatus = this.checked;

        fetch(`funcionarios/${itemId}`, {
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
                    <label for="tel">Telefone*</label>
                    <input type="text" class="input" id="tel" name="tel" required>
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

            const telField = document.getElementById('tel');

            if (telField) {
                telField.addEventListener('input', function () {
                    mascaraTelefone(telField);
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
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const cpf = document.getElementById('cpf').value;
            const senha = document.getElementById('senha').value;
            const telefone = document.getElementById('tel').value;

            if (!nome || !email || !cpf || !senha || !telefone) {
                Swal.showValidationMessage('Por favor, preencha todos os campos obrigatórios.');
                return false;
            }

            if (cpf.length < 11) {
                Swal.showValidationMessage('Por favor, insira todos os dígitos de seu CPF.');
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                Swal.showValidationMessage('Por favor, insira um endereço de email válido.');
                return false;
            }

            try {
                const response = await fetch('funcionarios', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-internal-request': 'true'
                    },
                    body: JSON.stringify({ nome, email, cpf, senha, telefone })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Erro ao criar funcionário.');
                }

                return Swal.fire({
                    title: 'Sucesso!',
                    text: 'Funcionário criado com sucesso.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn-dark-pattern',
                    }
                }).then(() => {
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                });
            } catch (error) {
                Swal.showValidationMessage(`Erro: ${error.message}`);
                return false;
            }
        }
    });
});

document.getElementById('itensContainer').addEventListener('click', async function (event) {
    const target = event.target;

    if (target && target.id === 'editBtn') {
        const id = target.dataset.id;

        try {
            const response = await fetch(`funcionarios/${id}`, {
                headers: {
                    'x-internal-request': 'true'
                }
            });
            const item = await response.json();

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
                            <label for="tel">Telefone*</label>
                            <input type="text" class="input" id="tel" name="tel" value="${mascaraTel(item.telefone)}">
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

                        const telField = document.getElementById('tel');

                        if (telField) {
                            telField.addEventListener('input', function () {
                                mascaraTelefone(telField);
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
                        const nome = document.getElementById('nome').value;
                        const email = document.getElementById('email').value;
                        const cpf = document.getElementById('cpf').value;
                        const senha = document.getElementById('senha').value;
                        const telefone = document.getElementById('tel').value;

                        if (cpf && cpf.length < 11) {
                            Swal.showValidationMessage('Por favor, insira todos os dígitos de seu CPF.');
                            return false;
                        }

                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                        if (!emailRegex.test(email)) {
                            Swal.showValidationMessage('Por favor, insira um endereço de email válido.');
                            return false;
                        }

                        if (telefone !== item.telefone) {
                            if (item.email === 'staynofaround@gmail.com') {
                                const result = await Swal.fire({
                                    title: 'Atenção!',
                                    text: 'O telefone indicado será utilizado para envio dos pedidos através do WhatsApp. Prosseguir?',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonText: 'OK',
                                    cancelButtonText: 'Cancelar',
                                    customClass: {
                                        confirmButton: 'btn-dark-pattern',
                                    }
                                });

                                if (result.isDismissed) {
                                    return;
                                }
                            }
                        }

                        if (email !== item.email) {
                            if (item.email === 'staynofaround@gmail.com') {
                                const result = await Swal.fire({
                                    title: 'Atenção!',
                                    text: 'Operação inválida ',
                                    icon: 'warning',
                                    showConfirmButton: false,
                                    showCancelButton: true,
                                    cancelButtonText: 'Cancelar',
                                });

                                if (result.isDismissed) {
                                    return;
                                }
                            }
                        }

                        try {
                            const updateResponse = await fetch(`funcionarios/${id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-internal-request': 'true'
                                },
                                body: JSON.stringify({nome, email, cpf, senha, telefone})
                            });

                            const data = await updateResponse.json();

                            if (!updateResponse.ok) {
                                throw new Error(data.message || 'Erro ao atualizar funcionário.');
                            }

                            await Swal.fire({
                                title: 'Sucesso!',
                                text: data.message || 'Funcionário atualizado com sucesso.',
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
                text: `Erro ao buscar funcionário: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'btn-dark-pattern',
                }
            });
        }
    }
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
                    'Content-Type': 'application/json',
                    'x-internal-request': 'true'
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

    fetch(`funcionarios?nome=${encodeURIComponent(searchTerm)}`, {
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
    fetch(`funcionarios?nome=${encodeURIComponent(searchTerm)}`, {
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
                <td>${item.nome}</td>
                <td>${item.email}</td>
                <td id="telefone">${item.telefone}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" class="status-checkbox" data-id="${item.id}" ${item.status ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
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

function mascaraTelefone(campo) {
    let value = campo.value.replace(/\D/g, '');
    if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})(\d{1})/, '($1) $2-$3$4');
    }

    if (value.length > 15) {
        value = value.substring(0, 15);
    }

    campo.value = value;
}

function mascaraTel(telefone) {
    telefone = telefone.replace(/\D/g, "");

    if (telefone.length <= 10) {
        telefone = telefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
        telefone = telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    return telefone;
}