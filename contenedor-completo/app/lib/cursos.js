"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cursosService = void 0;
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("./firebase");
exports.cursosService = {
    // Obtener todos los cursos
    async getAllCursos() {
        const cursosRef = (0, firestore_1.collection)(firebase_1.db, 'cursos');
        const snapshot = await (0, firestore_1.getDocs)(cursosRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },
    // Obtener un curso por ID
    async getCursoById(id) {
        const cursoRef = (0, firestore_1.doc)(firebase_1.db, 'cursos', id);
        const cursoDoc = await (0, firestore_1.getDoc)(cursoRef);
        if (cursoDoc.exists()) {
            return {
                id: cursoDoc.id,
                ...cursoDoc.data()
            };
        }
        return null;
    },
    // Crear un nuevo curso
    async createCurso(curso) {
        const cursosRef = (0, firestore_1.collection)(firebase_1.db, 'cursos');
        const docRef = await (0, firestore_1.addDoc)(cursosRef, {
            ...curso,
            fechaCreacion: new Date()
        });
        return docRef.id;
    },
    // Actualizar un curso
    async updateCurso(id, curso) {
        const cursoRef = (0, firestore_1.doc)(firebase_1.db, 'cursos', id);
        await (0, firestore_1.updateDoc)(cursoRef, curso);
    },
    // Eliminar un curso
    async deleteCurso(id) {
        const cursoRef = (0, firestore_1.doc)(firebase_1.db, 'cursos', id);
        await (0, firestore_1.deleteDoc)(cursoRef);
    },
    // Buscar cursos por categoría
    async getCursosByCategoria(categoria) {
        const cursosRef = (0, firestore_1.collection)(firebase_1.db, 'cursos');
        const q = (0, firestore_1.query)(cursosRef, (0, firestore_1.where)('categoria', '==', categoria));
        const snapshot = await (0, firestore_1.getDocs)(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
};
