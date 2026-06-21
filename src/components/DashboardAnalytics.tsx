/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { OffSiteRequest, Employee } from '../types';
import { MOCK_EMPLOYEES } from '../data/mockData';
import { 
  User, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  MapPin, 
  Info,
  Award
} from 'lucide-react';

interface DashboardAnalyticsProps {
  requests: OffSiteRequest[];
  selectedMonth: string; // YYYY-MM
  employees?: Employee[];
}

export default function DashboardAnalytics({ requests, selectedMonth, employees = MOCK_EMPLOYEES }: DashboardAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'employee' | 'day'>('employee');
  const [selectedItemDetail, setSelectedItemDetail] = useState<string | null>(null);

  // Translate month for display
  const thaiMonthName = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiYear = parseInt(year) + 543;
    return `${months[parseInt(month) - 1]} ${thaiYear}`;
  }, [selectedMonth]);

  // 1. FILTER REQUESTS FOR THE CHOSEN MONTH
  const monthlyRequests = useMemo(() => {
    return requests.filter(req => req.date.startsWith(selectedMonth));
  }, [requests, selectedMonth]);

  // 2. COMPUTE SUMMARY BY EMPLOYEE
  const employeeSummaries = useMemo(() => {
    // We want to count stats for everyone, even if they have 0 requests in this month
    return employees.map(emp => {
      const empRequests = monthlyRequests.filter(r => r.employeeId === emp.id);
      const approved = empRequests.filter(r => r.status === 'approved');
      const pending = empRequests.filter(r => r.status === 'pending');
      const completed = approved.filter(r => r.checkIn && r.checkOut);
      const withIssues = approved.filter(r => r.checkOut?.issueFound && r.checkOut.issueFound !== 'ไม่มีปัญหา');
      const resolvedIssues = withIssues.filter(r => r.checkOut?.issueResolved);
      
      const completionRate = approved.length > 0 
        ? Math.round((completed.length / approved.length) * 100) 
        : 0;

      return {
        employee: emp,
        totalNum: empRequests.length,
        approvedNum: approved.length,
        pendingNum: pending.length,
        completedNum: completed.length,
        issueNum: withIssues.length,
        resolvedNum: resolvedIssues.length,
        unresolvedNum: withIssues.length - resolvedIssues.length,
        completionRate,
        requestsList: empRequests
      };
    });
  }, [monthlyRequests, employees]);

  // 3. COMPUTE SUMMARY BY DAY
  const dailySummaries = useMemo(() => {
    // Group monthlyRequests by date
    const groups: { [date: string]: OffSiteRequest[] } = {};
    monthlyRequests.forEach(req => {
      if (!groups[req.date]) {
        groups[req.date] = [];
      }
      groups[req.date].push(req);
    });

    // Sort the dates chronologically
    const sortedDates = Object.keys(groups).sort();

    return sortedDates.map(date => {
      const dayRequests = groups[date];
      const approved = dayRequests.filter(r => r.status === 'approved');
      const pending = dayRequests.filter(r => r.status === 'pending');
      const completed = approved.filter(r => r.checkIn && r.checkOut);
      const withIssues = approved.filter(r => r.checkOut?.issueFound && r.checkOut.issueFound !== 'ไม่มีปัญหา');
      
      const completionRate = approved.length > 0
        ? Math.round((completed.length / approved.length) * 100)
        : 0;

      // Formatting date label in Thai format
      let formattedThaiDate = date;
      try {
        const [, m, d] = date.split('-');
        const monthsShort = [
          'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
          'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        formattedThaiDate = `${parseInt(d)} ${monthsShort[parseInt(m) - 1]}`;
      } catch (e) {
        console.error(e);
      }

      return {
        date,
        formattedThaiDate,
        totalNum: dayRequests.length,
        approvedNum: approved.length,
        pendingNum: pending.length,
        completedNum: completed.length,
        issueNum: withIssues.length,
        completionRate,
        requestsList: dayRequests
      };
    });
  }, [monthlyRequests]);

  return (
    <div id="dashboard-analytics-section" className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-earth-border pb-4">
        <div>
          <h3 className="font-extrabold text-earth-dark text-base md:text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-earth-primary" />
            <span>ระบบสืบค้นสรุปสถิติรอบเดือน ({thaiMonthName})</span>
          </h3>
          <p className="text-xs text-earth-text/80">
            จำแนกสัดส่วนการปฏิบัติงานนอกสถานที่ การเข้าเช็คอินพิกัด และรายงานปัญหาจำแนกรายสถานะคนหรือวัน
          </p>
        </div>

        {/* TABS CONTROLLER */}
        <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-earth-border self-start">
          <button
            onClick={() => {
              setActiveTab('employee');
              setSelectedItemDetail(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'employee'
                ? 'bg-earth-primary text-white shadow-xs'
                : 'text-earth-text hover:bg-earth-border/20'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>สรุปจำแนกรายบุคคล</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('day');
              setSelectedItemDetail(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'day'
                ? 'bg-earth-primary text-white shadow-xs'
                : 'text-earth-text hover:bg-earth-border/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>สรุปจำแนกรายวัน</span>
          </button>
        </div>
      </div>

      {monthlyRequests.length === 0 ? (
        <div className="text-center py-12 text-earth-text/70 border border-dashed border-earth-border rounded-2xl bg-[#FAF8F5]">
          <Info className="w-10 h-10 text-earth-primary/50 mx-auto mb-2" />
          <p className="font-bold text-sm text-earth-dark">ไม่มีประวัติงานบันทึกในช่วงเดือนนี้</p>
          <p className="text-xs mt-0.5 max-w-xs mx-auto">กรุณาขยายกรองรอบเดือนด้านบน หรือปรับแต่งค่าพิกัดจำลองของพนักงานในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TAB 1: SUMMARY BY EMPLOYEE */}
          {activeTab === 'employee' && (
            <div className="lg:col-span-2 space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-earth-text uppercase tracking-wider block mb-1">
                รายชื่อบุคลากรและดัชนีชี้วัด ({employeeSummaries.length} คน)
              </span>

              {employeeSummaries.map((summary) => {
                const isSelected = selectedItemDetail === summary.employee.id;
                return (
                  <div 
                    key={summary.employee.id}
                    onClick={() => setSelectedItemDetail(isSelected ? null : summary.employee.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                      isSelected 
                        ? 'bg-[#E2EBE0]/30 border-earth-primary ring-1 ring-[#CBDBC8]' 
                        : 'bg-white border-earth-border hover:bg-[#FCFAF7]'
                    }`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold leading-none ${summary.employee.avatarColor || 'bg-earth-primary'}`}>
                          {summary.employee.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-earth-dark text-sm">{summary.employee.name}</h4>
                            <span className="text-[10px] font-mono bg-earth-sidebar border border-earth-border px-1.5 py-0.5 rounded text-earth-text">
                              {summary.employee.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-earth-text font-medium">{summary.employee.role}</p>
                        </div>
                      </div>

                      {/* Summary Badges */}
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-[10px] text-earth-text font-medium block">สำเร็จอัตรา</span>
                          <span className="text-sm font-black font-mono text-earth-dark">{summary.completionRate}%</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-earth-text transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Progress tracking horizontal indicator */}
                    <div className="w-full bg-earth-border/40 h-1.5 mt-3.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-earth-primary rounded-full transition-all" 
                        style={{ width: `${summary.completionRate}%` }} 
                      />
                    </div>

                    {/* Stats quick grid */}
                    <div className="grid grid-cols-4 gap-2 mt-3 text-center border-t border-earth-border/40 pt-2.5">
                      <div className="bg-[#FAF8F5] p-1.5 rounded-xl border border-earth-border/30">
                        <span className="block text-[8.5px] uppercase font-bold text-earth-text">ส่งคำขอ</span>
                        <span className="font-mono text-xs font-black text-earth-dark">{summary.totalNum} ครั้ง</span>
                      </div>
                      <div className="bg-[#E2EBE0]/40 p-1.5 rounded-xl border border-earth-primary/20">
                        <span className="block text-[8.5px] uppercase font-bold text-earth-primary">อนุมัติแล้ว</span>
                        <span className="font-mono text-xs font-black text-[#2E5E2A]">{summary.approvedNum}</span>
                      </div>
                      <div className="bg-[#FAF8F5] p-1.5 rounded-xl border border-earth-border/30">
                        <span className="block text-[8.5px] uppercase font-bold text-earth-text">เป้าเสร็จ</span>
                        <span className="font-mono text-xs font-black text-earth-dark">{summary.completedNum}</span>
                      </div>
                      <div className={`p-1.5 rounded-xl border border-earth-border/35 ${summary.issueNum > summary.resolvedNum ? 'bg-orange-50 text-earth-secondary' : 'bg-[#FAF8F5]'}`}>
                        <span className="block text-[8.5px] uppercase font-bold text-current opacity-80">ปัญหาหน้างาน</span>
                        <span className="font-mono text-xs font-black text-current">
                          {summary.issueNum} <span className="text-[9px] font-normal">({summary.resolvedNum} แก้)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: SUMMARY BY DAY */}
          {activeTab === 'day' && (
            <div className="lg:col-span-2 space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-earth-text uppercase tracking-wider block mb-1">
                บันทึกรายวันตามลำดับปฏิทิน ({dailySummaries.length} วันที่มีการลงงาน)
              </span>

              {dailySummaries.map((summary) => {
                const isSelected = selectedItemDetail === summary.date;
                return (
                  <div 
                    key={summary.date}
                    onClick={() => setSelectedItemDetail(isSelected ? null : summary.date)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                      isSelected 
                        ? 'bg-[#E2EBE0]/30 border-earth-primary ring-1 ring-[#CBDBC8]' 
                        : 'bg-white border-earth-border hover:bg-[#FCFAF7]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-earth-primary text-white px-3 py-1.5 rounded-xl text-center font-bold border border-earth-border/10 shadow-2xs">
                          <span className="block text-[11px] uppercase font-black font-mono leading-none">{summary.formattedThaiDate}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-earth-dark text-sm">วันที่ {summary.date}</h4>
                          <p className="text-[10.5px] text-earth-text flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-earth-text/70" />
                            <span>มีกิจกรรมนอกสถานที่ทั้งสิ้น {summary.totalNum} เคส</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-earth-text font-medium block">อัตราสรุปงาน</span>
                          <span className="text-sm font-black font-mono text-[#2E5E2A]">{summary.completionRate}%</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-earth-text transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Stats summary row */}
                    <div className="flex gap-4 mt-3 pt-2 px-1 border-t border-earth-border/40 text-xs font-medium text-earth-text justify-between">
                      <div className="flex gap-3">
                        <span>อนุมัติลงงาน: <strong className="text-earth-dark font-mono font-bold">{summary.approvedNum}</strong></span>
                        <span>สำเร็จเช็คเอาท์: <strong className="text-earth-primary font-mono font-bold">{summary.completedNum}</strong></span>
                        {summary.pendingNum > 0 && (
                          <span className="text-earth-secondary">รออนุมัติ: <strong className="font-mono font-black">{summary.pendingNum}</strong></span>
                        )}
                      </div>
                      
                      {summary.issueNum > 0 && (
                        <span className="text-earth-secondary font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>พบปัญหา {summary.issueNum} งาน</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DETAIL PANEL & WORK HISTORY DRILL-DOWN (RIGHT SIDEBAR) */}
          <div className="lg:col-span-1">
            <div className="bg-[#FAF8F5] border border-earth-border p-4 rounded-3xl space-y-4 h-full flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-earth-border pb-3">
                  <Award className="w-4 h-4 text-earth-primary" />
                  <h4 className="font-extrabold text-earth-dark text-xs uppercase tracking-wider">
                    รายละเอียดคำเจาะลึกส่วนปฏิบัติงาน
                  </h4>
                </div>

                {!selectedItemDetail ? (
                  <div className="text-center py-16 text-earth-text/60 italic space-y-2">
                    <Info className="w-8 h-8 text-earth-border mx-auto mb-1" />
                    <p className="text-xs font-semibold leading-relaxed">
                      โปรดเลือก {activeTab === 'employee' ? 'แถวข้อมูลบุคคล' : 'แถวปฏิทินรายวัน'} ที่ด้านซ้ายเพื่อสืบประวัติตรงจุดตรวจพิกัด
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {/* Drill-down list cards representation */}
                    {activeTab === 'employee' ? (
                      <div>
                        {employeeSummaries.find(e => e.employee.id === selectedItemDetail)?.requestsList.length === 0 ? (
                          <p className="text-xs text-earth-text/60 italic text-center py-4">ไม่พบรายงานกิจกรรมใดๆ ในเดือนนี้</p>
                        ) : (
                          employeeSummaries.find(e => e.employee.id === selectedItemDetail)?.requestsList.map(req => (
                            <div key={req.id} className="bg-white p-3 rounded-2xl border border-earth-border space-y-2 text-xs">
                              <div className="flex justify-between items-start">
                                <span className="font-mono text-[9px] text-earth-text/60 block">{req.id}</span>
                                <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                                  req.status === 'approved' 
                                    ? 'bg-[#E2EBE0] text-[#2E5E2A]' 
                                    : req.status === 'rejected' 
                                    ? 'bg-[#FCF5F2] text-earth-secondary' 
                                    : 'bg-[#E6D5B8] text-earth-dark'
                                }`}>
                                  {req.status === 'approved' ? 'อนุมัติ' : req.status === 'rejected' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                                </span>
                              </div>
                              <p className="font-bold text-earth-dark leading-tight">📍 {req.location.name}</p>
                              <p className="text-[11px] text-earth-text/90 italic">"{req.purpose}"</p>
                              <p className="text-[10px] font-mono text-earth-text">วันที่: {req.date}</p>

                              {req.checkIn && (
                                <div className="border-t border-earth-border/40 pt-1.5 mt-1.5 space-y-1">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-[#2E5E2A] font-bold">⏱️ เช็คอิน: {req.checkIn.time} น.</span>
                                    <span className="font-mono text-earth-text">{req.checkIn.distanceMeters} เมตร</span>
                                  </div>
                                  {req.checkOut && (
                                    <div className="text-[10px] text-earth-text/80 space-y-1">
                                      <p className="text-earth-primary font-bold">✅ เช็คเอาท์: {req.checkOut.time} น.</p>
                                      {req.checkOut.workImage && (
                                        <div className="rounded border border-earth-border overflow-hidden max-w-[120px] my-1 shadow-2xs">
                                          <img 
                                            src={req.checkOut.workImage} 
                                            alt="Evidence" 
                                            className="w-full h-12 object-cover cursor-zoom-in hover:opacity-90 max-h-12"
                                            onClick={() => window.open(req.checkOut?.workImage, '_blank')}
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      )}
                                      <p className="text-[9.5px] italic text-earth-text/90 font-serif leading-tight">รายงาน: "{req.checkOut.workSummary}"</p>
                                      {req.checkOut.issueFound && req.checkOut.issueFound !== 'ไม่มีปัญหา' && (
                                        <p className="text-earth-secondary leading-tight">⚠️ ปัญหา: "{req.checkOut.issueFound}"</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div>
                        {dailySummaries.find(d => d.date === selectedItemDetail)?.requestsList.length === 0 ? (
                          <p className="text-xs text-earth-text/60 italic text-center py-4">ไม่มีคำขอสำหรับวันที่นี้</p>
                        ) : (
                          dailySummaries.find(d => d.date === selectedItemDetail)?.requestsList.map(req => (
                            <div key={req.id} className="bg-white p-3 rounded-2xl border border-earth-border space-y-2 text-xs">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-earth-dark text-[11px]">{req.employeeName}</span>
                                <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                                  req.status === 'approved' 
                                    ? 'bg-[#E2EBE0] text-[#2E5E2A]' 
                                    : 'bg-[#FCF5F2] text-earth-secondary'
                                }`}>
                                  {req.status === 'approved' ? 'อนุมัติ' : req.status === 'rejected' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
                                </span>
                              </div>
                              <p className="font-bold text-earth-dark/90 text-[11px]">📍 {req.location.name}</p>
                              <p className="text-[10px] text-earth-text/85">วัตถุประสงค์: "{req.purpose}"</p>
                              
                              {req.checkIn && (
                                <div className="border-t border-earth-border/40 pt-1.5 mt-1.5 text-[10px] space-y-1">
                                  <p className="text-[#2E5E2A] font-medium">เข้า: {req.checkIn.time} น. ({req.checkIn.distanceMeters}ม.)</p>
                                  {req.checkOut && (
                                    <div className="space-y-1 text-earth-text/80">
                                      <p className="text-earth-primary font-medium">ออก: {req.checkOut.time} น.</p>
                                      {req.checkOut.workImage && (
                                        <div className="rounded border border-earth-border overflow-hidden max-w-[120px] my-1 shadow-2xs">
                                          <img 
                                            src={req.checkOut.workImage} 
                                            alt="Completed Work Evidence" 
                                            className="w-full h-12 object-cover cursor-zoom-in hover:opacity-90 max-h-12"
                                            onClick={() => window.open(req.checkOut?.workImage, '_blank')}
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      )}
                                      <p className="text-[9.5px] italic font-serif leading-tight">รายงาน: "{req.checkOut.workSummary}"</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BOTTOM FOOTNOTE */}
              <div className="bg-white p-2.5 rounded-xl border border-earth-border text-[10px] text-earth-text/80 leading-relaxed font-serif mt-4">
                💡 กดแถวประวัติใดก็ได้เพื่อดูข้อมูลการทำงาน เช็คพิกัดระยะตรวจสอบ และประวัติสรุปงานที่นำออกโดยอัตโนมัติ
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
