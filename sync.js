//arquivo de sincronização do banco de dados//
/* Execute esse arquivo apenas no primeiro uso para que os dados do isertData sejam enviados para o banco de dados*/

const connectDB = require('./config/database'); //arquivo de conexão com o banco de dados
const inserirRegras = require('./data/insertData'); //arquivo com função de inserção de dados no banco;

connectDB().then(()=>{
    inserirRegras();//Função que contém os dados de parametros para o gpt//
}).catch((err)=>{
    console.log('Algo deu errado durante a inicialização do banco: ',err);
});