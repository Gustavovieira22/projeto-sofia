const OpenAI = require("openai");
const dotenv = require("dotenv");
const Delivery_locations = require('../models/Delivery_locations');
const Menu = require('../models/Menu');
dotenv.config();
//Função que atualiza dados de clientes no frontend//
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
    controlClient.set(phone, false); //avisa que está fechado e retira do cliente do atendimento//
    broadcasting(controlClient); //atualiza o front//
    return"🔴 *Estamos Fechados!* 🔴\n\nAtendemos de  *Segunda* a *Sábado* das *18:00* às *22:50*";
  }

  if(!messages.has(phone)){
    messages.set(phone,[]);
    //messages.get(phone).push(...menuCache);//grava o conteúdo do cardápio nos parametros do chatbot//
    //messages.get(phone).push(...deliveryCahe);//grava a lista de bairros que a loja entrega nos parametros do chatbot//
    const client = await dbClient.findOne({phone});
    const aditional = JSON.parse(JSON.stringify(rulesCache));
    aditional[0].content += `\n\n### INFORMAÇÕES SOBRE O CLIENTE EM ATENDIMENTO DESCRITAS ABAIXO: ###\n\n`;

    //messages.get(phone).push({role: "assistant", content:`O cliente já informou seu número de telefone: ${phone}`});
    aditional[0].content += `\n -> O telefone do cliente é: ${phone}\n`;

    if(client?.name){
      //messages.get(phone).push({role: "assistant", content:`O cliente já informou seu nome, é: ${client.name}`});
      aditional[0].content += `\n -> O nome do cliente é: ${client.name}\n`;
    }

    if(client?.address?.location?.lat && client.address?.location?.long){
      //messages.get(phone).push({role: "assistant", content:`A localização do cliente é: https://maps.google.com/?q=${client.address.location.lat},${client.address.location.long}`});
      aditional[0].content += `\n -> A localização para o endereço do cliente é: https://maps.google.com/?q=${client.address.location.lat},${client.address.location.long}\n`;
    }else{
      //messages.get(phone).push({role: "assistant", content:`A localização do cliente não está registrada no sistema.`});
      aditional[0].content += `\n -> A localização do cliente não está registrada no sistema.\n`;
    }

    if(client?.address?.address_write){
      //messages.get(phone).push({role: "assistant", content:`O endereço do cliente é: ${client.address.address_write}`});
      aditional[0].content += `\n -> O endereço do cliente é: ${client.address.address_write}\n`;
      
      //messages.get(phone).push({role: "assistant", content:`Caso o pedido seja para entrega, pergunte ao cliente se o endereço registrado está correto. Se o endereço estiver correto, siga o atendimento normalmente.`});
      // aditional[0].content += `\n### Caso o pedido seja para entrega, pergunte ao cliente se o endereço registrado está correto. Se o endereço estiver correto, siga o atendimento normalmente.\n`;
      
      //messages.get(phone).push({role: "assistant", content:`Se o cliente quiser alterar o endereço de entrega, peça para que envie o novo endereço por escrito. Após isso, reescreva o novo endereço do cliente e peça para que ele confirme. Com o novo endereço confirmado, chame a função saveAddress passando como parâmetro o novo endereço e o telefone do cliente.`});

      aditional[0].content += `\n### Se o cliente quiser alterar o endereço de entrega, peça para que envie o novo endereço por escrito. Após isso, reescreva o novo endereço do cliente e peça para que ele confirme. Com o novo endereço confirmado, chame a função saveAddress passando como parâmetro o novo endereço e o telefone do cliente.\n`;

    }else{
      //messages.get(phone).push({role: "assistant", content:`O endereço do cliente ainda não está registrado no sistema.`});
      aditional[0].content += `\n -> O endereço do cliente ainda não está registrado no sistema.\n`;
    }
    messages.get(phone).push(...aditional);//grava regras de atendimento nos parametros do chatbot//
  };

  if(message_body != '#executed'){
    messages.get(phone).push({role: "user", content:message_body}); //grava a mensagem do cliente no histórico//   
  }
  
  try{
    const completion = await openai.chat.completions.create({
        model: "gpt-4.1",       //modelo gpt usado no atendimento
        temperature: 0.0,      // Menos aleatório, mais focado
        top_p: 0.1,            // Garantindo diversidade controlada
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
    
            messages.get(phone).push({role: "function", name: 'saveName', content:`O nome do cliente: ${arguments.name} foi registrado no banco de dados com sucesso!`}); 
    
            return `#saveName`;
    
          }else if(function_name === "saveAddress"){
            console.log("Chamando função Salvar Endereço!");
            const arguments = JSON.parse(argumentsJSON);
    
            await saveAddress(arguments.address_write, arguments.phone);

            messages.get(phone).push({role: "function", name: 'saveAddress', content:`Endereço do cliente: ${arguments.address_write} foi registrado no banco de dados com sucesso!`}); 
            
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
            messages.get(phone).push({role: "function", name: 'registerOrder', content:`Pedido enviado para o sistema com sucesso!`}); 
             
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
            return`*ChatBot Desativado* _Aguarde alguns minutos, um atendente já vai te responder._ ⏳⏳`;
            
          }else if(function_name === "locais_entrega"){
            console.log("Chamando função que retorna os locais de entrega");
            const delivery = await Delivery_locations.find().sort({ _id: 1 });
            const delivery_system = delivery.map(d => d.content).join('\n');
            messages.get(phone).push({role: "function", name: 'locais_entrega', content:`### LISTACOM ALGUNS BAIRROS QUE O HENRY BURGUER FAZ ENTREGAS:###\n\n ${delivery_system}`}); 
            return `#saveAddress`;

          } else if(function_name === "menu_description"){
              console.log("Chamando função que retorna informações do cardápio.");

              const menu = await Menu.find().sort({ _id: 1 });
              const menu_system = menu.map(menu => {
                  const itens = menu.item.map(item =>
                    `Nome: ${item.name}` +
                    (item.description ? ` - Descrição: ${item.description}` : "") +
                    ` - Preço: R$${item.price}`
                  ).join("\n");
                  return `Categoria: ${menu.category}\n${itens}`;
                }).join("\n\n");

              messages.get(phone).push({role: "function", name: 'menu_description', content:`### RELAÇÃO COM TODOS OS ITENS DO CARDÁPIO: ###\n\n ${menu_system}`}); 
              return `#saveAddress`;
          }

        } catch (error) {
          console.log(`Erro ao processar chamada de função: ${function_name}`);
          return `*Erro* ao processar função - aguarde alguns segundos e tente novamente.`
        }
      }
    }
    console.log(messages.get(phone));
    console.log('\n************************************************************************************\n');
    return responseGpt; //retornar a mensagem gerada pelo GPT//      
  } catch (error) {
    console.error("Erro ao acessar a API:", error.response?.data || error.message);
    return `*Erro* ao processar resposta.`;
  }
};

module.exports = gpt;