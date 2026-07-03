/**
 * Domain entity: Shift (смена).
 * Чистый JS-объект. Не знает про Firestore Timestamp — работает с обычным Date.
 * Конвертация Timestamp <-> Date происходит в data/repositories, не здесь.
 */

/**
 * @typedef {Object} Shift
 * @property {string} id
 * @property {Date} startDateTime
 * @property {Date|null} endDateTime  // null = смена не завершена
 * @property {number|null} drivingTime // минуты, ручное поле, независимое от длительности
 * @property {number|null} distanceKm  // км, ручное поле
 * @property {string} note
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Создаёт новый объект смены с дефолтными значениями.
 * @param {Partial<Shift>} data
 * @returns {Shift}
 */
export function createShift(data = {}) {
  const now = new Date();
  return {
    id: data.id ?? null,
    startDateTime: data.startDateTime ?? null,
    endDateTime: data.endDateTime ?? null,
    drivingTime: data.drivingTime ?? null,
    distanceKm: data.distanceKm ?? null,
    note: data.note ?? '',
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  };
}

/**
 * Смена считается завершённой, если у неё есть конец.
 * @param {Shift} shift
 * @returns {boolean}
 */
export function isShiftCompleted(shift) {
  return shift.endDateTime instanceof Date;
}

/**
 * Смена пересекает полночь, если дата начала и дата конца — разные календарные дни.
 * @param {Shift} shift
 * @returns {boolean}
 */
export function crossesMidnight(shift) {
  if (!isShiftCompleted(shift)) return false;
  return (
    shift.startDateTime.toDateString() !== shift.endDateTime.toDateString()
  );
}
