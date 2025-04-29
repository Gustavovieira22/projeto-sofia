
//Função que exibe lista de pedidos do cliente//
async function displayOrder(){
    
    //captura telefone do cliente no localStorage//
    const storageData = localStorage.getItem('phone');
    
    //verifica se a captura aconteceu como esperado//
    if(!storageData){
        location.assign('/');
        return;    
    }

    //converte para formato correto//
    const phone = JSON.parse(storageData);
    
    //limpa o localStorage//
    localStorage.clear();

    //captura tabela que exibe pedidos//
    const tableClient = document.getElementById('table-body');

    //limpa previamente a tabela//
    tableClient.innerHTML = '';

    try {
        const url = `/api/pedidos/${phone}`;
        const response = await fetch(url, {method:'GET'});
        const data = await response.json();
        if (!response.ok) {
            if(response.status === 404){
                tableClient.innerHTML = `<tr><td colspan="5" class="text-center text-muted">${data.message}</td></tr>`;
                return;
            }
            if(response.status === 500){
                tableClient.innerHTML = `<tr><td colspan="5" class="text-center text-muted">${data.error}</td></tr>`;
                return;
            }
        }

        for(let i=0;i<data.length;i++){
            const dbDate = new Date(data[i].date).toLocaleDateString('pt-BR');//formata a data armazenada no mongo//
            const row = tableClient.insertRow();//criando uma linha para cada pedido//
    
            //criando cada célula da linha
            const cellNumber = row.insertCell(0);
            const cellDate = row.insertCell(1);
            const cellType = row.insertCell(2);
            const cellTotal = row.insertCell(3);
            const cellOptions = row.insertCell(4);
    
            //atribuindo dados às células da linha
            cellNumber.textContent = data[i].number;
            cellType.textContent = data[i].type;
            cellTotal.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data[i].total);
            cellDate.textContent = `${dbDate} - ${data[i].hour}`; 

            const btnView = document.createElement('button');
            btnView.setAttribute('class','btn btn-outline-primary btn-sm');
            btnView.innerHTML = '<i class="bi bi-eye-fill"></i>';
            btnView.onclick = async ()=>{data[i]};
    
            cellOptions.setAttribute('class','btn-group');
            cellOptions.appendChild(btnView);
        }

    } catch (error) {
        console.log("Erro ao buscar pedidos de clientes: ", error);
        tableClient.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Erro ao buscar pedidos de clientes.</td></tr>`;
        return;
    }
};

displayOrder();