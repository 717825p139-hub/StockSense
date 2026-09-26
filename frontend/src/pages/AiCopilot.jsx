import React, { useState } from 'react';
import api from '../services/api';
import { Sparkles, Bot, Send, User, Loader2, HelpCircle } from 'lucide-react';

export default function AiCopilot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your StockSense AI Copilot. Ask me read-only analytics questions about your live inventory database:\n• "Which products are low in stock?"\n• "What is our total inventory value?"\n• "How much Steel Rod stock do we have?"\n• "What receipts or delivery orders are pending?"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Which products are low in stock?',
    'How much Steel Rod is available?',
    'What receipts are pending?',
    'What deliveries are pending?'
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/query', { question: textToSend });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error querying live database metrics.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          AI Inventory Copilot
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Read-only intelligent assistant backed by live database analytics
        </p>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex flex-wrap gap-2">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-purple-300 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs h-[600px] flex flex-col overflow-hidden">
        
        {/* Messages Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === 'user'
                  ? 'bg-purple-600 text-white font-medium shadow-xs'
                  : 'bg-slate-50 text-slate-900 border border-slate-200/80 shadow-2xs'
              }`}>
                {m.text}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-slate-400 text-xs italic pl-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>Querying live Supabase PostgreSQL database...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Copilot about stock level, SKU location, or receipts..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
