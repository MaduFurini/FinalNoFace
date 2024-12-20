const container = document.getElementById('container');

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

const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('confirmPassword');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;

    if (type === 'password') {
        togglePassword.innerHTML = '&#128065;';
    } else {
        togglePassword.innerHTML = '&#128064;';
    }
});
