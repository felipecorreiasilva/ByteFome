'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Prop opcional para definir o perfil necessário (ex: 'admin')
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (requiredRole && user.role !== requiredRole) {
        router.push('/'); // Redireciona se não tiver a permissão exigida
      }
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading || !user || (requiredRole && user.role !== requiredRole)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <p className="animate-pulse">A verificar permissões de acesso...</p>
      </div>
    );
  }

  return <>{children}</>;
}