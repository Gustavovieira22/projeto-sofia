const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

//importando função de inicialização
const connectDB = require('../config/database');
const {rulesCache, menuCache, initData} = require('../data/dataLoader');//sincroniza os dados do banco em cache//

async function gptParams() {
  await connectDB(); // Aguarda a conexão com o banco
  await initData();  // Só executa depois que o banco estiver pronto
}

gptParams();

// Configuração da API
const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
});

//variável para controlar o histórico
const messages = [];

// Função principal do chatbot
async function gpt(message_body) {
  //grava a mensagem do cliente no histórico
  messages.push(...rulesCache);
  messages.push(...menuCache);
  messages.push({role: "user", content:message_body});

  try{
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.3,      // Menos aleatório, mais focado
        top_p: 0.5,            // Garantindo diversidade controlada
        presence_penalty: 1.0, // Menos desvio para tópicos irrelevantes
        max_tokens: 300,       // Respostas detalhadas, mas não excessivas
        messages: messages,
        // model: "o3-mini",
        // reasoning_effort: "low"
    });
    
    //grava a resosta do chatbot no histórico
    messages.push({role: "assistant", content:completion.choices[0].message.content});

    return completion.choices[0].message.content;

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

module.exports = {gpt, response_human};