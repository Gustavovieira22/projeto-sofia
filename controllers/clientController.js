const { error } = require('qrcode-terminal');
const dbClient  = require('../models/Client');//banco de dados com informações dos clientes//
const {controlClient} = require('../utils/controlClient');//Cache com telefones dos clientes em atendimento//

//Função que retorna dados de clientes em atendimento - primeiro acesso//
exports.allClients = async (req, res) =>{
    const phoneClients = Array.from(controlClient.keys());//converte cache de telefone de clientes em um array de telefones//
    
    try {
        //ordena pela data mais recente//
        const clients = await dbClient.find({phone:{$in: phoneClients}}).sort({ date_contact: -1 });
        
        if(clients.length > 0){
            //existem +1 cliente em atendimento//
            res.status(200).json({clients});

        }else{
            console.log('Nenhum cliente em atendimento.')
            res.status(200).json({clients: [], message:'Nenhum cliente em atendimento no momento.'});
        }
    } catch (error) {
        console.log('Erro inesperado ao buscar clientes em atendimento:', error);
        res.status(500).json({error:'Erro inesperado ao buscar clientes em atendimento.'});
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
    //verifica se o telefone é válido//
    if(!phone){
        return res.status(400).json({error: "telefone do cliente é inválido ou não foi informado."});
    }
    try {
        const result = await dbClient.deleteOne({phone:phone});
         if(result.deletedCount === 1){
            res.status(200).json({message:`Todos os dados do cliente foram apagados!`});
         }else{
            res.status(404).json({error: `Cliente não encontrado. Nenhum dado foi apagado.`});
         }   
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Erro ao deletar cliente do banco de dados!"});
    }
};

//envia lista de clientes em atendimento para o front//
exports.controlClient = async(req, res)=>{
    try {
        const phoneClients = Array.from(controlClient.entries());
        if(phoneClients.length === 0){
            //lista de clientes em atendimento está vazia//
            return res.status(204).send();
        }
        //lista de clientes em atendimento é enviada//
        res.status(200).json(phoneClients);   
    } catch (error) {
        console.log('Erro inesperado ao capturar estado de atendimendo dos clientes.', error);
        res.status(500).json({error:'Erro inesperado ao capturar estado de atendimendo dos clientes.'})
    }
};

//Atualiza status de atendimento do cliente pelo chatbot//
exports.changeService = async(req, res)=>{
    const {phone, service} = req.params;
    //verifica se o telefone é válido//
    if(!phone){
        return res.status(400).json({error: "telefone do cliente é inválido ou não foi informado."});
    }
    try {
        //converte string 'true - false' em booleano real//
        const boolService = service === 'true';

        //altera atendimento no Map() de clientes//
        controlClient.set(phone,boolService);

        res.status(200).json({message:'Atendimento via chatbot alterado com sucesso.', service:boolService});

    } catch (error) {
        console.log('Erro inesperado ao alterar estado de atendimento do cliente.', error);
        res.status(500).json({error:'Erro inesperado ao alterar estado de atendimento do cliente.'})
    }
};

//Atualiza dados do cliente no banco de dados//
exports.edit_dataClient = async(req, res)=>{
    let {name, phone, address, loc_lat, loc_long} = req.body;
    
    address = address?.trim() ? address.replace(/[\r\n]+/g, ' ') : null;
    loc_lat = loc_lat?.toString().trim() ? loc_lat : null;
    loc_long = loc_long?.toString().trim() ? loc_long : null;
    name = name?.trim() ? name : null;

    if(!phone){
        return res.status(400).json({error: "telefone do cliente é inválido ou não foi informado."});
    }
    
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
                res.status(200).json({message:'dados do cliente alterados com sucesso!'});
            }else{
                res.status(200).json({message:'nenhuma alteração nos dados do cliente! - Server'});
            }
    } catch (error) {
        console.error('Erro interno ao editar dados do cliente: ', error);
        res.status(500).json({error: 'Erro interno ao tentar editar dados do cliente!'});
    }    
};

//Função que retorna quantidade de clientes cadastrados no banco de dados//
exports.countClients = async(req, res)=>{
    try {
        const total = await dbClient.countDocuments();
        res.status(200).json(total);
    } catch (error) {
        console.log("Erro inesperado ao contar os clientes no banco de dados: ",error);
        res.status(500).json("Erro ao contar os clientes no banco de dados.");
    }
};

//Função que retorna busca de clientes no banco de dados//
exports.searchClient = async (req, res)=>{
    const {searchField} = req.params;//texto do campo de busca//
    if(!searchField){
        return res.status(400).json({error: "texto do campo de busca inválido ou não informado."});
    }
    try {
        const resultado = await dbClient.find({
          $or: [
            { phone: { $regex: searchField, $options: 'i' } },//telefones correspondentes//
            { name: { $regex: searchField, $options: 'i' } },//nomes correspondentes//
            { 'address.address_write': { $regex: searchField, $options: 'i' } }//endereços correspondentes//
          ]
        });
        
        if(resultado.length > 0){//retorna os dados caso tenha resultado//
            res.status(200).json({resultado});
        }else{//retorna falso caso não haja nenhum cliente na busca//
            res.status(200).json({resultado:[], message:'nenhum cliente encontrado para essa busca.'});
        }
      } catch (error) {
        console.error('Erro ao realizar busca por informações de cliente:', error);
        res.status(500).json({error:'Erro inesperado ao realizar essa busca.'});
      }
};