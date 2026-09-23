import type { User, AppNotification, AuthUser } from "../types";

export const mockUsers: User[] = [
  {
    id: "u-001",
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    phone: "0812345678",
    role: "citizen",
    stationIds: ["ST-001", "ST-002"],
    createdAt: "2025-01-15T08:00:00Z",
    district: "คลองหก ปทุมธานี", // ตรงตามพื้นที่สถานี
  },
  {
    id: "u-002",
    name: "สมหญิง รักไทย",
    email: "somying@example.com",
    phone: "0823456789",
    role: "citizen",
    stationIds: [], // ไม่มีสถานีในพื้นที่
    createdAt: "2025-02-20T10:00:00Z",
    district: "เมือง เชียงใหม่", // อยู่นอกพื้นที่สถานี
  },
  {
    id: "u-003",
    name: "นายวิชัย เจ้าหน้าที่",
    email: "wichai.staff@dwr.go.th",
    phone: "0834567890",
    role: "staff",
    stationIds: [],
    createdAt: "2024-11-01T09:00:00Z",
    district: "ธัญบุรี ปทุมธานี", // ตรงตามพื้นที่สถานี
  },
  {
    id: "u-004",
    name: "นางสาวมาลี เจ้าหน้าที่",
    email: "malee.staff@dwr.go.th",
    phone: "0845678901",
    role: "staff",
    stationIds: [],
    createdAt: "2024-12-15T09:00:00Z",
    district: "พระนครศรีอยุธยา", // อยู่นอกพื้นที่สถานี
  },
  {
    id: "u-005",
    name: "ผู้ดูแลระบบ",
    email: "admin@dwr.go.th",
    phone: "0856789012",
    role: "admin",
    stationIds: [],
    createdAt: "2024-01-01T00:00:00Z",
    district: "ส่วนกลาง",
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: "notif-001",
    title: "ระดับน้ำวิกฤต",
    message: "สถานีคลองชัยนาทมีระดับน้ำสูงถึงระดับวิกฤต (5.91 ม.) กรุณาระวัง",
    type: "critical",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false,
    stationId: "st-003",
    stationName: "สถานีคลองชัยนาท",
  },
  {
    id: "notif-002",
    title: "ระดับน้ำเฝ้าระวัง",
    message:
      "สถานีแม่น้ำเจ้าพระยา อยุธยา มีระดับน้ำเข้าสู่ระดับเฝ้าระวัง (4.82 ม.)",
    type: "warning",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    read: false,
    stationId: "st-002",
    stationName: "สถานีแม่น้ำเจ้าพระยา อยุธยา",
  },
];

export const mockAuthUsers: Record<string, AuthUser> = {
  citizen: {
    id: "u-001",
    name: "สมชาย ใจดี",
    email: "citizen@example.com",
    role: "citizen",
    stationIds: ["st-001", "st-002"],
    phone: "0812345678",
    district: "บางปะอิน",
  },
  staff: {
    id: "u-003",
    name: "นายวิชัย เจ้าหน้าที่",
    email: "staff@dwr.go.th",
    role: "staff",
    stationIds: [],
    phone: "0834567890",
    district: "พระนครศรีอยุธยา",
  },
  admin: {
    id: "u-005",
    name: "ผู้ดูแลระบบ",
    email: "admin@dwr.go.th",
    role: "admin",
    stationIds: [],
    phone: "0856789012",
    district: "กรุงเทพมหานคร",
  },
};
