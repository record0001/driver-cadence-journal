import { calculateCadenceSummary } from './cadenceSummary.js';

/**
 * Фильтрует смены по диапазону дат (по дате начала смены) и считает итоги.
 * Полностью on-the-fly, ничего не сохраняется в БД.
 * @param {import('../entities/Shift.js').Shift[]} shifts
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @returns {{ totalDrivingTime: number, totalKm: number, shiftsCount: number }}
 */
export function calculateRangeAnalytics(shifts, dateFrom, dateTo) {
  const from = new Date(dateFrom);
  from.setHours(0, 0, 0, 0);
  const to = new Date(dateTo);
  to.setHours(23, 59, 59, 999);

  const filtered = shifts.filter(
    (shift) => shift.startDateTime >= from && shift.startDateTime <= to
  );

  return calculateCadenceSummary(filtered);
}
