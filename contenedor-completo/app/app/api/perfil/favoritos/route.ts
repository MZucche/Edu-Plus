import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    storageBucket: "eduplus-2cadd.appspot.com"
  });
}
const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const { uid, curso } = await req.json();
    if (!uid || !curso || !curso.id) return NextResponse.json({ ok: false, error: 'Datos requeridos' }, { status: 400 });
    await db.collection(`users/${uid}/favoritos`).doc(curso.id).set(curso, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { uid, cursoId } = await req.json();
    if (!uid || !cursoId) return NextResponse.json({ ok: false, error: 'Datos requeridos' }, { status: 400 });
    await db.collection(`users/${uid}/favoritos`).doc(cursoId).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
} 