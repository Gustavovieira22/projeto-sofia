const { Client, LocalAuth, Location} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

//funções locais
const {gpt, response_human} = require('./gpt/gpt');

//configuração da API wweb.js//
const client = new Client({
    webVersionCache: {
        type: "remote",
        remotePath:
            "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    }, 
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, 
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

// Inicia o cliente
client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR code gerado, escaneie com o WhatsApp');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Chatbot Sofia está online!');
});

client.on('message_create',async(message) =>{
    
    const chat = await message.getChat();
    const typeChat = message.type; // tipo de mensagem recebida
    const phone = chat.id.user; // telefone do cliente
    const messageBody = message.body; // corpo da mensagem
    const number = message.from; // telefone do cliente no formato API

    //ignorando as próprias mensagens
    if(message.fromMe){
        response_human(messageBody);
        return;
    }

    //ignorar as mensagems de grupos e status
    if(chat.isGroup || message.isStatus){
        console.log('Ignorando mensagem de grupo | status');
        return;
    }

    //salvar a localização do cliente na base de dados
    if(typeChat === 'location'){
       console.log(`Localização Recebida: https://maps.google.com/?q=${chat.lastMessage.location.latitude},${chat.lastMessage.location.longitude}`);
    }

    //solicitar esclarecimento quando cliente enviar imagem
    if(message.hasMedia && typeChat == 'image'){
        //cliente envia uma imagem
        await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\nDesculpe, ainda *não consigo ler imagens*. Você pode *escrever em texto*✏️ ou me *enviar um áudio*🔊 descrevendo o que está na imagem, por favor?😔`);
        return;
    }

    //salvar e interpretar o áudio enviado pelo cliente
    if(message.hasMedia && typeChat == 'ptt'){
        //cliente envia um áudio
    }

    //ignorar qualquer mensagem que não seja do tipo chat = texto
    if (typeChat !== 'chat') {
        return;
    }
    
    //simula o "digitando..." enquanto aguarda a resposta do chatbot
    await chat.sendStateTyping();

    setTimeout(async()=>{
        //aguarda a reposta do chatbot
        const response_gpt = await gpt(messageBody);

        //envia mensagem para o cliente
        await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${response_gpt}`);
        return;
    },1000)
    //const location = new Location(-16.6491009,-49.1798874);
});

