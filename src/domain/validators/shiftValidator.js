import { shiftsOverlap } from '../calculations/restBetweenShifts.js';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid          // false = сохранение блокируется
 * @property {string[]} errors          // блокирующие ошибки
 * @property {string[]} warnings        // предупреждения, НЕ блокируют сохранение
 */

/**
 * Базовая валидация полей смены перед сохранением.
 * Пересечение с другими сменами — это warning, не error (зафиксировано в спеке).
 * @param {import('../entities/Shift.js').Shift} shift
 * @param {import('../entities/Shift.js').Shift[]} existingShifts // остальные смены каденции
 * @returns {ValidationResult}
 */
export function validateShift(shift, existingShifts = []) {
  const errors = [];
  const warnings = [];

  if (!shift.startDateTime) {
    errors.push('Укажите дату и время начала смены.');
  }

  if (
    shift.startDateTime &&
    shift.endDateTime &&
    shift.endDateTime <= shift.startDateTime
  ) {
    errors.push('Время окончания смены должно быть позже времени начала.');
  }

  if (shift.drivingTime !== null && shift.drivingTime < 0) {
    errors.push('Время за рулём не может быть отрицательным.');
  }

  if (shift.distanceKm !== null && shift.distanceKm < 0) {
    errors.push('Километраж не может быть отрицательным.');
  }

  if (
    errors.length === 0 &&
    shift.startDateTime &&
    shiftsOverlap(shift, existingShifts)
  ) {
    warnings.push('Внимание: новая смена пересекается с уже существующей сменой');
  }

  return { isValid: errors.length === 0, errors, warnings };
}
