//Função que exibe alertas de interação//
async function showAlert(message, type){
    const alertContainer = document.getElementById('alert-container');
    const alertPlaceholder = document.createElement('div');
    
    alertPlaceholder.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('');
    
    //inserindo o alerta na tela//
    alertContainer.append(alertPlaceholder);
    
    //removendo o alerta depois de 4 segundos//
    setTimeout(() => {
        alertContainer.removeChild(alertPlaceholder);
    }, 4000);
};