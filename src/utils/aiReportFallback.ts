import { SafetyReport } from "../types";

export function generateReportFallback(report: SafetyReport) {
  const projectName = report.projectName || "늑용~유치간 지방도 4차로 확포장공사";
  const workTypes = report.workTypes || "옹벽";
  const checkDegree = report.checkDegree || "1차";
  const contractor = report.contractor || "보광종합건설(주)";
  const client = report.client || "전라남도";
  const supervisor = report.supervisor || "(주)동아기술공사, (주)삼안";
  const companyName = report.companyName || "(주)정진이앤씨";
  const leadEngineer = report.leadEngineer || "박경포";
  const assistantEngineers = report.assistantEngineers || "정찬욱, 이재근, 이민행, 김규장, 조을현, 김창대, 정남래, 정남오, 김한규, 양진우, 김지민";

  const tocEntries = [
    { title: "제 1장 일반사항", pageLabel: "1" },
    { title: "  1.1 점검대상물 위치도", pageLabel: "2" },
    { title: "  1.2 점검대상물 전경사진", pageLabel: "3" },
    { title: "  1.3 정기안전점검 실시결과 요약문", pageLabel: "4" },
    { title: "    1.3.1 과업개요", pageLabel: "4" },
    { title: "    1.3.2 대상시설물 점검결과", pageLabel: "5" },
    { title: "    1.3.3 점검결과 총평", pageLabel: "5" },
    { title: "제 2장 정기안전점검의 개요", pageLabel: "6" },
    { title: "  2.1 과업의 목적", pageLabel: "7" },
    { title: "  2.2 공사현황", pageLabel: "7" },
    { title: "    2.2.1 일반현황", pageLabel: "7" },
    { title: "    2.2.2 공사 예정공정표", pageLabel: "8" },
    { title: "  2.3 건설기술진흥법 대상시설물 현황", pageLabel: "9" },
    { title: "  2.4 정기안전점검의 범위 및 내용", pageLabel: "9" },
    { title: "    2.4.1 정기안전점검 실시시기", pageLabel: "9" },
    { title: "    2.4.2 대상시설물 정기안전점검 시행 현황", pageLabel: "9" },
    { title: "    2.4.3 내용적 범위", pageLabel: "10" },
    { title: "    2.4.4 정기안전점검 과업내용", pageLabel: "10" },
    { title: "  2.5 사용장비 및 시험기기 현황", pageLabel: "11" },
    { title: "  2.6 점검수행 일정 및 방법", pageLabel: "12" },
    { title: "  2.7 정기안전점검 체크리스트", pageLabel: "13" },
    { title: "제 3장 점검대상물의 평가", pageLabel: "14" },
    { title: "  3.1 점검대상 구조물 개요", pageLabel: "15" },
    { title: "    3.1.1 대상시설물 현황", pageLabel: "15" },
    { title: "    3.1.2 관련도면", pageLabel: "16" },
    { title: "  3.2 사전자료 검토", pageLabel: "21" },
    { title: "    3.2.1 지반조사 자료 및 시추주상도", pageLabel: "21" },
    { title: "  3.3 주요 부재별 외관조사 결과의 분석", pageLabel: "26" },
    { title: "    3.3.1 시공 상태 점검의 개요", pageLabel: "26" },
    { title: "  3.4 거푸집·동바리 공사 안전지침", pageLabel: "31" },
    { title: "    3.4.1 시공 상태 점검의 개요", pageLabel: "31" },
    { title: "    3.4.2 거푸집 동바리의 붕괴 재해의 주요원인", pageLabel: "36" },
    { title: "    3.4.3 거푸집 동바리 안전작업 방법", pageLabel: "38" },
    { title: "  3.5 안전점검 결과의 분석", pageLabel: "46" },
    { title: "    3.5.1 구조물의 품질·시공 상태 등의 적정성", pageLabel: "46" },
    { title: "    3.5.2 품질·자재관리의 적정성", pageLabel: "49" },
    { title: "  3.6 인접건축물 또는 구조물의 안전성 등", pageLabel: "57" },
    { title: "    3.6.1 개 요", pageLabel: "57" },
    { title: "    3.6.2 현장 인접 지하매설물 방호 및 안전대책", pageLabel: "58" },
    { title: "    3.6.3 건설현장 소음·진동", pageLabel: "62" },
    { title: "    3.6.4 공사장 주변 교통안전", pageLabel: "64" },
    { title: "    3.6.5 인접시설물 및 공사장 주변 안전조치의 적정성", pageLabel: "71" },
    { title: "  3.7 공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성", pageLabel: "73" },
    { title: "  3.8 금회 점검 시 지적사항에 대한 조치결과 검토", pageLabel: "74" },
    { title: "  3.9 건설공사 안전관리 검토", pageLabel: "74" },
    { title: "제 4장 종합결론", pageLabel: "81" },
    { title: "  4.1 정기안전점검의 결과의 종합결론", pageLabel: "82" },
    { title: "  4.2 시공 시 특별한 관리가 필요한 사항", pageLabel: "85" },
    { title: "◉ 부 록", pageLabel: "" },
    { title: "  1. 안전관련자료", pageLabel: "" },
    { title: "  2. 설계안전성검토보고서", pageLabel: "" }
  ];

  const customSections = [
    {
      chapterNumber: "제1장",
      title: "일반사항",
      subsections: [
        {
          subtitle: "1.1 점검대상물 위치도",
          content: `전남 장흥군 유치면 늑용리 산32-24 ~ 용문리788`
        },
        {
          subtitle: "1.2 점검대상물 전경사진",
          content: `옹벽 작업 중 전경사진 수록`
        },
        {
          subtitle: "1.3 정기안전점검 실시결과 요약문",
          content: `본 과업은 건설기술진흥법 제62조 및 동법 시행령 제100조에 근거하여 [${projectName}] 의 옹벽 공사 현장의 유해·위험요소를 사전에 도출하고 안전대책을 공학적으로 마련하기 위함임.`
        }
      ]
    },
    {
      chapterNumber: "제2장",
      title: "정기안전점검의 개요",
      subsections: [
        {
          subtitle: "2.1 과업의 목적",
          content: `본 과업은 건설기술 진흥법 제62조, 동법 시행령 제100조, 제101조 및 시행규칙 제59조의 규정에 의한 국토교통부 고시 건설공사 안전관리 업무수행 지침 【별표1】에 따라 "${projectName}" 의 작업 중인 옹벽 구조물에 대한 정기안전점검을 실시하는 것으로, 공사목적물의 품질·시공 상태 등의 적정성, 공사목적물의 안전시공을 위한 임시시설 및 가설공법의 안전성, 인접 건축물 또는 구조물의 안전성 등 공사장 주변 안전조치의 적정성 여부를 평가하고자 육안조사를 통하여 현장조사를 실시하고, 점검을 통한 문제점 발생 시 사전조치를 함으로써 건설공사의 안전을 확보함은 물론 향후 유지관리에 필요한 자료로 활용하고자 한다.`
        },
        {
          subtitle: "2.2 공사현황",
          content: `공사명: ${projectName}\n공사위치: ${report.projectLocation || "전라남도 장흥군 유치면 늑용리 ~ 유치면 용문리"}\n발주자: ${client}\n시공자: ${contractor}\n건설사업단: ${supervisor}\n공사기간: 2024. 07. 22 ~ 2029. 07. 20`
        }
      ]
    },
    {
      chapterNumber: "제3장",
      title: "점검대상물의 평가",
      subsections: [
        {
          subtitle: "3.1 점검대상 구조물 개요",
          content: `옹벽 5개소 / L = 832.0m`
        },
        {
          subtitle: "3.2 사전자료 검토",
          content: `지반조사 자료 및 시추주상도 (BH-1, BH-2, BH-3 DRILL LOG) 검토 완료`
        },
        {
          subtitle: "3.3 주요 부재별 외관조사 결과의 분석",
          content: `기초 터파기 및 철근배근 규격 도면 준수 상태 양호`
        }
      ]
    },
    {
      chapterNumber: "제4장",
      title: "종합결론",
      subsections: [
        {
          subtitle: "4.1 정기안전점검 결과의 종합결론",
          content: `금회 정기안전점검 결과, 4차로확포장 공사를 위한 옹벽 시공 현장의 1차 정기안전점검 결과 기초 터파기 및 철근배근이 완료되었으며 기초타설전 설치상태 등은 설계도면 및 시방서 기준에 준하여 작업이 진행된 것으로 확인되었고 시설물의 안전성을 저해할 만한 특별한 사항은 없는 것으로 점검되었다.`
        }
      ]
    }
  ];

  const checklist = [
    {
      category: "1. 기초지반",
      item: "세굴, 활동 및 침하 발생 여부",
      criterion: "지반 변형 및 부등침하 우려 여부",
      result: "양호",
      action: "-"
    },
    {
      category: "2. 보강토/L형옹벽",
      item: "전면부 파손, 균열, 배부름, 수직/수평 변위",
      criterion: "설계 허용 오차 이내 시공 및 부재 균열 여부",
      result: "양호",
      action: "-"
    },
    {
      category: "3. 주변시설",
      item: "배면도로 침하 및 배수시설 관리",
      criterion: "배수공 기능 유지 및 침하 발생 여부",
      result: "양호",
      action: "-"
    },
    {
      category: "4. 시공 중 안전관리",
      item: "현장 상태 기록 보관 및 추락방지시설",
      criterion: "안전난간대 및 PE방호벽 설치 적정성",
      result: "양호",
      action: "-"
    }
  ];

  return {
    tocEntries,
    customSections,
    auditOverview: `대상시설물인 "${projectName}" 중 옹벽 시공 현장에 대하여 면밀한 육안 점검 및 안전관리 활동 분석을 실시하였다.`,
    constructionStatus: `현재 공정률은 ${report.progressRate || "12%"} 수준이며, 승인 설계도서 및 시공계획서 기준 차질 없이 진행 중임.`,
    targetFacilities: `금회 점검 차수(${checkDegree}) 대상 시설물인 옹벽(L=832.0m) 기초 및 철근배근 구조체 전반.`,
    scope: `현장 내 전체 옹벽 시공 구간 및 가설 안배 구간.`,
    methodology: `건설공사 안전관리 업무수행 지침 기준 정밀 육안 검사 및 제원 측정.`,
    qualityControl: `기초 철근 규격 및 배근 간격 측정 결과 도면 부합, 양호함.`,
    safetyControl: `작업 전 TBM 및 가설 방호벽 설치, 신호수 적절 배치.`,
    surroundingSafety: `도로 연접 구간 PE방호벽 및 안내표지판 정상 운영 중.`,
    temporarySafety: `거푸집 동바리 및 가설난간대 상태 양호.`,
    checklist,
    comprehensiveOpinion: `대상시설물인 “${projectName}” 중 옹벽의 시공 상태에 대한 면밀한 육안 점검을 실시하였고, 각종 품질관리 사항 및 안전관리 활동 등에 대한 분석 및 검토를 실시하였다. 금회 정기안전점검 결과, 4차로확포장 공사를 위한 옹벽 시공 현장의 1차 정기안전점검 결과 기초 터파기 및 철근배근이 완료되었으며 기초타설전 설치상태 등은 설계도면 및 시방서 기준에 준하여 작업이 진행된 것으로 확인되었고 시설물의 안전성을 저해할 만한 특별한 사항은 없는 것으로 점검되었다.`,
    improvementMeasures: `후속 콘크리트 타설 시 시간당 타설 높이를 준수하고 추락방지 생명로프 착용을 철저히 할 것.`,
    leadEngineerOpinion: `책임기술자 : ${leadEngineer}`,
    comprehensiveConclusion: `[결론] 금회 점검 결과 옹벽 시공상태는 양호한 것으로 최종 판단되며, 관련 법규에 적합하게 시공되고 있음.`
  };
}

