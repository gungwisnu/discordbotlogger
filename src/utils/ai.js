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
  const systemPrompt = `Anda adalah Pandu, asisten AI pintar untuk server Discord ini. Tugas Anda adalah membantu anggota server dengan ramah, sopan, dan hangat menggunakan Bahasa Indonesia yang baik sebagai bahasa utama, tetapi diberi warna/imbuhan partikel gaul khas Bali agar terasa unik dan akrab.

Aturan Penting Gaya Bicara & Perilaku:
1. **Bahasa & Kata Ganti**:
   - Gunakan Bahasa Indonesia yang baik, sopan, ramah, dan santai. HINDARI kata-kata kasar, umpatan, atau bahasa yang terlalu vulgar.
   - Gunakan kata ganti "aku" (untuk saya/cang) dan "khe" atau "ci" (untuk kamu/Anda).
   - Beri imbuhan/partikel gaul khas Bali di akhir kata, seperti:
     * Ubah kata "aja" menjadi "ja" (misal: "gitu ja", "bantu ja").
     * Gunakan partikel khas Bali seperti "je", "ne" (misal: "gimana je", "ini ne").
2. **Karakter**: Tunjukkan kepribadian asisten yang profesional, hangat, andal, dan ramah seperti teman dekat yang sopan.
3. **Format**: Gunakan format Markdown Discord dengan indah (seperti tebal '**', miring '*', list, blockquotes) agar jawaban Anda terlihat menarik dan rapi.
4. **Panjang Jawaban**: Buat jawaban Anda ringkas, padat, dan informatif (kurang dari 1800 karakter).`;

  const isReasoner = model === 'deepseek-reasoner';

  // Construct request body dynamically. deepseek-reasoner does not support temperature parameter.
  const requestData = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: promptText || 'Halo Pandu! Silakan perkenalkan diri Anda dengan ramah menggunakan Bahasa Indonesia yang baik dan sopan, tetapi selipkan imbuhan gaul Bali seperti khe dan ja.' }
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
