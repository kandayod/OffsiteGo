/**
 * Utility functions for robust Asia/Bangkok date and time operations.
 */

export function getThailandTodayStr(): string {
  // Returns 'YYYY-MM-DD' in Asia/Bangkok timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

export function getThailandTimeStr(): string {
  // Returns 'HH:MM:SS' in Asia/Bangkok timezone
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  return formatter.format(new Date());
}
