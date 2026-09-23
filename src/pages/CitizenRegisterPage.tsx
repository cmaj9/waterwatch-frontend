import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchStations, registerCitizenApi } from '../services/apiService';
import { getLiffProfile, closeLiffWindow, isInLineClient } from '../services/liffService';
import type { StationWithReading } from '../types';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  MapPinIcon,
  MapIcon,
} from '../components/ui/Icons';

export default function CitizenRegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const urlUid = searchParams.get('uid') || '';
  const [lineUserId, setLineUserId] = useState<string>(urlUid);
  const [displayName, setDisplayName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>('');
  const [district, setDistrict] = useState<string>('อำเภอเมืองเชียงใหม่');

  const [stations, setStations] = useState<StationWithReading[]>([]);
  const [selectedStationIds, setSelectedStationIds] = useState<string[]>([]);
  const [allStationsSelected, setAllStationsSelected] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inLine, setInLine] = useState<boolean>(false);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setInLine(isInLineClient());

      // 1. Try to fetch profile from LIFF if inside LINE
      try {
        const liffProfile = await getLiffProfile();
        if (liffProfile) {
          if (liffProfile.userId) setLineUserId(liffProfile.userId);
          if (liffProfile.displayName) setDisplayName(liffProfile.displayName);
          if (liffProfile.pictureUrl) setAvatarUrl(liffProfile.pictureUrl);
        }
      } catch (err) {
        console.warn('LIFF Profile fetch warning:', err);
      }

      // 2. Fetch active stations
      try {
        const stList = await fetchStations();
        setStations(stList);
        const activeIds = stList.filter((s) => s.status === 'active').map((s) => s.station_id);
        setSelectedStationIds(activeIds);
      } catch (err: any) {
        console.error('Fetch stations error:', err);
        setErrorMessage('ไม่สามารถโหลดข้อมูลสถานีได้ในขณะนี้');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [urlUid]);

  const handleToggleStation = (stationId: string) => {
    setAllStationsSelected(false);
    setSelectedStationIds((prev) =>
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId]
    );
  };

  const handleSelectAll = (select: boolean) => {
    setAllStationsSelected(select);
    if (select) {
      const activeIds = stations.filter((s) => s.status === 'active').map((s) => s.station_id);
      setSelectedStationIds(activeIds);
    } else {
      setSelectedStationIds([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineUserId.trim()) {
      setErrorMessage('ไม่พบรหัสผู้ใช้ LINE (LINE User ID) กรุณาเปิดผ่านลิงก์ในห้องแชท LINE OA');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const registeredUser = await registerCitizenApi({
        lineUserId: lineUserId.trim(),
        displayName: displayName.trim() || undefined,
        phone: phone.trim() || undefined,
        district: district.trim() || undefined,
        stationIds: selectedStationIds,
      });

      // Update Auth context so the citizen is signed in immediately
      localStorage.setItem('wl_auth_user', JSON.stringify(registeredUser));
      updateProfile(registeredUser);

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'บันทึกข้อมูลการลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleClose = () => {
    if (inLine) {
      closeLiffWindow();
    } else {
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#080C14',
          color: '#F8FAFC',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid rgba(2, 132, 199, 0.2)',
            borderTopColor: '#0284C7',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div style={{ fontSize: 14, color: '#94A3B8' }}>กำลังเชื่อมต่อข้อมูล LINE...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #0f1f3d 0%, #080C14 70%)',
        color: '#F8FAFC',
        padding: '24px 16px 80px',
      }}
    >
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38BDF8',
              marginBottom: 14,
            }}
          >
            <ShieldCheckIcon size={26} />
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#38BDF8',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Citizen Onboarding
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0',
              color: '#FFFFFF',
            }}
          >
            ลงทะเบียนรับการแจ้งเตือนประชาชน
          </h1>
          <p
            style={{
              fontSize: 13,
              color: '#94A3B8',
              margin: 0,
              lineHeight: 1.5,
              maxWidth: 440,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            กรอกข้อมูลสั้นๆ เพื่อเปิดใช้งานสิทธิ์การดู Web Dashboard และรับการแจ้งเตือนระดับน้ำวิกฤตเฉพาะพื้นที่
          </p>
        </div>

        {/* Success Modal / Banner */}
        {success && (
          <div
            style={{
              marginBottom: 24,
              padding: '20px 22px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  flexShrink: 0,
                }}
              >
                <CheckCircleIcon size={22} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#10B981' }}>
                  ลงทะเบียนประชาชนสำเร็จเรียบร้อยแล้ว
                </div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>
                  บัญชีของท่านเชื่อมต่อระบบแล้ว พร้อมรับการแจ้งเตือนระดับน้ำวิกฤตผ่าน LINE ทันที
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGoToDashboard}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: 44,
                }}
              >
                <MapIcon size={16} />
                <span>เปิดดู Web Dashboard ทันที</span>
              </button>

              {inLine && (
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#94A3B8',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                >
                  ปิดหน้าต่างนี้
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div
            style={{
              marginBottom: 20,
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 12,
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
            }}
          >
            <AlertTriangleIcon size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            {/* Bento Card: User & LINE Profile Info */}
            <div
              style={{
                background: 'rgba(17, 24, 39, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: '20px 22px',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                  }}
                />
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
                  ข้อมูลผู้รับการแจ้งเตือน (ดึงจาก LINE อัตโนมัติ)
                </h2>
              </div>

              {/* Profile Avatar / Pill */}
              {avatarUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <img
                    src={avatarUrl}
                    alt="LINE Profile"
                    style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #0284C7' }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{displayName || 'ผู้ใช้ LINE'}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>ยืนยันตัวตนผ่าน LINE สำเร็จ</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="citizen-name"
                    style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#94A3B8' }}
                  >
                    ชื่อ-นามสกุล หรือชื่อเรียกที่ต้องการแสดง
                  </label>
                  <input
                    id="citizen-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 14,
                      borderRadius: 10,
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#F8FAFC',
                      minHeight: 44,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="citizen-phone"
                    style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#94A3B8' }}
                  >
                    เบอร์โทรศัพท์ (สำหรับประสานงานฉุกเฉิน)
                  </label>
                  <input
                    id="citizen-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 14,
                      borderRadius: 10,
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#F8FAFC',
                      minHeight: 44,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* District / Area */}
                <div>
                  <label
                    htmlFor="citizen-district"
                    style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#94A3B8' }}
                  >
                    พื้นที่ / อำเภอ / ตำบลที่พักอาศัย
                  </label>
                  <input
                    id="citizen-district"
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="เช่น ตำบลช้างคลาน อำเภอเมืองเชียงใหม่"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 14,
                      borderRadius: 10,
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#F8FAFC',
                      minHeight: 44,
                      boxSizing: 'border-box',
                    }}
                  />
                  <p style={{ fontSize: 11, color: '#64748B', marginTop: 4, margin: 0 }}>
                    ระบบจะใช้ข้อมูลนี้เพื่อแนะนำสถานีโทรมาตรที่ใกล้พื้นที่ของท่านเป็นพิเศษ
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Card: Station Subscription */}
            <div
              style={{
                background: 'rgba(17, 24, 39, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: '20px 22px',
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MapPinIcon size={18} style={{ color: '#38BDF8' }} />
                  <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>เลือกสถานีที่ต้องการรับแจ้งเตือน</h2>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectAll(!allStationsSelected)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38BDF8',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '4px 8px',
                  }}
                >
                  {allStationsSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stations.map((st) => {
                  const isSelected = selectedStationIds.includes(st.station_id);
                  return (
                    <div
                      key={st.station_id}
                      onClick={() => handleToggleStation(st.station_id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                        border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: isSelected ? '#FFFFFF' : '#94A3B8' }}>
                          {st.station_name}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                          รหัส {st.station_id} · {st.location_name || 'จุดตรวจวัดระดับน้ำ'}
                        </div>
                      </div>

                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          border: isSelected ? '2px solid #0284C7' : '2px solid #64748B',
                          background: isSelected ? '#0284C7' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                        }}
                      >
                        {isSelected && <span style={{ fontSize: 12, fontWeight: 800 }}>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                background: isSubmitting ? '#64748B' : 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                color: '#FFFFFF',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isSubmitting ? (
                <span>กำลังบันทึกข้อมูล...</span>
              ) : (
                <>
                  <ShieldCheckIcon size={18} />
                  <span>ยืนยันการลงทะเบียน & เปิดดู Dashboard</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
