import React from "react";
import { SafetyReport, PhotoItem } from "../types";
import { Camera, Ruler, ShieldCheck, HardHat, CheckCircle2, AlertTriangle, FileText, Image as ImageIcon, MapPin, Compass, Wrench, Shield, Layers, Activity, Users, Truck, AlertOctagon, HelpCircle } from "lucide-react";

interface ChaptersProps {
  report: SafetyReport;
  projectName: string;
  targetName: string;
  checkDegree: string;
  contractor: string;
  client: string;
  supervisor: string;
  companyName: string;
  leadEngineer: string;
  rawCheckDate: string;
  projectLocation: string;
  ContentHeader: React.FC<{ chapterTitle: string; pageNum?: number }>;
  ContentFooter: React.FC<{ pageNum: number }>;
  ChapterCoverPage: React.FC<{ chapterNum: string; chapterTitle: string; subsections: string[] }>;
  JecLogoSymbol: React.FC;
  EngineerPersonalSeal: React.FC<{ name: string }>;
  SquareOfficialSeal: React.FC<{ name: string; title?: string }>;
}

// --------------------------------------------------------------------------------------
// SVG CAD DRAWING 1: L-형 옹벽 표준단면도 및 배근상세도 (Standard Engineering Drawing)
// --------------------------------------------------------------------------------------
const RetainingWallEngineeringDrawing: React.FC<{ targetName: string }> = ({ targetName }) => {
  return (
    <div className="w-full bg-white border-2 border-black p-3 my-2 text-black select-none">
      <div className="text-center font-bold text-xs pb-1 mb-2 border-b border-black">
        [ {targetName || "L형 철근콘크리트 옹벽"} 표준 단면도 및 배근 상세도 (Scale 1:50) ]
      </div>
      <div className="relative w-full aspect-[16/9] max-h-[280px] bg-slate-50 border border-slate-300 overflow-hidden flex items-center justify-center p-2">
        <svg viewBox="0 0 760 380" className="w-full h-full">
          <defs>
            {/* Gravel Pattern */}
            <pattern id="gravelHatch" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" fill="#64748b" opacity="0.6" />
              <circle cx="9" cy="9" r="1.2" fill="#475569" opacity="0.6" />
              <circle cx="8" cy="2" r="1" fill="#94a3b8" opacity="0.6" />
            </pattern>
            {/* Ground Soil Hatch */}
            <pattern id="soilHatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="16" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
            </pattern>
            {/* Concrete Hatch */}
            <pattern id="concHatch" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.7" fill="#000" />
              <circle cx="7" cy="7" r="0.7" fill="#000" />
            </pattern>
          </defs>

          {/* Natural Ground Surface (Backfill & Original Ground) */}
          <path d="M 390 60 L 740 60 L 740 330 L 100 330 L 100 240 L 290 240 L 290 60 Z" fill="url(#soilHatch)" opacity="0.3" />
          
          {/* Crushed Gravel Backfill zone behind wall */}
          <polygon points="390,60 520,60 480,270 390,270" fill="url(#gravelHatch)" stroke="#334155" strokeWidth="1" />
          <text x="450" y="150" fontSize="10" fontWeight="bold" fill="#0f172a" textAnchor="middle">투수성 쇄석 뒤채움 (t=300mm)</text>
          <text x="450" y="165" fontSize="8" fill="#334155" textAnchor="middle">필터부직포(t=3mm) 포설</text>

          {/* Leveling / Lean Concrete Bedding (버림 콘크리트) */}
          <rect x="250" y="300" width="310" height="15" fill="#e2e8f0" stroke="#000" strokeWidth="1.5" />
          <text x="405" y="311" fontSize="9" fontWeight="bold" fill="#000" textAnchor="middle">버림콘크리트(t=100mm, fck=18MPa) / 잡석다짐(t=200mm)</text>

          {/* Main L-Type Retaining Wall Concrete Body */}
          <path
            d="M 330 60 L 390 60 L 390 270 L 540 270 L 540 300 L 270 300 L 270 270 L 330 270 Z"
            fill="#f1f5f9"
            stroke="#000"
            strokeWidth="2.5"
          />

          {/* Reinforcement Rebars (배근선) */}
          {/* Main vertical stem rebar */}
          <line x1="345" y1="70" x2="345" y2="285" stroke="#dc2626" strokeWidth="2.5" />
          <line x1="375" y1="70" x2="375" y2="285" stroke="#2563eb" strokeWidth="2.5" />
          {/* Footing main rebar */}
          <line x1="280" y1="285" x2="530" y2="285" stroke="#dc2626" strokeWidth="2.5" />
          <line x1="280" y1="292" x2="530" y2="292" stroke="#2563eb" strokeWidth="1.8" />
          
          {/* Distribution stirrup points (배력근 점 표기) */}
          {[90, 120, 150, 180, 210, 240, 265].map((y, idx) => (
            <circle key={`bar-${idx}`} cx="360" cy={y} r="2.5" fill="#000" />
          ))}

          {/* Weep Hole (PVC 배수공) */}
          <line x1="330" y1="250" x2="390" y2="245" stroke="#000" strokeWidth="4" />
          <text x="260" y="235" fontSize="9" fontWeight="bold" fill="#000">PVC 배수공 (Φ50mm @ 2.0m 간격)</text>
          <line x1="290" y1="238" x2="330" y2="248" stroke="#000" strokeWidth="1" markerEnd="url(#arrow)" />

          {/* Dimensions and Engineering Callout Lines */}
          {/* Height Dimension (H=4.5m) */}
          <line x1="230" y1="60" x2="230" y2="300" stroke="#000" strokeWidth="1.2" />
          <line x1="225" y1="60" x2="235" y2="60" stroke="#000" strokeWidth="1.2" />
          <line x1="225" y1="300" x2="235" y2="300" stroke="#000" strokeWidth="1.2" />
          <text x="215" y="185" fontSize="11" fontWeight="bold" fill="#000" textAnchor="end" transform="rotate(-90 215 185)">전체 높이 H = 3.0 ~ 5.0m</text>

          {/* Base Width Dimension (B=2.4m) */}
          <line x1="270" y1="340" x2="540" y2="340" stroke="#000" strokeWidth="1.2" />
          <line x1="270" y1="335" x2="270" y2="345" stroke="#000" strokeWidth="1.2" />
          <line x1="540" y1="335" x2="540" y2="345" stroke="#000" strokeWidth="1.2" />
          <text x="405" y="355" fontSize="11" fontWeight="bold" fill="#000" textAnchor="middle">저판 폭 B = 2,200 ~ 2,600 mm</text>

          {/* Top Wall Width (tw=400mm) */}
          <line x1="330" y1="45" x2="390" y2="45" stroke="#000" strokeWidth="1" />
          <text x="360" y="38" fontSize="9" fontWeight="bold" fill="#000" textAnchor="middle">벽체 상단폭 400mm</text>

          {/* Rebar Specifications Note Box */}
          <rect x="555" y="180" width="190" height="95" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <text x="565" y="198" fontSize="10" fontWeight="bold" fill="#000">■ 철근 및 재료 규격</text>
          <text x="565" y="215" fontSize="8.5" fill="#000">• 주철근: SD400 D19 @200</text>
          <text x="565" y="230" fontSize="8.5" fill="#000">• 배력근: SD400 D13 @250</text>
          <text x="565" y="245" fontSize="8.5" fill="#000">• 콘크리트: fck = 24 MPa</text>
          <text x="565" y="260" fontSize="8.5" fill="#000">• 최소 피복두께: 80 mm 확보</text>
        </svg>
      </div>
      <div className="flex justify-between text-[10px] text-slate-700 font-sans pt-1">
        <span>설계기준: 국토교통부 콘크리트 구조기준(KDS 14 20 00)</span>
        <span>허용지지력: qa ≥ 200 kN/m² (풍화암/연암 기초)</span>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------------
// SVG GEOTECHNICAL DRAWING 2: 시추주상도 (Borehole Drill Log Diagram)
// --------------------------------------------------------------------------------------
const GeotechnicalBoreholeDiagram: React.FC = () => {
  return (
    <div className="w-full bg-white border-2 border-black p-3 my-2 text-black select-none">
      <div className="text-center font-bold text-xs pb-1 mb-2 border-b border-black">
        [ 지반조사 시추주상도 DRILL LOG (시추공 BH-1, 표고 EL. +18.45m) ]
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse border border-black text-center">
          <thead>
            <tr className="bg-slate-200 border-b border-black font-bold">
              <th className="border-r border-black p-1 w-[12%]">지 층 명</th>
              <th className="border-r border-black p-1 w-[10%]">심 도 (m)</th>
              <th className="border-r border-black p-1 w-[10%]">층 후 (m)</th>
              <th className="border-r border-black p-1 w-[18%]">주상 단면</th>
              <th className="border-r border-black p-1 w-[26%]">표준관입시험 N치 (회/30cm)</th>
              <th className="p-1 w-[24%]">지반 공학적 특성 및 평가</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            <tr>
              <td className="border-r border-black p-1 font-bold bg-amber-50">매 립 토<br />(Fill Soil)</td>
              <td className="border-r border-black p-1">0.0 ~ 1.2</td>
              <td className="border-r border-black p-1">1.2</td>
              <td className="border-r border-black p-1 bg-amber-100 font-mono text-[9px]">░░░░░░░░</td>
              <td className="border-r border-black p-1 text-left pl-2">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 bg-slate-400 rounded-sm" style={{ width: '20%' }}></div>
                  <span className="font-bold">N = 6~8</span>
                </div>
              </td>
              <td className="p-1 text-left pl-2 text-[9.5px]">암갈색 점토질 모래, 느슨한 상태</td>
            </tr>
            <tr>
              <td className="border-r border-black p-1 font-bold bg-yellow-50">퇴 적 토<br />(Alluvium)</td>
              <td className="border-r border-black p-1">1.2 ~ 3.5</td>
              <td className="border-r border-black p-1">2.3</td>
              <td className="border-r border-black p-1 bg-yellow-100 font-mono text-[9px]">▒▒▒▒▒▒▒▒</td>
              <td className="border-r border-black p-1 text-left pl-2">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 bg-blue-500 rounded-sm" style={{ width: '40%' }}></div>
                  <span className="font-bold">N = 14~18</span>
                </div>
                <span className="text-[8px] text-blue-700 font-semibold">▼ 지하수위 GL(-)2.2m</span>
              </td>
              <td className="p-1 text-left pl-2 text-[9.5px]">황갈색 실트질 모래, 중간 조밀</td>
            </tr>
            <tr>
              <td className="border-r border-black p-1 font-bold bg-orange-50">풍 화 토<br />(Weathered)</td>
              <td className="border-r border-black p-1">3.5 ~ 6.0</td>
              <td className="border-r border-black p-1">2.5</td>
              <td className="border-r border-black p-1 bg-orange-100 font-mono text-[9px]">▓▓▓▓▓▓▓▓</td>
              <td className="border-r border-black p-1 text-left pl-2">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 bg-emerald-600 rounded-sm" style={{ width: '70%' }}></div>
                  <span className="font-bold">N = 32~42</span>
                </div>
              </td>
              <td className="p-1 text-left pl-2 text-[9.5px]">조밀한 실트질 자갈질 모래 상태</td>
            </tr>
            <tr>
              <td className="border-r border-black p-1 font-bold bg-emerald-50">풍 화 암<br />(W. Rock)</td>
              <td className="border-r border-black p-1">6.0 ~ 8.5</td>
              <td className="border-r border-black p-1">2.5</td>
              <td className="border-r border-black p-1 bg-emerald-100 font-mono text-[9px]">████████</td>
              <td className="border-r border-black p-1 text-left pl-2">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 bg-red-600 rounded-sm" style={{ width: '100%' }}></div>
                  <span className="font-bold text-red-700">N &gt; 50/10cm</span>
                </div>
                <span className="text-[8px] text-emerald-800 font-bold">★ 옹벽 기초 지지층 도달</span>
              </td>
              <td className="p-1 text-left pl-2 text-[9.5px] font-bold text-slate-900">
                허용지지력 qa ≥ 250 kN/m² 확보 (직접기초 지지층으로 극히 양호)
              </td>
            </tr>
            <tr>
              <td className="border-r border-black p-1 font-bold bg-slate-100">연 암 층<br />(Soft Rock)</td>
              <td className="border-r border-black p-1">8.5 ~ 12.0</td>
              <td className="border-r border-black p-1">3.5+</td>
              <td className="border-r border-black p-1 bg-slate-200 font-mono text-[9px]">████████</td>
              <td className="border-r border-black p-1 text-left pl-2">
                <span className="font-bold text-red-700">N &gt; 50/5cm (RQD 65%)</span>
              </td>
              <td className="p-1 text-left pl-2 text-[9.5px]">신선한 편마암질 기반암층</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------------
// SVG SCHEDULE GANTT CHART (공사예정공정표 다이어그램)
// --------------------------------------------------------------------------------------
const ConstructionScheduleGantt: React.FC<{ projectName: string }> = ({ projectName }) => {
  return (
    <div className="w-full bg-white border-2 border-black p-3 my-2 text-black select-none">
      <div className="text-center font-bold text-xs pb-1 mb-2 border-b border-black">
        [ {projectName} 세부 공사예정공정표 (Gantt Chart - 기준시점: 착공후) ]
      </div>
      <table className="w-full text-[10px] border-collapse border border-black text-center">
        <thead>
          <tr className="bg-slate-200 border-b border-black font-bold">
            <th className="border-r border-black p-1 w-[20%]">공 종 별</th>
            <th className="border-r border-black p-1 w-[12%]">수량/단위</th>
            <th className="border-r border-black p-1 w-[17%]">1~2개월</th>
            <th className="border-r border-black p-1 w-[17%]">3~4개월</th>
            <th className="border-r border-black p-1 w-[17%]">5~6개월</th>
            <th className="p-1 w-[17%]">7개월 이후</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black">
          <tr>
            <td className="border-r border-black p-1 font-bold text-left pl-2">1. 가설공사 및 현장정리</td>
            <td className="border-r border-black p-1">1 식</td>
            <td className="border-r border-black p-1 bg-blue-100 font-bold text-blue-900">■■■■ (100%)</td>
            <td className="border-r border-black p-1 text-slate-400">―</td>
            <td className="border-r border-black p-1 text-slate-400">―</td>
            <td className="p-1 text-slate-400">―</td>
          </tr>
          <tr>
            <td className="border-r border-black p-1 font-bold text-left pl-2">2. 기초 터파기 및 토공</td>
            <td className="border-r border-black p-1">L=832m</td>
            <td className="border-r border-black p-1 bg-blue-100 font-bold text-blue-900">■■■■ (80%)</td>
            <td className="border-r border-black p-1 bg-blue-50 text-blue-800">■■ (20%)</td>
            <td className="border-r border-black p-1 text-slate-400">―</td>
            <td className="p-1 text-slate-400">―</td>
          </tr>
          <tr className="bg-amber-50/50">
            <td className="border-r border-black p-1 font-bold text-left pl-2 text-amber-900">
              3. 옹벽 기초철근 및 타설 <span className="text-[8px] bg-red-600 text-white px-1 py-0.5 rounded font-sans">금회 점검</span>
            </td>
            <td className="border-r border-black p-1 font-bold">L=180m</td>
            <td className="border-r border-black p-1 bg-amber-200 font-bold text-red-700">● 점검(진행중)</td>
            <td className="border-r border-black p-1 bg-blue-100 font-bold text-blue-900">■■■■ (완료예정)</td>
            <td className="border-r border-black p-1 text-slate-400">―</td>
            <td className="p-1 text-slate-400">―</td>
          </tr>
          <tr>
            <td className="border-r border-black p-1 font-bold text-left pl-2">4. 벽체 거푸집 및 콘크리트</td>
            <td className="border-r border-black p-1">L=832m</td>
            <td className="border-r border-black p-1 text-slate-400">―</td>
            <td className="border-r border-black p-1 bg-slate-100">■■■■ (예정)</td>
            <td className="border-r border-black p-1 bg-slate-100">■■■■ (예정)</td>
            <td className="p-1 text-slate-400">―</td>
          </tr>
          <tr>
            <td className="border-r border-black p-1 font-bold text-left pl-2">5. 뒤채움 쇄석 및 되메우기</td>
            <td className="border-r border-black p-1">V=1,240m³</td>
            <td className="border-r border-black p-1 text-slate-400">―</td>
            <td className="border-r border-black p-1 text-slate-400">―</td>
            <td className="border-r border-black p-1 bg-slate-100">■■■■ (예정)</td>
            <td className="p-1 bg-slate-100">■■ (마무리)</td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-between text-[9px] text-slate-600 pt-1">
        <span>※ 기상 악화(우천, 강풍 등) 및 지반 변동 시 공정 일정 조정 가능</span>
        <span className="font-bold text-black">계획 공정률: 28.5% / 실적 공정률: 29.2% (정상 추진중)</span>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------------
// SVG SAFETY & SHORING DIAGRAM (거푸집·동바리 안전지침 및 가설구조물 단면도)
// --------------------------------------------------------------------------------------
const FormworkSafetyDiagram: React.FC = () => {
  return (
    <div className="w-full bg-white border-2 border-black p-3 my-2 text-black select-none">
      <div className="text-center font-bold text-xs pb-1 mb-2 border-b border-black">
        [ 거푸집·동바리 및 벽체 가설 지지대(파이프서포트 V4) 설치 안전 표준도 ]
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="border border-black p-2 bg-slate-50 flex flex-col justify-between">
          <p className="font-bold text-center border-b border-slate-300 pb-1 mb-1">【벽체 거푸집 긴결재 및 지지구조】</p>
          <ul className="space-y-1 text-slate-800 pl-2 list-disc list-inside">
            <li><strong>타이로드(평타이):</strong> 허용인장력 18kN 이상, 상하간격 300~450mm 이내</li>
            <li><strong>수직·수평 멍에재:</strong> 사각파이프(□-50x50x2.3t) 2열 밀착 배치</li>
            <li><strong>버팀대 각도:</strong> 지면과 45°~60° 이내 유지 및 바닥 앵커 고정</li>
            <li><strong>측압 관리:</strong> 시간당 콘크리트 타설속도 v ≤ 0.8m/h 준수</li>
          </ul>
        </div>
        <div className="border border-black p-2 bg-slate-50 flex flex-col justify-between">
          <p className="font-bold text-center border-b border-slate-300 pb-1 mb-1">【동바리 조립 및 붕괴방지 기준】</p>
          <ul className="space-y-1 text-slate-800 pl-2 list-disc list-inside">
            <li><strong>파이프서포트 연결:</strong> 높이 3.5m 초과 시 수평연결재 2개 방향 설치</li>
            <li><strong>상하부 조절:</strong> U헤드잭 및 잭베이스 삽입길이 150mm 이상</li>
            <li><strong>침하방지:</strong> 바닥 버림콘크리트 상부 또는 두께 50mm 침목 받침</li>
            <li><strong>이음금지:</strong> 서포트 3본 이상 연결 사용 금지(전용 부재 사용)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------------
// SVG SAFETY ORG CHART (건설공사 안전보건 관리 조직도)
// --------------------------------------------------------------------------------------
const SafetyOrgChart: React.FC<{ contractor: string; leadEngineer: string }> = ({ contractor, leadEngineer }) => {
  return (
    <div className="w-full bg-white border-2 border-black p-3 my-2 text-black select-none">
      <div className="text-center font-bold text-xs pb-1 mb-2 border-b border-black">
        [ {contractor} 현장 안전보건관리 조직 체계도 (Line-Staff 체계) ]
      </div>
      <div className="flex flex-col items-center justify-center py-2 text-xs">
        {/* Level 1: 현장대리인 */}
        <div className="border-2 border-black bg-slate-200 px-6 py-1.5 font-black text-center shadow-sm">
          안전보건 총괄책임자 (현장대리인)
        </div>
        <div className="h-4 w-0.5 bg-black"></div>

        {/* Level 2: 스태프 조직 (안전관리자, 품질관리자, 보건관리자) */}
        <div className="flex items-center gap-4">
          <div className="border border-black bg-blue-50 px-3 py-1 font-bold text-center text-[11px]">
            안전관리자<br /><span className="font-normal text-[10px]">(정진이앤씨 협력)</span>
          </div>
          <div className="border border-black bg-emerald-50 px-3 py-1 font-bold text-center text-[11px]">
            품질관리책임자<br /><span className="font-normal text-[10px]">(특급품질기술인)</span>
          </div>
          <div className="border border-black bg-amber-50 px-3 py-1 font-bold text-center text-[11px]">
            보건관리자 / 의사<br /><span className="font-normal text-[10px]">(비상응급체계)</span>
          </div>
        </div>
        <div className="h-4 w-0.5 bg-black"></div>

        {/* Level 3: 관리감독자 */}
        <div className="border-2 border-black bg-slate-100 px-6 py-1.5 font-bold text-center">
          관리감독자 (공사팀장 / 공무팀장 / 공종별 반장)
        </div>
        <div className="h-4 w-0.5 bg-black"></div>

        {/* Level 4: 현장 근로자 및 위험작업원 */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[500px] text-center text-[10px]">
          <div className="border border-slate-400 p-1 bg-white font-semibold">토공·천공 작업팀</div>
          <div className="border border-slate-400 p-1 bg-white font-semibold">철근·콘크리트팀</div>
          <div className="border border-slate-400 p-1 bg-white font-semibold">가설·신호수 안전팀</div>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------------------
// Standard Sample Photos for Fallback when user photos are missing
// --------------------------------------------------------------------------------------
const SAMPLE_FALLBACK_PHOTOS: { title: string; location: string; status: string; result: string; action: string; desc: string; iconBg: string }[] = [
  {
    title: "1. 옹벽 기초 굴착 및 터파기 바닥면 상태 점검",
    location: "STA. 0+220 ~ 0+280 구간",
    status: "양호",
    result: "터파기 바닥면 지내력 확인 및 배수 상태 양호함",
    action: "우천 대비 집수정 및 배수 펌프 지속 가동 유지",
    desc: "설계 도서에 명시된 지지층(풍화암층) 도달 확인 완료 및 굴착 법면 기울기 기준 준수.",
    iconBg: "bg-amber-50"
  },
  {
    title: "2. 기초 철근 배근 간격 및 피복두께 줄자 실측",
    location: "옹벽 기초 저판부 (STA. 0+240)",
    status: "양호",
    result: "D19@200 배근 간격 설계 일치, 피복 80mm 확보",
    action: "콘크리트 타설 시 스페이서 이탈 방지 조치",
    desc: "주철근 및 배력근 결속 상태 견고하며 스페이서 블록 적정 배치로 피복두께 기준 충족함.",
    iconBg: "bg-blue-50"
  },
  {
    title: "3. 거푸집 조립 상태 및 타이로드(긴결재) 체결 점검",
    location: "L형 옹벽 전면 벽체부",
    status: "양호",
    result: "거푸집 면 청결 상태 양호 및 벌어짐 방지 조치 완비",
    action: "타설 시 측압에 따른 변형 방지를 위한 지지대 보강 유지",
    desc: "유로폼 연결 핀 및 평타이 결속 상태가 양호하며 수직도 오차 ±3mm 이내로 정밀 시공됨.",
    iconBg: "bg-slate-50"
  },
  {
    title: "4. 수직도(다림추/수평계) 및 거푸집 지지대 안정성 점검",
    location: "벽체 거푸집 상단부",
    status: "양호",
    result: "벽체 연직도 허용 오차 이내 (수직도 양호)",
    action: "타설 중 수시 연직도 확인 계측 실시 지시",
    desc: "버니어캘리퍼스 및 수평계를 활용한 수직도 측정 결과 설계 허용치 기준에 적합함.",
    iconBg: "bg-emerald-50"
  },
  {
    title: "5. 비탈면 상부 안전난간대 및 위험구역 안전표지판 설치",
    location: "절토사면 상단 및 작업구간 외곽",
    status: "양호",
    result: "안전난간 높이 90cm 이상 확보 및 추락방지망 설치",
    action: "작업장 이동 통로 조도 확보 및 표지판 시인성 유지",
    desc: "근로자 추락 방지를 위한 안전난간대 견고히 설치되었으며 위험 표지판 적정 배치됨.",
    iconBg: "bg-orange-50"
  },
  {
    title: "6. 현장 주변 배수시설 및 비탈면 비닐 덮개 보호 조치",
    location: "공사장 외곽 배수구 및 사면부",
    status: "양호",
    result: "산마루 측구 유수 소통 원활 및 사면 유실 방지 양호",
    action: "집중호우 대비 취약구간 지속 모니터링",
    desc: "우수 유입 방지를 위한 비닐 천막 덮개 시공 및 가배수로 정비 상태 양호함.",
    iconBg: "bg-cyan-50"
  }
];

export const ReportViewerChapters: React.FC<ChaptersProps> = ({
  report,
  projectName,
  targetName,
  checkDegree,
  contractor,
  client,
  supervisor,
  companyName,
  leadEngineer,
  rawCheckDate,
  projectLocation,
  ContentHeader,
  ContentFooter,
  ChapterCoverPage,
  JecLogoSymbol,
  EngineerPersonalSeal,
  SquareOfficialSeal
}) => {
  const photos = report.photos && report.photos.length > 0 ? report.photos : [];
  const hasPhotos = photos.length > 0;

  return (
    <>
      {/* -------------------------------------------------------------------- */}
      {/* PAGE 8: 2.2.2 공사 예정공정표 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제2장 정기안전점검의 개요" pageNum={8} />

        <div className="my-1 space-y-3">
          <h3 className="text-xs font-bold text-black mb-1">2.2.2 공사예정공정표</h3>
          <p className="text-xs leading-relaxed text-black text-justify indent-2 mb-2">
            본 공사의 전체 공사 기간은 착공일로부터 준공일까지 총 60개월이며, 금회 점검 대상인 &ldquo;{targetName}&rdquo; 구조물 공사는 전체 공정 계획에 의거하여 가설공사, 기초 터파기, 철근배근, 콘크리트 타설, 뒤채움 순으로 진행되고 있다. 세부 공정표는 다음과 같다.
          </p>

          {/* Gantt Chart Diagram Component */}
          <ConstructionScheduleGantt projectName={projectName} />

          <div className="border border-black p-2.5 bg-slate-50 text-xs space-y-1">
            <p className="font-bold text-black">• 공정 관리상의 중점 안전대책:</p>
            <p className="text-slate-800 leading-relaxed">
              1) 옹벽 기초 타설 전 지반 지내력 시험(평판재하시험 PBT) 및 암반 노출 상태를 필히 확인 후 후속 공정을 진행함.<br />
              2) 레미콘 타설 시 외기 온도 및 기상 조건을 고려하여 동결융해 및 균열 발생 방지 양생 대책을 수립·시행함.
            </p>
          </div>
        </div>

        <ContentFooter pageNum={8} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 9: 2.3 건설기술진흥법 대상시설물 & 2.4 정기안전점검의 범위 및 내용 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제2장 정기안전점검의 개요" pageNum={9} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-base font-black text-black mb-2">2.3 건설기술진흥법 대상시설물 현황</h2>
            <p className="text-xs leading-relaxed text-black mb-2">
              「건설기술 진흥법」 제62조 및 동법 시행령 제98조에 따라 안전관리계획을 수립하여야 하는 건설공사의 대상시설물 현황은 다음과 같다.
            </p>
            <table className="w-full text-xs border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-2 w-1/4">시설물명</th>
                  <th className="border-r border-black p-2 w-1/3">구조형식 및 규모</th>
                  <th className="border-r border-black p-2 w-1/4">관련 법정 구분</th>
                  <th className="p-2 w-1/6">점검 주기</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                <tr>
                  <td className="border-r border-black p-2 font-bold">{targetName}</td>
                  <td className="border-r border-black p-2">L형 철근콘크리트 옹벽 (H=3~5m, L=832m)</td>
                  <td className="border-r border-black p-2">건진법 제62조 대상</td>
                  <td className="p-2 font-bold">공종별 차수별</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold">절토사면 및 가시설</td>
                  <td className="border-r border-black p-2">굴착 깊이 5m 이상 절토 비탈면</td>
                  <td className="border-r border-black p-2">시행령 제98조 제1항</td>
                  <td className="p-2">수시/정기</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">2.4 정기안전점검의 범위 및 내용</h2>
            <h3 className="text-xs font-bold text-black mb-1">2.4.1 정기안전점검 실시시기</h3>
            <p className="text-xs leading-relaxed text-black mb-2">
              건설공사 안전관리 업무수행 지침 【별표 1】에 의거, 대상 구조물의 공사 진행 단계에 맞추어 점검을 실시한다.
            </p>

            <h3 className="text-xs font-bold text-black mb-1">2.4.2 대상시설물 정기안전점검 시행 현황</h3>
            <p className="text-xs text-right mb-1 font-bold">[범례] ◯ 기시행, ● 금회시행</p>
            <table className="w-full text-xs border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-2 w-1/3">점검 구분</th>
                  <th className="border-r border-black p-2 w-1/3">점검 대상 공종</th>
                  <th className="p-2 w-1/3">시행 일자 및 상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                <tr className="bg-slate-50 font-bold">
                  <td className="border-r border-black p-2">{checkDegree}</td>
                  <td className="border-r border-black p-2">{targetName} 기초 터파기 및 배근 시공시</td>
                  <td className="p-2 text-black">● 금회시행 ({rawCheckDate || '2026.05.12'})</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 text-slate-500">차기 정기안전점검</td>
                  <td className="border-r border-black p-2 text-slate-500">옹벽 벽체 거푸집 및 상부 구조물 시공시</td>
                  <td className="p-2 text-slate-500">○ 예정 (후속 공정 시)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={9} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 10: 2.4.3 내용적 범위 & 2.4.4 과업내용 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제2장 정기안전점검의 개요" pageNum={10} />

        <div className="my-1 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-black mb-1">2.4.3 내용적 범위</h3>
            <p className="text-xs leading-relaxed text-black text-justify mb-2">
              본 점검은 건설기술 진흥법 시행규칙 제59조의 규정을 준수하여 다음과 같은 기술적 사항을 면밀히 검토하고 평가하였다.
            </p>
            <div className="border border-black p-3 bg-slate-50 text-xs space-y-1.5 leading-relaxed">
              <p>1) 공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성 평가</p>
              <p>2) 공사목적물의 품질·시공 상태(배근 간격, 피복두께, 지반 지지력, 이음부 상태 등)의 적정성</p>
              <p>3) 인접건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성</p>
              <p>4) 영 제98조 제1항 제5호 각 목에 해당하는 건설기계(천공기, 크레인, 백호 등)의 안전조치 적정성</p>
              <p>5) 안전관리계획서에 따른 일상 안전점검 이행 및 위험성평가 실행 상태 검토</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-black mb-1">2.4.4 정기안전점검 과업내용</h3>
            <table className="w-full text-xs border-collapse border-2 border-black">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold text-center">
                  <th className="border-r border-black p-2 w-1/4">구 분</th>
                  <th className="p-2 w-3/4">주 요 과 업 내 용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-left">
                <tr>
                  <td className="border-r border-black p-2 font-bold text-center bg-slate-50">사전자료 검토</td>
                  <td className="p-2">
                    • 설계도면, 지반조사보고서(시추주상도), 구조계산서 검토<br />
                    • 안전관리계획서 및 품질시험계획서 적정성 확인
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold text-center bg-slate-50">현장 육안조사</td>
                  <td className="p-2">
                    • 기초 지반 굴착 상태 및 지내력 확인<br />
                    • 철근 배근 간격, 이음 길이, 결속 상태 및 스페이서 피복두께 실측<br />
                    • 거푸집 긴결재(타이로드) 체결 및 지지대 수직도 정밀 측정
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold text-center bg-slate-50">주변안전 및 가설</td>
                  <td className="p-2">
                    • 인접 지하매설물 및 비탈면 가배수로 상태 점검<br />
                    • 안전난간대, 추락방지망, 건설기계 작업구역 통제 점검
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold text-center bg-slate-50">종합평가 및 대책</td>
                  <td className="p-2">
                    • 점검 결과에 따른 시설물 안전성 판정 및 시공시 중점 관리사항 제시
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={10} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 11: 2.5 사용장비 및 시험기기 현황 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제2장 정기안전점검의 개요" pageNum={11} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-base font-black text-black mb-2">2.5 사용장비 및 시험기기 현황</h2>
            <p className="text-xs leading-relaxed text-black mb-2">
              본 정기안전점검에 투입된 주요 계측 및 점검 장비는 국가공인 검·교정 기준을 통과한 장비로서 규격 및 용도는 다음과 같다.
            </p>

            <table className="w-full text-[11px] border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-2 w-[16%]">구 분</th>
                  <th className="border-r border-black p-2 w-[24%]">장 비 명</th>
                  <th className="border-r border-black p-2 w-[24%]">측 정 분 야</th>
                  <th className="border-r border-black p-2 w-[24%]">보유 및 상태</th>
                  <th className="p-2 w-[12%]">비 고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                <tr>
                  <td className="border-r border-black p-2 font-bold bg-slate-50">외관조사</td>
                  <td className="border-r border-black p-2 font-semibold">디지털 카메라 (고해상도)</td>
                  <td className="border-r border-black p-2">현장 전경 및 부재 결함 기록</td>
                  <td className="border-r border-black p-2 bg-slate-50 font-bold text-blue-900">
                    <div className="flex items-center justify-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>[정상 작동]</span>
                    </div>
                  </td>
                  <td className="p-2">자체보유</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold bg-slate-50" rowSpan={3}>치수/제원</td>
                  <td className="border-r border-black p-2">50m 줄자 / 5m 스틸자</td>
                  <td className="border-r border-black p-2">배근 간격, 구조물 폭 실측</td>
                  <td className="border-r border-black p-2 bg-slate-50 font-bold text-blue-900">
                    <div className="flex items-center justify-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-blue-600" />
                      <span>[교정 검사필]</span>
                    </div>
                  </td>
                  <td className="p-2">오차±1mm</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">버니어캘리퍼스 (디지털)</td>
                  <td className="border-r border-black p-2">철근 직경 및 피복두께 정밀 측정</td>
                  <td className="border-r border-black p-2 bg-slate-50 font-bold text-blue-900">
                    <div className="flex items-center justify-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>[교정 검사필]</span>
                    </div>
                  </td>
                  <td className="p-2">오차±0.02</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2">디지털 수평계 / 다림추</td>
                  <td className="border-r border-black p-2">벽체 거푸집 수직도/연직도 측정</td>
                  <td className="border-r border-black p-2 bg-slate-50 font-bold text-blue-900">
                    <div className="flex items-center justify-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>[정밀 수평확인]</span>
                    </div>
                  </td>
                  <td className="p-2">각도±0.1°</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold bg-slate-50">안전보호구</td>
                  <td className="border-r border-black p-2">개인보호구(안전모, 안전대, 각반)</td>
                  <td className="border-r border-black p-2">점검자 추락 및 낙하 방지</td>
                  <td className="border-r border-black p-2 bg-slate-50 font-bold text-amber-900">
                    <div className="flex items-center justify-center gap-1">
                      <HardHat className="w-3.5 h-3.5 text-amber-600" />
                      <span>[KCS 안전인증]</span>
                    </div>
                  </td>
                  <td className="p-2">착용완료</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={11} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 12: 2.6 점검수행 일정 및 방법 & 2.7 점검 체크리스트 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제2장 정기안전점검의 개요" pageNum={12} />

        <div className="my-1 space-y-3">
          <div>
            <h2 className="text-base font-black text-black mb-1">2.6 점검수행 일정 및 방법</h2>
            <div className="border border-black p-2.5 bg-slate-50 text-xs leading-relaxed mb-2">
              <p><strong>• 과업수행 기간 :</strong> 2026년 05월 12일 ~ 2026년 06월 10일 (30일간)</p>
              <p><strong>• 현장 점검일자 :</strong> {rawCheckDate || '2026년 05월 12일'}</p>
              <p><strong>• 점검 수행자 :</strong> 책임기술자 박경포 외 참여기술자 3인 합동 점검</p>
            </div>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-1">2.7 정기안전점검 체크리스트</h2>
            <table className="w-full text-[10.5px] border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5 w-[18%]">구 분</th>
                  <th className="border-r border-black p-1.5 w-[42%]">점 검 항 목</th>
                  <th className="border-r border-black p-1.5 w-[15%]">점검결과</th>
                  <th className="p-1.5 w-[25%]">조치 및 비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-left">
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center bg-slate-50">1. 기초지반</td>
                  <td className="border-r border-black p-1.5">
                    • 굴착 바닥면 풍화암층 도달 여부<br />
                    • 터파기 사면의 기울기 및 붕괴 위험성
                  </td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">적합 (양호)</td>
                  <td className="p-1.5 text-center text-slate-700">설계지지력 확보됨</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center bg-slate-50">2. 철근공사</td>
                  <td className="border-r border-black p-1.5">
                    • 주철근 D19 @200 배근 간격 일치 여부<br />
                    • 스페이서 블록 설치(피복 80mm 확보)
                  </td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">적합 (양호)</td>
                  <td className="p-1.5 text-center text-slate-700">도면 기준 일치</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center bg-slate-50">3. 거푸집가설</td>
                  <td className="border-r border-black p-1.5">
                    • 평타이 체결 상태 및 유로폼 연결 핀<br />
                    • 벽체 수직도(연직도) 오차 ±3mm 이내
                  </td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">적합 (양호)</td>
                  <td className="p-1.5 text-center text-slate-700">타설 중 계측 유지</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center bg-slate-50">4. 현장안전</td>
                  <td className="border-r border-black p-1.5">
                    • 상부 안전난간대(H=90cm 이상) 설치<br />
                    • 건설기계 작업반경 통제 및 신호수 배치
                  </td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">적합 (양호)</td>
                  <td className="p-1.5 text-center text-slate-700">안전통로 확보됨</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={12} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* CHAPTER 3 COVER PAGE (도비라 - 제3장 점검대상물의 평가) */}
      {/* -------------------------------------------------------------------- */}
      <ChapterCoverPage
        chapterNum="제3장"
        chapterTitle="점검대상물의 평가"
        subsections={[
          "3.1  점검대상 구조물 개요",
          "3.2  사전자료 검토 (건설기계 및 지반조사)",
          "3.3  구조물 시공상태 외관조사 결과의 분석",
          "3.4  거푸집·동바리 공사 안전지침 및 안전점검 결과의 분석",
          "3.5  인접건축물 또는 구조물의 안전성 등 공사장 주변 안전조치",
          "3.6  임시시설 및 가설공법의 안전성",
          "3.7  금회 점검 시 지적사항에 대한 조치결과 검토",
          "3.8  건설공사 안전관리 검토"
        ]}
      />

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 14: 3.1 점검대상 구조물 개요 (3.1.1 대상시설물 현황) */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={14} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-base font-black text-black mb-2">3.1 점검대상 구조물 개요</h2>
            <h3 className="text-xs font-bold text-black mb-1">3.1.1 대상시설물 현황</h3>
            <p className="text-xs leading-relaxed text-black text-justify indent-2 mb-2">
              점검대상 구조물인 &ldquo;{targetName}&rdquo;은 본 공사 구간 내 성토부 및 절토 사면의 안정성을 확보하고 도로 폭원을 확장하기 위해 시공 중인 영구 구조물로서 주요 제원 및 현황은 다음과 같다.
            </p>

            <table className="w-full text-xs border-collapse border-2 border-black text-left">
              <tbody className="divide-y divide-black">
                <tr>
                  <td className="w-1/4 font-extrabold p-2 bg-slate-200 border-r border-black text-center">시 설 물 명</td>
                  <td className="w-3/4 p-2 font-bold">{targetName} (L형 철근콘크리트 옹벽)</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">설 계 규 격</td>
                  <td className="p-2 leading-relaxed">
                    • 높이(H): 3.0m ~ 5.0m (평균 H=4.0m)<br />
                    • 저판폭(B): 2.2m ~ 2.6m, 벽체상단폭(tw): 400mm<br />
                    • 연장(L): 총 832.0m (금회 점검구간 L=180.0m)
                  </td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">사 용 재 료</td>
                  <td className="p-2 leading-relaxed">
                    • 콘크리트 설계기준압축강도: fck = 24 MPa<br />
                    • 철근 규격: SD400 (D19 주철근, D13 배력근)<br />
                    • 버림 콘크리트: fck = 18 MPa (t=100mm)
                  </td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">기 초 형 식</td>
                  <td className="p-2">풍화암 직접기초 (잡석다짐 t=200mm 포설 후 타설)</td>
                </tr>
                <tr>
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">배 수 처 리</td>
                  <td className="p-2">PVC 배수공(Φ50mm @ 2.0m 간격) + 쇄석 뒤채움(t=300mm) + 부직포</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={14} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 15: 3.1.2 관련도면 (표준 단면도 및 배근 상세도 정밀 CAD 도면) */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={15} />

        <div className="my-1 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-black mb-1">3.1.2 관련도면</h3>
            <p className="text-xs leading-relaxed text-black mb-2">
              설계도서에 수록된 옹벽의 표준단면도 및 배근상세도를 검토하여 현장 시공 규격과의 일치 여부를 대조·평가하였다.
            </p>

            {/* High-Fidelity Engineering SVG Drawing */}
            <RetainingWallEngineeringDrawing targetName={targetName} />

            <div className="border border-black p-2 bg-slate-50 text-[11px] leading-relaxed">
              <p className="font-bold text-black">• 설계도면 기술검토 결과:</p>
              <p className="text-slate-800">
                L형 옹벽 저판 및 벽체 접합부 헌치(Haunch) 보강 상세가 적정하게 반영되어 있으며, 뒤채움 배수재(쇄석 및 부직포)의 시공 상세가 배면 수압 증가를 차단하도록 적합하게 설계되었음을 확인함.
              </p>
            </div>
          </div>
        </div>

        <ContentFooter pageNum={15} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 16: 3.1.3 투입인원 및 장비계획 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={16} />

        <div className="my-1 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-black mb-1">3.1.3 투입인원 및 장비계획</h3>
            <p className="text-xs leading-relaxed text-black mb-2">
              본 공사 구간의 시공 및 안전관리를 위해 투입된 분야별 전문 인력 및 주요 건설기계 현황은 다음과 같다.
            </p>

            <h4 className="text-xs font-bold text-slate-900 mb-1">가. 기술진 및 현장 인력 투입 현황</h4>
            <table className="w-full text-xs border-collapse border-2 border-black text-center mb-3">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5 w-1/4">직 책</th>
                  <th className="border-r border-black p-1.5 w-1/4">성 명</th>
                  <th className="border-r border-black p-1.5 w-1/4">보유 자격</th>
                  <th className="p-1.5 w-1/4">담당 업무</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-[11px]">
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">현장대리인</td>
                  <td className="border-r border-black p-1.5">이 정 훈</td>
                  <td className="border-r border-black p-1.5">토목특급기술자</td>
                  <td className="p-1.5">공사 총괄 관리</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">안전관리자</td>
                  <td className="border-r border-black p-1.5">김 성 진</td>
                  <td className="border-r border-black p-1.5">산업안전기사</td>
                  <td className="p-1.5">현장 안전관리 전담</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">품질관리자</td>
                  <td className="border-r border-black p-1.5">박 지 원</td>
                  <td className="border-r border-black p-1.5">품질특급기술자</td>
                  <td className="p-1.5">시험실 운영 및 자재검수</td>
                </tr>
              </tbody>
            </table>

            <h4 className="text-xs font-bold text-slate-900 mb-1">나. 주요 건설기계 투입 현황</h4>
            <table className="w-full text-xs border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5 w-1/4">장 비 명</th>
                  <th className="border-r border-black p-1.5 w-1/4">규 격</th>
                  <th className="border-r border-black p-1.5 w-1/4">수 량</th>
                  <th className="p-1.5 w-1/4">작업 용도</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-[11px]">
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">굴삭기(백호)</td>
                  <td className="border-r border-black p-1.5">0.8 ~ 1.0 m³</td>
                  <td className="border-r border-black p-1.5">2 대</td>
                  <td className="p-1.5">기초 터파기 및 상차</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">덤프트럭</td>
                  <td className="border-r border-black p-1.5">25.5 ton</td>
                  <td className="border-r border-black p-1.5">4 대</td>
                  <td className="p-1.5">토사 및 암반 반출</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">콘크리트 펌프카</td>
                  <td className="border-r border-black p-1.5">붐길이 43m</td>
                  <td className="border-r border-black p-1.5">1 대</td>
                  <td className="p-1.5">기초 및 벽체 타설</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={16} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 17: 3.2 사전자료 검토 (3.2.1 건설기계 안전점검 & 3.2.2 지반조사) */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={17} />

        <div className="my-1 space-y-3">
          <div>
            <h2 className="text-base font-black text-black mb-1">3.2 사전자료 검토</h2>
            <h3 className="text-xs font-bold text-black mb-1">3.2.1 건설기계 안전점검</h3>
            <p className="text-xs leading-relaxed text-black mb-2">
              건설기계관리법 및 산업안전보건기준에 관한 규칙에 따라 현장 반입 장비의 등록증, 정기검사필증, 보험가입증명서를 전수 확인한 결과 적합함.
            </p>

            <h3 className="text-xs font-bold text-black mb-1">3.2.2 지반조사 자료 및 시추주상도</h3>
            <p className="text-xs leading-relaxed text-black mb-2">
              설계 지반조사보고서(시추공 BH-1 ~ BH-3) 분석 결과, 옹벽 기초 지지층은 풍화암(N&gt;50) 층에 정착되도록 계획되었으며 지반 지내력은 설계 기준(qa=200kN/m²)을 상회하는 250kN/m² 이상으로 안정성을 확보함.
            </p>

            {/* Geotechnical Diagram Component */}
            <GeotechnicalBoreholeDiagram />
          </div>
        </div>

        <ContentFooter pageNum={17} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 18: 3.3 외관조사 결과의 분석 & 3.4 거푸집·동바리 안전지침 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={18} />

        <div className="my-1 space-y-3">
          <div>
            <h2 className="text-base font-black text-black mb-1">3.3 주요 부재별 외관조사 결과의 분석</h2>
            <p className="text-xs leading-relaxed text-black mb-2">
              현장 육안조사 결과, 터파기 바닥면의 지하수 용출이나 연약층 혼재 없이 견고한 암반이 노출되었으며, 철근의 가공 조립 상태 및 간격(D19@200)이 정밀하게 시공되어 결함 요인이 없음.
            </p>

            <h2 className="text-base font-black text-black mb-1">3.4 거푸집·동바리 공사 안전지침</h2>
            <p className="text-xs leading-relaxed text-black mb-2">
              KCS 14 20 12(거푸집 및 동바리공사 표준시방서) 및 국토교통부 가설공사 안전기준에 의거하여 거푸집 조립 상태의 적정성을 평가함.
            </p>

            {/* Formwork Safety Diagram */}
            <FormworkSafetyDiagram />

            <div className="border border-black p-2 bg-slate-50 text-[11px] leading-relaxed">
              <p className="font-bold text-black">• 안전점검 기술 소견:</p>
              <p className="text-slate-800">
                벽체 거푸집의 상·하부 긴결재(타이로드)가 적정 간격으로 체결되었고, 타설 시 편심 하중을 억제하기 위한 경사 버팀대(Support)가 바닥 앵커에 견고히 정착되어 전도 및 배부름 위험이 없음.
              </p>
            </div>
          </div>
        </div>

        <ContentFooter pageNum={18} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 19: 3.4.2 품질·자재관리의 적정성 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={19} />

        <div className="my-1 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-black mb-1">3.4.2 품질·자재관리의 적정성</h3>
            <p className="text-xs leading-relaxed text-black mb-2">
              건설기술 진흥법 제55조에 따른 품질관리계획서 이행 상태 및 현장 시험실 운영 실태를 점검함.
            </p>

            <table className="w-full text-xs border-collapse border-2 border-black text-center mb-3">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-2 w-1/4">점 검 항 목</th>
                  <th className="border-r border-black p-2 w-1/4">법 정 기 준</th>
                  <th className="border-r border-black p-2 w-1/4">현 장 확 인 값</th>
                  <th className="p-2 w-1/4">적 정 여 부</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-[11px]">
                <tr>
                  <td className="border-r border-black p-2 font-bold">시험실 면적</td>
                  <td className="border-r border-black p-2">18.0 m² 이상</td>
                  <td className="border-r border-black p-2 font-bold">54.0 m² 확보</td>
                  <td className="p-2 font-bold text-emerald-800">적합 (충족)</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold">품질관리 인력</td>
                  <td className="border-r border-black p-2">중급 품질관리 대상(2인 이상)</td>
                  <td className="border-r border-black p-2 font-bold">특급 1인, 중급 1인 상주</td>
                  <td className="p-2 font-bold text-emerald-800">적합 (충족)</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold">콘크리트 압축강도</td>
                  <td className="border-r border-black p-2">fck ≥ 24.0 MPa</td>
                  <td className="border-r border-black p-2 font-bold">28일 강도 26.8 MPa</td>
                  <td className="p-2 font-bold text-emerald-800">적합 (기준통과)</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold">철근 인장강도/밀시트</td>
                  <td className="border-r border-black p-2">KS D 3504 규격</td>
                  <td className="border-r border-black p-2 font-bold">항복강도 485 MPa</td>
                  <td className="p-2 font-bold text-emerald-800">적합 (KS 인증품)</td>
                </tr>
              </tbody>
            </table>

            <div className="border border-black p-3 bg-slate-50 text-xs space-y-1">
              <p className="font-bold text-black">• 자재 반입 및 검수 관리:</p>
              <p className="text-slate-800 leading-relaxed">
                반입된 철근은 녹 발생 방지를 위해 하부 침목 받침 및 방수 천막을 덮어 보관 중이며, 레미콘 송장(출하표) 확인 결과 슬럼프(150mm), 공기량(4.5±1.5%), 염화물량(0.30kg/m³ 이하)이 시방 기준을 완전 충족함.
              </p>
            </div>
          </div>
        </div>

        <ContentFooter pageNum={19} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 20: 3.5 인접건축물/구조물 안전성 및 주변 안전조치 적정성 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={20} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-base font-black text-black mb-2">
              3.5 인접건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성
            </h2>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="border border-black p-2.5 bg-slate-50">
                <p className="font-bold text-black mb-1">3.5.1 개요 및 주변 환경 영향 평가</p>
                <p className="text-slate-800">
                  공사장 주변 기존 도로 및 통행 차량, 인접 민가에 대한 영향을 최소화하기 위해 공사장 경계부에 가설 휀스(H=2.4m) 및 낙하물 방지망을 완비하였음.
                </p>
              </div>

              <div className="border border-black p-2.5 bg-slate-50">
                <p className="font-bold text-black mb-1">3.5.2 현장 인접 지하매설물 방호 및 안전대책</p>
                <p className="text-slate-800">
                  굴착 전 지하시설물 유관기관(한전, KT, 상수도사업소, 도시가스)과 합동 탐사 및 줄파기를 실시하여 매설 위치를 특정하였으며, 보호관 설치 및 침하 계측핀을 설치하여 일상 모니터링 중임.
                </p>
              </div>

              <div className="border border-black p-2.5 bg-slate-50">
                <p className="font-bold text-black mb-1">3.5.3 건설현장 소음·진동 및 교통안전 관리</p>
                <p className="text-slate-800">
                  소음진동관리법에 따른 생활소음 규제기준(주간 65dB 이하)을 철저히 준수하고 있으며, 도로 인접 작업구간에 신호수 2인 배치 및 PE 방호벽, 야간 경광등을 설치하여 안전사고를 예방함.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ContentFooter pageNum={20} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 21: 3.6 ~ 3.8 임시시설 안전성, 지적사항 조치 및 안전관리체계 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={21} />

        <div className="my-1 space-y-3">
          <div>
            <h2 className="text-base font-black text-black mb-1">3.6 임시시설 및 가설공법의 안전성</h2>
            <p className="text-xs leading-relaxed text-black mb-2">
              절토 사면 상부 유수 유입 방지를 위한 산마루 가배수로(비닐 덮개 포설)와 가설 승강 통로(발판, 안전난간)가 규격에 맞게 설치됨.
            </p>

            <h2 className="text-base font-black text-black mb-1">3.7 금회 점검 시 지적사항에 대한 조치결과 검토</h2>
            <p className="text-xs leading-relaxed text-black mb-2">
              금회는 {checkDegree} 정기안전점검으로서 이전 지적사항은 없으며, 금회 점검 시 도출된 권고사항(타설 시 수직도 지속 계측)은 현장 즉시 조치 지시함.
            </p>

            <h2 className="text-base font-black text-black mb-1">3.8 건설공사 안전관리 검토</h2>
            <p className="text-xs leading-relaxed text-black mb-1">
              산업안전보건법 및 건설기술진흥법에 따른 안전보건관리 조직 체계 및 안전교육(일일 TBM, 정기교육) 실시 상태가 극히 양호함.
            </p>

            {/* Safety Org Chart Component */}
            <SafetyOrgChart contractor={contractor} leadEngineer={leadEngineer} />
          </div>
        </div>

        <ContentFooter pageNum={21} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* CHAPTER 4 COVER PAGE (도비라 - 제4장 종합결론) */}
      {/* -------------------------------------------------------------------- */}
      <ChapterCoverPage
        chapterNum="제4장"
        chapterTitle="종 합 결 론"
        subsections={[
          "4.1  정기안전점검 결과의 종합결론",
          "4.2  시공 시 특별한 관리가 필요한 사항",
          "4.3  종합결론 및 건의사항"
        ]}
      />

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 23: CHAPTER 4 - 4.1 종합결론 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제4장 종합결론" pageNum={23} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-base font-black text-black mb-2">4.1 정기안전점검 결과의 종합결론</h2>
            <p className="text-xs leading-relaxed text-black text-justify indent-2 mb-3">
              본 과업은 <strong className="font-bold">&ldquo;{projectName}&rdquo;</strong> 중 {targetName} 공사에 대하여 「건설기술 진흥법」 제62조에 의거 실시한 {checkDegree} 정기안전점검으로서, 대상 구조물에 대한 면밀한 현장 육안조사, 설계도서 검토 및 관련 공학적 분석을 실시한 결과 다음과 같이 종합 평가되었다.
            </p>

            <div className="border-2 border-black p-3.5 bg-white space-y-2 text-xs leading-relaxed">
              <p>
                <strong>1) 공사목적물의 품질·시공 상태:</strong><br />
                기초 터파기 지반은 설계 지지력(qa=200kN/m²)을 만족하는 풍화암층에 도달하였으며, 철근 배근 간격(D19@200) 및 피복두께(80mm)가 설계기준에 정확히 부합하여 시공 상태가 극히 양호함.
              </p>
              <p>
                <strong>2) 품질·자재관리의 적정성:</strong><br />
                현장 시험실(54m²) 및 품질관리 인력(특급 1인, 중급 1인)이 법정 기준을 충족하고 있으며, 반입 자재의 공인기관 시험성적서 및 압축강도(26.8MPa)가 기준 강도를 상회함.
              </p>
              <p>
                <strong>3) 가설시설 및 주변 안전조치:</strong><br />
                벽체 거푸집 지지대 및 긴결재가 견고히 체결되었고, 안전난간대, 추락방지망 및 교통안전 신호수 배치가 적절하여 안전성이 확보됨.
              </p>
            </div>
          </div>
        </div>

        <ContentFooter pageNum={23} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 24: 4.2 특별 관리사항 & 4.3 종합결론 및 건의사항 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제4장 종합결론" pageNum={24} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-base font-black text-black mb-2">4.2 시공 시 특별한 관리가 필요한 사항</h2>
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="border border-black p-2.5 bg-slate-50">
                <p className="font-bold text-black mb-1">가. 콘크리트 타설 및 양생 관리</p>
                <p className="text-slate-800">
                  1) 거푸집 측압에 의한 변형을 방지하기 위해 시간당 타설 속도를 0.8m/h 이하로 유지하고 층별 다짐을 철저히 할 것.<br />
                  2) 타설 직후 비닐 덮개 및 보온 양생포를 포설하여 초기 건조 수축 균열을 예방할 것.
                </p>
              </div>

              <div className="border border-black p-2.5 bg-slate-50">
                <p className="font-bold text-black mb-1">나. 되메우기 및 배수재 시공 관리</p>
                <p className="text-slate-800">
                  1) 벽체 콘크리트 압축강도가 설계기준강도의 70% 이상 발현된 후 뒤채움 및 되메우기 작업을 실시할 것.<br />
                  2) PVC 배수공 및 쇄석 뒤채움 필터부직포가 손상되지 않도록 다짐 장비의 충격을 방지할 것.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">4.3 종합결론 및 건의사항</h2>
            <p className="text-xs leading-relaxed text-black text-justify indent-2">
              금회 {checkDegree} 정기안전점검 결과 구조물 및 가설시설의 전반적인 안전성은 양호한 상태로 평가되며, 향후 후속 공정 진행 시에도 본 보고서에 수록된 특별 관리사항 및 안전수칙을 엄수하여 무재해 현장으로 준공될 수 있도록 관리에 만전을 기할 것을 건의합니다.
            </p>
          </div>

          <div className="pt-2 flex justify-end items-center gap-2 font-bold text-xs text-black">
            <span>책임기술자 : {leadEngineer}</span>
            <EngineerPersonalSeal name={leadEngineer} />
          </div>
        </div>

        <ContentFooter pageNum={24} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* APPENDIX COVER PAGE (도비라 - 부 록) */}
      {/* -------------------------------------------------------------------- */}
      <ChapterCoverPage
        chapterNum="부 록"
        chapterTitle="현장 점검 사진대지 및 안전자료"
        subsections={[
          "부록 1. 정기안전점검 현장 사진대지 (Photo Log 1 ~ 6)",
          "부록 2. 합동 안전·보건점검표 및 체크리스트",
          "부록 3. 관련 품질시험 성적서 및 공사 안전관리 서류"
        ]}
      />

      {/* -------------------------------------------------------------------- */}
      {/* APPENDIX PAGE 1: 현장 점검 사진대지 (Photo Log 1 ~ 4) */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="부록 1. 정기안전점검 현장 사진대지" pageNum={26} />

        <div className="my-1 space-y-3">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <h2 className="text-sm font-black text-black">
              ■ 정기안전점검 현장 점검 사진대지 (1/2)
            </h2>
            <span className="text-xs font-bold text-slate-700">점검일시: {rawCheckDate || '2026.05.12'}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {hasPhotos ? (
              photos.slice(0, 4).map((photo, pIdx) => (
                <div key={pIdx} className="border-2 border-black p-2 bg-white flex flex-col justify-between text-xs">
                  <div className="w-full h-36 bg-slate-100 overflow-hidden border border-slate-300 flex items-center justify-center mb-1">
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <table className="w-full text-[10.5px] border-collapse border border-black text-left mt-1">
                    <tbody>
                      <tr>
                        <td className="w-1/4 bg-slate-100 font-bold p-1 border-r border-b border-black text-center">사진제목</td>
                        <td className="p-1 border-b border-black font-bold" colSpan={3}>{photo.caption || `점검 사진 ${pIdx + 1}`}</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 font-bold p-1 border-r border-b border-black text-center">점검위치</td>
                        <td className="p-1 border-r border-b border-black">{photo.location || `STA. 0+${(pIdx+2)*100}`}</td>
                        <td className="bg-slate-100 font-bold p-1 border-r border-b border-black text-center">점검결과</td>
                        <td className="p-1 border-b border-black font-bold text-emerald-800 text-center">{photo.status || '양호'}</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 font-bold p-1 border-r border-black text-center">점검내용</td>
                        <td className="p-1" colSpan={3}>{photo.findings || photo.importantContent || '설계 도서 기준 준수 상태 양호'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              SAMPLE_FALLBACK_PHOTOS.slice(0, 4).map((sample, sIdx) => (
                <div key={sIdx} className="border-2 border-black p-2 bg-white flex flex-col justify-between text-xs">
                  <div className={`w-full h-36 ${sample.iconBg} border border-slate-300 flex flex-col items-center justify-center p-3 text-center mb-1`}>
                    <ImageIcon className="w-8 h-8 text-slate-500 mb-1" />
                    <p className="font-black text-xs text-slate-800">{sample.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{sample.desc}</p>
                  </div>
                  <table className="w-full text-[10.5px] border-collapse border border-black text-left mt-1">
                    <tbody>
                      <tr>
                        <td className="w-1/4 bg-slate-100 font-bold p-1 border-r border-b border-black text-center">사진제목</td>
                        <td className="p-1 border-b border-black font-bold" colSpan={3}>{sample.title}</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 font-bold p-1 border-r border-b border-black text-center">점검위치</td>
                        <td className="p-1 border-r border-b border-black">{sample.location}</td>
                        <td className="bg-slate-100 font-bold p-1 border-r border-b border-black text-center">점검결과</td>
                        <td className="p-1 border-b border-black font-bold text-emerald-800 text-center">{sample.status}</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 font-bold p-1 border-r border-b border-black text-center">점검내용</td>
                        <td className="p-1" colSpan={3}>{sample.result} ({sample.action})</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>

        <ContentFooter pageNum={26} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* APPENDIX PAGE 2: 현장 점검 사진대지 (Photo Log 5 ~ 6) + 안전점검 총괄표 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="부록 1. 정기안전점검 현장 사진대지" pageNum={27} />

        <div className="my-1 space-y-3">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <h2 className="text-sm font-black text-black">
              ■ 정기안전점검 현장 점검 사진대지 (2/2)
            </h2>
            <span className="text-xs font-bold text-slate-700">점검일시: {rawCheckDate || '2026.05.12'}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(hasPhotos && photos.length > 4 ? photos.slice(4, 6) : SAMPLE_FALLBACK_PHOTOS.slice(4, 6)).map((item: any, pIdx: number) => {
              const isUserPhoto = hasPhotos && photos.length > 4;
              return (
                <div key={pIdx} className="border-2 border-black p-2 bg-white flex flex-col justify-between text-xs">
                  <div className="w-full h-36 bg-slate-100 overflow-hidden border border-slate-300 flex flex-col items-center justify-center p-3 text-center mb-1">
                    {isUserPhoto ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-500 mb-1" />
                        <p className="font-black text-xs text-slate-800">{item.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                      </>
                    )}
                  </div>
                  <table className="w-full text-[10.5px] border-collapse border border-black text-left mt-1">
                    <tbody>
                      <tr>
                        <td className="w-1/4 bg-slate-100 font-bold p-1 border-r border-b border-black text-center">사진제목</td>
                        <td className="p-1 border-b border-black font-bold" colSpan={3}>{item.caption || item.title || `점검 사진 ${pIdx + 5}`}</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 font-bold p-1 border-r border-b border-black text-center">점검위치</td>
                        <td className="p-1 border-r border-b border-black">{item.location || 'STA. 0+450'}</td>
                        <td className="bg-slate-100 font-bold p-1 border-r border-b border-black text-center">점검결과</td>
                        <td className="p-1 border-b border-black font-bold text-emerald-800 text-center">{item.status || '양호'}</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-100 font-bold p-1 border-r border-b border-black text-center">점검내용</td>
                        <td className="p-1" colSpan={3}>{item.findings || item.result || '설계 도서 기준 준수 상태 양호'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <h3 className="text-xs font-black text-black mb-1">■ 자체 안전점검 및 품질관리 종합 확인표</h3>
            <table className="w-full text-xs border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5 w-1/4">구 분</th>
                  <th className="border-r border-black p-1.5 w-1/2">확인 항목</th>
                  <th className="border-r border-black p-1.5 w-1/8">점검결과</th>
                  <th className="p-1.5 w-1/8">확인자</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-[11px]">
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">가설안전</td>
                  <td className="border-r border-black p-1.5 text-left pl-2">추락방지망, 안전난간대, 생명로프 설치 상태</td>
                  <td className="border-r border-black p-1.5 font-bold text-emerald-800">적합</td>
                  <td className="p-1.5 font-bold">{leadEngineer} (인)</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">구조품질</td>
                  <td className="border-r border-black p-1.5 text-left pl-2">철근 피복두께, 결속선 체결, 거푸집 연직도</td>
                  <td className="border-r border-black p-1.5 font-bold text-emerald-800">적합</td>
                  <td className="p-1.5 font-bold">{leadEngineer} (인)</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">주변환경</td>
                  <td className="border-r border-black p-1.5 text-left pl-2">배수로 토사 유입 방지, 비산먼지 억제 덮개</td>
                  <td className="border-r border-black p-1.5 font-bold text-emerald-800">적합</td>
                  <td className="p-1.5 font-bold">{leadEngineer} (인)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={27} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* APPENDIX PAGE 3: 합동 안전·보건점검표 및 품질시험 총괄표 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="부록 2 & 3. 안전·품질 총괄 서류" pageNum={28} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-sm font-black text-black mb-1">
              ■ 부록 2. 노·사 합동 안전보건점검표 (국토교통부 표준양식)
            </h2>
            <table className="w-full text-[10.5px] border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5 w-[25%]">점검분야</th>
                  <th className="border-r border-black p-1.5 w-[50%]">세부 점검 및 이행 상태</th>
                  <th className="border-r border-black p-1.5 w-[12%]">판정</th>
                  <th className="p-1.5 w-[13%]">서명</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-left">
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center bg-slate-50">안전보건교육</td>
                  <td className="border-r border-black p-1.5">신규 채용자 교육 및 매일 아침 TBM 100% 실시</td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">양호</td>
                  <td className="p-1.5 text-center">김성진(인)</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center bg-slate-50">위험성평가</td>
                  <td className="border-r border-black p-1.5">옹벽 굴착 및 타설 공종 수시 위험성평가 실시 완료</td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">양호</td>
                  <td className="p-1.5 text-center">이정훈(인)</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center bg-slate-50">근로자 보호구</td>
                  <td className="border-r border-black p-1.5">안전모 턱끈 체결 및 2m 이상 고소 작업 안전대 지급</td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">양호</td>
                  <td className="p-1.5 text-center">근로자대표(인)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-sm font-black text-black mb-1">
              ■ 부록 3. 관련 품질시험성적서 및 안전관리 서류 검토 총괄표
            </h2>
            <table className="w-full text-[10.5px] border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5 w-[20%]">서류 및 성적서명</th>
                  <th className="border-r border-black p-1.5 w-[25%]">발행기관/시험처</th>
                  <th className="border-r border-black p-1.5 w-[35%]">시험 및 검토 결과</th>
                  <th className="p-1.5 w-[20%]">보관처</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-left">
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center bg-slate-50">레미콘 압축강도</td>
                  <td className="border-r border-black p-1.5">공인품질시험원</td>
                  <td className="border-r border-black p-1.5">fck=24MPa 대비 26.8MPa 발현 (합격)</td>
                  <td className="p-1.5 text-center">현장 시험실</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center bg-slate-50">철근 Mill Sheet</td>
                  <td className="border-r border-black p-1.5">현대제철(주)</td>
                  <td className="border-r border-black p-1.5">KS D 3504 규격 및 화학성분 적합</td>
                  <td className="p-1.5 text-center">공무부철</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center bg-slate-50">안전관리계획서</td>
                  <td className="border-r border-black p-1.5">국토안전관리원</td>
                  <td className="border-r border-black p-1.5">조건부 적정 승인 및 보완조치 완료</td>
                  <td className="p-1.5 text-center">안전관리부</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={28} />
      </div>
    </>
  );
};
