"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User, Sparkles } from "lucide-react";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your Legal AI Assistant. I can help you understand legal terms, draft simple documents, or find the right lawyer for your case. How can I assist you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I understand your query. Based on current Indian laws, this typically falls under civil jurisdiction. However, I recommend consulting with a specialized 'Property Lawyer' for a definite legal opinion. Would you like me to find some lawyers for you?",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <Bot className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="font-bold text-slate-900">Legal AI Assistant</h1>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-yellow-500" /> Powered by GPT-4
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <Avatar className="h-8 w-8 mt-1 border border-slate-200 bg-white">
                                    <AvatarFallback><Bot className="h-4 w-4 text-blue-600" /></AvatarFallback>
                                </Avatar>
                            )}

                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                }`}>
                                {msg.content}
                                <div className={`text-[10px] mt-1 opacity-70 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <Avatar className="h-8 w-8 mt-1 border border-blue-200 bg-blue-50">
                                    <AvatarFallback><User className="h-4 w-4 text-blue-700" /></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <Avatar className="h-8 w-8 mt-1 border border-slate-200 bg-white">
                                <AvatarFallback><Bot className="h-4 w-4 text-blue-600" /></AvatarFallback>
                            </Avatar>
                            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2 relative">
                    <Input
                        placeholder="Ask anything about legal issues..."
                        className="pr-12 py-6 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                        size="icon"
                        className="absolute right-1.5 top-1.5 h-9 w-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                    AI can make mistakes. Please verify important legal information with a qualified attorney.
                </p>
            </div>
        </div>
    );
}
