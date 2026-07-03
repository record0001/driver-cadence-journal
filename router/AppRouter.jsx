import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { LoginPage } from '../ui/pages/LoginPage.jsx';
import { JournalPage } from '../ui/pages/JournalPage.jsx';
import { ShiftEditPage } from '../ui/pages/ShiftEditPage.jsx';
import { SharedViewPage } from '../ui/pages/SharedViewPage.jsx';
import { SharedEditPage } from '../ui/pages/SharedEditPage.jsx';

function RequireAuth({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p style={{ padding: 32, textAlign: 'center' }}>Загрузка…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <JournalPage />
            </RequireAuth>
          }
        />
        <Route
          path="/shift/:cadenceId/:shiftId/edit"
          element={
            <RequireAuth>
              <ShiftEditPage />
            </RequireAuth>
          }
        />
        <Route path="/shared/view/:userId/:token" element={<SharedViewPage />} />
        <Route path="/shared/edit/:userId/:token" element={<SharedEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
