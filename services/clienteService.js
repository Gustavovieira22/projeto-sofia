//Importando banco de dados do Cliente//
const dbClient = require('../models/Client');
const dbMenu = require('../models/Menu');
const broadcasting = require('../websocket/broadcasting');
const {controlClient, messages} = require('../utils/controlClient');
const {registerOrder} = require('./orderService');
const Order = require('../models/Orders');
const { name } = require('ejs');

async function saveClient(phone) {
//Função que salva telefone do cliente no banco de dados//
    try {
        const clientPhone = await dbClient.findOne({phone});//verifica se o cliente já está cadastrado//

        if(!clientPhone){//cliente não está no banco//
            //novo cliente é cadastrado no banco de dados//
            await dbClient.create({phone:phone, date_contact: new Date()});
            console.log(`Novo cliente salvo com sucesso no banco de dados: ${phone}`);
            return true;//cadastrado com sucesso//
        }
        else{
            //cliente já existe no banco de dados//
            console.log(`Cliente já está cadastrado no banco de dados: ${phone}`);
            await dbClient.findOneAndUpdate(
              {phone:phone},
              {$set:{date_contact:new Date()}},
              {new:true});
            return true;//cliente já está cadastrado no banco de dados//
        }
    } catch (error) {
        //algum erro ao salvar cliente no banco//
        console.log("Erro ao salvar telefone do cliente.",error);
        return false;
    }
};

async function saveName(name, phone) {
//função que salva o nome do cliente no banco de dados//
    try {
      const client = await dbClient.findOneAndUpdate(
        { phone: phone }, 
        { $set: { name: name,
          date_contact:new Date()
        }},
        { new: true });
        
      if(client){
        console.log(`Nome do cliente ${client.name} cadastrado para: ${client.phone}`);
        await broadcasting(controlClient);
        return true;
      }else{
        console.log(`Cliente não encontrado no banco de dados: ${phone}`);
        return false; // Retorna false se o telefone não estiver no banco
      }
    } catch (error) {
      console.log("Erro ao salvar nome do cliente.",error);
      return false;
    }  
};

async function saveLocation(lat, long, phone) {
//Função que salva a localização do cliente no banco de dados//
  try {
    const client = await dbClient.findOneAndUpdate(
      {phone:phone},
      {$set:{
        date_contact:new Date(),
        "address.location.lat":lat, 
        "address.location.long":long
      }},
      {new:true});
      if(client){
        console.log(`Localização cadastrado para o cliente: ${client.phone}`);
        return true;
      }else{
        console.log(`Cliente não encontrado no banco de dados: ${phone}`);
        return false; // Retorna false se o telefone não estiver no banco//
      }
  } catch (error) {
    console.log("Erro ao salvar localização do cliente.",error);
    return false; //Erro ao trabalhar no banco de dados//
  }
};

async function saveAddress(address, phone) {
//Função que salva ou atualiza endereço do cliente no banco de dados//
  try {
    const client = await dbClient.findOneAndUpdate(
      {phone:phone},
      {$set:{
        date_contact:new Date(),
        "address.address_write":address//Atualiza o endereço//
      }},
      {new:true});
      if(client){
        console.log(`Endereço cadastrado para o cliente: ${client.phone}`);

        const history = messages.get(phone);

        const frasesParaRemover = [
            'A localização do cliente é',
            'A localização do cliente não está registrada no sistema'
          ];
          
          const filtered = history.filter(
            msg => !frasesParaRemover.some(frase => msg.content.startsWith(frase))
          );
          
        messages.set(phone,filtered);

        await broadcasting(controlClient);
        return true;
      }else{
        console.log(`Cliente não encontrado no banco de dados: ${phone}`);
        return false; // Retorna false se o telefone não estiver no banco
      }
  } catch (error) {
    console.log("Erro ao salvar endereço do cliente.",error);
  }
};

//Função que calcula e organiza o pedido do cliente//
async function calculateOrder(items, dataClient) {
  const taxa_delivery = 3;//taxa de entrega fixa//
  let totalOrder = 0; //Total do pedido//
  let description = []; //descrição do pedido completo//
  let itens_order = []; //array de itens: nome, quantidade e preço atual//
  const now = new Date();//data atual//
  const dateNow = now; //No formato Date//
  const hourNow = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });//hora no formato string//

  description.push(`*Cliente:* ${dataClient.name}`);
  description.push(`*Telefone:* ${dataClient.phone}\n`);
  description.push(`Pedido para *${dataClient.type_order}* \n`);
  if(dataClient.address && dataClient.type_order === "entrega"){
    description.push(`*Endereço:* ${dataClient.address}`);
  }
  if(dataClient.location && dataClient.type_order === "entrega"){
    description.push(`*Loc:* ${dataClient.location}`);
  }

  description.push(`\n`);

  for (const item of items){//percorre um item por vez//
    const produto = await dbMenu.findOne({"item.name":item.name},
      {"item.$":1}
    );//busca o item no banco de dados//

    if(produto){//soma o valor do item ao total e constroí a descrição do pedido//
      const subTotal = Number(produto.item[0].price) * Number(item.quantity);
      totalOrder += subTotal;
      if(item.name.includes("Adicional")){
        description.push(`_${item.quantity}x ${item.name}_`)
      }else{
        description.push(`*${item.quantity}x ${item.name}*`);
      }
      
      //cria array de itens com nome, quantidade e preço individual//
      itens_order.push({name: item.name, quantity: item.quantity, price: produto.item[0].price});

    }else{
      description.push(`${item.quantity}x ${item.name} - ❌Item indisponível no cardápio!❌`);
    }
  }

  if(dataClient.note_order){
    description.push(`\n*Observações:* _${dataClient.note_order}_`);
  }
  if(dataClient.type_order === "entrega"){//soma R$3,00 ao pedido caso seja entrega//
    totalOrder += taxa_delivery;
    description.push(`\nTaxa de entrega *R$3,00*`);
  }
  description.push(`\n\n*Total:* ${totalOrder.toFixed(2)} - *${dataClient.payment}*`);
  description.push("#order");//tag para indicar que o pedido foi finalizado//

  try {
    //cria objeto contendo todos os dados do pedido//
    const orderComplet = {
      phone: dataClient.phone,
      name: dataClient.name,
      type:dataClient.type_order,
      itens:itens_order,
      description:dataClient.note_order,
      address_write:dataClient.address || '',
      location:dataClient.location || '',
      date: dateNow,
      hour: hourNow,
      total: totalOrder.toFixed(2),
      payment: dataClient.payment,
      number: 1 //provisório//
    }

    //envia pedido para ser registrado no banco de dados//
    await registerOrder(orderComplet);

  } catch (error) {
    console.log('ERRO ao registrar pedido no banco de dados:',error);
  }

  return description.join('\n');//retorna a descrição completa do pedido//
};

module.exports = {saveClient, saveName, saveLocation, saveAddress, calculateOrder};