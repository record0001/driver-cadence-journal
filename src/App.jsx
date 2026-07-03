import { AuthProvider } from './auth/AuthProvider.jsx';

export default function App() {
  return (
    <AuthProvider>
      <h1>AUTH PROVIDER TEST</h1>
    </AuthProvider>
  );
}
