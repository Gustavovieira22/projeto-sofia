//importando models de banco de dados//
const Menu = require('../models/Menu'); //cardápio do restaurante//
const Rules_gpt = require('../models/Rule_gpt'); //Regras de atendimento//
const Delivery_locations = require('../models/Delivery_locations');//

let rulesCache = [];//regas//
let menuCache = [];//cardápio//
let deliveryCahe = [];//bairros de entrega//

//Função que carrega dados do banco de dados para variavel local//
async function loadData() {
    try {     
        const rules = await Rules_gpt.find().sort({ _id: 1 });//recupera dados do banco de dados em ordem//
        const rules_system = rules.map(r => r.content).join('\n');

        //const delivery = await Delivery_locations.find().sort({ _id: 1 });//recupera dados do banco de dados em ordem//
        //const delivery_system = delivery.map(d => d.content).join('\n');

        // const menu = await Menu.find().sort({ _id: 1 });//recupera dados do banco de dados em ordem//
        // const menu_system = menu.map(menu => {
        //     const itens = menu.item.map(item =>
        //       `Nome: ${item.name}` +
        //       (item.description ? ` - Descrição: ${item.description}` : "") +
        //       ` - Preço: R$${item.price}`
        //     ).join("\n");
        //     return `Categoria: ${menu.category}\n${itens}`;
        //   }).join("\n\n");
        
        rulesCache.push({role: 'system',content: `### REGRAS DE ATENDIMENTO ###:\n\n${rules_system}`});

        console.log('Dados carregados com sucesso!');

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

//função que executa a inicialização das variáveis//
async function initData() {
    await loadData();
}

module.exports = { rulesCache, menuCache, deliveryCahe, initData };
