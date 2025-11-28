import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

// Asegurarnos de que el bucket existe y está correctamente configurado
const BUCKET_NAME = "eduplus-2cadd.appspot.com";

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount as any),
      storageBucket: BUCKET_NAME
    });
    console.log('Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
  }
}

const db = getFirestore();
const bucket = admin.storage().bucket(BUCKET_NAME);

// Verificar que el bucket existe
bucket.exists().then(([exists]) => {
  if (!exists) {
    console.error(`El bucket ${BUCKET_NAME} no existe`);
  } else {
    console.log(`Bucket ${BUCKET_NAME} verificado correctamente`);
  }
}).catch(error => {
  console.error('Error al verificar el bucket:', error);
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('Iniciando edición de curso');
    const cursoId = params.id;
    console.log('ID del curso a editar:', cursoId);

    if (!cursoId) {
      return NextResponse.json({ error: 'ID de curso no proporcionado' }, { status: 400 });
    }

    // Verificar que el curso existe
    const cursoRef = db.collection('cursos').doc(cursoId);
    const cursoDoc = await cursoRef.get();
    
    if (!cursoDoc.exists) {
      console.log('Curso no encontrado:', cursoId);
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';
    console.log('Content-Type recibido:', contentType);

    if (contentType.includes('multipart/form-data')) {
      console.log('Procesando form-data');
      // @ts-ignore
      const formData = await req.formData();
      const data: any = {};

      for (const [key, value] of formData.entries()) {
        console.log('Procesando campo:', key);
        
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

      console.log('Actualizando curso en Firestore');
      await cursoRef.update(data);
      console.log('Curso actualizado exitosamente');
      
      return NextResponse.json({ ok: true, id: cursoId });
    } else {
      console.log('Error: Formato no soportado');
      return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error al editar el curso:', error);
    return NextResponse.json({ 
      error: 'Error al editar el curso', 
      details: error?.message || 'Error desconocido',
      stack: error?.stack || ''
    }, { status: 500 });
  }
} 