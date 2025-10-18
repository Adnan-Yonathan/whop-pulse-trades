import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { startOfDay, endOfDay, startOfWeek } from 'date-fns';

const ET_TIMEZONE = 'America/New_York';

export function getETDate(date: Date = new Date()): Date {
  return zonedTimeToUtc(date, ET_TIMEZONE);
}

export function formatETDate(date: Date, format: string = 'yyyy-MM-dd'): string {
  return formatInTimeZone(date, ET_TIMEZONE, format);
}

export function getTradingDayStart(date: Date = new Date()): Date {
  return startOfDay(getETDate(date));
}

export function getTradingDayEnd(date: Date = new Date()): Date {
  return endOfDay(getETDate(date));
}

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(getETDate(date), { weekStartsOn: 1 }); // Monday start
}

export function getTradingDayString(date: Date = new Date()): string {
  return formatETDate(date, 'yyyy-MM-dd');
}

export function getWeekStartString(date: Date = new Date()): string {
  return formatETDate(getWeekStart(date), 'yyyy-MM-dd');
}

export function getNextMidnightET(): Date {
  const now = new Date();
  const tomorrowET = new Date(now);
  tomorrowET.setDate(tomorrowET.getDate() + 1);
  
  // Get midnight ET for tomorrow
  const midnightET = new Date(tomorrowET);
  midnightET.setHours(0, 0, 0, 0);
  
  // Convert to UTC
  return zonedTimeToUtc(midnightET, ET_TIMEZONE);
}

export function getTimeUntilMidnightET(): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const nextMidnight = getNextMidnightET();
  const diffMs = nextMidnight.getTime() - now.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}
