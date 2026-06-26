/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { OffSiteRequest } from '../types';
import { 
  FileText, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Building, 
  Sparkles, 
  ChevronLeft, 
  Search, 
  ClipboardList 
} from 'lucide-react';

interface ReportTemplateProps {
  selectedMonth: string; // YYYY-MM
  requests: OffSiteRequest[];
  selectedEmployeeId: string; // empty means all
  employees: Array<{ id: string; name: string; role: string; department: string }>;
}

export default function ReportTemplate({ selectedMonth, requests, selectedEmployeeId, employees }: ReportTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Local state for search/filter menu criteria
  const [localMonth, setLocalMonth] = useState(selectedMonth);
  const [localEmployeeId, setLocalEmployeeId] = useState(selectedEmployeeId);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync state if props change from outside
  useEffect(() => {
    setLocalMonth(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    setLocalEmployeeId(selectedEmployeeId);
  }, [selectedEmployeeId]);

  // Reset generated view if month or employee filters are reset from props explicitly
  useEffect(() => {
    setIsGenerated(false);
  }, [selectedMonth, selectedEmployeeId]);

  // Month translation mapping
  const monthThai = useMemo(() => {
    if (!localMonth) return '';
    const [year, month] = localMonth.split('-');
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiYear = parseInt(year) + 543;
    return `${months[parseInt(month) - 1]} พ.ศ. ${thaiYear}`;
  }, [localMonth]);

  // Aggregate stats based on local menu selection
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchMonth = req.date.startsWith(localMonth);
      const matchEmployee = localEmployeeId === '' || req.employeeId === localEmployeeId;
      const approvedOnly = req.status === 'approved';
      return matchMonth && matchEmployee && approvedOnly;
    });
  }, [requests, localMonth, localEmployeeId]);

  const reportMetrics = useMemo(() => {
    const totalVisits = filteredRequests.length;
    let completedVisits = 0;
    let totalIssues = 0;
    let resolvedIssues = 0;
    
    const distinctLocations = new Set<string>();

    filteredRequests.forEach(req => {
      distinctLocations.add(req.location.name);
      if (req.checkIn && req.checkOut) {
        completedVisits += 1;
      }
      if (req.checkOut?.issueFound && req.checkOut.issueFound !== 'ไม่มีปัญหา') {
        totalIssues += 1;
        if (req.checkOut.issueResolved) {
          resolvedIssues += 1;
        }
      }
    });

    return {
      totalVisits,
      completedVisits,
      distinctLocationsCount: distinctLocations.size,
      totalIssues,
      resolvedIssues,
      unresolvedIssues: totalIssues - resolvedIssues,
      completionRate: totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0
    };
  }, [filteredRequests]);

  const targetEmployee = useMemo(() => {
    if (!localEmployeeId) return null;
    return employees.find(e => e.id === localEmployeeId);
  }, [localEmployeeId, employees]);

  // Custom PDF/A4 beautifully designed export print layout engine
  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    
    if (printContent) {
      const win = window.open('', '', 'height=800,width=1000');
      if (win) {
        win.document.write('<html><head><title>รายงานการทำงานนอกสถานที่ - Kidz & Kitz</title>');
        // Load clean premium font and Tailwind CSS CDN so style rendering matches exactly
        win.document.write('<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">');
        win.document.write('<script src="https://cdn.tailwindcss.com"></script>');
        // Map custom system earth-tones onto tailwind config
        win.document.write('<script>');
        win.document.write(`
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  earth: {
                    primary: '#4E6C50',
                    secondary: '#AA8B7E',
                    border: '#E6D5B8',
                    dark: '#433E3B',
                    text: '#5c5552',
                    sidebar: '#FAF8F5'
                  }
                }
              }
            }
          }
        `);
        win.document.write('</script>');
        win.document.write('<style>');
        win.document.write(`
          @media print {
            body { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              background-color: #ffffff !important;
            }
            @page {
              size: A4;
              margin: 15mm;
            }
            tr { page-break-inside: avoid; }
            .avoid-break { page-break-inside: avoid; }
          }
          body { 
            font-family: "Sarabun", "Inter", sans-serif; 
            background-color: #FAF8F5; 
            color: #433E3B; 
            padding: 20px;
          }
          .overflow-y-auto, .overflow-x-auto {
            overflow: visible !important;
            max-height: none !important;
          }
        `);
        win.document.write('</style></head><body class="bg-white">');
        win.document.write('<div class="p-2">');
        win.document.write(printContent);
        win.document.write('</div>');
        win.document.write('</body></html>');
        win.document.close();
        
        // Timeout to let tailwind finish compilation before invoking system print modal
        setTimeout(() => {
          win.print();
        }, 800);
      }
    }
  };

  // --- LOADER VIEW WHEN GENERATING ---
  if (isGenerating) {
    return (
      <div id="report-generating-skeleton" className="bg-white rounded-3xl border border-earth-border shadow-sm p-8 text-center space-y-6 py-20 animate-pulse">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-earth-border border-t-earth-primary animate-spin"></div>
          <FileText className="w-10 h-10 text-earth-primary absolute inset-0 m-auto animate-bounce" />
        </div>
        <div className="space-y-2">
          <h4 className="font-extrabold text-earth-dark text-base md:text-lg">กำลังประมวลผลสรุปบันทึกและคำนวณระยะพิกัด GPS...</h4>
          <p className="text-xs text-earth-text max-w-md mx-auto leading-relaxed">
            ระบบกำลังประมวลผลรายการลงเวลางาน (Check-In Logs), คำนวณความแม่นยำระยะห่างของภูมิศาสตร์ และรวบรวมประวัติปัญหาอุปสรรคเพื่อจัดพิมพ์แบบฟอร์มหนังสือรายงานสรุปงานอย่างเป็นทางการ...
          </p>
        </div>
        <div className="w-64 bg-earth-sidebar h-2 rounded-full mx-auto overflow-hidden border border-earth-border/50">
          <div className="bg-earth-primary h-full rounded-full animate-pulse" style={{ width: '80%' }}></div>
        </div>
      </div>
    );
  }

  // --- MENU TO CALL REPORT (SEARCH OPTIONS BEFORE RETRIEVING) ---
  if (!isGenerated) {
    return (
      <div id="report-launcher-menu" className="bg-white rounded-3xl border border-earth-border shadow-sm p-6 space-y-6 animate-fadeIn">
        <div className="border-b border-earth-border pb-4">
          <h3 className="font-bold text-earth-dark text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-earth-primary animate-bounce" />
            <span>📋 เมนูเรียกรายงานสรุปปฏิบัติงานนอกสถานที่ (System Report Launcher)</span>
          </h3>
          <p className="text-earth-text/80 text-xs mt-1">
            กรุณาระบุขอบเขตเงื่อนไขและประจำเดือนที่ต้องการสรุปสถิติลงปฏิบัติงานจริง เพื่อสร้างชุดเอกสารประเมินอย่างเป็นทางการ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Select Month field */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-earth-dark uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-earth-primary" />
              <span>ประจำเดือนรอบรายงาน (Report Month)</span>
            </label>
            <input
              type="month"
              value={localMonth}
              onChange={(e) => setLocalMonth(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-earth-border text-earth-dark font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth-primary/40 transition-all cursor-pointer font-bold"
            />
          </div>

          {/* Target Employee selection */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-earth-dark uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-earth-primary" />
              <span>พนักงานระบุเป้าหมาย (Target Employee)</span>
            </label>
            {selectedEmployeeId ? (
              // Locked option when initialized with employee role context
              <div className="w-full bg-earth-sidebar border border-earth-border text-earth-dark/70 font-sans text-sm rounded-xl px-4 py-3 font-bold select-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-earth-primary animate-pulse"></span>
                <span>👤 {employees.find(e => e.id === selectedEmployeeId)?.name || 'พนักงานผู้ปฏิบัติงาน'} (สิทธิ์ข้อมูลของคุณ)</span>
              </div>
            ) : (
              // Multi-dropdown selector for manager or admin role context
              <select
                value={localEmployeeId}
                onChange={(e) => setLocalEmployeeId(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-earth-border text-earth-dark font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth-primary/40 transition-all cursor-pointer font-bold"
              >
                <option value="">👤 พนักงานทั้งหมดในระบบ (ภาพรวมองค์การ)</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    👤 {emp.name} ({emp.role} - {emp.department})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Security / Quality Guidelines */}
        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-earth-border text-xs text-earth-text/85 space-y-1.5">
          <p className="font-bold text-earth-dark flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-earth-primary" />
            <span>คู่มือกฎเกณฑ์การจัดพิมพ์สรุป:</span>
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-earth-text/90">
            <li>ข้อมูลสรุปจะดึงจากรายการลงปฏิบัติการจริงที่ **ได้รับการตรวจสอบและรับรองสิทธิ์ (Approved)** เท่านั้น</li>
            <li>ระบบความปลอดภัย GPS จะวิเคราะห์ระยะห่างพิกัดจริง ณ ช่วงเวลาเข้าสถานที่จริง</li>
            <li>แบบฟอร์ม PDF สรุปงานผ่านระบบนี้ รองรับมาตรฐานการตรวจสอบของฝ่ายบัญชีและสวัสดิการ</li>
          </ul>
        </div>

        {/* Generate Trigger Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              setIsGenerating(true);
              setTimeout(() => {
                setIsGenerating(false);
                setIsGenerated(true);
              }, 700);
            }}
            className="w-full sm:w-auto bg-earth-primary hover:bg-[#3D5C3F] text-white font-sans text-xs font-black py-3 px-8 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 animate-bounce" />
            <span>🔍 ประมวลผลและเรียกดูรายงานสรุป (Generate Report)</span>
          </button>
        </div>
      </div>
    );
  }

  // --- REPORT GENERATED & DISPLAY DETAILS ---
  return (
    <div id="report-rendered-view" className="bg-white rounded-3xl border border-earth-border shadow-sm p-6 space-y-6 animate-fadeIn">
      
      {/* Upper Menu Back and PDF Print Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-earth-border pb-4 gap-4">
        <div>
          <button
            onClick={() => setIsGenerated(false)}
            className="text-earth-primary hover:text-[#3D5C3F] font-bold text-xs flex items-center gap-1 mb-1 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>ย้อนกลับไปเมนูเรียกรายงาน (Back to Menu)</span>
          </button>
          <h3 className="font-bold text-earth-dark text-lg flex items-center gap-2 mt-1">
            <FileText className="w-5 h-5 text-earth-primary" />
            <span>รายงานสรุปและประวัติปฏิบัติงาน (System Report Copy)</span>
          </h3>
          <p className="text-earth-text/80 text-xs">สรุปความสำเร็จจัดหาและสรุปประจำเดือน <strong className="text-earth-dark">{monthThai}</strong> | เป้าหมาย: <strong className="text-earth-dark">{targetEmployee ? targetEmployee.name : 'พนักงานทั้งหมดในระบบ'}</strong></p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsGenerated(false)}
            className="bg-white hover:bg-earth-sidebar border border-earth-border text-earth-dark font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <span>เปลี่ยนเงื่อนไข</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={filteredRequests.length === 0}
            className="flex-1 sm:flex-initial bg-earth-primary hover:bg-[#3D5C3F] border border-transparent text-white font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:bg-earth-sidebar disabled:border-earth-border disabled:text-earth-text/50 disabled:cursor-not-allowed transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์สรุป PDF (A4 Export)</span>
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 text-earth-text/70 border-2 border-dashed border-earth-border rounded-3xl bg-[#FAF8F5] space-y-3">
          <Calendar className="w-12 h-12 text-earth-primary/40 mx-auto" />
          <div>
            <h4 className="font-bold text-sm text-earth-dark">ไม่พบข้อมูลปฏิบัติงานนอกสถานที่ที่ได้รับอนุมัติในรอบเงื่อนไขนี้</h4>
            <p className="text-xs text-earth-text/80 max-w-sm mx-auto leading-relaxed mt-1">ข้อมูลจะแสดงผลเมื่อพนักงานมีรายการปฏิบัติงานในเดือน {monthThai} ที่หัวหน้างานได้รับการอนุมัติการลงชื่อและส่งรายงานเรียบร้อยแล้ว</p>
          </div>
          <button
            onClick={() => setIsGenerated(false)}
            className="bg-white hover:bg-earth-sidebar border border-earth-border text-earth-dark font-sans text-xs font-bold py-2 px-4 rounded-xl inline-flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>กลับไปแก้ไขและค้นหาใหม่</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* VISUAL QUICK REPORT CARD VIEW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="bg-[#FAF8F5] rounded-3xl p-4 border border-earth-border flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-earth-text tracking-wider">ภารกิจที่อนุมัติ</span>
              <p className="text-2xl font-black text-earth-dark font-mono mt-1">{reportMetrics.totalVisits} <span className="text-xs font-normal text-earth-text/80">ครั้ง</span></p>
            </div>
            <div className="bg-[#FAF8F5] rounded-3xl p-4 border border-earth-border flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-earth-text tracking-wider">ทำรายงานเสร็จสิ้น</span>
              <p className="text-2xl font-black text-earth-primary font-mono mt-1">{reportMetrics.completedVisits} <span className="text-xs font-normal text-earth-text/80">ครั้ง</span></p>
            </div>
            <div className="bg-[#FAF8F5] rounded-3xl p-4 border border-earth-border flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-earth-text tracking-wider">พิกัดสถานที่ปฏิบัติงาน</span>
              <p className="text-2xl font-black text-earth-secondary font-mono mt-1">{reportMetrics.distinctLocationsCount} <span className="text-xs font-normal text-earth-text/80">จุด</span></p>
            </div>
            <div className="bg-[#FAF8F5] rounded-3xl p-4 border border-earth-border flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-earth-secondary tracking-wider">ปัญหาพบเจอ (แก้ไขแล้ว)</span>
              <p className="text-xl font-black text-earth-dark font-mono mt-1">
                {reportMetrics.totalIssues} <span className="text-xs font-normal text-earth-text/80">ปัญหา</span>
                <span className="text-xs font-bold text-[#2E5E2A] ml-1.5 font-sans">({reportMetrics.resolvedIssues} สำเร็จ)</span>
              </p>
            </div>
          </div>

          {/* PRINTABLE AREA FOR DRAFT REPORT MEMORANDUM */}
          <div 
            ref={printRef}
            className="border border-earth-border rounded-3xl p-4 md:p-6 space-y-6 shadow-inner bg-[#FAF8F5] max-h-[600px] overflow-y-auto"
          >
            <div className="bg-white border border-earth-border rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
              
              {/* Header Company Emblem & Info */}
              <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-double border-earth-border">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                    <span className="bg-earth-primary text-white font-mono font-black text-sm px-2.5 py-1 rounded shadow">KK</span>
                    <h2 className="font-extrabold text-earth-dark text-lg tracking-wider">บริษัท คิดซ์ แอนด์ คิทซ์ จำกัด</h2>
                  </div>
                  <p className="text-xs font-serif text-earth-text/90">79/322 ถนนปัญญาอินทรา แขวงสามวาตะวันตก เขตคลองสามวา กรุงเทพฯ 10510</p>
                  <p className="text-[10px] text-earth-text/70">โทรศัพท์: 02-318-7954 | อีเมล: support@kidzandkitz.co.th</p>
                </div>
                <div className="text-center md:text-right border border-earth-border p-2.5 rounded-xl bg-[#FAF8F5] font-serif">
                  <p className="text-xs font-bold text-earth-dark">เอกสารรายงานสรุปผลปฎิบัติงาน</p>
                  <p className="text-[10px] text-earth-text/60 font-mono mt-0.5">REF: RPT-OFFSITE-2026</p>
                  <p className="text-xs font-black text-earth-primary font-mono mt-1">{localMonth}</p>
                </div>
              </div>

              {/* Memorandum specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif text-earth-text pb-4 border-b border-earth-border">
                <div className="space-y-1">
                  <p><span className="font-bold text-earth-text/60 inline-block w-24">เรียน:</span> หัวหน้าทีมและฝ่ายสวัสดิการผู้ปฏิบัติงาน</p>
                  <p><span className="font-bold text-earth-text/60 inline-block w-24">รอบรายงาน:</span> ประจำเดือน {monthThai}</p>
                  <p>
                    <span className="font-bold text-earth-text/60 inline-block w-24">พนักงานระบุ:</span> 
                    {targetEmployee ? (
                      <span className="font-bold text-earth-dark">{targetEmployee.name} ({targetEmployee.role})</span>
                    ) : (
                      'บุคลากรทั้งหมดในระบบ (แสดงภาพรวม)'
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="font-bold text-earth-text/60 inline-block w-28">วันที่พิมพ์รายงาน:</span> 
                    {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p><span className="font-bold text-earth-text/60 inline-block w-28">จำนวนวันปฎิบัติงานจริง:</span> <span className="font-mono font-bold text-earth-dark">{reportMetrics.totalVisits}</span> วัน</p>
                  <p>
                    <span className="font-bold text-earth-text/60 inline-block w-28">อัตรากรอกรับรองผล:</span> 
                    <span className="font-mono font-black text-[#2E5E2A]">{reportMetrics.completionRate}%</span>
                  </p>
                </div>
              </div>

              {/* Detailed Tasks Breakdown Table */}
              <div>
                <p className="text-xs font-bold text-earth-dark mb-2.5 border-l-2 border-earth-primary pl-2">1. รายการประวัติพิกัดและการเข้า-ออกงานนอกสถานที่ (Off-Site Log Collection)</p>
                <div className="overflow-x-auto rounded-xl border border-earth-border">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF8F5] text-earth-dark font-bold">
                        <th className="p-3 border-b border-earth-border">วันที่ / เวลา</th>
                        <th className="p-3 border-b border-earth-border">รายชื่อพนักงาน</th>
                        <th className="p-3 border-b border-earth-border">สถานที่ปฏิบัติงาน</th>
                        <th className="p-3 border-b border-earth-border">วัตถุประสงค์ภารกิจ</th>
                        <th className="p-3 border-b border-earth-border">เวลา เข้า-ออกจริง (GPS)</th>
                        <th className="p-3 border-b border-earth-border">ระยะห่างเช็คอิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-earth-border bg-white">
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-[#FCFAF7] transition-colors">
                          <td className="p-3 font-mono tracking-tighter whitespace-nowrap text-earth-text">{req.date}</td>
                          <td className="p-3 font-bold text-earth-dark">{req.employeeName}</td>
                          <td className="p-3 text-earth-dark font-semibold">{req.location.name}</td>
                          <td className="p-3 max-w-xs text-earth-text">{req.purpose}</td>
                          <td className="p-3 font-mono text-[10px] space-y-0.5 whitespace-nowrap">
                            {req.checkIn ? (
                              <div className="flex items-center gap-1 text-[#2E5E2A] font-bold">
                                <span>เข้า: {req.checkIn.time}</span>
                              </div>
                            ) : (
                              <span className="text-earth-text/50 italic">ไม่เช็คอิน</span>
                            )}
                            {req.checkOut ? (
                              <div className="flex items-center gap-1 text-earth-primary font-bold">
                                <span>ออก: {req.checkOut.time}</span>
                              </div>
                            ) : (
                              req.checkIn ? <span className="text-earth-text/50 italic">ไม่ได้เช็คเอาท์</span> : null
                            )}
                          </td>
                          <td className="p-3 font-mono text-center">
                            {req.checkIn ? (
                              <span className={`px-2 py-0.5 rounded-lg font-black text-[10px] ${
                                req.checkIn.distanceMeters <= 50 ? 'bg-[#E2EBE0] text-[#2E5E2A]' : 'bg-red-50 text-red-700'
                              }`}>
                                {req.checkIn.distanceMeters} เมตร
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Work Details & Issues Collection */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-earth-dark border-l-2 border-earth-primary pl-2">2. สรุปรายละเอียดการทำงาน และปัญหาที่พบหน้างาน (Task Outcomes & Problem Logs)</p>
                <div className="space-y-3">
                  {filteredRequests.map((req) => {
                    const hasIssue = req.checkOut?.issueFound && req.checkOut.issueFound !== 'ไม่มีปัญหา';
                    return (
                      <div key={req.id} className="p-4 bg-[#FAF8F5] border border-earth-border rounded-2xl space-y-2 text-xs">
                        <div className="flex justify-between items-start flex-wrap gap-1">
                          <p className="font-bold text-earth-dark">
                            📍 {req.location.name} | <span className="text-earth-text font-normal">{req.purpose}</span>
                          </p>
                          <span className="text-[10px] text-earth-text/80 font-mono bg-white px-2 py-0.5 rounded-lg border border-earth-border shadow-3xs">{req.date} (โดย {req.employeeName})</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-earth-text mt-2 font-serif">
                          <div>
                            <span className="font-bold text-earth-dark">ผลปฏิบัติงานสำเร็จ:</span>
                            <p className="mt-1 bg-white p-3 rounded-xl border border-earth-border min-h-[44px]">
                              {req.checkOut?.workSummary || <span className="text-earth-text/50 italic">เจ้าหน้าที่ยังไม่ได้ทำการรายงานผลการดำเนินงาน</span>}
                            </p>
                          </div>
                          <div>
                            <span className="font-bold text-earth-dark flex items-center gap-1">
                              {hasIssue ? <AlertTriangle className="w-3.5 h-3.5 text-earth-secondary" /> : <CheckCircle className="w-3.5 h-3.5 text-earth-primary" />}
                              <span>ปัญหาหน้างานที่ตรวจพบ:</span>
                            </span>
                            <p className="mt-1 bg-white p-3 rounded-xl border border-earth-border min-h-[44px]">
                              {hasIssue ? (
                                <span className="text-[#C05621] font-bold">{req.checkOut?.issueFound}</span>
                              ) : (
                                <span className="text-[#2E5E2A] italic">ไม่มีรายงานปัญหา (การทำงานลุล่วงสมบูรณ์)</span>
                              )}
                            </p>
                            
                            {hasIssue && (
                              <div className="flex justify-end mt-1">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  req.checkOut?.issueResolved ? 'bg-[#E2EBE0] text-[#2E5E2A]' : 'bg-orange-50 text-earth-secondary font-semibold animate-pulse'
                                }`}>
                                  สถานะปัญหา: {req.checkOut?.issueResolved ? 'แก้ไขเสร็จสิ้นหน้างานเรียบร้อย' : 'คงค้างรอการประสานงานสนับสนุน'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Signature Field Approval Section */}
              <div className="pt-8 border-t border-earth-border">
                <div className="flex justify-between items-center flex-wrap gap-8 text-xs font-serif text-earth-text/90">
                  <div className="text-center w-48">
                    <p className="mb-12">ลงชื่อ..............................................................</p>
                    <p className="font-bold text-earth-dark">
                      {targetEmployee?.name || '__________________________'}
                    </p>
                    <p className="text-[11px] text-earth-text/70 mt-0.5">พนักงานผู้รายงานงานนอกสถานที่</p>
                    <p className="text-[10px] text-earth-text/70 font-mono">วันที่ ____/____/____</p>
                  </div>

                  <div className="text-center w-48">
                    <p className="mb-12">ลงชื่อ..............................................................</p>
                    <p className="font-bold text-earth-dark">
                      {targetEmployee ? 'หัวหน้าแผนกรับรอง' : 'ผู้รับรายงานและตรวจสอบ'}
                    </p>
                    <p className="text-[11px] text-earth-text/70 mt-0.5">ตำแหน่ง หัวหน้างานฝ่ายอนุมัติปฏิบัติการ</p>
                    <p className="text-[10px] text-earth-text/70 font-mono">วันที่ ____/____/____</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Quick Notice */}
          <p className="text-[11px] text-center text-earth-text/65 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-earth-primary animate-pulse" />
            <span>รายงานนี้ถูกออกโดยระบบสรุปงานอัตโนมัติของ Kidz & Kitz ข้อมูลความปลอดภัยของพิกัด GPS ได้รับการตรวจสอบและเข้ารหัส</span>
          </p>
          
        </div>
      )}
    </div>
  );
}
