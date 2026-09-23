import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import type { Station } from '../../types';
import {
  MapPinIcon,
  SlidersIcon,
  AlertTriangleIcon,
  InfoIcon,
} from '../ui/Icons';

interface StationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Station>) => void;
  station?: Station | null;
}

const defaultForm = {
  name: '',
  description: '',
  location: '',
  district: '',
  province: '',
  lat: '',
  lng: '',
  sensorToRefDistance: '2.00',
  referencePointName: 'จุดอ้างอิง',
  warningLevel: '',
  criticalLevel: '',
  deviceId: '',
  operatingStatus: 'active' as 'active' | 'offline',
};

export default function StationModal({ isOpen, onClose, onSave, station }: StationModalProps) {
  const isEdit = !!station;
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (station) {
      setForm({
        name: station.name,
        description: station.description || '',
        location: station.location || '',
        district: station.district || '',
        province: station.province || '',
        lat: String(station.lat ?? ''),
        lng: String(station.lng ?? ''),
        sensorToRefDistance: String(station.sensorToRefDistance ?? 2.0),
        referencePointName: station.referencePointName || 'จุดอ้างอิง',
        warningLevel: station.warningLevel !== null && station.warningLevel !== undefined ? String(station.warningLevel) : '',
        criticalLevel: station.criticalLevel !== null && station.criticalLevel !== undefined ? String(station.criticalLevel) : '',
        deviceId: station.deviceId || station.id || '',
        operatingStatus: (station.isActive ? 'active' : 'offline') as 'active' | 'offline',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [station, isOpen]);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'กรุณากรอกชื่อสถานี';
    if (!form.lat || isNaN(Number(form.lat))) e.lat = 'กรุณากรอกละติจูดเป็นตัวเลขทศนิยม';
    if (!form.lng || isNaN(Number(form.lng))) e.lng = 'กรุณากรอกลองจิจูดเป็นตัวเลขทศนิยม';
    if (!form.sensorToRefDistance || isNaN(Number(form.sensorToRefDistance)) || Number(form.sensorToRefDistance) <= 0) {
      e.sensorToRefDistance = 'กรุณากรอกระยะจากเซนเซอร์ถึงจุดอ้างอิงเป็นตัวเลขมากกว่า 0 (เมตร)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const refName = form.referencePointName.trim() !== '' ? form.referencePointName.trim() : 'จุดอ้างอิง';
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      location: form.location.trim() || `${form.district.trim()} ${form.province.trim()}`.trim(),
      district: form.district.trim(),
      province: form.province.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      sensorToRefDistance: Number(form.sensorToRefDistance),
      referencePointName: refName,
      warningLevel: form.warningLevel.trim() !== '' && !isNaN(Number(form.warningLevel)) ? Number(form.warningLevel) : (undefined as any),
      criticalLevel: form.criticalLevel.trim() !== '' && !isNaN(Number(form.criticalLevel)) ? Number(form.criticalLevel) : (undefined as any),
      deviceId: form.deviceId.trim() || undefined,
      isActive: form.operatingStatus === 'active',
      operatingStatus: form.operatingStatus,
      status: 'normal',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `แก้ไขสถานีตรวจวัด ${station?.name || ''}` : 'ลงทะเบียนเพิ่มสถานีตรวจวัดใหม่'}
      maxWidth="780px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            * ช่องที่มีเครื่องหมายดอกจันจำเป็นต้องระบุข้อมูล
          </span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}
            >
              {isEdit ? 'บันทึกการแก้ไข' : 'ลงทะเบียนสถานี'}
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.25rem 0' }}>
        {/* ════════ SECTION 1: GENERAL & GPS ════════ */}
        <div
          style={{
            background: 'var(--card-surface)',
            border: '1px solid var(--card-border)',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              paddingBottom: '0.625rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <MapPinIcon size={18} style={{ color: 'var(--cyan-glow)' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
              1. ข้อมูลทั่วไปและพิกัดภูมิศาสตร์ (Station Info & GPS)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem 1.25rem' }}>
            {/* Status Selection (Visible segmented radio control) */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.4rem', display: 'block' }}>
                สถานะการให้บริการของสถานี
              </label>
              <div
                role="radiogroup"
                aria-label="สถานะการให้บริการ"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '9999px',
                  padding: '4px',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={form.operatingStatus === 'active'}
                  onClick={() => setForm((prev) => ({ ...prev, operatingStatus: 'active' }))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: form.operatingStatus === 'active' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent',
                    background: form.operatingStatus === 'active' ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
                    color: form.operatingStatus === 'active' ? '#10B981' : 'var(--text-muted)',
                    fontWeight: form.operatingStatus === 'active' ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: form.operatingStatus === 'active' ? '#10B981' : 'rgba(148, 163, 184, 0.4)',
                      boxShadow: form.operatingStatus === 'active' ? '0 0 8px #10B981' : 'none',
                    }}
                  />
                  <span>ออนไลน์ (เปิดให้บริการ)</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={form.operatingStatus === 'offline'}
                  onClick={() => setForm((prev) => ({ ...prev, operatingStatus: 'offline' }))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: form.operatingStatus === 'offline' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid transparent',
                    background: form.operatingStatus === 'offline' ? 'rgba(245, 158, 11, 0.22)' : 'transparent',
                    color: form.operatingStatus === 'offline' ? '#F59E0B' : 'var(--text-muted)',
                    fontWeight: form.operatingStatus === 'offline' ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: form.operatingStatus === 'offline' ? '#F59E0B' : 'rgba(148, 163, 184, 0.4)',
                      boxShadow: form.operatingStatus === 'offline' ? '0 0 8px #F59E0B' : 'none',
                    }}
                  />
                  <span>ออฟไลน์ (ปิดบริการชั่วคราว)</span>
                </button>
              </div>
            </div>

            {/* Station Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
                ชื่อสถานีตรวจวัด *
              </label>
              <input
                className={`input ${errors.name ? 'input-error' : ''}`}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="เช่น สถานีริมคลองรังสิต ประตูน้ำจุฬาลงกรณ์"
                style={{ fontSize: '0.9375rem', padding: '0.65rem 0.875rem' }}
              />
              {errors.name && <div className="error-msg" style={{ marginTop: '0.25rem' }}>{errors.name}</div>}
            </div>

            {/* Device ID */}
            <div>
              <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
                รหัสอุปกรณ์ / Station ID
              </label>
              <input
                className="input"
                value={form.deviceId}
                onChange={(e) => set('deviceId', e.target.value)}
                placeholder="เช่น ST-001 หรือ DEV-RS01"
                style={{ fontSize: '0.9375rem', padding: '0.65rem 0.875rem', fontFamily: 'monospace' }}
              />
            </div>

            {/* Location details */}
            <div>
              <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
                สถานที่ / จุดสังเกต
              </label>
              <input
                className="input"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="เช่น สะพานข้ามคลองหก มทร.ธัญบุรี"
                style={{ fontSize: '0.9375rem', padding: '0.65rem 0.875rem' }}
              />
            </div>

            {/* Province */}
            <div>
              <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
                จังหวัด
              </label>
              <input
                className="input"
                value={form.province}
                onChange={(e) => set('province', e.target.value)}
                placeholder="เช่น ปทุมธานี"
                style={{ fontSize: '0.9375rem', padding: '0.65rem 0.875rem' }}
              />
            </div>

            {/* District */}
            <div>
              <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
                อำเภอ / เขต
              </label>
              <input
                className="input"
                value={form.district}
                onChange={(e) => set('district', e.target.value)}
                placeholder="เช่น คลองหลวง หรือ ธัญบุรี"
                style={{ fontSize: '0.9375rem', padding: '0.65rem 0.875rem' }}
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
                ละติจูด (Latitude) *
              </label>
              <input
                className={`input ${errors.lat ? 'input-error' : ''}`}
                value={form.lat}
                onChange={(e) => set('lat', e.target.value)}
                placeholder="เช่น 14.03593"
                type="number"
                step="any"
                style={{ fontSize: '0.9375rem', padding: '0.65rem 0.875rem', fontFamily: 'monospace' }}
              />
              {errors.lat && <div className="error-msg" style={{ marginTop: '0.25rem' }}>{errors.lat}</div>}
            </div>

            {/* Longitude */}
            <div>
              <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
                ลองจิจูด (Longitude) *
              </label>
              <input
                className={`input ${errors.lng ? 'input-error' : ''}`}
                value={form.lng}
                onChange={(e) => set('lng', e.target.value)}
                placeholder="เช่น 100.72516"
                type="number"
                step="any"
                style={{ fontSize: '0.9375rem', padding: '0.65rem 0.875rem', fontFamily: 'monospace' }}
              />
              {errors.lng && <div className="error-msg" style={{ marginTop: '0.25rem' }}>{errors.lng}</div>}
            </div>
          </div>
        </div>

        {/* ════════ SECTION 2: REFERENCE POINT CALIBRATION ════════ */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              paddingBottom: '0.625rem',
              borderBottom: '1px solid rgba(6, 182, 212, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersIcon size={18} style={{ color: 'var(--cyan-glow)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                2. การปรับเทียบจุดอ้างอิงระดับน้ำ (Reference Point Calibration)
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--cyan-glow)',
                background: 'rgba(6, 182, 212, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              โมเดลสัมพัทธ์
            </span>
          </div>

          {/* Explanatory Info Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: '0.625rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.8125rem',
              color: '#CBD5E1',
              lineHeight: 1.5,
            }}
          >
            <InfoIcon size={16} style={{ color: 'var(--cyan-glow)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, color: '#F1F5F9', marginBottom: '0.25rem' }}>
                การแสดงผลระดับน้ำเทียบกับจุดอ้างอิง
              </div>
              <span style={{ color: 'var(--text-secondary)' }}>
                คำนวณจากระยะติดตั้งถึงจุดอ้างอิง ลบด้วยระยะผิวน้ำที่เซนเซอร์วัดได้จริง
              </span>
              <div style={{ marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
                • ค่าติดลบ (-) หมายถึงระดับน้ำอยู่ต่ำกว่าจุดอ้างอิง (เช่น -0.80 ม. คือต่ำกว่าตลิ่ง 80 ซม.)
                <br />
                • ค่าบวก (+) หมายถึงระดับน้ำเอ่อล้นสูงกว่าจุดอ้างอิง (เช่น +0.30 ม. คือล้นตลิ่ง 30 ซม.)
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem 1.25rem' }}>
            {/* Reference Point Name */}
            <div>
              <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
                ชื่อเรียกจุดอ้างอิง
              </label>
              <input
                className="input"
                value={form.referencePointName}
                onChange={(e) => set('referencePointName', e.target.value)}
                placeholder="เช่น ขอบตลิ่ง, ผิวถนนสะพาน (เว้นไว้จะใช้ 'จุดอ้างอิง')"
                style={{ fontSize: '0.9375rem', padding: '0.65rem 0.875rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                หากไม่กรอก ระบบจะใช้คำว่า &quot;จุดอ้างอิง&quot; โดยอัตโนมัติ
              </span>
            </div>

            {/* Sensor to Reference Distance */}
            <div>
              <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
                ระยะติดตั้งจากเซนเซอร์ถึงจุดอ้างอิง (เมตร) *
              </label>
              <input
                className={`input ${errors.sensorToRefDistance ? 'input-error' : ''}`}
                value={form.sensorToRefDistance}
                onChange={(e) => set('sensorToRefDistance', e.target.value)}
                placeholder="เช่น 2.00 หรือ 3.50"
                type="number"
                step="any"
                style={{ fontSize: '0.9375rem', padding: '0.65rem 0.875rem', fontFamily: 'monospace' }}
              />
              {errors.sensorToRefDistance ? (
                <div className="error-msg" style={{ marginTop: '0.25rem' }}>{errors.sensorToRefDistance}</div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  ระยะวัดแนวดิ่งจากหัวเซนเซอร์ A01NYUB ลงมาถึงระดับจุดอ้างอิง
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ════════ SECTION 3: ALERT THRESHOLDS RELATIVE TO REFERENCE POINT ════════ */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.625rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangleIcon size={18} style={{ color: '#F59E0B' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                3. เกณฑ์การแจ้งเตือนเทียบจุดอ้างอิง
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (ไม่บังคับ - เว้นว่างได้หากไม่ต้องการแจ้งเตือน)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem 1.25rem' }}>
            {/* Warning Level Card */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem 1.125rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                <label className="label" style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#F59E0B' }}>
                  ระดับเฝ้าระวังเทียบจุดอ้างอิง (เมตร)
                </label>
              </div>
              <input
                className="input"
                value={form.warningLevel}
                onChange={(e) => set('warningLevel', e.target.value)}
                placeholder="เช่น -0.50 (เว้นว่างได้)"
                type="number"
                step="any"
                style={{
                  fontSize: '0.9375rem',
                  padding: '0.65rem 0.875rem',
                  fontFamily: 'monospace',
                  background: 'rgba(15, 23, 42, 0.9)',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.35rem' }}>
                ตัวอย่าง เช่น <strong>-0.50</strong> คือแจ้งเตือนเมื่อระดับน้ำสูงขึ้นมาเหลืออีก 50 ซม. จะแตะจุดอ้างอิง
              </span>
            </div>

            {/* Critical Level Card */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem 1.125rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                <label className="label" style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#EF4444' }}>
                  ระดับวิกฤตเทียบจุดอ้างอิง (เมตร)
                </label>
              </div>
              <input
                className="input"
                value={form.criticalLevel}
                onChange={(e) => set('criticalLevel', e.target.value)}
                placeholder="เช่น 0.00 หรือ 0.20 (เว้นว่างได้)"
                type="number"
                step="any"
                style={{
                  fontSize: '0.9375rem',
                  padding: '0.65rem 0.875rem',
                  fontFamily: 'monospace',
                  background: 'rgba(15, 23, 42, 0.9)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.35rem' }}>
                ตัวอย่าง เช่น <strong>0.00</strong> คือน้ำเสมอจุดอ้างอิงพอดี หรือ <strong>+0.20</strong> คือน้ำเอ่อล้นเกินตลิ่ง 20 ซม.
              </span>
            </div>
          </div>
        </div>

        {/* ════════ SECTION 4: DESCRIPTION ════════ */}
        <div>
          <label className="label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
            คำอธิบายเพิ่มเติมเกี่ยวกับสถานี
          </label>
          <textarea
            className="input"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="รายละเอียดเพิ่มเติม เช่น จุดติดตั้งใต้สะพาน, เสาไฟส่องสว่าง, ข้อมูลผู้ดูแลพื้นที่..."
            rows={2}
            style={{ fontSize: '0.9375rem', padding: '0.65rem 0.875rem', resize: 'vertical' }}
          />
        </div>
      </div>
    </Modal>
  );
}

