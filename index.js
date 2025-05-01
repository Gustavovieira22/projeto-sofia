const {initData} = require('./data/dataLoader');//inicializa variáveis com parametros do gpt//
const connectDB = require('./config/database');//arquivo de conexão com o banco de dados//
const client = require('./whatsapp');//modulo de inicialização da api whatsapp//

//inicia função que carrega variaveis com parametros para configuração do gpt//
initialization();

//configurando servidor local//
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

//Importando rotas para o servidor//
const clientRouters = require('./routers/clientRouters');
const orderRouters = require('./routers/orderRouters');

//definindo variáveis de ambiente//
app.use(express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

//definindo Rotas//
app.use('/',clientRouters);
app.use('/',orderRouters);

//iniciando servidor local//
app.listen(PORT,(error)=>{
    if(error){
        console.log('Erro ao subir servidor!',error);
        process.exit(1);
    }
    console.log('Servidor Online!');
});

//Carrega os parametros do gpt para cache local//
async function initialization() {
    // conexão com o banco de dados//
    await connectDB();
    
    // recupera os dados do banco e guarda em cache local//
    await initData();

    //carrega api whatsappWeb.js//
    client.initialize();
};
