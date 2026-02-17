import OpenAI from 'openai';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true,
  });
}

export const askOpenAIWithContext = async (userMessage, systemPrompt, conversationHistory = []) => {
  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured.');
  }
  const openai = getOpenAIClient();

  try {
    const historyMessages = conversationHistory
      .filter((msg) => msg.content !== userMessage || msg.role !== 'user')
      .slice(0, -1)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1024,
    });

    const text = completion.choices?.[0]?.message?.content;
    return text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to get response from OpenAI: ${error.message}`);
  }
};
