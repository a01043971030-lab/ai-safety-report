import React, { useState } from "react";
import { SafetyReport } from "../types";
import { 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Calendar, 
  User, 
  FileText, 
  Sparkles, 
  MapPin, 
  AlertCircle,
  PlusCircle,
  Info
} from "lucide-react";

interface ReportListProps {
  reports: SafetyReport[];
  onEdit: (report: SafetyReport) => void;
  onView: (report: SafetyReport) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export default function ReportList({ reports, onEdit, onView, onDelete, onCreateNew }: ReportListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtering reports based on search term
  const filteredReports = reports.filter(report => {
    const term = searchTerm.toLowerCase();
    return (
      (report.projectName || "").toLowerCase().includes(term) ||
      (report.projectLocation || "").toLowerCase().includes(term) ||
      (report.leadEngineer || "").toLowerCase().includes(term) ||
      (report.companyName || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto my-6 px-4 md:px-0">
      {/* Top dashboard summary header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-800" />
            나의 보고서 관리 대장
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            건설기술진흥법 규정 양식으로 보존된 정기안전점검 보고서의 열람, 수정, 인쇄 및 다운로드를 집행합니다.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-md shadow-blue-600/10 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          정기안전점검 새 보고서 생성
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <input
            type="text"
            placeholder="공사명, 공사위치, 책임기술인, 진단업체명으로 보고서를 검색하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2.5 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
        <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
          검색 결과: <strong className="text-slate-800">{filteredReports.length}</strong>건
        </div>
      </div>

      {/* Reports Grid/List */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => (
            <div 
              key={report.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
            >
              {/* Report Information Block */}
              <div className="space-y-2 flex-grow">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    {report.checkDegree || "정기안전점검 (1차)"}
                  </span>
                  {report.aiGenerated ? (
                    <span className="text-[10px] font-bold text-violet-800 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI 집필 완결
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
                      기본 정보만 작성됨
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    수정일: {new Date(report.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                  {report.projectName || "공사명 미지정"}
                </h3>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="line-clamp-1 max-w-[200px]">{report.projectLocation || "위치 미지정"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{report.checkDate || "점검일 미지정"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>책임기술인: {report.leadEngineer || "미지정"}</span>
                  </div>
                </div>

                {report.photos && report.photos.length > 0 && (
                  <p className="text-[11px] text-slate-400">
                    첨부된 현장 안전 사진대지: <strong className="text-slate-700">{report.photos.length}개</strong>
                  </p>
                )}
              </div>

              {/* Action Buttons Block */}
              <div className="flex items-center gap-1.5 w-full md:w-auto justify-end border-t border-slate-100 pt-3 md:border-t-0 md:pt-0">
                <button
                  onClick={() => onView(report)}
                  className="flex items-center gap-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
                  title="보고서 인쇄 및 보기"
                >
                  <Eye className="w-3.5 h-3.5" />
                  보고서 보기 / 다운로드
                </button>
                <button
                  onClick={() => onEdit(report)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 p-2 rounded-lg cursor-pointer transition-colors"
                  title="보고서 수정"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  수정
                </button>
                <button
                  onClick={() => {
                    if (confirm("정말로 이 보고서를 대장에서 영구 삭제하시겠습니까?")) {
                      if (report.id) onDelete(report.id);
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-white bg-white hover:bg-red-600 border border-red-200 hover:border-red-600 p-2 rounded-lg cursor-pointer transition-all"
                  title="보고서 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 text-center text-slate-500">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="font-bold text-slate-700">작성 및 조회된 보고서가 존재하지 않습니다</p>
          <p className="text-xs text-slate-400 mt-2">상단의 [새 보고서 생성] 버튼을 누르고 대한민국 건설안전 표준 보고서를 작성해 보세요.</p>
          <button
            onClick={onCreateNew}
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            첫 보고서 생성하기
          </button>
        </div>
      )}
    </div>
  );
}
