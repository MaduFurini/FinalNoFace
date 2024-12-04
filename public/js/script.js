window.addEventListener('DOMContentLoaded', function () {
    const regex = /\/(\d+)$/;

    const storedId = sessionStorage.getItem('lastId');

    if (storedId) {
        const currentUrl = window.location.href.split('#')[0];

        if (!regex.test(currentUrl)) {
            const newUrl = `${currentUrl}/${storedId}`;
            history.replaceState(null, null, newUrl);
        }
    }

    let urlWithoutHash = window.location.href.split('#')[0];
    const match = urlWithoutHash.match(regex);

    if (match) {
        const id = match[1];
        console.log('ID encontrado na URL:', id);

        sessionStorage.setItem('lastId', id);

        urlWithoutHash = urlWithoutHash.replace(regex, '');
        history.replaceState(null, null, urlWithoutHash);
    }
});

function clearSession () {
    fetch(`/set/${null}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(r => null)
}
