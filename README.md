# FloodGuard — Telemetry Dashboard & LINE LIFF Portal

ระบบ Web Dashboard ตรวจวัดและเตือนภัยระดับน้ำอัจฉริยะ (IoT Telemetry Monitoring & Early Warning System) เชื่อมต่อ LINE Official Account และ LINE Front-end Framework (LIFF)

---

## ฟีเจอร์หลัก (Key Features)

- **Live Telemetry & GIS Map**: แสดงระดับน้ำ, แผนที่ดาวเทียม, สัญญาณ LoRaWAN, ระดับแบตเตอรี่, และองศาการเอียงของทุ่นเซนเซอร์แบบเรียลไทม์
- **Dynamic Node Alerts & Bento Grid**: แจ้งเตือนสถานการณ์น้ำวิกฤตผ่าน LINE OA ในรูปแบบ Bento Grid พร้อม Deep-link ตรงสู่หน้ารายละเอียดโหนด
- **LINE LIFF Citizen Onboarding**: ระบบลงทะเบียนประชาชนแบบ 1-Tap ผ่าน LIFF ดึงโปรไฟล์ LINE อัตโนมัติ เพื่อคัดกรองการแจ้งเตือนตามพื้นที่
- **High-Performance Architecture**: พัฒนาด้วย React 19 + TypeScript + Vite + TailwindCSS พร้อมสอดคล้องกับมาตรฐาน WCAG 2.1 AA

---

## การติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` เป็น `.env`:
```bash
cp .env.example .env
```
แก้ไขตัวแปรใน `.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_LIFF_ID=your_line_liff_id_here
```

### 3. รันเซิร์ฟเวอร์สำหรับพัฒนา (Development)
```bash
npm run dev
```

---

## โครงสร้างโปรเจกต์ (Project Structure)

```
Project_FontEnd/
├── src/
│   ├── components/       # UI Components, Charts, Maps & Layout
│   ├── context/          # Auth & Notification Contexts
│   ├── pages/            # Dashboard, Chart, Nodes, Register, History
│   ├── services/         # API Service & LINE LIFF Helper
│   └── types/            # TypeScript Interface Definitions
├── public/               # Static assets
└── package.json
```
