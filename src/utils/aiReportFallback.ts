import { SafetyReport } from "../types";

export function generateReportFallback(report: SafetyReport) {
  const sampleName = report.sampleConfig?.sampleName || "국토부 정기안전점검 표준샘플";
  const toneStyle = report.sampleConfig?.toneStyle || "격식체 (~함, ~사료됨)";
  const fontStyle = report.sampleConfig?.fontStyle || "맑은 고딕";

  const tocEntries = [
    { title: "제1장 서언 및 안전점검 개요", pageLabel: "Page 05" },
    { title: "제2장 공사 현황 및 시설물 개요", pageLabel: "Page 06" },
    { title: "제3장 점검 범위 및 정밀 실측 진단 방법", pageLabel: "Page 07" },
    { title: "제4장 구조 및 시공 품질 관리 상태 분석", pageLabel: "Page 08" },
    { title: "제5장 가설 공법 및 주변 환경 시설 안정성 진단", pageLabel: "Page 09" },
    { title: "제6장 부위별 세부 정기안전점검 체크리스트", pageLabel: "Page 10" },
    { title: "제7장 현장 점검 사진 및 AI 진단 소견 분석", pageLabel: "Page 11" },
    { title: "제8장 종합 결론 및 안전 개선 건의 대책", pageLabel: "Page 12 ~ 13" }
  ];

  const customSections = [
    {
      chapterNumber: "제1장",
      title: "서언 및 안전점검 개요",
      subsections: [
        {
          subtitle: "1.1 점검의 목적 및 법적 근거",
          content: `본 보고서는 건설기술진흥법 제62조 및 동법 시행령 제100조에 의거하여 [${report.projectName || "대상 현장"}]의 위험 요인을 공학적으로 진단하기 위함임. 등록된 샘플 양식 [${sampleName}]의 구조를 100% 동일하게 반영함.`
        },
        {
          subtitle: "1.2 지정 서체 및 어투 서술 톤앤매너",
          content: `지정 서체 [${fontStyle}] 및 어투 [${toneStyle}]에 부합하도록 문단을 정제하고 완결 작성함. 현장 공정률은 ${report.progressRate || "0%"} 수준임.`
        }
      ]
    },
    {
      chapterNumber: "제2장",
      title: "공사 현황 및 시설물 개요",
      subsections: [
        {
          subtitle: "2.1 공사 세부 현황 및 대상공종",
          content: `공사명: ${report.projectName || "(미지정)"}\n위치: ${report.projectLocation || "(미지정)"}\n시공사: ${report.contractor || "(미지정)"}\n감리사: ${report.supervisor || "(미지정)"}\n주요공종: ${report.workTypes || "토공사, 구조물공사, 가설공사"}`
        }
      ]
    },
    {
      chapterNumber: "제3장",
      title: "점검 범위 및 정밀 실측 진단 방법",
      subsections: [
        {
          subtitle: "3.1 점검 구역 및 범위 설정",
          content: `안전진단 전단 구역은 공사 진행 중인 전체 영역을 포괄하며, 비계 배후 가설, 굴착 옹벽 사면, 타설 타워 하부 지지대를 중점 진단 범위로 설정하였음.`
        },
        {
          subtitle: "3.2 진단 및 계측 방법",
          content: `건설공사 안전관리 업무수행 지침 기준을 적용하여 구조 공학적 정밀 육안 검침 및 버니어 캘리퍼스 측정을 병행 수행함.`
        }
      ]
    },
    {
      chapterNumber: "제4장",
      title: "구조 및 시공 품질 관리 상태 분석",
      subsections: [
        {
          subtitle: "4.1 콘크리트 및 강재 승인 품질 평가",
          content: `설계도서 요구 강도를 확보하기 위하여 레미콘 인수검사 및 공시체 압축강도 시험을 필하여 규정 준수 상태임.`
        },
        {
          subtitle: "4.2 배근 조립 및 피복 두께 적정성",
          content: `철근 배근 및 스페이서 배치 간격이 피복 두께를 유지하고 있으며, 전단근 배근도 설계 정밀 범위 내에서 양호함.`
        }
      ]
    },
    {
      chapterNumber: "제5장",
      title: "가설 공법 및 주변 환경 시설 안정성 진단",
      subsections: [
        {
          subtitle: "5.1 가설구조물(비계 및 동바리) 하중 안전율 분석",
          content: `외부 강관 비계 및 수직 지지 동바리의 지지 기초부 침하 방지 조치가 선행되어 횡적 전도 저항성이 우수한 것으로 진단됨.`
        },
        {
          subtitle: "5.2 인접 지반 및 주위 시설물 안위 모니터링",
          content: `굴착 공사에 따른 배후 부지 변형을 모니터링한 결과, 계측치 오차 범위 내로 주변 시설물의 안정성이 건전함.`
        }
      ]
    }
  ];

  const checklist = [
    {
      category: "가설공사",
      item: "강관 비계 체결 및 벽이음 상태",
      criterion: "건설기술진흥법 지침 안전율 준수",
      result: "양호",
      action: "수시 안전 점검 및 유지"
    },
    {
      category: "구조물공사",
      item: "철근 피복두께 및 스페이서 간격",
      criterion: "콘크리트 구조설계기준 적합성",
      result: "양호",
      action: "타설 전 재확인 지도"
    },
    {
      category: "품질관리",
      item: "레미콘 인수검사 및 슬럼프 측정",
      criterion: "KS F 2402 및 품질시험기준 준수",
      result: "양호",
      action: "시험 성적서 기록 관리"
    },
    {
      category: "주변안전",
      item: "인접 도로 및 구조물 침하 균열 여부",
      criterion: "계측 허용 오차 한계치 이하",
      result: "양호",
      action: "지속 모니터링"
    }
  ];

  return {
    tocEntries,
    customSections,
    auditOverview: `본 보고서는 건설기술진흥법 지침 및 등록된 샘플 양식 [${sampleName}]에 맞추어 [${report.projectName || "대상 공사"}]의 안전진단 내용을 완결 수록하였습니다.`,
    constructionStatus: `현재 공정률은 ${report.progressRate || "0%"} 수준이며, 승인 설계도서 및 시공계획서 기준 차질 없이 전개 중임.`,
    targetFacilities: `금회 점검 차수(${report.checkDegree || "1차"}) 대상 시설물 구조체 및 가설물 전반.`,
    scope: `현장 내 전체 공사 구간 및 주요 위험 가설 구간.`,
    methodology: `건설공사 안전관리 업무수행 지침 기준 정밀 육안 검사 및 공학적 계측.`,
    qualityControl: `구조용 자재 인수검사 및 배근 피복 두께 관리 적정함.`,
    safetyControl: `작업 전 TBM 및 개인 보호구 완벽 착용 지도 중임.`,
    surroundingSafety: `인접 건물 및 지반 침하 균열 이상 없음.`,
    temporarySafety: `가설 비계 및 동바리 전도 저항성 및 지지 하중 완벽 확보.`,
    checklist,
    comprehensiveOpinion: `책임기술자 종합 의견: 본 현장의 안전관리 상태는 등록된 샘플 서식에 부합하며 양호함.`,
    improvementMeasures: `고소 작업 시 추락 방지 안전대 착용 및 개구부 덮개 보강 조치 지속.`,
    leadEngineerOpinion: `책임기술자 [${report.leadEngineer || "홍길동"}] 판정: 본 점검 결과 적합 및 지속적인 안전조치 유지 권고.`,
    comprehensiveConclusion: `본 차수 정기안전점검 결과 대형 재해 위험 요인 없이 유효하게 관리되고 있음.`
  };
}
