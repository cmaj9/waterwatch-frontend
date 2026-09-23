import Papa from 'papaparse';
import { format } from 'date-fns';
import type { WaterLevelReading, Station, TimeRange } from '../types';

export function exportWaterLevelCSV(
  readings: WaterLevelReading[],
  station: Station,
  timeRange: TimeRange
) {
  const rows = readings.map((r) => {
    let timeValue = String(r.timestamp);

    try {
      const d = new Date(r.timestamp);
      if (!isNaN(d.getTime())) {
        if (timeRange === 'hourly') {
          timeValue = format(d, 'dd/MM/yyyy HH:00');
        } else if (timeRange === 'daily') {
          timeValue = format(d, 'dd/MM/yyyy');
        } else {
          timeValue = r.label ? `${r.label} (สัปดาห์ที่ ${format(d, 'w')})` : format(d, 'dd/MM/yyyy');
        }
      }
    } catch {
      timeValue = r.label || String(r.timestamp);
    }

    const refName = station.referencePointName || 'จุดอ้างอิง';
    const sToRef = station.sensorToRefDistance;

    const val = r.level;
    const hasCrit = station.criticalLevel !== undefined && station.criticalLevel !== null;
    const hasWarn = station.warningLevel !== undefined && station.warningLevel !== null;

    let statusText = 'ปกติ';
    if (hasCrit && val >= station.criticalLevel!) {
      statusText = 'วิกฤต';
    } else if (hasWarn && val >= station.warningLevel!) {
      statusText = 'เฝ้าระวัง';
    }

    const blindZoneText = r.isBlindZone ? 'อยู่ในระยะจุดบอด (Blind Zone)' : 'ปกติ';

    if (timeRange === 'hourly') {
      return {
        'วันที่และเวลา (ชั่วโมง)': timeValue,
        'รหัสสถานี': station.id,
        'ชื่อสถานี': station.name,
        'ตำแหน่ง/สถานที่': station.location || station.province || '-',
        'จุดอ้างอิง': refName,
        'ระยะเซนเซอร์ถึงจุดอ้างอิง (ม.)': sToRef !== undefined ? Number(sToRef).toFixed(2) : '-',
        'ระดับน้ำเฉลี่ย (ม.)': (val > 0 ? '+' : '') + val.toFixed(2),
        'ระดับน้ำต่ำสุด (ม.)': r.minLevel !== undefined ? (r.minLevel > 0 ? '+' : '') + r.minLevel.toFixed(2) : '-',
        'ระดับน้ำสูงสุด (ม.)': r.maxLevel !== undefined ? (r.maxLevel > 0 ? '+' : '') + r.maxLevel.toFixed(2) : '-',
        'ระยะห่างเซนเซอร์ถึงผิวน้ำเฉลี่ย (ม.)': r.rawDistance != null ? Number(r.rawDistance).toFixed(2) : '-',
        'สถานะจุดบอดเซนเซอร์': blindZoneText,
        'อุณหภูมิเฉลี่ย (°C)': r.temperature != null ? Number(r.temperature).toFixed(1) : '-',
        'ความชื้นสัมพัทธ์เฉลี่ย (%)': r.humidity != null ? Number(r.humidity).toFixed(1) : '-',
        'แรงดันแบตเตอรี่เฉลี่ย (V)': r.batteryVoltage != null ? Number(r.batteryVoltage).toFixed(2) : '-',
        'ระดับแบตเตอรี่เฉลี่ย (%)': r.batteryPercent != null ? Number(r.batteryPercent).toFixed(0) : '-',
        'ความแรงสัญญาณ LoRa RSSI เฉลี่ย (dBm)': r.rssi != null ? Number(r.rssi).toFixed(0) : '-',
        'อัตราสัญญาณต่อสัญญาณรบกวน SNR เฉลี่ย (dB)': r.snr != null ? Number(r.snr).toFixed(1) : '-',
        'มุมเอียงแกน X เฉลี่ย (องศา)': r.tiltX != null ? Number(r.tiltX).toFixed(2) : '-',
        'มุมเอียงแกน Y เฉลี่ย (องศา)': r.tiltY != null ? Number(r.tiltY).toFixed(2) : '-',
        'ละติจูด': station.lat != null ? Number(station.lat).toFixed(6) : '-',
        'ลองจิจูด': station.lng != null ? Number(station.lng).toFixed(6) : '-',
        'จำนวนครั้งที่ตรวจวัดในชั่วโมง': r.count ?? 1,
        'สถานะระดับน้ำ': statusText,
      };
    } else if (timeRange === 'daily') {
      return {
        'วันที่': timeValue,
        'รหัสสถานี': station.id,
        'ชื่อสถานี': station.name,
        'ตำแหน่ง/สถานที่': station.location || station.province || '-',
        'จุดอ้างอิง': refName,
        'ระยะเซนเซอร์ถึงจุดอ้างอิง (ม.)': sToRef !== undefined ? Number(sToRef).toFixed(2) : '-',
        'ระดับน้ำเฉลี่ยรายวัน (ม.)': (val > 0 ? '+' : '') + val.toFixed(2),
        'ระดับน้ำต่ำสุด (ม.)': r.minLevel !== undefined ? (r.minLevel > 0 ? '+' : '') + r.minLevel.toFixed(2) : '-',
        'ระดับน้ำสูงสุด (ม.)': r.maxLevel !== undefined ? (r.maxLevel > 0 ? '+' : '') + r.maxLevel.toFixed(2) : '-',
        'ระยะห่างเซนเซอร์ถึงผิวน้ำเฉลี่ย (ม.)': r.rawDistance != null ? Number(r.rawDistance).toFixed(2) : '-',
        'สถานะจุดบอดเซนเซอร์': blindZoneText,
        'อุณหภูมิเฉลี่ย (°C)': r.temperature != null ? Number(r.temperature).toFixed(1) : '-',
        'ความชื้นสัมพัทธ์เฉลี่ย (%)': r.humidity != null ? Number(r.humidity).toFixed(1) : '-',
        'แรงดันแบตเตอรี่เฉลี่ย (V)': r.batteryVoltage != null ? Number(r.batteryVoltage).toFixed(2) : '-',
        'ระดับแบตเตอรี่เฉลี่ย (%)': r.batteryPercent != null ? Number(r.batteryPercent).toFixed(0) : '-',
        'ความแรงสัญญาณ LoRa RSSI เฉลี่ย (dBm)': r.rssi != null ? Number(r.rssi).toFixed(0) : '-',
        'อัตราสัญญาณต่อสัญญาณรบกวน SNR เฉลี่ย (dB)': r.snr != null ? Number(r.snr).toFixed(1) : '-',
        'มุมเอียงแกน X เฉลี่ย (องศา)': r.tiltX != null ? Number(r.tiltX).toFixed(2) : '-',
        'มุมเอียงแกน Y เฉลี่ย (องศา)': r.tiltY != null ? Number(r.tiltY).toFixed(2) : '-',
        'ละติจูด': station.lat != null ? Number(station.lat).toFixed(6) : '-',
        'ลองจิจูด': station.lng != null ? Number(station.lng).toFixed(6) : '-',
        'จำนวนครั้งที่ตรวจวัดในวัน': r.count ?? 1,
        'สถานะระดับน้ำ': statusText,
      };
    } else {
      // weekly
      return {
        'สัปดาห์และช่วงวันที่': timeValue,
        'รหัสสถานี': station.id,
        'ชื่อสถานี': station.name,
        'ตำแหน่ง/สถานที่': station.location || station.province || '-',
        'จุดอ้างอิง': refName,
        'ระยะเซนเซอร์ถึงจุดอ้างอิง (ม.)': sToRef !== undefined ? Number(sToRef).toFixed(2) : '-',
        'ระดับน้ำเฉลี่ยรายสัปดาห์ (ม.)': (val > 0 ? '+' : '') + val.toFixed(2),
        'ระดับน้ำต่ำสุด (ม.)': r.minLevel !== undefined ? (r.minLevel > 0 ? '+' : '') + r.minLevel.toFixed(2) : '-',
        'ระดับน้ำสูงสุด (ม.)': r.maxLevel !== undefined ? (r.maxLevel > 0 ? '+' : '') + r.maxLevel.toFixed(2) : '-',
        'ระยะห่างเซนเซอร์ถึงผิวน้ำเฉลี่ย (ม.)': r.rawDistance != null ? Number(r.rawDistance).toFixed(2) : '-',
        'สถานะจุดบอดเซนเซอร์': blindZoneText,
        'อุณหภูมิเฉลี่ย (°C)': r.temperature != null ? Number(r.temperature).toFixed(1) : '-',
        'ความชื้นสัมพัทธ์เฉลี่ย (%)': r.humidity != null ? Number(r.humidity).toFixed(1) : '-',
        'แรงดันแบตเตอรี่เฉลี่ย (V)': r.batteryVoltage != null ? Number(r.batteryVoltage).toFixed(2) : '-',
        'ระดับแบตเตอรี่เฉลี่ย (%)': r.batteryPercent != null ? Number(r.batteryPercent).toFixed(0) : '-',
        'ความแรงสัญญาณ LoRa RSSI เฉลี่ย (dBm)': r.rssi != null ? Number(r.rssi).toFixed(0) : '-',
        'อัตราสัญญาณต่อสัญญาณรบกวน SNR เฉลี่ย (dB)': r.snr != null ? Number(r.snr).toFixed(1) : '-',
        'มุมเอียงแกน X เฉลี่ย (องศา)': r.tiltX != null ? Number(r.tiltX).toFixed(2) : '-',
        'มุมเอียงแกน Y เฉลี่ย (องศา)': r.tiltY != null ? Number(r.tiltY).toFixed(2) : '-',
        'ละติจูด': station.lat != null ? Number(station.lat).toFixed(6) : '-',
        'ลองจิจูด': station.lng != null ? Number(station.lng).toFixed(6) : '-',
        'จำนวนครั้งที่ตรวจวัดในสัปดาห์': r.count ?? 1,
        'สถานะระดับน้ำ': statusText,
      };
    }
  });

  const csv = Papa.unparse(rows, { header: true });
  const bom = '\uFEFF'; // UTF-8 BOM for Thai characters in Excel
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const rangeSuffix =
    timeRange === 'hourly'
      ? 'hourly_1day'
      : timeRange === 'daily'
      ? 'daily_2weeks'
      : 'weekly_14weeks';

  const link = document.createElement('a');
  link.href = url;
  link.download = `readings_${station.id}_${rangeSuffix}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


