import { SafetyReport } from "../types";

export function generateReportFallback(report: SafetyReport) {
  const projectName = report.projectName || "남강 정암지구 하천환경정비사업";
  const workTypes = report.workTypes || "천공기 SCW(덕곡배수문)";
  const checkDegree = report.checkDegree || "1차";
  const contractor = report.contractor || "우석종합건설(주)";
  const client = report.client || "기후에너지환경부 낙동강유역환경청";
  const supervisor = report.supervisor || "(주)유신";
  const companyName = report.companyName || "(주)정진이앤씨";
  const leadEngineer = report.leadEngineer || "박경포";
  const assistantEngineers = report.assistantEngineers || "이재근, 정찬욱, 이민행, 김규장, 조을현, 정경수, 김한규, 정남래, 감경일, 양진우, 김지민, 임현승";

  const tocEntries = [
    { title: "제 1장 일반사항", pageLabel: "1" },
    { title: "  1.1 점검대상물 위치도", pageLabel: "2" },
    { title: "  1.2 점검대상물 전경사진", pageLabel: "3" },
    { title: "  1.3 정기안전점검 실시결과 요약문", pageLabel: "4" },
    { title: "    1.3.1 과업개요", pageLabel: "4" },
    { title: "    1.3.2 대상시설물 점검결과", pageLabel: "5" },
    { title: "    1.3.3 점검결과 총평", pageLabel: "5" },
    { title: "제 2장 정기안전점검의 개요", pageLabel: "7" },
    { title: "  2.1 과업의 목적", pageLabel: "8" },
    { title: "  2.2 공사현황", pageLabel: "8" },
    { title: "    2.2.1 일반현황", pageLabel: "8" },
    { title: "    2.2.2 공사예정공정표", pageLabel: "9" },
    { title: "  2.3 건설기술진흥법 대상시설물 현황", pageLabel: "10" },
    { title: "  2.4 정기안전점검의 범위 및 내용", pageLabel: "10" },
    { title: "    2.4.1 정기안전점검 실시시기", pageLabel: "10" },
    { title: "    2.4.2 대상시설물 정기안전점검 시행 현황", pageLabel: "10" },
    { title: "    2.4.3 내용적 범위", pageLabel: "11" },
    { title: "    2.4.4 정기안전점검 과업내용", pageLabel: "11" },
    { title: "  2.5 사용장비 및 시험기기 현황", pageLabel: "12" },
    { title: "  2.6 점검수행 일정 및 방법", pageLabel: "13" },
    { title: "제 3장 점검대상물의 평가", pageLabel: "15" },
    { title: "  3.1 점검대상 구조물 개요", pageLabel: "16" },
    { title: "    3.1.1 대상시설물 현황", pageLabel: "16" },
    { title: "    3.1.2 관련도면", pageLabel: "17" },
    { title: "    3.1.3 투입인원 및 장비계획", pageLabel: "19" },
    { title: "  3.2 사전자료 검토", pageLabel: "23" },
    { title: "    3.2.1 건설기계(천공기) 안전점검", pageLabel: "23" },
    { title: "    3.2.2 지반조사 자료 및 시추주상도", pageLabel: "26" },
    { title: "  3.3 천공작업 외관조사 결과의 분석", pageLabel: "29" },
    { title: "    3.3.1 시공 상태 점검의 개요", pageLabel: "29" },
    { title: "  3.4 안전점검 결과의 분석", pageLabel: "35" },
    { title: "    3.4.1 구조물의 품질·시공 상태 등의 적정성", pageLabel: "35" },
    { title: "    3.4.2 품질·자재관리의 적정성", pageLabel: "38" },
    { title: "  3.5 인접건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성", pageLabel: "46" },
    { title: "  3.6 공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성", pageLabel: "58" },
    { title: "  3.7 금회 점검 시 지적사항에 대한 조치결과 검토", pageLabel: "59" },
    { title: "  3.8 건설공사 안전관리 검토", pageLabel: "59" },
    { title: "제 4장 종합결론", pageLabel: "64" },
    { title: "  4.1 정기안전점검의 결과의 종합결론", pageLabel: "65" },
    { title: "  4.2 시공 시 특별한 관리가 필요한 사항", pageLabel: "68" },
    { title: "◎ 부 록", pageLabel: "" },
    { title: "  1. 안전관련자료", pageLabel: "" },
    { title: "  2. 장비작업계획서", pageLabel: "" }
  ];

  const customSections = [
    {
      chapterNumber: "제1장",
      title: "일반사항",
      subsections: [
        {
          subtitle: "1.1 점검대상물 위치도",
          content: `경남 함안군, 의령군, 진주시, 사천시, 하동군, 산청군, 함양군 일원`
        },
        {
          subtitle: "1.2 점검대상물 전경사진",
          content: `덕곡배수문 천공기 작업중 전경사진 수록`
        },
        {
          subtitle: "1.3 정기안전점검 실시결과 요약문",
          content: `본 과업은 건설기술진흥법 제62조 및 동법 시행령 제100조에 근거하여 [${projectName}] 의 천공기 작업 현장의 유해·위험요소를 사전에 도출하고 안전대책을 공학적으로 마련하기 위함임.`
        }
      ]
    },
    {
      chapterNumber: "제2장",
      title: "정기안전점검의 개요",
      subsections: [
        {
          subtitle: "2.1 과업의 목적",
          content: `본 과업은 건설기술 진흥법 제62조, 동법 시행령 제100조, 제101조 및 시행규칙 제59조의 규정에 의한 국토교통부 고시 제2022-791호 건설공사 안전관리 업무수행 지침 【별표1】에 따라 "${projectName}" 의 작업 중인 취약시설물보강의 천공기 작업에 대한 정기안전점검을 실시하는 것으로, 공사목적물의 품질·시공 상태 등의 적정성, 공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성, 인접 건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성 여부를 평가하고자 육안조사를 통하여 현장조사를 실시하고, 점검을 통한 문제점 발생 시 사전조치를 함으로써 건설공사의 안전을 확보함은 물론 향후 유지관리에 필요한 자료로 활용하고자 한다.`
        },
        {
          subtitle: "2.2 공사현황",
          content: `공사명: ${projectName}\n공사위치: ${report.projectLocation || "경남 함안군, 의령군, 진주시, 사천시, 하동군, 산청군, 함양군 일원"}\n발주자: ${client}\n시공자: ${contractor}\n건설사업단: ${supervisor}\n공사금액: ${report.summary || "23,008,098,000원"}`
        }
      ]
    },
    {
      chapterNumber: "제3장",
      title: "점검대상물의 평가",
      subsections: [
        {
          subtitle: "3.1 점검대상 구조물 개요",
          content: `덕곡배수문 천공기 작업구역 및 차수벽 시공 구간`
        },
        {
          subtitle: "3.2 사전자료 검토",
          content: `건설기계(천공기) 안전점검검사증 및 장비작업계획서 서류 검토 완료`
        },
        {
          subtitle: "3.3 천공작업 외관조사 결과의 분석",
          content: `천공기 작업 전 지반 평탄화 및 전도방지 철판 설치 운용 상태 양호`
        }
      ]
    },
    {
      chapterNumber: "제4장",
      title: "종합결론",
      subsections: [
        {
          subtitle: "4.1 정기안전점검 결과의 종합결론",
          content: `금회 정기안전점검 결과, 현장에 반입된 천공기는 건설기계 안전성검사 및 장비작업 계획서 검토결과 양호한 것으로 확인되었고, 작업수칙을 준수하여 시공 중인 것으로 확인되었음.`
        }
      ]
    }
  ];

  const checklist = [
    {
      category: "공사 목적물의 품질·시공 상태",
      item: "천공기 거치 상태 적정성",
      criterion: "지반 평탄화 및 전도방지 철판 설치 여부",
      result: "양호",
      action: "-"
    },
    {
      category: "공사 목적물의 품질·시공 상태",
      item: "오거 및 와이어로프 상태",
      criterion: "가닥 손상 및 권상장치 정상 작동 여부",
      result: "양호",
      action: "-"
    },
    {
      category: "공사장 주변 안전조치",
      item: "인접건축물 또는 구조물의 안전성",
      criterion: "배후 지반 변형 및 균열 발생 여부",
      result: "적정하게 관리중",
      action: "-"
    },
    {
      category: "임시시설 및 가설공법",
      item: "가설공법의 안전성",
      criterion: "작업구획 설정 및 신호수/수원 배치",
      result: "적정하게 관리중",
      action: "-"
    },
    {
      category: "건설공사 안전관리",
      item: "안전관리계획 이행 검토",
      criterion: "TBM 및 장비 점검표 작성 여부",
      result: "활발하게 활동중",
      action: "-"
    }
  ];

  return {
    tocEntries,
    customSections,
    auditOverview: `대상시설물인 "${projectName}" 중 덕곡배수문 주변으로 차수벽을 설치하기 위하여 천공기 작업 현장의 안전시공 상태에 대한 면밀한 육안 점검을 실시하였다.`,
    constructionStatus: `현재 공정률은 ${report.progressRate || "15%"} 수준이며, 승인 설계도서 및 시공계획서 기준 차질 없이 전개 중임.`,
    targetFacilities: `금회 점검 차수(${checkDegree}) 대상 시설물인 천공기 SCW(덕곡배수문) 구조체 및 가설물 전반.`,
    scope: `현장 내 전체 공사 구간 및 주요 천공 작업 구간.`,
    methodology: `건설공사 안전관리 업무수행 지침 기준 정밀 육안 검사 및 장비 안전검사증 대조.`,
    qualityControl: `천공기 제원 및 모델 등록번호판 일치 확인, 양호함.`,
    safetyControl: `작업 전 신호수 및 관리감독자 적절 배치, 작업반경 내 접근 차단.`,
    surroundingSafety: `하천변 주변 지반 평탄화 및 전도방지 철판 설치 운용 중.`,
    temporarySafety: `천공기 거치 상태 및 와이어로프 상태 양호.`,
    checklist,
    comprehensiveOpinion: `금회 정기안전점검 결과, 현장에 반입된 천공기는 건설기계 안전성검사 및 장비작업 계획서 검토결과 양호한 것으로 확인되었고 천공기의 제원 및 모델 등록번호판 등은 현장에 제출된 서류와 일치한 것으로 확인되었다. 작업전 하천변 주변 지반의 상태는 평탄하게 정리되어 있었으며, 부등침하로 인한 전도방지를 위해 전도방지 철판을 설치하여 운용중인 것으로 점검되었다.`,
    improvementMeasures: `천공작업 시 신호수 및 관리감독자를 상시 배치하고 작업반경 내 작업자 접근 차단을 유지할 것.`,
    leadEngineerOpinion: `책임기술자 : ${leadEngineer}`,
    comprehensiveConclusion: `[결론] 금회 점검 결과 천공기 시공상태는 양호한 것으로 최종 판단되며, 관련 법규에 적합하게 시공되고 있음.`
  };
}
