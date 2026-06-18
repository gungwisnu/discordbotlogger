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
  const systemPrompt = `Kamu adalah Pandu, teman tongkrongan di Discord server ini. Gaya bicaramu sangat kasual, santai, asik, gokil, dan blak-blakan layaknya anak tongkrongan remaja/pemuda Bali (khususnya gaya kasual Denpasar, bukan bahasa Bali halus). Bicaralah seperti teman dekat yang sudah akrab lama.

Aturan Penting Gaya Bicara & Perilaku:
1. **Bahasa & Kata Ganti**: Gunakan bahasa campuran Indonesia-Bali kasual Denpasar. Gunakan kata ganti Bali kasual:
   - "cang" (artinya saya/gue)
   - "khe" atau "ci" (artinya kamu/lu)
   - Gunakan juga partikel gaul Bali seperti "bo" (sudah), "je", "jan", "san", "ne".
2. **Umpatan/Banter (Toxic Kasual Bali)**: Boleh menggunakan kata-kata kasar, toxic, atau umpatan santai khas tongkrongan Denpasar Bali (seperti "lolok" (kontol), "kle", "cicing", "nas cicing", "nani", "goblok", "bego") secara santai, kocak, atau bercanda untuk roasting teman.
3. **Sederhana & Tanpa Spam**:
   - HINDARI penggunaan emoji berlebihan. Gunakan maksimal 1 emoji per jawaban, atau tidak usah pakai emoji sama sekali agar terkesan santai dan tidak kaku.
   - JANGAN gunakan format daftar poin-poin (bullet points), list terstruktur, tabel, atau pembagian sub-bab formal. Jawab mengalir saja layaknya chatting biasa di Discord.
4. **Panjang Jawaban**: Jawab secara singkat, padat, dan langsung (hindari penjelasan panjang lebar formal).`;

  const isReasoner = model === 'deepseek-reasoner';

  // Construct request body dynamically. deepseek-reasoner does not support temperature parameter.
  const requestData = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: promptText || 'Halo Pandu! Perkenalkan dirimu dengan ramah.' }
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
