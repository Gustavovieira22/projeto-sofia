const WebSocket = require('ws');
const dbClient = require('../models/Client');

//configurando Websocket//
const wss = new WebSocket.Server({port:8080, host:'localhost'});

//iniciando conexão com o Websocket//
wss.on('connection', async (ws)=>{
    console.log('- Cliente conectado ao WebSocket!');
    ws.on('close',()=>{
        console.log('- Cliente desconectado!');
    });
});

//função que envia a lista atualizada de clientes em atendimento//
async function broadcasting(controlClient){
    const phoneClients = Array.from(controlClient.keys());//converte o Map() em um array de telefones//

    try {
        const clients = await dbClient.find({//busca dados de clientes através dos telefones//
           phone:{$in: phoneClients} 
        }).sort({ date_contact: -1 }); //ordena pela data mais recente//

        wss.clients.forEach((client)=>{//envia dados de clientes para o front//
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(clients));
            }
        })
    } catch (error) {
        console.log('Erro inesperado ao enviar clientes via broadcasting!',error)
    }
};

module.exports = broadcasting;