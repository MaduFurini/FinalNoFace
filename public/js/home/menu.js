document.addEventListener("DOMContentLoaded", function(){
    let abrirMenu = document.getElementById("abrirMenu")
    let navbar = document.getElementById("navbar")

    // ao clicar no botão de abrir o menu ele abre o menu e some o svg
    abrirMenu.addEventListener("click", function(event){
        navbar.classList.remove("hidden")
        navbar.classList.add("absolute", "top-12", "right-0", "px-2", "py-4", "rounded-md", "flex", "flex-col", "border", "bg-black")
        // abrirMenu.classList.add("hidden")
        event.stopPropagation()
    })

    // ao clicar fora do botão de abrir o menu ou de um do seus filhos, ele fecha
    document.addEventListener("click", function(event){
        if (!abrirMenu.contains(event.target)) {
            navbar.classList.add("hidden")
            abrirMenu.classList.remove("hidden")
        }
    })
})
