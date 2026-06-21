import { useState } from 'react';
import { Copy, Check, FileCode, X, Sparkles } from 'lucide-react';

interface GASPorterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GASPorter({ isOpen, onClose }: GASPorterProps) {
  const [copied, setCopied] = useState(false);

  // Ready-to-use Gas template
  const gasHtmlCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ระบบเช็คอินนอกสถานที่ และบริหารแผนล่วงหน้า | Kidz & Kitz Co., Ltd.</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- CDNs for styling, styling framework, and icon system -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- React and ReactDOM (Development Build for testing or production) -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  
  <!-- Babel Standalone compiler to process React JSX inside Google Apps Script -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <script>
    // Tailwind Custom Configuration to align with our branding
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            earth: {
              primary: '#8BA888',
              secondary: '#C84B31',
              dark: '#433E3B',
              text: '#625C58',
              border: '#E3DEC3',
              sidebar: '#FCFBF8',
              sand: '#EAE5D9'
            }
          }
        }
      }
    }
  </script>

  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #FAF9F5;
      color: #625C58;
    }
    /* Scrollbar enhancements */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #FAF9F5;
    }
    ::-webkit-scrollbar-thumb {
      background: #E3DEC3;
      border-radius: 99px;
    }
  </style>
</head>
<body class="bg-[#FAF9F5] text-earth-text min-h-screen">
  
  <!-- Anchor root for ReactDOM rendering -->
  <div id="root"></div>

  <!-- Lucide Icons Global script -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- React & Vanilla JS app logic -->
  <script type="text/babel">
    const { useState, useEffect, useMemo } = React;

    // POPULAR LOCATIONS PRESETS
    const POPULAR_LOCATIONS = [
      { name: 'เมก้า พลาซ่า สะพานเหล็ก', lat: 13.7463, lng: 100.5018, address: 'วังบูรพาภิรมย์ เขตพระนคร กรุงเทพฯ' },
      { name: 'เดอะมอลล์ บางกะปิ (Zone Toy)', lat: 13.7663, lng: 100.6433, address: 'คลองจั่น เขตบางกะปิ กรุงเทพฯ' },
      { name: 'ศูนย์การค้าแอปเปิ้ลมอลล์ แฟลต 1', lat: 13.8123, lng: 100.5621, address: 'ลาดยาว เขตจตุจักร กรุงเทพฯ' },
      { name: 'สํานักงานใหญ่ Kidz & Kitz', lat: 13.7542, lng: 100.5024, address: 'แขวงวัดสามพระยา เขตพระนคร กรุงเทพฯ' }
    ];

    // MOCK DATA FOR BOOTSTRAPPING
    const INITIAL_EMPLOYEES = [
      { id: 'EMP001', name: 'สมศักดิ์ รักดี', role: 'ผู้ช่วยการตลาดสื่อสิ่งพิมพ์และการ์ดเกม', department: 'ฝ่ายพัฒนาธุรกิจ (BD)', avatarColor: '#3A5C3D', workGroup: 'regular' },
      { id: 'EMP002', name: 'กิตติศักดิ์ พูลทวี', role: 'เจ้าหน้าที่ทีมงานอีเวนต์นอกสถานที่', department: 'ฝ่ายกิจกรรมและแข่งขัน', avatarColor: '#A27B5C', workGroup: 'adhoc' },
      { id: 'EMP003', name: 'ธิดารัตน์ งดงาม', role: 'ผู้ประสานงานลิขสิทธิ์และการตลาดย่อย', department: 'ฝ่ายลิขสิทธิ์สากล', avatarColor: '#D38B5D', workGroup: 'regular' }
    ];

    const INITIAL_REQUESTS = [
      {
        id: 'REQ001',
        employeeId: 'EMP001',
        employeeName: 'สมศักดิ์ รักดี',
        role: 'ผู้ช่วยการตลาดสื่อสิ่งพิมพ์และการ์ดเกม',
        date: '2026-06-13',
        startTime: '09:00',
        endTime: '18:00',
        location: POPULAR_LOCATIONS[0],
        status: 'approved',
        reason: 'ตรวจสอบลิขสิทธิ์การวางจำหน่ายการ์ดชุดใหม่ และทดสอบการแข่งขันการ์ดเกมประจำสาขาดังกล่าว'
      },
      {
        id: 'REQ002',
        employeeId: 'EMP002',
        employeeName: 'กิตติศักดิ์ พูลทวี',
        role: 'เจ้าหน้าที่ทีมงานอีเวนต์นอกสถานที่',
        date: '2026-06-13',
        startTime: '10:00',
        endTime: '19:00',
        location: POPULAR_LOCATIONS[1],
        status: 'approved',
        reason: 'ดำเนินงานจัดแข่งขันการ์ดแวนการ์ดรอบสุดท้ายระดับย่อย บันทึกวิดีโอถ่ายทอดสดหน้างาน',
        checkIn: { time: '09:47', lat: 13.7665, lng: 100.6435, distanceMeters: 28 }
      }
    ];

    function App() {
      const [activeRole, setActiveRole] = useState('employee');
      const [employeeActiveTab, setEmployeeActiveTab] = useState('daily');
      const [simulatedEmployeeId, setSimulatedEmployeeId] = useState('EMP001');
      const [selectedMonth, setSelectedMonth] = useState('2026-06');
      
      // Load initial lists from LocalStorage or Fallback
      const [employees, setEmployees] = useState(() => {
        const saved = localStorage.getItem('offsite_employees_gas');
        return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
      });

      const [requests, setRequests] = useState(() => {
        const saved = localStorage.getItem('offsite_requests_gas');
        return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
      });

      const [plans, setPlans] = useState(() => {
        const saved = localStorage.getItem('offsite_plans_gas');
        return saved ? JSON.parse(saved) : [
          {
            id: 'PLAN-2026-001',
            employeeId: 'EMP001',
            employeeName: 'สมศักดิ์ รักดี',
            title: 'แผนงานส่งเสริมสโมสรการคุมแข่งขันการ์ดเกมตลอดเดือนมิถุนายน',
            type: 'monthly',
            startDate: '2026-06-01',
            endDate: '2026-06-30',
            status: 'approved',
            approvedBy: 'กานดา ยอดรัก (ผู้จัดการ)',
            approvedAt: '28/05/2569 11:15',
            plannedDates: [
              { date: '2026-06-13', location: POPULAR_LOCATIONS[0], purpose: 'จัดการแข่งขันประจำวันสัปดาห์ที่สาม', startTime: '09:00', endTime: '18:00' }
            ]
          }
        ];
      });

      // Synchronize states
      useEffect(() => { localStorage.setItem('offsite_employees_gas', JSON.stringify(employees)); }, [employees]);
      useEffect(() => { localStorage.setItem('offsite_requests_gas', JSON.stringify(requests)); }, [requests]);
      useEffect(() => { localStorage.setItem('offsite_plans_gas', JSON.stringify(plans)); }, [plans]);

      // Trigger Lucide replace as soon as dom elements are compiled
      useEffect(() => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      });

      const currentSimEmployee = employees.find(e => e.id === simulatedEmployeeId) || employees[0];

      // Form State
      const [formDate, setFormDate] = useState('2026-06-13');
      const [formStartTime, setFormStartTime] = useState('09:00');
      const [formEndTime, setFormEndTime] = useState('18:00');
      const [formLocationPreset, setFormLocationPreset] = useState(POPULAR_LOCATIONS[0].name);
      const [formReason, setFormReason] = useState('');

      // Checkout State
      const [checkoutSummary, setCheckoutSummary] = useState('');
      const [checkoutPresetImage, setCheckoutPresetImage] = useState('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80');

      // Submitting off-site request
      const handleRequestSubmit = (e) => {
        e.preventDefault();
        
        // Find matching popular location coords
        const loc = POPULAR_LOCATIONS.find(l => l.name === formLocationPreset) || POPULAR_LOCATIONS[0];
        
        const isRegular = currentSimEmployee.workGroup === 'regular';
        let status = 'pending';
        let successMsg = '';

        if (isRegular) {
          // Verify with approved plan to perform Auto-Approval
          const dateMatch = plans.find(p => 
            p.employeeId === currentSimEmployee.id && 
            p.status === 'approved' &&
            p.plannedDates.some(pd => pd.date === formDate)
          );

          if (dateMatch) {
            status = 'approved';
            successMsg = '✅ ตรวจพบแผนการปฏิบัติงานล่วงหน้าที่หัวหน้างานอนุมัติเรียบร้อยแล้ว: คำขอเข้าพื้นที่ได้รับ "อนุมัติทันที" โดยท่านพกแผนสิทธิ์อนุมัติเรียบร้อย';
          } else {
            alert('⚠️ แจ้งเตือนข้อตกลง: พนักงานนอกสถานที่กลุ่มประจำ "ต้องเสนอร่างแผนปฏิบัติงานล่วงหน้า" และให้ผู้จัดการกดผ่านอนุมัติล่วงหน้าเสียก่อน จึงส่งคำขอบันทึกเวลาในวันดังกล่าวได้');
            return;
          }
        } else {
          successMsg = '📥 ส่งผลงานขอลงตำแหน่งสำเร็จ (กลุ่มรายสัปดาห์/ครั้ง): คำขอเดินทางของท่านกำลังรองผู้จัดการเข้าทำตรวจทานพิจารณาตามปรกติ';
        }

        const newReq = {
          id: 'REQ-' + Date.now().toString().slice(-5),
          employeeId: currentSimEmployee.id,
          employeeName: currentSimEmployee.name,
          role: currentSimEmployee.role,
          date: formDate,
          startTime: formStartTime,
          endTime: formEndTime,
          location: loc,
          status,
          reason: formReason || 'ตรวจสอบการวางจุดของแข่งขันและการตั้งบูธ'
        };

        setRequests(prev => [newReq, ...prev]);
        setFormReason('');
        alert(successMsg);
      };

      // Check-in simulator
      const handleCheckIn = (reqId) => {
        setRequests(prev => prev.map(req => {
          if (req.id === reqId) {
            return {
              ...req,
              checkIn: {
                time: new Date().toLocaleTimeString('th-TH').slice(0, 5),
                lat: req.location.lat + (Math.random() - 0.5) * 0.002, // simulated near drift
                lng: req.location.lng + (Math.random() - 0.5) * 0.002,
                distanceMeters: Math.floor(Math.random() * 80) + 15
              }
            };
          }
          return req;
        }));
        alert('📍 ปักหมุดเช็คอินสำเร็จ! ระบบยืนยันบันทึกละติจูดและอคติ GPS เรียบร้อย');
      };

      // Check-out simulator
      const handleCheckOut = (reqId) => {
        if (!checkoutSummary.trim()) {
          alert('กรุณากรอกบันทึกสรุปงานหรือพยานหลักฐานและถ่ายรูปหน้างานเสียก่อน');
          return;
        }

        setRequests(prev => prev.map(req => {
          if (req.id === reqId) {
            return {
              ...req,
              checkOut: {
                time: new Date().toLocaleTimeString('th-TH').slice(0, 5),
                workSummary: checkoutSummary,
                workImage: checkoutPresetImage,
                issuePreset: 'ไม่มีปัญหา',
                issueDescription: ''
              }
            };
          }
          return req;
        }));

        setCheckoutSummary('');
        alert('🎉 เช็คเอาท์และรายงานตัวออกเสร็จสมบูรณ์! ขยายข้อมูลภาพงานเข้าคลาวด์เพื่อความปลอดภัยหลักฐานของท่านเรียบร้อย');
      };

      // Drafting Plan submit
      const handlePlanDraftSubmit = (planTitle, planType, startDate, endDate, draftDays) => {
        const plannedDates = draftDays.map(pd => {
          const loc = POPULAR_LOCATIONS.find(l => l.name === pd.locationPreset) || POPULAR_LOCATIONS[0];
          return {
            date: pd.date,
            location: loc,
            purpose: pd.purpose || 'ดูแลสาขาและคุมแข่ง',
            startTime: '09:00',
            endTime: '18:00'
          };
        });

        const newPlan = {
          id: 'PLAN-' + Date.now().toString().slice(-4),
          employeeId: currentSimEmployee.id,
          employeeName: currentSimEmployee.name,
          title: planTitle,
          type: planType,
          startDate,
          endDate,
          status: 'pending',
          plannedDates,
          createdAt: new Date().toLocaleDateString('th-TH')
        };

        setPlans(prev => [newPlan, ...prev]);
        alert('✨ ส่งแบบแผนสำเร็จ! โปรดเข้าหน้าต่างผู้จัดการเพื่อกดยืนยันใบอนุมัติ');
      };

      return (
        <div className="flex flex-col min-h-screen">
          {/* HEADER NAV */}
          <header className="bg-earth-dark text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-earth-border/25">
            <div className="flex items-center gap-3">
              <div className="bg-earth-primary text-earth-dark w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg">💡</div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">ระบบบริหารงานและลงทะเบียนพิกัดภูมิศาสตร์ (GPS Tracker with pre-plans)</h1>
                <p className="text-[10px] text-earth-sand/80 font-sans">ออกแบบเพื่อเสวียนพนักงานและพยานฝ่าย Kidz & Kitz</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-[#EAE5D9]/20 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveRole('employee')}
                  className={"px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer " + (activeRole === 'employee' ? 'bg-earth-primary text-white shadow-xs' : 'text-earth-sand')}
                >
                  👤 แผงควบคุมพนักงาน
                </button>
                <button 
                  onClick={() => setActiveRole('manager')}
                  className={"px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer " + (activeRole === 'manager' ? 'bg-earth-primary text-white shadow-xs' : 'text-earth-sand')}
                >
                  👔 โต๊ะทำงานผู้จัดการ
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
            
            {/* INLINE SIMULATOR CONTROLS */}
            <div className="bg-white border border-earth-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-2xs">
              <div className="text-xs">
                <span className="font-extrabold text-earth-dark block">🎮 จำลองบัญชีพนักงานที่ล็อกอินอยู่:</span>
                <p className="text-earth-text/80 text-[11px]">สตรีมข้อมูลตัวตนเสมือนเพื่อทำการทดสอบสลับขอบเขตเงื่อนไข</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {employees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => setSimulatedEmployeeId(emp.id)}
                    className={"px-3 py-1.5 rounded-xl text-xs font-bold border transition duration-150 cursor-pointer " + (simulatedEmployeeId === emp.id ? 'bg-earth-primary text-white border-earth-primary' : 'bg-earth-sidebar hover:bg-earth-sand/35 text-earth-dark border-earth-border')}
                  >
                    {emp.name} ({emp.workGroup === 'regular' ? 'กลุ่มประจำ' : 'กลุ่มรายครั้ง'})
                  </button>
                ))}
              </div>
            </div>

            {/* MANAGER DASHBOARD VIEW */}
            {activeRole === 'manager' && (
              <div className="space-y-6">
                
                {/* 1. EMPLOYEE GROUPS & PLANS PANEL */}
                <div className="bg-white border border-earth-border rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-earth-dark text-base border-b border-earth-border pb-2.5">
                    ⚙️ จัดการสิทธิ์แยกกลุ่มพนักงาน และสลับสิทธิ์การปฏิบัติงานนอกสถานที่
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold mb-2">บัญชีรายชื่อพนักงานทั้งหมด:</p>
                      <div className="space-y-2 border border-earth-border rounded-xl p-3 bg-earth-sidebar">
                        {employees.map(emp => (
                          <div key={emp.id} className="flex justify-between items-center bg-white border border-earth-border/65 p-2 rounded-lg text-xs">
                            <div>
                              <p className="font-bold">{emp.name}</p>
                              <p className="text-[10px] text-earth-text/80">{emp.role}</p>
                              <span className={"text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 " + (emp.workGroup === 'regular' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300')}>
                                {emp.workGroup === 'regular' ? 'ส่งประจำ: ต้องมีแผนล่วงหน้า' : 'ขอส่งรายครั้ง: รออนุมัติปรกติ'}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, workGroup: e.workGroup === 'regular' ? 'adhoc' : 'regular' } : e));
                              }}
                              className="bg-[#EAE5D9] hover:bg-[#D4CEBF] text-earth-dark font-black px-2 py-1 rounded text-[10px] cursor-pointer"
                            >
                              🔄 สลับกลุ่ม
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pending pre-plans approvals */}
                    <div>
                      <p className="text-xs font-bold mb-2">ตรวจสอบร่างแผนปฏิบัติรายสัปดาห์ / รายเดือน ({plans.filter(p => p.status === 'pending').length} รายการร่างที่เสนอค้าง):</p>
                      <div className="space-y-3">
                        {plans.filter(p => p.status === 'pending').map(p => (
                          <div key={p.id} className="bg-white border border-earth-border p-3.5 rounded-xl text-xs space-y-2 relative">
                            <span className="absolute top-2 right-2 text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold">ร่างรอคุณตรวจ</span>
                            <p className="font-bold">{p.title}</p>
                            <p className="text-[10px] text-earth-text/80">ผู้ขอเสนอ: {p.employeeName}</p>
                            
                            <div className="bg-[#FAF9F6] p-2 rounded-lg text-[10px] space-y-1">
                              {p.plannedDates.map((pd, idx) => (
                                <div key={idx} className="border-b border-earth-border/40 pb-1 last:border-b-0">
                                  <p className="font-semibold text-earth-dark">{pd.date.split('-').reverse().join('/')}: {pd.location.name}</p>
                                  <p className="italic font-serif">วัตถุประสงค์: "{pd.purpose}"</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                onClick={() => {
                                  const ans = prompt('พิมพ์เหตุผลที่ไม่ผ่านร่างแผนปฏิบัตินี้:');
                                  if (ans === null) return;
                                  setPlans(prev => prev.map(pl => pl.id === p.id ? { ...pl, status: 'rejected', rejectedReason: ans } : pl));
                                }}
                                className="bg-rose-100 text-rose-800 font-bold px-3 py-1 rounded font-mono text-[10px] cursor-pointer"
                              >
                                ❌ ไม่อนุมัติ
                              </button>
                              <button
                                onClick={() => {
                                  setPlans(prev => prev.map(pl => pl.id === p.id ? { ...pl, status: 'approved', approvedBy: 'กานดา ยอดรัก (ผู้จัดการ)', approvedAt: new Date().toLocaleDateString('th-TH') } : pl));
                                }}
                                className="bg-earth-primary hover:bg-[#799976] text-white font-bold px-3 py-1 rounded text-[10px] cursor-pointer"
                              >
                                ✅ ผ่านอนุมัติแผนล่วงหน้า
                              </button>
                            </div>
                          </div>
                        ))}
                        {plans.filter(p => p.status === 'pending').length === 0 && (
                          <div className="text-center py-8 text-[11px] bg-white border border-dashed rounded-xl">
                            ✅ อนุมัติร่างแผนล่วงหน้าครบถ้วนเรียบร้อยแล้ว!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. REGULAR LOGS AND PENDING REQUESTS DAILY */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending daily logs */}
                  <div className="bg-white border border-earth-border rounded-3xl p-5 space-y-3">
                    <h4 className="font-bold text-sm text-earth-dark border-b border-earth-border pb-2">คำขอความจำนนรายครั้งกำลังขออนุมัติพื้นที่</h4>
                    <div className="space-y-3">
                      {requests.filter(r => r.status === 'pending').map(req => (
                        <div key={req.id} className="p-3 bg-earth-sidebar border rounded-xl text-xs space-y-2 relative">
                          <p className="font-bold">{req.employeeName}</p>
                          <p className="text-[10px] text-earth-text/80">{req.date} | พิกัด: {req.location.name}</p>
                          <p className="italic">เหตุผล: "{req.reason}"</p>
                          
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
                              }}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-800 px-2 py-1 rounded font-bold text-[10px] cursor-pointer"
                            >
                              ปฏิเสธคำขอ
                            </button>
                            <button
                              onClick={() => {
                                setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
                              }}
                              className="bg-earth-primary text-white px-3 py-1 rounded font-bold text-[10px] cursor-pointer"
                            >
                              อนุญาตให้ลงพื้นที่
                            </button>
                          </div>
                        </div>
                      ))}
                      {requests.filter(r => r.status === 'pending').length === 0 && (
                        <div className="text-center py-6 text-xs text-earth-text/60">ไม่มีคำขอด้านนอกรออนุมัติ</div>
                      )}
                    </div>
                  </div>

                  {/* Active logs inside dashboard */}
                  <div className="bg-white border border-earth-border rounded-3xl p-5 space-y-3">
                    <h4 className="font-bold text-sm text-earth-dark border-b border-earth-border pb-2">ตรวจสอบหลักฐานเช็คอิน / เช็คเอาท์ ปิดงานด่วน</h4>
                    <div className="space-y-3 max-h-[290px] overflow-y-auto">
                      {requests.filter(r => r.checkIn).map(req => (
                        <div key={req.id} className="p-3 bg-white border border-earth-border rounded-lg text-xs space-y-2">
                          <div className="flex justify-between font-bold">
                            <span>👤 {req.employeeName}</span>
                            <span className={"px-1.5 py-0.5 rounded text-[9px] " + (req.checkOut ? 'bg-emerald-50 text-[#2E5E2A]' : 'bg-sky-50 text-sky-800')}>
                              {req.checkOut ? 'สำเร็จเสร็จงาน' : 'กำลังปฏิบัติหน้างาน'}
                            </span>
                          </div>
                          
                          <div className="p-2 bg-[#FCFAF7] border rounded text-[10px] space-y-1">
                            <p>📍 เช็คอินเวลา: {req.checkIn.time} น. (ความคลาดเคลื่อน GPS มือถือ: {req.checkIn.distanceMeters} เมตร)</p>
                            {req.checkOut && (
                              <div className="border-t border-earth-border/40 pt-2 text-[#2E5E2A]">
                                <p className="font-extrabold">📝 สรุปผลรายงานคุณค่าพยาน:</p>
                                <p className="italic text-earth-dark">"{req.checkOut.workSummary}"</p>
                                {req.checkOut.workImage && (
                                  <img src={req.checkOut.workImage} className="w-full h-24 object-cover rounded mt-1.5 border" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EMPLOYEE WORKSPACE VIEW */}
            {activeRole === 'employee' && (
              <div className="space-y-6">
                
                {/* Switcher Tab */}
                <div className="flex bg-white border border-earth-border p-1 rounded-xl w-full max-w-sm">
                  <button
                    onClick={() => setEmployeeActiveTab('daily')}
                    className={"flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer " + (employeeActiveTab === 'daily' ? 'bg-earth-primary text-white shadow-xs' : 'text-earth-dark')}
                  >
                    ลงเวลานอกสถานที่รายวัน
                  </button>
                  <button
                    onClick={() => setEmployeeActiveTab('planning')}
                    className={"flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer " + (employeeActiveTab === 'planning' ? 'bg-earth-primary text-white shadow-xs' : 'text-earth-dark')}
                  >
                    ยื่นสิทธิ์และตรวจแผนล่วงหน้า
                  </button>
                </div>

                {employeeActiveTab === 'planning' ? (
                  <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-base border-b pb-2">📅 ยื่นตารางร่างแผนงานล่วงหน้า (สำหรับพนักงานนอกสถานที่ประจำ)</h3>
                    
                    {/* Visual notice */}
                    <div className="p-4 bg-emerald-50 text-[#2E5E2A] rounded-xl border border-emerald-200 text-xs leading-relaxed">
                      💡 <strong>ระเบียบตามข้อสัญญาของบริษัท Kidz & Kitz:</strong> 
                      พนักงานในกลุ่ม "นอกสถานที่ประจำเป็นนิจ" จะต้องคอยยื่นแสดงกรอกช่วงวันลงเวลากิจกรรมให้ผู้จัดการอนุมัติล่วงหน้าเพื่อเตรียมพร้อมเข้าสู่สิทธิ์ Auto-Approval ในการลงจริงรายวัน
                    </div>

                    {/* Quick draft template form */}
                    <div className="space-y-4 bg-earth-sidebar border rounded-2xl p-4">
                      <p className="text-xs font-extrabold text-earth-dark">กรอกตารางเสนอร่างแผนปฏิบัติการล่วงหน้า:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <input
                          type="text"
                          id="gas-plan-title"
                          placeholder="หัวตารางร่าง (เช่น แผนการตลาดสโมสรประจำเดือนมิถุนายน)"
                          className="p-2 border rounded-lg bg-white "
                        />
                        <select id="gas-plan-type" className="p-2 border rounded-lg bg-white font-bold">
                          <option value="weekly">แผนแบบรายสัปดาห์</option>
                          <option value="monthly">แผนแบบรายเดือน</option>
                        </select>
                      </div>

                      <div className="space-y-3 bg-white p-3.5 rounded-xl border">
                        <p className="text-[10px] font-bold">รายการจุดพื้นที่และวันที่ระบุระเบียบ (จำลองวันที 13/06/2026):</p>
                        <div className="flex flex-col sm:flex-row gap-3 text-xs items-center">
                          <input type="date" id="gas-pd-date" defaultValue="2026-06-13" className="p-2 border rounded-lg" />
                          <select id="gas-pd-loc" className="p-2 border rounded-lg flex-1">
                            {POPULAR_LOCATIONS.map((l, i) => <option key={i} value={l.name}>{l.name}</option>)}
                          </select>
                          <input type="text" id="gas-pd-purpose" placeholder="ระบุภารกิจ (เช่น ดำเนินจัดแข่งเกม)" className="p-2 border rounded-lg flex-1" />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const title = document.getElementById('gas-plan-title').value;
                          const type = document.getElementById('gas-plan-type').value;
                          const date = document.getElementById('gas-pd-date').value;
                          const locName = document.getElementById('gas-pd-loc').value;
                          const purpose = document.getElementById('gas-pd-purpose').value;

                          if (!title.trim()) { alert('กรุณาระบุหัวเรื่องตารางร่าง'); return; }
                          
                          handlePlanDraftSubmit(title, type, '2026-06-01', '2026-06-30', [
                            { date, locationPreset: locName, purpose }
                          ]);
                        }}
                        className="bg-earth-primary text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                      >
                        🚀 ยื่นเสนอร่างแผนงานเพื่อให้หัวหน้าอนุมัติ
                      </button>
                    </div>

                    {/* Historical plans list */}
                    <div className="space-y-2 pt-4">
                      <p className="text-xs font-bold">ประวัติแผนและสถานะของแผนล่วงหน้าของคุณ:</p>
                      {plans.filter(p => p.employeeId === currentSimEmployee.id).map(p => (
                        <div key={p.id} className="p-3 border rounded-xl text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold">{p.title}</p>
                            <p className="text-[10px] text-earth-text/85">ลงแผนวันที่ ({p.startDate} ถึง {p.endDate})</p>
                          </div>
                          <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + (p.status === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800')}>
                            {p.status === 'approved' ? '✅ บรรลุสิทธิ์ pre-approved เรียบร้อย' : '⏰ รอหัวหน้างานพิจารณาตรวจสอบ'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT FORM REQUEST COLUMN (5 cols) */}
                    <div className="lg:col-span-5 bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="font-bold text-sm text-earth-dark border-b pb-2">📝 ขอเข้าพื้นที่ปฏิบัติงานนอกสถานที่รายวัน</h3>
                      
                      {currentSimEmployee.workGroup === 'regular' && (
                        <div className="p-3 bg-[#FCFAF7] border border-emerald-200 text-[#2E5E2A] text-xs leading-relaxed rounded-xl font-bold">
                          💡 ท่านสังกัด "พนักงานประจำนอกสถานที่" ระบบจะตรวจสอบกับแผนรับรอบเป้าหมายแบบ Auto-Approval ทันทีเมื่อท่านกดบันทึกในวันทีตรงกัน
                        </div>
                      )}

                      <form onSubmit={handleRequestSubmit} className="space-y-3.5 text-xs">
                        <div>
                          <label className="block text-earth-text font-bold mb-1">วันที่เดินทางพิกัด</label>
                          <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full p-2 border rounded-lg bg-[#FAF9F6]" required />
                        </div>
                        
                        <div>
                          <label className="block text-earth-text font-bold mb-1">จุดเข้าถึงพิกัดเป้าหมาย</label>
                          <select value={formLocationPreset} onChange={(e) => setFormLocationPreset(e.target.value)} className="w-full p-2 border rounded-lg bg-[#FAF9F6] font-bold">
                            {POPULAR_LOCATIONS.map((l, i) => <option key={i} value={l.name}>{l.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-earth-text font-bold mb-1">คำอธิบายเหตุผลและรายละเอียดภารกิจ</label>
                          <textarea
                            value={formReason}
                            onChange={(e) => setFormReason(e.target.value)}
                            placeholder="ระบุกิจกรรม เช่น คุมแข่งขันการ์ดแวนการ์ด ตรวจเช็คบูธการ์ด ยู-กี-โอ..."
                            className="w-full p-2 border rounded-lg bg-[#FAF9F6]"
                            rows="2"
                            required
                          />
                        </div>

                        <button type="submit" className="w-full bg-earth-primary hover:bg-[#7d997a] text-white py-2.5 rounded-xl font-bold transition cursor-pointer">
                          บันทึกส่งข้อมูลขอลงสัมผัสงาน
                        </button>
                      </form>
                    </div>

                    {/* RIGHT HISTORY AND DAILY LOGS COLUMN (7 cols) */}
                    <div className="lg:col-span-12 md:col-span-7 bg-white border rounded-3xl p-6 space-y-4">
                      <h3 className="font-bold text-sm text-earth-dark border-b pb-2">📋 ประวัติการยื่นความจำลอง และบันทึกเช็คอิน-เช็คเอาท์หน้างาน</h3>
                      <div className="space-y-4">
                        {requests.filter(r => r.employeeId === currentSimEmployee.id).map(req => {
                          const isApproved = req.status === 'approved';
                          return (
                            <div key={req.id} className="p-4 bg-earth-sidebar border rounded-2xl text-xs space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-earth-dark">📍 {req.location.name}</span>
                                <span className={"font-mono text-[10px] font-bold px-2 py-0.5 rounded-full " + (isApproved ? 'bg-emerald-50 text-[#2E5E2A]' : 'bg-amber-50 text-amber-800')}>
                                  {isApproved ? 'อนุมัติผ่าน / พร้อมเริ่มงาน' : 'รอการอนุมัติใบ'}
                                </span>
                              </div>

                              <p className="text-[11px] text-earth-text/85">วันที่ปฏิบัติภารกิจ: {req.date} | เหตุผลคำขอ: "{req.reason}"</p>

                              {/* Operations desk checks */}
                              {isApproved && (
                                <div className="p-3 bg-white border border-earth-border/50 rounded-xl space-y-2">
                                  {!req.checkIn && (
                                    <button
                                      onClick={() => handleCheckIn(req.id)}
                                      className="bg-earth-primary text-white font-bold px-3 py-1.5 rounded-lg text-[11px] cursor-pointer"
                                    >
                                      📌 กดเช็คอิน ณ พิกัดจริง (Check-In)
                                    </button>
                                  )}

                                  {req.checkIn && !req.checkOut && (
                                    <div className="space-y-2.5">
                                      <p className="text-emerald-800 font-extrabold text-[11px]">📍 เช็คอินเสร็จพิกัดภูมิศาสตร์เวลา {req.checkIn.time} น. (คลาดเคลื่อน: {req.checkIn.distanceMeters} เมตร)</p>
                                      
                                      <div className="border-t border-earth-border/40 pt-2 space-y-2 bg-[#FCFAF7] p-2.5 rounded-lg">
                                        <p className="font-bold text-earth-dark">🏁 ขอยอดปิดจบงาน (Check-Out) บังคับภาพห้ามแเด้ง:</p>
                                        
                                        <input
                                          type="text"
                                          placeholder="ระบุสรุปผลงานสำคัญ เช่น การตรวจบูธส่งเครื่องเสร็จเรียบร้อย..."
                                          id={"co-desc-" + req.id}
                                          className="w-full p-2 border bg-white rounded text-xs"
                                        />
                                        
                                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                                          <button
                                            onClick={() => setCheckoutPresetImage('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80')}
                                            className="p-1 px-2 border rounded hover:bg-earth-primary hover:text-white"
                                          >
                                            🖼️ ถ่ายรูปหน้างาน (Preset 1)
                                          </button>
                                          <button
                                            onClick={() => setCheckoutPresetImage('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80')}
                                            className="p-1 px-2 border rounded hover:bg-earth-primary hover:text-white"
                                          >
                                            🖼️ ถ่ายรูปพยาน (Preset 2)
                                          </button>
                                        </div>

                                        <button
                                          onClick={() => {
                                            const sumMsg = document.getElementById("co-desc-" + req.id).value;
                                            setCheckoutSummary(sumMsg);
                                            // Hack summary setter delay to process standard state layout sync
                                            setTimeout(() => {
                                              handleCheckOut(req.id);
                                            }, 50);
                                          }}
                                          className="bg-[#C84B31] hover:bg-red-800 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10.5px] cursor-pointer"
                                        >
                                          🚀 ยื่นเช็คเอาท์ปิดภารกิจหน้างานเสร็จสิ้น
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {req.checkOut && (
                                    <div className="bg-emerald-50 text-[#2E5E2A] p-2 rounded-lg text-[10.5px] space-y-1">
                                      <p className="font-bold">🏁 เช็คเอาท์และรายงานตัวสำเร็จเวลา: {req.checkOut.time} น.</p>
                                      <p className="text-earth-dark italic font-serif">"{req.checkOut.workSummary}"</p>
                                      <img src={req.checkOut.workImage} className="w-full h-24 object-cover rounded mt-1 shadow-2xs border" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          <footer className="bg-earth-dark text-white/70 py-6 text-center text-[11px] border-t border-earth-border/10 mt-12">
            <p>ระบบเช็คอินนอกสถานที่ และติดตามคลาวด์ GPS | Kidz & Kitz Co., Ltd.</p>
            <p className="text-[10px] text-earth-sand/40 font-serif mt-1">ลิขสิทธิ์ความมั่นคงพิกัดภูมิศาสตร์ระดับองค์กร (C) 2569</p>
          </footer>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(gasHtmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end transition-all">
      <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in duration-300">
        
        {/* HEADER BLOCK */}
        <div className="bg-earth-dark text-white px-6 py-5 flex justify-between items-center border-b border-earth-border/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-earth-primary/20 rounded-xl">
              <FileCode className="w-6 h-6 text-earth-primary animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>Google Apps Script Deployment Code porter</span>
                <Sparkles className="w-4 h-4 text-earth-primary" />
              </h3>
              <p className="text-[10px] text-earth-sand/80 font-sans">คัดลอกไฟล์ HTML/JS สำเร็จรูปที่ไร้นิเวศ ES Modules ไปเพสลงใน GAS ได้ทันที</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 px-2.5 rounded-xl hover:bg-white/10 text-white/80 transition duration-150 cursor-pointer text-xs"
            title="ปิดหน้าต่างนำออกโค้ด"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>

        {/* INSTRUCTIONS CONTENT PANEL */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-[#FBF9F6]">
          <div className="bg-[#E2EBE0] border border-earth-primary/45 rounded-2xl p-4 text-xs text-[#2E5E2A] space-y-1.5 leading-relaxed shadow-3xs">
            <h4 className="font-bold text-sm">💡 ขั้นตอนการนำไปติดตั้งใน Google Apps Script (GAS) ภายใน 1 นาที:</h4>
            <ol className="list-decimal list-inside space-y-1.5 font-semibold text-earth-dark leading-relaxed">
              <li>สร้างโปรเจกต์ใหม่ใน <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-earth-primary hover:text-earth-dark">Google Apps Script Console</a></li>
              <li>สร้างไฟล์รูปแบบ HTML ชื่อ <span className="bg-white px-2 py-0.5 rounded font-mono border text-[11px]">Index.html</span> (ลบโค้ดเริ่มต้นที่มากับตัวไฟล์ออกทั้งหมด)</li>
              <li>กดปุ่ม <span className="bg-[#8BA888] text-white px-1.5 py-0.5 rounded text-[11px] font-bold">"คัดลอกโค้ดสำเร็จรูป"</span> ด้านล่าง แล้วนำไปวาง (Paste) ลงในไฟล์ <span className="font-mono font-bold">Index.html</span></li>
              <li>สร้างไฟล์สคริปต์ชื่อ <span className="bg-white px-2 py-0.5 rounded font-mono border text-[11px]">Code.gs</span> แล้วใส่โค้ดฝั่งเซิร์ฟเวอร์สั้นๆ ดังนี้:
                <pre className="bg-[#433E3B] text-earth-sand text-[10px] p-2.5 rounded-lg mt-1 font-mono tracking-wide leading-relaxed overflow-x-auto selection:bg-earth-primary">
{`function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle("ระบบเช็คอินนอกสถานที่ | Kidz & Kitz")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) // ป้องกัน iFrame บล็อก
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}`}
                </pre>
              </li>
              <li>กดเซฟโปรเจกต์ และทำการเลือก "การแสดงผลล่าสุด (Deploy)" เป็น "เว็บแอปพลิเคชัน (Web App)" ใช้งานสิทธิ์เข้าถึงตามต้องการ พร้อมเปิดใช้งานได้ทันทีสำเร็จเสร็จสิ้น!</li>
            </ol>
          </div>

          {/* CODE HIGHLIGHT VIEWER BOX */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-earth-dark">
              <span>📦 BUNDLED EMBEDDED SOURCE CODE:</span>
              <span className="text-[10.5px] font-serif italic text-earth-text/80">ขนาดโค้ด: ~24 KB (ย่อและรวม React CDN พิกัด GPS ครบถ้วน)</span>
            </div>
            <div className="relative rounded-2xl border border-earth-border overflow-hidden bg-earth-dark shadow-xs max-h-[340px] flex">
              <textarea
                readOnly
                value={gasHtmlCode}
                className="w-full h-[320px] bg-[#221F1E] text-[#E6D5B8] p-4 font-mono text-[10.5px] leading-relaxed select-all resize-none outline-none border-0"
              />
            </div>
          </div>
        </div>

        {/* FOOTER DESK ACTIONS */}
        <div className="bg-white px-6 py-4 border-t border-earth-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10.5px] text-earth-text/80">ระบบคอมไพล์เดอร์พอร์เตอร์จะช่วยแก้ไขปัญหา CORS, imports/exports และลดภาระเซิร์ฟเวอร์โดยสมบูรณ์</p>
          
          <button
            onClick={handleCopy}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition duration-200 active:scale-95 ${
              copied 
                ? 'bg-[#E2EBE0] text-[#2E5E2A] border border-[#8BA888]' 
                : 'bg-earth-primary hover:bg-[#799976] text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>คัดลอกสำเร็จแล้ว! (Copied)</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>📋 คัดลอกโค้ดสำเร็จรูป (Copy GAS Code)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
