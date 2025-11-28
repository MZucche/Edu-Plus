"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Upload } from "lucide-react";
import CursosTable from "@/components/CursosTable";
import { useAuth } from '@/lib/AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCursosUsuario, agregarCursoUsuario, quitarCursoUsuario } from '@/lib/cursosUsuario';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  nivel: string;
  duracion: string;
  requisitos?: string[];
  temario?: string[];
  materiales?: { nombre: string; url: string }[];
  modulos?: any[];
  comentarios?: any[];
  imagen?: string;
  videoUrl?: string;
  pdfUrl?: string;
  titulo?: string;
}

export default function CursosAdminPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    nivel: '',
    duracion: '',
  });
  const { user, isAdmin, loading } = useAuth();
  const [completados, setCompletados] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    if (!user || !isAdmin) {
      router.replace('/');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    async function fetchCursos() {
      try {
        const res = await fetch('/api/admin/cursos');
        const data = await res.json();
        if (data.ok) {
          setCursos(data.cursos);
        } else {
          setCursos([]);
        }
      } catch (error) {
        setCursos([]);
        console.error("Error cargando cursos:", error);
      }
    }
    fetchCursos();
  }, []);

  useEffect(() => {
    if (!user) return;
    getCursosUsuario(user.uid, 'completados').then((cursos) => {
      const map: { [id: string]: boolean } = {};
      cursos.forEach((c: any) => { map[c.id] = true; });
      setCompletados(map);
    });
  }, [user]);

  if (loading) return <div>Cargando...</div>;
  if (!user || !isAdmin) return <div>No autorizado</div>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleCrearCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let videoUrl = '';
      let pdfUrl = '';
      let imageUrl = '';

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, `cursos/videos/${Date.now()}_${videoFile.name}`);
      }
      if (pdfFile) {
        pdfUrl = await uploadFile(pdfFile, `cursos/pdfs/${Date.now()}_${pdfFile.name}`);
      }
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, `cursos/images/${Date.now()}_${imageFile.name}`);
      }

      const cursoData = {
        ...formData,
        videoUrl,
        pdfUrl,
        imagen: imageUrl,
        fechaCreacion: new Date().toISOString(),
        instructor: user.email,
        status: 'Publicado',
        students: 0
      };

      const docRef = await addDoc(collection(db, 'cursos'), cursoData);
      setCursos([...cursos, { ...cursoData, id: docRef.id }]);
      setShowModal(false);
      setFormData({
        nombre: '',
        descripcion: '',
        nivel: '',
        duracion: '',
      });
      setVideoFile(null);
      setPdfFile(null);
      setImageFile(null);
    } catch (error) {
      console.error("Error creando curso:", error);
    }
  };

  const handleEliminarCurso = async (id: string) => {
    try {
      const res = await fetch('/api/admin/cursos/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.ok) {
        setCursos(cursos.filter((curso) => curso.id !== id));
      } else {
        console.error("Error eliminando curso:", data.error);
      }
    } catch (error) {
      console.error("Error eliminando curso:", error);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    if (!user) return;
    if (completed) {
      const curso = cursos.find(c => c.id === id);
      if (curso) {
        await agregarCursoUsuario(user.uid, 'completados', curso);
        setCompletados(prev => ({ ...prev, [id]: true }));
      }
    } else {
      await quitarCursoUsuario(user.uid, 'completados', id);
      setCompletados(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Cursos</h1>
        <Button onClick={() => router.push('/admin/cursos/nuevo')} className="flex items-center gap-2">
          <Plus size={16} /> Nuevo curso
        </Button>
      </div>
      <div className="mb-4 flex gap-4">
        <Input
          type="text"
          placeholder="Buscar cursos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <CursosTable
        cursos={cursos.filter(curso =>
          (curso.nombre || curso.titulo || "").toLowerCase().includes(searchTerm.toLowerCase())
        )}
        columns={[
          { key: "nombre", label: "Curso" },
          { key: "descripcion", label: "Descripción" },
          { key: "nivel", label: "Nivel" },
          { key: "duracion", label: "Duración" },
          { key: "instructor", label: "Instructor" },
          { key: "status", label: "Estado" },
        ]}
        onDelete={handleEliminarCurso}
        onToggleComplete={handleToggleComplete}
        completados={completados}
      />
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo curso</h2>
            <form onSubmit={handleCrearCurso} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del curso</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="border rounded w-full p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="border rounded w-full p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nivel</label>
                <input
                  name="nivel"
                  value={formData.nivel}
                  onChange={handleInputChange}
                  className="border rounded w-full p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duración</label>
                <input
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleInputChange}
                  className="border rounded w-full p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Video del curso</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Material PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagen del curso</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Upload size={16} />
                  Subir Curso
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 