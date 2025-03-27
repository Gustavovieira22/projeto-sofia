const fs = require('fs');
const axios = require('axios');
const dotenv = require("dotenv");
const FormData = require('form-data');
dotenv.config();

// Função para transcrever o áudio usando a API da OpenAI
async function whisper(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error('Arquivo não encontrado: ' + filePath);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath)); // Certifique-se de que o caminho está correto
    formData.append('model', 'whisper-1'); // Whisper é o modelo da OpenAI para transcrição de áudio
    formData.append('language', 'pt'); // Whisper é o modelo da OpenAI para transcrição de áudio

    try {
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                ...formData.getHeaders(),
            }
        });

        return response.data.text; // Retorna o texto transcrito
    } catch (error) {
        console.error('Erro ao transcrever o áudio:', error.response ? error.response.data : error.message);
        return 'Erro ao processar sua mensagem!';
    }
}

module.exports = whisper;