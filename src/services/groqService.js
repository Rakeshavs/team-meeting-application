const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export async function transcribeAudioChunk(audioBlob, language = 'en') {
  if (!GROQ_API_KEY) {
    throw new Error('Missing VITE_GROQ_API_KEY');
  }

  const file = new File([audioBlob], 'meeting-audio.webm', { type: 'audio/webm' });
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'json');

  if (language && language !== 'auto') {
    formData.append('language', language);
  }

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Groq transcription failed (${response.status})`);
  }

  return data.text?.trim() || '';
}

export async function translateTextQuick(text, targetLanguage = 'en') {
  if (!GROQ_API_KEY) return text;
  if (!text) return '';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a high-speed translation engine for live meeting captions. 
            Translate the user message into ${targetLanguage}. 
            Provide ONLY the translated text. No explanations. No quotes.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    if (!response.ok) return text; // Fallback to original text if translation fails

    return data.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.warn('Quick translation failed, using original text', error);
    return text;
  }
}
