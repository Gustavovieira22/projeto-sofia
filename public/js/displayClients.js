/*Funções relacionadas a exibição dos dados do cliente no frontend*/

//Função que faz a conexão com o WebSocket do servidor//
function conectionWS(){
    const IP = 'localhost';
    const socket = new WebSocket(`ws://${IP}:8080`);
    socket.onmessage = async function(event){
        const data = JSON.parse(event.data);
        //chama função que exibi o total de clientes cadastrados//
        await count_clientsDisplay();

        if(data.length>0){
            await displayClient(data);
        }
    };
    socket.onclose = function(){
        console.log('Servidor WebSocket desconectado!');
    }
};

//Função que retorna dados dos clientes em atendimento//
async function current_clients() {
    try {
        const url = '/api/clientes';
        const response = await fetch(url,{
            method:'GET',
        });
        const data = await response.json();
        if(data){
            await displayClient(data)
        }else{
            console.log('Nenhum cliente no banco de dados!');
        }
    } catch (error) {
        console.log("Erro inesperado ao buscar cliente",error);
    }  
};

//Função que cria a tabela e exibe os clientes
async function displayClient(data){
    const tableClient = document.getElementById('table-body');//tabela que exibe os clientes
    tableClient.innerHTML = '';//limpa previamente a tabela
    
    if(data.length<=0){
        tableClient.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhum cliente em atendimento!</td></tr>`;
        return;
    }

    for(let i=0;i<data.length;i++){
        const row = tableClient.insertRow();//cria uma linha na tabela

        //criando cada célula da linha
        const cellStatus = row.insertCell(0);
        const cellName = row.insertCell(1);
        const cellPhone = row.insertCell(2);
        const cellAddress = row.insertCell(3);
        const cellLocation = row.insertCell(4);
        const cellOptions = row.insertCell(5);

        //criando seletor check de atendimento do chatbot//
        const divCheck = document.createElement('div');
        divCheck.setAttribute('class','form-check form-switch');
        const checkService = document.createElement('input');
        checkService.setAttribute('class', 'form-check-input');
        checkService.setAttribute('type', 'checkbox');
        checkService.setAttribute('role', 'switch');
        checkService.setAttribute('id',data[i].phone);
        checkService.setAttribute('checked', 'true');

        //caso o cliente não esteja em atendimento//
        const controlClient = await getStatus();

        if(!controlClient.get(data[i].phone)){
            checkService.checked = false;
        }
        divCheck.appendChild(checkService);
        cellStatus.appendChild(divCheck);

        //eventos de alteração do botão check
        checkService.removeEventListener('change', changeService);
        checkService.addEventListener('change', changeService);

        //atribuindo dados às células da linha
        cellName.textContent = data[i].name;
        cellPhone.textContent = data[i].phone;

        const btnAddress = document.createElement('button');
        //pegando endereço do cliente
        if(data[i].address && data[i].address.address_write){
            //caso haja endereço será exibido na linha do cliente
            cellAddress.textContent = data[i].address.address_write;
            cellAddress.setAttribute('class', 'small-text');
            btnAddress.setAttribute('class','btn btn-sm btn-outline-danger');
            btnAddress.innerHTML = '<i class="bi bi-copy"></i>';
            cellAddress.appendChild(btnAddress);

            //criando botão para copiar endereço//
            btnAddress.onclick = ()=>{
                const input = document.createElement('input');
                input.type ='text';
                if(data[i].address && data[i].address.location && data[i].address.location.lat && data[i].address.location.long){
                    input.value = `${data[i].address.address_write} - https://maps.google.com/?q=${data[i].address.location.lat},${data[i].address.location.long}`;
                }else{
                    input.value = `${data[i].address.address_write}`
                }
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
            };
            
        }else{
            //caso não haja endereço, adiciona um botão para inserir endereço
            const btnAddress = document.createElement('button');
            btnAddress.textContent = 'Adicionar Endereço';
            btnAddress.setAttribute('class','btn btn-danger btn-sm');
            btnAddress.onclick = async ()=>{await callEdit(data[i])};
            cellAddress.appendChild(btnAddress); 
        }

        if(data[i].address && data[i].address.location && data[i].address.location.lat && data[i].address.location.long){
            cellLocation.innerHTML = `<a href="https://maps.google.com/?q=${data[i].address.location.lat},${data[i].address.location.long}" target="_blank">Mapa</a>`;
        }

        //definindo botão que faz listagem de pedidos//
        const btnOrder = document.createElement('button');
        btnOrder.setAttribute('class','btn btn-outline-primary btn-sm')
        btnOrder.innerHTML = '<i class="bi bi-basket2-fill"></i>';
        btnOrder.onclick = async ()=>{
            await callOrders(data[i].phone);
        };

        //definindo botão de delete
        const btnDelete = document.createElement('button');
        btnDelete.setAttribute('class','btn btn-outline-danger btn-sm');
        btnDelete.innerHTML = '<i class="bi bi-trash-fill"></i>';
        btnDelete.onclick = async ()=>{
            await deleteClient(data[i].phone);
            tableClient.deleteRow(row.rowIndex - 1);
        };

        //definindo botão de editar
        const btnEdit = document.createElement('button');
        btnEdit.setAttribute('class','btn btn-outline-primary btn-sm');
        btnEdit.innerHTML = '<i class="bi bi-pencil-square"></i>';
        btnEdit.onclick = async ()=>{await callEdit(data[i])};

        cellOptions.setAttribute('class','btn-group');
        cellOptions.appendChild(btnEdit);
        cellOptions.appendChild(btnOrder);
        cellOptions.appendChild(btnDelete);
    }
};

//Função que deleta dados do cliente via api//
async function deleteClient(phone) {
  try {
    const url = `/clientes/delete/${phone}`;
    const response = await fetch(url,{
        method:'DELETE'
    });
    const data = await response.json();
    await count_clientsDisplay();//atualiza contador de clientes//
    alert(data);
  } catch (error) {
    console.log("Erro inesperado ao deletar cliente!",error);
  }  
};

//Função que captura lista de clientes em atendimento no momento//
async function getStatus() {
    try {
        const url = '/api/status';
        const response = await fetch(url,{
            method:'GET',
        });
        const data = await response.json();
        if(data){
            const controlClient = new Map(data);//converte array para map()//
            return controlClient;
        }else{
            console.log('Nenhum cliente no banco de dados!');
            return false;
        }
    } catch (error) {
        console.log("Erro inesperado ao buscar cliente",error);
        return false;
    }  
};

//Função que altera estado de atendimento do cliente
async function changeService(event) {
    const phone = event.target.id;
    const service = event.target.checked;

    try {
        const url = `/api/service/${phone}/${service}`;
        const response = await fetch(url,{method:'GET'});
        const data = await response.json();
        console.log(`Estado do cliente alterado para:`,data);
    } catch (error) {
        console.log("Erro inesperado ao alterar estado de atendimento do cliente: ",error);  
    }
};

//Função que envia dados do cliente para edição em outra página
async function callEdit(client){

    //construindo objeto com dados do cliente//
    const dataClient = {};
    
    dataClient.name = client?.name || null;
    dataClient.phone = client?.phone || null;
    dataClient.address =  client?.address?.address_write || null;
    dataClient.loc_lat = client?.address?.location?.lat || null;
    dataClient.loc_long = client?.address?.location?.long || null;

    //salvando dados no localStorage do navegador//
    localStorage.setItem('dataClient',JSON.stringify(dataClient));
    //redirecionando para página de edição//
    window.location.href = "editar/cliente";
};

//Função que captura quantidade de clientes cadastrados no banco de dados//
async function count_clientsDisplay() {
    try {
        const response = await fetch('/api/contador-clientes');
        const data = await response.json();
        const spanQuantidade = document.getElementById('count-clients');
        spanQuantidade.textContent = data;
    } catch (error) {
        console.log("Erro ao buscar a quantidade de clientes", error);
    }
}

async function callOrders(phone) {
    //salva telefone do cliente no localStorage do navegador//
    localStorage.setItem('phone',JSON.stringify(phone));
    //redireciona para a página de exibição de pedidos//
    window.location.href = "cliente/pedidos";
};

count_clientsDisplay();//chama função que exibi o total de clientes cadastrados//
current_clients();//chama função para exibir clientes em atendimento//
conectionWS();//chama função de conexão com websocket//