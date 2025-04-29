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
    
    if(!storageData){
        //caso o localStorage esteja vazio//
        location.assign('/');
        return;
    }

    //captura os valores salvos no localStorage//
    const client = JSON.parse(storageData);
    phone.disabled = true;//desabilitado - campo telefone não pode ser alterado//
    cpf.disabled = true;//desabilita - ainda não é utilizado//
    name.value = client.name;
    phone.value = client.phone;
    address.value = client.address;
    loc_lat.value = client.loc_lat;
    loc_long.value = client.loc_long;

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
    
    try {//envia os dados para serem alterados no servidor//
        const url = '/api/editar/cliente';
        const response = await fetch(url, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newClient)
        });
        const data = await response.json();
        if(!response.ok){
            showAlert(data.error, 'danger');
            setTimeout(() => {
                localStorage.clear();
                window.location.href = "/"; 
                return;
            }, 1000);   
        }

        //sucesso!//
        showAlert(data.message, 'success');

        setTimeout(() => {
            localStorage.clear();
            window.location.href = "/"; 
        }, 1000);

     } catch (error) {
        alert(`Erro ao editar dados do cliente!`);
        console.log("Erro inesperado ao editar dados do cliente!",error);
     }
};

editClient();//chama função que preenche dados do cliente no formulário//