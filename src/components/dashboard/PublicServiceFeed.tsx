import { useState } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  InfoIcon,
  ClockIcon,
  MapPinIcon,
} from '../ui/Icons';
import type { DbAlert } from '../../types';

interface PublicFeedItem {
  id: string;
  type: 'normal' | 'advisory' | 'critical' | 'info';
  title: string;
  location: string;
  message: string;
  timeAgo: string;
  timestamp: string;
}

interface PublicServiceFeedProps {
  alerts?: DbAlert[];
  isLoading?: boolean;
}

// Generate realistic public service announcements if backend alerts list is empty
const defaultBulletins: PublicFeedItem[] = [
  {
    id: 'b-1',
    type: 'normal',
    title: 'ระดับน้ำทรงตัวในเกณฑ์ปลอดภัย',
    location: 'สถานีสะพานสมเด็จพระปิ่นเกล้า',
    message: 'ปริมาณน้ำไหลผ่านคงที่ 1,180 ลบ.ม./วินาที ไม่กระทบพื้นที่ชุมชนริมแม่น้ำเจ้าพระยา',
    timeAgo: '12 นาทีที่แล้ว',
    timestamp: '15:45 น.',
  },
  {
    id: 'b-2',
    type: 'advisory',
    title: 'แจ้งเตือนเฝ้าระวังระดับน้ำทะเลหนุน',
    location: 'สถานีปากน้ำ สมุทรปราการ',
    message: 'คาดการณ์น้ำขึ้นเต็มที่เวลา 18:30 น. สูงกว่าระดับน้ำทะเลปานกลาง 1.45 ม. ขอให้ประชาชนยกของขึ้นที่สูง',
    timeAgo: '45 นาทีที่แล้ว',
    timestamp: '15:12 น.',
  },
  {
    id: 'b-3',
    type: 'info',
    title: 'รายงานการปรับการระบายน้ำเขื่อนเจ้าพระยา',
    location: 'เขื่อนเจ้าพระยา ชัยนาท',
    message: 'ปรับลดอัตราการระบายเหลือ 950 ลบ.ม./วินาที เพื่อรักษาระดับน้ำเหนือเขื่อนให้อยู่ในเกณฑ์บริหารจัดการ',
    timeAgo: '2 ชั่วโมงที่แล้ว',
    timestamp: '13:58 น.',
  },
  {
    id: 'b-4',
    type: 'normal',
    title: 'การซ่อมบำรุงเซนเซอร์เสร็จสมบูรณ์',
    location: 'สถานีคลองรังสิตประยูรศักดิ์',
    message: 'ระบบส่งสัญญาณเทเลเมตรีกลับมาออนไลน์และอ่านค่าระดับน้ำได้เต็มประสิทธิภาพ 100%',
    timeAgo: '3 ชั่วโมงที่แล้ว',
    timestamp: '12:30 น.',
  },
];

export default function PublicServiceFeed({ alerts, isLoading }: PublicServiceFeedProps) {
  const [filter, setFilter] = useState<'all' | 'advisory' | 'normal'>('all');

  // Convert real DbAlert to feed items if available
  const items: PublicFeedItem[] = alerts && alerts.length > 0
    ? alerts.map((a) => {
        const isCrit = a.alert_type === 'water_level' && (a.value ?? 0) >= (a.threshold ?? 7);
        const type: PublicFeedItem['type'] = isCrit ? 'critical' : a.status === 'active' ? 'advisory' : 'normal';
        return {
          id: a.alert_id,
          type,
          title: isCrit ? 'แจ้งเตือนระดับน้ำวิกฤต' : 'ประกาศแจ้งเตือนสถานการณ์น้ำ',
          location: a.location_name || a.station_name || 'จุดตรวจวัดลุ่มน้ำ',
          message: a.message,
          timeAgo: 'เมื่อสักครู่',
          timestamp: new Date(a.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        };
      })
    : defaultBulletins;

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'advisory') return item.type === 'advisory' || item.type === 'critical';
    if (filter === 'normal') return item.type === 'normal' || item.type === 'info';
    return true;
  });

  const getBadge = (type: PublicFeedItem['type']) => {
    switch (type) {
      case 'critical':
        return {
          icon: <XCircleIcon size={14} />,
          color: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.25)',
          label: 'วิกฤต',
        };
      case 'advisory':
        return {
          icon: <AlertTriangleIcon size={14} />,
          color: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.25)',
          label: 'เฝ้าระวัง',
        };
      case 'normal':
        return {
          icon: <CheckCircleIcon size={14} />,
          color: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.25)',
          label: 'ปลอดภัย',
        };
      case 'info':
      default:
        return {
          icon: <InfoIcon size={14} />,
          color: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.25)',
          label: 'ข้อมูลทั่วไป',
        };
    }
  };

  return (
    <div className="bento-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="bento-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ color: 'var(--cyan-glow)', display: 'flex', alignItems: 'center' }}>
            <BellIcon size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              กระดานข่าวสารและประกาศเตือนภัย
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.125rem 0 0 0' }}>
              Public Service Announcement Feed
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '2px',
            borderRadius: '0.5rem',
            border: '1px solid var(--card-border)',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '0.2rem 0.5rem',
              borderRadius: '0.375rem',
              background: filter === 'all' ? 'var(--primary-accent)' : 'transparent',
              color: filter === 'all' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            onClick={() => setFilter('advisory')}
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '0.2rem 0.5rem',
              borderRadius: '0.375rem',
              background: filter === 'advisory' ? 'var(--primary-accent)' : 'transparent',
              color: filter === 'advisory' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            เฝ้าระวัง
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div
        className="bento-card-body"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxHeight: '440px',
        }}
      >
        {isLoading ? (
          <>
            <div className="skeleton-box" style={{ width: '100%', height: '70px', borderRadius: '0.75rem' }} />
            <div className="skeleton-box" style={{ width: '100%', height: '70px', borderRadius: '0.75rem' }} />
            <div className="skeleton-box" style={{ width: '100%', height: '70px', borderRadius: '0.75rem' }} />
          </>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <CheckCircleIcon size={32} style={{ color: 'var(--status-normal)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>ไม่มีประกาศในหมวดหมู่นี้</div>
            <div style={{ fontSize: '0.75rem' }}>ทุกสถานีทำงานปกติและไม่มีรายงานความเสี่ยง</div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const badge = getBadge(item.type);
            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  padding: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Title & Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: badge.color,
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        flexShrink: 0,
                      }}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    <ClockIcon size={12} />
                    <span>{item.timeAgo}</span>
                  </div>
                </div>

                {/* Message */}
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  {item.message}
                </p>

                {/* Footer / Location */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem',
                    paddingTop: '0.375rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPinIcon size={11} />
                    <span>{item.location}</span>
                  </span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
