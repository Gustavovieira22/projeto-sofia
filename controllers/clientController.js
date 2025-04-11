const dbClient  = require('../models/Client');//banco de dados com informações dos clientes//
const {controlClient} = require('../utils/controlClient');//Cache com telefones dos clientes em atendimento//

const broadcasting = require('../websocket/broadcasting');

//Função que retorna dados de clientes em atendimento - primeiro acesso//
exports.allClients = async (req, res) =>{
    const phoneClients = Array.from(controlClient.keys());//converte cache de telefone de clientes em um array de telefones//
    
    try {
        const clients = await dbClient.find({
            phone:{$in: phoneClients} 
         });
        if(clients){
            res.json(clients);    
        }else{
            res.json('Banco de dados vazio, não há clientes em atendimento!');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao buscar clientes em atendimento no banco de dados!"});
    }
};

//Função que renderiza HTML com tabela que exibe clientes//
exports.display = (req,res)=>{
    res.render('display.ejs');
};

//Função que renderiza formulário de edição de dados de clientes//
exports.editClient = (req,res)=>{
    res.render('edit.ejs');
};

//Função que deleta dados de cliente do banco de dados//
exports.deleteClient = async (req,res)=>{
    const {phone} = req.params;

    try {
        const result = await dbClient.deleteOne({phone:phone});
         if(result.deletedCount === 1){
            res.json("cliente deletado com sucesso.");
         }else{
            res.json("não foi possível deletar este cliente.");
         }   
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao deletar cliente do banco de dados!"});
    }
};

//envia lista de clientes em atendimento para o lado do cliente//
exports.controlClient = async(req, res)=>{
    const phoneClients = Array.from(controlClient.entries());
    res.json(phoneClients);
};

//Atualiza status de atendimento do cliente pelo chatbot//
exports.changeService = async(req, res)=>{
    const {phone, service} = req.params;

    if(controlClient.has(phone)){
        if(service === 'false'){
            controlClient.set(phone, false);
        }else{
            controlClient.set(phone, true);
        }
        res.json("Status alterado com sucesso.");   
    }else{
        res.json("Cliente não localizado.");   
    }
};

//Atualiza dados do cliente no banco de dados//
exports.edit_dataClient = async(req, res)=>{
    let {name, phone, address, loc_lat, loc_long} = req.body;
    
    address = address === '' ? null : address.replace(/[\r\n]+/g, ' ');
    loc_lat = loc_lat === '' ? null : loc_lat;
    loc_long = loc_long === '' ? null : loc_long;
    name = name === '' ? null : name;

    try {
        const newClient = await dbClient.updateOne(
            {phone},
            {
                $set:{
                    name: name,
                    'address.address_write': address,
                    'address.location.lat': loc_lat,
                    'address.location.long':loc_long
                }
            });
            if(newClient.modifiedCount > 0){
                res.status(200).json('dados do cliente alterados com sucesso!');
            }else{
                res.status(200).json('Não houve alteração nos dados do cliente!');
            }
    } catch (error) {
        console.error('Erro interno ao editar dados do cliente: ', error);
        res.status(500).json('Erro interno ao editar dados do cliente');
    }    
};

//Função que retorna quantidade de clientes cadastrados no banco de dados//
exports.countClients = async(req, res)=>{
    try {
        const total = await dbClient.countDocuments();
        res.json(total);
    } catch (error) {
        res.status(500).json("Erro ao contar os clientes no banco de dados.");
    }
};