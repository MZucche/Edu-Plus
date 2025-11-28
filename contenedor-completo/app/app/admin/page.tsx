"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  BarChart2,
  Users,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CursosTable from "@/components/CursosTable";
import { Header } from "@/components/Header"

// Tipo para los cursos
interface Curso {
  id: number;
  title: string;
  category: string;
  instructor: string;
  status: string;
  students: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!user || !isAdmin) {
      router.replace('/');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const cursosRes = await fetch('/api/admin/cursos');
        const cursosData = await cursosRes.json();
        setCursos(cursosData.ok ? cursosData.cursos : []);
        const usuariosRes = await fetch('/api/admin/usuarios');
        const usuariosData = await usuariosRes.json();
        setUsuarios(usuariosData.ok ? usuariosData.usuarios : []);
      } catch (error) {
        setCursos([]);
        setUsuarios([]);
        console.error("Error cargando datos:", error);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (!user || !isAdmin) return <div>No autorizado</div>;

  // Filtrado de cursos por búsqueda
  const cursosFiltrados = cursos.filter((curso) =>
    (curso.nombre ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Eliminar curso
  const handleEliminarCurso = (id: string) => {
    setCursos(cursos.filter((curso) => curso.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} />
      
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Bienvenido, {(user as any)?.name}</h1>
        <p className="text-gray-600">Gestiona cursos, usuarios y contenido de la plataforma</p>
      </div>
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total de cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cursos.length}</div>
            <p className="text-xs text-emerald-600 mt-1">+12% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Usuarios registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usuarios.length}</div>
            <p className="text-xs text-emerald-600 mt-1">+8% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>
      {/* Gestión de cursos */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Gestión de cursos</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        {/* Tabla de cursos */}
        <CursosTable
          cursos={cursosFiltrados}
          columns={[
            { key: "nombre", label: "Curso" },
            { key: "categoria", label: "Categoría" },
            { key: "instructor", label: "Instructor" },
            { key: "status", label: "Estado" },
            { key: "students", label: "Estudiantes" },
          ]}
        />
        </div>
      </div>
    </div>
  );
}

