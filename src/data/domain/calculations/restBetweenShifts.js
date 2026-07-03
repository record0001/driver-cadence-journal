import { diffInMinutes } from './formatDuration.js';
import { isShiftCompleted } from '../entities/Shift.js';

/**
 * Отдых между предыдущей (завершённой) сменой и началом текущей, в минутах.
 * Никакой классификации типа отдыха — чистая арифметика.
 * @param {import('../entities/Shift.js').Shift|null} prevShift
 * @param {import('../entities/Shift.js').Shift} currentShift
 * @returns {number|null} минуты, null если нет предыдущей смены или она не завершена
 */
export function calculateRestBetween(prevShift, currentShift) {
  if (!prevShift || !isShiftCompleted(prevShift)) return null;
  const rest = diffInMinutes(prevShift.endDateTime, currentShift.startDateTime);
  return rest >= 0 ? rest : null;
}

/**
 * Возвращает true, если currentShift начинается раньше, чем закончилась
 * предыдущая смена в отсортированном по времени списке — это сигнал
 * пересечения (warning), НЕ ошибка сохранения.
 * @param {import('../entities/Shift.js').Shift} newShift
 * @param {import('../entities/Shift.js').Shift[]} existingShifts
 * @returns {boolean}
 */
export function shiftsOverlap(newShift, existingShifts) {
  const newStart = newShift.startDateTime.getTime();
  const newEnd = newShift.endDateTime
    ? newShift.endDateTime.getTime()
    : newStart;

  return existingShifts.some((other) => {
    if (other.id && newShift.id && other.id === newShift.id) return false;
    const otherStart = other.startDateTime.getTime();
    const otherEnd = other.endDateTime
      ? other.endDateTime.getTime()
      : otherStart;
    return newStart < otherEnd && otherStart < newEnd;
  });
}
