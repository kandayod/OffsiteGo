/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

export interface OffSiteRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: LocationCoordinates;
  purpose: string; // วัตถุประสงค์ (e.g., จัดงานแข่งการ์ดแวนการ์ด, บันทึกสต็อกสินค้า)
  status: RequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  
  // Checking data (updated once status is approved)
  checkIn?: {
    time: string; // HH:MM:SS
    lat: number;
    lng: number;
    distanceMeters: number; // calculated distance to target location
    deviceInfo?: string;
  };
  checkOut?: {
    time: string; // HH:MM:SS
    lat: number;
    lng: number;
    workSummary: string; // รายละเอียดการทำงานหลังจากเสร็จสิ้น
    issueFound: string; // ปัญหาที่พบ
    issueResolved: boolean; // ปัญหาได้รับการแก้ไขหรือไม่
    workImage?: string; // ภาพถ่ายยืนยันสถานที่หรือผลงานเสร็จสิ้น (Base64)
    deviceInfo?: string;
  };
  
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  avatarColor: string;
  workGroup?: 'regular' | 'adhoc'; // regular = ปฏิบัติงานประจำ (ต้องยื่นแผนล่วงหน้า), adhoc = ปฏิบัติงานรายครั้ง (อนุมัติรายครั้งปกติ)
  position?: 'employee' | 'manager'; // employee = พนักงาน, manager = หัวหน้างาน
  approverId?: string; // รหัสหัวหน้างานผู้อนุมัติ
  approverName?: string; // สายอนุมัติ
}

export interface OffSitePlanDate {
  date: string; // YYYY-MM-DD
  location: LocationCoordinates;
  purpose: string;
  startTime: string;
  endTime: string;
}

export interface OffSitePlan {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string; // e.g. "แผนงานเดือนมิถุนายน"
  type: 'weekly' | 'monthly';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  plannedDates: OffSitePlanDate[];
  createdAt: string;
}

export interface ProblemReport {
  id: string;
  requestId: string;
  employeeName: string;
  locationName: string;
  date: string;
  issue: string;
  resolved: boolean;
  resolutionDetail?: string;
}
