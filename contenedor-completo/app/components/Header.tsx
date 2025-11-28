"use client";
import Link from "next/link";
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showBackButton?: boolean;
}

export function Header({ showBackButton = false }: HeaderProps) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
          EduPlus
        </Link>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="outline" className="hover:bg-emerald-50 w-full sm:w-auto text-sm">
                  <Link href="/admin">Panel de administrador</Link>
                </Button>
              )}
              <Button asChild variant="outline" className="hover:bg-emerald-50 w-full sm:w-auto text-sm">
                <Link href="/perfil">Mi perfil</Link>
              </Button>
              <Button onClick={logout} variant="ghost" className="hover:bg-red-50 hover:text-red-600 w-full sm:w-auto text-sm">
                Cerrar sesión
              </Button>
              {showBackButton && (
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-sm">
                  <Link href="/">Volver a Inicio</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors w-full sm:w-auto text-center py-2">
                Iniciar sesión
              </Link>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-sm">
                <Link href="/auth?register=true">Registrarse</Link>
              </Button>
              {showBackButton && (
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-sm">
                  <Link href="/">Volver a Inicio</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
} 