/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, OffSiteRequest } from '../types';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'สมศักดิ์ รักดี',
    role: 'ผู้ควบคุมการแข่งขัน (Tournament Judge)',
    email: 'somsak.r@kidzandkitz.co.th',
    department: 'แผนกส่งเสริมกิจกรรมและการตลาด (Events & Marketing)',
    avatarColor: '#10B981',
    workGroup: 'adhoc',
    position: 'employee',
    password: '1234',
    approverId: 'KK0031',
    approverName: 'กานดา ยอดรัก (ฝู้จัดการฝ่ายสำนักงาน)'
  },
  {
    id: 'EMP002',
    name: 'ณัฐพงษ์ แก้วมณี',
    role: 'เจ้าหน้าที่บริหารงานขาย (Sales Supervisor)',
    email: 'nattapong.k@kidzandkitz.co.th',
    department: 'แผนกดูแลจัดจำหน่ายร้านค้า (Distributor Relations)',
    avatarColor: '#3B82F6',
    workGroup: 'adhoc',
    position: 'employee',
    password: '1234',
    approverId: 'KK0031',
    approverName: 'กานดา ยอดรัก (ฝู้จัดการฝ่ายสำนักงาน)'
  },
  {
    id: 'EMP003',
    name: 'ปรีดา สุขสำราญ',
    role: 'เจ้าหน้าที่สาธิตสินค้า (Product Demonstrator)',
    email: 'preeda.s@kidzandkitz.co.th',
    department: 'แผนกส่งเสริมกิจกรรมการเล่น (Community Play)',
    avatarColor: '#F59E0B',
    workGroup: 'regular',
    position: 'employee',
    password: '1234',
    approverId: 'KK0031',
    approverName: 'กานดา ยอดรัก (ฝู้จัดการฝ่ายสำนักงาน)'
  },
  {
    id: 'KK0031',
    name: 'กานดา ยอดรัก',
    role: 'ฝู้จัดการฝ่ายสำนักงาน (Admin Manager)',
    email: 'admin.kk@kidzandkitz.co.th',
    department: ' ฝ่ายสำนักงาน ',
    avatarColor: '#8B5CF6',
    workGroup: 'adhoc',
    position: 'manager',
    password: '1234'
  },
  {
    id: 'Kanda',
    name: 'Kanda',
    role: 'ผู้จัดการฝ่ายปฏิบัติการนอกสถานที่ (Operations Manager)',
    email: 'kanda.manager@kidzandkitz.co.th',
    department: 'ฝ่ายบริหารงานบริการทั่วไป',
    avatarColor: '#AD1457',
    workGroup: 'adhoc',
    position: 'manager',
    password: '1234'
  },
  {
    id: 'admin',
    name: 'ผู้ดูแลระบบและคุมระบบสูงสุด',
    role: 'ผู้คุมระบบและผู้ดูแลระบบ (System Administrator)',
    email: 'systech.kk@kidzandkitz.co.th',
    department: 'แผนกไอทีกลาง (IT Administration)',
    avatarColor: '#EF4444',
    workGroup: 'adhoc',
    position: 'admin',
    password: '1234'
  }
];

export const POPULAR_LOCATIONS = [
  { name: 'เมก้า พลาซ่า สะพานเหล็ก', lat: 13.7462, lng: 100.5028, address: 'วังบูรพาภิรมย์ เขตพระนคร กรุงเทพฯ' },
  { name: 'เซ็นทรัลเวิลด์ (ระเบียงจัดกิจกรรม)', lat: 13.7469, lng: 100.5397, address: 'ปทุมวัน เขตปทุมวัน กรุงเทพฯ' },
  { name: 'เดอะมอลล์ บางกะปิ (Zone Toy)', lat: 13.7663, lng: 100.6433, address: 'คลองจั่น เขตบางกะปิ กรุงเทพฯ' },
  { name: 'แฟชั่น ไอส์แลนด์ (ลานอีเว้นต์ชั้น 3)', lat: 13.8248, lng: 100.6775, address: 'คันนายาว เขตคันนายาว กรุงเทพฯ' },
  { name: 'ฟิวเจอร์พาร์ค รังสิต (โซนการ์ดเกม)', lat: 13.9890, lng: 100.6176, address: 'ธัญบุรี ปทุมธานี' },
  { name: 'เซ็นทรัล เวสต์เกต (Hall 2)', lat: 13.8762, lng: 100.4111, address: 'บางใหญ่ นนทบุรี' },
  { name: 'ซีคอนสแควร์ ศรีนครินทร์', lat: 13.6942, lng: 100.6475, address: 'หนองบอน เขตประเวศ กรุงเทพฯ' },
  { name: 'สยามพารากอน (โซนของเล่นแบรนด์)', lat: 13.7461, lng: 100.5348, address: 'ปทุมวัน เขตปทุมวัน กรุงเทพฯ' }
];

export const MOCK_REQUESTS: OffSiteRequest[] = [
  {
    id: 'REQ-2026-001',
    employeeId: 'EMP001',
    employeeName: 'สมศักดิ์ รักดี',
    role: 'ผู้ควบคุมการแข่งขัน (Tournament Judge)',
    date: '2026-06-01',
    startTime: '09:00',
    endTime: '18:00',
    location: {
      name: 'เมก้า พลาซ่า สะพานเหล็ก',
      lat: 13.7462,
      lng: 100.5028,
      address: 'วังบูรพาภิรมย์ เขตพระนคร กรุงเทพฯ'
    },
    purpose: 'ควบคุมงานแข่งขันแข่งขันการ์ดแวนการ์ด (Vanguard Cardfight Thai Tournament)',
    status: 'approved',
    approvedBy: 'หัวหน้างานฝ่ายการตลาด',
    approvedAt: '2026-05-31 14:22',
    checkIn: {
      time: '08:52:15',
      lat: 13.7461,
      lng: 100.5029,
      distanceMeters: 15,
      deviceInfo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X)'
    },
    checkOut: {
      time: '18:12:44',
      lat: 13.7463,
      lng: 100.5027,
      workSummary: 'จัดงานแข่งขันเสร็จสิ้นเป็นไปตามแผน มีผู้เข้าแข่งขันรวม 128 คน มอบรางวัลและถ่ายภาพเรียบร้อย',
      issueFound: 'โต๊ะแข่งขันเสริมมีไม่เพียงพอ ต้องยืมโต๊ะจากร้านค้าพันธมิตร',
      issueResolved: true,
      deviceInfo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X)'
    },
    createdAt: '2026-05-30'
  },
  {
    id: 'REQ-2026-002',
    employeeId: 'EMP002',
    employeeName: 'ณัฐพงษ์ แก้วมณี',
    role: 'เจ้าหน้าที่บริหารงานขาย (Sales Supervisor)',
    date: '2026-06-02',
    startTime: '10:00',
    endTime: '17:00',
    location: {
      name: 'เซ็นทรัลเวิลด์ (ระเบียงจัดกิจกรรม)',
      lat: 13.7469,
      lng: 100.5397,
      address: 'ปทุมวัน เขตปทุมวัน กรุงเทพฯ'
    },
    purpose: 'ตรวจสอบบูธของเล่นและจัดแสดงสินค้าวางขาย พรีโมชั่นและการทดลองเล่นการ์ดสัญชาติไทย',
    status: 'approved',
    approvedBy: 'หัวหน้าฝ่ายส่งเสริมการขาย',
    approvedAt: '2026-06-01 11:10',
    checkIn: {
      time: '09:45:30',
      lat: 13.7468,
      lng: 100.5398,
      distanceMeters: 22,
      deviceInfo: 'Mozilla/5.0 (Android; Android 14; Mobile)'
    },
    checkOut: {
      time: '17:05:11',
      lat: 13.7470,
      lng: 100.5396,
      workSummary: 'จัดแต่งบูธสินค้าเสร็จเรียบร้อย ตรวจเช็กระบบชำระเงินพกพาสะดวกของบูธ ใช้งานได้ปกติ ยอดขายวันแรกบรรลุเป้า',
      issueFound: 'ไม่มีปัญหา',
      issueResolved: true,
      deviceInfo: 'Mozilla/5.0 (Android; Android 14; Mobile)'
    },
    createdAt: '2026-06-01'
  },
  {
    id: 'REQ-2026-003',
    employeeId: 'EMP003',
    employeeName: 'ปรีดา สุขสำราญ',
    role: 'เจ้าหน้าที่สาธิตสินค้า (Product Demonstrator)',
    date: '2026-06-05',
    startTime: '13:00',
    endTime: '19:00',
    location: {
      name: 'เดอะมอลล์ บางกะปิ (Zone Toy)',
      lat: 13.7663,
      lng: 100.6433,
      address: 'คลองจั่น เขตบางกะปิ กรุงเทพฯ'
    },
    purpose: 'จัดเวิร์คช็อปสอนเล่นการ์ดแบทเทิลสปิริตส์และแวนการ์ดเมทาเวิร์สสำหรับเด็กนักเรียน',
    status: 'approved',
    approvedBy: 'หัวหน้างานฝ่ายการตลาด',
    approvedAt: '2026-06-04 15:55',
    checkIn: {
      time: '12:44:02',
      lat: 13.7665,
      lng: 100.6430,
      distanceMeters: 38,
      deviceInfo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)'
    },
    checkOut: {
      time: '19:15:30',
      lat: 13.7663,
      lng: 100.6433,
      workSummary: 'สอนน้องๆ เล่นเล่นการ์ดได้สนุกสนาน การ์ดทดลองเล่นแจกหมดประปราย นามบัตรคลับการ์ดถูกเอาไปจนเกือบหมด',
      issueFound: 'เด็กๆ ทะเลาะกันเรื่องแย่งที่กั้นโซนสอนเล่น',
      issueResolved: true,
      deviceInfo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)'
    },
    createdAt: '2026-06-03'
  },
  {
    id: 'REQ-2026-004',
    employeeId: 'EMP004',
    employeeName: 'จิรวรรณ สร้อยทอง',
    role: 'วิทยากรฝึกอบรมพิเศษ (Training Specialist)',
    date: '2026-06-06',
    startTime: '09:00',
    endTime: '16:00',
    location: {
      name: 'ฟิวเจอร์พาร์ค รังสิต (โซนการ์ดเกม)',
      lat: 13.9890,
      lng: 100.6176,
      address: 'ธัญบุรี ปทุมธานี'
    },
    purpose: 'ฝึกอบรมสอนพนักงานขายของร้านค้าแฟรนไชส์จำหน่ายของเล่นในจ.ปทุมธานี เกี่ยวกับกติกาการ์ดเกมใหม่ล่าสุด',
    status: 'approved',
    approvedBy: 'หัวหน้างานฝ่ายการตลาด',
    approvedAt: '2026-06-05 10:44',
    checkIn: {
      time: '08:50:11',
      lat: 13.9892,
      lng: 100.6171,
      distanceMeters: 45,
      deviceInfo: 'Mozilla/5.0 (iPhone; iOS 17_0)'
    },
    checkOut: {
      time: '16:02:40',
      lat: 13.9890,
      lng: 100.6176,
      workSummary: 'พนักงานขายจำนวน 15 ร้านค้าเข้าร่วมเข้าใจกติกาใหม่ และรู้วิธีการช่วยผู้ปกครองจัดเด็คเบื้องต้นได้',
      issueFound: 'เครื่องเสียงโปรเจกเตอร์ของห้องจัดงานความคมชัดต่ำมาก ดูเทมเพลตตัวอย่างไม่ชัดเจน',
      issueResolved: false,
      deviceInfo: 'Mozilla/5.0 (iPhone; iOS 17_0)'
    },
    createdAt: '2026-06-05'
  },
  {
    id: 'REQ-2026-005',
    employeeId: 'EMP001',
    employeeName: 'สมศักดิ์ รักดี',
    role: 'ผู้ควบคุมการแข่งขัน (Tournament Judge)',
    date: '2026-06-08',
    startTime: '10:00',
    endTime: '19:00',
    location: {
      name: 'แฟชั่น ไอส์แลนด์ (ลานอีเว้นต์ชั้น 3)',
      lat: 13.8248,
      lng: 100.6775,
      address: 'คันนายาว เขตคันนายาว กรุงเทพฯ'
    },
    purpose: 'คุมการแข่งขันทัวร์นาเมนต์ Vanguard Weekly Arena ประจำสัปดาห์ปริมณฑล',
    status: 'approved',
    approvedBy: 'หัวหน้างานฝ่ายการตลาด',
    approvedAt: '2026-06-07 09:12',
    checkIn: {
      time: '09:48:44',
      lat: 13.8246,
      lng: 100.6773,
      distanceMeters: 28,
      deviceInfo: 'Mozilla/5.0 (iPhone; iPhone OS 17_2)'
    },
    checkOut: {
      time: '19:05:00',
      lat: 13.8248,
      lng: 100.6775,
      workSummary: 'การแข่งขันมีคนเล่นมาประมาณ 80 คน ผ่านพ้นอย่างราบรื่น มอบตั๋วไปไฟนอลอารีน่าเสร็จสิ้น',
      issueFound: 'ระบบไฟฟ้าลัดวงจรชั่วคราว ดับไป 10 นาที แต่อดทนแก้ไขและไม่มีข้อมูลผู้แข่งขันสูญหาย',
      issueResolved: true,
      deviceInfo: 'Mozilla/5.0 (iPhone; iPhone OS 17_2)'
    },
    createdAt: '2026-06-06'
  },
  {
    id: 'REQ-2026-006',
    employeeId: 'EMP002',
    employeeName: 'ณัฐพงษ์ แก้วมณี',
    role: 'เจ้าหน้าที่บริหารงานขาย (Sales Supervisor)',
    date: '2026-06-09',
    startTime: '13:00',
    endTime: '18:00',
    location: {
      name: 'เมก้า พลาซ่า สะพานเหล็ก',
      lat: 13.7462,
      lng: 100.5028,
      address: 'วังบูรพาภิรมย์ เขตพระนคร กรุงเทพฯ'
    },
    purpose: 'ตรวจสอบสินค้าส่งมอบ สั่งสินค้า และสืบสวนทิศทางราคากลางการ์ดชุดล่าสุดในตลาดใหญ่สะพานเหล็ก',
    status: 'approved',
    approvedBy: 'ผู้จัดการทั่วไปฝ่ายปฏิบัติการ',
    approvedAt: '2026-06-08 17:01',
    checkIn: {
      time: '12:50:57',
      lat: 13.7462,
      lng: 100.5028,
      distanceMeters: 0,
      deviceInfo: 'Mozilla/5.0 (Android; PlayStore OS)'
    },
    checkOut: {
      time: '18:15:30',
      lat: 13.7461,
      lng: 100.5029,
      workSummary: 'บันทึกราคาและสอบถามร้านค้าส่ง 12 ร้านค้า พบส่วนลดและชุดโปรโมที่ร้านขาดแคลนเพื่อนำไปแก้ไขต่อ',
      issueFound: 'สินค้ากล่องสเปเชียลซีดหมดสต็อกเร็วกว่าปกติ ทำให้ดีลเลอร์หลายร้านบ่นไม่พอขาย',
      issueResolved: false,
      deviceInfo: 'Mozilla/5.0 (Android; PlayStore OS)'
    },
    createdAt: '2026-06-08'
  },
  {
    id: 'REQ-2026-007',
    employeeId: 'EMP003',
    employeeName: 'ปรีดา สุขสำราญ',
    role: 'เจ้าหน้าที่สาธิตสินค้า (Product Demonstrator)',
    date: '2026-06-10',
    startTime: '12:00',
    endTime: '18:00',
    location: {
      name: 'เซ็นทรัล เวสต์เกต (Hall 2)',
      lat: 13.8762,
      lng: 100.4111,
      address: 'บางใหญ่ นนทบุรี'
    },
    purpose: 'สอนและสาธิตการเล่นของเล่นซีรีย์ใหม่ในเครือบริษัทในวันดีเดย์เปิดตัวการจำหน่ายห้างครอบครัว',
    status: 'approved',
    approvedBy: 'หัวหน้าฝ่ายส่งเสริมการขาย',
    approvedAt: '2026-06-09 11:30',
    checkIn: {
      time: '11:45:12',
      lat: 13.8760,
      lng: 100.4114,
      distanceMeters: 33,
      deviceInfo: 'Mozilla/5.0 (Linux; Android 13; Mobile)'
    },
    checkOut: {
      time: '18:05:00',
      lat: 13.8762,
      lng: 100.4111,
      workSummary: 'จัดแต่งโซน Demo มีเด็กและผู้ปกครองเข้าร่วมหมุนเวียนตลอดเวลา กระตุ้นยอดซื้อร้าน Kidsland ในห้างได้ดี',
      issueFound: 'ผู้ช่วยสาธิตติดโควิด ลาหยุดกะทันหัน ทำให้ทำงานคนเดียว คิวยาวเล็กน้อยในรอบบ่าย3',
      issueResolved: true,
      deviceInfo: 'Mozilla/5.0 (Linux; Android 13; Mobile)'
    },
    createdAt: '2026-06-09'
  },
  {
    id: 'REQ-2026-008',
    employeeId: 'EMP004',
    employeeName: 'จิรวรรณ สร้อยทอง',
    role: 'วิทยากรฝึกอบรมพิเศษ (Training Specialist)',
    date: '2026-06-12',
    startTime: '11:00',
    endTime: '17:00',
    location: {
      name: 'ซีคอนสแควร์ ศรีนครินทร์',
      lat: 13.6942,
      lng: 100.6475,
      address: 'หนองบอน เขตประเวศ กรุงเทพฯ'
    },
    purpose: 'จัดกิจกรรม Kidz School Program เปิดโลกการเรียนรู้ด้วยบอร์ดเกมและการ์ดฝึกทักษะการคำนวณ',
    status: 'approved',
    approvedBy: 'หัวหน้างานฝ่ายการตลาด',
    approvedAt: '2026-06-11 14:10',
    checkIn: {
      time: '10:55:01',
      lat: 13.6940,
      lng: 100.6476,
      distanceMeters: 25,
      deviceInfo: 'Mozilla/5.0 (iPhone; iPhoneOS 17_3)'
    },
    checkOut: {
      time: '17:10:12',
      lat: 13.6942,
      lng: 100.6475,
      workSummary: 'ผ่านไปได้ดีมากกับหลักสูตรการ์ดเลขคณิต มีน้องๆ เข้าร่วมเล่นและสนุกพร้อมได้ของรางวัลเป็นสติกเกอร์การ์ตูน',
      issueFound: 'พื้นที่แคบเกินไปเนื่องจากมีการปูพรมจัดพื้นที่เวทีชนกัน แย่งช่องเสียงสปีกเกอร์งานข้างๆ',
      issueResolved: false,
      deviceInfo: 'Mozilla/5.0 (iPhone; iPhoneOS 17_3)'
    },
    createdAt: '2026-06-11'
  },
  {
    id: 'REQ-2026-009',
    employeeId: 'EMP001',
    employeeName: 'สมศักดิ์ รักดี',
    role: 'ผู้ควบคุมการแข่งขัน (Tournament Judge)',
    date: '2026-06-13',
    startTime: '09:00',
    endTime: '18:00',
    location: {
      name: 'เมก้า พลาซ่า สะพานเหล็ก',
      lat: 13.7462,
      lng: 100.5028,
      address: 'วังบูรพาภิรมย์ เขตพระนคร กรุงเทพฯ'
    },
    purpose: 'ควบคุมตัดสินคัดเลือกการ์ดไฟท์ แบล็คเคลย์ ทัวร์นาเมนท์เพื่อสิทธิ์เข้าชิงระดับประเทศ',
    status: 'approved',
    approvedBy: 'หัวหน้างานฝ่ายการตลาด',
    approvedAt: '2026-06-12 16:30',
    createdAt: '2026-06-12'
    // Approved, but checking in/out can be done by user today!
  },
  {
    id: 'REQ-2026-010',
    employeeId: 'EMP002',
    employeeName: 'ณัฐพงษ์ แก้วมณี',
    role: 'เจ้าหน้าที่บริหารงานขาย (Sales Supervisor)',
    date: '2026-06-14',
    startTime: '10:00',
    endTime: '16:00',
    location: {
      name: 'สยามพารากอน (โซนของเล่นแบรนด์)',
      lat: 13.7461,
      lng: 100.5348,
      address: 'ปทุมวัน เขตปทุมวัน กรุงเทพฯ'
    },
    purpose: 'ประชุมจัดวางสินค้า และอบรมหน้าร้านค้าแบรนด์สำหรับพนักงานต้อนรับใหม่ในการ์ดเดเคอร์',
    status: 'pending',
    createdAt: '2026-06-12'
    // Pending approval - manager can click approve/reject!
  },
  {
    id: 'REQ-2026-011',
    employeeId: 'EMP003',
    employeeName: 'ปรีดา สุขสำราญ',
    role: 'เจ้าหน้าที่สาธิตสินค้า (Product Demonstrator)',
    date: '2026-06-15',
    startTime: '13:00',
    endTime: '19:00',
    location: {
      name: 'ฟิวเจอร์พาร์ค รังสิต (โซนการ์ดเกม)',
      lat: 13.9890,
      lng: 100.6176,
      address: 'ธัญบุรี ปทุมธานี'
    },
    purpose: 'สอนเล่นฟรีเดย์ Buddyfight & Vanguard ยอดมนุษย์ใหม่ ตลอดวันงานรังสิตสตรีทการ์ด',
    status: 'pending',
    createdAt: '2026-06-12'
    // Pending approval
  }
];
