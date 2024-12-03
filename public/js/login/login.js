const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const cpfField = document.getElementById('cpf');
const emailField = document.getElementById('email');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

window.onload = function () {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = errorContainer.getAttribute('data-error');

    if (errorMessage) {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: errorMessage,
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
        }).then(() => {
            errorContainer.setAttribute('data-error', '');
            window.location.href = '/noFace/login'
        });
    }
};


registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

cpfField.addEventListener('input', function () {
    mascaraCpf(cpfField);
});

emailField.addEventListener('blur', function () {
    const email = emailField.value.trim();
    if (!emailRegex.test(email)) {
        Swal.fire({
            title: 'Erro!',
            text: 'Por favor, insira um endereço de email válido.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        emailField.value = '';
    }
});

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
