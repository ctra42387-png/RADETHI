import React, { useState, useEffect, useRef } from 'react';
import { BotMessageSquare, Loader2, Send, Sparkles, X } from 'lucide-react';
import { ChatMessage, ExamConfig } from '../types.ts';
import { getAIAssistantResponse } from '../services/geminiService.ts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentExamConfig: ExamConfig;
}

const AIAssistant: React.FC<Props> = ({ isOpen, onClose, currentExamConfig }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Xin chào! Tôi là Trợ lý AI chuyên trách về khảo thí. Tôi có thể giúp gì cho bạn trong việc tạo đề kiểm tra này?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAIAssistantResponse(input, currentExamConfig);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        role: 'systemError',
        content: "Rất tiếc, đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" 
        aria-hidden="true" 
        onClick={onClose}
      ></div>

      <div className={`relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <BotMessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Trợ lý AI Khảo thí</h2>
              <p className="text-xs text-slate-500 font-medium">Hỏi đáp nhanh theo ngữ cảnh đề bài</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white">
                  <Sparkles size={18} />
                </div>
              )}
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-lg' 
                  : msg.role === 'model'
                  ? 'bg-slate-100 text-slate-800 rounded-bl-lg'
                  : 'bg-red-50 text-red-700 rounded-bl-lg'
              }`}>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white">
                <Sparkles size={18} />
              </div>
              <div className="max-w-[80%] p-3 rounded-2xl bg-slate-100 text-slate-500 rounded-bl-lg flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="italic text-xs">Trợ lý đang suy nghĩ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Nhập câu hỏi của bạn..."
              className="w-full p-3 pr-12 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              rows={2}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
