import { useState } from 'react';
import { OffSiteRequest, Employee, OffSitePlan } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle2, ChevronLeft, ChevronRight, User, AlertCircle, ImageIcon, ClipboardList, Info } from 'lucide-react';

interface ManagerCalendarProps {
  requests: OffSiteRequest[];
  selectedMonth: string;
  employees: Employee[];
  plans: OffSitePlan[];
  loggedInUser: Employee | null;
}

export default function ManagerCalendar({ requests, selectedMonth, employees, plans = [], loggedInUser }: ManagerCalendarProps) {
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr) || 2026;
  const month = parseInt(monthStr) || 6;

  // Track the view calendar mode: actual clock-ins vs planned schedules
  const [calendarMode, setCalendarMode] = useState<'actual' | 'planning'>('actual');

  // Number of days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  // Day of week of the 1st day of the month (0 = Sunday, 1 = Monday ...)
  const firstDayIndex = new Date(year, month - 1, 1).getDay();

  // Selected date inside calendar for detail view
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNamesTh = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const daysTh = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  // Generate calendar days
  const calendarCells: (number | null)[] = [];
  // Pad beginning blank cells
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Populate days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  // Find requests matching a specific day number
  const getRequestsForDay = (dayNum: number) => {
    const paddedDay = dayNum.toString().padStart(2, '0');
    const paddedMonth = month.toString().padStart(2, '0');
    const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
    
    // 1. Get actual requests
    const dayReqs = [...requests.filter(req => req.date === dateStr)];
    
    // 2. Add approved plans that don't already have a request
    plans.forEach(plan => {
      if (plan.status === 'approved') {
        plan.plannedDates.forEach(pd => {
          if (pd.date === dateStr) {
            const hasReq = dayReqs.some(r => r.employeeId === plan.employeeId);
            if (!hasReq) {
              const emp = employees.find(e => e.id === plan.employeeId);
              dayReqs.push({
                id: `REQ-PLAN-${plan.id}-${pd.date}`,
                employeeId: plan.employeeId,
                employeeName: plan.employeeName,
                role: emp?.role || 'พนักงานปฏิบัติการ',
                date: pd.date,
                startTime: pd.startTime,
                endTime: pd.endTime,
                location: pd.location,
                purpose: pd.purpose,
                status: 'approved',
                approvedBy: plan.approvedBy || 'ระบบแผนงานล่วงหน้า',
                approvedAt: plan.approvedAt,
                createdAt: plan.createdAt
              });
            }
          }
        });
      }
    });
    
    // FILTER FOR ACTUAL MODE: Only show the logged-in user themselves and their subordinates in the approval line.
    let filteredDayReqs = dayReqs;
    if (loggedInUser) {
      filteredDayReqs = dayReqs.filter(req => {
        const isSelf = req.employeeId === loggedInUser.id;
        const emp = employees.find(e => e.id === req.employeeId);
        const isSubordinate = emp?.approverId === loggedInUser.id;
        return isSelf || isSubordinate;
      });
    }
    
    return filteredDayReqs;
  };

  // Find plans / scheduled days matching a specific day number
  const getPlansForDay = (dayNum: number) => {
    const paddedDay = dayNum.toString().padStart(2, '0');
    const paddedMonth = month.toString().padStart(2, '0');
    const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
    
    interface DayPlanItem {
      plan: OffSitePlan;
      employeeName: string;
      id: string;
      startTime: string;
      endTime: string;
      locationName: string;
      purpose: string;
      status: 'pending' | 'approved' | 'rejected';
    }
    
    const matchedList: DayPlanItem[] = [];
    plans.forEach(plan => {
      plan.plannedDates.forEach(pd => {
        if (pd.date === dateStr) {
          matchedList.push({
            plan,
            employeeName: plan.employeeName,
            id: plan.id,
            startTime: pd.startTime,
            endTime: pd.endTime,
            locationName: pd.location.name,
            purpose: pd.purpose,
            status: plan.status
          });
        }
      });
    });
    return matchedList;
  };

  // Get status color for badge representation (Actual Requests)
  const getRequestStatusLabel = (req: OffSiteRequest) => {
    if (req.checkOut) {
      return { label: 'เสร็จสิ้นภารกิจ', bg: 'bg-[#E2EBE0] text-[#2E5E2A] border-[#8BA888]/40', dot: 'bg-[#2E5E2A]' };
    }
    if (req.checkIn) {
      return { label: 'กำลังทำงานหน้างาน', bg: 'bg-[#E0EEF9] text-[#1E578C] border-[#5D96C9]/40', dot: 'bg-[#1E578C]' };
    }
    if (req.status === 'approved') {
      return { label: 'อนุมัติคำขอแล้ว', bg: 'bg-green-100 text-green-800 border-green-300', dot: 'bg-green-500' };
    }
    if (req.status === 'rejected') {
      return { label: 'ปฏิเสธคำขอแล้ว', bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
    }
    return { label: 'รอรับการอนุมัติ', bg: 'bg-yellow-100 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500' };
  };

  // Get status color for plan badge
  const getPlanStatusLabel = (status: 'pending' | 'approved' | 'rejected') => {
    if (status === 'approved') {
      return { label: 'อนุมัติแผนแล้ว', bg: 'bg-sky-100 text-sky-800 border-sky-300', dot: 'bg-sky-500' };
    }
    if (status === 'rejected') {
      return { label: 'ปฏิเสธแผนงาน', bg: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-red-500' };
    }
    return { label: 'ยื่นขออนุมัติแผน', bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
  };

  // Handle viewing specific date
  const handleDayClick = (dayNum: number) => {
    const paddedDay = dayNum.toString().padStart(2, '0');
    const paddedMonth = month.toString().padStart(2, '0');
    setSelectedDate(`${year}-${paddedMonth}-${paddedDay}`);
  };

  const selectedDateRequests = selectedDate ? (() => {
    const dayNum = parseInt(selectedDate.split('-')[2]);
    return getRequestsForDay(dayNum);
  })() : [];
  
  // Find plans for selected date
  const selectedDatePlans = selectedDate ? (() => {
    interface DayPlanItem {
      plan: OffSitePlan;
      employeeName: string;
      id: string;
      startTime: string;
      endTime: string;
      locationName: string;
      purpose: string;
      status: 'pending' | 'approved' | 'rejected';
    }
    const matchedList: DayPlanItem[] = [];
    plans.forEach(plan => {
      plan.plannedDates.forEach(pd => {
        if (pd.date === selectedDate) {
          matchedList.push({
            plan,
            employeeName: plan.employeeName,
            id: plan.id,
            startTime: pd.startTime,
            endTime: pd.endTime,
            locationName: pd.location.name,
            purpose: pd.purpose,
            status: plan.status
          });
        }
      });
    });
    return matchedList;
  })() : [];

  return (
    <div className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-6">
      {/* HEADER BAR SUMMARY */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-earth-border pb-4 gap-4">
        <div>
          <h3 className="font-bold text-earth-dark text-base flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-earth-primary" />
            <span>
              {calendarMode === 'actual' 
                ? `ปฏิทินปฏิบัติงานพนักงานนอกสถานที่จริง (${monthNamesTh[month - 1]} ${year + 543})`
                : `ปฏิทินเสนอร่างแผนปฏิบัติงานล่วงหน้ารายตัว (${monthNamesTh[month - 1]} ${year + 543})`
              }
            </span>
          </h3>
          <p className="text-xs text-earth-text/80">
            {calendarMode === 'actual'
              ? 'สรุปความคืบหน้าการทำงานรายวัน: ยื่นคำขอเดี่ยว เช็คอินเข้าจุดตรวจจับ และเช็คเอาท์แนบรูปผลงาน'
              : 'แผนการปฏิบัติงานล่วงหน้าของกลุ่มพนักงานจัดเก็บงานประจำ (สีแดง=ยื่นร่างขออนุมัติรอบแผน, สีฟ้า=อนุมัติแผนล่วงหน้าผ่าน)'}
          </p>
        </div>

        {/* TABS DESIGN */}
        <div className="flex bg-[#F3EFE9] p-1 rounded-xl border border-earth-border/60 shrink-0 self-stretch md:self-auto justify-stretch">
          <button
            type="button"
            onClick={() => {
              setCalendarMode('actual');
              // trigger refresh detail if selected
            }}
            className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
              calendarMode === 'actual'
                ? 'bg-earth-primary text-white shadow-xs'
                : 'text-earth-dark hover:bg-earth-sidebar/80'
            }`}
          >
            🕒 1. ตารางลงปฏิบัติการจริง
          </button>
          <button
            type="button"
            onClick={() => {
              setCalendarMode('planning');
              // trigger refresh detail if selected
            }}
            className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
              calendarMode === 'planning'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'text-earth-dark hover:bg-earth-sidebar/80'
            }`}
          >
            📅 2. แผนล่วงหน้า
          </button>
        </div>
      </div>

      {/* COMPACT LEGEND SECTION BASED ON CHOSEN MODE */}
      <div className="bg-[#FAF8F4]/80 p-3 rounded-2xl border border-earth-border/40 flex flex-wrap gap-4 items-center text-[11px] font-bold">
        <span className="text-earth-primary shrink-0 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />คำอธิบายสีสัญลักษณ์:
        </span>
        {calendarMode === 'actual' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
              <span className="text-earth-dark/90">เหลือง = ค้างรอผู้จัดการอนุมัติรายครั้ง</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              <span className="text-earth-dark/90">เขียว = อนุมัติผ่านแต่ยังไม่มีการลงจุด</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E578C] inline-block" />
              <span className="text-earth-dark/90">น้ำเงิน = กำลังปฏิบัติหน้าที่อยู่หน้างาน (เช็คอินแล้ว)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E5E2A] inline-block" />
              <span className="text-earth-dark/90">เขียวเข้ม = ภารกิจเคาะเสร็จสิ้น (เช็คเอาท์พร้อมแนบรูป)</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span className="text-[#C2410C]">สีแดง = พนักงานยื่นร่าง "ขออนุมัติแผนการทำงาน" (รอการพิจารณาตรวจสอบ)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              <span className="text-[#0369A1]">สีฟ้า = แผนได้รับการอนุมัติล่วงหน้าแล้ว (พนักงานเช็คอินตามกรอบได้ทันที)</span>
            </div>
          </>
        )}
      </div>

      {/* CALENDAR & SELECTION SPLIT SCREEN DETAILED LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: THE GRID (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-earth-dark text-xs mb-1 bg-earth-sidebar/40 py-2 rounded-xl border border-earth-border/40">
            {daysTh.map((day, idx) => (
              <span key={idx} className={idx === 0 ? 'text-rose-700 font-extrabold' : idx === 6 ? 'text-earth-primary font-extrabold' : 'text-earth-dark'}>
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cellDay, idx) => {
              if (cellDay === null) {
                return (
                  <div key={`empty-${idx}`} className="h-24 bg-[#FCFBF8]/40 border border-earth-border/20 rounded-xl" />
                );
              }

              const paddedDay = cellDay.toString().padStart(2, '0');
              const paddedMonth = month.toString().padStart(2, '0');
              const currentCellDate = `${year}-${paddedMonth}-${paddedDay}`;
              const isSelected = selectedDate === currentCellDate;

              // Actual logs
              const dayReqs = getRequestsForDay(cellDay);
              
              // Plans logs
              const dayPlans = getPlansForDay(cellDay);

              // Determine container background based on has items
              const totalItemsCount = calendarMode === 'actual' ? dayReqs.length : dayPlans.length;

              return (
                <button
                  key={`day-${cellDay}`}
                  type="button"
                  onClick={() => handleDayClick(cellDay)}
                  className={`h-24 flex flex-col justify-between p-2 rounded-2xl border text-left cursor-pointer transition-all focus:outline-none ${
                    isSelected
                      ? 'bg-[#EAE4DC] border-earth-primary ring-2 ring-earth-primary/50 shadow-xs'
                      : totalItemsCount > 0
                        ? calendarMode === 'actual'
                          ? 'bg-white border-earth-border hover:bg-[#F8F5F0]'
                          : 'bg-white border-[#DCD6CE] hover:bg-[#FAF8F5]'
                        : 'bg-white border-earth-border/50 hover:bg-[#FBF9F6]'
                  }`}
                >
                  {/* Day number */}
                  <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-lg inline-block ${
                    totalItemsCount > 0 
                      ? calendarMode === 'actual'
                        ? 'bg-earth-primary/10 text-earth-primary'
                        : 'bg-indigo-50 text-indigo-900 border border-indigo-100'
                      : 'text-earth-dark/70'
                  }`}>
                    {cellDay}
                  </span>

                  {/* Cell Listings */}
                  <div className="w-full">
                    {calendarMode === 'actual' ? (
                      // ACTUAL PORTAL ENTRIES
                      dayReqs.length > 0 ? (
                        <div className="flex flex-col gap-0.5 max-h-[44px] overflow-hidden text-[9px] leading-tight font-sans font-bold">
                          {dayReqs.slice(0, 2).map((r) => {
                            const indicator = r.checkOut 
                              ? 'bg-[#2E5E2A]' 
                              : r.checkIn 
                                ? 'bg-[#1E578C]' 
                                : r.status === 'approved' 
                                  ? 'bg-green-500'
                                  : 'bg-yellow-400';
                            return (
                              <div key={r.id} className="flex items-center gap-1 truncate text-earth-dark">
                                <span className={`w-1.5 h-1.5 rounded-full ${indicator} shrink-0`} />
                                <span className="truncate">{r.employeeName.split(' ')[0]}</span>
                              </div>
                            );
                          })}
                          {dayReqs.length > 2 && (
                            <div className="text-[8px] text-earth-text/80 font-semibold italic pl-2.5">
                              +{dayReqs.length - 2} ท่านอื่น...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[8.5px] text-earth-text/30 font-bold self-end block text-right pr-1">ไม่มีลูบ</span>
                      )
                    ) : (
                      // PLANNING PORTAL ENTRIES
                      dayPlans.length > 0 ? (
                        <div className="flex flex-col gap-0.5 max-h-[44px] overflow-hidden text-[9px] leading-tight font-sans font-bold">
                          {dayPlans.slice(0, 2).map((dp, dpIdx) => {
                            const isPending = dp.status === 'pending';
                            // Red marker and text tone for Pending request, Blue marker and text tone for Approved
                            const badgeColor = isPending 
                              ? 'bg-red-500 text-red-700' 
                              : 'bg-sky-500 text-sky-800';
                            
                            return (
                              <div 
                                key={`${dp.id}-${dpIdx}`} 
                                className={`flex items-center gap-1 rounded px-0.5 py-0.2 shrink-0 truncate ${
                                  isPending ? 'bg-red-50/70 text-red-700 border border-red-200/50' : 'bg-sky-50/80 text-sky-800 border border-sky-200/50'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${badgeColor.split(' ')[0]} shrink-0`} />
                                <span className="truncate">{dp.employeeName.split(' ')[0]}</span>
                              </div>
                            );
                          })}
                          {dayPlans.length > 2 && (
                            <div className="text-[8.5px] text-indigo-950 font-black pl-1 mt-0.5">
                              +{dayPlans.length - 2} แผนงาน...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[8.5px] text-earth-text/20 font-bold self-end block text-right pr-1">ว่าง</span>
                      )
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTION DETAILS DESK (4 cols) */}
        <div className="lg:col-span-4 bg-[#FBF9F6] border border-earth-border rounded-2xl p-4 flex flex-col justify-between min-h-[420px]">
          {selectedDate ? (
            <div className="space-y-4">
              <div className="border-b border-earth-border pb-2.5 flex justify-between items-center bg-white -mx-4 -mt-4 px-4 py-3 rounded-t-2xl text-xs font-bold text-earth-dark shadow-2xs">
                <span className="flex items-center gap-1.5 text-earth-primary">
                  <CalendarIcon className="w-4 h-4" />
                  <span>พิกัดวันที่: {selectedDate.split('-').reverse().join('/')}</span>
                </span>
                <span className="bg-earth-primary/10 text-earth-primary px-2.5 py-0.5 rounded-full">
                  {calendarMode === 'actual' ? `มี ${selectedDateRequests.length} รายการ` : `มี ${selectedDatePlans.length} แผนงาน`}
                </span>
              </div>

              {/* Mode 1: Actual logs detail view */}
              {calendarMode === 'actual' ? (
                selectedDateRequests.length === 0 ? (
                  <div className="text-center py-14 text-earth-text/60 font-serif">
                    <AlertCircle className="w-8 h-8 text-earth-text/30 mx-auto mb-2" />
                    <p className="text-xs font-bold text-earth-dark/80">ไม่มีพนักงานยื่นขออนุมัติในวันนี้</p>
                    <p className="text-[10px] text-earth-text/70 mt-1">ไม่มีข้อมูลประวัติประจุเช็คอินจริงบนแผนที่จำลอง</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {selectedDateRequests.map((req) => {
                      const meta = getRequestStatusLabel(req);
                      return (
                        <div key={req.id} className="p-3 bg-white rounded-xl border border-earth-border hover:shadow-2xs transition-all space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-extrabold text-earth-dark text-xs">
                                {req.employeeName}{(() => {
                                  const empObj = employees.find(e => e.id === req.employeeId);
                                  return empObj?.department ? ` (${empObj.department.trim()})` : '';
                                })()}
                              </p>
                              <p className="text-[10px] text-earth-text/70">{req.role}</p>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${meta.bg}`}>
                              {meta.label}
                            </span>
                          </div>

                          <div className="text-[11px] grid gap-1.5 text-earth-text bg-[#FCFAF7] p-2 rounded-lg border border-earth-border/40">
                            <p className="flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-earth-primary shrink-0 mt-0.5" />
                              <span><span className="font-bold text-earth-dark">พิกัดทางกายภาพ:</span> {req.location.name}</span>
                            </p>
                            <p className="flex items-start gap-1">
                              <Clock className="w-3.5 h-3.5 text-earth-primary shrink-0 mt-0.5" />
                              <span><span className="font-bold text-earth-dark">ช่วงเวลาสัมผัสงาน:</span> {req.startTime} - {req.endTime} น.</span>
                            </p>
                            <p className="flex items-start gap-1">
                              <User className="w-3.5 h-3.5 text-earth-primary shrink-0 mt-0.5" />
                              <span><span className="font-bold text-earth-dark">วัตถุประสงค์นอกห้อง:</span> "{req.purpose}"</span>
                            </p>
                          </div>

                          {req.checkOut && (
                            <div className="pt-2 border-t border-earth-border/40 space-y-2">
                              <div className="text-[10px] bg-emerald-50/70 border border-emerald-100 rounded-lg p-2 space-y-1 text-[#2E5E2A]">
                                <p className="font-extrabold">📝 รายงานภารกิจเช็คเอาท์หน้างาน:</p>
                                <p className="text-[10.5px] italic leading-relaxed text-earth-dark">"{req.checkOut.workSummary}"</p>
                              </div>
                              {req.checkOut.workImage && (
                                <div className="rounded-lg overflow-hidden border border-earth-border">
                                  <img 
                                    src={req.checkOut.workImage} 
                                    alt="พยานสถานที่และหน้างานจริง" 
                                    className="w-full h-24 object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {req.checkIn && !req.checkOut && (
                            <div className="text-[10px] bg-sky-50 border border-sky-100 p-2 rounded-lg text-sky-800">
                              <p className="font-bold">📍 เช็คอินเสร็จพิกัดภูมิศาสตร์:</p>
                              <p>เช็คอินเวลา: <span className="font-mono">{req.checkIn.time}</span> น.</p>
                              <p>ความคลาดเคลื่อน GPS: <span className="font-mono font-bold">{req.checkIn.distanceMeters} เมตร</span></p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                // Mode 2: Planning logs detail view
                selectedDatePlans.length === 0 ? (
                  <div className="text-center py-14 text-earth-text/60 font-serif">
                    <ClipboardList className="w-8 h-8 text-earth-text/30 mx-auto mb-2" />
                    <p className="text-xs font-bold text-earth-dark/80">ไม่มีการเสนอแผนงานล่วงหน้าในวันนี้</p>
                    <p className="text-[10px] text-earth-text/70 mt-1">พนักงานกลุ่มประจำยังไม่ได้ขออนุมัติหรือวางแผนปฏิบัติงานลงวันที่นี้</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {selectedDatePlans.map((dpObj, iIdx) => {
                      const meta = getPlanStatusLabel(dpObj.status);
                      const isPending = dpObj.status === 'pending';
                      return (
                        <div 
                          key={`${dpObj.id}-${iIdx}`} 
                          className={`p-3 bg-white rounded-xl border hover:shadow-2xs transition-all space-y-2 ${
                            isPending ? 'border-red-200 ring-1 ring-red-50' : 'border-sky-250 ring-1 ring-sky-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-extrabold text-earth-dark text-xs">
                                {dpObj.employeeName}{(() => {
                                  const empObj = employees.find(e => e.id === dpObj.plan.employeeId);
                                  return empObj?.department ? ` (${empObj.department.trim()})` : '';
                                })()}
                              </p>
                              <p className="text-[10px] text-earth-text/80 font-black">
                                {dpObj.plan.title}
                              </p>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                              isPending ? 'bg-red-50 text-red-700 border-red-200' : 'bg-sky-50 text-sky-700 border-sky-300'
                            }`}>
                              {meta.label}
                            </span>
                          </div>

                          <div className={`text-[11px] grid gap-1 px-2.5 py-2 rounded-lg border ${
                            isPending ? 'bg-red-50/20 border-red-100' : 'bg-sky-50/20 border-sky-100'
                          }`}>
                            <p className="text-earth-dark leading-relaxed font-bold">
                              📍 จุดสถานที่: <span className="font-extrabold text-indigo-900">{dpObj.locationName}</span>
                            </p>
                            <p className="text-earth-text">
                              ⏰ ช่วงเวลาปฏิบัติงาน: <span className="font-bold text-earth-dark">{dpObj.startTime} - {dpObj.endTime} น.</span>
                            </p>
                            <p className="text-earth-text italic">
                              📌 เป้าหมายหลัก: "{dpObj.purpose}"
                            </p>
                          </div>
                   
                          <div className="text-[9px] text-earth-text/70 flex justify-between items-center bg-[#FAF8F5] p-1.5 rounded border border-earth-border/40">
                            <span>ผู้ลงระบบ: {dpObj.employeeName}</span>
                            <span>{dpObj.plan.approvedBy ? `อนุมัติโดย Manager` : 'อยู่ระหว่างดำเนินการ'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-earth-text/60 space-y-2">
              <CalendarIcon className="w-10 h-10 text-earth-text/20 mx-auto" />
              <h4 className="font-bold text-earth-dark text-xs">สำรวจเจาะลึกข้อมูลสรุปรายวัน</h4>
              <p className="text-[11px] leading-relaxed max-w-[200px] mx-auto text-earth-text/70">
                กรุณาคลิกเลือกวันที่บนหน้าปฏิทินฝั่งซ้าย เพื่อดึงข้อมูลเช็คอินจริง หรือสัญญาร่างแผนงานประจำของลูปพนักงานนอกสถานที่ทั้งหมด
              </p>
            </div>
          )}

          {/* Legend instructions info note */}
          <div className="border-t border-earth-border/50 pt-3 text-[10px] text-earth-text/80 bg-white/40 p-2.5 rounded-xl mt-3">
            <span className="font-bold text-earth-dark">🌟 เคล็ดลับการควบคุม:</span> สามารถกรองสถิติเดือนปีได้จากดรอปดาวน์ด้านบนของแดชบอร์ดหลัก เพื่อเปลี่ยนโฟลเดอร์ปฏิบัติประจำเดือนได้อย่างรวดเร็ว
          </div>
        </div>
      </div>
    </div>
  );
}
