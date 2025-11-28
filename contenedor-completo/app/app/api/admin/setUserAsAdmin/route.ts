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
    const { email } = await req.json();
    if (!email) return NextResponse.json({ ok: false, error: 'Email requerido' }, { status: 400 });
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) {
      const newUserRef = usersRef.doc();
      await newUserRef.set({
        email,
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true });
    } else {
      const userDoc = snapshot.docs[0];
      await userDoc.ref.set(
        { role: 'admin', updatedAt: new Date().toISOString() },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Error inesperado' }, { status: 500 });
  }
} 