"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CursosTable from "@/components/CursosTable";
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  [key: string]: any;
}

export default function ReportesAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);
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
        const cursosSnap = await getDocs(collection(db, 'cursos'));
        setCursos(cursosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const usuariosSnap = await getDocs(collection(db, 'users'));
        setUsuarios(usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Bienvenido, {(session?.user as any)?.name}</h1>
        <p className="text-gray-600">Gestiona cursos, usuarios y contenido de la plataforma</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium text-gray-500">Usuarios activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usuarios.length}</div>
            <p className="text-xs text-emerald-600 mt-1">+8% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Cursos completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,432</div>
            <p className="text-xs text-emerald-600 mt-1">+15% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>
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
        <div className="overflow-x-auto">
          <CursosTable
            cursos={cursosFiltrados}
            columns={[
              { key: "nombre", label: "Curso" },
              { key: "categoria", label: "Categoría" },
              { key: "instructor", label: "Instructor" },
              { key: "status", label: "Estado" },
              { key: "students", label: "Estudiantes" },
              { key: "videoUrl", label: "Video" },
              { key: "pdfUrl", label: "PDF" },
            ]}
            onDelete={handleEliminarCurso}
          />
        </div>
      </div>
    </div>
  );
} 