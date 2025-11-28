import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAaBH5fLGpeTxZ3tujt59_OXIWE8HQHDNU",
  authDomain: "eduplus-2cadd.firebaseapp.com",
  projectId: "eduplus-2cadd",
  storageBucket: "eduplus-2cadd.appspot.com",
  messagingSenderId: "1015363195331",
  appId: "1:1015363195331:web:c9acfeba101a4d7457ad76",
  measurementId: "G-PTJBEJDYVM"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

declare const window: any;

let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics, storage };

/**
 * Verifica si el usuario es admin buscando el campo 'role' en la colección 'users'
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.role === "admin";
    }
    return false;
  } catch (e) {
    return false;
  }
}

const handleToggleFavorite = (curso: Curso) => {
  console.log('Curso al guardar favorito:', curso);
  if (isFavorito(curso.id!)) {
    removeFavorito(curso.id!);
  } else {
    addFavorito(curso);
  }
}; 