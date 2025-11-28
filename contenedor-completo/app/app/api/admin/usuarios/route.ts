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

export async function GET() {
  try {
    const snapshot = await db.collection('users').get();
    const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ok: true, usuarios });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
} 