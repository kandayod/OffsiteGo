import React, { useState, FormEvent } from 'react';
import { Employee, OffSitePlan, LocationCoordinates, OffSitePlanDate } from '../types';
import { CalendarRange, ClipboardList, Plus, Trash2, CheckCircle2, Clock3, MapPin, Send, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface EmployeePlanningProps {
  currentSimEmployee: Employee;
  plans: OffSitePlan[];
  setPlans: React.Dispatch<React.SetStateAction<OffSitePlan[]>>;
  popularLocations: LocationCoordinates[];
}

export default function EmployeePlanning({ currentSimEmployee, plans, setPlans, popularLocations }: EmployeePlanningProps) {
  // Plan drafting state
  const [planTitle, setPlanTitle] = useState<string>('');
  const [planType, setPlanType] = useState<'weekly' | 'monthly'>('weekly');
  const [planStartDate, setPlanStartDate] = useState<string>('2026-06-15');
  const [planEndDate, setPlanEndDate] = useState<string>('2026-06-21');
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);

  // Draft days inside current planning drafting
  const [draftDays, setDraftDays] = useState<{
    date: string;
    locationPreset: string;
    customLocationName: string;
    isCustom: boolean;
    purpose: string;
    startTime: string;
    endTime: string;
  }[]>([
    {
      date: '2026-06-15',
      locationPreset: popularLocations[0]?.name || 'เมก้า พลาซ่า สะพานเหล็ก',
      customLocationName: '',
      isCustom: false,
      purpose: 'ปฏิบัติภารกิจดูแลคอมมูนิตี้การแข่งขันการ์ดเกมประจำสาขา',
      startTime: '09:00',
      endTime: '18:00'
    }
  ]);

  const isRegular = currentSimEmployee.workGroup === 'regular';

  // My submitted plans list
  const myPlans = plans.filter(p => p.employeeId === currentSimEmployee.id);

  // Add draft planned line item
  const addDraftLine = () => {
    // auto-increment date by 1 day from the last element for convenience
    let nextDate = planStartDate;
    if (draftDays.length > 0) {
      const lastDate = new Date(draftDays[draftDays.length - 1].date);
      lastDate.setDate(lastDate.getDate() + 1);
      nextDate = lastDate.toISOString().split('T')[0];
    }

    setDraftDays(prev => [
      ...prev,
      {
        date: nextDate,
        locationPreset: popularLocations[0]?.name || 'เมก้า พลาซ่า สะพานเหล็ก',
        customLocationName: '',
        isCustom: false,
        purpose: 'กิจกรรมนอกสถานที่เพื่อโปรโมตแบรนด์',
        startTime: '09:00',
        endTime: '18:00'
      }
    ]);
  };

  const removeDraftLine = (index: number) => {
    setDraftDays(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateDraftLine = (index: number, field: string, value: any) => {
    setDraftDays(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handlePlanSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) {
      alert('กรุณากรอกหัวข้อแผนปฏิบัติงานนอกสถานที่');
      return;
    }
    if (draftDays.length === 0) {
      alert('กรุณากรอกวันที่แผนงานอย่างน้อย 1 วัน');
      return;
    }

    // Map DraftDays to offSitePlanDate format
    const plannedDates: OffSitePlanDate[] = draftDays.map(pd => {
      let finalLocation: LocationCoordinates;
      if (pd.isCustom) {
        finalLocation = {
          name: pd.customLocationName || 'จุดตรวจพิเศษกรณีฉุกเฉินนอกระบบ',
          lat: 13.7563,
          lng: 100.5018,
          address: 'ระบุตำแหน่งพิกัดภูมิศาสตร์ตามพยานหลักฐาน'
        };
      } else {
        finalLocation = popularLocations.find(l => l.name === pd.locationPreset) || popularLocations[0];
      }

      return {
        date: pd.date,
        location: finalLocation,
        purpose: pd.purpose || 'ปฏิบัติภารกิจการแข่งขันเกมการ์ดและการตรวจรับอุปกรณ์สาขา',
        startTime: pd.startTime,
        endTime: pd.endTime
      };
    });

    const newPlan: OffSitePlan = {
      id: `PLAN-${Date.now().toString().slice(-6)}`,
      employeeId: currentSimEmployee.id,
      employeeName: currentSimEmployee.name,
      title: planTitle,
      type: planType,
      startDate: planStartDate,
      endDate: planEndDate,
      status: 'pending',
      plannedDates,
      createdAt: new Date().toLocaleDateString('th-TH')
    };

    setPlans(prev => [newPlan, ...prev]);
    
    // Clear drafts
    setPlanTitle('');
    setDraftDays([
      {
        date: planStartDate,
        locationPreset: popularLocations[0]?.name || 'เมก้า พลาซ่า สะพานเหล็ก',
        customLocationName: '',
        isCustom: false,
        purpose: 'กิจกรรมนอกสถานที่เพื่อคุมแงันจำตำแหน่ง',
        startTime: '09:00',
        endTime: '18:00'
      }
    ]);

    alert(`บันทึกสำเร็จ: ส่งแผนส่งร่าง "${newPlan.title}" จำนวน ${plannedDates.length} ภารกิจ เรียบร้อยแล้ว ขณะนี้รอผู้เข้าคุมหน้างานหัวหน้ายื่นอนุมัติแผน`);
  };

  const toggleOpenPlan = (id: string) => {
    setOpenPlanId(openPlanId === id ? null : id);
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-1 text-[11px] font-bold bg-[#E2EBE0] text-[#2E5E2A] rounded-full border border-earth-primary/20">✅ ผ่านการอนุมัติ (Pre-Approved)</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 text-[11px] font-bold bg-rose-100 text-rose-800 rounded-full border border-rose-200">❌ ไม่ผ่านหน่วยอนุมัติ</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200 animate-pulse">⏰ รอหัวหน้าอนุมัติร่างแผน</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. VISUAL WORKGROUP CAPABILITY CARD (Highlighting current rules) */}
      <div className={`p-5 rounded-3xl border transition-all shadow-sm ${
        isRegular 
          ? 'bg-gradient-to-br from-white to-[#F2F8F1] border-[#CBDBC8]' 
          : 'bg-white border-earth-border'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border shrink-0 inline-block ${
              isRegular 
                ? 'bg-earth-primary/20 text-[#2E5E2A] border-[#8BA888]/40' 
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {isRegular ? 'กลุ่มขอปฏิบัติงานนอกสถานที่ประจำ' : 'กลุ่มพนักงานขอทำงานนอกสถานทีรายครั้ง (Ad-hoc)'}
            </span>
            <h4 className="font-bold text-earth-dark text-base mt-2">
              {isRegular ? '✨ ระบบยื่นรับรองแผนปฏิบัติงานล่วงหน้ารายสัปดาห์ / รายเดือน' : '📥 ส่งแบบขออนุมัติใช้งานพื้นที่ทำงานรายวันตามปกติ'}
            </h4>
            <p className="text-xs text-earth-text/80 leading-relaxed mt-1">
              {isRegular 
                ? 'คุณอยู่ในกลุ่มที่ลงชื่อนอกสถานที่ประจำเป็นนิจ เพื่อหลีกเลี่ยงการเสียเวลาเสนอใบขออนุมัติแบบเคสรายครั้ง "กรุณายื่นเสนอร่างแผนปฏิบัติงานล่วงหน้ารายสัปดาห์/เดือน" และคอยหัวหน้ากดยืนยันหนึ่งครั้ง เมื่ออนุมัติแล้ว คำขอเช็คอิน-เอ้าท์รายวันของคุณจะเข้าสู่กลไกอนุมัติทันทีอัตโนมัติ (Auto-Approval) โดยระบบจะป้องกันไม่ให้พนักงานกลุ่มประจำยื่นบันทึกงานโดยปราศจากแผนที่รับอนุมัติล่วงหน้า' 
                : 'คุณอยู่ในกลุ่มขอลงพิกัดรายครั้ง เมื่อจำเป็นต้องเดินทาง ให้กรอกแบบฟอร์มส่งขอคำอนุมัติรายครั้ง และให้ผู้จัดการกดผ่านรายการเป็นครั้งๆ ไป'}
            </p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-earth-border shadow-2xs">
            <CalendarRange className={`w-6 h-6 ${isRegular ? 'text-earth-primary animate-pulse' : 'text-[#6B6359]'}`} />
          </div>
        </div>
      </div>

      {/* 2. DRAFTING PLAN CREATION FORM (VISIBLE TO EVERYONE FOR BETTER EMULATOR PLAYGROUND, BUT MANDATORY FOR REGULARS) */}
      <div className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
        <div className="border-b border-earth-border pb-3 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-earth-dark text-base flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-earth-primary" />
              <span>ยื่นเสนอร่าง “แผนปฏิบัติงานล่วงหน้า”</span>
            </h3>
            <p className="text-xs text-earth-text/80 mt-0.5">พยากรณ์และจัดตารางภารกิจประจำ สัปดาห์/เดือน ของคุณเพื่อเสนอผู้จัดการ</p>
          </div>
          <span className="text-[10px] text-earth-primary/80 font-bold bg-[#E2EBE0] px-2.5 py-0.5 rounded-md">ร่างแผนในระบบ</span>
        </div>

        <form onSubmit={handlePlanSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-earth-text mb-1">หัวข้อแผนการทำงาน</label>
              <input
                type="text"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="เช่น แผนงานสัปดาห์ที่ 25 (15-21 มิ.ย. 69)"
                className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-3 py-2 text-xs font-bold text-earth-dark outline-none focus:ring-1 focus:ring-earth-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-earth-text mb-1">ประเภทช่วงเวลาแผน</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as 'weekly' | 'monthly')}
                className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-3 py-2 text-xs text-earth-dark font-semibold outline-none focus:ring-1 focus:ring-earth-primary"
              >
                <option value="weekly">รายสัปดาห์ (Weekly Plan)</option>
                <option value="monthly">รายเดือน (Monthly Plan)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-earth-text mb-1">วันที่เริ่มต้นเสมือน</label>
                <input
                  type="date"
                  value={planStartDate}
                  onChange={(e) => setPlanStartDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 text-xs text-earth-dark font-mono font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-earth-text mb-1">วันที่สิ้นสุดเสมือน</label>
                <input
                  type="date"
                  value={planEndDate}
                  onChange={(e) => setPlanEndDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-earth-border rounded-xl px-2.5 py-1.5 text-xs text-earth-dark font-mono font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Planned Dates line items */}
          <div className="space-y-2.5 border-t border-earth-border/40 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-earth-dark">ระบุกำหนดการและจุดสัมผัสงานนอกสถานที่ ({draftDays.length} รายการในแผน):</span>
              <button
                type="button"
                onClick={addDraftLine}
                className="px-3 py-1.5 bg-earth-primary hover:bg-[#799976] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มวันปฏิบัติภารกิจ</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
              {draftDays.map((pd, dIdx) => (
                <div key={dIdx} className="p-3 bg-[#FCFAF7] border border-earth-border/60 rounded-xl relative flex flex-col md:flex-row gap-3 items-center">
                  <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-earth-dark text-white rounded-full flex items-center justify-center text-[10px] font-black">{dIdx + 1}</div>
                  
                  {/* Date selection inside draft plan line */}
                  <div className="w-full md:w-1/4">
                    <input
                      type="date"
                      value={pd.date}
                      onChange={(e) => updateDraftLine(dIdx, 'date', e.target.value)}
                      className="w-full bg-white border border-earth-border rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-earth-dark outline-none focus:ring-1 focus:ring-earth-primary"
                      required
                    />
                  </div>

                  {/* Location selection inside draft plan line */}
                  <div className="w-full md:w-1/3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-earth-text font-bold mb-0.5">
                        <input
                          type="checkbox"
                          checked={pd.isCustom}
                          onChange={(e) => updateDraftLine(dIdx, 'isCustom', e.target.checked)}
                          className="rounded text-earth-primary bg-white focus:ring-0 cursor-pointer"
                        />
                        <span>ระบุละติจูดอิสระ</span>
                      </div>
                      {!pd.isCustom ? (
                        <select
                          value={pd.locationPreset}
                          onChange={(e) => updateDraftLine(dIdx, 'locationPreset', e.target.value)}
                          className="w-full bg-white border border-earth-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-earth-dark outline-none cursor-pointer"
                        >
                          {popularLocations.map((loc, idx) => (
                            <option key={idx} value={loc.name}>{loc.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="ชื่อพิกัดเป้าหมาย (เช่น ห้างสรรพสินค้า)"
                          value={pd.customLocationName}
                          onChange={(e) => updateDraftLine(dIdx, 'customLocationName', e.target.value)}
                          className="w-full bg-white border border-earth-border rounded-lg px-2 py-1.5 text-xs outline-none text-earth-dark font-bold"
                          required={pd.isCustom}
                        />
                      )}
                    </div>
                  </div>

                  {/* Purpose mapping inside draft plan line */}
                  <div className="w-full md:w-1/3">
                    <input
                      type="text"
                      placeholder="วัตถุประสงค์ (เช่น ตรวจรับอุปกรณ์การแข่งขัน)"
                      value={pd.purpose}
                      onChange={(e) => updateDraftLine(dIdx, 'purpose', e.target.value)}
                      className="w-full bg-white border border-earth-border rounded-lg px-2.5 py-1.5 text-xs outline-none text-earth-dark"
                      required
                    />
                  </div>

                  {/* Remove tool inside draft plan */}
                  <button
                    type="button"
                    onClick={() => removeDraftLine(dIdx)}
                    className="p-1 px-2 text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer text-xs flex gap-1 items-center"
                    title="ลบวันในแผน"
                    disabled={draftDays.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="md:hidden">ลบ</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form submit footer */}
          <button
            type="submit"
            className="w-full bg-[#8BA888] hover:bg-[#799976] text-white font-bold text-xs py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 duration-100"
          >
            <Send className="w-4 h-4" />
            <span>ส่งร่าง “แผนปฏิบัติงานล่วงหน้า” วัตถุประสงค์เพื่อการรายงานข้อมูลเพื่ออนุมัติ</span>
          </button>
        </form>
      </div>

      {/* 3. LIST OF PAST SUBMITTED PLANS AND THEIR DETAILS */}
      <div className="bg-white rounded-3xl border border-earth-border p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-earth-dark text-base">ประวัติแผนงานล่วงหน้าที่เคยบันทึกในระบบ ({myPlans.length} รายการแผน)</h3>
          <p className="text-xs text-earth-text/80 mt-0.5">ติดตามขั้นตอนการพิจารณาตรวจสอบแผนงานของหัวหน้างานเพื่อเช็คความพร้อม</p>
        </div>

        {myPlans.length === 0 ? (
          <div className="text-center py-8 text-earth-text/60 border border-dashed border-earth-border/60 rounded-2xl bg-[#FCFAF7]">
            <HelpCircle className="w-8 h-8 mx-auto text-earth-text/30 mb-2" />
            <p className="text-xs font-serif">ไม่มีแผนงานล่วงหน้าบันทึกในระบบ ค้นหาแผนงานและให้เริ่มกรอกด้านบน</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myPlans.map((plan) => {
              const isOpen = openPlanId === plan.id;
              return (
                <div key={plan.id} className="border border-earth-border rounded-2xl overflow-hidden bg-white hover:border-earth-primary/50 transition">
                  {/* Collapsed Header */}
                  <div
                    onClick={() => toggleOpenPlan(plan.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none bg-[#FCFBF9] hover:bg-[#FAF8F5]"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-earth-dark text-xs">{plan.title}</span>
                        <span className="text-[9px] bg-earth-primary/10 text-earth-primary border border-earth-primary/20 px-1.5 py-0.5 rounded-md font-bold uppercase">{plan.type === 'weekly' ? 'สัปดาห์' : 'เดือน'}</span>
                      </div>
                      <p className="text-[10px] text-earth-text/70">
                        ช่วงรับรองแผน: {plan.startDate.split('-').reverse().join('/')} ถึง {plan.endDate.split('-').reverse().join('/')} | ส่งเมื่อ: {plan.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(plan.status)}
                      {isOpen ? <ChevronUp className="w-4 h-4 text-earth-text" /> : <ChevronDown className="w-4 h-4 text-earth-text" />}
                    </div>
                  </div>

                  {/* Expanded Body Details of specific plan */}
                  {isOpen && (
                    <div className="p-4 border-t border-earth-border/40 bg-[#FAF9F5]/40 space-y-3">
                      
                      {plan.status === 'rejected' && plan.rejectedReason && (
                        <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] leading-relaxed">
                          ⚠️ <span className="font-bold">สาเหตุที่ผู้จัดการไม่อนุมัติ:</span> "{plan.rejectedReason}"
                        </div>
                      )}

                      {plan.status === 'approved' && plan.approvedBy && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[#2E5E2A] text-[11px] leading-relaxed">
                          🎉 <span className="font-bold">ได้รับการเห็นชอบโดย:</span> {plan.approvedBy} เมื่อวันที่ ({plan.approvedAt})
                        </div>
                      )}

                      <p className="text-[11px] font-extrabold text-earth-dark uppercase">จุดพิกัดงานที่ระบุรายละเอียดล่วงหน้า ({plan.plannedDates.length} รายการ):</p>
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {plan.plannedDates.map((pDate, pdIdx) => (
                          <div key={pdIdx} className="p-3 bg-white border border-earth-border/60 rounded-xl flex justify-between items-start text-xs hover:border-earth-primary/30">
                            <div className="space-y-1">
                              <p className="font-black text-earth-primary font-mono">{pDate.date.split('-').reverse().join('/')}</p>
                              <p className="flex items-start gap-1 font-semibold text-earth-dark text-[11.5px] leading-relaxed">
                                <MapPin className="w-3.5 h-3.5 text-earth-primary shrink-0 mt-0.5" />
                                <span>{pDate.location.name}</span>
                              </p>
                              <p className="text-[10.5px] italic text-earth-text/80 pl-4.5">วัตถุประสงค์: "{pDate.purpose}"</p>
                            </div>
                            <span className="text-[10px] bg-earth-sidebar border border-earth-border px-2 py-0.5 rounded-md font-mono shrink-0">{pDate.startTime} - {pDate.endTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
