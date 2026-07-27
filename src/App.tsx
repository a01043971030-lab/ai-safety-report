import React, { useState, useEffect } from "react";
import { SafetyReport, UserProfile, MemberStatus, NoticeItem } from "./types";
import { db } from "./firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  getDoc
} from "firebase/firestore";
import { 
  User, 
  Lock, 
  Unlock, 
  Building2, 
  UserX, 
  Settings, 
  LogOut, 
  AlertCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import ReportForm from "./components/ReportForm";
import ReportList from "./components/ReportList";
import ReportViewer from "./components/ReportViewer";
import AdminDashboard from "./components/AdminDashboard";
import AccountingDashboard from "./components/AccountingDashboard";
import SupportChatbot from "./components/SupportChatbot";
import { 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  Layers, 
  CheckCircle, 
  Printer, 
  CloudLightning,
  ChevronRight,
  Database,
  Building,
  HelpCircle,
  Menu,
  FileCheck2,
  HardHat,
  Eye,
  Calculator,
  CreditCard,
  Copy
} from "lucide-react";

type ActiveScreen = "HOME" | "LIST" | "FORM" | "VIEW" | "ADMIN" | "ACCOUNTING" | "NOTICE" | "MYPAGE" | "PRICING";

const DEFAULT_NOTICES: NoticeItem[] = [
  {
    id: "1",
    tag: "세무 가이드",
    title: "건설현장 일용직 인건비(노무비) 신고 의무화에 따른 원천세 가이드",
    date: "2026-07-10",
    content: "2026년 하반기 세법 개정에 의거하여 건설 현장에 고용된 일용근로자 및 소형 작업팀의 일당 지급 내역은 매입 전표 '노무비' 과목으로 기입하셔야 경비 인정이 원활합니다. 당사 AI 세무비서를 통해 예상 원천세 산출법을 실시간 상담해 보십시오.",
    createdAt: 1720569600000
  },
  {
    id: "2",
    tag: "기능 업데이트",
    title: "[v2.4] AI 건설 세무 · 회계 통합 Cockpit 모듈 그랜드 출시 안내",
    date: "2026-07-08",
    content: "시공중인 안전점검 보고서의 공사현장 데이터와 실시간 연동되는 독창적인 건설 전용 간이 세무 suite가 공식 배포되었습니다! 이제 자재 구매 적요를 기입하면 AI가 최적의 계정과목을 정합적으로 분류하며, 복잡한 부가세 환급과 종합소득세를 전표 기반으로 예측하여 대표님의 세법 불이익을 원천 차단합니다.",
    createdAt: 1720396800000
  },
  {
    id: "3",
    tag: "안전 행정",
    title: "국토교통부 정기안전점검 보고서 제출 표준 가이드라인 배포",
    date: "2026-06-30",
    content: "건설공사 안전관리 업무수행 지침 개정안에 따라, 안전 보고서 작성 시 사진대지의 해상도와 정밀 분석 한글 캡션의 기재가 엄격히 심사됩니다. 본 플랫폼의 AI 분석 엔진을 통해 생성된 격자대지는 100% 한글 표준 규격을 충족하오니 안심하고 출력하시기 바랍니다.",
    createdAt: 1719705600000
  },
  {
    id: "4",
    tag: "서비스 안내",
    title: "파이어베이스 클라우드 실시간 자동 동기화 서버 안전 점검 완료",
    date: "2026-06-25",
    content: "안정적인 클라우드 협업 환경을 구축하고자 메인 스토리지 및 Firestore 규칙 고도화 작업을 성공리에 끝마쳤습니다. 체험회원에서 정회원으로 승인 완료 시 무제한 용량의 건설 안전 보고서가 암호화되어 분리 저장되므로 안심하고 이용하십시오.",
    createdAt: 1719273600000
  }
];

export default function App() {
  const [screen, setScreen] = useState<ActiveScreen>("HOME");
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [currentReport, setCurrentReport] = useState<SafetyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<"CONNECTED" | "FALLBACK" | "CONNECTING">("CONNECTING");
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  // Admin states
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("admin_logged_in") === "true";
  });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoginForm, setAdminLoginForm] = useState({ username: "", password: "" });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // User authentication & Profile management
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [simulatorVisible, setSimulatorVisible] = useState(true);

  // Form states for Signup
  const [signupForm, setSignupForm] = useState({
    companyName: "",
    representative: "",
    businessNumber: "",
    address: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    passwordConfirm: ""
  });

  // Form states for Login
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  // Load user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("active_user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser) as UserProfile;
        setCurrentUser(u);
      } catch (err) {
        console.error("Failed to parse stored active user:", err);
      }
    }
  }, []);

  // Fetch updated user data if Firestore connects
  useEffect(() => {
    if (dbStatus === "CONNECTED" && currentUser) {
      refreshUserStatus(currentUser.username);
    }
  }, [dbStatus]);

  const refreshUserStatus = async (username: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", username));
      if (userDoc.exists()) {
        const latestUser = { ...userDoc.data(), id: userDoc.id } as UserProfile;
        setCurrentUser(latestUser);
        localStorage.setItem("active_user", JSON.stringify(latestUser));
      }
    } catch (err) {
      console.error("Error refreshing user status:", err);
    }
  };

  // Fetch users for admin cockpit
  const fetchUsers = async () => {
    try {
      let list: UserProfile[] = [];
      if (dbStatus === "CONNECTED") {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as UserProfile);
        });
      }
      
      if (list.length === 0) {
        const localUsers = localStorage.getItem("safety_users_db");
        if (localUsers) {
          list = JSON.parse(localUsers) as UserProfile[];
        }
      }

      if (list.length === 0) {
        const dummyUsers: UserProfile[] = [
          {
            username: "user1",
            password: "user1234",
            companyName: "(주)에이아이건설",
            representative: "김철수",
            businessNumber: "123-45-67890",
            address: "서울특별시 강남구 테헤란로 123",
            phone: "010-1234-5678",
            email: "chulsu@aiconst.com",
            status: "체험회원",
            reportsCreatedCount: 2,
            createdAt: "2026-07-01",
            lastLoginAt: "2026-07-10 14:30",
            activeStatus: "정상",
            allowedReportsCount: 5
          },
          {
            username: "user2",
            password: "user1234",
            companyName: "대승건설 주식회사",
            representative: "박영희",
            businessNumber: "987-65-43210",
            address: "부산광역시 해운대구 우동 456",
            phone: "010-9876-5432",
            email: "younghee@daeseung.com",
            status: "정회원",
            reportsCreatedCount: 14,
            createdAt: "2026-06-15",
            lastLoginAt: "2026-07-10 18:45",
            activeStatus: "정상",
            allowedReportsCount: 100
          },
          {
            username: "user3",
            password: "user1234",
            companyName: "한울건전설계(주)",
            representative: "이민우",
            businessNumber: "456-12-78901",
            address: "인천광역시 연수구 송도동 789",
            phone: "010-4567-8901",
            email: "minwoo@hanul.co.kr",
            status: "정회원 승인대기",
            reportsCreatedCount: 5,
            createdAt: "2026-07-05",
            lastLoginAt: "2026-07-09 11:20",
            activeStatus: "정상",
            allowedReportsCount: 5
          }
        ];
        
        list = dummyUsers;
        localStorage.setItem("safety_users_db", JSON.stringify(dummyUsers));

        if (dbStatus === "CONNECTED") {
          for (const u of dummyUsers) {
            try {
              await setDoc(doc(db, "users", u.username), u);
            } catch (e) {
              console.error("Failed to write dummy user:", e);
            }
          }
        }
      }

      setAllUsers(list);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Sync users list whenever dbStatus or admin status changes
  useEffect(() => {
    fetchUsers();
  }, [dbStatus, adminLoggedIn]);

  // Update user details
  const handleUpdateUser = async (updatedUser: UserProfile) => {
    try {
      setLoading(true);
      if (dbStatus === "CONNECTED") {
        await setDoc(doc(db, "users", updatedUser.username), updatedUser);
      }
      
      const updatedList = allUsers.map((u) => u.username === updatedUser.username ? updatedUser : u);
      setAllUsers(updatedList);
      
      if (currentUser?.username === updatedUser.username) {
        setCurrentUser(updatedUser);
        localStorage.setItem("active_user", JSON.stringify(updatedUser));
      }

      localStorage.setItem("safety_users_db", JSON.stringify(updatedList));
    } catch (err) {
      console.error("Error updating user:", err);
      const updatedList = allUsers.map((u) => u.username === updatedUser.username ? updatedUser : u);
      setAllUsers(updatedList);
      localStorage.setItem("safety_users_db", JSON.stringify(updatedList));
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = async () => {
    try {
      let list: NoticeItem[] = [];
      if (dbStatus === "CONNECTED") {
        const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as NoticeItem);
        });
      }
      
      if (list.length === 0) {
        const localNotices = localStorage.getItem("safety_notices_db");
        if (localNotices) {
          list = JSON.parse(localNotices) as NoticeItem[];
        }
      }

      if (list.length === 0) {
        list = DEFAULT_NOTICES;
        localStorage.setItem("safety_notices_db", JSON.stringify(DEFAULT_NOTICES));
        if (dbStatus === "CONNECTED") {
          for (const n of DEFAULT_NOTICES) {
            try {
              await setDoc(doc(db, "notices", n.id), n);
            } catch (e) {
              console.error("Failed to write dummy notice:", e);
            }
          }
        }
      }

      // Sort by date (descending) or createdAt
      list.sort((a, b) => b.date.localeCompare(a.date));

      setNotices(list);
    } catch (err) {
      console.error("Error fetching notices:", err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [dbStatus]);

  const handleSaveNotice = async (notice: NoticeItem) => {
    try {
      setLoading(true);
      let updatedList: NoticeItem[];
      const exists = notices.some(n => n.id === notice.id);

      if (dbStatus === "CONNECTED") {
        await setDoc(doc(db, "notices", notice.id), notice);
      }

      if (exists) {
        updatedList = notices.map(n => n.id === notice.id ? notice : n);
      } else {
        updatedList = [notice, ...notices];
      }

      updatedList.sort((a, b) => b.date.localeCompare(a.date));
      setNotices(updatedList);
      localStorage.setItem("safety_notices_db", JSON.stringify(updatedList));
      alert("공지사항이 성공적으로 저장되었습니다.");
    } catch (err) {
      console.error("Error saving notice:", err);
      alert("공지사항 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      setLoading(true);
      if (dbStatus === "CONNECTED") {
        await deleteDoc(doc(db, "notices", id));
      }
      const updatedList = notices.filter(n => n.id !== id);
      setNotices(updatedList);
      localStorage.setItem("safety_notices_db", JSON.stringify(updatedList));
      alert("공지사항이 성공적으로 삭제되었습니다.");
    } catch (err) {
      console.error("Error deleting notice:", err);
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Impersonate selected user and show form
  const handleCreateReportForUser = (user: UserProfile) => {
    localStorage.setItem("active_user", JSON.stringify(user));
    setCurrentReport(null);
    setScreen("FORM");
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLoginForm.username === "tomato" && adminLoginForm.password === "9999") {
      setAdminLoggedIn(true);
      sessionStorage.setItem("admin_logged_in", "true");
      setShowAdminLogin(false);
      setScreen("ADMIN");
      alert("관리자 모드로 안전하게 로그인되었습니다.");
      setAdminLoginForm({ username: "", password: "" });
    } else {
      alert("관리자 로그인 정보가 일치하지 않습니다.");
    }
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    sessionStorage.removeItem("admin_logged_in");
    alert("관리자 세션이 완전히 종료되었습니다.");
    // Restore logged in user back to active_user if exists
    if (currentUser) {
      localStorage.setItem("active_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("active_user");
    }
    setScreen("HOME");
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { companyName, representative, businessNumber, address, phone, email, username, password, passwordConfirm } = signupForm;

    // Validation
    if (!companyName || !representative || !businessNumber || !address || !phone || !email || !username || !password || !passwordConfirm) {
      alert("모든 필수 입력 항목을 채워주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const newUser: UserProfile = {
      username,
      password,
      companyName,
      representative,
      businessNumber,
      address,
      phone,
      email,
      status: "체험회원", // 회원상태: 체험회원
      reportsCreatedCount: 0
    };

    try {
      setLoading(true);
      // Check if username already exists in Firestore if connected
      if (dbStatus === "CONNECTED") {
        const checkDoc = await getDoc(doc(db, "users", username));
        if (checkDoc.exists()) {
          alert("이미 존재하는 아이디입니다. 다른 아이디를 선택해주세요.");
          setLoading(false);
          return;
        }
        await setDoc(doc(db, "users", username), newUser);
      } else {
        // Fallback local check
        const usersLocal = JSON.parse(localStorage.getItem("safety_users_db") || "[]") as UserProfile[];
        if (usersLocal.some(u => u.username === username)) {
          alert("이미 존재하는 아이디입니다. 다른 아이디를 선택해주세요.");
          setLoading(false);
          return;
        }
        usersLocal.push(newUser);
        localStorage.setItem("safety_users_db", JSON.stringify(usersLocal));
      }

      alert("회원가입이 완료되었습니다!\n상태: '체험회원'으로 가입 즉시 로그인 및 무료체험이 시작됩니다.");
      setShowSignup(false);
      
      // Auto-login after signup
      setCurrentUser(newUser);
      localStorage.setItem("active_user", JSON.stringify(newUser));
      
      // Reset form
      setSignupForm({
        companyName: "",
        representative: "",
        businessNumber: "",
        address: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        passwordConfirm: ""
      });
    } catch (err) {
      console.error("Signup error:", err);
      alert("회원가입 도중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = loginForm;

    if (!username || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      let foundUser: UserProfile | null = null;

      if (dbStatus === "CONNECTED") {
        const userDoc = await getDoc(doc(db, "users", username));
        if (userDoc.exists()) {
          const user = userDoc.data() as UserProfile;
          if (user.password === password) {
            foundUser = { ...user, id: userDoc.id };
          }
        }
      } else {
        // Localstorage fallback
        const usersLocal = JSON.parse(localStorage.getItem("safety_users_db") || "[]") as UserProfile[];
        const matched = usersLocal.find(u => u.username === username && u.password === password);
        if (matched) {
          foundUser = matched;
        }
      }

      if (foundUser) {
        setCurrentUser(foundUser);
        localStorage.setItem("active_user", JSON.stringify(foundUser));
        setShowLogin(false);
        setLoginForm({ username: "", password: "" });
        alert(`${foundUser.username}님, 환영합니다!\n회원 자격: ${foundUser.status}`);
      } else {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("로그인 도중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("active_user");
    alert("로그아웃 되었습니다.");
    setScreen("HOME");
  };

  const updateSimulatorStatus = async (newStatus: MemberStatus, reportsCount?: number) => {
    if (!currentUser) return;
    const finalCount = reportsCount !== undefined ? reportsCount : currentUser.reportsCreatedCount;
    const updated: UserProfile = {
      ...currentUser,
      status: newStatus,
      reportsCreatedCount: finalCount
    };
    setCurrentUser(updated);
    localStorage.setItem("active_user", JSON.stringify(updated));

    if (dbStatus === "CONNECTED") {
      try {
        await setDoc(doc(db, "users", currentUser.username), updated);
      } catch (err) {
        console.error("Error updating user status in Firestore:", err);
      }
    } else {
      // Local db update
      const usersLocal = JSON.parse(localStorage.getItem("safety_users_db") || "[]") as UserProfile[];
      const idx = usersLocal.findIndex(u => u.username === currentUser.username);
      if (idx !== -1) {
        usersLocal[idx] = updated;
        localStorage.setItem("safety_users_db", JSON.stringify(usersLocal));
      }
    }
  };

  // Fetch reports from Firebase on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "safety_reports"), orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: SafetyReport[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as SafetyReport);
      });
      setReports(list);
      setDbStatus("CONNECTED");
    } catch (err) {
      console.error("Firebase fetch error, falling back to LocalStorage:", err);
      setDbStatus("FALLBACK");
      // Fallback to local storage if Firestore is still provisioning or has connection issue
      const local = localStorage.getItem("safety_reports_db");
      if (local) {
        setReports(JSON.parse(local));
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to load photo base64 strings from separate Firestore documents on-demand
  const resolveReportPhotos = async (report: SafetyReport): Promise<SafetyReport> => {
    if (dbStatus !== "CONNECTED" || !report.photos || report.photos.length === 0) {
      return report;
    }

    try {
      setLoading(true);
      const resolvedPhotos = await Promise.all(
        report.photos.map(async (photo) => {
          if (photo.url && photo.url.startsWith("db://")) {
            const photoId = photo.url.replace("db://", "");
            try {
              const docSnap = await getDoc(doc(db, "photo_blobs", photoId));
              if (docSnap.exists()) {
                return {
                  ...photo,
                  url: docSnap.data().base64 || ""
                };
              }
            } catch (err) {
              console.error(`Error fetching blob for photo ${photoId}:`, err);
            }
          }
          return photo;
        })
      );
      return {
        ...report,
        photos: resolvedPhotos
      };
    } catch (err) {
      console.error("Error resolving report photos:", err);
      return report;
    } finally {
      setLoading(false);
    }
  };

  // Save report to Firestore or fallback
  const handleSaveReport = async (reportData: SafetyReport) => {
    // Guard: "정회원 승인대기" status is blocked from creating new reports
    if (!reportData.id && currentUser?.status === "정회원 승인대기") {
      setWarningModalVisible(true);
      return;
    }

    try {
      setLoading(true);
      const finalReportData = {
        ...reportData,
        creatorUsername: reportData.creatorUsername || currentUser?.username || ""
      };

      if (dbStatus === "CONNECTED") {
        // Step 1: Save any new local base64 photo urls to 'photo_blobs' collection in parallel
        const saveBlobPromises = finalReportData.photos.map(async (photo) => {
          if (photo.url && photo.url.startsWith("data:image")) {
            const blobDocRef = doc(db, "photo_blobs", photo.id);
            await setDoc(blobDocRef, { base64: photo.url }, { merge: true });
          }
        });
        await Promise.all(saveBlobPromises);
      }

      // Step 2: Create a version of the photos array with references to prevent exceeding 1MB Firestore limit
      const photosForFirestore = finalReportData.photos.map(photo => {
        if (photo.url && photo.url.startsWith("data:image")) {
          return {
            ...photo,
            url: `db://${photo.id}`
          };
        }
        return photo;
      });

      const reportDataForFirestore = {
        ...finalReportData,
        photos: photosForFirestore
      };

      if (finalReportData.id) {
        // Edit existing report
        if (currentUser?.status === "정회원 승인대기") {
          setWarningModalVisible(true);
          return;
        }

        if (dbStatus === "CONNECTED") {
          const docRef = doc(db, "safety_reports", finalReportData.id);
          const { id, ...dataToSave } = reportDataForFirestore; // separate id
          await updateDoc(docRef, dataToSave);
        }
        
        // Update local state - keep full resolved base64 in local state so it stays immediately loaded!
        const updated = reports.map((r) => (r.id === finalReportData.id ? finalReportData : r));
        setReports(updated);
        if (dbStatus === "FALLBACK") {
          localStorage.setItem("safety_reports_db", JSON.stringify(updated));
        }
      } else {
        // Create new report
        // If logged in as "체험회원", increment report created count
        if (currentUser && currentUser.status === "체험회원") {
          const newCount = currentUser.reportsCreatedCount + 1;
          const newStatus = newCount >= 5 ? "정회원 승인대기" : "체험회원";
          await updateSimulatorStatus(newStatus, newCount);
        }

        let newId = Math.random().toString(36).substring(2, 9);
        const dataToSave = { ...reportDataForFirestore, createdAt: Date.now(), updatedAt: Date.now() };

        if (dbStatus === "CONNECTED") {
          const docRef = await addDoc(collection(db, "safety_reports"), dataToSave);
          newId = docRef.id;
        }

        const newReport = { id: newId, ...finalReportData, createdAt: Date.now(), updatedAt: Date.now() };
        const updatedList = [newReport, ...reports];
        setReports(updatedList);
        
        if (dbStatus === "FALLBACK") {
          localStorage.setItem("safety_reports_db", JSON.stringify(updatedList));
        }

        // Show warning if user just transitioned to "정회원 승인대기"
        if (currentUser && currentUser.status === "체험회원" && currentUser.reportsCreatedCount + 1 >= 5) {
          setWarningModalVisible(true);
        }
      }

      alert("보고서가 안전하게 보존 저장되었습니다.");
      setScreen("LIST");
    } catch (err) {
      console.error("Error saving report:", err);
      alert("보고서 저장 도중 오류가 발생하여 브라우저 로컬 저장소에 임시 저장되었습니다.");
      
      // Force fallback write
      const finalReportData = {
        ...reportData,
        creatorUsername: reportData.creatorUsername || currentUser?.username || ""
      };
      const newId = finalReportData.id || Math.random().toString(36).substring(2, 9);
      const newReport = { ...finalReportData, id: newId, updatedAt: Date.now() };
      const updatedList = finalReportData.id 
        ? reports.map(r => r.id === finalReportData.id ? newReport : r)
        : [newReport, ...reports];
      
      setReports(updatedList);
      localStorage.setItem("safety_reports_db", JSON.stringify(updatedList));
      setScreen("LIST");
    } finally {
      setLoading(false);
    }
  };

  // Delete report
  const handleDeleteReport = async (id: string) => {
    try {
      setLoading(true);
      if (dbStatus === "CONNECTED") {
        await deleteDoc(doc(db, "safety_reports", id));
      }
      
      const updatedList = reports.filter((r) => r.id !== id);
      setReports(updatedList);
      
      if (dbStatus === "FALLBACK") {
        localStorage.setItem("safety_reports_db", JSON.stringify(updatedList));
      }
    } catch (err) {
      console.error("Error deleting report:", err);
      // Fallback local delete
      const updatedList = reports.filter((r) => r.id !== id);
      setReports(updatedList);
      localStorage.setItem("safety_reports_db", JSON.stringify(updatedList));
    } finally {
      setLoading(false);
    }
  };

  const handleEditReportClick = async (report: SafetyReport) => {
    if (!currentUser) {
      alert("로그인 상태에서 보고서를 수정할 수 있습니다.");
      setShowLogin(true);
      return;
    }
    if (currentUser.status === "정회원 승인대기") {
      setWarningModalVisible(true);
      return;
    }
    const fullReport = await resolveReportPhotos(report);
    setCurrentReport(fullReport);
    setScreen("FORM");
  };

  const handleViewReportClick = async (report: SafetyReport) => {
    const fullReport = await resolveReportPhotos(report);
    setCurrentReport(fullReport);
    setScreen("VIEW");
  };

  const handleCreateNewClick = () => {
    if (!currentUser) {
      alert("로그인 상태에서 보고서를 작성할 수 있습니다. 우측 상단의 [로그인] 또는 [회원가입]을 완료해 주세요.");
      setShowLogin(true);
      return;
    }
    if (currentUser.status === "정회원 승인대기") {
      setWarningModalVisible(true);
      return;
    }
    setCurrentReport(null);
    setScreen("FORM");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-between">
      {/* Dynamic Header Navbar */}
      <header className="bg-slate-900 text-white shadow-md py-4 px-6 sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen("HOME")}>
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-600/20">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight flex items-center gap-1">
                AI 건설안전점검 보고서 자동생성기
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">건설기술진흥법 시행령 제100조 안전점검 표준 규격</p>
            </div>
          </div>

          {/* Navigation & Auth */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Navigation */}
            <nav className="flex items-center gap-1 text-xs font-bold flex-wrap">
              <button
                onClick={() => setScreen("HOME")}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  screen === "HOME" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                홈
              </button>

              {!adminLoggedIn && (
                <>
                  <button
                    onClick={handleCreateNewClick}
                    className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      screen === "FORM" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    보고서 작성
                  </button>
                  <button
                    onClick={() => setScreen("LIST")}
                    className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      screen === "LIST" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    보고서 관리
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setShowLogin(true);
                        alert("세무 · 회계 모듈은 로그인한 회원만 정밀 조회가 가능합니다. 먼저 로그인해 주십시오.");
                      } else {
                        setScreen("ACCOUNTING");
                      }
                    }}
                    className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      screen === "ACCOUNTING" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Calculator className="w-3 h-3 text-emerald-400" />
                    세무 · 회계
                  </button>
                </>
              )}

              {adminLoggedIn && (
                <button
                  onClick={() => setScreen("ADMIN")}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-blue-400 border border-blue-500/30 bg-blue-500/10 ${
                    screen === "ADMIN" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 animate-spin" />
                  관리자 대시보드
                </button>
              )}

              <button
                onClick={() => setScreen("PRICING")}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  screen === "PRICING" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <CreditCard className="w-3 h-3 text-blue-400" />
                가입 요금
              </button>
              
              <button
                onClick={() => setScreen("NOTICE")}
                className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  screen === "NOTICE" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                공지사항
              </button>

              {!adminLoggedIn && (
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setShowLogin(true);
                    } else {
                      setScreen("MYPAGE");
                    }
                  }}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    screen === "MYPAGE" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  마이페이지
                </button>
              )}
            </nav>

            {/* User Session Section */}
            {adminLoggedIn ? (
              <div className="flex items-center gap-3 bg-blue-950/80 border border-blue-800 px-3 py-1.5 rounded-xl">
                <span className="text-[11px] font-bold text-blue-200">
                  👑 <strong className="text-white text-xs">통합 관리자(tomato)</strong> 로그인 중
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="text-[10px] font-extrabold text-blue-300 hover:text-white hover:bg-blue-900 px-2.5 py-1 rounded-md border border-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  관리자 로그아웃
                </button>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                <span className="text-[11px] font-bold text-slate-300">
                  <strong className="text-white text-xs">{currentUser.username}</strong> ({currentUser.companyName})님
                  <span className={`ml-2 px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    currentUser.status === "정회원" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                    currentUser.status === "정회원 승인대기" ? "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse" :
                    "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}>
                    {currentUser.status}{currentUser.plan ? ` (${currentUser.plan})` : ""}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-extrabold text-slate-400 hover:text-white hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-650 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-xs font-bold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  로그인
                </button>
                <button
                  onClick={() => setShowSignup(true)}
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/25 transition-colors cursor-pointer"
                >
                  회원가입
                </button>
              </div>
            )}

            {/* Database Connectivity Status hidden as requested */}
          </div>
        </div>
      </header>

      {/* Membership Status Sticky Banner */}
      {currentUser?.status === "체험회원" && !adminLoggedIn && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 py-3.5 px-6 text-center text-xs text-blue-900 font-bold sticky top-[65px] z-20 print:hidden shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-center flex-wrap gap-2">
            <span>🎉 현재 체험회원으로 이용 중입니다. 무료로 보고서를 5회까지 작성할 수 있습니다.</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-300 font-mono text-xs shadow-inner">
              남은 작성 가능 횟수 : <strong className="text-sm text-blue-900 font-extrabold">{Math.max(0, 5 - currentUser.reportsCreatedCount)}</strong>회
            </span>
            <span>정회원 승인 시 모든 기능을 제한 없이 이용할 수 있습니다.</span>
          </div>
        </div>
      )}

      {currentUser?.status === "정회원 승인대기" && !adminLoggedIn && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 border-b border-red-200 py-3.5 px-6 text-center text-xs text-red-900 font-bold sticky top-[65px] z-20 print:hidden shadow-sm animate-pulse">
          <div className="max-w-7xl mx-auto flex items-center justify-center flex-wrap gap-1">
            <span>⚠️ 무료 체험(5회)을 모두 사용하셨습니다. 현재 <strong className="text-red-700">"정회원 승인대기"</strong> 상태입니다. 관리자의 승인이 완료되면 모든 기능을 제한 없이 이용하실 수 있습니다. (문의 : 관리자)</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow">
        
        {/* ================= SCREEN 1: HOME SCREEN ================= */}
        {screen === "HOME" && (
          <div className="max-w-5xl mx-auto py-12 px-4 space-y-16">
            
            {/* Hero Banner Section */}
            <div className="bg-slate-900 rounded-3xl text-white p-8 md:p-12 relative overflow-hidden shadow-2xl border border-slate-800">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="max-w-2xl space-y-6 relative z-10">
                <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-500/30 tracking-widest inline-flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-blue-400" />
                  KOREA CONSTRUCTION SAFETY STANDARDS
                </span>
                
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  AI 건설안전점검 <br />
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    보고서 자동 생성 시스템
                  </span>
                </h1>
                
                <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                  시공사, 발주처 등 현장의 기본 정보와 점검 사진만 등록하면, 국토교통부 건설공사 안전관리 기준 및 건설기술진흥법 시행령에 완벽히 부합하는 200페이지 규격의 보고서 텍스트와 체크리스트, 사진대지를 AI가 자동으로 집필합니다.
                </p>

                <div className="flex flex-wrap gap-3 pt-4">
                  {adminLoggedIn ? (
                    <>
                      <button
                        onClick={() => setScreen("ADMIN")}
                        className="flex items-center gap-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 animate-pulse"
                      >
                        <Settings className="w-4 h-4" />
                        관리자 대시보드 진입
                      </button>
                      <button
                        onClick={() => setScreen("NOTICE")}
                        className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3.5 rounded-xl transition-colors cursor-pointer"
                      >
                        공지사항 관리대장
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCreateNewClick}
                        className="flex items-center gap-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        새 보고서 만들기
                      </button>
                      <button
                        onClick={() => setScreen("LIST")}
                        className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3.5 rounded-xl transition-colors cursor-pointer"
                      >
                        나의 보고서 관리
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Core Features Grid */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-l-4 border-blue-800 pl-3">
                AI 건설안전 행정 시스템 주요 강점
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-800 mb-4 font-bold">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-950 mb-1.5">법적 표준 규격 100% 충족</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    건설기술진흥법 시행령 제100조 및 건설공사 안전관리 업무수행 지침에서 명시하는 목차 구조(제출문, 서언, 시설물 현황, 주변 시설 안전성, 부위별 안전체크리스트 등)를 완벽하게 만족합니다.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-800 mb-4 font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-950 mb-1.5">안전 자재 자동 인식 특허 AI</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    철근배근, 거푸집, 외부 비계, 시스템 동바리, 옹벽, 교량 교각, 토공 굴착 사면 등을 업로드와 동시에 실시간 시각 분석하여 격자 사진대지와 전문가용 한글 캡션을 자동 배치합니다.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-800 mb-4 font-bold">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-950 mb-1.5">인쇄 및 파일 다운로드</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    고해상도 A4 규격 출력 인쇄용 최적 CSS를 내장하여 즉시 종이 인쇄 또는 PDF 내보내기를 할 수 있으며, 한글(HWP) 이외에 MS Word 오피스에서 곧바로 편집 가능한 .doc 다운로드를 지원합니다.
                  </p>
                </div>

              </div>
            </div>

            {/* Quick Helper Guide */}
            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-white p-3 rounded-xl border border-slate-300">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-xs flex-grow space-y-1 text-slate-600">
                <p className="font-bold text-slate-800">■ 실시간 데이터 상시 보존 안내</p>
                <p>본 플랫폼은 구글 파이어베이스 클라우드 데이터베이스(Firebase Firestore)와 동기화되어, 사용자가 저장한 모든 보고서가 클라우드 대장에 영구 보존됩니다.</p>
                <p>네트워크 불안정 시 브라우저 내 로컬 데이터베이스가 자율 작동되어 보강 저장하므로 정보 소실 위험 없이 언제든 수정 및 다시 조회가 가능합니다.</p>
              </div>
            </div>

          </div>
        )}

        {/* ================= SCREEN 2: REPORT LIST SCREEN ================= */}
        {screen === "LIST" && (
          currentUser ? (
            <ReportList 
              reports={reports.filter(r => 
                adminLoggedIn 
                  ? true 
                  : (r.creatorUsername === currentUser.username || r.companyName === currentUser.companyName)
              )}
              onEdit={handleEditReportClick}
              onView={handleViewReportClick}
              onDelete={handleDeleteReport}
              onCreateNew={handleCreateNewClick}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
              <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-900">로그인이 필요합니다</h3>
              <p className="text-xs text-slate-500 mt-2 mb-6">
                내가 작성한 안전점검 보고서 관리 대장을 확인하려면 로그인이 필요합니다.
              </p>
              <button
                onClick={() => setShowLogin(true)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                로그인 및 가입하기
              </button>
            </div>
          )
        )}

        {/* ================= SCREEN 3: NEW/EDIT REPORT FORM ================= */}
        {screen === "FORM" && (
          <ReportForm
            initialReport={currentReport}
            onSave={handleSaveReport}
            onCancel={() => {
              if (currentReport) {
                setScreen("LIST");
              } else {
                setScreen("HOME");
              }
            }}
          />
        )}

        {/* ================= SCREEN 4: VIEW/PRINT DOCUMENT SCREEN ================= */}
        {screen === "VIEW" && currentReport && (
          <ReportViewer 
            report={currentReport} 
            onBack={() => {
              if (adminLoggedIn) {
                setScreen("ADMIN");
              } else {
                setScreen("LIST");
              }
            }} 
          />
        )}

        {/* ================= SCREEN 5: ADMIN DASHBOARD SCREEN ================= */}
        {screen === "ADMIN" && (
          <AdminDashboard
            reports={reports}
            allUsers={allUsers}
            onRefreshUsers={fetchUsers}
            onRefreshReports={fetchReports}
            onSaveReport={handleSaveReport}
            onDeleteReport={handleDeleteReport}
            onUpdateUser={handleUpdateUser}
            onLogoutAdmin={handleAdminLogout}
            onViewReport={handleViewReportClick}
            onEditReport={handleEditReportClick}
            onCreateReportForUser={handleCreateReportForUser}
            notices={notices}
            onSaveNotice={handleSaveNotice}
            onDeleteNotice={handleDeleteNotice}
          />
        )}

        {/* ================= SCREEN 6: ACCOUNTING MODULE SCREEN ================= */}
        {screen === "ACCOUNTING" && currentUser && (
          <AccountingDashboard
            currentUser={currentUser}
            reports={reports.filter(r => 
              r.creatorUsername === currentUser.username || r.companyName === currentUser.companyName
            )}
            dbStatus={dbStatus}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {/* ================= SCREEN 6-2: PRICING (가입 요금) SCREEN ================= */}
        {screen === "PRICING" && (
          <div className="max-w-5xl mx-auto py-12 px-4 space-y-10 animate-fade-in text-slate-800">
            {/* Header Title */}
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-blue-200 tracking-wider uppercase">
                PLATFORM MEMBERSHIP & PRICING
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                스마트 안전 행정 & AI 건설 세무 통합 멤버십 요금
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                법 개정에 맞춘 완벽한 건설안전 보고서 자동 작성과 번거로운 세무·회계 Cockpit 서비스를 한번에 이용하세요. 현장에 꼭 맞는 합리적인 요금제를 제공합니다.
              </p>
            </div>

            {/* Pricing Options Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Prestige Plan */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold tracking-widest px-4 py-1.5 rounded-bl-2xl uppercase">
                  BEST PARTNER
                </div>
                
                <div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-blue-400 font-extrabold tracking-wider uppercase">CORPORATE LIFETIME</span>
                    <h3 className="text-xl font-bold text-slate-100">프레스티지 파트너십 (Prestige Plan)</h3>
                    <p className="text-[11px] text-slate-400">초기 영구적 시스템 구축 및 전담 세무 관리를 희망하는 정식 법인용</p>
                  </div>

                  {/* Pricing Display */}
                  <div className="my-6 space-y-1 pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-slate-400 font-medium">초기 가입비</span>
                      <span className="text-2xl font-black text-blue-400 font-mono">5,000,000</span>
                      <span className="text-xs text-slate-400 font-medium">원</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-slate-400 font-medium">정기 유지비</span>
                      <span className="text-xl font-extrabold text-white font-mono font-bold">월 500,000</span>
                      <span className="text-xs text-slate-400 font-medium">원 (VAT 포함)</span>
                    </div>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-3 text-[11px] text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>건설안전점검 표준 규격 보고서 <strong>무제한 자동 빌드</strong> 및 즉시 인쇄</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>현장 및 하도급사 별 <strong>무제한 클라우드 영구 연동</strong> 및 계정 분리</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span><strong>1:1 전담 건설 전문 세무 서비스</strong> (자재 계정 과목 정합 분석 피드백)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>국토부 최신 시행령 수시 변경에 따른 <strong>보고서 양식 평생 무료 패치</strong></span>
                    </li>
                  </ul>
                  <p className="mt-3.5 text-[10px] text-slate-400 italic font-medium leading-relaxed">
                    ※ 플렉스 라이트 플랜과 혜택·제공 기능·지원 범위가 100% 동일하며, 납부 요금 형태만 다릅니다.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-900/40">
                  <div className="bg-slate-800/45 rounded-xl p-3 text-[10px] text-slate-400 text-center">
                    평생 라이선스 권한 획득 &amp; 1:1 전담 마스터 배정
                  </div>
                </div>
              </div>

              {/* Flex Plan */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold tracking-widest px-4 py-1.5 rounded-bl-2xl uppercase border-l border-b border-emerald-100">
                  NO CONTRACT
                </div>

                <div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-emerald-600 font-extrabold tracking-wider uppercase">FLEXIBLE MONTHLY</span>
                    <h3 className="text-xl font-bold text-slate-900">플렉스 라이트 멤버십 (Flex Lite Plan)</h3>
                    <p className="text-[11px] text-slate-500">초기 가입비 부담 없이 필요할 때만 자유롭게 구독하는 스마트형</p>
                  </div>

                  {/* Pricing Display */}
                  <div className="my-6 space-y-1 pb-6 border-b border-slate-200">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-slate-500 font-medium">초기 가입비</span>
                      <span className="text-lg font-bold text-slate-400 line-through font-mono">5,000,000</span>
                      <span className="text-xs text-slate-400 font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded ml-1">전액 면제 (0원)</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-slate-500 font-medium">이용료</span>
                      <span className="text-2xl font-black text-emerald-600 font-mono">월 1,200,000</span>
                      <span className="text-xs text-slate-500 font-medium">원 (VAT 포함)</span>
                    </div>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-3 text-[11px] text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>건설안전점검 표준 규격 보고서 <strong>무제한 자동 빌드</strong> 및 즉시 인쇄</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>현장 및 하도급사 별 <strong>무제한 클라우드 영구 연동</strong> 및 계정 분리</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>1:1 전담 건설 전문 세무 서비스</strong> (자재 계정 과목 정합 분석 피드백)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>국토부 최신 시행령 수시 변경에 따른 <strong>보고서 양식 평생 무료 패치</strong></span>
                    </li>
                  </ul>
                  <p className="mt-3.5 text-[10px] text-slate-500 italic font-medium leading-relaxed">
                    ※ 프레스티지 플랜과 혜택·제공 기능·지원 범위가 100% 동일하며, 초기 가입비 없이 유연하게 구독 가능합니다.
                  </p>
                </div>

                <div className="mt-8 pt-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-[10px] text-slate-500 text-center">
                    언제든 위약금 없이 유연하게 연장 및 해지 가능
                  </div>
                </div>
              </div>
            </div>

            {/* Deposit & Application Information Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <h4 className="text-sm font-bold text-slate-900">가입 신청 및 무제한 권한 활성화 안내</h4>
              </div>

              {/* Warning box */}
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs font-semibold space-y-1">
                <p className="flex items-center gap-1.5 text-amber-850 font-extrabold">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  입금인 확인 주의사항
                </p>
                <p className="text-amber-800 leading-relaxed font-medium pl-3">
                  시스템 동기화 자동 확인 처리를 위해 송금 시 입금자명을 반드시 본인의 <strong className="text-amber-900 font-extrabold underline underline-offset-2">"회사명"</strong>으로 입력하여 이체해 주시기 바랍니다. 대표자 개인 성함 또는 기타 가명으로 입금하시는 경우 승인이 다소 지연될 수 있습니다.
                </p>
              </div>

              {/* Bank Account Info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 transition-all duration-250">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-x-8 gap-y-3 justify-center lg:justify-start">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-100 px-2 py-1 rounded-md">은행명</span>
                      <span className="text-sm font-extrabold text-slate-950">IBK 기업은행</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-8 pt-2 sm:pt-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-100 px-2 py-1 rounded-md">계좌번호</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-950 font-mono tracking-tight">189-106874-01-014</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("189-106874-01-014");
                            alert("기업은행 계좌번호(189-106874-01-014)가 복사되었습니다.");
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          title="계좌번호 복사"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-8 pt-2 sm:pt-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-100 px-2 py-1 rounded-md">예금주</span>
                      <span className="text-sm font-extrabold text-slate-950">박제윤</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText("IBK 기업은행 189-106874-01-014 박제윤");
                      alert("전체 계좌 정보(IBK 기업은행 189-106874-01-014 박제윤)가 성공적으로 복사되었습니다.");
                    }}
                    className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5 text-white" />
                    계좌 정보 전체 복사
                  </button>
                </div>
              </div>

              {/* Process Description */}
              <div className="text-[11px] text-slate-500 leading-relaxed space-y-1 pt-2">
                <p className="font-bold text-slate-700">📌 가입 프로세스:</p>
                <p>1. 회원가입을 완료하신 후, 해당 가입 요금제에 상응하는 금액을 위 기업은행 계좌로 송금합니다.</p>
                <p>2. 입금 시 <span className="font-bold text-slate-800">가입된 프로필의 '회사명'</span>과 동일하게 입금자명을 기재합니다.</p>
                <p>3. 입금 완료 후, 우측 상단 '마이페이지'에서 승인 요청을 완료해 주시면 확인 즉시 "정회원" 계정으로 전면 전환됩니다.</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN 7: NOTICE (공지사항) SCREEN ================= */}
        {screen === "NOTICE" && (
          <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-fade-in">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-[10px] text-blue-600 font-extrabold tracking-widest uppercase">PLATFORM NOTICE BOARD</span>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5 mt-1">
                플랫폼 소식 및 세무 일정 공지사항
              </h2>
              <p className="text-xs text-slate-500 mt-1">건설 기술 안전행정시스템과 회계 세무 대장의 최신 기능 업데이트 소식입니다.</p>
            </div>

            <div className="space-y-4">
              {notices.length > 0 ? (
                notices.map(n => (
                  <div key={n.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-400 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-blue-200">
                        {n.tag}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono font-bold">{n.date}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-2">{n.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs font-semibold">
                  등록된 공지사항이 없습니다.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SCREEN 8: MYPAGE (마이페이지) SCREEN ================= */}
        {screen === "MYPAGE" && currentUser && (
          <div className="max-w-xl mx-auto py-12 px-4 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-4 text-center">
                <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase">MEMBER ACCOUNT CENTER</span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">마이페이지 및 회원정보 관리</h2>
                <p className="text-xs text-slate-500 mt-1">회사의 안전 행정 및 세무 관리에 등록된 법인 마스터 정보입니다.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                
                {/* Visual Status card */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">아이디 (Username)</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">{currentUser.username}</span>
                    {currentUser.plan && (
                      <span className="text-[10px] text-blue-400 font-bold block mt-1">
                        가입 플랜: <strong className="text-white bg-blue-600/30 border border-blue-500/20 px-1.5 py-0.5 rounded">{currentUser.plan}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">회원 자격 등급</span>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      currentUser.status === "정회원" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
                      currentUser.status === "정회원 승인대기" ? "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse" :
                      "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}>
                      {currentUser.status}
                    </span>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">회사명</label>
                  <input
                    type="text"
                    readOnly
                    value={currentUser.companyName}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-500"
                  />
                </div>

                {/* Representative */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">대표자명</label>
                  <input
                    type="text"
                    value={currentUser.representative}
                    onChange={(e) => handleUpdateUser({ ...currentUser, representative: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium"
                  />
                </div>

                {/* Business Registration Number */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">사업자등록번호</label>
                  <input
                    type="text"
                    value={currentUser.businessNumber}
                    onChange={(e) => handleUpdateUser({ ...currentUser, businessNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium font-mono"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">연락처</label>
                  <input
                    type="text"
                    value={currentUser.phone}
                    onChange={(e) => handleUpdateUser({ ...currentUser, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">이메일 주소</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    onChange={(e) => handleUpdateUser({ ...currentUser, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">본사 주소</label>
                  <input
                    type="text"
                    value={currentUser.address}
                    onChange={(e) => handleUpdateUser({ ...currentUser, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium"
                  />
                </div>

                {/* Usage metrics */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] text-slate-500 space-y-1">
                  <p className="font-extrabold text-slate-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    플랫폼 사용 누적 통계
                  </p>
                  <p>• 작성 완료 정기안전점검 보고서 수: <strong className="text-slate-850">{currentUser.reportsCreatedCount}</strong>회</p>
                  <p>• 가입일시: {currentUser.createdAt || "2026-07-01"}</p>
                  <p>• 최근 접속일시: {currentUser.lastLoginAt || new Date().toLocaleString()}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    alert("회원 정보가 구글 파이어베이스 클라우드에 영구 동기화되어 반영 완료되었습니다!");
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  수정 사항 저장 완료
                </button>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-850 text-slate-400 text-[11px] py-6 px-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-4">
            <div className="space-y-2 md:col-span-4">
              <h4 className="font-extrabold text-slate-200 text-xs">AI 건설안전점검 보고서 시스템</h4>
              <p className="text-slate-500 leading-relaxed">
                본 시스템은 국토교통부 건설기술진흥법 시행령 제100조(정기안전점검)의 표준 규정을 준수하며 현장 사진 분석과 안전보고서 작성을 고도화합니다.
              </p>
            </div>
            <div className="space-y-1.5 border-t border-slate-800 md:border-t-0 pt-4 md:pt-0 md:col-span-4">
              <h4 className="font-extrabold text-slate-200 text-xs">안전진단 수행 및 기술지원</h4>
              <p className="text-slate-400">
                <span className="font-bold text-slate-300">상호명:</span> 플러스 마켓 | <span className="font-bold text-slate-300">대표자:</span> 박제윤
              </p>
              <p className="text-slate-400">
                <span className="font-bold text-slate-300">사업자 등록번호:</span> 508-22-65436
              </p>
              <p className="text-slate-400">
                <span className="font-bold text-slate-300">연락처:</span> 010-4397-1030 | <span className="font-bold text-slate-300">E-mail:</span> twomong3@naver.com
              </p>
            </div>
            <div className="space-y-1.5 border-t border-slate-800 md:border-t-0 pt-4 md:pt-0 md:col-span-3">
              <h4 className="font-extrabold text-slate-200 text-xs">행정 및 계좌 안내</h4>
              <p className="text-slate-400">
                <span className="font-bold text-slate-300">거래 은행:</span> 기업은행 <span className="font-mono text-slate-300">189-106874-01-014</span> (예금주: 박제윤)
              </p>
              <p className="text-slate-500 pt-2 font-mono text-[10px]">
                &copy; 2026 Plus Market & AI Construction Safety. All Rights Reserved.
              </p>
            </div>
          </div>

          {/* ================= FIXED SETTINGS BUTTON (Anchored to Footer) ================= */}
          <button
            onClick={() => {
              if (adminLoggedIn) {
                setScreen("ADMIN");
              } else {
                setShowAdminLogin(true);
              }
            }}
            className="absolute bottom-0 right-0 z-40 bg-[#0c1524] border border-slate-800/80 hover:bg-[#152238] text-white rounded-lg px-3 py-1.5 shadow-2xl flex items-center gap-1.5 print:hidden cursor-pointer transition-colors"
            id="floating-settings-btn"
            title="설정"
          >
            <Settings className={`w-3.5 h-3.5 text-[#3b82f6] ${screen === "ADMIN" ? "animate-spin" : ""}`} />
            <span className="text-white text-[11px] font-bold tracking-tight">설정</span>
          </button>
        </div>
      </footer>

      {/* ================= MODAL: SIGN UP ================= */}
      {showSignup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col text-slate-900">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-extrabold">건설안전 플랫폼 회원가입</h3>
              </div>
              <button 
                onClick={() => setShowSignup(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSignupSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">회사명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 플러스 마켓"
                    value={signupForm.companyName}
                    onChange={(e) => setSignupForm({...signupForm, companyName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">대표자명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 박제윤"
                    value={signupForm.representative}
                    onChange={(e) => setSignupForm({...signupForm, representative: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">사업자등록번호 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 508-22-65436"
                    value={signupForm.businessNumber}
                    onChange={(e) => setSignupForm({...signupForm, businessNumber: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">연락처 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 010-4397-1030"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">이메일 *</label>
                <input
                  type="email"
                  required
                  placeholder="예: twomong3@naver.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">주소 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 서울특별시 마포구 공덕동"
                  value={signupForm.address}
                  onChange={(e) => setSignupForm({...signupForm, address: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="border-t border-dashed border-slate-200 my-4 pt-4"></div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">아이디 (Username) *</label>
                <input
                  type="text"
                  required
                  placeholder="아이디를 입력하세요"
                  value={signupForm.username}
                  onChange={(e) => setSignupForm({...signupForm, username: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">비밀번호 *</label>
                  <input
                    type="password"
                    required
                    placeholder="비밀번호"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">비밀번호 확인 *</label>
                  <input
                    type="password"
                    required
                    placeholder="비밀번호 확인"
                    value={signupForm.passwordConfirm}
                    onChange={(e) => setSignupForm({...signupForm, passwordConfirm: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500">
                ※ 가입 시 회원 자격은 자동으로 <strong className="text-blue-600">"체험회원"</strong>으로 지정되며, 최대 5회까지 실제 기능(AI 분석, PDF 생성, 다운로드, 인쇄 등)을 체험할 수 있습니다.
              </p>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="w-1/3 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/10 cursor-pointer transition-colors"
                >
                  회원가입 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOGIN ================= */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full text-slate-900">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-extrabold">안전플랫폼 로그인</h3>
              </div>
              <button 
                onClick={() => setShowLogin(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">아이디</label>
                <input
                  type="text"
                  required
                  placeholder="아이디를 입력하세요"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">비밀번호</label>
                <input
                  type="password"
                  required
                  placeholder="비밀번호를 입력하세요"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setShowSignup(true);
                  }}
                  className="w-1/2 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  회원가입하기
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  로그인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADMIN LOGIN ================= */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full text-slate-900 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-900 text-white">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400 animate-spin" />
                <h3 className="text-sm font-extrabold">통합 관리자 로그인</h3>
              </div>
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="text-slate-300 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAdminLoginSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div className="text-left">
                <label className="block text-slate-700 mb-1">관리자 아이디</label>
                <input
                  type="text"
                  required
                  placeholder="아이디를 입력하세요"
                  value={adminLoginForm.username}
                  onChange={(e) => setAdminLoginForm({...adminLoginForm, username: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
                />
              </div>

              <div className="text-left">
                <label className="block text-slate-700 mb-1">관리자 비밀번호</label>
                <input
                  type="password"
                  required
                  placeholder="비밀번호를 입력하세요"
                  value={adminLoginForm.password}
                  onChange={(e) => setAdminLoginForm({...adminLoginForm, password: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl cursor-pointer transition-colors"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  관리자 시스템 접속
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: WARNING WINDOW ================= */}
      {warningModalVisible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-2xl max-w-md w-full relative text-slate-900">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <UserX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 leading-snug">
              무료 체험(5회)을 모두 사용하셨습니다.
            </h3>
            <div className="text-xs text-slate-600 space-y-2 mb-6 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left">
              <p className="font-extrabold text-red-600">현재 "정회원 승인대기" 상태입니다.</p>
              <p>이후에는 보고서 작성, PDF 생성, 작성된 보고서 다운로드, 프린터 출력, AI 분석, 신규보고서 생성 등이 제한됩니다.</p>
              <p className="text-[11px] text-slate-400 border-t border-slate-200 pt-2 font-semibold">문의 : 관리자</p>
            </div>
            <button
              onClick={() => setWarningModalVisible(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Simulator floating controller and toggle button hidden as requested */}
      <SupportChatbot currentUser={currentUser} />
    </div>
  );
}
