/**
 * Итоги по каденции: суммарное время за рулём, километраж, число смен.
 * Считается on-the-fly из уже загруженного списка смен — не хранится в БД.
 * @param {import('../entities/Shift.js').Shift[]} shifts
 * @returns {{ totalDrivingTime: number, totalKm: number, shiftsCount: number }}
 */
export function calculateCadenceSummary(shifts) {
  return shifts.reduce(
    (acc, shift) => ({
      totalDrivingTime: acc.totalDrivingTime + (shift.drivingTime ?? 0),
      totalKm: acc.totalKm + (shift.distanceKm ?? 0),
      shiftsCount: acc.shiftsCount + 1,
    }),
    { totalDrivingTime: 0, totalKm: 0, shiftsCount: 0 }
  );
}
