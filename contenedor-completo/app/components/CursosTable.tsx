import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Material {
  nombre: string;
  url: string;
}

interface Curso {
  id: string;
  nombre: string;
  categoria?: string;
  descripcion?: string;
  nivel?: string;
  duracion?: string;
  materiales?: Material[];
  imagen?: string;
  instructor?: string;
  status?: string;
  students?: number;
  videoUrl?: string;
  pdfUrl?: string;
}

interface Column {
  key: string;
  label: string;
}

interface CursosTableProps {
  cursos: Curso[];
  columns: Column[];
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string, completed: boolean) => void;
  completados?: { [id: string]: boolean };
}

export default function CursosTable({ cursos, columns, onDelete, onToggleComplete, completados }: CursosTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key}>{col.label}</TableHead>
          ))}
          {onToggleComplete && <TableHead>Completado</TableHead>}
          {onDelete && <TableHead className="text-right">Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {cursos.map((curso) => (
          <TableRow key={curso.id}>
            {columns.map((col) => {
              switch (col.key) {
                case "materiales":
                  return (
                    <TableCell key={col.key}>
                      {curso.materiales && curso.materiales.length > 0 ? (
                        <ul className="list-disc ml-4">
                          {curso.materiales.map((mat, idx) => (
                            <li key={idx}>
                              <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">{mat.nombre}</a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  );
                case "imagen":
                  return (
                    <TableCell key={col.key}>
                      {curso.imagen ? (
                        <img src={curso.imagen} alt={curso.nombre} className="w-16 h-12 object-cover rounded" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  );
                case "status":
                  return (
                    <TableCell key={col.key}>
                      {curso.status === "Publicado" && (
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">Publicado</span>
                      )}
                      {curso.status === "Pendiente" && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pendiente</span>
                      )}
                      {curso.status === "Borrador" && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">Borrador</span>
                      )}
                      {!curso.status && <span className="text-gray-400">-</span>}
                    </TableCell>
                  );
                default:
                  return <TableCell key={col.key}>{(curso as any)[col.key] ?? <span className="text-gray-400">-</span>}</TableCell>;
              }
            })}
            {onToggleComplete && (
              <TableCell>
                <input
                  type="checkbox"
                  checked={!!(completados && completados[curso.id])}
                  onChange={e => onToggleComplete && onToggleComplete(curso.id, e.target.checked)}
                />
              </TableCell>
            )}
            {onDelete && (
              <TableCell className="text-right">
                <Button size="sm" variant="destructive" onClick={() => onDelete(curso.id)}>
                  Eliminar
                </Button>
                <Button asChild variant="outline" size="sm" className="ml-2">
                  <Link href={`/admin/cursos/editar/${curso.id}`}>Editar</Link>
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 