import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set body parsers with generous limits to handle large base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to get GoogleGenAI client with lazy-loading and validation
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다. AI 기능을 사용하려면 Settings > Secrets에 API Key를 설정하십시오.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API Route: Analyze Construction Photo
app.post("/api/analyze-image", async (req, res) => {
  try {
    const { imageBase64, mimeType, userText } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "이미지 데이터(imageBase64)가 필요합니다." });
    }

    const ai = getAIClient();
    
    // Clean base64 string if it contains the data:image prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const cleanMimeType = mimeType || "image/jpeg";

    let prompt = `대한민국 최고의 건설안전진단 전문가로서 이 건설 현장 사진을 분석하여 보고서용 정보를 도출해 주세요.
반드시 아래 정의된 카테고리 중 가장 어울리는 것을 하나 선택하고, 전문가 수준의 보고서용 제목(caption), 안전 상태 판정(status), 점검 지적/특이사항(findings)을 신뢰도(confidence)와 함께 출력해 주세요.

[선택 가능한 카테고리 목록]:
- "철근배근" (철근 가공, 배근, 결속 상태 등)
- "거푸집" (유로폼, 거푸집 조립, 고정 상태 등)
- "비계" (외부 비계, 작업발판, 안전난간 등)
- "동바리" (시스템 동바리, 파이프 서포트 등)
- "옹벽" (콘크리트 옹벽, 토류벽 등)
- "교량" (교각, 거더, 교량 상부구조 등)
- "콘크리트" (콘크리트 타설, 양생, 균열 점검 등)
- "토공/굴착" (흙막이 가설재, 굴착 사면, 토공사 등)
- "기타" (기타 가설 시설물, 자재 적치, 표지판 등)

[상태 판정 기준]:
- "양호": 안전 기준 및 도면 설계에 부합하여 문제가 없음.
- "보완요망": 시공 상태는 준수하나 일부 결속 누락이나 정리가 필요한 미미한 항목이 발견됨.
- "지적사항": 즉시 시정 조치하지 않으면 붕괴, 추락 등 중대 재해가 발생할 위험이 있음.`;

    if (userText) {
      prompt += `\n\n[사용자 입력 추가 힌트/요청 사항]:
"${userText}"
위의 사용자 설명 및 수정 의견을 최우선적으로 참조하여 자재 판정(category), 안전성 판정(status), 촬영 위치(location), 현장 중요내용(importantContent), 특이사항(specialRemarks) 및 세부 조치사항(findings)을 건설안전 공학적이고 전문적인 어조로 더욱 풍성하고 세밀하게 작성하여 완성해 주세요.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            mimeType: cleanMimeType,
            data: base64Data,
          },
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "철근배근, 거푸집, 비계, 동바리, 옹벽, 교량, 콘크리트, 토공/굴착, 기타 중 하나 선택",
            },
            confidence: {
              type: Type.NUMBER,
              description: "AI 판정 신뢰도 (0.0 ~ 1.0)",
            },
            caption: {
              type: Type.STRING,
              description: "사진을 설명하는 건설안전진단 전문가 톤의 공식 한글 제목. (예: '옹벽 시공부 철근 배근 조립 및 결속 상태 확인')",
            },
            findings: {
              type: Type.STRING,
              description: "대한민국 건설안전진단 보고서 공식 문체로 작성된 구체적 점검 소견 및 진단 결과. (예: '금회 점검 결과 옹벽 부위 철근 배근 간격 및 피복두께는 설계 도서에 부합하게 시공되었으며, 결속선 체결 상태는 양호함. 다만 일부 하부 구간에 청소 상태 불량 및 미세 녹 발생이 관찰되므로 타설 전 청소 지시함.')",
            },
            status: {
              type: Type.STRING,
              description: "'양호', '보완요망', '지적사항' 중 하나 선택",
            },
            location: {
              type: Type.STRING,
              description: "사진 촬영 현장의 구체적인 추정 위치 및 부위 (예: '지하 2층 옹벽 부위', '지상 3층 외부 안전난간 설치구간')",
            },
            importantContent: {
              type: Type.STRING,
              description: "해당 구조물의 현장 주요 구조 점검 내용 및 중요 사실 요약 (예: '수직 배근 상태 조밀도, 거푸집 고정 및 하부 동바리 고정력 보강상태 점검')",
            },
            specialRemarks: {
              type: Type.STRING,
              description: "점검 중 발견된 미세 결함이나 외관 손상 상태 등 특이사항 요약 (예: '일부 유로폼 이음새 콘크리트 미세 틈새 관찰되나 조임상태 양호하여 타설 시 밀림 우려는 적음')",
            },
          },
          required: ["category", "confidence", "caption", "findings", "status", "location", "importantContent", "specialRemarks"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Gemini API가 빈 응답을 반환했습니다.");
    }

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (error: any) {
    console.error("Image analysis error:", error);
    res.status(500).json({ error: error.message || "이미지 분석 중 오류가 발생했습니다." });
  }
});

// 2. API Route: Auto-Generate Report Chapters
app.post("/api/generate-report-text", async (req, res) => {
  try {
    const reportData = req.body;
    if (!reportData || !reportData.projectName) {
      return res.status(400).json({ error: "보고서 기본 정보가 누락되었습니다." });
    }

    const ai = getAIClient();

    // Compile a summary of images for context
    const photoContext = (reportData.photos || []).map((p: any, idx: number) => {
      const mainCat = p.mainCategory || (p.category ? p.category.split(" - ")[0] : "현장사진");
      const subCat = p.subCategory || (p.category && p.category.includes(" - ") ? p.category.split(" - ")[1] : "");
      const categoryTag = subCat ? `[대메뉴: ${mainCat} / 소메뉴: ${subCat}]` : `[대메뉴: ${mainCat}]`;

      return `[사진 ${idx + 1}] 파일명: ${p.name || 'photo.jpg'}, 분류 태그: ${categoryTag}, 전체분류: ${p.category || mainCat}, 상태: ${p.status || "양호"}, 위치: ${p.location || "미지정"}, 제목: ${p.caption || ""}, 중요내용: ${p.importantContent || ""}, 특이사항: ${p.specialRemarks || ""}, 분석소견: ${p.findings || ""}`;
    }).join("\n");

    // Compile sample config if provided
    const sampleConfig = reportData.sampleConfig || {};
    let sampleFilesDetail = "";
    if (sampleConfig.sampleFiles && Array.isArray(sampleConfig.sampleFiles) && sampleConfig.sampleFiles.length > 0) {
      sampleFilesDetail = `\n[사용자 등록 샘플 파일 및 대용량 페이지 첨부 목록 (총 ${sampleConfig.sampleFiles.length}장/개, 최대 300장 지원)]:\n` +
        sampleConfig.sampleFiles.map((sf: any, idx: number) => {
          const fileTypeLabel = (sf.type || "doc").toUpperCase();
          const textPreview = sf.textContent ? ` (텍스트 요약: ${sf.textContent.substring(0, 500)}...)` : "";
          return `${idx + 1}. [${fileTypeLabel}] ${sf.name}${textPreview}`;
        }).join("\n") + "\n";
    }

    const sampleText = (sampleConfig.sampleContent 
      ? `\n[사용자 등록 기준 샘플 보고서 (목차/문단/표 복제 기준, 1~300장 업로드 지원)]:\n${sampleConfig.sampleContent}\n` 
      : "") + sampleFilesDetail;
    const fontTonePrompt = `
- 사용자 등록 샘플 양식명: ${sampleConfig.sampleName || "국토부 정기안전점검 대용량 표준샘플"}
- 적용 지정 글꼴 스타일: ${sampleConfig.fontStyle || "맑은 고딕 (표준)"}
- 적용 서술 어투 톤앤매너: ${sampleConfig.toneStyle || "격식체 (~함, ~사료됨)"}
- 적용 표/단락 디자인: ${sampleConfig.tableStyle || "표준 격자형"}
- 첨부 등록된 샘플 페이지/파일 수: ${sampleConfig.sampleFiles?.length || 0}장 (최대 300장 대용량 지원)
`;

    const prompt = `당신은 건설현장 '정기안전점검 보고서'를 작성하는 고도화된 맞춤형 전문 AI입니다.
당신의 핵심 임무는 사용자가 제공한 **[기준 샘플 보고서]**의 목차, 단락 구조, 서술 방식, 표 형식, 심지어 어투(스타일)까지 100% 완벽하게 복제(Clone)하여 새로운 보고서를 작성하는 것입니다.

**[선택/등록된 보고서 샘플 및 스타일 정보]**
${fontTonePrompt}
${sampleText}

**[절대 준수 규칙]**

**1. 동적 양식 복제 (Dynamic Template Cloning)**
- 고정된 하나의 목차에 국한되지 말고, 위 **[기준 샘플 보고서]**의 목차, 단락, 표 구조를 최우선으로 분석하십시오.
- 해당 샘플의 대목차(제1장, 제2장 등), 중목차(1.1, 1.2 등), 소목차(가, 나, 1), 2) 등) 번호 매기기 방식을 완벽하게 똑같이 적용하십시오.
- 샘플에 없는 목차를 임의로 생성하거나, 샘플에 있는 목차를 누락하지 마십시오.

**2. 스타일 및 어투 완벽 동기화 (Style Matching)**
- 지정된 어투(${sampleConfig.toneStyle || "격식체 (~함, ~사료됨)"}) 및 샘플 보고서 특유의 전문 용어, 문장 맺음말(예: ~함, ~할 것, ~사료됨, ~준수함 등), 표의 열/행 제목 등을 분석하여 새 보고서에 그대로 적용하십시오.
- 사용자가 입력한 거친 형태의 텍스트 현장 데이터를, 샘플 보고서의 정제된 문어체 스타일로 변환하여 출력하십시오.

**3. 지능형 자동 업그레이드 및 배치 (사진 카테고리 1:1 매핑 포함)**
- 사용자가 업로드한 [현장 사진]과 [점검 내용]을 분석하여, 보고서 구조 내의 가장 적절한 목차 하위에 자동으로 배치하십시오.
- 사진 위치에는 \`[이미지: (카테고리명) - (사진설명)]\` 형식으로 자리를 표시하여 출력하십시오.
- 사진 분류 배치 상세:
  * [대메뉴: 도면 사진] ➔ 1.1 점검대상물 위치도 및 3.1 점검대상 구조물 개요
  * [대메뉴: 지반조사 사진] ➔ 3.2 사전자료 검토
  * [대메뉴: 작업계획서 사진] ➔ 3.1 점검대상 구조물 개요
  * [대메뉴: 비파괴 검사사진] ➔ 3.3 품질 및 시공 상태
  * [대메뉴: 품질 자재관리의 적정성 사진] ➔ 3.4 품질·자재관리의 적정성
  * [대메뉴: 안전교육 사진] ➔ 3.8 건설공사 안전관리 검토
  * [대메뉴: 현장사진] ➔ 소메뉴(시설물, 건설기계, 외관 조사 사진, 인접시설물, 공사장 주변, 건설기계 사용, 임시 안전시설, 기타사진)에 맞춰 관련 항목 하위 배치
  * [대메뉴: 별도 사진] ➔ 부록 시공사 협조자료
- 인력 정보(참여기술진 등)가 주어지면, 샘플 양식에 맞춰 [소속: ${reportData.companyName || "건설안전기술단"}, 성명: ${reportData.leadEngineer || "홍길동"}, 자격, 서명, 수료증 사진] 등을 교차 검증하여 깔끔하게 구체화하십시오.

**4. 제로 할루시네이션 (Zero Hallucination)**
- 사용자의 입력 데이터가 샘플의 목차를 채우기에 부족할 경우, 절대 임의의 허위 사실을 지어내지 마십시오.
- 부족한 항목에 대해서는 "해당 공종에 특이사항 없음"과 같이 샘플에서 주로 사용하는 '내용 없음' 표현 방식을 차용하여 출력하십시오.

---

[입력된 공사 및 현장 기본정보]:
- 업체명: ${reportData.companyName || "(미지정)"}
- 대표자: ${reportData.representative || "(미지정)"}
- 주소: ${reportData.address || "(미지정)"}
- 이메일: ${reportData.email || "(미지정)"}
- 전화번호: ${reportData.phone || "(미지정)"}
- 공사명: ${reportData.projectName || "(미지정)"}
- 공사위치: ${reportData.projectLocation || "(미지정)"}
- 발주처: ${reportData.client || "(미지정)"}
- 시공사: ${reportData.contractor || "(미지정)"}
- 감리사: ${reportData.supervisor || "(미지정)"}
- 공사기간: ${reportData.projectPeriod || "(미지정)"}
- 점검차수: ${reportData.checkDegree || "1차"}
- 점검일: ${reportData.checkDate || "금일"}
- 공정률: ${reportData.progressRate || "0%"}
- 책임기술자: ${reportData.leadEngineer || "홍길동 (특급기술자)"}
- 참여기술자: ${reportData.assistantEngineers || "이몽룡 (고급기술자)"}
- 공종: ${reportData.workTypes || "토공사, 구조물공사, 가설공사"}
- 공사개요: ${reportData.summary || "특이사항 없음"}
- 특이사항/현장여건: ${reportData.remarks || "없음"}
- 사용자 입력 점검결과 요약: ${reportData.checkResult || "양호함"}

[업로드된 현장 사진 진단 정보 및 분류]:
${photoContext || "업로드된 사진 없음"}

[출력 형식]:
* 순수 JSON 구조로 출력하십시오.
* 등록된 샘플 보고서의 목차 및 대/중/소 번호 체계, 단락 순서, 어투를 100% 동일하게 반영한 customSections와 tocEntries를 필수로 생성하십시오.

JSON 구조:
{
  "tocEntries": [
    { "title": "제1장 일반사항 및 개요", "pageLabel": "Page 05" },
    { "title": "제2장 공사 현황 및 시설물 개요", "pageLabel": "Page 06" }
  ],
  "customSections": [
    {
      "chapterNumber": "제1장",
      "title": "일반사항 및 개요",
      "subsections": [
        {
          "subtitle": "1.1 점검의 목적 및 법적 근거",
          "content": "샘플 지정 어투(~함, ~사료됨 등)에 맞춘 세부 점검내용 작성"
        },
        {
          "subtitle": "1.2 점검대상 시설물 위치 및 개요",
          "content": "현장 공사정보 및 사진데이터 연동 서술"
        }
      ]
    }
  ],
  "auditOverview": "제1장 일반사항 및 개요 서술 복제 텍스트",
  "constructionStatus": "제2장 공사현황 및 점검 범위/내용 상세 서술",
  "targetFacilities": "제3장 3.1 점검대상 구조물 개요",
  "scope": "점검범위 및 세부 안전점검 구역 정의",
  "methodology": "점검 장비 및 계측 실측 방법",
  "qualityControl": "구조 및 시공 품질 관리 상태 서술",
  "safetyControl": "건설공사 안전관리 검토 서술",
  "surroundingSafety": "공사장 주변 및 인접시설 안전조치 적정성 서술",
  "temporarySafety": "가설구조물 및 건설기계 안전성 서술",
  "checklist": [
    {
      "category": "점검분야 (가설공사, 구조물공사, 품질관리, 주변안전 등)",
      "item": "점검 항목",
      "criterion": "안전 판단 기준 (건설기술진흥법 지침 준수)",
      "result": "판정 결과 ('양호', '보완요망', '지적사항')",
      "action": "조치/권고사항"
    }
  ],
  "comprehensiveOpinion": "종합 의견",
  "improvementMeasures": "개선 대책 및 건의사항",
  "leadEngineerOpinion": "책임기술자 최종 판정 의견",
  "comprehensiveConclusion": "종합 최종 결론"
}
* 8개 이상의 다채로운 체크리스트 항목을 구성하십시오.`;

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
    res.json(result);
  } catch (error: any) {
    console.error("Report generation error:", error);
    res.status(500).json({ error: error.message || "보고서 자동 작성 중 오류가 발생했습니다." });
  }
});

// 3. API Route: AI Transaction Category Classification
app.post("/api/classify-transaction", async (req, res) => {
  try {
    const { vendor, description, amount, type } = req.body;
    if (!vendor || !description) {
      return res.status(400).json({ error: "거래처명(vendor)과 적요(description)가 필요합니다." });
    }

    const ai = getAIClient();
    const prompt = `대한민국 최고의 건설업 전문 세무회계사로서, 아래 거래 데이터를 분석하여 가장 알맞은 계정과목(Account Category)을 추천해 주십시오.

[거래 정보]:
- 구분: ${type || "지출"} (수입 또는 지출)
- 거래처: ${vendor}
- 적요: ${description}
- 총금액: ${amount || 0}원

[선택 가능한 계정과목 목록]:
- 지출의 경우: 
  * "원재료비" (철근, 레미콘, 가설재, 골재, 자재 자재 구매 등)
  * "노무비" (현장 일용직 인건비, 작업팀 급여 등)
  * "장비임차료" (크레인, 포클레인, 덤프 등 중장비 임대료)
  * "급여" (임직원 급여, 상여금)
  * "외주가공비" or "외주비" (외주 공사업체 지불액)
  * "차량유지비" (유류비, 차량수리비, 하이패스 등)
  * "소모품비" (안전용품, 소모성 자재, 사무용품 등)
  * "보험료" (고용산재보험, 국민연금 회사부담금, 현장 보증보험료)
  * "수도광열비" (현장 가설 전기요금, 수도요금, 가스요금 등)
  * "지급임차료" (사무실 임차료, 토지 임차료)
  * "여비교통비" (출장비, 철도, 유료도로 통행료)
  * "복리후생비" (현장 식대, 간식비, 경조사비)
  * "세금과공과" (협회비, 면허세, 과태료 등)
  * "기타지출" (위 항목에 해당하지 않는 기타 지출)
- 수입의 경우:
  * "매출액" (기성금 수령, 공사 대금 영수, 진단 수수료 수입)
  * "기타수입" (이자 수입, 지원금, 잡이익 등)

반드시 한글로 가장 정밀한 계정과목을 매핑하고, 세무적인 이유(reason)를 상세히 설명하십시오.
또한 대한민국 부가세법에 의거하여, 일반적으로 과세 거래인 경우 공급가액(supplyValue)과 부가가치세(vat, 10%)를 산출해 주십시오. (면세 과목이거나 인건비인 경우 부가세는 0원으로 산정)

출력 형식은 반드시 아래 구조의 JSON 이어야 합니다. 마크다운 형식 없이 순수 JSON만 반환하십시오.
{
  "category": "추천된 계정과목 이름 (예: 원재료비)",
  "reason": "세무적 추천 근거 요약 서술 (예: '철근 등 가설 자재 구매 거래이므로 건설업 원가 명세서상의 원재료비로 계상하는 것이 타당합니다.')",
  "supplyValue": 공급가액 숫자 (예: 부가세 제외 금액),
  "vat": 부가가치세 숫자 (일반적으로 공급가액의 10% 또는 인건비/면세의 경우 0)
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
    res.json(result);
  } catch (error: any) {
    console.error("AI Category classification error:", error);
    res.status(500).json({ error: error.message || "AI 자동 분류 중 오류가 발생했습니다." });
  }
});

// 4. API Route: AI Tax Assistant Chat
app.post("/api/tax-assistant-chat", async (req, res) => {
  try {
    const { messages, ledger, companyInfo } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "대화 내역(messages)이 필요합니다." });
    }

    const ai = getAIClient();
    
    // Format ledger brief to fit context safely
    const formattedLedger = (ledger || []).slice(0, 80).map((t: any) => {
      return `[${t.date}] ${t.type} | 거래처: ${t.vendor} | 적요: ${t.description} | 계정: ${t.category} | 공급가액: ${t.supplyValue} | 부가세: ${t.vat} | 합계: ${t.amount} | 결제: ${t.paymentMethod} | 현장: ${t.siteName || "미연동"}`;
    }).join("\n");

    const systemPrompt = `당신은 대한민국 최고의 건설업 세무회계 전문 AI 비서입니다. 이름은 'AI 세무비서'입니다.
현재 로그인한 회사는 [${companyInfo?.companyName || "고객사"}] 이며, 대표자는 [${companyInfo?.representative || "대표님"}] 입니다.
이 회사의 최근 입출금 거래 대장(최대 80건)은 다음과 같습니다:

${formattedLedger || "입력된 거래가 없습니다."}

[업무 지침]:
1. 사용자의 질문에 답할 때 위의 실제 거래 내역 데이터를 철저히 분석하여 실제 수치와 통계를 기반으로 대답해 주십시오. (예: "이번달 부가세 얼마인가?" -> 수입/지출 내역의 부가세 합산하여 계산해서 실 수치 제시)
2. 건설업 특유의 세무 지식(건설 노무비 원천세 대장, 중장비 임차료 전자세금계산서, 원재료비 매입 부가세 환급, 기성금 매출 세금계산서 발행 등)을 반영하여 매우 전문적이면서도 아주 친절한 한국어 존댓말로 조언하십시오.
3. 데이터가 비어있다면 임의로 허위 사실을 지어내지 말고, 대장에 등록된 거래 정보가 없어 추정이 어렵다며 "입출금 관리 탭에서 거래를 등록해 주시면 더욱 정확한 통계를 알려드릴 수 있습니다"라고 가이드해 주십시오.
4. "계산 결과는 참고용이며 최종 신고 전 반드시 담당 세무사 등 전문가용 검토를 거쳐야 합니다." 라는 안내 문구를 답변 하단이나 적절한 곳에 반드시 포함하십시오.`;

    const chatContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    if (!response.text) {
      throw new Error("Gemini API가 빈 응답을 반환했습니다.");
    }

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("AI Tax assistant error:", error);
    res.status(500).json({ error: error.message || "AI 세무비서 처리 중 오류가 발생했습니다." });
  }
});

// 5. API Route: 24-Hour Support Chatbot (SafetyTalk 24)
app.post("/api/support-chat", async (req, res) => {
  try {
    const { messages, companyInfo } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "대화 내역(messages)이 필요합니다." });
    }

    const ai = getAIClient();
    
    const systemPrompt = `당신은 대한민국 최고의 '건설안전포털 대화형 스마트 안전 비서' 24시간 상담 챗봇인 '안전톡 24 (SafetyTalk 24)'입니다.
본 플랫폼은 건설공사 현장 사진 분석 및 고품질 안전진단 보고서 자동 작성과 세무 장부 관리를 돕는 통합 웹 서비스입니다.
현재 로그인한 사용자의 회사명은 [${companyInfo?.companyName || "미확인 신규사"}] 이며, 대표자는 [${companyInfo?.representative || "대표님"}] 입니다.

[상담 지침]:
1. 항상 매우 친절하고 상냥하며, 격식 있으면서도 신뢰를 주는 대한민국 최고의 안전 전문가/고객센터 직원의 톤앤매너(존댓말)로 답변하십시오.
2. 질문 유형에 맞춰 다음 내용을 적극적으로 홍보하고 설명하십시오:
   - **주요 기능**: 
     * 현장 사진 업로드 시 1초 만에 AI 시공상태 자동 분석 및 소견 도출 (철근배근, 거푸집, 비계, 동바리 등 완벽 지원).
     * 대한민국 건설기준법(건설기술진흥법 시행령 제100조) 및 안전지침 기준에 맞는 전문가급 보고서 실시간 초안 자동 작성.
     * 보고서 실시간 수정 및 원클릭 PDF 변환, 보고서 다운로드 및 프린터 즉시 인쇄.
     * 입출금 관리 장부 및 거래 기록 기반 실시간 세무 상담 (AI 세무비서).
     * 관리자용 원클릭 회원관리대장 실시간 엑셀(CSV UTF-8 BOM) 다운로드 및 등급/한도 간편 제어.
   - **플랜 소개**:
     * '체험회원 (Trial)': 무료 회원가입 즉시 5회 작성 한도 제공.
     * '플렉스 라이트 플랜 (Flex Lite)': 무제한 보고서 작성, 세무 가이드 및 모든 전문 기술 지원 혜택을 경제적으로 누릴 수 있는 월 구독형 요금제 (초기 가입비 없음, 이용료 월 1,200,000원).
     * '프레스티지 플랜 (Prestige)': 무제한 보고서 작성, 세무 가이드 및 모든 전문 기술 지원 혜택을 장기 마스터 권한으로 제공하는 멤버십 (초기 가입비 5,000,000원, 월 유지비 500,000원).
     * **핵심 차이점**: "플렉스 라이트 플랜과 프레스티지 플랜은 제공되는 무제한 보고서 작성 기능, 세무 가이드, 일대일 전문 기술 지원 등 모든 기능과 지원 혜택이 100% 동일합니다. 오직 요금 부분(초기 가입비 유무 및 월 이용료/정기 유지비의 납부 요금 형태)만 다릅니다."라고 명확하게 안내해 주십시오.
   - **무료 한도 초과 시**: "무료 체험 한도(5회)를 초과하신 경우, 관리자의 승인을 거쳐 정회원으로 등록하시거나 '프레스티지 플랜' 또는 '플렉스 라이트 플랜'으로 업그레이드하시면 무제한 작성이 가능합니다."라고 친절히 안내하십시오.
   - **결제 및 무통장 입금 계좌 정보**:
     * 은행명: IBK 기업은행
     * 계좌번호: 189-106874-01-014
     * 예금주: 박제윤
     * "화면 하단 결제 계좌 정보의 '전체 복사' 버튼을 이용하시면 더욱 편리하게 정보를 복사하여 이체하실 수 있습니다."
3. 사용자가 어떤 질문을 하더라도 절대 당황하지 말고 전문성 있는 해결책을 즉시 제시하십시오. 건설안전 기준이나 비계 조립 간격, 거푸집 수평 버팀대 등의 구조 기술 질문에도 똑똑하게 전문가로서의 훌륭한 답변을 주십시오.
4. 사용자가 이메일 문의나 대표 연락처를 물어보더라도 절대 개인 연락처나 "박제윤 대표"의 이메일 및 010-4397-1030 번호를 포함한 "정회원 가입 및 빠른 문의 채널" 정보 블록을 임의로 답변에 출력하지 마십시오. 필요한 경우 플랫폼 내 일대일 지원이나 고객센터 통합 창구를 통해 확인해 달라고만 상냥하게 답변하십시오.`;

    const chatContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    if (!response.text) {
      throw new Error("Gemini API가 빈 응답을 반환했습니다.");
    }

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("AI Support chatbot error:", error);
    res.status(500).json({ error: error.message || "상담 챗봇 처리 중 오류가 발생했습니다." });
  }
});

// 5. API Route: Interactive Conversational Report Editor
app.post("/api/edit-report-chat", async (req, res) => {
  try {
    const { report, userMessage, chatHistory } = req.body;
    if (!report || !userMessage) {
      return res.status(400).json({ error: "보고서 데이터와 사용자 메시지가 필요합니다." });
    }

    const ai = getAIClient();

    const systemPrompt = `당신은 대한민국 국토교통부 정기안전점검 보고서를 실시간 대화식으로 수정, 추가, 삭제, 문체 정제하는 최고의 AI 기술 보고서 편집기입니다.
사용자는 생성된 보고서를 보면서 자연어로 수정 요구사항(예: "공사명을 'OOO'로 바꿔줘", "책임기술자 총평에 동절기 한파 관련 안전수칙 내용을 추가해줘", "체크리스트에 '추락방지망' 설치 항목 추가해줘", "3.4항목 삭제해줘", "전체 문체를 공식 어조(~사료됨)로 다듬어줘" 등)을 제시합니다.

[현재 보고서 주요 현황]:
- 공사명: ${report.projectName}
- 구조물/공종: ${report.workTypes}
- 점검차수: ${report.checkDegree}
- 발주자: ${report.client}
- 시공자: ${report.contractor}
- 건설사업단: ${report.supervisor}
- 안전진단기관: ${report.companyName}
- 책임기술자: ${report.leadEngineer}
- 점검일자: ${report.checkDate}
- 현장위치: ${report.projectLocation}

[수정 지침]:
1. 사용자의 요청("${userMessage}")을 정밀 분석하여, 제공된 보고서 객체(report)의 해당하는 속성 값을 수정, 추가, 삭제하십시오.
2. 체크리스트 추가/수정/삭제 요청 시 checklist 배열을 업데이트하십시오.
3. 목차나 단원 추가/삭제 요청 시 customSections 배열을 업데이트하십시오.
4. 총평/의견 보강 요청 시 comprehensiveOpinion, leadEngineerOpinion, comprehensiveConclusion 등을 격식 있는 전문 건설공학 어조(~사료됨, ~확인됨)로 다듬고 보강하십시오.
5. 반드시 JSON으로 응답하며, replyMessage(친절하고 명확한 결과 안내 메시지)와 updatedReport(변경 반영된 SafetyReport 객체)를 포함하십시오.`;

    const chatContents: any[] = [];
    if (Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        if (msg.content) {
          chatContents.push({
            role: msg.role === "assistant" ? "model" as const : "user" as const,
            parts: [{ text: msg.content }]
          });
        }
      });
    }
    chatContents.push({
      role: "user" as const,
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyMessage: { type: Type.STRING, description: "사용자에게 전달할 대화식 결과 설명 응답" },
            changesSummary: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "변경된 항목 요약 목록"
            },
            updatedReport: {
              type: Type.OBJECT,
              description: "수정된 SafetyReport 객체 속성들",
              properties: {
                projectName: { type: Type.STRING },
                projectLocation: { type: Type.STRING },
                client: { type: Type.STRING },
                contractor: { type: Type.STRING },
                supervisor: { type: Type.STRING },
                checkDegree: { type: Type.STRING },
                checkDate: { type: Type.STRING },
                leadEngineer: { type: Type.STRING },
                companyName: { type: Type.STRING },
                workTypes: { type: Type.STRING },
                summary: { type: Type.STRING },
                comprehensiveOpinion: { type: Type.STRING },
                leadEngineerOpinion: { type: Type.STRING },
                comprehensiveConclusion: { type: Type.STRING },
                auditOverview: { type: Type.STRING },
                constructionStatus: { type: Type.STRING },
                targetFacilities: { type: Type.STRING },
                scope: { type: Type.STRING },
                methodology: { type: Type.STRING },
                qualityControl: { type: Type.STRING },
                safetyControl: { type: Type.STRING },
                surroundingSafety: { type: Type.STRING },
                temporarySafety: { type: Type.STRING },
                improvementMeasures: { type: Type.STRING }
              }
            }
          },
          required: ["replyMessage", "updatedReport"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Gemini API가 빈 응답을 반환했습니다.");
    }

    const parsed = JSON.parse(response.text);
    const mergedReport = {
      ...report,
      ...(parsed.updatedReport || {}),
      updatedAt: Date.now()
    };

    res.json({
      replyMessage: parsed.replyMessage,
      updatedReport: mergedReport,
      changesSummary: parsed.changesSummary || []
    });
  } catch (error: any) {
    console.error("Report Chatbot Edit error:", error);
    res.status(500).json({ error: error.message || "보고서 대화식 수정 중 오류가 발생했습니다." });
  }
});

async function startServer() {
  // Serve Vite client assets in development and production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`건설안전점검 AI 서버가 포트 ${PORT}에서 작동 중입니다.`);
  });
}

startServer().catch((err) => {
  console.error("서버 구동 중 오류 발생:", err);
});
