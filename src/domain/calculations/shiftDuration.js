import { diffInMinutes } from './formatDuration.js';
import { isShiftCompleted } from '../entities/Shift.js';

/**
 * Длительность смены в минутах. Только математика, без округления до особых
 * единиц и без нормативной классификации.
 * Возвращает null, если смена не завершена (endDateTime === null) —
 * по правилу проекта: длительность отображается ТОЛЬКО в строке окончания смены.
 * @param {import('../entities/Shift.js').Shift} shift
 * @returns {number|null} минуты
 */
export function calculateShiftDuration(shift) {
  if (!isShiftCompleted(shift)) return null;
  return diffInMinutes(shift.startDateTime, shift.endDateTime);
}
