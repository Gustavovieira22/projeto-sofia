//Importado módulos do npm//
const { Client, LocalAuth, Location, MessageMedia} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

//Funções de chamada para modelos de IA//
const gpt = require('./gpt/gpt'); //Chamada para API gpt - Salva respostas do atendente humano no histórico//
const whisper = require('./gpt/whisper');//converte áudio em texto//

//importando funções de lógica de processamento//
const tagProcess = require('./services/tagProcess');
const {saveClient, saveLocation} = require('./services/clienteService');

//variaveis de controle//
const botStart_time = Date.now();//hora da inicialização do chatbot//
const {controlClient, messages} = require('./utils/controlClient'); //controle de status de atendimento //Histórico de mensagens do cliente//

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

//apresenta o percentual de mensagens carregadas
client.on('loading_screen', (percent, message) => {
    console.log('Carregando Mensagens:',`${percent}%`, message);
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
    const message_time = message.timestamp * 1000; //captura a hora que a mensagem foi enviada//
    const chat = await message.getChat(); //captura todos os dados do chat iniciado
    const typeChat = message.type; // tipo de mensagem recebida
    const phone = chat.id.user; // telefone do cliente
    const messageBody = message.body; // corpo da mensagem (texto)
    const number = message.from; // telefone do cliente no formato API
    
    //ignorar as mensagems de grupos e status//
    if(chat.isGroup || message.isStatus){
        console.log('Ignorando mensagem de grupo | status');
        return;
    }
    
    if(typeChat === 'location'){//salvar a localização do cliente na base de dados
        if(!message.fromMe){
            await saveLocation(chat.lastMessage.location.latitude, chat.lastMessage.location.longitude, phone);
            if(messages.has(phone)){
                messages.get(phone).push({role: "system", content:`A localização para o endereço do cliente é: https://maps.google.com/?q=${chat.lastMessage.location.latitude},${chat.lastMessage.location.longitude}`});
            }
            return;
        }
    }

    if(messageBody.length>250 && !message.fromMe){//Ignora mensagens muito longas, desativa atendimento de chatbot//
        console.log(`Mensagem muito longa, desativando chatbot para: ${phone}`);
        controlClient.set(phone, false);
        return;
    }

    //ignora mensagens enviadas antes da inicialização do chatbot//
    if (message_time < botStart_time) {
        console.log("Ignorando mensagens antigas.");
        return;
    }

    //verifica se é o primeiro contato do cliente//
    if(!controlClient.has(phone)){
        await saveClient(phone);//Verifica se cliente está registrado no banco de dados//
        controlClient.set(phone, true);//salva cliente no cache status de atendimento//

        //Primeira mensagem de saudação//
        if(typeChat === 'chat' && !message.fromMe && controlClient.get(phone)){
            await chat.sendStateTyping(); //simula o "digitando..."//
            await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n⭐⭐⭐⭐⭐\nSeja bem-vindo(a) ao *Henry Burguer!*\nhttps://henryburguer.com.br/`);
        }
    }

    //Salva no histórico mensagens enviadas pelo atendimento humano//
    if(message.fromMe){
        if(controlClient.has(phone)){//desativa o chatbot para o contato que receber essa mensagem//
            if(messageBody.includes("desativar")){
              controlClient.set(phone,false);
              return;
            }else if(!(messageBody.includes("Chatbot IA - Sofia")) && typeChat === 'chat' && messageBody != "" && messages.has(phone)){//captura as mensagens enviadas pelo atendimento humano//
              messages.get(phone).push({role: "assistant", content:`Mensagem enviada pelo atendente humano: ${messageBody}`});
              return;
            }
          }
        return;
    }
    
    if(!(controlClient.get(phone))){
        console.log(`chatbot desativado para o cliente: ${phone}`);
        return;
    }

    //solicitar esclarecimento quando cliente enviar imagem
    if(message.hasMedia && typeChat == 'image'){
        await chat.sendStateTyping(); //simula o "digitando..."//

        //Aguarda 2 segundos antes de enviar mensagem para o cliente//
        setTimeout(async () => {
            await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\nDesculpe, ainda *não consigo ler imagens*. Você pode *escrever em texto* ou me *enviar um áudio* descrevendo o que está na imagem, por favor?😔`);
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

            //envia o texto convertido para o gpt
            const response_gpt = await gpt(textoAudio, phone);

            //Função que verifica tag de substituição//
            const processMessage = await tagProcess(response_gpt,phone);

            //caso tenha substituição de tags//
            if(processMessage.processMessage){
                await chat.sendStateTyping();//simula o "digitando..."//
                
                //Aguarda 2 segundos antes de enviar mensagem para o cliente//
                setTimeout(async () => {
                    await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${processMessage.processMessage}`);                
                    
                    if(processMessage.location){//verifica se a localização foi solicitada//
                        const location = new Location(-16.6492995,-49.1799726);//gera localização da loja//
                        await client.sendMessage(number, location, "Henry Burguer - Goiânia, GO");//envia localização para o cliente//

                    }else if(processMessage.pdf){//verifica se o cardapio em PDF foi solicitado//
                        await client.sendMessage(number, mediaPdf);//envia cardápio em pdf para cliente//

                    }else if(processMessage.order){//verifica se o pedido foi lançado//
                        await chat.sendStateTyping();//simula o "digitando..."//
                        await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n✅Pedido enviado com sucesso!\n_Aguarde a confirmação pelo atendente!_`);
                    }
                }, 2000);
                return;   
            }else{
                await chat.sendStateTyping();//simula o "digitando..."//

                //Aguarda 2 segundos antes de enviar mensagem para o cliente//
                setTimeout(async () => {
                    await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${response_gpt}`);
                }, 2000);
                return;   
            }
        }
    }
//---------------------------------------------ÁUDIO---------------------------------------------------//

    //ignorar qualquer mensagem que não seja do tipo chat = texto//
    if(typeChat !== 'chat') {
        return;
    }

    const response_gpt = await gpt(messageBody, phone);// Envia mensagem do cliente para processamento no gpt//

    const processMessage = await tagProcess(response_gpt,phone);//Função que verifica tag de substituição//

    if(processMessage.processMessage){
        await chat.sendStateTyping();//simula o "digitando..."//

        // Envia mensagem com correção de tag para o cliente//
        await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${processMessage.processMessage}`);

        if(processMessage.location){//verifica se a localização foi solicitada//
            const location = new Location(-16.6492995,-49.1799726);//gera localização da loja//
            await client.sendMessage(number, location, "Henry Burguer - Goiânia, GO");//envia localização para o cliente//

        }else if(processMessage.pdf){//verifica se cardapio em PDF foi solicitado//
            await client.sendMessage(number, mediaPdf);//envia cardápio em pdf para cliente//

        }else if(processMessage.order){//verifica se o pedido foi lançado//
            await chat.sendStateTyping();//simula o "digitando..."//
            await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n✅Pedido enviado com sucesso!\n⏳ _Aguarde a confirmação do atendente!_`);
        }
    }else{
        await chat.sendStateTyping();//simula o "digitando..."//

        //Aguarda 2 segundos antes de enviar mensagem para o cliente//
        setTimeout(async () => {
            await client.sendMessage(number, `*Chatbot IA - Sofia:*\n\n${response_gpt}`);
        }, 2000);
    }
});

module.exports = client;