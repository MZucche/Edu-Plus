"use client";
import Link from "next/link"
import { Search } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useAuth } from '@/lib/AuthContext';
import { cursosService } from '@/lib/cursos';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/Header"

// Función para normalizar strings (eliminar tildes, espacios y pasar a minúsculas)
function normalizar(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

export default function Home() {
  const { data: session } = useSession();
  const { user, isAdmin, logout } = useAuth();
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [nivelSeleccionado, setNivelSeleccionado] = useState("Todos");
  const [ordenSeleccionado, setOrdenSeleccionado] = useState("recientes");

  const categoriasDinamicas = [
    "Todos",
    ...Array.from(new Set(cursos.map(c => c.categoria).filter(Boolean)))
  ];
  const niveles = ["Dificultad", ...Array.from(new Set(cursos.map(c => c.nivel))).filter(Boolean)];
  const ordenes = [
    { value: "recientes", label: "Más recientes" },
    { value: "populares", label: "Más populares" },
    { value: "calificacion", label: "Mejor calificados" },
  ];

  useEffect(() => {
    async function fetchCursos() {
      setLoading(true);
      try {
        const res = await fetch('/api/cursos');
        const data = await res.json();
        setCursos(data.cursos || []);
      } catch (error) {
        setCursos([]);
      }
      setLoading(false);
    }
    fetchCursos();
  }, []);

  // Lógica de filtrado robusta por búsqueda, categoría y dificultad
  const cursosFiltrados = cursos.filter(curso => {
    const nombreCurso = (curso.nombre || curso.titulo || '').toLowerCase();
    const coincideNombre = nombreCurso.includes(busqueda.toLowerCase());
    const categoriaCurso = normalizar(curso.categoria || '');
    const nivelCurso = normalizar(curso.nivel || '');
    const categoriaFiltro = normalizar(categoriaSeleccionada);
    const nivelFiltro = normalizar(nivelSeleccionado);
    const coincideCategoria = categoriaFiltro === 'todos' || categoriaCurso === categoriaFiltro;
    const coincideNivel = nivelFiltro === 'todos' || nivelCurso === nivelFiltro;
    return coincideCategoria && coincideNivel && coincideNombre;
  });

  // Cursos populares: SIEMPRE los más populares, sin verse afectados por búsqueda/filtros
  const cursosPopulares = [...cursos]
    .sort((a, b) => (b.estudiantes || 0) - (a.estudiantes || 0))
    .slice(0, 6);

  // Mostrar cursos filtrados si hay búsqueda, categoría distinta de 'Todos' o dificultad distinta de 'Todos'
  const mostrarCursosFiltrados = (
    busqueda.trim() !== "" ||
    categoriaSeleccionada !== "Todos" ||
    nivelSeleccionado !== "Todos"
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-emerald-50 via-white to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-6 mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-700 text-center leading-tight">
              Aprende a tu ritmo, crece sin límites
            </h1>
            <p className="text-lg text-gray-600 text-center max-w-2xl">
              Descubre cientos de cursos impartidos por expertos y desarrolla las habilidades que necesitas para alcanzar tus metas.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl">
              <div className="flex-1 w-full">
                <Input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-auto">
                <Select value={nivelSeleccionado} onValueChange={setNivelSeleccionado}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveles.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados de búsqueda (solo si hay texto) */}
      {busqueda.trim() !== "" && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold mb-6 text-left">Resultados de búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 text-center text-gray-500 py-12 text-lg">Cargando cursos...</div>
              ) : cursosFiltrados.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 py-12 text-lg">No se encontraron cursos para tu búsqueda.</div>
              ) : (
                cursosFiltrados.map((curso) => (
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
                      <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                      <div className="text-xs text-gray-500 mb-1 font-semibold">Dificultad: {curso.nivel}</div>
                      <p className="text-gray-600 text-sm mb-4">{curso.descripcion}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 ml-1">{curso.objetivos?.length || 0} objetivos</span>
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
      )}

      {/* Categorías destacadas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Categorías destacadas</h2>
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {categoriasDinamicas.map((cat) => (
              <Button
                key={cat}
                variant={cat === categoriaSeleccionada ? "default" : "outline"}
                className={`${
                  cat === categoriaSeleccionada 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                } transition-all duration-200 rounded-full px-6`}
                onClick={() => setCategoriaSeleccionada(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Resultados filtrados por búsqueda, categoría o dificultad */}
      {mostrarCursosFiltrados && (
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
                cursosFiltrados.map((curso) => (
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
                      <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                      <div className="text-xs text-gray-500 mb-1 font-semibold">Dificultad: {curso.nivel}</div>
                      <p className="text-gray-600 text-sm mb-4">{curso.descripcion}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 ml-1">{curso.objetivos?.length || 0} objetivos</span>
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
      )}

      {/* Cursos populares */}
      <section className="py-16 bg-gradient-to-b from-white to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Cursos populares</h2>
              <p className="text-gray-600 mt-1">Los cursos más demandados por nuestros estudiantes</p>
            </div>
            <Link 
              href="/cursos" 
              className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 group"
            >
              Ver todos
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center text-gray-500 py-12 text-lg">Cargando cursos...</div>
            ) : cursosPopulares.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 py-12 text-lg">No hay cursos populares.</div>
            ) : (
              cursosPopulares.map((curso, index) => (
                <Card key={curso.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-emerald-100 group relative">
                  {index < 3 && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Top {index + 1}
                      </span>
                    </div>
                  )}
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        curso.imagen?.startsWith('http')
                          ? curso.imagen
                          : curso.imagen?.startsWith('/')
                            ? curso.imagen
                            : `/cursos/${curso.imagen}`
                      }
                      alt={curso.nombre}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-emerald-600 font-medium">{curso.categoria}</div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-600 transition-colors">{curso.nombre}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                        {curso.nivel}
                      </span>
                      {curso.duracion && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {curso.duracion}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{curso.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{curso.objetivos?.length || 0} objetivos</span>
                        {curso.calificacion && (
                          <div className="flex items-center text-xs text-amber-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {curso.calificacion.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <Link 
                        href={`/cursos/${curso.id}`} 
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 group-hover:translate-x-1"
                      >
                        Ver curso
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}