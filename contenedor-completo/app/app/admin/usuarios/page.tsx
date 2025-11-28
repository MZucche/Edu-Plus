"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Shield } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default function UsuariosAdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!user || !isAdmin) {
      router.replace('/');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const res = await fetch('/api/admin/usuarios');
        const data = await res.json();
        if (data.ok) {
          setUsuarios(data.usuarios);
        } else {
          setUsuarios([]);
        }
      } catch (error) {
        setUsuarios([]);
        console.error("Error cargando usuarios:", error);
      }
    }
    fetchUsuarios();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (!user || !isAdmin) return <div>No autorizado</div>;

  const handleEliminarUsuario = async (id: string) => {
    try {
      const res = await fetch('/api/admin/usuarios/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.ok) {
        setUsuarios(usuarios.filter((u) => u.id !== id));
      } else {
        console.error("Error eliminando usuario:", data.error);
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  const handleEstablecerAdmin = async () => {
    setMessage('');
    try {
      const res = await fetch('/api/admin/setUserAsAdmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('Usuario actualizado como administrador');
      } else {
        setMessage('No se pudo actualizar el usuario');
      }
    } catch (error) {
      setMessage('Error al actualizar el usuario');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      
      {/* Formulario para establecer administrador */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Establecer usuario como administrador</h2>
        <form onSubmit={handleEstablecerAdmin} className="space-y-4">
          <div>
            <label className="block mb-2">Email del usuario:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <Button onClick={handleEstablecerAdmin} className="mt-2">
            <Shield className="mr-2 h-4 w-4" /> Establecer como Administrador
          </Button>
        </form>
        {message && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            {message}
          </div>
        )}
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.name || usuario.email}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.role}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="destructive" onClick={() => handleEliminarUsuario(usuario.id)}>
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 