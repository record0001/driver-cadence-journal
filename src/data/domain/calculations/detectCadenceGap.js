const AUTO_GAP_DAYS_THRESHOLD = 7;

/**
 * Определяет, считается ли разрыв между двумя сменами границей каденции
 * (разрыв > 7 дней). Используется только как подсказка в UI при создании
 * новой каденции вручную — не создаёт каденцию автоматически сама.
 * @param {Date} prevShiftEnd
 * @param {Date} nextShiftStart
 * @returns {boolean}
 */
export function isCadenceGap(prevShiftEnd, nextShiftStart) {
  const diffDays =
    (nextShiftStart.getTime() - prevShiftEnd.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > AUTO_GAP_DAYS_THRESHOLD;
}
