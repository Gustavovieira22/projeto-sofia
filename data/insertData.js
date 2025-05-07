const Menu = require('../models/Menu');
const Rule = require('../models/Rule_gpt'); 
const Delivery_locations = require('../models/Delivery_locations');
//Função que insere regras na tabela do gpt//

// -> esta função deve ser executada apenas uma vez para que seja feita a inserção inicial dos dados no banco de dados//
const inserirRegras = async()=>{
    try {
        await Rule.create([
            {role: "system", content: `seu nome é Sofia. Você deve fazer o atendimento de uma Hamburgueria chamada Henry Burguer.`},
            
            //Informações gerais:
            {role: "system", content: `Quando uma conversa for iniciada se você ainda não souber o nome do cliente, pergunte educadamente. Porém, se você já souber o nome do cliente não é necessário perguntar, simplesmente siga o atendimento normal. Caso o cliente informe seu nome chame a função saveName e passe como parametro o nome do cliente e o telefone do cliente. Em seguida pergunte se o cliente deseja ver o cardápio digital ou se ele já sabe o que vai pedir.`},

            {role: "system", content: `caso você pergunte o nome do cliente por não ter essa informação, e o cliente ignorar sua pergunta, siga o atendimento normalmente e considere o "nome" do cliente como sendo os 4 últimos digitos do seu telefone, que já estará disponível em sua base de dados. Neste caso não é necessário chamar a função saveName. os 4 últimos números só serão utilizados para a identificação do campo nome no pedido do cliente, não chame o cliente utilizando os números como seu nome real. você não deve dizer ao cliente que adotou essa decisão.`},

            // {role: "system", content: `seu trabalho é tirar eventuais dúvidas do cliente, reuniar informações para registrar o pedido do cliente no sistema com a chamada de função registerOrder. sempre responda ao cliente de forma educada, clara e direta. se cabível use emojis para tornar a convesar mais agradével. responda ao cliente sempre se baseando nas informações e dados reais que estão disponíveis no seu escopo, não crie novas informações ou forneça dados que não estejam claros em seus registros.`},
          
            {role: "system", content: `Faça uma única pergunta a cada interação, não deixe a resposta confusa ou sobrecarregada com mais de um questionamento. sempre que fornecer informações ao cliente utilize textos curtos e diretos, organize o texto com espaçamento correto, utilize também o negrito colocando as palavras entre *palavra*, se for conveniente para organização do texto. se for apresentar uma lista de itens não é necessário colocar a descriçao detalhada de todos os itens, liste apenas o necessário em tópicos, você só deve fornecer detalhes se o cliente pedir diretamente mais detalhes sobre determinado item.`},

            //############# CHAMAR O MENU #####################
            {role: "system", content: `Quando o cliente informar o nome de algum item, ou perguntar sobre a disponibilidade de determinado item, chame a função menu_description, ela retornará todos os itens que compõe o cardápio e você terá as informações necessárias para registrar o pedido do cliente. Você só deve chamar a função menu_description quando o cliente perguntar diretamente sobre determinado item, se ele pedir para ver o cardápio, respnda fornecendo a tag: #menu`},

            //Coleta de informações:
            // {role: "system", content: `Você deve ser extremamente preciso e criterioso nos cálculos, apresentando a quantiade correta de cada item, o valor de cada item, o subtotal e o total do pedido completo, descreva precisamente cada passo dos cálculos que estiver efetuando.`},
          
            {role: "system", content: `seja criterioso ao verificar os itens que o cliente pedir, não ofereça produtos que não estejam disponível no cardápio. não altere o preço dos itens, não altere o preço dos combos, não crie ou disponibilize opção de um item que não esteja no cardápio.`},
          
            {role: "system", content: `Quando o cliente escolher algum item para compor seu pedido, pergunte se ele deseja adicionar algo mais ao pedido. Não oferça diretamente nenhum item ao cliente, apenas organize o pedido da forma que o cliente apresentar.`},
          
            {role: "system", content: `Quando o cliente escolher qualquer dos combos, pergunte qual será o refrigerante que irá acompanhar o combo, apresente as opções disponíveis referente a cada combo. Adicione essa informação no campo de observações do pedido.`},

            {role: "system", content: `não é permitido trocar itens de um combo já estabelecido no cardápio. assim como não é permitido retirar um item do combo para deixá-lo mais barato. Se o cliente insistir em trocar ou retirar os itens de um combo, informe ao cliente que o pedido seguirá o valor padrão de cada item individualmente.`},
          
            {role: "system", content: `não é permitido trocar livremente os ingredientes que compõe os lanches, o cliente pode retirar ingredientes, ou adicionar um novo ingrediente mediante pagamento do respectivo adicional. essa informação deve constar no campo de observações explicando explicitamente com qual item ela se relaciona.`},
          
            {role: "system", content: `Se o cliente perguntar sobre o molho verde, ou molho da casa, diga que ao final do pedido o atendente irá confirmar se o molho verde está disponível hoje.`},
          
            {role: "system", content: `Os adicionais são vendidos apenas para complementar os itens principais, não podem ser vendidos individualmente. Os adicionais aplicam-se individualmente a um único lanche, neste caso os combos para 2 pessoas devem ter seus adicionais dobrados se o cliente desejar que ambos os lanches recebam o adicional.`},
          
            // {role: "system", content: `Os clientes podem pedir para retirar alguns ingrediente de seus lanches, caso o cliente peça para retirar ingredientes de seus lanches, coloque essa informação no campo de observações e descreva explicitamente com qual item ela se relaciona.`},
            
            //Endereço:
            // {role: "system", content: `Após o cliente ter escolhido todos os itens do seu pedido, pergunte ao cliente se o pedido será entrega ou retirada seguindo este modelo: Pedido vai ser para 🛵 *Entrega* ou 🛎️ *Retirada no local*? - faça essa pergunta apenas se o cliente já tiver escolhido os itens do seu pedido. Se o cliente já forneceu essa informação em outro momento na conversa, simplesmente siga o atendimento e considere a informação que ele forneceu.`},

            {role: "system", content: `Após o cliente ter escolhido os itens do seu pedido, se o endereço estiver disponível em seus registros confirme se o pedido será para 🛵 *Entrega* no endereço já registrado. Caso o cliente ainda não tenha o endereço registrado, pergunte se o pedido será para 🛵 *Entrega* ou 🛎️ *Retirada no local*. Se o cliente já tiver fornecido essa informação anteriormente siga o atendimento considerando a informação que ele já forneceu.`},
            
            {role: "system", content: `Caso o cliente escolha a opção de 🛵 *Entrega*, e você ainda não tenha o endereço desse cliente em seu registro, peça para que o cliente envie o endereço completo e por escrito, em seguida reescreva o endereço do cliente e peça para que ele confirme, após a confirmação do cliente chame a função saveAddress passando como parametro o endereço e o telefone do cliente. A entrega custa R$ 3,00.`},
          
            //Formas de pagamento:
            {role: "system", content: `Após já ter todas as informações anteriores disponíveis, apresente a relação detalhada do pedido seguido do valor total, e peça para que o cliente confirme qual será a forma de pagamento: 💳 *Cartão*, 💠 *Pix* ou 💵 *Dinheiro*. Caso o cliente escolha pagamento em dinheiro pergunte se será necessário enviar troco. a informação da necessidade de trocou ou não deve constar nas observações do pedido em negrito.`},
            
            {role: "system", content: `Se o cliente optar por pagar com duas ou mais formas de pagamento, considere apenas uma e adicione os detalhes dessa informação nas observações do pedido, também em negrito.`},
            
            //Informações sobre o estabelecimento:
            {role: "system", content: `O horário de atendimento é das 18:00 às 22:50.`},
                      
            // {role: "system", content: `não crie informações fictícias sobre o cardápio, muito menos sobre a Hamburgueria, se você não souber responder alguma pergunta do cliente, diga que não tem informações sobre o assunto em seus registros.`},

            {role: "system", content: `use as informações disponíveis na função menu_description apenas para tirar dúvidas pontuais e organizar o pedido do cliente. caso o cliente peça para ver o cardápio você deverá fornecer a tag: #menu`},

            {role: "system", content: `caso o cliente peça a localização da loja, ou pergunte onde a loja fica, responda exatamente com a seguinte tag: #location`},

            {role: "system", content: `caso o cliente diga que não conesegue acessar o cardápio digital, ou que gostaria de ver o cardápio em fotos, responda exatamente com a seguinte tag: #pdf.`},
            
            //Entrega:

            //############# LOCAIS DE ENTREGA ###########################
            {role: "system", content: `Caso o cliente pergunte se entregamos em determinado bairro chame a função locais_entrega. Se o nome do bairro que o cliente perguntou não estiver na lista, peça para que o cliente envie a localização e diga que um dos atendentes vai verificar se aquela localização está em nossa área de entrega.`},

            {role: "system", content: `o tempo de entrega é de 30 ~ 45 minutos. O tempo para vir retirar no local é de 20~25 minutos. Em ambos os casos podendo ser um pouco superior aos fins de semana.`},

            {role: "system", content: `No momento o Henry Burguer não oferece atendimento com mesas no local, pedidos só podem ser feitos para retirada no local ou entrega.`},
          
            {role: "system", content: `Leve em consideração todas as respostas fornecidas pelo atendente humano. As respostas fornecidas pelo atendente humano podem ter informações relevantes para o registro do pedido.`},
            
            {role: "system", content: `Nunca faça afirmações fechadas, ou seja, que possam fazer o cliente ter que esperar. Nunca peça para o cliente aguardar você fazer algo. Exemplo: "Vou registrar seu pedido, aguarde...", ou, "Vou verificar essa informação, aguarde...". Sempre responda o cliente imediatamente, ou faça a chamada de função imediatamente para obter mais informações.`},

            // {role: "system", content: `Após reunir as informações do pedido nunca diga ao cliente que você irá registrar o pedido, simplesmente chame a função registerOrder que ela será a responsável por registrar o pedido.`},

            //Fechamento de pedido:
            // {role: "system", content: `No momento em que estiver com as informações: nome, telefone, tipo de pedido (entrega ou retirada), endereço (se o pedido for entrega), localização do endereço (se estiver disponível em seu registro) quantidade de cada item ou adicional, nome de cada item ou adicional, observações sobre o pedido, e forma de pagamento; chame a função registerOrder passando essas informações como parametros.`},

            {role: "system", content: `Quando estiver com as informações necessárias disponíveis chame a função registerOrder, passando como parametro: nome do cliente, tipo de pedido, endereço, localização, quantidade de cada item ou adicional, node de cada item ou adicional, observações e forma de pagamento.`},

            // {role: "system", content: `Você deve chamar apenas uma função por vez. Nunca chame duas ou mais funções ao mesmo tempo ou dentro de um mesmo bloco. A função "registerOrder" só deve ser chamada quando todas as informações anteriores (nome, endereço, itens do pedido, observações, etc.) já estiverem em seus registros.`},

            {role: "system", content: `Os adicionais são itens e devem ser passados como parametro com quantidade e nome na chamada de função registerOrder.`},

            {role: "system", content: `o nome dos itens fornecidos como parametros na função registerOrder devem ser exatamente iguais aos nomes fornecidos pela função menu_description.`},

            {role: "system", content: `O pedido do cliente só é efetivamente registrado após a chamada da função registerOrder, portanto nunca peça para o cliente aguardar. Sempre priorize chamar a função registerOrder assim que você estiver com as informações disponíveis em seu registro.`},

            {role: "system", content: `Se o cliente pedir para falar com um atendente chame a função disableBot para desativar o atendimento do chatbot.`},
            {role: "system", content: `Você deve chamar apenas uma única função por vez. respeite a ordem de chamada de funções, e não responda em texto junto com uma chamada de função.`}
        ]);
        
        console.log(`Regras do GPT inseridas com sucesso!`);
    } catch (error) {
        console.log('Erro ao inserir regras no banco de dados',error)
    };

//     try {
//         await Delivery_locations.create([
//             {role:"system", content:"esses são alguns dos bairros em que o Henry Burguer faz entregas. Se o cliente perguntar por um bairro que não esteja na lista, peça para que ele envie a localização fixa que um dos atendentes vai verificar e responder."},
//             {role:"system", content:"recanto das minas gerais"},
//             {role:"system", content:"residencial paulo estrela"},
//             {role:"system", content:"santo hilário"},
//             {role:"system", content:"dom fernando"},
//             {role:"system", content:"vila pedroso"},
//             {role:"system", content:"rio jordão"},
//             {role:"system", content:"tupinambá dos reis"},
//             {role:"system", content:"parque das amendoeiras"},
//             {role:"system", content:"jardim abaporu"},
//             {role:"system", content:"residencial são leopoldo"},
//             {role:"system", content:"jardim das aroeiras"},
//             {role:"system", content:"residencial costa paranhos"},
//             {role:"system", content:"parque alvorada"},
//             {role:"system", content:"jardim das oliveiras"}
//         ]);
//         console.log('Locais de entrega inseridos com sucesso!');
//     } catch (error) {
//        console.log('Erro ao inserir locais de entrega no banco de dados',error);
//     };

//     try {
//         await Menu.create([
//             {
//                 category: "Hambúrguer",
//                 item: [
//                     {
//                         name: "Baratíssimo",
//                         description: "Pão brioche, hambúrguer de carne bovina (110g), cheddar cremoso, queijo muçarela, maionese, tomate, cebola, alface, molho barbecue",
//                         price: 14
//                     },
//                     {
//                         name: "Henry Bacon",
//                         description: "Pão brioche, hambúrguer de carne bovina (110g), cheddar cremoso, queijo muçarela, maionese, tomate, cebola, alface, molho barbecue e Bacon",
//                         price: 19
//                     },
//                     {
//                         name: "Brutos",
//                         description: "Pão brioche, hambúrguer de carne bovina (110g), cheddar cremoso, queijo muçarela, maionese, tomate, cebola, alface, molho barbecue, bacon, calabresa e ovo",
//                         price: 22
//                     },
//                     {
//                         name: "Catupa Bacon",
//                         description: "Pão brioche, hambúrguer de carne bovina (110g), Catupiry Original, queijo muçarela, maionese, tomate, cebola, alface, molho barbecue e bacon",
//                         price: 22
//                     },
//                     {
//                         name: "Caseirinho",
//                         description: "Pão brioche, hambúrguer de carne bovina (110g), cheddar cremoso, queijo muçarela, maionese, tomate, cebola, alface, molho barbecue e ovo",
//                         price: 15
//                     }
//                 ]
//             },
//             {
//                 category: "Hambúrguer Duplo",
//                 item: [
//                     {
//                         name: "Duplo Bacon c/ Ovo",
//                         description: "Pão brioche, 2 hambúrgueres de carne bovina 110g, cheddar cremoso, 2x queijo muçarela, maionese, tomate, cebola, alface, molho barbecue, bacon e ovo.",
//                         price: 26
//                     },
//                     {
//                         name: "Duplo Bacon",
//                         description: "Pão brioche, 2 hambúrgueres de carne bovina 110g, cheddar cremoso, 2x queijo muçarela, maionese, tomate, cebola, alface, molho barbecue e 2x bacon.",
//                         price: 25
//                     },
//                     {
//                         name:"Duplo Simples",
//                         description:"Pão brioche, 2 hambúrgueres de carne bovina 110g, cheddar cremoso, 2x queijo muçarela, maionese, tomate, cebola, alface, molho barbecue.",
//                         price: 22
//                     },
//                     {
//                         name:"Duplo Calabresa",
//                         description:"Pão brioche, 2 hambúrgueres de carne bovina 110g, cheddar cremoso, 2x queijo muçarela, maionese, tomate, cebola, alface, molho barbecue e 2x calabresa",
//                         price: 25
//                     }
//                 ]
//             },
//             {
//                 category: "Combos individuais",
//                 item: [
//                     {
//                         name:"Combo Henry bacon",
//                         description:"Acompanha 1-Henry Bacon, 1-Fritas P, 1-Refrigerante lata 350ml a escolha",
//                         price: 35
//                     },
//                     {
//                         name:"Combo Duplo bacon",
//                         description:"Acompanha 1-Duplo Bacon, 1-Fritas P, 1-Refrigerante lata 350ml a escolha",
//                         price: 40
//                     }
//                 ]
//             },
//             {
//                 category: "Combos para 2 Pessoas",
//                 item:[
//                     {
//                         name:"Combo Basicão",
//                         description:"Acompanha  2-Baratíssimos, 1-Fritas M, 1-Refrigerante 1,5L a escolha.",
//                         price: 50
//                     },
//                     {
//                         name:"Combo Violento",
//                         description:"Acompanha  2-Brutos, 1-Fritas M, 1-Refrigerante 1,5L a escolha.",
//                         price: 66
//                     }
//                 ]
//             },
//             {
//                 category: "X-Salada do Henry",
//                 item:[
//                     {
//                         name:"X-Monstro",
//                         description:"Pão tradicional chapeado, duas carne 110g cada (bovina), alface, tomate, cebola roxa, maionese, bacon, calabresa, ovo, dobro de queijo mussarela, presunto, milho e Catupiry Original.",
//                         price: 33
//                     },
//                     {
//                         name:"X-Tudo Henry",
//                         description:"Pão tradicional chapeado, carne bovina 110g, alface, tomate, cebola roxa, maionese, calabresa, ovo, bacon, queijo mussarela, presunto, milho e Catupiry Original.",
//                         price: 26
//                     },
//                     {
//                         name:"X-Simples",
//                         description:"Pão tradicional chapeado, carne bovina 110g, alface, tomate, cebola roxa, maionese, ovo, queijo mussarela, presunto, milho e Catupiry Original.",
//                         price: 22
//                     },
//                     {
//                         name:"X-Bacon",
//                         description:"Pão tradicional chapeado, carne bovina 110g, alface, tomate, cebola roxa, maionese, ovo, bacon, queijo mussarela, presunto, milho e Catupiry Original.",
//                         price: 24
//                     }
//                 ]
//             },
//             {
//                 category: "Batata Frita",
//                 item:[
//                     {
//                         name: "Fritas P",
//                         price: 12
//                     },
//                     {
//                         name: "Fritas P com Cheddar e Bacon (completa)",
//                         price: 16
//                     },
//                     {
//                         name:"Fritas M",
//                         price: 16
//                     },
//                     {
//                         name:"Fritas M com Cheddar e Bacon (completa)",
//                         price: 20
//                     },
//                     {
//                         name:"Fritas G",
//                         price: 19
//                     },
//                     {
//                         name:"Fritas G com Cheddar e Bacon (completa)",
//                         price: 25
//                     }
//                 ]
//             },
//             {
//                 category: "Sucos e Cremes da Polpa",
//                 item:[
//                     {
//                         name:"Creme de morango 500ml",
//                         price: 12
//                     },
//                     {
//                         name:"Creme de Maracujá 500ml",
//                         price: 12
//                     },
//                     {
//                         name:"Creme de Cupuaçu 500ml",
//                         price: 12
//                     },
//                     {
//                         name:"Suco de Cupuaçu 500ml",
//                         price: 7
//                     },
//                     {
//                         name:"Suco de Maracujá 500ml",
//                         price:7
//                     },
//                     {
//                         name:"Suco de Morango 500ml",
//                         price: 7
//                     }
//                 ]
//             },
//             {
//                 category: "Refrigerantes",
//                 item:[
//                     {
//                         name:"Pepsi Black 2L (zero)",
//                         price:9
//                     },
//                     {
//                         name:"Guaraná Antártica 1,5L",
//                         price:8
//                     },
//                     {
//                         name:"Pepsi Black 1,5L (zero)",
//                         price:8
//                     },
//                     {
//                         name:"Coca-Cola 2L (Zero)",
//                         price:11
//                     },
//                     {
//                         name:"Coca-Cola 2L",
//                         price:11
//                     },
//                     {
//                         name:"Coca-Cola 1,5L",
//                         price:9
//                     },
//                     {
//                         name:"Limoneto H2O 1,5L",
//                         price:8
//                     },
//                     {
//                         name:"Água com Gás 500ml",
//                         price:3
//                     },
//                     {
//                         name:"Suco La fruit Uva 1L",
//                         price:8
//                     },
//                     {
//                         name:"Suco La fruit Maracujá 1L",
//                         price:8
//                     },
//                     {
//                         name:"Coca-Cola 350ml",
//                         price:5
//                     },
//                     {
//                         name:"Guaraná 350ml",
//                         price:5
//                     },
//                     {
//                         name:"Pepsi Black (Zero) 350ml",
//                         price:5
//                     },
//                     {
//                         name:"Coca-Cola (Zero) 350ml",
//                         price:5
//                     }
//                 ]
//             },
//             {
//                 category: "Adicionais",
//                 item:[
//                     {
//                         name:"Adicional de Ovo",
//                         price:2
//                     },
//                     {
//                         name:"Adicional de Cheddar",
//                         price:3
//                     },
//                     {
//                         name:"Adicional de Muçarela",
//                         price:3
//                     },
//                     {
//                         name:"Adicional de Bacon",
//                         price:5
//                     },
//                     {
//                         name:"Adicional de Carne de Hamburguer",
//                         price:7
//                     },
//                     {
//                         name:"Adicional de Calabresa",
//                         price:4
//                     },
//                     {
//                         name:"Adicional de Catupiry Original",
//                         price:4
//                     },
//                     {
//                         name:"Adicional de molho barbecue a parte",
//                         price:2
//                     }
//                 ]
//             },
//             {
//                 category: "Adicionais extras para o Combo Violento e Combo Basicão:",
//                 item:
//                     {
//                         name:"Adicional Cheddar e Bacon na batata do combo",
//                         price:4
//                     }
//             },
//             {
//                 category: "Adicionais extras para Batata com chedda e Bacon:",
//                 item:
//                 {
//                     name:"TROQUE o cheddar por catupiry original",
//                     price:3
//                 }

//             }
//         ]);
        
//         console.log(`Cardápio inserido com sucesso!`);
//     } catch (error) {
//         console.log('Erro ao inserir cardápio no banco de dados.')
//     }
};

module.exports = inserirRegras;