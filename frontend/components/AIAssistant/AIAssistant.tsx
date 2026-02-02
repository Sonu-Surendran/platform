import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { useAIContext } from '@/contexts/AIContext';
import { API_BASE_URL } from '@/services/api';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your MIC Platform Copilot. How can I assist you today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { contextData, contextType } = useAIContext();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare chat history (exclude initial greeting or deep history if needed)
            const chatHistory = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }));
            chatHistory.push(userMessage);

            const payload = {
                messages: chatHistory,
                context_type: contextType,
                context_data: contextData
            };

            const response = await fetch(`${API_BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-pastel-blue to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 flex items-center justify-center animate-in zoom-in duration-300"
            >
                <Sparkles size={24} />
            </button>
        );
    }

    return (
        <div className={`fixed z-50 bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 shadow-2xl transition-all duration-300 overflow-hidden flex flex-col
      ${isMinimized ? 'bottom-6 right-6 w-72 h-14 rounded-full' : 'bottom-6 right-6 w-[380px] h-[600px] rounded-3xl'}
    `}>

            {/* Header */}
            <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-pastel-blue to-purple-600 text-white cursor-pointer"
                onClick={() => isMinimized && setIsMinimized(false)}
            >
                <div className="flex items-center gap-2">
                    <Bot size={20} />
                    <h3 className="font-bold text-sm">MIC Copilot</h3>
                    {contextData && !isMinimized && (
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full capitalize">{contextType} Mode</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1 hover:bg-white/20 rounded-full"
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-1 hover:bg-white/20 rounded-full"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Body */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-charcoal-800">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] p-3 text-sm rounded-2xl ${msg.role === 'user'
                                            ? 'bg-pastel-blue text-white rounded-br-none'
                                            : 'bg-white dark:bg-charcoal-700 text-slate-700 dark:text-gray-200 border border-slate-100 dark:border-charcoal-600 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-charcoal-700 p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-charcoal-600">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white dark:bg-charcoal-900 border-t border-slate-200 dark:border-charcoal-700">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-charcoal-800 rounded-xl px-3 py-2 border border-transparent focus-within:border-pastel-blue transition-colors">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask about deals, circuits..."
                                className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-charcoal-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-1.5 bg-pastel-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
