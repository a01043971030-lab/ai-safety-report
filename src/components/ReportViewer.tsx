import React, { useRef } from "react";
import { SafetyReport, PhotoItem } from "../types";
import { Printer, Download, MapPin, Building, Shield, FileText, ArrowLeft } from "lucide-react";

interface ReportViewerProps {
  report: SafetyReport;
  onBack: () => void;
}

export default function ReportViewer({ report, onBack }: ReportViewerProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Dynamic font family determination
  const getFontFamily = (styleName?: string) => {
    if (!styleName) return "'Malgun Gothic', '맑은 고딕', 'Batang', '바탕', sans-serif";
    if (styleName.includes("휴먼명조") || styleName.includes("명조")) {
      return "'Human Myungjo', '휴먼명조', 'Batang', '바탕체', serif";
    }
    if (styleName.includes("바탕체") || styleName.includes("바탕")) {
      return "'Batang', '바탕체', serif";
    }
    if (styleName.includes("나눔고딕")) {
      return "'Nanum Gothic', '나눔고딕', sans-serif";
    }
    if (styleName.includes("돋움")) {
      return "'Dotum', '돋움체', sans-serif";
    }
    return "'Malgun Gothic', '맑은 고딕', sans-serif";
  };

  const selectedFontCss = getFontFamily(report.sampleConfig?.fontStyle);

  // Default values matching sample images if not provided
  const projectName = report.projectName || "남강 정암지구 하천환경정비사업 중";
  const targetName = report.workTypes || "천공기 SCW(덕곡배수문)";
  const checkDegree = report.checkDegree || "1차";
  const contractor = report.contractor || "우석종합건설(주)";
  const client = report.client || "기후에너지환경부 낙동강유역환경청";
  const supervisor = report.supervisor || "(주)유신";
  const companyName = report.companyName || "(주)정진이앤씨";
  const leadEngineer = report.leadEngineer || "박경포";
  const checkDate = report.checkDate || "2026년 04월 17일";
  const projectLocation = report.projectLocation || "경남 함안군, 의령군, 진주시, 사천시, 하동군, 산청군, 함양군 일원";
  const yearMonth = "2026. 04";

  // Check active user status
  const storedUser = localStorage.getItem("active_user");
  let currentUserStatus = "체험회원";
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      currentUserStatus = u.status;
    } catch (e) {
      console.error(e);
    }
  }

  const encodedLocation = encodeURIComponent(projectLocation);
  const mapIframeUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const handlePrint = () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 무료 체험 수량을 소진하여 프린터 출력 및 PDF 저장이 제한됩니다.\n정회원 승인 후 출력이 가능합니다.");
      return;
    }
    window.print();
  };

  const handleWordDownload = () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 무료 체험 수량을 소진하여 Word 다운로드가 제한됩니다.");
      return;
    }
    const title = `${projectName}_정기안전점검보고서.doc`;
    const htmlContent = printAreaRef.current?.innerHTML || "";
    
    const converted = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${projectName}</title>
        <style>
          @page { size: A4; margin: 1.5cm; }
          body { font-family: 'Batang', 'Malgun Gothic', serif; line-height: 1.6; color: #000; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 15px; }
          th, td { border: 1px solid #000; padding: 6px; font-size: 10pt; }
          th { background-color: #EAEAEA; font-weight: bold; }
          .page-break { page-break-after: always; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    const blob = new Blob([converted], { type: "application/msword;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reusable Red Stamp Seals
  const RedStamp = ({ text = "박경포", size = "normal" }: { text?: string; size?: "small" | "normal" | "large" }) => (
    <span className={`inline-flex items-center justify-center border-2 border-red-600 text-red-600 font-extrabold rounded-full ${
      size === "small" ? "w-6 h-6 text-[9px]" : size === "large" ? "w-14 h-14 text-xs" : "w-8 h-8 text-[10px]"
    }`} style={{ fontFamily: "'Batang', 'Gungsuh', serif", writingMode: "vertical-rl" }}>
      {text}
    </span>
  );

  const SquareOfficialSeal = ({ name = "정진이앤씨", title = "대표이사" }) => (
    <div className="w-16 h-16 border-2 border-red-600 p-0.5 inline-block text-center text-red-600 font-extrabold select-none" style={{ fontFamily: "'Batang', 'Gungsuh', serif" }}>
      <div className="border border-red-500 w-full h-full flex flex-col justify-center items-center text-[10px] leading-tight font-bold">
        <span>{(name.slice(0,2))}</span>
        <span>{(name.slice(2,4) || "이앤")}</span>
        <span>{title}</span>
        <span>직인</span>
      </div>
    </div>
  );

  // Reusable Chapter Cover Page Component (도비라 - EXACT MATCH WITH ORIGINAL SAMPLE IMAGE 1)
  const ChapterCoverPage = ({
    chapterNum = "제1장",
    chapterTitle = "일 반 사 항",
    subsections = [
      "1.1 점검대상물 위치도",
      "1.2 점검대상물 전경사진",
      "1.3 정기안전점검 실시결과 요약문"
    ]
  }: {
    chapterNum: string;
    chapterTitle: string;
    subsections: string[];
  }) => (
    <div className="page-container chapter-cover-page font-serif text-black relative bg-white w-full min-h-[1080px] h-[1080px] overflow-hidden">
      {/* Left Gray Sidebar running 100% top to bottom edge */}
      <div className="absolute left-0 top-0 bottom-0 w-[28%] bg-[#c8cbcf] flex flex-col justify-between overflow-hidden">
        {/* Upper solid gray block */}
        <div className="flex-1 w-full bg-[#c8cbcf]"></div>

        {/* 3 horizontal white stripes cutting across sidebar */}
        <div className="w-full space-y-3.5 my-6">
          <div className="w-full h-3.5 bg-white"></div>
          <div className="w-full h-3.5 bg-white"></div>
          <div className="w-full h-3.5 bg-white"></div>
        </div>

        {/* Lower solid gray block */}
        <div className="h-[210px] w-full bg-[#c8cbcf]"></div>
      </div>

      {/* Right Content Area */}
      <div className="ml-[28%] w-[72%] p-12 pr-16 pt-20 flex flex-col justify-start">
        {/* Top-Right Title */}
        <div className="text-right">
          <h1 className="text-3xl font-black text-black tracking-widest mb-1.5 font-serif">
            {chapterNum}
          </h1>
          <h2 className="text-2xl font-black text-black tracking-[0.2em] font-serif">
            {chapterTitle}
          </h2>
        </div>

        {/* Gray Horizontal Dividing Line */}
        <div className="w-full h-1.5 bg-[#8a929a] my-5"></div>

        {/* Subsections List */}
        <div className="mt-4 pl-6 space-y-4">
          {subsections.map((item, idx) => (
            <p key={idx} className="text-base font-bold text-black tracking-wide font-serif">
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );

  // Common Header & Footer for Content Pages
  const ContentHeader = ({ chapterTitle = "제1장 일반사항" }: { chapterTitle?: string }) => (
    <div className="w-full mb-6">
      <div className="flex justify-between items-end pb-1 text-xs font-bold text-black" style={{ fontFamily: "'Batang', serif" }}>
        <span className="text-sm tracking-tight">{projectName} 중 정기안전점검 용역</span>
        <span className="text-base font-extrabold tracking-widest">{chapterTitle}</span>
      </div>
      <div className="border-t-2 border-b border-black h-1"></div>
    </div>
  );

  const ContentFooter = ({ pageNum = 2 }: { pageNum?: number }) => (
    <div className="w-full mt-auto pt-4">
      <div className="border-t border-b-2 border-black h-1 mb-2"></div>
      <div className="flex justify-between items-center text-xs font-bold text-black" style={{ fontFamily: "'Batang', serif" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-sm">JEC</div>
          <span>{companyName}</span>
        </div>
        <span className="font-mono text-sm font-bold">- {pageNum} -</span>
        <span>{targetName} 정기안전점검({checkDegree}) 보고서</span>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-100 min-h-screen pb-20">
      {/* Action Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 flex flex-wrap justify-between items-center gap-4 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </button>
          <div className="h-4 w-[1px] bg-slate-300"></div>
          <span className="text-sm font-extrabold text-slate-900">
            🏢 {projectName} - {targetName} ({checkDegree}) 정교 복제 보고서
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-300 text-slate-500 opacity-60 cursor-not-allowed" 
                : "text-white bg-blue-700 hover:bg-blue-800 active:scale-95"
            }`}
          >
            <Printer className="w-4 h-4" />
            PDF 인쇄 / 저장
          </button>
          <button
            onClick={handleWordDownload}
            className={`flex items-center gap-2 text-xs font-bold border px-4 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                : "text-slate-800 bg-white hover:bg-slate-50 border-slate-300 active:scale-95"
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            Word(.doc) 다운로드
          </button>
        </div>
      </div>

      {/* Main Printable Document Sheet (Exact A4 Form Factor) */}
      <div 
        className="max-w-[820px] mx-auto bg-white my-8 p-0 shadow-2xl border border-slate-300 print:shadow-none print:border-none print:my-0 print:p-0"
        id="safety-report-print-area" 
        ref={printAreaRef}
        style={{ fontFamily: selectedFontCss }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body {
              background-color: white !important;
              color: black !important;
              font-family: ${selectedFontCss};
              margin: 0 !important;
              padding: 0 !important;
            }
            .page-container {
              page-break-after: always !important;
              page-break-inside: avoid !important;
              width: 210mm !important;
              min-height: 297mm !important;
              padding: 15mm 15mm 15mm 15mm !important;
              box-sizing: border-box !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              margin: 0 auto !important;
              background: white !important;
            }
            .page-container.chapter-cover-page {
              padding: 0 !important;
              display: block !important;
              position: relative !important;
              overflow: hidden !important;
            }
            .page-container:last-child {
              page-break-after: avoid !important;
            }
            .hide-on-print {
              display: none !important;
            }
          }
          .page-container {
            width: 100%;
            min-height: 1080px;
            padding: 48px 48px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: white;
            position: relative;
            border-bottom: 1px dashed #e2e8f0;
          }
          .page-container.chapter-cover-page {
            padding: 0 !important;
            display: block !important;
            position: relative !important;
            overflow: hidden !important;
          }
          .page-container:last-child {
            border-bottom: none;
          }
        `}} />

        {/* -------------------------------------------------------------------- */}
        {/* PAGE 1: 표지 (COVER PAGE) - EXACT MATCH WITH IMAGE 2 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-center text-black flex flex-col justify-between">
          <div className="pt-8">
            {/* Double top line */}
            <div className="border-t-2 border-b border-black py-6 px-4">
              <h2 className="text-xl font-bold tracking-widest text-black mb-3 leading-relaxed">
                {projectName}
              </h2>
              <h1 className="text-2xl font-black tracking-widest text-black mb-3 leading-relaxed">
                【 {targetName} 】
              </h1>
              <h3 className="text-xl font-extrabold tracking-[0.25em] text-black leading-relaxed">
                정 기 안 전 점 검 ( {checkDegree} ) 보 고 서
              </h3>
            </div>
          </div>

          <div className="my-auto py-24 text-center">
            <span className="text-xl font-bold tracking-[0.3em] text-black">
              {yearMonth}
            </span>
          </div>

          <div className="pb-8">
            <p className="text-xl font-extrabold tracking-[0.3em] text-black mb-3">
              {contractor}
            </p>
            <div className="border-t border-black w-3/4 mx-auto mb-4"></div>
            <div className="flex justify-center items-center gap-2">
              <div className="w-6 h-6 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-sm">JEC</div>
              <span className="text-lg font-bold tracking-[0.2em] text-black">
                {companyName}
              </span>
            </div>
          </div>
        </div>


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 2: 【제 출 문】 - EXACT MATCH WITH IMAGE 3 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <div>
            <div className="text-center my-8">
              <h1 className="text-2xl font-black tracking-widest text-black inline-block px-4 py-1 border-b-2 border-black">
                【 제 출 문 】
              </h1>
            </div>

            <div className="mt-12 space-y-8 text-sm leading-loose">
              <p className="text-base font-bold tracking-wider">
                {contractor} 대표이사 귀하
              </p>

              <p className="indent-4 leading-relaxed text-slate-900 font-medium text-base pt-6">
                귀 사에서 의뢰하신 <strong className="font-bold">&ldquo;{projectName}&rdquo;</strong> 의 {targetName} 정기안전점검 용역({checkDegree})에 대한 과업을 성실히 수행하고 그 결과를 본 보고서에 수록하여 부속자료와 함께 제출합니다.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-right text-sm font-bold tracking-widest mb-16">
              {checkDate}
            </p>

            <div className="flex justify-end items-end">
              <div className="text-right space-y-1 text-xs font-bold leading-relaxed pr-2">
                <p><span className="inline-block w-16">주 소 :</span> 전라남도 진도군·읍 남문길 52(3층)</p>
                <p><span className="inline-block w-16">상 호 :</span> ( 주 ) 정 진 이 앤 씨</p>
                <p><span className="inline-block w-16">대 표 자 :</span> 정   찬   욱</p>
              </div>
              <div className="ml-3">
                <SquareOfficialSeal name="정진이앤씨" title="대표이사" />
              </div>
            </div>
          </div>
        </div>


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 3: 【진단기관 등록증】 - EXACT MATCH WITH IMAGE 4 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <div>
            <div className="text-center mt-4 mb-2">
              <h1 className="text-2xl font-black tracking-widest text-black">
                【진단기관 등록증】
              </h1>
            </div>

            <p className="text-right text-xs font-semibold text-slate-700 mb-2">
              &lt; 소재지 변경 재교부 &gt;
            </p>

            <div className="border-2 border-black p-8 text-slate-900 relative">
              <div className="text-xs font-bold mb-6">전남 - 제15호</div>
              
              <h2 className="text-center text-xl font-black tracking-widest mb-10 text-black">
                안전진단전문기관 등록증
              </h2>

              <div className="space-y-4 text-xs font-bold leading-relaxed mb-12 pl-4">
                <p><span className="inline-block w-28">1. 상 호 :</span> {companyName}</p>
                <p><span className="inline-block w-28">2. 대 표 자 :</span> 정 찬 욱</p>
                <p><span className="inline-block w-28">3. 사무소 소재지 :</span> 전라남도 진도군 진도읍 남문길 52(3층)</p>
                <p><span className="inline-block w-28">4. 등 록 분 야 :</span> 교량 및 터널, 수리, 항만, 건축</p>
                <p><span className="inline-block w-28">5. 등 록 연 월 일 :</span> 2004년 6월 16일</p>
              </div>

              <p className="text-center text-xs font-bold leading-relaxed mb-10">
                「시설물의 안전 및 유지관리에 관한 특별법」 제28조에<br />
                따른 안전진단전문기관으로 등록합니다.
              </p>

              <p className="text-center text-xs font-bold tracking-widest mb-12">
                2024년 2월 8일
              </p>

              <div className="flex justify-center items-center gap-3 mt-4">
                <span className="text-lg font-black tracking-[0.4em] text-black">
                  전 라 남 도 지 사
                </span>
                <SquareOfficialSeal name="전라남도" title="지사인" />
              </div>
            </div>
          </div>
        </div>


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 4: 【참여기술진 명단】 - EXACT MATCH WITH IMAGE 5 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <div>
            <div className="text-center mt-4 mb-6">
              <h1 className="text-2xl font-black tracking-widest text-black">
                【참여기술진 명단】
              </h1>
            </div>

            <div className="mb-3">
              <p className="text-xs font-extrabold text-black border-b-2 border-black pb-1 inline-block">
                용 역 명 : {projectName} 중 정기안전점검 용역
              </p>
            </div>

            <table className="w-full text-[11px] border-collapse border-t-2 border-b-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-extrabold text-black">
                  <th className="border-r border-black p-2 w-[16%]">참여구분</th>
                  <th className="border-r border-black p-2 w-[22%]">참여분야</th>
                  <th className="border-r border-black p-2 w-[16%]">소 속</th>
                  <th className="border-r border-black p-2 w-[14%]">성 명</th>
                  <th className="border-r border-black p-2 w-[22%]">기술자격구분</th>
                  <th className="p-2 w-[10%]">서 명</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/40 text-black">
                <tr>
                  <td className="border-r border-black p-2 font-bold bg-slate-50">과업총괄(PM)</td>
                  <td className="border-r border-black p-2">과업책임기술자</td>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2 font-bold">{leadEngineer}</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목특급기술자<br />토목시공기술사</td>
                  <td className="p-2"><RedStamp text={leadEngineer} size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold bg-slate-50" rowSpan={8}>참 여 기 술 인</td>
                  <td className="border-r border-black p-2" rowSpan={8}>자료검토 및<br />기술지원</td>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">이 재 근</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목특급기술자<br />토목기사</td>
                  <td className="p-2"><RedStamp text="이재근" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">정 찬 욱</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목특급기술자<br />콘크리트기사</td>
                  <td className="p-2"><RedStamp text="정찬욱" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">이 민 행</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목특급기술자<br />학·경력자</td>
                  <td className="p-2"><RedStamp text="이민행" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">김 규 장</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목특급기술자<br />농업토목기술사<br />건설안전기사</td>
                  <td className="p-2"><RedStamp text="김규장" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">조 을 현</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목특급기술자<br />측량 및 지형공간정보기사</td>
                  <td className="p-2"><RedStamp text="조을현" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">정 경 수</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목특급기술자<br />토목기사</td>
                  <td className="p-2"><RedStamp text="정경수" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">김 한 규</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목특급기술자<br />학·경력자</td>
                  <td className="p-2"><RedStamp text="김한규" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">정 남 래</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목특급기술자<br />학·경력자</td>
                  <td className="p-2"><RedStamp text="정남래" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold bg-slate-50" rowSpan={4}>현장 조사 및<br />보고서 작성</td>
                  <td className="border-r border-black p-2" rowSpan={4}>현장 조사 및<br />보고서 작성</td>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">감 경 일</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목특급기술자<br />토목기사</td>
                  <td className="p-2"><RedStamp text="감경일" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">양 진 우</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목고급기술자<br />학·경력자</td>
                  <td className="p-2"><RedStamp text="양진우" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">김 지 민</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목중급기술자<br />학·경력자</td>
                  <td className="p-2"><RedStamp text="김지민" size="small" /></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">{companyName}</td>
                  <td className="border-r border-black p-2">임 현 승</td>
                  <td className="border-r border-black p-2 text-left pl-2">토목고급기술자<br />토목기사</td>
                  <td className="p-2"><RedStamp text="임현승" size="small" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 5: 【책임기술자 교육수료증】 - EXACT MATCH WITH IMAGE 6 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <div>
            <div className="text-center mt-4 mb-6">
              <h1 className="text-2xl font-black tracking-widest text-black">
                【책임기술자 교육수료증】
              </h1>
            </div>

            <div className="border-4 border-double border-slate-700 p-8 text-black relative">
              <p className="text-xs font-bold mb-4">제 보수-9726 호</p>

              <h2 className="text-center text-3xl font-black tracking-[0.5em] my-8">
                수  료  증
              </h2>

              <div className="space-y-4 text-xs font-bold leading-relaxed mb-8 pl-8">
                <p><span className="inline-block w-24">성      명 :</span> {leadEngineer}</p>
                <p><span className="inline-block w-24">생 년 월 일 :</span> 1975년 6월 11일</p>
                <p><span className="inline-block w-24">소      속 :</span> {companyName}</p>
                <p><span className="inline-block w-24">교 육 과 정 :</span> 정밀안전진단 보수교육과정</p>
                <p><span className="inline-block w-24">교 육 종 류 :</span> 교량터널(진단보수)</p>
                <p><span className="inline-block w-24">교  육  명 :</span> 25-0기 교량터널반 (진단보수)</p>
                <p><span className="inline-block w-24">교 육 기 간 :</span> 2024. 12. 18. ~ 2024. 12. 20. (14시간)</p>
              </div>

              <p className="text-center text-xs font-bold leading-loose mb-10 px-4">
                위 사람은 「시설물의 안전 및 유지관리에 관한 특별법」<br />
                시행령 제9조, 시행규칙 제10조, 지침 제94조에 따라<br />
                위의 교육과정을 수료하였으므로 이 증서를 수여합니다.
              </p>

              <p className="text-center text-xs font-bold tracking-widest mb-10">
                2024년 12월 20일
              </p>

              <div className="flex justify-center items-center gap-2 mt-4">
                <span className="text-lg font-black tracking-[0.3em]">
                  국 토 안 전 관 리 원 장
                </span>
                <SquareOfficialSeal name="국토안전" title="원장인" />
              </div>
            </div>
          </div>
        </div>


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 6 & 7: 보고서 목차 - EXACT MATCH WITH IMAGES 7 & 8 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <div>
            <div className="w-full my-4">
              <div className="bg-slate-200 border-t-2 border-b-2 border-black py-2 text-center shadow-inner">
                <h1 className="text-xl font-black tracking-[0.4em] text-black">
                  보고서 목차
                </h1>
              </div>
              <div className="border-t-4 border-slate-500 my-4"></div>
            </div>

            <div className="space-y-3 text-xs text-black font-semibold pt-2 leading-relaxed">
              <div className="flex justify-between font-bold text-sm">
                <span>제 1장 일반사항</span>
                <span>...........................................................................................................1</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>1.1 점검대상물 위치도</span>
                <span>...................................................................................................2</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>1.2 점검대상물 전경사진</span>
                <span>...................................................................................................3</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>1.3 정기안전점검 실시결과 요약문</span>
                <span>...................................................................................................4</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>1.3.1 과업개요</span>
                <span>............................................................................................4</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>1.3.2 대상시설물 점검결과</span>
                <span>............................................................................................5</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>1.3.3 점검결과 총평</span>
                <span>............................................................................................5</span>
              </div>

              <div className="flex justify-between font-bold text-sm pt-4">
                <span>제 2장 정기안전점검의 개요</span>
                <span>...........................................................................................................7</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>2.1 과업의 목적</span>
                <span>...................................................................................................8</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>2.2 공사현황</span>
                <span>...................................................................................................8</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>2.2.1 일반현황</span>
                <span>............................................................................................8</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>2.2.2 공사예정공정표</span>
                <span>............................................................................................9</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>2.3 건설기술진흥법 대상시설물 현황</span>
                <span>...................................................................................................10</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>2.4 정기안전점검의 범위 및 내용</span>
                <span>...................................................................................................10</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>2.4.1 정기안전점검 실시시기</span>
                <span>............................................................................................10</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>2.4.2 대상시설물 정기안전점검 시행 현황</span>
                <span>............................................................................................10</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>2.4.3 내용적 범위</span>
                <span>............................................................................................11</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>2.4.4 정기안전점검 과업내용</span>
                <span>............................................................................................11</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>2.5 사용장비 및 시험기기 현황</span>
                <span>...................................................................................................12</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>2.6 점검수행 일정 및 방법</span>
                <span>...................................................................................................13</span>
              </div>

              <div className="flex justify-between font-bold text-sm pt-4">
                <span>제 3장 점검대상물의 평가</span>
                <span>...........................................................................................................15</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>3.1 점검대상 구조물 개요</span>
                <span>...................................................................................................16</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.1.1 대상시설물 현황</span>
                <span>............................................................................................16</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.1.2 관련도면</span>
                <span>............................................................................................17</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.1.3 투입인원 및 장비계획</span>
                <span>............................................................................................19</span>
              </div>
            </div>
          </div>
        </div>

        {/* 목차 계속 (PAGE 7) */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <div>
            <div className="space-y-2.5 text-xs text-black font-semibold pt-4 leading-relaxed">
              <div className="flex justify-between pl-4">
                <span>3.2 사전자료 검토</span>
                <span>...................................................................................................23</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.2.1 건설기계(천공기) 안전점검</span>
                <span>............................................................................................23</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.2.2 지반조사 자료 및 시추주상도</span>
                <span>............................................................................................26</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>3.3 천공작업 외관조사 결과의 분석</span>
                <span>...................................................................................................29</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.3.1 시공 상태 점검의 개요</span>
                <span>............................................................................................29</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>3.4 안전점검 결과의 분석</span>
                <span>...................................................................................................35</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.4.1 구조물의 품질·시공 상태 등의 적정성</span>
                <span>............................................................................................35</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.4.2 품질·자재관리의 적정성</span>
                <span>............................................................................................38</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>3.5 인접건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성</span>
                <span>.........................................46</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.5.1 개요</span>
                <span>............................................................................................46</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.5.2 현장 인접 지하매설물 방호 및 안전대책</span>
                <span>............................................................................................47</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.5.3 건설현장 소음·진동</span>
                <span>............................................................................................50</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.5.5 인접시설물 안전조치의 적정성</span>
                <span>............................................................................................56</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.5.6 건설기계 사용에 대한 안전성</span>
                <span>............................................................................................57</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>3.6 공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성</span>
                <span>.........................................58</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>3.7 금회 점검 시 지적사항에 대한 조치결과 검토</span>
                <span>...................................................................................................59</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>3.8 건설공사 안전관리 검토</span>
                <span>...................................................................................................59</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.8.1 안전관리 검토의 목적</span>
                <span>............................................................................................59</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.8.2 안전점검의 기준</span>
                <span>............................................................................................59</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>3.8.3 건설공사 안전관리의 적정성</span>
                <span>............................................................................................60</span>
              </div>

              <div className="flex justify-between font-bold text-sm pt-4">
                <span>제 4장 종합결론</span>
                <span>...........................................................................................................64</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>4.1 정기안전점검의 결과의 종합결론</span>
                <span>...................................................................................................65</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>4.1.1 공사목적물의 품질·시공 상태 등의 적정성</span>
                <span>............................................................................................65</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>4.1.2 품질·자재관리의 적정성</span>
                <span>............................................................................................66</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>4.1.3 인접건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성</span>
                <span>............................................................................................66</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>4.1.4 공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성</span>
                <span>............................................................................................67</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>4.1.5 금회 점검 시 지적사항에 대한 조치결과 검토</span>
                <span>............................................................................................67</span>
              </div>
              <div className="flex justify-between pl-8 text-slate-800">
                <span>4.1.6 건설공사 안전관리 검토</span>
                <span>............................................................................................67</span>
              </div>
              <div className="flex justify-between pl-4">
                <span>4.2 시공 시 특별한 관리가 필요한 사항</span>
                <span>...................................................................................................68</span>
              </div>

              <div className="font-bold text-sm pt-4">
                <span>◎ 부 록</span>
              </div>
              <div className="pl-4">1. 안전관련자료</div>
              <div className="pl-4">2. 장비작업계획서</div>
            </div>
          </div>
        </div>


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 8: CHAPTER COVER PAGE (도비라 - 제1장) - EXACT MATCH WITH SAMPLE IMAGE */}
        {/* -------------------------------------------------------------------- */}
        <ChapterCoverPage
          chapterNum="제1장"
          chapterTitle="일 반 사 항"
          subsections={[
            "1.1  점검대상물 위치도",
            "1.2  점검대상물 전경사진",
            "1.3  정기안전점검 실시결과 요약문"
          ]}
        />


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 9: CONTENT PAGE 2 (1.1 점검대상물 위치도) - IMAGE 10 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <ContentHeader chapterTitle="제1장 일반사항" />

          <div className="my-2">
            <h2 className="text-base font-black text-black mb-3">
              1.1 점검대상물 위치도
            </h2>

            <div className="border-2 border-black p-2 bg-white">
              <div className="w-full h-80 bg-slate-100 overflow-hidden relative">
                <iframe 
                  src={mapIframeUrl}
                  width="100%" 
                  height="100%" 
                  className="border-0"
                  allowFullScreen={false} 
                  loading="lazy"
                  referrerPolicy="no-referrer"
                ></iframe>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-sm font-black text-black">[시설물 위치도]</h3>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                - {projectLocation}
              </p>
            </div>
          </div>

          <ContentFooter pageNum={2} />
        </div>


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 10: CONTENT PAGE 3 (1.2 점검대상물 전경사진) - IMAGE 11 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <ContentHeader chapterTitle="제1장 일반사항" />

          <div className="my-2">
            <h2 className="text-base font-black text-black mb-3">
              1.2 점검대상물 전경사진
            </h2>

            <div className="space-y-4">
              {report.photos && report.photos.length > 0 ? (
                report.photos.slice(0, 2).map((photo, pIdx) => (
                  <div key={pIdx} className="border-2 border-black p-1.5 bg-white">
                    <div className="w-full h-56 bg-slate-200 overflow-hidden flex items-center justify-center">
                      <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="border-t border-black mt-1 pt-1 text-center bg-slate-50">
                      <p className="text-xs font-bold text-black">{photo.caption || `${targetName} 작업중 전경(${pIdx+1})`}</p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="border-2 border-black p-1.5 bg-white">
                    <div className="w-full h-56 bg-slate-200 flex flex-col items-center justify-center text-slate-500">
                      <Building className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-bold">덕곡배수문 천공기 작업중 전경(1)</span>
                    </div>
                    <div className="border-t border-black mt-1 pt-1 text-center bg-slate-50">
                      <p className="text-xs font-bold text-black">덕곡배수문 천공기 작업중 전경(1)</p>
                    </div>
                  </div>

                  <div className="border-2 border-black p-1.5 bg-white">
                    <div className="w-full h-56 bg-slate-200 flex flex-col items-center justify-center text-slate-500">
                      <Building className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-bold">덕곡배수문 천공기 작업중 전경(2)</span>
                    </div>
                    <div className="border-t border-black mt-1 pt-1 text-center bg-slate-50">
                      <p className="text-xs font-bold text-black">덕곡배수문 천공기 작업중 전경(2)</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <ContentFooter pageNum={3} />
        </div>


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 11: CONTENT PAGE 4 (1.3.1 과업개요) - IMAGE 12 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <ContentHeader chapterTitle="제1장 일반사항" />

          <div className="my-1">
            <h2 className="text-base font-black text-black mb-2">
              1.3 정기안전점검 실시결과 요약문
            </h2>
            <h3 className="text-sm font-bold text-black mb-3">
              1.3.1 과업개요
            </h3>

            <table className="w-full text-xs border-collapse border-2 border-black text-left">
              <tbody className="divide-y divide-black">
                <tr>
                  <td className="w-1/4 font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">공 사 명</td>
                  <td className="w-3/4 p-2.5 font-bold text-black">{projectName}</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">공 사 위 치</td>
                  <td className="p-2.5 text-black">{projectLocation}</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">공 사 목 적</td>
                  <td className="p-2.5 text-black">국가하천인 남강의 치수안정도 확보 및 하천의 상태, 문화여가공간 조성</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">공 사 개 요</td>
                  <td className="p-2.5 text-black leading-relaxed">
                    □ 취약시설물보강 : 28개소(남강25개소, 가화천2개소, 덕천강1개소)<br />
                    □ 교량 : 2개소(정암교, 자전거교)<br />
                    □ 하도정비 : 1,000m(남강)<br />
                    □ 자전거도로(포장) : 1,151m
                  </td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">주 요 공 법</td>
                  <td className="p-2.5 text-black leading-relaxed">
                    □ 기초 : 복합말뚝기초<br />
                    □ 외부마감비계 : 시스템 비계<br />
                    □ 교량 가시설공법 : Sheet Pile, H-pile+토류판, STRUT<br />
                    □ 취약시설물 차수공법 : 심층혼합처리공법, 비약액주입공법
                  </td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">발 주 자</td>
                  <td className="p-2.5 text-black">{client}</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">시 공 자</td>
                  <td className="p-2.5 text-black font-bold">{contractor}</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">건 설 사 업 단</td>
                  <td className="p-2.5 text-black">{supervisor}</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">설 계 자</td>
                  <td className="p-2.5 text-black">(주)도화엔지니어링</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">공 사 금 액</td>
                  <td className="p-2.5 text-black font-semibold">23,008,098,000원</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2.5 bg-slate-200 border-r border-black text-center">공 사 기 간</td>
                  <td className="p-2.5 text-black">2025. 05. 21 ~ 2029. 05. 20</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ContentFooter pageNum={4} />
        </div>


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 12: CONTENT PAGE 5 (1.3.2 점검결과 & 1.3.3 총평) - IMAGE 13 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <ContentHeader chapterTitle="제1장 일반사항" />

          <div className="my-1 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-black mb-2">
                1.3.2 대상시설물 점검결과
              </h3>
              <table className="w-full text-xs border-collapse border-2 border-black text-center">
                <thead>
                  <tr className="bg-slate-200 border-b border-black font-extrabold text-black">
                    <th className="border-r border-black p-2 w-[35%]">점검항목</th>
                    <th className="border-r border-black p-2 w-[25%]">점검결과</th>
                    <th className="border-r border-black p-2 w-[20%]">개선대책</th>
                    <th className="p-2 w-[20%]">비 고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/50 text-black">
                  <tr>
                    <td className="border-r border-black p-2.5 text-left font-bold" rowSpan={2}>
                      공사 목적물의 품질·시공 상태 등의 적정성
                    </td>
                    <td className="border-r border-black p-2 text-left">천공기 거치 상태 적정성</td>
                    <td className="border-r border-black p-2 font-bold">양 호</td>
                    <td className="p-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-2 text-left">오거 및 와이어로프 상태</td>
                    <td className="border-r border-black p-2 font-bold">양 호</td>
                    <td className="p-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-2.5 text-left font-bold">
                      인접건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성
                    </td>
                    <td className="border-r border-black p-2 font-bold" colSpan={2}>적정하게 관리중</td>
                    <td className="p-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-2.5 text-left font-bold">
                      공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성
                    </td>
                    <td className="border-r border-black p-2 font-bold" colSpan={2}>적정하게 관리중</td>
                    <td className="p-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-2.5 text-left font-bold">
                      건설공사 안전관리 검토
                    </td>
                    <td className="border-r border-black p-2 font-bold" colSpan={2}>활발하게 활동중</td>
                    <td className="p-2">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-sm font-bold text-black mb-2">
                1.3.3 점검결과 총평
              </h3>
              <div className="border-2 border-black p-0 bg-white">
                <div className="bg-slate-200 border-b border-black p-2 text-center font-extrabold text-xs">
                  책임기술자 종합 의견
                </div>
                <div className="p-4 text-xs leading-relaxed text-black text-justify space-y-3">
                  <p className="indent-2">
                    대상시설물인 &ldquo;{projectName}&rdquo; 중 덕곡배수문 주변으로 차수벽을 설치하기 위하여 천공기 작업 현장의 안전시공 상태에 대한 면밀한 육안 점검을 실시하였다.
                  </p>
                  <p className="indent-2">
                    금회 정기안전점검 결과, 현장에 반입된 천공기는 건설기계 안전성검사 및 장비작업 계획서 검토결과 양호한 것으로 확인되었고 천공기의 제원 및 모델 등록번호판 등은 현장에 제출된 서류와 일치한 것으로 확인되었다.
                  </p>
                  <p className="indent-2">
                    작업전 하천변 주변 지반의 상태는 평탄하게 정리되어 있었으며, 부등침하로 인한 전도방지를 위해 전도방지 철판을 설치하여 운용중인 것으로 점검되었다. 또한, 천공작업시 신호수 및 관리감독자를 적절히 배치하고 작업구획을 설정하여 작업반경내 작업자의 접근을 차단하는 등 안전사고를 미연에 방지하고 있는 것으로 조사되었다. 당 현장은 차수벽 설치를 위한 천공작업이 진행 중인 상태로 작업수칙을 준수하여 시공 중인 것으로 확인되었으며, 앞으로의 후속공정 진행시에도 각 공종별로 잠재되어 있는 위험요인을 미연에 방지하여 무재해 현장으로 마무리될 수 있도록 하여야 할 것이다.
                  </p>
                  <div className="pt-4 flex justify-end items-center gap-2 font-bold">
                    <span>책임기술자 : {leadEngineer}</span>
                    <RedStamp text={leadEngineer} size="normal" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ContentFooter pageNum={5} />
        </div>


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 13: CHAPTER COVER PAGE (도비라 - 제2장) */}
        {/* -------------------------------------------------------------------- */}
        <ChapterCoverPage
          chapterNum="제2장"
          chapterTitle="정기안전점검의 개요"
          subsections={[
            "2.1  과업의 목적",
            "2.2  공사현황",
            "2.3  건설기술진흥법 대상시설물 현황",
            "2.4  정기안전점검의 범위 및 내용",
            "2.5  사용장비 및 시험기기 현황",
            "2.6  점검수행 일정 및 방법"
          ]}
        />


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 14: CONTENT PAGE 8 (2.1 과업의 목적 & 2.2 공사현황) - IMAGE 15 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <ContentHeader chapterTitle="제2장 정기안전점검의 개요" />

          <div className="my-1 space-y-4">
            <div>
              <h2 className="text-base font-black text-black mb-2">
                2.1 과업의 목적
              </h2>
              <p className="text-xs leading-relaxed text-black text-justify indent-2">
                본 과업은 건설기술 진흥법 제62조, 동법 시행령 제100조, 제101조 및 시행규칙 제59조의 규정에 의한 국토교통부 고시 제2022-791호 건설공사 안전관리 업무수행 지침 【별표1】에 따라 <strong className="font-bold">&ldquo;{projectName}&rdquo;</strong> 의 작업 중인 취약시설물보강의 천공기 작업에 대한 정기안전점검을 실시하는 것으로, 공사목적물의 품질·시공 상태 등의 적정성, 공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성, 인접 건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성 여부를 평가하고자 육안조사를 통하여 현장조사를 실시하고, 점검을 통한 문제점 발생 시 사전조치를 함으로써 건설공사의 안전을 확보함은 물론 향후 유지관리에 필요한 자료로 활용하고자 한다.
              </p>
            </div>

            <div>
              <h2 className="text-base font-black text-black mb-2">
                2.2 공사현황
              </h2>
              <h3 className="text-xs font-bold text-black mb-2">
                2.2.1 일반현황
              </h3>

              <table className="w-full text-xs border-collapse border-2 border-black text-left">
                <tbody className="divide-y divide-black">
                  <tr>
                    <td className="w-1/4 font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 명</td>
                    <td className="w-3/4 p-2 font-bold text-black">{projectName}</td>
                  </tr>
                  <tr>
                    <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 위 치</td>
                    <td className="p-2 text-black">{projectLocation}</td>
                  </tr>
                  <tr>
                    <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 목 적</td>
                    <td className="p-2 text-black">국가하천인 남강의 치수안정도 확보 및 하천의 상태, 문화여가공간 조성</td>
                  </tr>
                  <tr>
                    <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">발 주 자</td>
                    <td className="p-2 text-black">{client}</td>
                  </tr>
                  <tr>
                    <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">시 공 자</td>
                    <td className="p-2 text-black font-bold">{contractor}</td>
                  </tr>
                  <tr>
                    <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">건 설 사 업 단</td>
                    <td className="p-2 text-black">{supervisor}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <ContentFooter pageNum={8} />
        </div>

      </div>
    </div>
  );
}
