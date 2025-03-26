const Menu = require('../models/Menu');
const Rules_gpt = require('../models/Rule_gpt');

let rulesCache = [];
let menuCache = [];

async function loadData() {
    try {     
        const rules = await Rules_gpt.find().sort({ _id: 1 });
        rulesCache.push(...rules.map(rule =>({
            role:rule.role,
            content: rule.content
        })))

        const menu = await Menu.find().sort({ _id: 1 });
        menuCache.push(...menu.map(menu => ({
            role:"system",
            content: `Categoria: ${menu.category}\n` + 
            menu.item.map(item => 
                `Nome: ${item.name}` + 
                (item.description ? ` - Descrição: ${item.description}` : "") + 
                ` - Preço: R$${item.price}`
            ).join("\n")
        })));

        console.log('Dados carregados com sucesso!');

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

async function initData() {
    await loadData();
}

module.exports = { rulesCache, menuCache, initData };
