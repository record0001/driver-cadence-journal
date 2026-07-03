/**
 * Domain entity: Cadence (каденция) — рабочий период водителя.
 */

/**
 * @typedef {Object} Cadence
 * @property {string} id
 * @property {Date} startDate
 * @property {Date|null} endDate // null = каденция ещё активна
 * @property {boolean} isAutoDetected
 * @property {Date} createdAt
 */

/**
 * @param {Partial<Cadence>} data
 * @returns {Cadence}
 */
export function createCadence(data = {}) {
  return {
    id: data.id ?? null,
    startDate: data.startDate ?? new Date(),
    endDate: data.endDate ?? null,
    isAutoDetected: data.isAutoDetected ?? false,
    createdAt: data.createdAt ?? new Date(),
  };
}

/**
 * Каденция активна, если у неё нет даты окончания.
 * @param {Cadence} cadence
 * @returns {boolean}
 */
export function isCadenceActive(cadence) {
  return cadence.endDate === null;
}

/**
 * Определяет, попадает ли дата в диапазон каденции.
 * Если каденция активна (endDate === null), диапазон считается открытым сверху.
 * @param {Cadence} cadence
 * @param {Date} date
 * @returns {boolean}
 */
export function isDateWithinCadence(cadence, date) {
  if (date < cadence.startDate) return false;
  if (cadence.endDate && date > cadence.endDate) return false;
  return true;
}
