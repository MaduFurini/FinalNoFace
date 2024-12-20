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