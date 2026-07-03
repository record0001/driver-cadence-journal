import { useEffect, useState } from 'react';
import { subscribeToCadences } from '../repositories/cadencesRepository.js';
import { isCadenceActive } from '../../domain/entities/Cadence.js';

/**
 * Отдаёт список каденций пользователя и определяет "активную по умолчанию"
 * (последнюю, у которой endDate === null; если таких нет — самую последнюю по дате).
 * @param {string|null} userId
 * @returns {{ cadences: import('../../domain/entities/Cadence.js').Cadence[], defaultCadence: import('../../domain/entities/Cadence.js').Cadence|null, isLoading: boolean }}
 */
export function useCadences(userId) {
  const [cadences, setCadences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCadences([]);
      setIsLoading(false);
      return undefined;
    }
    setIsLoading(true);
    const unsubscribe = subscribeToCadences(userId, (result) => {
      setCadences(result);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  const activeCadence = cadences.find(isCadenceActive);
  const defaultCadence = activeCadence ?? cadences[0] ?? null;

  return { cadences, defaultCadence, isLoading };
}
