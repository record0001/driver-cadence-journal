import { useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';

export function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      // Раньше ошибка терялась молча (unhandled rejection) — именно это
      // выглядело как "экран мигает и возвращается без объяснений".
      alert('Ошибка входа через Google:', err.code, err.message);
      // console.error('Ошибка входа через Google:', err.code, err.message);
      
      setError(describeAuthError(err.code));
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}
    >
      <div className="card" style={{ textAlign: 'center', maxWidth: 360 }}>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>🚚 Driver Cadence Journal</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 'var(--spacing-4)' }}>
          Табличный журнал смен, рейсов и каденций
        </p>
        <button className="btn btn-primary" onClick={handleLogin} style={{ width: '100%' }}>
          Войти через Google
        </button>
        {error && (
          <p style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 'var(--spacing-3)', marginBottom: 0 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Переводит коды ошибок Firebase Auth в понятные пользователю сообщения.
 * Полный список кодов: https://firebase.google.com/docs/reference/js/auth#autherrorcodes
 */
function describeAuthError(code) {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'Этот домен не разрешён в настройках Firebase Authentication (Authorized domains).';
    case 'auth/popup-blocked':
      return 'Браузер заблокировал всплывающее окно входа. Разрешите всплывающие окна для этого сайта и попробуйте снова.';
    case 'auth/popup-closed-by-user':
      return 'Окно входа было закрыто до завершения авторизации. Попробуйте ещё раз.';
    case 'auth/cancelled-popup-request':
      return 'Предыдущий запрос на вход ещё не завершился. Попробуйте ещё раз.';
    case 'auth/network-request-failed':
      return 'Проблема с сетевым соединением. Проверьте интернет и попробуйте снова.';
    default:
      return `Не удалось войти: ${code || 'неизвестная ошибка'}. Подробности — в консоли браузера.`;
  }
}
