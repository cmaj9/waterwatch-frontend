# Rule: Dashboard Concept & Interactive Controls Architecture

This workspace adheres to the **Dashboard Concept** standard for data-dense, real-time IoT monitoring applications.
UI controls on the Dashboard must be **Space-efficient (ประหยัดพื้นที่)**, **Data-deferent (ไม่แย่งความสนใจจากกราฟ/ข้อมูลหลัก)**, and **Instantaneous (High-frequency interaction)**.

---

## Core Principles

1. **Space-Efficient (ประหยัดพื้นที่แนวตั้ง)**
   - Dashboard real estate belongs to live telemetry, geospatial maps, and predictive trend graphs.
   - Never use bulky multi-row filter bars or oversized standalone action buttons when a compact or integrated control can do the job.

2. **Data-Deferent (ไม่แย่งความสนใจ)**
   - Buttons and selectors must never use radioactive, glaring solid colors (e.g. solid neon `#00d4ff`) that overpower primary sensor readouts.
   - Use refined Cobalt & Cyan gradients (`#2563eb` -> `#0ea5e9`), translucent dark glass surfaces (`rgba(255, 255, 255, 0.05)`), and fine border strokes (`rgba(255, 255, 255, 0.12)`).

3. **High-Frequency Interaction (สลับสถานะได้ทันใจ)**
   - Users switch stations, view modes, and time horizons continuously.
   - Keep interactions 1-click away with instant visual feedback (<150ms) and sliding highlight pills.

---

## The 4 Mandated Interactive Control Patterns

### 1. Segmented Control / Sliding Pill Switcher (แคปซูลแบนสลับมุมมอง)
- **Visuals**: Flat capsule track (`background: rgba(255, 255, 255, 0.05); border-radius: 9999px; padding: 3px`) with a sliding pill active indicator (`background: #2563eb; color: #ffffff; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35)`).
- **Use Cases**:
  - Time range switching: `1D` | `7D` | `1M` | `1Y`
  - View modes: `เซนเซอร์ทุกค่า` vs `กราฟแนวโน้ม` or `ตารางข้อมูล` vs `กราฟสถิติ`
  - Station selector capsule bar at top of Dashboard.
- **Benefit**: Virtually zero vertical waste; fits directly into card headers or top command strips.

### 2. Metric / KPI Filter Tabs (การ์ดสรุปที่เป็นตัวกรองในตัว)
- **Visuals**: Dual-function KPI summary cards. Shows the high-level number (e.g. `16 รายการ`, `ระดับน้ำต่ำสุด 1.57m`, `สถานะวิกฤต 0`) while also serving as the filter tab.
- **Interaction**: Clicking an individual card activates it (`border-color: var(--cyan-glow)`, bottom accent glow bar, subtle elevated backdrop). The table or graph below dynamically sorts or filters according to that KPI dimension.
- **Benefit**: Eliminates redundant "Filter by" dropdowns/buttons by turning the metrics themselves into interactive controls.

### 3. Floating Command Bar / Action Dock (แถบเครื่องมือลอยตัว)
- **Visuals**: Centered or corner-pinned floating capsule dock (`position: fixed; bottom: 1.25rem; left: 50%; transform: translateX(-50%)`) with frosted glass background (`backdrop-filter: blur(16px); background: rgba(17, 24, 39, 0.85)`).
- **Interaction**: Rapid access to persistent actions (instant refresh with spinning icon, station jump, map locator, full-screen analytics).
- **Benefit**: Floats above content without eating permanent grid height. Always accessible regardless of scroll depth.

### 4. Compact Dropdown with Badges & Counts (ดรอปดาวน์ขนาดกะทัดรัดพร้อม Badge)
- **Visuals**: Custom compact selector displaying status dots (● green/orange/red), station IDs, and count badges. Collapses into a neat chip (e.g. `สถานะ: ปกติ (4), เฝ้าระวัง (2)`).
- **Benefit**: Ideal for lists with >5 options or multi-attribute filtering without expanding large form layouts.
