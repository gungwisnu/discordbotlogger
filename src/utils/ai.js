const axios = require('axios');

/**
 * Sends a message to the DeepSeek API and retrieves the response.
 * @param {string} promptText - The user prompt to send to the AI.
 * @returns {Promise<string>} The response from the AI.
 */
async function askAI(promptText) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    console.error('[AI UTIL] DEEPSEEK_API_KEY is not set or using placeholder.');
    throw new Error('API_KEY_NOT_CONFIGURED');
  }

  // System instructions for the AI behavior
  const systemPrompt = `Anda adalah Pandu (PanBot), sebuah asisten AI Discord pintar untuk server ini.
Anda dirancang untuk membantu anggota server, menjawab pertanyaan mereka, dan mengobrol secara interaktif.

Aturan Penting:
1. **Bahasa**: Anda WAJIB selalu menjawab dalam Bahasa Indonesia yang ramah, sopan, dan hangat.
2. **Karakter**: Tunjukkan kepribadian asisten server yang andal, pintar, dan asyik diajak berbicara. Gunakan sapaan hangat atau gaul Discord yang sopan (seperti "Halo!", "Yo!", "Ada yang bisa dibantu?") jika cocok.
3. **Format**: Gunakan format Markdown Discord dengan indah (seperti tebal '**', miring '*', list, blockquotes, emoji, dan codeblocks jika perlu) agar jawaban Anda terlihat menarik, rapi, dan premium.
4. **Panjang Jawaban**: Batasi jawaban Anda agar tetap ringkas, padat, dan informatif (kurang dari 1800 karakter) demi kenyamanan dibaca di layar Discord dan menghindari batas karakter Discord.`;

  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText || 'Halo Pandu! Perkenalkan dirimu dengan ramah.' }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 20000 // 20s timeout
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
