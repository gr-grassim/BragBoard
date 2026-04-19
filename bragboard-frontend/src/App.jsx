// src/App.jsx

import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Basic loading screen while validate the token
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // If user is logged in, show the Dashboard
  if (user) {
    return <DashboardLayout />;
  }

  // If not logged in, show the Auth page
  return <AuthPage />;
}

export default App;