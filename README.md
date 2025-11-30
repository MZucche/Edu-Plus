# EduPlus - Online Education Platform

**EduPlus** is a complete online education platform built with **Next.js 15**, **React 19**, **TypeScript**, and **Firebase**, designed to manage courses, users, and educational content in a scalable and modern way.

## ✨ Main Features

- 📚 **Course catalog** with search, filters, and pagination
- 👤 **User system** with registration, login, and personalized profiles
- 🛠️ **Admin dashboard** for managing courses and users
- ✅ **Progress tracking:** modules with videos, PDFs, and completion status
- ⭐ **Favorites system:** users can save preferred courses
- 💬 **Comments and course ratings**
- 📱 **Responsive design**, optimized for desktop, tablet, and mobile

## 🧰 Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Backend:** Next.js API Routes, Firebase
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage

## 🚀 Installation

1. **Clone the repository**
```bash
git clone <REPO_URL>
cd eduplus-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root of the project containing your Firebase and NextAuth configuration.

⚠️ **Important:** `.env.local` **must not** be pushed to GitHub.

4. **Run the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
npm start
```

## ☁️ Deployment on Vercel

- Automatic deployment from GitHub
- Environment variables configured in the project dashboard
- Global CDN + automatic SSL

## 📂 Project Structure

```text
app/
  admin/
  api/
  auth/
  courses/
  profile/
  page.tsx

components/
  ui/

lib/
public/
styles/
```

## 🔐 Security

- Environment variables for all sensitive credentials
- Firebase Admin available only on the server
- Secure NextAuth configuration
- Key and secret verification before commits

## 🗄️ Database

- `courses`
- `users`
- Subcollections: progress, favorites, completed courses

## 🧪 Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## 📜 License

This project is licensed under the **MIT** license.

## 🆘 Support

Open issues in the repository for questions or bug reports.
