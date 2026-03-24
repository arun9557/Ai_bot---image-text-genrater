import React, { useState, useEffect, useRef } from "react";
import {
  Send, Layout, Rocket, ShieldCheck, Cpu,
  RotateCcw, Bot, User, MessageCircle
} from "lucide-react";

const KNOWLEDGE = {
  about: "Arun Shekhar is a **Cybersecurity Engineer**, **AI/ML Researcher**, and **Full-stack Developer** based in India. He specializes in building tools at the intersection of security and AI.",
  projects: "Arun has built several impressive projects including **Royal Studio** (AI platform), various **security automation tools**, and AI-powered web applications. Check them out at [arunshekhar.me/#projects](https://arunshekhar.me/#projects)",
  security: "Arun's security expertise includes penetration testing, ethical hacking, and web app security. He is proficient with **Kali Linux, Burp Suite, Metasploit, Wireshark, and Nmap**.",
  ai: "In AI, Arun focuses on LLM integration, AI Agents, and natural language processing. He loves building applications that solve real-world problems with intelligent models.",
  contact: "You can reach Arun via his portfolio at [arunshekhar.me](https://arunshekhar.me) or email him at contact@arunshekhar.me"
};

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm Arun's personal AI interface. I can help you explore his **projects**, **cybersecurity work**, or **AI research**. What can I tell you about today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text = input) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const userMsg = {
      id: Date.now().toString(),
      text: cleanText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated AI response based on Arun's data or calling backend
    try {
      // In a real scenario, we could call the Flask backend at /api/chat
      // Call backend API

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanText })
      });
      const data = await response.json();

      setIsTyping(false);
      const botMsg = {
        id: Date.now().toString() + "_bot",
        text: data.response || "Sorry, I'm having trouble connecting to Arun's mind right now. Try again?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setIsTyping(false);
      console.error("Chat Error:", err);
      const errorMsg = {
        id: Date.now().toString() + "_err",
        text: "System Offline. Please check my [Portfolio](https://arunshekhar.me) manually.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const formatText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('[') && part.includes('](')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) return <a key={i} href={match[2]} target="_blank" rel="noopener" className="text-primary font-bold hover:underline">{match[1]}</a>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-hidden flex items-center justify-center p-4 pt-[4vh]">
      <div className="mesh-gradient-bg"></div>

      <div className="w-full max-w-6xl h-[90vh] grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 animate-in fade-in duration-700 relative z-10">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col glass-sidebar rounded-3xl p-6 h-full shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-4 border border-primary/10">
              AI Interface v2.0
            </div>
            <div className="w-28 h-28 mx-auto rounded-[32px] bg-gradient-to-br from-primary to-[#58ebd3] p-[3px] mb-4 shadow-xl shadow-primary/20">
              <div className="w-full h-full rounded-[29px] bg-white flex items-center justify-center overflow-hidden">
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=Arun"
                  alt="Arun AI"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-xl font-extrabold text-[#1e293b]">Arun Shekhar</h1>
            <p className="text-xs text-[#64748b] font-medium">Cybersecurity & AI Researcher</p>
          </div>

          <div className="space-y-1 mb-8">
            <p className="px-3 text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-3 opacity-70">Portfolios</p>
            <NavBtn icon={<Layout size={18} />} label="Main Site" href="https://arunshekhar.me" />
            <NavBtn icon={<Rocket size={18} />} label="Projects" href="https://arunshekhar.me/#projects" />
            <NavBtn icon={<ShieldCheck size={18} />} label="Security" href="https://arunshekhar.me/cybersecurity" />
            <NavBtn icon={<Cpu size={18} />} label="AI Work" href="https://arunshekhar.me/ai" />
          </div>

          <div className="mt-auto glass-card p-4 rounded-2xl bg-white/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#64748b]">Network</span>
              <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Online</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748b]">Location</span>
              <span className="font-bold">India</span>
            </div>
          </div>
        </aside>

        {/* Main Chat Container */}
        <main 
          className="flex flex-col glass-chat-container rounded-3xl overflow-hidden h-full shadow-2xl relative bg-cover bg-center"
          style={{ backgroundImage: "url('https://i.pinimg.com/736x/1b/24/67/1b24675a1e16a5928604b84bdb986972.jpg')" }}
        >

          {/* Header */}
          <header className="p-4 sm:p-6 border-b flex items-center justify-between bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <Bot size={24} />
              </div>
              <div>
                <h2 className="font-extrabold text-[#1e293b]">Arun's Assistant</h2>
                <p className="text-xs text-[#64748b]">Real-time Intelligent Support</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([messages[0]])}
                className="w-10 h-10 rounded-xl bg-white/80 border flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                title="Reset Chat"
              >
                <RotateCcw size={18} className="text-[#64748b]" />
              </button>
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-white/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-4 duration-300`}
              >
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md ${msg.sender === 'user' ? 'bg-white border' : 'bg-primary text-white'
                  }`}>
                  {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-none shadow-primary/20'
                  : 'bg-white/80 border border-white/40 backdrop-blur-sm text-[#1e293b] rounded-tl-none'
                  }`}>
                  {formatText(msg.text)}
                  <div className={`text-[10px] mt-2 opacity-60 font-medium ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-primary text-white shadow-sm">
                  <Bot size={18} />
                </div>
                <div className="bg-white/80 border border-white/40 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 sm:px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white/30 backdrop-blur-sm border-t border-white/40">
            <QuickPrompt label="👤 Who is Arun?" onClick={() => handleSend("Who is Arun Shekhar?")} />
            <QuickPrompt label="🚀 Projects" onClick={() => handleSend("Tell me about your projects")} />
            <QuickPrompt label="🔐 Security" onClick={() => handleSend("What are your security skills?")} />
            <QuickPrompt label="🤖 AI Work" onClick={() => handleSend("Tell me about your AI research")} />
            <QuickPrompt label="📬 Contact" onClick={() => handleSend("How can I contact Arun?")} />
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-8 pt-3 bg-white/40 backdrop-blur-md">
            <div className="relative group max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about my work..."
                className="w-full bg-white border border-white/80 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all group-hover:shadow-lg pr-16 text-[#1e293b]"
              />
              <button
                onClick={() => handleSend()}
                className="absolute right-2 top-2 bottom-2 w-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const NavBtn = ({ icon, label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener"
    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-[#64748b] hover:bg-white hover:text-primary transition-all hover:translate-x-1 hover:shadow-sm"
  >
    {icon} {label}
  </a>
);

const QuickPrompt = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-xl bg-white/80 border border-white/40 text-xs font-bold whitespace-nowrap hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm"
  >
    {label}
  </button>
);

export default App;
