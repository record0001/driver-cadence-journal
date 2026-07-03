import { useAuth } from '../../auth/useAuth.js';

/**
 * @param {{ children: React.ReactNode, shareBanner?: string|null, showUserMenu?: boolean, onOpenShareSettings?: () => void }} props
 */
export function AppShell({ children, shareBanner, showUserMenu = true, onOpenShareSettings }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      {shareBanner && <div className="share-banner">{shareBanner}</div>}
      <header className="app-header">
        <span className="app-header__title">🚚 Driver Cadence Journal</span>
        {showUserMenu && user && (
          <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
            {onOpenShareSettings && (
              <button className="btn" onClick={onOpenShareSettings}>
                Поделиться
              </button>
            )}
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{user.displayName}</span>
            <button className="btn" onClick={logout}>
              Выйти
            </button>
          </div>
        )}
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
