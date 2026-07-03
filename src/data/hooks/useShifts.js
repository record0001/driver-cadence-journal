import { useEffect, useState } from 'react';
import { subscribeToShifts } from '../repositories/shiftsRepository.js';

/**
 * Отдаёт актуальный список смен каденции + флаг несинхронизированных
 * offline-записей. Ре-подписывается при смене userId/cadenceId.
 * @param {string|null} userId
 * @param {string|null} cadenceId
 * @returns {{ shifts: import('../../domain/entities/Shift.js').Shift[], hasPendingWrites: boolean, isLoading: boolean }}
 */
export function useShifts(userId, cadenceId) {
  const [shifts, setShifts] = useState([]);
  const [hasPendingWrites, setHasPendingWrites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !cadenceId) {
      setShifts([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToShifts(userId, cadenceId, (result) => {
      setShifts(result.shifts);
      setHasPendingWrites(result.hasPendingWrites);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [userId, cadenceId]);

  return { shifts, hasPendingWrites, isLoading };
}
