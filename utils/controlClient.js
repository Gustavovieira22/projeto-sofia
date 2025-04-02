const controlClient = new Map(); //controla o status de atendimento dos clientes//
const messages = new Map(); //variável que controla parametros e histórico de conversas//

controlClient.set('556293539111',false);//Gustavo Entregador
controlClient.set('556281791514',false);//Gabriel Entregador
controlClient.set('556294818031',false);//Analuce
controlClient.set('556281510701',false);//Murilo Entregador
controlClient.set('556281551998',false);//Guilherme Cozinha
controlClient.set('556281274929',false);//João Entregador

module.exports = {controlClient, messages};