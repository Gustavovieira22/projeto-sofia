const { Client, LocalAuth, Location, MessageMedia} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

//Funções de chamada para modelos de IA//
const {gpt, response_human} = require('./gpt/gpt'); //Chamada para API gpt - Salva respostas do atendente humano no histórico//
const whisper = require('./gpt/whisper');//converte áudio em texto//

//importando funções de lógica do processamento de mensagens//
const tagProcess = require('./services/tagProcess');

//variaveis de controle//
let typingTimeouts = new Map(); //controla o timer de respostas para os clientes.
let messageComplet = new Map(); //junta mensagens quebradas
const botStart_time = Date.now();//hora da inicialização do chatbot

//importa cardápio em formato PDF//
const pdfPath = `./cardapio_pdf/cardapio_2025_01.pdf`;
const mediaPdf = MessageMedia.fromFilePath(pdfPath);


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

//apresenta o percentual de mensagens carregadas
client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

//exibe qr code no terminal//
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR code gerado, escaneie com o WhatsApp');
});

//retorna erro caso tenha alguma falha na autenticação
client.on('auth_failure', msg => {
    console.error('Falha na autenticação!', msg);
});

//api está pronto para receber mensagens//
client.on('ready', () => {
    console.log('Chatbot Online!');
});

//Listener para envento "receber mensagem". (ouve todas as mensagens recebidas)
client.on('message_create',async(message) =>{ 
    const message_time = message.timestamp * 1000; //captura a hora que a mensagem foi enviada.
    const chat = await message.getChat(); //captura todos os dados do chat iniciado
    const typeChat = message.type; // tipo de mensagem recebida
    const phone = chat.id.user; // telefone do cliente
    const messageBody = message.body; // corpo da mensagem (texto)
    const number = message.from; // telefone do cliente no formato API

    //ignora mensagens enviadas antes da inicialização do chatbot//
    if (message_time < botStart_time) {
        console.log("Ignorando mensagens antigas.");
        return;
    }
    
    //ignorar as mensagems de grupos e status//
    if(chat.isGroup || message.isStatus){
        console.log('Ignorando mensagem de grupo | status');
        return;
    }

    //Criando estrutura para juntar mensagens quebradas//
    if (!messageComplet.has(phone)) {
        messageComplet.set(phone, []);
    }

    //Salva no histórico mensagens enviadas pelo atendimento humano//
    if(message.fromMe){
        response_human(messageBody);
        return;
    }

    //salvar a localização do cliente na base de dados
    if(typeChat === 'location'){
       console.log(`Localização Recebida: https://maps.google.com/?q=${chat.lastMessage.location.latitude},${chat.lastMessage.location.longitude}`);
    }

    //solicitar esclarecimento quando cliente enviar imagem
    if(message.hasMedia && typeChat == 'image'){
        //simula o "digitando..." enquanto aguarda a resposta do chatbot//
        await chat.sendStateTyping();

        //Aguarda 2 segundos antes de enviar mensagem para o cliente//
        setTimeout(async () => {
            await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\nDesculpe, ainda *não consigo ler imagens*. Você pode *escrever em texto*✏️ ou me *enviar um áudio*🔊 descrevendo o que está na imagem, por favor?😔`);
        }, 2000);
        return;
    }

//---------------------------------------------ÁUDIO---------------------------------------------------//
    //salvar e interpretar o áudio enviado pelo cliente//
    if(message.hasMedia && typeChat == 'ptt'){
        const media = await message.downloadMedia();
        const audioDir = path.join(__dirname, 'audios');

        // Cria o diretório se ele não existir//
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }

        if(media.mimetype === 'audio/ogg; codecs=opus'){
            const audioPath = path.join(__dirname,'audios',`${message.id.id}.ogg`);
            fs.writeFileSync(audioPath,media.data,'base64');
            console.log(`Audio salvo em: ${audioPath}`);

            //função que converte aúdio em texto//
            const textoAudio = await whisper(audioPath);

            //simula o "digitando..." enquanto carrega resposta do chatbot
            await chat.sendStateTyping();

            //envia o texto convertido para o gpt
            const response_gpt = await gpt(textoAudio);

            //Função que verifica tag de substituição//
            const processMessage = await tagProcess(response_gpt);

            //caso tenha substituição de tags//
            if(processMessage.processMessage){
                //Aguarda 2 segundos antes de enviar mensagem para o cliente//
                setTimeout(async () => {
                    await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${processMessage.processMessage}`);                
                    if(processMessage.location){//verifica se a localização foi solicitada//
                        const location = new Location(-16.6492995,-49.1799726);//gera localização da loja//
                        await client.sendMessage(number, location, "Henry Burguer - Goiânia, GO");//envia localização para o cliente//

                    }else if(processMessage.pdf){
                        await client.sendMessage(number, mediaPdf);//envia cardápio em pdf para cliente//
                    }
                }, 2000);
                return;   
            }else{
                //Aguarda 2 segundos antes de enviar mensagem para o cliente//
                setTimeout(async () => {
                    await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${response_gpt}`);
                }, 2000);
                return;   
            }
        }
    }

//---------------------------------------------ÁUDIO---------------------------------------------------//
    //ignorar qualquer mensagem que não seja do tipo chat = texto
    if(typeChat !== 'chat') {
        return;
    }
    
    // Adiciona a mensagem no buffer de mensagens quebradas//
    messageComplet.get(phone).push(messageBody);

    // Verifica se já existe um timeout para o cliente e limpa caso exista//
    if (typingTimeouts.has(phone)) {
        clearTimeout(typingTimeouts.get(phone));
    }

    // Adiciona ou reinicia o timeout para o cliente específico//
    typingTimeouts.set(phone, setTimeout(async () => {
        const allMessages = messageComplet.get(phone).join(' ');//juntando todas as mensagens quebradas//

        //simula o "digitando..." enquanto aguarda a resposta do chatbot
        await chat.sendStateTyping();

        // Envia uma única mensagem para o gpt//
        const response_gpt = await gpt(allMessages);

        //Função que verifica tag de substituição//
        const processMessage = await tagProcess(response_gpt);

        if(processMessage.processMessage){
            // Envia mensagem com correção de tag para o cliente//
            await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${processMessage.processMessage}`);
            if(processMessage.location){
                const location = new Location(-16.6492995,-49.1799726);//gera localização da loja//
                await client.sendMessage(number, location, "Henry Burguer - Goiânia, GO");//envia localização para o cliente//

            }else if(processMessage.pdf){
                await client.sendMessage(number, mediaPdf);//envia cardápio em pdf para cliente//
            }
        }else{
            await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${response_gpt}`);
        }

        // Após o envio, limpa o buffer de mensagens e o timeout//
        messageComplet.delete(phone);
        typingTimeouts.delete(phone);

    }, 4000)); // Espera 4 segundos para processar mensagens quando o cliente para de digitar//
});

// Listener (ouvinte) para o evento de digitação//
/*Faz o chatbot aguardar 4 segundos sempre que o cliente começa a digitar*/
client.on('typing', async (chat) => {
    const phone = chat.id.user;
    // Se o cliente está digitando, limpa o timer para que ele conclua o texto//
    if (typingTimeouts.has(phone)) {
         clearTimeout(typingTimeouts.get(phone));
    }
});