"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export default function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    descripcion: "",
    nivel: "Básico",
    duracion: "",
    requisitos: "",
    temario: "",
    materiales: "",
    imagen: "",
  });
  const [preview, setPreview] = useState<string>("");
  const [numModulos, setNumModulos] = useState(1);
  const [modulos, setModulos] = useState([{ titulo: '', contenido: '', videoUrl: '', materiales: [{ nombre: '', url: '' }] }]);

  useEffect(() => {
    async function fetchCurso() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/cursos/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el curso");
        const data = await res.json();
        setForm({
          nombre: data.nombre || data.titulo || "",
          categoria: data.categoria || "",
          descripcion: data.descripcion || "",
          nivel: data.nivel || "Básico",
          duracion: data.duracion || "",
          requisitos: (data.requisitos || []).join("\n"),
          temario: (data.temario || []).join("\n"),
          materiales: (data.materiales || []).map((m: any) => `${m.nombre} | ${m.url}`).join("\n"),
          imagen: data.imagen || "",
        });
        setPreview(data.imagen || "");
        setNumModulos((data.modulos || []).length || 1);
        setModulos((data.modulos && data.modulos.length > 0) ? data.modulos : [{ titulo: '', contenido: '', videoUrl: '', materiales: [{ nombre: '', url: '' }] }]);
      } catch (err: any) {
        setError(err.message || "Error inesperado");
      } finally {
        setLoading(false);
      }
    }
    fetchCurso();
    // eslint-disable-next-line
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'imagen') {
      setPreview(value);
    }
  };

  const handleNumModulosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cantidad = Math.max(1, parseInt(e.target.value) || 1);
    setNumModulos(cantidad);
    setModulos((prev) => {
      if (cantidad > prev.length) {
        return [
          ...prev,
          ...Array(cantidad - prev.length).fill({ titulo: '', contenido: '', videoUrl: '', materiales: [{ nombre: '', url: '' }] })
        ];
      } else {
        return prev.slice(0, cantidad);
      }
    });
  };

  const handleModuloChange = (idx: number, field: 'titulo' | 'contenido' | 'videoUrl', value: string) => {
    setModulos((prev) => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const handleMaterialChange = (modIdx: number, matIdx: number, field: 'nombre' | 'url', value: string) => {
    setModulos((prev) => prev.map((m, i) =>
      i === modIdx
        ? { ...m, materiales: m.materiales.map((mat: any, j: number) => j === matIdx ? { ...mat, [field]: value } : mat) }
        : m
    ));
  };

  const addMaterial = (modIdx: number) => {
    setModulos((prev) => prev.map((m, i) =>
      i === modIdx ? { ...m, materiales: [...m.materiales, { nombre: '', url: '' }] } : m
    ));
  };

  const removeMaterial = (modIdx: number, matIdx: number) => {
    setModulos((prev) => prev.map((m, i) =>
      i === modIdx ? { ...m, materiales: m.materiales.filter((_: any, j: number) => j !== matIdx) } : m
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("imagenUrl", form.imagen);
      formData.append("modulos", JSON.stringify(
        modulos.map(mod => ({
          ...mod,
          materiales: Array.isArray(mod.materiales) ? mod.materiales : [],
          videoUrl: mod.videoUrl || "",
          titulo: mod.titulo || "",
          contenido: mod.contenido || ""
        }))
      ));
      const res = await fetch(`/api/editar-curso/${id}`, {
        method: "PUT",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.details || "Error al editar el curso");
      setSuccess("¡Curso editado exitosamente!");
      setTimeout(() => router.push("/admin/cursos"), 1200);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-extrabold mb-8 text-emerald-700 text-center flex items-center justify-center gap-2">
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Editar curso
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-emerald-100">
        {/* Sección: Información general */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-emerald-600 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Información general
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Nombre</label>
              <Input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: Introducción a React" />
            </div>
            <div>
              <label className="block font-medium mb-1">Categoría</label>
              <Input name="categoria" value={form.categoria} onChange={handleChange} required placeholder="Ej: Desarrollo Web" />
            </div>
            <div>
              <label className="block font-medium mb-1">Nivel</label>
              <Input name="nivel" value={form.nivel} onChange={handleChange} required placeholder="Ej: Básico, Intermedio, Avanzado" />
            </div>
            <div>
              <label className="block font-medium mb-1">Duración</label>
              <Input name="duracion" value={form.duracion} onChange={handleChange} required placeholder="Ej: 4 semanas" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block font-medium mb-1">Descripción</label>
            <Textarea name="descripcion" value={form.descripcion} onChange={handleChange} required placeholder="Describe brevemente el curso..." />
          </div>
        </div>
        {/* Sección: Imagen */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-emerald-600 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h16a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1zm0 0V5a2 2 0 012-2h14a2 2 0 012 2v2" /></svg>
            Imagen del curso
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Input 
              type="text" 
              name="imagen" 
              value={form.imagen} 
              onChange={handleChange} 
              placeholder="URL de la imagen (ej: https://ejemplo.com/imagen.jpg)" 
              className="w-full md:w-auto" 
            />
            {preview && (
              <div className="mt-2 flex justify-center w-full">
                <Image src={preview} alt="Previsualización" width={220} height={140} className="rounded-xl border shadow" />
              </div>
            )}
          </div>
        </div>
        {/* Sección: Requisitos, Temario, Materiales generales */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-medium mb-1">Requisitos (uno por línea)</label>
            <Textarea name="requisitos" value={form.requisitos} onChange={handleChange} placeholder="Ej: Saber HTML\nTener cuenta de Google" />
          </div>
          <div>
            <label className="block font-medium mb-1">Temario (uno por línea)</label>
            <Textarea name="temario" value={form.temario} onChange={handleChange} placeholder="Ej: Introducción\nComponentes\nHooks" />
          </div>
          <div>
            <label className="block font-medium mb-1">Materiales (nombre | url, uno por línea)</label>
            <Textarea name="materiales" value={form.materiales} onChange={handleChange} placeholder="Ej: Guía | https://..." />
          </div>
        </div>
        {/* Sección: Módulos */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-emerald-600 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4" /></svg>
            Módulos del curso
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <label className="font-medium">Cantidad de módulos:</label>
            <Input type="number" min={1} value={numModulos} onChange={handleNumModulosChange} className="w-24" />
          </div>
          <div className="space-y-6">
            {modulos.map((mod, idx) => (
              <div key={idx} className="border rounded-xl p-4 bg-gray-50 shadow-sm relative">
                <div className="absolute top-2 right-2 flex gap-2">
                  {modulos.length > 1 && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => setModulos(modulos.filter((_, i) => i !== idx))}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </Button>
                  )}
                </div>
                <h3 className="font-semibold text-emerald-700 mb-2">Módulo {idx + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Título</label>
                    <Input value={mod.titulo} onChange={e => handleModuloChange(idx, 'titulo', e.target.value)} required placeholder="Ej: Introducción" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Video (URL)</label>
                    <Input value={mod.videoUrl} onChange={e => handleModuloChange(idx, 'videoUrl', e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block font-medium mb-1">Contenido</label>
                  <Textarea value={mod.contenido} onChange={e => handleModuloChange(idx, 'contenido', e.target.value)} required placeholder="Describe el contenido del módulo..." />
                </div>
                <div className="mt-2">
                  <label className="block font-medium mb-1">Materiales</label>
                  {mod.materiales.map((mat, matIdx) => (
                    <div key={matIdx} className="flex gap-2 mb-2">
                      <Input
                        value={mat.nombre}
                        onChange={e => handleMaterialChange(idx, matIdx, 'nombre', e.target.value)}
                        placeholder="Nombre del material"
                        className="w-1/2"
                      />
                      <Input
                        value={mat.url}
                        onChange={e => handleMaterialChange(idx, matIdx, 'url', e.target.value)}
                        placeholder="URL"
                        className="w-1/2"
                      />
                      <Button type="button" variant="destructive" onClick={() => removeMaterial(idx, matIdx)} disabled={mod.materiales.length === 1}>-</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => addMaterial(idx)} className="mb-2">Agregar material</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button type="button" variant="outline" onClick={() => setModulos([...modulos, { titulo: '', contenido: '', videoUrl: '', materiales: [{ nombre: '', url: '' }] }])}>
              + Agregar módulo
            </Button>
          </div>
        </div>
        {/* Mensajes de error y éxito */}
        {error && <div className="text-red-600 font-medium text-center bg-red-50 p-2 rounded-lg">{error}</div>}
        {success && <div className="text-green-600 font-medium text-center bg-green-50 p-2 rounded-lg">{success}</div>}
        {/* Botones de acción */}
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/cursos")}>Cancelar</Button>
          <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
            {loading && <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
} 