import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const instant = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="relative isolate min-h-screen w-full overflow-hidden bg-linear-to-b from-red-700 via-red-900 to-red-950 text-white selection:bg-black selection:text-white">
        
        {/* Elemento decorativo de fundo (Glow effect) */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-20 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="relative left-1/2 aspect-1155/678 w-145 -translate-x-1/2 rotate-30 bg-linear-to-tr from-red-500 to-rose-600 opacity-80 sm:left-[calc(50%-30rem)] sm:w-3xl"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        {/* Conteúdo Protegido do Painel Administrativo */}
        <main className="w-full min-h-screen">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}