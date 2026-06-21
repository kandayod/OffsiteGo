/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { OffSiteRequest } from '../types';
import { POPULAR_LOCATIONS } from '../data/mockData';
import { MapPin, Info, Navigation, Users, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';

interface OfflineSimMapProps {
  requests: OffSiteRequest[];
  selectedEmployeeId: string;
}

export default function OfflineSimMap({ requests, selectedEmployeeId }: OfflineSimMapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Filter requests that are approved/completed (realistic historical logs)
  const activeRequests = useMemo(() => {
    return requests.filter(r => r.status === 'approved');
  }, [requests]);

  // Aggregate visits by location
  const locationStats = useMemo(() => {
    const stats: Record<string, { count: number; employees: Set<string>; issues: number; resolvedCount: number }> = {};
    
    // Initialize with mock pop locations
    POPULAR_LOCATIONS.forEach(loc => {
      stats[loc.name] = { count: 0, employees: new Set(), issues: 0, resolvedCount: 0 };
    });

    // Count records
    activeRequests.forEach(req => {
      const name = req.location.name;
      if (!stats[name]) {
        stats[name] = { count: 0, employees: new Set(), issues: 0, resolvedCount: 0 };
      }
      stats[name].count += 1;
      stats[name].employees.add(req.employeeName);
      if (req.checkOut?.issueFound && req.checkOut.issueFound !== 'ไม่มีปัญหา') {
        stats[name].issues += 1;
        if (req.checkOut.issueResolved) {
          stats[name].resolvedCount += 1;
        }
      }
    });

    return stats;
  }, [activeRequests]);

  // Coordinates Mapping for SVG bounds
  // Lat: 13.65 - 14.05
  // Lng: 100.40 - 100.70
  const latMin = 13.65;
  const latMax = 14.05;
  const lngMin = 100.35;
  const lngMax = 100.72;

  const mapCoords = (lat: number, lng: number) => {
    const width = 1000;
    const height = 650;
    
    // LNG is X axis
    const x = ((lng - lngMin) / (lngMax - lngMin)) * width;
    // LAT is Y axis (inverted since Y is down in SVG)
    const y = (1 - (lat - latMin) / (latMax - latMin)) * height;
    
    return { x, y };
  };

  const formattedLocations = useMemo(() => {
    return POPULAR_LOCATIONS.map(loc => {
      const stats = locationStats[loc.name] || { count: 0, employees: new Set(), issues: 0, resolvedCount: 0 };
      const { x, y } = mapCoords(loc.lat, loc.lng);
      
      // Determine density status
      let density = 'ต่ำ (Low)';
      let colorClass = 'text-sky-500 fill-sky-200';
      let ringColor = 'bg-sky-500';
      
      if (stats.count >= 3) {
        density = 'หนาแน่นสูง (Hotspot)';
        colorClass = 'text-rose-600 fill-rose-200';
        ringColor = 'bg-rose-500';
      } else if (stats.count >= 2) {
        density = 'ปานกลาง (Medium)';
        colorClass = 'text-amber-500 fill-amber-200';
        ringColor = 'bg-amber-400';
      }

      return {
        ...loc,
        x,
        y,
        visitCount: stats.count,
        uniqueEmployees: Array.from(stats.employees),
        issueCount: stats.issues,
        resolvedIssueCount: stats.resolvedCount,
        density,
        colorClass,
        ringColor
      };
    });
  }, [locationStats]);

  // Selected Location Detailed Cards
  const locationDetails = useMemo(() => {
    if (!selectedLocation) return null;
    return formattedLocations.find(l => l.name === selectedLocation);
  }, [selectedLocation, formattedLocations]);

  // Detailed assignments for selected locations
  const locationAssignments = useMemo(() => {
    if (!selectedLocation) return [];
    return activeRequests.filter(r => r.location.name === selectedLocation);
  }, [selectedLocation, activeRequests]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual Map Canvas Container */}
      <div className="lg:col-span-2 bg-[#FAFBFD] rounded-2xl border border-slate-100 shadow-sm p-4 overflow-hidden relative min-h-[550px] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">แผนที่จำลองการพิกัด GPS และตำแหน่งหนาแน่น</h3>
            <p className="text-sm text-slate-500">จำลองพื้นที่กรุงเทพฯ และปริมณฑล พร้อมแสดงความถี่ในการเข้าดำเนินงานนอกสถานที่</p>
          </div>
          
          {/* MAP LEGENDS */}
          <div className="flex gap-4 p-2 bg-white rounded-xl border border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse inline-block" />
              <span>จุดยอดนิยม (3+ ครั้ง)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>ปานกลาง (2 ครั้ง)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              <span>ปกติ (1 ครั้ง)</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE COMPREHENSIVE SVG VECTOR SYSTEM */}
        <div className="flex-1 bg-white border border-slate-100 rounded-xl relative overflow-auto shadow-inner h-[460px] cursor-grab active:cursor-grabbing">
          <svg viewBox="0 0 1000 650" className="w-full h-full min-w-[750px] bg-[#ECF3FE]">
            {/* STYLIZED METROPOLITAN BACKGROUND & DISTRICT REGIONS */}
            
            {/* Chao Phraya River winding across Bangkok */}
            <path
              d="M 520,0 C 510,80 490,120 495,170 C 500,210 520,240 500,280 C 470,320 440,325 435,360 C 428,410 490,440 480,480 C 470,520 440,550 490,600 C 520,630 540,650 560,650"
              fill="none"
              stroke="#97C0FE"
              strokeWidth="42"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-60"
            />
            <path
              d="M 520,0 C 510,80 490,120 495,170 C 500,210 520,240 500,280 C 470,320 440,325 435,360 C 428,410 490,440 480,480 C 470,520 440,550 490,600 C 520,630 540,650 560,650"
              fill="none"
              stroke="#B3D2FF"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90"
            />

            {/* Stylized Outer Ring Roads / Expressways */}
            <line x1="100" y1="200" x2="900" y2="200" stroke="#E2E8F0" strokeWidth="6" strokeDasharray="12,6" />
            <line x1="100" y1="450" x2="900" y2="450" stroke="#E2E8F0" strokeWidth="6" strokeDasharray="12,6" />
            <line x1="300" y1="50" x2="300" y2="600" stroke="#E2E8F0" strokeWidth="6" strokeDasharray="12,6" />
            <line x1="750" y1="50" x2="750" y2="600" stroke="#E2E8F0" strokeWidth="6" strokeDasharray="12,6" />

            {/* Major Highways (Kanchanaphisek & Sirat Expressways) */}
            <path d="M 120,50 Q 350,150 880,50" fill="none" stroke="#CBD5E1" strokeWidth="4" />
            <path d="M 850,50 L 850,600" fill="none" stroke="#CBD5E1" strokeWidth="4" />
            <path d="M 150,50 L 150,600" fill="none" stroke="#CBD5E1" strokeWidth="4" />
            <path d="M 150,580 Q 500,480 850,580" fill="none" stroke="#CBD5E1" strokeWidth="4" />

            {/* District Area Annotation Labels in background */}
            <text x="180" y="580" className="text-[11px] font-medium fill-slate-400 font-sans tracking-wide">นนทบุรี - ตลิ่งชัน</text>
            <text x="780" y="580" className="text-[11px] font-medium fill-slate-400 font-sans tracking-wide">บางนา - สมุทรปราการ</text>
            <text x="780" y="80" className="text-[11px] font-medium fill-slate-400 font-sans tracking-wide">มีนบุรี - คันนายาว</text>
            <text x="180" y="80" className="text-[11px] font-medium fill-slate-400 font-sans tracking-wide">ปทุมธานี - รังสิต</text>
            <text x="440" y="220" className="text-[12px] font-semibold fill-slate-500 font-sans tracking-widest opacity-80">กรุงเทพมหานคร ชั้นใน</text>

            {/* PLOTTING SPATIAL HOTSPOT PINS */}
            {formattedLocations.map((loc) => {
              const isHovered = hoveredLocation === loc.name;
              const isSelected = selectedLocation === loc.name;
              
              // Core visualization rules: larger pulses for high-frequency locations
              const isHotspot = loc.visitCount >= 3;
              const pulseScale = isHotspot ? 'scale-150 animate-pulse' : 'animate-ping';

              return (
                <g 
                  key={loc.name}
                  className="transition-all duration-300"
                  onMouseEnter={() => setHoveredLocation(loc.name)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  onClick={() => setSelectedLocation(loc.name)}
                >
                  {/* Ripple Pulse Background Ring */}
                  {loc.visitCount > 0 && (
                    <circle
                      cx={loc.x}
                      cy={loc.y}
                      r={isHotspot ? 21 : 14}
                      className={`fill-none pointer-events-none transition-all duration-500 ${
                        isHotspot 
                          ? 'stroke-rose-400 opacity-60 animate-normal' 
                          : 'stroke-teal-400 opacity-50'
                      }`}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Pulsing indicator core */}
                  <circle
                    cx={loc.x}
                    cy={loc.y}
                    r={isSelected || isHovered ? 12 : 6}
                    className={`transition-all duration-300 fill-current ${
                      isHotspot 
                        ? 'text-rose-600' 
                        : loc.visitCount >= 2 
                        ? 'text-amber-500' 
                        : 'text-sky-500'
                    }`}
                  />

                  {/* Pin Graphic Overlay */}
                  <g transform={`translate(${loc.x - 14}, ${loc.y - 30})`}>
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      className={`transition-colors pointer-events-none ${
                        isSelected 
                          ? 'fill-rose-700 drop-shadow-md' 
                          : isHovered 
                          ? 'fill-slate-800' 
                          : isHotspot 
                          ? 'fill-rose-500' 
                          : loc.visitCount >= 2 
                          ? 'fill-amber-500' 
                          : 'fill-sky-500'
                      }`}
                    />
                  </g>

                  {/* Visited Counts Marker (Micro Pill on Top) */}
                  <g transform={`translate(${loc.x + 8}, ${loc.y - 28})`}>
                    <rect
                      width="18"
                      height="15"
                      rx="4"
                      className={`${isHotspot ? 'fill-rose-600' : 'fill-slate-700'} pointer-events-none`}
                    />
                    <text
                      x="9"
                      y="11"
                      className="text-[9px] font-bold fill-white font-mono text-center"
                      textAnchor="middle"
                    >
                      {loc.visitCount}
                    </text>
                  </g>

                  {/* TEXT LABELS WITH BACKDROP SHADOW FOR OPTIMAL READABILITY */}
                  <g transform={`translate(${loc.x}, ${loc.y + 16})`}>
                    <text
                      className="text-[11px] font-sans font-bold fill-slate-900 pointer-events-none"
                      textAnchor="middle"
                      style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.9), -2px -2px 0px rgba(255,255,255,0.9), -2px 2px 0px rgba(255,255,255,0.9), 2px -2px 0px rgba(255,255,255,0.9)' }}
                    >
                      {loc.name.split(' (')[0]}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Quick Informative Banner at Bottom Left */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-sm text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>คลิกที่หมุดพินเพื่อแสดงข้อมูลและตัวเลขสถิติปัญหาของศูนย์บริการนั้นๆ</span>
          </div>
        </div>
      </div>

      {/* Right Drawer/Side Panel for Inspector & Hotspots Statistics */}
      <div className="flex flex-col gap-6">
        
        {/* TOP COMPONENT: TARGET INSPECTOR CARD */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between flex-1">
          {selectedLocation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${locationDetails?.visitCount && locationDetails.visitCount >= 3 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                    <Navigation className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{locationDetails?.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono tracking-tighter mt-0.5">{locationDetails?.lat}, {locationDetails?.lng}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLocation(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-sans"
                >
                  ย่อปิด
                </button>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                  <p className="text-[11px] text-slate-400 font-medium">เข้าปฏิบัติงานรวม</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-1 font-mono">{locationDetails?.visitCount || 0} <span className="text-xs font-normal text-slate-500">ครั้ง</span></p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                  <p className="text-[11px] text-slate-400 font-medium">ระดับความถี่</p>
                  <p className={`text-xs font-bold mt-2 inline-block px-2 py-0.5 rounded-full ${
                    locationDetails?.visitCount && locationDetails.visitCount >= 3 
                      ? 'bg-rose-100 text-rose-800' 
                      : locationDetails?.visitCount && locationDetails.visitCount >= 2 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-sky-100 text-sky-800'
                  }`}>
                    {locationDetails?.density}
                  </p>
                </div>
              </div>

              {/* Staff logs list */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>รายชื่อพนักงานที่เข้าปฏิบัติหน้าที่ ({locationDetails?.uniqueEmployees.length || 0}):</span>
                </p>
                {locationDetails?.uniqueEmployees && locationDetails.uniqueEmployees.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {locationDetails.uniqueEmployees.map((emp, idx) => (
                      <span key={idx} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-100 transition-colors">
                        {emp}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">ไม่มีบันทึกปฏิบัติหน้าที่ในรอบปัจจุบัน</p>
                )}
              </div>

              {/* Issues at this location */}
              <div className="border-t border-slate-50 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-slate-550 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>ปัญหาที่แจ้งพ้อง ({locationDetails?.issueCount || 0})</span>
                  </p>
                  <span className="text-[10px] text-slate-400">แก้ไขแล้ว {locationDetails?.resolvedIssueCount}/{locationDetails?.issueCount}</span>
                </div>

                <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {locationAssignments.map((assignment) => {
                    if (!assignment.checkOut?.issueFound || assignment.checkOut.issueFound === 'ไม่มีปัญหา') return null;
                    return (
                      <div key={assignment.id} className="p-2 ml-1 rounded-lg bg-red-50/50 border border-red-100 text-xs flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-slate-700 font-mono text-[10px]">{assignment.employeeName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{assignment.date}</span>
                        </div>
                        <p className="text-slate-600 leading-tight block">{assignment.checkOut.issueFound}</p>
                        <div className="flex justify-end mt-1">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            assignment.checkOut.issueResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {assignment.checkOut.issueResolved ? <CheckCircle2 className="w-2.5 h-2.5" /> : <ShieldAlert className="w-2.5 h-2.5" />}
                            {assignment.checkOut.issueResolved ? 'แก้ไขแล้ว' : 'ค้างการแก้ไข'}
                          </span>
                        </div>
                      </div>
                    );
                  }).filter(Boolean).length === 0 && <p className="text-xs text-emerald-600 block italic">🎉 ไม่พบรายงานปัญหาหน้างานที่จุดนี้</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <MapPin className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm mb-1">ยังไม่เลือกจุดปฏิบัติงาน</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">กรุณาเลือกหรือคลิกจุดพินบนแผนที่จำลอง หรือกดดูบาร์พิกัดแถบด้านล่าง เพื่อเปิดวิเคราะห์ข้อมูลอย่างละเอียดแบบรายศูนย์บริการ</p>
            </div>
          )}
        </div>

        {/* BOTTOM COMPONENT: POPULAR HOTSPOTS (อยู่จุดไหนเยอะเป็นพิเศษ) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>อันดับพิกัดที่มีงานเยอะที่สุด</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Sorted by Visit Count</span>
          </div>

          <div className="space-y-2.5">
            {formattedLocations
              .filter(l => l.visitCount > 0)
              .sort((a, b) => b.visitCount - a.visitCount)
              .slice(0, 4)
              .map((loc, index) => {
                const percentage = Math.min((loc.visitCount / 4) * 100, 100);
                const isTop = index === 0;

                return (
                  <div 
                    key={loc.name} 
                    className={`p-2 rounded-xl transition-all border ${
                      isSelectedLocation(loc.name) ? 'bg-slate-50 border-slate-200' : 'bg-white border-transparent'
                    } cursor-pointer hover:bg-slate-50`}
                    onClick={() => setSelectedLocation(loc.name)}
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold ${isTop ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-700 truncate">{loc.name}</span>
                      </div>
                      <span className="font-mono font-black text-rose-600 pr-1">{loc.visitCount} <span className="text-[10px] font-normal text-slate-400">ครั้ง</span></span>
                    </div>
                    {/* Tiny visual bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isTop ? 'bg-rose-500' : loc.visitCount >= 2 ? 'bg-amber-400' : 'bg-sky-400'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );

  function isSelectedLocation(name: string) {
    return selectedLocation === name;
  }
}
