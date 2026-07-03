import { useEffect, useState } from 'react';
import { getUserDocOnce } from '../repositories/userRepository.js';

/**
 * Проверяет валидность view/edit токена для гостевых страниц (/shared/*).
 * Реальное разграничение прав на запись/чтение обеспечивают Firestore
 * security rules — этот hook нужен для UI-решения "показать журнал или
 * экран 'доступ недействителен'", а не как источник истины по безопасности.
 * @param {string} userId
 * @param {string} token
 * @param {'view'|'edit'} mode
 * @returns {{ isValid: boolean, isLoading: boolean, ownerName: string|null }}
 */
export function useShareAccess(userId, token, mode) {
  const [state, setState] = useState({ isValid: false, isLoading: true, ownerName: null });

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!userId || !token) {
        setState({ isValid: false, isLoading: false, ownerName: null });
        return;
      }
      const userDoc = await getUserDocOnce(userId);
      if (cancelled) return;

      if (!userDoc || !userDoc.shareTokens) {
        setState({ isValid: false, isLoading: false, ownerName: null });
        return;
      }

      const { viewToken, editToken, isViewEnabled, isEditEnabled } = userDoc.shareTokens;
      const isValid =
        mode === 'view'
          ? token === viewToken && isViewEnabled
          : token === editToken && isEditEnabled;

      setState({ isValid, isLoading: false, ownerName: userDoc.displayName ?? null });
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [userId, token, mode]);

  return state;
}
