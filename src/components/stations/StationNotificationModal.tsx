import { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import type { Station, NotificationSettings } from '../../types';
import {
  fetchNotificationSettings,
  updateNotificationSettings,
  resetStationNotificationSettings,
} from '../../services/apiService';
import {
  BellIcon,
  DropletsIcon,
  TrendingUpIcon,
  ClockIcon,
  ZapIcon,
  MapPinIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
} from '../ui/Icons';

interface StationNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station | null; // null means global system default
  onSaved?: () => void;
}

interface NumberStepperInputProps {
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  accentColor?: string;
  ariaLabel: string;
}

function NumberStepperInput({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  accentColor = '#38BDF8',
  ariaLabel,
}: NumberStepperInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localVal, setLocalVal] = useState<string>(String(value));

  useEffect(() => {
    if (!isFocused) {
      setLocalVal(String(value));
    }
  }, [value, isFocused]);

  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - step) * 1000) / 1000);
    onChange(next);
    setLocalVal(String(next));
  };

  const handleIncrement = () => {
    const next = Math.min(max, Math.round((value + step) * 1000) / 1000);
    onChange(next);
    setLocalVal(String(next));
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(localVal);
    if (isNaN(parsed)) {
      setLocalVal(String(value));
    } else {
      const clamped = Math.min(max, Math.max(min, Math.round(parsed * 1000) / 1000));
      onChange(clamped);
      setLocalVal(String(clamped));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    } else if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.85)',
        border: `1.5px solid ${isFocused ? accentColor : 'rgba(255, 255, 255, 0.14)'}`,
        boxShadow: isFocused ? `0 0 16px ${accentColor}40` : 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
        borderRadius: 10,
        padding: '3px 4px',
        transition: 'all 0.2s ease',
        gap: 4,
      }}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        style={{
          width: 30,
          height: 30,
          borderRadius: 7,
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: value <= min ? 'var(--text-muted)' : '#FFFFFF',
          cursor: value <= min ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1,
          transition: 'all 0.15s ease',
        }}
        aria-label={`ลดค่า ${ariaLabel}`}
        title={`ลด (${step})`}
      >
        -
      </button>

      <input
        type="number"
        value={localVal}
        step={step}
        min={min}
        max={max}
        aria-label={ariaLabel}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          setLocalVal(e.target.value);
          const num = parseFloat(e.target.value);
          if (!isNaN(num)) {
            onChange(num);
          }
        }}
        style={{
          width: 64,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#FFFFFF',
          fontFamily: 'monospace, inherit',
          fontSize: 14,
          fontWeight: 800,
          textAlign: 'center',
          padding: '4px 2px',
        }}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        style={{
          width: 30,
          height: 30,
          borderRadius: 7,
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: value >= max ? 'var(--text-muted)' : '#FFFFFF',
          cursor: value >= max ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1,
          transition: 'all 0.15s ease',
        }}
        aria-label={`เพิ่มค่า ${ariaLabel}`}
        title={`เพิ่ม (${step})`}
      >
        +
      </button>

      <span
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}35`,
          color: accentColor,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.02em',
          userSelect: 'none',
          marginLeft: 2,
        }}
      >
        {unit}
      </span>
    </div>
  );
}

export default function StationNotificationModal({
  isOpen,
  onClose,
  station,
  onSaved,
}: StationNotificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState<NotificationSettings>({
    water_level_enabled: true,
    safety_offset: 0.3,
    rate_of_rise_enabled: true,
    rate_of_rise_threshold: 0.3,
    offline_timeout_enabled: true,
    offline_timeout_minutes: 30,
    battery_low_enabled: true,
    battery_low_threshold: 20,
    geofence_enabled: true,
    geofence_radius_meters: 100,
    is_custom: false,
  });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    setSaveSuccess(false);
    try {
      const data = await fetchNotificationSettings(station?.id);
      setSettings(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถโหลดข้อมูลการตั้งค่าแจ้งเตือนได้');
    } finally {
      setLoading(false);
    }
  }, [station?.id]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);
    try {
      const updated = await updateNotificationSettings(settings, station?.id);
      setSettings(updated);
      setSaveSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'บันทึกการตั้งค่าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToGlobal = async () => {
    if (!station) return;
    const ok = window.confirm('ต้องการคืนค่าการแจ้งเตือนของสถานีนี้กลับไปใช้ค่าเริ่มต้นส่วนกลางใช่หรือไม่?');
    if (!ok) return;

    setResetting(true);
    setErrorMsg(null);
    try {
      await resetStationNotificationSettings(station.id);
      await loadSettings();
      setSaveSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'รีเซ็ตการตั้งค่าไม่สำเร็จ');
    } finally {
      setResetting(false);
    }
  };

  const modalTitle = station
    ? `ตั้งค่าการแจ้งเตือน สถานี ${station.name}`
    : 'ตั้งค่าการแจ้งเตือนส่วนกลาง (Global Settings)';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="680px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 12 }}>
          <div>
            {station && settings.is_custom && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetToGlobal}
                disabled={resetting || saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
              >
                <RefreshCwIcon size={13} />
                <span>{resetting ? 'กำลังคืนค่า...' : 'คืนค่าเริ่มต้นส่วนกลาง'}</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              disabled={saving}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={saving || loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <BellIcon size={14} />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Scope Subtitle & Status Badge */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {station ? (
              <>
                รหัสสถานี <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{station.id}</strong> · จุดอ้างอิง{' '}
                <strong style={{ color: '#38BDF8' }}>{station.referencePointName || 'จุดอ้างอิง'}</strong>
              </>
            ) : (
              'การตั้งค่านี้เป็นค่าเริ่มต้นส่วนกลาง ซึ่งจะมีผลกับทุกสถานีที่ไม่ได้กำหนดค่าเฉพาะ'
            )}
          </div>

          {station && (
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 4,
                background: settings.is_custom ? 'rgba(6, 182, 212, 0.15)' : 'rgba(148, 163, 184, 0.12)',
                color: settings.is_custom ? 'var(--color-primary)' : 'var(--text-muted)',
                border: `1px solid ${settings.is_custom ? 'rgba(6, 182, 212, 0.3)' : 'rgba(148, 163, 184, 0.25)'}`,
                fontWeight: 600,
              }}
            >
              {settings.is_custom ? 'กำหนดค่าเฉพาะสถานี' : 'ใช้ค่าเริ่มต้นส่วนกลาง'}
            </span>
          )}
        </div>

        {/* Feedback alerts */}
        {saveSuccess && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <CheckCircleIcon size={16} />
            <span>บันทึกการตั้งค่าเกณฑ์การแจ้งเตือนเรียบร้อยแล้ว</span>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
            }}
          >
            <AlertTriangleIcon size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            กำลังโหลดข้อมูลการตั้งค่า...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Condition 1: Water Level Safety Threshold */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: settings.water_level_enabled ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: '#38BDF8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <DropletsIcon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      ระดับน้ำสูงเกินเกณฑ์ความปลอดภัย
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      แจ้งเตือนเมื่อระดับน้ำเข้าใกล้จุดวิกฤต หรือเมื่อถึงระยะเผื่อความปลอดภัย
                    </div>
                  </div>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={settings.water_level_enabled}
                    onChange={(e) => setSettings({ ...settings, water_level_enabled: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: settings.water_level_enabled ? 'var(--color-primary)' : 'rgba(148, 163, 184, 0.3)',
                      transition: '0.2s',
                      borderRadius: 24,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: 18, width: 18,
                        left: settings.water_level_enabled ? 23 : 3,
                        bottom: 3,
                        backgroundColor: '#fff',
                        transition: '0.2s',
                        borderRadius: '50%',
                      }}
                    />
                  </span>
                </label>
              </div>

              {settings.water_level_enabled && (
                <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      ระยะเผื่อความปลอดภัยก่อนถึงจุดวิกฤต (Safety Offset)
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      แจ้งเตือนล่วงหน้าเมื่อระดับน้ำเข้าใกล้ระยะเผื่อก่อนแตะระดับวิกฤต
                    </div>
                  </div>
                  <NumberStepperInput
                    value={settings.safety_offset}
                    onChange={(val) => setSettings({ ...settings, safety_offset: val })}
                    min={0.05}
                    max={3.0}
                    step={0.05}
                    unit="เมตร"
                    accentColor="#38BDF8"
                    ariaLabel="ระยะเผื่อความปลอดภัยก่อนถึงจุดวิกฤต"
                  />
                </div>
              )}
            </div>

            {/* Condition 2: Rate of Rise */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: settings.rate_of_rise_enabled ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <TrendingUpIcon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      ระดับน้ำเพิ่มขึ้นในอัตราที่สูงกว่าปกติ (Rate of Rise)
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      เตือนภัยล่วงหน้าเมื่อน้ำไหลบ่าฉับพลัน เกินอัตราปกติ
                    </div>
                  </div>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={settings.rate_of_rise_enabled}
                    onChange={(e) => setSettings({ ...settings, rate_of_rise_enabled: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: settings.rate_of_rise_enabled ? 'var(--color-primary)' : 'rgba(148, 163, 184, 0.3)',
                      transition: '0.2s',
                      borderRadius: 24,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: 18, width: 18,
                        left: settings.rate_of_rise_enabled ? 23 : 3,
                        bottom: 3,
                        backgroundColor: '#fff',
                        transition: '0.2s',
                        borderRadius: '50%',
                      }}
                    />
                  </span>
                </label>
              </div>

              {settings.rate_of_rise_enabled && (
                <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      เกณฑ์อัตราการเพิ่มขึ้นฉับพลัน
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      ระดับน้ำเพิ่มขึ้นรวดเร็วเกินกว่าเกณฑ์ที่กำหนดภายใน 1 ชั่วโมง
                    </div>
                  </div>
                  <NumberStepperInput
                    value={settings.rate_of_rise_threshold}
                    onChange={(val) => setSettings({ ...settings, rate_of_rise_threshold: val })}
                    min={0.1}
                    max={5.0}
                    step={0.05}
                    unit="ม./ชม."
                    accentColor="#F59E0B"
                    ariaLabel="เกณฑ์อัตราการเพิ่มขึ้นฉับพลัน"
                  />
                </div>
              )}
            </div>

            {/* Condition 3: Offline Timeout */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: settings.offline_timeout_enabled ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(148, 163, 184, 0.12)',
                      color: '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ClockIcon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      ขาดการส่งข้อมูลเข้าสู่ระบบ (Offline Timeout)
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      แจ้งเตือนเมื่ออุปกรณ์หยุดส่งข้อมูลนานเกินกำหนด
                    </div>
                  </div>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={settings.offline_timeout_enabled}
                    onChange={(e) => setSettings({ ...settings, offline_timeout_enabled: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: settings.offline_timeout_enabled ? 'var(--color-primary)' : 'rgba(148, 163, 184, 0.3)',
                      transition: '0.2s',
                      borderRadius: 24,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: 18, width: 18,
                        left: settings.offline_timeout_enabled ? 23 : 3,
                        bottom: 3,
                        backgroundColor: '#fff',
                        transition: '0.2s',
                        borderRadius: '50%',
                      }}
                    />
                  </span>
                </label>
              </div>

              {settings.offline_timeout_enabled && (
                <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      ระยะเวลาขาดการส่งข้อมูลที่ยอมรับได้
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      ส่งสัญญาณเตือนเมื่อไม่มีข้อมูลเทเลเมทรีติดต่อกันเกินเวลาที่กำหนด
                    </div>
                  </div>
                  <NumberStepperInput
                    value={settings.offline_timeout_minutes}
                    onChange={(val) => setSettings({ ...settings, offline_timeout_minutes: val })}
                    min={5}
                    max={1440}
                    step={5}
                    unit="นาที"
                    accentColor="#94A3B8"
                    ariaLabel="ระยะเวลาขาดการส่งข้อมูลที่ยอมรับได้"
                  />
                </div>
              )}
            </div>

            {/* Condition 4: Battery Low */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: settings.battery_low_enabled ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ZapIcon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      แบตเตอรี่ของอุปกรณ์อยู่ในระดับต่ำ (Battery Low)
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      แจ้งเตือนเมื่อพลังงานในแบตเตอรี่ลดลงต่ำกว่าเกณฑ์
                    </div>
                  </div>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={settings.battery_low_enabled}
                    onChange={(e) => setSettings({ ...settings, battery_low_enabled: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: settings.battery_low_enabled ? 'var(--color-primary)' : 'rgba(148, 163, 184, 0.3)',
                      transition: '0.2s',
                      borderRadius: 24,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: 18, width: 18,
                        left: settings.battery_low_enabled ? 23 : 3,
                        bottom: 3,
                        backgroundColor: '#fff',
                        transition: '0.2s',
                        borderRadius: '50%',
                      }}
                    />
                  </span>
                </label>
              </div>

              {settings.battery_low_enabled && (
                <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      ระดับแบตเตอรี่ที่เริ่มแจ้งเตือน
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      แจ้งเตือนเพื่อเตรียมเปลี่ยนแบตเตอรี่หรือตรวจสอบแผงโซลาร์เซลล์
                    </div>
                  </div>
                  <NumberStepperInput
                    value={settings.battery_low_threshold}
                    onChange={(val) => setSettings({ ...settings, battery_low_threshold: val })}
                    min={5}
                    max={80}
                    step={5}
                    unit="%"
                    accentColor="#EF4444"
                    ariaLabel="ระดับแบตเตอรี่ที่เริ่มแจ้งเตือน"
                  />
                </div>
              )}
            </div>

            {/* Condition 5: Geofence Drift */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: settings.geofence_enabled ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(168, 85, 247, 0.12)',
                      color: '#A855F7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPinIcon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      อุปกรณ์เคลื่อนออกนอกขอบเขตพื้นที่ที่กำหนด (Geofence)
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      แจ้งเตือนเมื่ออุปกรณ์ถูกเคลื่อนย้าย หรือเสาหลุดจากจุดติดตั้ง
                    </div>
                  </div>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={settings.geofence_enabled}
                    onChange={(e) => setSettings({ ...settings, geofence_enabled: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: settings.geofence_enabled ? 'var(--color-primary)' : 'rgba(148, 163, 184, 0.3)',
                      transition: '0.2s',
                      borderRadius: 24,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: 18, width: 18,
                        left: settings.geofence_enabled ? 23 : 3,
                        bottom: 3,
                        backgroundColor: '#fff',
                        transition: '0.2s',
                        borderRadius: '50%',
                      }}
                    />
                  </span>
                </label>
              </div>

              {settings.geofence_enabled && (
                <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      รัศมีขอบเขตพิกัดที่อนุญาต (Geofence Radius)
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      ตรวจจับการเคลื่อนย้ายหรือการขยับของสถานีออกจากจุดติดตั้ง
                    </div>
                  </div>
                  <NumberStepperInput
                    value={settings.geofence_radius_meters}
                    onChange={(val) => setSettings({ ...settings, geofence_radius_meters: val })}
                    min={20}
                    max={2000}
                    step={10}
                    unit="เมตร"
                    accentColor="#A855F7"
                    ariaLabel="รัศมีขอบเขตพิกัดที่อนุญาต"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
