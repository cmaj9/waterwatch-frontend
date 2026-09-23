import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Station, Reading } from '../../types';
import { fetchReadingsByStation } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import {
  ActivityIcon,
  BatteryChargingIcon,
  BatteryLowIcon,
  ThermometerIcon,
  ArrowRightIcon,
  ClockIcon,
} from '../ui/Icons';

interface StationRecentReadingsCardProps {
  station: Station;
}

export default function StationRecentReadingsCard({ station }: StationRecentReadingsCardProps) {
  const { user } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Fetch exactly 5 latest readings as requested
    fetchReadingsByStation(station.id, 5)
      .then((data) => {
        if (isMounted) setReadings(data || []);
      })
      .catch(() => {
        if (isMounted) setReadings([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [station.id]);

  const hasWarn = station.warningLevel !== undefined && station.warningLevel !== null;
  const hasCrit = station.criticalLevel !== undefined && station.criticalLevel !== null;
  const warningLevel = hasWarn ? Number(station.warningLevel) : null;
  const criticalLevel = hasCrit ? Number(station.criticalLevel) : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#111827',
        borderRadius: '1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* ── Card Header ── */}
      <div
        style={{
          padding: '0.875rem 1.25rem',
          background: '#111827',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ color: 'var(--cyan-glow)', display: 'flex', alignItems: 'center' }}>
            <ActivityIcon size={18} />
          </div>
          <h2
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: '#F8FAFC',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            ประวัติการตรวจวัดล่าสุด
          </h2>
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--cyan-glow)',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '0.15rem 0.55rem',
              borderRadius: '9999px',
              fontWeight: 700,
            }}
          >
            5 รายการล่าสุด
          </span>
        </div>

        {user?.role === 'admin' ? (
          <Link
            to="/history"
            style={{
              fontSize: '0.75rem',
              color: 'var(--cyan-glow)',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              transition: 'all 0.2s ease',
            }}
            title="ดูประวัติการตรวจวัดทั้งหมดในระบบ"
          >
            <span>ดูประวัติทั้งหมด</span>
            <ArrowRightIcon size={12} />
          </Link>
        ) : (
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
            ส่งสัญญาณทุก 5 นาที
          </span>
        )}
      </div>

      {/* ── Table Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="skeleton-box"
                style={{ height: '44px', width: '100%', borderRadius: '0.5rem' }}
              />
            ))}
          </div>
        ) : readings.length > 0 ? (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8125rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  fontSize: '0.75rem',
                }}
              >
                <th style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <ClockIcon size={12} /> เวลาบันทึก
                  </span>
                </th>
                <th style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>
                  ระดับน้ำ ({station.referencePointName || 'จุดอ้างอิง'})
                </th>
                <th style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>สถานะ</th>
                <th style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>แบตเตอรี่</th>
                <th style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>อุณหภูมิ</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r, idx) => {
                const lvl = r.water_level !== null ? Number(r.water_level) : null;
                const isCrit = lvl !== null && hasCrit && lvl >= criticalLevel!;
                const isWarn = lvl !== null && !isCrit && hasWarn && lvl >= warningLevel!;

                const statusBg = isCrit
                  ? 'rgba(239, 68, 68, 0.15)'
                  : isWarn
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(16, 185, 129, 0.15)';
                const statusBorder = isCrit
                  ? 'rgba(239, 68, 68, 0.35)'
                  : isWarn
                  ? 'rgba(245, 158, 11, 0.35)'
                  : 'rgba(16, 185, 129, 0.35)';
                const statusColor = isCrit ? '#EF4444' : isWarn ? '#F59E0B' : '#10B981';
                const statusText = isCrit ? 'วิกฤต' : isWarn ? 'เฝ้าระวัง' : 'ปกติ';

                const batt = r.battery_percent !== null ? Number(r.battery_percent) : null;
                const battColor =
                  batt === null ? 'var(--text-secondary)' : batt > 50 ? '#10B981' : batt > 20 ? '#F59E0B' : '#EF4444';

                return (
                  <tr
                    key={r.reading_id || idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Time */}
                    <td
                      style={{
                        padding: '0.65rem 1rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                      }}
                    >
                      {new Date(r.timestamp).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Water Level */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          color: 'var(--cyan-glow)',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                        }}
                      >
                        {lvl !== null ? (lvl > 0 ? '+' : '') + lvl.toFixed(2) : '-'}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginLeft: 3 }}>
                        ม.
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '9999px',
                          background: statusBg,
                          border: `1px solid ${statusBorder}`,
                          color: statusColor,
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: statusColor,
                          }}
                        />
                        {statusText}
                      </span>
                    </td>

                    {/* Battery */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: battColor,
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                        }}
                      >
                        {batt !== null && batt <= 20 ? (
                          <BatteryLowIcon size={12} />
                        ) : (
                          <BatteryChargingIcon size={12} />
                        )}
                        <span>{batt !== null ? `${batt}%` : '-'}</span>
                      </span>
                    </td>

                    {/* Temperature */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: '#E2E8F0',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                        }}
                      >
                        <ThermometerIcon size={11} style={{ color: '#F59E0B' }} />
                        <span>{r.temperature !== null ? `${Number(r.temperature).toFixed(1)}°C` : '-'}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div
            style={{
              padding: '2.5rem 1.25rem',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              margin: 'auto 0',
            }}
          >
            <ActivityIcon size={24} style={{ color: 'var(--text-muted)' }} />
            <span>ยังไม่มีประวัติการส่งสัญญาณล่าสุด</span>
          </div>
        )}
      </div>

      {/* ── Card Footer ── */}
      <div
        style={{
          marginTop: 'auto',
          padding: '0.5rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.6875rem',
          color: 'var(--text-secondary)',
          flexShrink: 0,
        }}
      >
        <span>
          สถานี <strong style={{ color: '#FFFFFF' }}>{station.name}</strong> ({station.id})
        </span>
        <span>
          เกณฑ์เฝ้าระวัง{' '}
          <strong style={{ color: '#F59E0B' }}>
            {hasWarn ? `${warningLevel! >= 0 ? '+' : ''}${warningLevel!.toFixed(2)}ม.` : 'ไม่กำหนด'}
          </strong>{' '}
          · วิกฤต{' '}
          <strong style={{ color: '#EF4444' }}>
            {hasCrit ? `${criticalLevel! >= 0 ? '+' : ''}${criticalLevel!.toFixed(2)}ม.` : 'ไม่กำหนด'}
          </strong>
        </span>
      </div>
    </div>
  );
}
