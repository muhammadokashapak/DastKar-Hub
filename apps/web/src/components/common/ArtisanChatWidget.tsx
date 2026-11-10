import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ShoppingCart,
  ExternalLink,
  Check,
  ShieldCheck,
  MapPin,
  Store,
} from 'lucide-react';
import {
  ChatMessage,
  INITIAL_ASSISTANT_MESSAGE,
  getArtisanAssistantReply,
} from '../../lib/artisanAssistant';
import { useCart } from '../../lib/cartContext';
import { Product, SellerProfile } from '../../types';

interface ArtisanChatWidgetProps {
  className?: string;
}

export const ArtisanChatWidget: React.FC<ArtisanChatWidgetProps> = ({ className = '' }) => {
  const location = useLocation();
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});
  const [showTeaser, setShowTeaser] = useState(false);

  // Initialize messages from localStorage if available
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('dastkar_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [INITIAL_ASSISTANT_MESSAGE];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dastkar_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist chat history:', e);
    }
  }, [messages]);

  // Trigger floating teaser pill after a few seconds of browsing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTeaser(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll strictly to latest message
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight + 1000,
        behavior,
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 80);
    return () => clearTimeout(timer);
  }, [messages, isTyping, isOpen, isExpanded, scrollToBottom]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowTeaser(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom('auto');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, scrollToBottom]);

  // Voice Input (Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-PK';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSendPrompt(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Text to Speech
  const toggleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = text
      .replace(/[*#_`]/g, '')
      .replace(/🏺|🪵|🧵|🧣|✨|🐑|🌿|👞|🏮|📦|🛡️|✍️/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2200);
  };

  const handleSendPrompt = async (textToSend: string) => {
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

    try {
      const response = await getArtisanAssistantReply(trimmed, messages, {
        pathname: location.pathname,
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: response.quickReplies,
        products: response.products,
        makers: response.makers,
        actionType: response.actionType,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Artisan assistant error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Our artisan liaison is currently consulting workshop masters. How else may we assist your craft inquiries?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(inputValue);
  };

  const handleResetChat = () => {
    try {
      localStorage.removeItem('dastkar_chat_history');
    } catch {
      // ignore
    }
    if (speakingMsgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
    }
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
                const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
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
                      if (part.startsWith('`') && part.endsWith('`')) {
                        return (
                          <code
                            key={partIdx}
                            className="px-1.5 py-0.5 bg-amber-50 text-[#B94D28] font-mono rounded text-[11px] font-semibold border border-[#EAE4D8]"
                          >
                            {part.slice(1, -1)}
                          </code>
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
        <div className="relative">
          {/* Proactive Floating Teaser */}
          {showTeaser && (
            <div className="absolute -top-12 right-0 bg-[#20242B] text-white px-3 py-1.5 rounded-xl text-[11px] shadow-xl border border-white/10 whitespace-nowrap animate-bounce flex items-center space-x-1.5">
              <span>🏺</span>
              <span>Need custom Urdu calligraphy or master maker advice?</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTeaser(false);
                }}
                className="text-gray-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

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
        </div>
      ) : (
        /* Chat Drawer / Window */
        <div
          className={`${
            isExpanded
              ? 'w-[calc(100vw-1.5rem)] sm:w-[580px] max-w-[620px] h-[640px]'
              : 'w-[calc(100vw-1.5rem)] xs:w-96 max-w-[420px] h-[540px]'
          } max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-[#EAE4D8] overflow-hidden flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-5`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#B94D28] via-[#A84320] to-[#9C3D1D] text-white flex items-center justify-between shrink-0 shadow-xs">
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
                  <span>Verified Heritage Masters • Live Catalog</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Expand / Minimize Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize drawer' : 'Expand window'}
                aria-label={isExpanded ? 'Minimize drawer' : 'Expand window'}
                className="hidden sm:inline-flex p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/90 hover:text-white cursor-pointer"
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Reset History */}
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart conversation"
                aria-label="Restart conversation"
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/90 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
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
              const isSpeakingThis = speakingMsgId === m.id;

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div
                    className={`flex items-end space-x-1.5 w-full ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isUser && (
                      <div className="w-6 h-6 rounded-full bg-[#B94D28] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-0.5 shadow-2xs">
                        D
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] sm:max-w-[82%] p-3 rounded-2xl shadow-xs transition-all ${
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
                        className={`text-[9px] mt-2 flex items-center justify-between border-t pt-1.5 ${
                          isUser
                            ? 'text-amber-100/80 border-white/20'
                            : 'text-gray-400 border-gray-100'
                        }`}
                      >
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => toggleSpeak(m.id, m.text)}
                            title={isSpeakingThis ? 'Stop speaking' : 'Listen aloud'}
                            className="flex items-center space-x-1 text-gray-500 hover:text-[#B94D28] transition-colors cursor-pointer"
                          >
                            {isSpeakingThis ? (
                              <>
                                <VolumeX className="w-3 h-3 text-[#B94D28]" />
                                <span className="text-[10px] text-[#B94D28]">Speaking...</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span className="text-[10px]">Read aloud</span>
                              </>
                            )}
                          </button>
                        )}
                        <span className="ml-auto">{m.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Product Mini-Cards attached to Bot message */}
                  {!isUser && m.products && m.products.length > 0 && (
                    <div className="ml-7 w-[calc(100%-1.75rem)] space-y-2 pt-1">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-[#B94D28]" />
                        <span>Live Catalog Matches</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.products.map((product) => {
                          const isAdded = !!addedIds[product.id];
                          const imageSrc =
                            product.primary_image?.image_url ||
                            (product.images && product.images[0]?.image_url) ||
                            '/placeholder-craft.jpg';

                          return (
                            <div
                              key={product.id}
                              className="bg-white border border-[#EAE4D8] rounded-xl p-2.5 flex flex-col justify-between shadow-xs hover:border-[#B94D28] transition-all"
                            >
                              <div className="flex space-x-2">
                                <img
                                  src={imageSrc}
                                  alt={product.title}
                                  className="w-12 h-12 object-cover rounded-lg bg-gray-100 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=150&q=80';
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-900 text-[11px] truncate leading-snug">
                                    {product.title}
                                  </h4>
                                  <p className="text-[10px] text-gray-500 truncate">
                                    {product.seller?.business_name || 'Master Artisan Studio'}
                                  </p>
                                  <p className="text-[#B94D28] font-bold text-[11px] mt-0.5">
                                    Rs. {Number(product.base_price).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2.5 flex items-center space-x-1.5 pt-1.5 border-t border-gray-100">
                                <Link
                                  to={`/products/${product.slug}`}
                                  className="flex-1 py-1 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-medium rounded-lg text-center flex items-center justify-center space-x-1 transition-colors"
                                >
                                  <span>View Craft</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>

                                <button
                                  type="button"
                                  onClick={(e) => handleAddToCart(product, e)}
                                  disabled={isAdded}
                                  className={`py-1 px-2.5 text-[10px] font-semibold rounded-lg flex items-center space-x-1 transition-colors cursor-pointer ${
                                    isAdded
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-[#B94D28] hover:bg-[#9C3D1D] text-white'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-2.5 h-2.5" />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="w-2.5 h-2.5" />
                                      <span>Add</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Interactive Master Maker Mini-Cards attached to Bot message */}
                  {!isUser && m.makers && m.makers.length > 0 && (
                    <div className="ml-7 w-[calc(100%-1.75rem)] space-y-2 pt-1">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-[#54745C]" />
                        <span>Verified Ancestral Studios</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.makers.map((maker) => (
                          <div
                            key={maker.id}
                            className="bg-white border border-[#EAE4D8] rounded-xl p-2.5 shadow-xs hover:border-[#54745C] transition-all flex flex-col justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-[#54745C]/10 text-[#54745C] font-serif font-bold flex items-center justify-center text-xs shrink-0">
                                {maker.business_name.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-gray-900 text-[11px] truncate">
                                  {maker.business_name}
                                </h4>
                                <p className="text-[10px] text-gray-500 flex items-center space-x-1">
                                  <MapPin className="w-2.5 h-2.5 text-gray-400" />
                                  <span>{maker.location_city || 'Pakistan'}</span>
                                </p>
                              </div>
                            </div>

                            <Link
                              to={`/makers/${maker.slug}`}
                              className="mt-2 py-1 px-2 bg-[#54745C]/10 hover:bg-[#54745C] text-[#54745C] hover:text-white text-[10px] font-semibold rounded-lg text-center flex items-center justify-center space-x-1 transition-colors"
                            >
                              <Store className="w-2.5 h-2.5" />
                              <span>Visit Studio</span>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    Consulting workshop masters & catalog...
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

          {/* Chat Input Form with Voice Support */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-[#EAE4D8] bg-white flex items-center space-x-2 shrink-0"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? 'Listening... click to stop' : 'Speak your question'}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to your voice...'
                  : 'Ask about master artisans, crafts, custom orders...'
              }
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
