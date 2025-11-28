"use client";

import Link from "next/link"
import { Search, Heart } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/AuthContext"
import { cursosService } from "@/lib/cursos"
import { useFavoritosCursos } from '@/lib/cursosUsuario'
import { collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/Header"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface Curso {
  id?: string;
  nombre?: string;
  titulo?: string;
  descripcion?: string;
  duracion?: string;
  nivel?: string;
  precio?: number;
  imagen?: string;
  instructor?: string;
  categoria?: string;
  fechaCreacion?: Date;
  objetivos?: string[];
  requisitos?: string[];
  temario?: string[];
  materiales?: { nombre: string; url: string }[];
  modulos?: {
    titulo: string;
    contenido: string;
    videoUrl: string;
    materiales?: any[];
  }[];
  comentarios?: {
    usuario: string;
    fecha: string;
    calificacion: number;
    comentario: string;
  }[];
}

// Función para normalizar strings (eliminar tildes, espacios y pasar a minúsculas)
function normalizar(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const cursosPorPagina = 6;
  const { user, isAdmin, logout } = useAuth();
  const { favoritos, addFavorito, removeFavorito, isFavorito } = useFavoritosCursos();
  const [nivelSeleccionado, setNivelSeleccionado] = useState("Todos");

  const categorias = [
    "Todos",
    ...Array.from(new Set(cursos.map(c => c.categoria))).filter(Boolean)
  ];

  useEffect(() => {
    async function fetchCursos() {
      setLoading(true);
      try {
        const res = await fetch('/api/cursos');
        const data = await res.json();
        const cursosData = data.cursos || [];
        // Eliminar duplicados basados en el título
        const cursosUnicos = cursosData.reduce((acc: Curso[], curso: Curso) => {
          const titulo = curso.titulo || curso.nombre;
          if (!acc.find((c: Curso) => (c.titulo || c.nombre) === titulo)) {
            acc.push(curso);
          }
          return acc;
        }, [] as Curso[]);
        setCursos(cursosUnicos);
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCursos();
  }, []);

  // Lógica de filtrado robusta por búsqueda, categoría y dificultad
  let cursosFiltrados = cursos.filter(curso => {
    const titulo = (curso.titulo || curso.nombre || "").toLowerCase();
    const coincideNombre = titulo.includes(busqueda.toLowerCase());
    const categoriaCurso = normalizar(curso.categoria || "");
    const nivelCurso = normalizar(curso.nivel || "");
    const categoriaFiltro = normalizar(categoriaSeleccionada);
    const nivelFiltro = normalizar(nivelSeleccionado);
    const coincideCategoria = categoriaFiltro === "todos" || categoriaCurso === categoriaFiltro;
    const coincideNivel = nivelFiltro === "todos" || nivelCurso === nivelFiltro;
    return coincideNombre && coincideCategoria && coincideNivel;
  });

  // Paginación
  const totalPaginas = Math.ceil(cursosFiltrados.length / cursosPorPagina);
  const cursosPagina = cursosFiltrados.slice((paginaActual - 1) * cursosPorPagina, paginaActual * cursosPorPagina);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleFavorite = (curso: Curso) => {
    if (isFavorito(curso.id!)) {
      removeFavorito(curso.id!);
    } else {
      addFavorito(curso);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Explora nuestros cursos</h1>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar cursos..."
              className="pl-10 w-full"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div>
            <Select value={nivelSeleccionado} onValueChange={setNivelSeleccionado}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Básico">Básico</SelectItem>
                <SelectItem value="Intermedio">Intermedio</SelectItem>
                <SelectItem value="Avanzado">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categorias.map((cat) => (
            <Button
              key={cat}
              variant={cat === categoriaSeleccionada ? "default" : "outline"}
              size="sm"
              className={cat === categoriaSeleccionada ? "" : "text-gray-600"}
              onClick={() => setCategoriaSeleccionada(cat || "Todos")}
            >
              {cat}
            </Button>
          ))}
        </div>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-left">
              {busqueda.trim() !== "" 
                ? "Resultados de búsqueda" 
                : categoriaSeleccionada !== "Todos"
                  ? `Cursos de ${categoriaSeleccionada}`
                  : nivelSeleccionado !== "Todos"
                    ? `Cursos de dificultad ${nivelSeleccionado}`
                    : "Todos los cursos"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 text-center text-gray-500 py-12 text-lg">Cargando cursos...</div>
              ) : cursosFiltrados.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 py-12 text-lg">
                  No se encontraron cursos para tu búsqueda.
                </div>
              ) : (
                cursosPagina.map((curso) => (
                  <Card key={curso.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={
                        curso.imagen?.startsWith('http')
                          ? curso.imagen
                          : curso.imagen?.startsWith('/')
                            ? curso.imagen
                            : `/cursos/${curso.imagen}`
                      }
                      alt={curso.nombre}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-6">
                      <div className="text-sm text-emerald-600 mb-2">{curso.categoria}</div>
                      <h3 className="text-lg font-semibold mb-2">{curso.titulo || curso.nombre || "Sin título"}</h3>
                      <div className="text-xs text-gray-500 mb-1 font-semibold">Duración: {curso.duracion}</div>
                      <div className="text-xs text-gray-500 mb-1 font-semibold">Dificultad: {curso.nivel}</div>
                      <p className="text-gray-600 text-sm mb-4">{curso.descripcion}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 ml-1">Instructor: {curso.instructor}</span>
                        </div>
                        <Link href={`/cursos/${curso.id}`} className="text-sm font-medium text-emerald-600 hover:underline">
                          Ver curso
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={paginaActual === 1} onClick={() => cambiarPagina(paginaActual - 1)}>
                Anterior
              </Button>
              {Array.from({ length: totalPaginas }).map((_, idx) => (
                <Button
                  key={idx + 1}
                  variant={paginaActual === idx + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => cambiarPagina(idx + 1)}
                >
                  {idx + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={paginaActual === totalPaginas} onClick={() => cambiarPagina(paginaActual + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
