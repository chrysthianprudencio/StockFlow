document.addEventListener("DOMContentLoaded", function() {
    const productForm = document.getElementById('product-form');
    const stockFormEntrada = document.getElementById('stock-form');
    const stockFormSaida = document.getElementById('stock-form-saida');
    const stockTableBody = document.getElementById('stock-table') ? document.getElementById('stock-table').getElementsByTagName('tbody')[0] : null;
    const exportExcelButton = document.getElementById('export-excel');
    const clearStockButton = document.getElementById('clear-stock'); // Botão para limpar o estoque

    let products = JSON.parse(localStorage.getItem('products')) || {};
    let stockChart; // Variável para armazenar a instância do gráfico

    if (productForm) {
        productForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const codigo = document.getElementById('codigo').value;
            const nome = document.getElementById('nome').value;

            if (!products[codigo]) {
                products[codigo] = { nome: nome, quantidade: 0, valorTotal: 0, valorUnitario: 0 };
                alert('Produto cadastrado com sucesso!');
            } else {
                alert('Código do produto já cadastrado!');
            }
            localStorage.setItem('products', JSON.stringify(products));
            updateStockTable();
            updateStockChart();
            productForm.reset();
        });
    }

    if (stockFormEntrada) {
        stockFormEntrada.addEventListener('submit', function(event) {
            event.preventDefault();
            const codigo = document.getElementById('codigo-mov').value;
            const quantidade = parseInt(document.getElementById('quantidade').value);
            const valorUnitario = parseFloat(document.getElementById('valor-unitario').value);

            if (products[codigo]) {
                products[codigo].quantidade += quantidade;
                products[codigo].valorTotal += quantidade * valorUnitario;
                products[codigo].valorUnitario = valorUnitario;
                alert('Movimentação registrada com sucesso!');
            } else {
                alert('Produto não cadastrado!');
            }
            localStorage.setItem('products', JSON.stringify(products));
            updateStockTable();
            updateStockChart();
            stockFormEntrada.reset();
        });
    }

    if (stockFormSaida) {
        stockFormSaida.addEventListener('submit', function(event) {
            event.preventDefault();
            const codigo = document.getElementById('codigo-mov-saida').value;
            const quantidade = parseInt(document.getElementById('quantidade-saida').value);
            const valorUnitario = parseFloat(document.getElementById('valor-unitario-saida').value);

            if (products[codigo] && products[codigo].quantidade >= quantidade) {
                products[codigo].quantidade -= quantidade;
                products[codigo].valorTotal -= quantidade * valorUnitario;
                alert('Movimentação registrada com sucesso!');
            } else {
                alert('Produto não cadastrado ou quantidade insuficiente!');
            }
            localStorage.setItem('products', JSON.stringify(products));
            updateStockTable();
            updateStockChart();
            stockFormSaida.reset();
        });
    }

    if (stockTableBody) {
        updateStockTable();
        updateStockChart();
    }

    function updateStockTable() {
        stockTableBody.innerHTML = '';
        for (let codigo in products) {
            const product = products[codigo];
            const row = stockTableBody.insertRow();
            row.insertCell(0).textContent = codigo;
            row.insertCell(1).textContent = product.nome;
            row.insertCell(2).textContent = product.quantidade;
            row.insertCell(3).textContent = product.valorUnitario.toFixed(2);
            row.insertCell(4).textContent = product.valorTotal.toFixed(2);

        // Adiciona o botão de editar
        const actionsCell = row.insertCell(5);
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', () => showEditForm(codigo));
        actionsCell.appendChild(editButton);

        // Criar botão de exclusão
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function() {
            deleteProduct(codigo);
        });

        const actionCell = row.insertCell(5);
        actionCell.appendChild(deleteButton);    

        }
    }

    function showEditForm(codigo) {
        const product = products[codigo];
        document.getElementById('edit-codigo').value = codigo;
        document.getElementById('edit-nome').value = product.nome;
        document.getElementById('edit-quantidade').value = product.quantidade;
        document.getElementById('edit-valor-unitario').value = product.valorUnitario;
        document.getElementById('edit-form-container').style.display = 'block';
    }
    
    function hideEditForm() {
        document.getElementById('edit-form-container').style.display = 'none';
    }
    
    document.getElementById('edit-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const codigo = document.getElementById('edit-codigo').value;
        const nome = document.getElementById('edit-nome').value;
        const quantidade = parseInt(document.getElementById('edit-quantidade').value);
        const valorUnitario = parseFloat(document.getElementById('edit-valor-unitario').value);
        const valorTotal = quantidade * valorUnitario;
    
        products[codigo] = { nome, quantidade, valorUnitario, valorTotal };
        localStorage.setItem('products', JSON.stringify(products));
        updateStockTable();
        updateStockChart();
        hideEditForm();
    });
    
    document.getElementById('cancel-edit').addEventListener('click', hideEditForm);


    // Deleta produtos
    function deleteProduct(codigo) {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            delete products[codigo]; // Remove o produto do objeto
            localStorage.setItem('products', JSON.stringify(products)); // Atualiza o localStorage
            updateStockTable(); // Atualiza a tabela
            updateStockChart(); // Atualiza o gráfico
            alert('Produto excluído com sucesso!');
        }
    }

    function updateStockChart() {
        const ctx = document.getElementById('stock-chart').getContext('2d');
        const labels = Object.keys(products);
        const quantities = Object.values(products).map(product => product.quantidade);

        if (stockChart) {
            stockChart.destroy();
        }

        stockChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade em Estoque',
                    data: quantities,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 2)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    if (exportExcelButton) {
        exportExcelButton.addEventListener('click', function() {
            const wb = XLSX.utils.book_new();
            const ws_data = [['Código', 'Nome', 'Quantidade', 'Valor Unitário', 'Valor Total']];
            for (let codigo in products) {
                const product = products[codigo];
                ws_data.push([codigo, product.nome, product.quantidade, product.valorUnitario.toFixed(2), product.valorTotal.toFixed(2)]);
            }
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
            XLSX.writeFile(wb, 'estoque.xlsx');
        });
    }

    if (clearStockButton) {
        clearStockButton.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar o estoque?')) {
                products = {};
                localStorage.removeItem('products');
                updateStockTable();
                updateStockChart();
                alert('Estoque limpo com sucesso!');
            }
        });
    }
});
