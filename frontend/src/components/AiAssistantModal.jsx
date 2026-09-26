import React, { useState } from 'react';
import api from '../services/api';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';

export default function AiAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your StockSense AI assistant. Ask me questions like:\n• "Which products are low in stock?"\n• "How much Steel Rod is available?"\n• "What receipts are late?"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/query', { question: userQuery });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error answering your query. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">StockSense AI Assistant</h3>
              <p className="text-xs text-slate-400">Powered by Gemini & Real-time Database</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-rose-400" />
                </div>
              )}

              <div 
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-rose-600 text-white font-medium shadow-md'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 shadow-sm'
                }`}
              >
                {m.text}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-slate-400 text-xs italic pl-2">
              <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
              <span>Analyzing stock database...</span>
            </div>
          )}
        </div>

        {/* Query Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stock, low items, or receipts..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
