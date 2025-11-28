"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/AuthContext';
import { updateProfile, updatePassword } from 'firebase/auth';
import Link from 'next/link';

export default function EditarPerfilPage() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    if (!nombre) {
      setError('El nombre es obligatorio');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      if (user) {
        await updateProfile(user, { displayName: nombre });
        if (password) {
          await updatePassword(user, password);
        }
        setMensaje('Datos actualizados correctamente');
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar los datos');
    }
  };

  return (
    <>
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-600">
            EduPlus
          </Link>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-2xl font-bold mb-6">Editar perfil</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg border">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              className="border rounded w-full p-2"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="pt-2 border-t">
            <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
            <input
              type="password"
              className="border rounded w-full p-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Dejar en blanco para no cambiar"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
            <input
              type="password"
              className="border rounded w-full p-2"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Dejar en blanco para no cambiar"
            />
          </div>
          <Button type="submit" className="w-full">Guardar cambios</Button>
          {mensaje && <div className="text-center text-emerald-600 mt-2">{mensaje}</div>}
          {error && <div className="text-center text-red-600 mt-2">{error}</div>}
        </form>
      </div>
    </>
  );
} 