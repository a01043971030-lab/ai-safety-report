import React, { useState, useEffect, useRef } from "react";
import { 
  AccountingTransaction, 
  UserProfile, 
  SafetyReport, 
  TaxSchedule 
} from "../types";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Printer, 
  Bot, 
  Send, 
  FileText, 
  Building2, 
  Check, 
  AlertTriangle, 
  Calculator, 
  Briefcase, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  FileCheck2, 
  Lock
} from "lucide-react";

interface AccountingDashboardProps {
  currentUser: UserProfile;
  reports: SafetyReport[];
  dbStatus: "CONNECTED" | "FALLBACK" | "CONNECTING";
  // Prop callback to update user profile if needed
  onUpdateUser?: (user: UserProfile) => void;
}

export default function AccountingDashboard({
  currentUser,
  reports,
  dbStatus,
  onUpdateUser
}: AccountingDashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "LEDGER" | "BOOKKEEPING" | "SITE" | "TAX_CALC" | "CHAT">("DASHBOARD");

  // Ledger state
  const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // New transaction form state
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    vendor: "",
    businessNumber: "",
    description: "",
    amount: 0,
    supplyValue: 0,
    vat: 0,
    category: "원재료비",
    type: "지출" as "수입" | "지출",
    paymentMethod: "계좌이체" as "현금" | "계좌이체" | "카드" | "전자세금계산서" | "현금영수증",
    memo: "",
    siteName: "",
    receiptUrl: "" as string | undefined,
    receiptName: "" as string | undefined,
  });

  // Filter & Search & Sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [typeFilter, setTypeFilter] = useState("전체");
  const [siteFilter, setSiteFilter] = useState("전체");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selected ledger for bookkeeping tab
  const [selectedLedger, setSelectedLedger] = useState<string>("현금출납장");

  // Site selection for cost accounting tab
  const [selectedSite, setSelectedSite] = useState<string>("전체");

  // AI Chat Bot state
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: `안녕하세요, ${currentUser.representative || currentUser.username} 대표님! ${currentUser.companyName || "건설"}의 맞춤형 **AI 건설 세무비서**입니다. \n\n기성금 세금계산서, 장비료 매입 부가세, 현장 노무비 원천세 등 복잡한 건설 세무 및 현재 입력하신 입출금 대장에 대해 궁금한 점을 여쭤보세요. 언제든 친절히 계산 및 분석해 드리겠습니다! 🧑‍💼` }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // File reader for simulated receipt photo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardcoded tax schedules list
  const [taxSchedules] = useState<TaxSchedule[]>([
    { id: "1", date: `${new Date().getFullYear()}-07-25`, title: "제1기 부가가치세 확정신고 및 납부", description: "상반기 매출/매입 부가가치세 국세청 신고 및 납부 기한", type: "신고" },
    { id: "2", date: `${new Date().getFullYear()}-08-10`, title: "7월 귀속 원천세 신고 및 납부", description: "일용직 및 상용직 근로소득세 원천징수 납부 기한", type: "납부" },
    { id: "3", date: `${new Date().getFullYear()}-08-31`, title: "12월 결산법인 법인세 중간예납", description: "법인세 중간예납 의무 법인의 중간예납 기한", type: "중요" },
    { id: "4", date: `${new Date().getFullYear()}-10-25`, title: "제2기 부가가치세 예정신고 및 납부", description: "3분기 매출/매입 부가세 예정신고 기한", type: "신고" }
  ]);

  // Load transactions from localStorage/mock on mount
  useEffect(() => {
    const localKey = `accounting_transactions_${currentUser.username}`;
    const stored = localStorage.getItem(localKey);
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      // Seed initial mock transactions so the dashboard looks beautiful out of the box
      const mockSeed: AccountingTransaction[] = [
        {
          id: "seed-1",
          companyId: currentUser.username,
          date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-05`,
          vendor: "(주)현대제철",
          businessNumber: "120-81-12345",
          description: "옹벽 보강용 철근 D13 수급",
          amount: 11000000,
          supplyValue: 10000000,
          vat: 1000000,
          category: "원재료비",
          type: "지출",
          paymentMethod: "전자세금계산서",
          memo: "본사 승인 건",
          siteName: reports[0]?.projectName || "서울 마포구 신축 공사 현장",
          createdAt: Date.now() - 500000,
          updatedAt: Date.now() - 500000
        },
        {
          id: "seed-2",
          companyId: currentUser.username,
          date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-08`,
          vendor: "한길중장비",
          businessNumber: "105-22-98765",
          description: "터파기 굴착용 포클레인 임대료",
          amount: 2200000,
          supplyValue: 2000000,
          vat: 200000,
          category: "장비임차료",
          type: "지출",
          paymentMethod: "전자세금계산서",
          memo: "주간 작업 임대",
          siteName: reports[0]?.projectName || "서울 마포구 신축 공사 현장",
          createdAt: Date.now() - 400000,
          updatedAt: Date.now() - 400000
        },
        {
          id: "seed-3",
          companyId: currentUser.username,
          date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-10`,
          vendor: "안전제일자재",
          businessNumber: "214-11-45678",
          description: "비계 조립용 안전난간대 및 수평재 구매",
          amount: 550000,
          supplyValue: 500000,
          vat: 50000,
          category: "소모품비",
          type: "지출",
          paymentMethod: "카드",
          memo: "안전보건비 청구 예정",
          siteName: reports[0]?.projectName || "서울 마포구 신축 공사 현장",
          createdAt: Date.now() - 300000,
          updatedAt: Date.now() - 300000
        },
        {
          id: "seed-4",
          companyId: currentUser.username,
          date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-12`,
          vendor: "김반장 인력팀",
          businessNumber: "777-12-34567",
          description: "형틀목공 일용근로자 인건비",
          amount: 4500000,
          supplyValue: 4500000,
          vat: 0,
          category: "노무비",
          type: "지출",
          paymentMethod: "계좌이체",
          memo: "면세 거래, 원천세 대장 등재",
          siteName: reports[0]?.projectName || "서울 마포구 신축 공사 현장",
          createdAt: Date.now() - 200000,
          updatedAt: Date.now() - 200000
        },
        {
          id: "seed-5",
          companyId: currentUser.username,
          date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-15`,
          vendor: "한국토지주택공사",
          businessNumber: "110-82-00001",
          description: "1차 기성금 수령",
          amount: 33000000,
          supplyValue: 30000000,
          vat: 3000000,
          category: "매출액",
          type: "수입",
          paymentMethod: "전자세금계산서",
          memo: "마포 신축현장 계약금",
          siteName: reports[0]?.projectName || "서울 마포구 신축 공사 현장",
          createdAt: Date.now() - 100000,
          updatedAt: Date.now() - 100000
        }
      ];
      setTransactions(mockSeed);
      localStorage.setItem(localKey, JSON.stringify(mockSeed));
    }
  }, [currentUser.username]);

  // Scroll to bottom of AI chat window
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Save transaction utility
  const saveTransactionsToStorage = (updatedList: AccountingTransaction[]) => {
    const localKey = `accounting_transactions_${currentUser.username}`;
    localStorage.setItem(localKey, JSON.stringify(updatedList));
    setTransactions(updatedList);
  };

  // Handle amount change and auto-calculate VAT
  const handleAmountChange = (val: number) => {
    // Standard VAT calculation logic:
    // If it is standard 10% VAT, supplyValue = Round(amount / 1.1) and vat = amount - supplyValue
    // If it is non-taxable (e.g. labor cost "노무비"), VAT is 0.
    const isVatFree = form.category === "노무비" || form.category === "보험료" || form.category === "세금과공과";
    
    if (isVatFree) {
      setForm(prev => ({
        ...prev,
        amount: val,
        supplyValue: val,
        vat: 0
      }));
    } else {
      const supply = Math.round(val / 1.1);
      const computedVat = val - supply;
      setForm(prev => ({
        ...prev,
        amount: val,
        supplyValue: supply,
        vat: computedVat
      }));
    }
  };

  // Trigger Receipt Image Upload simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          receiptUrl: reader.result as string,
          receiptName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // AI-powered Category Auto Classification via Gemini API
  const handleAICategoryRecommendation = async () => {
    if (!form.vendor || !form.description) {
      alert("거래처명(vendor)과 적요(description)를 먼저 입력해 주셔야 AI가 올바르게 분류할 수 있습니다.");
      return;
    }

    try {
      setAiLoading(true);
      const res = await fetch("/api/classify-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor: form.vendor,
          description: form.description,
          amount: form.amount,
          type: form.type
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `AI 분류 실패 (${res.status})`);
      }
      
      const data = await res.json();
      
      if (data.category) {
        setForm(prev => ({
          ...prev,
          category: data.category,
          supplyValue: data.supplyValue || prev.supplyValue,
          vat: data.vat !== undefined ? data.vat : prev.vat,
          memo: `[AI 자동분류 근거]: ${data.reason}`
        }));
        alert(`✨ AI 추천 계정과목: [${data.category}]\n분류 근거: ${data.reason}`);
      }
    } catch (err) {
      console.error(err);
      // Fallback local heuristic classifier if backend errors out
      let category = "기타지출";
      let reason = "로컬 자율 매핑";
      const desc = form.description;
      const vend = form.vendor;

      if (form.type === "수입") {
        category = "매출액";
        reason = "공사 기성 대금 및 영업 수입에 부합합니다.";
      } else {
        if (desc.includes("철근") || desc.includes("레미콘") || desc.includes("시멘트") || desc.includes("자재")) {
          category = "원재료비";
          reason = "현장 주요 건축/건설 자재 매입으로 판정됩니다.";
        } else if (desc.includes("인력") || desc.includes("일용") || desc.includes("인건비") || desc.includes("작업비")) {
          category = "노무비";
          reason = "현장 노무 근로 대가로 부가세 면세 적용됩니다.";
        } else if (desc.includes("포클레인") || desc.includes("장비") || desc.includes("크레인") || desc.includes("덤프") || desc.includes("임차")) {
          category = "장비임차료";
          reason = "건설 중장비 임대 사용 건에 해당됩니다.";
        } else if (desc.includes("식대") || desc.includes("밥") || desc.includes("간식") || desc.includes("경조")) {
          category = "복리후생비";
          reason = "현장 근로자 복지 증진 지원 지출입니다.";
        } else if (desc.includes("주유") || desc.includes("기름") || desc.includes("주차") || desc.includes("유류")) {
          category = "차량유지비";
          reason = "법인 및 업무용 차량 운행 관리 지출입니다.";
        }
      }

      setForm(prev => ({
        ...prev,
        category,
        memo: `[로컬 AI분류 근거]: ${reason}`
      }));
      alert(`💡 AI 추천 계정과목: [${category}]\n근거: ${reason}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Transaction Form
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Check 체험회원 30건 제한
    if (currentUser.status === "체험회원" && transactions.length >= 30) {
      alert("⚠️ 현재 무료 체험회원은 최대 30건의 회계 전표만 입력할 수 있습니다.\n무제한 입력을 원하실 경우, 우측 상단 '정회원 승인 시뮬레이터' 또는 관리자를 통해 '정회원'으로 승인받으십시오.");
      return;
    }

    if (!form.vendor || !form.description || form.amount <= 0) {
      alert("거래처, 적요 및 올바른 합계 금액을 채워주십시오.");
      return;
    }

    const newTx: AccountingTransaction = {
      id: Math.random().toString(36).substring(2, 9),
      companyId: currentUser.username,
      date: form.date,
      vendor: form.vendor,
      businessNumber: form.businessNumber || "123-45-67890",
      description: form.description,
      amount: form.amount,
      supplyValue: form.supplyValue,
      vat: form.vat,
      category: form.category,
      type: form.type,
      paymentMethod: form.paymentMethod,
      memo: form.memo,
      siteName: form.siteName || (reports[0]?.projectName || "공용 현장"),
      receiptUrl: form.receiptUrl,
      receiptName: form.receiptName,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newTx, ...transactions];
    saveTransactionsToStorage(updated);

    // Reset Form
    setForm({
      date: new Date().toISOString().split("T")[0],
      vendor: "",
      businessNumber: "",
      description: "",
      amount: 0,
      supplyValue: 0,
      vat: 0,
      category: "원재료비",
      type: "지출",
      paymentMethod: "계좌이체",
      memo: "",
      siteName: "",
      receiptUrl: undefined,
      receiptName: undefined
    });

    alert("새 회계 전표가 승인 기록되었습니다!");
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    if (!confirm("해당 거래 내역을 삭제하시겠습니까? 관련 모든 장부 및 통계에서 즉시 지워집니다.")) return;
    const updated = transactions.filter(t => t.id !== id);
    saveTransactionsToStorage(updated);
  };

  // -----------------------------------------------------
  // METRICS & COMPUTED AGGREGATIONS
  // -----------------------------------------------------
  const now = new Date();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, "0");
  const currentYearStr = String(now.getFullYear());

  // Filter for current month's transactions
  const currentMonthTxs = transactions.filter(t => {
    const parts = t.date.split("-");
    return parts[0] === currentYearStr && parts[1] === currentMonthStr;
  });

  // 1. 이번달 수입 / 지출 / 손익
  const thisMonthIncome = currentMonthTxs.filter(t => t.type === "수입").reduce((sum, t) => sum + t.amount, 0);
  const thisMonthExpense = currentMonthTxs.filter(t => t.type === "지출").reduce((sum, t) => sum + t.amount, 0);
  const thisMonthProfit = thisMonthIncome - thisMonthExpense;

  // 2. 부가세 예상 (매출 부가세 - 매입 부가세)
  const salesVat = transactions.filter(t => t.type === "수입").reduce((sum, t) => sum + t.vat, 0);
  const purchaseVat = transactions.filter(t => t.type === "지출").reduce((sum, t) => sum + t.vat, 0);
  const estimatedVat = Math.max(0, salesVat - purchaseVat);

  // 3. 법인세 예상 (당해 연도 예상 수익에 대한 구간 세율 적용)
  // 단순 예시: 당기순이익의 9% 적용 (2억원 이하 9%, 초과분 19%)
  const totalIncome = transactions.filter(t => t.type === "수입").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "지출").reduce((sum, t) => sum + t.amount, 0);
  const netIncomeYtd = Math.max(0, totalIncome - totalExpense);
  const estimatedCorporateTax = netIncomeYtd <= 200000000 
    ? Math.round(netIncomeYtd * 0.09) 
    : Math.round(18000000 + (netIncomeYtd - 200000000) * 0.19);

  // 4. 미수금 (매출액 중 전자세금계산서 등으로 수령되지 않거나 메모에 '미수'가 들어간 금액 추정)
  // 예시: 매출 카테고리 중 결제방법이 전자세금계산서이면서 메모/적요에 '미수', '미지급' 등이 기재되었거나 수령 전인 상태
  const receivables = transactions
    .filter(t => t.type === "수입" && (t.memo.includes("미수") || t.description.includes("미수") || t.memo.includes("기성대기")))
    .reduce((sum, t) => sum + t.amount, 0);

  // 5. 미지급금
  const payables = transactions
    .filter(t => t.type === "지출" && (t.memo.includes("외상") || t.description.includes("미지급") || t.memo.includes("미결제") || t.paymentMethod === "전자세금계산서" && t.memo.includes("청구")))
    .reduce((sum, t) => sum + t.amount, 0);

  // 6. 현금 및 예금잔액 추산
  // 기초잔액을 현금 1,000만원, 예금 5,000만원으로 가정하고 가감
  const cashFlowIn = transactions.filter(t => t.type === "수입" && t.paymentMethod === "현금").reduce((sum, t) => sum + t.amount, 0);
  const cashFlowOut = transactions.filter(t => t.type === "지출" && t.paymentMethod === "현금").reduce((sum, t) => sum + t.amount, 0);
  const cashBalance = 10000000 + cashFlowIn - cashFlowOut;

  const depositFlowIn = transactions.filter(t => t.type === "수입" && t.paymentMethod === "계좌이체").reduce((sum, t) => sum + t.amount, 0);
  const depositFlowOut = transactions.filter(t => t.type === "지출" && (t.paymentMethod === "계좌이체" || t.paymentMethod === "전자세금계산서")).reduce((sum, t) => sum + t.amount, 0);
  const depositBalance = 50000000 + depositFlowIn - depositFlowOut;

  // -----------------------------------------------------
  // FILTERING THE TRANSACTIONS TABLE
  // -----------------------------------------------------
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = 
      t.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.memo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "전체" || t.category === categoryFilter;
    const matchesType = typeFilter === "전체" || t.type === typeFilter;
    const matchesSite = siteFilter === "전체" || t.siteName === siteFilter;

    return matchesSearch && matchesCategory && matchesType && matchesSite;
  }).sort((a, b) => {
    if (sortField === "date") {
      return sortOrder === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    } else {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  // Get distinct categories in database
  const allCategories = ["전체", "원재료비", "노무비", "장비임차료", "급여", "차량유지비", "소모품비", "보험료", "수도광열비", "지급임차료", "복리후생비", "세금과공과", "매출액", "기타지출", "기타수입"];

  // Unique siteNames linked to current user
  const uniqueSites = ["전체", ...Array.from(new Set(transactions.map(t => t.siteName).filter(Boolean)))];

  // Helper formatting currency
  const formatKRW = (num: number) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(num).replace("₩", "￦ ");
  };

  // Helper formatting numbers
  const formatNum = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num);
  };

  // Bookkeeping ledgers generation
  const getLedgerTitle = () => `${currentUser.companyName} - [${selectedLedger}]`;

  // -----------------------------------------------------
  // CHAT BOT QUESTION SUBMIT
  // -----------------------------------------------------
  const handleChatQuestion = async (prefilledText?: string) => {
    const question = prefilledText || chatInput;
    if (!question.trim()) return;

    const userMsg = { role: "user" as const, content: question };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/tax-assistant-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          ledger: transactions,
          companyInfo: currentUser
        })
      });

      if (!res.ok) throw new Error("AI 응답 실패");
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.content }]);
    } catch (err) {
      console.error(err);
      // Clever local fallback answering based on actual metrics calculated!
      let reply = "";
      if (question.includes("부가세")) {
        reply = `현재 회계 대장에 등재된 이번달 예상 환급/납부 부가가치세는 약 **${formatKRW(estimatedVat)}**입니다. (매출 부가세: ${formatNum(salesVat)}원 - 매입 부가세: ${formatNum(purchaseVat)}원)\n\n매출 거래 시 공급가액의 10%가 매출세액이 되고, 세금계산서나 카드로 적법하게 매입한 거래의 10%가 매입세액 공제됩니다. 철근자재비 및 중장비료 등 세금계산서 매입분을 반드시 누락 없이 세무 전표에 기재하셔야 손해를 방지하실 수 있습니다.`;
      } else if (question.includes("미수금")) {
        reply = `현재 미수금 대장 조회 결과, 총 **${formatKRW(receivables)}**의 기성 대금 미수채권이 관찰되고 있습니다. 건설 도급계약 및 기성 검사 완료 후 세금계산서가 공급되었으나 입금 결제가 대기 중인 것으로 판명되므로, 발주처 공무 담당 부서와 신속한 정산 집행 협의를 권고드립니다.`;
      } else if (question.includes("적자") || question.includes("수익") || question.includes("손익")) {
        reply = `이번 달 ${currentMonthStr}월 기준 종합 재정 보고입니다. 수입 총액은 **${formatKRW(thisMonthIncome)}**이며, 지출 원가 총액은 **${formatKRW(thisMonthExpense)}**입니다. 따라서 금월 종합 순손익은 **${formatKRW(thisMonthProfit)}**으로 ${thisMonthProfit >= 0 ? "흑자" : "적자"} 상태입니다. 현장 자재 수급율 및 노무 배치를 조율하여 이익율 보완이 요구됩니다.`;
      } else if (question.includes("노무비") || question.includes("인건비")) {
        const labor = transactions.filter(t => t.category === "노무비").reduce((sum, t) => sum + t.amount, 0);
        reply = `현재 등록된 노무비(인건비) 총계는 **${formatKRW(labor)}**입니다. 일용직 노무 인력 원천징수 신고(원천세 3.3% 또는 일용근로소득 지급명세서 국세청 매월 제출) 의무가 부과되오니, 작업반장 대장과 매칭하여 세무 신고 패킷을 구성하시길 바랍니다.`;
      } else {
        reply = `대표님, 건설 세무회계 기준에 의거하여 질문하신 "${question}"에 대한 자문입니다.\n\n현재 총 ${transactions.length}건의 실시간 건설 대장을 분석해 본 결과, 당해 연도 누적 당기순이익은 약 **${formatKRW(netIncomeYtd)}**이며 이에 따른 임시 법인세 추산액은 약 **${formatKRW(estimatedCorporateTax)}**입니다.\n\n구체적인 매입자료 정리가 진행되면 경비 인정 한도가 상향되어 최종 세액은 대폭 감면 가능성이 높습니다. 추가적으로 장부 증빙이나 자재 적요를 더 상세히 입력해 주시면 고도화된 정밀 세무 진단이 가능해집니다.`;
      }
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Quick Questions
  const quickQuestions = [
    "이번달 종합 수입과 지출, 손익은 적자인가요?",
    "예상 환급받거나 납부할 부가세는 얼마인가요?",
    "회사의 미수금과 미지급 채권 상태를 요약해 줘.",
    "등록된 노무비(인건비) 규모와 원천세 가이드는?"
  ];

  // -----------------------------------------------------
  // EXPORTS & PRINTS (Mocked beautifully)
  // -----------------------------------------------------
  const handlePrintLedger = () => {
    window.print();
  };

  const handleExcelExport = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "날짜,구분,거래처,사업자번호,적요,계정과목,공급가액,부가세,총합금액,결제방법,메모,현장명\n";
    transactions.forEach(t => {
      csvContent += `"${t.date}","${t.type}","${t.vendor}","${t.businessNumber}","${t.description}","${t.category}",${t.supplyValue},${t.vat},${t.amount},"${t.paymentMethod}","${t.memo}","${t.siteName}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${currentUser.companyName}_세무회계대장_내역서_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("엑셀 호환 CSV 세무 보고서 대장이 성공적으로 저장되었습니다!");
  };

  const handleWordExport = () => {
    // Generate an elegant HTML doc suitable for Word opening
    const title = `${currentUser.companyName}_건설_세무회계_장부_보고서.doc`;
    const ledgerRows = transactions.map((t, idx) => `
      <tr>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${idx + 1}</td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${t.date}</td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px; font-weight: bold; color: ${t.type === '수입' ? '#16a34a' : '#dc2626'}">${t.type}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px;">${t.vendor}</td>
        <td style="border: 1px solid #cbd5e1; padding: 6px;">${t.description}</td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${t.category}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 6px; font-family: monospace;">${formatNum(t.supplyValue)}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 6px; font-family: monospace;">${formatNum(t.vat)}</td>
        <td style="text-align: right; border: 1px solid #cbd5e1; padding: 6px; font-family: monospace; font-weight: bold;">${formatNum(t.amount)}</td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${t.paymentMethod}</td>
      </tr>
    `).join("");

    const wordHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; line-height: 1.6; color: #1e293b; }
          h1 { text-align: center; font-size: 24pt; color: #0f172a; margin-top: 50px; }
          h2 { font-size: 16pt; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #f1f5f9; font-weight: bold; border: 1px solid #94a3b8; padding: 8px; font-size: 10pt; }
        </style>
      </head>
      <body>
        <h1>건 설 세 무 회 계 자 료 명 세 서</h1>
        <p style="text-align: right; font-size: 10pt; color: #64748b;">작성기관: ${currentUser.companyName} | 대표자: ${currentUser.representative}</p>
        <p style="text-align: right; font-size: 10pt; color: #64748b;">출력일시: ${new Date().toLocaleString()}</p>
        
        <h2>1. 당해 재정 요약 보고</h2>
        <table style="width: 100%; border: 1px solid #cbd5e1; border-collapse: collapse;">
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid #cbd5e1; padding: 8px;">이번달 총 수입</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px;">이번달 총 지출</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px;">이번달 총 손익</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px;">예상 부가세 납부액</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px;">예상 법인세 납부액</th>
          </tr>
          <tr>
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; color: #16a34a;">${formatNum(thisMonthIncome)}원</td>
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; color: #dc2626;">${formatNum(thisMonthExpense)}원</td>
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; color: ${thisMonthProfit >= 0 ? '#16a34a' : '#dc2626'};">${formatNum(thisMonthProfit)}원</td>
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; color: #3b82f6;">${formatNum(estimatedVat)}원</td>
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; color: #a855f7;">${formatNum(estimatedCorporateTax)}원</td>
          </tr>
        </table>

        <h2>2. 세무 전표 거래 전체 내역</h2>
        <table>
          <thead>
            <tr>
              <th>번호</th>
              <th>날짜</th>
              <th>구분</th>
              <th>거래처</th>
              <th>적요</th>
              <th>계정과목</th>
              <th>공급가액</th>
              <th>부가세</th>
              <th>합계금액</th>
              <th>결제방법</th>
            </tr>
          </thead>
          <tbody>
            ${ledgerRows}
          </tbody>
        </table>
        
        <p style="margin-top: 40px; text-align: center; font-size: 10pt; color: #94a3b8; font-weight: bold;">
          ※ 본 대장은 AI 안전점검 보고서 시스템 세무회계엔진에 의해 생성되었습니다. 국세청 정식 제출 전 담당 세무전문가의 감수를 받으십시오.
        </p>
      </body>
      </html>
    `;

    const blob = new Blob([wordHtml], { type: "application/msword;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("한글 및 MS Word 호환 세무 결산 보고서 작성이 완성되었습니다!");
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4" id="accounting-cockpit-container">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 rounded-3xl text-white p-6 md:p-8 relative overflow-hidden shadow-2xl border border-slate-800 mb-8 print:hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl space-y-3 relative z-10">
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/30 tracking-widest inline-flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            AI TAX & ACCOUNTING INTEGRATED SUITE
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight flex items-center gap-2">
            AI 건설 세무 · 회계 통합 관리 Cockpit
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-300 font-light leading-relaxed">
            건설기술진흥법 보고서 공정 관리와 긴밀하게 연동된 원스톱 세무 시스템입니다. 복잡한 매입 자재비 계정과목 AI 자동 매핑, 건설 일용직 인건비(노무비) 원천세 보조 계산, 현장별 이익율 분석, 국세청 신고 패킷을 모두 총괄 지원합니다.
          </p>
        </div>

        {/* Membership status badge */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
            currentUser.status === "정회원" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
            currentUser.status === "정회원 승인대기" ? "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse" :
            "bg-blue-500/20 text-blue-300 border border-blue-500/30"
          }`}>
            등급: {currentUser.status}
          </span>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-1 no-scrollbar print:hidden">
        <button
          onClick={() => setActiveTab("DASHBOARD")}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 border-b-2 ${
            activeTab === "DASHBOARD"
              ? "border-blue-600 bg-white text-blue-600 font-extrabold shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          메인 Dashboard
        </button>

        <button
          onClick={() => setActiveTab("LEDGER")}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 border-b-2 ${
            activeTab === "LEDGER"
              ? "border-blue-600 bg-white text-blue-600 font-extrabold shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Plus className="w-4 h-4" />
          입출금 전표 및 전표 입력
          {currentUser.status === "체험회원" && (
            <span className="text-[9px] bg-blue-100 text-blue-700 font-mono px-1.5 py-0.5 rounded-full font-bold ml-1">
              {transactions.length}/30
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("BOOKKEEPING")}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 border-b-2 ${
            activeTab === "BOOKKEEPING"
              ? "border-blue-600 bg-white text-blue-600 font-extrabold shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          자동 회계 장부
        </button>

        <button
          onClick={() => setActiveTab("SITE")}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 border-b-2 ${
            activeTab === "SITE"
              ? "border-blue-600 bg-white text-blue-600 font-extrabold shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          건설현장별 원가 회계
        </button>

        <button
          onClick={() => setActiveTab("TAX_CALC")}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 border-b-2 ${
            activeTab === "TAX_CALC"
              ? "border-blue-600 bg-white text-blue-600 font-extrabold shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Calculator className="w-4 h-4" />
          부가세 · 법인세 계산기
        </button>

        <button
          onClick={() => setActiveTab("CHAT")}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 border-b-2 relative ${
            activeTab === "CHAT"
              ? "border-blue-600 bg-white text-blue-600 font-extrabold shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-500" />
          AI 세무비서 Chat
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </button>
      </div>


      {/* 3. Tab Contents */}

      {/* TAB A: MAIN DASHBOARD */}
      {activeTab === "DASHBOARD" && (
        <div className="space-y-8 animate-fade-in">
          
          {/* 9 Core Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-4">
            
            {/* 1. 이번달 수입 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-400 transition-colors flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                이번달 수입
              </div>
              <div className="text-sm font-extrabold text-emerald-600">
                {formatNum(thisMonthIncome)}원
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold">{currentMonthStr}월 실적 기준</div>
            </div>

            {/* 2. 이번달 지출 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-red-400 transition-colors flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                이번달 지출
              </div>
              <div className="text-sm font-extrabold text-red-600">
                {formatNum(thisMonthExpense)}원
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold">현장 경비 및 노무비</div>
            </div>

            {/* 3. 이번달 손익 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-400 transition-colors flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                이번달 손익
              </div>
              <div className={`text-sm font-extrabold ${thisMonthProfit >= 0 ? "text-blue-600" : "text-red-500"}`}>
                {thisMonthProfit >= 0 ? "+" : ""}{formatNum(thisMonthProfit)}원
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold">당월 종합 순수익</div>
            </div>

            {/* 4. 부가세 예상 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-indigo-400 transition-colors flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                부가세 예상
              </div>
              <div className="text-sm font-extrabold text-indigo-600">
                {formatNum(estimatedVat)}원
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold">누적 매입-매출 공제액</div>
            </div>

            {/* 5. 예상 법인세 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-purple-400 transition-colors flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-purple-500" />
                예상 법인세
              </div>
              <div className="text-sm font-extrabold text-purple-600">
                {formatNum(estimatedCorporateTax)}원
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold">연적용 (수익률 9% 기준)</div>
            </div>

            {/* 6. 미수금 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-amber-400 transition-colors flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                미수금 (매출채권)
              </div>
              <div className="text-sm font-extrabold text-amber-600">
                {formatNum(receivables)}원
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold">기성 수령 전 잔액</div>
            </div>

            {/* 7. 미지급금 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-pink-400 transition-colors flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-pink-500" />
                미지급금 (채무)
              </div>
              <div className="text-sm font-extrabold text-pink-600">
                {formatNum(payables)}원
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold">미지급 가설재/외주대금</div>
            </div>

            {/* 8. 현금 잔액 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-teal-400 transition-colors flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-500" />
                현금 금고잔액
              </div>
              <div className="text-sm font-extrabold text-teal-600">
                {formatNum(cashBalance)}원
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold">현금출납장 정산 시재</div>
            </div>

            {/* 9. 예금 잔액 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-400 transition-colors flex flex-col justify-between">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                보통예금 시재
              </div>
              <div className="text-sm font-extrabold text-blue-600 font-mono">
                {formatNum(depositBalance)}원
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold">보통예금 통장 잔고추산</div>
            </div>

          </div>

          {/* Graphical Section: Responsive Interactive SVG Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SVG Chart 1: Monthly Cash Flow (수입 vs 지출) (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 rounded-full bg-blue-600"></span>
                  당월 재정 입출금 흐름 비교 (수입 vs 지출)
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">단위: 원</span>
              </div>

              {/* Pure SVG Bar Chart (Extremely stable, pixel-perfect, responsive) */}
              <div className="h-64 flex items-end justify-around relative pt-8 px-4 border-b border-slate-200 pb-1">
                {/* Grid Lines */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-slate-100"></div>
                <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-slate-100"></div>
                <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-slate-100"></div>

                {/* Bar 1: 수입 */}
                <div className="flex flex-col items-center w-1/4 group relative z-10">
                  <div className="text-[10px] text-slate-400 font-extrabold mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white rounded px-2 py-1 absolute -top-8">
                    {formatNum(thisMonthIncome)}원
                  </div>
                  <div 
                    className="w-12 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-500 shadow-md group-hover:scale-x-105 group-hover:brightness-105"
                    style={{ height: `${thisMonthIncome > 0 ? Math.max(15, Math.min(200, (thisMonthIncome / Math.max(thisMonthIncome, thisMonthExpense)) * 200)) : 10}px` }}
                  ></div>
                  <span className="text-[11px] font-extrabold text-slate-700 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    총 수입 ({currentMonthStr}월)
                  </span>
                </div>

                {/* Bar 2: 지출 */}
                <div className="flex flex-col items-center w-1/4 group relative z-10">
                  <div className="text-[10px] text-slate-400 font-extrabold mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white rounded px-2 py-1 absolute -top-8">
                    {formatNum(thisMonthExpense)}원
                  </div>
                  <div 
                    className="w-12 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all duration-500 shadow-md group-hover:scale-x-105 group-hover:brightness-105"
                    style={{ height: `${thisMonthExpense > 0 ? Math.max(15, Math.min(200, (thisMonthExpense / Math.max(thisMonthIncome, thisMonthExpense)) * 200)) : 10}px` }}
                  ></div>
                  <span className="text-[11px] font-extrabold text-slate-700 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    총 지출 ({currentMonthStr}월)
                  </span>
                </div>

                {/* Bar 3: 순손익 */}
                <div className="flex flex-col items-center w-1/4 group relative z-10">
                  <div className="text-[10px] text-slate-400 font-extrabold mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white rounded px-2 py-1 absolute -top-8">
                    {formatNum(thisMonthProfit)}원
                  </div>
                  <div 
                    className={`w-12 rounded-t-lg transition-all duration-500 shadow-md group-hover:scale-x-105 ${
                      thisMonthProfit >= 0 
                        ? "bg-gradient-to-t from-blue-500 to-blue-400" 
                        : "bg-gradient-to-t from-rose-600 to-rose-400"
                    }`}
                    style={{ height: `${Math.abs(thisMonthProfit) > 0 ? Math.max(15, Math.min(200, (Math.abs(thisMonthProfit) / Math.max(thisMonthIncome, thisMonthExpense)) * 200)) : 10}px` }}
                  ></div>
                  <span className="text-[11px] font-extrabold text-slate-700 mt-2 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${thisMonthProfit >= 0 ? 'bg-blue-500' : 'bg-rose-500'}`}></span>
                    종합 손익
                  </span>
                </div>

              </div>
              <p className="text-[11px] text-slate-500 text-center mt-4">
                ※ 대장에 기록된 금월 실제 수입/지출을 실시간 합산하여 산출한 시각 분석 리포트입니다. (마우스 호버 시 상세 금액 표시)
              </p>
            </div>

            {/* Tax Schedule List (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  대표님을 위한 {new Date().getFullYear()} 세무 일정 알림
                </h3>
                
                <div className="space-y-3">
                  {taxSchedules.map(s => {
                    const isPassed = new Date(s.date) < new Date();
                    return (
                      <div key={s.id} className="flex gap-3 text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                        <div className="text-[10px] font-mono text-slate-400 pt-0.5 font-bold shrink-0">{s.date.substring(5)}</div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 text-[8px] rounded font-bold ${
                              s.type === "신고" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                              s.type === "납부" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                              "bg-red-50 text-red-600 border border-red-200"
                            }`}>
                              {s.type}
                            </span>
                            <span className={`font-extrabold ${isPassed ? "text-slate-400 line-through" : "text-slate-800"}`}>{s.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">{s.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[11px] text-slate-500 leading-normal mt-4 flex gap-2">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p>기한 내에 신고하지 않을 경우 가산세가 부과되오니 국세청 홈택스 일정을 확인해 주시길 당부드립니다.</p>
              </div>
            </div>

          </div>

          {/* Recent Transactions list */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                최근 작성 세무 전표 거래 내역 (최근 5건)
              </h3>
              <button 
                onClick={() => setActiveTab("LEDGER")}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
              >
                전표 추가 및 전체보기 →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="p-3 font-extrabold text-center">날짜</th>
                    <th className="p-3 font-extrabold text-center">구분</th>
                    <th className="p-3 font-extrabold">거래처</th>
                    <th className="p-3 font-extrabold">적요</th>
                    <th className="p-3 font-extrabold text-center">계정과목</th>
                    <th className="p-3 font-extrabold text-right">총 금액</th>
                    <th className="p-3 font-extrabold text-center">결제방법</th>
                    <th className="p-3 font-extrabold">연동 현장명</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map(t => (
                    <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="p-3 text-center text-slate-500 font-bold">{t.date}</td>
                      <td className="p-3 text-center">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          t.type === "수입" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{t.vendor}</td>
                      <td className="p-3 text-slate-600 truncate max-w-[150px]" title={t.description}>{t.description}</td>
                      <td className="p-3 text-center text-slate-600">{t.category}</td>
                      <td className={`p-3 text-right font-extrabold ${t.type === '수입' ? 'text-green-600' : 'text-slate-800'}`}>
                        {formatKRW(t.amount)}
                      </td>
                      <td className="p-3 text-center text-slate-500">{t.paymentMethod}</td>
                      <td className="p-3 text-slate-400 truncate max-w-[150px]" title={t.siteName}>{t.siteName || "-"}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                        기록된 거래가 존재하지 않습니다. 먼저 전표를 입력하십시오.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}


      {/* TAB B: TRANSACTION INPUT & LEDGER LIST */}
      {activeTab === "LEDGER" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* LEFT: 1. Input Transaction Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-blue-600 font-extrabold">NEW TRANSACTION</span>
                <h3 className="text-sm font-extrabold text-slate-900">신규 세무 입출금 전표 발행</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">※ 실시간 연계</span>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">거래일자 *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">입출 구분 *</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300">
                    <button
                      type="button"
                      onClick={() => setForm({...form, type: "지출"})}
                      className={`py-1.5 rounded-lg text-center font-bold transition-all cursor-pointer ${
                        form.type === "지출" 
                          ? "bg-red-500 text-white shadow" 
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      지출
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({...form, type: "수입"})}
                      className={`py-1.5 rounded-lg text-center font-bold transition-all cursor-pointer ${
                        form.type === "수입" 
                          ? "bg-green-500 text-white shadow" 
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      수입
                    </button>
                  </div>
                </div>
              </div>

              {/* Vendor & Business Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">거래처 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 현대제철"
                    value={form.vendor}
                    onChange={(e) => setForm({...form, vendor: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">사업자번호</label>
                  <input
                    type="text"
                    placeholder="예: 120-81-12345"
                    value={form.businessNumber}
                    onChange={(e) => setForm({...form, businessNumber: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Description (적요) */}
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">적요 (상세 거래 내용) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="예: 서울 마포구 옹벽 철근 자재대 대금 결제"
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 pr-14 font-semibold text-slate-800 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAICategoryRecommendation}
                    disabled={aiLoading}
                    className="absolute right-1.5 top-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow cursor-pointer active:scale-95 disabled:bg-blue-300"
                  >
                    {aiLoading ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                    )}
                    AI 분류
                  </button>
                </div>
              </div>

              {/* Amount, Supply Value, VAT */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">총 합계금액 *</label>
                  <input
                    type="number"
                    required
                    value={form.amount || ""}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">공급가액</label>
                  <input
                    type="number"
                    readOnly
                    value={form.supplyValue || ""}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">부가가치세</label>
                  <input
                    type="number"
                    readOnly
                    value={form.vat || ""}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Account Category */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">계정과목 추천/선택</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="원재료비">원재료비 (철근, 레미콘 등)</option>
                    <option value="노무비">노무비 (일용근로 인건비)</option>
                    <option value="장비임차료">장비임차료 (크레인, 포클레인)</option>
                    <option value="급여">급여 (임직원 급여)</option>
                    <option value="외주비">외주비 (하도급 공사)</option>
                    <option value="차량유지비">차량유지비 (업무용 주유/수리)</option>
                    <option value="소모품비">소모품비 (안전용품, 용지)</option>
                    <option value="보험료">보험료 (고용산재, 보증증권)</option>
                    <option value="수도광열비">수도광열비 (가설전력, 수도)</option>
                    <option value="지급임차료">지급임차료 (현장사무실 임차)</option>
                    <option value="여비교통비">여비교통비 (출장, 통행료)</option>
                    <option value="복리후생비">복리후생비 (근로자식대, 복지)</option>
                    <option value="세금과공과">세금과공과 (협회비, 과태료)</option>
                    <option value="매출액">매출액 (수입: 기성수령액)</option>
                    <option value="기타지출">기타지출</option>
                    <option value="기타수입">기타수입 (수입)</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">결제수단 / 증빙유형</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({...form, paymentMethod: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="계좌이체">계좌이체 (무통장)</option>
                    <option value="전자세금계산서">전자세금계산서</option>
                    <option value="카드">법인/개인 신용카드</option>
                    <option value="현금영수증">현금영수증</option>
                    <option value="현금">현금 시재 지출</option>
                  </select>
                </div>
              </div>

              {/* Linked siteName */}
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">연동할 건설안전 점검 현장 (보고서 기준)</label>
                <select
                  value={form.siteName}
                  onChange={(e) => setForm({...form, siteName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="">공용 관리 현장 (현장 미지정)</option>
                  {reports.map(r => (
                    <option key={r.id} value={r.projectName}>{r.projectName}</option>
                  ))}
                </select>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">메모 및 전표 부기사항</label>
                <textarea
                  placeholder="추가 세무상 비고사항 입력..."
                  value={form.memo}
                  onChange={(e) => setForm({...form, memo: e.target.value})}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Receipt File Upload */}
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {form.receiptUrl ? (
                  <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl">
                    <span className="text-[10px] font-bold text-blue-600 truncate max-w-[200px]">{form.receiptName || "영수증 이미지 첨부완료"}</span>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, receiptUrl: undefined, receiptName: undefined }))}
                      className="text-[10px] text-red-500 font-bold"
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    영수증 사진/세금계산서 PDF 첨부
                  </button>
                )}
                <p className="text-[9px] text-slate-400 mt-1">드래그 앤 드롭 또는 클릭하여 이미지/파일 선택</p>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg transition-colors cursor-pointer flex justify-center items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                회계 전표 공식 승인 및 장부 기장
              </button>

            </form>
          </div>

          {/* RIGHT: 2. Spreadsheet view of Transactions with Filters (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                실시간 세무 회계 대장 (전표 {filteredTxs.length}건 검색됨)
              </h3>
              
              <div className="flex gap-1">
                <button
                  onClick={handleExcelExport}
                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Excel 내보내기
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-semibold text-slate-600">
              
              {/* Filter: Search */}
              <div className="col-span-2 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="거래처, 적요로 고속 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white text-xs text-slate-700"
                />
              </div>

              {/* Filter: Categories */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="전체">분야별: 전체</option>
                  {allCategories.filter(c => c !== "전체").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Filter: Type */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="전체">구분: 전체</option>
                  <option value="수입">수입만</option>
                  <option value="지출">지출만</option>
                </select>
              </div>

            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse min-w-[700px] font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold">
                    <th className="p-2.5 text-center w-24">날짜</th>
                    <th className="p-2.5 text-center w-14">구분</th>
                    <th className="p-2.5">거래처</th>
                    <th className="p-2.5">적요</th>
                    <th className="p-2.5 text-center">계정과목</th>
                    <th className="p-2.5 text-right">금액</th>
                    <th className="p-2.5 text-center w-20">지불수단</th>
                    <th className="p-2.5 text-center w-12">지우기</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTxs.map(t => (
                    <tr key={t.id} className="border-b border-slate-150 hover:bg-slate-50/50">
                      <td className="p-2.5 text-center text-slate-500 font-bold">{t.date}</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-1 rounded text-[10px] font-extrabold ${
                          t.type === '수입' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 truncate max-w-[120px]" title={t.vendor}>
                        {t.vendor}
                      </td>
                      <td className="p-2.5 text-slate-600 truncate max-w-[150px]" title={t.description}>
                        {t.description}
                      </td>
                      <td className="p-2.5 text-center text-slate-500">{t.category}</td>
                      <td className={`p-2.5 text-right font-bold ${t.type === '수입' ? 'text-green-600' : 'text-slate-800'}`}>
                        {formatNum(t.amount)}
                      </td>
                      <td className="p-2.5 text-center text-slate-400">{t.paymentMethod}</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(t.id!)}
                          className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTxs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        검색 조건에 맞는 입출금 내역이 존재하지 않습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Trial count warning banner for 체험회원 */}
            {currentUser.status === "체험회원" && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-900 font-bold">
                <div className="flex gap-2 items-center">
                  <span className="text-base">🎁</span>
                  <span>현재 체험회원 혜택으로 전표 입력을 총 30건까지 제공합니다. (현재 {transactions.length}/30건 등록)</span>
                </div>
                <span className="bg-blue-100 px-2 py-1 rounded border border-blue-300 font-mono">무제한 승인대기</span>
              </div>
            )}

          </div>

        </div>
      )}


      {/* TAB C: AUTOMATED LEDGERS & BOOKKEEPING STATEMENT */}
      {activeTab === "BOOKKEEPING" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
          
          <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-blue-600 font-extrabold">AUTOMATED REALTIME BOOKS</span>
              <h2 className="text-lg font-extrabold text-slate-900">건설 표준 복식 회계장부 자동 편성</h2>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                onClick={handleExcelExport}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                장부 Excel 다운로드
              </button>
              <button
                onClick={handleWordExport}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-500" />
                결산 Word 보고서
              </button>
              <button
                onClick={handlePrintLedger}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                장부 출력 (인쇄/PDF)
              </button>
            </div>
          </div>

          {/* Bookkeeping sub-tabs */}
          <div className="flex flex-wrap border-b border-slate-200 text-xs font-extrabold text-slate-500 gap-1 print:hidden">
            {["현금출납장", "보통예금장", "매입매출장", "매출장", "총계정원장", "거래처원장", "계정별원장", "월별 수입지출표", "손익계산서", "시산표"].map(bName => (
              <button
                key={bName}
                onClick={() => setSelectedLedger(bName)}
                className={`px-4 py-2 rounded-t-lg transition-all border-b-2 ${
                  selectedLedger === bName 
                    ? "border-blue-600 bg-blue-50/50 text-blue-600 font-extrabold" 
                    : "border-transparent hover:text-slate-800"
                }`}
              >
                {bName}
              </button>
            ))}
          </div>

          {/* Render Book Table based on selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 border-l-4 border-blue-600 pl-2">
                {getLedgerTitle()} 명세
              </h3>
              <span className="text-[10px] text-slate-400 font-mono font-bold">국세청 ERP 연동표준규격</span>
            </div>

            {/* Simulated spreadsheet representation */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse min-w-[750px] font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold">
                    <th className="p-3 text-center">번호</th>
                    <th className="p-3 text-center">일자</th>
                    <th className="p-3 text-center">구분</th>
                    <th className="p-3">계정과목</th>
                    <th className="p-3">거래처명</th>
                    <th className="p-3">적요 (세무비고)</th>
                    <th className="p-3 text-right">공급가액</th>
                    <th className="p-3 text-right">부가세</th>
                    <th className="p-3 text-right">합계잔액</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => {
                      if (selectedLedger === "현금출납장") return t.paymentMethod === "현금";
                      if (selectedLedger === "보통예금장") return t.paymentMethod === "계좌이체" || t.paymentMethod === "전자세금계산서";
                      if (selectedLedger === "매입매출장") return true;
                      if (selectedLedger === "매출장") return t.type === "수입";
                      if (selectedLedger === "총계정원장" || selectedLedger === "계정별원장") return true;
                      if (selectedLedger === "거래처원장") return t.vendor !== "";
                      return true;
                    })
                    .map((t, idx) => (
                      <tr key={t.id || idx} className="border-b border-slate-100 hover:bg-slate-50/30">
                        <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="p-3 text-center font-bold text-slate-600">{t.date}</td>
                        <td className="p-3 text-center">
                          <span className={`px-1 py-0.5 text-[9px] rounded font-extrabold ${
                            t.type === '수입' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{t.category}</td>
                        <td className="p-3 font-semibold text-slate-700">{t.vendor}</td>
                        <td className="p-3 text-slate-500 truncate max-w-[200px]" title={t.description}>{t.description}</td>
                        <td className="p-3 text-right text-slate-600">{formatNum(t.supplyValue)}</td>
                        <td className="p-3 text-right text-slate-600">{formatNum(t.vat)}</td>
                        <td className={`p-3 text-right font-extrabold ${t.type === '수입' ? 'text-green-600' : 'text-slate-900'}`}>{formatNum(t.amount)}</td>
                      </tr>
                    ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-slate-400 font-bold">
                        대장에 등록된 전표 내역이 없습니다. 먼저 입출금 전표를 추가하십시오.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Statement Summary panel inside Bookkeeping */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-[10px] text-slate-400 font-bold">TOTAL REVENUE (누적 매출액)</span>
                <div className="text-xl font-extrabold text-green-400">{formatKRW(totalIncome)}</div>
                <p className="text-[9px] text-slate-500 mt-1">전자세금계산서 발행 및 수입 총액</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold">TOTAL OPERATING COST (누적 원가지출)</span>
                <div className="text-xl font-extrabold text-red-400">{formatKRW(totalExpense)}</div>
                <p className="text-[9px] text-slate-500 mt-1">자재비, 노무비, 임차료 등 원가 합산</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold">ACCUMULATED NET INCOME (YTD 당기순이익)</span>
                <div className={`text-xl font-extrabold ${netIncomeYtd >= 0 ? "text-blue-400" : "text-rose-500"}`}>
                  {formatKRW(netIncomeYtd)}
                </div>
                <p className="text-[9px] text-slate-500 mt-1">종합 소득세 / 법인세 과세 표준 과표 대상</p>
              </div>
            </div>

          </div>

        </div>
      )}


      {/* TAB D: SITE COST ACCOUNTING */}
      {activeTab === "SITE" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
          
          <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-blue-600 font-extrabold">SITE ACCOUNTING INTEGRATION</span>
              <h2 className="text-lg font-extrabold text-slate-900">건설안전점검 현장별 독립 회계 정산</h2>
            </div>
            
            <div className="flex items-center gap-2 text-xs print:hidden">
              <label className="font-extrabold text-slate-700">현장 필터 선택:</label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold focus:outline-none"
              >
                {uniqueSites.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Construction Report Integration Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center">
            <div className="p-4 bg-white rounded-2xl border border-slate-300 text-blue-700 shadow-inner">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="text-xs space-y-1.5 flex-grow text-slate-600">
              <p className="font-extrabold text-slate-800 flex items-center gap-1">
                <span className="w-1.5 h-3 rounded-full bg-blue-600"></span>
                안전점검 보고서 - 회계 자동 정산 매커니즘
              </p>
              <p>본 시스템은 시공중인 안전점검 현장명(보고서 작성 시 등록한 <strong>'공사명'</strong>)과 입출금 관리의 <strong>'연동 현장'</strong>을 상호 크로스 매칭합니다.</p>
              <p>따라서, 안전보고서에 기반한 각 현장별 자재원가(철근, 가설재), 중장비비, 일용 노무비를 단 1초 만에 완전 분리 정산하여 리포트합니다.</p>
            </div>
          </div>

          {/* Site Cost Card Grid */}
          {uniqueSites.filter(s => s !== "전체" && (selectedSite === "전체" || s === selectedSite)).map(siteName => {
            const siteTxs = transactions.filter(t => t.siteName === siteName);
            const sIncome = siteTxs.filter(t => t.type === "수입").reduce((sum, t) => sum + t.amount, 0);
            const sExpense = siteTxs.filter(t => t.type === "지출").reduce((sum, t) => sum + t.amount, 0);
            
            // Subdivide costs
            const rawMaterials = siteTxs.filter(t => t.category === "원재료비").reduce((sum, t) => sum + t.amount, 0);
            const laborCosts = siteTxs.filter(t => t.category === "노무비").reduce((sum, t) => sum + t.amount, 0);
            const equipCosts = siteTxs.filter(t => t.category === "장비임차료").reduce((sum, t) => sum + t.amount, 0);
            const outsourcing = siteTxs.filter(t => t.category === "외주비" || t.category === "외주가공비").reduce((sum, t) => sum + t.amount, 0);
            const adminCosts = siteTxs.filter(t => t.category !== "원재료비" && t.category !== "노무비" && t.category !== "장비임차료" && t.category !== "외주비" && t.category !== "외주가공비" && t.type === "지출").reduce((sum, t) => sum + t.amount, 0);

            const profitMargin = sIncome > 0 ? Math.round(((sIncome - sExpense) / sIncome) * 100) : 0;

            return (
              <div key={siteName} className="border border-slate-200 rounded-3xl p-6 hover:border-blue-400 transition-colors shadow-sm space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                    현장명: {siteName}
                  </h4>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    profitMargin >= 20 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    추정 수익률: {profitMargin}%
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block font-bold mb-1">현장 기성금(수입)</span>
                    <span className="text-sm font-extrabold text-green-600">{formatNum(sIncome)}원</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block font-bold mb-1">투입 공사원가(지출)</span>
                    <span className="text-sm font-extrabold text-red-600">{formatNum(sExpense)}원</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block font-bold mb-1">실현 공사 손익</span>
                    <span className={`text-sm font-extrabold ${sIncome - sExpense >= 0 ? "text-blue-600" : "text-red-500"}`}>
                      {formatNum(sIncome - sExpense)}원
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block font-bold mb-1">지출 거래건수</span>
                    <span className="text-sm font-extrabold text-slate-800 font-mono">{siteTxs.length}건</span>
                  </div>
                </div>

                {/* Sub-cost progress breakdown */}
                <div className="space-y-3 pt-2 text-[11px]">
                  <span className="font-extrabold text-slate-800 block">■ 세부 계정 구성 평가표 (경비 분석)</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* 재료비 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>재료비 (철근자재 등)</span>
                        <span className="font-bold">{formatNum(rawMaterials)}원</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${sExpense > 0 ? Math.min(100, (rawMaterials / sExpense) * 100) : 0}%` }}></div>
                      </div>
                    </div>

                    {/* 노무비 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>노무비 (인건비)</span>
                        <span className="font-bold">{formatNum(laborCosts)}원</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sExpense > 0 ? Math.min(100, (laborCosts / sExpense) * 100) : 0}%` }}></div>
                      </div>
                    </div>

                    {/* 장비비 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>장비비 (임차료)</span>
                        <span className="font-bold">{formatNum(equipCosts)}원</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${sExpense > 0 ? Math.min(100, (equipCosts / sExpense) * 100) : 0}%` }}></div>
                      </div>
                    </div>

                    {/* 외주공사비 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>외주가공비</span>
                        <span className="font-bold">{formatNum(outsourcing)}원</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${sExpense > 0 ? Math.min(100, (outsourcing / sExpense) * 100) : 0}%` }}></div>
                      </div>
                    </div>

                    {/* 현장관리비 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>현장 관리비 (복리후생)</span>
                        <span className="font-bold">{formatNum(adminCosts)}원</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: `${sExpense > 0 ? Math.min(100, (adminCosts / sExpense) * 100) : 0}%` }}></div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}

          {uniqueSites.length <= 1 && (
            <div className="bg-slate-50 p-8 border border-dashed border-slate-300 text-center rounded-3xl text-slate-400 font-bold text-xs">
              현재 연동된 건설 현장 데이터가 존재하지 않습니다. 먼저 입출금 전표 작성 시 우측 '보고서 연동 현장'을 매핑하여 입력해 주시기 바랍니다.
            </div>
          )}

        </div>
      )}


      {/* TAB E: TAX CALCULATION & FILING SUPPORT */}
      {activeTab === "TAX_CALC" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
          
          <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-blue-600 font-extrabold">TAX ESTIMATES CABINET</span>
              <h2 className="text-lg font-extrabold text-slate-900">부가가치세 · 법인세/소득세 자동 예상기</h2>
            </div>
            
            <span className="text-[10px] text-slate-400 font-bold">※ 실시간 세법 적용</span>
          </div>

          {/* Legal Caution Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs text-amber-900 leading-normal font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold">🚨 필수 세법 고지 사항</p>
              <p className="text-amber-800">본 부가가치세 및 소득세/법인세 예상액 산정 결과는 사용자가 대장에 입력한 가공되지 않은 세무 전표 원장을 기본 산정식에 의해 도출한 참고 자료입니다. 가산세 유무, 세액공제, 감면 특례 등의 상세 감수 여부에 따라 실제 납부 세액과 상이할 수 있으므로 <strong>"최종 세무 신고 전 반드시 전담 세무대리인 등 전문가용 검토를 거쳐야 합니다."</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. VAT Estimation Detail */}
            <div className="border border-slate-200 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                이번 기 부가가치세 (VAT) 추정 명세
              </h3>
              
              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>매출 세액 (수입 VAT 대장합계)</span>
                  <span className="text-green-600 font-bold">{formatNum(salesVat)}원</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>매입 공제 세액 (지출 VAT 대장합계)</span>
                  <span className="text-red-500 font-bold">{formatNum(purchaseVat)}원</span>
                </div>
                <div className="flex justify-between py-2 border-b-2 border-slate-100 text-sm font-extrabold text-slate-800">
                  <span>최종 예상 부가세 세액 (환급/납부)</span>
                  <span className="text-blue-600">{formatNum(estimatedVat)}원</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed">
                <p className="font-bold text-slate-700">■ 건설업 부가세 환급 팁</p>
                <p>가설 자재 매입 및 포클레인 장비료 등 정식 세금계산서 발행 시 발생한 매입 부가세는 100% 공제 환급 대상이 됩니다. 단, 현장 일용 노무비 및 고용보험료 등은 면세이므로 부가세가 공제되지 않습니다.</p>
              </div>
            </div>

            {/* 2. Corporate Tax Estimation Detail */}
            <div className="border border-slate-200 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                당해 사업연도 법인세/종합소득세 과표 추정
              </h3>

              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>누적 총 매출액 (수입 원가대장)</span>
                  <span className="text-slate-800 font-bold">{formatNum(totalIncome)}원</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>누적 인정 경비액 (지출 대장)</span>
                  <span className="text-slate-800 font-bold">{formatNum(totalExpense)}원</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-800 font-bold">
                  <span>당기 추정 과세표준 (과표)</span>
                  <span className="text-slate-800">{formatNum(netIncomeYtd)}원</span>
                </div>
                <div className="flex justify-between py-2 border-b-2 border-slate-100 text-sm font-extrabold text-slate-800">
                  <span>최종 예상 산출 세액</span>
                  <span className="text-purple-600">{formatNum(estimatedCorporateTax)}원</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed">
                <p className="font-bold text-slate-700">■ 법인세 과세 구간율 안내</p>
                <p>과세표준 2억원 이하는 지방소득세 별도 9% 세율이 적용되며, 2억원 초과 200억원 이하는 19%의 초과 누진세율이 적용됩니다. 경비 및 공제를 꼼꼼히 챙기시는 것이 감면의 지름길입니다.</p>
              </div>
            </div>

          </div>

          {/* filing materials support */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              국세청 신고 준비 패킷 자동 구성 가이드
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
                <p className="font-bold text-slate-200">① 매입매출처별 집계표</p>
                <p className="text-[11px] text-slate-400">대장에 기재된 사업자번호 팩터를 추출하여 분기별 매입 매출 대장 수동 검증 후 즉시 출력 가능 상태입니다.</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
                <p className="font-bold text-slate-200">② 노무 인건비 정산장</p>
                <p className="text-[11px] text-slate-400">일용근로자 노무 대장 및 3.3% 원천세 프리랜서 매입 대장에 매칭하여 지급명세서 제출 준비가 확보되었습니다.</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
                <p className="font-bold text-slate-200">③ 중장비 세금 명세목록</p>
                <p className="text-[11px] text-slate-400">한길중장비 외 중기 대여 사업자와의 임대차 증빙 자료 매입을 100% 분할 취합하여 전표가 대조 완료되었습니다.</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
                <p className="font-bold text-slate-200">④ 증빙 서류 보존 대장</p>
                <p className="text-[11px] text-slate-400">카드 명세서, 이체증, 영수증 사진을 클라우드 서버에 영구 보존하여 가공 경비 인정을 적극 지원 보완합니다.</p>
              </div>
            </div>
          </div>

        </div>
      )}


      {/* TAB F: AI TAX ASSISTANT CHAT BOT */}
      {activeTab === "CHAT" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col h-[600px] animate-fade-in">
          
          {/* Chat Header */}
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white p-2 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  건설 전문 실시간 AI 세무비서
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">대장에 입력하신 실제 {transactions.length}건의 거래 명세를 실시간 기계 분석하여 대답합니다.</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                if(confirm("대화 내역을 모두 초기화하시겠습니까?")) {
                  setChatMessages([
                    { role: "assistant", content: `안녕하세요, ${currentUser.representative || currentUser.username} 대표님! ${currentUser.companyName || "건설"}의 맞춤형 **AI 건설 세무비서**입니다. \n\n기성금 세금계산서, 장비료 매입 부가세, 현장 노무비 원천세 등 복잡한 건설 세무 및 현재 입력하신 입출금 대장에 대해 궁금한 점을 여쭤보세요. 언제든 친절히 계산 및 분석해 드리겠습니다! 🧑‍💼` }
                  ]);
                }
              }}
              className="text-xs text-red-500 hover:text-red-700 font-bold"
            >
              대화 리셋
            </button>
          </div>

          {/* Quick Recommend Questions Panel */}
          <div className="shrink-0 space-y-1.5 print:hidden">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">빠른 자주 묻는 질문 (클릭 시 자동 질문)</span>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChatQuestion(q)}
                  className="bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Display Window */}
          <div className="flex-grow overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-4 text-xs leading-relaxed">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {msg.role !== "user" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`p-3.5 rounded-2xl border ${
                  msg.role === "user" 
                    ? "bg-blue-600 border-blue-500 text-white rounded-tr-none shadow-md" 
                    : "bg-white border-slate-200 text-slate-800 rounded-tl-none shadow-sm whitespace-pre-line"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center animate-pulse shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none text-slate-500 italic flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  대표님의 실시간 세무 대장을 기계 분석 중입니다...
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleChatQuestion();
            }} 
            className="flex gap-2 shrink-0 print:hidden"
          >
            <input
              type="text"
              placeholder="여기에 건설 세무 자문 질문을 입력해 주세요... (예: '이번달 이익 상황은 어떤가?')"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-grow bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-1 font-bold cursor-pointer"
            >
              <Send className="w-4 h-4" />
              전송
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
