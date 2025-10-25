import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, isLoading: loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/signin');
      return;
    }

    if (user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case 'STUDENT':
          setLocation('/dashboard/student');
          break;
        case 'BUYER':
          setLocation('/dashboard/buyer');
          break;
        case 'ADMIN':
          setLocation('/dashboard/admin');
          break;
        default:
          setLocation('/');
      }
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}




