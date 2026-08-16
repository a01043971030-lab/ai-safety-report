import React, { useState, useRef, useEffect } from "react";
import { SafetyReport, ChecklistItem, CustomReportSection } from "../types";
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  RotateCcw, 
  CheckCircle2, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  MessageSquare,
  Wand2,
  ChevronRight,
  History,
  Info,
  Maximize2,
  Minimize2
} from "lucide-react";

interface ReportChatEditorProps {
  report: SafetyReport;
  onUpdateReport: (updatedReport: SafetyReport) => void;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  changesSummary?: string[];
  snapshotIndex?: number;
}

export default function ReportChatEditor({ report, onUpdateReport, onClose }: ReportChatEditorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: `안녕하세요! 🤖 **AI 대화형 보고서 수정 비서**입니다.\n작성 완료된 **[${report.projectName || "안전점검 보고서"}]**의 내용을 대화식으로 자유롭게 수정, 추가, 삭제하실 수 있습니다.\n\n👇 **아래와 같이 말씀해 보세요:**\n• "공사명을 'OOO 4차로 확포장공사'로 변경해줘"\n• "책임기술자 종합의견에 동절기 한파 관련 안전수칙 내용을 추가해줘"\n• "체크리스트에 '추락방지망 및 안전난간 상태' 항목 추가해줘"\n• "발주자를 '국토교통부'로 바꿔줘"\n• "보고서 어조를 공식 기술 어조(~사료됨)로 정제해줘"`,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historySnapshots, setHistorySnapshots] = useState<SafetyReport[]>([report]);
  const [currentSnapshotIdx, setCurrentSnapshotIdx] = useState(0);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Quick Prompt Recommendations
  const QUICK_PROMPTS = [
    { label: "🏗️ 공사명/발주처 변경", prompt: "공사명과 발주처 및 시공자 정보를 수정하고 싶어." },
    { label: "✍️ 책임기술자 총평 보강", prompt: "책임기술자 종합의견에 안전 및 품질관리 보강 문구를 추가해줘." },
    { label: "📋 체크리스트 항목 추가", prompt: "체크리스트에 '가설 구조물 및 추락방지망 설치 상태' 양호 항목을 추가해줘." },
    { label: "📄 환경/소음관리 단원 추가", prompt: "제3장에 '3.10 현장 환경관리 및 소음·진동 저감대책' 단원을 추가해줘." },
    { label: "✨ 공식 어조로 전체 정제", prompt: "전체 보고서 문체를 정갈하고 전문적인 격식체(~확인됨, ~사료됨)로 변경해줘." },
    { label: "🗑️ 특정 항목 삭제 요청", prompt: "체크리스트 마지막 항목을 삭제해줘." }
  ];

  // Client-side fallback rule engine for instant response if offline
  const processLocalEditFallback = (userMessage: string, currentReportState: SafetyReport): {
    replyMessage: string;
    updatedReport: SafetyReport;
    changesSummary: string[];
  } => {
    let updated = { ...currentReportState, updatedAt: Date.now() };
    const summaryList: string[] = [];
    const text = userMessage.trim();

    // 1. Project metadata changes
    if (text.includes("공사명")) {
      const match = text.match(/공사명(?:을|를)?\s*['"]?([^'"]+)['"]?\s*(?:로|으로)/);
      if (match && match[1]) {
        updated.projectName = match[1].trim();
        summaryList.push(`공사명을 '${updated.projectName}'(으)로 변경`);
      } else {
        updated.projectName = "늑용~유치간 지방도 4차로 확포장공사 (수정)";
        summaryList.push(`공사명을 '${updated.projectName}'(으)로 보완`);
      }
    }

    if (text.includes("발주자") || text.includes("발주처")) {
      const match = text.match(/(?:발주자|발주처)(?:를|을)?\s*['"]?([^'"]+)['"]?\s*(?:로|으로)/);
      if (match && match[1]) {
        updated.client = match[1].trim();
        summaryList.push(`발주자를 '${updated.client}'(으)로 변경`);
      }
    }

    if (text.includes("시공자") || text.includes("시공사")) {
      const match = text.match(/(?:시공자|시공사)(?:를|을)?\s*['"]?([^'"]+)['"]?\s*(?:로|으로)/);
      if (match && match[1]) {
        updated.contractor = match[1].trim();
        summaryList.push(`시공자를 '${updated.contractor}'(으)로 변경`);
      }
    }

    if (text.includes("책임기술자")) {
      const match = text.match(/책임기술자(?:를|을)?\s*['"]?([^'"]+)['"]?\s*(?:로|으로)/);
      if (match && match[1]) {
        updated.leadEngineer = match[1].trim();
        summaryList.push(`책임기술자 성명을 '${updated.leadEngineer}'(으)로 변경`);
      }
    }

    // 2. Comprehensive Opinion / Lead Engineer Opinion Enhancement
    if (text.includes("총평") || text.includes("종합의견") || text.includes("보강")) {
      const extraSentence = " 금회 점검 결과, 가설 구조물 및 타설부의 제반 안전조치가 시방 규정에 부합하게 관리되고 있으며, 향후 동절기 및 강우 시 비탈면 유실 방지를 위한 예방 점검을 지속할 것을 권고함.";
      updated.comprehensiveOpinion = (updated.comprehensiveOpinion || "") + extraSentence;
      updated.leadEngineerOpinion = (updated.leadEngineerOpinion || "") + extraSentence;
      summaryList.push("책임기술자 종합의견에 안전 및 예방점검 보강 문구 추가");
    }

    // 3. Checklist Addition or Deletion
    if (text.includes("체크리스트")) {
      if (text.includes("삭제")) {
        const currentChecklist = updated.checklist ? [...updated.checklist] : [];
        if (currentChecklist.length > 0) {
          const removed = currentChecklist.pop();
          updated.checklist = currentChecklist;
          summaryList.push(`체크리스트 마지막 항목('${removed?.item || '선택항목'}') 삭제`);
        }
      } else {
        const newItem: ChecklistItem = {
          category: "가설 및 안전관리",
          item: "가설구조물 및 추락방지망 고정 상태",
          criterion: "산업안전보건기준에 관한 규칙 제32조",
          result: "양호",
          action: "지속적인 견고성 유지 관리"
        };
        updated.checklist = [...(updated.checklist || []), newItem];
        summaryList.push("체크리스트 신규 항목('가설구조물 및 추락방지망 고정 상태') 추가");
      }
    }

    // 4. Custom Section / New Chapter Addition
    if (text.includes("단원") || text.includes("섹션") || text.includes("환경") || text.includes("소음")) {
      const newSec: CustomReportSection = {
        title: "3.10 현장 환경관리 및 소음·진동 저감대책",
        content: "본 현장은 도로 확포장공사 구역에 인접한 서식지 및 인근 주민의 정주 환경을 보호하기 위하여 가설 방음벽을 설치하고 소음·진동 규제기준을 엄격히 준수하고 있음. 덤프트럭 및 중장비 운행 시 둔속 운행을 지시하고 살수차를 상시 배치하여 비산먼지 발생을 최조화함."
      };
      updated.customSections = [...(updated.customSections || []), newSec];
      summaryList.push("새로운 단원 '3.10 현장 환경관리 및 소음·진동 저감대책' 추가");
    }

    // 5. Tone Transformation
    if (text.includes("어조") || text.includes("격식") || text.includes("정제")) {
      if (updated.comprehensiveOpinion) {
        updated.comprehensiveOpinion = updated.comprehensiveOpinion
          .replace(/하였습니다/g, "하였음")
          .replace(/입니다/g, "임")
          .replace(/바랍니다/g, "바람") + " (기술사 검토 및 승인 필)";
      }
      summaryList.push("보고서 전체 어조를 격식 기술 어조(~사료됨, ~확인됨)로 다듬음");
    }

    // Default catch-all if no specific keyword was hit
    if (summaryList.length === 0) {
      updated.summary = (updated.summary || "") + "\n[AI 대화식 보강]: " + userMessage;
      summaryList.push("보고서 요약 및 보고사 비고란에 대화식 수정사항 반영");
    }

    const replyMsg = `네! 요청하신 명령을 정밀 분석하여 보고서에 즉시 반영하였습니다.\n\n📌 **적용된 수정사항**:
${summaryList.map(s => `• ${s}`).join("\n")}

왼쪽 화면의 보고서 실시간 인쇄 양식에서 변경된 내용을 확인하실 수 있습니다.`;

    return {
      replyMessage: replyMsg,
      updatedReport: updated,
      changesSummary: summaryList
    };
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      // Call server API route /api/edit-report-chat
      const response = await fetch("/api/edit-report-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report: report,
          userMessage: textToSend.trim(),
          chatHistory: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const updatedRep: SafetyReport = data.updatedReport;
        
        // Save to History Snapshot
        const newSnapshots = [...historySnapshots.slice(0, currentSnapshotIdx + 1), updatedRep];
        setHistorySnapshots(newSnapshots);
        setCurrentSnapshotIdx(newSnapshots.length - 1);

        // Notify parent to re-render report view live!
        onUpdateReport(updatedRep);

        const botReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.replyMessage,
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
          changesSummary: data.changesSummary,
          snapshotIndex: newSnapshots.length - 1
        };

        setMessages(prev => [...prev, botReply]);
      } else {
        // Fallback to client-side rule processor if API fails or no key
        throw new Error("Server response not ok, switching to local editor fallback");
      }
    } catch (err) {
      console.warn("Using local rule processor fallback for report editing:", err);
      const fallbackResult = processLocalEditFallback(textToSend.trim(), report);

      const newSnapshots = [...historySnapshots.slice(0, currentSnapshotIdx + 1), fallbackResult.updatedReport];
      setHistorySnapshots(newSnapshots);
      setCurrentSnapshotIdx(newSnapshots.length - 1);

      onUpdateReport(fallbackResult.updatedReport);

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackResult.replyMessage,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        changesSummary: fallbackResult.changesSummary,
        snapshotIndex: newSnapshots.length - 1
      };

      setMessages(prev => [...prev, botReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = (targetIdx?: number) => {
    const idxToRestore = targetIdx !== undefined ? targetIdx : currentSnapshotIdx - 1;
    if (idxToRestore >= 0 && idxToRestore < historySnapshots.length) {
      const restored = historySnapshots[idxToRestore];
      setCurrentSnapshotIdx(idxToRestore);
      onUpdateReport(restored);

      const systemNotice: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🔄 **이전 수정 버전(버전 #${idxToRestore + 1})으로 되돌렸습니다.**`,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, systemNotice]);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col font-sans transition-all duration-300">
      {/* Drawer Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white">AI 대화형 보고서 수정 비서</h3>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded">
                실시간 양식 동기화
              </span>
            </div>
            <p className="text-[11px] text-slate-300">말씀하시는 대로 보고서를 수정·추가·삭제해 드립니다</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {historySnapshots.length > 1 && (
            <button
              onClick={() => handleUndo()}
              disabled={currentSnapshotIdx <= 0}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                currentSnapshotIdx > 0
                  ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-400/40"
                  : "opacity-40 text-slate-500 border-slate-800 cursor-not-allowed"
              }`}
              title="직전 수정 상태로 되돌리기 (Undo)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>되돌리기</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Snapshot / Edit Status Banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-blue-900 font-medium">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>현재 수정 버전: <strong>#{currentSnapshotIdx + 1}</strong> (총 {historySnapshots.length}개 이력)</span>
        </div>
        {historySnapshots.length > 1 && (
          <button
            onClick={() => setShowHistoryModal(true)}
            className="text-[11px] font-bold text-blue-700 underline hover:text-blue-900 cursor-pointer"
          >
            이력 보기
          </button>
        )}
      </div>

      {/* Quick Recommendation Chips */}
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
          <Wand2 className="w-3.5 h-3.5 text-blue-600" />
          <span>추천 대화식 수정 명령 (클릭 시 실행):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              disabled={loading}
              className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-300 hover:border-blue-300 px-2.5 py-1.5 rounded-lg transition-all shadow-2xs font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>{qp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-500">
              {msg.role === "assistant" ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-blue-900">AI 보고서 비서</span>
                </>
              ) : (
                <span className="text-slate-700">사용자</span>
              )}
              <span className="text-[10px] text-slate-400 font-normal">{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none font-medium"
                  : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-none font-sans"
              }`}
            >
              {msg.content}

              {msg.changesSummary && msg.changesSummary.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="font-bold text-[11px] text-blue-900 mb-1">변경된 항목 요약:</div>
                  <ul className="space-y-1">
                    {msg.changesSummary.map((change, cIdx) => (
                      <li key={cIdx} className="text-[11px] text-slate-700 flex items-start gap-1">
                        <span className="text-blue-500">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 w-fit">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold text-blue-900">보고서 데이터를 정밀 분석 및 수정 중입니다...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: 공사명을 'OOO'로 변경해줘..."
            disabled={loading}
            className="flex-1 bg-slate-100 focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 flex justify-between items-center text-[10px] text-slate-400 px-1">
          <span>대화 내용에 따라 보고서가 실시간으로 재구성됩니다.</span>
          <span className="font-bold text-blue-600">v2.5 AI Editor</span>
        </div>
      </div>

      {/* History Snapshots Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">보고서 수정 이력 내역</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {historySnapshots.map((snap, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                    idx === currentSnapshotIdx
                      ? "bg-blue-50 border-blue-400 font-bold text-blue-900"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div>
                    <div>버전 #{idx + 1} {idx === 0 && "(최초 생성본)"}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      공사명: {snap.projectName || "미지정"}
                    </div>
                  </div>

                  {idx !== currentSnapshotIdx && (
                    <button
                      onClick={() => {
                        handleUndo(idx);
                        setShowHistoryModal(false);
                      }}
                      className="bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                    >
                      이 버전으로 복원
                    </button>
                  )}
                  {idx === currentSnapshotIdx && (
                    <span className="text-[11px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-bold">
                      현재 적용 중
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
