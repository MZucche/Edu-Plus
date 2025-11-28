"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ConfiguracionAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [nombre, setNombre] = useState("EduPlus");
  const [inscripciones, setInscripciones] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.replace("/");
    }
  }, [status, session, router]);

  if (status === "loading") return <div>Cargando...</div>;
  if (status === "unauthenticated") return <div>No autorizado</div>;

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Configuración de la Plataforma</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          alert("Configuración guardada (solo en memoria)");
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de la plataforma</label>
          <input
            className="border rounded w-full p-2"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={inscripciones}
            onChange={e => setInscripciones(e.target.checked)}
            className="h-4 w-4"
            id="inscripciones"
          />
          <label htmlFor="inscripciones" className="text-sm">Permitir nuevas inscripciones</label>
        </div>
        <Button type="submit">Guardar cambios</Button>
      </form>
    </div>
  );
} 