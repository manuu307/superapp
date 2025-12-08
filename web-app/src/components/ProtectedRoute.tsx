import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';

interface AuthContextType {
  token: string | null;
  loading: boolean;
  // Add other AuthContext properties if they are used in this component
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, loading } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    router.push('/login');
    return null; // or a loading spinner, or redirecting message
  }

  return <>{children}</>;
};

export default ProtectedRoute;
