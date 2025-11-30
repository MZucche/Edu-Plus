[README.md](https://github.com/user-attachments/files/23840136/README.md)
# EduPlus - Plataforma de Educación Online

**EduPlus** es una plataforma completa de educación online desarrollada
con **Next.js 15**, **React 19**, **TypeScript** y **Firebase**, pensada
para gestionar cursos, usuarios y contenido educativo de forma escalable
y moderna.

## ✨ Características principales

-   📚 **Catálogo de cursos** con búsqueda, filtros y paginación
-   👤 **Sistema de usuarios** con registro, login y perfiles
    personalizados
-   🛠️ **Panel de administración** para gestionar cursos y usuarios
-   ✅ **Seguimiento de progreso**: módulos con videos, PDFs y estado de
    avance
-   ⭐ **Sistema de favoritos**: cada usuario puede guardar cursos
    preferidos
-   💬 **Comentarios y calificaciones** por curso
-   📱 **Diseño responsivo**, optimizado para escritorio, tablet y móvil

## 🧰 Tecnologías

-   **Frontend:** Next.js 15, React 19, TypeScript\
-   **Estilos:** Tailwind CSS, shadcn/ui, Radix UI\
-   **Backend:** Next.js API Routes, Firebase\
-   **Base de datos:** Firebase Firestore\
-   **Autenticación:** Firebase Auth\
-   **Storage:** Firebase Storage

## 🚀 Instalación

1.  **Clonar el repositorio**

``` bash
git clone <URL_DEL_REPO>
cd eduplus-platform
```

2.  **Instalar dependencias**

``` bash
npm install
```

3.  **Configurar variables de entorno**

Crear un archivo `.env.local` en la raíz del proyecto con la
configuración de Firebase y NextAuth.

⚠️ **Importante:** el archivo `.env.local` **no debe subirse** a GitHub.

4.  **Ejecutar en desarrollo**

``` bash
npm run dev
```

5.  **Build para producción**

``` bash
npm run build
npm start
```

## ☁️ Despliegue en Vercel

-   Deployment automático desde GitHub\
-   Variables de entorno configuradas en el panel\
-   CDN global + SSL automático

## 📂 Estructura del proyecto

``` text
app/
  admin/
  api/
  auth/
  cursos/
  perfil/
  page.tsx

components/
  ui/

lib/
public/
styles/
```

## 🔐 Seguridad

-   Variables de entorno para credenciales\
-   Firebase Admin solo en servidor\
-   NextAuth con secretos seguros\
-   Revisión de claves antes de cada commit

## 🗄️ Base de datos

-   `cursos`
-   `users`
-   Subcolecciones: progreso, favoritos, cursos completados

## 🧪 Scripts

``` bash
npm run dev
npm run build
npm run start
npm run lint
```

## 📜 Licencia

Proyecto bajo licencia **MIT**.

## 🆘 Soporte

Abrir issues en el repositorio para consultas o reportes.
