export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const mStr = (mins < 10 ? '0' : '') + mins;
  const sStr = (secs < 10 ? '0' : '') + secs;
  return mStr + ':' + sStr;
}

export function formatTimeWithMs(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  const mStr = (mins < 10 ? '0' : '') + mins;
  const sStr = (secs < 10 ? '0' : '') + secs;
  const msStr = (ms < 10 ? '0' : '') + ms;
  return mStr + ':' + sStr + '.' + msStr;
}

export function parseLrcTimestamp(timestamp: string): number {
  const clean = timestamp.replace(/[\\[\\]]/g, '');
  const parts = clean.split(':');
  if (parts.length < 2) return 0;
  const mins = parseFloat(parts[0]) || 0;
  const secs = parseFloat(parts[1]) || 0;
  return Number((mins * 60 + secs).toFixed(2));
}
