import React from "react";
import { SafetyReport, PhotoItem } from "../types";
import { Camera, Ruler, ShieldCheck, HardHat, CheckCircle2, AlertTriangle, FileText, Image as ImageIcon, MapPin, Compass } from "lucide-react";

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

// Standard Sample Photos for Fallback when user photos are missing
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
      {/* PAGE 15: 2.2.2 공사 예정공정표 & 2.3 건설기술진흥법 대상시설물 현황 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제2장 정기안전점검의 개요" pageNum={8} />

        <div className="my-1 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-black mb-2">2.2.2 공사 예정공정표</h3>
            <div className="border border-black p-3 bg-slate-50 text-center">
              <p className="text-xs font-bold mb-2">[예정공정표 (착공후+D) - 휴무, 우천시 공기 연장]</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-200">
                      <th className="border border-slate-400 p-1">공종</th>
                      <th className="border border-slate-400 p-1">규격/수량</th>
                      <th className="border border-slate-400 p-1">1개월</th>
                      <th className="border border-slate-400 p-1">2개월</th>
                      <th className="border border-slate-400 p-1">3개월</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 p-1 font-bold">가설/가비계 공사</td>
                      <td className="border border-slate-400 p-1">자재반입/조립</td>
                      <td className="border border-slate-400 p-1 bg-black/20 text-center">■■■■</td>
                      <td className="border border-slate-400 p-1 text-center">―</td>
                      <td className="border border-slate-400 p-1 text-center">―</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-1 font-bold">토공사 및 터파기</td>
                      <td className="border border-slate-400 p-1">L=832m/1차</td>
                      <td className="border border-slate-400 p-1 bg-black/20 text-center">■■■■</td>
                      <td className="border border-slate-400 p-1 bg-black/20 text-center">■■■■</td>
                      <td className="border border-slate-400 p-1 text-center">―</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 p-1 font-bold">철근배근 및 기초타설</td>
                      <td className="border border-slate-400 p-1">L형 옹벽 기초</td>
                      <td className="border border-slate-400 p-1 text-center">―</td>
                      <td className="border border-slate-400 p-1 bg-black/20 text-center">■■■■</td>
                      <td className="border border-slate-400 p-1 bg-black/20 text-center">■■■■</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">2.3 건설기술진흥법 대상시설물 현황</h2>
            <table className="w-full text-xs border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-2 w-1/4">시설물명</th>
                  <th className="border-r border-black p-2 w-1/3">구조형식</th>
                  <th className="border-r border-black p-2 w-1/4">시설물 구분</th>
                  <th className="p-2 w-1/6">비 고</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-black p-2 font-bold">{targetName}</td>
                  <td className="border-r border-black p-2">L형 철근콘크리트 옹벽</td>
                  <td className="border-r border-black p-2">옹벽 구조물</td>
                  <td className="p-2 font-bold">2종 시설물</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">2.4 정기안전점검의 범위 및 내용</h2>
            <h3 className="text-xs font-bold text-black mb-1">2.4.1 정기안전점검 실시시기</h3>
            <p className="text-xs leading-relaxed text-black mb-2">
              ※ 적용하는 건설공사의 규모, 기간, 현장여건에 따라 점검시기 및 횟수를 조정할 수 있다.<br />
              「건설기술 진흥법」 제62조에 따른 &ldquo;건설공사 안전관리 업무수행 지침 [별표 1]&rdquo;
            </p>

            <h3 className="text-xs font-bold text-black mb-1">2.4.2 대상시설물 정기안전점검 시행 현황</h3>
            <p className="text-xs text-right mb-1 font-bold">[범례] ◯기시행, ●금회시행</p>
            <table className="w-full text-xs border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-2 w-1/3">공 종</th>
                  <th className="p-2 w-2/3">{projectName}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                <tr>
                  <td className="border-r border-black p-2 font-bold">1차 정기안전점검</td>
                  <td className="p-2">
                    가시설공사 및 기초공사 시공시(콘크리트 타설전) <span className="font-extrabold text-black">● ({rawCheckDate || '26.05.12'})</span>
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold">2차 정기안전점검</td>
                  <td className="p-2 text-slate-500">구조체공사 시공시 (예정) -</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={8} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 16: 2.4.3 내용적 범위, 2.4.4 과업내용, 2.5 사용장비 현황 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제2장 정기안전점검의 개요" pageNum={9} />

        <div className="my-1 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-black mb-1">2.4.3 내용적 범위</h3>
            <p className="text-xs leading-relaxed text-black text-justify mb-2">
              본 정기안전점검은 건설기술 진흥법 시행규칙 제59조(정기안전점검 및 정밀안전점검)의 규정을 준용하여 점검을 실시하였으며, 구체적인 사항은 다음과 같다.
            </p>
            <ol className="list-decimal list-inside text-xs leading-relaxed space-y-1 pl-2">
              <li>공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성</li>
              <li>공사 목적물의 품질, 시공상태 등의 적정성</li>
              <li>인접 건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성</li>
              <li>영 제98조제1항제5호각 목에 해당하는 건설기계의 설치, 해체 등 작업절차 및 안전조치의 적정성</li>
              <li>이전의 점검 시 지적된 사항에 대한 조치결과 확인</li>
            </ol>
          </div>

          <div>
            <h3 className="text-xs font-bold text-black mb-1">2.4.4 정기안전점검 과업내용</h3>
            <table className="w-full text-xs border-collapse border-2 border-black">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold text-center">
                  <th className="border-r border-black p-2 w-1/4">구 분</th>
                  <th className="p-2 w-3/4">과업의 내용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-left">
                <tr>
                  <td className="border-r border-black p-2 font-bold text-center">관련자료 조사</td>
                  <td className="p-2">
                    • 설계도면 및 관련도서 검토<br />
                    • 관련기준 검토 및 계측 계획서 검토<br />
                    • 자체 품질시험 실시 서류 검토<br />
                    • 안전관리 계획서 서류 검토
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold text-center">현장조사 및 평가</td>
                  <td className="p-2">
                    • 주요 부재별 외관조사 결과 분석<br />
                    • 조사, 시험 및 측정자료 검토<br />
                    • 인접건축물/구조물의 안전성 및 공사장 주변 안전조치 적정성<br />
                    • 임시시설 및 가설공법의 안전성, 건설공사 안전관리 검토
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-black p-2 font-bold text-center">종합결론</td>
                  <td className="p-2">
                    • 종합결론 도출 및 시설물 상태 평가<br />
                    • 시공 시 특별한 관리가 필요한 사항<br />
                    • 기타 안전확보를 위해 필요한 제반사항
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">2.5 사용장비 및 시험기기 현황</h2>
            <table className="w-full text-[11px] border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-200 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5 w-1/6">구 분</th>
                  <th className="border-r border-black p-1.5 w-1/4">측정장비</th>
                  <th className="border-r border-black p-1.5 w-1/4">측정분야</th>
                  <th className="border-r border-black p-1.5 w-1/4">관련사진</th>
                  <th className="p-1.5 w-1/12">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">외관조사</td>
                  <td className="border-r border-black p-1.5">디지털 카메라</td>
                  <td className="border-r border-black p-1.5">현황 촬영</td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-slate-700 bg-slate-50">
                    <div className="flex items-center justify-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>[카메라 보유]</span>
                    </div>
                  </td>
                  <td className="p-1.5">-</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold" rowSpan={3}>제원조사</td>
                  <td className="border-r border-black p-1.5">50m 줄자 / 5m STEEL자</td>
                  <td className="border-r border-black p-1.5 font-bold" rowSpan={3}>규격 측정</td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-slate-700 bg-slate-50">
                    <div className="flex items-center justify-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-blue-600" />
                      <span>[줄자 보유]</span>
                    </div>
                  </td>
                  <td className="p-1.5">-</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5">STAFF</td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-slate-700 bg-slate-50">
                    <div className="flex items-center justify-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-blue-600" />
                      <span>[스태프 보유]</span>
                    </div>
                  </td>
                  <td className="p-1.5">-</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5">버니어캘리퍼스 / 수평계</td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-slate-700 bg-slate-50">
                    <div className="flex items-center justify-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>[수평계 보유]</span>
                    </div>
                  </td>
                  <td className="p-1.5">-</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold">기 타</td>
                  <td className="border-r border-black p-1.5">개인 안전장비(안전대, 안전모, 안전화)</td>
                  <td className="border-r border-black p-1.5">점검 시 안전장비</td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-slate-700 bg-slate-50">
                    <div className="flex items-center justify-center gap-1">
                      <HardHat className="w-3.5 h-3.5 text-amber-600" />
                      <span>[보호구 착용]</span>
                    </div>
                  </td>
                  <td className="p-1.5">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={9} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 17: 2.6 일정 및 방법 & 2.7 체크리스트 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제2장 정기안전점검의 개요" pageNum={10} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-base font-black text-black mb-2">2.6 점검수행 일정 및 방법</h2>
            <p className="text-xs font-bold mb-2">○ 과업수행 기간 : 2026년 05월 12일 ~ 2026년 06월 10일</p>
            <div className="pl-4 text-xs space-y-1 mb-3">
              <p>1) 현장조사 : 2026년 05월 12일</p>
              <p>2) 자료분석 및 검토 : 2026년 05월 13일 ~ 2026년 05월 26일</p>
              <p>3) 보고서 작성 및 제출 : 2026년 05월 27일 ~ 2026년 06월 10일</p>
            </div>
            <p className="text-xs font-bold mb-2">○ 정기안전점검 과업수행 흐름도</p>
            <div className="border border-black p-3 bg-slate-50 text-center text-xs space-y-2">
              <div className="inline-block border border-black px-4 py-1 bg-white font-bold">현장답사 및 자료수집</div>
              <div>↓</div>
              <div className="inline-block border border-black px-4 py-1 bg-white font-bold">점검항목별 현장조사</div>
              <div className="grid grid-cols-4 gap-2 pt-2 text-[10px]">
                <div className="border border-black p-1 bg-white">품질관리 상태 점검</div>
                <div className="border border-black p-1 bg-white">구조물 시공 상태 점검</div>
                <div className="border border-black p-1 bg-white">안전관리 상태 점검</div>
                <div className="border border-black p-1 bg-white">기타 점검항목</div>
              </div>
              <div>↓</div>
              <div className="inline-block border border-black px-4 py-1 bg-white font-bold">점검결과 분석 및 상태평가 → 보고서 작성 및 제출</div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">2.7 정기안전점검 체크리스트</h2>
            <div className="bg-slate-200 border-2 border-black p-1 text-center font-bold text-xs mb-2">
              정기안전점검 Check List ({targetName} 정기안전점검표)
            </div>
            <table className="w-full text-xs border-collapse border-2 border-black text-center">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold">
                  <th className="border-r border-black p-1.5 w-1/5">구 분</th>
                  <th className="border-r border-black p-1.5 w-2/5">점 검 사 항</th>
                  <th className="border-r border-black p-1.5 w-1/8">점검결과</th>
                  <th className="border-r border-black p-1.5 w-1/8">조치사항</th>
                  <th className="p-1.5 w-1/5">비 고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-left text-[11px]">
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center">1. 기초지반</td>
                  <td className="border-r border-black p-1.5">∘ 세굴, 활동 발생 여부<br />∘ 침하 발생 여부</td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">양호<br />양호</td>
                  <td className="border-r border-black p-1.5 text-center">-<br />-</td>
                  <td className="p-1.5 text-center">-</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center">2. {targetName}</td>
                  <td className="border-r border-black p-1.5">
                    ∘ 전면부 파손 및 손상, 균열, 배부름 등<br />
                    ∘ 전면부 유실·이격 여부<br />
                    ∘ 수직 및 수평 변위 발생 여부<br />
                    ∘ 철근 배근 및 거푸집 긴결 적정성
                  </td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">
                    양호<br />없음<br />없음<br />양호
                  </td>
                  <td className="border-r border-black p-1.5 text-center">-<br />-<br />-<br />-</td>
                  <td className="p-1.5 text-center font-bold text-xs">지속 관리,<br />관찰 지시</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center">3. 주변시설</td>
                  <td className="border-r border-black p-1.5">
                    ∘ 배면도로 침하·융기 발생 여부<br />
                    ∘ 주변 배수시설의 관리 상태
                  </td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">없음<br />양호</td>
                  <td className="border-r border-black p-1.5 text-center">-<br />-</td>
                  <td className="p-1.5 text-center">-</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1.5 font-bold text-center">4. 시공 중 안전관리</td>
                  <td className="border-r border-black p-1.5">
                    ∘ 시공전·후 현장 상태 기록 보관<br />
                    ∘ 공사장 주변 정리 정돈 및 추락방지시설
                  </td>
                  <td className="border-r border-black p-1.5 text-center font-bold text-emerald-800">양호<br />양호</td>
                  <td className="border-r border-black p-1.5 text-center">-<br />-</td>
                  <td className="p-1.5 text-center">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ContentFooter pageNum={10} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* CHAPTER 3 COVER PAGE */}
      {/* -------------------------------------------------------------------- */}
      <ChapterCoverPage
        chapterNum="제3장"
        chapterTitle="점검대상물의 평가"
        subsections={[
          "3.1  점검대상 구조물 개요",
          "3.2  사전자료 검토",
          "3.3  주요 부재별 외관조사 결과의 분석",
          "3.4  거푸집·동바리 공사 안전지침",
          "3.5  안전점검 결과의 분석",
          "3.6  인접건축물 또는 구조물의 안전성 등",
          "3.7  공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성",
          "3.8  금회 점검 시 지적사항에 대한 조치결과 검토",
          "3.9  건설공사 안전관리 검토"
        ]}
      />

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 19: CHAPTER 3 - 3.1 & 3.2 사전자료 검토 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={11} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-base font-black text-black mb-2">3.1 점검대상 구조물 개요</h2>
            <h3 className="text-xs font-bold text-black mb-1">3.1.1 대상시설물 현황</h3>
            <table className="w-full text-xs border-collapse border-2 border-black">
              <tbody>
                <tr>
                  <td className="w-1/4 font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 명</td>
                  <td className="w-3/4 p-2 font-bold">{projectName}</td>
                </tr>
                <tr className="border-t border-black">
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">공 사 위 치</td>
                  <td className="p-2">{projectLocation}</td>
                </tr>
                <tr className="border-t border-black">
                  <td className="font-extrabold p-2 bg-slate-200 border-r border-black text-center">사 업 개 요</td>
                  <td className="p-2 text-xs leading-relaxed">
                    • 흙깎기(토사) 34,800m³, (리핑암) 25,931m³<br />
                    • 옹벽 5개소 / L = 832.0m (금회 점검구간 L=180.0m)<br />
                    • 아스팔트 포장 43,188m²
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-xs font-bold text-black mb-1">3.1.2 관련도면</h3>
            <div className="border border-black p-3 text-center bg-slate-50">
              <p className="text-xs font-bold mb-2">[위치도 및 옹벽 표준 단면도 (STA. 0+195.00 ~ 0+395.00)]</p>
              <div className="border border-dashed border-slate-400 p-4 bg-white text-xs text-slate-700 font-sans leading-relaxed">
                <div className="font-bold text-black mb-1">■ 1구간 / 2구간 / 3구간 L형 옹벽 표준도 및 종단면도/배근도 수록</div>
                <p className="text-[11px] text-slate-600">- 높이 H=3.0m ~ 6.0m L형 철근콘크리트 옹벽 단면 규격 및 철근 피복(80mm) 상세도면 검토 완료</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">3.2 사전자료 검토</h2>
            <h3 className="text-xs font-bold text-black mb-1">3.2.1 지반조사 자료 및 시추주상도</h3>
            <div className="border border-black p-3 text-center bg-slate-50 text-xs">
              <p className="font-bold mb-2">[조사위치 평면도 및 시추주상도 DRILL LOG (BH-1, BH-2, BH-3)]</p>
              <p className="text-slate-700 leading-relaxed text-left pl-4">
                - 지반조사 결과 토사층, 붕적층, 풍화암 및 연암층이 순차 분포함.<br />
                - 지반 지지력 및 N치(N&gt;50/15) 측정값 검토 결과 옹벽 기초 지반으로서의 허용지내력(qa=200kN/m² 이상) 확보 확인됨.
              </p>
            </div>
          </div>
        </div>

        <ContentFooter pageNum={11} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 20: 3.3 주요 부재별 외관조사 결과의 분석 & 3.4 거푸집동바리 안전지침 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={12} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-base font-black text-black mb-2">3.3 주요 부재별 외관조사 결과의 분석</h2>
            <h3 className="text-xs font-bold text-black mb-1">3.3.1 시공 상태 점검의 개요</h3>
            <p className="text-xs leading-relaxed text-black text-justify mb-2">
              가. 점검의 개요: 구조물 시공 상태 점검은 공사목적물의 시공 중 또는 시공 전 불안전 요인을 발견하여 이에 대한 적절한 조치를 수립함으로써 발생 가능한 제반 문제점을 사전에 예방하는데 목적이 있다.<br />
              나. 점검 대상 구조물의 분류 및 특성: L형 옹벽은 배면 토압에 저항하여 성토부 및 절토부의 안정성을 확보하기 위한 구조물로서 시공성과 경제성이 우수하다.
            </p>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">3.4 거푸집·동바리 공사 안전지침</h2>
            <h3 className="text-xs font-bold text-black mb-1">3.4.1 시공 상태 점검의 개요 및 용어의 정의</h3>
            <p className="text-xs leading-relaxed text-black mb-2">
              (1) 시스템 동바리: 규격화·부품화된 수직재, 수평재, 가새재 등의 부재를 공장에서 제작하여 현장에서 조립하여 사용하는 거푸집 동바리를 말한다.<br />
              (2) U 헤드 잭: 수직재 상부에 설치하여 멍에재를 받쳐주는 조절형 받침대를 말한다.<br />
              (3) 받침철물(잭 베이스): 수직재 하부에 설치하여 미끄러짐이나 침하를 방지하는 조절형 받침대를 말한다.
            </p>

            <h3 className="text-xs font-bold text-black mb-1">3.4.2 거푸집 동바리의 붕괴 재해의 주요원인</h3>
            <ul className="list-disc list-inside text-xs space-y-1 pl-2 text-slate-900">
              <li>거푸집동바리 구조검토 미실시 및 지지력 부족</li>
              <li>거푸집동바리 재료의 불량 (부식, 균열, 변형 자재 사용)</li>
              <li>파이프써포트 수직도 불량 및 교차가새 미설치</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">3.5 안전점검 결과의 분석</h2>
            <h3 className="text-xs font-bold text-black mb-1">3.5.1 구조물의 품질·시공 상태 등의 적정성 (외관조사)</h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-center border border-black p-2 bg-slate-50">
              <div className="border border-slate-300 p-2 bg-white flex flex-col justify-between">
                <div>
                  <p className="font-bold text-black mb-1">【사진 1】 옹벽 시공구간 전경 모습</p>
                  <p className="text-slate-600 mb-2">터파기 및 기초 지반 정지 작업 상태</p>
                </div>
                <div className="h-20 bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-slate-600">
                  {hasPhotos && photos[0] ? (
                    <img src={photos[0].url} alt="점검사진" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>[현장 전경 촬영 완료 - 양호]</span>
                  )}
                </div>
              </div>
              <div className="border border-slate-300 p-2 bg-white flex flex-col justify-between">
                <div>
                  <p className="font-bold text-black mb-1">【사진 2】 기초 철근 배근 간격 실측</p>
                  <p className="text-slate-600 mb-2">줄자 측정 결과 설계 도서 기준 부합</p>
                </div>
                <div className="h-20 bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-slate-600">
                  {hasPhotos && photos[1] ? (
                    <img src={photos[1].url} alt="점검사진" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>[줄자 측정 - 도면 기준 준수]</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ContentFooter pageNum={12} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 21: 3.5.2 품질/자재관리 & 3.6 인접건축물/교통안전 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제3장 점검대상물의 평가" pageNum={13} />

        <div className="my-1 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-black mb-1">3.5.2 품질·자재관리의 적정성</h3>
            <p className="text-xs leading-relaxed text-black mb-2">
              가. 점검의 개요: 본 현장의 품질관리 적정성을 확인하기 위하여 품질관리 요원, 시험실 규모(54m² 확보), 시험기구 보유현황 등을 점검한 결과 법정 기준(18m² 이상)을 충족하고 적정하게 관리되고 있음.<br />
              나. 품질관리자: 김위징(품질특급기술인), 김명수(품질중급기술인) 배치 완료.
            </p>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">3.6 인접건축물 또는 구조물의 안전성 등 공사장 주변 안전조치</h2>
            <p className="text-xs leading-relaxed text-black mb-2">
              3.6.1 개요: 발파 및 굴착에 따른 진동, 소음, 비산분진 통제 대책 수립.<br />
              3.6.2 지하매설물 방호: 관로망도 입수 및 지하매설물 탐사 후 입회 하 굴착 실시.<br />
              3.6.3 건설현장 소음·진동: 규제기준(주간 65dB 이하) 준수 및 저소음 장비 사용.<br />
              3.6.4 공사장 주변 교통안전: 안내표지판, 신호수 배치, PE 방호벽 설치 완료.
            </p>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">3.7 ~ 3.9 안전시공, 지적사항 조치, 안전관리 검토</h2>
            <div className="border border-black p-3 text-xs space-y-2 bg-slate-50">
              <p><strong>3.7 임시시설 및 가설공법의 안전성:</strong> PE가설벽 및 안전난간대 견고히 설치됨.</p>
              <p><strong>3.8 금회 점검 시 지적사항 조치:</strong> 1차 점검으로 특이 지적사항 없음.</p>
              <p><strong>3.9 건설공사 안전관리 검토:</strong> 안전보건조직(Line-Staff 형태), 안전교육 및 비상연락망 정상 운영 중.</p>
            </div>
          </div>
        </div>

        <ContentFooter pageNum={13} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* CHAPTER 4 COVER PAGE */}
      {/* -------------------------------------------------------------------- */}
      <ChapterCoverPage
        chapterNum="제4장"
        chapterTitle="종합결론"
        subsections={[
          "4.1  정기안전점검의 결과의 종합결론",
          "4.2  시공 시 특별한 관리가 필요한 사항"
        ]}
      />

      {/* -------------------------------------------------------------------- */}
      {/* PAGE 23: CHAPTER 4 CONTENT */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="제4장 종합결론" pageNum={14} />

        <div className="my-1 space-y-4">
          <div>
            <h2 className="text-base font-black text-black mb-2">4.1 정기안전점검의 결과의 종합결론</h2>
            <p className="text-xs leading-relaxed text-black text-justify indent-2 mb-3">
              본 과업은 <strong className="font-bold">&ldquo;{projectName}&rdquo;</strong> 중 4차로 확포장공사를 위한 {targetName} 작업에 정기안전점검 용역으로서 대상시설물에 대한 고품질의 안전시공을 달성하기 위하여 현장점검 및 관련자료 분석 등을 실시하였으며, 그 결과는 다음과 같다.
            </p>
            <div className="border border-black p-3 text-xs space-y-2 leading-relaxed bg-slate-50">
              <p>• <strong>품질·시공 상태:</strong> 기초 터파기 및 철근배근 상태가 설계도서 및 시방서 기준에 부합함.</p>
              <p>• <strong>품질·자재관리:</strong> 중급 품질관리 대상에 맞는 인력 및 시험실(54m²)을 적정하게 확보함.</p>
              <p>• <strong>안전시설 및 주변조치:</strong> PE방호벽, 안전난간대, 입간판 설치로 통행자 및 근로자 안전 확보.</p>
            </div>
          </div>

          <div>
            <h2 className="text-base font-black text-black mb-2">4.2 시공 시 특별한 관리가 필요한 사항</h2>
            <div className="space-y-2 text-xs leading-relaxed pl-2">
              <p><strong>4.2.1 시공관리사항:</strong> 거푸집 측압에 대한 구조검토 준수 및 콘크리트 시간당 타설 높이(0.6m/h 이하) 관리 철저.</p>
              <p><strong>4.2.2 안전관리사항:</strong> 고소작업 시 추락방지를 위한 생명로프 및 안전대 착용 감독 강화, 5m 이상 작업 시 전담 안전담당자 지정.</p>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-black">
            <h2 className="text-base font-black text-black mb-2">◉ 부 록</h2>
            <div className="pl-4 text-xs font-bold space-y-1">
              <p>1. 정기안전점검 현장 사진대지 (Photo Log)</p>
              <p>2. 안전관련자료 (합동 안전·보건점검표, 교육일지 및 서약서 등)</p>
              <p>3. 설계안전성검토보고서</p>
            </div>
          </div>
        </div>

        <ContentFooter pageNum={14} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* APPENDIX COVER PAGE */}
      {/* -------------------------------------------------------------------- */}
      <ChapterCoverPage
        chapterNum="부록"
        chapterTitle="현장 점검 사진대지 및 안전자료"
        subsections={[
          "부록 1. 정기안전점검 현장 사진대지 (Photo Log)",
          "부록 2. 안전점검 종합 체크리스트",
          "부록 3. 관련 시험 성적서 및 안전관리 서류"
        ]}
      />

      {/* -------------------------------------------------------------------- */}
      {/* APPENDIX PAGE 1: 현장 점검 사진대지 (1/2) - (Photo Log 1 ~ 4) */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="부록 1. 정기안전점검 현장 사진대지" pageNum={15} />

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
                  <table className="w-full text-[11px] border-collapse border border-black text-left mt-1">
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
                  <table className="w-full text-[11px] border-collapse border border-black text-left mt-1">
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
                        <td className="bg-slate-100 font-bold p-1 border-r border-black text-center">점검내용</td>
                        <td className="p-1" colSpan={3}>{sample.result} ({sample.action})</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>

        <ContentFooter pageNum={15} />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* APPENDIX PAGE 2: 현장 점검 사진대지 (2/2) - (Photo Log 5 ~ 6) + 안전점검 총괄표 */}
      {/* -------------------------------------------------------------------- */}
      <div className="page-container font-serif text-black flex flex-col justify-between">
        <ContentHeader chapterTitle="부록 1. 정기안전점검 현장 사진대지" pageNum={16} />

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
                  <table className="w-full text-[11px] border-collapse border border-black text-left mt-1">
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
                        <td className="bg-slate-100 font-bold p-1 border-r border-black text-center">점검내용</td>
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

        <ContentFooter pageNum={16} />
      </div>
    </>
  );
};

