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