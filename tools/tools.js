//Definindo função de chamada para o modelo GPT//
const tools = [{
    "type": "function",
    "function": {
        "name": "saveName",
        "description": "salvar nome do cliente no banco de dados",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "nome do cliente"
                },
                "phone": {
                    "type": "string",
                    "description": "telefone do cliente"
                }
            },
            "required": [
                "name",
                "phone"
            ],
            "additionalProperties": false
        },
        "strict": true
    }
  },{
    "type": "function",
    "function": {
        "name": "saveAddress",
        "description": "salvar o endereço do cliente no banco de dados.",
        "parameters": {
            "type": "object",
            "properties": {
                "address_write": {
                    "type": "string",
                    "description": "endereço do cliente"
                },
                "phone": {
                    "type": "string",
                    "description": "telefone do cliente"
                }
            },
            "required": [
                "address_write",
                "phone"
            ],
            "additionalProperties": false
        },
        "strict": true
    }
  },{
    "type": "function",
    "function": {
      "name": "registerOrder",
      "description": "envia informações sobre os itens do pedido, e sobre o cliente para que o pedido seja registrado no sistema.",
      "parameters": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "nome do cliente"
          },
          "phone": {
            "type": "string",
            "description": "telefone do cliente"
          },
          "address_write": {
            "type": "string",
            "description": "endereço do cliente se disponível"
          },
          "location": {
            "type": "string",
            "description": "localização do cliente se disponível"
          },
          "type_order": {
            "type": "string",
            "enum": ["entrega", "retirada"],
            "description": "tipo do pedido, entrega ou retirada"
          },
          "note_order": {
            "type": "string",
            "description": "observações sobre os itens do pedido, sobre a forma de pagamento, explicações sobre adicionais em determinado item, refrigerantes que compõe o combo e etc..."
          },
          "payment": {
            "type": "string",
            "enum": ["cartão", "pix", "dinheiro"],
            "description": "forma de pagamento"
          },
          "items": {
            "type": "array", 
            "items": {       
              "type": "object",
              "properties": {
                "quantity": {
                  "type": "integer",
                  "description": "quantidade do item ou quantidade do adicional"
                },
                "name": {
                  "type": "string",
                  "description": "nome do item ou nome do adicional"
                }
              },
              "required": ["quantity", "name"],
              "additionalProperties": false
            }
          }
        },
        "required": [
          "name",
          "phone",
          "type_order",
          "address_write",
          "location",
          "items",
          "note_order",
          "payment"
        ],
        "additionalProperties": false
      },
      "strict": true
    }
  },
  {
    "type": "function",
    "function": {
      "name": "disableBot",
      "description": "Desativa o atendimento via chatbot",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": false
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "locais_entrega",
      "description": "retorna uma lista com o nome da maioria dos bairros em que o Henry Burguer faz entregas.",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": false
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "menu_description",
      "description": "retorna todos os itens que compõe o cardápio, incluindo: categoria, nome, descrição e preço de cada item",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": false
      }
    }
  }    
];

module.exports = tools;