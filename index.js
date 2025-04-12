const {initData} = require('./data/dataLoader');//inicializa variáveis com parametros do gpt//
const connectDB = require('./config/database');//arquivo de conexão com o banco de dados//
const client = require('./whatsapp');//modulo de inicialização da api whatsapp//

gptParams();//inicia função que carrega variaveis com parametros para configuração do gpt//
client.initialize();//carrega api whatsappWeb.js//

//configurando servidor local//
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const IP = '192.168.1.104';

//Importando rotas para o servidor//
const clientRouters = require('./routers/clientRouters');

//definindo variáveis de ambiente//
app.use(express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

//definindo Rotas//
app.use('/',clientRouters);

//iniciando servidor local//
app.listen(PORT,IP,(error)=>{
    if(error){
        console.log('Erro ao subir servidor!',error);
        process.exit(1);
    }
    console.log('Servidor Online!');
});

//Carrega os parametros do gpt para cache local//
async function gptParams() {
    // conexão com o banco de dados//
    await connectDB();
    // recupera os dados do banco e guarda em cache local//
    await initData();
};
