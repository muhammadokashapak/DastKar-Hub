import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import {
  ChatMessage,
  INITIAL_ASSISTANT_MESSAGE,
  getArtisanAssistantReply,
} from '../../lib/artisanAssistant';

interface ArtisanChatWidgetProps {
  className?: string;
}

export const ArtisanChatWidget: React.FC<ArtisanChatWidgetProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_ASSISTANT_MESSAGE]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll strictly to latest message whenever messages update, typing changes, or modal opens
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    // Primary: Scroll internal container to max scroll height
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight + 1000,
        behavior,
      });
    }
    // Secondary: Anchor element scroll into view
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    // Fire auto-scroll immediately and after minor DOM reflow
    scrollToBottom('smooth');
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 60);
    return () => clearTimeout(timer);
  }, [messages, isTyping, isOpen, scrollToBottom]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom('auto');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, scrollToBottom]);

  const handleSendPrompt = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Realistic typing delay for authentic artisan liaison consultation
    setTimeout(() => {
      const response = getArtisanAssistantReply(trimmed, messages);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: response.quickReplies,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(inputValue);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_ASSISTANT_MESSAGE]);
  };

  // Helper to format text with bold, bullet points, and clean linebreaks
  const renderFormattedText = (rawText: string) => {
    const paragraphs = rawText.split('\n\n');
    return (
      <div className="space-y-2 leading-relaxed">
        {paragraphs.map((para, pIdx) => {
          const lines = para.split('\n');
          return (
            <p key={pIdx} className="text-xs">
              {lines.map((line, lIdx) => {
                // Parse bold **text**
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <React.Fragment key={lIdx}>
                    {parts.map((part, partIdx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={partIdx} className="font-semibold text-gray-900">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return <span key={partIdx}>{part}</span>;
                    })}
                    {lIdx < lines.length - 1 && <br />}
                  </React.Fragment>
                );
              })}
            </p>
          );
        })}
      </div>
    );
  };

  // Get active quick replies from the very latest bot message
  const latestBotMessage = [...messages].reverse().find((m) => m.sender === 'bot');
  const activeQuickReplies = latestBotMessage?.quickReplies || [];

  return (
    <div
      className={`fixed bottom-20 md:bottom-6 right-3 sm:right-6 select-none ${
        isOpen ? 'z-50' : 'z-30'
      } ${className}`}
    >
      {/* Floating Trigger Pill */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open artisan craft liaison chat"
          className="group flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white text-[#20242B] rounded-full border border-[#EAE4D8] hover:border-[#B94D28] hover:text-[#B94D28] shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer text-xs font-semibold"
        >
          <div className="relative">
            <MessageCircle className="w-4 h-4 text-[#B94D28]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#54745C] animate-pulse" />
          </div>
          <span className="font-medium text-xs">Artisan Chat</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-[#54745C]/10 text-[#54745C] text-[10px] font-bold">
            Live
          </span>
        </button>
      ) : (
        /* Chat Drawer / Window */
        <div className="w-[calc(100vw-1.5rem)] xs:w-96 max-w-[420px] bg-white rounded-2xl shadow-2xl border border-[#EAE4D8] overflow-hidden flex flex-col h-[520px] max-h-[85vh] animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#B94D28] to-[#9C3D1D] text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white text-[#B94D28] font-serif font-bold flex items-center justify-center text-xs shadow-xs">
                D
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-serif font-bold text-xs sm:text-sm tracking-wide">
                    Artisan Workshop Liaison
                  </h3>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-200" />
                </div>
                <p className="text-[10px] text-amber-100 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  <span>Direct Heritage Guidance • Online</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart conversation"
                aria-label="Restart conversation"
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/90 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-[#FAF7F2] scroll-smooth"
          >
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-end space-x-1.5 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#B94D28] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-0.5 shadow-2xs">
                      D
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-2xl shadow-xs transition-all ${
                      isUser
                        ? 'bg-[#B94D28] text-white rounded-br-xs'
                        : 'bg-white text-[#20242B] border border-[#EAE4D8] rounded-bl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    ) : (
                      renderFormattedText(m.text)
                    )}

                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-end ${
                        isUser ? 'text-amber-100/80' : 'text-gray-400'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end space-x-1.5 justify-start animate-in fade-in duration-200">
                <div className="w-6 h-6 rounded-full bg-[#B94D28] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-0.5">
                  D
                </div>
                <div className="bg-white border border-[#EAE4D8] rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-xs flex items-center space-x-2">
                  <div className="flex space-x-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[#B94D28] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-[#B94D28] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-[#B94D28] rounded-full animate-bounce" />
                  </div>
                  <span className="text-[11px] text-gray-500 italic">
                    Consulting workshop masters...
                  </span>
                </div>
              </div>
            )}

            {/* Crucial scroll anchor */}
            <div ref={messagesEndRef} className="h-1 w-full" />
          </div>

          {/* Interactive Quick Prompts Chips */}
          {activeQuickReplies.length > 0 && !isTyping && (
            <div className="px-3 pt-2 pb-1.5 bg-white border-t border-[#F0EAE1] overflow-x-auto scrollbar-none flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#B94D28] shrink-0" />
              {activeQuickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendPrompt(reply)}
                  className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#B94D28] hover:text-white text-[#4A3B32] border border-[#EAE4D8] hover:border-[#B94D28] rounded-full text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-[#EAE4D8] bg-white flex items-center space-x-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about master artisans, crafts, custom orders..."
              disabled={isTyping}
              className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#EAE4D8] rounded-xl text-xs text-gray-800 focus:outline-hidden focus:border-[#B94D28] focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 bg-[#B94D28] hover:bg-[#9C3D1D] disabled:bg-gray-300 text-white rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
