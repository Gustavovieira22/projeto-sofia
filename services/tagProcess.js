const gpt = require('../gpt/gpt');//Função de chamada para o modelo gpt

//Função que envia informações relevantes para o cliente baseada em tags configuradas no modelo GPT//
async function tagProcess(message,phone) {
    let location = false;//verdadeiro caso a localização seja solicitada//
    let pdf = false;//verdadeiro caso o cardapio em pdf seja solicitado//
    let order = false;//verdadeiro caso o pedido seja finalizado//

    if(message){
        if(message.includes("#menu")){//quando cliente pede o cardápio//
            return {processMessage: message.replace("#menu",`*🛎️Cardápio digital:* https://henry.goomer.app/menu`), 
                location, 
                pdf, 
                order
            };
        }

        if(message.includes("#location")){//quando cliente pede a localização do estabelecimento//
            location = true;//verdadeiro para envio da localização//
            return {processMessage: message.replace("#location",`📍Rua SR 49, QD 64, LT 12 - Recanto das Minas Gerais - *Henry Burguer* - Goiânia-GO\n\n_⚠️Não atendemos mesas no local, pedidos apenas para retirada ou delivery._`),
                location, 
                pdf, 
                order
            };

        }
        
        if(message.includes("#pdf")){//quando cliente pede cardapio em pdf ou em fotos//
            pdf = true;//verdadeiro para envio do pdf//
            return {processMessage: message.replace("#pdf",`📑Aguarde alguns instantes, já estou enviando o cardápio em PDF:`),
                location, 
                pdf, 
                order
            };
        }
        
        if(message.includes('#saveName') || message.includes('#saveAddress')){//quando a função saveName é chamada pelo gpt//
            let processMessage = await gpt("#executed",phone);//envia mensagem para o gpt continuar com o atendimento//
            
            //caso a resposta do gpt seja o retorno do pedido finalizado//
            if(processMessage.includes("#order")){
                order = true;
                processMessage = processMessage.replace("#order","")
            }

            return {processMessage, location, pdf, order};
        }
        
        if(message.includes("#order")){
            order = true;
            return {processMessage: message.replace("#order",""), 
                location, 
                pdf, 
                order
            };
        }
        
    }else{
        const processMessage = `Erro no processamento de tag de substituição. Aguarde alguns segundos e tente novamente.`;
        console.log(processMessage);
        return {processMessage, location, pdf, order};
    }

    //quando nenhuma das condições é satisfeita retorna falso//
    const processMessage = false;
    return {processMessage, location, pdf, order};
}

module.exports = tagProcess;