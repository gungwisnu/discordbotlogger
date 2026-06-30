const axios = require('axios');

/**
 * Sends a message to the DeepSeek API and retrieves the response.
 * @param {string} promptText - The user prompt to send to the AI.
 * @param {string} model - The model name to use.
 * @returns {Promise<string>} The response from the AI.
 */
async function askAI(promptText, model = 'deepseek-chat') {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    console.error('[AI UTIL] DEEPSEEK_API_KEY is not set or using placeholder.');
    throw new Error('API_KEY_NOT_CONFIGURED');
  }

  // System instructions for the AI behavior
  const systemPrompt = `Anda adalah Pandu, asisten AI cerdas untuk server Discord ini.

Tugas dan Aturan Gaya Bicara & Perilaku Anda:
1. **Bahasa**: Gunakan Bahasa Indonesia baku yang santai tetapi sopan, cerdas, dan langsung pada intinya (seperti mahasiswa terdidik yang sedang berdiskusi secara profesional di chat). HINDARI kata-kata gaul Bali ("khe", "ci", "ja", "je", "ne"), kata-kata alay, singkatan alay (seperti "yg", "dgn", "klo"), kata kasar, atau bahasa tidak baku kekanak-kanakan lainnya.
2. **Emoji**: DILARANG KERAS menggunakan emoji apa pun dalam balasan Anda.
3. **Format Jawaban**: 
   - Tulis seluruh jawaban Anda hanya dalam bentuk paragraf-paragraf mengalir.
   - HINDARI penggunaan poin-poin (bullet points/numbered lists seperti "1.", "-", "*").
   - HINDARI teks menjorok ke dalam (indentation/nested quotes).
   - Jaga agar informasi mengalir runtut dan logis dari satu paragraf ke paragraf berikutnya.
4. **Efektivitas**: Sampaikan jawaban secara cerdas, solutif, ringkas, dan padat (kurang dari 1500 karakter) untuk menghemat penggunaan token API secara optimal.`;

  const isReasoner = model === 'deepseek-reasoner';

  // Construct request body dynamically. deepseek-reasoner does not support temperature parameter.
  const requestData = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: promptText || 'Halo Pandu! Perkenalkan dirimu dengan singkat dan cerdas.' }
    ],
    max_tokens: isReasoner ? 2000 : 1000
  };

  if (!isReasoner) {
    requestData.temperature = 0.7;
  }

  const apiTimeout = isReasoner ? 90000 : 30000; // 90s for reasoning model, 30s for standard chat

  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: apiTimeout
      }
    );

    if (
      response.data &&
      response.data.choices &&
      response.data.choices[0] &&
      response.data.choices[0].message
    ) {
      return response.data.choices[0].message.content.trim();
    } else {
      console.error('[AI UTIL] Invalid response format from DeepSeek:', response.data);
      throw new Error('INVALID_API_RESPONSE');
    }
  } catch (error) {
    console.error('[AI UTIL] Error calling DeepSeek API:', error.message);
    if (error.response) {
      console.error('[AI UTIL] API Error Details:', error.response.data);
    }
    throw error;
  }
}

module.exports = {
  askAI
};
