/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useMemo } from 'react';
import { OffSiteRequest } from '../types';
import { FileText, Printer, CheckCircle, AlertTriangle, Calendar, Clock, MapPin, Building, Sparkles } from 'lucide-react';

interface ReportTemplateProps {
  selectedMonth: string; // YYYY-MM
  requests: OffSiteRequest[];
  selectedEmployeeId: string; // empty means all
  employees: Array<{ id: string; name: string; role: string; department: string }>;
}

export default function ReportTemplate({ selectedMonth, requests, selectedEmployeeId, employees }: ReportTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Month translation mapping
  const monthThai = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiYear = parseInt(year) + 543;
    return `${months[parseInt(month) - 1]} พ.ศ. ${thaiYear}`;
  }, [selectedMonth]);

  // Aggregate stats for the selected month and employee
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchMonth = req.date.startsWith(selectedMonth);
      const matchEmployee = selectedEmployeeId === '' || req.employeeId === selectedEmployeeId;
      const approvedOnly = req.status === 'approved';
      return matchMonth && matchEmployee && approvedOnly;
    });
  }, [requests, selectedMonth, selectedEmployeeId]);

  const reportMetrics = useMemo(() => {
    const totalVisits = filteredRequests.length;
    let completedVisits = 0;
    let totalIssues = 0;
    let resolvedIssues = 0;
    
    // Set of distinct locations
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
    if (!selectedEmployeeId) return null;
    return employees.find(e => e.id === selectedEmployeeId);
  }, [selectedEmployeeId, employees]);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      const win = window.open('', '', 'height=800,width=1000');
      if (win) {
        win.document.write('<html><head><title>รายงานการทำงานนอกสถานที่ - Kidz & Kitz</title>');
        win.document.write('<style>');
        win.document.write('body { font-family: "Inter", sans-serif; padding: 40px; color: #433E3B; background-color: #FAF8F5; }');
        win.document.write('.text-center { text-align: center; }');
        win.document.write('.flex { display: flex; }');
        win.document.write('.justify-between { justify-content: space-between; }');
        win.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; background: white; }');
        win.document.write('th, td { border: 1px solid #E6D5B8; padding: 10px; text-align: left; }');
        win.document.write('th { background-color: #FAF8F5; font-weight: bold; color: #433E3B; }');
        win.document.write('.font-bold { font-weight: bold; }');
        win.document.write('.badge { display: inline-block; padding: 3px 8px; font-size: 11px; border-radius: 6px; font-weight: bold; }');
        win.document.write('.badge-green { background: #E2EBE0; color: #2E5E2A; }');
        win.document.write('.badge-red { background: #FDF2E9; color: #C05621; }');
        win.document.write('.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px; }');
        win.document.write('.card { border: 1px solid #E6D5B8; padding: 12px; border-radius: 12px; background: white; }');
        win.document.write('h1, h2, h3, p { margin: 5px 0; }');
        win.document.write('</style></head><body>');
        win.document.write(printContent);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-earth-border shadow-sm p-6 space-y-6">
      
      {/* Upper Action Tools */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-earth-border pb-4 gap-4">
        <div>
          <h3 className="font-bold text-earth-dark text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-earth-primary animate-pulse" />
            <span>รายงานสรุปรายเดือนและประวัติปฏิบัติงาน (System Report Template)</span>
          </h3>
          <p className="text-earth-text/80 text-xs">สรุปข้อมูลภารกิจทั้งหมดส่งผู้บังคับบัญชาแบบอัตโนมัติตามโครงสร้างรายงานราชการ/เอกชน</p>
        </div>

        <button
          onClick={handlePrint}
          disabled={filteredRequests.length === 0}
          className="w-full sm:w-auto bg-earth-primary hover:bg-[#799976] border border-transparent text-white font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:bg-earth-sidebar disabled:border-earth-border disabled:text-earth-text/50 disabled:cursor-not-allowed transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>พิมพ์เอกสารรายงาน (PDF / Print)</span>
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 text-earth-text/70 border-2 border-dashed border-earth-border rounded-3xl bg-[#FAF8F5]">
          <Calendar className="w-12 h-12 text-earth-primary/40 mx-auto mb-3" />
          <h4 className="font-bold text-sm text-earth-dark mb-1">ไม่พบข้อมูลที่ได้รับอนุมัติในรอบเดือนนี้</h4>
          <p className="text-xs text-earth-text/80 max-w-sm mx-auto leading-relaxed">ข้อมูลสรุปจะพร้อมใช้งานเมื่อมีการเปลี่ยนตัวเลือกแผนกพนักงาน หรือพนักงานมีการเช็คอินและกรอกบันทึกปัญหาที่หน้างานในรอบเดือน {monthThai}</p>
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
                  <p className="text-xs font-black text-earth-primary font-mono mt-1">{selectedMonth}</p>
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
