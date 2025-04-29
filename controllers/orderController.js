const dbClient  = require('../models/Client');//banco de dados com informações dos clientes//
const dbOrder = require('../models/Orders');//banco de dados com informações de pedidos//

//Função que retorna todos os pedidos que o cliente já fez//
exports.allOrder = async (req, res) =>{
    const {phone} = req.params;

    if(!phone){
        return res.status(400).json({error: "telefone do cliente é inválido ou não foi informado."});
    }

    try {
        //busca pedidos no banco de dados//
        const orders = await dbOrder.find({phone}).sort({ date: -1 });
        
        if(orders.length>0){
            res.status(200).json(orders);

        }else{
            console.log('Cliente não possui pedidos registrados.');
            res.status(404).json({message: "cliente não possui pedidos registrados no sistema."});
        }

    } catch (error) {
        console.error('Erro ao buscar pedidos de cliente', error);
        return res.status(500).json({error:"Erro interno ao buscar pedidos do cliente."});
    }
};

//Função que exibe tela de pedidos do cliente//
exports.displayOrder = async (req, res) =>{
    res.render('orders_display.ejs');
};