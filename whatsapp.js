const { Client, LocalAuth, Location} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

//funções locais
const {gpt, response_human} = require('./gpt/gpt');
const whisper = require('./gpt/whisper');

//variaveis de controle
let typingTimeouts = new Map(); //controla o timer de respostas para os clientes.
let messageComplet = new Map(); //junta mensagens quebradas

//configuração da API wweb.js
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

//apresenta o percentual de mensagens carregadas
client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR code gerado, escaneie com o WhatsApp');
});

//retorna erro caso tenha alguma falha na autenticação
client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Chatbot Sofia está online!');
});

//Listener para envento "receber mensagem". (ouve todas as mensagens recebidas)
client.on('message_create',async(message) =>{ 
    const chat = await message.getChat(); //captura todos os dados do chat iniciado
    const typeChat = message.type; // tipo de mensagem recebida
    const phone = chat.id.user; // telefone do cliente
    const messageBody = message.body; // corpo da mensagem (texto)
    const number = message.from; // telefone do cliente no formato API

    //Criando estrutura para salvar juntar mensagens quebradas.
    if (!messageComplet.has(phone)) {
        messageComplet.set(phone, []);
    }
    
    //ignorando as próprias mensagens
    if(message.fromMe){
        //Salva no histórico mensagens enviadas pelo atendimento humano
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
        //simula o "digitando..." enquanto aguarda a resposta do chatbot
        await chat.sendStateTyping();

        setTimeout(async () => {
            await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\nDesculpe, ainda *não consigo ler imagens*. Você pode *escrever em texto*✏️ ou me *enviar um áudio*🔊 descrevendo o que está na imagem, por favor?😔`);
        }, 2000);
        return;
    }

//---------------------------------------------ÁUDIO---------------------------------------------------//
    //salvar e interpretar o áudio enviado pelo cliente
    if(message.hasMedia && typeChat == 'ptt'){
        const media = await message.downloadMedia();
        const audioDir = path.join(__dirname, 'audios');

        // Cria o diretório se ele não existir
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }

        if(media.mimetype === 'audio/ogg; codecs=opus'){
            const audioPath = path.join(__dirname,'audios',`${message.id.id}.ogg`);
            fs.writeFileSync(audioPath,media.data,'base64');
            console.log(`Audio salvo em: ${audioPath}`);

            //função que converte aúdio em texto
            const textoAudio = await whisper(audioPath);

            //simula o "digitando..." enquanto aguarda a resposta do chatbot
            await chat.sendStateTyping();

            //envia o texto convertido para o gpt
            const response_gpt = await gpt(textoAudio);

            // Envia a resposta ao cliente
            await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${response_gpt}`);
            return;
        }
    }
//---------------------------------------------ÁUDIO---------------------------------------------------//

    //ignorar qualquer mensagem que não seja do tipo chat = texto
    if(typeChat !== 'chat') {
        return;
    }
    
    // Adiciona a mensagem no buffer
    messageComplet.get(phone).push(messageBody);

    // Verifica se já existe um timeout para o cliente e limpa caso exista
    if (typingTimeouts.has(phone)) {
        clearTimeout(typingTimeouts.get(phone));
    }

    // Adiciona ou reinicia o timeout para o cliente específico
    typingTimeouts.set(phone, setTimeout(async () => {
        const allMessages = messageComplet.get(phone).join(' ');

        //simula o "digitando..." enquanto aguarda a resposta do chatbot
        await chat.sendStateTyping();

        // Envia todas as mensagens para o GPT
        const response_gpt = await gpt(allMessages);

        // Envia a resposta ao cliente
        await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${response_gpt}`);

        // Após o envio, limpa o buffer de mensagens e o timeout
        messageComplet.delete(phone);
        typingTimeouts.delete(phone);

    }, 5000)); // Espera 5 segundos para processar mensagens quando o cliente para de digitar

    //const location = new Location(-16.6491009,-49.1798874);
});

// Listener (ouvinte) para o evento de digitação, específico por cliente
client.on('typing', async (chat) => {
    const phone = chat.id.user;

    // Se o cliente está digitando, limpa o timer para que ele conclua o texto
    if (typingTimeouts.has(phone)) {
         clearTimeout(typingTimeouts.get(phone));
    }
});