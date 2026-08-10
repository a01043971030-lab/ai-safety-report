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
    const { imageBase64, mimeType, mainCategory, subCategory } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "이미지 데이터가 전달되지 않았습니다." });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `당신은 건설현장 안전 진단 AI 전문가입니다.
첨부된 사진을 분석하여 아래 항목을 한국어로 정밀 진단하십시오:
1. 제목 (caption): 예: 강관비계 벽이음 체결 및 안전망 상태
2. 상태 (status): "양호", "보완필요", "위험" 중 하나
3. 위치 (location): 사진 속 예상 위치 (예: 2층 외부 가설구간)
4. 중요 내용 (importantContent): 핵심 특징 요약
5. 특이사항 (specialRemarks): 주의 또는 보완사항
6. AI 진단 소견 (findings): 공학적 안전 진단 소견

카테고리 정보: 대분류=[${mainCategory || "기타"}], 소분류=[${subCategory || "기타"}]

순수 JSON 형식으로 응답하십시오:
{
  "caption": "제목",
  "status": "양호",
  "location": "위치",
  "importantContent": "요약",
  "specialRemarks": "특이사항",
  "findings": "진단 소견"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: mimeType || "image/jpeg", data: base64Data } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    if (!response.text) {
      throw new Error("Gemini API가 빈 응답을 반환했습니다.");
    }

    const result = JSON.parse(response.text);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Vercel analyze-image error:", error);
    return res.status(500).json({ error: error.message || "이미지 분석 실패" });
  }
}
