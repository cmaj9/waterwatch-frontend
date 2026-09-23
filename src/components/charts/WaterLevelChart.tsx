import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import type { WaterLevelReading, Station, TimeRange } from '../../types';

interface WaterLevelChartProps {
  readings: WaterLevelReading[];
  station: Station;
  timeRange: TimeRange;
  height?: number;
}




function CustomTooltip({ active, payload, label, station, timeRange }: any) {
  if (!active || !payload?.length) return null;
  const pData = payload[0]?.payload;
  const val: number = payload[0]?.value ?? 0;
  const refName = station?.referencePointName || 'จุดอ้างอิง';
  const hasCrit = station?.criticalLevel !== null && station?.criticalLevel !== undefined;
  const hasWarn = station?.warningLevel !== null && station?.warningLevel !== undefined;

  let status = { label: 'ปกติ', color: '#06d6a0' };
  if (hasCrit && val >= station.criticalLevel) {
    status = { label: 'วิกฤต', color: '#ff5252' };
  } else if (hasWarn && val >= station.warningLevel) {
    status = { label: 'เฝ้าระวัง', color: '#ffab40' };
  } else if (val > 0) {
    status = { label: 'สูงกว่าจุดอ้างอิง', color: '#ff5252' };
  }

  const relDesc = val < 0
    ? `ต่ำกว่า${refName} ${Math.abs(val).toFixed(2)} ม.`
    : val === 0
    ? `เสมอ${refName} พอดี`
    : `สูงกว่า${refName} ${val.toFixed(2)} ม.`;

  const timeSubtext = timeRange === 'hourly'
    ? '(เฉลี่ยรายชั่วโมง)'
    : timeRange === 'daily'
    ? '(เฉลี่ยรายวัน)'
    : '(เฉลี่ยรายสัปดาห์)';

  return (
    <div
      style={{
        background: 'rgba(11,22,40,0.96)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>
        {pData?.fullTime || label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ color: val >= 0 ? '#ff5252' : '#38BDF8', fontWeight: 700, fontSize: 18 }}>
          {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>ม.</span>
        <span style={{ fontSize: 11, color: '#38BDF8', marginLeft: 4 }}>
          {timeSubtext}
        </span>
      </div>
      {pData?.minLevel !== undefined && pData?.maxLevel !== undefined && (
        <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3 }}>
          ต่ำสุด: {pData.minLevel >= 0 ? `+${pData.minLevel.toFixed(2)}` : pData.minLevel.toFixed(2)} ม. · 
          สูงสุด: {pData.maxLevel >= 0 ? `+${pData.maxLevel.toFixed(2)}` : pData.maxLevel.toFixed(2)} ม.
          {pData?.count ? ` · (${pData.count} ครั้ง)` : ''}
        </div>
      )}
      <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 4 }}>
        {relDesc}
      </div>
      <div style={{ color: status.color, fontWeight: 600, fontSize: 12, marginTop: 4 }}>
        ● {status.label}
      </div>
    </div>
  );
}

export default function WaterLevelChart({ readings, station, timeRange, height = 480 }: WaterLevelChartProps) {
  const refName = station?.referencePointName || 'จุดอ้างอิง';
  const hasWarning = station?.warningLevel !== null && station?.warningLevel !== undefined && !isNaN(Number(station.warningLevel));
  const hasCritical = station?.criticalLevel !== null && station?.criticalLevel !== undefined && !isNaN(Number(station.criticalLevel));

  const data = readings.map((r) => {
    let displayTime = '';
    let fullTime = '';
    try {
      const d = new Date(r.timestamp);
      if (!isNaN(d.getTime())) {
        if (timeRange === 'hourly') {
          displayTime = format(d, 'HH:mm');
          fullTime = `${format(d, 'dd/MM/yyyy HH:00')} น.`;
        } else if (timeRange === 'daily') {
          displayTime = format(d, 'dd MMM', { locale: th });
          fullTime = `วันที่ ${format(d, 'dd/MM/yyyy')}`;
        } else {
          displayTime = r.label || format(d, 'dd/MM');
          fullTime = r.label || `สัปดาห์ที่ ${format(d, 'w')} (${format(d, 'dd/MM/yyyy')})`;
        }
      } else {
        displayTime = r.label || String(r.timestamp);
        fullTime = r.label || String(r.timestamp);
      }
    } catch {
      displayTime = r.label || String(r.timestamp);
      fullTime = r.label || String(r.timestamp);
    }

    return {
      time: displayTime,
      level: r.level,
      fullTime,
      minLevel: r.minLevel,
      maxLevel: r.maxLevel,
      count: r.count,
    };
  });

  // Show every Nth label to avoid crowding
  const labelStep = data.length > 30 ? Math.floor(data.length / 12) : data.length > 15 ? 2 : 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="levelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.01} />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />

        <XAxis
          dataKey="time"
          tick={{ fill: '#3d6a88', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={labelStep - 1}
        />
        <YAxis
          tick={{ fill: '#3d6a88', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v >= 0 ? '+' : ''}${Number(v).toFixed(1)}ม.`}
          width={52}
          domain={['auto', 'auto']}
        />

        <Tooltip content={<CustomTooltip station={station} timeRange={timeRange} />} />


        {/* 0.00m Reference Point line */}
        <ReferenceLine
          y={0}
          stroke="#38BDF8"
          strokeDasharray="3 3"
          strokeWidth={1.5}
          label={{
            value: `${refName} (0.00ม.)`,
            position: 'insideTopRight',
            fill: '#38BDF8',
            fontSize: 11,
          }}
        />

        {/* Warning level reference line (if set) */}
        {hasWarning && station.warningLevel !== undefined && (
          <ReferenceLine
            y={station.warningLevel}
            stroke="#ffab40"
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{
              value: `เฝ้าระวัง (${station.warningLevel >= 0 ? '+' : ''}${station.warningLevel}ม.)`,
              position: 'insideTopRight',
              fill: '#ffab40',
              fontSize: 11,
            }}
          />
        )}

        {/* Critical level reference line (if set) */}
        {hasCritical && station.criticalLevel !== undefined && (
          <ReferenceLine
            y={station.criticalLevel}
            stroke="#ff5252"
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{
              value: `วิกฤต (${station.criticalLevel >= 0 ? '+' : ''}${station.criticalLevel}ม.)`,
              position: 'insideTopRight',
              fill: '#ff5252',
              fontSize: 11,
            }}
          />
        )}

        {/* Area fill */}
        <Area
          type="monotone"
          dataKey="level"
          fill="url(#levelGrad)"
          stroke="none"
        />

        {/* Main line */}
        <Line
          type="monotone"
          dataKey="level"
          stroke="url(#lineGrad)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#38BDF8', stroke: '#fff', strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
