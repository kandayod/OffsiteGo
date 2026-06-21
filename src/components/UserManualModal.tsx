import React, { useState } from 'react';
import { 
  BookOpen, 
  Printer, 
  X, 
  FileText, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Clock, 
  UserCheck, 
  Settings, 
  CornerDownRight, 
  Layers, 
  Info,
  ChevronRight,
  ClipboardList,
  Map,
  Share2
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: 'employee' | 'manager' | 'admin' | string;
  currentUserName: string;
}

export default function UserManualModal({ isOpen, onClose, currentUserRole, currentUserName }: UserManualModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'employee' | 'manager' | 'admin'>('all');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 md:p-4 overflow-y-auto print:static print:bg-white print:p-0">
      <div className="bg-[#FAF9F6] rounded-3xl border border-earth-border max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:w-full print:h-auto print:static print:overflow-visible">
        
        {/* HEADER AREA - HIDE IN PRINT */}
        <div className="p-5 md:p-6 bg-white border-b border-earth-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 print:hidden">
          <div className="space-y-1 text-left">
            <h2 className="font-extrabold text-earth-dark text-lg md:text-xl flex items-center gap-1.5 font-sans">
              <BookOpen className="w-5.5 h-5.5 text-earth-primary" />
              <span>คู่มือการใช้งานระบบปฏิบัติงานนอกสถานที่ (User Manual)</span>
            </h2>
            <p className="text-xs text-earth-text/80">
              รายละเอียดและคำแนะนำการใช้งานแยกตามบทบาทระดับปฏิบัติการ สำหรับ บริษัท คิดซ์ แอนด์ คิทซ์ จำกัด
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end w-full md:w-auto">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-earth-primary hover:bg-[#799976] text-white font-sans text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 duration-100"
              title="พิมพ์เอกสารออกคู่มือ หรือบันทึกเป็น PDF ของเบราว์เซอร์"
            >
              <Printer className="w-4 h-4" />
              <span>ดาวน์โหลด / พิมพ์ PDF 📄</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-earth-text/60 hover:text-earth-dark rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS SELECTOR - HIDE IN PRINT */}
        <div className="px-6 py-2.5 bg-earth-sand/30 border-b border-earth-border flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none print:hidden">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all' 
                ? 'bg-earth-primary text-white shadow-3xs' 
                : 'text-earth-dark/70 hover:bg-white hover:text-earth-dark'
            }`}
          >
            📋 1. ภาพรวม & สิทธิ์การใช้
          </button>
          <button
            onClick={() => setActiveTab('employee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'employee' 
                ? 'bg-[#8BA888] text-white shadow-3xs' 
                : 'text-earth-dark/70 hover:bg-white hover:text-earth-dark'
            }`}
          >
            🧑‍💼 2. สำหรับพนักงานทั่วไป
          </button>
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'manager' 
                ? 'bg-earth-secondary text-white shadow-3xs' 
                : 'text-earth-dark/70 hover:bg-white hover:text-earth-dark'
            }`}
          >
            💼 3. สำหรับหัวหน้า / Manager
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'admin' 
                ? 'bg-amber-600 text-white shadow-3xs' 
                : 'text-earth-dark/70 hover:bg-white hover:text-earth-dark'
            }`}
          >
            🛡️ 4. สำหรับผู้ดูแลระบบ / Admin
          </button>
        </div>

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-left text-earth-dark font-sans leading-relaxed print:overflow-visible print:p-0 print:m-0 print:bg-white print:text-black">
          
          {/* STATIC PRINT HEADER (Hides in web, shows in PDF) */}
          <div className="hidden print:block border-b-2 border-gray-800 pb-4 mb-8 text-center text-black">
            <h1 className="text-2xl font-black tracking-tight font-sans">คู่มือการใช้งานระบบลงพิกัดและปฏิบัติงานนอกสถานที่</h1>
            <p className="text-sm font-bold text-gray-700 mt-1">บริษัท คิดซ์ แอนด์ คิทซ์ จำกัด (Kidz & Kitz Co., Ltd.)</p>
            <p className="text-xs text-gray-500 mt-0.5">เอกสารคู่มืออิเล็กทรอนิกส์ PDF – รหัสเอกสาร KNK-OM-001</p>
            <div className="text-left mt-4 text-[11px] text-gray-600 flex justify-between">
              <span>ผู้จัดทำ: ฝ่ายเทคโนโลยีสารสนเทศเพื่อการจัดการ</span>
              <span>ประเภทสิทธิ์เอกสาร: เอกสารภายใน (Internal Confidential)</span>
            </div>
          </div>

          {/* TAB 1: ALL / OVERVIEW */}
          {(activeTab === 'all' || window.matchMedia('print').matches) && (
            <div className="space-y-6 print:break-after-page">
              <div className="border-b border-earth-border pb-2">
                <h3 className="text-base font-black text-earth-primary flex items-center gap-1.5 print:text-black">
                  <Info className="w-5 h-5 shrink-0" />
                  <span>หมวดที่ 1: ภาพรวมระบบโครงสร้างสิทธิ์อนุมัติ (System Overview Profile)</span>
                </h3>
              </div>

              <p className="text-xs text-earth-text leading-relaxed">
                ระบบจัดการและบันทึกพิกัดเวลานอกสถานที่ (Off-Site Work Management Dashboard) 
                ถูกพัฒนาขึ้นสำหรับสนับสนุนและกำกับดูแล ความพร้อมในการเข้าปฏิบัติหน้าที่ของพนักงานองค์กร 
                เพื่ออำนวยความสะดวกในการจัดสรรกำลังคน แผนงาน และประเมินพิกัด GPS อุปกรณ์จริง ป้องกันข้อผิดพลาดของพิกัดงานซ้ำซ้อนในกลุ่มพนักงานลงตรวจงานนอกสถานที่เป็นประจำ
              </p>

              {/* Approval matrix diagram */}
              <div className="bg-white rounded-2xl border border-earth-border p-5 space-y-4 shadow-3xs print:border-gray-300">
                <h4 className="text-xs font-black text-earth-dark flex items-center gap-1.5 uppercase tracking-wide">
                  <Layers className="w-4 h-4 text-earth-primary" />
                  <span>สายสายงานควบคุมสิทธิ์อนุมัติ (Chain of Approval Authority)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-center">
                  <div className="p-3 bg-earth-sand/20 rounded-xl border border-earth-border">
                    <span className="font-extrabold text-earth-primary block mb-1">1. พนักงาน (Employees)</span>
                    <p className="text-[11px] text-earth-text">
                      จัดวางร่างสัปดาห์ ส่งคำขอรายกรณี, เช็คอินเป้าหมาย แนบงานบกพร่อง
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-between">
                    <div>
                      <span className="font-extrabold text-[#799976] block mb-1">2. หัวหน้างาน (Managers)</span>
                      <p className="text-[11px] text-earth-text">
                        มีรายชื่อผูกติดเป็น <span className="font-bold text-earth-dark">"ผู้จัดการประจำตัว"</span> คอยประเมินความทับซ้อน ตรวจสอบพิกัดเปรียบเทียบในแผนก
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex flex-col justify-between">
                    <div>
                      <span className="font-extrabold text-amber-700 block mb-1">3. ผู้คุมระบบสูง (Admin - werasak)</span>
                      <p className="text-[11px] text-earth-text">
                        ผูกสิทธิ์เป็น <span className="font-bold text-earth-dark">"ผู้อนุมัติร่วมทดแทน"</span> ระดับสูง เคาะไฟเขียวกรณีฉุกเฉิน และสับย้ายผู้ควบคุมสายพนักงานได้ทุกคน
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current logged in user status info */}
              <div className="p-4 rounded-xl bg-earth-secondary/10 border border-earth-secondary/30 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 print:hidden">
                <div className="space-y-1">
                  <span className="font-bold text-earth-secondary text-[11px] uppercase tracking-wide block">สถานะสิทธิ์ในระบบปัจจุบันของคุณ</span>
                  <p className="text-earth-dark">
                    บัญชีของคุณคือ: <span className="font-extrabold text-earth-primary">{currentUserName}</span> ประจำสิทธิ์บทบาทตำแหน่ง <span className="px-2 py-0.5 rounded-md bg-earth-primary/20 font-black text-earth-dark">{currentUserRole === 'admin' ? 'ผู้คุมระบบและผู้ดูแล (Admin - werasak / admin)' : currentUserRole === 'manager' ? 'ผู้จัดการฝ่ายส่วนงาน (Manager)' : 'พนักงานทั่วไป (Employee)'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMPLOYEE */}
          {(activeTab === 'employee' || window.matchMedia('print').matches) && (
            <div className="space-y-6 print:break-after-page">
              <div className="border-b border-earth-border pb-2">
                <h3 className="text-base font-black text-earth-primary flex items-center gap-1.5 print:text-black">
                  <Users className="w-5 h-5 shrink-0" />
                  <span>หมวดที่ 2: คู่มือการใช้งานสำหรับ "บทบาทพนักงานทั่วไป" (Employee Guild)</span>
                </h3>
              </div>

              <p className="text-xs text-earth-text">
                บทบาทพนักงานทั่วไป มีสิทธิ์เด็ดขาดในส่วนงานยื่นข้อเสนอของตนเอง ภายใต้ "เมนูฝั่งซ้ายและแดชบอร์ดหลัก" 
                โดยมีกระบวนงานสำคัญ 3 ขั้นตอน ดังต่อไปนี้:
              </p>

              {/* Steps overview */}
              <div className="space-y-4">
                <div className="flex gap-4 items-start bg-white p-4 rounded-xl border border-earth-border shadow-2xs print:border-gray-300">
                  <div className="w-6 h-6 rounded-lg bg-[#8BA888] text-white flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    1
                  </div>
                  <div className="space-y-1 text-xs text-left">
                    <h5 className="font-extrabold text-earth-dark">การเสนอ "ร่างแผนการปฏิบัติงานล่วงหน้า" (Weekly / Monthly Plan)</h5>
                    <p className="text-earth-text">
                      หากกลุ่มงานปฏิบัติหน้าที่พนักงานจัดอยู่ใน <span className="font-bold text-earth-dark">"กลุ่มทำงานนอกสถานที่เป็นประจำ (Regular Work Group)"</span> 
                      ระบบความปลอดภัยจะห้ามไม่ให้ทำการเช็คอินสุ่มสี่สุ่มห้า พนักงานจะต้องคลิกที่ปุ่ม <span className="font-black text-earth-dark">"ยื่นร่างแผนตารางงานล่วงหน้า"</span> 
                      โดยกำหนดวันที่, ตำแหน่งจัดสเปกพิกัด, วัตถุประสงค์งาน แล้วกดส่งขอส่งเพื่อขอสิทธิอนุญาตแบบระยะจากผู้จัดการล่วงหน้าก่อนวันจริง
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-white p-4 rounded-xl border border-earth-border shadow-2xs print:border-gray-300">
                  <div className="w-6 h-6 rounded-lg bg-[#8BA888] text-white flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    2
                  </div>
                  <div className="space-y-1 text-xs text-left">
                    <h5 className="font-extrabold text-earth-dark">การส่งคำขอยื่นพื้นที่จริงรายพื้นที่ (Check-in Sandbox Request)</h5>
                    <p className="text-earth-text">
                      กรณีเร่งด่วน หรือพนักงานสังกัด <span className="font-bold text-[#8BA888]">"กลุ่มสิทธิ์รายครั้งทั่วไป (Ad-hoc Group)"</span> 
                      สามารถกรอกเอกสารเช็คอินด่วนได้ทันทีที่แผงควบคุมหลักระบุด้านล่างซ้าย เพียงใส่ตำบลพิกัดระบุ หมวดกิจกรรมงาน 
                      ความคุ้มทุน รายงานการเคลื่อนพลและเลือกผู้ควบคุมเพื่อส่งแจ้งให้หัวหน้างานกดเปิดไฟสแตนด์บายได้ตรงเวลา
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-white p-4 rounded-xl border border-earth-border shadow-2xs print:border-gray-300">
                  <div className="w-6 h-6 rounded-lg bg-[#8BA888] text-white flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    3
                  </div>
                  <div className="space-y-1 text-xs text-left">
                    <h5 className="font-extrabold text-earth-dark">การเช็คอิน (Check-In) และเช็คเอาท์ (Check-Out) บันทึกรายงานบกพร่อง</h5>
                    <p className="text-earth-text">
                      เมื่อผู้จัดการเคาะผ่านอนุมัติคำขอแล้ว พนักงานจะมีปุ่ม <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">อนุมัติแล้ว พร้อมดำเนินการ</span> ปรากฏบนแดชบอร์ดหลัก 
                      พนักงานเดินทางจริงสู่พิกัดป้าย และกดปุ่มเช็คอิน (ระบบตรวจสอบ GPS ต้องมีขอบเขตคลาดเคลื่อนไม่เกินวงกลมอนุวัตน์) 
                      หลังจบงานให้ทำการคลิก <span className="font-bold text-amber-750">เช็คเอาท์ (Check-out)</span> และประเมินบันทึกปัญหาชำรุด (ถ้ามีรายงานปัญหาป้ายเสื่อมให้คลิกกาช่องแจ้งส่งเรื่องให้ส่วนความคุ้มครองทันที)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGER */}
          {(activeTab === 'manager' || window.matchMedia('print').matches) && (
            <div className="space-y-6 print:break-after-page">
              <div className="border-b border-earth-border pb-2">
                <h3 className="text-base font-black text-earth-primary flex items-center gap-1.5 print:text-black">
                  <UserCheck className="w-5 h-5 shrink-0" />
                  <span>หมวดที่ 3: คู่มือการใช้งานสำหรับ "บทบาทผู้จัดการ / หัวหน้าสายงาน (Manager)"</span>
                </h3>
              </div>

              <p className="text-xs text-earth-text">
                ผู้ควบคุมดูแลสายจัดการ (Manager/Supervisor) มีหน้าที่รับผิดชอบตรวจสอบ ควบคุม แผนความปลอดภัยในการปฏิบัติงาน 
                และตรวจสอบประเมินผลการรายงานภารกิจประจำของพนักงานผู้ใต้บังคับบัญชาที่ผูกชื่อกับตนดังนี้:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-earth-border space-y-2.5 shadow-3xs print:border-gray-300">
                  <h4 className="text-xs font-extrabold text-earth-dark flex items-center gap-1">
                    <ClipboardList className="w-4 h-4 text-earth-primary" />
                    <span>งานตรวจสอบพิจารณาร่างแผนล่วงหน้า</span>
                  </h4>
                  <ul className="text-[11px] text-earth-text space-y-1.5 list-disc pl-4 text-left">
                    <li>มีหน้าที่ตรวจสอบคำขอและ <span className="font-bold text-amber-600">สางปมพื้นที่ทับซ้อน</span> ที่ระบบแจ้งเตือน</li>
                    <li>เมื่อคลิกปุ่ม "อนุมัติแผน" ระบบจะนำคิวสเปกงานไปป้อนปฏิทินกองประจำตัวโดยอัตโนมัติ</li>
                    <li>กรณีไม่อนุมัติ ต้องระบุเหตุผลข้อเสนอแนะเพื่อให้ลูกน้องยื่นซ่อมเกณฑ์เอกสารใหม่</li>
                  </ul>
                </div>

                <div className="p-4 bg-white rounded-xl border border-earth-border space-y-2.5 shadow-3xs print:border-gray-300">
                  <h4 className="text-xs font-extrabold text-earth-dark flex items-center gap-1">
                    <Map className="w-4 h-4 text-earth-primary" />
                    <span>แผงตามพิกัดดาวเทียม & ปฏิทินรอบเดือน</span>
                  </h4>
                  <ul className="text-[11px] text-earth-text space-y-1.5 list-disc pl-4 text-left">
                    <li>ดูปฏิทินร่วมกลางเพื่อรวมมุมมองกองงานประจำและไม่ให้ทีมงานเดินงานชนกันโดยเปล่าประโยชน์</li>
                    <li>เข้าใช้งานแผนที่ <span className="font-bold">"Offline Tracker Live Map Simulation"</span> ตรวจสอบพิกัดจริงด้วยสีระบุสถานะงาน (สีเขียว: ดำเนินสัญญากับพิกัดแล้ว, สีเหลือง: เพิ่งเช็คอิน, สีส้ม: รอหัวหน้าอนุมัติติดตราพิกัด)</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-[#FBF9F6] border border-earth-border rounded-xl flex items-start gap-3">
                <Info className="w-4.5 h-4.5 text-[#8BA888] shrink-0 mt-0.5" />
                <div className="text-xs text-earth-dark space-y-1">
                  <span className="font-black block">💡 คำถามพบบ่อย: หากหัวหน้าไม่ว่างหรือลาพักร้อน พนักงานจะเช็คอินอย่างไร?</span>
                  <p className="text-earth-text leading-relaxed">
                    ระบบของคิดซ์ แอนด์ คิทซ์ รองรับ <span className="font-black text-amber-750">"สิทธิ์ผู้ดูแลระบบคุมร่วม" (Co-Approver Control)</span> 
                    โดยคุณวีระศักดิ์ (werasak) หรือ Admin หลักจะเข้าดูแผงขอผ่านทั้งหมดเป็นระดับสูงสุด และสามารถทำการประเมินกดไฟเขียวสิทธิแทนหัวหน้ารายกรณีได้ทันทีโดยไม่ติดขัด
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN */}
          {(activeTab === 'admin' || window.matchMedia('print').matches) && (
            <div className="space-y-6 print:break-after-page">
              <div className="border-b border-earth-border pb-2">
                <h3 className="text-base font-black text-earth-primary flex items-center gap-1.5 print:text-black">
                  <Settings className="w-5 h-5 shrink-0" />
                  <span>หมวดที่ 4: การจัดการระบบขั้นสูง “ผู้ดูแลระบบ และ ผู้คุมระบบสูงสุด” (Admin - werasak / admin)</span>
                </h3>
              </div>

              <p className="text-xs text-earth-text">
                สิทธิ์ระดับ Administrator (คุณวีระศักดิ์ และ บัญชีผู้ดูแลระบบสูงสุด) เป็นบุคลากรผู้อนุมัติร่วมสูงสุด
                และสิทธิ์ความปลอดภัยในระบบคิดซ์ แอนด์ คิทซ์ ซึ่งมีแผงระบบและการใช้งานหลักเสริมดังนี้:
              </p>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-earth-border shadow-2xs print:border-gray-300">
                  <h5 className="text-xs font-black text-amber-700 flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>ระบบพิจารณาอนุมัติร่วมประเมินพิกัดรวมขั้นเร่งด่วน (Default Override Approval)</span>
                  </h5>
                  <p className="text-[11px] text-earth-text">
                    แอดมินหรือคุณเวสักดิ์จะพบคำขออนุมัติทั่งองค์กร และกระทำการจัดเก็บ-อนุมัติ-คืนสิทธิ์แทนหัวหน้างานของทุกคนในตารางแดชบอร์ดล่วงหน้า 
                    และคำขอพิกัดรายครั้งล่าช้าได้ตามดุลยพินิจขององค์กร
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-earth-border shadow-2xs print:border-gray-300">
                  <h5 className="text-xs font-black text-earth-primary flex items-center gap-1.5 mb-1.5">
                    <Users className="w-4 h-4" />
                    <span>ระบบขึ้นคิวบัญชีผู้ใช้งานพนักงาน (Employee Information Control Registry)</span>
                  </h5>
                  <p className="text-[11px] text-earth-text">
                    ทางมุมขวาล่าง จะเป็นโซนทะเบียนบุคลากรทั้งหมด ผู้ดูแลระบบสามารถ:
                  </p>
                  <ul className="text-[11px] text-earth-text/80 list-disc pl-5 mt-1 space-y-1">
                    <li><span className="font-bold text-earth-dark">เพิ่มผู้ร่วมงานท่านใหม่:</span> กำหนดเลข ID, บทบาท, แผนก, พิกัดประจำ, กำหนดรหัส และประเภทกลุ่มทำงาน</li>
                    <li><span className="font-bold text-earth-dark">การเลือกและระบุ "ผู้จัดการหัวหน้าตรง":</span> แอดมินสามารถคลิกรูปดินสอผู้ติดต่อ เพื่อระบุว่าพนักงานคนนี้จะส่งผลงานขออนุมัติไปให้ผู้จัดการคนใด (อาทิ ปรับผูกติดกับกานดา รอยหรือผูกสิทธิ์ขึ้นตรงกับ admin/werasak โดยตรง) เพื่อแยกโซลูชันอนุมัติให้เป็นสัดส่วน</li>
                  </ul>
                </div>

                <div className="p-4 bg-earth-sand/20 border border-earth-border rounded-xl space-y-1.5">
                  <span className="text-xs font-extrabold text-earth-dark block">📌 มาตรการรักษาความปลอดภัยของรหัสผ่าน:</span>
                  <p className="text-[11px] text-earth-text">
                    พนักงานลงทะเบียนใหม่ทุกคน มีค่ารหัสผ่านเริ่มต้นตั้งมาจากโรงงานคือ <span className="font-semibold text-earth-dark font-mono">"1234"</span> 
                    หลังจากลงทะเบียนเสร็จ แอดมินต้องแจ้งให้พนักงานยื่นคลิกปุ่นเมนู <span className="font-bold text-earth-dark">"เปลี่ยนรหัสผ่าน"</span> ด้านบนของเว็บบัญชีทันทีเพื่อเปลี่ยนไปใช้กุญแจที่มีความปลอดภัยรหัสผ่านส่วนตนสูงสุด
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MANUAL FOOTER NOTES */}
          <div className="pt-6 border-t border-earth-border/60 text-center text-earth-text/50 text-[10px] space-y-1 print:text-black print:border-gray-400">
            <p className="font-bold">ระบบบริหารจัดการพิกัดปฏิบัติงานนอกสถานที่ - สิทธิประโยชน์และลิขสิทธิ์ทั้งหมดโดย บริษัท คิดซ์ แอนด์ คิทซ์ จำกัด</p>
            <p>เวอร์ชันควบคุมระบบ: v2.4.0 (อัปเดตมีผลบังคับใช้ล่าสุด: มิถุนายน พ.ศ. 2569)</p>
          </div>

        </div>

      </div>
    </div>
  );
}
