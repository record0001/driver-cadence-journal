import { AuthProvider } from './auth/AuthProvider.jsx';
import { AppRouter } from './router/AppRouter.jsx';
import './ui/styles.css';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
