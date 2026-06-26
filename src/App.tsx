/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { db, saveEmployee, saveRequest, savePlan, deleteEmployeeFromFirestore, deleteRequestFromFirestore, deletePlanFromFirestore } from './lib/firebase';
import { collection, onSnapshot, doc, writeBatch } from 'firebase/firestore';
import { 
  MOCK_EMPLOYEES, 
  MOCK_REQUESTS, 
  POPULAR_LOCATIONS 
} from './data/mockData';
import { OffSiteRequest, LocationCoordinates, RequestStatus, Employee, OffSitePlan } from './types';
import OfflineSimMap from './components/OfflineSimMap';
import KidzKitzLogo from './components/KidzKitzLogo';
import ReportTemplate from './components/ReportTemplate';
import DashboardAnalytics from './components/DashboardAnalytics';
import ManagerCalendar from './components/ManagerCalendar';
import EmployeePlanning from './components/EmployeePlanning';
import UserManualModal from './components/UserManualModal';

// UI Icons
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Briefcase, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  TrendingUp, 
  Send, 
  Globe, 
  Sparkles, 
  Check, 
  X, 
  Plus, 
  Search,
  Filter,
  MonitorCheck,
  Building,
  CheckCircle,
  Clock3,
  Upload,
  Trash2,
  Image as ImageIcon,
  CalendarRange,
  Shuffle,
  FileCode,
  UserPlus,
  UserCheck,
  LogOut,
  Key,
  Lock,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

export default function App() {
  // --- REAL-TIME FIRESTORE DATA SYSTEM ---
  const [requests, rawSetRequests] = useState<OffSiteRequest[]>(() => {
    const saved = localStorage.getItem('offsite_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [employees, rawSetEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('offsite_employees');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [plans, rawSetPlans] = useState<OffSitePlan[]>(() => {
    const saved = localStorage.getItem('offsite_plans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Intercepting setters that write to Firestore and raw state
  const setRequests = (updater: React.SetStateAction<OffSiteRequest[]>) => {
    if (typeof updater === 'function') {
      rawSetRequests(prev => {
        const next = updater(prev);
        const prevMap = new Map(prev.map(r => [r.id, r]));
        const nextIds = new Set(next.map(r => r.id));
        next.forEach(r => {
          const prevReq = prevMap.get(r.id);
          if (!prevReq || JSON.stringify(prevReq) !== JSON.stringify(r)) {
            saveRequest(r).catch(console.error);
          }
        });
        prev.forEach(r => {
          if (!nextIds.has(r.id)) {
            deleteRequestFromFirestore(r.id).catch(console.error);
          }
        });
        return next;
      });
    } else {
      rawSetRequests(updater);
      updater.forEach(r => saveRequest(r).catch(console.error));
    }
  };

  const setPlans = (updater: React.SetStateAction<OffSitePlan[]>) => {
    if (typeof updater === 'function') {
      rawSetPlans(prev => {
        const next = updater(prev);
        const prevMap = new Map(prev.map(p => [p.id, p]));
        const nextIds = new Set(next.map(p => p.id));
        next.forEach(p => {
          const prevPlan = prevMap.get(p.id);
          if (!prevPlan || JSON.stringify(prevPlan) !== JSON.stringify(p)) {
            savePlan(p).catch(console.error);
          }
        });
        prev.forEach(p => {
          if (!nextIds.has(p.id)) {
            deletePlanFromFirestore(p.id).catch(console.error);
          }
        });
        return next;
      });
    } else {
      rawSetPlans(updater);
      updater.forEach(p => savePlan(p).catch(console.error));
    }
  };

  const setEmployees = (updater: React.SetStateAction<Employee[]>) => {
    if (typeof updater === 'function') {
      rawSetEmployees(prev => {
        const next = updater(prev);
        const prevMap = new Map(prev.map(e => [e.id, e]));
        const nextIds = new Set(next.map(e => e.id));
        next.forEach(e => {
          const prevEmp = prevMap.get(e.id);
          if (!prevEmp || JSON.stringify(prevEmp) !== JSON.stringify(e)) {
            saveEmployee(e).catch(console.error);
          }
        });
        prev.forEach(e => {
          if (!nextIds.has(e.id)) {
            deleteEmployeeFromFirestore(e.id).catch(console.error);
          }
        });
        return next;
      });
    } else {
      rawSetEmployees(updater);
      updater.forEach(e => saveEmployee(e).catch(console.error));
    }
  };

  // Setup Real-Time Subscriptions to Firestore on mount
  useEffect(() => {
    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
      if (snapshot.empty) {
        console.log("Seeding employees to Firestore...");
        const batch = writeBatch(db);
        const employeeMap = new Map<string, Employee>();
        
        MOCK_EMPLOYEES.forEach((emp) => {
          const defaultWorkGroup: 'regular' | 'adhoc' = (emp.id === 'KK0098' || emp.id === 'KK0159' || emp.id === 'KK0103') ? 'regular' : 'adhoc';
          employeeMap.set(emp.id.trim().toUpperCase(), {
            ...emp,
            id: emp.id.trim().toUpperCase(),
            workGroup: emp.workGroup || defaultWorkGroup,
            position: emp.position || 'employee',
            password: emp.password || '1234'
          });
        });
        
        const finalEmployees = Array.from(employeeMap.values());
        finalEmployees.forEach((emp) => {
          const docRef = doc(db, 'employees', emp.id.trim().toUpperCase());
          batch.set(docRef, emp);
        });
        batch.commit().then(() => {
          rawSetEmployees(finalEmployees);
          localStorage.setItem('offsite_employees', JSON.stringify(finalEmployees));
        }).catch(console.error);
      } else {
        const emps: Employee[] = [];
        snapshot.forEach(doc => {
          emps.push(doc.data() as Employee);
        });
        rawSetEmployees(emps);
        localStorage.setItem('offsite_employees', JSON.stringify(emps));
      }
    });

    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      if (snapshot.empty) {
        console.log("Seeding requests to Firestore...");
        const batch = writeBatch(db);
        const mappedRequests = MOCK_REQUESTS.map(r => {
          if (r.employeeId === 'EMP001') {
            return {
              ...r,
              employeeId: 'KK0098',
              employeeName: 'ออนนิตา โต๊ะสะอิ',
              role: 'หัวหน้าแผนกส่วนงานทรัพยากรบุคคล',
              approvedBy: 'กานดา ยอดรัก'
            };
          }
          if (r.employeeId === 'EMP002') {
            return {
              ...r,
              employeeId: 'KK0118',
              employeeName: 'พีรศักดิ์ ผลทวี',
              role: 'เจ้าหน้าที่การตลาดและพัฒนาชุมชน',
              approvedBy: 'อุดม เรืองวิไลรัตน์'
            };
          }
          if (r.employeeId === 'EMP003') {
            return {
              ...r,
              employeeId: 'KK0159',
              employeeName: 'อภิญญา หวังมี',
              role: 'เจ้าหน้าที่บัญชีเจ้าหนี้',
              approvedBy: 'กานดา ยอดรัก'
            };
          }
          return r;
        });
        mappedRequests.forEach((req) => {
          const docRef = doc(db, 'requests', req.id);
          batch.set(docRef, req);
        });
        batch.commit().then(() => {
          rawSetRequests(mappedRequests);
          localStorage.setItem('offsite_requests', JSON.stringify(mappedRequests));
        }).catch(console.error);
      } else {
        const reqs: OffSiteRequest[] = [];
        snapshot.forEach(doc => {
          reqs.push(doc.data() as OffSiteRequest);
        });
        // Sort requests by date or id to keep order consistent
        reqs.sort((a, b) => b.id.localeCompare(a.id));
        rawSetRequests(reqs);
        localStorage.setItem('offsite_requests', JSON.stringify(reqs));
      }
    });

    const unsubPlans = onSnapshot(collection(db, 'plans'), (snapshot) => {
      if (snapshot.empty) {
        console.log("Seeding plans to Firestore...");
        const batch = writeBatch(db);
        const defaultPlans: OffSitePlan[] = [
          {
            id: 'PLAN-2026-001',
            employeeId: 'KK0098',
            employeeName: 'ออนนิตา โต๊ะสะอิ',
            title: 'แผนปฏิบัติงานประจำเดือน มิถุนายน 2026',
            type: 'monthly' as const,
            startDate: '2026-06-01',
            endDate: '2026-06-30',
            status: 'approved' as const,
            approvedBy: 'กานดา ยอดรัก (ผู้จัดการฝ่ายสำนักงาน)',
            approvedAt: '28/05/2026 10:30',
            createdAt: '2026-05-27',
            plannedDates: [
              {
                date: '2026-06-01',
                location: { name: 'เมก้า พลาซ่า สะพานเหล็ก', lat: 13.7462, lng: 100.5028, address: 'วังบูรพาภิรมย์ เขตพระนคร กรุงเทพฯ' },
                purpose: 'ควบคุมงานแข่งขันแข่งขันการ์ดแวนการ์ด (Vanguard Cardfight Thai Tournament)',
                startTime: '09:00',
                endTime: '18:00'
              },
              {
                date: '2026-06-08',
                location: { name: 'แฟชั่น ไอส์แลนด์ (ลานอีเว้นต์ชั้น 3)', lat: 13.8248, lng: 100.6775, address: 'คันนายาว เขตคันนายาว กรุงเทพฯ' },
                purpose: 'คุมการแข่งขันทัวร์นาเมนต์ Vanguard Weekly Arena ประจำสัปดาห์ปริมณฑล',
                startTime: '10:00',
                endTime: '19:00'
              },
              {
                date: '2026-06-13',
                location: { name: 'เมก้า พลาซ่า สะพานเหล็ก', lat: 13.7462, lng: 100.5028, address: 'วังบูรพาภิรมย์ เขตพระนคร กรุงเทพฯ' },
                purpose: 'ควบคุมตัดสินคัดเลือกการ์ดไฟท์ แบล็คเคลย์ ทัวร์นาเมนท์เพื่อสิทธิ์เข้าชิงระดับประเทศ',
                startTime: '09:00',
                endTime: '18:00'
              },
              {
                date: '2026-06-20',
                location: { name: 'เดอะมอลล์ บางกะปิ (Zone Toy)', lat: 13.7663, lng: 100.6433, address: 'คลองจั่น เขตบางกะปิ กรุงเทพฯ' },
                purpose: 'จัดกิจกรรมฝึกเล่นการ์ดเกมและแจกการ์ดฟรีสำหรับเด็กนักเรียน',
                startTime: '10:00',
                endTime: '18:00'
              }
            ]
          }
        ];
        defaultPlans.forEach((plan) => {
          const docRef = doc(db, 'plans', plan.id);
          batch.set(docRef, plan);
        });
        batch.commit().then(() => {
          rawSetPlans(defaultPlans);
          localStorage.setItem('offsite_plans', JSON.stringify(defaultPlans));
        }).catch(console.error);
      } else {
        const plns: OffSitePlan[] = [];
        snapshot.forEach(doc => {
          plns.push(doc.data() as OffSitePlan);
        });
        rawSetPlans(plns);
        localStorage.setItem('offsite_plans', JSON.stringify(plns));
      }
    });

    return () => {
      unsubEmployees();
      unsubRequests();
      unsubPlans();
    };
  }, []);

  // Logged-in User State (Persisted)
  const [loggedInUser, setLoggedInUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('offsite_logged_in_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Change Password States
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isUserManualOpen, setIsUserManualOpen] = useState<boolean>(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string>('');
  const [changePasswordError, setChangePasswordError] = useState<string>('');

  // Self-Managed Approval Line States
  const [isSelfApproverOpen, setIsSelfApproverOpen] = useState<boolean>(false);
  const [selfApproverId, setSelfApproverId] = useState<string>('');
  const [selfCustomApproverName, setSelfCustomApproverName] = useState<string>('');
  const [selfApproverSuccess, setSelfApproverSuccess] = useState<string>('');
  const [selfApproverError, setSelfApproverError] = useState<string>('');

  // Roles & Simulator State
  const [activeRole, setActiveRole] = useState<'employee' | 'manager' | 'admin'>(() => {
    const saved = localStorage.getItem('offsite_logged_in_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Employee;
        if (parsed.position === 'admin') return 'admin';
        return parsed.position === 'manager' || parsed.id === 'KK0031' ? 'manager' : 'employee';
      } catch (e) {
        return 'employee';
      }
    }
    return 'employee'; // default is employee view
  });
  const [employeeActiveTab, setEmployeeActiveTab] = useState<'planning' | 'calendar'>('planning');
  const [simulatedEmployeeId, setSimulatedEmployeeId] = useState<string>(() => {
    const saved = localStorage.getItem('offsite_logged_in_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Employee;
        return parsed.id;
      } catch (e) {
        return 'KK0098';
      }
    }
    return 'KK0098';
  });

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('offsite_logged_in_user', JSON.stringify(loggedInUser));
      if (loggedInUser.position === 'admin') {
        setActiveRole('admin');
      } else {
        setActiveRole(loggedInUser.position === 'manager' || loggedInUser.id === 'KK0031' ? 'manager' : 'employee');
      }
      setSimulatedEmployeeId(loggedInUser.id);
    } else {
      localStorage.removeItem('offsite_logged_in_user');
    }
  }, [loggedInUser]);

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Login Page States
  const [loginTab, setLoginTab] = useState<'employee' | 'manager' | 'admin'>('employee');
  const [inputUserId, setInputUserId] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!inputUserId.trim()) {
      setLoginError('กรุณากรอกรหัสพนักงาน หรืออีเมลติดต่อ');
      return;
    }

    if (!inputPassword.trim()) {
      setLoginError('กรุณากรอกรหัสผ่านเพื่อความปลอดภัย');
      return;
    }

    const match = employees.find(emp => 
      emp.id.trim().toUpperCase() === inputUserId.trim().toUpperCase() || 
      emp.email.trim().toLowerCase() === inputUserId.trim().toLowerCase()
    );

    if (!match) {
      setLoginError('ไม่พบข้อมูลรหัสพนักงาน หรืออีเมลนี้ในระบบฐานข้อมูล');
      return;
    }

    // Securely verify password
    const correctPassword = match.password || '1234';
    if (inputPassword.trim() !== correctPassword) {
      setLoginError('รหัสผ่านเข้าสู่ระบบไม่ถูกต้อง กรุณาตรวจสอบหรือใช้รหัสผ่านตั้งต้น 1234 สำหรับบัญชีจำลอง');
      return;
    }

    // Verify correct role partition alignment:
    const userPos = match.position || 'employee';
    if (loginTab === 'admin' && userPos !== 'admin') {
      setLoginError('บัญชีนี้ไม่มีสิทธิ์ระดับผู้คุมระบบ (Administrator) โปรดเข้าใช้งานที่แท็บช่องทางอื่น');
      return;
    }
    if (loginTab === 'manager' && userPos !== 'manager') {
      setLoginError('บัญชีนี้ไม่มีสิทธิ์ระดับหัวหน้างาน/ผู้จัดการ โปรดเข้าใช้งานที่แท็บช่องทางอื่น');
      return;
    }
    if (loginTab === 'employee' && userPos !== 'employee') {
      setLoginError('บัญชีนี้ไม่ใช่พนักงานปฏิบัติการทั่วไป โปรดเข้าใช้งานผ่านช่องทางหัวหน้างานหรือผู้คุมระบบ');
      return;
    }

    // Accept login
    setLoggedInUser(match);
    setInputUserId('');
    setInputPassword('');
  };

  const handleQuickLogin = (emp: Employee) => {
    setLoginError('');
    setInputUserId(emp.id);
    setInputPassword(emp.password || '1234');
  };

  // Form State
  const [formDate, setFormDate] = useState<string>('2026-06-13');
  const [formStartTime, setFormStartTime] = useState<string>('09:00');
  const [formEndTime, setFormEndTime] = useState<string>('18:00');
  const [formLocationPreset, setFormLocationPreset] = useState<string>(POPULAR_LOCATIONS[0].name);
  const [formCustomLocationName, setFormCustomLocationName] = useState<string>('');
  const [formCustomLat, setFormCustomLat] = useState<string>('13.7563');
  const [formCustomLng, setFormCustomLng] = useState<string>('100.5018');
  const [formCustomAddress, setFormCustomAddress] = useState<string>('');
  const [formPurpose, setFormPurpose] = useState<string>('');
  const [isCustomLocToggle, setIsCustomLocToggle] = useState<boolean>(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string>('');

  // GPS Simulation variables
  const [browserGeo, setBrowserGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [isTrackingGeo, setIsTrackingGeo] = useState<boolean>(false);
  const [simulatedGeoMatched, setSimulatedGeoMatched] = useState<boolean>(true); // helper teleport switch

  // Active check-out context state
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [checkoutWorkSummary, setCheckoutWorkSummary] = useState<string>('');
  const [checkoutIssueFound, setCheckoutIssueFound] = useState<string>('');
  const [checkoutIssueResolved, setCheckoutIssueResolved] = useState<boolean>(true);
  const [checkoutWorkImage, setCheckoutWorkImage] = useState<string>('');

  // Filter state for dashboard
  const [dashboardEmployeeFilter, setDashboardEmployeeFilter] = useState<string>('');
  const [dashboardIssueStateFilter, setDashboardIssueStateFilter] = useState<string>('all');

  // Form State for creating a new employee
  const [newEmpId, setNewEmpId] = useState<string>('');
  const [newEmpName, setNewEmpName] = useState<string>('');
  const [newEmpEmail, setNewEmpEmail] = useState<string>('');
  const [newEmpRole, setNewEmpRole] = useState<string>('เจ้าหน้าที่ประสานงานนอกพื้นที่');
  const [newEmpDept, setNewEmpDept] = useState<string>('ฝ่ายส่งเสริมกิจกรรมการตลาด');
  const [newEmpPosition, setNewEmpPosition] = useState<'employee' | 'manager' | 'admin'>('employee');
  const [newEmpWorkGroup, setNewEmpWorkGroup] = useState<'regular' | 'adhoc'>('adhoc');
  const [selectedApproverId, setSelectedApproverId] = useState<string>('KK0031');
  const [customApproverName, setCustomApproverName] = useState<string>('');
  const [newEmpPassword, setNewEmpPassword] = useState<string>('1234');
  const [newEmpSuccessMsg, setNewEmpSuccessMsg] = useState<string>('');

  // Admin User Editing States
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editEmpId, setEditEmpId] = useState<string>('');
  const [editEmpName, setEditEmpName] = useState<string>('');
  const [editEmpEmail, setEditEmpEmail] = useState<string>('');
  const [editEmpRole, setEditEmpRole] = useState<string>('');
  const [editEmpDept, setEditEmpDept] = useState<string>('');
  const [editEmpPosition, setEditEmpPosition] = useState<'employee' | 'manager' | 'admin'>('employee');
  const [editEmpWorkGroup, setEditEmpWorkGroup] = useState<'regular' | 'adhoc'>('adhoc');
  const [editSelectedApproverId, setEditSelectedApproverId] = useState<string>('KK0031');
  const [editCustomApproverName, setEditCustomApproverName] = useState<string>('');
  const [editEmpPassword, setEditEmpPassword] = useState<string>('1234');
  const [adminUpdateSuccess, setAdminUpdateSuccess] = useState<string>('');
  const [adminUpdateError, setAdminUpdateError] = useState<string>('');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [adminRoleFilter, setAdminRoleFilter] = useState<'all' | 'employee' | 'manager' | 'admin'>('all');
  const [adminActiveTab, setAdminActiveTab] = useState<'dashboard' | 'users'>('dashboard');

  const handleCreateEmployee = (e: FormEvent) => {
    e.preventDefault();
    if (!newEmpId.trim() || !newEmpName.trim() || !newEmpEmail.trim()) {
      alert('กรุณากรอกข้อมูลพนักงานให้ครบถ้วนก่อนตรวจสอบสิทธิ์');
      return;
    }

    if (employees.some(emp => emp.id.trim().toUpperCase() === newEmpId.trim().toUpperCase())) {
      alert('รหัสพนักงานซ้ำซ้อนในระบบ กรุณาเลือกกำหนดรหัสใหม่');
      return;
    }

    const parentApprover = employees.find(emp => emp.id === selectedApproverId);
    let finalApproverName: string | undefined = undefined;
    let finalApproverId: string | undefined = undefined;

    if (newEmpPosition === 'employee' || newEmpPosition === 'manager') {
      if (selectedApproverId === 'custom') {
        finalApproverName = customApproverName.trim() || 'ไม่ได้ระบุหัวหน้างานสายตรง';
      } else if (parentApprover) {
        finalApproverName = `${parentApprover.name} (${parentApprover.role.split(' (')[0]})`;
        finalApproverId = parentApprover.id;
      }
    }

    const colors = [
      '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', 
      '#EF4444', '#14B8A6', '#6366F1', '#EC4899'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created: Employee = {
      id: newEmpId.trim().toUpperCase(),
      name: newEmpName.trim(),
      role: newEmpRole.trim(),
      email: newEmpEmail.trim(),
      department: newEmpDept.trim(),
      avatarColor: randomColor,
      workGroup: newEmpWorkGroup,
      position: newEmpPosition,
      approverId: finalApproverId,
      approverName: finalApproverName,
      password: newEmpPassword.trim() || '1234'
    };

    setEmployees(prev => [...prev, created]);
    setNewEmpSuccessMsg(`สำเร็จ: บันทึกข้อมูล ${created.id} และกำหนดรหัสผ่านเรียบร้อยแล้ว สลับเป็นโปรไฟล์ใหม่ในเมนูจำลองระบบด้านบนได้ทันที!`);
    
    // Clear fields
    setNewEmpId('');
    setNewEmpName('');
    setNewEmpEmail('');
    setNewEmpPassword('1234');
  };

  const handleUpdateEmployee = (e: FormEvent) => {
    e.preventDefault();
    if (!editingEmployeeId) return;

    const trimmedNewId = editEmpId.trim();
    if (!trimmedNewId) {
      setAdminUpdateError('กรุณาระบุรหัสพนักงานใหม่');
      return;
    }

    if (!editEmpName.trim() || !editEmpEmail.trim()) {
      setAdminUpdateError('กรุณากรอกข้อมูลพนักงานให้ครบถ้วน');
      return;
    }

    // Verify duplicate ID if it changed
    if (trimmedNewId !== editingEmployeeId) {
      const isDuplicate = employees.some(emp => emp.id === trimmedNewId);
      if (isDuplicate) {
        setAdminUpdateError(`รหัสพนักงานใหม่ "${trimmedNewId}" มีอยู่ในระบบฐานข้อมูลแล้ว กรุณาเลือกกำหนดรหัสใหม่ที่ไม่ซ้ำซ้อน`);
        return;
      }
    }

    const parentApprover = employees.find(emp => emp.id === editSelectedApproverId);
    let finalApproverName: string | undefined = undefined;
    let finalApproverId: string | undefined = undefined;

    if (editEmpPosition === 'employee' || editEmpPosition === 'manager') {
      if (editSelectedApproverId === 'custom') {
        finalApproverName = editCustomApproverName.trim() || 'ไม่ได้ระบุหัวหน้างานสายตรง';
      } else if (parentApprover) {
        finalApproverName = `${parentApprover.name} (${parentApprover.role.split(' (')[0]})`;
        finalApproverId = parentApprover.id;
      }
    }

    // Cascade Updates!
    // 1. Update Employee Master List (including subordinates' approverId / approverName if the edited employee is their manager)
    setEmployees(prev => prev.map(emp => {
      if (emp.id === editingEmployeeId) {
        return {
          ...emp,
          id: trimmedNewId,
          name: editEmpName.trim(),
          role: editEmpRole.trim(),
          email: editEmpEmail.trim(),
          department: editEmpDept.trim(),
          position: editEmpPosition,
          workGroup: editEmpWorkGroup,
          approverId: finalApproverId,
          approverName: finalApproverName,
          password: editEmpPassword.trim() || '1234'
        };
      }
      if (emp.approverId === editingEmployeeId) {
        return {
          ...emp,
          approverId: trimmedNewId,
          approverName: `${editEmpName.trim()} (${editEmpRole.trim().split(' (')[0]})`
        };
      }
      return emp;
    }));

    // 2. Cascade Update to Planning Logs (OffSitePlan)
    setPlans(prev => prev.map(plan => {
      if (plan.employeeId === editingEmployeeId) {
        return {
          ...plan,
          employeeId: trimmedNewId,
          employeeName: editEmpName.trim()
        };
      }
      return plan;
    }));

    // 3. Cascade Update to Check-In/Check-Out and Request Logs (OffSiteRequest)
    setRequests(prev => prev.map(req => {
      if (req.employeeId === editingEmployeeId) {
        return {
          ...req,
          employeeId: trimmedNewId,
          employeeName: editEmpName.trim()
        };
      }
      return req;
    }));

    // 4. Update loggedInUser if the currently logged-in user is the edited employee
    if (loggedInUser && loggedInUser.id === editingEmployeeId) {
      setLoggedInUser({
        ...loggedInUser,
        id: trimmedNewId,
        name: editEmpName.trim(),
        role: editEmpRole.trim(),
        email: editEmpEmail.trim(),
        department: editEmpDept.trim(),
        position: editEmpPosition,
        workGroup: editEmpWorkGroup,
        approverId: finalApproverId,
        approverName: finalApproverName,
        password: editEmpPassword.trim() || '1234'
      });
    }

    // 5. Update simulatedEmployeeId if it matches the edited user's old ID
    if (simulatedEmployeeId === editingEmployeeId) {
      setSimulatedEmployeeId(trimmedNewId);
    }

    setAdminUpdateSuccess('อัปเดตข้อมูลและประสานรหัสพนักงาน (Cascade Update) เรียบร้อยทุกระบบแล้ว!');
    setEditingEmployeeId(null);
  };

  const handleDeleteEmployee = (empId: string) => {
    if (empId === loggedInUser?.id) {
      alert('คุณไม่สามารถลบบัญชีผู้คุมระบบที่คุณกำลังเข้าใช้งานอยู่ได้!');
      return;
    }
    const target = employees.find(e => e.id === empId);
    if (!target) return;

    if (window.confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการ "ลบบัญชี" ${target.name} (${target.id}) ออกจากระบบโดยถาวร?\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`)) {
      setEmployees(prev => prev.filter(e => e.id !== empId));
      alert(`ลบบัญชี ${target.name} เรียบร้อยแล้ว`);
    }
  };

  const startEditingEmployee = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setEditEmpId(emp.id);
    setEditEmpName(emp.name);
    setEditEmpRole(emp.role);
    setEditEmpEmail(emp.email);
    setEditEmpDept(emp.department);
    setEditEmpPosition(emp.position || 'employee');
    setEditEmpWorkGroup(emp.workGroup || 'adhoc');
    setEditSelectedApproverId(emp.approverId || 'KK0031');
    setEditCustomApproverName(emp.approverName || '');
    setEditEmpPassword(emp.password || '1234');
    setAdminUpdateSuccess('');
    setAdminUpdateError('');
  };

  const handleChangePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (!loggedInUser) return;
    
    const currentPass = loggedInUser.password || '1234';
    if (currentPasswordInput !== currentPass) {
      setChangePasswordError('รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาป้อนรหัสให้ถูกต้อง');
      return;
    }

    if (!newPasswordInput.trim()) {
      setChangePasswordError('โปรดป้อนรหัสผ่านใหม่');
      return;
    }

    if (newPasswordInput.length < 4) {
      setChangePasswordError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร เพื่อความปลอดภัย');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordError('การยืนยันรหัสผ่านใหม่ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    // Update inside employees array state
    const updatedEmployees = employees.map(emp => {
      if (emp.id === loggedInUser.id) {
        return {
          ...emp,
          password: newPasswordInput.trim()
        };
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    
    const updatedUser = {
      ...loggedInUser,
      password: newPasswordInput.trim()
    };
    
    setLoggedInUser(updatedUser);
    localStorage.setItem('offsite_logged_in_user', JSON.stringify(updatedUser));

    setChangePasswordSuccess('เปลี่ยนรหัสผ่านเสร็จสมบูรณ์เรียบร้อยแล้ว!');
    
    // Clear inputs
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  const openSelfApproverModal = () => {
    if (!loggedInUser) return;
    setSelfApproverSuccess('');
    setSelfApproverError('');
    
    const currId = loggedInUser.approverId || '';
    const currName = loggedInUser.approverName || '';
    
    // Check if the current approver is in our employees list
    const isKnown = employees.some(e => e.id === currId && currId !== '');
    if (isKnown) {
      setSelfApproverId(currId);
      setSelfCustomApproverName('');
    } else if (currName) {
      setSelfApproverId('custom');
      setSelfCustomApproverName(currName);
    } else {
      setSelfApproverId('');
      setSelfCustomApproverName('');
    }
    
    setIsSelfApproverOpen(true);
  };

  const handleSelfApproverSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!loggedInUser) return;

    const parentApprover = employees.find(emp => emp.id === selfApproverId);
    let finalApproverName = '';
    let finalApproverId: string | undefined = undefined;

    if (selfApproverId === 'custom') {
      finalApproverName = selfCustomApproverName.trim() || 'ไม่ได้ระบุหัวหน้างานสายตรง';
    } else if (parentApprover) {
      finalApproverName = `${parentApprover.name} (${parentApprover.role.split(' (')[0]})`;
      finalApproverId = parentApprover.id;
    } else {
      finalApproverName = 'ไม่ได้ระบุหัวหน้างานสายตรง';
    }

    const updatedEmployees = employees.map(emp => {
      if (emp.id === loggedInUser.id) {
        return {
          ...emp,
          approverId: finalApproverId,
          approverName: finalApproverName
        };
      }
      return emp;
    });

    setEmployees(updatedEmployees);

    const updatedUser = {
      ...loggedInUser,
      approverId: finalApproverId,
      approverName: finalApproverName
    };

    setLoggedInUser(updatedUser);
    localStorage.setItem('offsite_logged_in_user', JSON.stringify(updatedUser));

    setSelfApproverSuccess('อัปเดตผู้อนุมัติประจำตัวของท่านสำเร็จเรียบร้อยแล้ว!');
  };

  // Trigger loading real geolocation coordinates
  const triggerGeolocation = () => {
    setIsTrackingGeo(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBrowserGeo({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsTrackingGeo(false);
        },
        (error) => {
          console.error('Geolocation failed:', error);
          setIsTrackingGeo(false);
          // Set standard Bangkok Center coordinate as fallback representation
          setBrowserGeo({ lat: 13.7563, lng: 100.5018 });
        }
      );
    } else {
      setIsTrackingGeo(false);
      setBrowserGeo({ lat: 13.7563, lng: 100.5018 });
    }
  };

  useEffect(() => {
    triggerGeolocation();
  }, []);

  // Helper เพื่อตรวจสอบการปฏิบัติงานในวันเดียวกัน สถานที่เดียวกัน และเรื่องเดียวกัน
  const checkDateConflicts = (planId: string, employeeId: string, dateStr: string, locationName: string, purposeStr: string) => {
    const list: {
      employeeName: string;
      employeeId: string;
      sourceType: 'plan' | 'request';
      status: 'pending' | 'approved' | 'rejected';
      purpose: string;
    }[] = [];

    // ตรวจสอบแผนงานล่วงหน้าอื่นๆ
    plans.forEach(p => {
      if (p.id === planId) return; // ข้ามแผนตัวเอง
      p.plannedDates.forEach(otherDate => {
        if (
          otherDate.date === dateStr &&
          otherDate.location.name.trim().toLowerCase() === locationName.trim().toLowerCase()
        ) {
          const samePurpose = otherDate.purpose.trim().toLowerCase() === purposeStr.trim().toLowerCase();
          if (samePurpose) {
            list.push({
              employeeName: p.employeeName,
              employeeId: p.employeeId,
              sourceType: 'plan',
              status: p.status,
              purpose: otherDate.purpose
            });
          }
        }
      });
    });

    // ตรวจสอบคำขอลงพื้นที่ปกติหรือล่าช้า
    requests.forEach(r => {
      if (r.employeeId === employeeId) return; // ข้ามพนักงานคนเดียวกัน
      if (
        r.date === dateStr &&
        r.location.name.trim().toLowerCase() === locationName.trim().toLowerCase()
      ) {
        const samePurpose = r.purpose.trim().toLowerCase() === purposeStr.trim().toLowerCase();
        if (samePurpose) {
          list.push({
            employeeName: r.employeeName,
            employeeId: r.employeeId,
            sourceType: 'request',
            status: r.status,
            purpose: r.purpose
          });
        }
      }
    });

    return list;
  };

  // Filter lists based on role select
  const currentSimEmployee = employees.find(e => e.id === simulatedEmployeeId) || employees[0];

  // Active list of my requests (employee context)
  const myRequests = requests.filter(req => req.employeeId === simulatedEmployeeId);

  // Handle submitting a off-site request
  const handleRequestSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formPurpose) {
      alert('กรุณากรอกวัตถุประสงค์ในการลงพื้นที่ปฏิบัติงาน');
      return;
    }

    let finalLocation: LocationCoordinates;
    if (isCustomLocToggle) {
      finalLocation = {
        name: formCustomLocationName || 'สถานที่ระบุพิเศษนอกสารบบ',
        lat: parseFloat(formCustomLat) || 13.756,
        lng: parseFloat(formCustomLng) || 100.501,
        address: formCustomAddress || 'กรุงเทพมหานครและปริมณฑล'
      };
    } else {
      const preset = POPULAR_LOCATIONS.find(loc => loc.name === formLocationPreset);
      if (preset) {
        finalLocation = preset;
      } else {
        finalLocation = POPULAR_LOCATIONS[0];
      }
    }

    // Unified Planning & Auto-Approval Logic:
    // Any employee with an approved plan for this date gets auto-approved,
    // otherwise the request goes to 'pending' status for manager approval.
    let autoApprove = false;
    let matchingPlan: OffSitePlan | undefined = plans.find(plan => 
      plan.employeeId === currentSimEmployee.id &&
      plan.status === 'approved' &&
      plan.plannedDates.some(pd => pd.date === formDate)
    );

    if (matchingPlan) {
      autoApprove = true;
    }

    const newRequest: OffSiteRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      employeeId: currentSimEmployee.id,
      employeeName: currentSimEmployee.name,
      role: currentSimEmployee.role,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      location: finalLocation,
      purpose: formPurpose,
      status: autoApprove ? 'approved' : 'pending',
      approvedBy: autoApprove ? 'ระเบียบอนุมัติแผนงานล่วงหน้าอัตโนมัติ' : undefined,
      approvedAt: autoApprove ? new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH').slice(0, 5) : undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRequests(prev => [newRequest, ...prev]);
    setFormPurpose('');
    setFormCustomLocationName('');
    setFormCustomAddress('');
    
    if (autoApprove) {
      setFormSuccessMessage(`⚡ อนุมัติสำเร็จทันที! เนื่องจากพบแผนล่วงหน้าที่ผ่านการอนุมัติแล้ว (${matchingPlan?.title || 'แผนงานประจำ'}) ท่านสามารถกดเริ่มเช็คอินพิกัดได้ทันที`);
    } else {
      setFormSuccessMessage(`ส่งขออนุมัติพื้นที่ [${finalLocation.name}] สำเร็จแล้ว รอหัวหน้างานอนุมัติแบบเคสรายครั้ง`);
    }
    
    setTimeout(() => {
      setFormSuccessMessage('');
    }, 6000);
  };

  // Approval Handlers
  const triggerApprove = (id: string, approve: boolean) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const approvedByText = loggedInUser 
          ? `${loggedInUser.name} (${loggedInUser.position === 'admin' ? 'ผู้ดูแลระบบ' : loggedInUser.role})`
          : 'หัวหน้างานฝ่ายวิจัยการกระจายและการแข่งขัน';
        return {
          ...req,
          status: approve ? 'approved' : 'rejected',
          approvedBy: approvedByText,
          approvedAt: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH').slice(0, 5)
        };
      }
      return req;
    }));
  };

  // HAversine Formula to calculate distance between checkin pin & target location limit
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // returns distance in meters
  };

  const approvePlanAndGenerateRequests = (planId: string, approvedByString: string) => {
    const planToGen = plans.find(p => p.id === planId);
    
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          status: 'approved',
          approvedBy: approvedByString,
          approvedAt: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH').slice(0, 5)
        };
      }
      return p;
    }));

    if (planToGen) {
      const emp = employees.find(e => e.id === planToGen.employeeId);
      const newReqs: OffSiteRequest[] = planToGen.plannedDates.map((pd, index) => {
        // Avoid duplicate request generation
        const exists = requests.some(r => r.employeeId === planToGen.employeeId && r.date === pd.date);
        if (exists) return null;
        
        return {
          id: `REQ-${Date.now().toString().slice(-6)}-${index}-${Math.floor(Math.random() * 1000)}`,
          employeeId: planToGen.employeeId,
          employeeName: planToGen.employeeName,
          role: emp?.role || 'พนักงานปฏิบัติการ',
          date: pd.date,
          startTime: pd.startTime,
          endTime: pd.endTime,
          location: pd.location,
          purpose: pd.purpose,
          status: 'approved',
          approvedBy: approvedByString,
          approvedAt: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH').slice(0, 5),
          createdAt: new Date().toISOString().split('T')[0]
        };
      }).filter(Boolean) as OffSiteRequest[];
      
      if (newReqs.length > 0) {
        setRequests(prev => [...newReqs, ...prev]);
      }
    }
  };

  // Perform GPS Check-In operations
  const triggerCheckIn = (id: string, targetLat: number, targetLng: number) => {
    // Determine checking latitude/longitude
    let checkInLat = targetLat;
    let checkInLng = targetLng;
    let distance = 0;

    // Is client simulating real browser coordinates or forced coordinates matchmaking?
    if (!simulatedGeoMatched && browserGeo) {
      checkInLat = browserGeo.lat;
      checkInLng = browserGeo.lng;
      distance = calculateDistance(checkInLat, checkInLng, targetLat, targetLng);
    } else {
      // Teleporting matches target perfectly
      distance = Math.floor(Math.random() * 32) + 5; // offset 5-37 meters (within range)
    }

    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          checkIn: {
            time: new Date().toLocaleTimeString('th-TH', { hour12: false }),
            lat: checkInLat,
            lng: checkInLng,
            distanceMeters: distance,
            deviceInfo: navigator.userAgent
          }
        };
      }
      return req;
    }));
  };

  // Submit Check-Out Form Details
  const handleCheckOutSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!checkoutRequestId) return;

    const req = requests.find(r => r.id === checkoutRequestId);
    if (!req) return;

    let checkOutLat = req.location.lat;
    let checkOutLng = req.location.lng;

    if (!simulatedGeoMatched && browserGeo) {
      checkOutLat = browserGeo.lat;
      checkOutLng = browserGeo.lng;
    }

    setRequests(prev => prev.map(item => {
      if (item.id === checkoutRequestId) {
        return {
          ...item,
          checkOut: {
            time: new Date().toLocaleTimeString('th-TH', { hour12: false }),
            lat: checkOutLat,
            lng: checkOutLng,
            workSummary: checkoutWorkSummary || 'ปฏิบัติภารกิจลุล่วงหน้างาน ส่งเสริมภาพลักษณ์และการจำหน่ายของเล่นในจุดจำหน่าย',
            issueFound: checkoutIssueFound || 'ไม่มีปัญหา',
            issueResolved: checkoutIssueResolved,
            workImage: checkoutWorkImage || undefined,
            deviceInfo: navigator.userAgent
          }
        };
      }
      return item;
    }));

    setCheckoutRequestId(null);
    setCheckoutWorkSummary('');
    setCheckoutIssueFound('');
    setCheckoutIssueResolved(true);
    setCheckoutWorkImage('');
  };

  // Resolve problems toggle (Manager function / Employee completed marker)
  const resolveIssueOnUI = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId && req.checkOut) {
        return {
          ...req,
          checkOut: {
            ...req.checkOut,
            issueResolved: true
          }
        };
      }
      return req;
    }));
  };

  // Unresolve problems toggle (for debugging and playground status)
  const unresolveIssueOnUI = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId && req.checkOut) {
        return {
          ...req,
          checkOut: {
            ...req.checkOut,
            issueResolved: false
          }
        };
      }
      return req;
    }));
  };

  // --- USER ACCESS SCOPE FILTERS FOR CALENDAR & DASHBOARD (based on Approval Line) ---
  const myScopeRequests = useMemo(() => {
    if (!loggedInUser) return [];
    if (loggedInUser.position === 'admin') {
      return requests;
    }
    return requests.filter(r => 
      r.employeeId === loggedInUser.id || 
      employees.find(e => e.id === r.employeeId)?.approverId === loggedInUser.id
    );
  }, [requests, employees, loggedInUser]);

  const myScopePlans = useMemo(() => {
    if (!loggedInUser) return [];
    if (loggedInUser.position === 'admin') {
      return plans;
    }
    return plans.filter(p => 
      p.employeeId === loggedInUser.id || 
      employees.find(e => e.id === p.employeeId)?.approverId === loggedInUser.id
    );
  }, [plans, employees, loggedInUser]);

  const pendingRequestsToApprove = useMemo(() => {
    if (!loggedInUser) return [];
    return requests.filter(r => {
      if (r.status !== 'pending') return false;
      if (loggedInUser.position === 'admin') return true;
      const emp = employees.find(e => e.id === r.employeeId);
      return emp?.approverId === loggedInUser.id;
    });
  }, [requests, employees, loggedInUser]);

  const pendingPlansToApprove = useMemo(() => {
    if (!loggedInUser) return [];
    return plans.filter(p => {
      if (p.status !== 'pending') return false;
      if (loggedInUser.position === 'admin') return true;
      const emp = employees.find(e => e.id === p.employeeId);
      return emp?.approverId === loggedInUser.id;
    });
  }, [plans, employees, loggedInUser]);

  // --- STATS MATHEMATICAL CALCULATION FOR DASHBOARD METRICS ---
  const dashboardStats = useMemo(() => {
    const currentRequests = myScopeRequests.filter(r => r.date.startsWith(selectedMonth));
    const total = currentRequests.length;
    const approved = currentRequests.filter(r => r.status === 'approved').length;
    const pending = currentRequests.filter(r => r.status === 'pending').length;
    const checkedIn = currentRequests.filter(r => r.status === 'approved' && r.checkIn).length;
    const completed = currentRequests.filter(r => r.status === 'approved' && r.checkOut).length;
    
    let totalIssues = 0;
    let resolvedIssues = 0;

    currentRequests.forEach(r => {
      if (r.checkOut?.issueFound && r.checkOut.issueFound !== 'ไม่มีปัญหา') {
        totalIssues += 1;
        if (r.checkOut.issueResolved) {
          resolvedIssues += 1;
        }
      }
    });

    return {
      total,
      approved,
      pending,
      checkedIn,
      completed,
      totalIssues,
      resolvedIssues,
      unresolvedIssues: totalIssues - resolvedIssues,
      activeOffSitePercentage: approved > 0 ? Math.round((completed / approved) * 100) : 0
    };
  }, [myScopeRequests, selectedMonth]);

  // List of all active issues currently reported for the checklist
  const reportedIssuesList = useMemo(() => {
    return requests
      .filter(req => {
        const matchEmployee = dashboardEmployeeFilter === '' || req.employeeId === dashboardEmployeeFilter;
        const hasIssue = req.checkOut?.issueFound && req.checkOut.issueFound !== 'ไม่มีปัญหา';
        
        let matchIssueState = true;
        if (dashboardIssueStateFilter === 'resolved') {
          matchIssueState = !!req.checkOut?.issueResolved;
        } else if (dashboardIssueStateFilter === 'unresolved') {
          matchIssueState = !req.checkOut?.issueResolved;
        }
        
        return matchEmployee && hasIssue && matchIssueState;
      })
      .sort((a, b) => {
        const dateTimeA = `${a.date}T${a.checkOut?.time || '00:00:00'}`;
        const dateTimeB = `${b.date}T${b.checkOut?.time || '00:00:00'}`;
        return dateTimeB.localeCompare(dateTimeA);
      });
  }, [requests, dashboardEmployeeFilter, dashboardIssueStateFilter]);

  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-earth-text font-sans antialiased flex flex-col justify-between py-12 px-4 relative overflow-hidden">
        {/* Decorative ambient elements */}
        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-earth-primary/5 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-earth-secondary/5 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="max-w-md w-full mx-auto my-auto space-y-7 z-10">
          {/* Logo & Headline */}
          <div className="text-center space-y-3">
            <div className="inline-flex bg-earth-primary/10 border border-earth-primary/25 text-earth-primary font-black text-[10px] tracking-widest px-3 py-1 rounded-full items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-earth-primary" />
              <span>SECURITY CENTER PORTAL</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-earth-dark leading-tight">
              KIDZ & KITZ CO., LTD.
            </h1>
            <p className="text-earth-text/80 text-xs font-semibold max-w-sm mx-auto">
              ระบบขออนุมัติปฏิบัติงานนอกสถานที่ คลุมแผนงานโครงการ และติดตามตรวจสอบพิกัด GPS ประจำสาขา
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl border border-earth-border p-6 md:p-8 shadow-md hover:shadow-lg transition-all space-y-6">
            
            {/* Tabs for role selection */}
            <div className="grid grid-cols-3 gap-1 bg-[#F2EFE9] p-1 rounded-2xl border border-earth-border/40">
              <button
                type="button"
                onClick={() => {
                  setLoginTab('employee');
                  setLoginError('');
                }}
                className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer select-none ${
                  loginTab === 'employee'
                    ? 'bg-earth-primary text-white shadow-xs'
                    : 'text-earth-text/80 hover:bg-white/30'
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>พนักงาน</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginTab('manager');
                  setLoginError('');
                }}
                className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer select-none ${
                  loginTab === 'manager'
                    ? 'bg-[#D27D59] text-white shadow-xs'
                    : 'text-earth-text/80 hover:bg-white/30'
                }`}
              >
                <MonitorCheck className="w-3.5 h-3.5 shrink-0" />
                <span>หัวหน้างาน</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginTab('admin');
                  setLoginError('');
                }}
                className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer select-none ${
                  loginTab === 'admin'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-earth-text/80 hover:bg-white/30'
                }`}
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>ผู้คุมระบบ</span>
              </button>
            </div>



            {/* Manual Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-earth-dark/90 tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-earth-primary" />
                  <span>รหัสพนักงาน หรืออีเมลติดต่อหน่วยงาน</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น KK0098 หรือ werasak.k@kidzandkitz.co.th"
                  value={inputUserId}
                  onChange={(e) => {
                    setInputUserId(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full bg-[#FAF9F6] border border-earth-border rounded-xl px-3 py-2 text-xs font-bold outline-none font-sans focus:border-earth-primary focus:ring-1 focus:ring-earth-primary transition shadow-3xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-earth-dark/90 tracking-wider mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-earth-primary" />
                  <span>รหัสผ่านเข้าใช้งาน (ระบุรหัสใดก็ได้เพื่อจำลอง)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-3 w-3 text-earth-text/45" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-earth-border rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold outline-none focus:border-earth-primary focus:ring-1 focus:ring-earth-primary transition shadow-3xs"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-black leading-relaxed flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-xs font-black shadow-sm text-white select-none cursor-pointer transition active:scale-98 text-center uppercase tracking-wide flex items-center justify-center gap-1.5 ${
                  loginTab === 'manager'
                    ? 'bg-[#D27D59] hover:bg-[#C26D49]'
                    : 'bg-earth-primary hover:bg-[#7D9A7A]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>เข้าสู่ระบบรักษาความปลอดภัย</span>
              </button>
            </form>
          </div>
        </div>

        {/* System footer */}
        <div className="text-center text-[10px] text-earth-text/50 font-black tracking-wider uppercase font-sans z-10 mt-6">
          © 2026 Kidz & Kitz Authorized Personnel Only • Safe Gatekeeper System
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-bg text-earth-text font-sans antialiased text-sm">
      {/* REAL-TIME SYSTEM BAR INFORMATION */}
      <header className="bg-earth-sidebar border-b border-earth-border py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center shadow-xs">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <KidzKitzLogo height="44px" className="w-auto" />
          </div>
          <div className="h-8 w-px bg-earth-border hidden md:block" />
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-earth-dark">
                ระบบจัดการทำงานนอกสถานที่
              </h1>
              <span className="text-[10px] font-bold bg-white text-earth-dark border border-earth-border px-2.5 py-0.5 rounded-full shadow-2xs">KIDZ & KITZ CO.</span>
            </div>
            <p className="text-earth-text/80 text-xs mt-0.5 font-medium">
              ขออนุมัติลงพื้นที่, เช็คอินระบุ GPS แท้จริง, จัดเก็บประวัติ, รายงานปัญหารายเดือน และวิเคราะห์ข้อมูล Dashboard
            </p>
          </div>
        </div>

        {/* LOGGED IN USER CONTEXT & OUTLET */}
        <div className="flex items-center gap-3 mt-4 md:mt-0 bg-white/70 p-1.5 rounded-2xl border border-earth-border shadow-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F6] rounded-xl border border-earth-border/30 text-xs shadow-3xs">
            <div className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: loggedInUser?.avatarColor || '#8BA888' }}>
              {loggedInUser?.name.charAt(0)}
            </div>
            <div className="text-left font-sans col-span-2">
              <div className="font-extrabold text-earth-dark text-[11px] leading-tight">{loggedInUser?.name}</div>
              <div className="text-[9px] text-earth-text/75 font-semibold flex items-center gap-1">
                <span className="font-mono font-bold text-earth-primary">{loggedInUser?.id}</span> • 
                <span className={`px-1 rounded-sm text-[8px] font-black ${
                  activeRole === 'admin' 
                    ? 'bg-amber-100 text-amber-850' 
                    : activeRole === 'manager' 
                      ? 'bg-orange-100 text-orange-850' 
                      : 'bg-blue-100 text-blue-850'
                }`}>
                  {activeRole === 'admin' ? 'ผู้ดูแลระบบ' : activeRole === 'manager' ? 'ผู้จัดการ' : 'พนักงาน'}
                </span>
              </div>
            </div>
          </div>

          {loggedInUser?.position === 'manager' && (
            <button
              onClick={() => {
                setActiveRole(prev => {
                  if (prev === 'employee') {
                    return 'manager';
                  } else {
                    return 'employee';
                  }
                });
              }}
              className="px-3 py-2 bg-earth-primary/10 hover:bg-earth-primary/20 text-earth-primary border border-earth-primary/30 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-3xs"
              title="สลับโหมดพนักงานเพื่อบันทึกงานของตนเอง หรือโหมดผู้จัดการเพื่ออนุมัติ"
            >
              🔄 <span className="hidden sm:inline">สลับโหมดหลัก:</span> 
              <span className="font-extrabold text-earth-secondary">
                {activeRole === 'employee' ? '➡️ อนุมัติ & ติดตาม' : '➡️ ยื่นคำขอ / แผน'}
              </span>
            </button>
          )}

          <button
            onClick={() => setIsUserManualOpen(true)}
            className="px-3.5 py-2 bg-earth-primary/10 hover:bg-earth-primary/20 text-earth-primary border border-earth-primary/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-3xs"
            title="คู่มือการใช้งานระบบและการดาวน์โหลด PDF"
          >
            <BookOpen className="w-3.5 h-3.5 text-earth-primary shrink-0" />
            <span className="hidden md:inline">คู่มือการใช้งาน 📖</span>
          </button>

          <button
            onClick={() => {
              setChangePasswordError('');
              setChangePasswordSuccess('');
              setIsChangePasswordOpen(true);
            }}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-3xs"
            title="เปลี่ยนรหัสผ่านส่วนตัวเข้าใช้งานระบบ"
          >
            <Key className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="hidden md:inline">เปลี่ยนรหัสผ่าน 🔑</span>
          </button>



          <button
            id="btn-logout"
            onClick={() => setLoggedInUser(null)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-3xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-700" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>
      </header>

      {/* SUB-HEADER USER ENVIRONMENT SUMMARY SIMULATOR INFO */}
      <section className="bg-white/60 py-3 px-6 md:px-12 border-b border-earth-border flex flex-wrap justify-between items-center gap-4 text-xs text-earth-text">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-white px-3 py-1.5 rounded-xl border border-earth-border flex items-center gap-1.5 shadow-2xs text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-earth-primary inline-block animate-pulse" />
            <span className="text-earth-dark font-extrabold">พนักงานลงบันทึก:</span>
            <span className="text-earth-dark font-black">{loggedInUser?.name} (<span className="font-mono">{loggedInUser?.id}</span>)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-earth-border px-3 py-1.5 rounded-xl shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-earth-primary" />
            <span>ตำแหน่ง GPS อุปกรณ์จำลองของคุณ: </span>
            <span className="font-mono text-earth-dark font-bold underline">
              {browserGeo ? `${browserGeo.lat.toFixed(4)}, ${browserGeo.lng.toFixed(4)}` : 'กำลังระบุพิกัด...'}
            </span>
            <button 
              id="btn-re-geolocation"
              onClick={triggerGeolocation}
              className="text-[10px] text-earth-primary hover:underline font-bold border-l border-earth-border pl-1.5 ml-1 select-none cursor-pointer"
            >
              ดึงพิกัดใหม่
            </button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <span className="text-earth-text/80 font-medium">กรองรอบสรุปผลรายเดือน:</span>
          <input
            id="global-month-picker"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border select-none border-earth-border rounded-xl px-3 py-1.5 font-bold text-earth-dark outline-none text-xs focus:ring-1 focus:ring-earth-primary cursor-pointer shadow-2xs"
          />
        </div>
      </section>

      {/* MAIN LAYOUT CANVAS */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* --- 1. MANAGER VIEW (หัวหน้างาน: DASHBOARD, DISPATCH, PENDING REQUESTS, MAP) --- */}
        {activeRole === 'manager' && (
          <div className="space-y-8">
            
            {/* Quick Metrics Panels */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div id="metric-card-total-visits" className="bg-white rounded-2xl border border-earth-border shadow-sm p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-earth-text tracking-wider">ภารกิจนอกสถานที่ทั้งหมด</span>
                <p className="text-2xl font-black text-earth-dark font-mono mt-2">{dashboardStats.total} <span className="text-xs font-normal text-earth-text/70">ครั้ง</span></p>
                <div className="w-full bg-earth-border/40 h-1 mt-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-earth-primary rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div id="metric-card-pending-approvals" className="bg-white rounded-2xl border border-earth-border shadow-sm p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-earth-secondary tracking-wider">รออนุมัติคำขอ</span>
                <p className="text-2xl font-black text-earth-secondary font-mono mt-2">{dashboardStats.pending} <span className="text-xs font-normal text-earth-text/70">รายการ</span></p>
                <div className="w-full bg-earth-border/40 h-1 mt-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-earth-secondary rounded-full" style={{ width: `${dashboardStats.total > 0 ? (dashboardStats.pending / dashboardStats.total) * 100 : 0}%` }} />
                </div>
              </div>

              <div id="metric-card-approved-visits" className="bg-white rounded-2xl border border-earth-border shadow-sm p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">อนุมัติลงพื้นที่แล้ว</span>
                <p className="text-2xl font-black text-teal-700 font-mono mt-2">{dashboardStats.approved} <span className="text-xs font-normal text-earth-text/70">ครั้ง</span></p>
                <div className="w-full bg-earth-border/40 h-1 mt-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${dashboardStats.total > 0 ? (dashboardStats.approved / dashboardStats.total) * 100 : 0}%` }} />
                </div>
              </div>

              <div id="metric-card-checked-in" className="bg-white rounded-2xl border border-earth-border shadow-sm p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-[#2E5E2A] tracking-wider">เช็คอินพิกัดสำเร็จ</span>
                <p className="text-2xl font-black text-[#2E5E2A] font-mono mt-2">{dashboardStats.checkedIn} <span className="text-xs font-normal text-earth-text/70">แห่ง</span></p>
                <div className="w-full bg-earth-border/40 h-1 mt-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dashboardStats.approved > 0 ? (dashboardStats.checkedIn / dashboardStats.approved) * 100 : 0}%` }} />
                </div>
              </div>

              <div id="metric-card-reported-issues" className="bg-white rounded-2xl border border-earth-border shadow-sm p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">รายงานเสร็จ / ปัญหาคงค้าง</span>
                <p className="text-xl font-black text-earth-dark font-mono mt-2">
                  {dashboardStats.completed}/{dashboardStats.unresolvedIssues} <span className="text-xs font-normal text-earth-text/70">เคส</span>
                </p>
                <div className="w-full bg-earth-border/40 h-1 mt-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dashboardStats.totalIssues > 0 ? (dashboardStats.unresolvedIssues / dashboardStats.totalIssues) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* MANAGER WORKFORCE CALENDAR VIEW */}
            <ManagerCalendar 
              requests={myScopeRequests}
              selectedMonth={selectedMonth}
              employees={employees}
              plans={plans}
              loggedInUser={loggedInUser}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* PART 1: EMPLOYEE GROUPS ASSIGNER (DISABLED FOR MANAGERS) */}
                {false && (
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="font-bold text-earth-dark text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Shuffle className="w-4 h-4 text-earth-primary" />
                    <span>บริหารสิทธิ์จำแนกขีดพนักงาน ({employees.length} ท่าน)</span>
                  </h4>
                  <div className="border border-earth-border rounded-2xl overflow-hidden bg-[#FCFAF7] divide-y divide-earth-border/40">
                    {employees.map(emp => {
                      const hasRegGroup = emp.workGroup === 'regular';
                      return (
                        <div key={emp.id} className="p-3 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#FAF8F5]">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: emp.avatarColor || '#3A5C3D' }} />
                              <p className="font-bold text-earth-dark text-xs">{emp.name}</p>
                            </div>
                            <p className="text-[10px] text-earth-text/80 pl-4">{emp.role} | {emp.department}</p>
                            <div className="mt-1 pl-4">
                              <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                                hasRegGroup 
                                  ? 'bg-[#E2EBE0] text-[#2E5E2A] border-[#8BA888]/40' 
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {hasRegGroup ? 'ทำงานประจำล่วงหน้า (ต้องยื่นแผน)' : 'ทำงานรายครั้งปกติ'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setEmployees(prev => prev.map(e => {
                                if (e.id === emp.id) {
                                  return { ...e, workGroup: e.workGroup === 'regular' ? 'adhoc' : 'regular' };
                                }
                                return e;
                              }));
                            }}
                            className="bg-white hover:bg-earth-sidebar text-earth-dark text-[10px] font-extrabold px-3 py-1.5 rounded-xl border border-earth-border transition cursor-pointer select-none whitespace-nowrap active:scale-95 text-center w-full sm:w-auto"
                          >
                            🔄 สลับกลุ่มพนักงาน
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* MENU FOR CREATING NEW EMPLOYEE & ASSIGNING ROLES/CHANNELS */}
                  <div className="bg-white rounded-3xl border border-earth-border p-5 shadow-sm space-y-4 mt-5">
                    <div className="border-b border-earth-border pb-3 flex justify-between items-center">
                      <div>
                        <h5 className="font-extrabold text-earth-dark text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <UserPlus className="w-4 h-4 text-earth-primary" />
                          <span>สร้างรหัสพนักงานใหม่ & กำหนดตำแหน่ง</span>
                        </h5>
                        <p className="text-[10px] text-earth-text/85">เพิ่มพนักงาน กำหนดสิทธิ์ตำแหน่ง (พนักงาน/หัวหน้างาน) และคู่สายอนุมัติประจำตัว</p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs text-earth-dark">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-earth-dark/95 mb-1">รหัสพนักงาน *</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              required
                              placeholder="เช่น KK0225"
                              value={newEmpId}
                              onChange={(e) => {
                                setNewEmpId(e.target.value.toUpperCase());
                                setNewEmpSuccessMsg('');
                              }}
                              className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-bold outline-none uppercase font-mono shadow-3xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setNewEmpSuccessMsg('');
                                let maxNum = 0;
                                employees.forEach(emp => {
                                  if (emp.id.startsWith('KK')) {
                                    const num = parseInt(emp.id.replace('KK', ''), 10);
                                    if (!isNaN(num) && num > maxNum) {
                                      maxNum = num;
                                    }
                                  }
                                });
                                const nextNum = maxNum > 0 ? maxNum + 1 : 225;
                                setNewEmpId(`KK${nextNum.toString().padStart(4, '0')}`);
                              }}
                              className="bg-earth-primary/10 text-earth-primary hover:bg-earth-primary/20 border border-earth-primary/20 px-2 rounded-xl text-[10px] font-black transition whitespace-nowrap cursor-pointer select-none"
                            >
                              แนะนำ ✨
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-earth-dark/95 mb-1">ชื่อ - นามสกุล *</label>
                          <input
                            type="text"
                            required
                            placeholder="ระบุชื่อภาษาไทย"
                            value={newEmpName}
                            onChange={(e) => {
                              setNewEmpName(e.target.value);
                              setNewEmpSuccessMsg('');
                            }}
                            className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-bold outline-none shadow-3xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-earth-dark/95 mb-1">ตำแหน่งงานการแข่งขัน *</label>
                          <input
                            type="text"
                            required
                            placeholder="เช่น ผู้อนุมัติโครงการ, เจ้าหน้าที่สาธิต"
                            value={newEmpRole}
                            onChange={(e) => setNewEmpRole(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-bold outline-none shadow-3xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-earth-dark/95 mb-1">อีเมลติดต่อองค์กร *</label>
                          <input
                            type="email"
                            required
                            placeholder="user@kidzandkitz.co.th"
                            value={newEmpEmail}
                            onChange={(e) => {
                              setNewEmpEmail(e.target.value);
                              setNewEmpSuccessMsg('');
                            }}
                            className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-bold outline-none shadow-3xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-earth-dark/95 mb-1">แผนกต้นสังกัด *</label>
                          <input
                            type="text"
                            required
                            value={newEmpDept}
                            onChange={(e) => setNewEmpDept(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-bold outline-none shadow-3xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-earth-dark/95 mb-1">กลุ่มลงบันทึกงานภารกิจ</label>
                          <select
                            value={newEmpWorkGroup}
                            onChange={(e) => setNewEmpWorkGroup(e.target.value as 'regular' | 'adhoc')}
                            className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-bold outline-none shadow-3xs text-xs"
                          >
                            <option value="adhoc">เข้าทำแบบปกติอนุมัติรายครั้ง (ไม่ต้องส่งแผน)</option>
                            <option value="regular">เข้าทำประจำสม่ำเสมอ (ส่งร่างแผนล่วงหน้า)</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-[#FAF8F4] p-3 rounded-2xl border border-earth-border space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-extrabold text-[#C2410C]/90 mb-1">ระดับสิทธิ์ตำแหน่ง *</label>
                            <select
                              value={newEmpPosition}
                              onChange={(e) => {
                                const val = e.target.value as 'employee' | 'manager';
                                setNewEmpPosition(val);
                                setNewEmpSuccessMsg('');
                                setSelectedApproverId('KK0031');
                              }}
                              className="w-full bg-white border border-earth-border rounded-xl px-2 py-1.5 font-bold outline-none shadow-3xs text-xs cursor-pointer"
                            >
                              <option value="employee">👨‍💼 พนักงานปฏิบัติการ</option>
                              <option value="manager">👑 หัวหน้างาน / ผู้จัดการ</option>
                            </select>
                          </div>

                          {(newEmpPosition === 'employee' || newEmpPosition === 'manager') ? (
                            <div>
                              <label className="block text-[10px] uppercase font-extrabold text-earth-primary mb-1">หัวหน้าผู้อนุมัติ (สายอนุมัติ) *</label>
                              <select
                                value={selectedApproverId}
                                onChange={(e) => {
                                  setSelectedApproverId(e.target.value);
                                  setNewEmpSuccessMsg('');
                                }}
                                className="w-full bg-white border border-earth-border rounded-xl px-2 py-1.5 font-bold outline-none shadow-3xs text-xs cursor-pointer"
                              >
                                {employees
                                  .filter(e => e.position === 'manager' || e.role.includes('จัดการ') || e.id === 'KK0031')
                                  .map(m => (
                                    <option key={m.id} value={m.id}>
                                      {m.name} ({m.role.split(' (')[0]})
                                    </option>
                                  ))}
                                <option value="custom">✍️ ระบุหัวหน้างานกำหนดเอง...</option>
                              </select>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-earth-text/50 mb-1">ผู้จัดการสูงสุด</label>
                              <div className="text-[10px] text-earth-text/80 bg-white/70 border border-dashed border-earth-border/60 p-2 rounded-lg text-center font-bold">
                                ฝ่ายผู้มีอำนาจอนุมัติคำขอ
                              </div>
                            </div>
                          )}
                        </div>

                        {((newEmpPosition === 'employee' || newEmpPosition === 'manager') && selectedApproverId === 'custom') && (
                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-bold text-rose-700">พิมพ์ระบุชื่อหัวหน้าผู้อนุมัติใหม่</label>
                            <input
                              type="text"
                              placeholder="เช่น คุณสมบัติ ยอดทอง (ผู้จัดการฝ่ายการตลาด)"
                              value={customApproverName}
                              onChange={(e) => {
                                setCustomApproverName(e.target.value);
                                setNewEmpSuccessMsg('');
                              }}
                              className="w-full bg-white border border-rose-300 rounded-xl px-2 py-1.5 font-bold outline-none shadow-3xs text-xs"
                              required
                            />
                          </div>
                        )}

                        <div className="border-t border-earth-border/40 my-2 pt-2">
                          <label className="block text-[10px] uppercase font-extrabold text-earth-dark mb-1 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-earth-primary" />
                            <span>รหัสผ่านตั้งต้นเข้าใช้งานระบบ * (Initial Password)</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="เช่น 1234"
                            value={newEmpPassword}
                            onChange={(e) => {
                              setNewEmpPassword(e.target.value);
                              setNewEmpSuccessMsg('');
                            }}
                            className="w-full bg-white border border-earth-border rounded-xl px-2.5 py-1.5 font-bold outline-none font-mono shadow-3xs text-xs"
                          />
                          <p className="text-[9px] text-earth-text/60 mt-0.5">พนักงานปฏิบัติการสามารถสลับโปรไฟล์ความปลอดภัยและแก้ไขรหัสผ่านใหม่ด้วยตนเองได้ทุกเมื่อ</p>
                        </div>
                      </div>

                      {newEmpSuccessMsg && (
                        <div className="p-2.5 bg-[#E2EBE0] border border-[#8BA888]/55 rounded-xl text-[#2E5E2A] text-[11px] font-black leading-relaxed">
                          🎉 {newEmpSuccessMsg}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-earth-primary hover:bg-earth-primary/95 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer select-none transition-all active:scale-98 text-center"
                      >
                        ➕ ลงทะเบียนบันทึกพนักงานใหม่เข้าสู่ระบบ
                      </button>
                    </form>
                  </div>
                </div>
                )}

                {/* PART 2: PLAN APPROVALS DESK (Expanded full width) */}
                <div className="lg:col-span-12 space-y-4">
                  <h4 className="font-bold text-earth-dark text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-earth-primary" />
                    <span>คำขออนุมัติร่างตารางแผนปฏิบัติงานนอกสถานที่ ({pendingPlansToApprove.length} ฉบับเสนอล่าสุด)</span>
                  </h4>

                  {pendingPlansToApprove.length === 0 ? (
                    <div className="text-center py-10 text-earth-text/60 border border-dashed border-earth-border rounded-2xl bg-white">
                      <CheckCircle2 className="w-8 h-8 text-earth-primary/50 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-earth-primary">พิจารณาโครงสร้างเสร็จสิ้นครบ!</p>
                      <p className="text-[10px] text-earth-text/80 mt-0.5">พนักงานกลุ่มประจำได้รับการอนุมัติแผนทั้งหมดแล้วในระบบขณะนี้</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[365px] overflow-y-auto pr-1">
                      {pendingPlansToApprove.map(plan => (
                        <div key={plan.id} className="p-4 rounded-2xl border border-earth-border bg-white space-y-3 shadow-3xs relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8BA888]" />
                          <div className="flex justify-between items-start pl-1.5">
                            <div>
                              <p className="font-bold text-earth-dark text-xs">{plan.title}</p>
                              <p className="text-[11px] text-earth-text/80">ผู้ยื่นเสนอ: <span className="font-bold text-earth-dark">{plan.employeeName}</span> ({plan.employeeId})</p>
                              {(() => {
                                const allConflicts = plan.plannedDates.flatMap(pd => checkDateConflicts(plan.id, plan.employeeId, pd.date, pd.location.name, pd.purpose));
                                if (allConflicts.length > 0) {
                                  return (
                                    <div className="mt-1.5 inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/60 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                      <span>ตรวจพบแผนงานซ้ำซ้อน {allConflicts.length} จุด</span>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="mt-1.5 inline-flex items-center gap-1 bg-green-50 text-green-800 border border-green-200/40 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                      <span>ไม่พบลักษณะทับซ้อน</span>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                            <span className="text-[9px] bg-earth-primary/15 text-earth-primary border border-earth-primary/20 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                              ร่างแผนราย{plan.type === 'day' ? 'วัน' : plan.type === 'weekly' ? 'สัปดาห์' : 'เดือน'}
                            </span>
                          </div>

                          {/* Planned days table inside draft plan card */}
                          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-earth-border/40 space-y-1.5 flex flex-col">
                            <p className="text-[10px] font-bold text-earth-text border-b border-earth-border pb-1">รายละเอียดหน้างานที่ประสงค์ขอปฏิบัตินอกสถานที่ล่วงหน้า:</p>
                            <div className="divide-y divide-earth-border/30 max-h-[200px] overflow-y-auto pt-0.5 space-y-2">
                              {plan.plannedDates.map((pDate, pdIdx) => (
                                <div key={pdIdx} className="text-[11px] py-1 text-earth-text space-y-1">
                                  <div className="flex justify-between font-mono font-bold text-earth-dark text-[10px]">
                                    <span>📅 วันที่: {pDate.date.split('-').reverse().join('/')}</span>
                                    <span className="text-earth-primary">{pDate.startTime} - {pDate.endTime} น.</span>
                                  </div>
                                  <p className="font-medium text-earth-dark/95 leading-relaxed text-[10.5px]">
                                    <span>ที่ตั้งเป้าหมาย: <span className="font-bold text-earth-dark">{pDate.location.name}</span></span>
                                  </p>
                                  <p className="italic text-[10px] text-earth-text pl-4">วัตถุประสงค์หลัก: "{pDate.purpose}"</p>

                                  {(() => {
                                    const dateConflicts = checkDateConflicts(plan.id, plan.employeeId, pDate.date, pDate.location.name, pDate.purpose);
                                    if (dateConflicts.length === 0) return null;
                                    return (
                                      <div className="mt-1.5 ml-4 p-2 bg-amber-50/80 border border-amber-300/50 rounded-xl text-[10px] text-amber-900 space-y-1 shadow-3xs">
                                        <div className="flex items-center gap-1.5 font-bold text-amber-800">
                                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                          <span>พนักงานท่านอื่นลงสถานที่เดียวกันในวันและเรื่องเดียวกัน:</span>
                                        </div>
                                        <div className="space-y-0.5 pl-4.5">
                                          {dateConflicts.map((conf, cIdx) => (
                                            <div key={cIdx} className="flex flex-wrap items-center gap-x-1 py-0.5 leading-relaxed text-[9.5px]">
                                              <span>• <span className="font-bold text-amber-955">{conf.employeeName}</span> ({conf.employeeId})</span>
                                              <span className="text-[8px] px-1 bg-amber-100 text-amber-800 border border-amber-200 rounded">
                                                {conf.sourceType === 'plan' ? 'แผนล่วงหน้า' : 'คำขอรายครั้ง'} ({conf.status === 'approved' ? 'อนุมัติแล้ว' : 'รออนุมัติ'})
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Plan approve action items */}
                          <div className="flex justify-end gap-2 text-xs pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const reason = prompt('กรุณาระบุรายละเอียดสาเหตุที่ไม่อนุมัติแผนปฏิบัติงานล่วงหน้าครั้งนี้:', 'รายละเอียดแผนการทำงานซ้ำซ้อนหรือจุดสถานที่ยังไม่สมบูรณ์');
                                if (reason === null) return;
                                setPlans(prev => prev.map(p => {
                                  if (p.id === plan.id) {
                                    return {
                                      ...p,
                                      status: 'rejected',
                                      rejectedReason: reason,
                                      approvedBy: loggedInUser ? `${loggedInUser.name} (${loggedInUser.role})` : 'ผู้อนุมัติ',
                                      approvedAt: new Date().toLocaleDateString('th-TH')
                                    };
                                  }
                                  return p;
                                }));
                              }}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 transition font-bold cursor-pointer text-[10.5px]"
                            >
                              🙅‍♂️ ปฏิเสธแผนงาน
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const allConflicts = plan.plannedDates.flatMap(pd => checkDateConflicts(plan.id, plan.employeeId, pd.date, pd.location.name, pd.purpose));
                                if (allConflicts.length > 0) {
                                  const confirmMsg = `⚠️ ตรวจพบพนักงานลงปฏิบัติงานทับซ้อนกันทั้งหมด ${allConflicts.length} จุด!\n(ลงปฏิบัติงานในวันเดียวกัน สถานที่เดียวกัน และเรื่องวัตถุประสงค์เดียวกัน)\n\nรายชื่อพนักงานที่ทับซ้อน:\n` +
                                    allConflicts.map((c, i) => `  ${i+1}. คุณ${c.employeeName} (${c.employeeId}) [${c.sourceType === 'plan' ? 'แผนล่วงหน้า' : 'คำขอรายครั้ง'}] (${c.status === 'approved' ? 'อนุมัติแล้ว' : 'รออนุมัติ'})\n     วัตถุประสงค์: "${c.purpose}"`).join('\n') +
                                    `\n\nคุณ ${loggedInUser?.name || 'หัวหน้างาน'} ยืนยันการอนุมัติแผนปฏิบัติงานของ ${plan.employeeName} ต่อไปหรือไม่?`;
                                  if (!window.confirm(confirmMsg)) {
                                    return;
                                  }
                                }

                                 approvePlanAndGenerateRequests(plan.id, loggedInUser ? `${loggedInUser.name} (${loggedInUser.role})` : 'ผู้อนุมัติ');
                              }}
                              className="px-4 py-1.5 bg-earth-primary hover:bg-[#799976] text-white rounded-lg transition font-bold cursor-pointer active:scale-95 shadow-2xs text-[10.5px]"
                            >
                              🙆‍♂️ อนุมัติแผนล่วงหน้า
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            {/* PENDING APPROVAL REQUESTS (ขออนุมัติการทำงานนอกสถานที่) */}
            <div id="pending-approvals-panel" className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-earth-border pb-3">
                <div>
                  <h3 className="font-bold text-earth-dark text-base flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-earth-primary" />
                    <span>คำขออนุมัติลงพื้นที่นอกสถานที่ล่าช้า ({pendingRequestsToApprove.length} รายการที่รออยู่)</span>
                  </h3>
                  <p className="text-xs text-earth-text/80">หัวหน้าพิจารณาอนุมัติพิกัด และเป้าหมายภารกิจเพื่ออนุญาตให้บุคลากรเข้าถึงระบายเช็คอิน</p>
                </div>
                <span className="text-[11px] font-medium text-earth-text/60">อนุมัติแบบเรียลไทม์</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequestsToApprove.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-earth-border hover:border-earth-primary/50 bg-[#FBF9F6] transition-all flex flex-col justify-between gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-earth-sand" />
                    <div className="space-y-2.5 pl-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-earth-dark text-sm">{req.employeeName}</p>
                          <p className="text-[11px] text-earth-text/80">{req.role}</p>
                        </div>
                        <span className="font-mono text-xs text-earth-text bg-white px-2.5 py-1 rounded-lg border border-earth-border shadow-3xs">{req.date}</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-earth-text bg-white p-3 rounded-xl border border-earth-border/60 shadow-3xs">
                        <p className="flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-earth-primary mt-0.5 shrink-0" />
                          <span><span className="font-bold text-earth-dark">จุดลงปฏิบัติหน้าที่:</span> {req.location.name}</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <Clock3 className="w-4 h-4 text-earth-primary mt-0.5 shrink-0" />
                          <span className="font-mono font-semibold">{req.startTime} น. ถึง {req.endTime} น.</span>
                        </p>
                        <p className="mt-2 text-earth-text font-medium border-t border-earth-border/45 pt-1.5">
                          <span className="font-bold text-earth-text/60 block text-[10px] uppercase">วัตถุประสงค์ในการปฏิบัติงาน:</span>
                          <span className="italic text-earth-dark">"{req.purpose}"</span>
                        </p>
                      </div>
                    </div>

                     {/* Action Buttons to Approve or Reject */}
                    <div className="flex gap-2.5 pt-1 pr-1 pl-1.5 justify-end">
                      <button
                        onClick={() => triggerApprove(req.id, false)}
                        className="bg-[#FCF5F2] hover:bg-[#F2D7CD] text-[#D27D59] border border-earth-secondary/10 font-sans font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition hover:scale-95"
                      >
                        <X className="w-4 h-4" />
                        <span>ปฏิเสธคำขอ</span>
                      </button>
                      <button
                        onClick={() => triggerApprove(req.id, true)}
                        className="bg-[#8BA888] hover:bg-[#799976] text-white font-sans font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition shadow-xs hover:scale-95 active:scale-90"
                      >
                        <Check className="w-4 h-4" />
                        <span>อนุมัติลงพื้นที่</span>
                      </button>
                    </div>

                  </div>
                ))}

                {pendingRequestsToApprove.length === 0 && (
                  <div className="col-span-1 md:col-span-2 text-center py-10 text-earth-text/60 italic bg-[#FAF8F5] rounded-2xl border border-dashed border-earth-border w-full">
                    <CheckCircle className="w-8 h-8 text-earth-primary mx-auto mb-2" />
                    <span>ไม่มีรายการสแตนด์บายรอการลงตราอนุมัติในรอบเดือนนี้</span>
                  </div>
                )}
              </div>
            </div>

            {/* PROBLEMS & ISSUES TRACKING SYSTEM (ปัญหาได้รับการแก้ไขแล้ว/ค้างอยู่) */}
            <div id="manager-issues-tracking-panel" className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-earth-border pb-3">
                <div>
                  <h3 className="font-bold text-earth-dark text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-earth-secondary animate-pulse" />
                    <span>ตารางรายงานข้อผิดพลาดและปัญหาหน้างาน (Resolved / Unresolved Tracking)</span>
                  </h3>
                  <p className="text-xs text-earth-text/80">ติดตามรายงานปัญหาจากพนักงานหลังจากทำ Check-Out และอนุมัติสถานะการแก้ไข</p>
                </div>

                <div className="flex flex-wrap gap-2.5 items-center">
                  <select
                    id="issues-employee-filter"
                    value={dashboardEmployeeFilter}
                    onChange={(e) => setDashboardEmployeeFilter(e.target.value)}
                    className="bg-earth-sidebar text-xs border border-earth-border rounded-xl py-1.5 px-3 font-semibold text-earth-dark outline-none focus:ring-1 focus:ring-earth-primary"
                  >
                    <option value="">กรองพนักงานทั้งหมด</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>

                  <select
                    id="issues-status-filter"
                    value={dashboardIssueStateFilter}
                    onChange={(e) => setDashboardIssueStateFilter(e.target.value)}
                    className="bg-earth-sidebar text-xs border border-earth-border rounded-xl py-1.5 px-3 font-semibold text-earth-dark outline-none focus:ring-1 focus:ring-earth-primary"
                  >
                    <option value="all">สถานะปัญหา (ทั้งหมด)</option>
                    <option value="unresolved">ค้างการแก้ไข (Unresolved)</option>
                    <option value="resolved">ได้รับการแก้ไขแล้ว (Resolved)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-earth-border">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] text-earth-text uppercase font-bold tracking-wider border-b border-earth-border text-[10px]">
                      <th className="p-3">วันที่แจ้ง</th>
                      <th className="p-3">พนักงาน</th>
                      <th className="p-3">สถานที่จัดงาน</th>
                      <th className="p-3">ปัญหาหน้างานที่พบ</th>
                      <th className="p-3">สถานะความก้าวหน้า</th>
                      <th className="p-3 text-right">ปรับปรุงสถานะปัญหา</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-border bg-white">
                    {reportedIssuesList.map((req) => (
                      <tr key={req.id} className="hover:bg-[#FCFAF7] transition-colors">
                        <td className="p-3 font-mono text-earth-text whitespace-nowrap">{req.date}</td>
                        <td className="p-3">
                          <p className="font-bold text-earth-dark">{req.employeeName}</p>
                          <p className="text-[10px] text-earth-text/80">{req.role.split(' (')[0]}</p>
                        </td>
                        <td className="p-3 text-earth-dark font-bold">{req.location.name}</td>
                        <td className="p-3 max-w-sm">
                          <p className="text-earth-text block leading-relaxed italic">"{req.checkOut?.issueFound}"</p>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[10px] ${
                            req.checkOut?.issueResolved 
                              ? 'bg-[#E2EBE0] text-[#2E5E2A]' 
                              : 'bg-orange-50 text-earth-secondary border border-orange-200 animate-pulse'
                          }`}>
                            {req.checkOut?.issueResolved ? <CheckCircle2 className="w-3 h-3 text-[#2E5E2A]" /> : <AlertTriangle className="w-3 h-3 text-earth-secondary" />}
                            {req.checkOut?.issueResolved ? 'แก้ไขเสร็จสิ้นแล้ว' : 'กำลังประสานงานค้างคา'}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {req.checkOut?.issueResolved ? (
                            <button
                              onClick={() => unresolveIssueOnUI(req.id)}
                              className="bg-earth-sidebar text-[#6B6359] hover:bg-earth-border/40 border border-earth-border px-2.5 py-1.5 rounded-xl font-bold transition text-[11px] cursor-pointer"
                            >
                              ตั้งเป็นค้างแก้ไข
                            </button>
                          ) : (
                            <button
                              onClick={() => resolveIssueOnUI(req.id)}
                              className="bg-earth-primary hover:bg-[#799976] text-white font-sans font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 text-[11px] cursor-pointer shadow-3xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>อนุมัติว่าแก้ไขแล้ว</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {reportedIssuesList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-earth-text/60 italic bg-white rounded-xl">
                          ไม่พบรายงานปัญหาที่ตรงความเงื่อนไขการกรองขณะนี้
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AUTOMATED MONTHLY REPORT (สรุปผลรายงานรายเดือนส่งหัวหน้าโดยอัตโนมัติ) */}
            <div id="monthly-report-panel" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-earth-dark text-base md:text-lg">รายงานและประวัติงานนอกสถานที่แบบรายเดือนอย่างเป็นทางการ</h3>
                <span className="text-xs text-earth-primary font-bold bg-[#E2EBE0] border border-earth-border px-3 py-1 rounded-full">พิมพ์เอกสารอัตโนมัติ</span>
              </div>
              <ReportTemplate
                selectedMonth={selectedMonth}
                requests={requests}
                selectedEmployeeId={dashboardEmployeeFilter}
                employees={employees}
              />
            </div>

          </div>
        )}

        {/* --- 1.5. ADMIN VIEW (ผู้ควบคุมระบบ: USER MANAGEMENT & INITIALIZATION DESK) --- */}
        {activeRole === 'admin' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Admin Header Context Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-amber-600 text-white font-extrabold text-[10px] tracking-wider rounded-md uppercase">SYSTEM ADMINISTRATION</span>
                  <h3 className="font-extrabold text-earth-dark text-lg md:text-xl font-sans">ศูนย์ควบคุมและบริหารสิทธิ์ผู้ใช้งานระบบ</h3>
                </div>
                <p className="text-xs text-earth-text/85">
                  ยินดีต้อนรับผู้ดูแลระบบ คุณสามารถสร้างบัญชีผู้ใช้งานพนักงาน/หัวหน้างาน, กำหนดตำแหน่งพิกัดกลุ่มงานพิเศษ, แก้ไขรหัสผ่านพนักงาน, หรือลบบัญชีที่พ้นสภาพงานได้แบบเรียลไทม์
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-100/50 border border-amber-300/60 px-3.5 py-1.5 rounded-2xl shrink-0">
                <ShieldCheck className="w-4 h-4 text-amber-700 animate-bounce" />
                <span className="text-amber-800 text-xs font-black">สิทธิ์ระดับ: ผู้ควบคุมระบบสูงสุด</span>
              </div>
            </div>

            {/* HIGH-CONTRAST TAB NAVIGATION */}
            <div className="flex bg-[#FCFAF7] border border-earth-border p-1 rounded-2xl w-full max-w-xl shadow-3xs">
              <button
                type="button"
                onClick={() => setAdminActiveTab('dashboard')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer select-none text-center flex items-center justify-center gap-2 ${
                  adminActiveTab === 'dashboard'
                    ? 'bg-earth-primary text-white shadow-2xs'
                    : 'text-earth-dark hover:bg-earth-sidebar'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>📊 แดชบอร์ดสรุปแผนงาน & อนุมัติพิกัด</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminActiveTab('users')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer select-none text-center flex items-center justify-center gap-2 ${
                  adminActiveTab === 'users'
                    ? 'bg-earth-primary text-white shadow-2xs'
                    : 'text-earth-dark hover:bg-earth-sidebar'
                }`}
              >
                <User className="w-4 h-4" />
                <span>👥 จัดการ & สร้างสิทธิ์พนักงาน</span>
              </button>
            </div>

            {/* TAB CONTENT 1: OPERATIONAL DASHBOARD (Same as supervisor view) */}
            {adminActiveTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Quick Metrics Panels */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white rounded-2xl border border-earth-border shadow-sm p-4 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-earth-text tracking-wider">ภารกิจนอกสถานที่ทั้งหมด</span>
                    <p className="text-2xl font-black text-earth-dark font-mono mt-2">{dashboardStats.total} <span className="text-xs font-normal text-earth-text/70">ครั้ง</span></p>
                    <div className="w-full bg-earth-border/40 h-1 mt-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-earth-primary rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-earth-border shadow-sm p-4 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-earth-secondary tracking-wider">รออนุมัติคำขอ</span>
                    <p className="text-2xl font-black text-earth-secondary font-mono mt-2">{dashboardStats.pending} <span className="text-xs font-normal text-earth-text/70">รายการ</span></p>
                    <div className="w-full bg-earth-border/40 h-1 mt-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-earth-secondary rounded-full" style={{ width: `${dashboardStats.total > 0 ? (dashboardStats.pending / dashboardStats.total) * 105 : 0}%` }} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-earth-border shadow-sm p-4 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">อนุมัติลงพื้นที่แล้ว</span>
                    <p className="text-2xl font-black text-teal-700 font-mono mt-2">{dashboardStats.approved} <span className="text-xs font-normal text-earth-text/70">ครั้ง</span></p>
                    <div className="w-full bg-earth-border/40 h-1 mt-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{ width: `${dashboardStats.total > 0 ? (dashboardStats.approved / dashboardStats.total) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-earth-border shadow-sm p-4 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#2E5E2A] tracking-wider">เช็คอินพิกัดสำเร็จ</span>
                    <p className="text-2xl font-black text-[#2E5E2A] font-mono mt-2">{dashboardStats.checkedIn} <span className="text-xs font-normal text-earth-text/70">แห่ง</span></p>
                    <div className="w-full bg-earth-border/40 h-1 mt-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dashboardStats.approved > 0 ? (dashboardStats.checkedIn / dashboardStats.approved) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-earth-border shadow-sm p-4 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">รายงานเสร็จ / ปัญหาคงค้าง</span>
                    <p className="text-xl font-black text-earth-dark font-mono mt-2">
                      {dashboardStats.completed}/{dashboardStats.unresolvedIssues} <span className="text-xs font-normal text-earth-text/70">เคส</span>
                    </p>
                    <div className="w-full bg-earth-border/40 h-1 mt-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dashboardStats.totalIssues > 0 ? (dashboardStats.unresolvedIssues / dashboardStats.totalIssues) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>

                {/* MANAGER WORKFORCE CALENDAR VIEW */}
                <ManagerCalendar 
                  requests={myScopeRequests}
                  selectedMonth={selectedMonth}
                  employees={employees}
                  plans={plans}
                  loggedInUser={loggedInUser}
                />

                {/* PLAN APPROVALS DESK */}
                <div className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
                  <h4 className="font-bold text-earth-dark text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-earth-border pb-3">
                    <ClipboardList className="w-4 h-4 text-earth-primary" />
                    <span>คำขออนุมัติร่างตารางแผนปฏิบัติงานนอกสถานที่ (ผู้คุมระบบอนุมัติร่วม | {pendingPlansToApprove.length} ฉบับเสนอล่าสุด)</span>
                  </h4>

                  {pendingPlansToApprove.length === 0 ? (
                    <div className="text-center py-10 text-earth-text/60 border border-dashed border-earth-border rounded-2xl bg-white">
                      <CheckCircle2 className="w-8 h-8 text-earth-primary/50 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-earth-primary">พิจารณาโครงสร้างตารางงานพนักงานเสร็จสิ้นครบถ้วน!</p>
                      <p className="text-[10px] text-earth-text/80 mt-0.5">แผนล่วงหน้าของพนักงานทั้งหมดได้รับการตรวจสอบสิทธิ์และอนุมัติแล้ว</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                      {pendingPlansToApprove.map(plan => (
                        <div key={plan.id} className="p-4 rounded-2xl border border-earth-border bg-white space-y-3 shadow-3xs relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8BA888]" />
                          <div className="flex justify-between items-start pl-1.5">
                            <div>
                              <p className="font-bold text-earth-dark text-xs">{plan.title}</p>
                              <p className="text-[11px] text-earth-text/80">ผู้ยื่นเสนอ: <span className="font-bold text-earth-dark">{plan.employeeName}</span> ({plan.employeeId})</p>
                              {(() => {
                                const allConflicts = plan.plannedDates.flatMap(pd => checkDateConflicts(plan.id, plan.employeeId, pd.date, pd.location.name, pd.purpose));
                                if (allConflicts.length > 0) {
                                  return (
                                    <div className="mt-1.5 inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/60 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                      <span>ตรวจพบการทำงานซ้ำซ้อนกันในระบบ {allConflicts.length} จุด</span>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="mt-1.5 inline-flex items-center gap-1 bg-green-50 text-green-800 border border-green-200/40 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                      <span>ไม่พบความขัดแย้งของแผน</span>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                            <span className="text-[9px] bg-earth-primary/15 text-earth-primary border border-earth-primary/20 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                              ร่างแผนราย{plan.type === 'day' ? 'วัน' : plan.type === 'weekly' ? 'สัปดาห์' : 'เดือน'}
                            </span>
                          </div>

                          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-earth-border/40 space-y-1.5 flex flex-col">
                            <p className="text-[10px] font-bold text-earth-text border-b border-earth-border pb-1">รายละเอียดหน้างานที่ประสงค์ขอปฏิบัตินอกสถานที่ล่วงหน้า:</p>
                            <div className="divide-y divide-earth-border/30 max-h-[140px] overflow-y-auto pt-0.5 space-y-1">
                              {plan.plannedDates.map((pDate, pdIdx) => (
                                <div key={pdIdx} className="text-[11px] py-1 text-earth-text space-y-0.5">
                                  <div className="flex justify-between font-mono font-bold text-earth-dark text-[10px]">
                                    <span>📅 วันที่: {pDate.date.split('-').reverse().join('/')}</span>
                                    <span className="text-earth-primary">{pDate.startTime} - {pDate.endTime} น.</span>
                                  </div>
                                  <p className="font-medium text-earth-dark/95 leading-relaxed text-[10.5px]">
                                    <span>ที่ตั้งเป้าหมาย: <span className="font-bold text-earth-dark">{pDate.location.name}</span></span>
                                  </p>
                                  <p className="italic text-[10px] text-earth-text pl-4">วัตถุประสงค์หลัก: "{pDate.purpose}"</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 text-xs pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const reason = prompt('กรุณาระบุรายละเอียดสาเหตุที่ไม่อนุมัติแผนปฏิบัติงานล่วงหน้าครั้งนี้:', 'รายละเอียดแผนงานซ้ำซ้อนหรือจุดทำงานยังไม่ลงตัว');
                                if (reason === null) return;
                                setPlans(prev => prev.map(p => {
                                  if (p.id === plan.id) {
                                    return {
                                      ...p,
                                      status: 'rejected',
                                      rejectedReason: reason,
                                      approvedBy: `${loggedInUser?.name || 'ผู้ดูแลระบบ'} (ฝ่ายคุมระบบ)`,
                                      approvedAt: new Date().toLocaleDateString('th-TH')
                                    };
                                  }
                                  return p;
                                }));
                              }}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 transition font-bold cursor-pointer text-[10.5px]"
                            >
                              🙅‍♂️ ปฏิเสธแผนงาน
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                 approvePlanAndGenerateRequests(plan.id, `${loggedInUser?.name || 'ผู้ดูแลระบบ'} (ฝ่ายคุมระบบ)`);
                              }}
                              className="px-4 py-1.5 bg-earth-primary hover:bg-[#799976] text-white rounded-lg transition font-bold cursor-pointer active:scale-95 shadow-2xs text-[10.5px]"
                            >
                              🙆‍♂️ อนุมัติแผนล่วงหน้า
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PENDING APPROVAL REQUESTS */}
                <div className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-earth-border pb-3">
                    <div>
                      <h3 className="font-bold text-earth-dark text-base flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-earth-primary" />
                        <span>คำขออนุมัติลงพื้นที่นอกสถานที่ล่าช้า ({pendingRequestsToApprove.length} รายการที่รออยู่)</span>
                      </h3>
                      <p className="text-xs text-earth-text/80">ผู้ดูแลระบบเข้าตรวจสอบและอนุมัติลงพิกัดทดแทนหัวหน้างานได้โดยตรง</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingRequestsToApprove.map((req) => (
                      <div key={req.id} className="p-4 rounded-xl border border-earth-border hover:border-earth-primary/50 bg-[#FBF9F6] transition-all flex flex-col justify-between gap-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-earth-sand" />
                        <div className="space-y-2.5 pl-1.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-earth-dark text-sm">{req.employeeName}</p>
                              <p className="text-[11px] text-earth-text/80">{req.role}</p>
                            </div>
                            <span className="font-mono text-xs text-earth-text bg-white px-2.5 py-1 rounded-lg border border-earth-border shadow-3xs">{req.date}</span>
                          </div>

                          <div className="space-y-1.5 text-xs text-earth-text bg-white p-3 rounded-xl border border-earth-border/60 shadow-3xs">
                            <p className="flex items-start gap-1.5">
                              <MapPin className="w-4 h-4 text-earth-primary mt-0.5 shrink-0" />
                              <span><span className="font-bold text-earth-dark">จุดเป้าหมายงาน:</span> {req.location.name}</span>
                            </p>
                            <p className="flex items-start gap-1.5">
                              <Clock3 className="w-4 h-4 text-earth-primary mt-0.5 shrink-0" />
                              <span className="font-mono font-semibold">{req.startTime} น. ถึง {req.endTime} น.</span>
                            </p>
                            <p className="mt-2 text-earth-text font-medium border-t border-earth-border/45 pt-1.5">
                              <span className="font-bold text-earth-text/60 block text-[10px] uppercase">วัตถุประสงค์งาน:</span>
                              <span className="italic text-earth-dark">"{req.purpose}"</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-1 pr-1 pl-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => triggerApprove(req.id, false)}
                            className="bg-[#FCF5F2] hover:bg-[#F2D7CD] text-[#D27D59] border border-earth-secondary/10 font-sans font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition hover:scale-95"
                          >
                            <X className="w-4 h-4" />
                            <span>ปฏิเสธคำขอ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerApprove(req.id, true)}
                            className="bg-[#8BA888] hover:bg-[#799976] text-white font-sans font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition shadow-xs hover:scale-95 active:scale-90"
                          >
                            <Check className="w-4 h-4" />
                            <span>อนุมัติลงพื้นที่</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {pendingRequestsToApprove.length === 0 && (
                      <div className="col-span-1 md:col-span-2 text-center py-10 text-earth-text/60 italic bg-[#FAF8F5] rounded-2xl border border-dashed border-earth-border w-full">
                        <CheckCircle className="w-8 h-8 text-earth-primary mx-auto mb-2" />
                        <span>ไม่มีรายการส่งขอลงตราอนุญาตพิกัดในรอบเดือนนี้</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* PROBLEMS & ISSUES TRACKING SYSTEM */}
                <div className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-earth-border pb-3">
                    <div>
                      <h3 className="font-bold text-earth-dark text-base flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-earth-secondary animate-pulse" />
                        <span>รายงานปัญหาและข้อผิดพลาดหน้างานของพนักงาน (Admin Central Resolver)</span>
                      </h3>
                      <p className="text-xs text-earth-text/80">ติดตามสถานะความคืบหน้าของปัญหาและแก้ไขพิจารณาจบเคส</p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 items-center">
                      <select
                        id="admin-issues-employee-filter"
                        value={dashboardEmployeeFilter}
                        onChange={(e) => setDashboardEmployeeFilter(e.target.value)}
                        className="bg-earth-sidebar text-xs border border-earth-border rounded-xl py-1.5 px-3 font-semibold text-earth-dark outline-none cursor-pointer"
                      >
                        <option value="">กรองพนักงานทั้งหมด</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>

                      <select
                        id="admin-issues-status-filter"
                        value={dashboardIssueStateFilter}
                        onChange={(e) => setDashboardIssueStateFilter(e.target.value)}
                        className="bg-earth-sidebar text-xs border border-earth-border rounded-xl py-1.5 px-3 font-semibold text-earth-dark outline-none cursor-pointer"
                      >
                        <option value="all">สถานะปัญหา (ทั้งหมด)</option>
                        <option value="unresolved">ค้างการแก้ไข (Unresolved)</option>
                        <option value="resolved">ได้รับการแก้ไขแล้ว (Resolved)</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-earth-border">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAF8F5] text-earth-text uppercase font-bold tracking-wider border-b border-earth-border text-[10px]">
                          <th className="p-3">วันที่แจ้ง</th>
                          <th className="p-3">พนักงาน</th>
                          <th className="p-3">สถานที่จัดงาน</th>
                          <th className="p-3">ปัญหาหน้างานที่พบ</th>
                          <th className="p-3">สถานะความก้าวหน้า</th>
                          <th className="p-3 text-right">ปรับปรุงสถานะปัญหา</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-earth-border bg-white">
                        {reportedIssuesList.map((req) => (
                          <tr key={req.id} className="hover:bg-[#FCFAF7] transition-colors">
                            <td className="p-3 font-mono text-earth-text whitespace-nowrap">{req.date}</td>
                            <td className="p-3">
                              <p className="font-bold text-earth-dark">{req.employeeName}</p>
                              <p className="text-[10px] text-earth-text/80">{req.role.split(' (')[0]}</p>
                            </td>
                            <td className="p-3 text-earth-dark font-bold">{req.location.name}</td>
                            <td className="p-3 max-w-sm">
                              <p className="text-earth-text block leading-relaxed italic">"{req.checkOut?.issueFound}"</p>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[10px] ${
                                req.checkOut?.issueResolved 
                                  ? 'bg-[#E2EBE0] text-[#2E5E2A]' 
                                  : 'bg-orange-50 text-earth-secondary border border-orange-200 animate-pulse'
                              }`}>
                                {req.checkOut?.issueResolved ? <CheckCircle2 className="w-3 h-3 text-[#2E5E2A]" /> : <AlertTriangle className="w-3 h-3 text-earth-secondary" />}
                                {req.checkOut?.issueResolved ? 'แก้ไขเสร็จสิ้นแล้ว' : 'กำลังประสานงานค้างคา'}
                              </span>
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              {req.checkOut?.issueResolved ? (
                                <button
                                  type="button"
                                  onClick={() => unresolveIssueOnUI(req.id)}
                                  className="bg-earth-sidebar text-[#6B6359] hover:bg-earth-border/40 border border-earth-border px-2.5 py-1.5 rounded-xl font-bold transition text-[11px] cursor-pointer"
                                >
                                  ตั้งเป็นค้างแก้ไข
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => resolveIssueOnUI(req.id)}
                                  className="bg-earth-primary hover:bg-[#799976] text-white font-sans font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 text-[11px] cursor-pointer shadow-3xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>อนุมัติว่าแก้ไขแล้ว</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}

                        {reportedIssuesList.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-earth-text/60 italic bg-white rounded-xl">
                              ไม่พบรายงานปัญหาที่ตรงความเงื่อนไขการกรองในระบบ
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AUTOMATED MONTHLY REPORT FORM */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-earth-dark text-base md:text-lg">รายงานระบุประวัตินอกสถานที่อย่างเป็นทางการ ประจำแผนก</h3>
                    <span className="text-xs text-earth-primary font-bold bg-[#E2EBE0] border border-earth-border px-3 py-1 rounded-full">พิมพ์สรุปเอกสาร</span>
                  </div>
                  <ReportTemplate
                    selectedMonth={selectedMonth}
                    requests={requests}
                    selectedEmployeeId={dashboardEmployeeFilter}
                    employees={employees}
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: ORIGINAL USER DIRECTORY AND ACCOUNT MANIPULATIONS */}
            {adminActiveTab === 'users' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Account Role Stats Bento Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-earth-border shadow-3xs p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-earth-text">จำนวนผู้ใช้งานทั้งหมด</span>
                <p className="text-3xl font-black text-earth-dark font-mono mt-2">
                  {employees.length} <span className="text-xs font-normal text-earth-text/60">บัญชี</span>
                </p>
                <div className="mt-2 text-[9px] font-bold text-earth-primary">ลงทะเบียนพร้อมใช้</div>
              </div>
              <div className="bg-white rounded-2xl border border-earth-border shadow-3xs p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-700">พนักงานทั่วไป (Employee)</span>
                <p className="text-3xl font-black text-blue-800 font-mono mt-2">
                  {employees.filter(e => !e.position || e.position === 'employee').length} <span className="text-xs font-normal text-earth-text/60">คน</span>
                </p>
                <div className="mt-2 text-[9px] font-bold text-blue-600">พนักงานปฏิบัติการนอกสถานที่</div>
              </div>
              <div className="bg-white rounded-2xl border border-earth-border shadow-3xs p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-orange-700">หัวหน้างาน (Manager)</span>
                <p className="text-3xl font-black text-orange-800 font-mono mt-2">
                  {employees.filter(e => e.position === 'manager').length} <span className="text-xs font-normal text-earth-text/60">คน</span>
                </p>
                <div className="mt-2 text-[9px] font-bold text-orange-600">ฝ่ายหัวหน้างานผู้อนุมัติคำขอ</div>
              </div>
              <div className="bg-white rounded-2xl border border-earth-border shadow-3xs p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-700">ผู้คุมระบบ (Administrator)</span>
                <p className="text-3xl font-black text-amber-800 font-mono mt-2">
                  {employees.filter(e => e.position === 'admin').length} <span className="text-xs font-normal text-earth-text/60">คน</span>
                </p>
                <div className="mt-2 text-[9px] font-bold text-amber-600">ผู้ควบคุมและจัดสรรข้อมูลฐาน</div>
              </div>
            </div>

            {/* Main Admin Section: User Editing overlay or creation + User directory */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Register New Account OR Edit Current Account (5 columns) */}
              <div className="lg:col-span-5 space-y-6">
                
                {editingEmployeeId ? (
                  // EDIT EMPLOYEE PANEL
                  <div className="bg-amber-50/50 rounded-3xl border border-amber-200/80 p-5 md:p-6 shadow-sm space-y-4">
                    <div className="border-b border-amber-300 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-amber-700" />
                          <span>✏️ แก้ไขและปรับปรุงข้อมูลพนักงาน</span>
                        </h4>
                        <p className="text-[10px] text-amber-800 font-medium">กำลังแก้ไขรหัสพนักงาน: <span className="font-bold font-mono text-amber-950 bg-amber-200/50 px-1.5 py-0.5 rounded-md">{editingEmployeeId}</span></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingEmployeeId(null)}
                        className="p-1 text-amber-800 hover:bg-amber-100 rounded-lg cursor-pointer"
                        title="ยกเลิกการแก้ไข"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateEmployee} className="space-y-4 text-xs">
                      
                      {adminUpdateError && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold">
                          ⚠️ {adminUpdateError}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-amber-950 mb-1 flex items-center gap-1">
                          <span>🆔 รหัสพนักงาน (Employee ID) *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editEmpId}
                          onChange={(e) => setEditEmpId(e.target.value)}
                          className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-2.5 py-1.5 font-bold font-mono outline-none uppercase"
                          placeholder="เช่น KK0012"
                        />
                        <p className="text-[9px] text-amber-700/80">ปลดล็อกให้ผู้ดูแลระบบแก้ไขรหัสได้ทันที และระบบจะอัปเดตโยงคาน (Cascade Update) ประวัติทั้งหมดให้อัตโนมัติ</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-amber-950 mb-1">ชื่อ-นามสกุล *</label>
                          <input
                            type="text"
                            required
                            placeholder="กิตติภพ รักดี"
                            value={editEmpName}
                            onChange={(e) => setEditEmpName(e.target.value)}
                            className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-2.5 py-1.5 font-bold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-amber-950 mb-1">อีเมลติดต่อ *</label>
                          <input
                            type="email"
                            required
                            placeholder="user@kidzandkitz.co.th"
                            value={editEmpEmail}
                            onChange={(e) => setEditEmpEmail(e.target.value)}
                            className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-2.5 py-1.5 font-bold outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-amber-950 mb-1">สังกัดวิชาชีพ (บทบาท)</label>
                          <input
                            type="text"
                            required
                            value={editEmpRole}
                            onChange={(e) => setEditEmpRole(e.target.value)}
                            className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-2.5 py-1.5 font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-amber-950 mb-1">แผนกความรับผิดชอบ</label>
                          <input
                            type="text"
                            required
                            value={editEmpDept}
                            onChange={(e) => setEditEmpDept(e.target.value)}
                            className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-2.5 py-1.5 font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-amber-950 mb-1">สิทธิ์เข้าระบบ *</label>
                        <select
                          value={editEmpPosition}
                          onChange={(e) => setEditEmpPosition(e.target.value as 'employee' | 'manager' | 'admin')}
                          className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-2 py-1.5 font-bold cursor-pointer outline-none"
                        >
                          <option value="employee">👨‍💼 พนักงานปฏิบัติงาน</option>
                          <option value="manager">👑 หัวหน้างาน / ผู้จัดการ</option>
                          <option value="admin">🔒 ผู้คุมระบบสูงสุด</option>
                        </select>
                      </div>

                      {(editEmpPosition === 'employee' || editEmpPosition === 'manager') ? (
                        <div className="bg-amber-100/40 p-3 rounded-xl border border-amber-200/50 space-y-3">
                          <div>
                            <label className="block text-[10px] uppercase font-extrabold text-amber-950 mb-1">หัวหน้างานผู้อนุมัติพิกัด *</label>
                            <select
                              value={editSelectedApproverId}
                              onChange={(e) => setEditSelectedApproverId(e.target.value)}
                              className="w-full bg-white border border-amber-200 rounded-xl px-2 py-1.5 font-bold outline-none text-xs cursor-pointer"
                            >
                              {employees
                                .filter(e => e.position === 'manager' || e.role.includes('จัดการ') || e.id === 'KK0031')
                                .map(m => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} ({m.role.split(' (')[0]})
                                  </option>
                                ))}
                              <option value="custom">✍️ ระบุหัวหน้างานกำหนดเอง...</option>
                            </select>
                          </div>

                          {editSelectedApproverId === 'custom' && (
                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase font-bold text-rose-700">พิมพ์ระบุชื่อหัวหน้าผู้อนุมัติด้วยตนเอง</label>
                              <input
                                type="text"
                                placeholder="เช่น คุณสมบัติ ยอดทอง (ผู้จัดการฝ่ายการตลาด)"
                                value={editCustomApproverName}
                                onChange={(e) => setEditCustomApproverName(e.target.value)}
                                className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 font-bold outline-none text-xs"
                                required
                              />
                            </div>
                          )}
                        </div>
                      ) : null}

                      <div className="border-t border-amber-300/50 pt-3">
                        <label className="block text-[10px] uppercase font-bold text-amber-950 mb-1 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          <span>รหัสผ่านเข้าเล่นระบบ (แก้ไขได้เลย) *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editEmpPassword}
                          onChange={(e) => setEditEmpPassword(e.target.value)}
                          className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-2.5 py-1.5 font-bold font-mono outline-none"
                        />
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingEmployeeId(null)}
                          className="flex-1 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-xs py-2 rounded-xl cursor-pointer transition active:scale-95 text-center"
                        >
                          ยกเลิก 🙅‍♂️
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2 rounded-xl shadow-xs cursor-pointer transition active:scale-95 text-center"
                        >
                          💾 บันทึกการเปลี่ยนแปลง
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  // CREATE NEW EMPLOYEE PANEL
                  <div className="bg-white rounded-3xl border border-earth-border p-5 shadow-sm space-y-4">
                    <div className="border-b border-earth-border pb-3">
                      <h4 className="font-extrabold text-earth-dark text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-earth-primary" />
                        <span>➕ สร้างพนักงาน/ผู้บริหารใหม่เข้าระบบ</span>
                      </h4>
                      <p className="text-[10px] text-earth-text/80 mt-0.5">ระบุรายละเอียดเพื่อสร้างบัญชีจำลองใหม่ รหัสแรกสร้าง และตำแหน่งงานได้ทันที</p>
                    </div>

                    <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
                      
                      {newEmpSuccessMsg && (
                        <div className="p-2.5 bg-[#E2EBE0] border border-[#8BA888]/55 rounded-xl text-[#2E5E2A] text-[10.5px] font-black leading-normal">
                          🎉 {newEmpSuccessMsg}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-earth-dark mb-1">รหัสผู้ใช้งาน *</label>
                          <input
                            type="text"
                            required
                            placeholder="เช่น KK0225"
                            value={newEmpId}
                            onChange={(e) => {
                              setNewEmpId(e.target.value);
                              setNewEmpSuccessMsg('');
                            }}
                            className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-bold outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-earth-dark mb-1">ชื่อ-นามสกุล *</label>
                          <input
                            type="text"
                            required
                            placeholder="กิตติภพ รักดี"
                            value={newEmpName}
                            onChange={(e) => {
                              setNewEmpName(e.target.value);
                              setNewEmpSuccessMsg('');
                            }}
                            className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-bold outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-earth-dark mb-1">อีเมลติดต่อระบบ *</label>
                          <input
                            type="email"
                            required
                            placeholder="employee@kidzandkitz.co.th"
                            value={newEmpEmail}
                            onChange={(e) => {
                              setNewEmpEmail(e.target.value);
                              setNewEmpSuccessMsg('');
                            }}
                            className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-earth-dark mb-1">สังกัดบทบาทหน้าที่ *</label>
                          <input
                            type="text"
                            required
                            value={newEmpRole}
                            onChange={(e) => {
                              setNewEmpRole(e.target.value);
                              setNewEmpSuccessMsg('');
                            }}
                            className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-earth-dark mb-1">แผนกต้นสังกัด *</label>
                        <input
                          type="text"
                          required
                          value={newEmpDept}
                          onChange={(e) => {
                            setNewEmpDept(e.target.value);
                            setNewEmpSuccessMsg('');
                          }}
                          className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 font-bold"
                        />
                      </div>

                      <div className="p-3 bg-earth-sand/20 rounded-2xl border border-earth-border/40 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-earth-dark mb-1">สิทธิ์ขอบเขตบัญชี *</label>
                            <select
                              value={newEmpPosition}
                              onChange={(e) => {
                                const val = e.target.value as 'employee' | 'manager' | 'admin';
                                setNewEmpPosition(val);
                                setNewEmpSuccessMsg('');
                                if (val !== 'employee') {
                                  setSelectedApproverId('KK0031');
                                }
                              }}
                              className="w-full bg-white border border-earth-border rounded-xl px-2 py-1.5 font-bold cursor-pointer outline-none"
                            >
                              <option value="employee">👨‍💼 พนักงานทั่วไป</option>
                              <option value="manager">👑 หัวหน้างาน / ผู้จัดการ</option>
                              <option value="admin">🔒 ผู้คุมระบบสูงสุด</option>
                            </select>
                          </div>

                          {(newEmpPosition === 'employee' || newEmpPosition === 'manager') ? (
                            <div>
                              <label className="block text-[10px] uppercase font-extrabold text-earth-primary mb-1">สายอนุมัติผู้ดูแลพิกัด *</label>
                              <select
                                value={selectedApproverId}
                                onChange={(e) => {
                                  setSelectedApproverId(e.target.value);
                                  setNewEmpSuccessMsg('');
                                }}
                                className="w-full bg-white border border-earth-border rounded-xl px-2 py-1.5 font-bold cursor-pointer outline-none"
                              >
                                {employees
                                  .filter(e => e.position === 'manager' || e.role.includes('จัดการ') || e.id === 'KK0031')
                                  .map(m => (
                                    <option key={m.id} value={m.id}>
                                      {m.name} ({m.role.split(' (')[0]})
                                    </option>
                                  ))}
                                <option value="custom">✍️ ระบุหัวหน้างานกำหนดเอง...</option>
                              </select>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-earth-text/50 mb-1">สายอนุมัติคำขอ</label>
                              <div className="text-[9px] text-earth-text/80 bg-white/70 border border-dashed border-earth-border/60 p-2 rounded-lg text-center font-bold">
                                ฝ่ายผู้มีสิทธิ์บริหารอนุมัติความถูกต้อง
                              </div>
                            </div>
                          )}
                        </div>

                        {((newEmpPosition === 'employee' || newEmpPosition === 'manager') && selectedApproverId === 'custom') && (
                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-bold text-rose-700">พิมพ์ระบุหัวหน้าสายตรง</label>
                            <input
                              type="text"
                              required
                              placeholder="เช่น คุณกานดา ยอดรัก (ผู้จัดการ)"
                              value={customApproverName}
                              onChange={(e) => {
                                setCustomApproverName(e.target.value);
                                setNewEmpSuccessMsg('');
                              }}
                              className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 font-bold outline-none text-xs"
                            />
                          </div>
                        )}

                        <div className="border-t border-earth-border/40 pt-2.5">
                          <label className="block text-[10px] uppercase font-extrabold text-earth-dark mb-1 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-earth-primary" />
                            <span>รหัสผ่านตั้งต้นเข้าสู่ระบบ *</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="เช่น 1234"
                            value={newEmpPassword}
                            onChange={(e) => {
                              setNewEmpPassword(e.target.value);
                              setNewEmpSuccessMsg('');
                            }}
                            className="w-full bg-white border border-earth-border rounded-xl px-2.5 py-1.5 font-mono font-bold outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-earth-primary hover:bg-[#799976] text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs cursor-pointer select-none transition-all duration-150 active:scale-95 text-center"
                      >
                        ➕ บันทึกลงทะเบียนพนักงานใหม่ และกำหนดกลุ่มงาน
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Right Column: User directory (7 columns) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Search & Filter Controls Card */}
                <div className="bg-white rounded-3xl border border-earth-border p-4 shadow-3xs flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="relative w-full sm:w-auto flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-earth-text/50" />
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหาตามรหัส, ชื่อ หรืออีเมลกดจุดงาน..."
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-earth-border rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-earth-primary/60 focus:ring-1 focus:ring-earth-primary font-bold shadow-3xs"
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <select
                      value={adminRoleFilter}
                      onChange={(e) => setAdminRoleFilter(e.target.value as any)}
                      className="bg-[#FAF9F6] border border-earth-border rounded-xl px-3 py-1.5 text-xs outline-none font-bold cursor-pointer shadow-3xs"
                    >
                      <option value="all">กรองสิทธิ์ (ทั้งหมด)</option>
                      <option value="employee">👨‍💼 พนักงานทั่วไป</option>
                      <option value="manager">👑 หัวหน้างาน / ผู้จัดการ</option>
                      <option value="admin">🔒 ผู้คุมระบบสูงสุด</option>
                    </select>
                  </div>
                </div>

                {/* Directory Accounts List */}
                <div className="bg-white rounded-3xl border border-earth-border overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-earth-border/50 bg-[#FAF9F6]">
                    <h5 className="font-extrabold text-earth-dark text-xs uppercase tracking-wider">บัญชีในฐานระบบพิกัดตอนนี้ ({employees.length} บัญชี)</h5>
                  </div>

                  <div className="divide-y divide-earth-border/40 max-h-[640px] overflow-y-auto">
                    {(() => {
                      const filtered = employees.filter(emp => {
                        const matchesQuery = !adminSearchQuery.trim() || 
                          emp.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                          emp.id.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(adminSearchQuery.toLowerCase());
                        
                        const matchesRole = adminRoleFilter === 'all' || 
                          (adminRoleFilter === 'employee' && (emp.position === 'employee' || !emp.position)) ||
                          (adminRoleFilter === 'manager' && emp.position === 'manager') ||
                          (adminRoleFilter === 'admin' && emp.position === 'admin');

                        return matchesQuery && matchesRole;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-12 text-earth-text/50">
                            <CheckCircle2 className="w-8 h-8 text-earth-text/30 mx-auto mb-1.5" />
                            <p className="text-xs font-bold">ไม่พบบัญชีพนักงานที่ค้นหา</p>
                          </div>
                        );
                      }

                      return filtered.map(emp => {
                        const empPos = emp.position || 'employee';

                        return (
                          <div key={emp.id} className="p-4 bg-white hover:bg-[#FCFBF8] transition flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5">
                            
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: emp.avatarColor || '#3A5C3D' }} />
                                <h6 className="font-extrabold text-earth-dark text-xs truncate">{emp.name}</h6>
                                <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black tracking-wider uppercase ${
                                  empPos === 'admin' 
                                    ? 'bg-amber-100 text-amber-850 border border-amber-200' 
                                    : empPos === 'manager' 
                                      ? 'bg-orange-100 text-orange-850 border border-orange-200' 
                                      : 'bg-blue-100 text-blue-850 border border-blue-200'
                                }`}>
                                  {empPos === 'admin' ? 'SYSTEM ADMIN' : empPos === 'manager' ? 'MANAGER' : 'EMPLOYEE'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10.5px] text-earth-text/80">
                                <div><span className="font-semibold text-earth-text/50">รหัสผ่าน:</span> <span className="font-mono font-bold bg-[#FAF9F6] px-1 rounded border border-earth-border/40 text-earth-primary">{emp.password || '1234'}</span></div>
                                <div><span className="font-semibold text-earth-text/50">รหัสผู้ใช้:</span> <span className="font-mono font-extrabold text-earth-dark">{emp.id}</span></div>
                                <div className="col-span-2 truncate"><span className="font-semibold text-earth-text/50">บทบาท/แผนก:</span> {emp.role} • {emp.department}</div>
                                <div className="col-span-2 truncate font-mono text-[9.5px]"><span className="font-semibold text-earth-text/50 font-sans">อีเมล:</span> {emp.email}</div>
                                {empPos === 'employee' && (
                                  <div className="col-span-2 truncate text-[9.5px] font-semibold text-teal-800 bg-[#E2EBE0]/60 border border-[#8BA888]/25 pl-1.5 py-0.5 mt-0.5 rounded-md">
                                    สายผู้อนุมัติ: {emp.approverName || 'ไม่ได้ตั้งหัวหน้างานตรวจ'} (ID: {emp.approverId || 'KK0031'})
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* CTA Action Tools */}
                            <div className="flex md:flex-col gap-2 w-full md:w-auto shrink-0 justify-end">
                              <button
                                type="button"
                                onClick={() => startEditingEmployee(emp)}
                                className="bg-[#FAF9F6] hover:bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-3 py-1.5 rounded-xl cursor-pointer select-none whitespace-nowrap text-center flex-1 md:flex-initial shadow-3xs"
                              >
                                ✏️ แก้ไขข้อมูล
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-3 py-1.5 rounded-xl cursor-pointer select-none whitespace-nowrap text-center flex-1 md:flex-initial shadow-3xs"
                              >
                                ❌ ลบบัญชี
                              </button>
                            </div>

                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </div>
    )}

        {/* --- 2. EMPLOYEE VIEW (พนักงาน: SUBMIT REQUEST, MY HISTORY, CHECK-IN/OUT METRIC) --- */}
        {activeRole === 'employee' && (
          <div className="space-y-6">
            {/* Tab navigation inside employee dashboard */}
            <div className="flex bg-white/70 border border-earth-border p-1 rounded-2xl w-full max-w-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setEmployeeActiveTab('planning')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                  employeeActiveTab === 'planning'
                    ? 'bg-earth-primary text-white shadow-xs'
                    : 'text-[#6B6359] hover:bg-white/40'
                }`}
              >
                <CalendarRange className="w-4.5 h-4.5" />
                <span>📝 ยื่นร่างและติดตามแผนล่วงหน้า</span>
              </button>
              <button
                type="button"
                onClick={() => setEmployeeActiveTab('calendar')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                  employeeActiveTab === 'calendar'
                    ? 'bg-earth-primary text-white shadow-xs'
                    : 'text-[#6B6359] hover:bg-white/40'
                }`}
              >
                <Calendar className="w-4.5 h-4.5" />
                <span>📅 ปฏิทินปฏิบัติงานและแผนล่วงหน้า</span>
              </button>
            </div>

            {employeeActiveTab === 'planning' && (
              <div className="space-y-8 animate-fadeIn">
                <EmployeePlanning 
                  currentSimEmployee={currentSimEmployee}
                  plans={plans}
                  setPlans={setPlans}
                  popularLocations={POPULAR_LOCATIONS}
                />

                {/* ส่วนการลงเวลาการปฏิบัติงานนอกสถานที่รายวันและการบันทึกเวลา */}
                <div className="border-t-2 border-dashed border-earth-border/60 pt-8 space-y-6">
                  <div className="bg-[#FAF8F5] border border-earth-border rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs">
                    <div>
                      <h3 className="font-extrabold text-earth-dark text-base md:text-lg flex items-center gap-2">
                        <CheckCircle className="w-5.5 h-5.5 text-earth-primary" />
                        <span>📍 บันทึกเวลางานนอกสถานที่และการรายงานผลรายวัน (Daily Check-In & Action Panel)</span>
                      </h3>
                      <p className="text-xs text-earth-text/80 font-medium">เมื่อยื่นแผนปฏิบัติงานล่วงหน้าได้รับการจัดสรร/อนุมัติเรียบร้อยแล้ว ท่านสามารถเช็คอินและกรอกบันทึกข้อมูลการทำงานได้ตามเป้าหมายรายวัน</p>
                    </div>
                    <span className="bg-[#E2EBE0] text-[#2E5E2A] text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      PLAN-DRIVEN GEOLOCATION WORKFLOW
                    </span>
                  </div>

                  <div className="space-y-8">
                    {/* Active list of requests representing my workflow */}
                    <div id="employee-workflow-history-card-integrated" className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-earth-border pb-3 flex-wrap gap-2">
                          <div>
                            <h3 className="font-bold text-earth-dark text-base flex items-center gap-2">
                              <History className="w-5 h-5 text-earth-primary" />
                              <span>ประวัติคำขอลงพื้นที่และการเช็คอิน/เช็คเอาท์ตามแผน</span>
                            </h3>
                            <p className="text-xs text-earth-text/80">ตรวจจบเวลาเช็คอินและเข้างานด้วย GPS ที่ได้รับการรับรองทางพิกัดภูมิศาสตร์</p>
                          </div>

                          {/* GPS Matching Settings helper */}
                          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-xl border border-earth-border text-xs">
                            <span className="text-[10px] text-earth-text font-bold">พิกัดจำลอง GPS:</span>
                            <button
                              onClick={() => setSimulatedGeoMatched(true)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${simulatedGeoMatched ? 'bg-earth-primary text-white shadow-xs' : 'bg-earth-sidebar text-[#6B6359]'}`}
                            >
                              ตรงจุดพอดี (0 เมตร)
                            </button>
                            <button
                              onClick={() => setSimulatedGeoMatched(false)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${!simulatedGeoMatched ? 'bg-earth-secondary text-white shadow-xs' : 'bg-earth-sidebar text-[#6B6359]'}`}
                            >
                              คำนวณจริง
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {myRequests.map((req) => {
                            const isApproved = req.status === 'approved';
                            const isRejected = req.status === 'rejected';
                            const hasCheckedIn = !!req.checkIn;
                            const hasCheckedOut = !!req.checkOut;

                            return (
                              <div 
                                key={req.id} 
                                className={`p-4 rounded-2xl border transition-all space-y-3.5 relative overflow-hidden ${
                                  hasCheckedOut 
                                    ? 'bg-[#FAF8F5]/60 border-earth-border opacity-95' 
                                    : isApproved 
                                    ? 'bg-[#E2EBE0]/40 border-earth-primary/30 ring-1 ring-[#CBDBC8]' 
                                    : isRejected 
                                    ? 'bg-[#FCF5F2] border-earth-secondary/20' 
                                    : 'bg-white border-earth-border'
                                }`}
                              >
                                {/* Upper status ribbon */}
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                  <div className="space-y-0.5">
                                    <span className="font-mono text-[9px] font-bold text-earth-text tracking-widest bg-earth-border/40 px-1.5 py-0.5 rounded">{req.id}</span>
                                    <h4 className="font-bold text-earth-dark text-sm flex items-center gap-1 mt-1">
                                      <span>📍 {req.location.name}</span>
                                    </h4>
                                    <p className="text-earth-text text-xs">{req.location.address}</p>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-mono font-bold text-earth-text">{req.date}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${
                                      isApproved 
                                        ? 'bg-[#CBDBC8] text-[#2E5E2A]' 
                                        : isRejected 
                                        ? 'bg-[#F2D7CD] text-[#803C21]' 
                                        : 'bg-[#E6D5B8] text-earth-dark'
                                    }`}>
                                      {isApproved ? 'อนุมัติแล้ว' : isRejected ? 'ปฏิเสธ' : 'รอพิจารณา'}
                                    </span>
                                  </div>
                                </div>

                                {/* Mid detailed task information */}
                                <div className="text-xs bg-white/70 p-3 rounded-xl border border-earth-border/40 space-y-1.5">
                                  <p><span className="font-bold text-earth-text font-serif">กำหนดเวลา:</span> <span className="font-mono font-bold text-earth-dark">{req.startTime} น. - {req.endTime} น.</span></p>
                                  <p><span className="font-bold text-earth-text font-serif">วัตถุประสงค์งาน:</span> <span className="text-earth-dark">"{req.purpose}"</span></p>
                                  
                                  {req.approvedBy && (
                                    <p className="text-[10px] text-[#8C8375] font-mono italic">
                                      อนุมัติโดย: {req.approvedBy} เมื่อวันที่ {req.approvedAt}
                                    </p>
                                  )}
                                </div>

                                {/* Action buttons under Approved status */}
                                {isApproved && (
                                  <div className="space-y-3.5 border-t border-earth-border/40 pt-3 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                                    
                                    {/* Check-In Logging status view */}
                                    {!hasCheckedIn ? (
                                      <div className="flex-1">
                                        <p className="text-[11px] text-earth-text flex items-center gap-1 font-bold">
                                          <Clock className="w-3.5 h-3.5 text-earth-primary" />
                                          <span>เข้าสถานที่ปฏิบัติกิจแล้ว? กรุณาทำการยืนยันพิกัด</span>
                                        </p>
                                        <button
                                          onClick={() => triggerCheckIn(req.id, req.location.lat, req.location.lng)}
                                          className="mt-1.5 w-full bg-[#8BA888] hover:bg-[#799976] text-white font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition active:scale-95"
                                        >
                                          <Check className="w-4 h-4" />
                                          <span>เช็คอินเข้างาน (Check-In) ด้วย GPS</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="bg-[#E2EBE0]/50 p-2.5 rounded-xl border border-earth-primary/30 text-xs flex items-center justify-between flex-1">
                                        <div className="space-y-0.5">
                                          <p className="text-[#2E5E2A] font-bold flex items-center gap-1">
                                            <CheckCircle className="w-3.5 h-3.5 text-earth-primary" />
                                            <span>เช็คอินเข้างานเสร็จสมบูรณ์</span>
                                          </p>
                                          <p className="text-[10px] font-mono text-earth-text/80">เวลาบันทึก: {req.checkIn?.time} น. | ระยะห่างอุปสรรค: {req.checkIn?.distanceMeters} เมตร</p>
                                        </div>
                                        <span className="bg-[#CBDBC8] text-[#2E5E2A] font-mono font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide">Checked In</span>
                                      </div>
                                    )}

                                    {/* Check-Out Logging status view */}
                                    {hasCheckedIn && (
                                      <div className="flex-1">
                                        {!hasCheckedOut ? (
                                          <div>
                                            <p className="text-[11px] text-earth-text font-bold">เสร็จภารกิจ ณ พิกัดแล้ว? บันทึกรายงานเพื่อเช็คเอาท์ออก</p>
                                            <button
                                              onClick={() => setCheckoutRequestId(req.id)}
                                              className="mt-1.5 w-full bg-[#433E3B] hover:bg-[#34302C] text-[#E6D5B8] font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border border-[#E6D5B8]/20 transition active:scale-95"
                                            >
                                              <Send className="w-4 h-4" />
                                              <span>เขียนสรุปงาน & เช็คเอาท์ (Check-Out)</span>
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-earth-border text-xs text-earth-dark space-y-1.5">
                                            <p className="font-bold flex items-center gap-1 text-earth-primary">
                                              <CheckCircle className="w-3.5 h-3.5" />
                                              <span>เช็คเอาท์และสรุปเสร็จสิ้นภารกิจแล้ว</span>
                                            </p>
                                            <p className="text-[10px] font-mono text-earth-text">เวลาบันทึก: {req.checkOut?.time} น.</p>

                                            {req.checkOut?.workImage && (
                                              <div className="rounded-lg overflow-hidden border border-earth-border/60 bg-gray-100 max-w-full my-1.5 self-start shadow-2xs">
                                                <img 
                                                  src={req.checkOut.workImage} 
                                                  alt="Evidence Work" 
                                                  className="max-h-20 w-auto object-contain cursor-zoom-in transition-transform hover:scale-105"
                                                  onClick={() => window.open(req.checkOut?.workImage, '_blank')}
                                                  referrerPolicy="no-referrer"
                                                />
                                              </div>
                                            )}

                                            <p className="text-[11px] leading-tight font-serif italic text-earth-text/90 border-l border-earth-primary pl-2 mb-1">
                                              ผลสำเร็จ: "{req.checkOut?.workSummary}"
                                            </p>
                                            {req.checkOut?.issueFound && req.checkOut.issueFound !== 'ไม่มีปัญหา' && (
                                              <p className="text-[10px] text-earth-secondary font-bold">
                                                ⚠️ อุปสรรค: "{req.checkOut.issueFound}" ({req.checkOut.issueResolved ? 'แก้ไขแล้วหน้างาน' : 'รอซัพพอร์ตเพิ่มเติม'})
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {myRequests.length === 0 && (
                            <div className="text-center py-12 text-earth-text/60 border border-dashed border-earth-border rounded-3xl bg-white">
                              <History className="w-10 h-10 text-earth-border mx-auto mb-2" />
                              <p className="font-semibold text-sm">ไม่พบประวัติการลงทะเบียนจริง</p>
                              <p className="text-xs mt-0.5">กรุณารอให้หัวหน้างาน/ผู้ดูแลระบบอนุมัติแผนงานล่วงหน้าก่อนเพื่อเริ่มเช็คอิน</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Map simulation segment */}
                      <div className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-earth-dark text-base flex items-center gap-2 border-b border-earth-border pb-3">
                          <Globe className="w-5 h-5 text-earth-primary" />
                          <span>🗺️ แผนที่พิกัดยืนยันพาสการทำงานแบบเรียลไทม์ (Live Action Map)</span>
                        </h3>
                        <div className="rounded-2xl border border-earth-border p-1 bg-slate-50/50">
                          <OfflineSimMap 
                            requests={requests} 
                            selectedEmployeeId={currentSimEmployee.id} 
                          />
                        </div>
                        <p className="text-[10.5px] text-earth-text/70 italic text-center">แผนที่แสดงตำแหน่งและประวัติเช็คอินที่เกิดขึ้นจริงตามภูมิศาสตร์เป้าหมาย</p>
                      </div>

                      {/* Personal printing report template */}
                      <div id="employee-report-card-integrated" className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-earth-border pb-3 flex-wrap gap-2">
                          <div>
                            <h3 className="font-bold text-earth-dark text-base flex items-center gap-2">
                              <ClipboardList className="w-5 h-5 text-[#8BA888]" />
                              <span>📊 สรุปผลรายงานปฏิบัติงานนอกสถานที่รายเดือนของคุณ</span>
                            </h3>
                            <p className="text-xs text-earth-text/80">ระบบลงรายงานสำหรับการจัดทำใบประเมินและเบิกสวัสดิการประจำประวัติในระบบ</p>
                          </div>
                          <span className="text-xs text-earth-primary font-bold bg-[#E2EBE0] border border-earth-border px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">Official Copy</span>
                        </div>
                        <ReportTemplate
                          selectedMonth={selectedMonth}
                          requests={requests}
                          selectedEmployeeId={currentSimEmployee.id}
                          employees={employees}
                        />
                      </div>

                  </div>
                </div>
              </div>
            )}

            {employeeActiveTab === 'calendar' && (
              <div className="space-y-6 animate-fadeIn">
                {/* 📌 วันนี้: เช็คอิน/เช็คเอาท์ด่วน */}
                {(() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const todayReqs = requests.filter(r => r.employeeId === currentSimEmployee.id && r.date === todayStr && r.status === 'approved');
                  
                  return (
                    <div className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
                      <div className="border-b border-earth-border pb-3 flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <h3 className="font-bold text-earth-dark text-base flex items-center gap-2">
                            <Clock className="w-5 h-5 text-earth-primary" />
                            <span>📌 รายการนอกสถานที่และการเช็คอินด่วน วันนี้ ({todayStr.split('-').reverse().join('/')})</span>
                          </h3>
                          <p className="text-xs text-earth-text/80">ระบบคัดสรรรายการปฏิบัติงานของคุณที่ผ่านการอนุมัติล่วงหน้าแล้วเพื่อให้ท่านตรวจจับ GPS เช็คอินได้ทันที</p>
                        </div>
                        <span className="bg-[#E2EBE0] text-[#2E5E2A] text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Real-Time GPS Tracker
                        </span>
                      </div>

                      {todayReqs.length === 0 ? (
                        <div className="text-center py-6 text-earth-text/60">
                          <AlertTriangle className="w-8 h-8 text-amber-500/70 mx-auto mb-1.5" />
                          <p className="font-semibold text-xs text-earth-dark">ไม่มีแผนกิจกรรมภายนอกที่ผ่านอนุมัติสำหรับวันนี้</p>
                          <p className="text-[10px] mt-0.5">ท่านยังเสนอหัวข้อใน 'ยื่นร่างและติดตามแผนล่วงหน้า' ได้หรือปฏิบัติจัดพิกัดผ่านปฏิทิน</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {todayReqs.map(req => {
                            const hasCheckedIn = !!req.checkIn;
                            const hasCheckedOut = !!req.checkOut;
                            
                            return (
                              <div key={req.id} className="p-4 rounded-2xl bg-[#FCFAF7] border border-earth-border/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-[#F7F5F0]">
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="bg-earth-primary/10 text-earth-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                      อนุมัติแล้ว (Approved)
                                    </span>
                                    <span className="text-font-mono text-[10.5px] font-bold text-earth-dark">
                                      ⏱️ {req.startTime} - {req.endTime} น.
                                    </span>
                                  </div>
                                  <h4 className="font-black text-earth-dark text-sm flex items-center gap-1">
                                    <span>📍 {req.location.name}</span>
                                  </h4>
                                  <p className="text-[11px] text-earth-text italic leading-relaxed">
                                    วัตถุประสงค์นอกห้อง: "{req.purpose}"
                                  </p>
                                </div>

                                <div className="shrink-0 w-full md:w-auto">
                                  {!hasCheckedIn ? (
                                    <button
                                      type="button"
                                      onClick={() => triggerCheckIn(req.id, req.location.lat, req.location.lng)}
                                      className="w-full md:w-auto bg-[#8BA888] hover:bg-[#799976] text-white font-sans text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition duration-150 active:scale-95"
                                    >
                                      <Check className="w-4 h-4" />
                                      <span>เช็คอินเข้างาน (Check-In) ด้วย GPS</span>
                                    </button>
                                  ) : !hasCheckedOut ? (
                                    <button
                                      type="button"
                                      onClick={() => setCheckoutRequestId(req.id)}
                                      className="w-full md:w-auto bg-[#433E3B] hover:bg-[#34302C] text-[#E6D5B8] font-sans text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border border-[#E6D5B8]/20 transition duration-150 active:scale-95"
                                    >
                                      <Send className="w-4 h-4" />
                                      <span>เช็คเอาท์ & รายงานสรุปส่งผลงาน</span>
                                    </button>
                                  ) : (
                                    <div className="bg-[#E2EBE0] p-3 rounded-2xl border border-earth-primary/30 text-xs text-[#2E5E2A] space-y-1">
                                      <p className="font-bold flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>เช็คเอาท์เรียบร้อย & รายงานสำเร็จ</span>
                                      </p>
                                      <p className="text-[10px] font-mono">เวลาบันทึก: {req.checkOut?.time} น.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <ManagerCalendar 
                  requests={myScopeRequests}
                  selectedMonth={selectedMonth}
                  employees={employees}
                  plans={plans}
                  loggedInUser={loggedInUser}
                />
              </div>
            )}

            {false && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Hand: Request Form block */}
            <div className="lg:col-span-1 space-y-6">
              <div id="employee-request-form-card" className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
                <div className="border-b border-earth-border pb-3">
                  <h3 className="font-bold text-earth-dark text-base flex items-center gap-2">
                    <Send className="w-5 h-5 text-earth-primary" />
                    <span>ขออนุมัติทำงานนอกสถานที่ (Off-Site Request Form)</span>
                  </h3>
                  <p className="text-xs text-earth-text/80">กรอกพิกัดเป้าหมาย รายชื่อ และเหตุผลเพื่อส่งคำขออนุมัติพื้นที่</p>
                </div>

                {formSuccessMessage && (
                  <div className="p-3 bg-[#E2EBE0] border border-earth-primary/50 text-[#2E5E2A] text-xs rounded-xl font-bold animate-pulse">
                    {formSuccessMessage}
                  </div>
                )}

                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  {/* Employee identification */}
                  <div>
                    <label className="block text-xs font-bold text-earth-text mb-1">พนักงานผู้ส่งคำขอ</label>
                    <div className="bg-[#FAF8F5] px-3 py-2 rounded-xl text-earth-dark font-bold border border-earth-border">
                      {currentSimEmployee.name} ({currentSimEmployee.id})
                    </div>
                  </div>

                  {/* Date Picker */}
                  <div>
                    <label className="block text-xs font-bold text-earth-text mb-1">วันที่ต้องการไปปฏิบัติงาน</label>
                    <input
                      id="form-date-input"
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-3 py-2 font-mono font-bold text-earth-dark focus:ring-1 focus:ring-earth-primary outline-none"
                      required
                    />
                  </div>

                  {/* Hours Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-earth-text mb-1">เวลาเข้าปฏิบัติงาน</label>
                      <input
                        id="form-start-time"
                        type="time"
                        value={formStartTime}
                        onChange={(e) => setFormStartTime(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-3 py-2 font-mono text-earth-dark focus:ring-1 focus:ring-earth-primary outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-earth-text mb-1">เวลาสิ้นสุดภารกิจ</label>
                      <input
                        id="form-end-time"
                        type="time"
                        value={formEndTime}
                        onChange={(e) => setFormEndTime(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-3 py-2 font-mono text-earth-dark focus:ring-1 focus:ring-earth-primary outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Location Selection toggle */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-earth-text">พิกัดทางกายภาพเป้าหมาย</label>
                      <button
                        type="button"
                        onClick={() => setIsCustomLocToggle(!isCustomLocToggle)}
                        className="text-[11px] font-bold text-earth-primary hover:underline hover:text-[#799976]"
                      >
                        {isCustomLocToggle ? 'ใช้รายชื่อห้างและร้านที่กำหนด' : 'ระบุพิกัดทางภูมิเอง'}
                      </button>
                    </div>

                    {!isCustomLocToggle ? (
                      <select
                        id="form-location-preset"
                        value={formLocationPreset}
                        onChange={(e) => setFormLocationPreset(e.target.value)}
                        className="w-full bg-white border border-earth-border rounded-xl px-3 py-2 text-earth-dark font-semibold outline-none focus:ring-1 focus:ring-earth-primary"
                      >
                        {POPULAR_LOCATIONS.map((loc, idx) => (
                          <option key={idx} value={loc.name}>{loc.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2 p-3 bg-earth-sidebar/40 border border-earth-border rounded-xl">
                        <div>
                          <input
                            id="custom-location-name"
                            type="text"
                            placeholder="ระบุชื่อสถานที่ (เช่น อาคารสำนักงานใหญ่)"
                            value={formCustomLocationName}
                            onChange={(e) => setFormCustomLocationName(e.target.value)}
                            className="w-full bg-white border border-earth-border rounded-lg px-2.5 py-1.5 text-xs inline-block text-earth-dark"
                            required={isCustomLocToggle}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            id="custom-location-latitude"
                            type="text"
                            placeholder="ละติจูด (Lat)"
                            value={formCustomLat}
                            onChange={(e) => setFormCustomLat(e.target.value)}
                            className="bg-white border border-earth-border rounded-lg px-2.5 py-1.5 font-mono text-earth-dark"
                            required={isCustomLocToggle}
                          />
                          <input
                            id="custom-location-longitude"
                            type="text"
                            placeholder="ลองจิจูด (Lng)"
                            value={formCustomLng}
                            onChange={(e) => setFormCustomLng(e.target.value)}
                            className="bg-white border border-earth-border rounded-lg px-2.5 py-1.5 font-mono text-earth-dark"
                            required={isCustomLocToggle}
                          />
                        </div>
                        <div>
                          <input
                            id="custom-location-address"
                            type="text"
                            placeholder="ที่อยู่โดยสังเขปเพื่อค้นหาออฟไลน์"
                            value={formCustomAddress}
                            onChange={(e) => setFormCustomAddress(e.target.value)}
                            className="w-full bg-white border border-earth-border rounded-lg px-2.5 py-1.5 text-xs font-serif text-earth-dark"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Purpose description field */}
                  <div>
                    <label className="block text-xs font-bold text-earth-text mb-1">เหตุผลและวัตถุประสงค์ในการปฏิบัติงาน</label>
                    <textarea
                      id="form-purpose"
                      value={formPurpose}
                      onChange={(e) => setFormPurpose(e.target.value)}
                      placeholder="เช่น คุมการจัดแข่งขันการ์ดแวนการ์ดจัดจำหน่าย, ตรวจเช็คสต็อก, นำโปรโมสุดพิเศษไปจัดโปรบิ๊กดีล..."
                      className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-earth-primary outline-none font-serif min-h-[90px] text-earth-dark"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-earth-primary hover:bg-[#799976] text-white font-sans text-xs font-bold py-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 duration-150"
                  >
                    <Send className="w-4 h-4" />
                    <span>ส่งขออนุมัติต่อ: {currentSimEmployee.approverName || 'ผู้จัดการ'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Hand: My Requests status list & check-in buttons */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Check-Out Dialog (When employee is checking out) */}
              {checkoutRequestId && (
                <div className="bg-[#433E3B] text-white rounded-3xl border border-earth-border p-6 shadow-lg space-y-4">
                  <div className="flex justify-between items-start border-b border-earth-border/20 pb-3">
                    <div>
                      <h4 className="font-bold text-lg text-[#E6D5B8] flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 animate-pulse text-earth-secondary" />
                        <span>เพิ่มรายละเอียดการทำงานและปัญหาที่พบหน้างาน (Submit Log Out Report)</span>
                      </h4>
                      <p className="text-xs text-white/80">กรุณากรอกรายงานความคืบหน้า และระบุปัญหาที่ได้รับการแก้ไขหลังเสร็จสิ้นภารกิจ</p>
                    </div>
                    <button 
                      onClick={() => setCheckoutRequestId(null)}
                      className="text-white/60 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCheckOutSubmit} className="space-y-4 text-xs font-serif text-white/90">
                    <div>
                      <label className="block text-xs font-bold text-[#E6D5B8] mb-1">รายงานสรุปผลการทำงาน (Work Summary):</label>
                      <textarea
                        value={checkoutWorkSummary}
                        onChange={(e) => setCheckoutWorkSummary(e.target.value)}
                        placeholder="เช่น ดำเนินงานคุมทัวร์นาเมนต์รอบ 64 คน และแจกจ่ายสินค้าของพรีเมี่ยมเสร็จเรียบร้อย คนเข้าร่วมอบอุ่น..."
                        className="w-full bg-black/25 border border-earth-border/20 text-white rounded-xl px-3 py-2 text-xs min-h-[80px] outline-none focus:ring-1 focus:ring-[#8BA888]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#E6D5B8]">ระบุปัญหาและรายงานอุปสรรคที่พบเจอ (ถ้ามี):</label>
                      <input
                        type="text"
                        value={checkoutIssueFound}
                        onChange={(e) => setCheckoutIssueFound(e.target.value)}
                        placeholder="เช่น แอร์ในห้างเสียชั่วช่วงบ่าย, ไม่มีโต๊ะเก้าอี้เพียงพอ (ใส่ 'ไม่มีปัญหา' หากเรียบร้อยดี)"
                        className="w-full bg-black/25 border border-earth-border/20 text-white rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#8BA888]"
                      />

                      {/* Problem solved status switcher */}
                      <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-earth-border/10 mt-2">
                        <div>
                          <p className="text-white text-xs font-bold">ปัญหานี้ได้รับการแก้ไขแล้วเสร็จในจุดปฏิบัติงานหรือไม่?</p>
                          <p className="text-white/60 text-[10px] italic">หากดำเนินการแก้ไขเสร็จสิ้นแล้ว ให้เลือกรับรองสถานะไว้</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCheckoutIssueResolved(true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                              checkoutIssueResolved 
                                ? 'bg-[#8BA888] text-white' 
                                : 'bg-white/10 text-white/50 hover:bg-white/15'
                            }`}
                          >
                            แก้ไขแล้ว
                          </button>
                          <button
                            type="button"
                            onClick={() => setCheckoutIssueResolved(false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                              !checkoutIssueResolved 
                                ? 'bg-[#D27D59] text-white' 
                                : 'bg-white/10 text-white/50 hover:bg-white/15'
                            }`}
                          >
                            ยังไม่ได้รับการแก้ไข
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* WORKPLACE / TASK IMAGE VERIFICATION WORKFLOW */}
                    <div className="space-y-2.5 bg-black/10 p-4 rounded-2xl border border-white/5 text-[#E6D5B8]">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#8BA888]" />
                          <span>แนบภาพถ่ายสถานที่ทำงานหรือภาพผลงานสำเร็จ <span className="text-[#D27D59] font-black">* จำเป็น</span></span>
                        </label>
                        {checkoutWorkImage && (
                          <button
                            type="button"
                            onClick={() => setCheckoutWorkImage('')}
                            className="text-[11px] text-rose-300 hover:text-rose-200 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบรูปภาพ</span>
                          </button>
                        )}
                      </div>

                      {/* Drag & Drop Upload Container */}
                      {!checkoutWorkImage ? (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              const file = e.dataTransfer.files[0];
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) setCheckoutWorkImage(ev.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="border-2 border-dashed border-white/20 hover:border-earth-primary/40 rounded-xl p-4 text-center cursor-pointer hover:bg-white/5 transition flex flex-col items-center gap-2 group relative"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            id="checkout-photo-input"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) setCheckoutWorkImage(ev.target.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <Upload className="w-8 h-8 text-[#E6D5B8]/85 group-hover:scale-110 transition duration-200 pointer-events-none" />
                          <p className="text-xs text-white/95 font-bold pointer-events-none">ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                          <p className="text-[10px] text-white/55 pointer-events-none">(รองรับไฟล์รูปภาพ PNG, JPG, JPEG)</p>
                        </div>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden border border-white/10 group bg-black/40 flex items-center justify-center p-2">
                          <img 
                            src={checkoutWorkImage} 
                            alt="Work Evidence Progress" 
                            className="max-h-[160px] object-contain rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* QUICK PRESET MOCK PICTURES SELECTOR FOR EASY PLAYGROUND SIMULATION */}
                      <div className="space-y-1.5 border-t border-white/5 pt-3 text-white/80">
                        <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">
                          หรือกดเลือกรูปภาพจากการปฏิบัติงานด่วนเพื่อความสะดวกในการทดสอบระบบ:
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            {
                              label: 'บูธจัดแข่งการ์ด',
                              url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=300&q=80'
                            },
                            {
                              label: 'ตรวจนับสต็อก',
                              url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80'
                            },
                            {
                              label: 'หน้าร้านหลัก',
                              url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=300&q=80'
                            },
                            {
                              label: 'การสอนนัดพิเศษ',
                              url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=300&q=80'
                            }
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCheckoutWorkImage(preset.url)}
                              className={`p-1 rounded-lg border transition text-left space-y-1 cursor-pointer overflow-hidden group ${
                                checkoutWorkImage === preset.url 
                                  ? 'bg-[#CBDBC8] border-earth-primary text-earth-dark font-bold' 
                                  : 'bg-black/20 border-white/10 hover:bg-black/40 hover:border-white/20 text-white/70'
                              }`}
                            >
                              <img 
                                src={preset.url} 
                                alt={preset.label} 
                                className="w-full h-8 object-cover rounded-md group-hover:scale-105 transition"
                                referrerPolicy="no-referrer"
                              />
                              <span className="block text-[8px] truncate text-center">
                                {preset.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-white/60 text-[10.5px] text-center bg-white/5 p-2 rounded-xl border border-white/5">
                      💡 (ไม่บังคับ) ท่านสามารถเลือกแนบรูปถ่ายการทำงาน หรือเลือกรูปภาพจำลองผลงานเพื่อความสมบูรณ์ของรายงานได้
                    </p>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutRequestId(null)}
                        className="px-4 py-2 bg-transparent text-white/80 hover:text-white rounded-xl border border-white/20 font-bold transition cursor-pointer text-xs"
                      >
                        ปิดหน้าต่าง
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 font-sans rounded-xl font-bold shadow-xs transition text-xs bg-[#8BA888] hover:bg-[#799976] text-white cursor-pointer active:scale-95"
                      >
                        ส่งรายการบันทึกเช็คเอาท์
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Active list of requests representing my workflow */}
              <div id="employee-workflow-history-card" className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-earth-border pb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-earth-dark text-base flex items-center gap-2">
                      <History className="w-5 h-5 text-earth-primary" />
                      <span>ประวัติคำขอและพาสการทำงานนอกสถานที่ของคุณ</span>
                    </h3>
                    <p className="text-xs text-earth-text/80">บันทึกขั้นตอนคำขอ และเมื่อได้รับการอนุมัติแล้ว จะเริ่มทำการเช็คอินเวลางานนอกสถานที่</p>
                  </div>

                  {/* GPS Matching Settings helper */}
                  <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-xl border border-earth-border text-xs">
                    <span className="text-[10px] text-earth-text">จำลอง GPS แผ่นดิน:</span>
                    <button
                      onClick={() => setSimulatedGeoMatched(true)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${simulatedGeoMatched ? 'bg-earth-primary text-white shadow-xs' : 'bg-earth-sidebar text-[#6B6359]'}`}
                    >
                      ตรงหมุดพิกัดพอดี
                    </button>
                    <button
                      onClick={() => setSimulatedGeoMatched(false)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${!simulatedGeoMatched ? 'bg-earth-secondary text-white shadow-xs' : 'bg-earth-sidebar text-[#6B6359]'}`}
                    >
                      ดึงค่ามือถือจริง
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {myRequests.map((req) => {
                    const isApproved = req.status === 'approved';
                    const isRejected = req.status === 'rejected';
                    const hasCheckedIn = !!req.checkIn;
                    const hasCheckedOut = !!req.checkOut;

                    return (
                      <div 
                        key={req.id} 
                        className={`p-4 rounded-2xl border transition-all space-y-3.5 relative overflow-hidden ${
                          hasCheckedOut 
                            ? 'bg-[#FAF8F5]/60 border-earth-border opacity-90' 
                            : isApproved 
                            ? 'bg-[#E2EBE0]/40 border-earth-primary/30 ring-1 ring-[#CBDBC8]' 
                            : isRejected 
                            ? 'bg-[#FCF5F2] border-earth-secondary/20' 
                            : 'bg-white border-earth-border'
                        }`}
                      >
                        {/* Upper status ribbon */}
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[10px] font-bold text-earth-text tracking-widest">{req.id}</span>
                            <h4 className="font-bold text-earth-dark text-sm flex items-center gap-1">
                              <span>📍 {req.location.name}</span>
                            </h4>
                            <p className="text-earth-text mx-1 text-xs">{req.location.address}</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-earth-text">{req.date}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${
                              isApproved 
                                ? 'bg-[#CBDBC8] text-[#2E5E2A]' 
                                : isRejected 
                                ? 'bg-[#F2D7CD] text-[#803C21]' 
                                : 'bg-[#E6D5B8] text-earth-dark'
                            }`}>
                              {isApproved ? 'อนุมัติแล้ว' : isRejected ? 'ปฏิเสธ' : 'รอการพิจารณา'}
                            </span>
                          </div>
                        </div>

                        {/* Mid detailed task information */}
                        <div className="text-xs bg-white/70 p-3 rounded-xl border border-earth-border/40 space-y-1.5">
                          <p><span className="font-bold text-earth-text font-serif">ช่วงโมงที่กำหนด:</span> <span className="font-mono font-bold text-earth-dark">{req.startTime} น. - {req.endTime} น.</span></p>
                          <p><span className="font-bold text-earth-text font-serif">แผนภารกิจ:</span> <span className="text-earth-dark">"{req.purpose}"</span></p>
                          
                          {/* Approval stamp information if available */}
                          {req.approvedBy && (
                            <p className="text-[10px] text-[#8C8375] font-mono italic">
                              ลงตราอนุมัติโดย: {req.approvedBy} เมื่อวันที่ {req.approvedAt}
                            </p>
                          )}
                        </div>

                        {/* Action buttons under Approved status */}
                        {isApproved && (
                          <div className="space-y-3.5 border-t border-earth-border/40 pt-3 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                            
                            {/* Check-In Logging status view */}
                            {!hasCheckedIn ? (
                              <div className="flex-1">
                                <p className="text-[11px] text-earth-text flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-earth-primary" />
                                  <span>คุณระบุว่าอยู่ที่จุดทำงานเพื่อเช็คอินระยะห่างตามกฎ</span>
                                </p>
                                <button
                                  onClick={() => triggerCheckIn(req.id, req.location.lat, req.location.lng)}
                                  className="mt-1.5 w-full bg-[#8BA888] hover:bg-[#799976] text-white font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition active:scale-95"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>เช็คอินเข้างาน (Check-In) ด้วย GPS</span>
                                </button>
                              </div>
                            ) : (
                              <div className="bg-[#E2EBE0]/50 p-2.5 rounded-xl border border-earth-primary/30 text-xs flex items-center justify-between flex-1">
                                <div className="space-y-0.5">
                                  <p className="text-[#2E5E2A] font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-earth-primary" />
                                    <span>เช็คอินระบบเสร็จสมบูรณ์</span>
                                  </p>
                                  <p className="text-[10px] font-mono text-earth-text/80">เวลาตรวจจับ: {req.checkIn?.time} น. | ระยะ: {req.checkIn?.distanceMeters} เมตร</p>
                                </div>
                                <span className="bg-[#CBDBC8] text-[#2E5E2A] font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">IN SUCCESS</span>
                              </div>
                            )}

                            {/* Check-Out Logging status view */}
                            {hasCheckedIn && (
                              <div className="flex-1">
                                {!hasCheckedOut ? (
                                  <div>
                                    <p className="text-[11px] text-earth-text">งานเสร็จแล้วใช่หรือไม่? บันทึกรายงานเพื่อทำส่งหัวหน้าแบบอัตโนมัติ</p>
                                    <button
                                      onClick={() => setCheckoutRequestId(req.id)}
                                      className="mt-1.5 w-full bg-[#433E3B] hover:bg-[#34302C] text-[#E6D5B8] font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border border-[#E6D5B8]/20 transition active:scale-95"
                                    >
                                      <Send className="w-4 h-4" />
                                      <span>เขียนส่งสรุปงาน & เช็คเอาท์ออกงาน</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-earth-border text-xs text-earth-dark space-y-1.5">
                                    <p className="font-bold flex items-center gap-1 text-earth-primary">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>เช็คเอาท์และรายงานตัวออกเรียบร้อย</span>
                                    </p>
                                    <p className="text-[10px] font-mono text-earth-text">เวลาบันทึก: {req.checkOut?.time} น.</p>

                                    {req.checkOut?.workImage && (
                                      <div className="rounded-lg overflow-hidden border border-earth-border/60 bg-gray-100 max-w-full my-1.5 self-start shadow-2xs">
                                        <img 
                                          src={req.checkOut.workImage} 
                                          alt="Workplace Completion Evidence" 
                                          className="max-h-24 w-auto object-contain cursor-zoom-in transition-transform hover:scale-105"
                                          onClick={() => window.open(req.checkOut?.workImage, '_blank')}
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    )}

                                    <p className="text-[11px] leading-tight font-serif italic text-earth-text/90 border-l border-earth-primary pl-2">
                                      ผลงาน: "{req.checkOut?.workSummary}"
                                    </p>
                                    {req.checkOut?.issueFound && req.checkOut.issueFound !== 'ไม่มีปัญหา' && (
                                      <p className="text-[10px] text-earth-secondary font-bold">
                                        ⚠️ ปัญหา: "{req.checkOut.issueFound}" ({req.checkOut.issueResolved ? 'แก้ไขแล้ว' : 'รอรับการซัพพอร์ต'})
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}

                  {myRequests.length === 0 && (
                    <div className="text-center py-16 text-earth-text/60 border border-dashed border-earth-border rounded-3xl">
                      <History className="w-10 h-10 text-earth-border mx-auto mb-2" />
                      <p className="font-semibold text-sm">ไม่พบบันทึกของคุณ</p>
                      <p className="text-xs mt-0.5">กรุณากรอกใบขออนุมัติใช้งานภารกิจที่ด้านซ้าย</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
            )}
          </div>
        )}

      </main>

      {/* GLOBAL CHECK-OUT MODAL OVERLAY */}
      {checkoutRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#433E3B] text-white rounded-3xl border border-[#E6D5B8]/20 max-w-xl w-full p-6 md:p-8 shadow-2xl relative space-y-6 text-left animate-fadeIn">
            <button 
              onClick={() => setCheckoutRequestId(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-2 border-b border-white/15 pb-3 font-sans">
              <h3 className="font-extrabold text-lg text-[#E6D5B8] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 animate-pulse text-earth-secondary" />
                <span>เพิ่มรายละเอียดการทำงานและเช็คเอาท์ออกงาน (Check-Out Report)</span>
              </h3>
              <p className="text-xs text-white/80 font-sans">
                กรุณากรอกรายงานสรุปผลการทำงานนอกสถานที่ และระบุปัญหาอุปสรรคที่พบหลังเสร็จสิ้นภารกิจ
              </p>
            </div>

            <form onSubmit={handleCheckOutSubmit} className="space-y-4 text-xs text-white/90 font-sans">
              <div>
                <label className="block text-xs font-bold text-[#E6D5B8] mb-1 font-sans">รายงานสรุปผลการทำงาน (Work Summary):</label>
                <textarea
                  value={checkoutWorkSummary}
                  onChange={(e) => setCheckoutWorkSummary(e.target.value)}
                  placeholder="เช่น ดำเนินงานคุมทัวร์นาเมนต์รอบ 64 คน และแจกจ่ายสินค้าของพรีเมี่ยมเสร็จเรียบร้อย..."
                  className="w-full bg-black/25 border border-white/20 text-white rounded-xl px-3 py-2 text-xs min-h-[90px] outline-none focus:ring-1 focus:ring-[#8BA888]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#E6D5B8] font-sans">ระบุปัญหาและรายงานอุปสรรคที่พบเจอ (ถ้ามี):</label>
                <input
                  type="text"
                  value={checkoutIssueFound}
                  onChange={(e) => setCheckoutIssueFound(e.target.value)}
                  placeholder="ใส่ 'ไม่มีปัญหา' หากเรียบร้อยดี"
                  className="w-full bg-black/25 border border-white/20 text-white rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#8BA888]"
                />

                {/* Problem solved status switcher */}
                <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/10 mt-2 font-sans">
                  <div>
                    <p className="text-white text-xs font-bold">ปัญหานี้ได้รับการแก้ไขแล้วเสร็จในจุดปฏิบัติงานหรือไม่?</p>
                    <p className="text-white/60 text-[10px] italic">หากดำเนินการแก้ไขเสร็จสิ้นแล้ว ให้เลือกรับรองสถานะไว้</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutIssueResolved(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                        checkoutIssueResolved 
                          ? 'bg-[#8BA888] text-white' 
                          : 'bg-white/10 text-white/50 hover:bg-white/15'
                      }`}
                    >
                      แก้ไขแล้ว
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutIssueResolved(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                        !checkoutIssueResolved 
                          ? 'bg-[#D27D59] text-white' 
                          : 'bg-white/10 text-white/50 hover:bg-white/15'
                      }`}
                    >
                      ยังไม่แก้
                    </button>
                  </div>
                </div>
              </div>

              {/* WORKPLACE / TASK IMAGE VERIFICATION */}
              <div className="space-y-2 bg-black/10 p-4 rounded-xl border border-white/5 text-[#E6D5B8] font-sans">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#8BA888]" />
                    <span>แนบภาพถ่ายสถานที่ทำงานหรือภาพผลงานสำเร็จ <span className="text-emerald-400 font-bold">(ไม่บังคับ)</span></span>
                  </label>
                  {checkoutWorkImage && (
                    <button
                      type="button"
                      onClick={() => setCheckoutWorkImage('')}
                      className="text-[11px] text-rose-300 hover:text-rose-200 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบรูปภาพ</span>
                    </button>
                  )}
                </div>

                {!checkoutWorkImage ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setCheckoutWorkImage(ev.target.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="border-2 border-dashed border-white/25 hover:border-[#8BA888]/40 rounded-xl p-4 text-center cursor-pointer hover:bg-white/5 transition flex flex-col items-center gap-2 group relative"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      id="checkout-photo-input-global"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setCheckoutWorkImage(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Upload className="w-8 h-8 text-[#E6D5B8]/85 group-hover:scale-115 transition duration-200 pointer-events-none" />
                    <p className="text-xs text-white/95 font-bold pointer-events-none">ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                    <p className="text-[10px] text-white/55 pointer-events-none">(PNG, JPG, JPEG)</p>
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20 max-h-36 relative group">
                    <img 
                      src={checkoutWorkImage} 
                      alt="Workplace Completion Evidence" 
                      className="w-full h-36 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => setCheckoutRequestId(null)}
                  className="flex-1 py-2.5 bg-[#4A4541] hover:bg-[#57514C] border border-white/10 text-white rounded-xl text-xs font-bold cursor-pointer transition select-none text-center"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-earth-primary hover:bg-[#7D9A7A] text-white rounded-xl text-xs font-black shadow-sm cursor-pointer transition active:scale-98 text-center"
                >
                  📝 ยืนยันเช็คเอาท์และสรุปงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD OVERLAY */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-earth-border max-w-md w-full p-6 md:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setIsChangePasswordOpen(false)}
              className="absolute top-4 right-4 text-earth-text/60 hover:text-earth-dark p-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
            >
              ✕
            </button>
            
            <div className="space-y-2 border-b border-earth-border pb-3 text-left">
              <h3 className="font-extrabold text-earth-dark text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <span>เปลี่ยนรหัสผ่านส่วนตัวเข้าใช้งานระบบ</span>
              </h3>
              <p className="text-xs text-earth-text/80">
                เรียนคุณ <span className="font-bold text-earth-dark">{loggedInUser?.name}</span> (<span className="font-mono">{loggedInUser?.id}</span>) คุณสามารถกำหนดรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชีท่านได้ที่นี่
              </p>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-left">
              {changePasswordError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold leading-relaxed space-y-1">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-black">สำเร็จ!</span>
                  </p>
                  <p>{changePasswordSuccess}</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-black text-earth-dark tracking-wider mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-earth-primary" />
                  <span>รหัสผ่านปัจจุบัน *</span>
                </label>
                <input
                  type="password"
                  placeholder="ป้อนรหัสเดิม (รหัสผ่านเริ่มแรกคือ 1234)"
                  required
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-earth-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-earth-primary focus:ring-1 focus:ring-earth-primary shadow-3xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-earth-dark tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-earth-primary" />
                  <span>รหัสผ่านใหม่ *</span>
                </label>
                <input
                  type="password"
                  placeholder="ความยาวอย่างน้อย 4 ตัวอักษร"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-earth-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-earth-primary focus:ring-1 focus:ring-earth-primary shadow-3xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-earth-dark tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C26F49]" />
                  <span>ยืนยันรหัสผ่านใหม่ *</span>
                </label>
                <input
                  type="password"
                  placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-earth-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-earth-primary focus:ring-1 focus:ring-earth-primary shadow-3xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="flex-1 py-2.5 bg-[#F2EFE9] hover:bg-[#E8E4DB] border border-earth-border text-earth-dark rounded-xl text-xs font-bold cursor-pointer transition select-none text-center"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-earth-primary hover:bg-[#7D9A7A] text-white rounded-xl text-xs font-black shadow-sm cursor-pointer transition active:scale-98 text-center"
                >
                  📝 ยืนยันเปลี่ยนรหัส
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELF-MANAGED APPROVAL LINE MODAL */}
      {isSelfApproverOpen && loggedInUser && (
        <div className="fixed inset-0 bg-[#433E3B]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-earth-border max-w-md w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#8BA888]" />
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-extrabold text-earth-dark text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-earth-primary" />
                  <span>ตั้งค่าสายการอนุมัติตนเอง 👑</span>
                </h3>
                <p className="text-[11px] text-earth-text/80 leading-relaxed">
                  เลือกผู้มีอำนาจตรวจสอบและลงนามอนุมัติใบงานนอกสถานที่ของท่านเพื่อส่งต่อขึ้นไปอีกระดับหนึ่ง
                </p>
              </div>
            </div>

            <form onSubmit={handleSelfApproverSubmit} className="space-y-4">
              {selfApproverSuccess && (
                <div className="p-3 bg-[#E2EBE0] border border-[#8BA888]/50 rounded-xl text-[#2E5E2A] text-xs font-bold leading-relaxed">
                  🎉 {selfApproverSuccess}
                </div>
              )}

              {selfApproverError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold leading-relaxed">
                  ⚠️ {selfApproverError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-earth-dark tracking-wider mb-1 flex items-center gap-1">
                  👑 เลือกผู้อนุมัติจากระบบ *
                </label>
                <select
                  value={selfApproverId}
                  onChange={(e) => {
                    setSelfApproverId(e.target.value);
                    setSelfApproverSuccess('');
                    setSelfApproverError('');
                  }}
                  className="w-full bg-[#FAF9F6] border border-earth-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-earth-primary focus:ring-1 focus:ring-earth-primary shadow-3xs cursor-pointer"
                >
                  <option value="">-- ไม่ระบุผู้อนุมัติ (พิจารณาตนเอง) --</option>
                  {employees
                    .filter(e => (e.position === 'manager' || e.position === 'admin' || e.role.includes('จัดการ') || e.role.includes('CEO') || e.id === 'KK0031') && e.id !== loggedInUser.id)
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role.split(' (')[0]})
                      </option>
                    ))}
                  <option value="custom">✍️ ระบุหัวหน้างานกำหนดเอง...</option>
                </select>
              </div>

              {selfApproverId === 'custom' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-[10px] uppercase font-black text-rose-700 tracking-wider mb-1 flex items-center gap-1">
                    ✍️ ชื่อหัวหน้างานกำหนดเอง (ระบุด้วยตนเอง) *
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น คุณวีระศักดิ์ (CEO) หรือ คุณกานดา (ผู้จัดการฝ่าย)"
                    required
                    value={selfCustomApproverName}
                    onChange={(e) => {
                      setSelfCustomApproverName(e.target.value);
                      setSelfApproverSuccess('');
                      setSelfApproverError('');
                    }}
                    className="w-full bg-[#FAF9F6] border border-rose-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-3xs"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSelfApproverOpen(false)}
                  className="flex-1 py-2.5 bg-[#F2EFE9] hover:bg-[#E8E4DB] border border-earth-border text-earth-dark rounded-xl text-xs font-bold cursor-pointer transition select-none text-center"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-earth-primary hover:bg-[#799976] text-white rounded-xl text-xs font-black shadow-sm cursor-pointer transition active:scale-98 text-center"
                >
                  💾 บันทึกสายอนุมัติ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER MANUAL OVERLAY */}
      <UserManualModal
        isOpen={isUserManualOpen}
        onClose={() => setIsUserManualOpen(false)}
        currentUserRole={loggedInUser ? loggedInUser.position : 'employee'}
        currentUserName={loggedInUser ? loggedInUser.name : 'ผู้ใช้ทั่วไป'}
      />

      {/* FOOTER METADATA SYSTEM */}
      <footer className="bg-[#433E3B] border-t border-earth-border/20 text-white/65 text-xs py-8 px-6 text-center space-y-3 mt-12">
        <div className="flex justify-center items-center gap-4">
          <p>ระบบบริหารส่วนงานจัดการ และความคลาดเคลื่อนพิกัด (C) 2026</p>
          <span className="text-[#E6D5B8]">|</span>
          <p>บริษัท คิดซ์ แอนด์ คิทซ์ จำกัด (Kidz & Kitz Co., Ltd.)</p>
        </div>
        <p className="text-[10.5px] text-[#E6D5B8]/80 leading-relaxed max-w-xl mx-auto font-serif">
          ระบบความมั่นคงพิกัด GPS อ้างอิงสถาปัตยกรรม GIS ยุคถัดไป ใช้งานร่วมกับ AI Studio Sandbox สำหรับรวบรวมรายงานและผลการดำเนินงานแบบเรียลไทม์
        </p>
      </footer>
    </div>
  );
}
