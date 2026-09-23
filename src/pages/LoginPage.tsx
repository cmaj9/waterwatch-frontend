import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon, ShieldIcon, SettingsIcon, AlertTriangleIcon, KeyIcon } from '../components/ui/Icons';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const quickLogin = (type: 'citizen' | 'staff' | 'admin') => {
    const emails = {
      citizen: 'somchai@example.com',
      staff: 'wichai.staff@dwr.go.th',
      admin: 'admin@dwr.go.th',
    };
    setEmail(emails[type]);
    setPassword('demo1234');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setLoading(true);
    setError('');
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/dashboard', { replace: true });
    } else {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="login-bg">
      {/* Animated water lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 80px,
              rgba(0,212,255,0.02) 80px,
              rgba(0,212,255,0.02) 81px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 80px,
              rgba(0,212,255,0.02) 80px,
              rgba(0,212,255,0.02) 81px
            )
          `,
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 460, padding: '0 16px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Brand area — decorative, not the page's primary h1 */}
          <p
            style={{
              fontSize: 34,
              fontWeight: 800,
              marginBottom: 6,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 45%, #818CF8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            WaterWatch
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>ระบบติดตามระดับน้ำแบบเรียลไทม์</p>
        </div>

        <div className="login-card">
          {/* Primary page heading for screen readers */}
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>เข้าสู่ระบบ</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            กรอกอีเมลและรหัสผ่านของคุณ
          </p>

          {/* Quick login demo buttons */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demo — เลือกบทบาท
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {([
                { type: 'citizen', label: 'ประชาชน', icon: <UserIcon size={14} />, cls: 'btn-secondary' },
                { type: 'staff', label: 'เจ้าหน้าที่', icon: <ShieldIcon size={14} />, cls: 'btn-secondary' },
                { type: 'admin', label: 'ผู้ดูแล', icon: <SettingsIcon size={14} />, cls: 'btn-secondary' },
              ] as const).map((btn) => (
                <button
                  key={btn.type}
                  className={`btn btn-sm ${btn.cls}`}
                  onClick={() => quickLogin(btn.type)}
                  style={{ fontSize: 12, padding: '7px 8px', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  {btn.icon}
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="divider" style={{ margin: '16px 0' }} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="email">อีเมล</label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="password">รหัสผ่าน</label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--color-critical-dim)',
                  border: '1px solid rgba(255,82,82,0.25)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-critical)',
                  fontSize: 14,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertTriangleIcon size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                <>
                  <KeyIcon size={16} />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          © 2025 Water Level Monitoring System · กรมทรัพยากรน้ำ
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
