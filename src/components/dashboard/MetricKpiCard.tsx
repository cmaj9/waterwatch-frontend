import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from '../ui/Icons';

export interface MetricKpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  badgeText: string;
  badgeType?: 'normal' | 'advisory' | 'critical' | 'info';
  deltaText?: string;
  deltaType?: 'increase' | 'decrease' | 'neutral';
  helperText?: string;
  icon?: React.ReactNode;
  sparklineData?: number[];
  accentColor?: string;
}

export default function MetricKpiCard({
  title,
  value,
  unit,
  badgeText,
  badgeType = 'normal',
  deltaText,
  deltaType = 'neutral',
  helperText,
  icon,
  sparklineData = [12, 14, 13, 15, 17, 16, 18, 19, 17, 18],
  accentColor = '#06B6D4',
}: MetricKpiCardProps) {
  // Badge color configurations
  const badgeConfig = {
    normal: {
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    advisory: {
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.25)',
    },
    critical: {
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.25)',
    },
    info: {
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.25)',
    },
  }[badgeType];

  // Generate lightweight SVG sparkline (Edward Tufte data-ink maximization)
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div
      className="bento-card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '148px',
      }}
    >
      {/* Header: Label + Context Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {icon && (
            <div
              style={{
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </div>
          )}
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {title}
          </span>
        </div>

        {/* Qualitative Context Badge (Dual-Coding) */}
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: badgeConfig.color,
            background: badgeConfig.bg,
            border: `1px solid ${badgeConfig.border}`,
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
            whiteSpace: 'nowrap',
          }}
        >
          {badgeText}
        </span>
      </div>

      {/* Primary Value & Sparkline Tier */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          margin: '0.75rem 0 0.5rem 0',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
          <span
            style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {unit}
            </span>
          )}
        </div>

        {/* Micro Sparkline */}
        <div style={{ width: width, height: height, display: 'flex', alignItems: 'center' }}>
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ overflow: 'visible' }}
            aria-hidden="true"
          >
            <polyline
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Footer: Delta Trend & Helper Context */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          paddingTop: '0.5rem',
        }}
      >
        {deltaText ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color:
                deltaType === 'decrease'
                  ? '#10B981'
                  : deltaType === 'increase'
                  ? '#EF4444'
                  : 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            {deltaType === 'decrease' ? (
              <TrendingDownIcon size={14} />
            ) : deltaType === 'increase' ? (
              <TrendingUpIcon size={14} />
            ) : null}
            <span>{deltaText}</span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>อัปเดตแบบเรียลไทม์</span>
        )}

        {helperText && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem' }}>
            {helperText}
          </span>
        )}
      </div>
    </div>
  );
}
