const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();
const broadcasting = require('../websocket/broadcasting');

//variáveis de controle do cliente//
const {controlClient, messages, serviceHours} = require('../utils/controlClient');

//Importando banco de dados do Cliente//
const dbClient = require('../models/Client');

const {rulesCache, menuCache, deliveryCahe} = require('../data/dataLoader');//sincroniza os dados do banco em cache local//

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

  if(!serviceHours()){//Verifica se está no horário de atendimento//
    return"🔴 *Estamos Fechados!* 🔴\n\nAtendemos de  *Segunda* a *Sábado* das *18:00* às *22:50*";
  }

  if(!messages.has(phone)){
    messages.set(phone,[]);
    messages.get(phone).push(...rulesCache);//grava regras de atendimento nos parametros do chatbot//
    messages.get(phone).push(...menuCache);//grava o conteúdo do cardápio nos parametros do chatbot//
    messages.get(phone).push(...deliveryCahe);//grava a lista de bairros que a loja entrega nos parametros do chatbot//
    const client = await dbClient.findOne({phone});

    messages.get(phone).push({role: "system", content:`Este é o telefone do cliente: ${phone}`});
    
    if(client.name){
      messages.get(phone).push({role: "system", content:`O nome do cliente é: ${client.name}`});
    }

    if(client.address?.location?.lat && client.address?.location?.long){
      messages.get(phone).push({role: "system", content:`A localização do cliente é: https://maps.google.com/?q=${client.address.location.lat},${client.address.location.long}`});
    }else{
      messages.get(phone).push({role: "system", content:`A localização do cliente não está registrada no sistema.`});
    }

    if(client.address?.address_write){
      messages.get(phone).push({role: "system", content:`O endereço do cliente é: ${client.address.address_write}`});

      messages.get(phone).push({role: "system", content:`Caso o pedido seja para entrega, pergunte ao cliente se o endereço registrado está correto. Se o endereço estiver correto, siga o atendimento normalmente.`});

      messages.get(phone).push({role: "system", content:`Se o cliente quiser alterar o endereço de entrega, peça para que envie o novo endereço por escrito. Após isso, reescreva o novo endereço do cliente e peça para que ele confirme. Com o novo endereço confirmado, chame a função saveAddress passando como parâmetro o novo endereço e o telefone do cliente.`});

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
        max_tokens: 200,       // Respostas detalhadas, mas não excessivas
        messages: messages.get(phone),  //mensagens e parametros de funcionamento//
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

            messages.get(phone).push({role: "system", content:`Pedido registrado com sucesso no sistema!`}); 
             
            if(controlClient.has(phone)){//desativa o chatbot após registrar o pedido do cliente//
              controlClient.set(phone,false);
            }
            await broadcasting(controlClient);
            return detalhes; //retorna o pedido organizado//

          }else if(function_name === "disableBot"){
            console.log("Chamando função para desativar o chatbot");
            if(controlClient.has(phone)){//desativa o chatbot após registrar o pedido do cliente//
              controlClient.set(phone,false);
            }
            await broadcasting(controlClient);
            return`*ChatBot* desativado, _aguarde a reposta de um atendente!_⏳`;
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

module.exports = gpt;