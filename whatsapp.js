const { Client, LocalAuth, Location} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

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
    console.log('Henry Bot Online!');
});

client.on('message_create',async(message) =>{
    
    const chat = await message.getChat();
    const typeChat = message.type; // tipo de mensagem recebida
    const phone = chat.id.user; // telefone do cliente
    const messageBody = message.body; // corpo da mensagem
    const number = message.from; // telefone do cliente no formato API

    //ignorar as mensagems proprias, de grupos e status
    if(message.fromMe || chat.isGroup || message.isStatus){
        console.log('Ignorando mensagem de grupo | status | próprias');
        return;
    }

    //salvar a localização do cliente na base de dados
    if(typeChat === 'location'){
       console.log(`Localização Recebida: https://maps.google.com/?q=${chat.lastMessage.location.latitude},${chat.lastMessage.location.longitude}`);
    }

    //solicitar esclarecimento quando cliente enviar um áudio
    if(message.hasMedia && typeChat == 'image'){
        //cliente envia uma imagem
        await client.sendMessage(number, `😔 Desculpe, ainda não consigo ler imagens. Você pode escrever em texto ou me enviar um áudio descrevendo o que está na imagem, por favor?`);
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

    console.log(`Received:`,messageBody);
    //const location = new Location(-16.6491009,-49.1798874);
    
    //envia mensagem para o cliente
    //await client.sendMessage(number, location);

});

// Listener para o evento de digitação, específico por cliente
client.on('typing', async (chat) => {

});

