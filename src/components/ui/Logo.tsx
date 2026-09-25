interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showIcon?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showSubtitle = true, showIcon = true, className = '' }: LogoProps) {
  const dimensions = {
    sm: { font: 16, sub: 10.5, icon: 22, gap: 8 },
    md: { font: 20, sub: 11.5, icon: 28, gap: 10 },
    lg: { font: 26, sub: 13, icon: 36, gap: 12 },
    xl: { font: 34, sub: 14.5, icon: 46, gap: 14 },
  }[size];

  return (
    <div className={`logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: dimensions.gap }}>
      {showIcon && (
        <div
          style={{
            width: dimensions.icon,
            height: dimensions.icon,
            borderRadius: '24%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(14, 165, 233, 0.35)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #0b1528 0%, #030712 100%)',
          }}
        >
          <img
            src="/logo.png"
            alt="FloodGuard Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: dimensions.font,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 45%, #818CF8 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}
        >
          FloodGuard
        </div>
        {showSubtitle && (
          <div style={{ fontSize: dimensions.sub, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500, letterSpacing: '0.01em' }}>
            ระบบเตือนภัยระดับน้ำอัจฉริยะ
          </div>
        )}
      </div>
    </div>
  );
}
