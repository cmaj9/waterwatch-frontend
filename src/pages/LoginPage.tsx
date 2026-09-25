import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon, ShieldIcon, SettingsIcon, AlertTriangleIcon, KeyIcon } from '../components/ui/Icons';
import Logo from '../components/ui/Logo';
import { loginWithLiff } from '../services/liffService';

export default function LoginPage() {
  const { login, loginAsCitizen } = useAuth();
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

  const handleCitizenAccess = () => {
    loginAsCitizen();
    navigate('/dashboard', { replace: true });
  };

  const handleLineLogin = async () => {
    try {
      await loginWithLiff();
    } catch (err: any) {
      console.warn('LINE Login error:', err);
      handleCitizenAccess();
    }
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Logo size="xl" />
        </div>

        <div className="login-card">
          {/* Primary page heading for screen readers */}
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>เข้าสู่ระบบ</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            กรอกอีเมลและรหัสผ่านของคุณ
          </p>

          {/* Citizen & LINE Entry (Zero-friction access) */}
          <div style={{ marginBottom: 20 }}>
            <button
              type="button"
              id="citizen-direct-entry-btn"
              onClick={handleCitizenAccess}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 10,
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              <UserIcon size={18} />
              <span>เข้าชมระดับน้ำทันที (โหมดประชาชน)</span>
            </button>

            <button
              type="button"
              id="line-liff-login-btn"
              onClick={handleLineLogin}
              className="btn"
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: '#06C755',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span>เข้าสู่ระบบด้วย LINE (LIFF)</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              เข้าสู่ระบบสำหรับเจ้าหน้าที่
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Quick login demo buttons */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demo — บัญชีเจ้าหน้าที่ทดสอบ
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {([
                { type: 'staff', label: 'เจ้าหน้าที่ภาคสนาม', icon: <ShieldIcon size={14} />, cls: 'btn-secondary' },
                { type: 'admin', label: 'ผู้ดูแลระบบ (Admin)', icon: <SettingsIcon size={14} />, cls: 'btn-secondary' },
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
