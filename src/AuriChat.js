import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Loader, RotateCcw, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDemoContext } from './data/demoData';
import { askAuri, keywordFallback } from './api/auriApi';

function AuriChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const demoContext = getDemoContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resetConversation = () => {
    setMessages([]);
    setError(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const conversationHistory = [...messages, { role: 'user', content: userMessage }].slice(-10);
      const response = await askAuri(userMessage, conversationHistory);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setError(err?.message || 'Unable to reach the assistant. Please try again.');
      const fallback = keywordFallback(userMessage, demoContext);
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#111111' }}>
      <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: '#2D2C2C' }}>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-80 text-sm"
            style={{ backgroundColor: '#2D2C2C', color: '#8D8C8C' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Demo
          </Link>
          <div className="text-lg font-bold" style={{ color: '#00A8FF' }}>Ask Auri</div>
          <span className="text-xs" style={{ color: '#8D8C8C' }}>Nestlé Health Science Evidence Assistant</span>
        </div>
        <button
          onClick={resetConversation}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-80 text-sm"
          style={{ backgroundColor: '#2D2C2C', color: '#8D8C8C' }}
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'rgba(255,68,0,0.1)', border: '1px solid #FF4400' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FF4400' }} />
          <span className="text-sm" style={{ color: '#FF4400' }}>{error}</span>
        </div>
      )}

      <div className={`flex-1 flex flex-col max-w-3xl mx-auto w-full p-4 ${messages.length === 0 ? 'justify-center items-center' : ''}`}>
        {messages.length === 0 && (
          <div className="text-center mb-8">
            <div className="text-2xl font-bold mb-2" style={{ color: '#00A8FF', fontFamily: 'Michroma, sans-serif' }}>Ask Auri</div>
            <p className="text-sm mb-6" style={{ color: '#8D8C8C' }}>
              Ask about evidence for magnesium, red clover, collagen, claims, regulatory guidance, or portfolio insights.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'How strong is the evidence for magnesium and sleep?',
                'What claims can we make for collagen?',
                'What are the evidence gaps for red clover?',
                'Compare magnesium forms for sleep',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-2 rounded-lg text-xs transition-all hover:opacity-80"
                  style={{ backgroundColor: '#2D2C2C', color: '#E3E3E3', border: '1px solid #2D2C2C' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2D2C2C' }}>
                    <Bot className="w-5 h-5" style={{ color: '#00A8FF' }} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 overflow-x-auto ${
                    msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                  style={{
                    backgroundColor: msg.role === 'user' ? '#00A8FF' : '#2D2C2C',
                    color: '#FAFAFA',
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <div className="markdown-response [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:py-1 [&_th]:pr-2 [&_th]:border-b [&_th]:border-aurivian-gray [&_td]:py-1 [&_td]:pr-2 [&_td]:border-b [&_td]:border-aurivian-dark-gray [&_ul]:my-2 [&_ul]:pl-4 [&_ul]:list-disc [&_p]:my-1 [&_strong]:font-semibold [&_table]:min-w-max">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div>{msg.content}</div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2D2C2C' }}>
                    <User className="w-5 h-5" style={{ color: '#8D8C8C' }} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2D2C2C' }}>
                  <Bot className="w-5 h-5" style={{ color: '#00A8FF' }} />
                </div>
                <div className="rounded-lg rounded-bl-none p-3" style={{ backgroundColor: '#2D2C2C', color: '#FAFAFA' }}>
                  <Loader className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <form onSubmit={handleSend} className={`w-full ${messages.length === 0 ? '' : 'border-t pt-4'}`} style={messages.length > 0 ? { borderColor: '#2D2C2C' } : undefined}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about evidence, claims, ingredients, gaps..."
              className="flex-1 px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#2D2C2C', color: '#FAFAFA', border: '1px solid #2D2C2C' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all"
              style={{ backgroundColor: '#00A8FF', color: '#FAFAFA' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuriChat;
