/**
 * Returns a Date object representing the start of the current day in UTC (00:00)
 * @returns {Date} Date object set to 00:00 UTC of the current day
 */
export function getCurrentDayStart(date?: Date): Date {
  const now = date || new Date();
  
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
}