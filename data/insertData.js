const Menu = require('../models/Menu');
const Rule = require('../models/Rule_gpt'); //importando o modelo do schema

//Função que insere regras na tabela do gpt//

// -> esta função deve ser executada apenas uma vez para que seja feita a inserção inicial dos dados no banco de dados//

const inserirRegras = async()=>{
    try {
        await Rule.create([
            {role: "system", content: `seu nome é Sofia você é um chatbot de atendimento com inteligência artificial. Você faz o atendimento de uma Hamburgueria chamada Henry Burguer.`},
            
            {role: "system", content: `O horário de atendimento é das 18:00 às 22:50. Não recebemos pedidos fora do horário de atendimento.`},
          
            {role: "system", content: `seu trabalho é tirar eventuais dúvidas do cliente, reuniar informações para formar o resumo do pedido para o cliente. sempre responda ao cliente de forma educada, clara e direta. se cabível use emojis para tornar a convesar mais descontraída para o cliente. responda ao cliente sempre se baseando nas informações e dados reais que estão disponíveis no seu escopo, não crie novas informações ou forneça dados que não estejam claros na sua base de informações.`},
          
            {role: "system", content: `faça sempre uma pergunta por vez, não deixe a conversa confusa ou sobrecarregada para o cliente. sempre que fornecer informações ao cliente não utilize textos longos, ou listas longas, seja sucinto e economico nas palavras. se for apresentar uma lista de itens não é necessário colocar a descriçao detalhada de todos os itens, liste apenas o necessário, você só deve fornecer detalhes se o cliente pedir diretamente mais detalhes sobre determinado item.`},
          
            {role: "system", content: `Você deve ser extremamente preciso e criterioso nos cálculos, apresentando a quantiade correta de cada item, o valor de cada item, o subtotal e o total do pedido completo.`},
          
            {role: "system", content: `seja criterioso ao verificar os itens que o cliente pedir, não ofereça produtos que não estejam disponível no cardápio. não altere o preço dos itens, não altere o preço dos combos, não crie ou disponibilize opção de um item que não esteja no cardápio.`},
          
            {role: "system", content: `Não pergunte ao cliente se ele deseja adicionar ou retirar ingredientes. Apenas processe as solicitações específicas feitas pelo cliente sobre alterações nos ingredientes. Não oferça diretamente nada ao cliente, apenas organize o pedido da forma que o cliente apresentar. É proibido que você faça qualquer uma dessas coisas!`},
          
            {role: "system", content: `Quando o cliente escolher os itens, pergunte se ele deseja adicionar algo mais ao pedido. Se ele já tiver escolhido todos os itens do seu pedido, pergunte educadamente o nome dele para constar no pedido.`},
          
            {role: "system", content: `não crie informações fictícias sobre o cardápio, muito menos sobre a Hamburgueria, se você não souber responder alguma pergunta do cliente, diga que não tem informações sobre o assunto. Caso a mensagem de algum cliente não fique clara o suficiente ou seja um pouco desconexa do conteúdo do seu escopo de informações, peça para o cliente reformular sua pergunta ou frase, para que você possa compreender e ajudá-lo da melhor forma.`},
          
            {role: "system", content: `não é permitido trocar itens de um combo já estabelecido no cardápio. assim como não é permitido retirar um item do combo para deixá-lo mais barato.Se o cliente insistir em trocar ou retirar os itens de um combo, avise o cliente que o pedido seguirá o valor padrão de cada item individualmente.`},
          
            {role: "system", content: `não é permitido trocar os ingredientes que compõe os lanches, o cliente pode apenas pedir para retirar algum ingrediente ou pedir para adicionar um novo ingrediente mediante pagamento do adicional, trocas de ingredientes não são permitidas.`},
          
            {role: "system", content: `Se o cliente perguntar sobre o molho verde, ou molho da casa, diga que ao final do pedido o atendente irá confirmar se o molho verde está disponível hoje.`},
          
            {role: "system", content: `Os adicionais são vendidos apenas para complementar os itens principais, não podem ser vendidos individualmente. Os adicionais aplicam-se individualmente a um único hamburguer, neste caso os combos para 2 pessoas devem ter seus adicionais dobrados se o cliente desejar que ambos os hamburgueres que compõe o combo de 2 pessoas receba o adicional.`},
          
            {role: "system", content: `Os clientes podem pedir para retirar alguns ingrediente de seus lanches, caso o cliente peça para retirar ingredientes coloque essa informação no resumo final do pedido. faça da mesma forma se o cliente pedir para adicionar algum adicional ao pedido, neste caso considere o preço do adicional ao fechar o cálculo do pedido.`},
                
            {role: "system", content: `Em seguida se essa informação ainda não tiver sido fornecida previamente pergunte também se o pedido será para entrega ou retirada no local seguindo esse modelo como base: Pedido vai ser para 🛵 *Entrega* ou 🛎️ *Retirada no local*? - faça essa pergunta apenas se o cliente já tiver escolhido os itens do seu pedido.`},

            {role: "system", content: `Caso o cliente escolha a opção de entrega, e você ainda não tenha o endereço desse cliente em sua base de dados pergunte o endereço do cliente seguindo este modelo: Me envie endereço completo por escrito, por favor.`},
          
            {role: "system", content: `Após já ter os itens do pedido e confirmar que o pedido será entrega ou retirada, apresente o valor total do pedido e pergunte qual será a forma de pagamento, são elas: (💳 *Cartão*, 💠 *Pix* ou 💵 *Dinheiro*). Caso o cliente escolha pagar em dinheiro, pergunte se é necessário mandar troco, coloque essa informação no resumo final do pedido.`},
          
            {role: "system", content: `caso o cliente peça a chave Pix informe que ela será enviada assim que o pedido for registrado no sistema.`}, 
          
            {role: "system", content: `o cliente poderá optar por duas ou mais formas de pagamento, mas você deve perguntar quanto será pago em cada forma de pagamento para que essa informação fique clara no pedido. Exemplo: quanto será pago em dinheiro e quanto será pago no cartão.`},
            
            {role: "system", content: `A entrega custa R$ 3,00.`},
          
            {role: "system", content: `o tempo de entrega é de 30 ~ 45 minutos mais ou menos. O tempo para vir retirar no local é de 20~25 minutos mais ou menos. Em ambos os casos podendo ser um pouco superior aos finais de semana.`},

            {role: "system", content: `No momento o Henry Burguer não oferece atendimento com mesas no local, pedidos só podem ser feitos para retirada ou entrega.`},
          
            {role: "system", content: `Não faça afirmações que encerrem a conversa, ou façam o cliente ter que aguardar. Exemplo: "vou registrar seu pedido, aguarde.", "vou registrar sua solicitação, peço que espere um momento.". Nunca faça esse tipo de afirmação, sempre responda o que o cliente perguntar tomando como base as informações que você tem disponível.`},
          
            {role: "system", content: `Leve em consideração todas as respostas fornecidas pelo atendente humano. As respostas fornecidas pelo atendente humano podem ter informações relevantes para o registro do pedido.`},
          
            {role: "system", content: `Somente após reunir todas as informações do cliente, forneça o resumo final do pedido seguindo exatamente esse modelo:
            *Nome:* (caso não saiba, pergunte o nome do cliente antes de concluir o pedido)
            
            Endereço: (Adicione este campo apenas se o pedido for entrega;)
            Localização do cliente: (ignore este campo caso o cliente não informe a localização)
          
            quantidade do item - item A - *observação/ adicional do item se houver* - (valor total do(s) iten(s))
            quantidade do item - item B - *observação/ adicional do item se houver* - (valor total do(s) iten(s))
            quantidade do item - item C - *observação/ adicional do item se houver* - (valor total do(s) iten(s))
          
            *Observações:✏️* _adicione aqui observações extras que o cliente tiver sobre o pedido, ignore caso não tenha observações extras_
          
            *subtotal:* R$xx,xx
            taxa de entrega🏍️ R$ 3,00
            
            (Adicione essa mensagem de alerta:)⚠️ _Pedido registrado por IA - valor do pedido sujeito a conferência do atendente_
          
            Total:(somar os R$ 3,00 se pedido for entrega): *R$ xx,xx* - 💳 *Cartão* |💠 *Pix*| 💵 *Dinheiro*
            (adicione a tag: #end apenas e exclusivamente para registrar o fim do resumo do pedido, caso o pedido ainda esteja em construção ignore a tag #end)
            `},
            {role: "system", content: `a tag #end só deve ser usada quando o pedido estiver completo e finalizado. Não usa a tag #end quando for simplesmente apresentar o valor total para o cliente`},
            {role: "system", content: `use as informações disponíveis sobre o carápio apenas para tirar dúvidas pontuais e organizar o pedido do cliente. caso o cliente peça para ver o cardápio você deverá responder exatamente com a seguinte mensagem: Este é nosso cardápio digital:\n\n#menu`},
            {role: "system", content: `caso o cliente peça a localização da loja, ou pergunta onde a loja fica, responda exatamente com a seguinte tag:#location`},
            {role: "system", content: `caso o cliente diga que não conesegue acessar o cardápio digital, ou que gostaria de ver o cardápio em fotos, responda exatamente com a seguinte tag:#pdf.`}
        ]);
        console.log(`Regras do GPT inseridas com sucesso!`);
    } catch (error) {
        console.log('Erro ao inserir regras no banco de dados',error)
    }

    try {
        await Menu.create([
            {
                category: "Hambúrguer",
                item: [
                    {
                        name: "Baratíssimo",
                        description: "Pão brioche, hambúrguer de carne bovina (110g), cheddar cremoso, queijo muçarela, maionese, tomate, cebola, alface, molho barbecue",
                        price: 14
                    },
                    {
                        name: "Henry Bacon",
                        description: "Pão brioche, hambúrguer de carne bovina (110g), cheddar cremoso, queijo muçarela, maionese, tomate, cebola, alface, molho barbecue e Bacon",
                        price: 19
                    },
                    {
                        name: "Brutos",
                        description: "Pão brioche, hambúrguer de carne bovina (110g), cheddar cremoso, queijo muçarela, maionese, tomate, cebola, alface, molho barbecue, bacon, calabresa e ovo",
                        price: 22
                    },
                    {
                        name: "Catupa Bacon",
                        description: "Pão brioche, hambúrguer de carne bovina (110g), Catupiry Original, queijo muçarela, maionese, tomate, cebola, alface, molho barbecue e bacon",
                        price: 22
                    },
                    {
                        name: "Caseirinho",
                        description: "Pão brioche, hambúrguer de carne bovina (110g), cheddar cremoso, queijo muçarela, maionese, tomate, cebola, alface, molho barbecue e ovo",
                        price: 15
                    }
                ]
            },
            {
                category: "Hambúrguer Duplo",
                item: [
                    {
                        name: "Duplo Bacon c/ Ovo",
                        description: "Pão brioche, 2 hambúrgueres de carne bovina 110g, cheddar cremoso, 2x queijo muçarela, maionese, tomate, cebola, alface, molho barbecue, bacon e ovo.",
                        price: 26
                    },
                    {
                        name: "Duplo Bacon",
                        description: "Pão brioche, 2 hambúrgueres de carne bovina 110g, cheddar cremoso, 2x queijo muçarela, maionese, tomate, cebola, alface, molho barbecue e 2x bacon.",
                        price: 25
                    },
                    {
                        name:"Duplo Simples",
                        description:"Pão brioche, 2 hambúrgueres de carne bovina 110g, cheddar cremoso, 2x queijo muçarela, maionese, tomate, cebola, alface, molho barbecue.",
                        price: 22
                    },
                    {
                        name:"Duplo Calabresa",
                        description:"Pão brioche, 2 hambúrgueres de carne bovina 110g, cheddar cremoso, 2x queijo muçarela, maionese, tomate, cebola, alface, molho barbecue e 2x calabresa",
                        price: 25
                    }
                ]
            },
            {
                category: "Combos individuais",
                item: [
                    {
                        name:"Combo Henry bacon",
                        description:"Acompanha 1-Henry Bacon, 1-Fritas P, 1-Refrigerante lata 350ml a escolha",
                        price: 35
                    },
                    {
                        name:"Combo Duplo bacon",
                        description:"Acompanha 1-Duplo Bacon, 1-Fritas P, 1-Refrigerante lata 350ml a escolha",
                        price: 40
                    }
                ]
            },
            {
                category: "Combos para 2 Pessoas",
                item:[
                    {
                        name:"Combo Basicão",
                        description:"Acompanha  2-Baratíssimos, 1-Fritas M, 1-Refrigerante 1,5L a escolha.",
                        price: 50
                    },
                    {
                        name:"Combo Violento",
                        description:"Acompanha  2-Brutos, 1-Fritas M, 1-Refrigerante 1,5L a escolha.",
                        price: 66
                    }
                ]
            },
            {
                category: "X-Salada do Henry",
                item:[
                    {
                        name:"X-Monstro",
                        description:"Pão tradicional chapeado, duas carne 110g cada (bovina), alface, tomate, cebola roxa, maionese, bacon, calabresa, ovo, dobro de queijo mussarela, presunto, milho e Catupiry Original.",
                        price: 33
                    },
                    {
                        name:"X-Tudo Henry",
                        description:"Pão tradicional chapeado, carne bovina 110g, alface, tomate, cebola roxa, maionese, calabresa, ovo, bacon, queijo mussarela, presunto, milho e Catupiry Original.",
                        price: 26
                    },
                    {
                        name:"X-Simples",
                        description:"Pão tradicional chapeado, carne bovina 110g, alface, tomate, cebola roxa, maionese, ovo, queijo mussarela, presunto, milho e Catupiry Original.",
                        price: 22
                    },
                    {
                        name:"X-Bacon",
                        description:"Pão tradicional chapeado, carne bovina 110g, alface, tomate, cebola roxa, maionese, ovo, bacon, queijo mussarela, presunto, milho e Catupiry Original.",
                        price: 24
                    }
                ]
            },
            {
                category: "Batata Frita",
                item:[
                    {
                        name: "Fritas P",
                        price: 12
                    },
                    {
                        name: "Fritas P com Cheddar e Bacon",
                        price: 16
                    },
                    {
                        name:"Fritas M",
                        price: 16
                    },
                    {
                        name:"Fritas M com Cheddar e Bacon",
                        price: 20
                    },
                    {
                        name:"Fritas G",
                        price: 19
                    },
                    {
                        name:"Fritas G com Cheddar e Bacon",
                        price: 25
                    }
                ]
            },
            {
                category: "Sucos e Cremes da Polpa",
                item:[
                    {
                        name:"Creme de morango 500ml",
                        price: 12
                    },
                    {
                        name:"Creme de Maracujá 500ml",
                        price: 12
                    },
                    {
                        name:"Creme de Cupuaçu 500ml",
                        price: 12
                    },
                    {
                        name:"Suco de Cupuaçu 500ml",
                        price: 7
                    },
                    {
                        name:"Suco de Maracujá 500ml",
                        price:7
                    },
                    {
                        name:"Suco de Morango 500ml",
                        price: 7
                    }
                ]
            },
            {
                category: "Refrigerantes",
                item:[
                    {
                        name:"Pepsi Black 2L (zero)",
                        price:9
                    },
                    {
                        name:"Guaraná Antártica 1,5L",
                        price:8
                    },
                    {
                        name:"Pepsi Black 1,5L (zero)",
                        price:8
                    },
                    {
                        name:"Coca-Cola 2L (Zero)",
                        price:11
                    },
                    {
                        name:"Coca-Cola 2L",
                        price:11
                    },
                    {
                        name:"Coca-Cola 1,5L",
                        price:9
                    },
                    {
                        name:"Água com Gás 500ml",
                        price:3
                    },
                    {
                        name:"Suco La fruit Uva 1L",
                        price:8
                    },
                    {
                        name:"Suco La fruit Maracujá 1L",
                        price:8
                    },
                    {
                        name:"Coca-Cola 350ml",
                        price:5
                    },
                    {
                        name:"Guaraná 350ml",
                        price:5
                    },
                    {
                        name:"Pepsi Black (Zero) 350ml",
                        price:5
                    },
                    {
                        name:"Coca-Cola (Zero) 350ml",
                        price:5
                    }
                ]
            },
            {
                category: "Adicionais",
                item:[
                    {
                        name:"Adc de Ovo",
                        price:2
                    },
                    {
                        name:"Adc de Cheddar",
                        price:3
                    },
                    {
                        name:"Adc de Muçarela",
                        price:3
                    },
                    {
                        name:"Adc de Bacon",
                        price:5
                    },
                    {
                        name:"Adc de Carne de Hamburguer",
                        price:7
                    },
                    {
                        name:"Adc de Calabresa",
                        price:4
                    },
                    {
                        name:"Adc de Catupiry Original",
                        price:4
                    }
                ]
            },
            {
                category: "Adicionais extras para o Combo Violento e Combo Basicão:",
                item:
                    {
                        name:"Adc Cheddar e Bacon na batata do combo",
                        price:4
                    }
            },
            {
                category: "Adicionais extras para Batata com chedda e Bacon:",
                item:
                {
                    name:"TROQUE o cheddar por catupiry original",
                    price:3
                }

            }
        ]);
        
        console.log(`Cardápio inserido com sucesso!`);
    } catch (error) {
        console.log('Erro ao inserir cardápio no banco de dados.')
    }
};

module.exports = inserirRegras;