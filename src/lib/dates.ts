import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  differenceInCalendarDays,
} from "date-fns";

// Week starts Monday for budgeting.
const WEEK_OPTS = { weekStartsOn: 1 as const };

export function dayRange(d: Date = new Date()) {
  return { start: startOfDay(d), end: endOfDay(d) };
}

export function weekRange(d: Date = new Date()) {
  return { start: startOfWeek(d, WEEK_OPTS), end: endOfWeek(d, WEEK_OPTS) };
}

export function monthRange(d: Date = new Date()) {
  return { start: startOfMonth(d), end: endOfMonth(d) };
}

export function daysInMonth(d: Date = new Date()): number {
  return getDaysInMonth(d);
}

/** Days left in the month, including today (never below 1). */
export function daysRemainingInMonth(d: Date = new Date()): number {
  const remaining = differenceInCalendarDays(endOfMonth(d), d) + 1;
  return Math.max(1, remaining);
}

/** Days elapsed in the month, including today. */
export function dayOfMonth(d: Date = new Date()): number {
  return d.getDate();
}
