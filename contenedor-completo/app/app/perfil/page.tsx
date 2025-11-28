"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, BookOpen, Bookmark, Settings, LogOut, ChevronRight, Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import { useAuth } from '@/lib/AuthContext'
import { getCursosUsuario, agregarCursoUsuario, quitarCursoUsuario, actualizarProgresoCurso } from '@/lib/cursosUsuario'
import { updateProfile } from 'firebase/auth'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Header } from "@/components/Header"

// Simulación de IDs de cursos del usuario (esto puede venir de backend o localStorage en el futuro)
const IDS_EN_PROGRESO = [1, 2];
const IDS_COMPLETADOS = [3];
const IDS_FAVORITOS = [1, 2];

export default function PerfilPage() {
  const { data: session } = useSession();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("en-progreso")
  const [cursos, setCursos] = useState<any[]>([]);
  const [cursosEnProgreso, setCursosEnProgreso] = useState<any[]>([]);
  const [cursosCompletados, setCursosCompletados] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recomendados, setRecomendados] = useState<any[]>([]);
  const nombre = user?.displayName || user?.email?.split('@')[0] || "Usuario";
  const correo = user?.email || "";
  const [nombreEdit, setNombreEdit] = useState(nombre);
  const [correoEdit, setCorreoEdit] = useState(correo);

  // Cargar cursos dinámicamente desde los JSON
  useEffect(() => {
    async function fetchCursos() {
      try {
        const response = await fetch("/api/cursos-list");
        const files: string[] = await response.json();
        const cursosData = await Promise.all(
          files.map(async (file) => {
            const res = await fetch(`/cursos-data/${file}`);
            return await res.json();
          })
        );
        setCursos(cursosData);
      } catch (error) {
        console.error("Error cargando cursos:", error);
      }
    }
    fetchCursos();
  }, []);

  // Cargar cursos del usuario desde la nueva API interna
  useEffect(() => {
    if (!user) return;
    const cargarCursos = async () => {
      const res = await fetch('/api/perfil/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      const data = await res.json();
      if (data.ok) {
        setCursosEnProgreso(data.enProgreso);
        setCursosCompletados(data.completados);
        setFavorites(data.favoritos);
      } else {
        setCursosEnProgreso([]);
        setCursosCompletados([]);
        setFavorites([]);
      }
      // Recomendados: todos los cursos menos los que ya están en progreso o completados
      const response = await fetch('/api/cursos-list');
      const files = await response.json();
      const todos = await Promise.all(files.map(async (file: string) => {
        const res = await fetch(`/cursos-data/${file}`);
        return await res.json();
      }));
      const ids = new Set([...data.enProgreso, ...data.completados].map((c: any) => c.id));
      setRecomendados(todos.filter((c: any) => !ids.has(c.id)));
    };
    cargarCursos();
  }, [user]);

  // Marcar como completado
  const marcarComoCompletado = async (cursoId: string) => {
    if (!user) return;
    const curso = cursosEnProgreso.find(c => c.id === cursoId);
    if (curso) {
      await quitarCursoUsuario(user.uid, 'enProgreso', cursoId);
      await agregarCursoUsuario(user.uid, 'completados', { ...curso, completedDate: new Date().toLocaleDateString() });
      setCursosEnProgreso(cursosEnProgreso.filter(c => c.id !== cursoId));
      setCursosCompletados([...cursosCompletados, { ...curso, completedDate: new Date().toLocaleDateString() }]);
    }
  };

  // Quitar favorito
  const removeFavorite = async (cursoId: string) => {
    if (!user) return;
    await quitarCursoUsuario(user.uid, 'favoritos', cursoId);
    setFavorites(favorites.filter(c => c.id !== cursoId));
  };

  // Actualizar progreso
  const actualizarProgreso = async (cursoId: string, progreso: number) => {
    if (!user) return;
    await actualizarProgresoCurso(user.uid, cursoId, progreso);
    setCursosEnProgreso(cursosEnProgreso.map(c => c.id === cursoId ? { ...c, progreso } : c));
  };

  // Guardar cambios de perfil
  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateProfile(user, { displayName: nombreEdit });
    // No se puede cambiar el email desde aquí por seguridad de Firebase
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarFallback className="text-xl">{nombre.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{nombre}</h2>
                <p className="text-gray-500">{correo}</p>
              </div>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/perfil" className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    <span>Mis cursos</span>
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/perfil/guardados" className="flex items-center">
                    <Bookmark className="mr-2 h-5 w-5" />
                    <span>Guardados</span>
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/perfil/editar" className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    <span>Editar perfil</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Cerrar sesión</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg border p-6 mb-8">
              <h1 className="text-2xl font-bold mb-6">Mis cursos</h1>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="en-progreso">En progreso</TabsTrigger>
                  <TabsTrigger value="completados">Completados</TabsTrigger>
                  <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
                </TabsList>
                <TabsContent value="en-progreso">
                  <div className="space-y-6">
                    {cursosEnProgreso.length === 0 && (
                      <div className="text-gray-500 text-center py-8">No tienes cursos en progreso.</div>
                    )}
                    {cursosEnProgreso.map((curso) => (
                      <Card key={curso.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4">
                            <img
                              src={curso.imagen || "/placeholder.svg"}
                              alt={curso.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="flex-1 p-6">
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <div className="text-sm text-emerald-600 mb-2">{curso.nivel}</div>
                                <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                                <div className="mb-4">
                                  <div className="flex justify-between mb-1 text-sm">
                                    <span>Progreso</span>
                                    <span>{curso.progress}%</span>
                                  </div>
                                  <Progress value={curso.progress} className="h-2" />
                                </div>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <Button asChild>
                                  <Link href={`/cursos/${curso.id}`}>Continuar</Link>
                                </Button>
                                <Button variant="outline" onClick={() => marcarComoCompletado(curso.id)}>
                                  Marcar como completado
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="completados">
                  <div className="space-y-6">
                    {cursosCompletados.length === 0 && (
                      <div className="text-gray-500 text-center py-8">No tienes cursos completados.</div>
                    )}
                    {cursosCompletados.map((curso) => (
                      <Card key={curso.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4">
                            <img
                              src={curso.imagen || "/placeholder.svg"}
                              alt={curso.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="flex-1 p-6">
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <div className="text-sm text-emerald-600 mb-2">{curso.nivel}</div>
                                <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                                <div className="flex items-center text-emerald-600 mb-4">
                                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>Completado</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Completado el: {curso.completedDate}</span>
                                <Button variant="outline" asChild>
                                  <Link href={`/cursos/${curso.id}`}>Ver curso</Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="favoritos">
                  <div className="space-y-6">
                    {favorites.map((curso) => (
                      <Card key={curso.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4">
                            <img
                              src={curso.imagen || "/placeholder.svg"}
                              alt={curso.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="flex-1 p-6">
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <div className="text-sm text-emerald-600 mb-2">{curso.nivel}</div>
                                <h3 className="text-lg font-semibold mb-2">{curso.nombre}</h3>
                                <div className="flex items-center text-gray-500 mb-4">
                                  <Heart className="w-4 h-4 mr-1 text-red-500 fill-current" />
                                  <span className="text-sm">Guardado en favoritos</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Guardado el: {curso.savedDate}</span>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => removeFavorite(curso.id)}>
                                    <Heart className="w-4 h-4 mr-1 text-red-500 fill-current" />
                                    <span>Quitar</span>
                                  </Button>
                                  <Button asChild>
                                    <Link href={`/cursos/${curso.id}`}>Ver curso</Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
