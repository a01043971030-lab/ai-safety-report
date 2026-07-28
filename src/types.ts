export const PHOTO_MAIN_CATEGORIES = [
  "현장사진",
  "도면 사진",
  "작업계획서 사진",
  "비파괴 검사사진",
  "지반조사 사진",
  "품질 자재관리의 적정성 사진",
  "안전교육 사진",
  "별도 사진"
] as const;

export type PhotoMainCategory = typeof PHOTO_MAIN_CATEGORIES[number];

export const PHOTO_SUB_CATEGORIES: Record<string, string[]> = {
  "현장사진": [
    "시설물",
    "건설기계",
    "외관 조사 사진",
    "인접시설물 안전 조치의 적정성",
    "공사장 주변 안전조치의 적정성",
    "건설 기계 사용에 대한 안전성",
    "임시 안전시설 설치의 적정성 및 가설공법의 안전성",
    "기타사진"
  ],
  "도면 사진": [],
  "작업계획서 사진": [],
  "비파괴 검사사진": [],
  "지반조사 사진": [],
  "품질 자재관리의 적정성 사진": [],
  "안전교육 사진": [],
  "별도 사진": []
};

export interface PhotoItem {
  id: string;
  url: string; // Base64 or local blob URL
  name: string;
  mainCategory?: string;
  subCategory?: string;
  category: "철근배근" | "거푸집" | "비계" | "동바리" | "옹벽" | "교량" | "콘크리트" | "토공/굴착" | "기타" | string;
  confidence: number;
  caption: string;
  findings: string;
  status: "양호" | "보완요망" | "지적사항" | string;
  analyzing: boolean;
  location?: string;
  importantContent?: string;
  specialRemarks?: string;
}

export interface ChecklistItem {
  category: string;
  item: string;
  criterion: string;
  result: "양호" | "보완요망" | "지적사항" | string;
  action: string;
}

export interface SampleFileItem {
  id: string;
  name: string;
  type: "text" | "pdf" | "image" | "doc";
  dataUrl?: string; // Image or PDF base64 data URL for preview
  textContent?: string;
  size?: number;
}

export interface SampleTemplateConfig {
  sampleName?: string;
  sampleContent?: string;
  sampleFiles?: SampleFileItem[]; // Up to 30 sample files/pages
  fontStyle?: "맑은 고딕" | "휴먼명조" | "나눔고딕" | "바탕체" | string;
  toneStyle?: "격식체 (~함, ~사료됨)" | "서술체 (~하였습니다)" | "간결체 (~함)";
  tableStyle?: "표준 격자형" | "클린 테두리형" | "헤더 강조형";
}

export interface SafetyReport {
  id?: string;
  creatorUsername?: string;
  // Metadata
  createdAt: number;
  updatedAt: number;

  // Sample Custom Template Config
  sampleConfig?: SampleTemplateConfig;

  // Basic Info - Company
  companyName: string;
  representative: string;
  address: string;
  phone: string;
  email: string;

  // Basic Info - Project
  projectName: string;
  projectLocation: string;
  client: string;
  contractor: string;
  supervisor: string;
  projectPeriod: string;
  checkDegree: string;
  checkDate: string;
  progressRate: string;
  leadEngineer: string;
  assistantEngineers: string;
  workTypes: string;
  summary: string;
  remarks: string;
  checkResult: string;

  // Photos
  photos: PhotoItem[];

  // AI Generated Sections
  aiGenerated: boolean;
  auditOverview?: string;
  constructionStatus?: string;
  targetFacilities?: string;
  scope?: string;
  methodology?: string;
  qualityControl?: string;
  safetyControl?: string;
  surroundingSafety?: string;
  temporarySafety?: string;
  checklist?: ChecklistItem[];
  comprehensiveOpinion?: string;
  improvementMeasures?: string;
  leadEngineerOpinion?: string;
  comprehensiveConclusion?: string;
}

export type MemberStatus = "체험회원" | "정회원 승인대기" | "정회원";

export interface UserProfile {
  id?: string;
  username: string;
  password?: string;
  companyName: string;
  representative: string;
  businessNumber: string;
  address: string;
  phone: string;
  email: string;
  status: MemberStatus;
  reportsCreatedCount: number;
  createdAt?: string;
  lastLoginAt?: string;
  activeStatus?: "정상" | "정지";
  allowedReportsCount?: number;
  plan?: "프레스티지" | "플렉스 라이트" | "체험" | string;
}

export interface AccountingTransaction {
  id?: string;
  companyId: string; // 완전히 분리하기 위해 사용자 username(또는 companyId) 저장
  date: string; // YYYY-MM-DD
  vendor: string; // 거래처
  businessNumber: string; // 사업자번호
  description: string; // 적요
  amount: number; // 총액 (수입 또는 지출 금액)
  supplyValue: number; // 공급가액
  vat: number; // 부가세
  category: string; // 계정과목 (예: 원재료비, 장비임차료, 급여, 차량유지비, 소모품비, 보험료, 수도광열비 등)
  type: "수입" | "지출";
  paymentMethod: "현금" | "계좌이체" | "카드" | "전자세금계산서" | "현금영수증";
  memo: string;
  receiptUrl?: string; // 영수증 사진/파일 (Base64)
  receiptName?: string;
  siteName: string; // 연동된 건설현장명/공사명
  createdAt: number;
  updatedAt: number;
}

export interface TaxSchedule {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  type: "신고" | "납부" | "중요";
}

export interface NoticeItem {
  id: string;
  tag: string;
  title: string;
  date: string;
  content: string;
  createdAt: number;
}

export interface LoginLogItem {
  id: string;
  username: string;
  companyName: string;
  representative: string;
  loginAt: string; // YYYY-MM-DD HH:mm:ss
  timestamp: number;
  status: "성공" | "비밀번호 오류" | "계정 잠김" | "실패";
  ipAddress?: string;
  device?: string;
}

