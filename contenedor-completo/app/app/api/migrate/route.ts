import { NextResponse } from 'next/server';
import { cursosService } from '@/lib/cursos';

const cursosEjemplo = [
  {
    titulo: "Desarrollo Web Full Stack",
    descripcion: "Aprende a crear aplicaciones web completas con las últimas tecnologías.",
    duracion: "6 meses",
    nivel: "Intermedio",
    precio: 299.99,
    imagen: "/cursos/web-fullstack.jpg",
    instructor: "Juan Pérez",
    categoria: "Desarrollo Web"
  },
  {
    titulo: "Machine Learning con Python",
    descripcion: "Introducción a la inteligencia artificial y machine learning.",
    duracion: "4 meses",
    nivel: "Avanzado",
    precio: 399.99,
    imagen: "/cursos/ml-python.jpg",
    instructor: "María García",
    categoria: "Inteligencia Artificial"
  },
  {
    titulo: "Diseño UX/UI",
    descripcion: "Aprende a crear interfaces de usuario atractivas y funcionales.",
    duracion: "3 meses",
    nivel: "Principiante",
    precio: 199.99,
    imagen: "/cursos/ux-ui.jpg",
    instructor: "Carlos Rodríguez",
    categoria: "Diseño"
  },
  {
    titulo: "Marketing Digital",
    descripcion: "Estrategias efectivas de marketing en el mundo digital.",
    duracion: "3 meses",
    nivel: "Intermedio",
    precio: 249.99,
    imagen: "/cursos/marketing.jpg",
    instructor: "Ana Martínez",
    categoria: "Marketing"
  },
  {
    titulo: "Desarrollo Móvil con React Native",
    descripcion: "Crea aplicaciones móviles multiplataforma con React Native.",
    duracion: "5 meses",
    nivel: "Intermedio",
    precio: 349.99,
    imagen: "/cursos/react-native.jpg",
    instructor: "Luis Sánchez",
    categoria: "Desarrollo Móvil"
  },
  {
    titulo: "DevOps y CI/CD",
    descripcion: "Aprende las mejores prácticas de DevOps y automatización.",
    duracion: "4 meses",
    nivel: "Avanzado",
    precio: 379.99,
    imagen: "/cursos/devops.jpg",
    instructor: "Pedro Gómez",
    categoria: "DevOps"
  }
];

export async function GET() {
  try {
    const resultados = [];
    for (const curso of cursosEjemplo) {
      const id = await cursosService.createCurso(curso);
      resultados.push({ id, titulo: curso.titulo });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migración completada exitosamente',
      resultados 
    });
  } catch (error) {
    console.error('Error durante la migración:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error durante la migración',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 