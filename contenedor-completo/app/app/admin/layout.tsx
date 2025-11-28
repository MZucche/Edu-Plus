"use client";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen,
  Settings,
  LogOut,
  BarChart2,
  Users,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) return <div>Cargando...</div>;
  if (!user || !isAdmin) {
    if (typeof window !== 'undefined') router.replace('/');
    return <div>No autorizado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-600">
            EduPlus
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">
              {user.displayName || user.email}
            </span>
            <Avatar>
              <AvatarFallback>{(user.displayName || user.email || "U").slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => router.replace('/auth')}
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r hidden md:block">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Panel de administración</h2>
            <div className="space-y-1">
              <Button variant={pathname === "/admin" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
                <Link href="/admin" className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Button variant={pathname === "/admin/cursos" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
                <Link href="/admin/cursos" className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  <span>Cursos</span>
                </Link>
              </Button>
              <Button variant={pathname === "/admin/usuarios" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
                <Link href="/admin/usuarios" className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  <span>Usuarios</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Contenido principal */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 