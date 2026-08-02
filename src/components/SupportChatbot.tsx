import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Headphones, 
  Sparkles, 
  User, 
  Bot, 
  CornerDownLeft,
  Copy,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface SupportChatbotProps {
  currentUser: {
    username: string;
    companyName?: string;
    representative?: string;
    status?: string;
    plan?: string;
  } | null;
}

export default function SupportChatbot({ currentUser }: SupportChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `반갑습니다! 건설안전포털 24시간 실시간 AI 상담 비서 **안전톡 24**입니다. 👷‍♂️

현장 사진 분석, 보고서 자동 작성 가이드, 구독 플랜 및 결제 안내 등 궁금하신 점을 언제든지 입력해 주세요. 최고의 안전 전문가로서 친절하고 정확하게 안내해 드리겠습니다!`,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewBadge, setHasNewBadge] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewBadge(false);
    }
  }, [messages, isOpen]);

  // Quick reply options
  const quickOptions = [
    { label: "체험회원 무료 사용 한도는?", query: "체험회원 무료 사용 한도가 어떻게 되나요?" },
    { label: "구독 플랜 종류 및 무제한 방법", query: "구독 플랜 종류와 무제한 보고서 작성 방법을 알려주세요." },
    { label: "무통장 입금 결제 계좌 확인", query: "무통장 입금용 결제 계좌 번호가 어떻게 되나요?" },
    { label: "철근배근/거푸집 AI 분석 방법", query: "현장 사진을 활용한 AI 철근배근 및 거푸집 상태 분석은 어떻게 이용하나요?" },
    { label: "고객센터 연락처 및 직접 문의", query: "고객센터 연락처와 직접 상담을 받을 수 있는 이메일을 알려주세요." }
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          companyInfo: currentUser ? {
            companyName: currentUser.companyName,
            representative: currentUser.representative,
            username: currentUser.username,
            plan: currentUser.plan,
            status: currentUser.status
          } : null
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `서버와의 통신에 실패했습니다 (${response.status})`);
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        role: "assistant",
        content: data.content || "죄송합니다. 일시적인 오류로 답변을 생성하지 못했습니다.",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chatbot API error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "현재 AI 비서의 연결 상태가 원활하지 않습니다. 잠시 후 다시 질문해 주시거나 마이페이지의 승인 요청 버튼을 이용해 주시기 바랍니다.",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("정보가 복사되었습니다!");
  };

  return (
    <div id="support-chatbot-container" className="fixed top-[84px] right-6 z-50 flex flex-col items-end gap-2.5">
      {/* ================= FLOATING ACTION LAUNCH BUTTON ================= */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewBadge(false);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-full shadow-lg border border-white/25 hover:border-white/45 cursor-pointer relative group transition-colors duration-200 shrink-0"
      >
        {/* Active Ring Animation */}
        <span className="absolute -inset-0.5 rounded-full bg-blue-600/15 animate-ping opacity-60 group-hover:bg-blue-700/25" />
        
        <span className="text-[10.5px] tracking-tight">24시간 실시간 상담</span>

        {/* Live Indicator */}
        <span className="flex h-1.5 w-1.5 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>

        {/* Notification Badge */}
        {hasNewBadge && (
          <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white animate-bounce shadow">
            N
          </span>
        )}
      </motion.button>

      {/* ================= CHAT WINDOW PANEL ================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-[370px] sm:w-[410px] h-[540px] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-950 text-white p-4 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border border-blue-400/30 relative">
                  <Headphones className="w-5 h-5 text-white" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold tracking-tight">안전톡 24 (SafetyTalk)</h3>
                    <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90">AI</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <span>● 24시간 실시간 인공지능 안전 비서</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all cursor-pointer"
                title="상담창 닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chatbot System Notice Banner */}
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <p className="text-[10px] text-blue-900 font-extrabold leading-tight">
                현재 {currentUser ? `[${currentUser.companyName || currentUser.username}]` : "신규 방문자"}님 세션으로 스마트 맞춤 상담이 준비되었습니다.
              </p>
            </div>

            {/* Message Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin"
            >
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar Icon */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                    m.role === "user" 
                      ? "bg-slate-200 border-slate-300 text-slate-700" 
                      : "bg-blue-50 border-blue-100 text-blue-700"
                  }`}>
                    {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Bubble content */}
                  <div className="max-w-[78%] flex flex-col">
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                      m.role === "user"
                        ? "bg-blue-600 text-white border-blue-500 rounded-tr-none shadow-md"
                        : "bg-white text-slate-800 border-slate-200 rounded-tl-none shadow-sm whitespace-pre-wrap"
                    }`}>
                      {m.content}

                      {/* Display special copy actions inside specific system messages */}
                      {m.role === "assistant" && m.content.includes("189-106874-01-014") && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCopyText("IBK 기업은행 189-106874-01-014 박제윤")}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3 text-slate-500" />
                            계좌정보 복사하기
                          </button>
                        </div>
                      )}
                    </div>
                    <span className={`text-[9px] text-slate-400 font-bold mt-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Bot Loading Dots */}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-sm max-w-[78%] flex items-center gap-1 text-slate-400 text-xs">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-75" />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-150" />
                    <span className="text-[10px] text-slate-500 font-extrabold ml-1.5">안전톡 AI가 고민하는 중...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Selection Row */}
            <div className="p-2.5 bg-slate-100 border-t border-slate-200 shrink-0 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
              {quickOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(opt.query)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  💡 {opt.label}
                </button>
              ))}
            </div>

            {/* Input Form Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 bg-white border-t border-slate-200 shrink-0 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="상담하실 내용을 입력하세요..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-9 h-9 bg-slate-950 hover:bg-blue-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition-colors shadow-md shrink-0 cursor-pointer"
                title="전송"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
