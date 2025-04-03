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
      "description": "registra os dados do cliente no sistema de pedidos",
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
            "description": "endereço do cliente"
          },
          "location": {
            "type": "string",
            "description": "localização do cliente"
          },
          "type_order": {
            "type": "string",
            "enum": ["entrega", "retirada"],
            "description": "tipo do pedido, entrega ou retirada"
          },
          "note_order": {
            "type": "string",
            "description": "todas as observações sobre o pedido"
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
  }
     
];

module.exports = tools;