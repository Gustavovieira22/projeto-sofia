const moment = require("moment-timezone");

const controlClient = new Map(); //controla o status de atendimento dos clientes//
const messages = new Map(); //variável que controla parametros e histórico de conversas//

controlClient.set('556293539111',false);//Gustavo Entregador
controlClient.set('556281791514',false);//Gabriel Entregador
controlClient.set('556294818031',false);//Analuce
controlClient.set('556281510701',false);//Murilo Entregador
controlClient.set('556281551998',false);//Guilherme Cozinha
controlClient.set('556281274929',false);//João Entregador
controlClient.set('556295305921',false);//Telefone da Loja: Henry Burguer!

//Função que verifica se está dentro do horário de atendimento//
async function serviceHours() {
    const HOUR_START = "18:00";
    const HOUR_END = "22:50";
    const TIME_ZONE = "America/Sao_Paulo";

    const currentTime = moment().tz(TIME_ZONE).format("HH:mm");
    return currentTime >= HOUR_START && currentTime <= HOUR_END;//retorn false caso esteja fora do horário e true caso esteja dentro do horário//
};



module.exports = {controlClient, messages, serviceHours};