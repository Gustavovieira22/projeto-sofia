const controlClient = new Map(); //controla o status de atendimento dos clientes//
const messages = new Map(); //variável que controla parametros e histórico de conversas//
const host = 'localhost';

//contatos com chatbot desativado//
controlClient.set('556293539111',false);//Gustavo Entregador
controlClient.set('556281791514',false);//Gabriel Entregador
controlClient.set('556294818031',false);//Analuce
controlClient.set('556281510701',false);//Murilo Entregador
controlClient.set('556281551998',false);//Guilherme Cozinha
controlClient.set('556281274929',false);//João Entregador
controlClient.set('556295305921',false);//Telefone da Loja: Henry Burguer!
//controlClient.set('556281198379',false);

function serviceHours() {
    // Obtendo a hora atual//
    const date = new Date();
    const horaAtual = date.toTimeString().split(' ')[0];
    const abrir = '10:50'; 
    const fechar = '22:49';

    //Abertos das 18:00 às 22:50//
    return (horaAtual>=abrir && horaAtual<=fechar);//verdadeiro quando aberto//
}

module.exports = {controlClient, messages, serviceHours, host};