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

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: 'ID requerido' }, { status: 400 });
    await db.collection('users').doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
} 