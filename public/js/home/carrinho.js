document.addEventListener("DOMContentLoaded", () => {
    const btnAddCart = document.getElementById("btn-add-cart");
    const cartModal = document.getElementById("cart-modal");
    const closeModal = document.getElementById("close-modal");
    const cartItems = document.getElementById("cart-items");
    const btnOpenCart = document.getElementById("open-cart");
    const btnCheckout = document.getElementById("btn-confirm");
    const btnClearCart = document.getElementById("btn-clear-cart");
    const variacoes = document.querySelectorAll(".variacao");
    const errorMessage = document.getElementById("error-message");

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
        if (!selectedVariacao) {
            Swal.fire({
                icon: 'error',
                title: 'Selecione uma variação',
                text: 'Por favor, escolha uma variação antes de adicionar ao carrinho.',
            });
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
                    },
                    quantidade: 1
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
                    atualizarBotoes(carrinho);
                    Swal.fire({
                        icon: 'success',
                        title: 'Adicionado ao carrinho',
                        text: `${produto.nome} foi adicionado ao seu carrinho.`,
                        customClass: {
                            confirmButton: 'btn-dark'
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'Item já no carrinho',
                        text: 'Este item já foi adicionado ao carrinho.',
                        customClass: {
                            confirmButton: 'btn-dark'
                        }
                    });
                }
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro de servidor',
                    text: 'Tente novamente mais tarde.',
                });
            });
    });

    function atualizarModal(carrinho) {
        cartItems.innerHTML = "";
        carrinho.forEach((item, index) => {
            const li = document.createElement("li");
            li.classList.add("cart-item", "p-2", "border-b", "border-gray-300", "flex", "items-center", "space-x-4");

            li.innerHTML = `
            <img src="${item.img}" alt="${item.nome}" class="w-16 h-16 object-cover rounded" id="cart-img" />
            <div class="flex-1">
                <p class="text-sm font-medium">${item.nome}</p>
                <p class="text-xs text-gray-500">Variação: ${item.variacao.nome}</p>
                <p class="text-sm text-gray-700">R$ ${item.preco.toFixed(2)}</p>
            </div>
            <div class="flex items-center space-x-2">
                <button class="btn-quantity" data-index="${index}" data-action="decrement">➖</button>
                <span class="text-sm font-medium">${item.quantidade}</span>
                <button class="btn-quantity" data-index="${index}" data-action="increment">➕</button>
            </div>
        `;
            cartItems.appendChild(li);
        });

        document.querySelectorAll('.btn-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                const action = e.target.dataset.action;
                if (action === 'increment') {
                    carrinho[index].quantidade++;
                } else if (action === 'decrement' && carrinho[index].quantidade > 1) {
                    carrinho[index].quantidade--;
                }

                localStorage.setItem("carrinho", JSON.stringify(carrinho));

                atualizarModal(carrinho);
            });
        });
    }

    function atualizarBotoes(carrinho) {
        if (carrinho.length > 0) {
            btnCheckout.classList.remove("hidden");
            btnClearCart.classList.remove("hidden");
        } else {
            btnCheckout.classList.add("hidden");
            btnClearCart.classList.add("hidden");
        }
    }

    btnClearCart.addEventListener("click", () => {
        console.log(123);
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Isso irá limpar todos os itens do carrinho.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, limpar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'btn-dark'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("carrinho");
                atualizarModal([]);
                atualizarBotoes([]);
                Swal.fire('Carrinho limpo', 'Seu carrinho foi esvaziado.', 'success');
            }
        });
    });

    closeModal.addEventListener("click", () => {
        cartModal.classList.remove("show");
        cartModal.classList.add("hide");
    });

    btnOpenCart.addEventListener("click", () => {
        cartModal.classList.remove("hide");
        cartModal.classList.add("show");
    });

    const carrinhoInicial = JSON.parse(localStorage.getItem("carrinho")) || [];
    atualizarModal(carrinhoInicial);
    atualizarBotoes(carrinhoInicial);


    btnCheckout.addEventListener("click", () => {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        Swal.fire({
            title: 'Insira seu nome',
            input: 'text',
            inputPlaceholder: 'Digite seu nome',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Por favor, insira seu nome!';
                }
            },
            customClass: {
                confirmButton: 'btn-dark'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const userName = result.value;

                const total = carrinho.reduce((acc, item) => acc + (item.preco * (item.quantidade || 1)), 0);

                const compraData = {
                    valorTotal: total,
                    produtos: carrinho.map(item => ({
                        produto: item.produto,
                        variacao: item.variacao.data,
                        categoria: item.categoria.data,
                        quantidade: item.quantidade,
                        preco: item.preco
                    }))
                };

                try {
                    const response = await fetch('/noFace/admin/pedidos/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-internal-request': 'true'
                        },
                        body: JSON.stringify({ carrinho: compraData }),
                    });

                    if (!response.ok) {
                        throw new Error('Erro ao registrar a compra.');
                    }

                    const data = await response.json();

                    if (data.error) {
                        throw new Error(data.error);
                    }

                    const codigoGerado = data.codigo;

                    let mensagem = `Olá, meu nome é ${userName}. Gostaria de confirmar a seguinte compra:\n\n`;
                    carrinho.forEach((item, index) => {
                        mensagem += `*${index + 1}. Produto:* ${item.nome}\n`;
                        mensagem += `*Variação:* ${item.variacao.nome}\n`;
                        mensagem += `*Categoria:* ${item.categoria.nome}\n`;
                        mensagem += `*Quantidade:* ${item.quantidade || 1}\n`;
                        mensagem += `*Preço:* R$ ${item.preco.toFixed(2)}\n\n`;
                    });

                    mensagem += `*Total da compra:* R$ ${total.toFixed(2)}\n`;
                    mensagem += `*Código do Pedido:* ${codigoGerado}\n\n`;
                    mensagem += "Aguardo a confirmação!";

                    const numeroWhatsApp = "5519997633071";
                    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

                    Swal.fire({
                        icon: 'success',
                        title: 'Compra concluída!',
                        text: 'Redirecionando para o WhatsApp...',
                        showConfirmButton: false,
                        timer: 2000
                    });

                    setTimeout(() => {
                        window.open(urlWhatsApp, "_blank");
                    }, 2000);

                } catch (error) {
                    console.error('Erro ao processar a compra:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Não foi possível concluir a compra. Tente novamente mais tarde.',
                    });
                }
            }
        });
    });

});
