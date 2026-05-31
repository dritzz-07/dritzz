import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hello! I am the Dritzz Support Assistant. How may I assist you with our premium car care services today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Create context of the conversation for the API without the ids
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[PRODUCTION DEBUG] Server returned ${res.status}: ${errorText}`);
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: data.text || "I apologize, I am unable to process that request at the moment.",
        },
      ]);
    } catch (error: any) {
      console.error("[PRODUCTION DEBUG] /api/chat fetch failed:", error.message || error);
       setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "I apologize, our systems are currently unavailable. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[96px] md:bottom-8 right-4 md:right-8 z-[150] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl w-[90vw] md:w-[380px] max-w-sm mb-4 overflow-hidden flex flex-col h-[400px] md:h-[480px] max-h-[60dvh] md:max-h-[70vh] font-sans"
          >
            {/* Header */}
            <div className="bg-[#111111] p-4 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center border border-white/10 shadow-inner">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white tracking-wide text-sm">Dritzz Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors p-1"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#0a0a0a]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                      message.role === "user"
                        ? "bg-white text-black"
                        : "bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 text-white"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] px-4 py-3 text-[14px] leading-relaxed shadow-md whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-white text-black rounded-2xl rounded-br-sm font-medium"
                        : "bg-[#161616] border border-white/5 text-gray-100 rounded-2xl rounded-bl-sm font-normal"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 text-white shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-[#161616] border border-white/5 px-5 py-4 rounded-2xl rounded-bl-sm flex gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-[#0a0a0a] border-t border-white/5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 relative bg-[#161616] rounded-full px-4 py-1 border border-white/10 focus-within:border-white/30 transition-all shadow-inner"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-transparent border-none text-gray-100 text-[16px] font-medium placeholder-gray-500 focus:outline-none focus:ring-0 py-3"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-30 disabled:bg-gray-600 transition-all shadow-md group hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white text-black px-2.5 py-1.5 rounded-xl rounded-br-sm text-[12px] font-bold shadow-lg flex items-center gap-1.5 animate-bounce uppercase tracking-wider"
            >
              Ask Me <Bot className="w-3.5 h-3.5" />
            </motion.div>
            <button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 bg-gradient-to-tr from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border border-[#fff9f9] text-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
              aria-label="Open chat"
            >
              <Bot className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
