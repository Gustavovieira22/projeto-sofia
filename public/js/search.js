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
                if(data){
                    displayClient(data);
                }else{
                    tableClient.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhum cliente em atendimento!</td></tr>`;
                }
            } catch (error) {
                tableClient.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Erro inesperado ao exibir clientes!</td></tr>`;
                console.log("Erro inesperado ao exibir clientes em atendimento",error);  
            }
        }
    });
}
async function getClients(event) {
    event.preventDefault();

    const tableClient = document.getElementById('table-body');//corpo da tabela que exibe os clientes//
    const searchField = document.getElementById('search-field');//campo de busca//

    if(searchField.value.trim() == ''){
        console.log('busca vazia inválida!');
        return;
    }
    try {
        const url = `/api/buscar/cliente/${searchField.value.trim()}`;
        const response = await fetch(url, {method:'GET'});
        const data = await response.json();
        console.log(data);
        if(data){
            displayClient(data);
        }else{
            tableClient.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhum cliente econtrado!</td></tr>`;
        }
    } catch (error) {
        tableClient.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Erro inesperado ao exibir clientes!</td></tr>`;
        console.log("Erro inesperado ao buscar cliente",error);  
    }
};

searchClient();