import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';

export interface Curso {
  id?: string;
  titulo: string;
  descripcion: string;
  duracion: string;
  nivel: string;
  precio: number;
  imagen: string;
  instructor: string;
  categoria: string;
  fechaCreacion?: Date;
}

export const cursosService = {
  // Obtener todos los cursos
  async getAllCursos(): Promise<Curso[]> {
    const cursosRef = collection(db, 'cursos');
    const snapshot = await getDocs(cursosRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Curso));
  },

  // Obtener un curso por ID
  async getCursoById(id: string): Promise<Curso | null> {
    const cursoRef = doc(db, 'cursos', id);
    const cursoDoc = await getDoc(cursoRef);
    if (cursoDoc.exists()) {
      return {
        id: cursoDoc.id,
        ...cursoDoc.data()
      } as Curso;
    }
    return null;
  },

  // Crear un nuevo curso
  async createCurso(curso: Omit<Curso, 'id'>): Promise<string> {
    const cursosRef = collection(db, 'cursos');
    const docRef = await addDoc(cursosRef, {
      ...curso,
      fechaCreacion: new Date()
    });
    return docRef.id;
  },

  // Actualizar un curso
  async updateCurso(id: string, curso: Partial<Curso>): Promise<void> {
    const cursoRef = doc(db, 'cursos', id);
    await updateDoc(cursoRef, curso);
  },

  // Eliminar un curso
  async deleteCurso(id: string): Promise<void> {
    const cursoRef = doc(db, 'cursos', id);
    await deleteDoc(cursoRef);
  },

  // Buscar cursos por categoría
  async getCursosByCategoria(categoria: string): Promise<Curso[]> {
    const cursosRef = collection(db, 'cursos');
    const q = query(cursosRef, where('categoria', '==', categoria));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Curso));
  }
}; 