import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api';

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    content: 'Namaste! 🙏 I am HeritageGuard AI, your guide to Gujarat\'s cultural heritage.\n\nAsk me about Ahmedabad\'s Walled City, Modhera Sun Temple, conservation status, or visitor tips!',
  },
];

const SUGGESTIONS = [
  "What should I see in Ahmedabad in 30 minutes?",
  "Tell me about Modhera Sun Temple",
  "Which site has higher visitor pressure?",
  "Give me a 15-minute heritage tour",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(userMsg);
      if (res.success) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: res.answer,
          demo: res.demo,
        }]);
        setDemoMode(res.demo);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '⚠️ I encountered an error. Please check that the backend server is running.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-widget" aria-label="AI Chat Assistant">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="HeritageGuard AI Chat">
          {/* Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>🏛</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>HeritageGuard AI</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  {demoMode ? 'Demo Mode' : 'IBM Granite LLM'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}
              aria-label="Close chat"
            >✕</button>
          </div>

          {/* Demo notice */}
          {demoMode && (
            <div style={{ padding: '6px 12px', background: '#FEF3E2', fontSize: 11, color: '#8B4513', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚡ Demo AI Mode — IBM Granite not configured
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 13 }}>
                  {msg.content}
                </pre>
              </div>
            ))}

            {loading && (
              <div className="chat-message assistant" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="animate-pulse">⏳</span> Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="tag"
                  style={{ fontSize: 11 }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about heritage sites..."
              rows={1}
              style={{ height: 38, resize: 'none' }}
              aria-label="Chat message input"
              maxLength={500}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        className="chat-bubble-btn"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close Heritage AI chat' : 'Open Heritage AI chat'}
        title="Chat with HeritageGuard AI"
      >
        {open ? '✕' : '🏛'}
      </button>
    </div>
  );
}
