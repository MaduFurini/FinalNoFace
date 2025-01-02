document.addEventListener("DOMContentLoaded", () => {
    const btnAddCart = document.getElementById("btn-add-cart");
    const cartModal = document.getElementById("cart-modal");
    const closeModal = document.getElementById("close-modal");
    const cartItems = document.getElementById("cart-items");
    const variacoes = document.querySelectorAll(".variacao");
    const errorMessage = document.getElementById("error-message");
    const btnOpenCart = document.getElementById("open-cart");

    let selectedVariacao = null;

    variacoes.forEach((variacao) => {
        variacao.addEventListener("click", () => {
            variacoes.forEach((v) => v.classList.remove("bg-gray-300"));
            variacao.classList.add("bg-gray-300");
            selectedVariacao = {
                id: variacao.dataset.id,
                nome: variacao.dataset.nome,
            };

            document.getElementById("selected-name").textContent = `Variação: ${variacao.dataset.nome}`;

            errorMessage.classList.add("hidden");
        });
    });

    btnAddCart.addEventListener("click", () => {
        localStorage.removeItem("carrinho");

        if (!selectedVariacao) {
            errorMessage.classList.remove("hidden");
            errorMessage.style.color = 'red';
            return;
        }

        const produtoId = btnAddCart.dataset.id;

        fetch(`/noFace/admin/produtos/${produtoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-request': 'true'
            }
        })
            .then(response => response.json())
            .then(produto => {
                const item = {
                    produto: produto.id,
                    nome: produto.nome,
                    preco: produto.preco,
                    img: produto.img,
                    variacao: {
                        nome: selectedVariacao.nome,
                        data: selectedVariacao.id
                    },
                    categoria: {
                        nome: produto.categoria,
                        data: produto.id_categoria
                    }
                };

                const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

                const itemExistente = carrinho.some(existingItem =>
                    existingItem.produto === item.produto &&
                    existingItem.variacao.data === item.variacao.data
                );

                if (!itemExistente) {
                    carrinho.push(item);
                    localStorage.setItem("carrinho", JSON.stringify(carrinho));
                    atualizarModal(carrinho);
                    cartModal.classList.remove("hide");
                    cartModal.classList.add("show"); // Abre com animação
                }
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro de servidor, tente novamente',
                    text: error,
                    confirmButtonText: 'Ok',
                    customClass: {
                        title: 'font-family',
                        text: 'font-family',
                        confirmButton: 'btn-second'
                    }
                }).then(() => {
                    window.location.href = '/noFace/home/shop'
                });
            });
    });

    function atualizarModal(carrinho) {
        cartItems.innerHTML = "";
        carrinho.forEach((item) => {
            const li = document.createElement("li");
            li.classList.add("cart-item", "p-2", "border-b", "border-gray-300", "flex", "items-center", "space-x-2");

            li.innerHTML = `
                <div>
                    <p class="text-sm font-medium">${item.nome}</p>
                    <p class="text-xs text-gray-500">Variação: ${item.variacao.nome}</p>
                    <p class="text-sm text-gray-700">R$ ${item.preco}</p>
                </div>
            `;
            cartItems.appendChild(li);
        });
    }

    closeModal.addEventListener("click", () => {
        cartModal.classList.remove("show");
        cartModal.classList.add("hide");
    });

    btnOpenCart.addEventListener("click", () => {
        cartModal.classList.remove("hide");
        cartModal.classList.add("show");
    });

    // Carrega o carrinho ao carregar a página
    const carrinhoInicial = JSON.parse(localStorage.getItem("carrinho")) || [];
    atualizarModal(carrinhoInicial);
});
