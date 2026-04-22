import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/login';
import Payment from './pages/payment';
import './styles.css';

function AppContent() {
  const { user } = useAuth();
  return user ? <Payment /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
