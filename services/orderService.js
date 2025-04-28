//Importando banco de dados do Cliente//
const dbClient = require('../models/Client');
const dbOrder = require('../models/Orders');

//Função que registra pedido de cliente no banco de dados//
async function registerOrder(order) {
    try {
        const clientPhone = await dbClient.findOne({phone: order.phone});//verifica se o cliente já está cadastrado//

        if(!clientPhone){//cliente não está no banco//
            console.log('Erro ao registrar pedido no banco de dados: Cliente não localizado no banco de dados!');
            return false;
        }
        else{//Cliente cadastrado no banco de dados//
            
            if (!order.date || !order.hour || !order.total || !order.number || !order.payment) {
                console.log('ERRO: informações obrigatórias do pedido não foram enviadas!');
                return false;
            }

            await dbOrder.create({
                phone:order.phone,
                name:order.name,
                type:order.type,
                itens:order.itens,
                description:order.description,
                address_write:order.address_write,
                location:order.location,
                date:order.date,
                hour:order.hour,
                total:order.total,
                payment:order.payment,
                number:order.number
            });
            
            console.log('Pedido registrado no banco de dados com Sucesso!');
            return true;
        }
    } catch (error) {
        console.log("Erro ao salvar pedido no banco de dados.",error);
        return false;
    }
};

module.exports.registerOrder = registerOrder;