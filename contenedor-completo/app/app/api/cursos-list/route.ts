import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const cursosDir = path.join(process.cwd(), 'public', 'cursos-data');
  try {
    const files = await fs.readdir(cursosDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    return NextResponse.json(jsonFiles);
  } catch (error) {
    return NextResponse.json({ error: 'No se pudieron leer los cursos.' }, { status: 500 });
  }
} 