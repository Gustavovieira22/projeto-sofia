//Função que preenche o formulário com os dados do cliente//
async function editClient(){
    //campos do formulário//
    const name = document.getElementById('name');
    const cpf = document.getElementById('cpf');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const loc_lat = document.getElementById('loc_lat');
    const loc_long = document.getElementById('loc_long');
    //formulário//
    const formEdit = document.getElementById('formEdit');
    //dados do cliente salvo no localStorage do navegador//
    const storageData = localStorage.getItem('dataClient');
    
    if(storageData){
        const client = JSON.parse(storageData);
        phone.disabled = true;//desabilitando campo para não ser alterado//
        cpf.disabled = true;//desabilitando campo//
        name.value = client.name;
        phone.value = client.phone;
        address.value = client.address;
        loc_lat.value = client.loc_lat;
        loc_long.value = client.loc_long;
    }
    //Adicionando ouvinte para submeter o formulário//
    formEdit.removeEventListener('submit',sendClient);
    formEdit.addEventListener('submit',sendClient);
};

//Função que envia os dados do cliente para o servidor alterar//
async function sendClient(event){
    event.preventDefault();

    const name = document.getElementById('name');
    const cpf = document.getElementById('cpf');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const loc_lat = document.getElementById('loc_lat');
    const loc_long = document.getElementById('loc_long');

    //criando objeto cliente com dados atualizados//
    const newClient = {
        name: name.value.trim(),
        phone: phone.value.trim(),
        address:address.value.trim(),
        loc_lat:loc_lat.value.trim(),
        loc_long:loc_long.value.trim()
    };

    //verifica se houve alguma alteração nos dados do formulário//
    const clientOld = JSON.parse(localStorage.getItem('dataClient'));
    const isEqual = 
        clientOld.name === newClient.name &&
        clientOld.phone === newClient.phone &&
        clientOld.address === newClient.address &&
        clientOld.loc_lat == newClient.loc_lat &&
        clientOld.loc_long == newClient.loc_long;

    if (isEqual) {
        alert('Nenhuma alteração nos dados foi detectada!');
        localStorage.clear();//limpa o localStorage do navegador//
        window.location.href = "/";//retorna para a página inicial//
    }
    
    try {//enviando dados para alteração no servidor//
        const url = '/api/editar/cliente';
        const response = await fetch(url, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newClient)
        });
        const data = await response.json();
        alert(data);
        localStorage.clear();
        window.location.href = "/";
     } catch (error) {
        console.log("Erro inesperado ao editar dados de endereço!",error);
     }
};

editClient();//chama função que preenche dados do cliente no formulário//