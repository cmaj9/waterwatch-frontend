import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from '../ui/NotificationPanel';
import type { AppNotification } from '../../types';
import { BellIcon } from '../ui/Icons';

const pageTitles: Record<string, string> = {
  '/dashboard': 'แดชบอร์ด',
  '/chart': 'กราฟระดับน้ำ',
  '/users': 'จัดการผู้ใช้',
  '/stations': 'จัดการสถานี',
  '/profile': 'โปรไฟล์',
};

interface TopBarProps {
  pathname: string;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function TopBar({ pathname, notifications, onMarkRead, onMarkAllRead }: TopBarProps) {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{pageTitles[pathname] ?? 'WaterWatch'}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
          {dateStr} · {timeStr}
        </div>
      </div>

      <div className="topbar-actions">
        {/* Notification button */}
        <div style={{ position: 'relative' }}>
          <button
            className="notif-btn"
            onClick={() => setShowNotif((v) => !v)}
            aria-label="การแจ้งเตือน"
          >
            <BellIcon size={18} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotif && (
            <NotificationPanel
              notifications={notifications}
              onMarkRead={(id) => { onMarkRead(id); }}
              onMarkAllRead={() => { onMarkAllRead(); }}
              onClose={() => setShowNotif(false)}
            />
          )}
        </div>

        {/* User info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div
            className="user-avatar"
            style={{ width: 28, height: 28, fontSize: 12 }}
          >
            {user?.name.slice(0, 1)}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}
