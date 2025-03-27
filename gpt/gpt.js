const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

//importando funções para inicialização do banco de dados//
const connectDB = require('../config/database');//arquivo de conexão com o banco de dados//
const {rulesCache, menuCache, initData} = require('../data/dataLoader');//sincroniza os dados do banco em cache local//

//inicia função que carrega variaveis com parametros para configuração do gpt//
gptParams();

// Configuração da API//
const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY//Chave de API//
});

//variável que controla parametros e histórico de conversas//
const messages = [];

// Função de chamada chatbot//
async function gpt(message_body) {
  messages.push({role: "user", content:message_body}); //grava a mensagem do cliente no histórico//

  try{
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",       //modelo gpt usado no atendimento
        temperature: 0.3,      // Menos aleatório, mais focado
        top_p: 0.5,            // Garantindo diversidade controlada
        presence_penalty: 1.0, // Menos desvio para tópicos irrelevantes
        max_tokens: 300,       // Respostas detalhadas, mas não excessivas
        messages: messages,    //mensagens e parametros de funcionamento//
        // model: "o3-mini",
        // reasoning_effort: "low"
    });
    const responseGpt = completion.choices[0].message.content; //salva a resposta do GPT//
    messages.push({role: "assistant", content:responseGpt}); //grava a resosta do chatbot no histórico//
    
    console.log(messages);
    console.log('\n--------------------------------------------------------------------------\n');

    return responseGpt; //retornar a mensagem gerada pelo GPT//

  } catch (error) {
    console.error("Erro ao acessar a API:", error.response?.data || error.message);
    return `Erro ao processar resposta!`;
  }
}

//Função que captura e salva no histórico mensagens do atendente humano
async function response_human(message) {
  if(!(message.includes("Chatbot IA - Sofia"))){
    messages.push({role: "assistant", content:`Mensagem enviada pelo atendente humano: ${message}`});
    return;
  }
  return;
}

/*Função gptParams() é responsável por chamar as funções de conexão e inicialização de variaveis de cache*/
/*rulesCache e menuCache possuem os parametros necessários para a configuração do chatbot gpt*/
async function gptParams() {
  await connectDB(); // Aguarda a conexão com o banco de dados//
  await initData();  // recupera os dados do banco e guarda em cache local//
  messages.push(...rulesCache);//grava regras de atendimento nos parametros do chatbot//
  messages.push(...menuCache);//grava o conteúdo do cardápio nos parametros do chatbot//
}

module.exports = {gpt, response_human};