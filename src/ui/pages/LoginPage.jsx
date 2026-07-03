import { useAuth } from '../../auth/useAuth.js';

export function LoginPage() {
  const { loginWithGoogle } = useAuth();

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
        <button className="btn btn-primary" onClick={loginWithGoogle} style={{ width: '100%' }}>
          Войти через Google
        </button>
      </div>
    </div>
  );
}
