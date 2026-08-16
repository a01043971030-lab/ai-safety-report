import React, { useRef, useState, useEffect } from "react";
import { SafetyReport, PhotoItem } from "../types";
import { Printer, Download, MapPin, Building, Shield, FileText, ArrowLeft, FileCode2, Copy, Check, FileSpreadsheet, Presentation, Sparkles, Award, Bot, MessageSquare } from "lucide-react";
import { ReportViewerChapters } from "./ReportViewerChapters";
import ReportChatEditor from "./ReportChatEditor";

interface ReportViewerProps {
  report: SafetyReport;
  onBack: () => void;
  onUpdateReport?: (updatedReport: SafetyReport) => void;
}

export default function ReportViewer({ report, onBack, onUpdateReport }: ReportViewerProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [activeReport, setActiveReport] = useState<SafetyReport>(report);
  const [showChatEditor, setShowChatEditor] = useState(false);

  useEffect(() => {
    setActiveReport(report);
  }, [report]);

  const handleUpdateActiveReport = (updated: SafetyReport) => {
    setActiveReport(updated);
    if (onUpdateReport) {
      onUpdateReport(updated);
    }
  };

  // Dynamic font family determination - Uniform Batang / Myeongjo for all documents
  const getFontFamily = (styleName?: string) => {
    return "'Batang', '바탕체', 'Nanum Myeongjo', '나눔명조', 'Noto Serif KR', serif";
  };

  const selectedFontCss = getFontFamily(activeReport.sampleConfig?.fontStyle);

  // Helper to format date strings into Korean format "2026년 08월 13일"
  const formatKoreanDate = (dateStr?: string) => {
    if (!dateStr) return "2026년 05월 12일";
    const str = dateStr.trim();
    if (str.includes("년") && str.includes("월")) return str;
    const match = str.match(/^(\d{4})[-.\/]?(\d{1,2})[-.\/]?(\d{1,2})/);
    if (match) {
      const y = match[1];
      const m = match[2].padStart(2, "0");
      const d = match[3].padStart(2, "0");
      return `${y}년 ${m}월 ${d}일`;
    }
    return str;
  };

  const formatYearMonth = (dateStr?: string) => {
    if (!dateStr) return "2026년 04월";
    const str = dateStr.trim();
    const match = str.match(/^(\d{4})[-.\/]?(\d{1,2})/);
    if (match) {
      return `${match[1]}년 ${match[2].padStart(2, "0")}월`;
    }
    if (str.includes("년") && str.includes("월")) {
      return str.split("월")[0] + "월";
    }
    return "2026년 04월";
  };

  // Default values matching sample PDF exactly if not provided
  const projectName = activeReport.projectName || "늑용~유치간 지방도 4차로 확포장공사";
  const targetName = activeReport.workTypes || "옹벽";
  const checkDegree = activeReport.checkDegree || "1차";
  const contractor = activeReport.contractor || "보광종합건설(주)";
  const client = activeReport.client || "전라남도";
  const supervisor = activeReport.supervisor || "㈜동아기술공사, ㈜삼안";
  const companyName = activeReport.companyName || "(주)정진이앤씨";
  const leadEngineer = activeReport.leadEngineer || "박경포";
  const rawCheckDate = activeReport.checkDate || "2026년 06월 10일";
  const checkDate = formatKoreanDate(rawCheckDate);
  const yearMonth = "2026. 06";
  const projectLocation = activeReport.projectLocation || "전남 장흥군 유치면 늑용리 산32-24 ~ 용문리788";

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

  const [copySuccess, setCopySuccess] = useState(false);

  const handlePrint = () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 무료 체험 수량을 소진하여 프린터 출력 및 PDF 저장이 제한됩니다.\n정회원 승인 후 출력이 가능합니다.");
      return;
    }
    window.print();
  };

  // 1. HWPX (한글 표준 XML 문서) File Export
  const handleHwpxDownload = () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 무료 체험 수량을 소진하여 한글(HWPX) 파일 다운로드가 제한됩니다.");
      return;
    }
    const cleanProjectName = (projectName || "정기안전점검").replace(/[\/\\:*?"<>|]/g, "_");
    const filename = `${cleanProjectName}_정기안전점검보고서.hwpx`;
    const htmlContent = printAreaRef.current?.innerHTML || "";

    const hwpxContent = `\uFEFF<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko" lang="ko">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="generator" content="Hancom Office / HWPX Exporter" />
  <title>${projectName}</title>
  <style type="text/css">
    @page { size: 210mm 297mm; margin: 15mm; }
    body { font-family: 'Batang', '바탕', '바탕체', 'Nanum Myeongjo', serif; font-size: 10pt; line-height: 1.6; color: #000000; word-break: keep-all; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 12px; page-break-inside: avoid; border: 1px solid #000; }
    th, td { border: 1px solid #000000; padding: 6px 8px; font-size: 9.5pt; text-align: center; vertical-align: middle; }
    th { background-color: #f2f4f8; font-weight: bold; }
    .page-container { page-break-after: always; width: 100%; min-height: 270mm; box-sizing: border-box; background: #ffffff; }
    .page-break { page-break-after: always; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([hwpxContent], { type: "application/vnd.hancom.hwpx;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. HWP (아래아한글 문서) File Export
  const handleHwpDownload = () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 무료 체험 수량을 소진하여 한글(HWP) 파일 다운로드가 제한됩니다.");
      return;
    }
    const cleanProjectName = (projectName || "정기안전점검").replace(/[\/\\:*?"<>|]/g, "_");
    const filename = `${cleanProjectName}_정기안전점검보고서.hwp`;
    const htmlContent = printAreaRef.current?.innerHTML || "";

    const hwpContent = `\uFEFF<!DOCTYPE html>
<html lang="ko">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="Generator" content="Hancom Office HWP Document">
  <title>${projectName}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
    body { font-family: 'Batang', '바탕체', 'Nanum Myeongjo', '나눔명조', serif; font-size: 10pt; line-height: 1.6; color: #000000; word-break: keep-all; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #000000; }
    th, td { border: 1px solid #000000; padding: 6px 8px; font-size: 9.5pt; text-align: center; vertical-align: middle; }
    th { background-color: #F0F0F0; font-weight: bold; }
    .page-container { page-break-after: always; width: 100%; margin: 0; padding: 0; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([hwpContent], { type: "application/x-hwp;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Copy HWP Formatted HTML to Clipboard for Direct Ctrl+V into 아래아한글
  const handleHwpClipboardCopy = async () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 무료 체험 수량을 소진하여 복사 기능이 제한됩니다.");
      return;
    }
    const htmlContent = printAreaRef.current?.innerHTML || "";
    try {
      const blobHtml = new Blob([htmlContent], { type: "text/html" });
      const blobText = new Blob([printAreaRef.current?.innerText || ""], { type: "text/plain" });
      const clipboardItem = new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText
      });
      await navigator.clipboard.write([clipboardItem]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      const listener = (e: ClipboardEvent) => {
        e.clipboardData?.setData("text/html", htmlContent);
        e.clipboardData?.setData("text/plain", printAreaRef.current?.innerText || "");
        e.preventDefault();
      };
      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
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

  // 4. Excel (엑셀 통합 시트) File Export
  const handleExcelDownload = () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 무료 체험 수량을 소진하여 엑셀 다운로드가 제한됩니다.");
      return;
    }
    const cleanProjectName = (projectName || "정기안전점검").replace(/[\/\\:*?"<>|]/g, "_");
    const filename = `${cleanProjectName}_정기안전점검보고서.xlsx`;
    const htmlContent = printAreaRef.current?.innerHTML || "";

    const excelContent = `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="ProgId" content="Excel.Sheet">
  <meta name="Generator" content="Microsoft Excel / Hancom Hanshow">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>안전점검보고서</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: '맑은 고딕', 'Malgun Gothic', 'Batang', serif; font-size: 10pt; }
    table { border-collapse: collapse; width: 100%; border: 1px solid #000000; margin-bottom: 20px; }
    th, td { border: 1px solid #000000; padding: 6px 8px; text-align: center; vertical-align: middle; mso-number-format:"\\@"; }
    th { background-color: #EFEFEF; font-weight: bold; }
    .page-container { margin-bottom: 30px; page-break-after: always; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. PowerPoint (파워포인트 발표 슬라이드) File Export
  const handlePptDownload = () => {
    if (currentUserStatus === "정회원 승인대기") {
      alert("⚠️ 무료 체험 수량을 소진하여 파워포인트 다운로드가 제한됩니다.");
      return;
    }
    const cleanProjectName = (projectName || "정기안전점검").replace(/[\/\\:*?"<>|]/g, "_");
    const filename = `${cleanProjectName}_정기안전점검보고서.pptx`;
    const htmlContent = printAreaRef.current?.innerHTML || "";

    const pptContent = `\uFEFF<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:p="urn:schemas-microsoft-com:office:powerpoint" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="ProgId" content="PowerPoint.Slide">
  <meta name="Generator" content="Microsoft PowerPoint / Hancom Hanshow">
  <style>
    body { font-family: '맑은 고딕', 'Malgun Gothic', sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .page-container { background: #ffffff; border: 2px solid #cbd5e1; border-radius: 8px; padding: 30px; margin-bottom: 40px; page-break-after: always; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    table { border-collapse: collapse; width: 100%; border: 1px solid #000; margin: 15px 0; }
    th, td { border: 1px solid #000; padding: 8px; font-size: 10pt; text-align: center; }
    th { background-color: #f1f5f9; font-weight: bold; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([pptContent], { type: "application/vnd.ms-powerpoint;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Jeollanam-do Provincial Emblem Background for Certificate
  const JeonnamProvinceEmblemBg = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] pointer-events-none z-0 opacity-85 mix-blend-multiply flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Bright Yellow background square */}
        <rect x="0" y="0" width="200" height="200" fill="#facc15" />
        
        {/* Red sun circle */}
        <circle cx="100" cy="58" r="28" fill="#dc2626" />

        {/* Green leaf / wave curve */}
        <path
          d="M 10 100 C 50 60 130 60 185 80 C 188 100 170 120 130 95 C 80 70 30 110 10 100 Z"
          fill="#15803d"
        />

        {/* Blue wave / S-curve */}
        <path
          d="M 15 135 C 30 85 110 95 135 135 C 165 180 190 145 185 125 C 170 165 135 175 105 145 C 65 105 20 120 15 135 Z"
          fill="#1d4ed8"
        />
      </svg>
    </div>
  );

  // Individual Engineer Personal Seals with distinct fonts, shapes, and styles matching original sample Image 5
  const EngineerPersonalSeal = ({ name }: { name: string }) => {
    const cleanName = name.replace(/\s+/g, "");

    // 1. 이재근 - Circular seal, Seal Script / 인장체, 4 characters (이재근인)
    if (cleanName === "이재근") {
      return (
        <svg width="32" height="32" viewBox="0 0 50 50" className="inline-block select-none transform -rotate-2">
          <circle cx="25" cy="25" r="22.5" fill="none" stroke="#B80F0A" strokeWidth="2.8" />
          <circle cx="25" cy="25" r="20" fill="none" stroke="#B80F0A" strokeWidth="0.8" />
          <g fill="#B80F0A" fontFamily="'Gungsuh', 'Batang', serif" fontWeight="900" fontSize="14" textAnchor="middle" dominantBaseline="central">
            <text x="33" y="17">이</text>
            <text x="33" y="33">재</text>
            <text x="17" y="17">근</text>
            <text x="17" y="33">인</text>
          </g>
        </svg>
      );
    }

    // 2. 정경수 - Vertical Oval seal, Calligraphic/Handwriting font, right tilt (+3deg)
    if (cleanName === "정경수") {
      return (
        <svg width="25" height="38" viewBox="0 0 36 52" className="inline-block select-none transform rotate-3">
          <ellipse cx="18" cy="26" rx="16" ry="24" fill="none" stroke="#c2410c" strokeWidth="2.2" />
          <g fill="#c2410c" fontFamily="'Gungsuh', 'Brush Script MT', cursive, serif" fontWeight="800" fontSize="13" textAnchor="middle" dominantBaseline="central">
            <text x="18" y="13">정</text>
            <text x="18" y="26">경</text>
            <text x="18" y="39">수</text>
          </g>
        </svg>
      );
    }

    // 3. 김규장 - Vertical Oval seal, Seal Script font, left tilt (-2deg)
    if (cleanName === "김규장") {
      return (
        <svg width="25" height="38" viewBox="0 0 36 52" className="inline-block select-none transform -rotate-2">
          <ellipse cx="18" cy="26" rx="16.5" ry="24.5" fill="none" stroke="#b91c1c" strokeWidth="2.5" />
          <g fill="#b91c1c" fontFamily="'Batang', 'Gungsuh', serif" fontWeight="900" fontSize="14" textAnchor="middle" dominantBaseline="central">
            <text x="18" y="13">김</text>
            <text x="18" y="26">규</text>
            <text x="18" y="39">장</text>
          </g>
        </svg>
      );
    }

    // 4. 이민행 - Vertical Oval seal, Handwriting script, right tilt (+2deg)
    if (cleanName === "이민행") {
      return (
        <svg width="25" height="38" viewBox="0 0 36 52" className="inline-block select-none transform rotate-2">
          <ellipse cx="18" cy="26" rx="15" ry="23" fill="none" stroke="#dc2626" strokeWidth="2" />
          <g fill="#dc2626" fontFamily="'GungsuhChe', 'Gungsuh', serif" fontStyle="italic" fontWeight="800" fontSize="13.5" textAnchor="middle" dominantBaseline="central">
            <text x="18" y="13">이</text>
            <text x="18" y="26">민</text>
            <text x="18" y="39">행</text>
          </g>
        </svg>
      );
    }

    // 5. 이완옥 - Vertical Oval seal, Calligraphic brush font, left tilt (-3deg)
    if (cleanName === "이완옥") {
      return (
        <svg width="25" height="38" viewBox="0 0 36 52" className="inline-block select-none transform -rotate-3">
          <ellipse cx="18" cy="26" rx="15.5" ry="23.5" fill="none" stroke="#b91c1c" strokeWidth="2.1" />
          <g fill="#b91c1c" fontFamily="'Batang', 'Gungsuh', serif" fontWeight="800" fontSize="13" textAnchor="middle" dominantBaseline="central">
            <text x="18" y="13">이</text>
            <text x="18" y="26">완</text>
            <text x="18" y="39">옥</text>
          </g>
        </svg>
      );
    }

    // 6. 조을현 - Vertical Oval seal, tilted handwritten ink seal (-4deg)
    if (cleanName === "조을현") {
      return (
        <svg width="25" height="38" viewBox="0 0 36 52" className="inline-block select-none transform -rotate-4">
          <ellipse cx="18" cy="26" rx="16" ry="24" fill="none" stroke="#991b1b" strokeWidth="2.3" strokeDasharray="30, 0.5" />
          <g fill="#991b1b" fontFamily="'Gungsuh', serif" fontWeight="900" fontSize="13.5" textAnchor="middle" dominantBaseline="central">
            <text x="18" y="13">조</text>
            <text x="18" y="26">을</text>
            <text x="18" y="39">현</text>
          </g>
        </svg>
      );
    }

    // 7. 김창대 - Vertical Oval seal, lighter red ink opacity (0.85), right tilt (+2deg)
    if (cleanName === "김창대") {
      return (
        <svg width="25" height="38" viewBox="0 0 36 52" className="inline-block select-none transform rotate-2 opacity-90">
          <ellipse cx="18" cy="26" rx="15" ry="23" fill="none" stroke="#ef4444" strokeWidth="1.8" />
          <g fill="#ef4444" fontFamily="'GungsuhChe', serif" fontWeight="800" fontSize="13" textAnchor="middle" dominantBaseline="central">
            <text x="18" y="13">김</text>
            <text x="18" y="26">창</text>
            <text x="18" y="39">대</text>
          </g>
        </svg>
      );
    }

    // 8. 정남오 - Vertical Oval seal, handwritten ink, left tilt (-2deg)
    if (cleanName === "정남오") {
      return (
        <svg width="25" height="38" viewBox="0 0 36 52" className="inline-block select-none transform -rotate-2">
          <ellipse cx="18" cy="26" rx="15.5" ry="23.5" fill="none" stroke="#dc2626" strokeWidth="2.1" />
          <g fill="#dc2626" fontFamily="'Gungsuh', serif" fontStyle="italic" fontWeight="800" fontSize="13" textAnchor="middle" dominantBaseline="central">
            <text x="18" y="13">정</text>
            <text x="18" y="26">남</text>
            <text x="18" y="39">오</text>
          </g>
        </svg>
      );
    }

    // 9. 정남래 - Vertical Oval seal, handwritten ink, right tilt (+3deg)
    if (cleanName === "정남래") {
      return (
        <svg width="25" height="38" viewBox="0 0 36 52" className="inline-block select-none transform rotate-3">
          <ellipse cx="18" cy="26" rx="16" ry="24" fill="none" stroke="#b91c1c" strokeWidth="2.2" />
          <g fill="#b91c1c" fontFamily="'Batang', serif" fontWeight="900" fontSize="13.5" textAnchor="middle" dominantBaseline="central">
            <text x="18" y="13">정</text>
            <text x="18" y="26">남</text>
            <text x="18" y="39">래</text>
          </g>
        </svg>
      );
    }

    // Fallback
    return <RedStamp text={cleanName} size="small" />;
  };

  // Authentic JEC Corporate Logo as seen in Sample Image 1
  const JecLogoSymbol = () => (
    <div className="flex items-center justify-center select-none py-2">
      <svg width="46" height="34" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Red J */}
        <path d="M 20 10 L 38 10 L 38 42 C 38 56 24 60 12 55 C 8 53 6 48 8 44 C 10 40 15 40 18 43 C 21 46 26 47 28 44 C 30 42 30 38 30 34 L 30 10 Z" fill="#DC2626" />
        {/* Dark Grey E */}
        <path d="M 44 14 L 68 14 L 68 22 L 52 22 L 52 30 L 66 30 L 66 38 L 52 38 L 52 48 L 70 48 L 70 56 L 44 56 Z" fill="#4B5563" />
        {/* Medium Grey C */}
        <path d="M 96 20 C 92 14 84 12 76 16 C 68 22 68 44 76 50 C 84 54 92 52 96 46 L 100 52 C 92 60 80 61 70 54 C 58 46 58 20 70 12 C 80 5 94 6 100 14 Z" fill="#6B7280" />
      </svg>
    </div>
  );

  // Reusable Red Stamp Seals with Authentic Seal Script (전서체/인장체)
  const RedStamp = ({ text = "박경포", size = "normal" }: { text?: string; size?: "small" | "normal" | "large" }) => {
    const pixelSize = size === "small" ? 28 : size === "large" ? 48 : 36;
    const cleanText = text.replace(/\s+/g, "");
    const stampText = cleanText.length <= 3 ? cleanText + "인" : cleanText;

    return (
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 50 50"
        className="inline-block select-none align-middle"
        style={{ mixBlendMode: "multiply", filter: "drop-shadow(0px 0.5px 0.5px rgba(184,15,10,0.2))" }}
      >
        <circle cx="25" cy="25" r="22.5" fill="none" stroke="#B80F0A" strokeWidth="2.8" />
        <circle cx="25" cy="25" r="20" fill="none" stroke="#B80F0A" strokeWidth="0.8" />
        <g
          fill="#B80F0A"
          stroke="#B80F0A"
          strokeWidth="0.6"
          style={{
            fontFamily: "'UnJangsu', 'GungsuhChe', 'Gungsuh', '궁서체', 'Hahmlet', 'Batang', serif",
            fontWeight: 900,
            textAnchor: "middle",
            dominantBaseline: "central"
          }}
        >
          {stampText.length === 4 ? (
            <>
              <text x="33" y="17" fontSize="15">{stampText[0]}</text>
              <text x="33" y="33" fontSize="15">{stampText[1]}</text>
              <text x="17" y="17" fontSize="15">{stampText[2]}</text>
              <text x="17" y="33" fontSize="15">{stampText[3]}</text>
            </>
          ) : (
            stampText.split("").map((char, i) => (
              <text key={i} x="25" y={13 + i * (26 / Math.max(stampText.length - 1, 1))} fontSize="15">
                {char}
              </text>
            ))
          )}
        </g>
      </svg>
    );
  };

  const SquareOfficialSeal = ({
    name = "정진이앤씨",
    title = "대표이사",
    suffix = "지인",
    size = 76,
    imageUrl
  }: {
    name?: string;
    title?: string;
    suffix?: string;
    size?: number;
    imageUrl?: string;
  }) => {
    // If a custom seal image URL is provided, render it directly
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="직인"
          style={{
            width: size,
            height: size,
            mixBlendMode: "multiply",
            objectFit: "contain",
            transform: "rotate(-1deg)"
          }}
          className="inline-block select-none"
        />
      );
    }

    // Default: Authentic Jeonseo (구첩전체 - 9-fold geometric seal script) vector seal
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="inline-block select-none pointer-events-none"
        style={{
          mixBlendMode: "multiply",
          transform: "rotate(-1.5deg)",
          filter: "drop-shadow(0px 0.5px 1px rgba(184,15,10,0.35))"
        }}
      >
        {/* Outer thick red square frame */}
        <rect x="3" y="3" width="94" height="94" rx="2" fill="none" stroke="#B80F0A" strokeWidth="4.5" />
        {/* Inner thin red square frame */}
        <rect x="8" y="8" width="84" height="84" rx="1" fill="none" stroke="#B80F0A" strokeWidth="1.2" />

        {/* Real Jeonseo (구첩전체 - 9-fold seal script) Folded Geometric Red Stroke Paths */}
        <g fill="none" stroke="#B80F0A" strokeWidth="2.8" strokeLinecap="square" strokeLinejoin="miter">
          {/* COLUMN 1 (RIGHT): (주) 정 진 이 앤 씨 */}
          {/* (주) */}
          <path d="M 68 11 C 66 14 66 18 68 21" strokeWidth="2" />
          <path d="M 88 11 C 90 14 90 18 88 21" strokeWidth="2" />
          <path d="M 71 12 H 85 M 78 12 V 22 M 71 17 H 85 M 71 22 H 85" strokeWidth="1.8" />

          {/* 정 */}
          <path d="M 68 25 H 88 M 78 25 V 30 H 68 V 33 H 88 V 30 M 71 34 H 85 V 38 H 71 Z" />

          {/* 진 */}
          <path d="M 68 40 H 88 M 78 40 V 44 H 68 V 47 H 88 M 87 40 V 51 M 68 49 V 52 H 85" />

          {/* 이 */}
          <path d="M 68 54 H 79 V 63 H 68 Z M 86 54 V 63" />

          {/* 앤 */}
          <path d="M 68 65 H 74 V 73 H 68 Z M 78 65 V 74 M 86 65 V 74 M 78 69 H 86 M 68 73 H 86" />

          {/* 씨 */}
          <path d="M 68 76 H 75 V 82 H 68 V 87 H 75 M 77 76 H 84 V 82 H 77 V 87 H 84 M 88 76 V 87" />

          {/* COLUMN 2 (MIDDLE): 대 표 이 사 */}
          {/* 대 */}
          <path d="M 40 12 H 56 V 26 H 40 V 19 H 56 M 52 11 V 28 M 58 11 V 28 M 52 19 H 58" />

          {/* 표 */}
          <path d="M 40 30 H 58 V 40 H 40 Z M 40 35 H 58 M 49 30 V 40 M 44 40 V 47 M 54 40 V 47 M 40 47 H 58" />

          {/* 이 */}
          <path d="M 40 49 H 52 V 65 H 40 Z M 58 49 V 65" />

          {/* 사 */}
          <path d="M 49 67 V 73 H 40 V 87 M 49 73 H 58 V 87 M 55 79 H 58" />

          {/* COLUMN 3 (LEFT): 정 찬 욱 인 */}
          {/* 정 */}
          <path d="M 12 12 H 32 M 22 12 V 18 H 12 V 22 H 32 M 16 23 H 28 V 28 H 16 Z" />

          {/* 찬 */}
          <path d="M 12 30 H 32 M 22 30 V 36 M 12 36 H 22 M 22 34 H 32 V 43 M 12 41 H 32" />

          {/* 욱 */}
          <path d="M 12 45 H 32 M 22 45 V 59 M 12 51 H 32 M 12 59 H 32 V 65 H 12 Z" />

          {/* 인 */}
          <path d="M 12 67 H 22 V 87 H 12 Z M 32 67 V 87 M 12 80 H 32" />
        </g>

        {/* Subtle red ink stamp fill effect */}
        <rect x="0" y="0" width="100" height="100" fill="#B80F0A" opacity="0.04" />
      </svg>
    );
  };

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

  // Common Header & Footer for Content Pages (Alternating layout matching Korean standard safety report format)
  const ContentHeader = ({ chapterTitle = "제1장 일반사항", pageNum }: { chapterTitle?: string; pageNum?: number }) => {
    const isEven = pageNum !== undefined ? pageNum % 2 === 0 : false;

    return (
      <div className="w-full mb-6">
        <div className="flex justify-between items-end pb-1 text-xs font-bold text-black" style={{ fontFamily: "'Batang', '나눔명조', serif" }}>
          {pageNum === undefined ? (
            <>
              <span className="text-xs tracking-tight">{projectName} 중 정기안전점검 및 초기점검 용역</span>
              <span className="text-xs font-extrabold tracking-widest">{chapterTitle}</span>
            </>
          ) : isEven ? (
            <span className="text-xs tracking-tight">{projectName} 중 정기안전점검 및 초기점검 용역</span>
          ) : (
            <span className="text-xs font-extrabold tracking-widest ml-auto">{chapterTitle}</span>
          )}
        </div>
        <div className="border-t-2 border-b border-black h-1"></div>
      </div>
    );
  };

  const ContentFooter = ({ pageNum = 2 }: { pageNum?: number }) => {
    const isEven = pageNum % 2 === 0;

    return (
      <div className="w-full mt-auto pt-4">
        <div className="border-t border-b-2 border-black h-1 mb-2"></div>
        <div className="flex justify-between items-center text-xs font-bold text-black" style={{ fontFamily: "'Batang', '나눔명조', serif" }}>
          <div className="w-1/3 flex items-center justify-start">
            {isEven && (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-sm">JEC</div>
                <span>{companyName}</span>
              </div>
            )}
          </div>
          <div className="w-1/3 text-center">
            <span className="font-mono text-sm font-bold">- {pageNum} -</span>
          </div>
          <div className="w-1/3 text-right">
            {!isEven && (
              <span>{targetName} 정기안전점검({checkDegree}) 보고서</span>
            )}
          </div>
        </div>
      </div>
    );
  };

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

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Conversational Report Editor Button */}
          <button
            onClick={() => setShowChatEditor(prev => !prev)}
            className="flex items-center gap-1.5 text-xs font-extrabold border px-3.5 py-2 rounded-lg transition-all shadow-md cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white border-blue-400 active:scale-95 ring-2 ring-blue-400/40"
            title="대화식(챗봇)으로 보고서 내용을 실시간 수정, 추가, 삭제합니다."
          >
            <Bot className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI 대화형 보고서 수정 (챗봇)</span>
          </button>

          {/* HWPX Download Button (1st Standard Badge) */}
          <button
            onClick={handleHwpxDownload}
            className={`flex items-center gap-1.5 text-xs font-bold border px-3 py-2 rounded-lg transition-all shadow-sm cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                : "text-blue-900 bg-blue-100 hover:bg-blue-200 border-blue-400 active:scale-95 ring-2 ring-blue-500/30"
            }`}
            title="아래아한글 1순위 작성 기준 HWPX 표준 문서로 다운로드합니다."
          >
            <FileText className="w-4 h-4 text-blue-700" />
            <span>한글(.hwpx) [1순위 기준]</span>
          </button>

          {/* HWP Download Button */}
          <button
            onClick={handleHwpDownload}
            className={`flex items-center gap-1.5 text-xs font-bold border px-3 py-2 rounded-lg transition-all shadow-sm cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                : "text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 active:scale-95"
            }`}
            title="아래아한글 HWP 원본 문서로 다운로드합니다."
          >
            <FileCode2 className="w-4 h-4 text-emerald-700" />
            <span>한글(.hwp) 다운로드</span>
          </button>

          {/* HWP Clipboard Copy Button */}
          <button
            onClick={handleHwpClipboardCopy}
            className={`flex items-center gap-1.5 text-xs font-bold border px-3 py-2 rounded-lg transition-all shadow-sm cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                : copySuccess
                ? "text-emerald-900 bg-emerald-100 border-emerald-400" 
                : "text-slate-800 bg-white hover:bg-slate-50 border-slate-300 active:scale-95"
            }`}
            title="아래아한글 프로그램에 바로 붙여넣기(Ctrl+V)할 수 있도록 원본 표 양식을 클립보드에 복사합니다."
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>한글 복사 완료! (Ctrl+V)</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>한글 붙여넣기용 복사</span>
              </>
            )}
          </button>

          {/* Excel Download Button */}
          <button
            onClick={handleExcelDownload}
            className={`flex items-center gap-1.5 text-xs font-bold border px-3 py-2 rounded-lg transition-all shadow-sm cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                : "text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border-emerald-300 active:scale-95"
            }`}
            title="호환용 엑셀 통합 시트(.xlsx) 문서로 다운로드합니다."
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>엑셀(.xlsx)</span>
          </button>

          {/* PPT Download Button */}
          <button
            onClick={handlePptDownload}
            className={`flex items-center gap-1.5 text-xs font-bold border px-3 py-2 rounded-lg transition-all shadow-sm cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                : "text-amber-900 bg-amber-50 hover:bg-amber-100 border-amber-300 active:scale-95"
            }`}
            title="발표용 파워포인트 슬라이드(.pptx) 문서로 다운로드합니다."
          >
            <Presentation className="w-4 h-4 text-amber-600" />
            <span>PPT(.pptx)</span>
          </button>

          {/* Word Download Button */}
          <button
            onClick={handleWordDownload}
            className={`flex items-center gap-1.5 text-xs font-bold border px-3 py-2 rounded-lg transition-all shadow-sm cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                : "text-slate-800 bg-white hover:bg-slate-50 border-slate-300 active:scale-95"
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Word(.doc)</span>
          </button>

          {/* PDF Print Button */}
          <button
            onClick={handlePrint}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-md cursor-pointer ${
              currentUserStatus === "정회원 승인대기" 
                ? "bg-slate-300 text-slate-500 opacity-60 cursor-not-allowed" 
                : "text-white bg-blue-700 hover:bg-blue-800 active:scale-95"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>PDF 인쇄</span>
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
          @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=Noto+Serif+KR:wght@400;700;900&display=swap');
          
          #safety-report-print-area, 
          #safety-report-print-area * {
            font-family: 'Batang', '바탕체', 'Nanum Myeongjo', '나눔명조', 'Noto Serif KR', serif !important;
          }

          @media print {
            body {
              background-color: white !important;
              color: black !important;
              font-family: 'Batang', '바탕체', 'Nanum Myeongjo', '나눔명조', 'Noto Serif KR', serif !important;
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
        {/* PAGE 1: 측면 제본 도비라 표지 (VERTICAL SPINE COVER) - MATCHING SAMPLE PDF PAGE 1 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col items-center justify-between min-h-[1050px] py-16 relative overflow-hidden select-none bg-white">
          {/* Top Section: Two vertical lines side-by-side */}
          <div 
            style={{ 
              writingMode: 'vertical-rl', 
              textOrientation: 'upright',
              WebkitWritingMode: 'vertical-rl',
              WebkitTextOrientation: 'upright',
              fontFamily: "'Batang', 'Gungsuh', 'Myungjo', serif"
            }} 
            className="flex gap-3 items-start justify-center font-serif text-black pt-10"
          >
            <p className="text-lg md:text-xl font-bold tracking-[0.2em] leading-relaxed">
              {projectName}
            </p>
            <p className="text-lg md:text-xl font-bold tracking-[0.2em] leading-relaxed">
              중 {targetName}
            </p>
          </div>

          {/* Middle Section: Main report title vertical */}
          <div 
            style={{ 
              writingMode: 'vertical-rl', 
              textOrientation: 'upright',
              WebkitWritingMode: 'vertical-rl',
              WebkitTextOrientation: 'upright',
              fontFamily: "'Batang', 'Gungsuh', 'Myungjo', serif"
            }} 
            className="font-serif text-black my-auto flex items-center justify-center"
          >
            <p className="text-2xl md:text-[28px] font-black tracking-[0.3em] leading-loose">
              {checkDegree} 정기안전점검 보고서
            </p>
          </div>

          {/* Date Section: Vertical */}
          <div 
            style={{ 
              writingMode: 'vertical-rl', 
              textOrientation: 'upright',
              WebkitWritingMode: 'vertical-rl',
              WebkitTextOrientation: 'upright',
              fontFamily: "'Batang', 'Gungsuh', 'Myungjo', serif"
            }} 
            className="font-serif text-black pb-10 flex items-center justify-center"
          >
            <p className="text-xl font-extrabold tracking-[0.25em]">
              {yearMonth}
            </p>
          </div>

          {/* Bottom Logo matching Sample PDF Page 1 */}
          <div className="pb-4 flex items-center justify-center gap-2">
            <JecLogoSymbol />
            <span className="text-lg font-bold tracking-[0.2em]">{companyName}</span>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* PAGE 2: 표지 (MAIN COVER PAGE WITH DOUBLE LINES) - MATCHING SAMPLE PDF PAGE 2 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-center text-black flex flex-col justify-between py-12 relative min-h-[1050px]">
          {/* Top Main Title Box with double border lines */}
          <div className="pt-12 px-8 z-10">
            <div className="border-t-2 border-b-2 border-black py-8 px-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-black mb-4 leading-relaxed">
                {projectName} 중
              </h2>
              <h1 className="text-2xl md:text-3xl font-black tracking-[0.35em] text-black my-4 leading-relaxed">
                【 {targetName} 】
              </h1>
              <h3 className="text-xl md:text-2xl font-extrabold tracking-[0.25em] text-black leading-relaxed">
                정 기 안 전 점 검 ( {checkDegree} ) 보 고 서
              </h3>
            </div>
          </div>

          {/* Date Section */}
          <div className="my-auto text-center px-14 z-10">
            <span className="text-xl md:text-2xl font-bold tracking-[0.4em] text-black">
              2026. 06
            </span>
          </div>

          {/* Bottom Company Logos */}
          <div className="pb-8 z-10 space-y-3">
            <div className="text-xl font-extrabold tracking-[0.3em] text-black">
              {contractor}
            </div>
            <div className="flex justify-center items-center gap-2">
              <JecLogoSymbol />
              <span className="text-lg font-bold tracking-[0.25em] text-black">
                {companyName}
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* PAGE 3: 【제 출 문】 - MATCHING PDF PAGE 3 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between py-10">
          <div>
            <div className="text-center my-6">
              <h1 className="text-2xl font-black tracking-widest text-black inline-block px-2">
                【제 출 문】
              </h1>
            </div>

            <div className="mt-14 space-y-8 text-base leading-loose">
              <p className="font-bold tracking-wider text-lg">
                {contractor} 대표이사 귀하
              </p>

              <p className="indent-6 leading-loose text-slate-900 font-medium text-base pt-6 tracking-normal">
                귀 사에서 의뢰하신 <strong className="font-bold">&ldquo;{projectName}&rdquo;</strong> 중 {targetName} 정기안전점검 용역({checkDegree})에 대한 과업을 성실히 수행하고 그 결과를 본 보고서에 수록하여 부속 자료와 함께 제출합니다.
              </p>
            </div>
          </div>

          <div className="mb-10">
            <p className="text-right text-base font-bold tracking-[0.25em] mb-20 pr-4">
              2026년 06월 10일
            </p>

            <div className="flex justify-end pr-6">
              <div className="relative text-base font-bold leading-relaxed text-slate-900 font-serif">
                <table className="border-collapse text-base">
                  <tbody>
                    <tr>
                      <td className="w-[88px] font-black py-1 pr-2">
                        <div className="flex justify-between w-full">
                          <span>주</span>
                          <span>소</span>
                        </div>
                      </td>
                      <td className="font-black px-1 py-1">:</td>
                      <td className="font-semibold whitespace-nowrap pl-3 py-1">전라남도 진도군·읍 남산로 130-48</td>
                    </tr>
                    <tr>
                      <td className="w-[88px] font-black py-1 pr-2">
                        <div className="flex justify-between w-full">
                          <span>상</span>
                          <span>호</span>
                        </div>
                      </td>
                      <td className="font-black px-1 py-1">:</td>
                      <td className="font-semibold whitespace-nowrap pl-3 py-1 tracking-[0.1em]">( 주 ) 정 진 이 앤 씨</td>
                    </tr>
                    <tr>
                      <td className="w-[88px] font-black py-1 pr-2">
                        <div className="flex justify-between w-full">
                          <span>대</span>
                          <span>표</span>
                          <span>자</span>
                        </div>
                      </td>
                      <td className="font-black px-1 py-1">:</td>
                      <td className="relative font-bold whitespace-nowrap pl-3 py-1">
                        <span className="tracking-[0.6em] mr-1">정&nbsp;&nbsp;&nbsp;&nbsp;찬&nbsp;&nbsp;&nbsp;&nbsp;욱</span>
                        <span className="font-bold text-slate-900">(인)</span>

                        {/* Red Stamp Seal overlaid directly on top of (인) */}
                        <div className="absolute -right-7 -top-6 z-10 pointer-events-none">
                          <SquareOfficialSeal name="정진이앤씨" title="대표이사" suffix="지인" size={78} imageUrl={activeReport.sampleConfig?.customSealUrl} />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* PAGE 4: 【진단기관 등록증】 - MATCHING PDF PAGE 4 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="text-center mt-2 mb-2">
                <h1 className="text-2xl font-black tracking-widest text-black">
                  【진단기관 등록증】
                </h1>
              </div>

              <p className="text-right text-xs font-semibold text-slate-700 mb-2">
                &lt; 소재지 변경 재교부 &gt;
              </p>
            </div>

            <div className="border-2 border-black p-8 text-slate-900 relative min-h-[720px] flex flex-col justify-between my-auto">
              {/* Background Emblem matching sample Image 1 & 2 */}
              <JeonnamProvinceEmblemBg />

              <div className="relative z-10">
                <div className="text-xs font-bold mb-8">전남 - 제15호</div>
                
                <h2 className="text-center text-2xl font-black tracking-[0.3em] mb-12 text-black">
                  안전진단전문기관 등록증
                </h2>

                <div className="space-y-6 text-sm font-bold leading-relaxed mb-16 pl-6">
                  <p className="flex items-center"><span className="inline-block w-48 font-black shrink-0">1. 상&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;호 :</span> <span>㈜정진이앤씨</span></p>
                  <p className="flex items-center"><span className="inline-block w-48 font-black shrink-0">2. 대&nbsp;&nbsp;&nbsp;표&nbsp;&nbsp;&nbsp;자 :</span> <span className="tracking-[0.3em]">정 찬 욱</span></p>
                  <p className="flex items-start"><span className="inline-block w-48 font-black shrink-0">3. 사무소 소재지 :</span> <span>전라남도 진도군 진도읍 남문길 52(3층)</span></p>
                  <p className="flex items-center"><span className="inline-block w-48 font-black shrink-0">4. 등 록 분 야 :</span> <span>교량 및 터널, 수리, 항만, 건축</span></p>
                  <p className="flex items-center"><span className="inline-block w-48 font-black shrink-0">5. 등 록 연 월 일 :</span> <span>2004년 6월 16일</span></p>
                </div>

                <p className="text-center text-sm font-bold leading-loose mb-12 tracking-wide">
                  「시설물의 안전 및 유지관리에 관한 특별법」 제28조에<br />
                  따른 안전진단전문기관으로 등록합니다.
                </p>

                <p className="text-center text-sm font-black tracking-[0.2em] mb-10">
                  2024년 2월 8일
                </p>
              </div>

              <div className="flex justify-center items-center gap-3 mb-4 relative z-10">
                <span className="text-2xl font-black tracking-[0.4em] text-black">
                  전 라 남 도 지 사
                </span>
                <SquareOfficialSeal name="전라남도" title="지사" suffix="인" size={74} />
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* PAGE 5: 【참여기술진 명단】 - MATCHING PDF PAGE 5 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between min-h-[1050px]">
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="text-center mt-2 mb-4">
                <h1 className="text-2xl font-black tracking-widest text-black">
                  【참여기술진 명단】
                </h1>
              </div>

              <div className="mb-3">
                <p className="text-xs font-extrabold text-black border-b-2 border-black pb-1 inline-block">
                  용 역 명 : {projectName} 중 정기안전점검 및 초기점검 용역
                </p>
              </div>
            </div>

            <div className="flex-1 my-2 flex flex-col justify-stretch">
              <table className="w-full text-[11px] border-collapse border-t-2 border-b-2 border-black text-center my-auto">
                <thead>
                  <tr className="bg-[#D9D9D9] border-b-2 border-black font-extrabold text-black h-9">
                    <th className="border-r border-black p-1.5 w-[14%]">참여구분</th>
                    <th className="border-r border-black p-1.5 w-[18%]">참여분야</th>
                    <th className="border-r border-black p-1.5 w-[16%]">소 속</th>
                    <th className="border-r border-black p-1.5 w-[14%]">성 명</th>
                    <th className="border-r border-black p-1.5 w-[28%]">기술자격구분</th>
                    <th className="p-1.5 w-[10%]">서 명</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black text-black">
                  <tr className="h-12">
                    <td className="border-r border-black p-1 font-bold bg-slate-50">과업총괄(PM)</td>
                    <td className="border-r border-black p-1">과업책임기술자</td>
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 font-bold tracking-widest">박 경 포</td>
                    <td className="border-r border-black p-1 text-center">토목특급기술자<br />토목시공기술사</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="박경포" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1 font-bold bg-slate-50" rowSpan={11}>참 여 기 술 인</td>
                    <td className="border-r border-black p-1" rowSpan={11}>참여기술인</td>
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">정 찬 욱</td>
                    <td className="border-r border-black p-1 text-center">토목특급기술자<br />콘크리트기사</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="정찬욱" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">이 재 근</td>
                    <td className="border-r border-black p-1 text-center">토목특급기술자<br />토목기사</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="이재근" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">이 민 행</td>
                    <td className="border-r border-black p-1 text-center">토목특급기술자<br />학·경력자</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="이민행" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">김 규 장</td>
                    <td className="border-r border-black p-1 text-center">토목특급기술자<br />농어업토목기술사, 토목기사</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="김규장" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">조 을 현</td>
                    <td className="border-r border-black p-1 text-center">토목특급기술자<br />측량및지형공간정보 기사</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="조을현" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">김 창 대</td>
                    <td className="border-r border-black p-1 text-center">토목특급기술자<br />학.경력자</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="김창대" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">정 남 래</td>
                    <td className="border-r border-black p-1 text-center">토목특급기술자<br />학.경력자</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="정남래" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">정 남 오</td>
                    <td className="border-r border-black p-1 text-center">토목특급기술자<br />토목산업기사</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="정남오" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">김 한 규</td>
                    <td className="border-r border-black p-1 text-center">토목특급기술자<br />학.경력자</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="김한규" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">양 진 우</td>
                    <td className="border-r border-black p-1 text-center">토목고급기술자<br />학.경력자</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="양진우" /></td>
                  </tr>
                  <tr className="h-11">
                    <td className="border-r border-black p-1">(주)정진이앤씨</td>
                    <td className="border-r border-black p-1 tracking-widest font-semibold">김 지 민</td>
                    <td className="border-r border-black p-1 text-center">토목중급기술자<br />학.경력자</td>
                    <td className="p-1 align-middle"><EngineerPersonalSeal name="김지민" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* PAGE 6: 【책임기술자 교육수료증】 - MATCHING PDF PAGE 6 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <div>
            <div className="text-center mt-4 mb-6">
              <h1 className="text-2xl font-black tracking-widest text-black">
                【책임기술자 교육수료증】
              </h1>
            </div>

            <div className="border-4 border-double border-slate-700 p-8 text-black relative">
              <div className="flex justify-between items-center text-xs font-bold mb-4">
                <span>제 2020-25-0054 호 (인터넷)</span>
                <span className="border border-black px-2 py-0.5 text-[10px]">재발급 | 발급번호: KICTE-546023<br />발급일자: 2020-07-28</span>
              </div>

              <h2 className="text-center text-3xl font-black tracking-[0.5em] my-8">
                수 &nbsp; 료 &nbsp; 증
              </h2>

              <div className="space-y-4 text-xs font-bold leading-relaxed mb-8 pl-8">
                <p><span className="inline-block w-28">성&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;명 :</span> 박 경 포</p>
                <p><span className="inline-block w-28">생 년 월 일 :</span> 75.06.11</p>
                <p><span className="inline-block w-28">소&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;속 :</span> (주)정진이앤씨</p>
                <p><span className="inline-block w-28">교 육 과 정 :</span> 정밀안전진단과정(교량 및 터널반)</p>
                <p><span className="inline-block w-28">교 육 기 간 :</span> 2020.07.06 ~ 2020.07.27 &nbsp;( 70 시간 )</p>
                <p><span className="inline-block w-28">교 육 근 거 :</span> 시설물의 안전 및 유지관리에 관한 특별법 시행규칙 제10조</p>
              </div>

              <p className="text-center text-xs font-bold leading-loose mb-10 px-4">
                상기인은 위의 교육과정을 수료하였으므로<br />
                이 증서를 수여합니다.
              </p>

              <p className="text-center text-xs font-bold tracking-widest mb-10">
                2020년 07월 27일
              </p>

              <div className="flex justify-center items-center gap-2 mt-4">
                <span className="text-lg font-black tracking-[0.3em]">
                  건 설 기 술 교 육 원 장
                </span>
                <SquareOfficialSeal name="건설기술" title="원장인" />
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* PAGE 7: 【수료증】 - MATCHING PDF PAGE 7 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <div>
            <div className="text-center mt-4 mb-6">
              <h1 className="text-2xl font-black tracking-widest text-black">
                【수 료 증】
              </h1>
            </div>

            <div className="border-4 border-double border-amber-600 p-8 text-black relative bg-amber-50/10">
              <p className="text-xs font-bold mb-4">제 2020 - 1907474호</p>

              <h2 className="text-center text-3xl font-black tracking-[0.5em] my-8">
                수  료  증
              </h2>

              <div className="space-y-4 text-xs font-bold leading-relaxed mb-8 pl-8">
                <p><span className="inline-block w-24">성      명 :</span> 이 재 근</p>
                <p><span className="inline-block w-24">생 년 월 일 :</span> 60.06.15</p>
                <p><span className="inline-block w-24">주      소 :</span> 한국농어촌공사 전남지역본부 화순지사 지역개발부</p>
                <p><span className="inline-block w-24">교 육 과 정 :</span> 수리시설 정밀안전진단 실무(1)기</p>
                <p><span className="inline-block w-24">교 육 기 간 :</span> 2020.11.2 ~ 11.13 (70시간)</p>
              </div>

              <p className="text-center text-xs font-bold leading-loose mb-10 px-4">
                위 사람은 농식품공무원교육원에서 실시한<br />
                『수리시설 정밀안전진단 실무』 과정을 이수하였으므로<br />
                이 증서를 드립니다.
              </p>

              <p className="text-center text-xs font-bold tracking-widest mb-10">
                2021년 12월 09일
              </p>

              <div className="flex justify-center items-center gap-2 mt-4">
                <span className="text-lg font-black tracking-[0.3em]">
                  농식품공무원교육원장
                </span>
                <SquareOfficialSeal name="농식품" title="원장인" />
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
              {activeReport.photos && activeReport.photos.length > 0 ? (
                activeReport.photos.slice(0, 2).map((photo, pIdx) => (
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
                      <p className="text-xs font-bold text-black">{targetName} 작업 중 전경(1)</p>
                    </div>
                  </div>

                  <div className="border-2 border-black p-1.5 bg-white">
                    <div className="w-full h-56 bg-slate-200 flex flex-col items-center justify-center text-slate-500">
                      <Building className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-bold">{targetName} 작업 중 전경(2)</span>
                    </div>
                    <div className="border-t border-black mt-1 pt-1 text-center bg-slate-50">
                      <p className="text-xs font-bold text-black">{targetName} 작업 중 전경(2)</p>
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
          <ContentHeader chapterTitle="제1장 일반사항" pageNum={4} />

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
                  <td className="w-1/4 font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 명</td>
                  <td className="w-3/4 p-2 font-bold text-black">{projectName}</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 위 치</td>
                  <td className="p-2 text-black">{projectLocation}</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 목 적</td>
                  <td className="p-2 text-black">지방도 839호선 미개설 구간 확포장을 통한 지역 균형발전 및 수송효율 증대</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 개 요</td>
                  <td className="p-2 text-black leading-relaxed">
                    □ 흙깍기: 토사 34,800m³, 리핑암 25,931m³<br />
                    □ 흙쌓기: 노상 13,298m³, 노체 39,268m³<br />
                    □ 구조물공: 교량 3개소(L=230m), 옹벽 5개소(L=832.0m), 암거 12개소(L=390.5m)<br />
                    □ 포장공: 아스팔트 포장 43,188m²
                  </td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">주 요 공 법</td>
                  <td className="p-2 text-black leading-relaxed">
                    □ 옹벽공법: L형 콘크리트 옹벽 및 보강토 옹벽<br />
                    □ 비탈면안정공법: 식생블럭공, 시드스프레이
                  </td>
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
                <tr>
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">설 계 자</td>
                  <td className="p-2 text-black">(주)도화엔지니어링</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 기 간</td>
                  <td className="p-2 text-black">2024. 07. 22 ~ 2029. 07. 20</td>
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
          <ContentHeader chapterTitle="제1장 일반사항" pageNum={5} />

          <div className="my-1 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-black mb-2">
                1.3.2 대상시설물 점검결과
              </h3>
              <table className="w-full text-xs border-collapse border-2 border-black text-center">
                <thead>
                  <tr className="bg-slate-200 border-b border-black font-extrabold text-black">
                    <th className="border-r border-black p-1.5 w-[35%]">점검항목</th>
                    <th className="border-r border-black p-1.5 w-[35%]">점검결과</th>
                    <th className="p-1.5 w-[30%]">비 고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/50 text-black">
                  <tr>
                    <td className="border-r border-black p-2 text-left font-bold">
                      임시시설 및 가설공법의 안전성
                    </td>
                    <td className="border-r border-black p-2 font-bold">적정하게 관리 중</td>
                    <td className="p-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-2 text-left font-bold">
                      비파괴시험 결과 (콘크리트 압축강도 / 철근배근 조사)
                    </td>
                    <td className="border-r border-black p-2 font-bold">해당사항 없음</td>
                    <td className="p-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-2 text-left font-bold">
                      육안(외관)조사 결과
                    </td>
                    <td className="border-r border-black p-2 font-bold">특이사항 없음</td>
                    <td className="p-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-2 text-left font-bold">
                      인접건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성
                    </td>
                    <td className="border-r border-black p-2 font-bold">적정하게 관리 중</td>
                    <td className="p-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-2 text-left font-bold">
                      건설공사 안전관리 적정성 평가
                    </td>
                    <td className="border-r border-black p-2 font-bold">적정하게 관리 중</td>
                    <td className="p-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-2 text-left font-bold">
                      구조검토 결과
                    </td>
                    <td className="border-r border-black p-2 font-bold">발생응력은 허용부재력 이내로 안정</td>
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
                <div className="bg-slate-200 border-b border-black p-1.5 text-center font-extrabold text-xs">
                  책임기술자 종합 의견
                </div>
                <div className="p-3 text-xs leading-relaxed text-black text-justify space-y-2">
                  <p className="indent-2">
                    대상시설물인 &ldquo;{projectName}&rdquo; 중 {targetName}의 시공 상태에 대한 면밀한 육안 점검을 실시하였고, 각종 품질관리 사항 및 안전관리 활동 등에 대한 분석 및 검토를 실시하였다.
                  </p>
                  <p className="indent-2">
                    금회 정기안전점검 결과, 4차로확포장 공사를 위한 {targetName} 시공 현장의 {checkDegree} 정기안전점검 결과 기초 터파기 및 철근배근이 완료되었으며 기초타설전 설치상태 등은 설계도면 및 시방서 기준에 준하여 작업이 진행된 것으로 확인되었고 시설물의 안전성을 저해할 만한 특별한 사항은 없는 것으로 점검되었다.
                  </p>
                  <p className="indent-2">
                    또한, 자재 검수 등 품질관리사항 및 안전관리 활동 등도 관련 법규에 의거 지속적으로 진행되고 있는 것으로 확인되었다. 앞으로의 후속공정 진행시에도 각 공종별로 잠재되어 있는 위험요인을 미연에 방지하여 무재해 현장으로 마무리될 수 있도록 안전관리계획서에 의거 작업수칙을 준수하여야 할 것으로 사료된다.
                  </p>
                  <div className="pt-2 flex justify-end items-center gap-2 font-bold">
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
            "2.6  점검수행 일정 및 방법",
            "2.7  정기안전점검 체크리스트"
          ]}
        />


        {/* -------------------------------------------------------------------- */}
        {/* PAGE 14: CONTENT PAGE 7 (2.1 과업의 목적 & 2.2 공사현황) - IMAGE 15 */}
        {/* -------------------------------------------------------------------- */}
        <div className="page-container font-serif text-black flex flex-col justify-between">
          <ContentHeader chapterTitle="제2장 정기안전점검의 개요" pageNum={7} />

          <div className="my-1 space-y-4">
            <div>
              <h2 className="text-base font-black text-black mb-2">
                2.1 과업의 목적
              </h2>
              <p className="text-xs leading-relaxed text-black text-justify indent-2">
                본 과업은 건설기술 진흥법 제62조, 동법 시행령 제100조, 제101조 및 시행규칙 제59조의 규정에 의한 국토교통부 고시 건설공사 안전관리 업무수행 지침 【별표1】에 따라 <strong className="font-bold">&ldquo;{projectName}&rdquo;</strong> 의 작업 중인 {targetName} 구조물에 대한 정기안전점검을 실시하는 것으로, 공사목적물의 품질·시공 상태 등의 적정성, 공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성, 인접 건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성 여부를 평가하고자 육안조사를 통하여 현장조사를 실시하고, 점검을 통한 문제점 발생 시 사전조치를 함으로써 건설공사의 안전을 확보함은 물론 향후 유지관리에 필요한 자료로 활용하고자 한다.
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
                    <td className="p-2 text-black">지방도 839호선 미개설 구간 확포장을 통한 지역 균형발전 및 수송효율 증대</td>
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
                  <tr>
                    <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 기 간</td>
                    <td className="p-2 text-black">2024. 07. 22 ~ 2029. 07. 20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <ContentFooter pageNum={7} />
        </div>

        {/* Chapters 2, 3, 4 & Appendix TOC items */}
        <ReportViewerChapters
          report={activeReport}
          projectName={projectName}
          targetName={targetName}
          checkDegree={checkDegree}
          contractor={contractor}
          client={client}
          supervisor={supervisor}
          companyName={companyName}
          leadEngineer={leadEngineer}
          rawCheckDate={rawCheckDate}
          projectLocation={projectLocation}
          ContentHeader={ContentHeader}
          ContentFooter={ContentFooter}
          ChapterCoverPage={ChapterCoverPage}
          JecLogoSymbol={JecLogoSymbol}
          EngineerPersonalSeal={EngineerPersonalSeal}
          SquareOfficialSeal={SquareOfficialSeal}
        />

      </div>

      {/* Floating AI Chatbot Editor Trigger Button removed as requested */}

      {/* AI Conversational Chatbot Drawer */}
      {showChatEditor && (
        <ReportChatEditor
          report={activeReport}
          onUpdateReport={handleUpdateActiveReport}
          onClose={() => setShowChatEditor(false)}
        />
      )}
    </div>
  );
}
