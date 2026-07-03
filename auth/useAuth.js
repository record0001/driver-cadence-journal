import { useContext } from 'react';
import { AuthContext } from './AuthProvider.jsx';

/**
 * @returns {{ user: import('firebase/auth').User|null, isLoading: boolean, loginWithGoogle: () => Promise<void>, logout: () => Promise<void> }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри <AuthProvider>');
  }
  return context;
}
