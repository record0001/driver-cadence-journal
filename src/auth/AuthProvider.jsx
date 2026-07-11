import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../data/firebase/firebaseConfig.js';
import { ensureUserDocExists } from '../data/repositories/userRepository.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Состояние авторизации разблокирует UI СРАЗУ, синхронно.
      // Firestore (ensureUserDocExists) сюда намеренно не подмешивается —
      // ни его скорость, ни его ошибки не должны задерживать вход в приложение.
      setUser(firebaseUser);
      setIsLoading(false);

      if (firebaseUser) {
        // Фоновая операция: не await, свой catch. Если создание документа
        // задержится или упадёт (например, из-за конкуренции вкладок за
        // offline-персистентность) — пользователь всё равно уже в приложении;
        // при следующей успешной попытке (например, при следующем действии,
        // требующем Firestore) документ будет создан повторно, т.к.
        // ensureUserDocExists идемпотентна (проверяет exists() перед созданием).
        ensureUserDocExists(firebaseUser).catch((error) => {
          console.error('Не удалось создать документ пользователя:', error);
        });
      }
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = () => signInWithPopup(auth, googleAuthProvider);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
