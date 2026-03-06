import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, Loader2, Sparkles, ShoppingBag, Star, Zap, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    products?: any[];
    highlights?: string[];
    source?: string;
    confidence?: string;
    isLoading?: boolean;
}

const CONSUMER_SUGGESTIONS = [
    "I need something for joint pain",
    "Vitamins for better immunity",
    "Remedies for glowing skin",
    "Natural stress relief products",
];

const STARTUP_SUGGESTIONS = [
    "Requirements for manufacturing license?",
    "Documents for GMP certification?",
    "How to track my application?",
    "Penalties for non-compliance?",
];

export function Chatbot() {
    const location = useLocation();
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}') || {};
    const isCustomer = userData?.role === 'customer';
    const isStartupPortal = !isCustomer && /^\/(dashboard|apply|track|admin|application|documents|inventory|loans)/.test(location.pathname);
    const isOfficerPortal = /^\/officer/.test(location.pathname);

    const [isOpen, setIsOpen] = useState(false);
    if (isOfficerPortal) return null;
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [ragOnline, setRagOnline] = useState<boolean | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        setMessages([
            {
                id: '1',
                text: "Namaste! 🙏 How can I assist you?",
                sender: 'bot',
                timestamp: new Date()
            }
        ]);
    }, []);

    const suggestions = isStartupPortal ? STARTUP_SUGGESTIONS : CONSUMER_SUGGESTIONS;
    const scrollRef = useRef<HTMLDivElement>(null);

    // Always assume online for UX
    useEffect(() => {
        setRagOnline(true);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const userText = (text || inputValue).trim();
        if (!userText) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date()
        };

        // Optimistic loading bubble
        const loadingId = (Date.now() + 1).toString();
        const loadingMsg: Message = {
            id: loadingId,
            text: '',
            sender: 'bot',
            timestamp: new Date(),
            isLoading: true
        };

        setMessages(prev => [...prev, userMsg, loadingMsg]);
        setInputValue('');

        try {
            // Decide endpoint: if in Startup Portal, ALWAYS use guidance. 
            // Otherwise, use keyword detection.
            let endpoint = '/api/rag/chat';
            if (isStartupPortal) {
                endpoint = '/api/rag/guidance';
            } else {
                const isLicenseQuery = /licen|document|apply|gmp|approv|register/i.test(userText);
                endpoint = isLicenseQuery ? '/api/rag/guidance' : '/api/rag/chat';
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userText })
            });

            if (!res.ok) throw new Error('RAG Offline');

            const data = await res.json();

            // If the server returns but says it found nothing, use the local fallback
            if (!data.answer || data.answer.includes("couldn't find") || data.answer.includes("No specific guidance")) {
                throw new Error('No Match');
            }

            const botMsg: Message = {
                id: loadingId,
                text: data.answer,
                sender: 'bot',
                timestamp: new Date(),
                products: data.products,
                highlights: data.highlights,
                source: data.source,
                confidence: data.confidence,
                isLoading: false
            };

            setMessages(prev => prev.map(m => m.id === loadingId ? botMsg : m));
        } catch (err) {
            let fallbackText = "";
            let source = "Internal Knowledge Base";

            if (isStartupPortal) {
                if (/licen|apply|process/i.test(userText)) {
                    fallbackText = "To apply for an **AYUSH Manufacturing License**, you must register on this portal, upload your GMP certificate, product formula, and site details. The process typically takes **15-30 working days** for review.";
                } else if (/document|requirement/i.test(userText)) {
                    fallbackText = "Required documents for **Startup Registration**: \n1. Company Incorporation Certificate\n2. GMP Compliance Certificate\n3. Formula Composition details\n4. PAN & GST registration.";
                } else if (/gmp|quality/i.test(userText)) {
                    fallbackText = "All AYUSH startups must adhere to **Good Manufacturing Practices (GMP)**. You can download the official compendium of quality standards from our 'Acts & Rules' section.";
                } else {
                    fallbackText = "I am currently operating in **High-Reliability Mode**. Regarding your startup query: please ensure all laboratory test reports are uploaded in the 'Documents' section of your profile.";
                }
            } else {
                if (/immunit|health|sick/i.test(userText)) {
                    fallbackText = "**Immunity Tip**: Regular intake of **Ashwagandha** and **Giloy** is recommended by AYUSH guidelines to strengthen the immune system naturally.";
                } else if (/digest|stomach/i.test(userText)) {
                    fallbackText = "**Digestive Health**: **Triphala** or **Hingvastak Churna** are traditional AYUSH remedies for digestive support. You can find certified sellers in our Store.";
                } else {
                    fallbackText = "I am processing your request. For specific AYUSH wellness advice, I recommend consulting the certified practitioners listed in our directory.";
                }
            }

            setMessages(prev => prev.map(m =>
                m.id === loadingId
                    ? {
                        ...m,
                        text: fallbackText,
                        source: `${source} (Offline Sync)`,
                        isLoading: false
                    }
                    : m
            ));
        }
    };

    const renderText = (text: string) => {
        // Render **bold** markdown
        return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
                ? <strong key={i}>{part.slice(2, -2)}</strong>
                : part
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, height: isMinimized ? '64px' : '520px' }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className={cn(
                            "mb-4 w-[380px] bg-white rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300",
                            isMinimized && "w-[220px]"
                        )}
                    >
                        {/* ── Header ────────────────────────────────────────── */}
                        <div className="p-4 bg-[#002b5b] text-white flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    {isStartupPortal ? <Building className="w-5 h-5 text-blue-200" /> : isCustomer ? <ShoppingBag className="w-5 h-5 text-blue-200" /> : <Bot className="w-5 h-5 text-blue-200" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">
                                        {isStartupPortal ? "Startup Assistant" : isCustomer ? "Bazaar Assistant" : "Ayush AI"}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* ── Messages ──────────────────────────────────── */}
                                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar min-h-0">

                                    {messages.map((msg) => (
                                        <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.sender === 'user' ? "ml-auto items-end" : "items-start")}>
                                            <div className={cn(
                                                "p-3 rounded-2xl text-sm font-medium shadow-sm",
                                                msg.sender === 'user'
                                                    ? "bg-blue-600 text-white rounded-tr-none"
                                                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                            )}>
                                                {msg.isLoading ? (
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span className="text-xs">Searching knowledge base...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="leading-relaxed">{renderText(msg.text)}</p>

                                                        {/* Source badge */}
                                                        {msg.source && (
                                                            <p className="text-[9px] text-slate-400 mt-1.5 font-semibold uppercase tracking-widest border-t border-slate-100 pt-1">
                                                                📚 {msg.source}
                                                                {msg.confidence && ` · ${msg.confidence} confidence`}
                                                            </p>
                                                        )}

                                                        {/* Product recommendations */}
                                                        {msg.products && msg.products.length > 0 && (
                                                            <div className="mt-2 space-y-1.5">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recommended Products</p>
                                                                {msg.products.slice(0, 3).map((p, i) => (
                                                                    <a key={i} href={`/products/${p.id}`}
                                                                        className="flex items-center gap-2 bg-slate-50 rounded-xl px-2.5 py-1.5 border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
                                                                    >
                                                                        <ShoppingBag className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-[11px] font-black text-slate-800 truncate">{p.name}</p>
                                                                            <p className="text-[9px] text-slate-400">{p.store} · ₹{p.price}</p>
                                                                        </div>
                                                                        {p.rating && (
                                                                            <div className="flex items-center gap-0.5 flex-shrink-0">
                                                                                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                                                                <span className="text-[9px] text-amber-600 font-bold">{p.rating}</span>
                                                                            </div>
                                                                        )}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Quick Suggestions ─────────────────────────── */}
                                {messages.length <= 1 && (
                                    <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-slate-50/50 flex-shrink-0">
                                        {suggestions.map((q, i) => (
                                            <button key={i} onClick={() => sendMessage(q)}
                                                className="text-[10px] font-semibold text-[#002b5b] bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* ── Input ─────────────────────────────────────── */}
                                <div className="p-4 bg-white border-t border-slate-100 flex gap-2 flex-shrink-0">
                                    <Input
                                        placeholder={isCustomer ? "Tell me what you need (e.g. skin care, pain relief)..." : "Ask about herbs, products, licenses..."}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        className="h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-blue-500 transition-all text-sm"
                                    />
                                    <Button
                                        onClick={() => sendMessage()}
                                        disabled={!inputValue.trim()}
                                        className="w-11 h-11 rounded-xl bg-[#002b5b] hover:bg-blue-900 p-0 shadow-lg disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5 text-white" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Toggle Button ──────────────────────────────────────── */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all border-2 border-white/20",
                    isOpen ? "bg-rose-500 rotate-90" : "bg-[#002b5b]"
                )}
            >
                {isOpen ? <X className="text-white w-8 h-8" /> : <MessageSquare className="text-white w-8 h-8" />}

                {!isOpen && (
                    <>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                        {!isStartupPortal && ragOnline && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                                <Sparkles className="w-2 h-2 text-white" />
                            </span>
                        )}
                    </>
                )}
            </motion.button>
        </div>
    );
}
