import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '@google/genai';
import { startChat } from '../services/geminiService';
import { ChatMessage, LanguageCode } from '../types';
import { ChatBubbleIcon, CloseIcon, SendIcon } from './icons';

interface ChatbotProps {
  t: (key: string) => string;
  language: LanguageCode;
}

const Chatbot: React.FC<ChatbotProps> = ({ t, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset chat if language changes while open
    if (isOpen) {
      chatRef.current = startChat(language);
      setMessages([{ role: 'model', parts: [{ text: t('chatbot_greeting') }] }]);
    }
  }, [language, isOpen, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: input });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if(lastMessage.role === 'model') {
            lastMessage.parts = [{ text: modelResponse }];
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: t('chatbot_error') }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-eco-green-start to-eco-green-end text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-50"
        aria-label={t('chatbot_toggle_aria_label')}
      >
        {isOpen ? <CloseIcon className="w-8 h-8"/> : <ChatBubbleIcon className="w-8 h-8" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col animate-slide-up z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-900/50">
            <h3 className="text-lg font-bold text-white text-center">{t('chatbot_header')}</h3>
          </div>

          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.role === 'user' ? 'bg-eco-green text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                      <div className="flex items-center justify-center space-x-2">
                          <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                      </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-900/50">
            <div className="flex items-center bg-slate-700 rounded-xl">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder={t('chatbot_placeholder')}
                className="w-full bg-transparent px-4 py-2 text-white placeholder-slate-400 focus:outline-none"
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 text-white disabled:text-slate-500 hover:text-eco-green disabled:hover:text-slate-500 transition-colors">
                <SendIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
