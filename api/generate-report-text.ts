import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." });
    }

    const ai = new GoogleGenAI({ apiKey });
    const reportData = req.body || {};

    const photoContext = (reportData.photos || []).map((p: any, idx: number) => {
      const mainCat = p.mainCategory || (p.category ? p.category.split(" - ")[0] : "현장사진");
      const subCat = p.subCategory || (p.category && p.category.includes(" - ") ? p.category.split(" - ")[1] : "");
      const categoryTag = subCat ? `[대메뉴: ${mainCat} / 소메뉴: ${subCat}]` : `[대메뉴: ${mainCat}]`;
      return `[사진 ${idx + 1}] 파일명: ${p.name || 'photo.jpg'}, 분류 태그: ${categoryTag}, 전체분류: ${p.category || mainCat}, 상태: ${p.status || "양호"}, 위치: ${p.location || "미지정"}, 제목: ${p.caption || ""}, 중요내용: ${p.importantContent || ""}, 특이사항: ${p.specialRemarks || ""}, 분석소견: ${p.findings || ""}`;
    }).join("\n");

    const sampleConfig = reportData.sampleConfig || {};
    let sampleFilesDetail = "";
    if (sampleConfig.sampleFiles && Array.isArray(sampleConfig.sampleFiles) && sampleConfig.sampleFiles.length > 0) {
      sampleFilesDetail = `\n[사용자 등록 샘플 파일 목록 (총 ${sampleConfig.sampleFiles.length}장)]:\n` +
        sampleConfig.sampleFiles.map((sf: any, idx: number) => {
          const fileTypeLabel = (sf.type || "doc").toUpperCase();
          const textPreview = sf.textContent ? ` (요약: ${sf.textContent.substring(0, 300)}...)` : "";
          return `${idx + 1}. [${fileTypeLabel}] ${sf.name}${textPreview}`;
        }).join("\n") + "\n";
    }

    const sampleText = (sampleConfig.sampleContent 
      ? `\n[사용자 등록 기준 샘플 보고서 (목차/문단/표 복제 기준)]:\n${sampleConfig.sampleContent}\n` 
      : "") + sampleFilesDetail;

    const fontTonePrompt = `
- 사용자 등록 샘플 양식명: ${sampleConfig.sampleName || "국토부 정기안전점검 대용량 표준샘플"}
- 적용 지정 글꼴 스타일: ${sampleConfig.fontStyle || "맑은 고딕 (표준)"}
- 적용 서술 어투 톤앤매너: ${sampleConfig.toneStyle || "격식체 (~함, ~사료됨)"}
- 적용 표/단락 디자인: ${sampleConfig.tableStyle || "표준 격자형"}
`;

    const prompt = `당신은 건설현장 '정기안전점검 보고서'를 작성하는 고도화된 맞춤형 전문 AI입니다.
[선택/등록된 보고서 샘플 및 스타일 정보]
${fontTonePrompt}
${sampleText}

[입력된 공사 및 현장 기본정보]:
- 공사명: ${reportData.projectName || "(미지정)"}
- 공사위치: ${reportData.projectLocation || "(미지정)"}
- 시공사: ${reportData.contractor || "(미지정)"}
- 공정률: ${reportData.progressRate || "0%"}
- 책임기술자: ${reportData.leadEngineer || "홍길동"}
- 공종: ${reportData.workTypes || "토공사, 구조물공사"}

[업로드된 현장 사진 진단 정보]:
${photoContext || "없음"}

[출력 형식]:
* 순수 JSON 구조로 출력하십시오.
JSON 구조:
{
  "tocEntries": [
    { "title": "제1장 일반사항 및 개요", "pageLabel": "Page 05" },
    { "title": "제2장 공사 현황 및 시설물 개요", "pageLabel": "Page 06" },
    { "title": "제3장 점검 범위 및 실측 방법", "pageLabel": "Page 07" },
    { "title": "제4장 구조 및 시공 품질 관리 분석", "pageLabel": "Page 08" },
    { "title": "제5장 가설 및 주변 시설 안전성", "pageLabel": "Page 09" }
  ],
  "customSections": [
    {
      "chapterNumber": "제1장",
      "title": "일반사항 및 개요",
      "subsections": [
        {
          "subtitle": "1.1 점검의 목적 및 법적 근거",
          "content": "건설기술진흥법 제62조 및 동법 시행령 제100조에 근거하여 현장의 유해 위험요소를 사전에 도출함."
        },
        {
          "subtitle": "1.2 점검 수행 기준 및 톤앤매너",
          "content": "샘플 지정 서체 및 어투 스타일에 맞추어 작성되었으며, 현장 시공 품질 및 정밀 진단을 수행함."
        }
      ]
    },
    {
      "chapterNumber": "제2장",
      "title": "공사 현황 및 시설물 개요",
      "subsections": [
        {
          "subtitle": "2.1 공사 세부 현황 및 공정 관리",
          "content": "본 현장은 승인 설계도서에 준거하여 정밀 시공 중이며, 주요 공종에 대한 안전조치가 이행됨."
        }
      ]
    }
  ],
  "auditOverview": "본 정기안전점검 보고서는 현장 등록 샘플의 목차와 서술 스타일을 반영하여 완결 작성되었습니다.",
  "constructionStatus": "시공 계획서 및 승인 도면 기준 정밀 안전관리가 이행 중임.",
  "targetFacilities": "부지 내 주요 가설 및 구조물에 대한 육안 및 실측 진단 수행.",
  "scope": "전체 공사 구간 및 주요 위험 구간 점검 완료.",
  "methodology": "건설공사 안전관리 지침에 준한 정밀 육안 검침.",
  "qualityControl": "구조용 자재 관리 및 배근 조립 상태 양호함.",
  "safetyControl": "작업전 TBM 및 보호구 착용 준수 상태 양호.",
  "surroundingSafety": "인접 지반 및 주위 시설물 균열 변형 없음.",
  "temporarySafety": "가설 강관비계 및 수직 동바리 지지력 전도 저항성 확보.",
  "checklist": [
    {
      "category": "가설공사",
      "item": "비계 및 동바리 체결 상태",
      "criterion": "건설기술진흥법 안전수칙 준수",
      "result": "양호",
      "action": "상시 모니터링 요망"
    },
    {
      "category": "구조물공사",
      "item": "철근 배근 및 피복 두께",
      "criterion": "콘크리트 구조설계기준 적합성",
      "result": "양호",
      "action": "시공 검측 준수"
    }
  ],
  "comprehensiveOpinion": "전반적인 현장 안전관리 상태는 등록된 샘플 기준에 부합하며 상태 양호함.",
  "improvementMeasures": "고소 작업 시 추락 방지용 안전대 착용 지속 지도.",
  "leadEngineerOpinion": "책임기술자 종합 판정: 안전기준 적합 및 양호.",
  "comprehensiveConclusion": "본 차수 정기안전점검 결과 대형 재해 위험 요소 없이 안전하게 관리되고 있음."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("Gemini API가 빈 응답을 반환했습니다.");
    }

    const result = JSON.parse(response.text);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Vercel function generate-report-text error:", error);
    return res.status(500).json({ error: error.message || "보고서 작성 처리 중 오류가 발생했습니다." });
  }
}
