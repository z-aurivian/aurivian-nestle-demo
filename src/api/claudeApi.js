import Anthropic from '@anthropic-ai/sdk';

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || '',
    dangerouslyAllowBrowser: true,
  });
}

export const askClaudeWithContext = async (userMessage, systemPrompt, conversationHistory = []) => {
  if (!process.env.REACT_APP_ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured.');
  }
  const anthropic = getAnthropicClient();

  try {
    const historyMessages = conversationHistory
      .filter((msg) => msg.content !== userMessage || msg.role !== 'user')
      .slice(0, -1)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    const messages = [...historyMessages, { role: 'user', content: userMessage }];

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    const textContent = message.content.find((block) => block.type === 'text');
    return textContent ? textContent.text : "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`Failed to get response from Claude: ${error.message}`);
  }
};
