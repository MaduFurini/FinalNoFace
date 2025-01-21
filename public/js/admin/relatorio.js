function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

document.getElementById('generateReportBtn').addEventListener('click', function () {
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;

    if (!startDateInput || !endDateInput) {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Por favor, insira as datas de início e fim.',
        });
        return;
    }

    const start = new Date(startDateInput);
    const end = new Date(endDateInput);

    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() + 1);

    if (start > end) {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'A data de início não pode ser maior que a data de fim.',
            customClass: {
                confirmButton: 'btn-dark'
            }
        });
        return;
    }

    const formattedStartDate = formatDate(start);
    const formattedEndDate = formatDate(end);


    const data = {
        dataInicio: start,
        dataFim: end
    };

    fetch(`/noFace/admin/pedidos/relatorio`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-internal-request': 'true'
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sem Pedidos',
                    text: 'Não há pedidos para o período selecionado.',
                    customClass: {
                        confirmButton: 'btn-dark'
                    }
                });
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('l', 'mm', 'a4');

            doc.addImage("/images/dark_noFaceLogo.png", "PNG", 10, 10, 20, 20);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Relatório de Pedidos", 50, 20);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text(`Período: ${formattedStartDate} até ${formattedEndDate}`, 50, 30);
            doc.setLineWidth(0.5);
            doc.line(10, 35, 290, 35);

            let yOffset = 45;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Código", 14, yOffset);
            doc.text("Valor Total", 50, yOffset);
            doc.text("Status", 80, yOffset);
            doc.text("Observação", 120, yOffset);
            doc.text("Forma pagamento", 180, yOffset);
            doc.text("Data", 240, yOffset);
            doc.text("Pago", 270, yOffset);
            doc.line(10, yOffset + 5, 290, yOffset + 5);

            yOffset += 10;

            data.forEach(({ pedido, produtos }) => {
                const formattedDate = formatDate(pedido.createdAt);

                doc.setFont("helvetica", "normal");

                doc.text(pedido.codigo, 14, yOffset);
                doc.text(`R$ ${pedido.valorTotal.toFixed(2)}`, 50, yOffset);
                doc.text(pedido.status, 80, yOffset);
                doc.text(pedido.observacao === null ? ' ' : pedido.observacao, 120, yOffset);
                doc.text(pedido.formaPagamento === null ? ' ' : pedido.formaPagamento, 180, yOffset);
                doc.text(formattedDate, 240, yOffset);
                doc.text(pedido.pago === 1 ? 'Sim' : 'Não', 270, yOffset);
                yOffset += 10;

                if (yOffset > 260) {
                    doc.addPage();
                    yOffset = 20;
                }

                fetch(`/noFace/admin/pedidos/${pedido.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-internal-request': 'true'
                    },
                    body: JSON.stringify({ exibir: true }),
                })

                doc.setFont("helvetica", "bold");
                doc.text("Contato:", 14, yOffset);
                doc.setFont("helvetica", "normal");
                doc.text(pedido.contato, 35, yOffset);

                yOffset += 10;

                const categorias = [...new Set(produtos.map(produto => produto.categoria))];
                categorias.forEach(categoria => {
                    doc.setFont("helvetica", "bold");

                    doc.text(`Categoria: ${categoria}`, 14, yOffset);
                    yOffset += 6;

                    const produtosCategoria = produtos.filter(produto => produto.categoria === categoria);

                    doc.setFont("helvetica", "bold");

                    doc.text(`Produtos: `, 14, yOffset);
                    yOffset += 10;
                    produtosCategoria.forEach((produto) => {
                        doc.setFont("helvetica", "normal");
                        doc.text(produto.nome, 14, yOffset);
                        doc.text(`Tamanho: ${produto.variacao}`, 50, yOffset);
                        doc.text(`Qtd: ${produto.quantidade}`, 100, yOffset);
                        doc.text(`R$ ${produto.preco * produto.quantidade}`, 150, yOffset);

                        if (produto.img) {
                            doc.addImage(produto.img, 'PNG', 160, yOffset - 5, 20, 20);
                        }

                        yOffset += 10;

                        if (yOffset > 270) {
                            doc.addPage();
                            yOffset = 20;
                        }
                    });

                    yOffset += 10;
                });

                doc.setLineWidth(0.5);
                doc.line(10, yOffset, 290, yOffset);
                yOffset += 5;
            });


            doc.save(`relatorio_pedidos_${formattedStartDate}_a_${formattedEndDate}.pdf`);
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível gerar o relatório.',
            });
        });
});
