document.addEventListener("DOMContentLoaded", function(){
    let abrirMenu = document.getElementById("abrirMenu")
    let navbar = document.getElementById("navbar")

    abrirMenu.addEventListener("click", function(event){
        navbar.classList.remove("hidden")
        navbar.classList.add("absolute", "top-12", "right-0", "px-2", "py-4", "rounded-md", "flex", "flex-col", "border", "bg-gray-950")
        event.stopPropagation()
    })

    document.addEventListener("click", function(event){
        if (!navbar.contains(event.target)) {
            navbar.classList.add("hidden")
            abrirMenu.classList.remove("hidden")
        }
    })
});

document.querySelectorAll('#buttonBuy').forEach(item => {
    item.addEventListener('click', function () {
        const produtoId = this.dataset.id;

        console.log(produtoId);
        fetch(`/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ parameter: produtoId })
        }).then(data => {
            window.location.href = '/noFace/home/produto';
        })
    });
});