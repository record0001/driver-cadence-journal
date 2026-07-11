import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../data/firebase/firebaseConfig.js';
import { ensureUserDocExists } from '../data/repositories/userRepository.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      /*
      if (firebaseUser) {
        await ensureUserDocExists(firebaseUser);
      }
*/


if (firebaseUser) {
  alert("Пользователь Firebase: " + firebaseUser.email);

  try {
    await ensureUserDocExists(firebaseUser);
    alert("Создание документа пользователя завершено");
  } catch (error) {
    alert(
      "Ошибка создания пользователя:\n" +
      error.message
    );
  }
}

setIsLoading(false);



      /*******************/
      
      setIsLoading(false);
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
