//importando models de banco de dados//
const Menu = require('../models/Menu'); //cardápio do restaurante//
const Rules_gpt = require('../models/Rule_gpt'); //Regras de atendimento//

let rulesCache = [];//regas//
let menuCache = [];//cardápio//

//Função que carrega dados do banco de dados para variavel local//
async function loadData() {
    try {     
        const rules = await Rules_gpt.find().sort({ _id: 1 });//recupera dados do banco de dados em ordem//
        rulesCache.push(...rules.map(rule =>({
            role:rule.role,
            content: rule.content
        })));//formata os dados para a estrutura aceita pela API do chat GPT//

        const menu = await Menu.find().sort({ _id: 1 });//recupera dados do banco de dados em ordem//
        menuCache.push(...menu.map(menu => ({
            role:"system",
            content: `Categoria: ${menu.category}\n` + 
            menu.item.map(item => 
                `Nome: ${item.name}` + 
                (item.description ? ` - Descrição: ${item.description}` : "") + 
                ` - Preço: R$${item.price}`
            ).join("\n")
        })));//formata os dados para a estrutura aceita pela API do chat GPT//

        console.log('Dados carregados com sucesso!');

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

//função que executa a inicialização das variáveis//
async function initData() {
    await loadData();
}

module.exports = { rulesCache, menuCache, initData };
