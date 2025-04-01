const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

const {controlClient, messages} = require('../utils/controlClient');

//Importando banco de dados do Cliente//
const dbClient = require('../models/Client');

//importando funções para inicialização do banco de dados//
const connectDB = require('../config/database');//arquivo de conexão com o banco de dados//
const {rulesCache, menuCache, deliveryCahe,initData} = require('../data/dataLoader');//sincroniza os dados do banco em cache local//

//inicia função que carrega variaveis com parametros para configuração do gpt//
gptParams();

//Importando funções de lógica de processamento//
const {saveName, saveAddress, calculateOrder} = require('../services/clienteService');

//Importando funções de chamada para o modelo GPT//
const tools = require('../tools/tools');

// Configuração da API//
const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY//Chave de API//
});

// Função de chamada chatbot//
async function gpt(message_body, phone) {

  if(!messages.has(phone)){
    messages.set(phone,[]);
    messages.get(phone).push(...rulesCache);//grava regras de atendimento nos parametros do chatbot//
    messages.get(phone).push(...menuCache);//grava o conteúdo do cardápio nos parametros do chatbot//
    messages.get(phone).push(...deliveryCahe);
    const client = await dbClient.findOne({phone});

    messages.get(phone).push({role: "system", content:`Este é o telefone do cliente: ${phone}`});
    
    if(client.name){
      messages.get(phone).push({role: "system", content:`O nome do cliente é: ${client.name}`});
    }else{
      messages.get(phone).push({role: "system", content:`Pergunte o nome do cliente antes de inicar o antedimento e chame a função saveName passando como parametro o nome e o telefone do cliente.`});
    }

    if(client.address?.location.lat && client.address?.location.long){
      messages.get(phone).push({role: "system", content:`A localização para o endereço do cliente é: https://maps.google.com/?q=${client.address.location.lat},${client.address.location.long}`});
    }else{
      messages.get(phone).push({role: "system", content:`Cliente ainda não possui localização registrada no sistema.`});
    }

    if(client.address.address_write){
      messages.get(phone).push({role: "system", content:`O endereço do cliente é: ${client.address.address_write}`});

      messages.get(phone).push({role: "system", content:`Caso o pedido seja para Entrega, pergunte ao cliente se o endereço registrado está correto. Se o endereço estiver correto seiga o atendimento normalmente.`});

      messages.get(phone).push({role: "system", content:`Se o cliente quiser alterar o endereço de entrega, peça para que o cliente envie o novo endereço por escrito, após isso reescreva o novo endereço do cliente e paça para que ele confirme, com o novo endereço confirmado chame a função saveAddress passando como parametro o novo endereço e o telefone do cliente.`});

    }else{
      messages.get(phone).push({role: "system", content:`O endereço do cliente ainda não está registrado no sistema.`});
    }
  };

  messages.get(phone).push({role: "user", content:message_body}); //grava a mensagem do cliente no histórico//

  try{
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",       //modelo gpt usado no atendimento
        temperature: 0.3,      // Menos aleatório, mais focado
        top_p: 0.5,            // Garantindo diversidade controlada
        presence_penalty: 1.0, // Menos desvio para tópicos irrelevantes
        max_tokens: 300,       // Respostas detalhadas, mas não excessivas
        messages: messages.get(phone),    //mensagens e parametros de funcionamento//
        tools: tools
    });

    const responseGpt = completion.choices[0].message.content; //salva a resposta do GPT//

    if(completion.choices[0].message?.content){//Resposta padrão em texto//
        messages.get(phone).push({role: "assistant", content:responseGpt}); //grava a resosta do chatbot no histórico//
        
    }if(completion.choices[0].message?.tool_calls){//Verifica se o GPT fez alguma chamada de função//
      const tool_calls = completion.choices[0].message.tool_calls; //captura a chamda de função//

      for(const tool_call of tool_calls){
        const function_name = tool_call.function.name; // captura o nome da função chamada//
        const argumentsJSON = tool_call.function.arguments;//argumentos que compõe a função//

        try {
          if(function_name === "saveName"){
            console.log("Chamando função Salvar Nome!");
            const arguments = JSON.parse(argumentsJSON);
    
            await saveName(arguments.name, arguments.phone);
    
            messages.get(phone).push({role: "system", content:`Nome do cliente: ${arguments.name} salvo no banco de dados com sucesso!`}); 
    
            return `#saveName`;
    
          }else if(function_name === "saveAddress"){
            console.log("Chamando função Salvar Endereço!");
            const arguments = JSON.parse(argumentsJSON);
    
            await saveAddress(arguments.address_write, arguments.phone);
            
            messages.get(phone).push({role: "system", content:`Novo endereço cadastrado com sucesso: ${arguments.address_write}`}); 
    
            return `#saveAddress`;
    
          }else if(function_name === "registerOrder"){
            console.log("Chamando função para registrar pedido!");
            const arguments = JSON.parse(argumentsJSON);
            
            //criando objeto com dados do cliente//
            const dataClient = {
              name:arguments.name,
              phone:arguments.phone,
              address:arguments.address_write,
              location: arguments.location,
              note_order:arguments.note_order,
              payment:arguments.payment,
              type_order:arguments.type_order
            };

            const detalhes = await calculateOrder(arguments.items, dataClient);
            console.log(detalhes);

            messages.get(phone).push({role: "system", content:`Pedido registrado com sucesso no sistema!`}); 
            
            if(controlClient.has(phone)){
              controlClient.set(phone,false);
            }

            return detalhes;
          }

        } catch (error) {
          console.log(`Erro ao processar chamada de função: ${function_name}`);
          return `Erro ao enviar pedido para o sistema.`
        }
      }
    }
    console.log(messages.get(phone));
    return responseGpt; //retornar a mensagem gerada pelo GPT//      

  } catch (error) {
    console.error("Erro ao acessar a API:", error.response?.data || error.message);
    return `Erro ao processar resposta!`;
  }
};

/*Função gptParams() é responsável por chamar as funções de conexão e inicialização de variaveis de cache*/
/*rulesCache e menuCache possuem os parametros necessários para a configuração do chatbot gpt*/
async function gptParams() {
  await connectDB(); // Aguarda a conexão com o banco de dados//
  await initData();  // recupera os dados do banco e guarda em cache local//
};

module.exports = gpt;