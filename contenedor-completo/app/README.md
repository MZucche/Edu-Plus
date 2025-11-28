# EduPlus - Plataforma de Educación Online

Plataforma completa de educación online desarrollada con Next.js 15, React 19, TypeScript y Firebase.

## 🚀 Características

- **Catálogo de Cursos**: Búsqueda, filtros y paginación
- **Sistema de Usuarios**: Registro, login y perfiles personalizados
- **Panel de Administración**: Gestión de cursos y usuarios
- **Seguimiento de Progreso**: Módulos con videos y PDFs
- **Sistema de Favoritos**: Guardado de cursos preferidos
- **Comentarios y Calificaciones**: Sistema de reviews por curso
- **Diseño Responsivo**: Optimizado para todos los dispositivos

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, Firebase
- **Base de Datos**: Firestore
- **Autenticación**: Firebase Auth
- **Storage**: Firebase Storage

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd eduplus-platform
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env.local`:
   ```env
   FIREBASE_API_KEY=tu_api_key
   FIREBASE_AUTH_DOMAIN=tu_auth_domain
   FIREBASE_PROJECT_ID=tu_project_id
   FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   FIREBASE_APP_ID=tu_app_id
   FIREBASE_MEASUREMENT_ID=tu_measurement_id
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   NEXTAUTH_SECRET=tu_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   npm start
   ```

## 🌐 Despliegue en Vercel

1. **Conectar repositorio de GitHub**
2. **Configurar variables de entorno** en Vercel
3. **Desplegar automáticamente**

## 📁 Estructura del Proyecto

```
app/
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel de administración
│   ├── api/               # API Routes
│   ├── auth/              # Autenticación
│   ├── cursos/            # Páginas de cursos
│   ├── perfil/            # Perfil de usuario
│   └── page.tsx           # Página principal
├── components/             # Componentes reutilizables
│   └── ui/                # Componentes de shadcn/ui
├── lib/                    # Utilidades y configuración
├── public/                 # Archivos estáticos
└── styles/                 # Estilos globales
```

## 🔐 Autenticación

- **Firebase Auth**: Sistema principal de autenticación
- **Verificación de Email**: Requerida para acceder a cursos
- **Sistema de Roles**: Usuarios normales y administradores

## 📊 Base de Datos

- **Colección `cursos`**: Información de cursos
- **Colección `users`**: Perfiles de usuarios
- **Subcolecciones por usuario**: Progreso, favoritos, completados

## 🎨 Personalización

- **Tema**: Modo claro/oscuro
- **Componentes**: Sistema de diseño con shadcn/ui
- **Responsive**: Mobile-first design

## 📝 Scripts Disponibles

- `npm run dev`: Desarrollo local
- `npm run build`: Construcción para producción
- `npm run start`: Servidor de producción
- `npm run lint`: Linting del código

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas, contactar a través de issues del repositorio. 