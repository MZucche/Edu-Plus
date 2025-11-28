"use client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from '@/lib/AuthContext';
import { getCursosUsuario } from '@/lib/cursosUsuario';

export default function GuardadosPage() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getCursosUsuario(user.uid, 'favoritos')
      .then(setFavoritos)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cursos guardados</h1>
      {loading ? (
        <div className="text-gray-500 text-center py-12 text-lg">Cargando...</div>
      ) : favoritos.length === 0 ? (
        <div className="text-gray-500 text-center py-12 text-lg">No tienes cursos guardados.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritos.map((curso) => (
            <Card key={curso.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <img src={curso.imagen} alt={curso.nombre || curso.titulo} className="w-full h-48 object-cover" />
              <CardContent className="p-6">
                <div className="text-sm text-emerald-600 mb-2">{curso.categoria}</div>
                <h3 className="text-lg font-semibold mb-2">{curso.nombre || curso.titulo}</h3>
                <p className="text-gray-600 text-sm mb-4">{curso.descripcion}</p>
                <Button asChild>
                  <Link href={`/cursos/${curso.id}`}>Ver curso</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 