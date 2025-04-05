const Menu = require('../models/Menu');
const Rule = require('../models/Rule_gpt'); 
const Delivery_locations = require('../models/Delivery_locations');
//Função que insere regras na tabela do gpt//

// -> esta função deve ser executada apenas uma vez para que seja feita a inserção inicial dos dados no banco de dados//
const inserirRegras = async()=>{
    try {
        await Rule.create([
            {role: "system", content: `seu nome é Sofia você é um chatbot de atendimento com inteligência artificial. Você deve fazer o atendimento de uma Hamburgueria chamada Henry Burguer.`},
            
            //Informações gerais:
            {role: "system", content: `Sempre que iniciar uma conversa pergunte o nome do cliente antes de mais nada, quando cliente informar o nome chame a função saveName e passe como parametro o nome do cliente e o telefone. Caso você já tenha o nome do cliente em sua base de dados não pergunte o nome do cliente e siga o atendimento normal.`},

            {role: "system", content: `seu trabalho é tirar eventuais dúvidas do cliente, reuniar informações para registrar o pedido do cliente no sistema com a chamada de função registerOrder. sempre responda ao cliente de forma educada, clara e direta. se cabível use emojis para tornar a convesar mais agradével para o cliente. responda ao cliente sempre se baseando nas informações e dados reais que estão disponíveis no seu escopo, não crie novas informações ou forneça dados que não estejam claros em seus registros.`},
          
            {role: "system", content: `faça sempre uma pergunta por vez, não deixe a conversa confusa ou sobrecarregada para o cliente. sempre que fornecer informações ao cliente utilize textos curtos e diretos, organize o texto com espaçamento correto e saltos de linhas usando "barra n" se necessário, se necessário utilize também o negrito colocando as palavras entre ** "dois asteriscos". seja sucinto e economico nas palavras. se for apresentar uma lista de itens não é necessário colocar a descriçao detalhada de todos os itens, liste apenas o necessário em tópicos, você só deve fornecer detalhes se o cliente pedir diretamente mais detalhes sobre determinado item.`},
            
            //Coleta de informações:
            {role: "system", content: `Você deve ser extremamente preciso e criterioso nos cálculos, apresentando a quantiade correta de cada item, o valor de cada item, o subtotal e o total do pedido completo, descreva precisamente cada passo dos cálculos que estiver efetuando.`},
          
            {role: "system", content: `seja criterioso ao verificar os itens que o cliente pedir, não ofereça produtos que não estejam disponível no cardápio. não altere o preço dos itens, não altere o preço dos combos, não crie ou disponibilize opção de um item que não esteja no cardápio.`},
          
            {role: "system", content: `Quando o cliente escolher algum item para compor seu pedido, pergunte se ele deseja adicionar algo mais ao pedido. Não oferça diretamente nenhum item ao cliente, apenas organize o pedido da forma que o cliente apresentar.`},
          
            {role: "system", content: `Quando o cliente escolher qualquer dos combos, pergunte qual será o refrigerante que irá acompanhar o combo, caso o cliente pergunte apresente as opções disponíveis referente a cada combo. Adicione essa informação no campo de observações do pedido.`},

            {role: "system", content: `não é permitido trocar itens de um combo já estabelecido no cardápio. assim como não é permitido retirar um item do combo para deixá-lo mais barato. Se o cliente insistir em trocar ou retirar os itens de um combo, avise o cliente que o pedido seguirá o valor padrão de cada item individualmente.`},
          
            {role: "system", content: `não é permitido trocar os ingredientes que compõe os lanches, o cliente pode apenas pedir para retirar algum ingrediente ou pedir para adicionar um novo ingrediente mediante pagamento do adicional, trocas de ingredientes não são permitidas.`},
          
            {role: "system", content: `Se o cliente perguntar sobre o molho verde, ou molho da casa, diga que ao final do pedido o atendente irá confirmar se o molho verde está disponível hoje.`},
          
            {role: "system", content: `Os adicionais são vendidos apenas para complementar os itens principais, não podem ser vendidos individualmente. Os adicionais aplicam-se individualmente a um único hamburguer, neste caso os combos para 2 pessoas devem ter seus adicionais dobrados se o cliente desejar que ambos os hamburgueres que compõe o combo de 2 pessoas receba o adicional.`},
          
            {role: "system", content: `Os clientes podem pedir para retirar alguns ingrediente de seus lanches, caso o cliente peça para retirar ingredientes trate essa informação como uma observação para aquele item.`},
            
            //Endereço:
            {role: "system", content: `Após o cliente ter escolhido todos os itens do seu pedido, pergunte ao cliente se o pedido será entrega ou retirada seguindo este modelo: Pedido vai ser para 🛵 *Entrega* ou 🛎️ *Retirada no local*? - faça essa pergunta apenas se o cliente já tiver escolhido os itens do seu pedido. Faça essa pergunta somente se o cliente ainda não tiver informado anteriormente que o pedido será entrega ou retirada.`},
            
            {role: "system", content: `Caso o cliente escolha a opção de entrega, e você ainda não tenha o endereço desse cliente em seu registro de dados, peça para que o cliente envie o endereço completo e por escrito, em seguida reescreva o endereço do cliente e peça para que ele confirme, após a confirmação do cliente chame a função saveAddress passando como parametro o endereço e o telefone do cliente.`},
          
            //Formas de pagamento:
            {role: "system", content: `Após já ter os itens do pedido e confirmar que o pedido será entrega ou retirada, apresente os detalhes do pedido seguido do valor total, e pergunte qual será a forma de pagamento, são elas: (💳 *Cartão*, 💠 *Pix* ou 💵 *Dinheiro*). Caso o cliente escolha pagamento em dinheiro pergunte se será necessário enviar troco e para quanto caso o cliente ainda não tenha fornecido essa informação. a informação de troco deve constar no campo de observações do pedido.`},
            
            {role: "system", content: `Se o cliente desejar pagar com duas ou mais formas de pagamento essa informação será registrada no campo de observações do pedido.`},
            
            //Informações sobre o estabelecimento:
            {role: "system", content: `O horário de atendimento é das 18:00 às 22:50. Não recebemos pedidos fora do horário de atendimento.`},
                      
            {role: "system", content: `não crie informações fictícias sobre o cardápio, muito menos sobre a Hamburgueria, se você não souber responder alguma pergunta do cliente, diga que não tem informações sobre o assunto em seus registros. Caso a mensagem de algum cliente não fique clara o suficiente ou seja um pouco desconexa do conteúdo do seu escopo de informações, peça para o cliente reformular sua pergunta ou frase para que você possa compreender e ajudá-lo da melhor forma.`},

            {role: "system", content: `use as informações disponíveis sobre o cardápio apenas para tirar dúvidas pontuais e organizar o pedido do cliente. caso o cliente peça para ver o cardápio você deverá responder exatamente com a seguinte mensagem: Este é nosso cardápio digital:\n\n#menu`},

            {role: "system", content: `caso o cliente peça a localização da loja, ou pergunta onde a loja fica, responda exatamente com a seguinte tag:#location`},

            {role: "system", content: `caso o cliente diga que não conesegue acessar o cardápio digital, ou que gostaria de ver o cardápio em fotos, responda exatamente com a seguinte tag:#pdf.`},
            
            //Entrega:
            {role: "system", content: `A entrega custa R$ 3,00.`},
            
            {role: "system", content: `Caso o cliente pergunte se fazemos entregas em determinado bairro, peça para que ele envie a localização fixa que dentro de alguns instantes o atendente vai verificar e responder.`},

            {role: "system", content: `o tempo de entrega é de 30 ~ 45 minutos mais ou menos. O tempo para vir retirar no local é de 20~25 minutos mais ou menos. Em ambos os casos podendo ser um pouco superior aos fins de semana.`},

            {role: "system", content: `No momento o Henry Burguer não oferece atendimento com mesas no local, pedidos só podem ser feitos para retirada ou entrega.`},
          
            {role: "system", content: `Leve em consideração todas as respostas fornecidas pelo atendente humano. As respostas fornecidas pelo atendente humano podem ter informações relevantes para o registro do pedido.`},
            
            {role: "system", content: `Nunca faça afirmações fechadas, ou seja, que possam fazer o cliente ter que esperar. Nunca peça para o cliente aguardar você fazer algo. Exemplo: "Vou registrar seu pedido, aguarde...", ou, "Vou verificar essa informação, aguarde...". Nunca faça afirmações dessa natura, essas afirmações encerrar a conversa, ou fazem o cliente ter que esperar. Sempre responda o cliente imediatamente, ou faça a chamada de função imediatamente, não peça para o cliente aguardar, é proibido pedir que o cliente aguarde.`},

            {role: "system", content: `Após reunir as informações do pedido nunca diga ao cliente que você irá registrar o pedido, simplesmente chame a função registerOrder que ela será a responsável por registrar o pedido.`},

            //Fechamento de pedido:
            {role: "system", content: `No momento em que estiver com as informações: nome, telefone, tipo de pedido (entrega ou retirada), endereço (se o pedido for entrega), localização do endereço (se estiver disponível em seu registro) quantidade de cada item ou adicional, nome de cada item ou adicional, observações sobre o pedido, e forma de pagamento; chame a função registerOrder passando essas informações como parametros.`},

            {role: "system", content: `Os adicionais são itens e devem ser passados como parametro com quantidade e nome na chamada de função registerOrder.`},

            {role: "system", content: `utilize sempre os nomes exatamente como estão registrados no cardápio fornecido em sua base de dados.`},

            {role: "system", content: `O pedido do cliente só é efetivamente registrado após a chamada da função registerOrder, portanto nunca peça para o cliente aguardar. Qualquer outra informação que o cliente solicitar. Sempre priorize chamar a função registerOrder assim que você estiver com as informações disponíveis em seu registro.`},

            {role: "system", content: `Se o cliente pedir para falar com um atendente chame a função disableBot para desativar o atendimento do chatbot.`}
        ]);
        
        console.log(`Regras do GPT inseridas com sucesso!`);
    } catch (error) {
        console.log('Erro ao inserir regras no banco de dados',error)
    };

    try {
        await Delivery_locations.create([
            {role:"system", content:"esses são alguns dos bairros em que o Henry Burguer faz entregas. Se o cliente perguntar por um bairro que não esteja na lista, peça para que ele envie a localização fixa que um dos atendentes vai verificar e responder."},
            {role:"system", content:"recanto das minas gerais"},
            {role:"system", content:"residencial paulo estrela"},
            {role:"system", content:"santo hilário"},
            {role:"system", content:"dom fernando"},
            {role:"system", content:"vila pedroso"},
            {role:"system", content:"rio jordão"},
            {role:"system", content:"tupinambá dos reis"},
            {role:"system", content:"parque das amendoeiras"},
            {role:"system", content:"jardim abaporu"},
            {role:"system", content:"residencial são leopoldo"},
            {role:"system", content:"jardim das aroeiras"},
            {role:"system", content:"residencial costa paranhos"},
            {role:"system", content:"parque alvorada"},
            {role:"system", content:"jardim das oliveiras"}
        ]);
        console.log('Locais de entrega inseridos com sucesso!');
    } catch (error) {
       console.log('Erro ao inserir locais de entrega no banco de dados',error);
    };

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
                        name: "Fritas P com Cheddar e Bacon (completa)",
                        price: 16
                    },
                    {
                        name:"Fritas M",
                        price: 16
                    },
                    {
                        name:"Fritas M com Cheddar e Bacon (completa)",
                        price: 20
                    },
                    {
                        name:"Fritas G",
                        price: 19
                    },
                    {
                        name:"Fritas G com Cheddar e Bacon (completa)",
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
                        name:"Adicional de Ovo",
                        price:2
                    },
                    {
                        name:"Adicional de Cheddar",
                        price:3
                    },
                    {
                        name:"Adicional de Muçarela",
                        price:3
                    },
                    {
                        name:"Adicional de Bacon",
                        price:5
                    },
                    {
                        name:"Adicional de Carne de Hamburguer",
                        price:7
                    },
                    {
                        name:"Adicional de Calabresa",
                        price:4
                    },
                    {
                        name:"Adicional de Catupiry Original",
                        price:4
                    }
                ]
            },
            {
                category: "Adicionais extras para o Combo Violento e Combo Basicão:",
                item:
                    {
                        name:"Adicional Cheddar e Bacon na batata do combo",
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