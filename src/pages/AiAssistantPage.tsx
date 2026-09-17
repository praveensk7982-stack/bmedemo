import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SUGGESTED_QUESTIONS } from '../lib/mockData';
import { Send, Sparkles, AlertCircle, Bot, User, Trash2 } from 'lucide-react';

interface AiAssistantPageProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  messages,
  onSendMessage,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setInputText('');
    onSendMessage(text);

    // Simulate AI thinking & response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1200);
  };

  const handlePromptClick = (question: string) => {
    setInputText(question);
  };

  return (
    <div className="content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(140deg, #16a3ae, #0d6e7d)', display: 'grid', placeItems: 'center', color: '#fff' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px' }}>Hospivio AI Medical Assistant</h1>
            <div style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: 600 }}>Active • General Healthcare Intelligence</div>
          </div>
        </div>

        <button className="btn ghost" style={{ fontSize: '12px' }} onClick={onClearHistory}>
          <Trash2 size={14} /> Clear Conversation
        </button>
      </div>

      {/* Medical Disclaimer Banner */}
      <div
        style={{
          background: '#eef7f8',
          border: '1px solid #cdeade',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '11.5px',
          color: '#4f7d6b',
          marginBottom: '14px'
        }}
      >
        <AlertCircle size={16} style={{ flex: '0 0 16px' }} />
        <span>
          <b>Important Disclaimer:</b> Hospivio AI provides general healthcare information for educational purposes only. It is <b>not a substitute for professional medical advice, diagnosis, or treatment</b>.
        </span>
      </div>

      {/* Chat Thread Container */}
      <div
        style={{
          flex: 1,
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: '14px',
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--shadow)',
          marginBottom: '14px'
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: 12,
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '82%',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: msg.sender === 'user' ? 'var(--teal)' : '#0b2440',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                flex: '0 0 32px'
              }}
            >
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div
              style={{
                background: msg.sender === 'user' ? 'var(--side-active)' : '#f8fafc',
                color: msg.sender === 'user' ? '#fff' : 'var(--ink)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--line)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '13px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}
            >
              {msg.text}
              <div
                style={{
                  fontSize: '10px',
                  opacity: 0.7,
                  marginTop: '6px',
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--ink-3)', fontSize: '12px' }}>
            <Bot size={20} color="var(--teal)" /> Hospivio AI is thinking...
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested prompts */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px' }}>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            className="btn ghost"
            style={{ borderRadius: '20px', padding: '6px 12px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
            onClick={() => handlePromptClick(q)}
          >
            💡 {q}
          </button>
        ))}
      </div>

      {/* User Input Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="form-control"
          style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '13px' }}
          placeholder="Ask a medical question, symptom check, or appointment query..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="btn" style={{ borderRadius: '12px', padding: '0 20px' }}>
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
};
