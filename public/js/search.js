async function searchClient() {
    const tableClient = document.getElementById('table-body');//corpo da tabela que exibe os clientes//
    const searchField = document.getElementById('search-field');//campo de busca//
    const searchForm = document.getElementById('search-form');//formulário de busca//
    
    searchForm.removeEventListener('submit',getClients);
    searchForm.addEventListener('submit',getClients);

    searchField.addEventListener('input',async ()=>{
        if(searchField.value.trim() == ''){
            try {
                const url = `/api/clientes`;
                const response = await fetch(url, {method:'GET'});
                const data = await response.json();
                if(!response.ok){
                    showAlert(data.error,'danger');
                    return;
                }
                await displayClient(data.clients);
            } catch (error) {
                console.log("Erro inesperado ao buscar lista de clientes.",error);
                showAlert('Erro inesperado ao buscar lista de clientes.','danger');
            }
        }
    });
}
async function getClients(event) {
    event.preventDefault();

    const searchField = document.getElementById('search-field');//campo de busca//

    if(searchField.value.trim() == ''){
        showAlert('valor de busca inválido.', 'danger');
        return;
    }
    try {
        const url = `/api/buscar/cliente/${searchField.value.trim()}`;
        const response = await fetch(url, {method:'GET'});
        const data = await response.json();
        if(!response.ok){
            showAlert(data.error, 'danger');
            return;
        }
        await displayClient(data.resultado);
    } catch (error) {
        showAlert('Erro inesperado ao buscar informações de clientes.', 'danger');
        console.log("Erro inesperado ao buscar informações de clientes: ",error);  
    }
};

searchClient();