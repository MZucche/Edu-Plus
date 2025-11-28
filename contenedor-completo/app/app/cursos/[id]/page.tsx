"use client";
import Link from "next/link"
import { Play, Download, Star, CheckCircle, BookOpen, Heart, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState, use, useReducer } from "react"
import { useAuth } from '@/lib/AuthContext';
import { agregarCursoUsuario, getCursosUsuario, agregarComentarioCurso, getComentariosCurso, useFavoritosCursos, guardarProgresoCurso, obtenerProgresoCurso, quitarCursoUsuario, completarCurso } from '@/lib/cursosUsuario';
import { Header } from "@/components/Header"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Reducer para manejar el estado del curso
type CursoState = {
  moduloActual: number;
  completados: boolean[];
  isFavorite: boolean;
  comments: any[];
  commentText: string;
  rating: number;
};

type CursoAction = 
  | { type: 'SET_MODULO'; payload: number }
  | { type: 'TOGGLE_COMPLETADO'; payload: number }
  | { type: 'TOGGLE_FAVORITO' }
  | { type: 'ADD_COMMENT'; payload: any }
  | { type: 'SET_COMMENTS'; payload: any[] }
  | { type: 'SET_COMMENT_TEXT'; payload: string }
  | { type: 'SET_RATING'; payload: number }
  | { type: 'RESET_PROGRESS'; payload: number }
  | { type: 'LOAD_PROGRESS'; payload: boolean[] }
  | { type: 'MARK_MODULE_COMPLETED'; payload: number };

const cursoReducer = (state: CursoState, action: CursoAction): CursoState => {
  switch (action.type) {
    case 'SET_MODULO':
      return { ...state, moduloActual: action.payload };
    case 'TOGGLE_COMPLETADO':
      return {
        ...state,
        completados: state.completados.map((c, i) => 
          i === action.payload ? !Boolean(c) : Boolean(c)
        )
      };
    case 'TOGGLE_FAVORITO':
      return { ...state, isFavorite: !state.isFavorite };
    case 'ADD_COMMENT':
      return { ...state, comments: [action.payload, ...state.comments] };
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    case 'SET_COMMENT_TEXT':
      return { ...state, commentText: action.payload };
    case 'SET_RATING':
      return { ...state, rating: action.payload };
    case 'RESET_PROGRESS':
      return { ...state, completados: Array(action.payload).fill(false) };
    case 'LOAD_PROGRESS':
      // Asegurar que todos los valores son booleanos
      const completadosLimpios = action.payload.map((c: any) => Boolean(c));
      return { ...state, completados: completadosLimpios };
    case 'MARK_MODULE_COMPLETED':
      return {
        ...state,
        completados: state.completados.map((c, i) => 
          i === action.payload ? true : Boolean(c)
        )
      };
    default:
      return state;
  }
};

// Componente de navegación del slider
const SliderNavigation = ({ 
  current, 
  total, 
  onPrev, 
  onNext, 
  onDotClick 
}: { 
  current: number; 
  total: number; 
  onPrev: () => void; 
  onNext: () => void; 
  onDotClick: (index: number) => void;
}) => (
  <>
    <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
        disabled={current === 0}
        onClick={onPrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
        disabled={current === total - 1}
        onClick={onNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          className={`w-3 h-3 rounded-full transition-all ${
            idx === current 
              ? 'bg-emerald-600 scale-125' 
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          onClick={() => onDotClick(idx)}
          aria-label={`Ir al módulo ${idx + 1}`}
        />
      ))}
    </div>
  </>
);

// Función para extraer el ID de YouTube
function extraerIdYoutube(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}

// Componente de notificación
const Notification = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
    type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
  }`}>
    <span>{message}</span>
    <button onClick={onClose} className="p-1 hover:opacity-70">
      <X className="h-4 w-4" />
    </button>
  </div>
);

export default function CursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const { id } = use(params);
  const [curso, setCurso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, logout, emailVerified, resendVerification } = useAuth();
  const [inscrito, setInscrito] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [mostrarSoloCompletados, setMostrarSoloCompletados] = useState(false);
  const [cursoCompletado, setCursoCompletado] = useState(false);

  const [state, dispatch] = useReducer(cursoReducer, {
    moduloActual: 0,
    completados: [],
    isFavorite: false,
    comments: [],
    commentText: "",
    rating: 0
  });

  const { favoritos, addFavorito, removeFavorito, isFavorito } = useFavoritosCursos();

  // Función para marcar un módulo como completado y persistir en Firebase
  const marcarModuloCompletado = async (indiceModulo: number) => {
    if (!user || !curso || indiceModulo < 0 || indiceModulo >= modulos.length) return;
    if (state.completados[indiceModulo]) return; // Ya está completado
    
    dispatch({ type: 'MARK_MODULE_COMPLETED', payload: indiceModulo });
    
    // Crear el nuevo array de completados asegurando que tenga el tamaño correcto
    const nuevosCompletados = Array(modulos.length).fill(false);
    
    // Copiar los valores existentes
    for (let i = 0; i < state.completados.length && i < nuevosCompletados.length; i++) {
      nuevosCompletados[i] = Boolean(state.completados[i]);
    }
    
    // Marcar el módulo actual como completado
    nuevosCompletados[indiceModulo] = true;
    
    // Guardar en Firebase
    const exito = await guardarProgresoCurso(user.uid, curso.id, nuevosCompletados);
    
    if (exito) {
      setNotification({
        message: `Módulo ${indiceModulo + 1} marcado como completado`,
        type: 'success'
      });
    } else {
      setNotification({
        message: 'Error al guardar el progreso',
        type: 'error'
      });
    }
    
    // Ocultar notificación después de 2 segundos
    setTimeout(() => setNotification(null), 2000);
  };

  // Función para finalizar el curso
  const finalizarCurso = async () => {
    if (!user || !curso) return;
    
    // Confirmar con el usuario
    const confirmar = window.confirm(
      '¿Estás seguro de que quieres finalizar este curso? Esta acción marcará el curso como completado.'
    );
    
    if (!confirmar) return;
    
    const exito = await completarCurso(user.uid, curso);
    
    if (exito) {
      setCursoCompletado(true);
      setInscrito(false); // Ya no está "en progreso"
      setNotification({
        message: '¡Felicitaciones! Has completado el curso exitosamente',
        type: 'success'
      });
      
      // Mantener la notificación por más tiempo para este evento especial
      setTimeout(() => setNotification(null), 5000);
    } else {
      setNotification({
        message: 'Error al finalizar el curso. Intenta de nuevo.',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
    async function fetchCurso() {
      setLoading(true);
      try {
        const res = await fetch(`/api/cursos/${id}`);
        if (!res.ok) {
          setCurso(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setCurso(data);
        
        // Obtener comentarios de Firebase
        const comentarios = await getComentariosCurso(id);
        if (comentarios && comentarios.length > 0) {
          dispatch({ type: 'SET_COMMENTS', payload: comentarios });
        }
        dispatch({ type: 'RESET_PROGRESS', payload: (data.modulos || []).length });
        
        // Cargar progreso guardado si el usuario está logueado
        if (user && data.modulos) {
          const progresoGuardado = await obtenerProgresoCurso(user.uid, id);
          if (progresoGuardado.length > 0) {
            // Asegurar que el array tiene el tamaño correcto
            const modulosTotales = (data.modulos || []).length + 
                                  (data.materiales || []).length + 
                                  (data.modulos || []).reduce((acc: number, mod: any) => 
                                    acc + (mod.materiales ? mod.materiales.length : 0), 0);
            
            const progresoAjustado = Array(modulosTotales).fill(false);
            for (let i = 0; i < Math.min(progresoGuardado.length, progresoAjustado.length); i++) {
              progresoAjustado[i] = Boolean(progresoGuardado[i]);
            }
            
            dispatch({ type: 'LOAD_PROGRESS', payload: progresoAjustado });
          }
        }
      } catch (error) {
        console.error('Error al cargar el curso:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCurso();
  }, [id, user]);

  useEffect(() => {
    if (!user || !curso) return;
    
    // Verificar si está en progreso
    getCursosUsuario(user.uid, 'enProgreso').then((cursos) => {
      setInscrito(cursos.some((c: any) => c.id === curso.id));
    });
    
    // Verificar si ya está completado
    getCursosUsuario(user.uid, 'completados').then((cursos) => {
      setCursoCompletado(cursos.some((c: any) => c.id === curso.id));
    });
  }, [user, curso]);

  const handleInscribirse = async () => {
    if (!user || !curso) return;
    await agregarCursoUsuario(user.uid, 'enProgreso', { ...curso, id: curso.id });
    setInscrito(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.commentText || state.rating === 0) return;
    
    if (!user) {
      setNotification({
        message: 'Debes iniciar sesión para comentar',
        type: 'error'
      });
      return;
    }
    
    const userName = user.displayName || user.email?.split('@')[0] || "Usuario";
    const today = new Date();
    const date = today.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
    
    const nuevoComentario = {
      usuario: userName,
      fecha: date,
      calificacion: state.rating,
      comentario: state.commentText,
      userId: user.uid,
      userEmail: user.email,
      timestamp: new Date().toISOString()
    };

    // Guardar comentario en Firebase
    const exito = await agregarComentarioCurso(id, nuevoComentario);
    
    if (exito) {
      dispatch({
        type: 'ADD_COMMENT',
        payload: nuevoComentario
      });
      dispatch({ type: 'SET_COMMENT_TEXT', payload: "" });
      dispatch({ type: 'SET_RATING', payload: 0 });
      setNotification({
        message: 'Comentario agregado exitosamente',
        type: 'success'
      });
    } else {
      setNotification({
        message: 'Error al guardar el comentario',
        type: 'error'
      });
    }

    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const progreso = state.completados.length > 0 
    ? Math.round((state.completados.filter(Boolean).length / state.completados.length) * 100) 
    : 0;

  if (user && !emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-emerald-700">Verifica tu correo electrónico</h2>
          <p className="mb-4">Debes verificar tu dirección de correo electrónico para acceder a los cursos.</p>
          <button
            className="mt-2 underline text-emerald-700"
            onClick={async () => { await resendVerification(); alert('Correo de verificación reenviado.'); }}
          >
            Reenviar correo de verificación
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Curso no encontrado</h2>
          <p className="text-gray-600 mb-4">El curso que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link href="/cursos">Volver a cursos</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Crear una lista combinada de todos los módulos (videos + PDFs)
  const crearModulosCombinados = (curso: any) => {
    const modulosCombinados: any[] = [];
    
    // Agregar módulos de video
    if (curso.modulos) {
      curso.modulos.forEach((mod: any, idx: number) => {
        modulosCombinados.push({
          ...mod,
          tipo: 'video',
          indiceOriginal: idx,
          id: `video-${idx}`
        });
        
        // Agregar PDFs de cada módulo como módulos independientes
        if (mod.materiales) {
          mod.materiales.forEach((mat: any, matIdx: number) => {
            modulosCombinados.push({
              titulo: `📄 ${mat.nombre}`,
              tipo: 'pdf',
              url: mat.url,
              indiceOriginal: idx,
              materialIndex: matIdx,
              id: `pdf-mod-${idx}-${matIdx}`
            });
          });
        }
      });
    }
    
    // Agregar PDFs generales del curso como módulos independientes
    if (curso.materiales) {
      curso.materiales.forEach((mat: any, matIdx: number) => {
        modulosCombinados.push({
          titulo: `📄 ${mat.nombre}`,
          tipo: 'pdf',
          url: mat.url,
          indiceOriginal: -1, // -1 indica que es un material general
          materialIndex: matIdx,
          id: `pdf-general-${matIdx}`
        });
      });
    }
    
    return modulosCombinados;
  };

  const modulos = curso ? crearModulosCombinados(curso) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} />
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Breadcrumbs mejorados */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-emerald-600 transition-colors">
              Inicio
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/cursos" className="text-gray-500 hover:text-emerald-600 transition-colors">
              Cursos
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800 font-medium">{curso.nombre}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            {/* Slider visual solo con dots debajo del video, sin flechas */}
            <div className="relative overflow-hidden mb-8 bg-white rounded-xl shadow-lg">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${state.moduloActual * 100}%)` }}
              >
                {modulos.map((mod: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="w-full flex-shrink-0"
                  >
                    <div 
                      className="relative bg-gray-900 rounded-t-xl overflow-hidden aspect-video"
                    >
                      {mod.tipo === 'pdf' ? (
                        // Módulo de PDF
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700">
                          <div className="text-center text-white p-8">
                            <BookOpen className="h-16 w-16 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">{mod.titulo}</h3>
                            <p className="mb-6 opacity-90">Material en formato PDF</p>
                            <a 
                              href={mod.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={() => marcarModuloCompletado(idx)}
                              className="inline-block"
                            >
                              <Button className="bg-white text-emerald-700 hover:bg-gray-100 flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Descargar PDF
                              </Button>
                            </a>
                          </div>
                        </div>
                      ) : (mod.videoUrl && (mod.videoUrl.includes("youtube.com") || mod.videoUrl.includes("youtu.be"))) ? (
                        <div className="absolute top-0 left-0 w-full h-full">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${extraerIdYoutube(mod.videoUrl)}?enablejsapi=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                          {/* Overlay invisible para capturar clicks */}
                          <div 
                            className="absolute top-0 left-0 w-full h-8 bg-transparent cursor-pointer z-10"
                            onClick={() => marcarModuloCompletado(idx)}
                            title="Haz clic aquí para marcar como completado"
                          />
                        </div>
                      ) : mod.videoUrl ? (
                        <video 
                          controls 
                          className="absolute top-0 left-0 w-full h-full object-cover"
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarModuloCompletado(idx);
                          }}
                        >
                          <source src={mod.videoUrl} type="video/mp4" />
                          Tu navegador no soporta el video.
                        </video>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                          <p className="text-white text-lg">No hay video disponible para este módulo</p>
                        </div>
                      )}
                      {/* Indicador de completado superpuesto */}
                      {state.completados[idx] && (
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Barra de navegación de módulos justo debajo del video */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                disabled={state.moduloActual === 0}
                onClick={() => dispatch({ type: 'SET_MODULO', payload: state.moduloActual - 1 })}
              >
                Anterior
              </Button>
              <div className="flex flex-col items-center gap-2">
                <span className="font-medium text-lg">
                  Módulo {state.moduloActual + 1} de {modulos.length}: {modulos[state.moduloActual]?.titulo}
                </span>
                <span className="text-sm text-gray-600">
                  {modulos[state.moduloActual]?.tipo === 'pdf' ? '📄 Documento PDF' : '🎥 Video'}
                </span>
                {!state.completados[state.moduloActual] && (
                  <Button
                    size="sm"
                    onClick={() => marcarModuloCompletado(state.moduloActual)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Marcar completado
                  </Button>
                )}
                {state.completados[state.moduloActual] && (
                  <div className="flex items-center gap-1 text-emerald-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Completado</span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={state.moduloActual === modulos.length - 1}
                onClick={() => dispatch({ type: 'SET_MODULO', payload: state.moduloActual + 1 })}
              >
                Siguiente
              </Button>
            </div>

            {/* Tabs mejorados */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <Tabs defaultValue="descripcion" className="w-full">
                <TabsList className="w-full grid grid-cols-3 p-1 bg-gray-50">
                  <TabsTrigger value="descripcion" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Descripción
                  </TabsTrigger>
                  <TabsTrigger value="material" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Material
                  </TabsTrigger>
                  <TabsTrigger value="comentarios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Comentarios
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="descripcion" className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{curso.nombre}</h2>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                      Nivel: {curso.nivel}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      Duración: {curso.duracion}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      Requisitos: {curso.requisitos?.join(', ')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">{curso.descripcion}</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Objetivos</h3>
                      <ul className="space-y-2">
                        {curso.objetivos?.map((obj: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Temario</h3>
                      <ul className="space-y-2">
                        {curso.temario?.map((tema: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-medium">{idx + 1}.</span>
                            <span>{tema}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="material" className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Información del material</h2>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <BookOpen className="h-8 w-8 text-emerald-600" />
                      <div>
                        <h3 className="text-xl font-semibold text-emerald-800">Materiales integrados</h3>
                        <p className="text-emerald-700">Los PDFs y materiales ahora son módulos independientes</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle className="h-5 w-5" />
                        <span>Todos los materiales aparecen como módulos en el progreso del curso</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle className="h-5 w-5" />
                        <span>Al descargar un PDF se marca automáticamente como completado</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle className="h-5 w-5" />
                        <span>Navega entre videos y PDFs usando los controles superiores</span>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-white rounded-lg border border-emerald-100">
                      <p className="text-sm text-gray-600">
                        <strong>Tip:</strong> Usa las flechas "Anterior" y "Siguiente" para navegar entre todos los módulos, 
                        incluyendo videos y documentos PDF.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comentarios" className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Comentarios de estudiantes</h2>
                  <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <Textarea
                      placeholder="Escribe tu comentario..."
                      className="mb-4"
                      value={state.commentText}
                      onChange={e => dispatch({ type: 'SET_COMMENT_TEXT', payload: e.target.value })}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Tu calificación:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 cursor-pointer transition-colors ${
                                star <= state.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                              onClick={() => dispatch({ type: 'SET_RATING', payload: star })}
                            />
                          ))}
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!state.commentText || state.rating === 0}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Enviar comentario
                      </Button>
                    </div>
                  </form>

                  <div className="space-y-6">
                    {state.comments.map((comment, index) => (
                      <div key={index} className="bg-white border rounded-lg p-6 hover:border-emerald-500 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {(comment.usuario || comment.name || "A").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{comment.usuario || comment.name}</h4>
                              <p className="text-sm text-gray-500">{comment.fecha || comment.date}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (comment.calificacion || comment.rating) 
                                    ? "text-yellow-400" 
                                    : "text-gray-300"
                                } fill-current`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{comment.comentario || comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar mejorado */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Progreso del curso</h3>
                <button
                  onClick={() => setMostrarSoloCompletados(!mostrarSoloCompletados)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
                  title={mostrarSoloCompletados ? "Mostrar todos los módulos" : "Mostrar solo completados"}
                >
                  {mostrarSoloCompletados ? "Todos" : "Solo ✓"}
                </button>
              </div>
              <div className="mb-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium">Completado</span>
                  <span className="text-emerald-600 font-medium">{progreso}%</span>
                </div>
                <Progress 
                  value={progreso} 
                  className="h-2 bg-gray-100"
                />
              </div>
              <div className="space-y-4 mb-6">
                {modulos
                  .filter((mod: any, idx: number) => !mostrarSoloCompletados || state.completados[idx])
                  .length === 0 && mostrarSoloCompletados ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No hay módulos completados aún</p>
                    <button
                      onClick={() => setMostrarSoloCompletados(false)}
                      className="text-emerald-600 text-xs mt-1 hover:underline"
                    >
                      Ver todos los módulos
                    </button>
                  </div>
                ) : (
                  modulos
                    .filter((mod: any, idx: number) => !mostrarSoloCompletados || state.completados[idx])
                    .map((mod: any, idx: number) => {
                      // Necesitamos el índice original para el estado de completado
                      const indiceOriginal = modulos.findIndex(m => m.id === mod.id);
                      return (
                  <div 
                    key={mod.id || idx} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={async () => {
                        dispatch({ type: 'TOGGLE_COMPLETADO', payload: indiceOriginal });
                        // Persistir el cambio en Firebase
                        if (user && curso) {
                          // Crear array con el tamaño correcto
                          const nuevosCompletados = Array(modulos.length).fill(false);
                          
                          // Copiar valores existentes
                          for (let i = 0; i < state.completados.length && i < nuevosCompletados.length; i++) {
                            nuevosCompletados[i] = Boolean(state.completados[i]);
                          }
                          
                          // Toggle el valor del módulo específico
                          nuevosCompletados[indiceOriginal] = !nuevosCompletados[indiceOriginal];
                          
                          await guardarProgresoCurso(user.uid, curso.id, nuevosCompletados);
                        }
                      }}
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        state.completados[indiceOriginal]
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-gray-300 bg-white text-gray-300 hover:border-emerald-500"
                      }`}
                      aria-label={state.completados[indiceOriginal] ? "Desmarcar módulo" : "Marcar como completado"}
                    >
                      {state.completados[indiceOriginal] ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <div className="h-3 w-3 rounded-full" />
                      )}
                    </button>
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => dispatch({ type: 'SET_MODULO', payload: indiceOriginal })}
                      title="Ir a este módulo"
                    >
                      <span className={`text-sm font-medium hover:text-emerald-600 transition-colors ${
                        state.moduloActual === indiceOriginal ? 'text-emerald-600' : 'text-gray-800'
                      }`}>
                        {mod.titulo}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        {mod.tipo === 'pdf' ? '📄 PDF' : '🎥 Video'}
                        {state.moduloActual === indiceOriginal && (
                          <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                            Actual
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                    );
                  })
                )}
              </div>
                              {cursoCompletado ? (
                  <div className="w-full mb-3 bg-emerald-100 border-2 border-emerald-500 text-emerald-800 p-3 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">¡Curso Completado!</span>
                    </div>
                    <p className="text-sm mt-1 opacity-75">Has terminado este curso exitosamente</p>
                  </div>
                ) : (
                  <Button 
                    className="w-full mb-3 bg-emerald-600 hover:bg-emerald-700" 
                    disabled={progreso < 100}
                    onClick={finalizarCurso}
                  >
                    {progreso >= 100 ? "Finalizar curso" : `Completa ${100 - progreso}% más para finalizar`}
                  </Button>
                )}
              <Button 
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-2" 
                variant="outline"
                onClick={() => {
                  if (!curso) return;
                  if (isFavorito(curso.id)) {
                    removeFavorito(curso.id);
                  } else {
                    addFavorito({ ...curso, id: curso.id });
                  }
                }}
              >
                {isFavorito(curso?.id) ? (
                  <>
                    <Heart className="h-5 w-5 text-emerald-600 fill-emerald-600" />
                    Quitar de favoritos
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5" />
                    Añadir a favoritos
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
