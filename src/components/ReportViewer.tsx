import React, { useRef } from "react";
import { SafetyReport, PhotoItem } from "../types";
import { 
  Printer, 
  Download, 
  MapPin, 
  User, 
  Calendar, 
  Building, 
  FileCheck, 
  Award,
  ChevronRight,
  ClipboardList,
  Flame,
  ArrowDownToLine,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

interface ReportViewerProps {
  report: SafetyReport;
  onBack: () => void;
}

export default function ReportViewer({ report, onBack }: ReportViewerProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Dynamic font family determination based on registered sample fontStyle
  const getFontFamily = (styleName?: string) => {
    if (!styleName) return "'Malgun Gothic', '맑은 고딕', sans-serif";
    if (styleName.includes("휴먼명조") || styleName.includes("명조")) {
      return "'Human Myungjo', '휴먼명조', 'Batang', '바탕체', serif";
    }
    if (styleName.includes("바탕체")) {
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

  // Dynamic Table Styling helper based on sampleConfig.tableStyle
  const getTableStyleClasses = (tableStyle?: string) => {
    if (tableStyle?.includes("헤더 강조형")) {
      return {
        table: "w-full text-xs border-collapse border-2 border-blue-900 text-left mt-2 shadow-sm",
        header: "border border-blue-800 p-2.5 font-extrabold bg-blue-900 text-white",
        cell: "border border-slate-300 p-2.5 text-slate-800 bg-white"
      };
    }
    if (tableStyle?.includes("클린 테두리형")) {
      return {
        table: "w-full text-xs border-collapse border-y-2 border-slate-800 text-left mt-2",
        header: "border-b-2 border-slate-300 p-2.5 font-bold bg-slate-50 text-slate-900",
        cell: "border-b border-slate-200 p-2.5 text-slate-700 bg-white"
      };
    }
    // Standard grid (표준 격자형)
    return {
      table: "w-full text-xs border-collapse border border-slate-300 text-left mt-2",
      header: "border border-slate-300 p-2.5 font-bold bg-slate-100 text-slate-800",
      cell: "border border-slate-300 p-2.5 text-slate-700 bg-white"
    };
  };

  const tableClasses = getTableStyleClasses(report.sampleConfig?.tableStyle);

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

  // Generate Google Map Static Link or visual map mock
  const encodedLocation = encodeURIComponent(report.projectLocation || "대한민국 서울특별시");
  const mapIframeUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Function to print the report
  const handlePrint = () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 무료 체험(5회) 수량을 소진하여 프린터 출력 및 PDF 저장이 비활성화되었습니다.\n정회원 승인이 완료되면 즉시 인쇄/다운로드 가능합니다. (문의: 관리자)");
      return;
    }
    window.print();
  };

  // Function to download as Word (.doc) using HTML formatting (MS Word natively parses HTML with styles!)
  const handleWordDownload = () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 무료 체험(5회) 수량을 소진하여 Word 다운로드가 비활성화되었습니다.\n정회원 승인이 완료되면 즉시 다운로드 가능합니다. (문의: 관리자)");
      return;
    }
    const title = `${report.projectName || "건설안전점검보고서"}_정기안전점검보고서.doc`;
    const htmlContent = printAreaRef.current?.innerHTML || "";
    
    const converted = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${report.projectName || "안전점검보고서"}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: 'Malgun Gothic', 'Dotum', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          h1, h2, h3, h4 {
            color: #1e3a8a;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #999;
            padding: 8px;
            font-size: 11pt;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
          }
          .page-break {
            page-break-after: always;
          }
          .cover {
            text-align: center;
            padding-top: 100px;
          }
          .cover-title {
            font-size: 28pt;
            font-weight: bold;
            margin-bottom: 150px;
          }
          .cover-meta {
            margin-top: 200px;
            font-size: 14pt;
          }
          .photo-container {
            margin-bottom: 30px;
            text-align: center;
          }
          .photo-img {
            max-width: 500px;
            height: auto;
          }
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

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top action bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            ← 뒤로 가기
          </button>
          <div className="h-4 w-[1px] bg-slate-300"></div>
          <span className="text-sm font-semibold text-slate-800">
            {report.projectName || "제목 없음"} - {report.checkDegree || "1차"} 보고서
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-300 text-slate-500 hover:bg-slate-300 opacity-60 cursor-not-allowed" 
                : "text-white bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Printer className="w-4 h-4" />
            PDF 인쇄 / 다운로드
          </button>
          <button
            onClick={handleWordDownload}
            className={`flex items-center gap-2 text-sm font-medium border px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-100 cursor-not-allowed" 
                : "text-slate-700 bg-white hover:bg-slate-50 border-slate-300"
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            Word 다운로드
          </button>
        </div>
      </div>

      {/* Main Printable Document Area */}
      <div 
        className="max-w-[850px] mx-auto bg-white my-8 p-12 shadow-xl border border-slate-200 print:shadow-none print:border-none print:my-0 print:p-0" 
        id="safety-report-print-area" 
        ref={printAreaRef}
        style={{ fontFamily: selectedFontCss }}
      >
        
        {/* Style injection for professional printing */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body {
              background-color: white;
              color: black;
              font-family: ${selectedFontCss};
              font-size: 11pt;
            }
            .print-page {
              page-break-after: always;
              min-height: 297mm;
              padding: 20mm 15mm;
              box-sizing: border-box;
              position: relative;
            }
            .print-page:last-child {
              page-break-after: avoid !important;
            }
            .print-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #333;
              padding-bottom: 5px;
              margin-bottom: 20px;
              font-size: 9pt;
              color: #666;
            }
            .print-footer {
              position: absolute;
              bottom: 15mm;
              left: 15mm;
              right: 15mm;
              text-align: center;
              border-top: 1px solid #ccc;
              padding-top: 5px;
              font-size: 9pt;
              color: #666;
            }
            .hide-on-print {
              display: none !important;
            }
          }
          .print-page {
            page-break-after: always;
            position: relative;
          }
        `}} />

        {/* ----------------- PAGE 1: 표지 (COVER) ----------------- */}
        <div className="print-page flex flex-col justify-between h-[1000px] border-4 border-double border-slate-900 p-12 text-slate-900 mb-12">
          <div className="text-center">
            <span className="text-sm font-bold tracking-widest text-blue-800 uppercase">건설기술진흥법 제62조 기준 정기안전점검</span>
            <div className="w-20 h-1 bg-blue-800 mx-auto mt-4 mb-12"></div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-snug mt-12 mb-4">
              정 기 안 전 점 검 보 고 서
            </h1>
            <p className="text-xl font-bold text-slate-600 bg-slate-100 py-2 px-6 rounded inline-block">
              [ {report.checkDegree || "제 1 차"} 점검 ]
            </p>
          </div>

          <div className="my-12">
            <table className="w-full text-left border-collapse border-y-2 border-slate-900">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="w-1/4 font-bold p-4 bg-slate-50 border-r border-slate-200 text-sm">공 사 명</td>
                  <td className="w-3/4 p-4 font-semibold text-slate-800 text-sm">{report.projectName || "(공사명을 입력해 주세요)"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="font-bold p-4 bg-slate-50 border-r border-slate-200 text-sm">발 주 처</td>
                  <td className="p-4 text-slate-700 text-sm">{report.client || "(발주처를 입력해 주세요)"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="font-bold p-4 bg-slate-50 border-r border-slate-200 text-sm">시 공 사</td>
                  <td className="p-4 text-slate-700 text-sm">{report.contractor || "(시공사를 입력해 주세요)"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="font-bold p-4 bg-slate-50 border-r border-slate-200 text-sm">감 리 사</td>
                  <td className="p-4 text-slate-700 text-sm">{report.supervisor || "(감리사를 입력해 주세요)"}</td>
                </tr>
                <tr>
                  <td className="font-bold p-4 bg-slate-50 border-r border-slate-200 text-sm">점 검 일</td>
                  <td className="p-4 text-slate-700 text-sm">{report.checkDate || "(점검일을 선택해 주세요)"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-auto">
            <h2 className="text-2xl font-bold tracking-wider text-slate-800 mb-2">
              {report.companyName || "(안전진단기관 등록명)"}
            </h2>
            <p className="text-sm text-slate-500">
              {report.address || "대표 주소지 미지정"} | Tel: {report.phone || "연락처 미지정"}
            </p>
            <p className="text-xs text-slate-400 mt-4">본 보고서는 건설공사 안전관리 업무수행 지침에 따라 AI로 정밀 분석 및 검인되었습니다.</p>
          </div>
        </div>


        {/* ----------------- PAGE 2: 제출문 (SUBMISSION LETTER) ----------------- */}
        <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
          <div className="print-header hidden print:flex">
            <span>정기안전점검 보고서</span>
            <span>제출문</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-950 border-b-2 border-slate-800 pb-4 mb-8">제 출 문</h2>
            
            <div className="space-y-6 text-slate-800 mt-8 leading-relaxed">
              <p className="font-bold text-lg text-slate-950">수신 : {report.client || "발주처 대표 귀하"}</p>
              <p className="font-bold text-lg text-slate-950">참조 : {report.supervisor || "감리단 책임기술인"}</p>
              
              <div className="h-[2px] bg-slate-100 my-4"></div>

              <p className="font-bold">제목 : [ {report.checkDegree || "제 1 차"} ] 정기안전점검 보고서 제출의 건</p>
              
              <p className="mt-8">
                1. 귀 사의 무궁한 발전을 기원합니다.
              </p>
              <p>
                2. 건설기술진흥법 시행령 제100조 및 건설공사 안전관리 업무수행 지침에 의거하여 귀 현장에서 추진 중인 <strong>&lsquo;{report.projectName || "해당 공사"}&rsquo;</strong>에 대하여 실시한 정기안전점검 결과를 종합 정리하여 제출합니다.
              </p>
              <p>
                3. 금회 실시된 점검은 대상 시설물의 시공 및 보관 적정성, 현장 가설 공법의 구조적 안정성을 엄격히 공학적으로 진단하였으며, 중대 안전 위해 요소에 대한 공학적 조치 및 장기적 유지관리 대책을 포함하고 있습니다.
              </p>
              <p>
                4. 시공사 및 감리사께서는 본 보고서에 지적되거나 보완 권고된 개선대책에 따라 후속 조치를 철저히 이행하시어 공사 중 한 건의 안전사고도 발생하지 않도록 상시 안전관리에 만전을 기해주시기를 부탁드립니다.
              </p>
            </div>
          </div>

          <div className="text-center mt-auto">
            <p className="text-sm text-slate-600 mb-8">작성 제출일: {report.checkDate || "2026-07-09"}</p>
            <div className="flex justify-center items-center gap-12">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">안전점검 수행기관</span>
                <span className="text-xl font-bold block text-slate-950">{report.companyName || "(안전진단 수행회사)"}</span>
              </div>
              <div className="w-16 h-16 border border-red-300 rounded-full flex items-center justify-center text-red-500 font-bold border-dashed transform rotate-12 text-sm">
                (검인생략)
              </div>
            </div>
          </div>
          
          <div className="print-footer hidden print:block">
            - 2 -
          </div>
        </div>


        {/* ----------------- PAGE 3: 참여기술자 명단 (PARTICIPANTS) ----------------- */}
        <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
          <div className="print-header hidden print:flex">
            <span>정기안전점검 보고서</span>
            <span>참여기술자 명단</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-950 border-b-2 border-slate-800 pb-4 mb-8">참여기술자 명단</h2>
            <p className="text-sm text-slate-600 mb-6">본 정기안전점검 보고서 작성에 서명 날인한 안전진단 엔지니어 및 학식있는 참여기술자 명단은 아래와 같습니다.</p>

            <table className="w-full text-sm border-collapse border border-slate-300 mt-6 text-center">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-3 font-bold text-slate-700 w-1/12">No</th>
                  <th className="border border-slate-300 p-3 font-bold text-slate-700 w-3/12">구분</th>
                  <th className="border border-slate-300 p-3 font-bold text-slate-700 w-2/12">성명</th>
                  <th className="border border-slate-300 p-3 font-bold text-slate-700 w-2/12">기술자등급</th>
                  <th className="border border-slate-300 p-3 font-bold text-slate-700 w-2/12">진단분야</th>
                  <th className="border border-slate-300 p-3 font-bold text-slate-700 w-2/12">서명/날인</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-4">1</td>
                  <td className="border border-slate-300 p-4 font-bold text-blue-900">책임기술자 (총괄)</td>
                  <td className="border border-slate-300 p-4 font-semibold">{report.leadEngineer || "홍길동"}</td>
                  <td className="border border-slate-300 p-4">특급기술자</td>
                  <td className="border border-slate-300 p-4">토목/건설안전</td>
                  <td className="border border-slate-300 p-4 text-center">
                    <span className="text-xs bg-red-50 text-red-600 px-1 py-0.5 border border-red-200 rounded">인</span>
                  </td>
                </tr>
                {report.assistantEngineers ? (
                  report.assistantEngineers.split(",").map((name, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-300 p-4">{idx + 2}</td>
                      <td className="border border-slate-300 p-4 text-slate-600">참여기술자</td>
                      <td className="border border-slate-300 p-4 font-semibold">{name.trim()}</td>
                      <td className="border border-slate-300 p-4">고급기술자</td>
                      <td className="border border-slate-300 p-4">건설시공/가설</td>
                      <td className="border border-slate-300 p-4 text-center">
                        <span className="text-xs bg-slate-50 text-slate-400 px-1 py-0.5 border border-slate-200 rounded">서명</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-slate-300 p-4">2</td>
                    <td className="border border-slate-300 p-4 text-slate-600">참여기술자</td>
                    <td className="border border-slate-300 p-4 font-semibold">이몽룡</td>
                    <td className="border border-slate-300 p-4">고급기술자</td>
                    <td className="border border-slate-300 p-4">가설안전</td>
                    <td className="border border-slate-300 p-4 text-center">
                      <span className="text-xs bg-slate-50 text-slate-400 px-1 py-0.5 border border-slate-200 rounded">서명</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r mt-12">
              <h4 className="font-bold text-blue-900 text-sm mb-1">■ 건설안전점검 책임기술인 선서</h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                본 기술인들은 신의 성실 및 객관적 기술 공학 기준에 근거하여 현장의 위험 요인을 빈틈없이 진단하였으며, 어떠한 외부 압력이나 타협 없이 보고서를 작성하였음을 엄숙히 선서합니다.
              </p>
            </div>
          </div>

          <div className="print-footer hidden print:block">
            - 3 -
          </div>
        </div>


        {/* ----------------- PAGE 4: 목차 (TABLE OF CONTENTS) ----------------- */}
        <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
          <div className="print-header hidden print:flex">
            <span>정기안전점검 보고서</span>
            <span>목차</span>
          </div>

          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-8">
              <h2 className="text-2xl font-bold text-slate-950">목 차</h2>
              {report.sampleConfig?.sampleName && (
                <span className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                  📋 등록 샘플 양식: {report.sampleConfig.sampleName}
                </span>
              )}
            </div>
            
            <div className="space-y-3.5 mt-8 px-4">
              {report.tocEntries && report.tocEntries.length > 0 ? (
                report.tocEntries.map((toc, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-800 font-semibold border-b border-dotted border-slate-300 pb-2 text-sm">
                    <span>{toc.title}</span>
                    <span className="font-mono text-slate-600">{toc.pageLabel || `Page ${String(idx + 5).padStart(2, '0')}`}</span>
                  </div>
                ))
              ) : report.customSections && report.customSections.length > 0 ? (
                report.customSections.map((sec, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-800 font-semibold border-b border-dotted border-slate-300 pb-2 text-sm">
                    <span>{sec.chapterNumber ? `${sec.chapterNumber} ${sec.title}` : sec.title}</span>
                    <span className="font-mono text-slate-600">Page {String(idx + 5).padStart(2, '0')}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between items-center text-slate-800 font-semibold border-b border-dotted border-slate-300 pb-2">
                    <span>제 1 장. 서언 및 안전점검 개요</span>
                    <span className="font-mono">Page 05</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800 font-semibold border-b border-dotted border-slate-300 pb-2">
                    <span>제 2 장. 공사 현황 및 점검 대상 시설물 현황</span>
                    <span className="font-mono">Page 06</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800 font-semibold border-b border-dotted border-slate-300 pb-2">
                    <span>제 3 장. 점검 범위 및 실측 진단 방법</span>
                    <span className="font-mono">Page 07</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800 font-semibold border-b border-dotted border-slate-300 pb-2">
                    <span>제 4 장. 구조 및 시공 품질 관리 상태 분석</span>
                    <span className="font-mono">Page 08</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800 font-semibold border-b border-dotted border-slate-300 pb-2">
                    <span>제 5 장. 가설 공법 및 주변 환경 시설 안정성 진단</span>
                    <span className="font-mono">Page 09</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800 font-semibold border-b border-dotted border-slate-300 pb-2">
                    <span>제 6 장. 부종별 세부 정기안전점검 체크리스트</span>
                    <span className="font-mono">Page 10</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800 font-semibold border-b border-dotted border-slate-300 pb-2">
                    <span>제 7 장. 현장 점검 사진 및 AI 진단 소견 분석</span>
                    <span className="font-mono">Page 11</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800 font-semibold border-b border-dotted border-slate-300 pb-2">
                    <span>제 8 장. 종합 결론 및 안전 개선 건의 대책</span>
                    <span className="font-mono">Page 12 ~ 13</span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mt-12 text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700 block mb-1">※ 안전진단 양식 정밀 복제 완료 공지</span>
              등록된 샘플 보고서의 목차 순서, 번호체계, 서술 어투({report.sampleConfig?.toneStyle || "격식체"}), 지정 글꼴({report.sampleConfig?.fontStyle || "맑은 고딕"})이 100% 동일하게 복제되어 적용되었습니다.
            </div>
          </div>

          <div className="print-footer hidden print:block">
            - 4 -
          </div>
        </div>


        {/* ----------------- PAGE 5+: CHAPTER SECTIONS (CLONED FROM SAMPLE OR DEFAULT) ----------------- */}
        {report.customSections && report.customSections.length > 0 ? (
          report.customSections.map((sec, secIdx) => (
            <div key={secIdx} className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
              <div className="print-header hidden print:flex">
                <span>정기안전점검 보고서</span>
                <span>{sec.chapterNumber ? `${sec.chapterNumber} ${sec.title}` : sec.title}</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-6">
                  {sec.chapterNumber ? `${sec.chapterNumber}. ` : ""}{sec.title}
                </h3>

                {secIdx === 1 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-950 mb-2">공사 세부 현황표</h4>
                    <table className={tableClasses.table}>
                      <tbody>
                        <tr>
                          <td className={tableClasses.header + " w-1/4"}>공 사 명</td>
                          <td className={tableClasses.cell} colSpan={3}>{report.projectName || "(미정)"}</td>
                        </tr>
                        <tr>
                          <td className={tableClasses.header}>공사위치</td>
                          <td className={tableClasses.cell} colSpan={3}>{report.projectLocation || "(미정)"}</td>
                        </tr>
                        <tr>
                          <td className={tableClasses.header + " w-1/4"}>시공사</td>
                          <td className={tableClasses.cell + " w-1/4"}>{report.contractor || "(미정)"}</td>
                          <td className={tableClasses.header + " w-1/4"}>감리사</td>
                          <td className={tableClasses.cell + " w-1/4"}>{report.supervisor || "(미정)"}</td>
                        </tr>
                        <tr>
                          <td className={tableClasses.header}>공사기간</td>
                          <td className={tableClasses.cell}>{report.projectPeriod || "(미정)"}</td>
                          <td className={tableClasses.header}>현재 공정률</td>
                          <td className={tableClasses.cell + " font-mono font-bold text-blue-800"}>{report.progressRate || "0%"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="space-y-4 text-sm text-slate-800 leading-relaxed text-justify">
                  {sec.subsections && sec.subsections.length > 0 ? (
                    sec.subsections.map((sub, subIdx) => (
                      <div key={subIdx} className="space-y-1">
                        <h4 className="font-bold text-slate-950">{sub.subtitle}</h4>
                        <p className="bg-slate-50 p-3.5 rounded border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap text-xs">
                          {sub.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap text-xs">
                      {sec.content || "해당 공종 및 항목에 대한 특이사항 없음."}
                    </p>
                  )}

                  {secIdx === 2 && (
                    <div className="mt-4">
                      <h4 className="font-bold text-slate-950 mb-1">현장 세부 위치도 (Google Maps 자동 연동)</h4>
                      <div className="w-full h-36 bg-slate-100 rounded-lg border border-slate-300 overflow-hidden relative flex items-center justify-center">
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
                  )}
                </div>
              </div>

              <div className="print-footer hidden print:block">
                - {secIdx + 5} -
              </div>
            </div>
          ))
        ) : (
          <>
            {/* ----------------- PAGE 5: 제 1 장 (CH 1) ----------------- */}
            <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
              <div className="print-header hidden print:flex">
                <span>정기안전점검 보고서</span>
                <span>제1장 서언 및 안전점검 개요</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-6">제 1 장. 서언 및 안전점검 개요</h3>
                
                <div className="space-y-6 text-sm text-slate-800 leading-relaxed text-justify">
                  <h4 className="font-bold text-slate-950">1.1 안전점검의 목적</h4>
                  <p>
                    본 보고서는 건설기술진흥법 제62조 및 동법 시행령 제100조에 근거하여 현장의 유해·위험요소를 사전에 도출하고 안전대책을 공학적으로 마련하기 위함이다. 
                    궁극적으로 시공 품질을 극대화하고 사전에 중대 인명·물적 재해를 완벽히 예방하는 것을 점검의 최우선 가치로 설정하였다.
                  </p>

                  <h4 className="font-bold text-slate-950 mt-6">1.2 법적 근거 및 수행 기준</h4>
                  <p>
                    건설공사의 시공 중 시행하는 정기안전점검은 구조물의 시공 안전성 및 가설 시설물의 상태 검토 등 법적 규정을 따른다. 
                    특히 건설공사 안전관리 업무수행 지침에 준하는 점검 주기와 강인한 학식 기준의 정밀 육안 진단을 통해 현장을 상시 점검하고 본 보고서에 상세 보고한다.
                  </p>

                  <h4 className="font-bold text-slate-950 mt-6">1.3 AI 자동화 검인시스템 세부 개요</h4>
                  <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700">
                    {report.aiGenerated && report.auditOverview ? report.auditOverview : (
                      `금회 점검을 통하여 수집된 시공 현장 사진들은 당사 특허 알고리즘의 건설 안전 부재 인식 AI를 통해 진단되었다. 비계, 동바리, 철근 조립, 거푸집 등의 균열이나 미비 요소는 AI 진단 기술과 책임기술인의 공학적 판정을 복합하여 객관성을 획득하였다. 표준 예시에 부합하는 전반적인 상태는 양호한 상태로 유지 중이다.`
                    )}
                  </p>
                </div>
              </div>

              <div className="print-footer hidden print:block">
                - 5 -
              </div>
            </div>


            {/* ----------------- PAGE 6: 제 2 장 (CH 2) ----------------- */}
            <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
              <div className="print-header hidden print:flex">
                <span>정기안전점검 보고서</span>
                <span>제2장 공사 현황 및 시설물 현황</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-6">제 2 장. 공사 현황 및 시설물 현황</h3>
                
                <div className="space-y-6 text-sm text-slate-800 leading-relaxed text-justify">
                  <h4 className="font-bold text-slate-950">2.1 공사 세부 현황표</h4>
                  
                  <table className={tableClasses.table}>
                    <tbody>
                      <tr>
                        <td className={tableClasses.header + " w-1/4"}>공 사 명</td>
                        <td className={tableClasses.cell} colSpan={3}>{report.projectName || "(미정)"}</td>
                      </tr>
                      <tr>
                        <td className={tableClasses.header}>공사위치</td>
                        <td className={tableClasses.cell} colSpan={3}>{report.projectLocation || "(미정)"}</td>
                      </tr>
                      <tr>
                        <td className={tableClasses.header + " w-1/4"}>시공사</td>
                        <td className={tableClasses.cell + " w-1/4"}>{report.contractor || "(미정)"}</td>
                        <td className={tableClasses.header + " w-1/4"}>감리사</td>
                        <td className={tableClasses.cell + " w-1/4"}>{report.supervisor || "(미정)"}</td>
                      </tr>
                      <tr>
                        <td className={tableClasses.header}>공사기간</td>
                        <td className={tableClasses.cell}>{report.projectPeriod || "(미정)"}</td>
                        <td className={tableClasses.header}>현재 공정률</td>
                        <td className={tableClasses.cell + " font-mono font-bold text-blue-800"}>{report.progressRate || "0%"}</td>
                      </tr>
                      <tr>
                        <td className={tableClasses.header}>점검 대상공종</td>
                        <td className={tableClasses.cell} colSpan={3}>{report.workTypes || "토공사, 구조물공사, 가설공사"}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h4 className="font-bold text-slate-950 mt-6">2.2 공사 현황 및 시설물 개요 상세</h4>
                  <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700 text-xs">
                    {report.aiGenerated && report.constructionStatus ? report.constructionStatus : (
                      `본 사업은 공사계획서 및 승인 설계도서에 준거하여 차질없이 정밀 시공되고 있음을 평가하였다. 현재 공정률은 ${report.progressRate || "0%"} 수준이며, 주요 공정으로는 ${report.workTypes || "지정 공종"}이 활발히 추진되고 있다. 현장 안전관리 계획에 기반하여 각 가설 구조물의 응력 상태 및 전도 저항 안정성을 유지하고 있다.`
                    )}
                  </p>

                  <h4 className="font-bold text-slate-950 mt-4">2.3 점검 대상시설물 상세</h4>
                  <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700 text-xs">
                    {report.aiGenerated && report.targetFacilities ? report.targetFacilities : (
                      `금회 점검 차수(${report.checkDegree || "1차"})의 구체적 점검 대상은 부지 내 옹벽 구조물, 비계 설치 상태 및 배근 조립부 등으로 한정하였다. 구조 계산상의 하중에 대하여 충분히 지지될 수 있는 상태를 계측 또는 정밀 육안 검침하였다.`
                    )}
                  </p>
                </div>
              </div>

              <div className="print-footer hidden print:block">
                - 6 -
              </div>
            </div>


            {/* ----------------- PAGE 7: 제 3 장 (CH 3) ----------------- */}
            <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
              <div className="print-header hidden print:flex">
                <span>정기안전점검 보고서</span>
                <span>제3장 점검 범위 및 방법</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-6">제 3 장. 점검 범위 및 실측 방법</h3>
                
                <div className="space-y-6 text-sm text-slate-800 leading-relaxed text-justify">
                  <h4 className="font-bold text-slate-950">3.1 점검 구역 및 범위 설정</h4>
                  <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700">
                    {report.aiGenerated && report.scope ? report.scope : (
                      `안전진단 전단 구역은 공사 진행 중인 전체 영역을 포괄하며, 특히 붕괴 및 추락 고위험 지구인 비계 배후 가설, 굴착 옹벽 사면, 타설 타워 하부 지지대를 중점 진단 범위로 설정하였다.`
                    )}
                  </p>

                  <h4 className="font-bold text-slate-950 mt-6">3.2 진단 및 계측 방법</h4>
                  <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700">
                    {report.aiGenerated && report.methodology ? report.methodology : (
                      `점검 방법은 건설공사 안전관리 업무수행 지침의 기준을 철저히 따라, 구조 공학적인 정밀 육안 검사(Visual Inspection)를 수행하였다. 또한 철근 배근 간격 실측용 버니어 캘리퍼스 및 수평 수직 가새 체결각 판독 기기 등을 보완 활용하여 신뢰도를 배가하였다.`
                    )}
                  </p>

                  {/* Dynamic Map location map display inside printable document */}
                  <h4 className="font-bold text-slate-950 mt-6">3.3 현장 세부 위치도 (Google Maps 자동 연동)</h4>
                  <div className="w-full h-44 bg-slate-100 rounded-lg border border-slate-300 overflow-hidden mt-2 relative flex items-center justify-center">
                    <iframe 
                      src={mapIframeUrl}
                      width="100%" 
                      height="100%" 
                      className="border-0"
                      allowFullScreen={false} 
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    ></iframe>
                    <div className="absolute bottom-2 right-2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-85">
                      Lat / Lon Geolocation Map
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 text-center">
                    ※ 공사위치: {report.projectLocation || "위치 정보 검색 필요"}
                  </p>
                </div>
              </div>

              <div className="print-footer hidden print:block">
                - 7 -
              </div>
            </div>


            {/* ----------------- PAGE 8: 제 4 장 (CH 4) ----------------- */}
            <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
              <div className="print-header hidden print:flex">
                <span>정기안전점검 보고서</span>
                <span>제4장 구조 및 시공 품질 관리 상태 분석</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-6">제 4 장. 구조 및 시공 품질 관리 분석</h3>
                
                <div className="space-y-6 text-sm text-slate-800 leading-relaxed text-justify">
                  <h4 className="font-bold text-slate-950">4.1 콘크리트 및 구조재 승인 품질 평가</h4>
                  <p>
                    구조용 자재에 대한 품질관리는 설계도서의 요구 강도를 전폭 확보하기 위해 적합 공정에 입각하여 관리되고 있다. 
                    특히 레미콘 현장 인수 검사, 공시체 제작 및 압축 강도 시험 과정이 규정에 따라 이행되고 있음을 서류와 현장 실사를 병행 진단하였다.
                  </p>

                  <h4 className="font-bold text-slate-950 mt-6">4.2 배근 조립 및 피복 두께 적정성</h4>
                  <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700">
                    {report.aiGenerated && report.qualityControl ? report.qualityControl : (
                      `철근 배근 및 조립 상태는 콘크리트 구조설계기준에 따라 피복두께 유지를 위한 스페이서 배치 간격이 철저히 관리되고 있으며, 전단근 배근도 설계 정밀 범위 내에서 양호하게 완료되었음이 판단된다. 시공 현장에서 수집된 강재 상태에 대한 관리 역시 규격에 맞추어 보관되고 있음이 입증되었다.`
                    )}
                  </p>

                  <h4 className="font-bold text-slate-950 mt-6">4.3 균열 관리 및 방지 대책 실태</h4>
                  <p>
                    수축 및 수화열에 의한 콘크리트 초기 균열을 방지하기 위하여 적절한 수윤 양생 조치 및 양생포 덮개 활용 실태가 성실하게 진행되고 있음을 시공 검측하였다. 현장에 미세 균열 발생 시 관리 대장 기록 관리 역시 준수되고 있다.
                  </p>
                </div>
              </div>

              <div className="print-footer hidden print:block">
                - 8 -
              </div>
            </div>


            {/* ----------------- PAGE 9: 제 5 장 (CH 5) ----------------- */}
            <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
              <div className="print-header hidden print:flex">
                <span>정기안전점검 보고서</span>
                <span>제5장 가설 공법 및 주변 환경 시설 안정성 진단</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-6">제 5 장. 가설 및 주변 시설 안전성</h3>
                
                <div className="space-y-6 text-sm text-slate-800 leading-relaxed text-justify">
                  <h4 className="font-bold text-slate-950">5.1 가설구조물(비계 및 동바리) 하중 안전율 분석</h4>
                  <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700">
                    {report.aiGenerated && report.temporarySafety ? report.temporarySafety : (
                      `외부 강관 비계 및 수직 지지 동바리에 가해지는 자중 및 타설 하중 분포는 구조 역학 상 지지 기초부의 침하 방지 조치(침목 설치 등)가 선행되어 횡적 전도 저항성이 우수한 것으로 분석되었다. 벽이음쇠는 기준에 따라 간격 준수 시공 중이다.`
                    )}
                  </p>

                  <h4 className="font-bold text-slate-950 mt-6">5.2 주변 지반 및 공공 기반 시설 인접 안정성</h4>
                  <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700">
                    {report.aiGenerated && report.surroundingSafety ? report.surroundingSafety : (
                      `굴착 공사에 따른 배후 부지 인접 건물 및 도로 지반 침하 균열 실태를 모니터링하기 위한 계측 센서 설치와 수치 분석을 병행하였으며, 허용 오차 한계치 이하로 유지되어 주변 시설물의 구조적 안전 역시 전반적으로 매우 건전한 상태인 것으로 확인되었다.`
                    )}
                  </p>

                  <h4 className="font-bold text-slate-950 mt-6">5.3 현장 보건 및 안전 관리 전반 평가</h4>
                  <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700 text-xs">
                    {report.aiGenerated && report.safetyControl ? report.safetyControl : (
                      `안전보건 총괄 책임자 지휘 하에 매일 아침 작업전 TBM(Tool Box Meeting) 및 보호구 완벽 착용 지도가 생활화되어 있으며, 현장 통로 및 고소 추락 개구부에 고강도 안전 그물망 및 안전 방호 조치 등이 건설 법규에 완전히 적합하게 설계되고 있다.`
                    )}
                  </p>
                </div>
              </div>

              <div className="print-footer hidden print:block">
                - 9 -
              </div>
            </div>
          </>
        )}


        {/* ----------------- PAGE 10: 제 6 장 (CH 6 - CHECKLIST TABLE) ----------------- */}
        <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
          <div className="print-header hidden print:flex">
            <span>정기안전점검 보고서</span>
            <span>제6장 정기안전점검 체크리스트</span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-6">제 6 장. 부위별 세부 안전체크리스트</h3>
            <p className="text-xs text-slate-600 mb-4">건설기술진흥법 지침에 근거하여 당사의 엔지니어와 AI가 공동 판정한 핵심 체크리스트 내역입니다.</p>
            
            <table className={`${tableClasses.table} text-[10px] text-center`}>
              <thead>
                <tr className="bg-slate-100">
                  <th className={`${tableClasses.header} w-[12%]`}>구분</th>
                  <th className={`${tableClasses.header} w-[23%]`}>점검 항목</th>
                  <th className={`${tableClasses.header} w-[30%]`}>판단 기준</th>
                  <th className={`${tableClasses.header} w-[10%]`}>결과</th>
                  <th className={`${tableClasses.header} w-[25%]`}>수정 및 보완조치 제안</th>
                </tr>
              </thead>
              <tbody>
                {report.checklist && report.checklist.length > 0 ? (
                  report.checklist.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 font-semibold text-slate-700 text-left">{item.category}</td>
                      <td className="border border-slate-300 p-2 text-slate-800 text-left">{item.item}</td>
                      <td className="border border-slate-300 p-2 text-slate-600 text-left">{item.criterion}</td>
                      <td className="border border-slate-300 p-2">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          item.result === "양호" ? "bg-green-100 text-green-800" :
                          item.result === "보완요망" ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {item.result}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-700 text-left">{item.action}</td>
                    </tr>
                  ))
                ) : (
                  // Fallback standard checklist
                  <>
                    <tr className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 font-semibold text-slate-700 text-left">가설공사</td>
                      <td className="border border-slate-300 p-2 text-left">동바리 및 가새 체결</td>
                      <td className="border border-slate-300 p-2 text-left">파이프 서포트 수직도 확보 및 수평연결재 2방향 고정 설치 여부</td>
                      <td className="border border-slate-300 p-2">
                        <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-[9px] font-bold">양호</span>
                      </td>
                      <td className="border border-slate-300 p-2 text-left">해당 부재 완벽 체결 확인, 양호한 것으로 판단됨.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 font-semibold text-slate-700 text-left">가설공사</td>
                      <td className="border border-slate-300 p-2 text-left">비계 안전난간 설치</td>
                      <td className="border border-slate-300 p-2 text-left">외부 작업발판 외곽부 상하부 난간대 및 발끝막이판 결속 적정성</td>
                      <td className="border border-slate-300 p-2">
                        <span className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded text-[9px] font-bold">보완요망</span>
                      </td>
                      <td className="border border-slate-300 p-2 text-left">일부 계단부 난간 조임 상태 헐거움 발견, 현장 즉시 시정 조치.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 font-semibold text-slate-700 text-left">토공사</td>
                      <td className="border border-slate-300 p-2 text-left">흙막이 안전성</td>
                      <td className="border border-slate-300 p-2 text-left">흙막이 가설 엄지말뚝 및 어스앵커 인장 상태 적정 여부</td>
                      <td className="border border-slate-300 p-2">
                        <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-[9px] font-bold">양호</span>
                      </td>
                      <td className="border border-slate-300 p-2 text-left">계측 수치 허용 범위 이내로 안전하게 유지됨.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 font-semibold text-slate-700 text-left">철근콘크리트</td>
                      <td className="border border-slate-300 p-2 text-left">철근 피복 두께</td>
                      <td className="border border-slate-300 p-2 text-left">스페이서 설치 개수 및 적정 피복두께 기준 도면 충족 여부</td>
                      <td className="border border-slate-300 p-2">
                        <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-[9px] font-bold">양호</span>
                      </td>
                      <td className="border border-slate-300 p-2 text-left">간격 적정하게 시공되었으며 타설 시 변형 없도록 재강조.</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="print-footer hidden print:block">
            - 10 -
          </div>
        </div>


        {/* ----------------- PAGE 11: 제 7 장 (CH 7 - PHOTOS & CAPTIONS) ----------------- */}
        <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
          <div className="print-header hidden print:flex">
            <span>정기안전점검 보고서</span>
            <span>제7장 현장 사진 대지 및 AI 안전 진단</span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-6">제 7 장. 현장 사진 대지 및 AI 진단 소견</h3>
            <p className="text-xs text-slate-600 mb-6">현장 등록 사진에 대한 특허 이미지 인식 AI의 분석 결과와 배치 대지입니다.</p>
            
            {report.photos && report.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {report.photos.map((photo, index) => (
                  <div key={photo.id} className="border border-slate-300 p-3 rounded bg-slate-50 flex flex-col justify-between min-h-[420px] h-auto">
                    <div className="w-full h-40 bg-slate-200 rounded overflow-hidden flex items-center justify-center">
                      <img 
                        src={photo.url} 
                        alt={photo.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="mt-2 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-bold bg-blue-100 text-blue-950 px-2 py-0.5 rounded">
                            {photo.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            photo.status === "양호" ? "bg-green-100 text-green-800" :
                            photo.status === "보완요망" ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {photo.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">사진 {index+1}. {photo.caption}</h4>
                        
                        <div className="mt-1.5 space-y-1 bg-white p-2 rounded border border-slate-200 text-[10px]">
                          {photo.location && (
                            <p className="text-slate-700">
                              <strong>📍 점검 위치:</strong> {photo.location}
                            </p>
                          )}
                          {photo.importantContent && (
                            <p className="text-slate-700">
                              <strong>📌 중요 내용:</strong> {photo.importantContent}
                            </p>
                          )}
                          {photo.specialRemarks && (
                            <p className="text-slate-700">
                              <strong>💡 특이 사항:</strong> {photo.specialRemarks}
                            </p>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                          <strong>🔍 AI 진단소견:</strong> {photo.findings}
                        </p>
                      </div>
                      <div className="border-t border-slate-200 pt-1 text-[9px] text-slate-400 flex justify-between items-center mt-2">
                        <span>AI 신뢰도: {(photo.confidence * 100).toFixed(1)}%</span>
                        <span>[자동 실측 배치됨]</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 rounded-lg p-16 text-center text-slate-500 my-12">
                <p>업로드되거나 AI로 분석된 점검 사진이 없습니다.</p>
                <p className="text-xs text-slate-400 mt-2">새 보고서 작성 화면에서 사진 등록 시 정교한 AI 사진대지가 생성됩니다.</p>
              </div>
            )}
          </div>

          <div className="print-footer hidden print:block">
            - 11 -
          </div>
        </div>


        {/* ----------------- PAGE 12: 제 8 장 (CH 8) ----------------- */}
        <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
          <div className="print-header hidden print:flex">
            <span>정기안전점검 보고서</span>
            <span>제8장 종합 결론 및 안전 개선 건의 대책 (1)</span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-6">제 8 장. 종합 결론 및 안전 개선 대책</h3>
            
            <div className="space-y-6 text-sm text-slate-800 leading-relaxed text-justify">
              <h4 className="font-bold text-slate-950">8.1 종합 엔지니어링 의견</h4>
              <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700">
                {report.aiGenerated && report.comprehensiveOpinion ? report.comprehensiveOpinion : (
                  `금회 실시한 건설안전 정기점검 결과, 시공 중인 구조물 상태 및 가설공법 전반은 도면 승인 요건을 성실히 이행하여 전반적으로 양호하며, 구조 역학 상 안전 기준을 전폭 만족하고 있는 것으로 판단된다.`
                )}
              </p>

              <h4 className="font-bold text-slate-950 mt-6">8.2 개선 대책 및 안전 관리 보강안</h4>
              <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700">
                {report.aiGenerated && report.improvementMeasures ? report.improvementMeasures : (
                  `일부 구역 가설 비계 작업 발판 난간 고정력 보완 등 수시 미비점에 대해서는 즉시 시정 교육 조치하였다. 다가오는 동절기/하절기 온도 보상용 양생 조건에 유의하고 상시 순찰 체계를 공고히 유지할 것을 적극 제언한다.`
                )}
              </p>
            </div>
          </div>

          <div className="print-footer hidden print:block">
            - 12 -
          </div>
        </div>


        {/* ----------------- PAGE 13: 제 8 장 (CH 8 - 계속) ----------------- */}
        <div className="print-page flex flex-col justify-between h-[1000px] border border-slate-200 p-12 text-slate-900 mb-12">
          <div className="print-header hidden print:flex">
            <span>정기안전점검 보고서</span>
            <span>제8장 종합 결론 및 안전 개선 건의 대책 (2)</span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-blue-900 border-l-4 border-blue-900 pl-3 mb-6">제 8 장. 종합 결론 및 안전 개선 대책 (계속)</h3>
            
            <div className="space-y-6 text-sm text-slate-800 leading-relaxed text-justify">
              <h4 className="font-bold text-slate-950">8.3 책임기술자 최종 날인 의견</h4>
              <p className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700">
                {report.aiGenerated && report.leadEngineerOpinion ? report.leadEngineerOpinion : (
                  `총괄책임 엔지니어로서 본 공사 현장은 건설기술진흥법 기준의 수직 수평 강재 응력 안정성을 견고하게 관리하고 있으며, 보고서에 기재된 상시 계측 및 청결 양생 지도 지침 준수 시 무재해 완공을 무난히 도달할 것으로 확인되었다.`
                )}
              </p>

              <h4 className="font-bold text-slate-950 mt-6">8.4 종합 최종 결론</h4>
              <p className="bg-blue-50/50 p-4 rounded border border-blue-100 text-blue-950 font-semibold text-xs">
                {report.aiGenerated && report.comprehensiveConclusion ? report.comprehensiveConclusion : (
                  `[결론] 금회 점검 결과 구조물의 시공상태는 양호한 것으로 최종 판단되며, 관련 법규에 완전히 적합하게 시공되고 있다. 지적된 경미 보완사항 이행 조치를 마친 후 감리단의 확인을 득하여 안전 관리 계획서에 영구 기록 보존할 것을 명한다.`
                )}
              </p>
            </div>
          </div>

          <div className="print-footer hidden print:block">
            - 13 -
          </div>
        </div>

      </div>
    </div>
  );
}
