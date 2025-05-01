//Função que preenche o formulário com os dados do cliente//
async function edit_order(){
    //valor total do pedido//
    let totalOrder = 0;

    //tabela que exibe itens do pedido//
    const tableOrder = document.getElementById('order-items');
    tableOrder.innerHTML = '';

    //campos do formulário//
    const title = document.getElementById('title-order');
    const date = document.getElementById('date-hour');
    const name = document.getElementById('name');
    const cpf = document.getElementById('cpf');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const location = document.getElementById('location');
    const description = document.getElementById('description');
    const total = document.getElementById('total');
    const payment = document.getElementById('payment');
    const type = document.getElementById('type');

    //formulário//
    const formEdit = document.getElementById('form-order');

    //dados do cliente salvo no localStorage do navegador//
    const storageData = localStorage.getItem('order');
    
    if(!storageData){
        //caso o localStorage esteja vazio//
        location.assign('/');
        return;
    }

    //captura os valores salvos no localStorage//
    const order = JSON.parse(storageData);
    name.disabled = true;//desabilitado//
    phone.disabled = true;//desabilitado//
    cpf.disabled = true;//desabilita//

    name.value = order.name;
    phone.value = order.phone;
    address.value = order.address_write;
    location.value = order.location;
    description.value = order.description;
    payment.value = order.payment;
    type.value = order.type;
    title.textContent = `Pedido: [ ${order.number} ]`;
    date.textContent = `${new Date(order.date).toLocaleDateString('pt-BR')} - ${order.hour} `

    //itens do pedido//
    if(order.itens.length <=0 ){
        tableOrder.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Erro! nenhum item registrado neste pedido.</td></tr>`;
        return;
    }
    
    for(let i=0;i<order.itens.length;i++){
        //criando a primeira linha na tabela//
        const row = tableOrder.insertRow();

        const cellQtd = row.insertCell(0);
        const cellitem = row.insertCell(1);
        const cellPrice = row.insertCell(2);

        cellQtd.textContent = order.itens[i].quantity;
        cellitem.textContent = order.itens[i].name;
        cellPrice.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.itens[i].price);

        totalOrder = totalOrder + (order.itens[i].quantity * order.itens[i].price);
    }
    
    if(order.type == 'entrega'){
        totalOrder = totalOrder + 3;
    }
    
    total.value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOrder);

    //Adicionando ouvinte para submeter o formulário//
    //formEdit.removeEventListener('submit',sendClient);
    //formEdit.addEventListener('submit',sendClient);
};

edit_order();