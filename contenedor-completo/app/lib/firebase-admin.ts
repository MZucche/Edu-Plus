import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../firebase-config.json';

// Inicializar Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount)
});

export const db = getFirestore(app); 