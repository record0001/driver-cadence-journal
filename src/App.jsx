import { AuthProvider } from './auth/AuthProvider.jsx';
import { AppRouter } from './router/AppRouter.jsx';

export default function App() {
  return (
    <AuthProvider>
      <div>TEST INSIDE PROVIDER</div>
    </AuthProvider>
  );
}

