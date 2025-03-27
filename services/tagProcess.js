//Função que envia informações relevantes para o cliente baseada em tags configuradas no modelo GPT//

async function tagProcess(message) {
    let location = false;//verdadeiro caso a localização seja solicitada//
    let pdf = false;//verdadeiro caso o cardapio em pdf seja solicitado//

    if(message.includes("#menu")){//quando cliente pede o cardápio//
        const processMessage = message.replace("#menu",`*🛎️Cardápio digital:* https://henry.goomer.app/menu`);
        return {processMessage, location, pdf};
    }
    else if(message.includes("#location")){//quando cliente pede a localização do estabelecimento//
        location = true;//verdadeiro para envio da localização//
        const processMessage = message.replace("#location",`📍Rua SR 49, QD 64, LT 12 - Recanto das Minas Gerais - *Henry Burguer* - Goiânia-GO\n\n_⚠️Não atendemos mesas no local, pedidos apenas para retirada ou delivery._`);
        return {processMessage, location, pdf};

    }else if(message.includes("#pdf")){//quando cliente pede cardapio em pdf ou em fotos//
        pdf = true;//verdadeiro para envio do pdf//
        const processMessage = message.replace("#pdf",`📑Aqui está nosso cardápio em PDF:`);
        return {processMessage, location, pdf};
    }
    
    //quando nenhuma das condições é satisfeita retorna falso//
    const processMessage = false;
    return {processMessage, location, pdf};
}

module.exports = tagProcess;