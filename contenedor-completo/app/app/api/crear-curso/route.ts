import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount as any),
      storageBucket: "eduplus-2cadd.appspot.com"
    });
    console.log('Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
  }
}

const db = getFirestore();

export async function POST(req: Request) {
  try {
    console.log('Iniciando creación de curso');
    const contentType = req.headers.get('content-type') || '';
    console.log('Content-Type recibido:', contentType);

    if (contentType.includes('multipart/form-data')) {
      // @ts-ignore
      const formData = await req.formData();
      const data: any = {};

      for (const [key, value] of formData.entries()) {
        if (key === 'imagenUrl') {
          const imageUrl = value.toString();
          console.log('URL de imagen recibida:', imageUrl);
          // Validar que sea una URL válida
          try {
            new URL(imageUrl);
            data.imagen = imageUrl;
            console.log('URL de imagen válida, guardada en:', imageUrl);
          } catch (error) {
            console.error('URL de imagen inválida:', error);
            return NextResponse.json({ error: 'URL de imagen inválida' }, { status: 400 });
          }
        } else {
          data[key] = value;
        }
      }

      // Procesar campos complejos
      data.requisitos = (data.requisitos || '').split('\n').map((r: string) => r.trim()).filter(Boolean);
      data.temario = (data.temario || '').split('\n').map((t: string) => t.trim()).filter(Boolean);
      data.materiales = (data.materiales || '').split('\n').map((m: string) => {
        const [nombre, url] = m.split('|');
        return nombre && url ? { nombre: nombre.trim(), url: url.trim() } : null;
      }).filter(Boolean);

      if (typeof data.modulos === 'string') {
        try {
          data.modulos = JSON.parse(data.modulos).map((mod: any) => ({
            titulo: mod.titulo || '',
            contenido: mod.contenido || '',
            materiales: Array.isArray(mod.materiales) ? mod.materiales : [],
            videoUrl: mod.videoUrl || ''
          }));
        } catch {
          data.modulos = [];
        }
      }
      data.titulo = data.nombre || data.titulo || '';
      data.comentarios = Array.isArray(data.comentarios) ? data.comentarios : [];
      data.descripcion = data.descripcion || '';
      data.nivel = data.nivel || '';
      data.duracion = data.duracion || '';
      data.categoria = data.categoria || '';
      data.requisitos = Array.isArray(data.requisitos) ? data.requisitos : [];
      data.temario = Array.isArray(data.temario) ? data.temario : [];
      data.materiales = Array.isArray(data.materiales) ? data.materiales : [];
      data.modulos = Array.isArray(data.modulos) ? data.modulos : [];
      if (!data.titulo || !data.categoria || !data.descripcion) {
        return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
      }
      const cursoRef = await db.collection('cursos').add(data);
      console.log('Curso creado exitosamente con ID:', cursoRef.id);
      return NextResponse.json({ ok: true, id: cursoRef.id });
    } else {
      return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error al crear el curso:', error);
    return NextResponse.json({ 
      error: 'Error al crear el curso', 
      details: error?.message || 'Error desconocido',
      stack: error?.stack || ''
    }, { status: 500 });
  }
} 