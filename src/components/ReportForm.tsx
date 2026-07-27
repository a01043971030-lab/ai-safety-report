import React, { useState } from "react";
import { SafetyReport, PhotoItem, SampleTemplateConfig, PHOTO_MAIN_CATEGORIES, PHOTO_SUB_CATEGORIES } from "../types";
import GoogleMapsSelector from "./GoogleMapsSelector";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Briefcase, 
  PenTool, 
  UserCheck,
  Building,
  FileCode2,
  Upload,
  X,
  Check,
  Settings,
  Type,
  FileSpreadsheet
} from "lucide-react";

const DEFAULT_PRESET_SAMPLES = [
  {
    id: "preset-1",
    name: "국토교통부 정기안전점검 표준샘플 (기본)",
    fontStyle: "맑은 고딕",
    toneStyle: "격식체 (~함, ~사료됨)",
    tableStyle: "표준 격자형",
    content: `제1장 일반사항
1.1 점검대상물 위치도
1.2 점검대상물 전경사진
1.3 점검 실시결과 요약문

제2장 점검 개요 및 공사 현황
2.1 점검의 목적 및 범위
2.2 건설공사 현황 및 인력 배치
2.3 점검 수행 장비 및 인원

제3장 안전점검 세부 결과
3.1 구조물 및 부위별 외관조사 결과
3.2 비파괴 검사 및 시공 품질 검토
3.3 임시 안전시설 및 가설공법의 안전성 판단
3.4 주변 인접 시설물 영향 평가

제4장 종합 결론 및 안전 개선 대책
4.1 종합의견
4.2 개선 및 건의사항
4.3 책임기술자 최종 판정`
  },
  {
    id: "preset-2",
    name: "건설안전기술단 정밀복제 서식 (상세 양식)",
    fontStyle: "휴먼명조",
    toneStyle: "격식체 (~함, ~사료됨)",
    tableStyle: "헤더 강조형",
    content: `[제1장 현장 일반 현황 및 개요]
1-1. 현장 위치도 및 주요 구조물 개요
1-2. 공종별 시공 진행 현황 및 현장 전경
1-3. 안전관리 조직도 및 참여기술자 자격 검증

[제2장 부위별 정밀 안전점검 결과]
2-1. 사전자료 검토 (설계도서 및 지반조사보고서)
2-2. 구조체 외관 조사 및 결함 현황 분석
2-3. 콘크리트 비파괴 강도 측정 및 균열 상태
2-4. 품질 자재 관리 및 안전교육 실시 현황

[제3장 가설구조물 및 인접 영향 평가]
3-1. 흙막이/동바리/비계 가설구조물 안전성 검토
3-2. 건설기계 및 장비 안전 관리 상태
3-3. 인접 구조물 거동 및 공사장 주변 안전 조치

[제4장 종합 평가 및 최종 권고사항]
4-1. 안전성 종합 평가 결론
4-2. 시정 지시 및 시공사 조치 요구사항
4-3. 안전 총괄 책임기술인 종합 확인 서명`
  },
  {
    id: "preset-3",
    name: "감리단/발주처 제출용 요약 서식 (모던 간이 양식)",
    fontStyle: "나눔고딕",
    toneStyle: "서술체 (~하였습니다)",
    tableStyle: "클린 테두리형",
    content: `1. 점검 요약 및 종합 소견
1.1 점검 목적 및 개요
1.2 종합 점검 결과 요약표

2. 공종별 정기 점검 현황
2.1 가설 및 토공사 안전점검
2.2 골조 및 구조체 안전점검
2.3 현장 주변 및 인접시설 조치사항

3. 개선 권고사항 및 향후 조치 계획
3.1 즉시 시정 요구 사항
3.2 중장기 배수 및 안전대책`
  }
];

interface ReportFormProps {
  initialReport?: SafetyReport | null;
  onSave: (report: SafetyReport) => void;
  onCancel: () => void;
}

export default function ReportForm({ initialReport, onSave, onCancel }: ReportFormProps) {
  // Load current user status
  const storedUser = localStorage.getItem("active_user");
  let currentUserStatus = "체험회원";
  let activeCompany = "플러스 마켓";
  let activeRep = "박제윤 (사업자: 508-22-65436)";
  let activeAddress = "기업은행 / 박제윤 / 189-106874-01-014";
  let activePhone = "010-4397-1030";
  let activeEmail = "twomong3@naver.com";

  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      currentUserStatus = u.status;
      if (u.companyName) activeCompany = u.companyName;
      if (u.representative) activeRep = `${u.representative} (사업자: ${u.businessNumber || '508-22-65436'})`;
      if (u.address) activeAddress = u.address;
      if (u.phone) activePhone = u.phone;
      if (u.email) activeEmail = u.email;
    } catch (e) {
      console.error(e);
    }
  }

  const [report, setReport] = useState<SafetyReport>(() => {
    if (initialReport) return { ...initialReport };
    return {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      companyName: activeCompany,
      representative: activeRep,
      address: activeAddress,
      phone: activePhone,
      email: activeEmail,
      projectName: "",
      projectLocation: "",
      client: "",
      contractor: "",
      supervisor: "",
      projectPeriod: "",
      checkDegree: "정기안전점검 (1차)",
      checkDate: new Date().toISOString().split("T")[0],
      progressRate: "",
      leadEngineer: "",
      assistantEngineers: "",
      workTypes: "가설공사, 토공사, 콘크리트공사",
      summary: "",
      remarks: "",
      checkResult: "",
      photos: [],
      aiGenerated: false
    };
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);

  // Sample Registration Modal State
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [sampleFormState, setSampleFormState] = useState<SampleTemplateConfig>(() => {
    return report.sampleConfig || {
      sampleName: DEFAULT_PRESET_SAMPLES[0].name,
      sampleContent: DEFAULT_PRESET_SAMPLES[0].content,
      fontStyle: DEFAULT_PRESET_SAMPLES[0].fontStyle,
      toneStyle: DEFAULT_PRESET_SAMPLES[0].toneStyle,
      tableStyle: DEFAULT_PRESET_SAMPLES[0].tableStyle
    };
  });

  const handleApplySampleConfig = (configToApply?: SampleTemplateConfig) => {
    const config = configToApply || sampleFormState;
    setReport(prev => ({
      ...prev,
      sampleConfig: config
    }));
    setIsSampleModalOpen(false);
    alert(`✅ [${config.sampleName || '등록 샘플'}] 서식이 성공적으로 등록되었습니다!\n글꼴: ${config.fontStyle || '맑은 고딕'} / 어투: ${config.toneStyle || '격식체'}\n보고서 자동 집필 시 이 샘플 목차와 어투가 100% 동일하게 복제됩니다.`);
  };

  const handleSampleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setSampleFormState(prev => ({
          ...prev,
          sampleName: file.name.replace(/\.[^/.]+$/, "") + " (사용자 업로드 서식)",
          sampleContent: text
        }));
        alert(`📄 [${file.name}] 파일 내용이 샘플 입력창에 성공적으로 로드되었습니다!`);
      }
    };
    reader.readAsText(file);
  };

  // Default Upload Category state for upcoming uploads
  const [uploadMainCategory, setUploadMainCategory] = useState<string>("현장사진");
  const [uploadSubCategory, setUploadSubCategory] = useState<string>("시설물");

  const handleSelectUploadMainCategory = (mainCat: string) => {
    setUploadMainCategory(mainCat);
    const subCats = PHOTO_SUB_CATEGORIES[mainCat] || [];
    if (subCats.length > 0) {
      setUploadSubCategory(subCats[0]);
    } else {
      setUploadSubCategory("");
    }
  };

  // Auto-fill template data
  const handleAutoFill = () => {
    setReport(prev => ({
      ...prev,
      companyName: "플러스 마켓",
      representative: "박제윤 (사업자: 508-22-65436)",
      address: "기업은행 / 박제윤 / 189-106874-01-014",
      phone: "010-4397-1030",
      email: "twomong3@naver.com",
      projectName: "마포 하이앤드 웰스빌 주상복합 신축공사",
      projectLocation: "서울특별시 마포구 공덕동 102-4",
      client: "태양디앤씨 (주)",
      contractor: "대승건설 주식회사",
      supervisor: "(주)한빛종합건축사사무소",
      projectPeriod: "2025.04.01 ~ 2027.12.31",
      checkDegree: "정기안전점검 (2차)",
      checkDate: new Date().toISOString().split("T")[0],
      progressRate: "42.5%",
      leadEngineer: "박민호 (건설안전특급기술자)",
      assistantEngineers: "최동훈, 정수아",
      workTypes: "가설공사, 흙막이 옹벽공사, 지상 철근콘크리트 조립공사",
      summary: "지하 4층 ~ 지상 29층, 2개동 주상복합 건축물 신축. 구조형식은 철근콘크리트 라멘조 및 무량판 구조 혼용.",
      remarks: "현장 남측에 인접한 기존 노후 건물이 존재하여 배후 토압 및 흙막이 거동 계측 상태를 일일 중점 관리하고 있음. 장마철 대비 배수 구역 사전 정비 필요.",
      checkResult: "금회 점검 결과 전체 구조물 안전성은 건전한 상태를 유지하고 있으나, 가설 비계 일부 개구부에 안전난간 체결이 헐거운 상태가 확인되어 시정 지시함."
    }));
  };

  // Input changes
  const handleInputChange = (field: keyof SafetyReport, value: any) => {
    setReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Convert and compress File to Base64 (max 800px, quality 0.6) for blazing fast speed and ultra-low database weight
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxWidth) {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Use image/jpeg with compressed quality (0.6 is virtually indistinguishable from 1.0 but 10x smaller)
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
        img.onerror = () => {
          // Fallback to original base64 if canvas drawing fails
          resolve(event.target?.result as string || "");
        };
      };
      reader.onerror = () => {
        resolve("");
      };
    });
  };

  // Handle Image uploads
  const processImageFiles = async (files: FileList) => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 현재 '정회원 승인대기' 상태로, 신규 사진 분석이 제한됩니다. 정회원 승인 완료 후 이용 가능합니다.");
      return;
    }

    const currentPhotosCount = report.photos.length;
    if (currentPhotosCount >= 300) {
      alert("⚠️ 사진은 최대 300장까지 등록할 수 있습니다.");
      return;
    }

    let filesToProcess = Array.from(files).filter(file => file.type.startsWith("image/"));
    const maxAllowedNew = 300 - currentPhotosCount;
    if (filesToProcess.length > maxAllowedNew) {
      alert(`⚠️ 사진은 최대 300장까지 등록 가능합니다. 허용 용량을 초과한 일부 파일은 제외하고 ${maxAllowedNew}장의 사진만 추가됩니다.`);
      filesToProcess = filesToProcess.slice(0, maxAllowedNew);
    }

    if (filesToProcess.length === 0) return;

    // Phase 1: Compress all files in parallel on the client side (instantaneous!)
    const compressedPhotosPromises = filesToProcess.map(async (file) => {
      try {
        const base64 = await compressImage(file);
        const tempId = Math.random().toString(36).substring(2, 9);
        const combinedCategory = uploadSubCategory 
          ? `${uploadMainCategory} - ${uploadSubCategory}` 
          : uploadMainCategory;

        const tempPhoto: PhotoItem = {
          id: tempId,
          url: base64,
          name: file.name,
          mainCategory: uploadMainCategory,
          subCategory: uploadSubCategory,
          category: combinedCategory,
          confidence: aiAnalysisEnabled ? 0.5 : 1.0,
          caption: aiAnalysisEnabled ? "분석 전 이미지" : `${file.name.split('.')[0]} 점검 사진`,
          findings: aiAnalysisEnabled 
            ? "AI 분석을 진행 중입니다..." 
            : "점검 내용을 수동으로 입력하거나, 우측 하단의 [입력내용 기반 AI 자동완성] 버튼을 눌러 공학 보고서 톤으로 자동 변환해 보세요.",
          status: "양호",
          analyzing: aiAnalysisEnabled,
          location: "",
          importantContent: "",
          specialRemarks: ""
        };
        return tempPhoto;
      } catch (err) {
        console.error("Error compressing file:", file.name, err);
        return null;
      }
    });

    const newPhotos = (await Promise.all(compressedPhotosPromises)).filter(p => p !== null) as PhotoItem[];

    if (newPhotos.length === 0) return;

    // Batch update the state with all newly uploaded compressed photos (instantly visible on screen!)
    setReport(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));

    // Phase 2: Controlled queue for AI Analysis if enabled
    if (aiAnalysisEnabled) {
      const runAIAnalysisQueue = async (photosToAnalyze: PhotoItem[]) => {
        const concurrencyLimit = 4;
        let currentIndex = 0;

        const worker = async () => {
          while (currentIndex < photosToAnalyze.length) {
            const index = currentIndex++;
            if (index >= photosToAnalyze.length) break;
            const photo = photosToAnalyze[index];
            await analyzePhotoWithAI(photo.id, photo.url, "image/jpeg");
          }
        };

        const workers = Array(Math.min(concurrencyLimit, photosToAnalyze.length))
          .fill(null)
          .map(() => worker());

        await Promise.all(workers);
      };

      // Run queue in background so UI remains fully interactive!
      runAIAnalysisQueue(newPhotos);
    }
  };

  // 2-Depth photo category handlers
  const handleMainCategoryChange = (id: string, newMainCat: string) => {
    const subCats = PHOTO_SUB_CATEGORIES[newMainCat] || [];
    const defaultSub = subCats.length > 0 ? subCats[0] : "";
    const combinedCat = defaultSub ? `${newMainCat} - ${defaultSub}` : newMainCat;

    setReport(prev => ({
      ...prev,
      photos: prev.photos.map(p => {
        if (p.id === id) {
          return {
            ...p,
            mainCategory: newMainCat,
            subCategory: defaultSub,
            category: combinedCat
          };
        }
        return p;
      })
    }));
  };

  const handleSubCategoryChange = (id: string, newSubCat: string) => {
    setReport(prev => ({
      ...prev,
      photos: prev.photos.map(p => {
        if (p.id === id) {
          const mainCat = p.mainCategory || "현장사진";
          const combinedCat = newSubCat ? `${mainCat} - ${newSubCat}` : mainCat;
          return {
            ...p,
            subCategory: newSubCat,
            category: combinedCat
          };
        }
        return p;
      })
    }));
  };

  // Analyze individual photo via API with optional userText to prioritize
  const analyzePhotoWithAI = async (photoId: string, base64: string, mimeType: string, userText?: string) => {
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, userText })
      });

      if (!response.ok) {
        throw new Error("서버 이미지 분석 요청이 실패했습니다.");
      }

      const analysis = await response.json();

      setReport(prev => {
        const updatedPhotos = prev.photos.map(photo => {
          if (photo.id === photoId) {
            const mainCat = photo.mainCategory || "현장사진";
            const subCat = photo.subCategory || "외관 조사 사진";
            const combinedCat = subCat ? `${mainCat} - ${subCat}` : mainCat;
            return {
              ...photo,
              mainCategory: mainCat,
              subCategory: subCat,
              category: combinedCat,
              confidence: analysis.confidence,
              caption: analysis.caption,
              findings: analysis.findings,
              status: analysis.status,
              location: analysis.location || photo.location || "",
              importantContent: analysis.importantContent || photo.importantContent || "",
              specialRemarks: analysis.specialRemarks || photo.specialRemarks || "",
              analyzing: false
            };
          }
          return photo;
        });
        return { ...prev, photos: updatedPhotos };
      });
    } catch (err: any) {
      console.error("AI photo analysis error:", err);
      setReport(prev => {
        const updatedPhotos = prev.photos.map(photo => {
          if (photo.id === photoId) {
            return {
              ...photo,
              caption: photo.caption && photo.caption !== "분석 전 이미지" ? photo.caption : "점검 사진",
              findings: photo.findings && photo.findings !== "AI 분석을 진행 중입니다..." 
                ? photo.findings 
                : "이미지 분석 오류가 발생하여 기본 표준 텍스트를 제공합니다. 시공 규정 준수 상태 점검 요망.",
              analyzing: false
            };
          }
          return photo;
        });
        return { ...prev, photos: updatedPhotos };
      });
    }
  };

  // File drag & drop triggers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFiles(e.target.files);
    }
  };

  // Photo actions
  const handleDeletePhoto = (id: string) => {
    setReport(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id)
    }));
  };

  const handleMovePhoto = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= report.photos.length) return;

    setReport(prev => {
      const copy = [...prev.photos];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, photos: copy };
    });
  };

  const handlePhotoFieldChange = (id: string, field: keyof PhotoItem, value: any) => {
    setReport(prev => ({
      ...prev,
      photos: prev.photos.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  // AI Automatic safety report writer
  const handleAIGenerateReport = async () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 현재 '정회원 승인대기' 상태로, AI 자동 안전 보고서 완결 작성이 제한됩니다. 정회원 승인 완료 후 이용 가능합니다.");
      return;
    }
    if (!report.projectName) {
      alert("공사명은 AI 보고서 작성에 필요한 필수값입니다.");
      return;
    }

    try {
      setLoading(true);
      setLoadingStep("현장 사진 및 기본 정보 공학적 모델링 중...");

      // Short delay for visual polish
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoadingStep("건설공사 안전관리 업무수행 지침 기준 적용 중...");

      const response = await fetch("/api/generate-report-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report)
      });

      if (!response.ok) {
        throw new Error("AI 보고서 생성 API 호출이 실패했습니다.");
      }

      setLoadingStep("정밀 건설안전 보고서 200페이지 규격 텍스트 완결 중...");
      const aiData = await response.json();

      setReport(prev => ({
        ...prev,
        ...aiData,
        aiGenerated: true,
        updatedAt: Date.now()
      }));

      setLoading(false);
      setLoadingStep("");
    } catch (err: any) {
      console.error(err);
      alert("AI 보고서 생성 실패: " + err.message);
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Save changes to Firestore
  const handleSaveReport = () => {
    if (currentUserStatus === "정회원 승인대기" && !report.id) {
      alert("⚠️ 현재 '정회원 승인대기' 상태로, 신규 보고서 작성이 제한됩니다. 정회원 승인 완료 후 이용 가능합니다.");
      return;
    }
    if (!report.projectName) {
      alert("최소 공사명은 지정하셔야 저장할 수 있습니다.");
      return;
    }
    onSave({
      ...report,
      updatedAt: Date.now()
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-5xl mx-auto my-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="bg-blue-600/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
            {report.id ? "기존 보고서 수정" : "정기안전점검 새 보고서"}
          </span>
          <h2 className="text-2xl font-bold mt-1 text-white">건설안전점검 AI 보고서 설정</h2>
          <p className="text-xs text-slate-300 mt-1">
            현장의 정밀 정보를 입력하고 AI 지능형 분석과 보고서 챕터 자동 완성을 가동하세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Register Report Sample Button */}
          <button
            type="button"
            onClick={() => setIsSampleModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 border border-orange-400 px-3.5 py-2 rounded-xl cursor-pointer transition-all shadow-md active:scale-95"
            title="기준 샘플 보고서를 등록하여 목차, 서식, 글씨체 및 어투 스타일을 100% 동일하게 복제합니다."
          >
            <FileCode2 className="w-4 h-4 text-orange-100" />
            <span>보고서 샘플 등록</span>
            {report.sampleConfig?.sampleName && (
              <span className="bg-orange-950 text-orange-200 text-[10px] font-black px-1.5 py-0.5 rounded border border-orange-400/40 font-mono">
                [적용중]
              </span>
            )}
          </button>

          {/* Sample Autofill Example Button */}
          <button
            type="button"
            onClick={handleAutoFill}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-100 bg-blue-800 hover:bg-blue-700 border border-blue-600 px-3.5 py-2 rounded-xl cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            샘플 예시 채우기
          </button>
        </div>
      </div>

      {/* Active Sample Config Status Banner */}
      {report.sampleConfig && (
        <div className="bg-orange-50 border-b border-orange-200 px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="bg-orange-500 text-white p-1.5 rounded-lg shadow-sm">
              <FileCode2 className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-orange-950">
                🏢 [복제 적용중 샘플]: {report.sampleConfig.sampleName || "국토부 정기안전점검 표준샘플"}
              </span>
              <span className="text-orange-900 ml-2 font-medium">
                (글꼴: <strong className="font-bold underline text-orange-950">{report.sampleConfig.fontStyle || "맑은 고딕"}</strong> | 어투: <strong className="font-bold underline text-orange-950">{report.sampleConfig.toneStyle || "격식체"}</strong> | 표: <strong>{report.sampleConfig.tableStyle || "표준"}</strong>)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSampleModalOpen(true)}
            className="text-orange-800 hover:text-orange-950 font-bold underline cursor-pointer text-xs flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-orange-300 shadow-sm transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-orange-600" />
            샘플/글씨체 스타일 변경
          </button>
        </div>
      )}

      <div className="p-8 space-y-10">
        {/* 1. Company Information Section */}
        <div>
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
            <Building className="w-5 h-5 text-blue-800" />
            <h3 className="text-base font-bold text-slate-900">① 안전진단 대행기관 정보</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">진단 대행업체명</label>
              <input
                type="text"
                value={report.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="예: (주)한라안전연구단"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">대표자 성명</label>
              <input
                type="text"
                value={report.representative}
                onChange={(e) => handleInputChange("representative", e.target.value)}
                placeholder="예: 김진단"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">사무실 대표 연락처</label>
              <input
                type="text"
                value={report.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="예: 02-555-9999"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">사무실 공식 등록 주소</label>
              <input
                type="text"
                value={report.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="예: 서울특별시 서초구 서초대로 42길 1"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">진단 담당자 이메일</label>
              <input
                type="text"
                value={report.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="예: admin@safety.or.kr"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* 2. Construction Site Details */}
        <div>
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
            <Briefcase className="w-5 h-5 text-blue-800" />
            <h3 className="text-base font-bold text-slate-900">② 공사현장 기본 정보</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">공 사 명 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={report.projectName}
                onChange={(e) => handleInputChange("projectName", e.target.value)}
                placeholder="예: 광화문 비즈타워 신축 공사"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">점검 일자</label>
              <input
                type="date"
                value={report.checkDate}
                onChange={(e) => handleInputChange("checkDate", e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">발 주 처 (제출처)</label>
              <input
                type="text"
                value={report.client}
                onChange={(e) => handleInputChange("client", e.target.value)}
                placeholder="예: 서울주택도시공사"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">시공사</label>
              <input
                type="text"
                value={report.contractor}
                onChange={(e) => handleInputChange("contractor", e.target.value)}
                placeholder="예: 우수한종합건설 주식회사"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">감리사</label>
              <input
                type="text"
                value={report.supervisor}
                onChange={(e) => handleInputChange("supervisor", e.target.value)}
                placeholder="예: (주)바른종합엔지니어링감리"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">전체 공사 기간</label>
              <input
                type="text"
                value={report.projectPeriod}
                onChange={(e) => handleInputChange("projectPeriod", e.target.value)}
                placeholder="예: 2024.10.12 ~ 2026.08.30"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">점검 차수</label>
              <input
                type="text"
                value={report.checkDegree}
                onChange={(e) => handleInputChange("checkDegree", e.target.value)}
                placeholder="예: 정기안전점검 (1차)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">현재 공정률 (%)</label>
              <input
                type="text"
                value={report.progressRate}
                onChange={(e) => handleInputChange("progressRate", e.target.value)}
                placeholder="예: 24.8%"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">점검 책임기술인</label>
              <input
                type="text"
                value={report.leadEngineer}
                onChange={(e) => handleInputChange("leadEngineer", e.target.value)}
                placeholder="예: 홍길동 (건설안전특급엔지니어)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">점검 참여기술인 명단 (쉼표 구분)</label>
              <input
                type="text"
                value={report.assistantEngineers}
                onChange={(e) => handleInputChange("assistantEngineers", e.target.value)}
                placeholder="예: 김철수 (고급), 이영희 (중급), 박준형"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Interactive Geolocation & Map Pin Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs mt-4">
            <div className="md:col-span-1 flex flex-col justify-between">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">공 사 위 치</label>
                <textarea
                  value={report.projectLocation}
                  onChange={(e) => handleInputChange("projectLocation", e.target.value)}
                  placeholder="예: 서울특별시 마포구 공덕동 123-1 (지도 검색 시 주소가 자동 반영됩니다)"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>
              <div className="mt-4">
                <label className="block text-slate-700 font-semibold mb-1">주요 해당 공종</label>
                <input
                  type="text"
                  value={report.workTypes}
                  onChange={(e) => handleInputChange("workTypes", e.target.value)}
                  placeholder="예: 토공사, 흙막이가설, 비계안전대공사"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <GoogleMapsSelector 
                value={report.projectLocation} 
                onChange={(val) => handleInputChange("projectLocation", val)} 
              />
            </div>
          </div>
        </div>

        {/* 3. Engineering Summaries Input */}
        <div>
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
            <PenTool className="w-5 h-5 text-blue-800" />
            <h3 className="text-base font-bold text-slate-900">③ 현장 여건 요약 및 수동 점검의견</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">공사 개요 및 규모 (세부내용)</label>
              <textarea
                value={report.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                placeholder="공사의 전반적인 규모, 면적, 지하/지상 층수 및 구조 형식 등을 서술해 주세요."
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">현장 특이사항 및 여건</label>
              <textarea
                value={report.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                placeholder="인접한 고압선, 노후옹벽, 지하철 이격 상태, 민원 유무 등 점검 시 특별 고려사항을 서술해 주세요."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">간이 현장점검결과 총평 (사용자 수동)</label>
              <textarea
                value={report.checkResult}
                onChange={(e) => handleInputChange("checkResult", e.target.value)}
                placeholder="금일 점검을 마친 전체 결과 요약이나 중점 지적된 조치 사항을 간략히 작성해 주세요."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* 4. Photo Upload and AI Recognition Engine */}
        <div>
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
            <ImageIcon className="w-5 h-5 text-blue-800" />
            <h3 className="text-base font-bold text-slate-900">④ 현장 점검 사진 등록 및 실시간 AI 사진대지화</h3>
          </div>

          {/* 1-Depth & 2-Depth Category Selector Bar for upcoming uploads */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg border border-slate-800 mb-4 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h4 className="text-xs font-bold text-slate-100">
                  📁 업로드 점검사진 분류 선택 <span className="text-[11px] text-slate-400 font-normal">(대메뉴 / 소메뉴 선택 후 사진을 올려주세요)</span>
                </h4>
              </div>
              <div className="text-[11px] bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 self-start md:self-auto">
                <span className="text-slate-400">현재 업로드 지정:</span>
                <strong className="text-amber-300 font-bold">
                  [{uploadMainCategory}{uploadSubCategory ? ` > ${uploadSubCategory}` : ""}]
                </strong>
              </div>
            </div>

            {/* 1-Depth Main Categories */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                <span>📌 [대메뉴] 선택</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PHOTO_MAIN_CATEGORIES.map((mainCat) => {
                  const isSelected = uploadMainCategory === mainCat;
                  return (
                    <button
                      key={mainCat}
                      type="button"
                      onClick={() => handleSelectUploadMainCategory(mainCat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 shadow-md scale-[1.02] ring-2 ring-amber-300"
                          : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      }`}
                    >
                      <span>{mainCat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-Depth Sub Categories for '현장사진' */}
            {PHOTO_SUB_CATEGORIES[uploadMainCategory]?.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <span>↳ [소메뉴 세부분류] 선택</span>
                  <span className="text-[10px] text-slate-400 font-normal">('현장사진' 진단 항목 세부분류)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PHOTO_SUB_CATEGORIES[uploadMainCategory].map((subCat) => {
                    const isSelected = uploadSubCategory === subCat;
                    return (
                      <button
                        key={subCat}
                        type="button"
                        onClick={() => setUploadSubCategory(subCat)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-400 text-slate-950 shadow scale-[1.02] ring-2 ring-emerald-300"
                            : "bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
                        }`}
                      >
                        <span>{subCat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Photo Upload layout with side-by-side Add Photo button card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
            {/* Drag & Drop Area (3 cols) */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`md:col-span-3 border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
                dragActive ? "border-blue-600 bg-blue-50/50" : "border-slate-300 bg-slate-50 hover:bg-slate-100/50"
              }`}
            >
              <input
                type="file"
                id="report-photo-picker"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="report-photo-picker" className="cursor-pointer block w-full">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                <p className="text-xs font-bold text-slate-700">
                  [{uploadMainCategory}{uploadSubCategory ? ` > ${uploadSubCategory}` : ""}] 등록용 사진 드래그앤드롭
                </p>
                <p className="text-[10px] text-slate-400 mt-1">또는 클릭하여 내 PC의 점검 사진 파일들을 다중 선택하세요.</p>
              </label>
            </div>

            {/* Quick Upload Button Card (1 col) */}
            <div className="md:col-span-1 border border-slate-200 rounded-xl bg-slate-50/80 p-4 flex flex-col justify-between items-center text-center shadow-sm">
              <div className="space-y-1 w-full">
                <div className="text-xs font-bold text-slate-800">점검 사진 추가 및 관리</div>
                <div className="text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                  지정 분류: {uploadMainCategory}{uploadSubCategory ? ` > ${uploadSubCategory}` : ""}
                </div>
                <div className="inline-flex items-center gap-1 bg-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono my-1">
                  등록 개수: <span className="text-blue-600 font-extrabold">{report.photos.length}</span> / 300
                </div>

                {/* AI Auto Analysis Toggle Checkbox */}
                <div className="flex items-center justify-center gap-2 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm my-1 w-full">
                  <input
                    type="checkbox"
                    id="ai-analysis-checkbox"
                    checked={aiAnalysisEnabled}
                    onChange={(e) => setAiAnalysisEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="ai-analysis-checkbox" className="text-[10px] font-extrabold text-slate-700 cursor-pointer flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
                    실시간 AI 자동 분석
                  </label>
                </div>
              </div>
              
              <div className="w-full mt-2 flex flex-col gap-2">
                <input
                  type="file"
                  id="report-photo-picker-btn"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label 
                  htmlFor="report-photo-picker-btn"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/10 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  사진 추가하기
                </label>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAIGenerateReport}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-600/10 cursor-pointer transition-all active:scale-95"
                  title="입력하신 정보를 바탕으로 건설기술진흥법 지침에 상응하는 보고서를 자동으로 작성합니다."
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      작성 중...
                    </>
                  ) : (
                    "보고서 자동 작성하기"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnails list with layout reordering & custom AI comments editing */}
          {report.photos.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>등록된 점검 사진대지 ({report.photos.length}개)</span>
                <span className="text-[10px] font-normal text-slate-500">(사진 배치를 조절하고 AI 분석 결과를 검침 및 개별 수정하세요)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.photos.map((photo, index) => (
                  <div key={photo.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex gap-4 text-xs relative">
                    {/* Thumbnail & action tools */}
                    <div className="w-1/3 flex flex-col justify-between">
                      <div className="w-full h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img 
                          src={photo.url} 
                          alt={photo.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      {/* Reordering and deleting tools */}
                      <div className="flex justify-between items-center mt-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMovePhoto(index, "up")}
                            className="bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 p-1 rounded disabled:opacity-40 cursor-pointer"
                            title="앞으로 보내기"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === report.photos.length - 1}
                            onClick={() => handleMovePhoto(index, "down")}
                            className="bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 p-1 rounded disabled:opacity-40 cursor-pointer"
                            title="뒤로 보내기"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-300 p-1 rounded cursor-pointer transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* AI recognition edit form */}
                    <div className="w-2/3 flex flex-col justify-between space-y-2">
                      {photo.analyzing ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6">
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-1" />
                          <span className="text-[10px] font-bold">안전 자재 AI 판정 분석 중...</span>
                        </div>
                      ) : (
                        <>
                          {/* 2-Depth Category Selector & Safety Status */}
                          <div className="space-y-1.5 bg-blue-50/50 border border-blue-100 rounded-lg p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-blue-900 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                📸 사진 카테고리 분류 (Gemini AI 배치용)
                              </span>
                              <span className="text-[9px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-bold">
                                태그: [{photo.mainCategory || "현장사진"}{photo.subCategory ? ` - ${photo.subCategory}` : ""}]
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                              {/* 1 Depth Main Category */}
                              <div>
                                <label className="block text-[9.5px] text-slate-600 font-bold mb-0.5">대메뉴 카테고리</label>
                                <select
                                  value={photo.mainCategory || "현장사진"}
                                  onChange={(e) => handleMainCategoryChange(photo.id, e.target.value)}
                                  className="w-full text-[10px] font-medium bg-white border border-slate-300 rounded p-1 text-slate-800 focus:ring-1 focus:ring-blue-500"
                                >
                                  {PHOTO_MAIN_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>

                              {/* 2 Depth Sub Category */}
                              <div>
                                <label className="block text-[9.5px] text-slate-600 font-bold mb-0.5">소메뉴 세부분류</label>
                                <select
                                  value={photo.subCategory || ""}
                                  disabled={!PHOTO_SUB_CATEGORIES[photo.mainCategory || "현장사진"]?.length}
                                  onChange={(e) => handleSubCategoryChange(photo.id, e.target.value)}
                                  className="w-full text-[10px] font-medium bg-white border border-slate-300 rounded p-1 text-slate-800 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                  {PHOTO_SUB_CATEGORIES[photo.mainCategory || "현장사진"]?.length ? (
                                    PHOTO_SUB_CATEGORIES[photo.mainCategory || "현장사진"].map(sub => (
                                      <option key={sub} value={sub}>{sub}</option>
                                    ))
                                  ) : (
                                    <option value="">(소메뉴 없음)</option>
                                  )}
                                </select>
                              </div>

                              {/* Safety Status Selector */}
                              <div>
                                <label className="block text-[9.5px] text-slate-600 font-bold mb-0.5">안전성 판정</label>
                                <select
                                  value={photo.status}
                                  onChange={(e) => handlePhotoFieldChange(photo.id, "status", e.target.value)}
                                  className="w-full text-[10px] font-medium bg-white border border-slate-300 rounded p-1 text-slate-800 focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="양호">양호 (정상)</option>
                                  <option value="보완요망">보완요망 (경미)</option>
                                  <option value="지적사항">지적사항 (위험)</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">사진 캡션 (제목)</label>
                            <input
                              type="text"
                              value={photo.caption}
                              onChange={(e) => handlePhotoFieldChange(photo.id, "caption", e.target.value)}
                              className="w-full text-[10px] bg-slate-50 border border-slate-300 rounded p-1 text-slate-800"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold mb-0.5">촬영 위치/부위</label>
                              <input
                                type="text"
                                value={photo.location || ""}
                                onChange={(e) => handlePhotoFieldChange(photo.id, "location", e.target.value)}
                                placeholder="예: 지하 2층 A구역"
                                className="w-full text-[10px] bg-slate-50 border border-slate-300 rounded p-1 text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold mb-0.5">현장 중요내용</label>
                              <input
                                type="text"
                                value={photo.importantContent || ""}
                                onChange={(e) => handlePhotoFieldChange(photo.id, "importantContent", e.target.value)}
                                placeholder="예: 철근 간격 실측"
                                className="w-full text-[10px] bg-slate-50 border border-slate-300 rounded p-1 text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold mb-0.5">현장 특이사항</label>
                              <input
                                type="text"
                                value={photo.specialRemarks || ""}
                                onChange={(e) => handlePhotoFieldChange(photo.id, "specialRemarks", e.target.value)}
                                placeholder="예: 가새 누락 보완"
                                className="w-full text-[10px] bg-slate-50 border border-slate-300 rounded p-1 text-slate-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10.5px] text-blue-900 font-extrabold mb-1 flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              📝 사진 세부 내용 및 조치사항 (보고서 즉시 반영)
                            </label>
                            <textarea
                              value={photo.findings}
                              onChange={(e) => handlePhotoFieldChange(photo.id, "findings", e.target.value)}
                              rows={3}
                              placeholder="사진의 안전점검 소견, 지적 사항, 혹은 점검 일지에 들어갈 자세한 내용을 기입해 주세요."
                              className="w-full text-[10px] bg-blue-50/30 border border-blue-200 focus:border-blue-500 rounded p-1.5 text-slate-800 leading-normal focus:ring-1 focus:ring-blue-500 font-medium"
                            />
                          </div>

                          <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-1.5 mt-2">
                            <span>신뢰율: {(photo.confidence * 100).toFixed(1)}%</span>
                            <div className="flex gap-2 items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  // Gather user fields as text guidelines for AI
                                  const textPrompt = [
                                    photo.caption && !photo.caption.includes("점검 사진") && photo.caption !== "분석 전 이미지" ? `제목: ${photo.caption}` : "",
                                    photo.location ? `위치/부위: ${photo.location}` : "",
                                    photo.importantContent ? `중요내용: ${photo.importantContent}` : "",
                                    photo.specialRemarks ? `특이사항: ${photo.specialRemarks}` : "",
                                    photo.findings && !photo.findings.includes("점검 내용을 수동으로 입력") && photo.findings !== "AI 분석을 진행 중입니다..." ? `사용자 소견: ${photo.findings}` : "",
                                  ].filter(Boolean).join(", ");

                                  handlePhotoFieldChange(photo.id, "analyzing", true);
                                  analyzePhotoWithAI(photo.id, photo.url, "image/jpeg", textPrompt || "수동 입력된 내용을 기반으로 전문 보고서 문장 작성");
                                }}
                                className="flex items-center gap-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                                title="사용자가 입력한 정보와 사진을 기반으로, AI가 안전점검 소견 및 중요내용 양식을 완성합니다."
                              >
                                <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
                                입력내용 기반 AI 자동완성
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handlePhotoFieldChange(photo.id, "analyzing", true);
                                  analyzePhotoWithAI(photo.id, photo.url, "image/jpeg");
                                }}
                                className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer font-semibold px-1"
                                title="사진 분석만 새로 실행합니다."
                              >
                                신규 분석
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>



        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center shadow-2xl max-w-sm w-full mx-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold">건설 안전 AI 집필 가동 중</h3>
              <p className="text-xs text-slate-400 mt-2 font-mono bg-slate-900 py-2 px-4 rounded border border-slate-800">
                {loadingStep}
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                <div className="bg-blue-500 h-full w-2/3 rounded-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-blue-500 to-indigo-400"></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-4">잠시만 기다려 주십시오. 최대 수십 초가 소요될 수 있습니다.</p>
            </div>
          </div>
        )}

        {/* Show validation that report has been written with AI */}
        {report.aiGenerated && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="text-xs">
              <p className="font-bold text-green-950">AI 보고서 초안 작성이 완결되었습니다.</p>
              <p className="text-green-800 mt-0.5">안전점검법령에 부합하는 종합 의견, 개선책, 8대 가설체크리스트 등이 본문에 자동 삽입되었습니다. 하단 저장 후 문서를 즉시 다운로드하거나 수정해 보실 수 있습니다.</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-slate-100 border-t border-slate-200 px-8 py-4 flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
        >
          취소 및 돌아가기
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveReport}
            className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            보고서 임시 저장 (수정가능)
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 🏢 REGISTER REPORT SAMPLE & STYLE CLONING MODAL               */}
      {/* ------------------------------------------------------------- */}
      {isSampleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-orange-900 text-white p-6 flex justify-between items-start border-b border-orange-800">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/30 p-2.5 rounded-xl border border-orange-400/30">
                  <FileCode2 className="w-6 h-6 text-orange-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    보고서 샘플 등록 & 글씨체/서술 스타일 복제
                  </h3>
                  <p className="text-xs text-orange-200 mt-0.5">
                    등록하신 샘플 보고서의 **목차, 단락 구조, 표 형식, 글꼴, 문장 맺음말(어투)**을 100% 동일하게 복제하여 AI 보고서를 작성합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSampleModalOpen(false)}
                className="text-orange-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* 1. Standard Preset Selection */}
              <div>
                <label className="block text-slate-800 font-extrabold mb-2 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  1. 추천 샘플 서식 선택 (클릭 시 자동 세팅)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {DEFAULT_PRESET_SAMPLES.map(preset => {
                    const isSelected = sampleFormState.sampleName === preset.name;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSampleFormState({
                            sampleName: preset.name,
                            sampleContent: preset.content,
                            fontStyle: preset.fontStyle,
                            toneStyle: preset.toneStyle,
                            tableStyle: preset.tableStyle
                          });
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-orange-50 border-orange-500 shadow-sm ring-1 ring-orange-500"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`font-bold text-xs ${isSelected ? "text-orange-950" : "text-slate-800"}`}>
                            {preset.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-orange-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 font-mono bg-white p-1.5 rounded border border-slate-200/60">
                          {preset.content.split("\n").slice(0, 3).join(" / ")}...
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                          <span className="bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            {preset.fontStyle}
                          </span>
                          <span className="bg-orange-100 text-orange-900 px-1.5 py-0.5 rounded font-semibold">
                            {preset.toneStyle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom Sample Upload / Text Input */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span>2. 우리회사 고유 샘플 보고서 직접 업로드 / 입력</span>
                  </div>
                  <label className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white border border-orange-400 px-3.5 py-1.5 rounded-xl cursor-pointer font-extrabold transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-white" />
                    <span>샘플 파일(.txt, .md, .doc, .hwp) 파일 불러오기</span>
                    <input
                      type="file"
                      accept=".txt,.md,.doc,.docx,.hwp"
                      onChange={handleSampleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">등록 샘플 서식 명칭</label>
                  <input
                    type="text"
                    value={sampleFormState.sampleName || ""}
                    onChange={(e) => setSampleFormState(p => ({ ...p, sampleName: e.target.value }))}
                    placeholder="예: 우리회사 2026년 정기안전점검 표준 보고서 양식"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-900 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    샘플 보고서 목차 및 문단 본문 텍스트 (100% 구조 복제 기준)
                  </label>
                  <textarea
                    rows={8}
                    value={sampleFormState.sampleContent || ""}
                    onChange={(e) => setSampleFormState(p => ({ ...p, sampleContent: e.target.value }))}
                    placeholder="샘플 보고서의 대목차, 중목차, 표 항목 및 서술 방식 텍스트를 복사하여 여기에 붙여넣으세요..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 font-mono text-xs text-slate-800 leading-relaxed focus:ring-1 focus:ring-orange-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    💡 **팁:** 기작성된 hwp, word, pdf 보고서의 목차와 서식을 복사해 붙여넣으면, AI가 이 목차 번호 매기기와 단락 구성을 동일하게 적용합니다.
                  </p>
                </div>
              </div>

              {/* 3. Typography & Styling Settings (글씨체 및 어투 스타일 동기화) */}
              <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200 space-y-4">
                <div className="flex items-center gap-1.5 font-bold text-orange-950 border-b border-orange-200 pb-2">
                  <Type className="w-4 h-4 text-orange-600" />
                  <span>3. 글씨체(폰트) 및 어투/서식 복제 설정</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Font Family */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1">
                      <Type className="w-3.5 h-3.5 text-orange-600" />
                      글꼴 스타일 (Font)
                    </label>
                    <select
                      value={sampleFormState.fontStyle || "맑은 고딕"}
                      onChange={(e) => setSampleFormState(p => ({ ...p, fontStyle: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="맑은 고딕">맑은 고딕 (표준 모던)</option>
                      <option value="휴먼명조">휴먼명조 (전통 보고서 / 공문서)</option>
                      <option value="나눔고딕">나눔고딕 (현대적 라운딩)</option>
                      <option value="바탕체">바탕체 / 명조체 (격식체)</option>
                    </select>
                  </div>

                  {/* Tone & Manner */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1">
                      <PenTool className="w-3.5 h-3.5 text-orange-600" />
                      서술 어투 (Tone & Manner)
                    </label>
                    <select
                      value={sampleFormState.toneStyle || "격식체 (~함, ~사료됨)"}
                      onChange={(e) => setSampleFormState(p => ({ ...p, toneStyle: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="격식체 (~함, ~사료됨)">격식체 (~함, ~사료됨, ~확인됨)</option>
                      <option value="서술체 (~하였습니다)">서술체 (~하였습니다, ~조치바랍니다)</option>
                      <option value="개조식 요약 (~조치완료)">개조식 요약 (~조치 완료, ~이상 없음)</option>
                    </select>
                  </div>

                  {/* Table Style */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-orange-600" />
                      표 및 단락 디자인
                    </label>
                    <select
                      value={sampleFormState.tableStyle || "표준 격자형"}
                      onChange={(e) => setSampleFormState(p => ({ ...p, tableStyle: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="표준 격자형">표준 격자형 (전통 실선 테두리)</option>
                      <option value="클린 테두리형">클린 테두리형 (현대적 미니멀)</option>
                      <option value="헤더 강조형">헤더 강조형 (가독성 특화)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSampleFormState({
                    sampleName: DEFAULT_PRESET_SAMPLES[0].name,
                    sampleContent: DEFAULT_PRESET_SAMPLES[0].content,
                    fontStyle: DEFAULT_PRESET_SAMPLES[0].fontStyle,
                    toneStyle: DEFAULT_PRESET_SAMPLES[0].toneStyle,
                    tableStyle: DEFAULT_PRESET_SAMPLES[0].tableStyle
                  });
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2 rounded-lg transition-colors"
              >
                기본값으로 초기화
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSampleModalOpen(false)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySampleConfig()}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-md active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>보고서 샘플 및 스타일 저장 적용</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
