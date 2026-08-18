import React, { useState, useEffect, useMemo } from "react";
import { SafetyReport, UserProfile, MemberStatus, NoticeItem, LoginLogItem } from "../types";
import { 
  Settings, 
  User, 
  Building2, 
  Lock, 
  Trash2, 
  Copy, 
  Edit, 
  Eye, 
  Printer, 
  Download, 
  Plus, 
  Search, 
  Check, 
  X, 
  ShieldAlert, 
  RefreshCw, 
  Key, 
  Building, 
  Briefcase, 
  Shield, 
  Clock, 
  Sparkles, 
  AlertCircle,
  FileText,
  LockKeyhole,
  CheckCircle,
  HardHat,
  History,
  Activity,
  Calendar,
  Globe
} from "lucide-react";

interface AdminDashboardProps {
  reports: SafetyReport[];
  allUsers: UserProfile[];
  onRefreshUsers: () => void;
  onRefreshReports: () => void;
  onSaveReport: (report: SafetyReport) => void;
  onDeleteReport: (id: string) => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogoutAdmin: () => void;
  onViewReport: (report: SafetyReport) => void;
  onEditReport: (report: SafetyReport) => void;
  onCreateReportForUser: (user: UserProfile) => void;
  notices: NoticeItem[];
  onSaveNotice: (notice: NoticeItem) => void;
  onDeleteNotice: (id: string) => void;
  loginLogs?: LoginLogItem[];
  onRefreshLoginLogs?: () => void;
}

export default function AdminDashboard({
  reports,
  allUsers,
  onRefreshUsers,
  onRefreshReports,
  onSaveReport,
  onDeleteReport,
  onUpdateUser,
  onLogoutAdmin,
  onViewReport,
  onEditReport,
  onCreateReportForUser,
  notices,
  onSaveNotice,
  onDeleteNotice,
  loginLogs = [],
  onRefreshLoginLogs
}: AdminDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"REPORTS" | "LOGIN_HISTORY" | "EDIT_PROFILE" | "CHANGE_PASSWORD">("REPORTS");
  const [userSearch, setUserSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [dashboardMode, setDashboardMode] = useState<"MEMBERS" | "REPORTS_ALL" | "LOGIN_LOGS" | "NOTICES">("MEMBERS");

  // Search & Filter states for Master Reports and Login Logs
  const [globalReportSearch, setGlobalReportSearch] = useState("");
  const [globalCompanyFilter, setGlobalCompanyFilter] = useState("ALL");
  const [reportViewMode, setReportViewMode] = useState<"COMPANY_GROUP" | "GRID">("COMPANY_GROUP");
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
  const [loginLogSearch, setLoginLogSearch] = useState("");
  const [loginLogStatusFilter, setLoginLogStatusFilter] = useState("ALL");

  // Quick Report Detail Modal state
  const [previewModalReport, setPreviewModalReport] = useState<SafetyReport | null>(null);

  // Notice editor states
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [noticeTag, setNoticeTag] = useState("공지사항");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDate, setNoticeDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeSearch, setNoticeSearch] = useState("");

  // Edit fields state
  const [editForm, setEditForm] = useState({
    companyName: "",
    representative: "",
    businessNumber: "",
    address: "",
    phone: "",
    email: "",
    status: "체험회원" as MemberStatus,
    activeStatus: "정상" as "정상" | "정지",
    allowedReportsCount: 5,
    plan: "체험"
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Excel direct export as UTF-8 BOM CSV
  const handleDownloadExcel = () => {
    const headers = [
      "아이디",
      "회사명",
      "대표자",
      "사업자등록번호",
      "대표전화",
      "이메일",
      "회사소재지",
      "회원등급",
      "가입플랜",
      "전체작성건수",
      "무료작성한도",
      "계정상태",
      "가입일시",
      "최근로그인"
    ];

    const csvRows = [
      headers.join(","),
      ...allUsers.map(u => [
        `"${(u.username || "").replace(/"/g, '""')}"`,
        `"${(u.companyName || "").replace(/"/g, '""')}"`,
        `"${(u.representative || "").replace(/"/g, '""')}"`,
        `"${(u.businessNumber || "").replace(/"/g, '""')}"`,
        `"${(u.phone || "").replace(/"/g, '""')}"`,
        `"${(u.email || "").replace(/"/g, '""')}"`,
        `"${(u.address || "").replace(/"/g, '""')}"`,
        `"${(u.status || "").replace(/"/g, '""')}"`,
        `"${(u.plan || "체험").replace(/"/g, '""')}"`,
        u.reportsCreatedCount || 0,
        u.allowedReportsCount || 5,
        `"${(u.activeStatus || "정상").replace(/"/g, '""')}"`,
        `"${(u.createdAt || "").replace(/"/g, '""')}"`,
        `"${(u.lastLoginAt || "").replace(/"/g, '""')}"`
      ].join(","))
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `건설안전플랫폼_회원관리대장_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Login Logs
  const handleDownloadLoginLogsCSV = () => {
    const headers = ["접속일시", "회원아이디", "회사명", "대표자명", "접속결과", "IP주소", "접속기기/환경"];
    const csvRows = [
      headers.join(","),
      ...loginLogs.map(l => [
        `"${(l.loginAt || "").replace(/"/g, '""')}"`,
        `"${(l.username || "").replace(/"/g, '""')}"`,
        `"${(l.companyName || "").replace(/"/g, '""')}"`,
        `"${(l.representative || "").replace(/"/g, '""')}"`,
        `"${(l.status || "").replace(/"/g, '""')}"`,
        `"${(l.ipAddress || "").replace(/"/g, '""')}"`,
        `"${(l.device || "").replace(/"/g, '""')}"`
      ].join(","))
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `건설안전플랫폼_회원로그인이력_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for All Created Reports
  const handleDownloadAllReportsCSV = () => {
    const headers = ["회사명", "작성자ID", "공사명", "발주처", "시공사", "점검차수", "점검일자", "사진수", "최종수정일"];
    const csvRows = [
      headers.join(","),
      ...reports.map(r => [
        `"${(r.companyName || "").replace(/"/g, '""')}"`,
        `"${(r.creatorUsername || "").replace(/"/g, '""')}"`,
        `"${(r.projectName || "").replace(/"/g, '""')}"`,
        `"${(r.client || "").replace(/"/g, '""')}"`,
        `"${(r.contractor || "").replace(/"/g, '""')}"`,
        `"${(r.checkDegree || "").replace(/"/g, '""')}"`,
        `"${(r.checkDate || "").replace(/"/g, '""')}"`,
        r.photos?.length || 0,
        `"${new Date(r.updatedAt || Date.now()).toLocaleString("ko-KR")}"`
      ].join(","))
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `건설안전플랫폼_전체회원_보고서목록_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Master Reports List
  const filteredMasterReports = reports.filter(r => {
    // Filter by company
    if (globalCompanyFilter !== "ALL") {
      const target = globalCompanyFilter.trim().toLowerCase();
      const comp = (r.companyName || "").trim().toLowerCase();
      const user = (r.creatorUsername || "").trim().toLowerCase();
      
      const isMatch = comp === target || user === target || (comp.length > 0 && comp.includes(target));
      if (!isMatch) return false;
    }
    // Search query
    if (!globalReportSearch) return true;
    const term = globalReportSearch.toLowerCase();
    return (
      (r.projectName && r.projectName.toLowerCase().includes(term)) ||
      (r.companyName && r.companyName.toLowerCase().includes(term)) ||
      (r.creatorUsername && r.creatorUsername.toLowerCase().includes(term)) ||
      (r.client && r.client.toLowerCase().includes(term)) ||
      (r.contractor && r.contractor.toLowerCase().includes(term)) ||
      (r.checkDegree && r.checkDegree.toLowerCase().includes(term))
    );
  });

  // Aggregate reports by company for Company Group View
  interface CompanyGroup {
    key: string;
    companyName: string;
    username?: string;
    user?: UserProfile;
    reports: SafetyReport[];
  }

  const companyReportGroups = useMemo<CompanyGroup[]>(() => {
    const groupMap = new Map<string, CompanyGroup>();

    // 1. Initialize map with all registered users so every company is represented
    allUsers.forEach((u) => {
      const key = u.username;
      groupMap.set(key, {
        key,
        companyName: u.companyName || "(미입력)",
        username: u.username,
        user: u,
        reports: []
      });
    });

    // 2. Put reports into corresponding company groups
    reports.forEach((rep) => {
      let matchedKey = "";
      for (const [key, group] of groupMap.entries()) {
        const uComp = (group.companyName || "").replace(/\s+/g, "").toLowerCase();
        const uName = (group.username || "").trim().toLowerCase();
        const rComp = (rep.companyName || "").replace(/\s+/g, "").toLowerCase();
        const rUser = (rep.creatorUsername || "").trim().toLowerCase();

        if (
          (rUser.length > 0 && (rUser === uName || uName.includes(rUser) || rUser.includes(uName))) ||
          (rComp.length > 0 && uComp.length > 0 && (rComp === uComp || rComp.includes(uComp) || uComp.includes(rComp)))
        ) {
          matchedKey = key;
          break;
        }
      }

      if (matchedKey && groupMap.has(matchedKey)) {
        groupMap.get(matchedKey)!.reports.push(rep);
      } else {
        // Unregistered/guest company group
        const fallbackKey = rep.companyName || rep.creatorUsername || "미지정 회사";
        if (!groupMap.has(fallbackKey)) {
          groupMap.set(fallbackKey, {
            key: fallbackKey,
            companyName: rep.companyName || "미지정 회사",
            username: rep.creatorUsername || "-",
            reports: []
          });
        }
        groupMap.get(fallbackKey)!.reports.push(rep);
      }
    });

    let result = Array.from(groupMap.values());

    // 3. Filter by company dropdown
    if (globalCompanyFilter !== "ALL") {
      const target = globalCompanyFilter.trim().toLowerCase();
      result = result.filter(
        g => g.companyName.toLowerCase().includes(target) || (g.username && g.username.toLowerCase().includes(target))
      );
    }

    // 4. Filter by global search term
    if (globalReportSearch.trim()) {
      const term = globalReportSearch.trim().toLowerCase();
      result = result.filter(g => {
        const matchesComp = g.companyName.toLowerCase().includes(term) || (g.username && g.username.toLowerCase().includes(term));
        const matchesReport = g.reports.some(r =>
          (r.projectName && r.projectName.toLowerCase().includes(term)) ||
          (r.client && r.client.toLowerCase().includes(term)) ||
          (r.contractor && r.contractor.toLowerCase().includes(term)) ||
          (r.checkDegree && r.checkDegree.toLowerCase().includes(term))
        );
        return matchesComp || matchesReport;
      });
    }

    return result;
  }, [allUsers, reports, globalCompanyFilter, globalReportSearch]);

  // Filter Login Logs List
  const filteredLoginLogs = loginLogs.filter(l => {
    // Filter by status
    if (loginLogStatusFilter !== "ALL" && l.status !== loginLogStatusFilter) {
      return false;
    }
    // Search query
    if (!loginLogSearch) return true;
    const term = loginLogSearch.toLowerCase();
    return (
      (l.username && l.username.toLowerCase().includes(term)) ||
      (l.companyName && l.companyName.toLowerCase().includes(term)) ||
      (l.representative && l.representative.toLowerCase().includes(term)) ||
      (l.ipAddress && l.ipAddress.toLowerCase().includes(term))
    );
  });

  // Keep selected user sync'd with changes
  useEffect(() => {
    if (allUsers.length > 0) {
      if (!selectedUser) {
        setSelectedUser(allUsers[0]);
      } else {
        const found = allUsers.find(u => u.username === selectedUser.username);
        if (found) {
          setSelectedUser(found);
        }
      }
    }
  }, [allUsers]);

  // Update edit form when selected user changes
  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        companyName: selectedUser.companyName || "",
        representative: selectedUser.representative || "",
        businessNumber: selectedUser.businessNumber || "",
        address: selectedUser.address || "",
        phone: selectedUser.phone || "",
        email: selectedUser.email || "",
        status: selectedUser.status || "체험회원",
        activeStatus: selectedUser.activeStatus || "정상",
        allowedReportsCount: selectedUser.allowedReportsCount || 5,
        plan: selectedUser.plan || "체험"
      });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    }
  }, [selectedUser]);

  // Filter users based on search
  const filteredUsers = allUsers.filter(u => {
    const term = userSearch.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      (u.companyName && u.companyName.toLowerCase().includes(term)) ||
      (u.representative && u.representative.toLowerCase().includes(term))
    );
  });

  // Filter reports specifically for selected user using username, companyName, or representative
  const filteredReports = reports.filter(r => {
    if (!selectedUser) return false;
    
    const userCompName = (selectedUser.companyName || "").replace(/\s+/g, "").toLowerCase();
    const repCompName = (r.companyName || "").replace(/\s+/g, "").toLowerCase();
    const userName = (selectedUser.username || "").trim().toLowerCase();
    const repUser = (r.creatorUsername || "").trim().toLowerCase();
    const userRepName = (selectedUser.representative || "").replace(/\s+/g, "").toLowerCase();
    const repRepName = (r.representative || "").replace(/\s+/g, "").toLowerCase();

    const isUserReport = 
      (repUser.length > 0 && (repUser === userName || userName.includes(repUser) || repUser.includes(userName))) ||
      (userCompName.length > 0 && repCompName.length > 0 && (repCompName === userCompName || repCompName.includes(userCompName) || userCompName.includes(repCompName))) ||
      (userRepName.length > 0 && repRepName.length > 0 && (repRepName === userRepName || repRepName.includes(userRepName) || userRepName.includes(repRepName)));
    
    if (!isUserReport) return false;

    // Search query match
    if (!reportSearch) return true;
    const term = reportSearch.toLowerCase();
    return (
      (r.projectName && r.projectName.toLowerCase().includes(term)) ||
      (r.client && r.client.toLowerCase().includes(term)) ||
      (r.contractor && r.contractor.toLowerCase().includes(term)) ||
      (r.checkDegree && r.checkDegree.toLowerCase().includes(term))
    );
  });

  // Count reports for selected user in current month
  const getThisMonthReportsCount = (user: UserProfile) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const uComp = (user.companyName || "").replace(/\s+/g, "").toLowerCase();
    const uName = (user.username || "").trim().toLowerCase();

    return reports.filter(r => {
      const rUser = (r.creatorUsername || "").trim().toLowerCase();
      const rComp = (r.companyName || "").replace(/\s+/g, "").toLowerCase();
      const isMatch = (rUser.length > 0 && (rUser === uName || uName.includes(rUser))) ||
                      (uComp.length > 0 && rComp.length > 0 && (rComp === uComp || rComp.includes(uComp) || uComp.includes(rComp)));
      if (!isMatch) return false;
      
      const rDate = new Date(r.createdAt || Date.now());
      return rDate.getFullYear() === currentYear && rDate.getMonth() === currentMonth;
    }).length;
  };

  // Toggle user membership status (체험회원 <-> 정회원)
  const handleToggleStatus = (user: UserProfile) => {
    const nextStatus: MemberStatus = user.status === "정회원" ? "체험회원" : "정회원";
    const updated: UserProfile = {
      ...user,
      status: nextStatus
    };
    onUpdateUser(updated);
  };

  // Add 5 allowed reports to user
  const handleAddFiveAttempts = (user: UserProfile) => {
    const currentAllowed = user.allowedReportsCount || 5;
    const updated: UserProfile = {
      ...user,
      allowedReportsCount: currentAllowed + 5
    };
    onUpdateUser(updated);
    alert(`[${user.companyName}] 회원의 무료 작성횟수가 5회 더 추가되었습니다. (총 ${currentAllowed + 5}회)`);
  };

  // Toggle User Active/Suspended status (정상 <-> 정지)
  const handleToggleActiveStatus = (user: UserProfile) => {
    const nextActive = user.activeStatus === "정지" ? "정상" : "정지";
    const updated: UserProfile = {
      ...user,
      activeStatus: nextActive
    };
    onUpdateUser(updated);
  };

  // Copy/Duplicate report
  const handleCopyReport = (report: SafetyReport) => {
    const duplicated: SafetyReport = {
      ...report,
      id: undefined, // Let DB generate new ID
      projectName: `${report.projectName} (복사본)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    onSaveReport(duplicated);
    alert("보고서 복사본이 성공적으로 생성되었습니다.");
  };

  // Save profile updates
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updated: UserProfile = {
      ...selectedUser,
      companyName: editForm.companyName,
      representative: editForm.representative,
      businessNumber: editForm.businessNumber,
      address: editForm.address,
      phone: editForm.phone,
      email: editForm.email,
      status: editForm.status,
      activeStatus: editForm.activeStatus,
      allowedReportsCount: Number(editForm.allowedReportsCount),
      plan: editForm.plan
    };

    onUpdateUser(updated);
  };

  // Save password updates
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!passwordForm.newPassword) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const updated: UserProfile = {
      ...selectedUser,
      password: passwordForm.newPassword
    };

    onUpdateUser(updated);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
  };

  // Instant direct MS Word (.doc) generation from report object
  const triggerDirectWordDownload = (report: SafetyReport) => {
    const title = `${report.projectName || "건설안전점검보고서"}_정기안전점검보고서.doc`;
    
    // Standard chapters content or fallback text if undefined
    const auditOverview = report.auditOverview || "본 정기안전점검은 건설공사 안전관리 업무수행 지침에 의거하여 정밀 실시되었습니다.";
    const constructionStatus = report.constructionStatus || "대상 현장은 허가 도면 및 승인된 가설설계 계산 기준에 따라 정상 시공 중입니다.";
    const checklistRows = report.checklist?.map((item, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>${item.category}</td>
        <td>${item.item}</td>
        <td>${item.criterion}</td>
        <td style="text-align: center; font-weight: bold; color: ${item.result === '양호' ? '#16a34a' : '#dc2626'}">${item.result}</td>
        <td>${item.action}</td>
      </tr>
    `).join("") || "<tr><td colspan='6' style='text-align: center;'>등록된 부위별 체크리스트가 없습니다.</td></tr>";

    const photosContent = report.photos?.map((p, idx) => `
      <div style="page-break-inside: avoid; margin-top: 30px; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; text-align: center;">
        <h4 style="color: #1e3a8a; text-align: left; margin-top: 0;">[사진 ${idx + 1}] ${p.name || p.category}</h4>
        ${p.url ? `<img src="${p.url}" style="max-width: 100%; max-height: 350px; border-radius: 4px; margin: 10px auto;" />` : `<div style="padding: 40px; background-color: #f8fafc; border: 1px dashed #cbd5e1;">현장 점검 사진 데이터</div>`}
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 10pt;">
          <tr>
            <th style="width: 25%; background-color: #f1f5f9; padding: 6px; text-align: left; border: 1px solid #cbd5e1;">AI 탐지 항목</th>
            <td style="width: 25%; padding: 6px; border: 1px solid #cbd5e1;">${p.category} (${Math.round((p.confidence || 0.98) * 100)}%)</td>
            <th style="width: 25%; background-color: #f1f5f9; padding: 6px; text-align: left; border: 1px solid #cbd5e1;">조치 판정</th>
            <td style="width: 25%; padding: 6px; font-weight: bold; color: ${p.status === '양호' ? '#16a34a' : '#dc2626'}; border: 1px solid #cbd5e1;">${p.status}</td>
          </tr>
          <tr>
            <th style="background-color: #f1f5f9; padding: 6px; text-align: left; border: 1px solid #cbd5e1;">세부 지적 소견</th>
            <td colspan="3" style="padding: 6px; border: 1px solid #cbd5e1; text-align: left;">${p.findings || "상태 매우 양호하며 특이 위험 요인 발견되지 않음."}</td>
          </tr>
        </table>
      </div>
    `).join("") || "<p style='text-align: center; color: #64748b;'>등록된 현장 점검 사진 및 AI 사진대지가 없습니다.</p>";

    const wordHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Malgun Gothic', 'Dotum', sans-serif; line-height: 1.6; color: #334155; }
          h1 { font-size: 26pt; font-weight: bold; text-align: center; margin-top: 100px; margin-bottom: 50px; color: #0f172a; }
          h2 { font-size: 18pt; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-top: 40px; }
          h3 { font-size: 14pt; font-weight: bold; color: #1e40af; margin-top: 25px; }
          h4 { font-size: 12pt; font-weight: bold; color: #1e3a8a; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
          th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; border: 1px solid #94a3b8; padding: 10px; font-size: 11pt; }
          td { border: 1px solid #cbd5e1; padding: 10px; font-size: 10pt; text-align: left; }
          .cover { text-align: center; page-break-after: always; padding-top: 80px; }
          .page-break { page-break-after: always; }
          .box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <!-- 표지 -->
        <div class="cover">
          <p style="font-size: 14pt; color: #1e3a8a; font-weight: bold;">건설기술진흥법 제62조 기준 정기안전점검</p>
          <hr style="border: 2px solid #1e3a8a; width: 80px; margin: 20px auto;" />
          <h1>정 기 안 전 점 검 보 고 서</h1>
          <p style="font-size: 16pt; font-weight: bold; background-color: #f1f5f9; padding: 8px 30px; display: inline-block; border-radius: 4px;">
            [ ${report.checkDegree || "제 1 차"} 점검 ]
          </p>
          
          <table style="width: 90%; margin: 80px auto; border: 2px solid #0f172a;">
            <tr>
              <th style="width: 25%; text-align: left; background-color: #f8fafc;">공 사 명</th>
              <td>${report.projectName || "(공사명 미정)"}</td>
            </tr>
            <tr>
              <th style="text-align: left; background-color: #f8fafc;">발 주 처</th>
              <td>${report.client || "(발주처 미정)"}</td>
            </tr>
            <tr>
              <th style="text-align: left; background-color: #f8fafc;">시 공 사</th>
              <td>${report.contractor || "(시공사 미정)"}</td>
            </tr>
            <tr>
              <th style="text-align: left; background-color: #f8fafc;">감 리 사</th>
              <td>${report.supervisor || "(감리사 미정)"}</td>
            </tr>
            <tr>
              <th style="text-align: left; background-color: #f8fafc;">점 검 일</th>
              <td>${report.checkDate || "(점검일 미정)"}</td>
            </tr>
          </table>
          
          <div style="margin-top: 150px;">
            <h2 style="border:none; color:#000; text-align:center; font-size:22pt;">${report.companyName}</h2>
            <p style="font-size:11pt; color:#64748b;">${report.address || ""} | Tel: ${report.phone || ""}</p>
          </div>
        </div>

        <!-- 제출문 -->
        <div class="page-break">
          <h2>제 출 문</h2>
          <p style="font-size:12pt; font-weight:bold; margin-top:20px;">수신 : ${report.client || "발주처 대표 귀하"}</p>
          <p style="font-size:12pt; font-weight:bold;">참조 : ${report.supervisor || "감리단 책임기술인"}</p>
          <p style="font-weight:bold; font-size:11pt; margin-top:30px;">제목 : [ ${report.checkDegree || "제 1 차"} ] 정기안전점검 보고서 제출의 건</p>
          <p style="margin-top:20px; text-align:justify;">
            귀 현장의 건설기술진흥법 시행령 제100조에 의한 안전점검 업무를 계약 체결하여 당사에서 정밀 안전점검을 수행하였습니다. 
            그 종합 결과보고서를 관련 기준 및 법규에 충족하게 작성하여 정식 제출하오니, 현장 안전관리 및 품질 시정 지도 자료로 적극 활용해 주시기 바랍니다.
          </p>
          <p style="text-align:right; margin-top:100px; font-weight:bold; font-size:12pt;">
            ${new Date().toLocaleDateString("ko-KR")}<br/><br/>
            안전점검 기관: ${report.companyName} 대표 귀하
          </p>
        </div>

        <!-- 목차 -->
        <div class="page-break">
          <h2>목 차</h2>
          <table style="width:100%; border:none;">
            <tr><td style="border:none; font-weight:bold;">제 1 장. 조사 개요</td><td style="border:none; text-align:right;">Page 3</td></tr>
            <tr><td style="border:none; font-weight:bold;">제 2 장. 설계 및 시설물 현황</td><td style="border:none; text-align:right;">Page 4</td></tr>
            <tr><td style="border:none; font-weight:bold;">제 3 장. 주변 환경 및 매설물 지반 분석</td><td style="border:none; text-align:right;">Page 5</td></tr>
            <tr><td style="border:none; font-weight:bold;">제 4 장. 부위별 가설구조 및 마감 체크리스트</td><td style="border:none; text-align:right;">Page 6</td></tr>
            <tr><td style="border:none; font-weight:bold;">제 5 장. 안전 개선 및 권고 대책</td><td style="border:none; text-align:right;">Page 8</td></tr>
            <tr><td style="border:none; font-weight:bold;">제 6 장. 인접 환경 안전 지침</td><td style="border:none; text-align:right;">Page 9</td></tr>
            <tr><td style="border:none; font-weight:bold;">제 7 장. 현장 점검 실시간 AI 사진대지</td><td style="border:none; text-align:right;">Page 10</td></tr>
            <tr><td style="border:none; font-weight:bold;">제 8 장. 종합 결론 및 안전 개선 건의 대책</td><td style="border:none; text-align:right;">Page 12</td></tr>
          </table>
        </div>

        <!-- 제1장 -->
        <div class="page-break">
          <h2>제 1 장. 조사 개요</h2>
          <h3>1.1 목적</h3>
          <p>본 정기안전점검은 건설공사 안전관리 업무수행 지침에 근거하여 대상 건설공사의 안전 상태를 조사·분석함으로써 시공 과정 중 발생할 수 있는 잠재적 위험 요소를 예방하고 안전성을 강화하는 데 목적이 있습니다.</p>
          <h3>1.2 대상 및 범위</h3>
          <div class="box">
            <p><strong>공 사 명 :</strong> ${report.projectName}</p>
            <p><strong>점검 위치 :</strong> ${report.projectLocation}</p>
            <p><strong>점검 공정율 :</strong> ${report.progressRate || "미지정"}%</p>
            <p><strong>공사 기간 :</strong> ${report.projectPeriod || "미지정"}</p>
          </div>
          <h3>1.3 조사 개요 세부사항</h3>
          <p>${auditOverview}</p>
        </div>

        <!-- 제2장 -->
        <div class="page-break">
          <h2>제 2 장. 설계 및 시설물 현황</h2>
          <h3>2.1 주요 구조 공법</h3>
          <p>${constructionStatus}</p>
          <h3>2.2 대상 시설물 주요 정보</h3>
          <table style="width: 100%;">
            <tr style="background-color: #f1f5f9;">
              <th style="width:30%;">발주처 / 시공사</th>
              <td style="background-color: #fff;">${report.client} / ${report.contractor}</td>
            </tr>
            <tr style="background-color: #f1f5f9;">
              <th>책임기술인 / 참여단</th>
              <td style="background-color: #fff;">${report.leadEngineer} (참여: ${report.assistantEngineers || "없음"})</td>
            </tr>
            <tr style="background-color: #f1f5f9;">
              <th>주요 공종 구성</th>
              <td style="background-color: #fff;">${report.workTypes || "기반 토공사, 고층 골조 공정"}</td>
            </tr>
          </table>
        </div>

        <!-- 제3장 -->
        <div class="page-break">
          <h2>제 3 장. 주변 환경 및 매설물 지반 분석</h2>
          <p>${report.surroundingSafety || "인근 매설물 정보 및 지하 매설 가스관/수도 배관 상태 양호 확인. 사면 붕괴 등 주변 옹벽 전도 이격 변위 감지 이력 없음."}</p>
        </div>

        <!-- 제4장 -->
        <div class="page-break">
          <h2>제 4 장. 부위별 가설구조 및 마감 체크리스트</h2>
          <p>건설공사 안전관리 업무지침에 따른 부위별 안전체크 대장입니다.</p>
          <table>
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="width: 5%;">번호</th>
                <th style="width: 15%;">분류</th>
                <th style="width: 25%;">점검 항목</th>
                <th style="width: 30%;">기준 수치</th>
                <th style="width: 10%;">결과</th>
                <th style="width: 15%;">조치안</th>
              </tr>
            </thead>
            <tbody>
              ${checklistRows}
            </tbody>
          </table>
        </div>

        <!-- 제5장 -->
        <div class="page-break">
          <h2>제 5 장. 안전 개선 및 권고 대책</h2>
          <p>${report.comprehensiveOpinion || "전반적인 현장 안전 상태 양호. 미비 구역에는 조치안에 기재된 내용을 즉시 집행 권고."}</p>
        </div>

        <!-- 제6장 -->
        <div class="page-break">
          <h2>제 6 장. 인접 환경 안전 지침</h2>
          <p>${report.temporarySafety || "크레인 및 타워크레인 등의 작업 전 하부 통제, 비산먼지 분진 수시 살수 조치, 인접 도로 균열 감시."}</p>
        </div>

        <!-- 제7장 -->
        <div class="page-break">
          <h2>제 7 장. 현장 점검 실시간 AI 사진대지</h2>
          <p>AI가 자동 분류 및 캡션 매칭한 고해상도 현장 사진대지 명세입니다.</p>
          ${photosContent}
        </div>

        <!-- 제8장 -->
        <div>
          <h2>제 8 장. 종합 결론 및 안전 개선 건의 대책</h2>
          <h3>8.1 종합결론</h3>
          <p>${report.comprehensiveConclusion || "종합 검토 결과 현장의 전반적인 구조 안정성 상태 적정 수준 충족."}</p>
          <h3>8.2 안전개선 건의 대책</h3>
          <p>${report.improvementMeasures || "작업 발판 난간 고정 보완 및 배수로 상시 정리 정돈 요망."}</p>
          <h3>8.3 책임기술자 최종 날인 의견</h3>
          <p style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 15px; border-radius: 4px;">
            ${report.leadEngineerOpinion || "본 책임기술인은 현장의 안전관리 상태가 관련 규정을 견고하게 충족함을 보존합니다."}
          </p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([wordHtml], { type: "application/msword;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4" id="admin-dashboard-container">
      
      {/* Upper Dashboard Statistics Header */}
      <div className="bg-slate-900 rounded-3xl text-white p-6 md:p-8 relative overflow-hidden shadow-2xl border border-slate-800 mb-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-4xl space-y-3 relative z-10">
          <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 tracking-widest inline-flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-blue-400 animate-spin-slow" />
            ADMIN COCKPIT CONTROL
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight flex items-center gap-2">
            AI 건설안전 점검대장 통합 관리자 시스템
          </h1>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            전체 등록 회원들의 등급 승인, 무료 작성 잔여 한도 상향 조정, 사용 정지 처리 및 개별 보고서 수정/삭제 권리를 총괄 집행합니다.
          </p>
        </div>
        <div className="absolute bottom-4 right-6 print:hidden flex items-center gap-2">
          <button 
            onClick={() => {
              onRefreshReports();
              onRefreshUsers();
              if (onRefreshLoginLogs) onRefreshLoginLogs();
              alert(`실시간 클라우드 DB 동기화 완료\n- 보고서: 총 ${reports.length}건\n- 등록회원: 총 ${allUsers.length}개사`);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            title="클라우드 Firestore 데이터베이스와 즉시 동기화합니다"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            실시간 DB 즉시 동기화
          </button>
          <button 
            onClick={onLogoutAdmin}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            관리자 로그아웃
          </button>
        </div>
      </div>

      {/* 10 TOP CARDS for selected user status */}
      {selectedUser ? (
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              <div>
                <label className="block text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">
                  🏢 회사(회원) 선택 필터링 드롭다운
                </label>
                <p className="text-xs text-slate-600">
                  원하는 회사를 선택하면 해당 회사가 작성한 작성 보고서 목록과 상세 내역이 아래에 실시간으로 표시됩니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">회사 선택:</span>
              <select
                value={selectedUser.username}
                onChange={(e) => {
                  const targetUser = allUsers.find(u => u.username === e.target.value);
                  if (targetUser) setSelectedUser(targetUser);
                }}
                className="w-full md:w-80 text-xs font-extrabold bg-white text-slate-900 border-2 border-blue-500 rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                {allUsers.map((u) => {
                  const userReportCount = reports.filter(r => 
                    (r.creatorUsername && r.creatorUsername === u.username) ||
                    (r.companyName?.trim() === u.companyName?.trim())
                  ).length;

                  return (
                    <option key={u.username} value={u.username}>
                      🏢 {u.companyName || "회사명 미입력"} ({u.representative || "대표자미상"}) - 작성 보고서: {userReportCount}건 [{u.status}]
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              선택 회원 실시간 대시보드 : <strong className="text-blue-800 text-base">{selectedUser.companyName || "회사명 미상"}</strong> ({selectedUser.username})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">※ 아래 테이블 행 클릭 또는 상단 회사 드롭다운으로 회원을 변경할 수 있습니다.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-10 gap-3">
            
            {/* 1. 회사명 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">① 회사명</div>
              <div className="text-xs font-extrabold text-slate-900 truncate" title={selectedUser.companyName}>
                {selectedUser.companyName || "-"}
              </div>
            </div>

            {/* 2. 대표자명 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">② 대표자명</div>
              <div className="text-xs font-extrabold text-slate-800">
                {selectedUser.representative || "-"}
              </div>
            </div>

            {/* 3. 회원등급 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">③ 회원등급</div>
              <div className="inline-flex">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  selectedUser.status === "정회원" ? "bg-green-100 text-green-800 border border-green-200" :
                  selectedUser.status === "정회원 승인대기" ? "bg-red-100 text-red-800 border border-red-200 animate-pulse" :
                  "bg-blue-100 text-blue-800 border border-blue-200"
                }`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>

            {/* 4. 남은 무료 작성횟수 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">④ 남은 무료 작성</div>
              <div className="text-xs font-extrabold text-blue-600 font-mono">
                {selectedUser.status === "정회원" ? "무제한" : `${Math.max(0, (selectedUser.allowedReportsCount || 5) - selectedUser.reportsCreatedCount)}회`}
              </div>
            </div>

            {/* 5. 이번달 작성건수 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">⑤ 이번달 작성건수</div>
              <div className="text-xs font-extrabold text-slate-800 font-mono">
                {getThisMonthReportsCount(selectedUser)}건
              </div>
            </div>

            {/* 6. 전체 작성건수 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">⑥ 전체 작성건수</div>
              <div className="text-xs font-extrabold text-slate-800 font-mono">
                {selectedUser.reportsCreatedCount || 0}건
              </div>
            </div>

            {/* 7. 사용권한 상태 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">⑦ 사용권한 상태</div>
              <div className="inline-flex">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  selectedUser.activeStatus === "정지" 
                    ? "bg-red-500/10 text-red-700 border border-red-500/20" 
                    : "bg-green-500/10 text-green-700 border border-green-500/20"
                }`}>
                  {selectedUser.activeStatus || "정상"}
                </span>
              </div>
            </div>

            {/* 8. 가입일 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">⑧ 가입일</div>
              <div className="text-xs font-semibold text-slate-700 truncate" title={selectedUser.createdAt}>
                {selectedUser.createdAt || "-"}
              </div>
            </div>

            {/* 9. 최근 로그인일 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">⑨ 최근 로그인일</div>
              <div className="text-[10px] font-semibold text-slate-700 truncate" title={selectedUser.lastLoginAt}>
                {selectedUser.lastLoginAt || "-"}
              </div>
            </div>

            {/* 10. 가입 플랜 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-colors">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">⑩ 가입 플랜</div>
              <div className="inline-flex mt-1">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  selectedUser.plan === "프레스티지" ? "bg-blue-600 text-white border border-blue-600" :
                  selectedUser.plan === "플렉스 라이트" ? "bg-emerald-600 text-white border border-emerald-600" :
                  "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {selectedUser.plan || "체험"}
                </span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold rounded-xl p-4 text-center mb-8">
          등록된 사용자가 존재하지 않습니다. 먼저 회원을 가입시켜주세요.
        </div>
      )}

      {/* Dashboard Mode Selector Tab Panel */}
      <div className="flex flex-wrap border-b border-slate-200 mb-8 gap-2 sm:gap-6 text-sm font-bold">
        <button
          onClick={() => setDashboardMode("MEMBERS")}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            dashboardMode === "MEMBERS" ? "border-blue-600 text-blue-600 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-700" />
          회원사 개별 관리
        </button>

        <button
          onClick={() => setDashboardMode("REPORTS_ALL")}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            dashboardMode === "REPORTS_ALL" ? "border-blue-600 text-blue-600 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          전체 회원 보고서 종합 센터 ({reports.length}건)
        </button>

        <button
          onClick={() => setDashboardMode("LOGIN_LOGS")}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            dashboardMode === "LOGIN_LOGS" ? "border-blue-600 text-blue-600 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4 text-purple-600" />
          회원 로그인/접속 이력 대장 ({loginLogs.length}건)
        </button>

        <button
          onClick={() => setDashboardMode("NOTICES")}
          className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            dashboardMode === "NOTICES" ? "border-blue-600 text-blue-600 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-500" />
          공지사항 관리 ({notices.length}건)
        </button>
      </div>

      {dashboardMode === "MEMBERS" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT GRID: Excel-like Users List (5 cols) ================= */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-800" />
              <h2 className="text-base font-extrabold text-slate-900">엑셀 회원 관리 대장 (실시간 DB 연계)</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-1.5 bg-emerald-650 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                title="회원 정보를 엑셀(CSV) 파일로 다운로드합니다"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                엑셀 다운로드
              </button>
              <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1.5 rounded-xl">
                총 {filteredUsers.length}개사
              </div>
            </div>
          </div>

          {/* User Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="회원 아이디, 회사명, 또는 대표자명으로 빠른 검색..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium"
            />
          </div>

          {/* Excel spreadsheet-like Grid Table */}
          <div className="overflow-x-auto border border-blue-200 rounded-xl shadow-inner max-h-[500px]">
            <table className="w-full text-left border-collapse min-w-[750px] text-xs font-mono">
              <thead>
                <tr className="bg-blue-50/80 text-blue-900 border-b border-blue-200">
                  <th className="p-2 border-r border-blue-200 font-extrabold text-center w-20">아이디</th>
                  <th className="p-2 border-r border-blue-200 font-extrabold">회사명</th>
                  <th className="p-2 border-r border-blue-200 font-extrabold text-center w-16">대표자</th>
                  <th className="p-2 border-r border-blue-200 font-extrabold text-center w-20">회원등급</th>
                  <th className="p-2 border-r border-blue-200 font-extrabold text-center w-20">가입플랜</th>
                  <th className="p-2 border-r border-blue-200 font-extrabold text-center w-16">한도/건수</th>
                  <th className="p-2 border-r border-blue-200 font-extrabold text-center w-16">권한상태</th>
                  <th className="p-2 font-extrabold text-center w-36">간편설정</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUser?.username === u.username;
                    return (
                      <tr 
                        key={u.username}
                        onClick={() => setSelectedUser(u)}
                        className={`border-b border-slate-150 cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/70 hover:bg-blue-50" : "hover:bg-slate-50/50"
                        }`}
                      >
                        {/* ID */}
                        <td className="p-2 border-r border-slate-150 text-center font-bold text-slate-600 truncate max-w-[90px]" title={u.username}>
                          {u.username}
                        </td>
                        
                        {/* 회사명 */}
                        <td className="p-2 border-r border-slate-150 font-semibold text-slate-900 truncate max-w-[120px]" title={u.companyName}>
                          {u.companyName || "(미입력)"}
                        </td>

                        {/* 대표자 */}
                        <td className="p-2 border-r border-slate-150 text-center font-medium text-slate-800">
                          {u.representative || "-"}
                        </td>

                        {/* 회원등급 */}
                        <td className="p-2 border-r border-slate-150 text-center">
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            u.status === "정회원" ? "bg-green-100 text-green-800" :
                            u.status === "정회원 승인대기" ? "bg-red-100 text-red-800 animate-pulse" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {u.status}
                          </span>
                        </td>

                        {/* 가입플랜 */}
                        <td className="p-2 border-r border-slate-150 text-center">
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                            u.plan === "프레스티지" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            u.plan === "플렉스 라이트" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-slate-50 text-slate-500 border-slate-200"
                          }`}>
                            {u.plan || "체험"}
                          </span>
                        </td>

                        {/* 한도 / 건수 */}
                        <td className="p-2 border-r border-slate-150 text-center font-mono font-bold text-slate-700">
                          {(() => {
                            if (u.status === "정회원") return "무제한";
                            const uComp = (u.companyName || "").replace(/\s+/g, "").toLowerCase();
                            const uName = (u.username || "").trim().toLowerCase();
                            const actualCount = reports.filter(r => {
                              const rUser = (r.creatorUsername || "").trim().toLowerCase();
                              const rComp = (r.companyName || "").replace(/\s+/g, "").toLowerCase();
                              return (rUser.length > 0 && (rUser === uName || uName.includes(rUser) || rUser.includes(uName))) ||
                                     (uComp.length > 0 && rComp.length > 0 && (rComp === uComp || rComp.includes(uComp) || uComp.includes(rComp)));
                            }).length;
                            const countToShow = Math.max(u.reportsCreatedCount || 0, actualCount);
                            return `${countToShow}/${u.allowedReportsCount || 5}`;
                          })()}
                        </td>

                        {/* 사용권한상태 */}
                        <td className="p-2 border-r border-slate-150 text-center">
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            u.activeStatus === "정지" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}>
                            {u.activeStatus || "정상"}
                          </span>
                        </td>

                        {/* Quick controls */}
                        <td className="p-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-center items-center gap-1">
                              {/* Role Toggle */}
                              <button
                                onClick={() => handleToggleStatus(u)}
                                title={u.status === "정회원" ? "체험회원으로 전환" : "정회원으로 등급 승인"}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[9px] px-1 py-1 rounded border border-slate-300 transition-all active:scale-95 cursor-pointer"
                              >
                                등급변경
                              </button>

                              {/* +5 Attempts (Enabled for 체험회원) */}
                              <button
                                onClick={() => handleAddFiveAttempts(u)}
                                disabled={u.status === "정회원"}
                                title="무료 작성 횟수 +5회 추가 부여"
                                className={`font-extrabold text-[9px] px-1 py-1 rounded border transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-0.5 ${
                                  u.status === "정회원" 
                                    ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed" 
                                    : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                                }`}
                              >
                                <Plus className="w-2.5 h-2.5" />
                                5회추가
                              </button>

                              {/* Active/Suspend Status Toggle */}
                              <button
                                onClick={() => handleToggleActiveStatus(u)}
                                title={u.activeStatus === "정지" ? "정상 사용으로 복구" : "사용 권한 잠금(정지)"}
                                className={`font-extrabold text-[9px] px-1 py-1 rounded border transition-all active:scale-95 cursor-pointer ${
                                  u.activeStatus === "정지"
                                    ? "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                    : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                }`}
                              >
                                {u.activeStatus === "정지" ? "복구" : "정지"}
                              </button>
                            </div>

                            <div className="flex justify-center items-center gap-1 border-t border-slate-100 pt-1">
                              {/* Prestige Plan Button */}
                              <button
                                onClick={() => {
                                  const updated: UserProfile = {
                                    ...u,
                                    status: "정회원",
                                    plan: "프레스티지",
                                    allowedReportsCount: 99999
                                  };
                                  onUpdateUser(updated);
                                  alert(`[${u.companyName}] 회원의 가입 플랜을 '프레스티지 플랜'으로 성공적으로 설정하였습니다.`);
                                }}
                                className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border transition-all active:scale-95 cursor-pointer ${
                                  u.plan === "프레스티지"
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white hover:bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                프레스티지
                              </button>

                              {/* Flex Lite Plan Button */}
                              <button
                                onClick={() => {
                                  const updated: UserProfile = {
                                    ...u,
                                    status: "정회원",
                                    plan: "플렉스 라이트",
                                    allowedReportsCount: 99999
                                  };
                                  onUpdateUser(updated);
                                  alert(`[${u.companyName}] 회원의 가입 플랜을 '플렉스 라이트 플랜'으로 성공적으로 설정하였습니다.`);
                                }}
                                className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border transition-all active:scale-95 cursor-pointer ${
                                  u.plan === "플렉스 라이트"
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                플렉스 라이트
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 bg-slate-50/50">
                      검색 조건에 맞는 회원이 존재하지 않습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-150 rounded-xl p-3 leading-normal space-y-1">
            <p className="font-bold text-slate-700">■ 엑셀 회원대장 이용 요령</p>
            <p>1. 행을 클릭하면 우측 관리 창이 해당 회원의 정보로 전환됩니다.</p>
            <p>2. <strong>등급변경:</strong> '체험회원', '정회원 승인대기' 상태의 회원을 정회원으로 일괄 등급 전환 수락합니다.</p>
            <p>3. <strong>5회추가:</strong> 체험 사용 한도(기본 5회)가 끝났을 때 5회 추가 작성 권한을 임시 수혈합니다.</p>
            <p>4. <strong>정지/복구:</strong> 회비 미납 등의 회원을 사용 정지하여 일체 보고서 신규 작성을 정지 통제합니다.</p>
          </div>
        </div>


        {/* ================= RIGHT GRID: Selected User Context Control Panel (7 cols) ================= */}
        <div className="lg:col-span-6 space-y-6">
          
          {selectedUser ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5">
              
              {/* Cockpit Menu Buttons Header */}
              <div className="border-b border-slate-100 pb-3">
                <div className="text-[10px] text-blue-600 font-extrabold mb-1">SELECTED MEMBER ACTIONS</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">
                  [{selectedUser.companyName}] 회원 관리 조작 메뉴
                </div>
              </div>

              {/* Operations Menu Tab Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setActiveTab("REPORTS")}
                  className={`py-2 px-1 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer flex flex-col justify-center items-center gap-1 text-center border ${
                    activeTab === "REPORTS"
                      ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  보고서 결과
                </button>

                <button
                  onClick={() => setActiveTab("LOGIN_HISTORY")}
                  className={`py-2 px-1 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer flex flex-col justify-center items-center gap-1 text-center border ${
                    activeTab === "LOGIN_HISTORY"
                      ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/10"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  접속 이력
                </button>

                <button
                  onClick={() => setActiveTab("EDIT_PROFILE")}
                  className={`py-2 px-1 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer flex flex-col justify-center items-center gap-1 text-center border ${
                    activeTab === "EDIT_PROFILE"
                      ? "bg-blue-600 border-blue-500 text-white shadow-md"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  회사정보 수정
                </button>

                <button
                  onClick={() => setActiveTab("CHANGE_PASSWORD")}
                  className={`py-2 px-1 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer flex flex-col justify-center items-center gap-1 text-center border ${
                    activeTab === "CHANGE_PASSWORD"
                      ? "bg-blue-600 border-blue-500 text-white shadow-md"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  비밀번호 변경
                </button>
              </div>

              {/* ================= TAB CONTENT 1: User's Safety Reports List ================= */}
              {activeTab === "REPORTS" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 rounded-full bg-blue-800"></span>
                      회원 등록 점검 보고서 명세
                    </div>
                    
                    {/* Report Search Input */}
                    <input
                      type="text"
                      placeholder="보고서명, 발주처 빠른 검색..."
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="text-[10px] px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-full sm:w-48 text-slate-700 font-medium"
                    />
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <div 
                          key={report.id}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all hover:bg-slate-100/50 flex flex-col justify-between gap-3 shadow-sm"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2 py-0.5 rounded font-mono">
                                {report.checkDegree || "1차 정기"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(report.updatedAt || Date.now()).toLocaleDateString("ko-KR")}
                              </span>
                            </div>
                            <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                              {report.projectName || "(제목 없음)"}
                            </h3>
                            <p className="text-[10.5px] text-slate-500 mt-1">
                              발주: {report.client || "-"} | 시공: {report.contractor || "-"}
                            </p>
                          </div>

                          {/* Action Buttons for Report (Quick Modal View, Full View, Word, Print, Copy, Delete) */}
                          <div className="grid grid-cols-6 gap-1 border-t border-slate-200/60 pt-2.5">
                            
                            {/* Quick Modal View */}
                            <button
                              onClick={() => setPreviewModalReport(report)}
                              className="py-1.5 px-1 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer shadow-sm"
                              title="관리자 모달창에서 보고서 상세 내용 즉시 확인"
                            >
                              <Eye className="w-3.5 h-3.5 text-white" />
                              상세 내용
                            </button>

                            {/* Full Screen View */}
                            <button
                              onClick={() => onViewReport(report)}
                              className="py-1.5 px-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
                              title="전체 화면 보고서 뷰어로 전환"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-700" />
                              전체화면
                            </button>

                            {/* Word Download */}
                            <button
                              onClick={() => triggerDirectWordDownload(report)}
                              className="py-1.5 px-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer border border-blue-100"
                              title="한글(MS Word 호환) 문서 다운로드"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-600" />
                              한글다운
                            </button>

                            {/* Print */}
                            <button
                              onClick={() => {
                                onViewReport(report);
                                setTimeout(() => window.print(), 800);
                              }}
                              className="py-1.5 px-1 bg-violet-50 hover:bg-violet-100 text-violet-800 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer border border-violet-100"
                              title="보고서 인쇄/출력"
                            >
                              <Printer className="w-3.5 h-3.5 text-violet-600" />
                              프린트
                            </button>

                            {/* Copy */}
                            <button
                              onClick={() => handleCopyReport(report)}
                              className="py-1.5 px-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer border border-emerald-100"
                              title="보고서 똑같이 복사하기"
                            >
                              <Copy className="w-3.5 h-3.5 text-emerald-600" />
                              복사
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (report.id && window.confirm(`[${report.projectName}] 보고서를 정말로 삭제하시겠습니까?`)) {
                                  onDeleteReport(report.id);
                                }
                              }}
                              className="py-1.5 px-1 bg-red-50 hover:bg-red-100 text-red-700 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 border border-red-100 transition-colors cursor-pointer"
                              title="보고서 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              삭제
                            </button>

                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs font-semibold bg-slate-50/50">
                        작성한 보고서가 존재하지 않습니다.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB CONTENT 2: User's Login History ================= */}
              {activeTab === "LOGIN_HISTORY" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-3 rounded-full bg-purple-600"></span>
                      [{selectedUser.companyName}] 로그인 / 접속 이력
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      총 {loginLogs.filter(l => l.username === selectedUser.username).length}회 접속 시도
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {loginLogs.filter(l => l.username === selectedUser.username).length > 0 ? (
                      loginLogs
                        .filter(l => l.username === selectedUser.username)
                        .map((log) => (
                          <div 
                            key={log.id} 
                            className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:bg-white hover:border-purple-200 transition-all text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                  log.status === "성공" 
                                    ? "bg-green-100 text-green-800 border border-green-200" 
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}>
                                  {log.status}
                                </span>
                                <span className="font-mono text-[11px] font-bold text-slate-800">
                                  {log.loginAt}
                                </span>
                              </div>
                              <div className="text-[10.5px] text-slate-500 flex items-center gap-3">
                                <span>🌐 IP: {log.ipAddress || "-"}</span>
                                <span>💻 기기: {log.device || "-"}</span>
                              </div>
                            </div>
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                          </div>
                        ))
                    ) : (
                      <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs font-semibold bg-slate-50">
                        기록된 로그인 접속 이력이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB CONTENT 3: Edit User Company Profile ================= */}
              {activeTab === "EDIT_PROFILE" && (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">회사명</label>
                      <input
                        type="text"
                        value={editForm.companyName}
                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">대표자명</label>
                      <input
                        type="text"
                        value={editForm.representative}
                        onChange={(e) => setEditForm({ ...editForm, representative: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">사업자등록번호</label>
                      <input
                        type="text"
                        value={editForm.businessNumber}
                        onChange={(e) => setEditForm({ ...editForm, businessNumber: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">대표 연락처</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-500 mb-1">회사 소재지</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-500 mb-1">이메일 주소</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">회원 등급 상태</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as MemberStatus })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      >
                        <option value="체험회원">체험회원</option>
                        <option value="정회원 승인대기">정회원 승인대기</option>
                        <option value="정회원">정회원</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">구독 가입 플랜</label>
                      <select
                        value={editForm.plan || "체험"}
                        onChange={(e) => {
                          const p = e.target.value;
                          setEditForm({
                            ...editForm,
                            plan: p,
                            status: (p === "프레스티지" || p === "플렉스 라이트") ? "정회원" : editForm.status,
                            allowedReportsCount: (p === "프레스티지" || p === "플렉스 라이트") ? 99999 : editForm.allowedReportsCount
                          });
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold text-blue-700"
                      >
                        <option value="체험" className="text-slate-800 font-medium">체험회원 (Trial)</option>
                        <option value="프레스티지" className="text-blue-800 font-bold">프레스티지 플랜 (Prestige Plan)</option>
                        <option value="플렉스 라이트" className="text-emerald-800 font-bold">플렉스 라이트 플랜 (Flex Lite Plan)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">무료 작성 허용 한도</label>
                      <input
                        type="number"
                        value={editForm.allowedReportsCount}
                        onChange={(e) => setEditForm({ ...editForm, allowedReportsCount: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                        min={0}
                        required
                      />
                    </div>

                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      ⑥ 회사정보 변경사항 저장
                    </button>
                  </div>
                </form>
              )}

              {/* ================= TAB CONTENT 4: Change User Password ================= */}
              {activeTab === "CHANGE_PASSWORD" && (
                <form onSubmit={handleSavePassword} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">새 비밀번호 입력</label>
                      <input
                        type="password"
                        placeholder="새 비밀번호를 설정하세요"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">비밀번호 확인</label>
                      <input
                        type="password"
                        placeholder="새 비밀번호를 다시 한번 정확히 입력하세요"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      ⑦ 비밀번호 일괄 강제 재설정
                    </button>
                  </div>
                </form>
              )}

            </div>
          ) : (
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm font-semibold">
              좌측 목록에서 관리할 회원을 선택해 주세요.
            </div>
          )}

        </div>

      </div>
      ) : dashboardMode === "REPORTS_ALL" ? (
        /* ================= REPORTS_ALL MODE: Master Report Inspection Center ================= */
        <div className="space-y-6 animate-fade-in text-slate-800">
          
          {/* Header & Stats Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                <FileText className="w-4 h-4" />
                MASTER REPORT INSPECTION CENTER
              </div>
              <h2 className="text-xl font-black tracking-tight">전체 회원사 작성 보고서 종합 열람 및 관리 센터</h2>
              <p className="text-xs text-slate-300">
                플랫폼 내 모든 회원사(기업)가 등록 및 생성한 안전 점검 보고서를 한눈에 조회, 검토 및 관리할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadAllReportsCSV}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                보고서 전체 대장 엑셀(CSV)
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search Query */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="공사명, 회사명, 작성자ID, 발주처, 시공사 검색..."
                  value={globalReportSearch}
                  onChange={(e) => setGlobalReportSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              {/* Company Filter Dropdown */}
              <select
                value={globalCompanyFilter}
                onChange={(e) => setGlobalCompanyFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
              >
                <option value="ALL">🏢 전체 회원사 선택 (전체 {allUsers.length}개 사)</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.companyName}>
                    {u.companyName} ({u.username})
                  </option>
                ))}
              </select>
              {/* View Mode Toggle: Company Group vs Grid */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setReportViewMode("COMPANY_GROUP")}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    reportViewMode === "COMPANY_GROUP" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  🏢 회사별 폴더 모아보기
                </button>

                <button
                  type="button"
                  onClick={() => setReportViewMode("GRID")}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    reportViewMode === "GRID" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  📋 전체 타일 목록
                </button>
              </div>
            </div>

            <span className="text-xs font-extrabold text-slate-600">
              검색결과: <strong className="text-blue-700">{filteredMasterReports.length}</strong>건 / 전체 {reports.length}건
            </span>
          </div>

          {/* Master Report Rendering depending on View Mode */}
          {reportViewMode === "COMPANY_GROUP" ? (
            /* ================= COMPANY GROUP VIEW ================= */
            <div className="space-y-6">
              {companyReportGroups.length > 0 ? (
                companyReportGroups.map((group) => {
                  const isExpanded = expandedCompanies[group.key] !== false; // default expanded
                  return (
                    <div 
                      key={group.key}
                      className="bg-white border border-slate-250 rounded-2xl shadow-sm overflow-hidden transition-all"
                    >
                      {/* Company Header Banner */}
                      <div 
                        onClick={() => setExpandedCompanies(prev => ({ ...prev, [group.key]: !isExpanded }))}
                        className="bg-slate-900 hover:bg-slate-850 text-white p-4 px-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer transition-colors select-none group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/30 group-hover:bg-blue-600/50 border border-blue-400/30 flex items-center justify-center text-blue-400 group-hover:text-blue-300 shrink-0 transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 
                                className="text-base font-extrabold text-white group-hover:text-blue-300 group-hover:underline flex items-center gap-1.5 transition-colors"
                                title="클릭하여 이 회사의 보고서 목록 펼치기/접기"
                              >
                                {group.companyName}
                                <span className="text-xs font-normal text-slate-400 group-hover:text-blue-200">
                                  {isExpanded ? "📂 (열림)" : "📁 (클릭하여 보고서 보기)"}
                                </span>
                              </h3>
                              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                                ID: @{group.username}
                              </span>
                              {group.user && (
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                  group.user.status === "정회원" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                                  group.user.status === "정회원 승인대기" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                                  "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                }`}>
                                  {group.user.status}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              대표자: {group.user?.representative || "-"} | 연락처: {group.user?.phone || group.user?.email || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="bg-blue-500/20 text-blue-300 text-xs font-black px-3 py-1 rounded-full border border-blue-500/30 font-mono">
                            작성 보고서: {group.reports.length}건
                          </span>

                          {group.user && (
                            <button
                              onClick={() => onCreateReportForUser(group.user!)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                              title="이 회원사 명의로 새 안전 보고서 대리 작성"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              대리 작성
                            </button>
                          )}

                          <button
                            onClick={() => setExpandedCompanies(prev => ({ ...prev, [group.key]: !isExpanded }))}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                          >
                            {isExpanded ? "접기 ▲" : `회사 보고서 펼치기 (${group.reports.length}건) ▼`}
                          </button>
                        </div>
                      </div>

                      {/* Company Reports Grid inside Expanded Folder */}
                      {isExpanded && (
                        <div className="p-5 bg-slate-50/50 border-t border-slate-200">
                          {group.reports.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {group.reports.map((report) => (
                                <div
                                  key={report.id}
                                  className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                                      <span className="text-[10px] bg-blue-50 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
                                        {report.checkDegree || "정기점검"}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {new Date(report.updatedAt || Date.now()).toLocaleDateString("ko-KR")}
                                      </span>
                                    </div>

                                    <div>
                                      <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                                        {report.projectName || "(공사명 없음)"}
                                      </h4>
                                      <p className="text-[10.5px] text-slate-500 mt-1">
                                        발주: <strong>{report.client || "-"}</strong> | 시공: <strong>{report.contractor || "-"}</strong>
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-150 text-slate-600 font-mono">
                                      <span>📸 사진: {report.photos?.length || 0}장</span>
                                      <span>📅 점검일: {report.checkDate || "-"}</span>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="grid grid-cols-6 gap-1 border-t border-slate-100 pt-2.5">
                                    <button
                                      onClick={() => setPreviewModalReport(report)}
                                      className="py-1.5 px-1 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer shadow-sm"
                                      title="관리자 모달창에서 보고서 상세 내용 확인"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-white" />
                                      상세내용
                                    </button>

                                    <button
                                      onClick={() => onViewReport(report)}
                                      className="py-1.5 px-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
                                      title="전체 화면 뷰어"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-slate-700" />
                                      전체화면
                                    </button>

                                    <button
                                      onClick={() => triggerDirectWordDownload(report)}
                                      className="py-1.5 px-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 border border-blue-100 transition-colors cursor-pointer"
                                      title="한글(MS Word) 다운로드"
                                    >
                                      <Download className="w-3.5 h-3.5 text-blue-600" />
                                      한글다운
                                    </button>

                                    <button
                                      onClick={() => onViewReport(report)}
                                      className="py-1.5 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
                                      title="인쇄 및 PDF 출력"
                                    >
                                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                                      프린트
                                    </button>

                                    <button
                                      onClick={() => {
                                        const newRep: SafetyReport = {
                                          ...report,
                                          id: `report_${Date.now()}_copy`,
                                          projectName: `${report.projectName} (관리자 복사본)`,
                                          createdAt: Date.now(),
                                          updatedAt: Date.now()
                                        };
                                        onSaveReport(newRep);
                                        alert("보고서가 복사되었습니다.");
                                      }}
                                      className="py-1.5 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 border border-amber-100 transition-colors cursor-pointer"
                                      title="보고서 복사"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-amber-600" />
                                      복사
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (report.id && window.confirm(`[${report.projectName}] 보고서를 정말 삭제하시겠습니까?`)) {
                                          onDeleteReport(report.id);
                                        }
                                      }}
                                      className="py-1.5 px-1 bg-red-50 hover:bg-red-100 text-red-700 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 border border-red-100 transition-colors cursor-pointer"
                                      title="삭제"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                      삭제
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-slate-400 text-xs font-semibold border-2 border-dashed border-slate-200 rounded-xl bg-white">
                              현재 [{group.companyName}] 회원사가 작성한 안전점검 보고서가 없습니다.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-600">등록된 회원사 및 검색 조건에 맞는 회사가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            /* ================= GRID TILE VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMasterReports.length > 0 ? (
              filteredMasterReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-xs font-extrabold text-slate-900 truncate">
                          {report.companyName || "미지정 회사"}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                          @{report.creatorUsername}
                        </span>
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-800 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                        {report.checkDegree || "정기점검"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                        {report.projectName || "(공사명 없음)"}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        발주: <strong>{report.client || "-"}</strong> | 시공: <strong>{report.contractor || "-"}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-slate-600">
                      <span>📸 사진대지: <strong className="text-blue-700">{report.photos?.length || 0}장</strong></span>
                      <span>📅 점검일: <strong className="text-slate-800">{report.checkDate || "-"}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-6 gap-1 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => setPreviewModalReport(report)}
                      className="py-1.5 px-1 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer shadow-sm"
                      title="관리자 모달창에서 보고서 상세 내용 확인"
                    >
                      <Eye className="w-3.5 h-3.5 text-white" />
                      상세내용
                    </button>

                    <button
                      onClick={() => onViewReport(report)}
                      className="py-1.5 px-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
                      title="전체 화면 뷰어"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-700" />
                      전체화면
                    </button>

                    <button
                      onClick={() => triggerDirectWordDownload(report)}
                      className="py-1.5 px-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 border border-blue-100 transition-colors cursor-pointer"
                      title="한글(MS Word) 다운로드"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      한글다운
                    </button>

                    <button
                      onClick={() => onViewReport(report)}
                      className="py-1.5 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
                      title="인쇄 및 PDF 출력"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      프린트
                    </button>

                    <button
                      onClick={() => {
                        const newRep: SafetyReport = {
                          ...report,
                          id: `report_${Date.now()}_copy`,
                          projectName: `${report.projectName} (관리자 복사본)`,
                          createdAt: Date.now(),
                          updatedAt: Date.now()
                        };
                        onSaveReport(newRep);
                        alert("보고서가 복사되었습니다.");
                      }}
                      className="py-1.5 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 border border-amber-100 transition-colors cursor-pointer"
                      title="보고서 복사"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-600" />
                      복사
                    </button>

                    <button
                      onClick={() => {
                        if (report.id && window.confirm(`[${report.projectName}] 보고서를 정말 삭제하시겠습니까?`)) {
                          onDeleteReport(report.id);
                        }
                      }}
                      className="py-1.5 px-1 bg-red-50 hover:bg-red-100 text-red-700 text-[9px] font-extrabold rounded-lg flex flex-col items-center gap-0.5 border border-red-100 transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      삭제
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-extrabold text-slate-600">조건에 일치하는 보고서가 없습니다.</p>
                <p className="text-xs text-slate-400">검색어나 선택한 회원사를 변경해 보세요.</p>
              </div>
            )}
          </div>
          )}

        </div>
      ) : dashboardMode === "LOGIN_LOGS" ? (
        /* ================= LOGIN_LOGS MODE: Member Login Audit Log ================= */
        <div className="space-y-6 animate-fade-in text-slate-800">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-extrabold text-xs">
                <History className="w-4 h-4" />
                MEMBER LOGIN AUDIT LOG
              </div>
              <h2 className="text-xl font-black tracking-tight">회원사 로그인 접속 및 사용 이력 대장</h2>
              <p className="text-xs text-slate-300">
                각 회원사(기업)의 시스템 접속 일시, 접속 IP 주소, 이용 환경 및 접속 상태를 종합적으로 추적 모니터링합니다.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadLoginLogsCSV}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                접속 이력 엑셀(CSV) 다운로드
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">총 누적 접속 시도 건수</div>
                <div className="text-xl font-black text-slate-900">{loginLogs.length}건</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">정상 접속 성공 시도</div>
                <div className="text-xl font-black text-green-700">
                  {loginLogs.filter(l => l.status === "성공").length}건
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">비밀번호 오류 / 실패 기록</div>
                <div className="text-xl font-black text-red-600">
                  {loginLogs.filter(l => l.status !== "성공").length}건
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="회원 아이디, 회사명, 대표자, IP 주소 검색..."
                  value={loginLogSearch}
                  onChange={(e) => setLoginLogSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-purple-500 text-slate-900"
                />
              </div>

              <select
                value={loginLogStatusFilter}
                onChange={(e) => setLoginLogStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
              >
                <option value="ALL">전체 접속 상태</option>
                <option value="성공">로그인 성공</option>
                <option value="비밀번호 오류">비밀번호 오류</option>
                <option value="계정 잠김">계정 잠김</option>
              </select>
            </div>

            <button
              onClick={() => onRefreshLoginLogs && onRefreshLoginLogs()}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-purple-700 font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              새로고침
            </button>
          </div>

          {/* Audit Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold text-[11px]">
                    <th className="p-3 pl-4">접속 일시</th>
                    <th className="p-3">회원 아이디</th>
                    <th className="p-3">회사명</th>
                    <th className="p-3">대표자</th>
                    <th className="p-3 text-center">접속 상태</th>
                    <th className="p-3">IP 주소 / 위치</th>
                    <th className="p-3 pr-4">접속 환경 / 기기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredLoginLogs.length > 0 ? (
                    filteredLoginLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-purple-50/40 transition-colors">
                        <td className="p-3 pl-4 font-mono font-bold text-slate-900">
                          {log.loginAt}
                        </td>
                        <td className="p-3 font-mono font-bold text-purple-700">
                          @{log.username}
                        </td>
                        <td className="p-3 font-extrabold text-slate-900">
                          {log.companyName || "-"}
                        </td>
                        <td className="p-3 text-slate-600">
                          {log.representative || "-"}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-block ${
                            log.status === "성공"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">
                          {log.ipAddress || "-"}
                        </td>
                        <td className="p-3 pr-4 text-slate-500 text-[11px]">
                          {log.device || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400 font-semibold bg-slate-50">
                        조건에 적합한 로그인 이력이 존재하지 않습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-slate-800">
          {/* ================= LEFT GRID: Notices List ================= */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-800" />
                <h2 className="text-base font-extrabold text-slate-900">공지사항 목록</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedNotice(null);
                  setNoticeTag("공지사항");
                  setNoticeTitle("");
                  setNoticeDate(new Date().toISOString().split('T')[0]);
                  setNoticeContent("");
                }}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                공지 추가
              </button>
            </div>

            {/* Notice Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="공지 제목 또는 내용 검색..."
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850"
              />
            </div>

            {/* List of Notices */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {notices
                .filter(n => 
                  n.title.toLowerCase().includes(noticeSearch.toLowerCase()) || 
                  n.content.toLowerCase().includes(noticeSearch.toLowerCase()) ||
                  n.tag.toLowerCase().includes(noticeSearch.toLowerCase())
                )
                .map((n) => {
                  const isSelected = selectedNotice?.id === n.id;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setSelectedNotice(n);
                        setNoticeTag(n.tag);
                        setNoticeTitle(n.title);
                        setNoticeDate(n.date);
                        setNoticeContent(n.content);
                      }}
                      className={`group border rounded-xl p-3.5 transition-all cursor-pointer text-left relative ${
                        isSelected 
                          ? "bg-blue-50/70 border-blue-400 shadow-sm" 
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-slate-100 text-slate-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-slate-200">
                          {n.tag}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">{n.date}</span>
                      </div>
                      <h4 className={`text-xs font-extrabold truncate pr-8 ${isSelected ? "text-blue-950" : "text-slate-800"}`}>
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-medium leading-relaxed">
                        {n.content}
                      </p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
                            onDeleteNotice(n.id);
                            if (selectedNotice?.id === n.id) {
                              setSelectedNotice(null);
                              setNoticeTitle("");
                              setNoticeContent("");
                            }
                          }
                        }}
                        className="absolute right-3 top-3.5 p-1 text-slate-300 hover:text-red-500 rounded transition-colors cursor-pointer"
                        title="공지사항 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              {notices.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                  등록된 공지사항이 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT GRID: Notice Editor Form ================= */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="border-b border-slate-100 pb-3 mb-5 text-left">
              <span className="text-[10px] text-blue-600 font-extrabold tracking-widest uppercase">
                {selectedNotice ? "MODIFY ANNOUNCEMENT" : "NEW ANNOUNCEMENT"}
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                {selectedNotice ? "공지사항 수정 및 상세 관리" : "새 공지사항 등록 및 배포"}
              </h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!noticeTitle.trim() || !noticeContent.trim()) {
                  alert("제목과 내용을 모두 기입해 주세요.");
                  return;
                }
                const noticeObj: NoticeItem = {
                  id: selectedNotice?.id || String(Date.now()),
                  tag: noticeTag,
                  title: noticeTitle.trim(),
                  date: noticeDate,
                  content: noticeContent.trim(),
                  createdAt: selectedNotice?.createdAt || Date.now()
                };
                onSaveNotice(noticeObj);
                
                // Keep selected or reset
                setSelectedNotice(null);
                setNoticeTag("공지사항");
                setNoticeTitle("");
                setNoticeDate(new Date().toISOString().split('T')[0]);
                setNoticeContent("");
              }}
              className="space-y-4 text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Notice Tag */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">공지 분류 (태그)</label>
                  <select
                    value={noticeTag}
                    onChange={(e) => setNoticeTag(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="공지사항">공지사항</option>
                    <option value="기능 업데이트">기능 업데이트</option>
                    <option value="세무 가이드">세무 가이드</option>
                    <option value="안전 행정">안전 행정</option>
                    <option value="서비스 안내">서비스 안내</option>
                  </select>
                </div>

                {/* Notice Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">게시 날짜</label>
                  <input
                    type="date"
                    value={noticeDate}
                    onChange={(e) => setNoticeDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Notice Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">공지 제목</label>
                <input
                  type="text"
                  placeholder="공지사항 제목을 정밀하게 입력하세요"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Notice Content */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">공지 세부 내용</label>
                <textarea
                  placeholder="공지할 구체적인 내용 및 상세 설명을 서식에 맞추어 작성해 주세요."
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  rows={12}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 whitespace-pre-line"
                  required
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  {selectedNotice && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNotice(null);
                        setNoticeTag("공지사항");
                        setNoticeTitle("");
                        setNoticeDate(new Date().toISOString().split('T')[0]);
                        setNoticeContent("");
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition-colors"
                    >
                      새 공지 작성으로 전환
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold py-2 px-6 rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                >
                  {selectedNotice ? "공지사항 수정 완료" : "공지사항 즉시 등록배포"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= QUICK REPORT DETAIL OVERLAY MODAL ================= */}
      {previewModalReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded font-mono">
                    {previewModalReport.checkDegree || "1차 정기점검"}
                  </span>
                  <span className="text-xs text-blue-300 font-bold truncate">
                    🏢 {previewModalReport.companyName || selectedUser?.companyName || "회원사"} 작성 보고서
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold truncate text-white">
                  {previewModalReport.projectName || "건설안전 점검보고서"}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => triggerDirectWordDownload(previewModalReport)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="한글(MS Word) 파일로 다운로드"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">한글다운</span>
                </button>

                <button
                  onClick={() => {
                    onViewReport(previewModalReport);
                    setPreviewModalReport(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="전체 화면 뷰어 모드로 열기"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">전체화면</span>
                </button>

                <button
                  onClick={() => setPreviewModalReport(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-all cursor-pointer"
                  title="모달 닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="p-6 space-y-6 overflow-y-auto text-slate-800 text-xs leading-relaxed bg-slate-50/50">
              
              {/* 1. Basic Info Summary Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-blue-600" />
                  1. 현장 개요 및 기본 정보
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-bold block">공사명</span>
                    <strong className="text-slate-900 font-extrabold">{previewModalReport.projectName || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">발주처 / 시공사</span>
                    <strong className="text-slate-800 font-bold">{previewModalReport.client || "-"} / {previewModalReport.contractor || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">점검 일시</span>
                    <strong className="text-slate-800 font-bold">{previewModalReport.auditDate || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">점검자 / 책임기술자</span>
                    <strong className="text-slate-800 font-bold">{previewModalReport.inspector || "-"} / {previewModalReport.leadEngineer || "-"}</strong>
                  </div>
                </div>
              </div>

              {/* 2. Overview & Findings */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  2. 점검 개요 및 시공 현황 총평
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-slate-600 text-[11px]">[점검 개요]</span>
                    <p className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl mt-1 text-slate-700 whitespace-pre-line">
                      {previewModalReport.auditOverview || "건설공사 안전관리 업무수행 지침에 의거하여 정기점검을 정밀하게 실시하였습니다."}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 text-[11px]">[시공 진행 및 총평]</span>
                    <p className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl mt-1 text-slate-700 whitespace-pre-line">
                      {previewModalReport.constructionStatus || "설계 도면 및 승인된 가설 구조 계산서에 부합하도록 시공이 수행되고 있습니다."}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Safety Checklist */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  3. 부위별 점검 항목 체크리스트
                </h3>
                {previewModalReport.checklist && previewModalReport.checklist.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                          <th className="p-2 text-center w-10">No</th>
                          <th className="p-2">점검 공종</th>
                          <th className="p-2">세부 항목</th>
                          <th className="p-2 text-center w-20">결과</th>
                          <th className="p-2">조치 및 건의사항</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 font-medium">
                        {previewModalReport.checklist.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900">{item.category}</td>
                            <td className="p-2 text-slate-700">{item.item}</td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                item.result === "양호" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {item.result}
                              </span>
                            </td>
                            <td className="p-2 text-slate-600">{item.action || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                    등록된 부위별 체크리스트 항목이 없습니다.
                  </div>
                )}
              </div>

              {/* 4. AI Photo Attachments with 2-Depth Category tags */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    4. 현장 점검 실시간 AI 사진대지 명세 ({previewModalReport.photos?.length || 0}장)
                  </h3>
                </div>

                {previewModalReport.photos && previewModalReport.photos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {previewModalReport.photos.map((photo, idx) => {
                      const mainCat = photo.mainCategory || (photo.category ? photo.category.split(" - ")[0] : "현장사진");
                      const subCat = photo.subCategory || (photo.category && photo.category.includes(" - ") ? photo.category.split(" - ")[1] : "");

                      return (
                        <div key={photo.id || idx} className="border border-slate-200 rounded-2xl p-3 bg-slate-50/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded font-mono">
                              [사진 {idx + 1}] 태그: {mainCat}{subCat ? ` > ${subCat}` : ""}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              photo.status === "양호" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              판정: {photo.status || "양호"}
                            </span>
                          </div>

                          {photo.url ? (
                            <img 
                              src={photo.url} 
                              alt={photo.caption || "점검사진"} 
                              className="w-full h-44 object-cover rounded-xl border border-slate-200 bg-white" 
                            />
                          ) : (
                            <div className="w-full h-32 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                              이미지 데이터 없음
                            </div>
                          )}

                          <div className="space-y-1 text-[10.5px]">
                            <div className="font-extrabold text-slate-900">{photo.caption || photo.name}</div>
                            {photo.location && <div className="text-slate-600">📍 위치: {photo.location}</div>}
                            {photo.importantContent && <div className="text-slate-600">💡 중요내용: {photo.importantContent}</div>}
                            {photo.findings && <div className="text-blue-800 font-medium">🔍 AI분석: {photo.findings}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                    등록된 점검 사진이 없습니다.
                  </div>
                )}
              </div>

              {/* 5. Final Comprehensive Opinion */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  5. 종합 결론 및 책임기술자 최종 서명
                </h3>
                <div className="space-y-2 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-700">[종합 결론]</span>
                    <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 mt-1">
                      {previewModalReport.comprehensiveConclusion || "종합 검토 결과 현장의 전반적인 구조 안정성 및 안전관리 상태가 표준 기준을 충족합니다."}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">[안전 개선 건의 대책]</span>
                    <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 mt-1">
                      {previewModalReport.improvementMeasures || "작업 발판 난간 고정태 보완 및 현장 배수로 상시 정리 정돈을 권고합니다."}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">[책임기술자 의견]</span>
                    <p className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-200 text-blue-950 font-medium mt-1">
                      {previewModalReport.leadEngineerOpinion || "본 책임기술인은 현장의 안전 상태가 관련 법령 기준을 견고히 충족함을 확인합니다."}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-medium">
                관리자 전용 보고서 실시간 열람 창 (작성자: {previewModalReport.creatorUsername || selectedUser?.username})
              </span>
              <button
                onClick={() => setPreviewModalReport(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
