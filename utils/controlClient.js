const controlClient = new Map(); //controla o status de atendimento dos clientes//
const messages = new Map(); //variável que controla parametros e histórico de conversas//

controlClient.set('556282629965',false);
controlClient.set('556281364744',false);


module.exports = {controlClient, messages};